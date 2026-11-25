"""The looped tools on a small random looped model: its visits, the lens, patching.

The model is built from a small ``Inkling2LoopConfig`` with random weights, so
the tests run on the CPU and check the tools against the model's own forward
rather than against known answers. They are skipped where ``transformers``
does not have the architecture yet.
"""

from __future__ import annotations

import pytest
import torch
from nnsight import TransformersModel

from nnsightful import ExecMode, LoopedTransformer
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.logit_lens import logit_lens
from nnsightful.tools.looped import (
    LoopedActivationPatchingTool,
    LoopedLogitLensTool,
)

from .helpers import decode_each, model_logits

PROMPT = "The capital of France is"
SRC_PROMPT = "The Eiffel Tower is in Paris. The Eiffel Tower is in"
TGT_PROMPT = "The Colosseum is in Rome. The Colosseum is in"

# Two layers ahead of the loop, four in it (run three times), two after it.
VISITS = [
    *[(0, 0), (1, 0)],
    *[(2, 0), (3, 0), (4, 0), (5, 0)],
    *[(2, 1), (3, 1), (4, 1), (5, 1)],
    *[(2, 2), (3, 2), (4, 2), (5, 2)],
    *[(6, 0), (7, 0)],
]


@pytest.fixture(scope="module")
def looped():
    """A small random looped model, loaded as a text model with GPT-2's tokenizer."""
    try:
        from transformers import (
            AutoTokenizer,
            Inkling2LoopConfig,
            Inkling2LoopForConditionalGeneration,
        )
    except ImportError:
        pytest.skip("this transformers has no looped Inkling 2 model")

    tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
    sizes = dict(
        hidden_size=32,
        head_dim=8,
        num_attention_heads=2,
        num_key_value_heads=1,
        swa_head_dim=8,
        swa_num_attention_heads=2,
        swa_num_key_value_heads=1,
        d_rel=4,
        moe_intermediate_size=16,
        n_routed_experts=4,
        num_experts_per_tok=2,
        loop_gate_rank=4,
    )
    config = Inkling2LoopConfig(
        text_config=dict(
            **sizes,
            vocab_size=len(tokenizer),
            unpadded_vocab_size=len(tokenizer),
            eos_token_id=tokenizer.eos_token_id,
            num_hidden_layers=8,
            n_layers_per_attn_res_block=2,
            loop_layer_index_start=2,
            loop_layer_index_end=6,
            loop_num_passes=3,
            layer_types=["hybrid_sliding", "hybrid"] * 4,
        ),
        vision_config=dict(
            model_type="inkling2_vision",
            text_hidden_size=32,
            hidden_size=16,
            intermediate_size=16,
            num_hidden_layers=1,
            num_attention_heads=2,
        ),
        image_token_id=0,
    )

    torch.manual_seed(0)
    module = Inkling2LoopForConditionalGeneration(config).eval()
    with torch.no_grad():
        # The block-mixing and message queries start at zero, which would make
        # every mixture uniform whatever it is handed.
        for param in module.parameters():
            if not param.any():
                param.normal_(std=0.5)

    return LoopedTransformer(module, task="text-generation", tokenizer=tokenizer)


def everywhere(model, prompt: str) -> list[int]:
    return list(range(len(model.tokenizer.encode(prompt))))


def patched_logits(model, src_pos, tgt_pos, tgt_freeze, **kwargs) -> torch.Tensor:
    """The ``[visit, vocab]`` last-position logits of each patched run."""
    raw = activation_patching(
        model, SRC_PROMPT, TGT_PROMPT, src_pos, tgt_pos, tgt_freeze, raw=True, **kwargs
    )
    return torch.stack([logits.float().cpu() for logits in raw["patched_logits"]])


