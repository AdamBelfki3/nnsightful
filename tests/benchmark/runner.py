"""Benchmark runner: run whole benchmarks (or individual tests) and record them.

A benchmark run measures every test of its JSON definition, one model at
a time, and writes one result to ``run.json`` with a single env stamp
(see ``store.py``).
"""

from __future__ import annotations

import gc
import hashlib
import importlib
import platform
import statistics
import subprocess
import time
from contextlib import nullcontext
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable

from .config import ToolBenchmarkConfig, UnsupportedTest, sweep_combos, tool_configs
from .definitions import expand_tests, stamp, version_warnings
from .memory import search_max_lengths
from .store import (
    BENCH_DIR,
    FAILED,
    OK,
    UNSUPPORTED,
    clear_partial,
    kind_env,
    load_run,
    make_result,
    mark_in_progress,
    run_path,
    save_json,
    save_partial,
)

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

DEFAULT_THRESHOLDS = (0.10, 0.25, 0.50)

PRODUCTION_HOST = "https://api.ndif.us"
_SERVER_PACKAGES = ("ndif", "nnsight", "nnterp", "torch", "transformers")
_CLIENT_PACKAGES = ("nnsight", "nnterp", "transformers", "torch")
_OUTPUT_FILES = ("baseline.json", "results.md", "benchmark_diff.md")


def _git(*args: str, cwd: Path = BENCH_DIR) -> str | None:
    try:
        return subprocess.check_output(
            ["git", *args], cwd=cwd, stderr=subprocess.DEVNULL
        ).decode()
    except Exception:
        return None


def _timestamp() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def git_state() -> dict[str, Any]:
    """``git_hash``, ``dirty`` and, when dirty, a ``dirty_fingerprint`` of the changes.

    Benchmark outputs (baseline, reports) don't count as
    changes; ``run.json`` is gitignored. The fingerprint hashes the diff
    against HEAD plus untracked files, so two dirty runs of identical code
    share it.
    """
    head = _git("rev-parse", "HEAD")
    if head is None:
        return {"git_hash": "unknown", "dirty": True}
    top = Path(_git("rev-parse", "--show-toplevel").strip())
    excluded = [str((BENCH_DIR / f).relative_to(top)) for f in _OUTPUT_FILES]
    pathspec = [".", *(f":(exclude){f}" for f in excluded)]
    status = (
        _git("status", "--porcelain", "--untracked-files=all", "--", *pathspec, cwd=top)
        or ""
    )
    state: dict[str, Any] = {"git_hash": head.strip(), "dirty": bool(status.strip())}
    if state["dirty"]:
        digest = hashlib.sha256(
            (_git("diff", "HEAD", "--", *pathspec, cwd=top) or "").encode()
        )
        untracked = (
            _git("ls-files", "--others", "--exclude-standard", "--", *pathspec, cwd=top)
            or ""
        )
        for name in sorted(untracked.splitlines()):
            digest.update(name.encode())
            digest.update((top / name).read_bytes())
        state["dirty_fingerprint"] = digest.hexdigest()[:16]
    return state


def _package_info() -> dict[str, str]:
    """Versions of the key packages, plus the git commit of editable checkouts."""
    info = {}
    for name in _CLIENT_PACKAGES:
        module = importlib.import_module(name)
        info[name] = module.__version__
        src = Path(module.__file__)
        if _git("ls-files", "--error-unmatch", src.name, cwd=src.parent) is not None:
            info[f"{name}_commit"] = _git("rev-parse", "HEAD", cwd=src.parent).strip()
    return info


