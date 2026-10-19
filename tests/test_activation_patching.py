"""Activation patching on a local model: payload shape, causal correctness, options."""

from __future__ import annotations

import pytest
import torch

from nnsightful.tools.activation_patching import activation_patching

from .helpers import model_logits

SRC_PROMPT = "The Eiffel Tower is in Paris. The Eiffel Tower is in"
TGT_PROMPT = "The Colosseum is in Rome. The Colosseum is in"


def last_position(model, prompt: str) -> int:
    return len(model.tokenizer.encode(prompt)) - 1


@pytest.fixture(scope="module")
def setup(model):
    """Patch the last position (no freezing), plus both runs' own logits."""
    pos = last_position(model, TGT_PROMPT)
    kwargs = dict(
        src_pos=[last_position(model, SRC_PROMPT)], tgt_pos=[pos], tgt_freeze=[]
    )
    return {
        "kwargs": kwargs,
        "data": activation_patching(model, SRC_PROMPT, TGT_PROMPT, **kwargs),
        "src_logits": model_logits(model, SRC_PROMPT)[-1],
        "tgt_logits": model_logits(model, TGT_PROMPT)[-1],
    }


class TestPayload:
    def test_every_series_is_tokens_by_layers(self, model, setup):
        data = setup["data"]
        n_tokens = len(data.tokenLabels)

        assert n_tokens >= 2
        for series in (data.lines, data.ranks, data.prob_diffs):
            assert len(series) == n_tokens
            assert {len(row) for row in series} == {model.num_layers}
        assert all(0 <= rank < model.vocab_size for row in data.ranks for rank in row)

    def test_ranks_order_the_probabilities(self, setup):
        data = setup["data"]
        for layer in range(len(data.lines[0])):
            column = [
                (row[layer], rank[layer]) for row, rank in zip(data.lines, data.ranks)
            ]
            for p_a, r_a in column:
                for p_b, r_b in column:
                    if p_a > p_b + 1e-3:
                        assert r_a < r_b


class TestCausalEffect:
    def test_leading_labels_are_the_source_and_clean_predictions(self, model, setup):
        tokenizer = model.tokenizer
        assert setup["data"].tokenLabels[:2] == [
            tokenizer.decode(int(setup["src_logits"].argmax())),
            tokenizer.decode(int(setup["tgt_logits"].argmax())),
        ]

    def test_prob_diffs_are_relative_to_the_clean_run(self, setup):
        data = setup["data"]
        clean = torch.softmax(setup["tgt_logits"], dim=-1)
        leading = [int(setup["src_logits"].argmax()), int(setup["tgt_logits"].argmax())]
        for row, (line, diffs) in enumerate(zip(data.lines[:2], data.prob_diffs[:2])):
            expected = [p - clean[leading[row]].item() for p in line]
            assert diffs == pytest.approx(expected, abs=2e-4)

    def test_patching_the_last_layer_at_the_last_position_yields_the_source(
        self, setup
    ):
        """Nothing runs after the last layer, so its patch is the source output."""
        src_probs = torch.softmax(setup["src_logits"], dim=-1)
        src_pred = int(src_probs.argmax())
        assert setup["data"].lines[0][-1] == pytest.approx(
            src_probs[src_pred].item(), abs=1e-3
        )

    def test_patching_a_prompt_into_itself_changes_nothing(self, model, setup):
        data = activation_patching(model, TGT_PROMPT, TGT_PROMPT, **setup["kwargs"])
        assert all(
            d == pytest.approx(0, abs=1e-4) for row in data.prob_diffs for d in row
        )


class TestOptions:
    def test_a_one_wide_src_range_equals_that_position(self, model, setup):
        """``[start, end]`` patches the mean over ``start:end``."""
        kwargs = dict(setup["kwargs"])
        pos = kwargs["src_pos"][0]
        kwargs["src_pos"] = [[pos, pos + 1]]
        data = activation_patching(model, SRC_PROMPT, TGT_PROMPT, **kwargs)
        assert data == setup["data"]

    def test_batch_size_does_not_change_the_result(self, model, setup):
        """A batch size that doesn't divide the layer count leaves a partial batch."""
        batch_size = max(1, model.num_layers // 2 - 1)
        assert model.num_layers % batch_size
        data = activation_patching(
            model, SRC_PROMPT, TGT_PROMPT, batch_size=batch_size, **setup["kwargs"]
        )
        assert data.tokenLabels == setup["data"].tokenLabels
        for row, ref in zip(data.lines, setup["data"].lines):
            assert row == pytest.approx(ref, abs=1e-3)


class TestTool:
    def test_raw_returns_the_unformatted_pieces(self, model, setup):
        raw = activation_patching._run(
            model, SRC_PROMPT, TGT_PROMPT, raw=True, **setup["kwargs"]
        )
        assert set(raw) == {
            "tokenizer",
            "src_pred",
            "clean_pred",
            "patched_logits",
            "clean_probs",
        }
        assert len(raw["patched_logits"]) == model.num_layers
        assert int(raw["src_pred"]) == int(setup["src_logits"].argmax())
        assert int(raw["clean_pred"]) == int(setup["tgt_logits"].argmax())
