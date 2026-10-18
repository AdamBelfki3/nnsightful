"""Benchmark definitions: one JSON file per named, versioned benchmark.

``benchmarks/<name>.json`` is the current definition; ``benchmarks/archive/
<name>.v<N>.json`` keeps older versions that results still refer to.
A definition expands to its *tests*: every tool × model × sweep combo
(latency) or tool × model (peak_mem). Pure JSON logic, no torch.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from .sweeps import GridSweep


class DefinitionError(ValueError):
    """A benchmark definition file is missing fields or malformed."""


class BenchmarkDefinition(dict):
    """One benchmark definition: the JSON object itself, plus the rules on it.

    A ``dict`` subclass, so it is used (and serialized) exactly like the
    JSON it was loaded from.
    """

    DIR = Path(__file__).parent / "benchmarks"
    ARCHIVE_DIR = DIR / "archive"
    KINDS = ("local", "remote")
    DIMENSIONS = ("latency", "peak_mem")
    REQUIRED = (
        "name",
        "version",
        "kind",
        "dimension",
        "meta_params",
        "models",
        "tools",
    )
    UNHASHED = ("version", "description")

    @classmethod
    def of(cls, defn: dict[str, Any]) -> "BenchmarkDefinition":
        """*defn* as a definition (unchanged if it already is one; not validated)."""
        return defn if isinstance(defn, cls) else cls(defn)

    # ---- loading -----------------------------------------------------------

    @classmethod
    def load(cls, path: Path) -> "BenchmarkDefinition":
        try:
            data = json.loads(Path(path).read_text())
        except json.JSONDecodeError as e:
            raise DefinitionError(f"{path} is not valid JSON ({e})") from e
        return cls(data).validate(str(path))

    @classmethod
    def load_all(
        cls, directory: Path | None = None
    ) -> dict[str, "BenchmarkDefinition"]:
        """Current definitions by name, from ``<directory>/*.json``."""
        directory = directory or cls.DIR
        defs: dict[str, BenchmarkDefinition] = {}
        for path in sorted(directory.glob("*.json")):
            defn = cls.load(path)
            if defn["name"] in defs:
                raise DefinitionError(
                    f"{path}: duplicate benchmark name {defn['name']!r}"
                )
            same = [
                d["name"]
                for d in defs.values()
                if d.dimension_kind == defn.dimension_kind
            ]
            if same:
                raise DefinitionError(
                    f"{path}: {same[0]!r} already is the {defn['kind']} "
                    f"{defn['dimension']} benchmark"
                )
            defs[defn["name"]] = defn
        return defs

    @classmethod
    def load_archive(cls, directory: Path | None = None) -> list["BenchmarkDefinition"]:
        """Archived (older-version) definitions."""
        directory = directory or cls.ARCHIVE_DIR
        if not directory.exists():
            return []
        return [cls.load(p) for p in sorted(directory.glob("*.json"))]

    # ---- rules -------------------------------------------------------------

    def validate(self, source: str = "<definition>") -> "BenchmarkDefinition":
        """Check the fields and types; returns the definition."""
        missing = [f for f in self.REQUIRED if f not in self]
        if missing:
            raise DefinitionError(f"{source}: missing field(s) {missing}")
        if not isinstance(self["version"], int) or self["version"] < 0:
            raise DefinitionError(f"{source}: version must be a non-negative integer")
        if self["kind"] not in self.KINDS:
            raise DefinitionError(f"{source}: kind must be one of {self.KINDS}")
        if self["dimension"] not in self.DIMENSIONS:
            raise DefinitionError(
                f"{source}: dimension must be one of {self.DIMENSIONS}"
            )
        if self["dimension"] == "peak_mem" and self["kind"] != "local":
            raise DefinitionError(f"{source}: peak_mem benchmarks are local only")
        models = self["models"]
        if not models or not all(isinstance(m, str) for m in models):
            raise DefinitionError(f"{source}: models must be a non-empty list of names")
        for model in self.get("optional_models", []):
            if model not in models:
                raise DefinitionError(
                    f"{source}: optional model {model!r} is not in models"
                )
        for tool in self["tools"]:
            if "tool" not in tool:
                raise DefinitionError(f"{source}: every tools entry needs a 'tool'")
            optional = tool.get("optional", False)
            if not isinstance(optional, (bool, list)):
                raise DefinitionError(
                    f"{source}: {tool['tool']}.optional must be true/false or a list "
                    "of models"
                )
            if isinstance(optional, list) and not set(optional) <= set(models):
                raise DefinitionError(
                    f"{source}: {tool['tool']}.optional lists models not in models"
                )
            if self["dimension"] == "latency" and not tool.get("sweep"):
                raise DefinitionError(
                    f"{source}: latency tool {tool['tool']} needs a 'sweep'"
                )
        bias = self["meta_params"].get("padding_bias", 0)
        if not isinstance(bias, int) or isinstance(bias, bool) or bias < 0:
            raise DefinitionError(
                f"{source}: padding_bias must be a non-negative integer (bytes)"
            )
        names = [self.tool_label(t) for t in self["tools"]]
        if len(names) != len(set(names)):
            raise DefinitionError(f"{source}: duplicate test names {names}")
        return self

    @property
    def dimension_kind(self) -> tuple[str, str]:
        """``(dimension, kind)``: there is one benchmark per pair."""
        return self["dimension"], self["kind"]

    @staticmethod
    def tool_label(tool: dict[str, Any]) -> str:
        """The name a tool's tests carry (``name``, defaulting to the tool)."""
        return tool.get("name", tool["tool"])

    def is_optional(self, tool: dict[str, Any], model: str) -> bool:
        """In ``optional_models``, or the tool's ``optional`` is true / lists it."""
        if model in self.get("optional_models", []):
            return True
        optional = tool.get("optional", False)
        return optional is True or (isinstance(optional, list) and model in optional)

    def tests(self) -> list[dict[str, Any]]:
        """Every test as ``{tool, model, params, optional}``, in definition order.

        Latency params are the sweep combos; peak_mem params are the tool's
        fixed args.
        """
        tests = []
        for tool in self["tools"]:
            for model in self["models"]:
                if self["dimension"] == "peak_mem":
                    params_list = [dict(tool.get("fixed_args", {}))]
                else:
                    params_list = GridSweep(tool["sweep"]).points()
                for params in params_list:
                    tests.append(
                        {
                            "tool": self.tool_label(tool),
                            "model": model,
                            "params": params,
                            "optional": self.is_optional(tool, model),
                        }
                    )
        return tests

    def config_hash(self) -> str:
        """Hash of the fields defining the tests (all but version, description)."""
        content = {k: v for k, v in self.items() if k not in self.UNHASHED}
        digest = hashlib.sha256(json.dumps(content, sort_keys=True).encode())
        return digest.hexdigest()[:16]

    def stamp(self) -> dict[str, Any]:
        """A result's ``benchmark`` field: name, version, hash, kind, dimension."""
        return {
            "name": self["name"],
            "version": self["version"],
            "config_hash": self.config_hash(),
            "kind": self["kind"],
            "dimension": self["dimension"],
        }

    def version_warnings(self, recorded: list[dict[str, Any]]) -> list[str]:
        """Warn when the definition changed (config hash) but kept its version."""
        out = []
        for stamped in recorded:
            if (
                stamped.get("name") != self["name"]
                or stamped.get("version") != self["version"]
            ):
                continue
            current = self.config_hash()
            if stamped.get("config_hash") and stamped["config_hash"] != current:
                out.append(
                    f"benchmark {self['name']!r} v{self['version']}: definition "
                    f"changed since these results were recorded (config hash "
                    f"{stamped['config_hash']} -> {current}) "
                    f"but its version wasn't bumped"
                )
        return out
