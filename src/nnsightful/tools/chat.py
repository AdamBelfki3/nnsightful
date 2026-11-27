from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any, NamedTuple

from ..types import ToolChoice, ToolOption

if TYPE_CHECKING:
    from transformers import PreTrainedTokenizerBase


class EncodedPrompt(NamedTuple):
    """A tool's prompt as the tokens the model is run on.

    Attributes:
        ids: The token ids, special tokens included.
        template: The positions of the tokens a chat template put around the
            prompt, in order; empty for a prompt sent as it is written.
    """

    ids: list[int]
    template: list[int]


class ChatTemplate:
    """How a tool's prompt reaches the model: as written, or as a chat's first message.

    A chat model is trained on conversations laid out by its tokenizer's chat
    template: role markers around each message, often a system message it
    writes itself. A prompt sent as written is a plain completion, which such
    a model reads out of that layout. The tools that take a prompt offer the
    choice as their ``template`` option (:attr:`OPTION`), which
    :meth:`encode` carries out::

        logit_lens(model, "Where is the Eiffel Tower?", template="chat")

    The template is applied once, to token ids: its text already holds the
    special tokens, so tokenizing it again the usual way would add a second
    start token on many models.

    A tool also takes a prompt already tokenized, as a sequence of token ids,
    which it traces as they are, whatever ``template`` says. That is how to run
    a conversation of several turns, or exactly the tokens an interface showed::

        ids = tokenizer.apply_chat_template(messages, add_generation_prompt=True)
        logit_lens(model, ids)

    Attributes:
        PLAIN: The ``template`` value for a prompt sent as written.
        CHAT: The one for a prompt sent as a user's message.
        OPTION: The ``template`` option, as the tools declare it.
    """

    PLAIN = "plain"
    CHAT = "chat"
    OPTION = ToolOption(
        name="template",
        label="Chat template",
        default=PLAIN,
        choices=[
            ToolChoice(
                value=PLAIN,
                label="Plain prompt",
                description=(
                    "Sends the prompt as it is written, for the model to "
                    "continue."
                ),
            ),
            ToolChoice(
                value=CHAT,
                label="Chat template",
                description=(
                    "Sends the prompt as a user's message in the model's chat "
                    "template, the layout it was trained on. The last position "
                    "then predicts the start of the model's reply."
                ),
            ),
        ],
    )

    @staticmethod
    def available(tokenizer: Any) -> bool:
        """Whether ``tokenizer`` has a chat template to apply."""
        return bool(getattr(tokenizer, "chat_template", None))

    @classmethod
    def encode(
        cls,
        tokenizer: "PreTrainedTokenizerBase",
        prompt: str | Sequence[int],
        template: str = PLAIN,
    ) -> EncodedPrompt:
        """The tokens a tool runs ``prompt`` on.

        A text prompt is tokenized as usual under :attr:`PLAIN`, and under
        :attr:`CHAT` as the user's message of a conversation the model is
        about to answer. Token ids are returned as they are.

        Raises:
            ValueError: for :attr:`CHAT` on a tokenizer without a chat template.
        """
        if not isinstance(prompt, str):
            return EncodedPrompt([int(token) for token in prompt], [])
        if template != cls.CHAT:
            return EncodedPrompt(list(tokenizer.encode(prompt)), [])
        if not cls.available(tokenizer):
            raise ValueError(
                "template='chat' needs a chat template, and this model's "
                "tokenizer has none."
            )

        text = tokenizer.apply_chat_template(
            [{"role": "user", "content": prompt}],
            tokenize=False,
            add_generation_prompt=True,
        )
        ids = list(tokenizer.encode(text, add_special_tokens=False))
        return EncodedPrompt(ids, cls._around(tokenizer, text, ids, prompt))

    @staticmethod
    def _around(
        tokenizer: "PreTrainedTokenizerBase", text: str, ids: list[int], prompt: str
    ) -> list[int]:
        """The positions of ``ids`` that are the template's, not the prompt's.

        ``text`` is the rendered conversation and ``ids`` its tokens. The
        prompt is found in the text (as written, or trimmed as some templates
        trim a message), and the tokens of what comes before and after it are
        matched against the two ends of ``ids``. A token that joins the
        template to the prompt counts as the prompt's. Empty when the template
        rewrote the prompt beyond finding it.
        """
        for content in (prompt, prompt.strip()):
            start = text.rfind(content) if content else -1
            if start >= 0:
                break
        else:
            return []

        before = tokenizer.encode(text[:start], add_special_tokens=False)
        after = tokenizer.encode(text[start + len(content):], add_special_tokens=False)

        head = 0
        while head < min(len(before), len(ids)) and ids[head] == before[head]:
            head += 1
        tail = 0
        while (
            tail < min(len(after), len(ids) - head)
            and ids[-1 - tail] == after[-1 - tail]
        ):
            tail += 1
        return [*range(head), *range(len(ids) - tail, len(ids))]
