from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import TYPE_CHECKING, Any, Optional

from ..types import GenerationData
from ._base import Tool

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer
    from transformers import PreTrainedTokenizerBase


class GenerateTool(Tool):
    """Generate a model's reply to a chat, or its continuation of a text.

    ``mode="chat"`` renders ``messages`` (``{"role", "content"}`` mappings)
    with the tokenizer's chat template and opens the assistant's turn.
    Templates that reject the ``system`` role (Gemma's) get the system text
    folded into the next user turn. ``mode="completion"`` is for base models:
    the messages' contents (or a plain string) are one document, which the
    reply continues.

    The prompt is tokenized here, client-side, and handed to
    ``model.generate`` as token ids. A chat template writes its own BOS, so
    it is tokenized without special tokens; tokenizing the rendered text as
    a string prompt would add a second one.

    Generation stops at the tokenizer's EOS, the model's
    ``generation_config`` EOS ids and, in chat mode, whichever of
    :attr:`END_OF_TURN_TOKENS` the tokenizer has as a special token (Gemma,
    e.g., also has a plain-text ``</s>``), plus any ``stop_token_ids`` given.
    ``temperature=0`` decodes greedily.
    """

    data_class = GenerationData

    MODES = ("chat", "completion")

    END_OF_TURN_TOKENS = (
        "<end_of_turn>",  # Gemma
        "<|eot_id|>",  # Llama 3
        "<|eom_id|>",  # Llama 3.1 tool calls
        "<|im_end|>",  # Qwen, ChatML
        "<|end|>",  # Phi
        "<|endoftext|>",
        "<|end_of_text|>",
        "</s>",
    )

    def _prepare(
        self,
        model: StandardizedTransformer,
        messages: str | Sequence[Mapping[str, str]],
        *,
        mode: str = "chat",
        max_new_tokens: int = 256,
        temperature: float = 0.7,
        stop_token_ids: Optional[Sequence[int]] = None,
        generate_kwargs: Optional[dict] = None,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Render and tokenize the prompt, and build ``model.generate``'s kwargs.

        ``messages`` may be a plain string: in chat mode it is one user turn.
        Extra ``generate_kwargs`` (e.g. ``top_p``) override the defaults.

        Raises:
            ValueError: for an unknown ``mode``, ``max_new_tokens < 1``,
                ``temperature < 0``, an empty prompt, a chat-mode call on a
                tokenizer with no chat template, or a template that rejects
                the conversation.
        """
        if mode not in self.MODES:
            raise ValueError(f"mode={mode!r}: expected one of {', '.join(self.MODES)}.")
        if max_new_tokens < 1:
            raise ValueError(f"max_new_tokens={max_new_tokens}: must be at least 1.")
        if temperature < 0:
            raise ValueError(f"temperature={temperature}: must be 0 (greedy) or more.")

        tokenizer = model.tokenizer
        if mode == "chat":
            input_ids = self.chat_input_ids(tokenizer, messages)
        else:
            input_ids = self.completion_input_ids(tokenizer, messages)
        stop_ids = self.stop_ids(model, mode, stop_token_ids)

        gen_kwargs: dict[str, Any] = {"max_new_tokens": max_new_tokens}
        if stop_ids:
            gen_kwargs["eos_token_id"] = stop_ids
        pad_id = tokenizer.pad_token_id
        if pad_id is None and stop_ids:
            pad_id = stop_ids[0]
        if pad_id is not None:
            gen_kwargs["pad_token_id"] = pad_id
        if temperature > 0:
            gen_kwargs.update(do_sample=True, temperature=temperature)
        else:
            gen_kwargs.update(do_sample=False)
        gen_kwargs.update(generate_kwargs or {})

        run_kwargs = {"input_ids": input_ids, "gen_kwargs": gen_kwargs}
        format_kwargs = {"n_prompt": len(input_ids), "stop_ids": stop_ids, "mode": mode}
        return run_kwargs, format_kwargs

    def _run(
        self,
        model: StandardizedTransformer,
        *,
        input_ids: list[int],
        gen_kwargs: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate from ``input_ids``; returns the whole sequence, prompt first."""
        with model.generate(input_ids, **gen_kwargs) as tracer:
            token_ids = tracer.result[0].tolist()

        return {"token_ids": token_ids}

    def _format(
        self,
        model: StandardizedTransformer,
        outputs: dict[str, Any],
        *,
        n_prompt: int,
        stop_ids: list[int],
        mode: str,
    ) -> GenerationData:
        return self.format(
            model, outputs["token_ids"], n_prompt=n_prompt, stop_ids=stop_ids, mode=mode
        )

    @classmethod
    def chat_input_ids(
        cls,
        tokenizer: PreTrainedTokenizerBase,
        messages: str | Sequence[Mapping[str, str]],
    ) -> list[int]:
        """The conversation rendered with the chat template, as token ids.

        Each message's content is stripped of surrounding whitespace, as most
        templates ``trim`` it anyway.
        """
        if isinstance(messages, str):
            messages = [{"role": "user", "content": messages}]
        conv = [
            {"role": str(m["role"]), "content": str(m["content"]).strip()}
            for m in messages
        ]
        if not conv:
            raise ValueError("There are no messages to reply to.")
        if getattr(tokenizer, "chat_template", None) is None:
            raise ValueError(
                "This model's tokenizer has no chat template; use mode='completion'."
            )

        text = cls._apply_template(tokenizer, conv)
        return list(tokenizer(text, add_special_tokens=False)["input_ids"])

    @staticmethod
    def completion_input_ids(
        tokenizer: PreTrainedTokenizerBase,
        messages: str | Sequence[Mapping[str, str]],
    ) -> list[int]:
        """The document to continue, as token ids (special tokens added)."""
        if isinstance(messages, str):
            text = messages
        else:
            text = "".join(str(m["content"]) for m in messages)
        if not text:
            raise ValueError("There is no text to continue.")

        return list(tokenizer(text)["input_ids"])

    @classmethod
    def stop_ids(
        cls,
        model: StandardizedTransformer,
        mode: str,
        extra: Optional[Sequence[int]] = None,
    ) -> list[int]:
        """The token ids that end a reply (sorted)."""
        tokenizer = model.tokenizer
        ids: set[int] = set(int(i) for i in extra or ())
        if tokenizer.eos_token_id is not None:
            ids.add(int(tokenizer.eos_token_id))

        config_eos = getattr(cls._generation_config(model), "eos_token_id", None)
        if isinstance(config_eos, int):
            ids.add(config_eos)
        elif isinstance(config_eos, (list, tuple)):
            ids.update(int(i) for i in config_eos)

        if mode == "chat":
            added = tokenizer.get_added_vocab()
            decoder = getattr(tokenizer, "added_tokens_decoder", None) or {}
            for token in cls.END_OF_TURN_TOKENS:
                token_id = added.get(token)
                if token_id is not None and getattr(
                    decoder.get(token_id), "special", False
                ):
                    ids.add(int(token_id))

        return sorted(ids)

    @staticmethod
    def _generation_config(model: StandardizedTransformer) -> Any:
        """The HF model's ``generation_config``, or ``None`` when it has none."""
        try:
            return getattr(model.pipeline.model, "generation_config", None)
        except Exception:
            return None

    @staticmethod
    def _fold_system(conv: list[dict[str, str]]) -> list[dict[str, str]]:
        """Fold ``system`` turns into the next user turn (or a leading one)."""
        out: list[dict[str, str]] = []
        pending: list[str] = []
        for message in conv:
            if message["role"] == "system":
                pending.append(message["content"])
                continue
            if pending and message["role"] == "user":
                content = "\n\n".join(pending + [message["content"]])
                message = {"role": "user", "content": content}
                pending = []
            out.append(message)
        if pending:
            out.insert(0, {"role": "user", "content": "\n\n".join(pending)})
        return out

    @classmethod
    def _apply_template(
        cls, tokenizer: PreTrainedTokenizerBase, conv: list[dict[str, str]]
    ) -> str:
        """Render ``conv`` with the assistant's turn opened.

        A template that raises on a conversation with a ``system`` turn is
        tried again with it folded (see :meth:`_fold_system`).
        """
        attempts = [conv]
        if any(m["role"] == "system" for m in conv):
            attempts.append(cls._fold_system(conv))

        for i, attempt in enumerate(attempts):
            try:
                return tokenizer.apply_chat_template(
                    attempt, tokenize=False, add_generation_prompt=True
                )
            except Exception as e:
                if i == len(attempts) - 1:
                    raise ValueError(
                        f"The chat template rejected the conversation: {e}"
                    ) from e
        raise AssertionError("unreachable")


generate = GenerateTool()
