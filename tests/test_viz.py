"""Tests for nnsightful.viz display functions (no model needed)."""

from __future__ import annotations

import re
from unittest.mock import patch

import pytest
from IPython.display import HTML

from nnsightful.types import LogitLensData, LogitLensMeta
from nnsightful.viz import display_line_plot, display_logit_lens


def _make_logit_lens_data(**overrides) -> dict:
    """Minimal valid LogitLensData dict."""
    base = {
        "meta": {"version": 2, "timestamp": "2025-01-01T00:00:00Z", "model": "test"},
        "layers": [0, 1],
        "input": ["The", " cat"],
        "tracked": [
            {"The": [0.1, 0.2], " cat": [0.3, 0.4]},
            {"The": [0.5, 0.6], " cat": [0.7, 0.8]},
        ],
        "topk": [[["The", " cat"], ["The", " cat"]], [["The", " cat"], [" cat", "The"]]],
    }
    base.update(overrides)
    return base


def _make_line_plot_data(**overrides) -> dict:
    """Minimal valid LinePlotData dict."""
    base = {"lines": [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]}
    base.update(overrides)
    return base


# Stub JS to avoid file-not-found errors
FAKE_JS = "function LogitLensWidget(){} function LinePlotWidget(){}"


class TestDisplayLogitLens:
    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_return_html_gives_html_object(self, _mock):
        result = display_logit_lens(_make_logit_lens_data(), return_html=True)
        assert isinstance(result, HTML)

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_default_returns_none(self, _mock):
        """Without return_html, display is called and None returned."""
        with patch("nnsightful.viz.ipython_display"):
            result = display_logit_lens(_make_logit_lens_data())
        assert result is None

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_unique_container_ids(self, _mock):
        h1 = display_logit_lens(_make_logit_lens_data(), return_html=True)
        h2 = display_logit_lens(_make_logit_lens_data(), return_html=True)
        id1 = re.search(r'id="(ll-[a-f0-9]+)"', h1.data)
        id2 = re.search(r'id="(ll-[a-f0-9]+)"', h2.data)
        assert id1 and id2
        assert id1.group(1) != id2.group(1)

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_dark_mode_injected(self, _mock):
        result = display_logit_lens(
            _make_logit_lens_data(), dark_mode=True, return_html=True
        )
        assert '"darkMode": true' in result.data

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_accepts_pydantic_model(self, _mock):
        """Should accept a LogitLensData (BaseModel) directly."""
        pydantic_data = LogitLensData(
            meta=LogitLensMeta(
                version=2, timestamp="2025-01-01T00:00:00Z", model="test"
            ),
            layers=[0],
            input=["hi"],
            tracked=[{"hi": [0.5]}],
            topk=[[["hi"]]],
        )
        result = display_logit_lens(pydantic_data, return_html=True)
        assert isinstance(result, HTML)

    def test_missing_keys_raises(self):
        with pytest.raises(ValueError, match="missing required keys"):
            display_logit_lens({"meta": {}, "layers": []})

    def test_missing_meta_raises(self):
        with pytest.raises(ValueError, match="missing required keys"):
            display_logit_lens({"layers": [0], "input": ["a"], "tracked": [], "topk": []})


class TestDisplayLinePlot:
    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_return_html(self, _mock):
        result = display_line_plot(_make_line_plot_data(), return_html=True)
        assert isinstance(result, HTML)

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_unique_container_ids(self, _mock):
        h1 = display_line_plot(_make_line_plot_data(), return_html=True)
        h2 = display_line_plot(_make_line_plot_data(), return_html=True)
        id1 = re.search(r'id="(lp-[a-f0-9]+)"', h1.data)
        id2 = re.search(r'id="(lp-[a-f0-9]+)"', h2.data)
        assert id1 and id2
        assert id1.group(1) != id2.group(1)

    def test_missing_lines_raises(self):
        with pytest.raises(ValueError, match="missing required keys"):
            display_line_plot({"labels": ["a"]})


class TestDisplayPassthrough:
    """Types .display() should delegate correctly."""

    @patch("nnsightful.viz._get_standalone_js", return_value=FAKE_JS)
    def test_logit_lens_data_display(self, _mock):
        data = LogitLensData(
            meta=LogitLensMeta(
                version=2, timestamp="2025-01-01T00:00:00Z", model="test"
            ),
            layers=[0],
            input=["hi"],
            tracked=[{"hi": [0.5]}],
            topk=[[["hi"]]],
        )
        result = data.display(return_html=True)
        assert isinstance(result, HTML)
