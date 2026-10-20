from __future__ import annotations

from typing import TYPE_CHECKING, Callable, Optional, Any

import torch

from ..types import LogitLensData
from ._base import Tool
from ._utils import IndexSpec

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

class LogitLensTool(Tool):
    """Logit lens: decode intermediate layer predictions."""

    data_class = LogitLensData

    def _run(
        self,
        model: StandardizedTransformer,
        prompt: str,
        *args,
        positions: IndexSpec=None,
        remote: bool=False,
        backend: Optional=None,
        non_blocking=False,
        raw=False,
        post_transform: Optional[Callable]=None,
        **kwargs
    ) -> LogitLensData|torch.Tensor|Any:
        """Run the logit lens on ``prompt``.

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
        n_tokens = len(model.tokenizer.encode(prompt))
        selected = self._select_positions(positions, n_tokens)
        index = self._position_index(selected)

        with torch.no_grad():
            with model.trace(prompt, remote=remote, backend=backend) as tracer:
                n_rows = model.input_size[1] if selected is None else len(selected)
                all_logits = torch.empty(
                    (model.num_layers, n_rows, model.vocab_size),
                    dtype=model.lm_head.weight.dtype,
                    device=model.lm_head.weight.device,
                ) # [num_layers, pos, vocab]

                for l_idx in range(model.num_layers):
                    layer_output = model.layers[l_idx].layer_output[:, index]
                    all_logits[l_idx] = model.project_on_vocab(layer_output)[0]

                if raw:
                    results = all_logits.to('cpu').save()
                else:
                    results = self.format(
                        all_logits, model, prompt, selected, **kwargs
                    )

                results.save()

        if remote and non_blocking:
            return backend.job_id

        return results


logit_lens = LogitLensTool()
