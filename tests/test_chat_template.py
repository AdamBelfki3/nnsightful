"""The ``template`` option: a prompt sent as written, as a chat's first message, or as token ids."""

from __future__ import annotations

import pytest
import torch
from transformers import AutoTokenizer

from nnsightful import ChatTemplate, activation_patching, j_lens, logit_lens
from nnsightful.tools.chat import EncodedPrompt

from .helpers import decode_each, model_logits

PROMPT = "The capital of France is"
SRC_PROMPT = "The capital of France is"
TGT_PROMPT = "The capital of Japan is"

#: A small ChatML-like template: a system message the template writes itself,
#: the user's message trimmed, then the start of the model's turn.
TEMPLATE = (
    "<|system|>\nYou are a careful assistant.\n"
    "{% for message in messages %}"
    "<|{{ message['role'] }}|>\n{{ message['content'] | trim }}\n"
    "{% endfor %}"
    "{% if add_generation_prompt %}<|assistant|>\n{% endif %}"
)


@pytest.fixture(scope="module")
def tokenizer():
    """GPT-2's tokenizer with a chat template, which GPT-2's has none of."""
    tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
    tokenizer.chat_template = TEMPLATE
    return tokenizer


@pytest.fixture
def chat_model(model):
    """The shared model with a chat template on its tokenizer for one test."""
    before = model.tokenizer.chat_template
    model.tokenizer.chat_template = TEMPLATE
    yield model
    model.tokenizer.chat_template = before


def rendered_ids(tokenizer, prompt: str) -> list[int]:
    ids = tokenizer.apply_chat_template(
        [{"role": "user", "content": prompt}], add_generation_prompt=True
    )
    return list(ids["input_ids"] if hasattr(ids, "keys") else ids)


class TestEncode:
    def test_a_plain_prompt_is_tokenized_as_written(self, tokenizer):
        assert ChatTemplate.encode(tokenizer, PROMPT) == EncodedPrompt(
            tokenizer.encode(PROMPT), []
        )

    def test_token_ids_are_kept_as_they_are_whatever_the_template(self, tokenizer):
        ids = (3, 1, 4, 1, 5)
        for template in (ChatTemplate.PLAIN, ChatTemplate.CHAT):
            assert ChatTemplate.encode(tokenizer, ids, template) == EncodedPrompt(
                [3, 1, 4, 1, 5], []
            )

    def test_a_chat_prompt_is_the_templates_own_tokenization(self, tokenizer):
        encoded = ChatTemplate.encode(tokenizer, PROMPT, ChatTemplate.CHAT)
        assert encoded.ids == rendered_ids(tokenizer, PROMPT)

    def test_the_templates_positions_leave_exactly_the_prompt(self, tokenizer):
        encoded = ChatTemplate.encode(tokenizer, PROMPT, ChatTemplate.CHAT)
        own = [i for i in range(len(encoded.ids)) if i not in encoded.template]
        assert tokenizer.decode([encoded.ids[i] for i in own]) == PROMPT
        assert own == list(range(own[0], own[-1] + 1))
        assert encoded.template[0] == 0
        assert encoded.template[-1] == len(encoded.ids) - 1

    def test_a_message_the_template_trims_is_still_found(self, tokenizer):
        encoded = ChatTemplate.encode(tokenizer, f"  {PROMPT}\n", ChatTemplate.CHAT)
        own = [i for i in range(len(encoded.ids)) if i not in encoded.template]
        assert tokenizer.decode([encoded.ids[i] for i in own]) == PROMPT

    def test_a_prompt_the_template_also_writes_is_found_in_the_users_turn(self, tokenizer):
        """"You" opens the system message too; the user's is the later one."""
        encoded = ChatTemplate.encode(tokenizer, "You", ChatTemplate.CHAT)
        own = [i for i in range(len(encoded.ids)) if i not in encoded.template]
        assert [tokenizer.decode(encoded.ids[i]) for i in own] == ["You"]
        assert own[0] > encoded.ids.index(tokenizer.encode("You")[0])

    def test_a_template_with_a_start_token_gets_it_once(self, tokenizer):
        """The rendered text holds the start token; it is not added again."""
        tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
        tokenizer.chat_template = "{{ bos_token }}" + TEMPLATE
        encoded = ChatTemplate.encode(tokenizer, PROMPT, ChatTemplate.CHAT)
        assert encoded.ids.count(tokenizer.bos_token_id) == 1
        assert encoded.ids[0] == tokenizer.bos_token_id

    def test_chat_needs_a_template(self):
        tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
        assert not ChatTemplate.available(tokenizer)
        with pytest.raises(ValueError, match="has none"):
            ChatTemplate.encode(tokenizer, PROMPT, ChatTemplate.CHAT)