class TestModel:
    def test_visits_follow_the_forward(self, looped):
        assert looped.visits == VISITS
        assert looped.num_layers == len(VISITS)

    def test_vocab_size_is_the_heads(self, looped):
        assert looped.vocab_size == len(looped.tokenizer)

    def test_restart_visits_are_the_later_pass_ends(self, looped):
        """Passes 2 and 3 restart after visits 5 and 9, once the loop has begun."""
        expected = {0: [], 1: [5, 9], 4: [5, 9], 5: [9], 8: [9], 9: [], 13: [], 15: []}
        assert {v: looped.restart_visits(v) for v in expected} == expected

    def test_sections_are_the_prelude_the_passes_and_the_coda(self, looped):
        """Each pass covers two blocks of two layers, the second marked by a divider."""
        sections = [(s.label, s.start, s.end, s.dividers) for s in looped.sections]
        assert sections == [
            ("prelude", 0, 1, []),
            ("pass 1", 2, 5, [4]),
            ("pass 2", 6, 9, [8]),
            ("pass 3", 10, 13, [12]),
            ("coda", 14, 15, []),
        ]

    def test_supports_reads_the_model_type(self, looped):
        assert LoopedTransformer.supports(looped.config)
        assert not LoopedTransformer.supports(looped.config.text_config)

    def test_remote_key_names_the_deployed_class(self, looped):
        assert looped._remoteable_class() is TransformersModel

    def test_tools_resolve_to_their_looped_implementation(self, looped):
        assert isinstance(logit_lens._for_model(looped), LoopedLogitLensTool)
        assert isinstance(
            activation_patching._for_model(looped), LoopedActivationPatchingTool
        )

    def test_tools_stay_themselves_on_other_models(self):
        assert logit_lens._for_model(object()) is logit_lens


class TestLogitLens:
    def test_payload_has_a_row_per_visit(self, looped):
        data = logit_lens(looped, PROMPT, top_k=3)
        tokens = decode_each(looped, looped.tokenizer.encode(PROMPT))

        assert data.layers == list(range(len(VISITS)))
        assert data.input == tokens
        assert [len(row) for row in data.topk] == [len(tokens)] * len(VISITS)
        assert all(len(cell) == 3 for row in data.topk for cell in row)

    def test_last_visit_is_the_models_own_logits(self, looped):
        raw = logit_lens(looped, PROMPT, raw=True)
        assert raw.shape[0] == len(VISITS)
        assert torch.allclose(raw[-1], model_logits(looped, PROMPT), atol=1e-5)

    def test_visits_differ(self, looped):
        """A lens that read one tensor at every visit would repeat itself."""
        raw = logit_lens(looped, PROMPT, raw=True)
        assert all(not torch.allclose(raw[v], raw[-1]) for v in range(len(VISITS) - 1))

    def test_positions_select_rows_of_the_full_run(self, looped):
        full = logit_lens(looped, PROMPT, raw=True)
        some = logit_lens(looped, PROMPT, positions=[0, -1], raw=True)
        assert torch.allclose(some, full[:, [0, -1]], atol=1e-5)


