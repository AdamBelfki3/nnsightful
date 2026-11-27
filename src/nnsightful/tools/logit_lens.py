from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any

import torch

from ..types import LogitLensData
from ._base import Tool
from ._utils import IndexSpec
from .chat import ChatTemplate

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

class LogitLensTool(Tool):
    """Logit lens: decode intermediate layer predictions."""

    data_class = LogitLensData
    PROMPT_OPTIONS = (ChatTemplate.OPTION,)

    def _prepare(
        self,
        model: StandardizedTransformer,
        prompt: str | Sequence[int],
        *,
        template: str = ChatTemplate.PLAIN,
        positions: IndexSpec = None,
        top_k: int = 5,
        include_entropy: bool = True,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Resolve the logit lens's arguments.

        ``prompt`` is tokenized here, as ``template`` says
        (:class:`~nnsightful.tools.chat.ChatTemplate`), and the run and the
        formatting take its token ids. Under a chat template the prompt's
        positions count the template's tokens too.

        ``positions`` (an :data:`~nnsightful.tools._utils.IndexSpec`, default
        all) selects the prompt positions to project onto the vocabulary. Only
        those rows are projected, so the ``[layer, pos, vocab]`` buffer — and
        the cost — scales with the selection rather than the prompt length.
        ``topk``, ``tracked`` and ``entropy`` (and the ``raw`` tensor) cover
        the selected positions in order; ``positions`` lists their absolute
        indices and ``input`` still holds every prompt token.

        Raises:
            ValueError: if ``positions`` is empty or outside the prompt.
        """
        encoded = ChatTemplate.encode(model.tokenizer, prompt, template)
        selected = self._select_positions(positions, len(encoded.ids))
        run_kwargs = {
            "prompt": encoded.ids,
            "positions": selected,
            "index": self._position_index(selected),
        }
        format_kwargs = {
            "prompt": encoded.ids,
            "positions": selected,
            "top_k": top_k,
            "include_entropy": include_entropy,
            "template": encoded.template or None,
        }
        return run_kwargs, format_kwargs

    def _run(
        self,
        model: StandardizedTransformer,
        *,
        prompt: list[int],
        positions: list[int] | None,
        index: slice | list[int],
    ) -> dict[str, Any]:
        """Project the ``positions`` rows (via ``index``) of every layer."""
        with model.trace(prompt):
            n_rows = model.input_size[1] if positions is None else len(positions)
            logits = torch.empty(
                (model.num_layers, n_rows, model.vocab_size),
                dtype=model.lm_head.weight.dtype,
                device=model.lm_head.weight.device,
            ) # [num_layers, pos, vocab]

            for l_idx in range(model.num_layers):
                layer_output = model.layers[l_idx].layer_output[:, index]
                logits[l_idx] = model.project_on_vocab(layer_output)[0]

        return {"logits": logits}

    def _format(
        self,
        model: StandardizedTransformer,
        outputs: dict[str, Any],
        *,
        prompt: list[int],
        positions: list[int] | None,
        top_k: int,
        include_entropy: bool,
        template: list[int] | None,
    ) -> LogitLensData:
        return self.format(
            outputs["logits"],
            model,
            prompt,
            positions,
            top_k=top_k,
            include_entropy=include_entropy,
            template=template,
        )

    def _raw(
        self, model: StandardizedTransformer, outputs: dict[str, Any]
    ) -> torch.Tensor:
        """The ``[layer, pos, vocab]`` lens logits, on the CPU."""
        return outputs["logits"].cpu()


logit_lens = LogitLensTool()
