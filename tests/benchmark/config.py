"""Benchmark configuration: the full test matrix per dimension block.

A block (``latency.local``, ``latency.remote``, ``peak_mem``) is tools ×
models × swept params; every combination is one *slot* in the results
files, measured or not.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from itertools import product
from typing import TYPE_CHECKING, Any, Callable

from nnsightful.tools._base import Tool
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.j_lens import JLensTool, j_lens
from nnsightful.tools.logit_lens import logit_lens

from .prompts import prompt_of_length

if TYPE_CHECKING:
    import torch
    from nnterp import StandardizedTransformer


class UnsupportedTest(Exception):
    """The tool doesn't apply to this model (e.g. no published j-lens)."""


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
        sweep_axis: For peak-memory configs, the parameter the memory
            search sweeps (passed to ``build_args`` as ``{axis: n}``).
    """

    tool_name: str
    tool: Tool
    fixed_args: dict[str, Any] = field(default_factory=dict)
    sweep_params: dict[str, list[Any]] = field(default_factory=dict)
    build_args: ArgBuilder | None = None
    sweep_axis: str = "prompt_length"


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
    """Patch the last position of equal-length prompts, so positions track the length."""
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


_JACOBIANS: dict[str, dict[int, "torch.Tensor"]] = {}


def _j_lens_length_build(
    model: "StandardizedTransformer",
    fixed: dict[str, Any],
    sweep: dict[str, Any],
) -> dict[str, Any]:
    """Like the logit-lens builder, plus preloaded Jacobians for local models.

    Raises :class:`UnsupportedTest` for a model without a published lens.
    Locally the Jacobians are loaded once per model (on CPU) so each call
    doesn't re-read the checkpoint; remote calls leave them to the server.
    """
    try:
        repo_id, filename = JLensTool.get_lens_config(model.repo_id)
    except ValueError as exc:
        raise UnsupportedTest(str(exc)) from exc
    args = _logit_lens_length_build(model, fixed, sweep)
    if model.dispatched:
        if model.repo_id not in _JACOBIANS:
            _JACOBIANS[model.repo_id] = JLensTool.load_jacobians(filename, repo_id)
        args["jacobians"] = dict(_JACOBIANS[model.repo_id])
    return args


def default_configs() -> list[ToolBenchmarkConfig]:
    """Return the built-in latency configurations."""
    return [
        ToolBenchmarkConfig(
            tool_name="logit_lens[length]",
            tool=logit_lens,
            fixed_args={"top_k": 5, "include_entropy": True},
            sweep_params={"prompt_length": [10, 25, 50]},
            build_args=_logit_lens_length_build,
        ),
        ToolBenchmarkConfig(
            tool_name="activation_patching[length]",
            tool=activation_patching,
            fixed_args={},
            sweep_params={"prompt_length": [10, 25, 50]},
            build_args=_activation_patching_length_build,
        ),
        ToolBenchmarkConfig(
            tool_name="j_lens[length]",
            tool=j_lens,
            fixed_args={"top_k": 5, "include_entropy": True},
            sweep_params={"prompt_length": [10, 25, 50]},
            build_args=_j_lens_length_build,
        ),
    ]


def memory_configs() -> list[ToolBenchmarkConfig]:
    """Return the built-in peak-memory configurations.

    ``fixed_args`` become the run's ``params``; ``sweep_axis`` is searched
    by the runner rather than listed up front.
    """
    return [
        ToolBenchmarkConfig(
            tool_name="logit_lens",
            tool=logit_lens,
            fixed_args={"top_k": 5, "include_entropy": True},
            build_args=_logit_lens_length_build,
        ),
        ToolBenchmarkConfig(
            tool_name="activation_patching",
            tool=activation_patching,
            build_args=_activation_patching_length_build,
        ),
        ToolBenchmarkConfig(
            tool_name="j_lens",
            tool=j_lens,
            fixed_args={"top_k": 5, "include_entropy": True},
            build_args=_j_lens_length_build,
        ),
    ]


LOCAL_MODELS = [
    "openai-community/gpt2",
    "google/gemma-3-1b-pt",
    "meta-llama/Llama-3.1-8B",
]
REMOTE_MODELS = [
    "openai-community/gpt2",
    "meta-llama/Llama-3.1-8B",
    "meta-llama/Llama-3.1-70B",
    "meta-llama/Llama-3.1-405B-Instruct",
]
PEAK_MEM_MODELS = list(LOCAL_MODELS)


@dataclass
class BlockConfig:
    """One dimension block's matrix: every tool config × every model."""

    models: list[str]
    tools: list[ToolBenchmarkConfig]


def benchmark_config() -> dict[str, BlockConfig]:
    """The full benchmark matrix, keyed by block name."""
    return {
        "latency.local": BlockConfig(LOCAL_MODELS, default_configs()),
        "latency.remote": BlockConfig(REMOTE_MODELS, default_configs()),
        "peak_mem": BlockConfig(PEAK_MEM_MODELS, memory_configs()),
    }


def sweep_combos(config: ToolBenchmarkConfig) -> list[dict[str, Any]]:
    keys = list(config.sweep_params)
    return [dict(zip(keys, values)) for values in product(*config.sweep_params.values())]


def slot_params(block: str, config: ToolBenchmarkConfig) -> list[dict[str, Any]]:
    """A tool config's slot params: sweep combos for latency, the fixed args for peak_mem."""
    if block == "peak_mem":
        return [dict(config.fixed_args)]
    return sweep_combos(config)


def block_slots(block: str, config: BlockConfig) -> list[dict[str, Any]]:
    """Every ``{tool, model, params}`` slot of a block, in config order."""
    return [
        {"tool": tool.tool_name, "model": model, "params": params}
        for tool in config.tools
        for model in config.models
        for params in slot_params(block, tool)
    ]


def config_slots(config: dict[str, BlockConfig] | None = None) -> dict[str, list[dict[str, Any]]]:
    """``block -> slots`` for the whole matrix (default: :func:`benchmark_config`)."""
    config = config or benchmark_config()
    return {name: block_slots(name, block) for name, block in config.items()}
