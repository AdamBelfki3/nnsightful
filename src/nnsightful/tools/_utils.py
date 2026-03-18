from __future__ import annotations

from typing import cast

IndexSpec = int | tuple[int, int] | list[int] | list[tuple[int, int]] | None


def _resolve_neg(idx: int, total: int) -> int:
    """Resolve a possibly-negative index relative to *total*."""
    return idx if idx >= 0 else idx + total


def resolve_indices(indices: IndexSpec, total: int) -> list[int]:
    """Convert various index specification formats into an explicit list of indices.

    Negative indices are resolved relative to *total* (e.g. ``-1`` -> ``total - 1``).

    Args:
        indices: Index specification:
            - ``None``: all indices ``[0, total)``
            - ``int``: single index
            - ``tuple[int, int]``: range ``[start, end)``
            - ``list[int]``: explicit list of indices
            - ``list[tuple[int, int]]``: union of ranges ``[start, end)``
        total: Total number of available indices (used when *indices* is None).

    Returns:
        Sorted list of selected indices.
    """
    if indices is None:
        return list(range(total))
    if isinstance(indices, int):
        return [_resolve_neg(indices, total)]
    if isinstance(indices, tuple):
        assert len(indices) == 2, (
            f"Expected (start, end) tuple, got length {len(indices)}"
        )
        start = _resolve_neg(indices[0], total)
        end = _resolve_neg(indices[1], total)
        return list(range(start, end))
    assert isinstance(indices, list), f"Expected list, got {type(indices)}"
    if not indices:
        return []
    first = indices[0]
    if isinstance(first, int):
        return sorted(_resolve_neg(i, total) for i in cast(list[int], indices))
    # list of tuples
    result: list[int] = []
    for t in cast(list[tuple[int, int]], indices):
        assert len(t) == 2, f"Expected (start, end) tuple, got {t!r}"
        result.extend(range(_resolve_neg(t[0], total), _resolve_neg(t[1], total)))
    return sorted(set(result))
