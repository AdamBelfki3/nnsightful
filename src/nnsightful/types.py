from abc import abstractmethod
from typing import TYPE_CHECKING, Any, Sequence

from pydantic import BaseModel

if TYPE_CHECKING:
    import torch
    from nnterp import StandardizedTransformer
    from transformers import PreTrainedTokenizerBase


class ToolData(BaseModel):
    """Abstract base for nnsightful tool output data.

    Each subclass also owns its tool's result formatting: a ``format``
    classmethod turning the tool's tensors into an instance of the class. It
    runs inside the tool's trace (server-side on NDIF), and the instance is
    what gets saved and sent back. Torch is imported only inside those
    methods, so reading or displaying the data does not need it.
    """

    @classmethod
    @abstractmethod
    def format(cls, *args, **kwargs) -> "ToolData":
        """Format a tool run's tensors into an instance of the class."""
        ...

    @abstractmethod
    def display(self, **kwargs):
        """Display a visualization of the data."""
        ...


class LogitLensMeta(BaseModel):
    version: int = 2
    timestamp: str
    model: str


class _LensData(ToolData):
    """Formatting shared by :class:`LogitLensData` and :class:`JLensData`."""

    @staticmethod
    def _format_lens(
        logits: "torch.Tensor",
        model: "StandardizedTransformer",
        top_k: int = 5,
        include_entropy: bool = True,
    ) -> dict[str, Any]:
        """Format ``[layer, pos, vocab]`` lens logits into the lens fields.

        Returns ``meta``, ``layers``, ``tracked``, ``topk`` and ``entropy``
        (``None`` unless ``include_entropy``), covering the tensor's positions
        in order.

        Overwrites ``logits`` in place (probabilities, then ``p * log p``) so
        no second tensor of this size is allocated. Top-k is ranked on the
        logits; softmax runs per layer with ``dtype`` pinned, since NDIF's
        autocast would otherwise return it in float32.
        """
        import torch
        import torch.nn.functional as F

        tokenizer = model.tokenizer
        _, top_indices = torch.topk(logits, k=top_k, dim=-1)  # [layer, pos, k]

        probs = logits
        for layer_probs in probs:
            layer_probs.copy_(F.softmax(layer_probs, dim=-1, dtype=layer_probs.dtype))

        topk = [
            [
                tokenizer.batch_decode(torch.tensor(pos).unsqueeze(dim=1))
                for pos in layer
            ]
            for layer in top_indices.tolist()
        ]

        unique_indices = [
            torch.unique(top_indices[:, pi, :].flatten(), sorted=False).tolist()
            for pi in range(top_indices.shape[1])
        ]
        tracked_probs = probs.permute(1, 2, 0)  # [pos, vocab, layer]
        tracked = [
            {
                tokenizer.decode(token): torch.round(
                    tracked_probs[pos_idx][token].float(), decimals=3
                ).tolist()
                for token in pos
            }
            for pos_idx, pos in enumerate(unique_indices)
        ]

        if include_entropy:
            # [layer, pos]
            entropy = -probs.xlogy_(probs).sum(dim=-1, dtype=torch.float32)
            entropy = torch.round(entropy, decimals=3).tolist()
        else:
            entropy = None

        return {
            "meta": {"version": 2, "timestamp": "3h", "model": model.repo_id},
            "layers": list(range(model.num_layers)),
            "tracked": tracked,
            "topk": topk,
            "entropy": entropy,
        }