class TestOption:
    def test_it_is_offered_to_a_model_with_a_template_only(self, model, chat_model):
        for tool in (logit_lens, j_lens, activation_patching):
            assert ChatTemplate.OPTION in tool.options(chat_model)
        model.tokenizer.chat_template = None
        for tool in (logit_lens, j_lens, activation_patching):
            assert ChatTemplate.OPTION not in tool.options(model)

    def test_a_models_class_is_offered_it(self, model):
        for tool in (logit_lens, j_lens, activation_patching):
            assert ChatTemplate.OPTION in tool.options(type(model))

    def test_it_defaults_to_the_prompt_as_written(self):
        option = ChatTemplate.OPTION
        assert option.default == ChatTemplate.PLAIN
        assert option.values == (ChatTemplate.PLAIN, ChatTemplate.CHAT)
        assert all(choice.label and choice.description for choice in option.choices)

    def test_a_value_it_does_not_take_is_refused_before_any_run(self, model):
        with pytest.raises(ValueError, match="template='rendered'"):
            logit_lens(model, PROMPT, template="rendered")


class TestLogitLens:
    def test_a_plain_run_is_unchanged_and_marks_no_template(self, model):
        data = logit_lens(model, PROMPT, top_k=3)
        assert data.input == decode_each(model, model.tokenizer.encode(PROMPT))
        assert data.template is None

    def test_a_chat_run_reads_the_templated_prompt(self, chat_model):
        encoded = ChatTemplate.encode(chat_model.tokenizer, PROMPT, ChatTemplate.CHAT)
        data = logit_lens(chat_model, PROMPT, template="chat", top_k=3)

        assert data.input == decode_each(chat_model, encoded.ids)
        assert data.template == encoded.template
        assert data.positions == list(range(len(encoded.ids)))

    def test_a_chat_runs_last_row_is_the_models_answer_to_the_template(self, chat_model):
        ids = rendered_ids(chat_model.tokenizer, PROMPT)
        own = model_logits(chat_model, ids)
        lens = logit_lens(chat_model, PROMPT, template="chat", raw=True)
        assert torch.allclose(lens[-1, -1].float(), own[-1], atol=1e-3)

    def test_token_ids_run_as_the_same_prompt_does(self, model):
        ids = model.tokenizer.encode(PROMPT)
        by_text = logit_lens(model, PROMPT, top_k=3)
        by_ids = logit_lens(model, ids, top_k=3)
        assert by_ids.model_dump() == by_text.model_dump()

    def test_positions_count_the_templates_tokens(self, chat_model):
        encoded = ChatTemplate.encode(chat_model.tokenizer, PROMPT, ChatTemplate.CHAT)
        data = logit_lens(chat_model, PROMPT, template="chat", positions=-1, top_k=2)
        assert data.positions == [len(encoded.ids) - 1]
        with pytest.raises(ValueError, match="outside the prompt"):
            logit_lens(chat_model, PROMPT, template="chat", positions=len(encoded.ids))

    def test_formatting_raw_logits_takes_the_ids_and_the_template(self, chat_model):
        encoded = ChatTemplate.encode(chat_model.tokenizer, PROMPT, ChatTemplate.CHAT)
        data = logit_lens(chat_model, PROMPT, template="chat", top_k=3)
        raw = logit_lens(chat_model, PROMPT, template="chat", raw=True)
        again = type(data).format(
            raw.to(chat_model.lm_head.weight.device),
            chat_model,
            encoded.ids,
            top_k=3,
            template=encoded.template,
        )
        assert again.input == data.input
        assert again.template == data.template
        assert again.topk == data.topk


class TestActivationPatching:
    @staticmethod
    def logits(model, src, tgt, **kwargs) -> torch.Tensor:
        raw = activation_patching(model, src, tgt, [2], [2], [], raw=True, **kwargs)
        return torch.stack([row.float().cpu() for row in raw["patched_logits"]])

    def test_token_ids_run_as_the_same_prompts_do(self, model):
        encode = model.tokenizer.encode
        by_text = self.logits(model, SRC_PROMPT, TGT_PROMPT)
        by_ids = self.logits(model, encode(SRC_PROMPT), encode(TGT_PROMPT))
        assert torch.allclose(by_ids, by_text, atol=1e-4)

    def test_a_chat_run_patches_the_templated_prompts(self, chat_model):
        src = rendered_ids(chat_model.tokenizer, SRC_PROMPT)
        tgt = rendered_ids(chat_model.tokenizer, TGT_PROMPT)
        by_template = self.logits(chat_model, SRC_PROMPT, TGT_PROMPT, template="chat")
        by_ids = self.logits(chat_model, src, tgt)
        assert torch.allclose(by_template, by_ids, atol=1e-4)

    def test_the_template_moves_the_positions_and_the_result(self, chat_model):
        plain = self.logits(chat_model, SRC_PROMPT, TGT_PROMPT)
        chat = self.logits(chat_model, SRC_PROMPT, TGT_PROMPT, template="chat")
        assert not torch.allclose(plain, chat, atol=1e-3)


