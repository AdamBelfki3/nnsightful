"""Benchmark runner: sweep parameters, measure latency, write results."""

from __future__ import annotations

import json
import platform
import statistics
import subprocess
import time
from itertools import product
from pathlib import Path
from typing import TYPE_CHECKING, Any

from .config import ToolBenchmarkConfig

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

BASELINE_FILE = Path(__file__).parent / "results.json"
LATEST_FILE = Path(__file__).parent / "latest.json"

SECTIONS = ("local", "remote")


def _section_for(remote: bool) -> str:
    return "remote" if remote else "local"


def _empty_sections() -> dict[str, list]:
    return {"local": [], "remote": []}



def _git_hash() -> str:
    try:
        return (
            subprocess.check_output(
                ["git", "rev-parse", "HEAD"],
                cwd=Path(__file__).parent,
                stderr=subprocess.DEVNULL,
            )
            .decode()
            .strip()
        )
    except Exception:
        return "unknown"


def _system_info() -> dict[str, str]:
    import torch
    import transformers
    import nnsight

    return {
        "python": platform.python_version(),
        "torch": torch.__version__,
        "transformers": transformers.__version__,
        "nnsight": nnsight.__version__,
    }


def _sync() -> None:
    """Block until GPU work is done, so wall-clock timing is accurate."""
    import torch

    if torch.cuda.is_available():
        torch.cuda.synchronize()


def _warmup_tool(
    tool: Any,
    model: "StandardizedTransformer",
    model_name: str,
    call_args: dict[str, Any],
    n_warmup: int,
    remote: bool = False,
) -> None:
    """Untimed warmup calls for a specific (tool, model) pair."""
    for _ in range(n_warmup):
        if remote:
            from .backend import RemoteBackendCounter

            backend = RemoteBackendCounter(model.to_model_key())
            tool(model, remote=True, backend=backend, **call_args)
        else:
            tool(model, **call_args)
            _sync()


def _stats_from_samples(samples: list[float]) -> dict[str, Any]:
    """Build a latency stats dict from raw samples."""
    mean = statistics.fmean(samples)
    std = statistics.stdev(samples) if len(samples) > 1 else 0.0
    return {
        "mean": round(mean, 6),
        "std": round(std, 6),
        "min": round(min(samples), 6),
        "max": round(max(samples), 6),
        "samples": [round(s, 6) for s in samples],
    }


def _measure_local(
    tool: Any,
    model: "StandardizedTransformer",
    call_args: dict[str, Any],
    n_repeat: int,
    label: str = "",
) -> dict[str, Any]:
    """Measure wall-clock latency for a local tool call."""
    from tqdm import tqdm

    kwargs = dict(call_args)
    samples: list[float] = []
    for _ in tqdm(range(n_repeat), desc=label, leave=False):
        _sync()
        t0 = time.perf_counter()
        tool(model, **kwargs)
        _sync()
        t1 = time.perf_counter()
        samples.append(t1 - t0)

    return {"latency": _stats_from_samples(samples)}


def _measure_remote(
    tool: Any,
    model: "StandardizedTransformer",
    model_name: str,
    call_args: dict[str, Any],
    n_repeat: int,
    label: str = "",
) -> dict[str, Any]:
    """Measure latency for a remote tool call using the backend counter.

    Creates a fresh ``RemoteBackendCounter`` per call to capture
    per-phase timing. The primary ``latency`` field stores
    ``total_unqueued`` stats — the cost excluding queue wait. A
    ``latency_breakdown`` dict holds all four phase stats.
    """
    from tqdm import tqdm

    from .backend import RemoteBackendCounter

    phases: dict[str, list[float]] = {
        "total": [],
        "total_unqueued": [],
        "running": [],
        "download": [],
    }

    kwargs = dict(call_args)
    for _ in tqdm(range(n_repeat), desc=label, leave=False):
        counter = RemoteBackendCounter(model.to_model_key())
        tool(model, remote=True, backend=counter, **kwargs)
        breakdown = counter.get_latency()
        for phase, value in breakdown.items():
            phases[phase].append(value)

    return {
        "latency": _stats_from_samples(phases["total_unqueued"]),
        "latency_breakdown": {
            phase: _stats_from_samples(samples)
            for phase, samples in phases.items()
        },
    }


def result_key(entry: dict[str, Any]) -> str:
    """Unique key for a row within its section: (tool, model, params).

    ``remote`` is no longer part of the key — rows live in separate
    ``results.local`` / ``results.remote`` sections instead.
    """
    return json.dumps(
        {
            "tool": entry["tool"],
            "model": entry["model"],
            "params": entry["params"],
        },
        sort_keys=True,
        default=str,
    )


