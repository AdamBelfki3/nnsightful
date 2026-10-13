"""Show and diff utilities for both dimensions (latency and peak_mem).

The ``latency.local`` and ``latency.remote`` blocks are shown as one
table per kind, side by side by (tool, model, params); the ``peak_mem``
block gets its own table of footprint and max prompt lengths per
threshold. Only measured slots appear in the tables; each block's
not-run / failed / unsupported slots are summarized below it.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .store import (
    BLOCKS,
    DIMENSIONS,
    ENV_KINDS,
    FAILED,
    NOT_RUN,
    UNSUPPORTED,
    baseline_path as _baseline_path,
    block_dim,
    env_differences,
    env_label,
    find_previous,
    get_block,
    has_value,
    iter_slots,
    last_changes,
    load_baseline,
    load_run,
    measured_keys,
    run_path,
    slot_counts,
    slot_key,
)


def _row_matches(
    row: dict[str, Any],
    tools: list[str] | None,
    models: list[str] | None,
) -> bool:
    """OR-substring filter on tool_name and model.

    A row passes a filter if its field contains *any* of the given
    substrings.  ``None`` on either side disables that filter.
    """
    if tools is not None and not any(t in row["tool"] for t in tools):
        return False
    if models is not None and not any(m in row["model"] for m in models):
        return False
    return True


def _sections_to_show(remote: bool | None) -> list[str]:
    if remote is True:
        return ["remote"]
    if remote is False:
        return ["local"]
    return list(ENV_KINDS)


def _block(data: dict[str, Any] | None, block: str) -> dict[str, Any]:
    return get_block(data, block) or {}


def latency_rows(data: dict[str, Any] | None, env: str) -> list[dict[str, Any]]:
    """Measured slots of ``latency.<env>`` as ``(tool, model, params, latency[, latency_breakdown])`` rows."""
    rows = []
    for slot in _block(data, f"latency.{env}").get("runs", []):
        if not has_value(slot):
            continue
        stats = slot["stats"]
        row = {"tool": slot["tool"], "model": slot["model"], "params": slot["params"], "latency": stats}
        if "breakdown" in stats:
            row["latency_breakdown"] = stats["breakdown"]
        rows.append(row)
    return rows


def _latency_repeat(data: dict[str, Any]) -> Any:
    repeats = {
        kind: _block(data, f"latency.{kind}").get("meta_params", {}).get("n_repeat", "?")
        for kind in ENV_KINDS if latency_rows(data, kind)
    }
    return ", ".join(f"{k} {v}" for k, v in repeats.items()) or "?"


def _run_label(data: dict[str, Any]) -> str:
    """``latency.local a1b2c3d 2026-01-02 · peak_mem …`` for the blocks with results."""
    return " · ".join(
        f"{block} {env_label(_block(data, block).get('env'))}"
        for block in BLOCKS if _block(data, block).get("env")
    ) or "(empty)"


def status_lines(
    data: dict[str, Any] | None, blocks: list[str], tools: list[str] | None = None,
    models: list[str] | None = None, detail: bool = False,
) -> list[str]:
    """Per block: counts of slots that aren't in the tables (not run / failed / unsupported).

    With *detail*, failed and unsupported slots are listed with their error.
    """
    out = []
    for block in blocks:
        runs = [s for s in _block(data, block).get("runs", []) if _row_matches(s, tools, models)]
        skipped = [s for s in runs if not has_value(s)]
        if not skipped:
            continue
        counts = {st: sum(s.get("status") == st for s in skipped) for st in (NOT_RUN, FAILED, UNSUPPORTED)}
        text = ", ".join(f"{n} {st.replace('_', ' ')}" for st, n in counts.items() if n)
        out.append(f"{block}: {sum(has_value(s) for s in runs)} measured; {text}")
        if detail:
            for slot in skipped:
                if slot.get("status") in (FAILED, UNSUPPORTED):
                    out.append(
                        f"    {slot['status']}: {slot['tool']} | {slot['model']} | "
                        f"{_format_params(slot)} — {slot.get('error', '')}"
                    )
    return out


def _ms(val: float | None) -> str:
    return f"{val * 1000:.1f}ms" if val is not None else "-"


def _format_params(row: dict[str, Any]) -> str:
    s = ", ".join(f"{k}={v}" for k, v in row["params"].items())
    if not s:
        s = "(default)"
    if len(s) > 30:
        s = s[:27] + "..."
    return s


def _sort_key(row: dict[str, Any]) -> tuple:
    """Group rows by tool first, then by model, then by params.

    Display ordering only — the underlying file keeps insertion order
    (which can interleave tools after a merge). Sorting at print time
    keeps all rows for one tool together even when they were measured
    in different runs.
    """
    return (row["tool"], row["model"], sorted(row["params"].items()))


def _md_status_emoji(row: dict[str, Any]) -> str:
    """Visual indicator for Markdown diff rows (inline-safe).

    Faster = speedup = 🟢. Slower = regression = 🔴. Status-level
    new/removed rows get their own markers so they're visually
    distinct from performance deltas.
    """
    status = row["status"]
    if status == "new":
        return "🆕"
    if status == "removed":
        return "❌"
    d_ms = row["delta_ms"]
    if d_ms < 0:
        return "🟢"
    if d_ms > 0:
        return "🔴"
    return "⚪"  # exactly zero delta — measurement noise or identical


def _format_delta(row: dict[str, Any]) -> str:
    """Human-readable delta string.

    Uses percentage for small changes and ratio (``Nx faster`` / ``Nx
    slower``) once the speedup / slowdown factor reaches 2×. Percentage
    alone reads poorly for large speedups — e.g. a 4952ms → 626ms change
    is "87.4% faster" but intuitively "7.9x faster".
    """
    if row["status"] == "new":
        return "(new)"
    if row["status"] == "removed":
        return "(removed)"

    d_ms = row["delta_ms"]
    old_mean = row["old_mean"]
    new_mean = row["new_mean"]
    sign = "+" if d_ms >= 0 else ""

    if d_ms > 0:
        direction = "slower"
        ratio = new_mean / old_mean if old_mean > 0 else None
    else:
        direction = "faster"
        ratio = old_mean / new_mean if new_mean > 0 else None

    if ratio is not None and ratio >= 2.0:
        return f"{sign}{d_ms:.1f}ms ({ratio:.1f}x {direction})"

    pct = abs(row["delta_pct"])
    return f"{sign}{d_ms:.1f}ms ({pct:.1f}% {direction})"


# ---------------------------------------------------------------------------
# compute_diff
# ---------------------------------------------------------------------------


def _baseline_summary(baseline: dict[str, Any]) -> str:
    parts = []
    for block in BLOCKS:
        b = get_block(baseline, block)
        if b is None:
            continue
        counts = slot_counts(b)
        parts.append(f"{block} {env_label(b.get('env'))} ({counts['current']} current, {counts['stale']} stale)")
    return "; ".join(parts) or "(empty)"


def _arrow(line: dict[str, Any]) -> str:
    return f"{(line['from'].get('git_hash') or '?')[:7]} → {(line['to'].get('git_hash') or '?')[:7]}"


def _cached_lines(
    baseline: dict[str, Any] | None, block: str, skip: set[str],
    tools: list[str] | None, models: list[str] | None,
) -> list[dict[str, Any]]:
    """Baseline slots of *block* with a ``last_change``, minus tests in *skip*."""
    return [
        line for key, line in last_changes(baseline).items()
        if line["block"] == block and key not in skip and _row_matches(line, tools, models)
    ]


def compute_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    with_previous: bool = False,
) -> list[dict[str, Any]]:
    """Latency diff of ``run.json`` against the baseline.

    Each measured run slot is compared with its baseline slot: ``current``,
    ``stale @ <env>``, or new when the baseline slot has no value;
    ``source`` names which. With *with_previous*, baseline slots not
    measured in the run are added from their ``last_change``.

    Returns dicts with keys: section, tool, model, params, old_mean,
    new_mean, delta_ms, delta_pct, status, source.
    """
    current = load_run(latest_path)
    if current is None:
        return []
    baseline = load_baseline(baseline_path)
    previous = find_previous(baseline)
    run_keys = measured_keys(current)

    rows: list[dict[str, Any]] = []
    for section in _sections_to_show(remote):
        for cur in latency_rows(current, section):
            row: dict[str, Any] = {
                "section": section,
                "tool": cur["tool"],
                "model": cur["model"],
                "params": cur["params"],
                "new_mean": cur["latency"]["mean"],
                "old_mean": None,
                "delta_ms": None,
                "delta_pct": None,
                "status": "new",
                "source": None,
            }
            prev = previous.get(slot_key(f"latency.{section}", cur))
            if prev is not None:
                old_slot, _, source = prev
                _set_change(row, old_slot["stats"]["mean"], row["new_mean"])
                row["source"] = source
            rows.append(row)
        if with_previous:
            for line in _cached_lines(baseline, f"latency.{section}", run_keys, tools, models):
                row = {
                    "section": section,
                    "tool": line["tool"],
                    "model": line["model"],
                    "params": line["params"],
                    "status": "new",
                }
                _set_change(row, line["from"]["value"], line["to"]["value"])
                row["source"] = f"last change {row['delta_pct']:+.1f}% ({_arrow(line)})"
                rows.append(row)

    return [r for r in rows if _row_matches(r, tools, models)]


def _set_change(row: dict[str, Any], old_mean: float, new_mean: float) -> None:
    delta = new_mean - old_mean
    row.update(
        old_mean=old_mean,
        new_mean=new_mean,
        delta_ms=delta * 1000,
        delta_pct=(delta / old_mean * 100) if old_mean > 0 else 0.0,
        status="changed",
    )


def comparison_warnings(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    dims: list[str] | None = None,
    remote: bool | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
) -> list[str]:
    """One line per compared baseline environment whose setup differs from the run's.

    Code-state stamps (git hash, dirty) are expected to differ and aren't
    reported; package versions, GPU, dtype, autocast, server etc. are.
    """
    current = load_run(latest_path)
    if current is None:
        return []
    previous = find_previous(load_baseline(baseline_path))
    blocks = _blocks_to_show(dims, remote)
    used: dict[tuple[str, str], dict[str, Any]] = {}
    for key, block, slot in iter_slots(current):
        if block in blocks and has_value(slot) and _row_matches(slot, tools, models) and key in previous:
            _, env, source = previous[key]
            used[(block, source)] = env or {}
    out = []
    for (block, source), env in used.items():
        diffs = env_differences(env, _block(current, block).get("env") or {})
        if diffs:
            out.append(f"{block} vs {source}: " + "; ".join(diffs))
    return out


def _blocks_to_show(dims: list[str] | None, remote: bool | None) -> list[str]:
    selected = _dims(dims, remote)
    kinds = _sections_to_show(remote)
    return [b for b in BLOCKS if block_dim(b) in selected and (b == "peak_mem" or b.split(".")[1] in kinds)]


# ---------------------------------------------------------------------------
# print_diff — same layout for local and remote (Baseline / Current / Delta)
# ---------------------------------------------------------------------------


def _print_diff_latency(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    with_previous: bool = False,
) -> None:
    """Print formatted diff tables, one per non-empty section.

    Both local and remote sections use the same columns: Baseline,
    Current, Delta.  For remote rows, Baseline and Current are the
    ``total_unqueued`` metric (the primary value stored in ``latency``).
    """
    latest_path = run_path(latest_path)
    baseline_path = _baseline_path(baseline_path)

    all_rows = compute_diff(
        latest_path, baseline_path, tools=tools, models=models, remote=remote,
        with_previous=with_previous,
    )

    if not all_rows:
        parts = []
        if tools:
            parts.append(f"tools~={tools!r}")
        if models:
            parts.append(f"models~={models!r}")
        if remote is not None:
            parts.append(f"section={'remote' if remote else 'local'}")
        filt = f" matching {', '.join(parts)}" if parts else ""
        print(f"No benchmark results to compare{filt}.")
        return

    current = load_run(latest_path)
    baseline = load_baseline(baseline_path)

    print("=" * 80)
    print("BENCHMARK DIFF")
    print("=" * 80)
    if current:
        print(f"  Current:   {_run_label(current)}  [{latest_path.name}]")
    if baseline:
        print(f"  Baseline:  {_baseline_summary(baseline)}  [{baseline_path.name}]")
    else:
        print(f"  Baseline:  (no baseline at {baseline_path.name})")

    sections = _sections_to_show(remote)
    for section in sections:
        section_rows = [r for r in all_rows if r["section"] == section]
        if not section_rows:
            continue
        section_rows.sort(key=_sort_key)

        tool_w = max(len(r["tool"]) for r in section_rows)
        model_w = max(len(r["model"]) for r in section_rows)

        label = section.upper()
        if section == "remote":
            label += " (unqueued)"

        print(f"\n  [{label}]")
        header = (
            f"  {'Tool':<{tool_w}}  "
            f"{'Model':<{model_w}}  "
            f"{'Params':<30}  "
            f"{'Baseline':>10}  "
            f"{'Current':>10}  "
            f"{'Delta':>22}  "
            f"{'vs':<26}"
        )
        print(header)
        print("  " + "-" * (len(header) - 2))

        for row in section_rows:
            baseline_cell = _ms(row.get("old_mean"))
            cur_cell = _ms(row.get("new_mean"))
            line = (
                f"  {row['tool']:<{tool_w}}  "
                f"{row['model']:<{model_w}}  "
                f"{_format_params(row):<30}  "
                f"{baseline_cell:>10}  "
                f"{cur_cell:>10}  "
                f"{_format_delta(row):>22}  "
                f"{row.get('source') or '':<26}"
            )
            print(line)

    print("\n" + "=" * 80)


# ---------------------------------------------------------------------------
# print_results — compact (Mean + Std) by default, --detail for full view
# ---------------------------------------------------------------------------


def _print_results_latency(
    path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    detail: bool = False,
) -> None:
    """Print the latest run's results, one table per non-empty section.

    Default: Mean + Std only.
    ``detail=True``: local adds Min/Max; remote adds Min/Max +
    Running/Download/Total breakdown.
    """
    path = run_path(path)
    current = load_run(path)

    if current is None:
        print(f"No benchmark results found at {path}.")
        return

    sections = _sections_to_show(remote)
    all_rows: list[tuple[str, dict[str, Any]]] = []
    for section in sections:
        for r in latency_rows(current, section):
            if _row_matches(r, tools, models):
                all_rows.append((section, r))

    if not all_rows:
        parts = []
        if tools:
            parts.append(f"tools~={tools!r}")
        if models:
            parts.append(f"models~={models!r}")
        if remote is not None:
            parts.append(f"section={'remote' if remote else 'local'}")
        filt = f" matching {', '.join(parts)}" if parts else ""
        print(f"No results{filt} in the latest run.")
        return

    print("=" * 80)
    print("BENCHMARK RESULTS")
    print("=" * 80)
    print(f"  Run:    {_run_label(current)}")
    print(f"  Repeat: {_latency_repeat(current)}")

    for section in sections:
        section_rows = [r for s, r in all_rows if s == section]
        if not section_rows:
            continue
        section_rows.sort(key=_sort_key)

        tool_w = max(len(r["tool"]) for r in section_rows)
        model_w = max(len(r["model"]) for r in section_rows)

        if section == "remote":
            _print_results_remote(section_rows, tool_w, model_w, detail)
        else:
            _print_results_local(section_rows, tool_w, model_w, detail)

    print("\n" + "=" * 80)


def _print_results_local(
    rows: list[dict[str, Any]], tool_w: int, model_w: int, detail: bool
) -> None:
    print(f"\n  [LOCAL]")

    cols = f"{'Mean':>10}  {'Std':>10}"
    if detail:
        cols += f"  {'Min':>10}  {'Max':>10}"
    header = f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Params':<30}  {cols}"
    print(header)
    print("  " + "-" * (len(header) - 2))

    for row in rows:
        lat = row["latency"]
        vals = f"{lat['mean'] * 1000:>8.1f}ms  {lat['std'] * 1000:>8.1f}ms"
        if detail:
            vals += f"  {lat['min'] * 1000:>8.1f}ms  {lat['max'] * 1000:>8.1f}ms"
        line = (
            f"  {row['tool']:<{tool_w}}  "
            f"{row['model']:<{model_w}}  "
            f"{_format_params(row):<30}  {vals}"
        )
        print(line)


def _print_results_remote(
    rows: list[dict[str, Any]], tool_w: int, model_w: int, detail: bool
) -> None:
    label = "REMOTE (unqueued)"
    print(f"\n  [{label}]")

    cols = f"{'Mean':>10}  {'Std':>10}"
    if detail:
        cols += f"  {'Min':>10}  {'Max':>10}  {'Running':>10}  {'Download':>10}  {'Total':>10}"
    header = f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Params':<30}  {cols}"
    print(header)
    print("  " + "-" * (len(header) - 2))

    for row in rows:
        lat = row["latency"]
        vals = f"{lat['mean'] * 1000:>8.1f}ms  {lat['std'] * 1000:>8.1f}ms"
        if detail:
            vals += f"  {lat['min'] * 1000:>8.1f}ms  {lat['max'] * 1000:>8.1f}ms"
            bd = row.get("latency_breakdown", {})
            running = _ms(bd.get("running", {}).get("mean"))
            download = _ms(bd.get("download", {}).get("mean"))
            total = _ms(bd.get("total", {}).get("mean"))
            vals += f"  {running:>10}  {download:>10}  {total:>10}"
        line = (
            f"  {row['tool']:<{tool_w}}  "
            f"{row['model']:<{model_w}}  "
            f"{_format_params(row):<30}  {vals}"
        )
        print(line)


# ---------------------------------------------------------------------------
# Markdown export — same data as print_*, formatted as Markdown tables.
# ---------------------------------------------------------------------------


def _md_params(row: dict[str, Any]) -> str:
    """Params for Markdown — no width truncation, escape pipes."""
    s = ", ".join(f"{k}={v}" for k, v in row["params"].items())
    if not s:
        s = "(default)"
    return s.replace("|", "\\|")


def _md_section_label(section: str) -> str:
    return "REMOTE (unqueued)" if section == "remote" else "LOCAL"


def _markdown_diff_latency(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    plots: bool = False,
    with_previous: bool = False,
) -> str:
    """Build a Markdown document of the diff. One table per non-empty section.

    When ``plots=True`` and matplotlib is installed, each ``### tool``
    section gets a comparison plot: baseline (dashed) vs current (solid),
    one color per model.
    """
    latest_path = run_path(latest_path)
    baseline_path = _baseline_path(baseline_path)

    rows = compute_diff(
        latest_path, baseline_path, tools=tools, models=models, remote=remote,
        with_previous=with_previous,
    )

    if not rows:
        return "# Benchmark Diff\n\n_No benchmark results to compare._\n"

    current = load_run(latest_path)
    baseline = load_baseline(baseline_path)

    out: list[str] = ["# Benchmark Diff", ""]
    if current:
        out.append(
            f"- **Current:** `{_run_label(current)}` — `{latest_path.name}`"
        )
    if baseline:
        out.append(
            f"- **Baseline:** {_baseline_summary(baseline)} — `{baseline_path.name}`"
        )
    else:
        out.append(f"- **Baseline:** _none at `{baseline_path.name}`_")
    out.append("")

    plot_renderer = None
    if plots:
        from .plots import matplotlib_available, plot_tool_section_diff

        if matplotlib_available():
            plot_renderer = plot_tool_section_diff
        else:
            out.append(
                "_Plots requested but matplotlib is not installed. "
                "Install it with `pip install matplotlib`._"
            )
            out.append("")

    for section in _sections_to_show(remote):
        section_rows = [r for r in rows if r["section"] == section]
        if not section_rows:
            continue
        section_rows.sort(key=_sort_key)

        out.append(f"## {_md_section_label(section)}")
        out.append("")

        last_tool = None
        last_model = None
        for row in section_rows:
            if row["tool"] != last_tool:
                if last_tool is not None:
                    out.append("")  # blank after previous table
                out.append(f"### {row['tool']}")
                out.append("")
                if plot_renderer is not None:
                    tool_rows = [
                        r for r in section_rows if r["tool"] == row["tool"]
                    ]
                    data_url = plot_renderer(row["tool"], section, tool_rows)
                    if data_url is not None:
                        out.append(
                            f"![{row['tool']} — {_md_section_label(section)} diff]"
                            f"({data_url})"
                        )
                        out.append("")
                last_tool = row["tool"]
                last_model = None  # force model header to re-emit under this tool
            if row["model"] != last_model:
                if last_model is not None:
                    out.append("")  # blank after previous table
                out.append(f"#### {row['model']}")
                out.append("")
                out.append("|  | Params | Baseline | Current | Delta | vs |")
                out.append("|:-:|--------|---------:|--------:|:------|:---|")
                last_model = row["model"]
            out.append(
                f"| {_md_status_emoji(row)} | {_md_params(row)} | "
                f"{_ms(row.get('old_mean'))} | {_ms(row.get('new_mean'))} | "
                f"{_format_delta(row)} | {row.get('source') or ''} |"
            )
        out.append("")

    # Legend for the status column
    out.append("---")
    out.append(
        "🟢 faster &nbsp;·&nbsp; 🔴 slower &nbsp;·&nbsp; "
        "⚪ unchanged &nbsp;·&nbsp; 🆕 new &nbsp;·&nbsp; ❌ removed"
    )
    out.append("")

    return "\n".join(out)


def _markdown_results_latency(
    path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    detail: bool = False,
    plots: bool = False,
) -> str:
    """Build a Markdown document of the latest run's results.

    When ``plots=True`` and matplotlib is installed, each ``### tool``
    section gets a line plot of mean latency vs. the swept parameter
    (one line per model), embedded as a base64 PNG data URL.
    """
    path = run_path(path)
    current = load_run(path)
    if current is None:
        return f"# Benchmark Results\n\n_No benchmark results found at `{path}`._\n"

    sections = _sections_to_show(remote)
    selected: list[tuple[str, dict[str, Any]]] = []
    for section in sections:
        for r in latency_rows(current, section):
            if _row_matches(r, tools, models):
                selected.append((section, r))

    if not selected:
        return "# Benchmark Results\n\n_No results match the given filters._\n"

    out: list[str] = ["# Benchmark Results", ""]
    out.append(f"- **Run:** `{_run_label(current)}`")
    out.append(f"- **Repeat:** {_latency_repeat(current)}")
    out.append("")

    plot_renderer = None
    if plots:
        from .plots import matplotlib_available, plot_tool_section

        if matplotlib_available():
            plot_renderer = plot_tool_section
        else:
            out.append(
                "_Plots requested but matplotlib is not installed. "
                "Install it with `pip install matplotlib`._"
            )
            out.append("")

    for section in sections:
        section_rows = [r for s, r in selected if s == section]
        if not section_rows:
            continue
        section_rows.sort(key=_sort_key)

        out.append(f"## {_md_section_label(section)}")
        out.append("")

        header, sep = _md_results_header(section, detail)

        last_tool = None
        last_model = None
        for row in section_rows:
            if row["tool"] != last_tool:
                if last_tool is not None:
                    out.append("")
                out.append(f"### {row['tool']}")
                out.append("")
                # Render a single plot for this (tool, section) group.
                if plot_renderer is not None:
                    tool_rows = [r for r in section_rows if r["tool"] == row["tool"]]
                    data_url = plot_renderer(row["tool"], section, tool_rows)
                    if data_url is not None:
                        out.append(
                            f"![{row['tool']} — {_md_section_label(section)}]"
                            f"({data_url})"
                        )
                        out.append("")
                last_tool = row["tool"]
                last_model = None
            if row["model"] != last_model:
                if last_model is not None:
                    out.append("")
                out.append(f"#### {row['model']}")
                out.append("")
                out.append(header)
                out.append(sep)
                last_model = row["model"]
            out.append(_md_results_row(row, section, detail))
        out.append("")

    return "\n".join(out)


def _md_results_header(section: str, detail: bool) -> tuple[str, str]:
    """Build the Markdown header + separator rows for a results table.

    The Tool/Model columns are dropped — they appear as ``###`` / ``####``
    headings instead — so only Params + latency columns remain.
    """
    if section == "remote" and detail:
        return (
            "| Params | Mean | Std | Min | Max | Running | Download | Total |",
            "|--------|-----:|----:|----:|----:|--------:|---------:|------:|",
        )
    if section == "local" and detail:
        return (
            "| Params | Mean | Std | Min | Max |",
            "|--------|-----:|----:|----:|----:|",
        )
    return (
        "| Params | Mean | Std |",
        "|--------|-----:|----:|",
    )


def _md_results_row(row: dict[str, Any], section: str, detail: bool) -> str:
    """Build a Markdown results row (no Tool/Model cells — those are headings)."""
    lat = row["latency"]
    cells = [
        _md_params(row),
        f"{lat['mean'] * 1000:.1f}ms",
        f"{lat['std'] * 1000:.1f}ms",
    ]
    if detail:
        cells += [
            f"{lat['min'] * 1000:.1f}ms",
            f"{lat['max'] * 1000:.1f}ms",
        ]
        if section == "remote":
            bd = row.get("latency_breakdown", {})
            cells += [
                _ms(bd.get("running", {}).get("mean")),
                _ms(bd.get("download", {}).get("mean")),
                _ms(bd.get("total", {}).get("mean")),
            ]
    return "| " + " | ".join(cells) + " |"


# ---------------------------------------------------------------------------
# Peak memory — footprint + max prompt length per threshold
# ---------------------------------------------------------------------------


def _bytes(val: int | None) -> str:
    if val is None:
        return "-"
    if val >= 2**30:
        return f"{val / 2**30:.2f}GiB"
    return f"{val / 2**20:.1f}MiB"


def _pct(val: float | None) -> str:
    return f"{val:.1f}%" if val is not None else "-"


def _peak_view(slot: dict[str, Any]) -> dict[str, Any]:
    """A measured peak slot with its stats lifted to the top level, for display."""
    return {**{k: slot[k] for k in ("tool", "model", "params")}, **slot["stats"]}


def _peak_runs(data: dict[str, Any] | None) -> list[dict[str, Any]]:
    return [_peak_view(s) for s in _block(data, "peak_mem").get("runs", []) if has_value(s)]


def _peak_meta(data: dict[str, Any] | None) -> dict[str, Any]:
    return _block(data, "peak_mem").get("meta_params", {})


def _peak_env(data: dict[str, Any] | None) -> dict[str, Any]:
    return _block(data, "peak_mem").get("env") or {}


def _threshold_labels(*runs_lists: list[dict[str, Any]]) -> list[str]:
    """Threshold labels across runs, ordered by percentage."""
    labels = {
        label
        for runs in runs_lists
        for run in runs
        for label in run.get("max_prompt_length", {})
    }
    return sorted(labels, key=lambda label: float(label.rstrip("%")))


def _max_len_cell(run: dict[str, Any] | None, label: str, meta: dict[str, Any]) -> str:
    """``36``, ``>=4096`` (capped) or ``<2`` (even the smallest length is over)."""
    if run is None:
        return "-"
    value = run.get("max_prompt_length", {}).get(label)
    if value is None:
        return f"<{meta.get('min_length', '?')}" if label in run.get("max_prompt_length", {}) else "-"
    if label in run.get("capped", []):
        return f">={value}"
    return str(value)


def _peak_header_line(meta: dict[str, Any], env: dict[str, Any]) -> str:
    """``local, bfloat16, autocast, swept=prompt_length, repeat=3`` from the block env and meta_params."""
    parts = [str(env.get("kind", "?")), str(env.get("dtype", "?"))]
    if env.get("autocast"):
        parts.append("autocast")
    parts.append(f"swept={meta.get('swept', '?')}")
    parts.append(f"repeat={meta.get('n_repeat', '?')}")
    return ", ".join(parts)


def _filtered_peak_runs(
    data: dict[str, Any] | None,
    tools: list[str] | None,
    models: list[str] | None,
) -> list[dict[str, Any]]:
    runs = [r for r in _peak_runs(data) if _row_matches(r, tools, models)]
    return sorted(runs, key=_sort_key)


def _point_latency(point: dict[str, Any]) -> tuple[str, str]:
    lat = point.get("latency")
    if not lat:
        return "-", "-"
    return _ms(lat["mean"]), _ms(lat["std"])


def _print_results_peak(
    path: Path | None,
    tools: list[str] | None,
    models: list[str] | None,
    detail: bool,
) -> None:
    current = load_run(path)
    runs = _filtered_peak_runs(current, tools, models)
    if not runs:
        print("No peak-memory results in the latest run.")
        return

    meta = _peak_meta(current)
    labels = _threshold_labels(runs)
    axis = meta.get("swept", "prompt_length")
    tool_w = max(len(r["tool"]) for r in runs)
    model_w = max(len(r["model"]) for r in runs)

    print("=" * 80)
    print("PEAK MEMORY (local GPU)")
    print("=" * 80)
    print(f"  Run:    {_run_label(current)}")
    print(f"  Setup:  {_peak_header_line(meta, _peak_env(current))}")
    print(f"  Cells:  largest {axis} whose peak stays within N% of the model footprint")
    print()
    cols = "".join(f"  {label:>8}" for label in labels)
    header = (
        f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Params':<30}  "
        f"{'Footprint':>10}{cols}"
    )
    print(header)
    print("  " + "-" * (len(header) - 2))
    for run in runs:
        cells = "".join(f"  {_max_len_cell(run, l, meta):>8}" for l in labels)
        print(
            f"  {run['tool']:<{tool_w}}  {run['model']:<{model_w}}  "
            f"{_format_params(run):<30}  {_bytes(run['footprint_bytes']):>10}{cells}"
        )

    if detail:
        for run in runs:
            print(f"\n  [{run['tool']} | {run['model']}]")
            print(f"  {axis:>14}  {'Peak':>10}  {'% fp':>7}  {'Mean':>10}  {'Std':>10}")
            for point in run["points"]:
                mean, std = _point_latency(point)
                peak = "OOM" if point.get("oom") else _bytes(point["peak_bytes"])
                print(
                    f"  {point[axis]:>14}  {peak:>10}  {_pct(point['pct']):>7}  "
                    f"{mean:>10}  {std:>10}"
                )

    print("\n" + "=" * 80)


def compute_peak_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    with_previous: bool = False,
) -> list[dict[str, Any]]:
    """Peak-memory diff of ``run.json`` against the baseline (see :func:`compute_diff`).

    Each row has ``tool``, ``model``, ``params``, ``old`` / ``new`` (runs,
    or None), ``status`` (``changed`` / ``new``) and ``source``.
    """
    current = load_run(latest_path)
    baseline = load_baseline(baseline_path)
    previous = find_previous(baseline)
    run_keys = measured_keys(current)

    rows = []
    for new in _peak_runs(current):
        prev = previous.get(slot_key("peak_mem", new))
        old, source = (_peak_view(prev[0]), prev[2]) if prev else (None, None)
        rows.append({
            "tool": new["tool"],
            "model": new["model"],
            "params": new["params"],
            "old": old,
            "new": new,
            "status": "changed" if old else "new",
            "source": source,
        })
    if with_previous and current is not None:
        for line in _cached_lines(baseline, "peak_mem", run_keys, None, None):
            ref = {k: line[k] for k in ("tool", "model", "params")}
            rows.append({
                **ref,
                "old": {**ref, **line["from"]["value"]},
                "new": {**ref, **line["to"]["value"]},
                "status": "changed",
                "source": f"last change ({_arrow(line)})",
            })
    rows = [r for r in rows if _row_matches(r, tools, models)]
    return sorted(rows, key=_sort_key)


def _peak_delta_cell(row: dict[str, Any], label: str, meta: dict[str, Any]) -> str:
    """``36 -> 38 (+2)``; one side only for new / removed runs."""
    old = _max_len_cell(row["old"], label, meta)
    new = _max_len_cell(row["new"], label, meta)
    if row["status"] != "changed":
        return new if row["status"] == "new" else old
    a = row["old"].get("max_prompt_length", {}).get(label)
    b = row["new"].get("max_prompt_length", {}).get(label)
    if a is None or b is None or a == b:
        return new if old == new else f"{old} -> {new}"
    return f"{old} -> {new} ({b - a:+d})"


def _peak_direction(row: dict[str, Any]) -> int:
    """+1 if any max length grew and none shrank, -1 if any shrank, else 0."""
    if row["status"] != "changed":
        return 0
    old = row["old"].get("max_prompt_length", {})
    new = row["new"].get("max_prompt_length", {})
    deltas = [
        (new[l] or 0) - (old[l] or 0)
        for l in set(old) & set(new)
    ]
    if any(d < 0 for d in deltas):
        return -1
    if any(d > 0 for d in deltas):
        return 1
    return 0


def _peak_source(row: dict[str, Any]) -> str:
    if row["status"] == "new":
        return "(new)"
    if row["status"] == "removed":
        return "(removed)"
    return row["source"] or ""


def _peak_status_emoji(row: dict[str, Any]) -> str:
    if row["status"] == "new":
        return "🆕"
    if row["status"] == "removed":
        return "❌"
    return {1: "🟢", -1: "🔴", 0: "⚪"}[_peak_direction(row)]


def _print_diff_peak(
    latest_path: Path | None,
    baseline_path: Path | None,
    tools: list[str] | None,
    models: list[str] | None,
    with_previous: bool = False,
) -> None:
    rows = compute_peak_diff(latest_path, baseline_path, tools, models, with_previous)
    if not rows:
        print("No peak-memory results to compare.")
        return
    meta = _peak_meta(load_run(latest_path))
    labels = _threshold_labels([r["old"] for r in rows if r["old"]], [r["new"] for r in rows if r["new"]])
    tool_w = max(len(r["tool"]) for r in rows)
    model_w = max(len(r["model"]) for r in rows)

    print("=" * 80)
    print("PEAK MEMORY DIFF (max prompt length within N% of footprint)")
    print("=" * 80)
    cols = "".join(f"  {label:>20}" for label in labels)
    header = f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Footprint':>10}{cols}  {'vs':<26}"
    print(header)
    print("  " + "-" * (len(header) - 2))
    for row in rows:
        ref = row["new"] or row["old"]
        cells = "".join(f"  {_peak_delta_cell(row, l, meta):>20}" for l in labels)
        print(
            f"  {row['tool']:<{tool_w}}  {row['model']:<{model_w}}  "
            f"{_bytes(ref['footprint_bytes']):>10}{cells}  {_peak_source(row):<26}"
        )
    print("\n" + "=" * 80)


def _md_peak_section(
    runs_by_tool: dict[str, list[dict[str, Any]]],
    render_table: Any,
    plot_fn: Any,
    axis: str,
) -> list[str]:
    out: list[str] = []
    for tool, tool_runs in runs_by_tool.items():
        out.append(f"### {tool}")
        out.append("")
        if plot_fn is not None:
            data_url = plot_fn(tool, tool_runs, axis=axis)
            if data_url is not None:
                out.append(f"![{tool} — peak memory]({data_url})")
                out.append("")
        out.extend(render_table(tool_runs))
        out.append("")
    return out


def _group_by_tool(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault(row["tool"], []).append(row)
    return grouped


def _peak_plotter(plots: bool, name: str, out: list[str]) -> Any:
    if not plots:
        return None
    from . import plots as plots_mod

    if plots_mod.matplotlib_available():
        return getattr(plots_mod, name)
    out.append(
        "_Plots requested but matplotlib is not installed. "
        "Install it with `pip install matplotlib`._"
    )
    out.append("")
    return None


def _markdown_results_peak(
    path: Path | None,
    tools: list[str] | None,
    models: list[str] | None,
    detail: bool,
    plots: bool,
) -> list[str]:
    current = load_run(path)
    runs = _filtered_peak_runs(current, tools, models)
    if not runs:
        return []
    meta = _peak_meta(current)
    labels = _threshold_labels(runs)
    axis = meta.get("swept", "prompt_length")

    out = ["## PEAK MEMORY (local GPU)", ""]
    out.append(f"- **Setup:** {_peak_header_line(meta, _peak_env(current))}")
    out.append(
        f"- **Cells:** largest `{axis}` whose peak stays within N% of the "
        f"model footprint (`>=` hit the length cap, `<` already over at the smallest length)"
    )
    out.append("")
    plot_fn = _peak_plotter(plots, "plot_peak_mem", out)

    def table(tool_runs: list[dict[str, Any]]) -> list[str]:
        lines = [
            "| Model | Params | Footprint | " + " | ".join(labels) + " |",
            "|-------|--------|----------:|" + "".join("----:|" for _ in labels),
        ]
        for run in tool_runs:
            cells = " | ".join(_max_len_cell(run, l, meta) for l in labels)
            lines.append(
                f"| {run['model']} | {_md_params(run)} | "
                f"{_bytes(run['footprint_bytes'])} | {cells} |"
            )
        if detail:
            for run in tool_runs:
                lines += [
                    "",
                    f"#### {run['model']} — points",
                    "",
                    f"| {axis} | Peak | % footprint | Mean | Std |",
                    "|----:|----:|----:|----:|----:|",
                ]
                for point in run["points"]:
                    mean, std = _point_latency(point)
                    peak = "OOM" if point.get("oom") else _bytes(point["peak_bytes"])
                    lines.append(
                        f"| {point[axis]} | {peak} | {_pct(point['pct'])} | {mean} | {std} |"
                    )
        return lines

    out += _md_peak_section(_group_by_tool(runs), table, plot_fn, axis)
    return out


def _markdown_diff_peak(
    latest_path: Path | None,
    baseline_path: Path | None,
    tools: list[str] | None,
    models: list[str] | None,
    plots: bool,
    with_previous: bool = False,
) -> list[str]:
    rows = compute_peak_diff(latest_path, baseline_path, tools, models, with_previous)
    if not rows:
        return []
    meta = _peak_meta(load_run(latest_path))
    labels = _threshold_labels([r["old"] for r in rows if r["old"]], [r["new"] for r in rows if r["new"]])

    out = ["## PEAK MEMORY (local GPU)", ""]
    out.append("_Largest prompt length within N% of the model footprint: baseline -> current._")
    out.append("")
    plot_fn = _peak_plotter(plots, "plot_peak_mem_diff", out)

    def table(tool_rows: list[dict[str, Any]]) -> list[str]:
        lines = [
            "|  | Model | Footprint | " + " | ".join(labels) + " | vs |",
            "|:-:|-------|----------:|" + "".join(":----|" for _ in labels) + ":---|",
        ]
        for row in tool_rows:
            ref = row["new"] or row["old"]
            cells = " | ".join(_peak_delta_cell(row, l, meta) for l in labels)
            lines.append(
                f"| {_peak_status_emoji(row)} | {row['model']} | "
                f"{_bytes(ref['footprint_bytes'])} | {cells} | {_peak_source(row)} |"
            )
        return lines

    out += _md_peak_section(_group_by_tool(rows), table, plot_fn, meta.get("swept", "prompt_length"))
    return out


# ---------------------------------------------------------------------------
# Public entry points — dispatch over the selected dimensions
# ---------------------------------------------------------------------------


def _dims(dims: list[str] | None, remote: bool | None) -> list[str]:
    """Selected dimensions; peak_mem is local-only, so ``--remote`` drops it."""
    selected = list(dims) if dims else list(DIMENSIONS)
    if remote is True and "peak_mem" in selected:
        selected.remove("peak_mem")
    return selected


def _has_latency(*docs: dict[str, Any] | None) -> bool:
    return any(latency_rows(d, kind) for d in docs for kind in ENV_KINDS)


def _has_peak(*docs: dict[str, Any] | None) -> bool:
    return any(_peak_runs(d) for d in docs)


def print_results(
    path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    detail: bool = False,
    dims: list[str] | None = None,
) -> None:
    """Print the latest run: a latency table per environment, then the peak_mem table."""
    selected = _dims(dims, remote)
    current = load_run(path)
    explicit = dims is not None
    if "latency" in selected and (explicit or _has_latency(current) or not _has_peak(current)):
        _print_results_latency(path, tools=tools, models=models, remote=remote, detail=detail)
    if "peak_mem" in selected and (explicit or _has_peak(current)):
        print()
        _print_results_peak(path, tools, models, detail)
    _print_status(current, dims, remote, tools, models, detail)


def _print_status(current, dims, remote, tools, models, detail) -> None:
    lines = status_lines(current, _blocks_to_show(dims, remote), tools, models, detail)
    if lines:
        print("\n  Not in the tables (see --detail for errors):" if not detail else "\n  Not in the tables:")
        for line in lines:
            print(f"  {line}")


def print_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    dims: list[str] | None = None,
    with_previous: bool = False,
) -> None:
    """Print latency and/or peak-memory diffs of ``run.json`` vs. the baseline.

    Tests are compared with the baseline's ``current``, else ``stale`` (see
    :func:`compute_diff`); differing environments are warned about first.
    """
    selected = _dims(dims, remote)
    current = load_run(latest_path)
    explicit = dims is not None
    warnings = comparison_warnings(latest_path, baseline_path, dims, remote, tools, models)
    if warnings:
        print("WARNING: comparing across different environments (results may not be comparable):")
        for line in warnings:
            print(f"  - {line}")
        print()
    if "latency" in selected and (explicit or _has_latency(current) or not _has_peak(current)):
        _print_diff_latency(
            latest_path, baseline_path, tools=tools, models=models, remote=remote,
            with_previous=with_previous,
        )
    if "peak_mem" in selected and (explicit or _has_peak(current)):
        print()
        _print_diff_peak(latest_path, baseline_path, tools, models, with_previous)
    _print_status(current, dims, remote, tools, models, False)


def markdown_results(
    path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    detail: bool = False,
    plots: bool = False,
    dims: list[str] | None = None,
) -> str:
    """Markdown version of :func:`print_results` (optionally with embedded plots)."""
    selected = _dims(dims, remote)
    current = load_run(path)
    parts: list[str] = []
    if "latency" in selected and (_has_latency(current) or not _has_peak(current)):
        parts.append(_markdown_results_latency(
            path, tools=tools, models=models, remote=remote, detail=detail, plots=plots
        ))
    else:
        parts.append("# Benchmark Results\n")
    if "peak_mem" in selected:
        parts.extend(_markdown_results_peak(path, tools, models, detail, plots))
    parts.extend(_md_status(current, dims, remote, tools, models, detail))
    return "\n".join(parts)


def _md_status(current, dims, remote, tools, models, detail) -> list[str]:
    lines = status_lines(current, _blocks_to_show(dims, remote), tools, models, detail)
    if not lines:
        return []
    return ["## Not in the tables", "", *(f"- {line.strip()}" for line in lines), ""]


def markdown_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    plots: bool = False,
    dims: list[str] | None = None,
    with_previous: bool = False,
) -> str:
    """Markdown version of :func:`print_diff` (optionally with embedded plots)."""
    selected = _dims(dims, remote)
    current = load_run(latest_path)
    parts: list[str] = []
    if "latency" in selected and (_has_latency(current) or not _has_peak(current)):
        parts.append(_markdown_diff_latency(
            latest_path, baseline_path, tools=tools, models=models, remote=remote, plots=plots,
            with_previous=with_previous,
        ))
    else:
        parts.append("# Benchmark Diff\n")
    if "peak_mem" in selected:
        parts.extend(_markdown_diff_peak(latest_path, baseline_path, tools, models, plots, with_previous))
    parts.extend(_md_status(current, dims, remote, tools, models, False))
    warnings = comparison_warnings(latest_path, baseline_path, dims, remote, tools, models)
    if warnings:
        block = ["> **Warning:** comparing across different environments:"]
        block += [f"> - {line}" for line in warnings]
        parts.insert(1, "\n".join(block) + "\n")
    return "\n".join(parts)