class TestJLens:
    @staticmethod
    def identity(model) -> dict[int, torch.Tensor]:
        """Jacobians that leave every layer's state as it is."""
        width = model.lm_head.weight.shape[1]
        return {layer: torch.eye(width) for layer in range(model.num_layers - 1)}

    def test_a_chat_run_reads_the_templated_prompt_then_the_reply(self, chat_model):
        encoded = ChatTemplate.encode(chat_model.tokenizer, PROMPT, ChatTemplate.CHAT)
        data = j_lens(
            chat_model,
            PROMPT,
            template="chat",
            jacobians=self.identity(chat_model),
            max_new_tokens=2,
            top_k=2,
        )

        assert data.input == decode_each(chat_model, encoded.ids)
        assert data.template == encoded.template
        assert len(data.completion) == 1

    def test_a_plain_run_marks_no_template(self, model):
        data = j_lens(model, PROMPT, jacobians=self.identity(model), top_k=2)
        assert data.input == decode_each(model, model.tokenizer.encode(PROMPT))
        assert data.template is None


class TestWhereTheReplyStarts:
    """A chat prompt ends where the reply's text begins, past what the model would write first."""

    @staticmethod
    def tokenizer(template: str):
        tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
        tokenizer.chat_template = template
        return tokenizer

    #: Like Inkling's: no generation prompt, the model writes its own turn marker.
    NO_GENERATION_PROMPT = (
        "{% for message in messages %}"
        "{% if message['role'] == 'user' %}<|user|>{{ message['content'] }}<|end|>"
        "{% else %}<|model|><|text|>{{ message['content'] }}<|end|>{% endif %}"
        "{% endfor %}"
    )
    #: Like gpt-oss's: the generation prompt stops before the channel a reply goes in.
    CHANNELS = (
        "{% for message in messages %}"
        "{% if message['role'] == 'user' %}<|start|>user<|message|>{{ message['content'] }}<|end|>"
        "{% else %}<|start|>assistant<|channel|>final<|message|>{{ message['content'] }}<|end|>{% endif %}"
        "{% endfor %}"
        "{% if add_generation_prompt %}<|start|>assistant{% endif %}"
    )

    def test_a_generation_prompt_that_reaches_the_reply_is_kept_as_it_is(self, tokenizer):
        assert ChatTemplate.render(tokenizer, PROMPT) == tokenizer.apply_chat_template(
            [{"role": "user", "content": PROMPT}], tokenize=False, add_generation_prompt=True
        )

    def test_a_template_without_a_generation_prompt_gets_the_models_turn(self):
        tokenizer = self.tokenizer(self.NO_GENERATION_PROMPT)
        assert ChatTemplate.render(tokenizer, PROMPT) == f"<|user|>{PROMPT}<|end|><|model|><|text|>"

    def test_a_reply_that_opens_past_the_generation_prompt_is_opened(self):
        tokenizer = self.tokenizer(self.CHANNELS)
        assert ChatTemplate.render(tokenizer, PROMPT) == (
            f"<|start|>user<|message|>{PROMPT}<|end|>"
            "<|start|>assistant<|channel|>final<|message|>"
        )

    def test_the_opening_counts_as_the_templates(self):
        tokenizer = self.tokenizer(self.NO_GENERATION_PROMPT)
        encoded = ChatTemplate.encode(tokenizer, PROMPT, ChatTemplate.CHAT)
        own = [i for i in range(len(encoded.ids)) if i not in encoded.template]
        assert tokenizer.decode([encoded.ids[i] for i in own]) == PROMPT
        assert tokenizer.decode(encoded.ids[own[-1] + 1 :]) == "<|end|><|model|><|text|>"

    def test_a_prompt_holding_the_stand_in_reply_is_cut_at_the_real_one(self):
        tokenizer = self.tokenizer(self.NO_GENERATION_PROMPT)
        prompt = f"Say {ChatTemplate.REPLY} twice"
        assert ChatTemplate.render(tokenizer, prompt) == f"<|user|>{prompt}<|end|><|model|><|text|>"

    def test_a_template_that_cannot_render_a_reply_keeps_its_generation_prompt(self):
        refuses = (
            "{% for message in messages %}"
            "{% if message['role'] != 'user' %}{{ raise_exception('user turns only') }}{% endif %}"
            "<|user|>{{ message['content'] }}"
            "{% endfor %}"
            "{% if add_generation_prompt %}<|model|>{% endif %}"
        )
        tokenizer = self.tokenizer(refuses)
        assert ChatTemplate.render(tokenizer, PROMPT) == f"<|user|>{PROMPT}<|model|>"

    def test_a_template_that_rewrites_the_turns_before_a_reply_keeps_its_generation_prompt(self):
        rewrites = (
            "{% if messages | length > 1 %}<|history|>{% endif %}"
            "{% for message in messages %}<|{{ message['role'] }}|>{{ message['content'] }}{% endfor %}"
            "{% if add_generation_prompt %}<|assistant|>{% endif %}"
        )
        tokenizer = self.tokenizer(rewrites)
        assert ChatTemplate.render(tokenizer, PROMPT) == f"<|user|>{PROMPT}<|assistant|>"
