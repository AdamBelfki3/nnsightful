"""Diff utility: compare the latest run against the committed baseline."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .runner import (
    BASELINE_FILE,
    LATEST_FILE,
    SECTIONS,
    load_run,
    result_key as _result_key,
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
    return list(SECTIONS)


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


def compute_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
) -> list[dict[str, Any]]:
    """Compute the diff between the latest run and the committed baseline.

    Returns a list of dicts, each with keys: section, tool, model,
    params, old_mean, new_mean, delta_ms, delta_pct, status, breakdown.
    """
    latest_path = latest_path or LATEST_FILE
    baseline_path = baseline_path or BASELINE_FILE

    current = load_run(latest_path)
    baseline = load_run(baseline_path)

    if current is None:
        return []

    sections = _sections_to_show(remote)
    rows: list[dict[str, Any]] = []

    for section in sections:
        cur_rows = current.get("results", {}).get(section, [])
        base_rows = (
            baseline.get("results", {}).get(section, []) if baseline else []
        )

        cur_by_key = {_result_key(r): r for r in cur_rows}
        base_by_key = {_result_key(r): r for r in base_rows}
        all_keys = list(dict.fromkeys(list(cur_by_key) + list(base_by_key)))

        for key in all_keys:
            cur = cur_by_key.get(key)
            old = base_by_key.get(key)

            parsed = json.loads(key)
            row: dict[str, Any] = {
                "section": section,
                "tool": parsed["tool"],
                "model": parsed["model"],
                "params": parsed["params"],
            }

            if cur and old:
                new_mean = cur["latency"]["mean"]
                old_mean = old["latency"]["mean"]
                delta = new_mean - old_mean
                pct = (delta / old_mean * 100) if old_mean > 0 else 0.0
                row.update(
                    old_mean=old_mean,
                    new_mean=new_mean,
                    delta_ms=delta * 1000,
                    delta_pct=pct,
                    status="changed",
                )
            elif cur is not None:
                row.update(
                    old_mean=None,
                    new_mean=cur["latency"]["mean"],
                    delta_ms=None,
                    delta_pct=None,
                    status="new",
                )
            else:
                assert old is not None, "key-union invariant violated"
                row.update(
                    old_mean=old["latency"]["mean"],
                    new_mean=None,
                    delta_ms=None,
                    delta_pct=None,
                    status="removed",
                )

            rows.append(row)

    return [r for r in rows if _row_matches(r, tools, models)]


# ---------------------------------------------------------------------------
# print_diff — same layout for local and remote (Baseline / Current / Delta)
# ---------------------------------------------------------------------------


def print_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
) -> None:
    """Print formatted diff tables, one per non-empty section.

    Both local and remote sections use the same columns: Baseline,
    Current, Delta.  For remote rows, Baseline and Current are the
    ``total_unqueued`` metric (the primary value stored in ``latency``).
    """
    latest_path = latest_path or LATEST_FILE
    baseline_path = baseline_path or BASELINE_FILE

    all_rows = compute_diff(
        latest_path, baseline_path, tools=tools, models=models, remote=remote
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
    baseline = load_run(baseline_path)

    print("=" * 80)
    print("BENCHMARK DIFF")
    print("=" * 80)
    if current:
        print(f"  Current:   {current['timestamp']}  ({current['git_hash'][:8]})  [{latest_path.name}]")
    if baseline:
        print(f"  Baseline:  {baseline['timestamp']}  ({baseline['git_hash'][:8]})  [{baseline_path.name}]")
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
            f"{'Delta':>22}"
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
                f"{_format_delta(row):>22}"
            )
            print(line)

    print("\n" + "=" * 80)


# ---------------------------------------------------------------------------
# print_results — compact (Mean + Std) by default, --detail for full view
# ---------------------------------------------------------------------------


def print_results(
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
    path = path or LATEST_FILE
    current = load_run(path)

    if current is None:
        print(f"No benchmark results found at {path}.")
        return

    sections = _sections_to_show(remote)
    all_rows: list[tuple[str, dict[str, Any]]] = []
    for section in sections:
        for r in current.get("results", {}).get(section, []):
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
    print(f"  Run:    {current['timestamp']}  ({current['git_hash'][:8]})")
    print(f"  Repeat: {current.get('n_repeat', '?')}")

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


def markdown_diff(
    latest_path: Path | None = None,
    baseline_path: Path | None = None,
    tools: list[str] | None = None,
    models: list[str] | None = None,
    remote: bool | None = None,
    plots: bool = False,
) -> str:
    """Build a Markdown document of the diff. One table per non-empty section.

    When ``plots=True`` and matplotlib is installed, each ``### tool``
    section gets a comparison plot: baseline (dashed) vs current (solid),
    one color per model.
    """
    latest_path = latest_path or LATEST_FILE
    baseline_path = baseline_path or BASELINE_FILE

    rows = compute_diff(
        latest_path, baseline_path, tools=tools, models=models, remote=remote
    )

    if not rows:
        return "# Benchmark Diff\n\n_No benchmark results to compare._\n"

    current = load_run(latest_path)
    baseline = load_run(baseline_path)

    out: list[str] = ["# Benchmark Diff", ""]
    if current:
        out.append(
            f"- **Current:** `{current['timestamp']}` "
            f"({current['git_hash'][:8]}) — `{latest_path.name}`"
        )
    if baseline:
        out.append(
            f"- **Baseline:** `{baseline['timestamp']}` "
            f"({baseline['git_hash'][:8]}) — `{baseline_path.name}`"
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
                out.append("|  | Params | Baseline | Current | Delta |")
                out.append("|:-:|--------|---------:|--------:|:------|")
                last_model = row["model"]
            out.append(
                f"| {_md_status_emoji(row)} | {_md_params(row)} | "
                f"{_ms(row.get('old_mean'))} | {_ms(row.get('new_mean'))} | "
                f"{_format_delta(row)} |"
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


def markdown_results(
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
    path = path or LATEST_FILE
    current = load_run(path)
    if current is None:
        return f"# Benchmark Results\n\n_No benchmark results found at `{path}`._\n"

    sections = _sections_to_show(remote)
    selected: list[tuple[str, dict[str, Any]]] = []
    for section in sections:
        for r in current.get("results", {}).get(section, []):
            if _row_matches(r, tools, models):
                selected.append((section, r))

    if not selected:
        return "# Benchmark Results\n\n_No results match the given filters._\n"

    out: list[str] = ["# Benchmark Results", ""]
    out.append(f"- **Run:** `{current['timestamp']}` ({current['git_hash'][:8]})")
    out.append(f"- **Repeat:** {current.get('n_repeat', '?')}")
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
