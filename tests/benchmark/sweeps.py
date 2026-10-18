"""Sweep strategies: which inputs a test runs at.

- :class:`GridSweep` — every combination of a definition's sweep values
  (latency); each combination is its own test.
- :class:`ThresholdSearch` — the peak-memory search: the largest value
  whose peak stays within each threshold of the model footprint, driven
  by a ``measure(n) -> peak_bytes | None`` callback (``None`` = out of
  memory). Peak memory is assumed non-decreasing in ``n``.

Pure logic, no torch.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from itertools import product
from typing import Any, Callable


@dataclass
class GridSweep:
    """The cartesian product of ``params``' value lists, in definition order."""

    params: dict[str, list[Any]]

    def points(self) -> list[dict[str, Any]]:
        keys = list(self.params)
        return [dict(zip(keys, values)) for values in product(*self.params.values())]


@dataclass
class SearchResult:
    """Outcome of :meth:`ThresholdSearch.run`.

    ``max_lengths`` maps each threshold label to the largest passing
    value, or ``None`` when even ``start`` is over it. Labels in
    ``capped`` never crossed their threshold up to ``cap``, so their
    value is ``cap`` and the true limit is higher. ``peaks`` holds every
    measured value (coarse and bisection probes).
    """

    max_lengths: dict[str, int | None] = field(default_factory=dict)
    capped: list[str] = field(default_factory=list)
    peaks: dict[int, int | None] = field(default_factory=dict)


@dataclass
class ThresholdSearch:
    """Largest value whose peak stays within each threshold of ``footprint``."""

    DEFAULT_THRESHOLDS = (0.10, 0.25, 0.50)

    footprint: int
    thresholds: tuple[float, ...] | list[float]
    cap: int
    start: int = 2

    @staticmethod
    def label(threshold: float) -> str:
        """``0.1`` -> ``"10%"``; the key used in ``max_prompt_length``."""
        return f"{threshold * 100:g}%"

    @staticmethod
    def coarse_grid(start: int, cap: int) -> list[int]:
        """Doubling values from ``start`` up to ``cap``, always ending at ``cap``."""
        grid = []
        n = start
        while n < cap:
            grid.append(n)
            n *= 2
        grid.append(cap)
        return grid

    def run(self, measure: Callable[[int], int | None]) -> SearchResult:
        """Coarse doubling sweep, then per-threshold bisection to the exact value.

        The coarse sweep stops at the first point over the largest threshold
        (or at ``cap``); each threshold is then bisected between its
        bracketing points, reusing every measurement already taken.
        """
        result = SearchResult()
        peaks = result.peaks

        def probe(n: int) -> int | None:
            if n not in peaks:
                peaks[n] = measure(n)
            return peaks[n]

        def over(n: int, limit: float) -> bool:
            peak = peaks[n]
            return peak is None or peak > limit

        top = max(self.thresholds) * self.footprint
        for n in self.coarse_grid(self.start, max(self.cap, self.start)):
            probe(n)
            if over(n, top):
                break

        for threshold in sorted(self.thresholds):
            label = self.label(threshold)
            limit = threshold * self.footprint
            measured = sorted(peaks)
            above = [n for n in measured if over(n, limit)]
            hi = above[0] if above else None
            below = [
                n for n in measured if not over(n, limit) and (hi is None or n < hi)
            ]
            if not below:
                result.max_lengths[label] = None
                continue
            lo = below[-1]
            if hi is None:
                result.max_lengths[label] = lo
                if lo >= self.cap:
                    result.capped.append(label)
                continue
            while hi - lo > 1:
                mid = (lo + hi) // 2
                probe(mid)
                if over(mid, limit):
                    hi = mid
                else:
                    lo = mid
            result.max_lengths[label] = lo

        result.max_lengths = {
            self.label(t): result.max_lengths[self.label(t)] for t in self.thresholds
        }
        return result
