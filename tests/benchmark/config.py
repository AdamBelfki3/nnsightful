"""Benchmark configuration: tool configs with parameter sweeps."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any, Callable

from nnsightful.tools._base import Tool
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.logit_lens import logit_lens

from .prompts import prompt_of_length

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


ArgBuilder = Callable[
    ["StandardizedTransformer", dict[str, Any], dict[str, Any]],
    dict[str, Any],
]


@dataclass
class ToolBenchmarkConfig:
    """Configuration for benchmarking a single tool.

    Attributes:
        tool_name: Human-readable name for this benchmark group.
        tool: The tool instance to benchmark.
        fixed_args: kwargs that stay constant across all sweep combinations.
        sweep_params: Mapping of parameter name to a list of values to
            sweep over.  The runner tests every combination (cartesian
            product) of these values.
        build_args: Optional function ``(model, fixed_args, sweep_dict)
            -> final_kwargs``.  When set, the runner calls this to
            produce the final kwargs for each combo instead of simply
            merging ``fixed_args`` with ``sweep_dict``.  Use this when
            arguments depend on the model (e.g., prompt length in
            tokens requires access to the tokenizer).
    """

    tool_name: str
    tool: Tool
    fixed_args: dict[str, Any] = field(default_factory=dict)
    sweep_params: dict[str, list[Any]] = field(default_factory=dict)
    build_args: ArgBuilder | None = None


def _logit_lens_length_build(
    model: "StandardizedTransformer",
    fixed: dict[str, Any],
    sweep: dict[str, Any],
) -> dict[str, Any]:
    n = sweep["prompt_length"]
    prompt = prompt_of_length(model.tokenizer, n, variant="src")
    return {**fixed, "prompt": prompt}


def _activation_patching_length_build(
    model: "StandardizedTransformer",
    fixed: dict[str, Any],
    sweep: dict[str, Any],
) -> dict[str, Any]:
    n = sweep["prompt_length"]
    src = prompt_of_length(model.tokenizer, n, variant="src")
    tgt = prompt_of_length(model.tokenizer, n, variant="tgt")
    last = n - 1
    return {
        **fixed,
        "src_prompt": src,
        "tgt_prompt": tgt,
        "src_pos": [last],
        "tgt_pos": [last],
        "tgt_freeze": [],
    }


def default_configs() -> list[ToolBenchmarkConfig]:
    """Return the built-in benchmark configurations."""
    return [
        # Logit lens: sweep over prompt length (primary latency driver)
        ToolBenchmarkConfig(
            tool_name="logit_lens[length]",
            tool=logit_lens,
            fixed_args={"top_k": 5, "include_entropy": True},
            sweep_params={"prompt_length": [10, 25, 50]},
            build_args=_logit_lens_length_build,
        ),
        # Activation patching: sweep over prompt length
        ToolBenchmarkConfig(
            tool_name="activation_patching[length]",
            tool=activation_patching,
            fixed_args={},
            sweep_params={"prompt_length": [10, 25, 50]},
            build_args=_activation_patching_length_build,
        ),
    ]
