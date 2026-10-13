"""Readers for the earlier results formats, upgraded to the per-kind form.

Three generations are handled: v1 (``results.local`` / ``results.remote``
rows), v2 (top-level ``git_hash`` / ``system_info`` plus dimensions) and
the kind-first files (``{"local": {"current", "stale"}, "remote": ...}``
and ``{"local": snapshot, "remote": snapshot}``). :mod:`store` turns the
result into the current block format. Pure JSON logic, no torch.
"""

from __future__ import annotations

import copy
import json
from typing import Any, Iterator

ENV_KINDS = ("local", "remote")
DIMENSIONS = ("latency", "peak_mem")

_CODE_FIELDS = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")
_CLIENT_FIELDS = ("nnsight", "nnsight_commit", "nnterp", "nnterp_commit")
ENV_FIELDS = {
    "local": (
        *_CODE_FIELDS, "python", *_CLIENT_FIELDS,
        "transformers", "transformers_commit", "torch", "torch_commit",
        "gpu", "dtype", "autocast",
    ),
    "remote": (*_CODE_FIELDS, *_CLIENT_FIELDS, "remote_server"),
}
UNKNOWN_SERVER = "unknown"
_ENTRY_STAMPS = ("git_hash", "timestamp")


def empty_dims() -> dict[str, Any]:
    return {dim: {"meta_params": {}, "runs": []} for dim in DIMENSIONS}


def empty_snapshot(env: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"env": dict(env or {}), **empty_dims()}


def _strip_stamps(entry: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in entry.items() if k not in _ENTRY_STAMPS}


def _upgrade_v1(data: dict[str, Any]) -> dict[str, Any]:
    """``results.local`` / ``results.remote`` rows (pre-dimension format)."""
    snap = empty_snapshot({
        "git_hash": data.get("git_hash", "unknown"),
        "timestamp": data.get("timestamp", ""),
        **data.get("system_info", {}),
    })
    snap["latency"]["meta_params"] = {
        k: data[k] for k in ("n_repeat", "n_warmup") if k in data
    }
    runs: dict[str, dict[str, Any]] = {}
    for kind in ENV_KINDS:
        for row in data["results"].get(kind, []):
            run = runs.setdefault(
                run_key(row),
                {"tool": row["tool"], "model": row["model"], "params": row["params"]},
            )
            entry = dict(row["latency"])
            if "latency_breakdown" in row:
                entry["breakdown"] = row["latency_breakdown"]
            run[kind] = entry
    snap["latency"]["runs"] = list(runs.values())
    return snap


def _upgrade_v2(data: dict[str, Any]) -> dict[str, Any]:
    """Top-level ``git_hash`` / ``system_info`` plus the two dimensions."""
    lat_meta = dict(data.get("latency", {}).get("meta_params", {}))
    peak_meta = dict(data.get("peak_mem", {}).get("meta_params", {}))
    env = {
        "git_hash": data.get("git_hash", "unknown"),
        "timestamp": data.get("timestamp", ""),
        **data.get("system_info", {}),
    }
    for meta in (lat_meta, peak_meta):
        for field in ("dtype", "autocast"):
            if field in meta:
                env[field] = meta.pop(field)
    if "remote_server" in lat_meta:
        env["remote_server"] = lat_meta.pop("remote_server")

    snap = empty_snapshot(env)
    snap["latency"]["meta_params"] = lat_meta
    snap["peak_mem"]["meta_params"] = peak_meta
    for run in data.get("latency", {}).get("runs", []):
        new = {k: run[k] for k in ("tool", "model", "params")}
        for kind in ENV_KINDS:
            if kind in run:
                new[kind] = _strip_stamps(run[kind])
        snap["latency"]["runs"].append(new)
    snap["peak_mem"]["runs"] = [
        _strip_stamps(run) for run in data.get("peak_mem", {}).get("runs", [])
    ]
    return snap


def upgrade_snapshot(data: dict[str, Any]) -> dict[str, Any]:
    """Any single-snapshot document (v1, v2 or both kinds in one snapshot) as a snapshot."""
    if "results" in data:
        return _upgrade_v1(data)
    if "env" not in data:
        return _upgrade_v2(data)
    return {**empty_dims(), **data}


def kind_env(env: dict[str, Any], kind: str) -> dict[str, Any]:
    """The fields of *env* that matter for *kind* (remote gets ``remote_server``, ``"unknown"`` if absent)."""
    out = {k: env[k] for k in ENV_FIELDS[kind] if k in env}
    if kind == "remote":
        out.setdefault("remote_server", UNKNOWN_SERVER)
    return out


def split_snapshot(snap: dict[str, Any]) -> dict[str, dict[str, Any] | None]:
    """A snapshot holding both kinds as ``{"local": ..., "remote": ...}`` (None for a kind with no tests)."""
    out: dict[str, dict[str, Any] | None] = {}
    for kind in ENV_KINDS:
        others = {key for key, _, _, k in iter_tests(snap) if k != kind}
        part = without_tests(snap, others)
        part["env"] = kind_env(snap.get("env", {}), kind)
        if kind == "remote":
            part["peak_mem"] = {"meta_params": {}, "runs": []}
        out[kind] = None if is_empty(part) else part
    return out


