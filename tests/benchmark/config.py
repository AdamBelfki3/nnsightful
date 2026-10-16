"""Runnable tool configs for the JSON benchmark definitions.

The benchmarks themselves (models, tools, fixed args, sweeps, meta
params) live in ``benchmarks/*.json``; this module maps each tool name to
the nnsightful tool and the Python that builds its arguments per model
(prompt construction, activation-patching positions, j-lens Jacobians).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from itertools import product
from typing import TYPE_CHECKING, Any, Callable

from nnsightful.tools._base import Tool
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.j_lens import JLensTool, j_lens
from nnsightful.tools.logit_lens import logit_lens

from .definitions import tool_label
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
        tool_name: The name the tool's tests carry (e.g. ``logit_lens[length]``).
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
    """Patch the last position of equal-length prompts (positions track the length)."""
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


TOOLS: dict[str, tuple[Tool, ArgBuilder]] = {
    "logit_lens": (logit_lens, _logit_lens_length_build),
    "activation_patching": (activation_patching, _activation_patching_length_build),
    "j_lens": (j_lens, _j_lens_length_build),
}


def tool_configs(
    defn: dict[str, Any],
    tools: list[str] | None = None,
    params: dict[str, list[Any]] | None = None,
) -> list[ToolBenchmarkConfig]:
    """The runnable configs of a benchmark definition.

    *tools* keeps only tools whose name contains one of the substrings;
    *params* replaces the values of matching sweep parameters (latency).
    """
    out = []
    for entry in defn["tools"]:
        label = tool_label(entry)
        if tools and not any(t in label for t in tools):
            continue
        if entry["tool"] not in TOOLS:
            raise KeyError(
                f"{defn['name']}: no runner for tool {entry['tool']!r} "
                f"(known: {sorted(TOOLS)})"
            )
        tool, build = TOOLS[entry["tool"]]
        sweep = dict(entry.get("sweep", {}))
        for key, values in (params or {}).items():
            if key in sweep:
                sweep[key] = values
        out.append(
            ToolBenchmarkConfig(
                tool_name=label,
                tool=tool,
                fixed_args=dict(entry.get("fixed_args", {})),
                sweep_params=sweep if defn["dimension"] == "latency" else {},
                build_args=build,
                sweep_axis=defn["meta_params"].get("swept", "prompt_length"),
            )
        )
    return out


def sweep_combos(config: ToolBenchmarkConfig) -> list[dict[str, Any]]:
    keys = list(config.sweep_params)
    return [
        dict(zip(keys, values)) for values in product(*config.sweep_params.values())
    ]
