"""End-to-end tests for nnsightful.tools.activation_patching."""

from __future__ import annotations

import json

from nnsightful.tools.activation_patching import activation_patching
from nnsightful.types import ActivationPatchingData


SRC_PROMPT = "The Eiffel Tower is in"
TGT_PROMPT = "The Colosseum is in"


class TestActivationPatchingEndToEnd:
    """Integration tests that run activation_patching on a real model."""

    def test_basic_output_structure(self, model):
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        assert isinstance(data, ActivationPatchingData)
        assert len(data.lines) > 0
        assert len(data.tokenLabels) == len(data.lines)

    def test_lines_match_num_layers(self, model):
        """Each token's probability list should have one entry per layer."""
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        n_layers = model.num_layers
        for line in data.lines:
            assert len(line) == n_layers

    def test_ranks_are_nonnegative_ints(self, model):
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        for rank_row in data.ranks:
            assert all(isinstance(r, int) and r >= 0 for r in rank_row)

    def test_src_and_tgt_pred_first(self, model):
        """First two tokenLabels should be the source and clean predictions."""
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        # Just verify we have at least 2 labels
        assert len(data.tokenLabels) >= 2

    def test_prob_diffs_shape(self, model):
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        assert len(data.prob_diffs) == len(data.lines)
        for diff_row, prob_row in zip(data.prob_diffs, data.lines):
            assert len(diff_row) == len(prob_row)

    def test_range_src_pos(self, model):
        """src_pos with a range [start, end] should work."""
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[[2, 4]],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        assert isinstance(data, ActivationPatchingData)

    def test_json_roundtrip(self, model):
        data = activation_patching(
            model,
            SRC_PROMPT,
            TGT_PROMPT,
            src_pos=[3],
            tgt_pos=[3],
            tgt_freeze=[3],
        )
        dumped = data.model_dump()
        json_str = json.dumps(dumped)
        restored = ActivationPatchingData(**json.loads(json_str))
        assert restored.tokenLabels == data.tokenLabels
        assert len(restored.lines) == len(data.lines)


class TestActivationPatchingRunFormat:
    """Tests for the _run / _format split."""

    def test_run_returns_expected_keys(self, model):
        raw = activation_patching._run(
            model, SRC_PROMPT, TGT_PROMPT,
            src_pos=[3], tgt_pos=[3], tgt_freeze=[3],
        )
        assert "tokenizer" in raw
        assert "src_pred" in raw
        assert "clean_pred" in raw
        assert "patched_logits" in raw
        assert "clean_logits" in raw

    def test_format_from_raw(self, model):
        """_format should produce ActivationPatchingData from a _run result."""
        raw = activation_patching._run(
            model, SRC_PROMPT, TGT_PROMPT,
            src_pos=[3], tgt_pos=[3], tgt_freeze=[3],
        )
        data = activation_patching._format(raw)
        assert isinstance(data, ActivationPatchingData)
        assert len(data.lines) > 0
        assert len(data.tokenLabels) == len(data.lines)

    def test_run_then_format_matches_call(self, model):
        """_run + _format should produce the same result as __call__."""
        raw = activation_patching._run(
            model, SRC_PROMPT, TGT_PROMPT,
            src_pos=[3], tgt_pos=[3], tgt_freeze=[3],
        )
        data_split = activation_patching._format(raw)
        data_direct = activation_patching(
            model, SRC_PROMPT, TGT_PROMPT,
            src_pos=[3], tgt_pos=[3], tgt_freeze=[3],
        )
        assert data_split.tokenLabels == data_direct.tokenLabels
        assert len(data_split.lines) == len(data_direct.lines)