def _is_by_kind(data: dict[str, Any]) -> bool:
    return bool(data) and set(data) <= set(ENV_KINDS)


def _block(current: dict[str, Any] | None, stale: list[dict[str, Any]]) -> dict[str, Any]:
    return {"current": current, "stale": stale}


def upgrade_run(data: dict[str, Any]) -> dict[str, dict[str, Any] | None]:
    """Any results document as a run: ``{"local": snapshot | None, "remote": snapshot | None}``.

    A baseline file yields its kinds' ``current`` snapshots.
    """
    if _is_by_kind(data) and not any("current" in (data.get(k) or {}) for k in ENV_KINDS):
        return {k: upgrade_snapshot(data[k]) if data.get(k) else None for k in ENV_KINDS}
    if _is_by_kind(data) or "current" in data or "stale" in data:
        base = upgrade_baseline(data)
        return {k: base[k]["current"] for k in ENV_KINDS}
    return split_snapshot(upgrade_snapshot(data))


def upgrade_baseline(data: dict[str, Any]) -> dict[str, Any]:
    """Any results document as ``{"local": {"current", "stale"}, "remote": {...}}``.

    Older single-environment files are split by kind: their snapshot (or
    ``current``) becomes each kind's ``current``, their ``stale`` groups
    each kind's ``stale``.
    """
    if _is_by_kind(data):
        blocks = {k: data.get(k) or {} for k in ENV_KINDS}
        return {
            k: _block(
                upgrade_snapshot(b["current"]) if b.get("current") else None,
                [upgrade_snapshot(g) for g in b.get("stale", [])],
            )
            for k, b in blocks.items()
        }
    if "current" in data or "stale" in data:
        current = split_snapshot(upgrade_snapshot(data["current"])) if data.get("current") else {}
        groups = [split_snapshot(upgrade_snapshot(g)) for g in data.get("stale", [])]
        return {
            k: _block(current.get(k), [g[k] for g in groups if g[k] is not None])
            for k in ENV_KINDS
        }
    current = split_snapshot(upgrade_snapshot(data))
    return {k: _block(current[k], []) for k in ENV_KINDS}


def run_key(run: dict[str, Any]) -> str:
    """A run's identity within a dimension: (tool, model, params)."""
    return json.dumps(
        {"tool": run["tool"], "model": run["model"], "params": run["params"]},
        sort_keys=True,
        default=str,
    )


def legacy_key(dim: str, tool: str, model: str, params: dict, env_kind: str) -> str:
    """A test's identity across files: (dim, tool, model, params, env_kind)."""
    return json.dumps(
        {"dim": dim, "tool": tool, "model": model, "params": params, "env_kind": env_kind},
        sort_keys=True,
        default=str,
    )


def iter_tests(snap: dict[str, Any] | None) -> Iterator[tuple[str, str, dict[str, Any], str]]:
    """``(entry_key, dim, run, env_kind)`` for every test in a snapshot."""
    if not snap:
        return
    for run in snap.get("latency", {}).get("runs", []):
        for kind in ENV_KINDS:
            if kind in run:
                yield legacy_key("latency", run["tool"], run["model"], run["params"], kind), "latency", run, kind
    for run in snap.get("peak_mem", {}).get("runs", []):
        yield legacy_key("peak_mem", run["tool"], run["model"], run["params"], "local"), "peak_mem", run, "local"


def legacy_keys(snap: dict[str, Any] | None) -> set[str]:
    return {key for key, *_ in iter_tests(snap)}


def iter_run_tests(run: dict[str, Any] | None) -> Iterator[tuple[str, str, dict[str, Any], str]]:
    """:func:`iter_tests` over every kind of a run."""
    for kind in ENV_KINDS:
        yield from iter_tests((run or {}).get(kind))


def without_tests(snap: dict[str, Any], keys: set[str]) -> dict[str, Any]:
    """A copy of *snap* minus the tests in *keys* (runs left empty are dropped)."""
    out = copy.deepcopy(snap)
    runs = []
    for run in out["latency"]["runs"]:
        for kind in ENV_KINDS:
            if kind in run and legacy_key("latency", run["tool"], run["model"], run["params"], kind) in keys:
                del run[kind]
        if any(kind in run for kind in ENV_KINDS):
            runs.append(run)
    out["latency"]["runs"] = runs
    out["peak_mem"]["runs"] = [
        run for run in out["peak_mem"]["runs"]
        if legacy_key("peak_mem", run["tool"], run["model"], run["params"], "local") not in keys
    ]
    return out


def is_empty(snap: dict[str, Any]) -> bool:
    return not any(snap.get(dim, {}).get("runs") for dim in DIMENSIONS)
