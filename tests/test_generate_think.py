"""Chat replies that think in ``<think>`` tags: their reasoning, apart from their text.

Uses real tokenizers (no weights) of the three ways models do it: Qwen3
writes both tags itself, DeepSeek-R1's template opens ``<think>`` in the
prompt, and Olmo Think opens it too with tags that are plain text rather than
tokens of their own. Reply ids are written out and read back as
``GenerationData``.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from nnsightful.tools.generate import GenerateTool
from nnsightful.types import GenerationData

QWEN3 = "Qwen/Qwen3-8B"
R1 = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
OLMO = "allenai/Olmo-3-7B-Think"


def stand_in(name: str) -> SimpleNamespace:
    """A model holding only `name`'s tokenizer and generation config."""
    transformers = pytest.importorskip("transformers")
    try:
        tokenizer = transformers.AutoTokenizer.from_pretrained(name)
    except Exception as e:  # offline, or the Hub is unreachable
        pytest.skip(f"Can't load {name}'s tokenizer: {e}")
    try:
        config = transformers.GenerationConfig.from_pretrained(name)
    except Exception:
        config = None
    return SimpleNamespace(
        tokenizer=tokenizer,
        pipeline=SimpleNamespace(model=SimpleNamespace(generation_config=config)),
    )


@pytest.fixture(scope="module")
def qwen3():
    return stand_in(QWEN3)


@pytest.fixture(scope="module")
def r1():
    return stand_in(R1)


@pytest.fixture(scope="module")
def olmo():
    return stand_in(OLMO)


def reply(model, completion: str, *, mode: str = "chat") -> GenerationData:
    """``completion`` generated after a one-turn prompt, cut at its stops."""
    tokenizer = model.tokenizer
    question = "What is 17 * 23?"
    if mode == "chat":
        prompt = GenerateTool.chat_input_ids(tokenizer, question)
    else:
        prompt = GenerateTool.completion_input_ids(tokenizer, question)
    new = tokenizer(completion, add_special_tokens=False)["input_ids"]
    return GenerationData.format(
        model,
        prompt + new,
        n_prompt=len(prompt),
        stop_ids=GenerateTool.stop_ids(model, mode),
        mode=mode,
    )


class TestModelThatOpensItsOwnThinking:
    def test_the_thinking_is_the_reasoning_and_the_rest_the_text(self, qwen3):
        data = reply(
            qwen3, "<think>\nCompute 17*23.\n</think>\n\n17 × 23 = 391.<|im_end|>"
        )
        assert (data.text, data.reasoning) == ("17 × 23 = 391.", "Compute 17*23.")
        assert data.finish_reason == "stop"

    def test_a_reply_cut_off_while_thinking_has_no_text_yet(self, qwen3):
        data = reply(qwen3, "<think>\nCompute 17")
        assert (data.text, data.reasoning) == ("", "Compute 17")
        assert data.finish_reason == "length"

    def test_an_empty_think_block_is_no_reasoning(self, qwen3):
        data = reply(qwen3, "<think>\n\n</think>\n\n391.<|im_end|>")
        assert (data.text, data.reasoning) == ("391.", None)

    def test_a_reply_that_doesnt_start_thinking_is_all_text(self, qwen3):
        data = reply(qwen3, "Close it with </think> after it.<|im_end|>")
        assert (data.text, data.reasoning) == ("Close it with </think> after it.", None)

    def test_a_completion_is_not_split(self, qwen3):
        data = reply(qwen3, " <think> is a tag", mode="completion")
        assert (data.text, data.reasoning) == (" <think> is a tag", None)


class TestTemplateThatOpensTheThinking:
    def test_the_prompt_opens_it(self, r1):
        prompt = GenerateTool.chat_input_ids(r1.tokenizer, "What is 17 * 23?")
        assert r1.tokenizer.decode(prompt).rstrip().endswith("<think>")

    def test_the_reply_before_the_close_is_the_reasoning(self, r1):
        eos = r1.tokenizer.eos_token
        data = reply(r1, f"Compute 17*23.\n</think>\n\n391.{eos}")
        assert (data.text, data.reasoning) == ("391.", "Compute 17*23.")
        assert data.finish_reason == "stop"

    def test_a_reply_cut_off_while_thinking_has_no_text_yet(self, r1):
        data = reply(r1, "Compute 17")
        assert (data.text, data.reasoning) == ("", "Compute 17")


class TestTagsWrittenAsText:
    def test_the_tags_are_not_tokens_of_their_own(self, olmo):
        assert "</think>" not in olmo.tokenizer.get_added_vocab()

    def test_the_reply_before_the_close_is_the_reasoning(self, olmo):
        eos = olmo.tokenizer.eos_token
        data = reply(olmo, f"Compute 17*23.</think>391.{eos}")
        assert (data.text, data.reasoning) == ("391.", "Compute 17*23.")


class TestThinkParts:
    @pytest.mark.parametrize(
        ("text", "opened", "parts"),
        [
            ("<think>a</think>b", False, ("b", "a")),
            ("  <think> a </think> b ", False, ("b", "a")),
            ("a</think>b", True, ("b", "a")),
            ("a", True, ("", "a")),
            ("a</think>b", False, ("a</think>b", None)),
            ("<think></think>b", False, ("b", None)),
            ("", True, ("", None)),
        ],
    )
    def test_parts(self, text, opened, parts):
        assert GenerationData.think_parts(text, opened) == parts