class BenchmarkRunner:
    """Run benchmarks across models and tool configurations."""

    def __init__(
        self,
        n_repeat: int = 3,
        n_warmup: int = 1,
        remote: bool = False,
    ):
        self.n_repeat = n_repeat
        self.n_warmup = n_warmup
        self.remote = remote

    def run(
        self,
        models: dict[str, "StandardizedTransformer"],
        configs: list[ToolBenchmarkConfig],
    ) -> dict[str, Any]:
        """Run all benchmarks and return the full results dict.

        Rows are placed into ``results.local`` or ``results.remote``
        depending on ``self.remote``. The other section is left empty
        (merge will preserve the existing section's data).
        """
        rows: list[dict[str, Any]] = []
        errors: list[str] = []

        for config in configs:
            sweep_keys = list(config.sweep_params.keys())
            sweep_values = [config.sweep_params[k] for k in sweep_keys]
            combos = list(product(*sweep_values)) if sweep_values else [()]

            for model_name, model in models.items():
                combo_kwargs: list[tuple[dict[str, Any], dict[str, Any]]] = []
                for combo in combos:
                    sweep_dict = dict(zip(sweep_keys, combo))
                    if config.build_args is not None:
                        call_args = config.build_args(
                            model, config.fixed_args, sweep_dict
                        )
                    else:
                        call_args = {**config.fixed_args, **sweep_dict}
                    combo_kwargs.append((sweep_dict, call_args))

                # Warmup — if it fails, skip this entire (config, model)
                # but continue with the next one.
                if self.n_warmup > 0 and combo_kwargs:
                    warmup_label = f"{config.tool_name} | {model_name}"
                    if self.remote:
                        warmup_label += " | remote"
                    print(
                        f"  warming up: {warmup_label} (n_warmup={self.n_warmup})"
                    )
                    try:
                        _warmup_tool(
                            config.tool,
                            model,
                            model_name,
                            combo_kwargs[-1][1],
                            self.n_warmup,
                            remote=self.remote,
                        )
                    except Exception as exc:
                        msg = f"{warmup_label}: warmup failed ({exc})"
                        print(f"  ERROR: {msg} — skipping this config")
                        errors.append(msg)
                        continue

                for sweep_dict, call_args in combo_kwargs:
                    label = f"{config.tool_name} | {model_name}"
                    if sweep_dict:
                        param_str = ", ".join(
                            f"{k}={v}" for k, v in sweep_dict.items()
                        )
                        label += f" | {param_str}"
                    if self.remote:
                        label += " | remote"

                    print(f"  benchmarking: {label}")

                    try:
                        if self.remote:
                            measured = _measure_remote(
                                config.tool,
                                model,
                                model_name,
                                call_args,
                                self.n_repeat,
                                label=label,
                            )
                        else:
                            measured = _measure_local(
                                config.tool,
                                model,
                                call_args,
                                self.n_repeat,
                                label=label,
                            )
                    except Exception as exc:
                        msg = f"{label}: {exc}"
                        print(f"  ERROR: {msg} — skipping")
                        errors.append(msg)
                        continue

                    rows.append(
                        {
                            "tool": config.tool_name,
                            "model": model_name,
                            "params": sweep_dict,
                            **measured,
                        }
                    )

        if errors:
            print(f"\n  {len(errors)} config(s) failed:")
            for e in errors:
                print(f"    - {e}")

        section = _section_for(self.remote)
        results = _empty_sections()
        results[section] = rows

        return {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "git_hash": _git_hash(),
            "system_info": _system_info(),
            "n_repeat": self.n_repeat,
            "n_warmup": self.n_warmup,
            "results": results,
        }

    def run_and_save(
        self,
        models: dict[str, "StandardizedTransformer"],
        configs: list[ToolBenchmarkConfig],
        path: Path | None = None,
    ) -> dict[str, Any]:
        """Run benchmarks and save them to the *latest* results file.

        When the existing file's ``git_hash`` matches, sections are
        merged independently: the active section's rows are updated
        via key-match; the other section is preserved untouched.
        On hash mismatch the file is replaced wholesale.
        """
        path = path or LATEST_FILE
        data = self.run(models, configs)

        existing = load_run(path)
        merged = _should_merge(existing, data)
        if existing is not None and not merged:
            _warn_replace(existing, data, path)
        if merged:
            _warn_settings_mismatch(existing, data)  # type: ignore[arg-type]
            final = _merge_run(existing, data)  # type: ignore[arg-type]
        else:
            final = data

        save_run(path, final)

        action = "merged into" if merged else "written to"
        print(f"\n  results {action} {path}")
        return data


