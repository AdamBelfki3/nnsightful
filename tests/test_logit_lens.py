"""End-to-end tests for nnsightful.tools.logit_lens."""

from __future__ import annotations

import json

import pytest

from nnsightful.tools.logit_lens import logit_lens
from nnsightful.types import LogitLensData


PROMPT = "The capital of France is"


class TestLogitLensEndToEnd:
    """Integration tests that run logit_lens on a real model."""

    def test_basic_output_structure(self, model):
        data = logit_lens(model, PROMPT)
        assert isinstance(data, LogitLensData)
        assert data.meta.version == 2
        assert data.meta.model != ""

    def test_all_layers_by_default(self, model):
        data = logit_lens(model, PROMPT)
        assert data.layers == list(range(model.num_layers))

    def test_input_tokens_match_tokenizer(self, model):
        data = logit_lens(model, PROMPT)
        expected_len = len(model.tokenizer.encode(PROMPT))
        assert len(data.input) == expected_len

    def test_positions_none_when_all(self, model):
        """When no position selection, positions field should be None."""
        data = logit_lens(model, PROMPT)
        assert data.positions is None

    def test_sparse_layers(self, model):
        data = logit_lens(model, PROMPT, layers=[0, -1])
        assert len(data.layers) == 2
        assert data.layers[0] == 0
        assert data.layers[-1] == model.num_layers - 1

    def test_sparse_positions(self, model):
        data = logit_lens(model, PROMPT, positions=[0, -1])
        assert data.positions is not None
        assert len(data.positions) == 2
        n_tokens = len(model.tokenizer.encode(PROMPT))
        assert data.positions == [0, n_tokens - 1]

    def test_tracked_trajectories_length(self, model):
        """Each tracked token trajectory should have one entry per layer."""
        data = logit_lens(model, PROMPT, layers=[0, 1, 2])
        n_layers = len(data.layers)
        for pos_tracked in data.tracked:
            for trajectory in pos_tracked.values():
                assert len(trajectory) == n_layers

    def test_topk_shape(self, model):
        """topk should be [n_layers][n_positions] lists of token strings."""
        data = logit_lens(model, PROMPT, top_k=3)
        n_pos = len(data.input)
        for layer_topk in data.topk:
            assert len(layer_topk) == n_pos
            for pos_tokens in layer_topk:
                assert len(pos_tokens) <= 3
                assert all(isinstance(t, str) for t in pos_tokens)

    def test_entropy_included_by_default(self, model):
        data = logit_lens(model, PROMPT)
        assert data.entropy is not None
        assert len(data.entropy) == len(data.layers)
        for layer_entropy in data.entropy:
            assert all(isinstance(v, float) for v in layer_entropy)
            assert all(v >= 0 for v in layer_entropy)

    def test_entropy_excluded(self, model):
        data = logit_lens(model, PROMPT, include_entropy=False)
        assert data.entropy is None

    def test_top_p_selects_tokens(self, model):
        """top_p alone (no top_k) should still select tokens."""
        data = logit_lens(model, PROMPT, top_k=None, top_p=0.9)
        for pos_tracked in data.tracked:
            assert len(pos_tracked) > 0

    def test_top_k_and_top_p_min(self, model):
        """With both top_k and top_p, whichever cutoff is reached first wins."""
        data_k = logit_lens(model, PROMPT, top_k=10, top_p=None)
        data_both = logit_lens(model, PROMPT, top_k=10, top_p=0.5)
        # top_p may cut off before top_k, so combined <= top_k-only
        for tk, tboth in zip(data_k.tracked, data_both.tracked):
            assert len(tboth) <= len(tk)

    def test_logit_indices_always_tracked(self, model):
        """Explicit logit_indices should appear in tracked tokens."""
        # Token index 0 is always a valid vocab index
        data = logit_lens(model, PROMPT, top_k=1, logit_indices=[0])
        token_0_str = model.tokenizer.decode(0)
        for pos_tracked in data.tracked:
            assert token_0_str in pos_tracked

    def test_no_selection_raises(self):
        """Must specify at least one of top_k or top_p."""
        from unittest.mock import MagicMock

        with pytest.raises(AssertionError, match="top_k or top_p"):
            logit_lens(MagicMock(), "test", top_k=None, top_p=None)

    def test_json_roundtrip(self, model):
        """LogitLensData should survive JSON serialization."""
        data = logit_lens(model, PROMPT, top_k=3, layers=[0, -1])
        dumped = data.model_dump()
        json_str = json.dumps(dumped)
        restored = LogitLensData(**json.loads(json_str))
        assert restored.layers == data.layers
        assert restored.input == data.input
        assert len(restored.tracked) == len(data.tracked)

    def test_probabilities_sum_tracked(self, model):
        """Tracked probabilities should be in [0, 1]."""
        data = logit_lens(model, PROMPT, top_k=5)
        for pos_tracked in data.tracked:
            for trajectory in pos_tracked.values():
                for prob in trajectory:
                    assert 0.0 <= prob <= 1.0
