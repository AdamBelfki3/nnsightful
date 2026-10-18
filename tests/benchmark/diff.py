"""Show and diff utilities for benchmark results.

Works directly on ``run.json`` / ``baseline.json`` entries (see
``store.py``). Latency benchmarks get one table per kind (local /
remote, side by side by (tool, model, params)); peak-memory benchmarks a
table of footprint and max prompt lengths per threshold. Tables show the
measured tests; failed / unsupported / not-run tests are summarized
below them with each benchmark's status.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from .definitions import BenchmarkDefinition
from .env import Env
from .plots import Plots
from .store import Result, ResultsStore


class ResultView:
    """Selecting and summarizing benchmark results (``run.json`` / baseline dicts)."""

    @staticmethod
    def load(path: Path | dict | None) -> dict[str, Any] | None:
        """A run's results: *path* itself if already loaded, else the file at *path*."""
        return path if isinstance(path, dict) else ResultsStore(run=path).load_run()

    @staticmethod
    def load_baseline(
        path: Path | None,
    ) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        """The baseline's results and, per benchmark, the result it replaced."""
        base = ResultsStore(baseline=path).load_baseline()
        if base is None:
            return None, None
        return base, {n: r["previous"] for n, r in base.items() if r.get("previous")}

    @staticmethod
    def resolve(path: Path | dict | None) -> Path | dict:
        return path if isinstance(path, dict) else ResultsStore(run=path).run_path

    @staticmethod
    def file_name(path: Path | dict) -> str:
        return "(in memory)" if isinstance(path, dict) else path.name

    @staticmethod
    def stamp(result: dict[str, Any]) -> dict[str, Any]:
        return result.get("benchmark") or {}

    @staticmethod
    def version(result: dict[str, Any] | None) -> Any:
        return ResultView.stamp(result or {}).get("version")

    @staticmethod
    def bench_name(name: str, result: dict[str, Any]) -> str:
        return ResultView.stamp(result).get("name", name)

    @staticmethod
    def ordered(
        doc: dict[str, Any] | None,
        dims: list[str] | None = None,
        remote: bool | None = None,
    ):
        """``(name, result)`` of the shown benchmarks (latency, then peak_mem)."""
        dims = dims or list(BenchmarkDefinition.DIMENSIONS)
        kinds = ResultView.sections_to_show(remote)
        shown = [
            (name, r)
            for name, r in (doc or {}).items()
            if r
            and ResultView.stamp(r).get("dimension") in dims
            and ResultView.stamp(r).get("kind") in kinds
        ]
        return sorted(
            shown,
            key=lambda nr: (
                BenchmarkDefinition.DIMENSIONS.index(
                    ResultView.stamp(nr[1])["dimension"]
                ),
                BenchmarkDefinition.KINDS.index(ResultView.stamp(nr[1])["kind"]),
                nr[0],
            ),
        )

    @staticmethod
    def of(doc: dict[str, Any] | None, dimension: str, kind: str | None = None):
        """``(name, result)`` of the benchmarks with *dimension* (and *kind*)."""
        return [
            (n, r)
            for n, r in ResultView.ordered(doc, [dimension])
            if kind is None or ResultView.stamp(r)["kind"] == kind
        ]

    @staticmethod
    def unsuccessful(result: dict[str, Any]) -> list[dict[str, Any]]:
        """Failed tests then optional failed ones (marked ``optional``)."""
        return list(result.get("failed", [])) + [
            {**f, "optional": True} for f in result.get("optional_failed", [])
        ]

    @staticmethod
    def row_matches(
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

    @staticmethod
    def sections_to_show(remote: bool | None) -> list[str]:
        if remote is True:
            return ["remote"]
        if remote is False:
            return ["local"]
        return list(BenchmarkDefinition.KINDS)

    @staticmethod
    def latency_rows(data: dict[str, Any] | None, env: str) -> list[dict[str, Any]]:
        """The *env* latency benchmark's tests as display rows.

        Each row is ``(tool, model, params, latency[, latency_breakdown])``.
        """
        rows = []
        for _, result in ResultView.of(data, "latency", env):
            for test in result.get("results", []):
                stats = test["stats"]
                row = {
                    "tool": test["tool"],
                    "model": test["model"],
                    "params": test["params"],
                    "latency": stats,
                }
                if "breakdown" in stats:
                    row["latency_breakdown"] = stats["breakdown"]
                rows.append(row)
        return rows

    @staticmethod
    def latency_repeat(data: dict[str, Any]) -> Any:
        repeats = {
            kind: result.get("meta_params", {}).get("n_repeat", "?")
            for kind in BenchmarkDefinition.KINDS
            for _, result in ResultView.of(data, "latency", kind)
            if result.get("results")
        }
        return ", ".join(f"{k} {v}" for k, v in repeats.items()) or "?"

    @staticmethod
    def result_label(name: str, result: dict[str, Any]) -> str:
        """``local_latency v1 @ a1b2c3d 2026-01-02``."""
        version = ResultView.version(result)
        env = Env.label(result.get("env"))
        return f"{ResultView.bench_name(name, result)} v{version} @ {env}"

    @staticmethod
    def run_label(data: dict[str, Any]) -> str:
        """``local_latency v1 @ a1b2c3d 2026-01-02 · peak_mem v1 @ …``."""
        return (
            " · ".join(
                ResultView.result_label(name, r) for name, r in ResultView.ordered(data)
            )
            or "(empty)"
        )

    @staticmethod
    def status_lines(
        data: dict[str, Any] | None,
        dims: list[str] | None = None,
        remote: bool | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        detail: bool = False,
    ) -> list[str]:
        """Per benchmark: status, and counts of tests not in the tables.

        Those are the failed / unsupported / not-run tests.

        With *detail*, those tests are listed with their error.
        """
        out = []
        for name, result in ResultView.ordered(
            data, ResultView.dims(dims, remote), remote
        ):
            measured = [
                t
                for t in result.get("results", [])
                if ResultView.row_matches(t, tools, models)
            ]
            skipped = [
                t
                for t in ResultView.unsuccessful(result)
                if ResultView.row_matches(t, tools, models)
            ]
            head = (
                f"{ResultView.bench_name(name, result)} v{ResultView.version(result)} "
                f"({result.get('status', '?')}): {len(measured)} measured"
            )
            if skipped:
                parts = []
                for label, group in (
                    ("", [t for t in skipped if not t.get("optional")]),
                    ("optional ", [t for t in skipped if t.get("optional")]),
                ):
                    counts = {
                        st: sum(t.get("status") == st for t in group)
                        for st in (Result.FAILED, Result.UNSUPPORTED, Result.NOT_RUN)
                    }
                    parts += [
                        f"{n} {label}{st.replace('_', ' ')}"
                        for st, n in counts.items()
                        if n
                    ]
                head += "; " + ", ".join(parts)
            out.append(head)
            if detail:
                for test in skipped:
                    tag = " (optional)" if test.get("optional") else ""
                    out.append(
                        f"    {test['status']}{tag}: {test['tool']} | "
                        f"{test['model']} | {Cells.format_params(test)} — "
                        f"{test.get('error', '')}"
                    )
        return out

    @staticmethod
    def baseline_summary(baseline: dict[str, Any] | None) -> str:
        return (
            "; ".join(
                ResultView.result_label(name, r)
                for name, r in ResultView.ordered(baseline)
            )
            or "(empty)"
        )

    @staticmethod
    def dims(dims: list[str] | None, remote: bool | None) -> list[str]:
        """Selected dimensions; peak_mem is local-only, so ``--remote`` drops it."""
        selected = list(dims) if dims else list(BenchmarkDefinition.DIMENSIONS)
        if remote is True and "peak_mem" in selected:
            selected.remove("peak_mem")
        return selected

    @staticmethod
    def has_latency(*docs: dict[str, Any] | None) -> bool:
        return any(
            ResultView.latency_rows(d, kind)
            for d in docs
            for kind in BenchmarkDefinition.KINDS
        )

    @staticmethod
    def has_peak(*docs: dict[str, Any] | None) -> bool:
        return any(ResultView.peak_runs(d) for d in docs)

    @staticmethod
    def peak_view(test: dict[str, Any]) -> dict[str, Any]:
        """A peak-memory test with its stats lifted to the top level, for display."""
        return {**{k: test[k] for k in ("tool", "model", "params")}, **test["stats"]}

    @staticmethod
    def peak_runs(data: dict[str, Any] | None) -> list[dict[str, Any]]:
        return [
            ResultView.peak_view(t)
            for _, r in ResultView.of(data, "peak_mem")
            for t in r.get("results", [])
        ]

    @staticmethod
    def peak_result(data: dict[str, Any] | None) -> dict[str, Any]:
        benches = ResultView.of(data, "peak_mem")
        return benches[0][1] if benches else {}

    @staticmethod
    def peak_meta(data: dict[str, Any] | None) -> dict[str, Any]:
        return ResultView.peak_result(data).get("meta_params", {})

    @staticmethod
    def peak_env(data: dict[str, Any] | None) -> dict[str, Any]:
        return ResultView.peak_result(data).get("env") or {}

    @staticmethod
    def filtered_peak_runs(
        data: dict[str, Any] | None,
        tools: list[str] | None,
        models: list[str] | None,
    ) -> list[dict[str, Any]]:
        runs = [
            r
            for r in ResultView.peak_runs(data)
            if ResultView.row_matches(r, tools, models)
        ]
        return sorted(runs, key=Cells.sort_key)

    @staticmethod
    def group_by_tool(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        grouped: dict[str, list[dict[str, Any]]] = {}
        for row in rows:
            grouped.setdefault(row["tool"], []).append(row)
        return grouped


class Cells:
    """Formatting single values and cells for the tables."""

    @staticmethod
    def ms(val: float | None) -> str:
        return f"{val * 1000:.1f}ms" if val is not None else "-"

    @staticmethod
    def format_params(row: dict[str, Any]) -> str:
        s = ", ".join(f"{k}={v}" for k, v in row["params"].items())
        if not s:
            s = "(default)"
        if len(s) > 30:
            s = s[:27] + "..."
        return s

    @staticmethod
    def sort_key(row: dict[str, Any]) -> tuple:
        """Group rows by tool first, then by model, then by params.

        Display ordering only — the underlying file keeps insertion order
        (which can interleave tools after a merge). Sorting at print time
        keeps all rows for one tool together even when they were measured
        in different runs.
        """
        return (row["tool"], row["model"], sorted(row["params"].items()))

    @staticmethod
    def format_delta(row: dict[str, Any]) -> str:
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

    @staticmethod
    def md_status_emoji(row: dict[str, Any]) -> str:
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

    @staticmethod
    def md_params(row: dict[str, Any]) -> str:
        """Params for Markdown — no width truncation, escape pipes."""
        s = ", ".join(f"{k}={v}" for k, v in row["params"].items())
        if not s:
            s = "(default)"
        return s.replace("|", "\\|")

    @staticmethod
    def md_section_label(section: str) -> str:
        return "REMOTE (unqueued)" if section == "remote" else "LOCAL"

    @staticmethod
    def size(val: int | None) -> str:
        if val is None:
            return "-"
        if val >= 2**30:
            return f"{val / 2**30:.2f}GiB"
        return f"{val / 2**20:.1f}MiB"

    @staticmethod
    def pct(val: float | None) -> str:
        return f"{val:.1f}%" if val is not None else "-"

    @staticmethod
    def threshold_labels(*runs_lists: list[dict[str, Any]]) -> list[str]:
        """Threshold labels across runs, ordered by percentage."""
        labels = {
            label
            for runs in runs_lists
            for run in runs
            for label in run.get("max_prompt_length", {})
        }
        return sorted(labels, key=lambda label: float(label.rstrip("%")))

    @staticmethod
    def max_len_cell(
        run: dict[str, Any] | None, label: str, meta: dict[str, Any]
    ) -> str:
        """``36``, ``>=4096`` (capped) or ``<2`` (even the smallest length is over)."""
        if run is None:
            return "-"
        value = run.get("max_prompt_length", {}).get(label)
        if value is None:
            return (
                f"<{meta.get('min_length', '?')}"
                if label in run.get("max_prompt_length", {})
                else "-"
            )
        if label in run.get("capped", []):
            return f">={value}"
        return str(value)

    @staticmethod
    def peak_header_line(meta: dict[str, Any], env: dict[str, Any]) -> str:
        """``local, bfloat16, autocast, swept=prompt_length, repeat=3[, footprint=…]``.

        The footprint part is only there for results with a ``padding_bias``.
        """
        parts = [str(env.get("kind", "?")), str(env.get("dtype", "?"))]
        if env.get("autocast"):
            parts.append("autocast")
        parts.append(f"swept={meta.get('swept', '?')}")
        parts.append(f"repeat={meta.get('n_repeat', '?')}")
        if "padding_bias" in meta:
            bias = Cells.size(meta["padding_bias"])
            parts.append(f"footprint=weights + {bias} padding bias")
        return ", ".join(parts)

    @staticmethod
    def weights(run: dict[str, Any]) -> int:
        """Weight bytes of a peak-memory run (older results: the footprint)."""
        return run.get("weights_bytes", run["footprint_bytes"])

    @staticmethod
    def padded(runs: list[dict[str, Any] | None]) -> bool:
        """Whether any run's footprint includes a padding bias beyond the weights."""
        return any(run and run.get("padding_bias") for run in runs)

    @staticmethod
    def footprint_of(runs: list[dict[str, Any] | None]) -> str:
        """``the model footprint``, plus ``(weights + padding bias)`` if padded."""
        padded = Cells.padded(runs)
        return "the model footprint" + (" (weights + padding bias)" if padded else "")

    @staticmethod
    def footprint_cell(row: dict[str, Any]) -> str:
        """The footprint of a diff row, ``old -> new`` when the two differ."""
        old, new = row["old"], row["new"]
        if old and new and old["footprint_bytes"] != new["footprint_bytes"]:
            return (
                f"{Cells.size(old['footprint_bytes'])} -> "
                f"{Cells.size(new['footprint_bytes'])}"
            )
        return Cells.size((new or old)["footprint_bytes"])

    @staticmethod
    def point_latency(point: dict[str, Any]) -> tuple[str, str]:
        lat = point.get("latency")
        if not lat:
            return "-", "-"
        return Cells.ms(lat["mean"]), Cells.ms(lat["std"])

    @staticmethod
    def peak_delta_cell(row: dict[str, Any], label: str, meta: dict[str, Any]) -> str:
        """``36 -> 38 (+2)``; one side only for new / removed runs."""
        old = Cells.max_len_cell(row["old"], label, meta)
        new = Cells.max_len_cell(row["new"], label, meta)
        if row["status"] != "changed":
            return new if row["status"] == "new" else old
        a = row["old"].get("max_prompt_length", {}).get(label)
        b = row["new"].get("max_prompt_length", {}).get(label)
        if a is None or b is None or a == b:
            return new if old == new else f"{old} -> {new}"
        return f"{old} -> {new} ({b - a:+d})"

    @staticmethod
    def peak_direction(row: dict[str, Any]) -> int:
        """+1 if any max length grew and none shrank, -1 if any shrank, else 0."""
        if row["status"] != "changed":
            return 0
        old = row["old"].get("max_prompt_length", {})
        new = row["new"].get("max_prompt_length", {})
        deltas = [(new[lb] or 0) - (old[lb] or 0) for lb in set(old) & set(new)]
        if any(d < 0 for d in deltas):
            return -1
        if any(d > 0 for d in deltas):
            return 1
        return 0

    @staticmethod
    def peak_source(row: dict[str, Any]) -> str:
        if row["status"] == "new":
            return "(new)"
        if row["status"] == "removed":
            return "(removed)"
        return row["source"] or ""

    @staticmethod
    def peak_status_emoji(row: dict[str, Any]) -> str:
        if row["status"] == "new":
            return "🆕"
        if row["status"] == "removed":
            return "❌"
        return {1: "🟢", -1: "🔴", 0: "⚪"}[Cells.peak_direction(row)]


class Comparison:
    """Comparing a run with the baseline, test by test."""

    @staticmethod
    def source(old: dict[str, Any], new: dict[str, Any]) -> str:
        """``baseline`` (same version) or ``baseline v0`` (a different version)."""
        if ResultView.version(old) == ResultView.version(new):
            return "baseline"
        return f"baseline v{ResultView.version(old)}"

    @staticmethod
    def last_change(old: dict[str, Any], new: dict[str, Any]) -> str:
        return f"last change ({Comparison.arrow(old, new)})"

    @staticmethod
    def arrow(old: dict[str, Any], new: dict[str, Any]) -> str:
        old_hash = (old.get("env") or {}).get("git_hash") or "?"
        new_hash = (new.get("env") or {}).get("git_hash") or "?"
        return f"{old_hash[:7]} → {new_hash[:7]}"

    @staticmethod
    def latency_row(section, test, status="new", source=None) -> dict[str, Any]:
        return {
            "section": section,
            "tool": test["tool"],
            "model": test["model"],
            "params": test["params"],
            "new_mean": None,
            "old_mean": None,
            "delta_ms": None,
            "delta_pct": None,
            "status": status,
            "source": source,
        }

    @staticmethod
    def compute_diff(
        latest_path: Path | dict | None = None,
        baseline_path: Path | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        remote: bool | None = None,
        with_previous: bool = False,
    ) -> list[dict[str, Any]]:
        """Latency diff of ``run.json`` against the baseline, benchmark by benchmark.

        Tests of a benchmark both sides have are compared (``source`` is
        ``baseline``, or ``baseline vN`` when the versions differ); tests on
        one side only are ``new`` / ``removed``. With *with_previous*, a
        benchmark not in the run shows its baseline result vs. the result it
        replaced (``source`` ``last change (<hash> → <hash>)``).

        Returns dicts with keys: section, tool, model, params, old_mean,
        new_mean, delta_ms, delta_pct, status, source.
        """
        current = ResultView.load(latest_path)
        if current is None:
            return []
        base, prev = ResultView.load_baseline(baseline_path)
        rows: list[dict[str, Any]] = []
        for section in ResultView.sections_to_show(remote):
            for name, new in ResultView.of(current, "latency", section):
                old = (base or {}).get(name)
                rows += Comparison.latency_compare(
                    section, new, old, Comparison.source(old, new) if old else None
                )
            if not with_previous:
                continue
            for name, old in ResultView.of(base, "latency", section):
                if name not in current and (prev or {}).get(name):
                    rows += [
                        {**r, "source": Comparison.last_change(prev[name], old)}
                        for r in Comparison.latency_compare(
                            section, old, prev[name], ""
                        )
                        if r["status"] == "changed"
                    ]
        return [r for r in rows if ResultView.row_matches(r, tools, models)]

    @staticmethod
    def latency_compare(
        section: str,
        new: dict[str, Any],
        old: dict[str, Any] | None,
        source: str | None,
    ):
        old_tests = {Result.case_id(t): t for t in (old or {}).get("results", [])}
        failed = {Result.case_id(t) for t in ResultView.unsuccessful(new)}
        rows = []
        for test in new.get("results", []):
            row = Comparison.latency_row(section, test)
            row["new_mean"] = test["stats"]["mean"]
            prev = old_tests.pop(Result.case_id(test), None)
            if prev is not None:
                Comparison.set_change(row, prev["stats"]["mean"], row["new_mean"])
                row["source"] = source
            rows.append(row)
        if old is not None:
            for key, test in old_tests.items():
                row = Comparison.latency_row(
                    section,
                    test,
                    "removed",
                    "failed in run" if key in failed else "not in run",
                )
                row["old_mean"] = test["stats"]["mean"]
                rows.append(row)
        return rows

    @staticmethod
    def set_change(row: dict[str, Any], old_mean: float, new_mean: float) -> None:
        delta = new_mean - old_mean
        row.update(
            old_mean=old_mean,
            new_mean=new_mean,
            delta_ms=delta * 1000,
            delta_pct=(delta / old_mean * 100) if old_mean > 0 else 0.0,
            status="changed",
        )

    @staticmethod
    def warnings(
        latest_path: Path | dict | None = None,
        baseline_path: Path | None = None,
        dims: list[str] | None = None,
        remote: bool | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
    ) -> list[str]:
        """Warnings per compared benchmark: versions, definitions, environments.

        Code-state stamps (git hash, dirty) are expected to differ and aren't
        reported; package versions, GPU, dtype, autocast, server etc. are.
        """
        current = ResultView.load(latest_path)
        if current is None:
            return []
        base, _ = ResultView.load_baseline(baseline_path)
        out = []
        for name, new in ResultView.ordered(
            current, ResultView.dims(dims, remote), remote
        ):
            old = (base or {}).get(name)
            if not old:
                continue
            label = ResultView.bench_name(name, new)
            nb, ob = ResultView.stamp(new), ResultView.stamp(old)
            if nb.get("version") != ob.get("version"):
                new_ids = {Result.case_id(t) for t in new.get("results", [])}
                old_ids = {Result.case_id(t) for t in old.get("results", [])}
                out.append(
                    f"{label}: run v{nb.get('version')} "
                    f"vs baseline v{ob.get('version')} "
                    f"— comparing the {len(new_ids & old_ids)} shared test(s); "
                    f"{len(new_ids - old_ids)} only in the run, "
                    f"{len(old_ids - new_ids)} only in the baseline"
                )
            elif (
                nb.get("config_hash")
                and ob.get("config_hash")
                and nb["config_hash"] != ob["config_hash"]
            ):
                out.append(
                    f"{label}: same version v{nb.get('version')} "
                    "but different definitions "
                    f"(config hash {ob['config_hash']} -> {nb['config_hash']}); "
                    "bump the version"
                )
            diffs = Env.differences(old.get("env") or {}, new.get("env") or {})
            if diffs:
                out.append(f"{label} vs baseline: " + "; ".join(diffs))
        return out

    @staticmethod
    def compute_peak_diff(
        latest_path: Path | dict | None = None,
        baseline_path: Path | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        with_previous: bool = False,
    ) -> list[dict[str, Any]]:
        """Peak-memory diff of ``run.json`` against the baseline (see ``compute_diff``).

        Each row has ``tool``, ``model``, ``params``, ``old`` / ``new`` (runs,
        or None), ``status`` (``changed`` / ``new`` / ``removed``) and ``source``.
        """
        current = ResultView.load(latest_path)
        base, prev = ResultView.load_baseline(baseline_path)
        rows = []
        for name, new in ResultView.of(current, "peak_mem"):
            old = (base or {}).get(name)
            rows += Comparison.peak_compare(
                new, old, Comparison.source(old, new) if old else None
            )
        if with_previous and current is not None:
            for name, old in ResultView.of(base, "peak_mem"):
                if name not in current and (prev or {}).get(name):
                    rows += [
                        {**r, "source": Comparison.last_change(prev[name], old)}
                        for r in Comparison.peak_compare(old, prev[name], "")
                        if r["status"] == "changed"
                    ]
        rows = [r for r in rows if ResultView.row_matches(r, tools, models)]
        return sorted(rows, key=Cells.sort_key)

    @staticmethod
    def peak_compare(
        new: dict[str, Any], old: dict[str, Any] | None, source: str | None
    ):
        old_tests = {Result.case_id(t): t for t in (old or {}).get("results", [])}
        failed = {Result.case_id(t) for t in ResultView.unsuccessful(new)}
        rows = []
        for test in new.get("results", []):
            prev = old_tests.pop(Result.case_id(test), None)
            rows.append(
                {
                    "tool": test["tool"],
                    "model": test["model"],
                    "params": test["params"],
                    "old": ResultView.peak_view(prev) if prev else None,
                    "new": ResultView.peak_view(test),
                    "status": "changed" if prev else "new",
                    "source": source if prev else None,
                }
            )
        if old is not None:
            for key, test in old_tests.items():
                rows.append(
                    {
                        "tool": test["tool"],
                        "model": test["model"],
                        "params": test["params"],
                        "old": ResultView.peak_view(test),
                        "new": None,
                        "status": "removed",
                        "source": "failed in run" if key in failed else "not in run",
                    }
                )
        return rows


class TerminalReport:
    """Terminal tables for ``--show`` / ``--show-diff``."""

    @staticmethod
    def diff_latency(
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
        latest_path = ResultView.resolve(latest_path)
        baseline_path = ResultsStore(baseline=baseline_path).baseline_path

        all_rows = Comparison.compute_diff(
            latest_path,
            baseline_path,
            tools=tools,
            models=models,
            remote=remote,
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

        current = ResultView.load(latest_path)
        baseline, _ = ResultView.load_baseline(baseline_path)

        print("=" * 80)
        print("BENCHMARK DIFF")
        print("=" * 80)
        if current:
            print(
                f"  Current:   {ResultView.run_label(current)}  "
                f"[{ResultView.file_name(latest_path)}]"
            )
        if baseline is not None:
            print(
                f"  Baseline:  {ResultView.baseline_summary(baseline)}  "
                f"[{baseline_path.name}]"
            )
        else:
            print(f"  Baseline:  (no baseline at {baseline_path.name})")

        sections = ResultView.sections_to_show(remote)
        for section in sections:
            section_rows = [r for r in all_rows if r["section"] == section]
            if not section_rows:
                continue
            section_rows.sort(key=Cells.sort_key)

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
                baseline_cell = Cells.ms(row.get("old_mean"))
                cur_cell = Cells.ms(row.get("new_mean"))
                line = (
                    f"  {row['tool']:<{tool_w}}  "
                    f"{row['model']:<{model_w}}  "
                    f"{Cells.format_params(row):<30}  "
                    f"{baseline_cell:>10}  "
                    f"{cur_cell:>10}  "
                    f"{Cells.format_delta(row):>22}  "
                    f"{row.get('source') or '':<26}"
                )
                print(line)

        print("\n" + "=" * 80)

    @staticmethod
    def results_latency(
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
        path = ResultView.resolve(path)
        current = ResultView.load(path)

        if current is None:
            print(f"No benchmark results found at {path}.")
            return

        sections = ResultView.sections_to_show(remote)
        all_rows: list[tuple[str, dict[str, Any]]] = []
        for section in sections:
            for r in ResultView.latency_rows(current, section):
                if ResultView.row_matches(r, tools, models):
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
        print(f"  Run:    {ResultView.run_label(current)}")
        print(f"  Repeat: {ResultView.latency_repeat(current)}")

        for section in sections:
            section_rows = [r for s, r in all_rows if s == section]
            if not section_rows:
                continue
            section_rows.sort(key=Cells.sort_key)

            tool_w = max(len(r["tool"]) for r in section_rows)
            model_w = max(len(r["model"]) for r in section_rows)

            if section == "remote":
                TerminalReport.results_remote(section_rows, tool_w, model_w, detail)
            else:
                TerminalReport.results_local(section_rows, tool_w, model_w, detail)

        print("\n" + "=" * 80)

    @staticmethod
    def results_local(
        rows: list[dict[str, Any]], tool_w: int, model_w: int, detail: bool
    ) -> None:
        print("\n  [LOCAL]")

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
                f"{Cells.format_params(row):<30}  {vals}"
            )
            print(line)

    @staticmethod
    def results_remote(
        rows: list[dict[str, Any]], tool_w: int, model_w: int, detail: bool
    ) -> None:
        label = "REMOTE (unqueued)"
        print(f"\n  [{label}]")

        cols = f"{'Mean':>10}  {'Std':>10}"
        if detail:
            cols += f"  {'Min':>10}  {'Max':>10}"
            cols += f"  {'Running':>10}  {'Download':>10}  {'Total':>10}"
        header = f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Params':<30}  {cols}"
        print(header)
        print("  " + "-" * (len(header) - 2))

        for row in rows:
            lat = row["latency"]
            vals = f"{lat['mean'] * 1000:>8.1f}ms  {lat['std'] * 1000:>8.1f}ms"
            if detail:
                vals += f"  {lat['min'] * 1000:>8.1f}ms  {lat['max'] * 1000:>8.1f}ms"
                bd = row.get("latency_breakdown", {})
                running = Cells.ms(bd.get("running", {}).get("mean"))
                download = Cells.ms(bd.get("download", {}).get("mean"))
                total = Cells.ms(bd.get("total", {}).get("mean"))
                vals += f"  {running:>10}  {download:>10}  {total:>10}"
            line = (
                f"  {row['tool']:<{tool_w}}  "
                f"{row['model']:<{model_w}}  "
                f"{Cells.format_params(row):<30}  {vals}"
            )
            print(line)

    @staticmethod
    def results_peak(
        path: Path | None,
        tools: list[str] | None,
        models: list[str] | None,
        detail: bool,
    ) -> None:
        current = ResultView.load(path)
        runs = ResultView.filtered_peak_runs(current, tools, models)
        if not runs:
            print("No peak-memory results in the latest run.")
            return

        meta = ResultView.peak_meta(current)
        labels = Cells.threshold_labels(runs)
        axis = meta.get("swept", "prompt_length")
        tool_w = max(len(r["tool"]) for r in runs)
        model_w = max(len(r["model"]) for r in runs)

        print("=" * 80)
        print("PEAK MEMORY (local GPU)")
        print("=" * 80)
        print(f"  Run:    {ResultView.run_label(current)}")
        print(f"  Setup:  {Cells.peak_header_line(meta, ResultView.peak_env(current))}")
        print(
            f"  Cells:  largest {axis} whose peak stays within N% of "
            f"{Cells.footprint_of(runs)}"
        )
        print()
        padded = Cells.padded(runs)
        cols = "".join(f"  {label:>8}" for label in labels)
        weights_col = f"{'Weights':>10}  " if padded else ""
        header = (
            f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}  {'Params':<30}  "
            f"{weights_col}{'Footprint':>10}{cols}"
        )
        print(header)
        print("  " + "-" * (len(header) - 2))
        for run in runs:
            cells = "".join(
                f"  {Cells.max_len_cell(run, lb, meta):>8}" for lb in labels
            )
            weights = f"{Cells.size(Cells.weights(run)):>10}  " if padded else ""
            print(
                f"  {run['tool']:<{tool_w}}  {run['model']:<{model_w}}  "
                f"{Cells.format_params(run):<30}  {weights}"
                f"{Cells.size(run['footprint_bytes']):>10}{cells}"
            )

        if detail:
            for run in runs:
                print(f"\n  [{run['tool']} | {run['model']}]")
                print(
                    f"  {axis:>14}  {'Peak':>10}  {'% fp':>7}  "
                    f"{'Mean':>10}  {'Std':>10}"
                )
                for point in run["points"]:
                    mean, std = Cells.point_latency(point)
                    peak = (
                        "OOM" if point.get("oom") else Cells.size(point["peak_bytes"])
                    )
                    print(
                        f"  {point[axis]:>14}  {peak:>10}  "
                        f"{Cells.pct(point['pct']):>7}  "
                        f"{mean:>10}  {std:>10}"
                    )

        print("\n" + "=" * 80)

    @staticmethod
    def diff_peak(
        latest_path: Path | None,
        baseline_path: Path | None,
        tools: list[str] | None,
        models: list[str] | None,
        with_previous: bool = False,
    ) -> None:
        rows = Comparison.compute_peak_diff(
            latest_path, baseline_path, tools, models, with_previous
        )
        if not rows:
            print("No peak-memory results to compare.")
            return
        meta = ResultView.peak_meta(ResultView.load(latest_path))
        labels = Cells.threshold_labels(
            [r["old"] for r in rows if r["old"]], [r["new"] for r in rows if r["new"]]
        )
        tool_w = max(len(r["tool"]) for r in rows)
        model_w = max(len(r["model"]) for r in rows)
        fp_w = max(10, *(len(Cells.footprint_cell(r)) for r in rows))
        refs = [r["new"] or r["old"] for r in rows]
        padded = Cells.padded(refs)

        print("=" * 80)
        print("PEAK MEMORY DIFF (max prompt length within N% of footprint)")
        print("=" * 80)
        if Cells.padded([r[side] for r in rows for side in ("old", "new")]):
            print("  Footprint: weights + padding bias")
            print()
        cols = "".join(f"  {label:>20}" for label in labels)
        weights_col = f"  {'Weights':>10}" if padded else ""
        header = f"  {'Tool':<{tool_w}}  {'Model':<{model_w}}{weights_col}"
        header += f"  {'Footprint':>{fp_w}}{cols}  {'vs':<26}"
        print(header)
        print("  " + "-" * (len(header) - 2))
        for row, ref in zip(rows, refs):
            cells = "".join(
                f"  {Cells.peak_delta_cell(row, lb, meta):>20}" for lb in labels
            )
            weights = f"  {Cells.size(Cells.weights(ref)):>10}" if padded else ""
            print(
                f"  {row['tool']:<{tool_w}}  {row['model']:<{model_w}}{weights}  "
                f"{Cells.footprint_cell(row):>{fp_w}}{cells}  "
                f"{Cells.peak_source(row):<26}"
            )
        print("\n" + "=" * 80)

    @staticmethod
    def status(current, dims, remote, tools, models, detail) -> None:
        lines = ResultView.status_lines(current, dims, remote, tools, models, detail)
        if lines:
            print(
                "\n  Benchmarks (failed tests are not in the tables; "
                "--detail lists them):"
            )
            for line in lines:
                print(f"  {line}")

    @staticmethod
    def print_results(
        path: Path | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        remote: bool | None = None,
        detail: bool = False,
        dims: list[str] | None = None,
    ) -> None:
        """Print the run: a latency table per kind, then the peak_mem table."""
        selected = ResultView.dims(dims, remote)
        current = ResultView.load(path)
        explicit = dims is not None
        if "latency" in selected and (
            explicit
            or ResultView.has_latency(current)
            or not ResultView.has_peak(current)
        ):
            TerminalReport.results_latency(
                path, tools=tools, models=models, remote=remote, detail=detail
            )
        if "peak_mem" in selected and (explicit or ResultView.has_peak(current)):
            print()
            TerminalReport.results_peak(path, tools, models, detail)
        TerminalReport.status(current, dims, remote, tools, models, detail)

    @staticmethod
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

        Each benchmark is compared test by test with its baseline result (see
        ``Comparison.compute_diff``); version and environment differences are
        warned about first.
        """
        selected = ResultView.dims(dims, remote)
        current = ResultView.load(latest_path)
        explicit = dims is not None
        warnings = Comparison.warnings(
            latest_path, baseline_path, dims, remote, tools, models
        )
        if warnings:
            print(
                "WARNING: comparing across different environments "
                "(results may not be comparable):"
            )
            for line in warnings:
                print(f"  - {line}")
            print()
        if "latency" in selected and (
            explicit
            or ResultView.has_latency(current)
            or not ResultView.has_peak(current)
        ):
            TerminalReport.diff_latency(
                latest_path,
                baseline_path,
                tools=tools,
                models=models,
                remote=remote,
                with_previous=with_previous,
            )
        if "peak_mem" in selected and (explicit or ResultView.has_peak(current)):
            print()
            TerminalReport.diff_peak(
                latest_path, baseline_path, tools, models, with_previous
            )
        TerminalReport.status(current, dims, remote, tools, models, False)


class MarkdownReport:
    """Markdown versions of the terminal tables, optionally with plots."""

    @staticmethod
    def diff_latency(
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
        latest_path = ResultView.resolve(latest_path)
        baseline_path = ResultsStore(baseline=baseline_path).baseline_path

        rows = Comparison.compute_diff(
            latest_path,
            baseline_path,
            tools=tools,
            models=models,
            remote=remote,
            with_previous=with_previous,
        )

        if not rows:
            return "# Benchmark Diff\n\n_No benchmark results to compare._\n"

        current = ResultView.load(latest_path)
        baseline, _ = ResultView.load_baseline(baseline_path)

        out: list[str] = ["# Benchmark Diff", ""]
        if current:
            out.append(
                f"- **Current:** `{ResultView.run_label(current)}` — "
                f"`{ResultView.file_name(latest_path)}`"
            )
        if baseline is not None:
            out.append(
                f"- **Baseline:** {ResultView.baseline_summary(baseline)} — "
                f"`{baseline_path.name}`"
            )
        else:
            out.append(f"- **Baseline:** _none at `{baseline_path.name}`_")
        out.append("")

        plot_renderer = None
        if plots:
            if Plots.matplotlib_available():
                plot_renderer = Plots.plot_tool_section_diff
            else:
                out.append(
                    "_Plots requested but matplotlib is not installed. "
                    "Install it with `pip install matplotlib`._"
                )
                out.append("")

        for section in ResultView.sections_to_show(remote):
            section_rows = [r for r in rows if r["section"] == section]
            if not section_rows:
                continue
            section_rows.sort(key=Cells.sort_key)

            out.append(f"## {Cells.md_section_label(section)}")
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
                                f"![{row['tool']} — "
                                f"{Cells.md_section_label(section)} diff]"
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
                    f"| {Cells.md_status_emoji(row)} | {Cells.md_params(row)} | "
                    f"{Cells.ms(row.get('old_mean'))} | "
                    f"{Cells.ms(row.get('new_mean'))} | "
                    f"{Cells.format_delta(row)} | {row.get('source') or ''} |"
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

    @staticmethod
    def results_latency(
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
        path = ResultView.resolve(path)
        current = ResultView.load(path)
        if current is None:
            return f"# Benchmark Results\n\n_No benchmark results found at `{path}`._\n"

        sections = ResultView.sections_to_show(remote)
        selected: list[tuple[str, dict[str, Any]]] = []
        for section in sections:
            for r in ResultView.latency_rows(current, section):
                if ResultView.row_matches(r, tools, models):
                    selected.append((section, r))

        if not selected:
            return "# Benchmark Results\n\n_No results match the given filters._\n"

        out: list[str] = ["# Benchmark Results", ""]
        out.append(f"- **Run:** `{ResultView.run_label(current)}`")
        out.append(f"- **Repeat:** {ResultView.latency_repeat(current)}")
        out.append("")

        plot_renderer = None
        if plots:
            if Plots.matplotlib_available():
                plot_renderer = Plots.plot_tool_section
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
            section_rows.sort(key=Cells.sort_key)

            out.append(f"## {Cells.md_section_label(section)}")
            out.append("")

            header, sep = MarkdownReport.results_header(section, detail)

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
                        tool_rows = [
                            r for r in section_rows if r["tool"] == row["tool"]
                        ]
                        data_url = plot_renderer(row["tool"], section, tool_rows)
                        if data_url is not None:
                            out.append(
                                f"![{row['tool']} — {Cells.md_section_label(section)}]"
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
                out.append(MarkdownReport.results_row(row, section, detail))
            out.append("")

        return "\n".join(out)

    @staticmethod
    def results_header(section: str, detail: bool) -> tuple[str, str]:
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

    @staticmethod
    def results_row(row: dict[str, Any], section: str, detail: bool) -> str:
        """Build a Markdown results row (no Tool/Model cells — those are headings)."""
        lat = row["latency"]
        cells = [
            Cells.md_params(row),
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
                    Cells.ms(bd.get("running", {}).get("mean")),
                    Cells.ms(bd.get("download", {}).get("mean")),
                    Cells.ms(bd.get("total", {}).get("mean")),
                ]
        return "| " + " | ".join(cells) + " |"

    @staticmethod
    def peak_section(
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

    @staticmethod
    def peak_plotter(plots: bool, name: str, out: list[str]) -> Any:
        if not plots:
            return None
        if Plots.matplotlib_available():
            return getattr(Plots, name)
        out.append(
            "_Plots requested but matplotlib is not installed. "
            "Install it with `pip install matplotlib`._"
        )
        out.append("")
        return None

    @staticmethod
    def results_peak(
        path: Path | None,
        tools: list[str] | None,
        models: list[str] | None,
        detail: bool,
        plots: bool,
    ) -> list[str]:
        current = ResultView.load(path)
        runs = ResultView.filtered_peak_runs(current, tools, models)
        if not runs:
            return []
        meta = ResultView.peak_meta(current)
        labels = Cells.threshold_labels(runs)
        axis = meta.get("swept", "prompt_length")

        out = ["## PEAK MEMORY (local GPU)", ""]
        out.append(
            f"- **Setup:** {Cells.peak_header_line(meta, ResultView.peak_env(current))}"
        )
        out.append(
            f"- **Cells:** largest `{axis}` whose peak stays within N% of "
            f"{Cells.footprint_of(runs)} (`>=` hit the length cap, `<` already "
            "over at the smallest length)"
        )
        out.append("")
        plot_fn = MarkdownReport.peak_plotter(plots, "plot_peak_mem", out)
        padded = Cells.padded(runs)

        def table(tool_runs: list[dict[str, Any]]) -> list[str]:
            lines = [
                "| Model | Params | "
                + ("Weights | " if padded else "")
                + "Footprint | "
                + " | ".join(labels)
                + " |",
                "|-------|--------|"
                + ("--------:|" if padded else "")
                + "----------:|"
                + "".join("----:|" for _ in labels),
            ]
            for run in tool_runs:
                cells = " | ".join(Cells.max_len_cell(run, lb, meta) for lb in labels)
                weights = f"{Cells.size(Cells.weights(run))} | " if padded else ""
                lines.append(
                    f"| {run['model']} | {Cells.md_params(run)} | {weights}"
                    f"{Cells.size(run['footprint_bytes'])} | {cells} |"
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
                        mean, std = Cells.point_latency(point)
                        peak = (
                            "OOM"
                            if point.get("oom")
                            else Cells.size(point["peak_bytes"])
                        )
                        lines.append(
                            f"| {point[axis]} | {peak} | {Cells.pct(point['pct'])} "
                            f"| {mean} | {std} |"
                        )
            return lines

        out += MarkdownReport.peak_section(
            ResultView.group_by_tool(runs), table, plot_fn, axis
        )
        return out

    @staticmethod
    def diff_peak(
        latest_path: Path | None,
        baseline_path: Path | None,
        tools: list[str] | None,
        models: list[str] | None,
        plots: bool,
        with_previous: bool = False,
    ) -> list[str]:
        rows = Comparison.compute_peak_diff(
            latest_path, baseline_path, tools, models, with_previous
        )
        if not rows:
            return []
        meta = ResultView.peak_meta(ResultView.load(latest_path))
        labels = Cells.threshold_labels(
            [r["old"] for r in rows if r["old"]], [r["new"] for r in rows if r["new"]]
        )

        sides = [r[side] for r in rows for side in ("old", "new")]
        padded = Cells.padded([r["new"] or r["old"] for r in rows])
        out = ["## PEAK MEMORY (local GPU)", ""]
        out.append(
            f"_Largest prompt length within N% of {Cells.footprint_of(sides)}: "
            "baseline -> current._"
        )
        out.append("")
        plot_fn = MarkdownReport.peak_plotter(plots, "plot_peak_mem_diff", out)

        def table(tool_rows: list[dict[str, Any]]) -> list[str]:
            lines = [
                "|  | Model | "
                + ("Weights | " if padded else "")
                + "Footprint | "
                + " | ".join(labels)
                + " | vs |",
                "|:-:|-------|"
                + ("--------:|" if padded else "")
                + "----------:|"
                + "".join(":----|" for _ in labels)
                + ":---|",
            ]
            for row in tool_rows:
                ref = row["new"] or row["old"]
                cells = " | ".join(
                    Cells.peak_delta_cell(row, lb, meta) for lb in labels
                )
                weights = f"{Cells.size(Cells.weights(ref))} | " if padded else ""
                lines.append(
                    f"| {Cells.peak_status_emoji(row)} | {row['model']} | {weights}"
                    f"{Cells.footprint_cell(row)} | {cells} | "
                    f"{Cells.peak_source(row)} |"
                )
            return lines

        out += MarkdownReport.peak_section(
            ResultView.group_by_tool(rows),
            table,
            plot_fn,
            meta.get("swept", "prompt_length"),
        )
        return out

    @staticmethod
    def results(
        path: Path | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        remote: bool | None = None,
        detail: bool = False,
        plots: bool = False,
        dims: list[str] | None = None,
    ) -> str:
        """Markdown version of ``TerminalReport.print_results`` (plots optional)."""
        selected = ResultView.dims(dims, remote)
        current = ResultView.load(path)
        parts: list[str] = []
        if "latency" in selected and (
            ResultView.has_latency(current) or not ResultView.has_peak(current)
        ):
            parts.append(
                MarkdownReport.results_latency(
                    path,
                    tools=tools,
                    models=models,
                    remote=remote,
                    detail=detail,
                    plots=plots,
                )
            )
        else:
            parts.append("# Benchmark Results\n")
        if "peak_mem" in selected:
            parts.extend(
                MarkdownReport.results_peak(path, tools, models, detail, plots)
            )
        parts.extend(
            MarkdownReport.status(current, dims, remote, tools, models, detail)
        )
        return "\n".join(parts)

    @staticmethod
    def status(current, dims, remote, tools, models, detail) -> list[str]:
        lines = ResultView.status_lines(current, dims, remote, tools, models, detail)
        if not lines:
            return []
        return ["## Benchmarks", "", *(f"- {line.strip()}" for line in lines), ""]

    @staticmethod
    def diff(
        latest_path: Path | None = None,
        baseline_path: Path | None = None,
        tools: list[str] | None = None,
        models: list[str] | None = None,
        remote: bool | None = None,
        plots: bool = False,
        dims: list[str] | None = None,
        with_previous: bool = False,
    ) -> str:
        """Markdown version of ``TerminalReport.print_diff`` (optionally with plots)."""
        selected = ResultView.dims(dims, remote)
        current = ResultView.load(latest_path)
        parts: list[str] = []
        if "latency" in selected and (
            ResultView.has_latency(current) or not ResultView.has_peak(current)
        ):
            parts.append(
                MarkdownReport.diff_latency(
                    latest_path,
                    baseline_path,
                    tools=tools,
                    models=models,
                    remote=remote,
                    plots=plots,
                    with_previous=with_previous,
                )
            )
        else:
            parts.append("# Benchmark Diff\n")
        if "peak_mem" in selected:
            parts.extend(
                MarkdownReport.diff_peak(
                    latest_path, baseline_path, tools, models, plots, with_previous
                )
            )
        parts.extend(MarkdownReport.status(current, dims, remote, tools, models, False))
        warnings = Comparison.warnings(
            latest_path, baseline_path, dims, remote, tools, models
        )
        if warnings:
            note = ["> **Warning:** comparing across different environments:"]
            note += [f"> - {line}" for line in warnings]
            parts.insert(1, "\n".join(note) + "\n")
        return "\n".join(parts)


print_results = TerminalReport.print_results
print_diff = TerminalReport.print_diff
markdown_results = MarkdownReport.results
markdown_diff = MarkdownReport.diff