class TestActivationPatching:
    @pytest.fixture(scope="class")
    def references(self, looped):
        src = model_logits(looped, SRC_PROMPT)[-1]
        tgt = model_logits(looped, TGT_PROMPT)[-1]
        assert not torch.allclose(src, tgt, atol=1e-3)
        return {"src": src, "tgt": tgt}

    def test_payload_has_a_point_per_visit(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        data = activation_patching(looped, SRC_PROMPT, TGT_PROMPT, [last], [last], [])
        assert all(len(line) == len(VISITS) for line in data.lines)
        assert len(data.tokenLabels) == len(data.lines)

    def test_payload_carries_the_models_sections(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        data = activation_patching(looped, SRC_PROMPT, TGT_PROMPT, [last], [last], [])
        raw = activation_patching(looped, SRC_PROMPT, TGT_PROMPT, [last], [last], [], raw=True)
        assert data.sections == looped.sections
        assert activation_patching.format(**raw).sections == looped.sections

    @pytest.mark.parametrize("batch_size", [1, 5])
    def test_patching_every_position_gives_the_source_run(
        self, looped, references, batch_size
    ):
        """The state patched at a visit is all the rest of the run reads."""
        positions = everywhere(looped, TGT_PROMPT)
        patched = patched_logits(
            looped, positions, positions, [], batch_size=batch_size
        )
        assert torch.allclose(patched, references["src"].expand_as(patched), atol=1e-4)

    def test_freezing_every_position_gives_the_clean_run(self, looped, references):
        positions = everywhere(looped, TGT_PROMPT)
        patched = patched_logits(looped, positions[:1], positions[:1], positions)
        assert torch.allclose(
            patched[:-1], references["tgt"].expand_as(patched[:-1]), atol=1e-4
        )

    def test_patching_the_last_position_at_the_last_visit_gives_the_source_logits(
        self, looped, references
    ):
        last = everywhere(looped, TGT_PROMPT)[-1]
        patched = patched_logits(looped, [last], [last], [])
        assert torch.allclose(patched[-1], references["src"], atol=1e-4)
        assert not torch.allclose(patched[0], references["src"], atol=1e-3)

    def test_a_source_range_is_averaged(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        one = patched_logits(looped, [last], [last], [])
        same = patched_logits(looped, [[last, last + 1]], [last], [])
        mean = patched_logits(looped, [[last - 2, last + 1]], [last], [])
        assert torch.allclose(same, one, atol=1e-5)
        assert not torch.allclose(mean, one, atol=1e-3)

    def test_state_is_the_default_patch(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        default = patched_logits(looped, [last], [last], [])
        state = patched_logits(looped, [last], [last], [], patch="state")
        assert torch.equal(default, state)

    def test_an_unknown_patch_is_refused(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        with pytest.raises(ValueError, match="patch='layer'"):
            activation_patching(
                looped, SRC_PROMPT, TGT_PROMPT, [last], [last], [], patch="layer"
            )


class TestOutputPatching:
    """``patch="output"``: only what the visit's layer returns is replaced."""

    @staticmethod
    def by_hand(model, visit: int, pos: int) -> torch.Tensor:
        """The target run's last logits with one visit's layer output overwritten."""
        layer_idx, pass_idx = VISITS[visit]
        layer = model.decoder.layers[layer_idx]
        with torch.no_grad():
            with model.trace(SRC_PROMPT) as tracer:
                for _ in tracer.iter[pass_idx]:
                    source = layer.output[0, pos].save()
            with model.trace(TGT_PROMPT) as tracer:
                for _ in tracer.iter[pass_idx]:
                    layer.output[0, pos] = source
                logits = model.logits[0, -1].save()
        return logits.float().cpu()

    def test_it_overwrites_the_layer_output_and_nothing_else(self, looped):
        last = everywhere(looped, TGT_PROMPT)[-1]
        patched = patched_logits(looped, [last], [last], [], patch="output", batch_size=1)
        assert patched.shape[0] == len(VISITS)
        for visit in range(len(VISITS)):
            by_hand = self.by_hand(looped, visit, last)
            assert torch.allclose(patched[visit], by_hand, atol=1e-5), visit

    def test_it_leaves_the_completed_blocks_to_the_target(self, looped):
        """Unlike the state patch, every position patched is not the source run."""
        positions = everywhere(looped, TGT_PROMPT)
        output = patched_logits(looped, positions, positions, [], patch="output")
        state = patched_logits(looped, positions, positions, [], patch="state")
        assert not torch.allclose(output, state, atol=1e-3)

    def test_freezing_every_position_gives_the_clean_run(self, looped):
        positions = everywhere(looped, TGT_PROMPT)
        clean = model_logits(looped, TGT_PROMPT)[-1]
        patched = patched_logits(
            looped, positions[:1], positions[:1], positions, patch="output"
        )
        assert torch.allclose(patched[:-1], clean.expand_as(patched[:-1]), atol=1e-4)


@pytest.mark.remote
class TestRemote:
    """Inkling 2 Mini on NDIF; needs the checkpoint's processor (torchvision)."""

    @pytest.fixture(scope="class")
    def hosted(self):
        try:
            return LoopedTransformer("thinkingmachines/Inkling-2-Mini")
        except Exception as exc:
            pytest.skip(f"Cannot load Inkling 2 Mini: {exc}")

    def test_lens_ends_on_the_models_prediction(self, hosted):
        data = logit_lens(hosted, PROMPT, top_k=1, exec_mode=ExecMode.REMOTE)
        with hosted.trace(PROMPT, remote=True):
            prediction = hosted.logits[0, -1].argmax(dim=-1).save()

        assert len(data.layers) == hosted.num_layers
        assert data.topk[-1][-1] == [hosted.tokenizer.decode(int(prediction))]

    @pytest.mark.parametrize("patch", LoopedActivationPatchingTool.PATCHES)
    def test_patching_runs_a_point_per_visit(self, hosted, patch):
        last = everywhere(hosted, TGT_PROMPT)[-1]
        data = activation_patching(
            hosted,
            SRC_PROMPT,
            TGT_PROMPT,
            [last],
            [last],
            [],
            patch=patch,
            exec_mode=ExecMode.REMOTE,
        )
        assert all(len(line) == hosted.num_layers for line in data.lines)
        assert data.sections == hosted.sections