def capture_env(
    kind: str, dtype: str, autocast: bool, remote_server: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Everything that makes *kind*'s results comparable (README: ``env`` fields)."""
    import torch

    env = {
        **git_state(),
        "timestamp": _timestamp(),
        "python": platform.python_version(),
    }
    env.update(_package_info())
    if torch.cuda.is_available():
        env["gpu"] = torch.cuda.get_device_name(0)
    env["dtype"] = dtype
    env["autocast"] = autocast
    if remote_server is not None:
        env["remote_server"] = remote_server
    return {"kind": kind, **kind_env(env, kind)}


def remote_server_info(host: str) -> dict[str, Any]:
    """Host plus the server's python / package versions from ``/env`` (best effort)."""
    import httpx

    info: dict[str, Any] = {"host": host}
    try:
        env = httpx.get(f"{host}/env", timeout=10).json()
    except Exception as exc:
        info["error"] = f"{type(exc).__name__}: {exc}"
        return info
    info["python"] = str(env.get("python_version", "")).split(" ")[0]
    packages = env.get("packages", {})
    info["packages"] = {k: packages[k] for k in _SERVER_PACKAGES if k in packages}
    return info


def _sync() -> None:
    """Block until GPU work is done, so wall-clock timing is accurate."""
    import torch

    if torch.cuda.is_available():
        torch.cuda.synchronize()


def _autocast(dtype_name: str | None):
    """NDIF's execution context: ``torch.autocast`` in the model dtype, no cache.

    ``None`` (or no CUDA) disables it.
    """
    import torch

    if dtype_name is None or not torch.cuda.is_available():
        return nullcontext()
    return torch.autocast("cuda", dtype=getattr(torch, dtype_name), cache_enabled=False)


def free_cuda() -> None:
    """Collect garbage and return cached CUDA blocks."""
    import torch

    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def _warmup_tool(
    tool: Any,
    model: "StandardizedTransformer",
    call_args: dict[str, Any],
    n_warmup: int,
    remote: bool = False,
    autocast: str | None = None,
) -> None:
    """Untimed warmup calls for a specific (tool, model) pair."""
    for _ in range(n_warmup):
        if remote:
            from .backend import RemoteBackendCounter

            backend = RemoteBackendCounter(model.to_model_key())
            tool(model, remote=True, backend=backend, **call_args)
        else:
            with _autocast(autocast):
                tool(model, **call_args)
            _sync()


def _stats_from_samples(samples: list[float]) -> dict[str, Any]:
    """Build a latency stats dict from raw samples."""
    mean = statistics.fmean(samples)
    std = statistics.stdev(samples) if len(samples) > 1 else 0.0
    return {
        "mean": round(mean, 6),
        "std": round(std, 6),
        "min": round(min(samples), 6),
        "max": round(max(samples), 6),
        "samples": [round(s, 6) for s in samples],
    }


def _measure_local(
    tool: Any,
    model: "StandardizedTransformer",
    call_args: dict[str, Any],
    n_repeat: int,
    label: str = "",
    autocast: str | None = None,
) -> dict[str, Any]:
    """Wall-clock latency stats for a local tool call."""
    from tqdm import tqdm

    kwargs = dict(call_args)
    samples: list[float] = []
    for _ in tqdm(range(n_repeat), desc=label, leave=False):
        _sync()
        t0 = time.perf_counter()
        with _autocast(autocast):
            tool(model, **kwargs)
        _sync()
        t1 = time.perf_counter()
        samples.append(t1 - t0)

    return _stats_from_samples(samples)


def _measure_remote(
    tool: Any,
    model: "StandardizedTransformer",
    call_args: dict[str, Any],
    n_repeat: int,
    label: str = "",
) -> dict[str, Any]:
    """Latency stats for a remote tool call using the backend counter.

    Creates a fresh ``RemoteBackendCounter`` per call to capture
    per-phase timing. The top-level stats are ``total_unqueued`` — the
    cost excluding queue wait — and ``breakdown`` holds all four phases.
    """
    from tqdm import tqdm

    from .backend import RemoteBackendCounter

    phases: dict[str, list[float]] = {
        "total": [],
        "total_unqueued": [],
        "running": [],
        "download": [],
    }

    kwargs = dict(call_args)
    for _ in tqdm(range(n_repeat), desc=label, leave=False):
        counter = RemoteBackendCounter(model.to_model_key())
        tool(model, remote=True, backend=counter, **kwargs)
        breakdown = counter.get_latency()
        for phase, value in breakdown.items():
            phases[phase].append(value)

    return {
        **_stats_from_samples(phases["total_unqueued"]),
        "breakdown": {
            phase: _stats_from_samples(samples) for phase, samples in phases.items()
        },
    }


def _is_oom(exc: BaseException) -> bool:
    """True for a CUDA out-of-memory error, including ones nnsight re-wraps."""
    import torch

    while exc is not None:
        if (
            isinstance(exc, torch.OutOfMemoryError)
            or "out of memory" in str(exc).lower()
        ):
            return True
        exc = exc.__cause__ or exc.__context__
    return False


def measure_peak(fn: Callable[[], Any]) -> int | None:
    """Peak CUDA bytes allocated by ``fn()`` beyond what was allocated before it.

    Returns ``None`` when ``fn`` runs out of memory.
    """
    import torch

    free_cuda()
    _sync()
    base = torch.cuda.memory_allocated()
    torch.cuda.reset_peak_memory_stats()
    try:
        fn()
        _sync()
    except Exception as exc:
        if not _is_oom(exc):
            raise
        free_cuda()
        return None
    return torch.cuda.max_memory_allocated() - base


def peak_pct(peak_bytes: int, footprint_bytes: int) -> float:
    """Peak as a percentage of the model footprint, to 3 decimals."""
    return round(peak_bytes / footprint_bytes * 100, 3)


def model_footprint(model: "StandardizedTransformer") -> int:
    """Bytes of the model's parameters and buffers, in their loaded dtype."""
    return sum(
        t.numel() * t.element_size() for t in (*model.parameters(), *model.buffers())
    )


def context_length(model: "StandardizedTransformer") -> int | None:
    """The model's maximum position count, if its config declares one."""
    config = model.config
    config = getattr(config, "text_config", None) or config
    return getattr(config, "max_position_embeddings", None)


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
        thresholds: tuple[float, ...] = DEFAULT_THRESHOLDS,
        min_length: int = 2,
        max_length: int = 4096,
    ):
        self.n_repeat = n_repeat
        self.n_warmup = n_warmup
        self.remote = remote
        self.dtype = dtype
        self.autocast = autocast
        self.thresholds = tuple(thresholds)
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

                nnsight.CONFIG.API.HOST = PRODUCTION_HOST
                remote_server = remote_server_info(PRODUCTION_HOST)
            kind = "remote" if self.remote else "local"
            self._env_cache = capture_env(
                kind, self.dtype, self._autocast_dtype is not None, remote_server
            )
        return self._env_cache

    def run(
        self,
        model_name: str,
        model: "StandardizedTransformer",
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Latency outcomes (ok / failed / unsupported) per config × combo."""
        kind = "remote" if self.remote else "local"
        outcomes: list[dict[str, Any]] = []
        for config in configs:
            label = f"{config.tool_name} | {model_name} | {kind}"
            built = []
            for sweep in sweep_combos(config):
                try:
                    built.append((sweep, _build(config, model, sweep), None))
                except Exception as exc:
                    built.append((sweep, None, exc))

            warm = next((args for _, args, err in reversed(built) if err is None), None)
            if self.n_warmup > 0 and warm is not None:
                print(f"  warming up: {label} (n_warmup={self.n_warmup})")
                try:
                    _warmup_tool(
                        config.tool,
                        model,
                        warm,
                        self.n_warmup,
                        remote=self.remote,
                        autocast=self._autocast_dtype,
                    )
                except Exception as exc:
                    print(
                        f"  warning: warmup failed ({type(exc).__name__}: {exc}); "
                        "measuring each test anyway"
                    )

            for sweep, call_args, err in built:
                test = {"tool": config.tool_name, "model": model_name, "params": sweep}
                test_label = f"{label} | " + ", ".join(
                    f"{k}={v}" for k, v in sweep.items()
                )
                if err is None:
                    print(f"  benchmarking: {test_label}")
                    try:
                        if self.remote:
                            stats = _measure_remote(
                                config.tool,
                                model,
                                call_args,
                                self.n_repeat,
                                label=test_label,
                            )
                        else:
                            stats = _measure_local(
                                config.tool,
                                model,
                                call_args,
                                self.n_repeat,
                                label=test_label,
                                autocast=self._autocast_dtype,
                            )
                        outcomes.append({**test, "status": OK, "stats": stats})
                        continue
                    except Exception as exc:
                        err = exc
                outcomes.append(_failed_outcome(test, err, test_label))
        return outcomes

    def run_peak_mem(
        self,
        model_name: str,
        model: "StandardizedTransformer",
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Peak-memory outcomes for every config of one model.

        For each tool: a coarse doubling sweep of the config's
        ``sweep_axis`` from ``min_length``, then bisection to the exact
        largest value whose peak stays under each threshold of the model
        footprint (see ``memory.search_max_lengths``). Every probed point
        gets one peak measurement and, separately, ``n_warmup`` + ``n_repeat``
        timed calls under the same conditions.
        """
        footprint = model_footprint(model)
        ctx = context_length(model)
        cap = self.max_length if ctx is None else min(self.max_length, ctx - 1)
        outcomes: list[dict[str, Any]] = []

        for config in configs:
            axis = config.sweep_axis
            label = f"{config.tool_name} | {model_name} | peak_mem"
            test = {
                "tool": config.tool_name,
                "model": model_name,
                "params": dict(config.fixed_args),
            }
            print(f"  sweeping: {label} (cap {axis}={cap})")
            points: dict[int, dict[str, Any]] = {}

            def measure(n: int) -> int | None:
                point = self._measure_point(model, config, n, footprint)
                points[n] = point
                shown = "OOM" if point.get("oom") else f"{point['pct']:.1f}%"
                print(f"    {axis}={n}: {shown}")
                return point["peak_bytes"]

            try:
                _build(config, model, {axis: self.min_length})
                found = search_max_lengths(
                    measure,
                    footprint,
                    self.thresholds,
                    cap,
                    start=self.min_length,
                )
            except Exception as exc:
                outcomes.append(_failed_outcome(test, exc, label))
                continue

            outcomes.append(
                {
                    **test,
                    "status": OK,
                    "stats": {
                        "footprint_bytes": footprint,
                        "context_cap": cap,
                        "max_prompt_length": found.max_lengths,
                        "capped": found.capped,
                        "points": [points[n] for n in sorted(points)],
                    },
                }
            )
        return outcomes

    def _measure_point(
        self,
        model: "StandardizedTransformer",
        config: ToolBenchmarkConfig,
        n: int,
        footprint: int,
    ) -> dict[str, Any]:
        """Warmup, one peak measurement, then timed repeats at ``axis = n``."""
        axis = config.sweep_axis
        call_args = _build(config, model, {axis: n})
        point: dict[str, Any] = {axis: n, "peak_bytes": None, "pct": None}

        def call() -> None:
            with _autocast(self._autocast_dtype):
                config.tool(model, **call_args)

        try:
            for _ in range(self.n_warmup):
                call()
                _sync()
        except Exception as exc:
            if not _is_oom(exc):
                raise
            free_cuda()
            point["oom"] = True
            return point

        peak = measure_peak(call)
        if peak is None:
            point["oom"] = True
            return point
        point["peak_bytes"] = peak
        point["pct"] = peak_pct(peak, footprint)
        point["latency"] = _measure_local(
            config.tool,
            model,
            call_args,
            self.n_repeat,
            label=f"{config.tool_name} | {axis}={n}",
            autocast=self._autocast_dtype,
        )
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
            thresholds=tuple(meta.get("thresholds", DEFAULT_THRESHOLDS)),
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
            tests = expand_tests({**defn, "models": [model_name]})
            names = {c.tool_name for c in configs}
            return [
                {
                    **{k: t[k] for k in ("tool", "model", "params")},
                    "status": FAILED,
                    "stats": None,
                    "error": f"model load: {type(exc).__name__}: {exc}"[:500],
                }
                for t in tests
                if t["tool"] in names
            ]
        try:
            if defn["dimension"] == "peak_mem":
                return self.run_peak_mem(model_name, model, configs)
            return self.run(model_name, model, configs)
        finally:
            del model
            free_cuda()


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
    path = run_path(path)
    runner = BenchmarkRunner.for_definition(defn)
    configs = tool_configs(defn)
    env = runner.env()
    for warning in version_warnings(
        {defn["name"]: defn}, _recorded_stamps(defn["name"], path)
    ):
        print(f"warning: {warning}")
    print(
        f"\nRunning {defn['name']} v{defn['version']} "
        f"({len(defn['models'])} model(s) × {len(configs)} tool(s))..."
    )
    outcomes: list[dict[str, Any]] = []
    models = list(defn["models"])
    for i, model_name in enumerate(models):
        outcomes += runner.run_tests(defn, model_name, load_model, configs)
        partial = make_result(defn, env, defn["meta_params"], outcomes)
        save_partial(
            path,
            defn["name"],
            mark_in_progress(partial, models[: i + 1], models[i + 1 :]),
        )
    result = make_result(defn, env, defn["meta_params"], outcomes)
    run = load_run(path) or {}
    run[defn["name"]] = result
    save_json(path, run)
    clear_partial(path, defn["name"])
    print(
        f"\n  {defn['name']}: {result['status']} ({len(result['results'])} result(s), "
        f"{len(result['failed'])} failed, "
        f"{len(result['optional_failed'])} optional failed) -> {path}"
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
    configs = tool_configs(defn, tools, params)
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
    return make_result(
        None,
        runner.env(),
        meta,
        outcomes,
        benchmark={**stamp(defn), "individual": True},
    )


def _recorded_stamps(name: str, path: Path | None = None) -> list[dict[str, Any]]:
    """The ``benchmark`` stamps recorded for *name* in ``run.json`` and the baseline."""
    from .store import load_baseline

    out = []
    for doc in (load_run(path), load_baseline()):
        entry = (doc or {}).get(name)
        if entry and entry.get("benchmark"):
            out.append(entry["benchmark"])
    return out


def _build(
    config: ToolBenchmarkConfig, model: "StandardizedTransformer", sweep: dict[str, Any]
) -> dict[str, Any]:
    if config.build_args is not None:
        return config.build_args(model, config.fixed_args, sweep)
    return {**config.fixed_args, **sweep}


def _failed_outcome(
    test: dict[str, Any], exc: BaseException, label: str
) -> dict[str, Any]:
    """A ``failed`` (or ``unsupported``) outcome for *test*, recording *exc*."""
    status = UNSUPPORTED if isinstance(exc, UnsupportedTest) else FAILED
    message = f"{type(exc).__name__}: {exc}"
    if _is_oom(exc):
        message = f"out of memory: {message}"
    print(f"  {status.upper()}: {label}: {message}")
    return {**test, "status": status, "stats": None, "error": message[:500]}
