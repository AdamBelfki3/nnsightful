"""Helpers shared by the tool tests."""

from __future__ import annotations

import torch


def decode_each(model, ids) -> list[str]:
    """Decode every token id on its own, as the tools label positions."""
    return [model.tokenizer.decode(int(i)) for i in ids]


def model_logits(model, prompt: str) -> torch.Tensor:
    """The model's own ``[pos, vocab]`` output logits for *prompt*, float32."""
    with torch.no_grad(), model.trace(prompt):
        logits = model.logits[0].save()
    return logits.float().cpu()
