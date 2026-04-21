"""Prompt helpers for length-parametrized benchmarks.

The benchmarks want to vary prompt length (in tokens) as a sweep axis,
but tokenization is model-dependent, so prompts have to be generated
per-model. These helpers tokenize a long base text and slice it to a
requested length, then decode back to a string.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from transformers import PreTrainedTokenizerBase


# Two base texts of roughly similar structure. Long enough that any
# reasonable tokenizer produces well over 50 tokens.
_BASE_SRC = (
    "The Eiffel Tower is a famous landmark located in the heart of France. "
    "It was built in 1889 for the World's Fair and stands over three hundred "
    "meters tall. Every year millions of tourists travel to see it, making "
    "it one of the most visited monuments in the world. The tower is in"
)

_BASE_TGT = (
    "The Colosseum is a famous landmark located in the heart of Italy. "
    "It was built in the first century as a grand amphitheater and stands "
    "nearly fifty meters tall. Every year millions of tourists travel to "
    "see it, making it one of the most visited monuments in the world. "
    "The amphitheater is in"
)

_FILLER = (
    "The quick brown fox jumps over the lazy dog. " * 100
)


def _truncate_to_length(
    tokenizer: "PreTrainedTokenizerBase", text: str, n: int
) -> str:
    """Return a string that re-encodes to exactly ``n`` tokens.

    Naive ``decode(encode(text)[:n])`` doesn't guarantee an N-token output
    because BPE decode→re-encode can drift by a token or two at boundaries
    (special tokens, whitespace normalization, merges). Since the tools we
    feed this into re-tokenize the string, the sweep axis would be off by
    the drift amount without correction. We iterate: decode a prefix,
    measure the re-encoded length, shift the prefix boundary, retry.
    """
    ids = tokenizer.encode(text)
    if len(ids) < n * 2:
        # Pad generously so we have headroom to grow the prefix if the
        # drift pushes us below n.
        ids = ids + tokenizer.encode(_FILLER)

    k = n  # number of source token ids to decode from
    decoded = tokenizer.decode(ids[:k])
    for _ in range(16):
        actual = len(tokenizer.encode(decoded))
        if actual == n:
            return decoded
        # Shift k toward the target. Treating the source→decoded→re-encoded
        # length as roughly monotonic lets this converge in 2-3 iterations
        # for typical BPE drift.
        k = max(1, min(k + (n - actual), len(ids)))
        decoded = tokenizer.decode(ids[:k])

    # Give up after 16 iterations; return best effort and warn. In practice
    # this shouldn't fire for mainstream tokenizers at the sweep sizes we use.
    actual = len(tokenizer.encode(decoded))
    if actual != n:
        print(
            f"warning: prompt_of_length could not converge to exactly {n} "
            f"tokens (got {actual}); latency sweep axis may be slightly off."
        )
    return decoded


def prompt_of_length(
    tokenizer: "PreTrainedTokenizerBase", n: int, *, variant: str = "src"
) -> str:
    """Return a prompt of exactly *n* tokens for the given tokenizer.

    Args:
        tokenizer: The model's tokenizer.
        n: Target token count.
        variant: ``"src"`` or ``"tgt"`` — selects which base text is used.
            Used by activation patching to get two distinct-but-structurally-
            similar prompts.
    """
    base = _BASE_SRC if variant == "src" else _BASE_TGT
    return _truncate_to_length(tokenizer, base, n)
