"""gpt-oss's chat format ("harmony"): a reply's channels, and where it stops.

Uses gpt-oss's own tokenizer (no weights): the reply token ids are written
out in the format and read back as ``GenerationData``.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from nnsightful.tools.generate import GenerateTool
from nnsightful.types import GenerationData

GPT_OSS = "openai/gpt-oss-20b"


@pytest.fixture(scope="module")
def oss():
    """A stand-in model holding gpt-oss's tokenizer and generation config."""
    transformers = pytest.importorskip("transformers")
    try:
        tokenizer = transformers.AutoTokenizer.from_pretrained(GPT_OSS)
        config = transformers.GenerationConfig.from_pretrained(GPT_OSS)
    except Exception as e:  # offline, or the Hub is unreachable
        pytest.skip(f"Can't load {GPT_OSS}'s tokenizer: {e}")
    return SimpleNamespace(
        tokenizer=tokenizer,
        pipeline=SimpleNamespace(model=SimpleNamespace(generation_config=config)),
    )


def reply(oss, completion: str, *, mode: str = "chat") -> GenerationData:
    """``completion`` generated after a one-turn chat prompt, cut at its stops."""
    tokenizer = oss.tokenizer
    prompt = GenerateTool.chat_input_ids(tokenizer, "What is the capital of France?")
    new = tokenizer(completion, add_special_tokens=False)["input_ids"]
    return GenerationData.format(
        oss,
        prompt + new,
        n_prompt=len(prompt),
        stop_ids=GenerateTool.stop_ids(oss, mode),
        mode=mode,
    )


ANALYSIS = (
    "<|channel|>analysis<|message|>The user asks for France's capital: Paris.<|end|>"
)
FINAL = (
    "<|start|>assistant<|channel|>final<|message|>"
    "The capital of France is Paris.<|return|>"
)


class TestHarmony:
    def test_a_reply_runs_past_its_reasoning_to_its_answer(self, oss):
        ids = oss.tokenizer
        stops = GenerateTool.stop_ids(oss, "chat")
        assert ids.convert_tokens_to_ids("<|end|>") not in stops
        assert ids.convert_tokens_to_ids("<|return|>") in stops

    def test_the_analysis_is_the_reasoning_and_the_final_message_the_text(self, oss):
        data = reply(oss, ANALYSIS + FINAL)
        assert data.text == "The capital of France is Paris."
        assert data.reasoning == "The user asks for France's capital: Paris."
        assert data.finish_reason == "stop"
        assert (
            oss.tokenizer.convert_tokens_to_ids("<|return|>") not in data.completion_ids
        )

    def test_a_reply_cut_off_while_reasoning_has_no_text_yet(self, oss):
        data = reply(oss, "<|channel|>analysis<|message|>The user asks for")
        assert data.text == ""
        assert data.reasoning == "The user asks for"
        assert data.finish_reason == "length"

    def test_a_reply_without_reasoning_is_its_text(self, oss):
        data = reply(oss, "<|channel|>final<|message|>Paris.<|return|>")
        assert (data.text, data.reasoning) == ("Paris.", None)

    def test_a_header_cut_off_before_its_message_is_left_out(self, oss):
        data = reply(oss, ANALYSIS + "<|start|>assistant<|channel|>fin")
        assert (data.text, data.reasoning) == (
            "",
            "The user asks for France's capital: Paris.",
        )

    def test_a_completion_is_not_split(self, oss):
        data = reply(oss, " Paris, a city of", mode="completion")
        assert (data.text, data.reasoning) == (" Paris, a city of", None)
