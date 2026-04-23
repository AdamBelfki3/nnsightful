"""Line-plot generation for benchmark Markdown reports.

For each ``(tool, section)`` group, produces a plot of mean latency
vs. the swept parameter — one line per model. Plots are returned as
base64-encoded PNGs so they can be embedded inline in Markdown as
``data:`` URLs, keeping the report self-contained (no sidecar files).

Matplotlib is imported lazily so the rest of the benchmark module
works fine without it; callers should check ``matplotlib_available()``
before invoking ``plot_tool_section()``.
"""

from __future__ import annotations

import base64
import io
from typing import Any


_PALETTE = [
    "#1f77b4",  # blue
    "#ff7f0e",  # orange
    "#2ca02c",  # green
    "#d62728",  # red
    "#9467bd",  # purple
    "#8c564b",  # brown
    "#e377c2",  # pink
    "#7f7f7f",  # grey
    "#bcbd22",  # olive
    "#17becf",  # cyan
]
# One marker for all lines — color already disambiguates models, and
# varying markers adds visual noise without adding information.
_MARKER = "o"


def matplotlib_available() -> bool:
    """Return True if matplotlib can be imported."""
    try:
        import matplotlib  # noqa: F401

        return True
    except ImportError:
        return False


def _detect_sweep_axis(rows: list[dict[str, Any]]) -> str | None:
    """Return the single param key that varies across *rows*, or None.

    If multiple params keys vary, or the varying values aren't numeric,
    we can't plot a clean line — return None and let the caller skip.
    """
    if not rows:
        return None

    param_values: dict[str, set] = {}
    for row in rows:
        for k, v in row["params"].items():
            param_values.setdefault(k, set()).add(v)

    varying = [k for k, vs in param_values.items() if len(vs) > 1]
    if len(varying) != 1:
        return None

    key = varying[0]
    if not all(isinstance(v, (int, float)) for v in param_values[key]):
        return None
    return key


def _group_by_model(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    """Group rows by model name, preserving encounter order."""
    out: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        out.setdefault(row["model"], []).append(row)
    return out


def plot_tool_section(
    tool_name: str,
    section: str,
    rows: list[dict[str, Any]],
) -> str | None:
    """Render a line plot for one ``(tool, section)`` group.

    Returns a base64-encoded PNG as a ``data:`` URL string, or None if
    the rows can't be plotted (no single varying numeric param, or
    only one data point per model).
    """
    axis = _detect_sweep_axis(rows)
    if axis is None:
        return None

    by_model = _group_by_model(rows)
    # Skip if no model has at least 2 points — a line plot of one point
    # is meaningless; a scatter is noise for our purposes.
    if not any(len(v) >= 2 for v in by_model.values()):
        return None

    import matplotlib

    matplotlib.use("Agg")  # headless backend, no display needed
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 5))

    # Sort models for deterministic color assignment across runs.
    for i, model in enumerate(sorted(by_model)):
        model_rows = sorted(by_model[model], key=lambda r: r["params"][axis])
        xs = [r["params"][axis] for r in model_rows]
        means_ms = [r["latency"]["mean"] * 1000 for r in model_rows]
        stds_ms = [r["latency"]["std"] * 1000 for r in model_rows]

        color = _PALETTE[i % len(_PALETTE)]
        marker = _MARKER

        ax.plot(
            xs,
            means_ms,
            marker=marker,
            markersize=7,
            linewidth=2,
            color=color,
            label=model,
        )
        # Error band of ±1 std, subtle but informative.
        lows = [m - s for m, s in zip(means_ms, stds_ms)]
        highs = [m + s for m, s in zip(means_ms, stds_ms)]
        ax.fill_between(xs, lows, highs, color=color, alpha=0.15, linewidth=0)

    all_means = [
        r["latency"]["mean"] * 1000
        for rs in by_model.values()
        for r in rs
    ]
    _apply_latency_yaxis(ax, all_means)

    section_label = "remote (unqueued)" if section == "remote" else "local"
    ax.set_title(
        f"{tool_name} — {section_label}",
        fontsize=12,
        fontweight="bold",
        loc="left",
    )
    ax.set_xlabel(axis, fontsize=10)
    ax.set_ylabel("Mean latency", fontsize=10)
    ax.tick_params(labelsize=9)
    ax.set_xticks(sorted({r["params"][axis] for rs in by_model.values() for r in rs}))

    _place_legend(ax, n_entries=len(by_model), title="Model")
    _clean_spines(ax)
    fig.tight_layout()

    return _encode_png(fig)