def load_run(path: Path) -> dict[str, Any] | None:
    """Load a benchmark run from *path*, or None on missing/corrupt."""
    if not path.exists():
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"warning: {path} is corrupt ({e}); treating as missing")
        return None


def save_run(path: Path, data: dict[str, Any]) -> None:
    """Write a benchmark run to *path* as pretty-printed JSON."""
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def _merge_section(
    existing_rows: list[dict[str, Any]],
    new_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Key-based merge within a single section."""
    rows_by_key: dict[str, dict[str, Any]] = {
        result_key(r): r for r in existing_rows
    }
    for row in new_rows:
        rows_by_key[result_key(row)] = row
    return list(rows_by_key.values())


def _merge_run(existing: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
    """Merge *new* into *existing* section-by-section.

    For each section, if *new* has rows in that section they are
    key-merged (new wins on conflicts, existing non-overlapping rows
    preserved). If *new* has no rows in a section, the existing
    section is kept as-is. Run-level metadata is taken from *new*.
    """
    merged = dict(new)
    merged_results = _empty_sections()

    for section in SECTIONS:
        existing_rows = existing.get("results", {}).get(section, [])
        new_rows = new.get("results", {}).get(section, [])

        if new_rows:
            merged_results[section] = _merge_section(existing_rows, new_rows)
        else:
            merged_results[section] = list(existing_rows)

    merged["results"] = merged_results
    return merged


def _should_merge(
    existing: dict[str, Any] | None, new: dict[str, Any]
) -> bool:
    """Return True iff *new* should be section-merged into *existing*.

    The only reason to replace wholesale is a git_hash change (or an
    unknown/missing hash) — a different code state means the old
    numbers aren't comparable in either section.
    """
    if existing is None:
        return False
    existing_hash = existing.get("git_hash")
    new_hash = new.get("git_hash")
    if not existing_hash or existing_hash == "unknown":
        return False
    if not new_hash or new_hash == "unknown":
        return False
    return existing_hash == new_hash


def _warn_replace(
    existing: dict[str, Any], new: dict[str, Any], path: Path
) -> None:
    """Surface why a prior file is about to be wiped."""
    ex_hash = existing.get("git_hash", "unknown")
    new_hash = new.get("git_hash", "unknown")
    if new_hash == "unknown":
        reason = "new run has no git hash (outside a git repo?)"
    elif ex_hash == "unknown":
        reason = "existing file has no git hash"
    else:
        reason = f"git_hash changed ({ex_hash[:8]} -> {new_hash[:8]})"
    n_rows = sum(
        len(existing.get("results", {}).get(s, []))
        for s in SECTIONS
    )
    print(
        f"warning: replacing {path} wholesale — {reason}; "
        f"{n_rows} prior row(s) will be dropped."
    )


def _warn_settings_mismatch(
    existing: dict[str, Any], new: dict[str, Any]
) -> None:
    """Warn when merging runs with different n_repeat or n_warmup.

    After merge, the run-level metadata reflects the *new* invocation,
    but rows that weren't re-run retain measurements from the prior
    settings. This warning makes the inconsistency visible.
    """
    for field in ("n_repeat", "n_warmup"):
        old_val = existing.get(field)
        new_val = new.get(field)
        if old_val is not None and new_val is not None and old_val != new_val:
            print(
                f"warning: {field} changed ({old_val} -> {new_val}); "
                f"re-run rows will use the new setting but prior rows "
                f"retain measurements from the old one."
            )


def promote_latest_to_baseline(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
) -> dict[str, Any] | None:
    """Promote the latest run to the committed baseline.

    Same-hash merge semantics: sections are merged independently,
    preserving non-overlapping rows in each section. On hash mismatch
    the baseline is replaced outright.
    """
    latest_path = latest_path or LATEST_FILE
    baseline_path = baseline_path or BASELINE_FILE

    latest = load_run(latest_path)
    if latest is None:
        print(f"No latest run found at {latest_path} — nothing to promote.")
        return None

    existing = load_run(baseline_path)
    merged = _should_merge(existing, latest)
    if existing is not None and not merged:
        _warn_replace(existing, latest, baseline_path)
    if merged:
        _warn_settings_mismatch(existing, latest)  # type: ignore[arg-type]
        final = _merge_run(existing, latest)  # type: ignore[arg-type]
    else:
        final = latest

    save_run(baseline_path, final)

    action = "merged into" if merged else "written to"
    print(f"latest run {action} baseline {baseline_path}")
    return final
