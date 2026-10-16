"""Reader for the original results format (``results.local`` / ``results.remote`` rows).

That format predates benchmark definitions: a run-level ``git_hash``,
``timestamp``, ``system_info``, ``n_repeat`` / ``n_warmup`` and one list
of latency rows per kind. :func:`read_v1` splits it into one latency
result per kind, which :mod:`store` versions against the archived
definitions. Pure JSON logic, no torch.
"""

from __future__ import annotations

from typing import Any

from .store import OK, kind_env


def is_v1(data: dict[str, Any]) -> bool:
    return isinstance(data.get("results"), dict)


def read_v1(data: dict[str, Any]) -> list[dict[str, Any]]:
    """One ``{dimension, kind, env, meta_params, outcomes}`` per kind with rows.

    Remote rows keep their ``latency_breakdown`` as ``breakdown`` in the
    stats; the env is the run-level stamp narrowed to the kind's fields.
    """
    env = {
        "git_hash": data.get("git_hash", "unknown"),
        "timestamp": data.get("timestamp", ""),
        **data.get("system_info", {}),
    }
    meta = {k: data[k] for k in ("n_repeat", "n_warmup") if k in data}
    out = []
    for kind in ("local", "remote"):
        rows = data["results"].get(kind, [])
        if not rows:
            continue
        outcomes = []
        for row in rows:
            stats = dict(row["latency"])
            if "latency_breakdown" in row:
                stats["breakdown"] = row["latency_breakdown"]
            outcomes.append({
                "tool": row["tool"], "model": row["model"], "params": row["params"],
                "status": OK, "stats": stats,
            })
        out.append({
            "dimension": "latency", "kind": kind, "env": {"kind": kind, **kind_env(env, kind)},
            "meta_params": dict(meta), "outcomes": outcomes,
        })
    return out
