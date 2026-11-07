"""Generation on a local model: completion and chat prompts, stops, options."""

from __future__ import annotations

import pytest

from nnsightful.tools.generate import GenerateTool, generate
from nnsightful.types import GenerationData

from .helpers import decode_each, model_logits

PROMPT = "The capital of France is"

ROLE_TEMPLATE = (
    "{% for m in messages %}{{ m['role'] }}: {{ m['content'] }}\n{% endfor %}"
    "{% if add_generation_prompt %}assistant:{% endif %}"
)
NO_SYSTEM_TEMPLATE = (
    "{% if messages[0]['role'] == 'system' %}"
    "{{ raise_exception('System role not supported') }}{% endif %}" + ROLE_TEMPLATE
)


@pytest.fixture(scope="module")
def greedy(model):
    """A greedy 8-token completion of ``PROMPT``."""
    return generate(model, PROMPT, mode="completion", max_new_tokens=8, temperature=0)


@pytest.fixture
def template(model, monkeypatch):
    """Give the tokenizer a chat template for the test (gpt2 has none)."""

    def use(chat_template: str) -> None:
        monkeypatch.setattr(model.tokenizer, "chat_template", chat_template)

    return use


@pytest.fixture
def no_generate(model, monkeypatch):
    """Fail the test if anything reaches ``model.generate``."""

    def refuse(*args, **kwargs):
        raise AssertionError("model.generate was called")

    monkeypatch.setattr(model, "generate", refuse)


class TestCompletion:
    def test_the_prompt_is_the_text_tokenized_with_special_tokens(self, model, greedy):
        assert greedy.input_ids == model.tokenizer(PROMPT)["input_ids"]

    def test_greedy_starts_with_the_models_own_top_token(self, model, greedy):
        top = int(model_logits(model, PROMPT)[-1].argmax())
        assert greedy.completion_ids[0] == top

    def test_without_a_stop_it_runs_to_max_new_tokens(self, model, greedy):
        assert greedy.finish_reason == "length"
        assert len(greedy.completion_ids) == 8
        assert greedy.completion == decode_each(model, greedy.completion_ids)

    def test_text_continues_the_prompt(self, model, greedy):
        whole = model.tokenizer.decode(greedy.input_ids + greedy.completion_ids)
        assert PROMPT + greedy.text == whole

    def test_messages_are_one_document(self, model):
        parts = [
            {"role": "user", "content": "The capital of"},
            {"role": "assistant", "content": " France is"},
        ]
        data = generate(
            model, parts, mode="completion", max_new_tokens=1, temperature=0
        )
        assert data.input_ids == model.tokenizer(PROMPT)["input_ids"]

    def test_a_stop_token_cuts_the_completion(self, model, greedy):
        stop = greedy.completion_ids[2]
        data = generate(
            model,
            PROMPT,
            mode="completion",
            max_new_tokens=8,
            temperature=0,
            stop_token_ids=[stop],
        )
        assert data.finish_reason == "stop"
        assert data.completion_ids == greedy.completion_ids[:2]


class TestChat:
    def test_the_template_renders_the_prompt_without_extra_special_tokens(
        self, model, template
    ):
        template(ROLE_TEMPLATE)
        data = generate(
            model,
            [{"role": "user", "content": "  Hello there "}],
            max_new_tokens=2,
            temperature=0,
        )
        rendered = "user: Hello there\nassistant:"
        assert (
            data.input_ids
            == model.tokenizer(rendered, add_special_tokens=False)["input_ids"]
        )
        assert data.text == data.text.strip()

    def test_a_string_is_one_user_turn(self, model, template):
        template(ROLE_TEMPLATE)
        ids = GenerateTool.chat_input_ids(model.tokenizer, "Hi")
        assert model.tokenizer.decode(ids) == "user: Hi\nassistant:"

    def test_a_template_without_a_system_role_gets_it_folded(self, model, template):
        template(NO_SYSTEM_TEMPLATE)
        ids = GenerateTool.chat_input_ids(
            model.tokenizer,
            [
                {"role": "system", "content": "Be brief."},
                {"role": "user", "content": "Hi"},
            ],
        )
        assert model.tokenizer.decode(ids) == "user: Be brief.\n\nHi\nassistant:"

    def test_the_eos_token_stops_a_chat(self, model):
        assert model.tokenizer.eos_token_id in GenerateTool.stop_ids(model, "chat")


class TestRaw:
    def test_format_of_the_raw_run_is_the_payload(self, model, greedy):
        raw = generate(
            model, PROMPT, mode="completion", max_new_tokens=8, temperature=0, raw=True
        )
        data = generate.format(
            model,
            raw["token_ids"],
            n_prompt=len(greedy.input_ids),
            stop_ids=GenerateTool.stop_ids(model, "completion"),
            mode="completion",
        )
        assert isinstance(data, GenerationData)
        assert data == greedy


class TestBadInput:
    """Each fails before anything is generated."""

    def test_chat_mode_needs_a_chat_template(self, model, no_generate):
        assert model.tokenizer.chat_template is None
        with pytest.raises(ValueError, match="no chat template"):
            generate(model, [{"role": "user", "content": "Hi"}])

    @pytest.mark.parametrize(
        "kwargs, match",
        [
            (dict(mode="instruct"), "expected one of chat, completion"),
            (dict(mode="completion", max_new_tokens=0), "at least 1"),
            (dict(mode="completion", temperature=-0.1), "0 \\(greedy\\) or more"),
        ],
        ids=["mode", "max_new_tokens", "temperature"],
    )
    def test_bad_options_raise(self, model, no_generate, kwargs, match):
        with pytest.raises(ValueError, match=match):
            generate(model, PROMPT, **kwargs)

    def test_an_empty_document_raises(self, model, no_generate):
        with pytest.raises(ValueError, match="no text to continue"):
            generate(model, "", mode="completion")

    def test_a_rejected_conversation_raises(self, model, template, no_generate):
        template("{{ raise_exception('Roles must alternate') }}")
        with pytest.raises(ValueError, match="Roles must alternate"):
            generate(model, [{"role": "user", "content": "Hi"}])
