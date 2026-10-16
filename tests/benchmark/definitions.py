"""Benchmark definitions: one JSON file per named, versioned benchmark.

``benchmarks/<name>.json`` is the current definition; ``benchmarks/archive/
<name>.v<N>.json`` keeps older versions that results still refer to.
A definition expands to its *tests*: every tool × model × sweep combo
(latency) or tool × model (peak_mem). Pure JSON logic, no torch.
"""

from __future__ import annotations

import hashlib
import json
from itertools import product
from pathlib import Path
from typing import Any

DEFINITIONS_DIR = Path(__file__).parent / "benchmarks"
ARCHIVE_DIR = DEFINITIONS_DIR / "archive"

KINDS = ("local", "remote")
DIMENSIONS = ("latency", "peak_mem")
_REQUIRED = ("name", "version", "kind", "dimension", "meta_params", "models", "tools")
_UNHASHED = ("version", "description")


class DefinitionError(ValueError):
    """A benchmark definition file is missing fields or malformed."""


def validate(defn: dict[str, Any], source: str = "<definition>") -> dict[str, Any]:
    """Check *defn*'s fields and types; returns it unchanged."""
    missing = [f for f in _REQUIRED if f not in defn]
    if missing:
        raise DefinitionError(f"{source}: missing field(s) {missing}")
    if not isinstance(defn["version"], int) or defn["version"] < 0:
        raise DefinitionError(f"{source}: version must be a non-negative integer")
    if defn["kind"] not in KINDS:
        raise DefinitionError(f"{source}: kind must be one of {KINDS}")
    if defn["dimension"] not in DIMENSIONS:
        raise DefinitionError(f"{source}: dimension must be one of {DIMENSIONS}")
    if defn["dimension"] == "peak_mem" and defn["kind"] != "local":
        raise DefinitionError(f"{source}: peak_mem benchmarks are local only")
    if not defn["models"] or not all(isinstance(m, str) for m in defn["models"]):
        raise DefinitionError(f"{source}: models must be a non-empty list of names")
    for model in defn.get("optional_models", []):
        if model not in defn["models"]:
            raise DefinitionError(f"{source}: optional model {model!r} is not in models")
    for tool in defn["tools"]:
        if "tool" not in tool:
            raise DefinitionError(f"{source}: every tools entry needs a 'tool'")
        optional = tool.get("optional", False)
        if not isinstance(optional, (bool, list)):
            raise DefinitionError(f"{source}: {tool['tool']}.optional must be true/false or a list of models")
        if isinstance(optional, list) and not set(optional) <= set(defn["models"]):
            raise DefinitionError(f"{source}: {tool['tool']}.optional lists models not in models")
        if defn["dimension"] == "latency" and not tool.get("sweep"):
            raise DefinitionError(f"{source}: latency tool {tool['tool']} needs a 'sweep'")
    names = [tool_label(t) for t in defn["tools"]]
    if len(names) != len(set(names)):
        raise DefinitionError(f"{source}: duplicate test names {names}")
    return defn


def load_definition(path: Path) -> dict[str, Any]:
    try:
        defn = json.loads(Path(path).read_text())
    except json.JSONDecodeError as e:
        raise DefinitionError(f"{path} is not valid JSON ({e})") from e
    return validate(defn, str(path))


def load_definitions(directory: Path | None = None) -> dict[str, dict[str, Any]]:
    """Current definitions by name, from ``<directory>/*.json``."""
    directory = directory or DEFINITIONS_DIR
    defs = {}
    for path in sorted(directory.glob("*.json")):
        defn = load_definition(path)
        if defn["name"] in defs:
            raise DefinitionError(f"{path}: duplicate benchmark name {defn['name']!r}")
        same = [d["name"] for d in defs.values() if (d["dimension"], d["kind"]) == (defn["dimension"], defn["kind"])]
        if same:
            raise DefinitionError(f"{path}: {same[0]!r} already is the {defn['kind']} {defn['dimension']} benchmark")
        defs[defn["name"]] = defn
    return defs


def load_archive(directory: Path | None = None) -> list[dict[str, Any]]:
    """Archived (older-version) definitions."""
    directory = directory or ARCHIVE_DIR
    return [load_definition(p) for p in sorted(directory.glob("*.json"))] if directory.exists() else []


def config_hash(defn: dict[str, Any]) -> str:
    """Hash of everything that defines the tests (all fields but ``version`` and ``description``)."""
    content = {k: v for k, v in defn.items() if k not in _UNHASHED}
    return hashlib.sha256(json.dumps(content, sort_keys=True).encode()).hexdigest()[:16]


def stamp(defn: dict[str, Any]) -> dict[str, Any]:
    """The ``benchmark`` field of a result: name, version, config hash, kind and dimension."""
    return {
        "name": defn["name"], "version": defn["version"], "config_hash": config_hash(defn),
        "kind": defn["kind"], "dimension": defn["dimension"],
    }


def tool_label(tool: dict[str, Any]) -> str:
    """The name a tool's tests carry (``name``, defaulting to the tool)."""
    return tool.get("name", tool["tool"])


def is_optional(defn: dict[str, Any], tool: dict[str, Any], model: str) -> bool:
    """Optional if the model is in ``optional_models`` or the tool's ``optional`` is true / lists it."""
    if model in defn.get("optional_models", []):
        return True
    optional = tool.get("optional", False)
    return optional is True or (isinstance(optional, list) and model in optional)


def sweep_combos(sweep: dict[str, list[Any]]) -> list[dict[str, Any]]:
    keys = list(sweep)
    return [dict(zip(keys, values)) for values in product(*sweep.values())]


def expand_tests(defn: dict[str, Any]) -> list[dict[str, Any]]:
    """Every test of *defn* as ``{tool, model, params, optional}``, in definition order.

    Latency params are the sweep combos; peak_mem params are the tool's fixed args.
    """
    tests = []
    for tool in defn["tools"]:
        for model in defn["models"]:
            if defn["dimension"] == "peak_mem":
                params_list = [dict(tool.get("fixed_args", {}))]
            else:
                params_list = sweep_combos(tool["sweep"])
            for params in params_list:
                tests.append({
                    "tool": tool_label(tool), "model": model, "params": params,
                    "optional": is_optional(defn, tool, model),
                })
    return tests


def tool_entry(defn: dict[str, Any], name: str) -> dict[str, Any]:
    return next(t for t in defn["tools"] if tool_label(t) == name)


def version_warnings(defs: dict[str, dict[str, Any]], recorded: list[dict[str, Any]]) -> list[str]:
    """Warn when a definition changed (different config hash) but kept a recorded version."""
    out = []
    for stamped in recorded:
        defn = defs.get(stamped.get("name"))
        if defn is None or stamped.get("version") != defn["version"]:
            continue
        if stamped.get("config_hash") and stamped["config_hash"] != config_hash(defn):
            out.append(
                f"benchmark {defn['name']!r} v{defn['version']}: definition changed since these "
                f"results were recorded (config hash {stamped['config_hash']} -> {config_hash(defn)}) "
                f"but its version wasn't bumped"
            )
    return out
