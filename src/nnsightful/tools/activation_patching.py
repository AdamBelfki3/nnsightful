from __future__ import annotations

from typing import TYPE_CHECKING, Any

import math
import torch
import torch.nn.functional as F

from ..types import ActivationPatchingData
from ._base import Tool

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class ActivationPatchingTool(Tool):
    """Activation patching: causal intervention across all layers."""

    data_class = ActivationPatchingData

    def _run(
        self,
        model: "StandardizedTransformer",
        src_prompt: str,
        tgt_prompt: str,
        src_pos: list[int | list[int]],
        tgt_pos: list[int],
        tgt_freeze: list[int],
        *,
        batch_size=32,
        remote: bool = False,
        backend=None,
        non_blocking: bool=False,
        raw: bool = False,
        **kwargs,
    ) -> ActivationPatchingData | dict[str, Any] | str:
        with torch.no_grad():
            with model.session(remote=remote, backend=backend):
                src_acts = list()
                with model.trace(src_prompt):
                    for l_idx in range(model.num_layers):
                        src_acts.append([])
                        hs = model.layers[l_idx].layer_output

                        for pos in src_pos:
                            if isinstance(pos, list):
                                src_acts[-1].append(hs[0, pos[0]:pos[1]].mean(dim=0))
                            else:
                                src_acts[-1].append(hs[0, pos])

                    src_pred = model.logits[0, -1].argmax(dim=-1)

                clean_hs = list()
                with model.trace(tgt_prompt):
                    for l_idx in range(model.num_layers):
                        clean_hs.append(model.layers[l_idx].output)

                    clean_pred = model.logits[0, -1].argmax(dim=-1)
                    clean_probs = F.softmax(model.logits[0, -1], dim=-1)

                patched_logits = list()
                for batch in range(math.ceil(model.num_layers / batch_size)):
                    batch_start = batch*batch_size
                    batch_end = model.num_layers if batch_start + batch_size > model.num_layers else batch_start + batch_size
                    with model.trace() as tracer:
                        for l_idx in range(batch_start, batch_end):
                            with tracer.invoke(tgt_prompt):
                                for sub_l_idx in range(l_idx, model.num_layers):
                                    hs = model.layers[sub_l_idx].layer_output

                                    if sub_l_idx == l_idx:
                                        for pos, src_act in zip(tgt_pos, src_acts[l_idx]):
                                            hs[0, pos][:] = src_act
                                    else:
                                        for pos_to_freeze in tgt_freeze:
                                            hs_freeze = clean_hs[sub_l_idx]
                                            if isinstance(hs_freeze, tuple):
                                                hs_freeze = hs_freeze[0]
                                            hs[0, pos_to_freeze][:] = hs_freeze[0, pos_to_freeze]

                                patched_logits.append(model.lm_head.output[0, -1])

                if raw:
                    # maybe move to cpu first?
                    results = {
                        "tokenizer": model.tokenizer,
                        "src_pred": src_pred,
                        "clean_pred": clean_pred,
                        "patched_logits": patched_logits,
                        "clean_probs": clean_probs,
                    }
                else:
                    results = self.payload(
                        src_pred=src_pred, 
                        clean_pred=clean_pred, 
                        patched_logits=patched_logits, 
                        clean_probs=clean_probs, 
                        tokenizer=model.tokenizer
                    )

                results.save()

        if remote and non_blocking:
            return backend.job_id

        return results if raw else self.load(results)


activation_patching = ActivationPatchingTool()
