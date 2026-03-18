"""Tests for nnsightful.tools._utils (resolve_indices, IndexSpec)."""

from __future__ import annotations

import pytest

from nnsightful.tools._utils import resolve_indices


class TestResolveIndices:
    """resolve_indices converts IndexSpec variants into explicit sorted lists."""

    def test_none_returns_all(self):
        assert resolve_indices(None, 5) == [0, 1, 2, 3, 4]

    def test_single_int(self):
        assert resolve_indices(3, 10) == [3]

    def test_negative_int(self):
        assert resolve_indices(-1, 10) == [9]

    def test_tuple_range(self):
        assert resolve_indices((2, 5), 10) == [2, 3, 4]

    def test_tuple_with_negative_end(self):
        assert resolve_indices((0, -1), 5) == [0, 1, 2, 3]

    def test_list_of_ints_sorted(self):
        assert resolve_indices([4, 1, 3], 10) == [1, 3, 4]

    def test_list_of_ints_negative(self):
        assert resolve_indices([-1, 0, -2], 5) == [0, 3, 4]

    def test_list_of_tuples(self):
        assert resolve_indices([(0, 2), (4, 6)], 10) == [0, 1, 4, 5]

    def test_list_of_tuples_deduplicates(self):
        """Overlapping ranges should not produce duplicates."""
        result = resolve_indices([(0, 3), (2, 5)], 10)
        assert result == [0, 1, 2, 3, 4]

    def test_empty_list(self):
        assert resolve_indices([], 10) == []

    def test_none_with_zero_total(self):
        assert resolve_indices(None, 0) == []

    def test_bad_tuple_length_raises(self):
        with pytest.raises(AssertionError, match="Expected .* tuple"):
            resolve_indices((1, 2, 3), 10)  # type: ignore[arg-type]

    def test_bad_nested_tuple_raises(self):
        with pytest.raises(AssertionError, match="Expected .* tuple"):
            resolve_indices([(1,)], 10)  # type: ignore[arg-type]
