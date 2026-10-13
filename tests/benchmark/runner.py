"""Benchmark runner: measure latency and peak memory, one block slot at a time.

Results go into ``run.json`` as dimension blocks (see ``store.py``), each
stamped with the environment it ran in.
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

from .config import ToolBenchmarkConfig, UnsupportedTest, sweep_combos
from .legacy import kind_env
from .memory import search_max_lengths
from .store import (
    BENCH_DIR,
    FAILED,
    OK,
    UNSUPPORTED,
    empty_doc,
    env_label,
    get_block,
    has_results,
    load_run,
    merge_run_block,
    run_path,
    save_json,
    set_block,
    slot_id,
    sync_slots,
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
    status = _git("status", "--porcelain", "--untracked-files=all", "--", *pathspec, cwd=top) or ""
    state: dict[str, Any] = {"git_hash": head.strip(), "dirty": bool(status.strip())}
    if state["dirty"]:
        digest = hashlib.sha256((_git("diff", "HEAD", "--", *pathspec, cwd=top) or "").encode())
        untracked = _git("ls-files", "--others", "--exclude-standard", "--", *pathspec, cwd=top) or ""
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
    """Everything that makes *kind*'s results comparable (see README "Environment stamp")."""
    import torch

    env = {**git_state(), "timestamp": _timestamp(), "python": platform.python_version()}
    env.update(_package_info())
    if torch.cuda.is_available():
        env["gpu"] = torch.cuda.get_device_name(0)
    env["dtype"] = dtype
    env["autocast"] = autocast
    if remote_server is not None:
        env["remote_server"] = remote_server
    return {"kind": kind, **kind_env(env, kind)}


def remote_server_info(host: str) -> dict[str, Any]:
    """Host plus the server's python / key package versions from its ``/env``, best effort."""
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
    return torch.autocast(
        "cuda", dtype=getattr(torch, dtype_name), cache_enabled=False
    )


def free_cuda() -> None:
    """Collect garbage and return cached CUDA blocks."""
    import torch

    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def _warmup_tool(
    tool: Any,
    model: "StandardizedTransformer",
    model_name: str,
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
    model_name: str,
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
            phase: _stats_from_samples(samples)
            for phase, samples in phases.items()
        },
    }


def _is_oom(exc: BaseException) -> bool:
    """True for a CUDA out-of-memory error, including ones nnsight re-wraps."""
    import torch

    while exc is not None:
        if isinstance(exc, torch.OutOfMemoryError) or "out of memory" in str(exc).lower():
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
        t.numel() * t.element_size()
        for t in (*model.parameters(), *model.buffers())
    )


def context_length(model: "StandardizedTransformer") -> int | None:
    """The model's maximum position count, if its config declares one."""
    config = model.config
    config = getattr(config, "text_config", None) or config
    return getattr(config, "max_position_embeddings", None)


