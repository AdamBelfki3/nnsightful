"""Results files: benchmark results, promotion, and reading the original format.

``run.json`` maps each benchmark name to one *result*::

    {
        "benchmark": {"name", "version", "config_hash", "kind", "dimension"},
        "status": "complete" | "incomplete",
        "env": {...},
        "meta_params": {...},
        "results": [{"tool", "model", "params", "stats"}, ...],
        "failed": [{"tool", "model", "params", "status", "error"}, ...],
        "optional_failed": [...],
    }

``baseline.json`` maps each benchmark name to its last promoted result
plus ``previous``: the result that one replaced (or null).

Pure JSON logic, no torch.
"""

from __future__ import annotations

import copy
import json
import os
import tempfile
from pathlib import Path
from typing import Any

from .definitions import expand_tests, load_archive, load_definitions, stamp

BENCH_DIR = Path(__file__).parent
BASELINE_FILE = BENCH_DIR / "baseline.json"
RUN_FILE = BENCH_DIR / "run.json"
LEGACY_BASELINE_FILE = BENCH_DIR / "results.json"
LEGACY_RUN_FILE = BENCH_DIR / "latest.json"

COMPLETE, INCOMPLETE, IN_PROGRESS = "complete", "incomplete", "in_progress"
OK, NOT_RUN, FAILED, UNSUPPORTED = "ok", "not_run", "failed", "unsupported"

_CODE_FIELDS = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")
_CLIENT_FIELDS = ("nnsight", "nnsight_commit", "nnterp", "nnterp_commit")
ENV_FIELDS = {
    "local": (
        *_CODE_FIELDS,
        "python",
        *_CLIENT_FIELDS,
        "transformers",
        "transformers_commit",
        "torch",
        "torch_commit",
        "gpu",
        "dtype",
        "autocast",
    ),
    "remote": (*_CODE_FIELDS, *_CLIENT_FIELDS, "remote_server"),
}
UNKNOWN_SERVER = "unknown"
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
    """A benchmark result from per-test outcomes.

    Each outcome's ``status`` is ok / failed / unsupported / not_run.

    Tests of *defn* without an outcome count as ``not_run``. The result is
    ``incomplete`` if any non-optional test didn't end ``ok``.
    """
    by_id = {case_id(o): o for o in outcomes}
    tests = (
        expand_tests(defn)
        if defn
        else [
            {**{k: o[k] for k in _TEST_FIELDS}, "optional": o.get("optional", False)}
            for o in outcomes
        ]
    )
    results, failed, optional_failed = [], [], []
    for test in tests:
        outcome = by_id.pop(case_id(test), None) or {
            **test,
            "status": NOT_RUN,
            "error": "not run",
        }
        ident = {k: test[k] for k in _TEST_FIELDS}
        if outcome["status"] == OK:
            results.append({**ident, "stats": outcome["stats"]})
        else:
            entry = {
                **ident,
                "status": outcome["status"],
                "error": outcome.get("error", ""),
            }
            (optional_failed if test["optional"] else failed).append(entry)
    for extra in by_id.values():
        if extra["status"] == OK:
            results.append(
                {**{k: extra[k] for k in _TEST_FIELDS}, "stats": extra["stats"]}
            )
    return {
        "benchmark": benchmark or (stamp(defn) if defn else None),
        "status": INCOMPLETE if failed else COMPLETE,
        "env": env,
        "meta_params": dict(meta_params),
        "results": results,
        "failed": failed,
        "optional_failed": optional_failed,
    }


# ---------------------------------------------------------------------------
# Environments
# ---------------------------------------------------------------------------


def kind_env(env: dict[str, Any], kind: str) -> dict[str, Any]:
    """The fields of *env* that matter for *kind*.

    Remote always gets ``remote_server`` (``"unknown"`` if absent).
    """
    out = {k: env[k] for k in ENV_FIELDS[kind] if k in env}
    if kind == "remote":
        out.setdefault("remote_server", UNKNOWN_SERVER)
    return out


def env_differences(base: dict[str, Any], new: dict[str, Any]) -> list[str]:
    """``field: old -> new`` for differing env fields other than code-state stamps."""
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
    name, version = b.get("name", "?"), b.get("version", "?")
    return f"{name} v{version} @ {env_label(result.get('env'))}"