class LogitLensData(_LensData):
    meta: LogitLensMeta
    layers: list[int]
    input: list[str]  # Input tokens as strings (always dense, all tokens)
    positions: list[int] | None = None  # Computed position indices; None = all
    tracked: list[dict[str, list[float]]]  # Per-position: token -> trajectory
    topk: list[list[list[str]]]  # [layer][position] -> list of selected tokens
    entropy: list[list[float]] | None = None  # Optional: [layer][position] -> entropy

    @classmethod
    def format(
        cls,
        logits: "torch.Tensor",
        model: "StandardizedTransformer",
        prompt: str,
        positions: list[int] | None = None,
        top_k: int = 5,
        include_entropy: bool = True,
    ) -> "LogitLensData":
        """Build the logit-lens data from ``[layer, pos, vocab]`` logits.

        ``logits`` holds the rows of ``positions`` (absolute, sorted prompt
        indices; ``None`` for every position) — exactly what
        ``logit_lens(..., raw=True)`` returns, so formatting that output
        with the same arguments gives the non-raw result (move it back to the
        model's device first: the raw tensor is on the CPU, whose reductions
        can round an entropy differently). ``logits`` is overwritten in place
        (see :meth:`_LensData._format_lens`).
        """
        input_tokens = [
            str(model.tokenizer.decode(token))
            for token in model.tokenizer.encode(prompt)
        ]
        if positions is None:
            positions = list(range(len(input_tokens)))

        lens = cls._format_lens(logits, model, top_k, include_entropy)
        return cls(input=input_tokens, positions=positions, **lens)

    def display(self, **kwargs):
        from nnsightful.viz import display_logit_lens

        return display_logit_lens(self, **kwargs)


class JLensMeta(BaseModel):
    version: int = 2
    timestamp: str
    model: str


class JLensData(_LensData):
    meta: JLensMeta
    layers: list[int]
    input: list[str]  # Input tokens as strings (always dense, all tokens)
    completion: list[str] | None = None
    positions: list[int] | None = None  # Computed position indices; None = all
    tracked: list[dict[str, list[float]]]  # Per-position: token -> trajectory
    topk: list[list[list[str]]]  # [layer][position] -> list of selected tokens
    entropy: list[list[float]] | None = None  # Optional: [layer][position] -> entropy

    @classmethod
    def format(
        cls,
        logits: "torch.Tensor | Sequence[torch.Tensor]",
        model: "StandardizedTransformer",
        prompt: str,
        token_ids: list[int] | None = None,
        positions: list[int] | None = None,
        top_k: int = 5,
        include_entropy: bool = True,
    ) -> "JLensData":
        """Build the j-lens data from ``[layer, pos, vocab]`` logits.

        ``logits`` is either one tensor per generation step (the prefill pass's
        rows, then one row per decode step) or those steps concatenated along
        the position axis, as ``j_lens(..., raw=True)`` returns them
        (on the CPU; as for :meth:`LogitLensData.format`, move it to the
        model's device for the non-raw result). Each is formatted and
        overwritten in place (see :meth:`_LensData._format_lens`) and the
        steps' rows are merged, so taking the steps one at a time needs no
        concatenated copy.

        ``positions`` are the selected *prompt* positions (absolute, sorted;
        ``None`` for all); the rows after them are generated positions, and
        the result's ``positions`` lists both (``None`` when ``positions`` is
        ``None``). ``token_ids`` is the generated sequence (prompt first) that
        labels ``input`` and ``completion``; it defaults to the prompt's own
        tokens, which suffices when there are no generated rows
        (``max_new_tokens=1``).
        """
        import torch

        steps = [logits] if isinstance(logits, torch.Tensor) else logits
        prompt_ids = model.tokenizer.encode(prompt)
        prompt_len = len(prompt_ids)
        if token_ids is None:
            token_ids = prompt_ids

        n_rows = sum(step.shape[1] for step in steps)
        n_prompt_rows = prompt_len if positions is None else len(positions)
        seq_len = prompt_len + n_rows - n_prompt_rows

        lens = None
        for step_logits in steps:
            step = cls._format_lens(step_logits, model, top_k, include_entropy)
            if lens is None:
                lens = step
                continue
            lens["tracked"].extend(step["tracked"])
            for layer_topk, step_topk in zip(lens["topk"], step["topk"]):
                layer_topk.extend(step_topk)
            if lens["entropy"] is not None:
                for layer_ent, step_ent in zip(lens["entropy"], step["entropy"]):
                    layer_ent.extend(step_ent)

        tokens = [str(model.tokenizer.decode(token)) for token in token_ids[:seq_len]]
        return cls(
            input=tokens[:prompt_len],
            completion=tokens[prompt_len:],
            positions=(
                None
                if positions is None
                else positions + list(range(prompt_len, seq_len))
            ),
            **lens,
        )

    def display(self, **kwargs):
        from nnsightful.viz import display_j_lens

        return display_j_lens(self, **kwargs)


