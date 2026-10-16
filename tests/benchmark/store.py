"""Results files: benchmark results, promotion, and upgrades of older files.

``run.json`` maps each benchmark name to one *result*::

    {"benchmark": {"name", "version", "config_hash"}, "status": "complete" | "incomplete",
     "env": {...}, "meta_params": {...},
     "results": [{"tool", "model", "params", "stats"}, ...],
     "failed": [{"tool", "model", "params", "status", "error"}, ...],
     "optional_failed": [...]}

``baseline.json`` maps each benchmark name to its last promoted result
plus ``previous``: the result that one replaced (or null).

Pure JSON logic, no torch.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

from . import legacy
from .definitions import KINDS, expand_tests, load_archive, load_definitions, stamp

BENCH_DIR = Path(__file__).parent
BASELINE_FILE = BENCH_DIR / "baseline.json"
RUN_FILE = BENCH_DIR / "run.json"
LEGACY_BASELINE_FILE = BENCH_DIR / "results.json"
LEGACY_RUN_FILE = BENCH_DIR / "latest.json"

COMPLETE, INCOMPLETE = "complete", "incomplete"
OK, NOT_RUN, FAILED, UNSUPPORTED = "ok", "not_run", "failed", "unsupported"

ENV_KINDS = KINDS
_TEST_FIELDS = ("tool", "model", "params")
_NOT_WARNED = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")


# ---------------------------------------------------------------------------
# Tests and results
# ---------------------------------------------------------------------------


def case_id(test: dict[str, Any]) -> str:
    """A test's identity within a benchmark: (tool, model, params)."""
    return json.dumps({k: test[k] for k in _TEST_FIELDS}, sort_keys=True, default=str)


