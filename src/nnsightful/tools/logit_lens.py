from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

import torch
import torch.nn.functional as F

from ..types import LogitLensData, LogitLensMeta
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


@torch.no_grad()
def logit_lens(
    model: "StandardizedTransformer",
    prompt: str,
    *,
    layers: IndexSpec = None,
    positions: IndexSpec = None,
    top_k: int | None = 5,
    top_p: float | None = None,
    logit_indices: IndexSpec = None,
    include_entropy: bool = True,
    remote: bool = False,
    backend=None,
) -> LogitLensData:
    """Compute logit lens data for a prompt.

    Args:
        model: A StandardizedTransformer instance.
        prompt: Input text to analyze.
        layers: Which layers to compute (None=all). Accepts int, tuple,
            list, or list of tuples -- see ``resolve_indices``.
        positions: Which token positions to compute (None=all). Same
            specification as *layers*.
        top_k: Number of top tokens to track per layer/position.
        top_p: Cumulative probability threshold for nucleus selection.
        logit_indices: Explicit vocab indices to always include in tracked
            tokens, in addition to top_k/top_p selection.
        include_entropy: Whether to compute entropy at each layer/position.
        remote: Whether to execute remotely.
        backend: Optional backend for remote execution.

    Returns:
        LogitLensData instance.
    """
    assert (
        top_k is not None or top_p is not None
    ), "At least one of top_k or top_p must be specified"

    layer_indices = resolve_indices(layers, model.num_layers)
    input_tokens: list[str] = [
        str(model.tokenizer.decode(token))
        for token in model.tokenizer.encode(prompt)
    ]

    all_logits = []
    with model.trace(prompt, remote=remote, backend=backend):
        for i in layer_indices:
            hs = model.layers_output[i]
            logits = model.project_on_vocab(hs)
            all_logits.append(logits.cpu().save())

    return _format_data(
        input_tokens=input_tokens,
        all_logits=all_logits,
        tokenizer=model.tokenizer,
        layer_indices=layer_indices,
        positions=positions,
        top_k=top_k,
        top_p=top_p,
        logit_indices=logit_indices,
        include_entropy=include_entropy,
        model_name=model._model.config._name_or_path,
    )


def _format_data(
    input_tokens: list[str],
    all_logits: list[torch.Tensor],
    tokenizer,
    *,
    layer_indices: list[int] | None = None,
    positions: IndexSpec = None,
    top_k: int | None = 5,
    top_p: float | None = None,
    logit_indices: IndexSpec = None,
    include_entropy: bool = True,
    model_name: str = "",
) -> LogitLensData:
    """Build LogitLensData from collected logit tensors."""
    n_selected_layers = len(all_logits)
    if layer_indices is None:
        layer_indices = list(range(n_selected_layers))

    n_positions = len(input_tokens)
    position_indices = resolve_indices(positions, n_positions)
    positions_is_sparse = len(position_indices) != n_positions
    n_selected_positions = len(position_indices)

    vocab_size = all_logits[0].shape[-1]
    extra_logit_indices = (
        resolve_indices(logit_indices, vocab_size)
        if logit_indices is not None
        else None
    )

    # tracked[pi] = {token_str: [prob_layer0, prob_layer1, ...]}
    tracked: list[dict[str, list[float]]] = [{} for _ in range(n_selected_positions)]

    # topk_list[li][pi] = [token_str, ...]
    topk_list: list[list[list[str]]] = [[] for _ in range(n_selected_layers)]

    # entropy_list[li][pi] = entropy_value
    entropy_list: list[list[float]] = [[] for _ in range(n_selected_layers)]

    # First pass: collect selected tokens at each layer/position
    # and build the set of token indices to track per position
    tokens_to_track: list[set[int]] = [set() for _ in range(n_selected_positions)]

    for li, logits in enumerate(all_logits):
        layer_topk: list[list[str]] = []
        layer_entropy: list[float] = []

        for pi, pos in enumerate(position_indices):
            pos_logits = logits[0, pos]  # [vocab]
            probs = F.softmax(pos_logits, dim=-1)

            # Select tokens via top-k / top-p / explicit indices
            selected_indices = _select_tokens(probs, top_k, top_p, extra_logit_indices)

            # Sort by probability (descending) for display order
            idx_prob_pairs = [(idx, probs[idx].item()) for idx in selected_indices]
            idx_prob_pairs.sort(key=lambda x: x[1], reverse=True)
            selected_tokens = [tokenizer.decode(idx) for idx, _ in idx_prob_pairs]

            layer_topk.append(selected_tokens)
            tokens_to_track[pi].update(selected_indices)

            if include_entropy:
                log_p = F.log_softmax(pos_logits, dim=-1)
                p = log_p.exp()
                H = -(p * log_p).sum().item()
                layer_entropy.append(round(H, 5))

        topk_list[li] = layer_topk
        if include_entropy:
            entropy_list[li] = layer_entropy

    # Second pass: compute trajectories for all tracked tokens
    for pi, pos in enumerate(position_indices):
        for token_idx in tokens_to_track[pi]:
            token_str = tokenizer.decode(token_idx)
            trajectory = []

            for logits in all_logits:
                pos_logits = logits[0, pos, :]  # [vocab]
                probs = F.softmax(pos_logits, dim=-1)
                prob = probs[token_idx].item()
                trajectory.append(round(prob, 5))

            tracked[pi][token_str] = trajectory

    meta = LogitLensMeta(
        version=2,
        timestamp=datetime.now(timezone.utc).isoformat(),
        model=model_name,
    )

    return LogitLensData(
        meta=meta,
        layers=layer_indices,
        input=input_tokens,
        positions=position_indices if positions_is_sparse else None,
        tracked=tracked,
        topk=topk_list,
        entropy=entropy_list if include_entropy else None,
    )