def plot_tool_section_diff(
    tool_name: str,
    section: str,
    diff_rows: list[dict[str, Any]],
) -> str | None:
    """Render a comparison plot: baseline (dashed) vs current (solid).

    Both lines share a color per model; the style distinguishes which
    run it came from. Rows with only baseline data show a dashed line;
    rows with only current data show a solid line; rows with both show
    both — visually obvious what changed.
    """
    axis = _detect_sweep_axis_diff(diff_rows)
    if axis is None:
        return None

    by_model: dict[str, list[dict[str, Any]]] = {}
    for row in diff_rows:
        by_model.setdefault(row["model"], []).append(row)

    # Need at least one model with ≥2 points across baseline+current.
    def _total_points(model_rows: list[dict[str, Any]]) -> int:
        n_base = sum(1 for r in model_rows if r.get("old_mean") is not None)
        n_cur = sum(1 for r in model_rows if r.get("new_mean") is not None)
        return max(n_base, n_cur)

    if not any(_total_points(rs) >= 2 for rs in by_model.values()):
        return None

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 5))

    all_means_ms: list[float] = []
    n_labeled = 0
    for i, model in enumerate(sorted(by_model)):
        model_rows = sorted(by_model[model], key=lambda r: r["params"][axis])
        color = _PALETTE[i % len(_PALETTE)]
        marker = _MARKER

        base_xs = [r["params"][axis] for r in model_rows if r.get("old_mean") is not None]
        base_ys = [r["old_mean"] * 1000 for r in model_rows if r.get("old_mean") is not None]
        cur_xs = [r["params"][axis] for r in model_rows if r.get("new_mean") is not None]
        cur_ys = [r["new_mean"] * 1000 for r in model_rows if r.get("new_mean") is not None]

        # Label whichever line the model actually has; prefer the solid
        # "current" one. Ensures every model ends up in the legend, even
        # ones that are "removed" (baseline-only) or "new" (current-only).
        base_label = model if base_xs and not cur_xs else None
        cur_label = model if cur_xs else None

        if base_xs:
            ax.plot(
                base_xs, base_ys,
                linestyle="--", linewidth=1.8, marker=marker, markersize=6,
                color=color, alpha=0.55, label=base_label,
            )
            all_means_ms.extend(base_ys)
            if base_label:
                n_labeled += 1

        if cur_xs:
            ax.plot(
                cur_xs, cur_ys,
                linestyle="-", linewidth=2, marker=marker, markersize=7,
                color=color, label=cur_label,
            )
            all_means_ms.extend(cur_ys)
            if cur_label:
                n_labeled += 1

    _apply_latency_yaxis(ax, all_means_ms)

    section_label = "remote (unqueued)" if section == "remote" else "local"
    ax.set_title(
        f"{tool_name} — {section_label}  ·  solid=current, dashed=baseline",
        fontsize=11,
        fontweight="bold",
        loc="left",
    )
    ax.set_xlabel(axis, fontsize=10)
    ax.set_ylabel("Mean latency", fontsize=10)
    ax.tick_params(labelsize=9)
    ax.set_xticks(sorted({
        r["params"][axis] for rs in by_model.values() for r in rs
    }))

    _place_legend(ax, n_entries=n_labeled, title="Model")
    _clean_spines(ax)
    fig.tight_layout()

    return _encode_png(fig)


