"""Meters: one context manager per measurement dimension, wrapping one tool call.

``with meter as extra: tool(model, **args, **extra)`` — ``__enter__``
returns extra call kwargs (empty for local meters), ``__exit__`` records
the sample. A CUDA out-of-memory error (including one nnsight re-wraps)
is recorded on the meter (``oom`` / ``oom_error``, without its traceback
so its frames and tensors are released) and suppressed; other exceptions,
and non-``Exception`` interrupts, propagate. A meter can be entered
repeatedly; samples accumulate.
"""

from __future__ import annotations

import gc
import statistics
import time
from contextlib import nullcontext
from typing import TYPE_CHECKING, Any, Callable

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Meter:
    """Base meter: OOM handling around ``_start`` / ``_record``; CUDA helpers."""

    def __init__(self) -> None:
        self.oom = False
        self.oom_error: BaseException | None = None

    def __enter__(self) -> dict[str, Any]:
        return self._start()

    def __exit__(self, exc_type, exc, tb) -> bool:
        if exc is not None:
            if not isinstance(exc, Exception) or not self.is_oom(exc):
                return False
            self.oom, self.oom_error = True, exc.with_traceback(None)
            self.free_cuda()
            return True
        self._record()
        return False

    def _start(self) -> dict[str, Any]:
        return {}

    def _record(self) -> None:
        pass

    @staticmethod
    def sync() -> None:
        """Block until GPU work is done, so wall-clock timing is accurate."""
        import torch

        if torch.cuda.is_available():
            torch.cuda.synchronize()

    @staticmethod
    def free_cuda() -> None:
        """Collect garbage and return cached CUDA blocks."""
        import torch

        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    @staticmethod
    def ndif_autocast(dtype_name: str | None):
        """NDIF's execution context: ``torch.autocast`` in the model dtype, no cache.

        ``None`` (or no CUDA) disables it.
        """
        import torch

        if dtype_name is None or not torch.cuda.is_available():
            return nullcontext()
        return torch.autocast(
            "cuda", dtype=getattr(torch, dtype_name), cache_enabled=False
        )

    @staticmethod
    def is_oom(exc: BaseException | None) -> bool:
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

    @staticmethod
    def stats_from_samples(samples: list[float]) -> dict[str, Any]:
        """Mean / std / min / max / samples of a list of seconds, rounded to µs."""
        mean = statistics.fmean(samples)
        std = statistics.stdev(samples) if len(samples) > 1 else 0.0
        return {
            "mean": round(mean, 6),
            "std": round(std, 6),
            "min": round(min(samples), 6),
            "max": round(max(samples), 6),
            "samples": [round(s, 6) for s in samples],
        }


class LocalLatency(Meter):
    """Wall-clock seconds of a local call, synced on both sides."""

    def __init__(self) -> None:
        super().__init__()
        self.samples: list[float] = []
        self._t0 = 0.0

    def _start(self) -> dict[str, Any]:
        self.sync()
        self._t0 = time.perf_counter()
        return {}

    def _record(self) -> None:
        self.sync()
        self.samples.append(time.perf_counter() - self._t0)

    def stats(self) -> dict[str, Any]:
        return self.stats_from_samples(self.samples)


class RemoteLatency(Meter):
    """Per-phase seconds of a remote call; :attr:`HEADLINE` is the reported stat.

    Each call gets a fresh backend counter, passed as ``backend=`` with
    ``remote=True``.
    """

    PHASES = ("total", "total_unqueued", "running", "download")
    HEADLINE = "total_unqueued"

    def __init__(
        self,
        model: "StandardizedTransformer",
        counter_factory: Callable[[str], Any] | None = None,
    ) -> None:
        super().__init__()
        self.model = model
        self.counter_factory = counter_factory
        self.phases: dict[str, list[float]] = {p: [] for p in self.PHASES}
        self._counter: Any = None

    def _start(self) -> dict[str, Any]:
        factory = self.counter_factory
        if factory is None:
            from .backend import RemoteBackendCounter as factory
        self._counter = factory(self.model.to_model_key())
        return {"remote": True, "backend": self._counter}

    def _record(self) -> None:
        for phase, value in self._counter.get_latency().items():
            self.phases[phase].append(value)

    def stats(self) -> dict[str, Any]:
        return {
            **self.stats_from_samples(self.phases[self.HEADLINE]),
            "breakdown": {
                p: self.stats_from_samples(s) for p, s in self.phases.items()
            },
        }


class PeakMemory(Meter):
    """Peak CUDA bytes allocated during a call beyond what was allocated before it."""

    def __init__(self) -> None:
        super().__init__()
        self.peak: int | None = None
        self._base = 0

    def _start(self) -> dict[str, Any]:
        import torch

        self.free_cuda()
        self.sync()
        self._base = torch.cuda.memory_allocated()
        torch.cuda.reset_peak_memory_stats()
        return {}

    def _record(self) -> None:
        import torch

        self.sync()
        self.peak = torch.cuda.max_memory_allocated() - self._base
