"""J-lens: the lens registry (no model) and runs on a local model."""

from __future__ import annotations

import pytest
import torch

from nnsightful.tools import j_lens as j_lens_module
from nnsightful.tools.j_lens import JLensTool, j_lens
from nnsightful.tools.logit_lens import logit_lens

from .helpers import decode_each

PROMPT = "The capital of France is"
REPO = JLensTool.NEURON_JLENS_REPO


class FakeHfApi:
    """Stands in for ``huggingface_hub.HfApi``; counts listings of the lens repo."""

    FILES = [
        "gpt2_jacobian_lens.pt",
        "llama/Llama-3.1-8B_jacobian_lens.pt",
        "README.md",
    ]
    calls = 0

    def list_repo_files(self, repo_id):
        assert repo_id == REPO
        FakeHfApi.calls += 1
        return self.FILES


@pytest.fixture
def fake_hub(monkeypatch):
    FakeHfApi.calls = 0
    monkeypatch.setattr(j_lens_module, "HfApi", FakeHfApi)
    monkeypatch.setattr(JLensTool, "_jacobian_lenses_cache", {})
    return FakeHfApi


class TestLensRegistry:
    def test_lens_files_are_keyed_by_model_name(self, fake_hub):
        assert JLensTool.get_available_lenses() == {
            "gpt2": (REPO, "gpt2_jacobian_lens.pt"),
            "Llama-3.1-8B": (REPO, "llama/Llama-3.1-8B_jacobian_lens.pt"),
        }

    def test_registry_is_fetched_once(self, fake_hub):
        JLensTool.get_available_lenses()
        JLensTool.get_lens_config("openai-community/gpt2")
        assert fake_hub.calls == 1

    def test_lookup_ignores_the_org(self, fake_hub):
        assert JLensTool.get_lens_config("meta-llama/Llama-3.1-8B") == (
            REPO,
            "llama/Llama-3.1-8B_jacobian_lens.pt",
        )

    def test_model_without_a_lens_raises(self, fake_hub):
        with pytest.raises(ValueError, match="No Jacobian lens found"):
            JLensTool.get_lens_config("org/no-such-model")


@pytest.fixture(scope="module")
def has_lens(model):
    try:
        JLensTool.get_lens_config(model.repo_id)
    except ValueError:
        pytest.skip(f"no Jacobian lens for {model.repo_id}")


class TestJacobians:
    def test_identity_jacobians_reduce_to_the_logit_lens(self, model, monkeypatch):
        """Preloaded Jacobians are used as given, without looking up a lens."""

        def no_lookup(repo_id):
            raise AssertionError("looked up a lens despite preloaded jacobians")

        monkeypatch.setattr(JLensTool, "get_lens_config", no_lookup)
        identity = {
            layer: torch.eye(model.hidden_size) for layer in range(model.num_layers)
        }
        lens = j_lens(model, PROMPT, jacobians=identity, top_k=3)
        reference = logit_lens(model, PROMPT, top_k=3)

        assert lens.topk == reference.topk
        assert lens.tracked == reference.tracked

    def test_final_layer_is_the_logit_lens(self, model, has_lens):
        """The last layer has no Jacobian, so it reads the model's own output."""
        lens = j_lens(model, PROMPT, top_k=3)
        reference = logit_lens(model, PROMPT, top_k=3)

        assert lens.topk[-1] == reference.topk[-1]
        assert lens.topk[:-1] != reference.topk[:-1]


class TestGeneration:
    """Each decode step adds the newly generated position to the lens."""

    MAX_NEW_TOKENS = 3

    def test_positions_span_the_prompt_and_the_generated_tokens(self, model, has_lens):
        prompt_ids = model.tokenizer.encode(PROMPT)
        with (
            torch.no_grad(),
            model.generate(
                PROMPT,
                max_new_tokens=self.MAX_NEW_TOKENS,
                min_new_tokens=self.MAX_NEW_TOKENS,
            ) as tracer,
        ):
            output = tracer.result.save()
        generated = decode_each(model, output[0][len(prompt_ids) :])

        data = j_lens(model, PROMPT, max_new_tokens=self.MAX_NEW_TOKENS, top_k=3)
        n_pos = len(prompt_ids) + self.MAX_NEW_TOKENS - 1

        assert data.input == decode_each(model, prompt_ids)
        assert data.completion == generated[:-1]
        assert data.positions is None
        assert [len(layer) for layer in data.topk] == [n_pos] * model.num_layers
        assert len(data.tracked) == n_pos
        assert [len(layer) for layer in data.entropy] == [n_pos] * model.num_layers

    def test_raw_concatenates_the_steps(self, model, has_lens):
        raw = j_lens._run(model, PROMPT, max_new_tokens=self.MAX_NEW_TOKENS, raw=True)
        n_pos = len(model.tokenizer.encode(PROMPT)) + self.MAX_NEW_TOKENS - 1

        assert raw.device.type == "cpu"
        assert raw.shape == (model.num_layers, n_pos, model.vocab_size)