class ActivationPatchingData(ToolData):
    lines: list[list[float]]  # [token][layer] probabilities
    ranks: list[list[int]]  # [token][layer] ranks
    prob_diffs: list[list[float]]  # [token][layer] prob diffs
    tokenLabels: list[str]  # Token text labels for each line

    @classmethod
    def format(
        cls,
        src_pred: "torch.Tensor",
        clean_pred: "torch.Tensor",
        patched_logits: "Sequence[torch.Tensor]",
        clean_probs: "torch.Tensor",
        tokenizer: "PreTrainedTokenizerBase",
    ) -> "ActivationPatchingData":
        """Build the activation-patching data.

        Takes the source and clean runs' predicted token ids, the patched
        run's last-position logits (one ``[vocab]`` tensor per patched layer)
        and the clean run's probabilities — the pieces
        ``activation_patching(..., raw=True)`` returns, so
        ``format(**raw)`` gives the non-raw result.

        The tokens are the source and clean predictions, then the union of
        every layer's top 10 ordered by total rank across layers. For each,
        ``lines``, ``ranks`` and ``prob_diffs`` (relative to the clean run)
        give its per-layer probability, exact rank and probability change.
        """
        import torch
        import torch.nn.functional as F

        # [L, V]
        patched_logits = torch.stack([t.detach() for t in patched_logits], dim=0)
        patched_probs = F.softmax(patched_logits, dim=-1)
        L, V = patched_probs.shape
        dev = patched_probs.device

        topk_idx = patched_probs.topk(k=10, dim=1).indices  # [L, 10]
        cand = torch.unique(topk_idx.flatten())  # [K]
        cand = cand[(cand != src_pred.item()) & (cand != clean_pred.item())]
        fixed = torch.tensor([src_pred, clean_pred], device=dev, dtype=cand.dtype)
        token_ids = torch.cat([fixed, cand], dim=0)  # [T]

        probs_mat = patched_probs.index_select(1, token_ids)  # [L, T]

        sorted_idx = patched_probs.argsort(dim=1, descending=True)
        inv_rank = torch.empty_like(sorted_idx)
        arange_V = torch.arange(V, device=dev).expand(L, V)
        inv_rank.scatter_(1, sorted_idx, arange_V)
        ranks_mat = inv_rank.index_select(1, token_ids)  # [L, T]

        clean_probs = clean_probs.to(token_ids.device)
        clean_probs_T = clean_probs.index_select(0, token_ids)
        prob_diff_mat = probs_mat - clean_probs_T.unsqueeze(0)

        total_rank = ranks_mat.sum(dim=0)  # [T]
        rem_order = torch.argsort(total_rank[2:]) + 2
        order = torch.cat([torch.tensor([0, 1], device=dev), rem_order], dim=0)

        token_ids = token_ids[order]
        probs_mat = probs_mat[:, order]
        ranks_mat = ranks_mat[:, order]
        prob_diff_mat = prob_diff_mat[:, order]

        probabilities = [
            [round(p, 4) for p in row] for row in probs_mat.transpose(0, 1).tolist()
        ]
        ranks = ranks_mat.transpose(0, 1).tolist()
        prob_diffs = [
            [round(d, 4) for d in row] for row in prob_diff_mat.transpose(0, 1).tolist()
        ]
        labels = [tokenizer.decode(int(tid)) for tid in token_ids]

        return cls(
            lines=probabilities, ranks=ranks, prob_diffs=prob_diffs, tokenLabels=labels
        )

    def display(self, tokens: list[int] | None = None, return_html: bool = False, **kwargs):
        from nnsightful.viz import display_activation_patching

        data = self.model_dump()
        n = len(self.lines)
        selected = tokens if tokens is not None else list(range(min(2, n)))
        selected = [i for i in selected if i < n]
        options = kwargs.pop("options", {}) or {}
        options["selectedTokens"] = selected
        return display_activation_patching(
            data, options=options, return_html=return_html, **kwargs
        )