def make_result(
    defn: dict[str, Any] | None,
    env: dict[str, Any],
    meta_params: dict[str, Any],
    outcomes: list[dict[str, Any]],
    benchmark: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """A benchmark result from per-test outcomes (``status`` ok / failed / unsupported / not_run).

    Tests of *defn* without an outcome count as ``not_run``. The result is
    ``incomplete`` if any non-optional test didn't end ``ok``.
    """
    by_id = {case_id(o): o for o in outcomes}
    tests = expand_tests(defn) if defn else [
        {**{k: o[k] for k in _TEST_FIELDS}, "optional": o.get("optional", False)} for o in outcomes
    ]
    results, failed, optional_failed = [], [], []
    for test in tests:
        outcome = by_id.pop(case_id(test), None) or {**test, "status": NOT_RUN, "error": "not run"}
        ident = {k: test[k] for k in _TEST_FIELDS}
        if outcome["status"] == OK:
            results.append({**ident, "stats": outcome["stats"]})
        else:
            entry = {**ident, "status": outcome["status"], "error": outcome.get("error", "")}
            (optional_failed if test["optional"] else failed).append(entry)
    for extra in by_id.values():
        if extra["status"] == OK:
            results.append({**{k: extra[k] for k in _TEST_FIELDS}, "stats": extra["stats"]})
    return {
        "benchmark": benchmark or (stamp(defn) if defn else None),
        "status": INCOMPLETE if failed else COMPLETE,
        "env": env,
        "meta_params": dict(meta_params),
        "results": results,
        "failed": failed,
        "optional_failed": optional_failed,
    }


def result_kind(result: dict[str, Any]) -> str:
    return (result.get("env") or {}).get("kind", "local")


# ---------------------------------------------------------------------------
# Environments
# ---------------------------------------------------------------------------


def env_differences(base: dict[str, Any], new: dict[str, Any]) -> list[str]:
    """``field: old -> new`` for differing env fields other than the code-state stamps."""
    out = []
    for field in sorted(set(base) | set(new)):
        if field in _NOT_WARNED:
            continue
        if base.get(field) != new.get(field):
            out.append(f"{field}: {base.get(field, '-')} -> {new.get(field, '-')}")
    return out


def env_label(env: dict[str, Any] | None) -> str:
    """``9f8e7d6 2026-04-23`` (``+dirty`` when the tree had changes)."""
    if not env:
        return "(none)"
    label = f"{(env.get('git_hash') or '?')[:7]} {(env.get('timestamp') or '?')[:10]}"
    return label + ("+dirty" if env.get("dirty") else "")


def result_label(result: dict[str, Any] | None) -> str:
    """``local_latency v1 @ 9f8e7d6 2026-04-23``."""
    if not result:
        return "(none)"
    b = result.get("benchmark") or {}
    return f"{b.get('name', '?')} v{b.get('version', '?')} @ {env_label(result.get('env'))}"


def same_measurement(a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
    """Same env stamp (git hash, timestamp, dirty fingerprint): the very same result."""
    ea, eb = (a or {}).get("env") or {}, (b or {}).get("env") or {}
    return all(ea.get(k) == eb.get(k) for k in ("git_hash", "timestamp", "dirty_fingerprint"))


# ---------------------------------------------------------------------------
# Upgrades from older formats
# ---------------------------------------------------------------------------


def _is_benchmark_doc(data: dict[str, Any]) -> bool:
    return bool(data) and all(isinstance(v, dict) and "benchmark" in v for v in data.values())


def _definitions_for(dimension: str, kind: str) -> list[dict[str, Any]]:
    current = [d for d in load_definitions().values() if (d["dimension"], d["kind"]) == (dimension, kind)]
    archived = [d for d in load_archive() if (d["dimension"], d["kind"]) == (dimension, kind)]
    return current + archived


def _match_definition(dimension: str, kind: str, ids: set[str]) -> dict[str, Any] | None:
    """The (current or archived) definition whose test set is exactly *ids*."""
    for defn in _definitions_for(dimension, kind):
        if {case_id(t) for t in expand_tests(defn)} == ids:
            return defn
    return None


def _result_from_block(block_name: str, block: dict[str, Any]) -> tuple[str, dict[str, Any]] | None:
    """A slot block as ``(benchmark name, result)``; versioned by the definition its tests match."""
    dimension = legacy.block_dim(block_name)
    kind = legacy.block_kind(block_name)
    slots = [s for s in block.get("runs", []) if s.get("status") == OK and s.get("stats") is not None]
    stale = [s for s in slots if s.get("stale")]
    if stale:
        print(f"warning: {block_name}: dropping {len(stale)} stale result(s) measured in another environment")
    slots = [s for s in slots if not s.get("stale")]
    if not slots:
        return None
    outcomes = [{**{k: s[k] for k in _TEST_FIELDS}, "status": OK, "stats": s["stats"]} for s in slots]
    defn = _match_definition(dimension, kind, {case_id(s) for s in slots})
    if defn is None:
        name = next((d["name"] for d in _definitions_for(dimension, kind)), f"{dimension}_{kind}")
        benchmark = {"name": name, "version": None, "config_hash": None, "kind": kind, "dimension": dimension}
        result = make_result(None, block.get("env") or {}, block.get("meta_params", {}), outcomes, benchmark)
        return name, result
    meta = {**defn["meta_params"], **block.get("meta_params", {})}
    return defn["name"], make_result(defn, block.get("env") or {}, meta, outcomes)


def upgrade_run(data: dict[str, Any]) -> dict[str, Any]:
    """Any results document as a run: ``{name: result}``."""
    if _is_benchmark_doc(data) and not any("previous" in v for v in data.values()):
        return copy.deepcopy(data)
    if _is_benchmark_doc(data):
        return {k: {kk: vv for kk, vv in v.items() if kk != "previous"} for k, v in data.items()}
    return _from_blocks(legacy.to_blocks(data, as_baseline=False))


def upgrade_baseline(data: dict[str, Any]) -> dict[str, Any]:
    """Any results document as a baseline: ``{name: result + previous}``."""
    if _is_benchmark_doc(data):
        return {k: {**copy.deepcopy(v), "previous": copy.deepcopy(v.get("previous"))} for k, v in data.items()}
    return {k: {**v, "previous": None} for k, v in _from_blocks(legacy.to_blocks(data, as_baseline=True)).items()}


def _from_blocks(blocks: dict[str, Any]) -> dict[str, Any]:
    out = {}
    for block_name in legacy.BLOCKS:
        block = legacy.get_block(blocks, block_name)
        if not block:
            continue
        converted = _result_from_block(block_name, block)
        if converted is not None:
            name, result = converted
            out[name] = result
    return out


# ---------------------------------------------------------------------------
# Files
# ---------------------------------------------------------------------------


class CorruptResultsError(ValueError):
    """A results file exists but can't be parsed; nothing should overwrite it."""


def _read(path: Path) -> dict[str, Any] | None:
    """Parsed JSON at *path*, None if missing; raises :class:`CorruptResultsError` if unparsable."""
    if not path.exists():
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise CorruptResultsError(f"{path} is not valid JSON ({e}); fix or restore it") from e


def _with_legacy(path: Path | None, default: Path, legacy_path: Path) -> Path:
    """*path*, or the default file — falling back to its pre-rename name if only that exists."""
    if path is not None:
        return path
    if not default.exists() and legacy_path.exists():
        return legacy_path
    return default


def run_path(path: Path | None = None) -> Path:
    return _with_legacy(path, RUN_FILE, LEGACY_RUN_FILE)


def baseline_path(path: Path | None = None) -> Path:
    return _with_legacy(path, BASELINE_FILE, LEGACY_BASELINE_FILE)


def load_run(path: Path | None = None) -> dict[str, Any] | None:
    """Load ``run.json`` (or any older results file), or None if missing."""
    data = _read(run_path(path))
    return upgrade_run(data) if data is not None else None


def load_baseline(path: Path | None = None) -> dict[str, Any] | None:
    """Load ``baseline.json`` (or any older results file), or None if missing."""
    data = _read(baseline_path(path))
    return upgrade_baseline(data) if data is not None else None


def save_json(path: Path, data: dict[str, Any]) -> None:
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


# ---------------------------------------------------------------------------
# Promotion
# ---------------------------------------------------------------------------


def promote(
    run: dict[str, Any] | None, baseline: dict[str, Any] | None
) -> tuple[dict[str, Any], list[str], dict[str, list[dict[str, Any]]]]:
    """Promote every complete benchmark of *run*; returns ``(new_baseline, promoted, refused)``.

    The baseline's current result of a promoted benchmark moves to
    ``previous``. Incomplete benchmarks are refused (``refused`` maps
    them to their failed non-optional tests). Re-promoting the very
    same result changes nothing.
    """
    new = copy.deepcopy(baseline or {})
    promoted, refused = [], {}
    for name, result in (run or {}).items():
        if result.get("status") != COMPLETE:
            refused[name] = result.get("failed", [])
            continue
        current = new.get(name)
        if current is not None and same_measurement(current, result):
            continue
        previous = {k: v for k, v in current.items() if k != "previous"} if current else None
        new[name] = {**copy.deepcopy(result), "previous": previous}
        promoted.append(name)
    return new, promoted, refused


def promote_files(run_file: Path | None = None, baseline_file: Path | None = None) -> dict[str, Any] | None:
    """Promote ``run.json`` into ``baseline.json``, benchmark by benchmark."""
    run = load_run(run_file)
    if run is None:
        print(f"No run found at {run_path(run_file)} — nothing to promote.")
        return None
    baseline = load_baseline(baseline_file)
    new_baseline, promoted, refused = promote(run, baseline)
    for name, failed in refused.items():
        print(f"REFUSED {name}: incomplete — {len(failed)} non-optional test(s) didn't succeed:")
        for f in failed:
            print(f"    {f['status']}: {f['tool']} | {f['model']} | {f['params']} — {f.get('error', '')}")
    for name in promoted:
        prev = new_baseline[name]["previous"]
        print(f"promoted {result_label(new_baseline[name])} (previous: {result_label(prev)})")
    unchanged = [n for n in run if n not in promoted and n not in refused]
    for name in unchanged:
        print(f"{name}: already the baseline (same result), unchanged")
    if promoted:
        target = baseline_file or BASELINE_FILE
        save_json(target, new_baseline)
        print(f"baseline written to {target}")
    return new_baseline