def same_measurement(a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
    """Same env stamp (git hash, timestamp, dirty fingerprint): the very same result."""
    ea, eb = (a or {}).get("env") or {}, (b or {}).get("env") or {}
    return all(
        ea.get(k) == eb.get(k) for k in ("git_hash", "timestamp", "dirty_fingerprint")
    )


# ---------------------------------------------------------------------------
# Reading results (current format, or the original results.json format)
# ---------------------------------------------------------------------------


def _is_benchmark_doc(data: dict[str, Any]) -> bool:
    return all(isinstance(v, dict) and "benchmark" in v for v in data.values())


def _definitions_for(dimension: str, kind: str) -> list[dict[str, Any]]:
    current = [
        d
        for d in load_definitions().values()
        if (d["dimension"], d["kind"]) == (dimension, kind)
    ]
    archived = [
        d for d in load_archive() if (d["dimension"], d["kind"]) == (dimension, kind)
    ]
    return current + archived


def _match_definition(
    dimension: str, kind: str, ids: set[str]
) -> dict[str, Any] | None:
    """The (current or archived) definition whose test set is exactly *ids*."""
    for defn in _definitions_for(dimension, kind):
        if {case_id(t) for t in expand_tests(defn)} == ids:
            return defn
    return None


def _from_v1(data: dict[str, Any]) -> dict[str, Any]:
    """The original ``results.json`` format as results.

    Each is versioned by the definition its tests match.
    """
    from . import legacy

    out = {}
    for part in legacy.read_v1(data):
        dimension, kind, outcomes = part["dimension"], part["kind"], part["outcomes"]
        defn = _match_definition(dimension, kind, {case_id(o) for o in outcomes})
        if defn is None:
            name = next(
                (d["name"] for d in _definitions_for(dimension, kind)),
                f"{dimension}_{kind}",
            )
            benchmark = {
                "name": name,
                "version": None,
                "config_hash": None,
                "kind": kind,
                "dimension": dimension,
            }
            out[name] = make_result(
                None, part["env"], part["meta_params"], outcomes, benchmark
            )
        else:
            meta = {**defn["meta_params"], **part["meta_params"]}
            out[defn["name"]] = make_result(defn, part["env"], meta, outcomes)
    return out


def _upgrade(data: dict[str, Any], source: str) -> dict[str, Any]:
    from . import legacy

    if _is_benchmark_doc(data):
        return copy.deepcopy(data)
    if legacy.is_v1(data):
        return _from_v1(data)
    raise UnknownFormatError(
        f"{source} is not a results file this version reads (current format, "
        "or the original results.json format)"
    )


def upgrade_run(data: dict[str, Any], source: str = "results") -> dict[str, Any]:
    """A run (current or original format) as ``{name: result}``."""
    return {
        k: {kk: vv for kk, vv in v.items() if kk != "previous"}
        for k, v in _upgrade(data, source).items()
    }


def upgrade_baseline(data: dict[str, Any], source: str = "results") -> dict[str, Any]:
    """A baseline (current or original format) as ``{name: result + previous}``."""
    return {
        k: {**v, "previous": v.get("previous")}
        for k, v in _upgrade(data, source).items()
    }


# ---------------------------------------------------------------------------
# Files
# ---------------------------------------------------------------------------


class CorruptResultsError(ValueError):
    """A results file exists but can't be parsed; nothing should overwrite it."""


class UnknownFormatError(CorruptResultsError):
    """A results file is valid JSON but in no format this version reads."""


def _read(path: Path) -> dict[str, Any] | None:
    """Parsed JSON at *path*, None if missing; :class:`CorruptResultsError` if bad."""
    if not path.exists():
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        raise CorruptResultsError(
            f"{path} is not valid JSON ({e}); fix or restore it"
        ) from e


def _with_legacy(path: Path | None, default: Path, legacy_path: Path) -> Path:
    """*path*, or the default file (or its pre-rename name if only that exists)."""
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
    path = run_path(path)
    data = _read(path)
    return upgrade_run(data, str(path)) if data is not None else None


def load_baseline(path: Path | None = None) -> dict[str, Any] | None:
    """Load ``baseline.json`` (or any older results file), or None if missing."""
    path = baseline_path(path)
    data = _read(path)
    return upgrade_baseline(data, str(path)) if data is not None else None


def save_json(path: Path, data: dict[str, Any]) -> None:
    """Write *data* atomically: a temp file in the same directory + ``os.replace``."""
    path = Path(path)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


# ---------------------------------------------------------------------------
# In-progress file
# ---------------------------------------------------------------------------


def partial_path(run_file: Path | None = None) -> Path:
    """In-progress file beside the run file (``run.json`` -> ``run.partial.json``)."""
    run_file = run_path(run_file)
    return run_file.with_name(f"{run_file.stem}.partial{run_file.suffix}")


def is_partial(path: Path | None) -> bool:
    return path is not None and Path(path).stem.endswith(".partial")


def mark_in_progress(
    result: dict[str, Any], done: list[str], remaining: list[str]
) -> dict[str, Any]:
    """*result* as an in-progress entry: status ``in_progress`` + models done."""
    return {
        **result,
        "status": IN_PROGRESS,
        "progress": {"models_done": list(done), "models_remaining": list(remaining)},
    }


def save_partial(run_file: Path | None, name: str, result: dict[str, Any]) -> None:
    """Record a benchmark's progress in the in-progress file."""
    path = partial_path(run_file)
    doc = load_run(path) or {}
    doc[name] = result
    save_json(path, doc)


def clear_partial(run_file: Path | None, name: str) -> None:
    """Drop a finished benchmark from the in-progress file; delete it once empty."""
    path = partial_path(run_file)
    doc = load_run(path)
    if doc is None:
        return
    doc.pop(name, None)
    if doc:
        save_json(path, doc)
    else:
        path.unlink(missing_ok=True)


def partial_notice(run_file: Path | None = None) -> str | None:
    """A one-line notice naming interrupted benchmarks, if there are any."""
    if is_partial(run_file):
        return None
    path = partial_path(run_file)
    doc = load_run(path)
    if not doc:
        return None
    return (
        f"note: interrupted benchmark(s) {', '.join(sorted(doc))}: "
        f"partial results in {path} "
        f"(not promotable; inspect with --run {path} --show)"
    )


# ---------------------------------------------------------------------------
# Promotion
# ---------------------------------------------------------------------------


def promote(
    run: dict[str, Any] | None, baseline: dict[str, Any] | None
) -> tuple[dict[str, Any], list[str], dict[str, list[dict[str, Any]]]]:
    """Promote every complete benchmark of *run*.

    Returns ``(new_baseline, promoted, refused)``.

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
        previous = (
            {k: v for k, v in current.items() if k != "previous"} if current else None
        )
        new[name] = {**copy.deepcopy(result), "previous": previous}
        promoted.append(name)
    return new, promoted, refused


def promote_files(
    run_file: Path | None = None, baseline_file: Path | None = None
) -> dict[str, Any] | None:
    """Promote ``run.json`` into ``baseline.json``, benchmark by benchmark.

    Never promotes from an in-progress file.
    """
    if is_partial(run_file):
        print(
            f"REFUSED: {run_file} is an in-progress file; only finished results "
            "in run.json can be promoted."
        )
        return None
    run = load_run(run_file)
    if run is None:
        print(f"No run found at {run_path(run_file)} — nothing to promote.")
        return None
    baseline = load_baseline(baseline_file)
    new_baseline, promoted, refused = promote(run, baseline)
    for name, failed in refused.items():
        if run[name].get("status") == IN_PROGRESS:
            print(f"REFUSED {name}: still in progress")
            continue
        print(
            f"REFUSED {name}: incomplete — {len(failed)} non-optional test(s) "
            "didn't succeed:"
        )
        for f in failed:
            print(
                f"    {f['status']}: {f['tool']} | {f['model']} | {f['params']} "
                f"— {f.get('error', '')}"
            )
    for name in promoted:
        prev = new_baseline[name]["previous"]
        print(
            f"promoted {result_label(new_baseline[name])} "
            f"(previous: {result_label(prev)})"
        )
    unchanged = [n for n in run if n not in promoted and n not in refused]
    for name in unchanged:
        print(f"{name}: already the baseline (same result), unchanged")
    if promoted:
        target = baseline_file or BASELINE_FILE
        save_json(target, new_baseline)
        print(f"baseline written to {target}")
    return new_baseline
