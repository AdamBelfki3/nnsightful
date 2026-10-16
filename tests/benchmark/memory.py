"""Peak-memory threshold search.

Pure logic, no torch: given a ``measure(n) -> peak_bytes | None`` callback
(``None`` = out of memory), find for each threshold the largest ``n``
whose peak stays within ``threshold * footprint``. Peak memory is assumed
non-decreasing in ``n``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable


def threshold_label(threshold: float) -> str:
    """``0.1`` -> ``"10%"``; the key used in ``max_prompt_length``."""
    return f"{threshold * 100:g}%"


def coarse_grid(start: int, cap: int) -> list[int]:
    """Doubling values from ``start`` up to ``cap``, always ending at ``cap``."""
    grid = []
    n = start
    while n < cap:
        grid.append(n)
        n *= 2
    grid.append(cap)
    return grid


@dataclass
class SearchResult:
    """Outcome of :func:`search_max_lengths`.

    ``max_lengths`` maps each threshold label to the largest passing
    value, or ``None`` when even ``start`` is over it. Labels in
    ``capped`` never crossed their threshold up to ``cap``, so their
    value is ``cap`` and the true limit is higher. ``peaks`` holds every
    measured value (coarse and bisection probes).
    """

    max_lengths: dict[str, int | None] = field(default_factory=dict)
    capped: list[str] = field(default_factory=list)
    peaks: dict[int, int | None] = field(default_factory=dict)


def search_max_lengths(
    measure: Callable[[int], int | None],
    footprint: int,
    thresholds: tuple[float, ...] | list[float],
    cap: int,
    start: int = 2,
) -> SearchResult:
    """Coarse doubling sweep, then per-threshold bisection to the exact value.

    The coarse sweep stops at the first point over the largest threshold
    (or at ``cap``); each threshold is then bisected between its bracketing
    points, reusing every measurement already taken.
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

    top = max(thresholds) * footprint
    for n in coarse_grid(start, max(cap, start)):
        probe(n)
        if over(n, top):
            break

    for threshold in sorted(thresholds):
        label = threshold_label(threshold)
        limit = threshold * footprint
        measured = sorted(peaks)
        above = [n for n in measured if over(n, limit)]
        hi = above[0] if above else None
        below = [n for n in measured if not over(n, limit) and (hi is None or n < hi)]
        if not below:
            result.max_lengths[label] = None
            continue
        lo = below[-1]
        if hi is None:
            result.max_lengths[label] = lo
            if lo >= cap:
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
        threshold_label(t): result.max_lengths[threshold_label(t)] for t in thresholds
    }
    return result
