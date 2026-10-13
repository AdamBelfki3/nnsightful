"""Results files: dimension blocks, slots, promotion and ``last_change``.

``run.json`` and ``baseline.json`` share one shape, dimensions on top::

    {"latency": {"local": block, "remote": block}, "peak_mem": block}

A **block** is ``{"env", "meta_params", "runs"}``; ``runs`` has one *slot*
per test of the block's config matrix (tool × model × params). A slot is
``{tool, model, params, status, stats}`` plus optional ``error``,
``last_change`` and, for a stale slot, ``stale: true`` and its own
``env``. ``status`` is ``ok`` (``stats`` holds the result), ``not_run``
(placeholder), ``failed`` or ``unsupported`` (``error`` says why).

Pure JSON logic, no torch.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any, Iterator

from . import legacy

BENCH_DIR = Path(__file__).parent
BASELINE_FILE = BENCH_DIR / "baseline.json"
RUN_FILE = BENCH_DIR / "run.json"
LEGACY_BASELINE_FILE = BENCH_DIR / "results.json"
LEGACY_RUN_FILE = BENCH_DIR / "latest.json"

ENV_KINDS = ("local", "remote")
DIMENSIONS = ("latency", "peak_mem")
BLOCKS = ("latency.local", "latency.remote", "peak_mem")

OK, NOT_RUN, FAILED, UNSUPPORTED = "ok", "not_run", "failed", "unsupported"

IDENTITY_FIELDS = (
    "kind", "git_hash", "dirty", "dirty_fingerprint",
    "nnsight", "nnsight_commit", "nnterp", "nnterp_commit",
    "transformers", "transformers_commit", "torch", "torch_commit",
    "gpu", "dtype", "autocast", "remote_server",
)
_NOT_WARNED = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")
_SLOT_FIELDS = ("tool", "model", "params")


# ---------------------------------------------------------------------------
# Blocks and slots
# ---------------------------------------------------------------------------


def block_kind(block: str) -> str:
    """``latency.remote`` -> ``remote``; ``peak_mem`` is local."""
    return "remote" if block == "latency.remote" else "local"


def block_dim(block: str) -> str:
    return block.split(".")[0]


def empty_block(slots: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {"env": None, "meta_params": {}, "runs": [placeholder(s) for s in slots or []]}


def empty_doc() -> dict[str, Any]:
    return {"latency": {"local": None, "remote": None}, "peak_mem": None}


def get_block(doc: dict[str, Any] | None, block: str) -> dict[str, Any] | None:
    if not doc:
        return None
    if block == "peak_mem":
        return doc.get("peak_mem")
    return (doc.get("latency") or {}).get(block_kind(block))


def set_block(doc: dict[str, Any], block: str, value: dict[str, Any] | None) -> None:
    if block == "peak_mem":
        doc["peak_mem"] = value
    else:
        doc.setdefault("latency", {"local": None, "remote": None})[block_kind(block)] = value


def placeholder(slot: dict[str, Any]) -> dict[str, Any]:
    return {**{k: slot[k] for k in _SLOT_FIELDS}, "status": NOT_RUN, "stats": None}


def slot_id(slot: dict[str, Any]) -> str:
    """A slot's identity within its block: (tool, model, params)."""
    return json.dumps({k: slot[k] for k in _SLOT_FIELDS}, sort_keys=True, default=str)


def entry_key(dim: str, tool: str, model: str, params: dict, env_kind: str) -> str:
    """A test's identity across files: (dim, tool, model, params, env_kind)."""
    return json.dumps(
        {"dim": dim, "tool": tool, "model": model, "params": params, "env_kind": env_kind},
        sort_keys=True,
        default=str,
    )


def slot_key(block: str, slot: dict[str, Any]) -> str:
    return entry_key(block_dim(block), slot["tool"], slot["model"], slot["params"], block_kind(block))


def has_value(slot: dict[str, Any]) -> bool:
    return slot.get("status") == OK and slot.get("stats") is not None


def iter_slots(doc: dict[str, Any] | None) -> Iterator[tuple[str, str, dict[str, Any]]]:
    """``(test_key, block, slot)`` for every slot of every block."""
    for block in BLOCKS:
        for slot in (get_block(doc, block) or {}).get("runs", []):
            yield slot_key(block, slot), block, slot


def measured_keys(doc: dict[str, Any] | None) -> set[str]:
    """Keys of the slots that hold a result."""
    return {key for key, _, slot in iter_slots(doc) if has_value(slot)}


def slot_env(block: dict[str, Any], slot: dict[str, Any]) -> dict[str, Any] | None:
    """The env a slot's value was measured in: its own if stale, else the block's."""
    return slot.get("env") if slot.get("stale") else block.get("env")


