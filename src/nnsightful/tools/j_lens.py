from __future__ import annotations

from functools import lru_cache
from typing import TYPE_CHECKING, Callable, Optional, Any

import torch
from huggingface_hub import HfApi, hf_hub_download

from ..types import JLensData, JLensMeta
from ._base import Tool
from ._utils import IndexSpec, resolve_indices

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


def _select_tokens(
    probs: torch.Tensor,
    top_k: int | None,
    top_p: float | None,
    extra_indices: list[int] | None,
) -> list[int]:
    """Select token indices via top-k and/or top-p, plus explicit indices.

    When both top_k and top_p are specified, tokens are sorted by descending
    probability and included until *either* condition is met first (i.e. the
    minimum of the two cutoffs).  When only one is specified, that single
    criterion is used.  ``extra_indices`` are always included on top.

    Args:
        probs: 1-D probability vector over vocabulary.
        top_k: Maximum number of highest-probability tokens.
        top_p: Cumulative probability threshold (nucleus selection).
        extra_indices: Additional vocab indices to always include.

    Returns:
        Sorted list of selected vocab indices.
    """
    sorted_probs, sorted_idx = probs.sort(descending=True)

    if top_k is not None and top_p is not None:
        cumsum = sorted_probs.cumsum(dim=0)
        n_by_p = int((cumsum < top_p).sum().item()) + 1
        n_include = min(top_k, n_by_p)
    elif top_k is not None:
        n_include = top_k
    elif top_p is not None:
        cumsum = sorted_probs.cumsum(dim=0)
        n_include = int((cumsum < top_p).sum().item()) + 1
    else:
        n_include = 0

    selected: set[int] = set(sorted_idx[:n_include].tolist())

    if extra_indices is not None:
        selected.update(extra_indices)

    return sorted(selected)


class JLensTool(Tool):
    """J-lens: decode intermediate layer predictions."""

    def _resolve_lens_filename(self, model_repo_id: str) -> str:
        """Find the lens checkpoint in ``lens_repo`` for the given model.

        Matches on the model name (the segment after the last ``/`` of the HF
        ``repo_id``): a lens file's basename is ``<model_name>_jacobian_lens.pt``.

        Raises:
            ValueError: if the model has no corresponding lens in the repo.
        """
        target = f"{model_repo_id.rsplit("/", 1)[-1]}_jacobian_lens.pt"

        files = tuple(HfApi().list_repo_files("neuronpedia/jacobian-lens"))
        matches = [f for f in files if f.rsplit("/", 1)[-1] == target]

        if not matches:
            raise ValueError(
                f"No Jacobian lens found for model {model_repo_id!r} in "
                f"{"neuronpedia/jacobian-lens"!r} (looked for a file named {target!r}). "
                f"Models with a lens: {sorted({
                    f.rsplit("/", 1)[-1][: -len("_jacobian_lens.pt")]
                    for f in files
                    if f.endswith("_jacobian_lens.pt")
                })}"
            )
        
        return sorted(matches)[0]

    def _load_jacobians(self, filename: str) -> dict[int, torch.Tensor]:
        """Download (cached on disk) and load a lens checkpoint's jacobians.

        Cached in-process so the multi-hundred-MB checkpoint is deserialized once
        per session, not on every tool call.
        """

        path = hf_hub_download("neuronpedia/jacobian-lens", filename)
        return torch.load(path, map_location="cpu", weights_only=True)["J"]

    def _format(
        self, 
        logits: torch.Tensor,
        model: StandardizedTransformer,
        prompt,
        top_k: int = 5,
        include_entropy: bool=True
    ) -> dict[Any, Any]:

        # AXIS LABELS + TICKS
        input_tokens = [
            str(model.tokenizer.decode(token)) # TOKENIZE THE INPUT PROMPT
            for token in model.tokenizer.encode(prompt)
        ]
        layers = list(range(model.num_layers))
        positions = list(range(len(input_tokens)))

        # ENTROPY: entropy[l_idx][pos]
        if include_entropy:
            log_p = torch.nn.functional.log_softmax(logits, dim=-1)
            p = log_p.exp()
            entropy = torch.round(-(p * log_p).sum(dim=-1), decimals=3).tolist()
        else:
            entropy = None

        probs = torch.nn.functional.softmax(logits, dim=-1)

        logits.to('cpu') # free memory

        _, top_indices = torch.topk(probs, k=top_k, dim=-1)

        # TOP-K
        topks = [[model.tokenizer.batch_decode(torch.tensor(pos).unsqueeze(dim=1)) for pos in layer] for layer in top_indices.tolist()]

        # TRAJECTORIES: trajectories[pos]{token_str: [prob_l0, prob_l1, ...etc]}
        unique_indices = [
            torch.unique(top_indices[:, pi, :].flatten(), sorted=False).tolist()
            for pi in range(top_indices.shape[1])
        ]
        probs = probs.permute(1, 2, 0)
        trajectories = [{model.tokenizer.decode(token): torch.round(probs[pos_idx][token], decimals=3).tolist() for token in pos}  for pos_idx, pos in enumerate(unique_indices)]

        return (
            {
                "meta": {"version": 2, "timestamp": "3h", "model": model.repo_id},
                "layers": layers,
                "input": input_tokens,
                "tracked": trajectories,
                "topk": topks,
                "entropy": entropy,
                "positions": positions
            }
        )

    def _run(
        self,
        model: StandardizedTransformer,
        prompt: str,
        *args,
        remote: bool=False,
        backend: Optional=None,
        non_blocking=False,
        raw=False,
        post_transform: Optional[Callable]=None,
        **kwargs
    ) -> torch.Tensor|dict[Any, Any]|Any:

        filename = self._resolve_lens_filename(model.repo_id)

        with torch.no_grad():
            with model.trace(prompt, remote=remote, backend=backend) as tracer:
                jacobians = self._load_jacobians(filename)

                all_logits = list()
                for l_idx in range(model.num_layers - 1):
                    res = model.layers_output[l_idx]
                    jac = jacobians[l_idx].to(device=res.device)
                    inter = res @ jac.T.to(res.dtype)
                    all_logits.append(model.project_on_vocab(inter))

                all_logits.append(model.project_on_vocab(model.layers_output[-1]))

                all_logits = torch.cat(all_logits, dim=0)

                if raw:
                    results = all_logits.to('cpu').save()
                else:
                    results = self._format(all_logits, model, prompt, **kwargs)

                results.save()

        if remote and non_blocking:
            return backend.job_id

        return results

    @staticmethod
    def to_data_obj(**kwargs):
        meta_dict = kwargs['meta']
        kwargs['meta'] = JLensMeta(**meta_dict)

        return JLensData(**kwargs)


j_lens = JLensTool()
