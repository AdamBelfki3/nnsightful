"""Benchmark runner: run whole benchmarks (or individual tests) and record them.

A benchmark run measures every test of its JSON definition, one model at
a time, and writes one result to ``run.json`` with a single env stamp
(see ``store.py``).
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable

from .config import ToolBenchmarkConfig, ToolRegistry, UnsupportedTest
from .definitions import BenchmarkDefinition
from .env import Env
from .meters import LocalLatency, Meter, PeakMemory, RemoteLatency
from .store import Result, ResultsStore
from .sweeps import GridSweep, ThresholdSearch

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class BenchmarkRunner:
    """Measure a benchmark's tests for one model at a time.

    Local calls run under NDIF's autocast in ``dtype`` when CUDA is
    available (``autocast=False`` turns that off). Every test is
    isolated: a failing or unsupported test becomes a ``failed`` /
    ``unsupported`` outcome instead of aborting the run.
    """

    def __init__(
        self,
        n_repeat: int = 3,
        n_warmup: int = 1,
        remote: bool = False,
        dtype: str = "bfloat16",
        autocast: bool = True,
        thresholds: tuple[float, ...] | None = None,
        min_length: int = 2,
        max_length: int = 4096,
    ):
        self.n_repeat = n_repeat
        self.n_warmup = n_warmup
        self.remote = remote
        self.dtype = dtype
        self.autocast = autocast
        self.thresholds = tuple(thresholds or ThresholdSearch.DEFAULT_THRESHOLDS)
        self.min_length = min_length
        self.max_length = max_length
        self._env_cache: dict[str, Any] | None = None

    @property
    def _autocast_dtype(self) -> str | None:
        import torch

        return self.dtype if self.autocast and torch.cuda.is_available() else None

    def env(self) -> dict[str, Any]:
        """The env stamp of this runner's kind (captured once per runner)."""
        if self._env_cache is None:
            remote_server = None
            if self.remote:
                import nnsight

                nnsight.CONFIG.API.HOST = Env.PRODUCTION_HOST
                remote_server = Env.remote_server_info(Env.PRODUCTION_HOST)
            kind = "remote" if self.remote else "local"
            self._env_cache = Env.capture(
                kind, self.dtype, self._autocast_dtype is not None, remote_server
            )
        return self._env_cache

    def _latency_meter(self, model: "StandardizedTransformer") -> Meter:
        return RemoteLatency(model) if self.remote else LocalLatency()

    def _call(
        self,
        tool: Any,
        model: "StandardizedTransformer",
        args: dict[str, Any],
        meter: Meter,
    ) -> None:
        """One tool call inside *meter* (and NDIF's autocast, for local calls)."""
        dtype = None if self.remote else self._autocast_dtype
        with Meter.ndif_autocast(dtype), meter as extra:
            tool(model, **args, **extra)

    def _repeat(
        self,
        tool: Any,
        model: "StandardizedTransformer",
        args: dict[str, Any],
        meter: Meter,
        times: int,
        label: str = "",
    ) -> Meter:
        """*times* calls into *meter*; stops at the first out-of-memory call.

        A progress bar is shown only for labelled (timed) repeats.
        """
        from tqdm import tqdm

        calls = tqdm(range(times), desc=label, leave=False) if label else range(times)
        for _ in calls:
            self._call(tool, model, args, meter)
            if meter.oom:
                break
        return meter

    def run_model(
        self,
        dimension: str,
        model_name: str,
        model: "StandardizedTransformer",
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Outcomes (ok / failed / unsupported) of every test of *configs* on one model.

        Latency tests are the :class:`GridSweep` points of each config;
        a peak-memory test is one :class:`ThresholdSearch` per config.
        A failing test becomes a failed / unsupported outcome.
        """
        outcomes: list[dict[str, Any]] = []
        kind = "remote" if self.remote else "local"
        for config in configs:
            if dimension == "peak_mem":
                label = f"{config.tool_name} | {model_name} | peak_mem"
                test = {
                    "tool": config.tool_name,
                    "model": model_name,
                    "params": dict(config.fixed_args),
                }
                try:
                    stats = self._threshold_test(config, model, label)
                    outcomes.append({**test, "status": Result.OK, "stats": stats})
                except Exception as exc:
                    outcomes.append(self._failed_outcome(test, exc, label))
            else:
                label = f"{config.tool_name} | {model_name} | {kind}"
                outcomes += self._grid_tests(config, model_name, model, label)
        return outcomes

    def _grid_tests(
        self,
        config: ToolBenchmarkConfig,
        model_name: str,
        model: "StandardizedTransformer",
        label: str,
    ) -> list[dict[str, Any]]:
        """Latency of each grid point: warm up on the last point, then time each."""
        built = []
        for point in GridSweep(config.sweep_params).points():
            try:
                built.append((point, self._build(config, model, point), None))
            except Exception as exc:
                built.append((point, None, exc))

        warm = next((args for _, args, err in reversed(built) if err is None), None)
        if self.n_warmup > 0 and warm is not None:
            print(f"  warming up: {label} (n_warmup={self.n_warmup})")
            try:
                meter = self._repeat(
                    config.tool, model, warm, self._latency_meter(model), self.n_warmup
                )
                if meter.oom:
                    raise meter.oom_error
            except Exception as exc:
                print(
                    f"  warning: warmup failed ({type(exc).__name__}: {exc}); "
                    "measuring each test anyway"
                )

        outcomes = []
        for point, args, err in built:
            test = {"tool": config.tool_name, "model": model_name, "params": point}
            test_label = f"{label} | " + ", ".join(f"{k}={v}" for k, v in point.items())
            if err is None:
                print(f"  benchmarking: {test_label}")
                try:
                    meter = self._repeat(
                        config.tool,
                        model,
                        args,
                        self._latency_meter(model),
                        self.n_repeat,
                        test_label,
                    )
                    if meter.oom:
                        raise meter.oom_error
                    outcomes.append(
                        {**test, "status": Result.OK, "stats": meter.stats()}
                    )
                    continue
                except Exception as exc:
                    err = exc
            outcomes.append(self._failed_outcome(test, err, test_label))
        return outcomes

    def _threshold_test(
        self,
        config: ToolBenchmarkConfig,
        model: "StandardizedTransformer",
        label: str,
    ) -> dict[str, Any]:
        """Peak-memory stats of one config: the threshold search over its sweep axis.

        Each probed point gets warmup calls, one :class:`PeakMemory` call,
        then separate :class:`LocalLatency` repeats — never timed and
        measured in the same call.
        """
        axis = config.sweep_axis
        footprint = self.model_footprint(model)
        ctx = self.context_length(model)
        cap = self.max_length if ctx is None else min(self.max_length, ctx - 1)
        search = ThresholdSearch(footprint, self.thresholds, cap, self.min_length)
        print(f"  sweeping: {label} (cap {axis}={cap})")
        points: dict[int, dict[str, Any]] = {}

        def measure(n: int) -> int | None:
            point = self._peak_point(config, model, n, footprint)
            points[n] = point
            shown = "OOM" if point.get("oom") else f"{point['pct']:.1f}%"
            print(f"    {axis}={n}: {shown}")
            return point["peak_bytes"]

        self._build(config, model, {axis: self.min_length})
        found = search.run(measure)
        return {
            "footprint_bytes": footprint,
            "context_cap": cap,
            "max_prompt_length": found.max_lengths,
            "capped": found.capped,
            "points": [points[n] for n in sorted(points)],
        }

    def _peak_point(
        self,
        config: ToolBenchmarkConfig,
        model: "StandardizedTransformer",
        n: int,
        footprint: int,
    ) -> dict[str, Any]:
        """Warmup, one peak measurement, then timed repeats at ``axis = n``."""
        axis = config.sweep_axis
        args = self._build(config, model, {axis: n})
        point: dict[str, Any] = {axis: n, "peak_bytes": None, "pct": None}

        if self._repeat(config.tool, model, args, LocalLatency(), self.n_warmup).oom:
            point["oom"] = True
            return point
        peak = self._repeat(config.tool, model, args, PeakMemory(), 1)
        if peak.oom:
            point["oom"] = True
            return point
        point["peak_bytes"] = peak.peak
        point["pct"] = self.peak_pct(peak.peak, footprint)
        timed = self._repeat(
            config.tool,
            model,
            args,
            LocalLatency(),
            self.n_repeat,
            f"{config.tool_name} | {axis}={n}",
        )
        if timed.oom:
            raise timed.oom_error
        point["latency"] = timed.stats()
        return point

    @classmethod
    def for_definition(
        cls, defn: dict[str, Any], **overrides: Any
    ) -> "BenchmarkRunner":
        """A runner set up from a benchmark definition's kind and ``meta_params``."""
        meta = {
            **defn["meta_params"],
            **{k: v for k, v in overrides.items() if v is not None},
        }
        return cls(
            n_repeat=meta.get("n_repeat", 3),
            n_warmup=meta.get("n_warmup", 1),
            remote=defn["kind"] == "remote",
            dtype=meta.get("dtype", "bfloat16"),
            autocast=meta.get("autocast", True),
            thresholds=meta.get("thresholds"),
            min_length=meta.get("min_length", 2),
            max_length=meta.get("max_length", 4096),
        )

    def run_tests(
        self,
        defn: dict[str, Any],
        model_name: str,
        load_model: Callable[[str], "StandardizedTransformer"],
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Outcomes of *configs* on one model (all failed if it can't be loaded)."""
        try:
            model = load_model(model_name)
        except Exception as exc:
            print(f"  FAILED to load {model_name}: {type(exc).__name__}: {exc}")
            tests = BenchmarkDefinition({**defn, "models": [model_name]}).tests()
            names = {c.tool_name for c in configs}
            return [
                {
                    **{k: t[k] for k in ("tool", "model", "params")},
                    "status": Result.FAILED,
                    "stats": None,
                    "error": f"model load: {type(exc).__name__}: {exc}"[:500],
                }
                for t in tests
                if t["tool"] in names
            ]
        try:
            return self.run_model(defn["dimension"], model_name, model, configs)
        finally:
            del model
            Meter.free_cuda()

    @staticmethod
    def _build(
        config: ToolBenchmarkConfig,
        model: "StandardizedTransformer",
        sweep: dict[str, Any],
    ) -> dict[str, Any]:
        if config.build_args is not None:
            return config.build_args(model, config.fixed_args, sweep)
        return {**config.fixed_args, **sweep}

    @staticmethod
    def _failed_outcome(
        test: dict[str, Any], exc: BaseException, label: str
    ) -> dict[str, Any]:
        """A ``failed`` (or ``unsupported``) outcome for *test*, recording *exc*."""
        unsupported = isinstance(exc, UnsupportedTest)
        status = Result.UNSUPPORTED if unsupported else Result.FAILED
        message = f"{type(exc).__name__}: {exc}"
        if Meter.is_oom(exc):
            message = f"out of memory: {message}"
        print(f"  {status.upper()}: {label}: {message}")
        return {**test, "status": status, "stats": None, "error": message[:500]}

    @staticmethod
    def peak_pct(peak_bytes: int, footprint_bytes: int) -> float:
        """Peak as a percentage of the model footprint, to 3 decimals."""
        return round(peak_bytes / footprint_bytes * 100, 3)

    @staticmethod
    def model_footprint(model: "StandardizedTransformer") -> int:
        """Bytes of the model's parameters and buffers, in their loaded dtype."""
        return sum(
            t.numel() * t.element_size()
            for t in (*model.parameters(), *model.buffers())
        )

    @staticmethod
    def context_length(model: "StandardizedTransformer") -> int | None:
        """The model's maximum position count, if its config declares one."""
        config = model.config
        config = getattr(config, "text_config", None) or config
        return getattr(config, "max_position_embeddings", None)


def run_benchmark(
    defn: dict[str, Any],
    load_model: Callable[[str], "StandardizedTransformer"],
    path: Path | None = None,
) -> dict[str, Any]:
    """Run a whole benchmark and write its finished result to ``run.json``.

    Progress goes to the in-progress file next to ``run.json`` after each
    model (status ``in_progress``, with the models done); the benchmark's
    entry in ``run.json`` is only replaced once it finishes, complete or
    not. An interrupted run leaves ``run.json`` untouched.
    """
    defn = BenchmarkDefinition.of(defn)
    store = ResultsStore(run=path)
    runner = BenchmarkRunner.for_definition(defn)
    configs = ToolRegistry.configs(defn)
    env = runner.env()
    for warning in defn.version_warnings(store.recorded_stamps(defn["name"])):
        print(f"warning: {warning}")
    print(
        f"\nRunning {defn['name']} v{defn['version']} "
        f"({len(defn['models'])} model(s) × {len(configs)} tool(s))..."
    )
    outcomes: list[dict[str, Any]] = []
    models = list(defn["models"])
    for i, model_name in enumerate(models):
        outcomes += runner.run_tests(defn, model_name, load_model, configs)
        partial = Result.make(defn, env, defn["meta_params"], outcomes)
        store.save_partial(
            defn["name"],
            Result.in_progress(partial, models[: i + 1], models[i + 1 :]),
        )
    result = Result.make(defn, env, defn["meta_params"], outcomes)
    store.write_result(defn["name"], result)
    store.clear_partial(defn["name"])
    print(
        f"\n  {defn['name']}: {result['status']} ({len(result['results'])} result(s), "
        f"{len(result['failed'])} failed, "
        f"{len(result['optional_failed'])} optional failed) -> {store.run_path}"
    )
    return result


def run_individual(
    defn: dict[str, Any],
    load_model: Callable[[str], "StandardizedTransformer"],
    models: list[str] | None = None,
    tools: list[str] | None = None,
    params: dict[str, list[Any]] | None = None,
    **overrides: Any,
) -> dict[str, Any] | None:
    """Run selected tests of a benchmark; returns a result that is not written anywhere.

    *models* / *tools* are substring filters; *params* overrides sweep values.
    """
    selected = [
        m for m in defn["models"] if not models or any(sub in m for sub in models)
    ]
    if models:
        selected += [m for m in models if "/" in m and m not in selected]
    defn = BenchmarkDefinition.of(defn)
    configs = ToolRegistry.configs(defn, tools, params)
    if not selected or not configs:
        return None
    runner = BenchmarkRunner.for_definition(defn, **overrides)
    meta = {
        **defn["meta_params"],
        **{k: v for k, v in overrides.items() if v is not None},
    }
    outcomes: list[dict[str, Any]] = []
    for model_name in selected:
        outcomes += runner.run_tests(defn, model_name, load_model, configs)
    return Result.make(
        None,
        runner.env(),
        meta,
        outcomes,
        benchmark={**defn.stamp(), "individual": True},
    )