# ---------------------------------------------------------------------------
# shared helpers
# ---------------------------------------------------------------------------


def _apply_latency_yaxis(ax, values_ms: list[float]) -> None:
    """Format the Y axis for readable latency values.

    - Switches to log scale when the data spans ≥ 10× (small + large
      models stay visible on one plot).
    - Major labels use human-readable units: ``ms`` below 1s, ``s`` in
      the 1-60s range, ``min`` above. No more raw ``10^3`` scientific
      notation.
    - On log scale, minor ticks at 2× and 5× of each decade get a
      faint grid, so you can eyeball intermediate values without
      drawing extra axes.
    """
    from matplotlib.ticker import FuncFormatter, LogLocator

    if not values_ms:
        return

    lo = max(min(values_ms), 1e-9)
    use_log = max(values_ms) / lo >= 10

    def _fmt(ms: float, _pos: int) -> str:
        if ms <= 0:
            return ""
        if ms >= 60_000:
            return f"{ms / 60_000:.1f}min"
        if ms >= 1000:
            v = ms / 1000
            return f"{v:.1f}s" if v < 10 else f"{v:.0f}s"
        if ms >= 10:
            return f"{ms:.0f}ms"
        return f"{ms:.1f}ms"

    if use_log:
        ax.set_yscale("log")
        # Major ticks at each decade, minor at 2× and 5× within each.
        ax.yaxis.set_major_locator(LogLocator(base=10, numticks=12))
        ax.yaxis.set_minor_locator(
            LogLocator(base=10, subs=(2.0, 5.0), numticks=30)
        )
        ax.grid(True, which="major", alpha=0.3, linewidth=0.6)
        ax.grid(True, which="minor", alpha=0.12, linewidth=0.4)
    else:
        ax.grid(True, which="major", alpha=0.25, linewidth=0.5)

    # Apply formatter to BOTH major and minor ticks so intermediate
    # gridlines are readable too (50ms between 10/100, 200/500 within
    # each decade etc.). Applied AFTER set_yscale — otherwise matplotlib
    # resets to the scientific-notation log default (``10²``).
    ax.yaxis.set_major_formatter(FuncFormatter(_fmt))
    if use_log:
        ax.yaxis.set_minor_formatter(FuncFormatter(_fmt))
        # Minor labels slightly smaller than major so the hierarchy
        # is still visible.
        ax.tick_params(which="minor", labelsize=8, colors="#555555")


def _place_legend(ax, n_entries: int, title: str) -> None:
    """Put the legend below the axes, wrapping into multiple columns.

    Long model names (e.g. ``meta-llama/Llama-3.1-405B-Instruct``) waste
    horizontal space when stacked one-per-line on the right. Below the
    axes with a 3-column cap gives the plot its full width back and
    keeps entries readable for up to ~9 models without overflow.
    """
    if n_entries <= 0:
        return
    ncol = min(3, n_entries)
    ax.legend(
        title=title,
        fontsize=8,
        title_fontsize=8,
        loc="upper center",
        bbox_to_anchor=(0.5, -0.18),
        ncol=ncol,
        frameon=False,
        handlelength=2.2,
        columnspacing=1.5,
        borderaxespad=0.2,
    )


def _clean_spines(ax) -> None:
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def _encode_png(fig) -> str:
    import matplotlib.pyplot as plt

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=120, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _detect_sweep_axis_diff(rows: list[dict[str, Any]]) -> str | None:
    """Like ``_detect_sweep_axis`` but tolerant of diff-row shape."""
    if not rows:
        return None

    param_values: dict[str, set] = {}
    for row in rows:
        for k, v in row["params"].items():
            param_values.setdefault(k, set()).add(v)

    varying = [k for k, vs in param_values.items() if len(vs) > 1]
    if len(varying) != 1:
        return None

    key = varying[0]
    if not all(isinstance(v, (int, float)) for v in param_values[key]):
        return None
    return key
