from __future__ import annotations

from typing import TYPE_CHECKING, Any

import torch
import torch.nn.functional as F

from ..types import ActivationPatchingData
from ._base import Tool

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class ActivationPatchingTool(Tool):
    """Activation patching: causal intervention across all layers."""

    def _run(
        self,
        model: "StandardizedTransformer",
        src_prompt: str,
        tgt_prompt: str,
        src_pos: list[int | list[int]],
        tgt_pos: list[int],
        tgt_freeze: list[int],
        *,
        remote: bool = False,
        backend=None,
        **_kwargs,
    ) -> Any:
        n_layers = model.num_layers
        src_acts: list[list[torch.Tensor]] = []
        clean_hs: list[torch.Tensor] = []
        src_pred = None
        clean_pred = None
        clean_logits = None
        patched_logits = None

        with model.session(remote=remote, backend=backend):
            with model.trace(src_prompt):
                for l_idx in range(n_layers):
                    src_acts.append([])
                    hs = model.layers_output[l_idx]

                    for pos in src_pos:
                        if isinstance(pos, list):
                            src_acts[-1].append(hs[0, pos[0]:pos[1]].mean(dim=0))
                        else:
                            src_acts[-1].append(hs[0, pos])

                src_pred = model.logits[0, -1].argmax(dim=-1).save()

            with model.trace(tgt_prompt):
                for l_idx in range(n_layers):
                    clean_hs.append(model.layers[l_idx].output)

                clean_pred = model.logits[0, -1].argmax(dim=-1).save()
                clean_logits = F.softmax(model.logits[0, -1], dim=-1).save()

            patched_logits = list().save()
            for l_idx in range(n_layers):
                with model.trace(tgt_prompt):
                    for layer_to_skip in range(l_idx + 1):
                        model.layers[layer_to_skip].skip(clean_hs[layer_to_skip])

                    for sub_l_idx in range(l_idx, n_layers):
                        hs = model.layers_output[sub_l_idx]

                        if sub_l_idx == l_idx:
                            for pos, src_act in zip(tgt_pos, src_acts[l_idx]):
                                hs[0, pos][:] = src_act
                        else:
                            for pos_to_freeze in tgt_freeze:
                                hs_freeze = clean_hs[sub_l_idx]
                                if isinstance(hs_freeze, tuple):
                                    hs_freeze = hs_freeze[0]
                                hs[0, pos_to_freeze][:] = hs_freeze[0, pos_to_freeze]

                    patched_logits.append(
                        F.softmax(model.logits[0, -1], dim=-1).save()
                    )

        if backend is not None:
            return backend

        return {
            "tokenizer": model.tokenizer,
            "src_pred": src_pred,
            "clean_pred": clean_pred,
            "patched_logits": patched_logits,
            "clean_logits": clean_logits,
        }

    def _format(
        self,
        raw: dict[str, Any],
        **_kwargs,
    ) -> ActivationPatchingData:
        tokenizer = raw["tokenizer"]
        src_pred = raw["src_pred"]
        clean_pred = raw["clean_pred"]
        patched_logits = raw["patched_logits"]
        clean_logits = raw["clean_logits"]

        # [L, V]
        logits_mat = torch.stack([t.detach() for t in patched_logits], dim=0)
        L, V = logits_mat.shape

        # ---- 1) Candidate token ids: src/clean + union of topk across layers ----
        topk_idx = logits_mat.topk(k=10, dim=1).indices  # [L, 10]
        cand = torch.unique(topk_idx.flatten())          # [K]

        # remove src/clean if present, then prepend them in order
        cand = cand[(cand != src_pred) & (cand != clean_pred)]
        dev = logits_mat.device
        fixed = torch.tensor(
            [src_pred, clean_pred], device=dev, dtype=cand.dtype
        )
        token_ids = torch.cat([fixed, cand], dim=0)  # [T]

        # ---- 2) Per-token per-layer probs ----
        probs_mat = logits_mat.index_select(1, token_ids)  # [L, T]

        # ---- 3) Exact ranks via inverted permutation ----
        sorted_idx = logits_mat.argsort(dim=1, descending=True)
        inv_rank = torch.empty_like(sorted_idx)
        arange_V = torch.arange(V, device=dev).expand(L, V)
        inv_rank.scatter_(1, sorted_idx, arange_V)
        ranks_mat = inv_rank.index_select(1, token_ids)  # [L, T]

        # ---- 4) Probability difference from clean ----
        clean_probs_T = clean_logits.index_select(0, token_ids)
        prob_diff_mat = probs_mat - clean_probs_T.unsqueeze(0)

        # ---- 5) Sort: keep src, clean first; rest by total_rank ----
        total_rank = ranks_mat.sum(dim=0)  # [T]
        rem_order = torch.argsort(total_rank[2:]) + 2
        order = torch.cat(
            [torch.tensor([0, 1], device=dev), rem_order], dim=0
        )

        token_ids = token_ids[order]
        probs_mat = probs_mat[:, order]
        ranks_mat = ranks_mat[:, order]
        prob_diff_mat = prob_diff_mat[:, order]

        # ---- 6) Build return structure ----
        probs_T = probs_mat.transpose(0, 1).tolist()
        probabilities = [
            [round(p, 4) for p in row] for row in probs_T
        ]
        ranks = ranks_mat.transpose(0, 1).tolist()
        diffs_T = prob_diff_mat.transpose(0, 1).tolist()
        prob_diffs = [
            [round(d, 4) for d in row] for row in diffs_T
        ]
        labels = [tokenizer.decode(int(tid)) for tid in token_ids]

        return ActivationPatchingData(
            lines=probabilities,
            ranks=ranks,
            prob_diffs=prob_diffs,
            tokenLabels=labels,
        )


activation_patching = ActivationPatchingTool()
