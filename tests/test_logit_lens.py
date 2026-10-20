"""Logit lens on a local model: payload shape, agreement with the model, options."""

from __future__ import annotations

import pytest
import torch

from nnsightful.tools.logit_lens import logit_lens

from .helpers import decode_each, model_logits

PROMPT = "The capital of France is"


@pytest.fixture(scope="module")
def reference(model):
    """The model's own final distribution and the default lens payload."""
    logits = model_logits(model, PROMPT)
    return {
        "logits": logits,
        "probs": torch.softmax(logits, dim=-1),
        "data": logit_lens(model, PROMPT, top_k=3),
    }


class TestPayload:
    def test_shapes_follow_layers_positions_and_top_k(self, model, reference):
        data = reference["data"]
        n_layers = model.num_layers
        tokens = decode_each(model, model.tokenizer.encode(PROMPT))

        assert data.meta.model == model.repo_id
        assert data.layers == list(range(n_layers))
        assert data.input == tokens
        assert data.positions == list(range(len(tokens)))
        assert [len(layer) for layer in data.topk] == [len(tokens)] * n_layers
        assert all(len(cell) == 3 for layer in data.topk for cell in layer)
        assert len(data.tracked) == len(tokens)
        assert all(
            len(trajectory) == n_layers
            for position in data.tracked
            for trajectory in position.values()
        )
        assert [len(layer) for layer in data.entropy] == [len(tokens)] * n_layers

    def test_tracked_tokens_are_the_union_of_each_positions_top_k(self, reference):
        data = reference["data"]
        for pos, tracked in enumerate(data.tracked):
            union = {token for layer in data.topk for token in layer[pos]}
            assert set(tracked) == union


class TestMatchesModel:
    """The last layer's lens is the model's own output distribution."""

    def test_final_layer_top_k_is_the_models_top_k(self, model, reference):
        expected = [
            decode_each(model, ids)
            for ids in reference["logits"].topk(3, dim=-1).indices
        ]
        assert reference["data"].topk[-1] == expected

    def test_final_layer_probabilities_are_the_models(self, model, reference):
        probs = reference["probs"]
        for pos, tracked in enumerate(reference["data"].tracked):
            top_id = int(probs[pos].argmax())
            final = tracked[model.tokenizer.decode(top_id)][-1]
            assert final == pytest.approx(probs[pos, top_id].item(), abs=1e-3)

    def test_final_layer_entropy_is_the_models(self, reference):
        probs = reference["probs"]
        expected = -(probs * probs.log()).nan_to_num().sum(dim=-1)
        assert reference["data"].entropy[-1] == pytest.approx(
            expected.tolist(), abs=1e-2
        )


class TestOptions:
    @pytest.mark.parametrize("top_k", [1, 7])
    def test_top_k_sets_the_number_of_tokens_per_cell(self, model, top_k):
        data = logit_lens(model, PROMPT, top_k=top_k)
        assert {len(cell) for layer in data.topk for cell in layer} == {top_k}

    def test_without_entropy_the_rest_of_the_payload_is_unchanged(
        self, model, reference
    ):
        """Entropy is computed in place over the probabilities, after the rest."""
        data = logit_lens(model, PROMPT, top_k=3, include_entropy=False)
        assert data.entropy is None
        assert data.model_dump(exclude={"entropy"}) == reference["data"].model_dump(
            exclude={"entropy"}
        )


class TestTool:
    def test_raw_returns_the_per_layer_logits_on_cpu(self, model, reference):
        raw = logit_lens._run(model, PROMPT, raw=True)
        n_pos = len(model.tokenizer.encode(PROMPT))

        assert isinstance(raw, torch.Tensor)
        assert raw.device.type == "cpu"
        assert raw.shape == (model.num_layers, n_pos, model.vocab_size)
        torch.testing.assert_close(
            raw[-1].float(), reference["logits"], atol=1e-3, rtol=1e-3
        )

    @pytest.mark.parametrize("positions", [None, [1, -1]], ids=["all", "selected"])
    def test_formatting_raw_output_gives_the_payload(self, model, positions):
        n_pos = len(model.tokenizer.encode(PROMPT))
        selected = None if positions is None else [p % n_pos for p in positions]
        raw = logit_lens._run(model, PROMPT, raw=True, positions=positions)
        raw = raw.to(model.lm_head.weight.device)

        assert logit_lens.format(
            raw, model, PROMPT, selected, top_k=3
        ) == logit_lens._run(model, PROMPT, top_k=3, positions=positions)


class TestPositions:
    """``positions`` projects only the selected rows, equal to the full run's."""

    @pytest.mark.parametrize(
        ("spec", "expected"),
        [
            (lambda n: -1, lambda n: [n - 1]),
            (lambda n: (1, 3), lambda n: [1, 2]),
            (lambda n: [3, 0, -2, 3], lambda n: sorted({0, 3, n - 2})),
            (lambda n: [(0, 2), (-1, n)], lambda n: [0, 1, n - 1]),
        ],
        ids=["negative", "range", "list", "ranges"],
    )
    def test_selected_rows_are_the_full_runs_rows(
        self, model, reference, spec, expected
    ):
        full = reference["data"]
        n_pos = len(full.input)
        spec, expected = spec(n_pos), expected(n_pos)
        data = logit_lens(model, PROMPT, top_k=3, positions=spec)

        assert data.positions == expected
        assert data.input == full.input
        assert data.tracked == [full.tracked[p] for p in expected]
        assert data.topk == [[layer[p] for p in expected] for layer in full.topk]
        assert data.entropy == [[layer[p] for p in expected] for layer in full.entropy]

    def test_raw_holds_only_the_selected_rows(self, model):
        """The raw tensor is the lens buffer, allocated at the selection's size."""
        full = logit_lens._run(model, PROMPT, raw=True)
        raw = logit_lens._run(model, PROMPT, raw=True, positions=[1, -1])

        assert raw.shape == (model.num_layers, 2, model.vocab_size)
        torch.testing.assert_close(raw, full[:, [1, -1]])

    @pytest.mark.parametrize(
        "spec",
        [
            lambda n: n,
            lambda n: -n - 1,
            lambda n: (n - 1, n + 1),
            lambda n: [0, n],
            lambda n: [],
            lambda n: (2, 2),
        ],
        ids=["past-end", "before-start", "range", "list", "empty-list", "empty-range"],
    )
    def test_bad_selection_raises_before_tracing(self, model, monkeypatch, spec):
        def no_trace(*args, **kwargs):
            raise AssertionError("traced despite an invalid selection")

        monkeypatch.setattr(model, "trace", no_trace)
        with pytest.raises(ValueError, match="positions="):
            logit_lens(
                model, PROMPT, positions=spec(len(model.tokenizer.encode(PROMPT)))
            )