class BenchmarkRunner:
    """Run one block of the benchmark matrix for one model at a time.

    Local calls run under NDIF's autocast in ``dtype`` when CUDA is
    available (``autocast=False`` turns that off). Every test is
    isolated: a failing or unsupported test becomes a ``failed`` /
    ``unsupported`` slot instead of aborting the run.
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
            self._env_cache = capture_env(kind, self.dtype, self._autocast_dtype is not None, remote_server)
        return self._env_cache

    def latency_meta(self) -> dict[str, Any]:
        return {"n_repeat": self.n_repeat, "n_warmup": self.n_warmup}

    def peak_meta(self, axis: str = "prompt_length") -> dict[str, Any]:
        return {
            "thresholds": list(self.thresholds),
            "swept": axis,
            "min_length": self.min_length,
            "max_length": self.max_length,
            "n_repeat": self.n_repeat,
            "n_warmup": self.n_warmup,
        }

    def run(
        self,
        model_name: str,
        model: "StandardizedTransformer",
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Latency slots (``ok`` / ``failed`` / ``unsupported``) for every config × combo of one model."""
        kind = "remote" if self.remote else "local"
        slots: list[dict[str, Any]] = []
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
                        config.tool, model, model_name, warm, self.n_warmup,
                        remote=self.remote, autocast=self._autocast_dtype,
                    )
                except Exception as exc:
                    print(f"  warning: warmup failed ({type(exc).__name__}: {exc}); measuring each test anyway")

            for sweep, call_args, err in built:
                slot = {"tool": config.tool_name, "model": model_name, "params": sweep}
                test_label = f"{label} | " + ", ".join(f"{k}={v}" for k, v in sweep.items())
                if err is None:
                    print(f"  benchmarking: {test_label}")
                    try:
                        if self.remote:
                            stats = _measure_remote(
                                config.tool, model, model_name, call_args, self.n_repeat, label=test_label,
                            )
                        else:
                            stats = _measure_local(
                                config.tool, model, call_args, self.n_repeat,
                                label=test_label, autocast=self._autocast_dtype,
                            )
                        slots.append({**slot, "status": OK, "stats": stats})
                        continue
                    except Exception as exc:
                        err = exc
                slots.append(_error_slot(slot, err, test_label))
        return slots

    def run_peak_mem(
        self,
        model_name: str,
        model: "StandardizedTransformer",
        configs: list[ToolBenchmarkConfig],
    ) -> list[dict[str, Any]]:
        """Peak-memory slots for every config of one model.

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
        slots: list[dict[str, Any]] = []

        for config in configs:
            axis = config.sweep_axis
            label = f"{config.tool_name} | {model_name} | peak_mem"
            slot = {"tool": config.tool_name, "model": model_name, "params": dict(config.fixed_args)}
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
                    measure, footprint, self.thresholds, cap, start=self.min_length,
                )
            except Exception as exc:
                slots.append(_error_slot(slot, exc, label))
                continue

            slots.append({
                **slot,
                "status": OK,
                "stats": {
                    "footprint_bytes": footprint,
                    "context_cap": cap,
                    "max_prompt_length": found.max_lengths,
                    "capped": found.capped,
                    "points": [points[n] for n in sorted(points)],
                },
            })
        return slots

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

    def save(
        self,
        block: str,
        slots: list[dict[str, Any]],
        config_slots: list[dict[str, Any]],
        path: Path | None = None,
    ) -> dict[str, Any]:
        """Write measured *slots* into *block* of ``run.json``.

        The block always holds every *config_slots* entry (unmeasured ones
        as placeholders). It is merged per slot into the existing block
        when that is from the same environment identity; otherwise
        replaced, so a block is always one environment.
        """
        path = run_path(path)
        meta = self.peak_meta() if block == "peak_mem" else self.latency_meta()
        fresh = sync_slots({"env": self.env(), "meta_params": meta, "runs": slots}, config_slots)
        extra = {slot_id(s) for s in slots} - {slot_id(s) for s in fresh["runs"]}
        fresh["runs"] += [s for s in slots if slot_id(s) in extra]

        doc = load_run(path) or empty_doc()
        existing = get_block(doc, block)
        merged_block, merged = merge_run_block(existing, fresh, block)
        if existing is not None and not merged and has_results(existing):
            print(
                f"warning: replacing {block} in {path} — its environment "
                f"({env_label(existing.get('env'))}) differs from this run's ({env_label(fresh['env'])})."
            )
        set_block(doc, block, merged_block)
        save_json(path, doc)
        action = "merged into" if merged else "written to"
        print(f"\n  {block} results {action} {path}")
        return merged_block


def _build(config: ToolBenchmarkConfig, model: "StandardizedTransformer", sweep: dict[str, Any]) -> dict[str, Any]:
    if config.build_args is not None:
        return config.build_args(model, config.fixed_args, sweep)
    return {**config.fixed_args, **sweep}


def _error_slot(slot: dict[str, Any], exc: BaseException, label: str) -> dict[str, Any]:
    """A ``failed`` (or ``unsupported``) slot recording *exc*."""
    status = UNSUPPORTED if isinstance(exc, UnsupportedTest) else FAILED
    message = f"{type(exc).__name__}: {exc}"
    if _is_oom(exc):
        message = f"out of memory: {message}"
    print(f"  {status.upper()}: {label}: {message}")
    return {**slot, "status": status, "stats": None, "error": message[:500]}