def sync_slots(block: dict[str, Any], slots: list[dict[str, Any]]) -> dict[str, Any]:
    """*block* with exactly the config *slots*, in config order (missing ones as placeholders)."""
    by_id = {slot_id(s): s for s in block.get("runs", [])}
    out = dict(block)
    out["runs"] = [by_id.get(slot_id(s)) or placeholder(s) for s in slots]
    return out


# ---------------------------------------------------------------------------
# Environments
# ---------------------------------------------------------------------------


def identity(env: dict[str, Any] | None) -> dict[str, Any]:
    """The env fields that decide staleness (code state, dependencies, setup)."""
    return {k: env[k] for k in IDENTITY_FIELDS if k in (env or {})}


def same_identity(a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
    return a is not None and b is not None and identity(a) == identity(b)


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


def _warn_meta_change(block: str, old: dict[str, Any], new: dict[str, Any]) -> None:
    for field, new_val in new.items():
        old_val = old.get(field)
        if old_val is not None and old_val != new_val:
            print(
                f"warning: {block}.{field} changed ({old_val} -> {new_val}); "
                f"results measured with the old value stay comparable but may differ."
            )


# ---------------------------------------------------------------------------
# Upgrades from older formats
# ---------------------------------------------------------------------------


def _is_current_format(data: dict[str, Any]) -> bool:
    lat = data.get("latency")
    return "peak_mem" in data and isinstance(lat, dict) and set(lat) <= set(ENV_KINDS)


def _slot_from_legacy(run: dict[str, Any], dim: str, kind: str) -> dict[str, Any]:
    slot = {k: run[k] for k in _SLOT_FIELDS}
    if dim == "latency":
        stats = dict(run[kind])
    else:
        stats = {k: v for k, v in run.items() if k not in _SLOT_FIELDS}
    change = stats.pop("last_change", None)
    slot.update(status=OK, stats=stats)
    if change is not None:
        slot["last_change"] = change
    return slot


def _blocks_from_snapshot(snap: dict[str, Any] | None, kind: str, stale: bool) -> dict[str, list[dict[str, Any]]]:
    """A legacy kind snapshot as ``block -> slots`` (stale slots carry the snapshot env)."""
    if not snap:
        return {}
    env = {"kind": kind, **snap.get("env", {})}
    out: dict[str, list[dict[str, Any]]] = {}
    for _key, dim, run, run_kind in legacy.iter_tests(snap):
        if run_kind != kind:
            continue
        block = f"latency.{kind}" if dim == "latency" else "peak_mem"
        slot = _slot_from_legacy(run, dim, kind)
        if stale:
            slot.update(stale=True, env=env)
        out.setdefault(block, []).append(slot)
    return out


def _from_kind_first(kinds: dict[str, Any], has_stale: bool) -> dict[str, Any]:
    """Kind-first data (``{kind: {"current", "stale"}}`` or ``{kind: snapshot}``) as a current-format doc."""
    doc = empty_doc()
    for kind in ENV_KINDS:
        entry = kinds.get(kind)
        current = entry.get("current") if has_stale else entry
        groups = entry.get("stale", []) if has_stale else []
        if not current and not groups:
            continue
        blocks: dict[str, list[dict[str, Any]]] = {}
        for snap, is_stale in [(current, False), *((g, True) for g in groups)]:
            for block, slots in _blocks_from_snapshot(snap, kind, is_stale).items():
                blocks.setdefault(block, []).extend(slots)
        for block, slots in blocks.items():
            dim = block_dim(block)
            env = {"kind": kind, **current["env"]} if current else None
            meta = (current or groups[0]).get(dim, {}).get("meta_params", {})
            set_block(doc, block, {"env": env, "meta_params": dict(meta), "runs": slots})
    return doc


def upgrade(data: dict[str, Any], as_baseline: bool) -> dict[str, Any]:
    """Any results document (current or older format) as a current-format doc."""
    if _is_current_format(data):
        doc = empty_doc()
        for block in BLOCKS:
            set_block(doc, block, copy.deepcopy(get_block(data, block)))
        return doc
    if as_baseline:
        return _from_kind_first(legacy.upgrade_baseline(data), has_stale=True)
    return _from_kind_first(legacy.upgrade_run(data), has_stale=False)


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
    return upgrade(data, as_baseline=False) if data is not None else None


def load_baseline(path: Path | None = None) -> dict[str, Any] | None:
    """Load ``baseline.json`` (or any older results file), or None if missing."""
    data = _read(baseline_path(path))
    return upgrade(data, as_baseline=True) if data is not None else None


def save_json(path: Path, data: dict[str, Any]) -> None:
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


# ---------------------------------------------------------------------------
# run.json writes
# ---------------------------------------------------------------------------


def merge_run_block(
    existing: dict[str, Any] | None, new: dict[str, Any], name: str = ""
) -> tuple[dict[str, Any], bool]:
    """Merge a freshly measured block into ``run.json``'s, returning ``(block, merged)``.

    Same identity: per slot, a measured / failed / unsupported slot
    replaces the old one, a placeholder never does. Otherwise *new*
    replaces the block (so it is always one environment).
    """
    if existing is None or not same_identity(existing.get("env"), new["env"]):
        return copy.deepcopy(new), False
    old = {slot_id(s): s for s in existing["runs"]}
    runs = []
    for slot in new["runs"]:
        prev = old.pop(slot_id(slot), None)
        runs.append(prev if slot["status"] == NOT_RUN and prev is not None else slot)
    runs += old.values()
    _warn_meta_change(name, existing.get("meta_params", {}), new["meta_params"])
    meta = {**existing.get("meta_params", {}), **new["meta_params"]}
    return {"env": new["env"], "meta_params": meta, "runs": runs}, True


def has_results(block: dict[str, Any] | None) -> bool:
    return any(s.get("status") != NOT_RUN for s in (block or {}).get("runs", []))


# ---------------------------------------------------------------------------
# Promotion and last_change
# ---------------------------------------------------------------------------


def _same_measurement(a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
    """Same env stamp: the result being promoted is the one already in the baseline."""
    return all((a or {}).get(k) == (b or {}).get(k) for k in ("git_hash", "timestamp", "dirty_fingerprint"))


def change_value(dim: str, stats: dict[str, Any]) -> Any:
    """Latency: the mean (seconds). peak_mem: max lengths, capped labels and footprint."""
    if dim == "latency":
        return stats["mean"]
    return {
        "max_prompt_length": stats.get("max_prompt_length", {}),
        "capped": stats.get("capped", []),
        "footprint_bytes": stats.get("footprint_bytes"),
    }


def _delta(a: Any, b: Any) -> tuple[Any, Any]:
    if a is None or b is None:
        return None, None
    return b - a, round((b - a) / a * 100, 3) if a else None


def change_record(
    dim: str,
    old_stats: dict[str, Any],
    old_env: dict[str, Any] | None,
    new_stats: dict[str, Any],
    new_env: dict[str, Any],
) -> dict[str, Any]:
    """A ``last_change``; for peak_mem, ``delta`` / ``pct`` are per threshold label (null-safe)."""
    old, new = change_value(dim, old_stats), change_value(dim, new_stats)
    if dim == "latency":
        delta, pct = _delta(old, new)
        delta = round(delta, 6) if delta is not None else None
    else:
        pairs = {
            label: _delta(old["max_prompt_length"].get(label), new["max_prompt_length"].get(label))
            for label in new["max_prompt_length"]
        }
        delta = {label: d for label, (d, _) in pairs.items()}
        pct = {label: p for label, (_, p) in pairs.items()}
    old_env = old_env or {}
    return {
        "from": {"value": old, "git_hash": old_env.get("git_hash"), "timestamp": old_env.get("timestamp")},
        "to": {"value": new, "git_hash": new_env.get("git_hash"), "timestamp": new_env.get("timestamp")},
        "delta": delta,
        "pct": pct,
    }


def promote_block(
    name: str,
    run_block: dict[str, Any] | None,
    base_block: dict[str, Any] | None,
    slots: list[dict[str, Any]] | None = None,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """Promote one block of a run; returns ``(new_block, changes)``.

    Re-run slots become current with the new value, and the block's env
    becomes the run's. A slot with a value that wasn't re-run stays
    current if its env has the new env's identity, else turns stale with
    its own env. Placeholders (and failures) never overwrite a value.
    With *slots*, the block is synced to the config (extras dropped,
    missing slots added as placeholders).
    """
    base = copy.deepcopy(base_block) if base_block else empty_block()
    measured = {
        slot_id(s): s for s in (run_block or {}).get("runs", []) if has_value(s)
    }
    changes: list[dict[str, Any]] = []
    if not measured:
        out = base
    else:
        new_env = run_block["env"]
        runs = []
        seen = set()
        for slot in base["runs"]:
            sid = slot_id(slot)
            seen.add(sid)
            if sid in measured:
                runs.append(_promoted_slot(name, base, slot, measured[sid], new_env, changes))
            elif has_value(slot):
                runs.append(_carried_slot(base, slot, new_env))
            else:
                runs.append(_unmeasured_slot(slot, run_block))
        for sid, new in measured.items():
            if sid not in seen:
                runs.append(_promoted_slot(name, base, None, new, new_env, changes))
        for slot in run_block["runs"]:
            if slot_id(slot) not in seen and slot_id(slot) not in measured:
                runs.append(copy.deepcopy(slot))
        if base.get("runs") and base.get("meta_params"):
            _warn_meta_change(name, base["meta_params"], run_block["meta_params"])
        out = {"env": new_env, "meta_params": dict(run_block["meta_params"]), "runs": runs}
    if slots is not None:
        out = sync_slots(out, slots)
    return out, changes


def _promoted_slot(name, base, old, new, new_env, changes):
    """A re-run slot: current, with ``last_change`` from its previous value."""
    slot = {k: copy.deepcopy(new[k]) for k in (*_SLOT_FIELDS, "status", "stats")}
    if old is not None and has_value(old):
        old_env = slot_env(base, old)
        if _same_measurement(old_env, new_env):
            if "last_change" in old:
                slot["last_change"] = old["last_change"]
        else:
            slot["last_change"] = change_record(block_dim(name), old["stats"], old_env, slot["stats"], new_env)
            changes.append({
                "block": name, **{k: slot[k] for k in _SLOT_FIELDS}, **slot["last_change"],
            })
    return slot


def _carried_slot(base, slot, new_env):
    """A measured slot not re-run: current if its env matches the new identity, else stale."""
    env = slot_env(base, slot)
    slot = {k: v for k, v in slot.items() if k not in ("stale", "env")}
    if not same_identity(env, new_env):
        slot.update(stale=True, env=env)
    return slot


def _unmeasured_slot(slot, run_block):
    """A slot without a value takes the run's failed / unsupported status, if any."""
    for new in run_block["runs"]:
        if slot_id(new) == slot_id(slot) and new["status"] in (FAILED, UNSUPPORTED):
            return copy.deepcopy(new)
    return slot


def promote(
    run: dict[str, Any] | None,
    baseline: dict[str, Any] | None,
    slots: dict[str, list[dict[str, Any]]] | None = None,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """Promote every block of *run* into *baseline*; returns ``(new_baseline, changes)``.

    *slots* (``block -> config slots``) syncs every block to the config.
    """
    new = empty_doc()
    changes: list[dict[str, Any]] = []
    for block in BLOCKS:
        promoted, block_changes = promote_block(
            block, get_block(run, block), get_block(baseline, block),
            (slots or {}).get(block),
        )
        if promoted["env"] is None and not promoted["runs"]:
            promoted = None
        set_block(new, block, promoted)
        changes += block_changes
    return new, changes


def promote_files(
    run_file: Path | None = None,
    baseline_file: Path | None = None,
    slots: dict[str, list[dict[str, Any]]] | None = None,
) -> dict[str, Any] | None:
    """Promote ``run.json`` into ``baseline.json``, block by block."""
    run = load_run(run_file)
    if run is None:
        print(f"No run found at {run_path(run_file)} — nothing to promote.")
        return None
    baseline = load_baseline(baseline_file)
    new_baseline, changes = promote(run, baseline, slots)
    target = baseline_file or BASELINE_FILE
    save_json(target, new_baseline)
    for block in BLOCKS:
        b = get_block(new_baseline, block)
        if b is None:
            continue
        counts = slot_counts(b)
        print(f"{block}: env {env_label(b['env'])}; " + ", ".join(f"{n} {k}" for k, n in counts.items() if n))
    print(f"{len(changes)} last_change(s) recorded; baseline written to {target}")
    return new_baseline


def slot_counts(block: dict[str, Any]) -> dict[str, int]:
    """Slots per state: current / stale / failed / unsupported / not_run."""
    counts = {"current": 0, "stale": 0, FAILED: 0, UNSUPPORTED: 0, NOT_RUN: 0}
    for slot in block.get("runs", []):
        if has_value(slot):
            counts["stale" if slot.get("stale") else "current"] += 1
        else:
            counts[slot.get("status", NOT_RUN)] = counts.get(slot.get("status", NOT_RUN), 0) + 1
    return counts


# ---------------------------------------------------------------------------
# Lookups for comparisons
# ---------------------------------------------------------------------------


def find_previous(
    baseline: dict[str, Any] | None,
) -> dict[str, tuple[dict[str, Any], dict[str, Any] | None, str]]:
    """Every measured baseline slot as ``key -> (slot, env, source)``.

    ``source`` is ``"current"`` or ``"stale @ <env_label>"``.
    """
    out = {}
    for key, block, slot in iter_slots(baseline):
        if not has_value(slot):
            continue
        b = get_block(baseline, block)
        if slot.get("stale"):
            out[key] = (slot, slot.get("env"), f"stale @ {env_label(slot.get('env'))}")
        else:
            out[key] = (slot, b.get("env"), "current")
    return out


def last_changes(baseline: dict[str, Any] | None) -> dict[str, dict[str, Any]]:
    """Baseline slots with a ``last_change``: ``key -> {block, tool, model, params, from, to, delta, pct}``."""
    out = {}
    for key, block, slot in iter_slots(baseline):
        if "last_change" in slot:
            out[key] = {"block": block, **{k: slot[k] for k in _SLOT_FIELDS}, **slot["last_change"]}
    return out
