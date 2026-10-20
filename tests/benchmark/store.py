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

:class:`Result` builds and describes results; :class:`ResultsStore` owns
the files (run, baseline, in-progress), loading, saving and promotion.
Pure JSON logic, no torch.
"""

from __future__ import annotations

import copy
import json
import os
import tempfile
from pathlib import Path
from typing import Any

from .definitions import BenchmarkDefinition
from .env import Env

BENCH_DIR = Path(__file__).parent


class CorruptResultsError(ValueError):
    """A results file exists but can't be parsed; nothing should overwrite it."""


class UnknownFormatError(CorruptResultsError):
    """A results file is valid JSON but in no format this version reads."""


class Result:
    """Building and describing one benchmark result (a JSON dict)."""

    COMPLETE, INCOMPLETE, IN_PROGRESS = "complete", "incomplete", "in_progress"
    OK, NOT_RUN, FAILED, UNSUPPORTED = "ok", "not_run", "failed", "unsupported"
    TEST_FIELDS = ("tool", "model", "params")

    @classmethod
    def case_id(cls, test: dict[str, Any]) -> str:
        """A test's identity within a benchmark: (tool, model, params)."""
        return json.dumps(
            {k: test[k] for k in cls.TEST_FIELDS}, sort_keys=True, default=str
        )

    @classmethod
    def make(
        cls,
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
        defn = BenchmarkDefinition.of(defn) if defn else None
        by_id = {cls.case_id(o): o for o in outcomes}
        tests = (
            defn.tests()
            if defn
            else [
                {
                    **{k: o[k] for k in cls.TEST_FIELDS},
                    "optional": o.get("optional", False),
                }
                for o in outcomes
            ]
        )
        results, failed, optional_failed = [], [], []
        for test in tests:
            outcome = by_id.pop(cls.case_id(test), None) or {
                **test,
                "status": cls.NOT_RUN,
                "error": "not run",
            }
            ident = {k: test[k] for k in cls.TEST_FIELDS}
            if outcome["status"] == cls.OK:
                results.append({**ident, "stats": outcome["stats"]})
            else:
                entry = {
                    **ident,
                    "status": outcome["status"],
                    "error": outcome.get("error", ""),
                }
                (optional_failed if test["optional"] else failed).append(entry)
        for extra in by_id.values():
            if extra["status"] == cls.OK:
                results.append(
                    {**{k: extra[k] for k in cls.TEST_FIELDS}, "stats": extra["stats"]}
                )
        return {
            "benchmark": benchmark or (defn.stamp() if defn else None),
            "status": cls.INCOMPLETE if failed else cls.COMPLETE,
            "env": env,
            "meta_params": dict(meta_params),
            "results": results,
            "failed": failed,
            "optional_failed": optional_failed,
        }

    @classmethod
    def in_progress(
        cls, result: dict[str, Any], done: list[str], remaining: list[str]
    ) -> dict[str, Any]:
        """*result* as an in-progress entry: status ``in_progress`` + models done."""
        return {
            **result,
            "status": cls.IN_PROGRESS,
            "progress": {
                "models_done": list(done),
                "models_remaining": list(remaining),
            },
        }

    @staticmethod
    def label(result: dict[str, Any] | None) -> str:
        """``local_latency v1 @ 9f8e7d6 2026-04-23``."""
        if not result:
            return "(none)"
        b = result.get("benchmark") or {}
        name, version = b.get("name", "?"), b.get("version", "?")
        return f"{name} v{version} @ {Env.label(result.get('env'))}"

    @classmethod
    def promote(
        cls, run: dict[str, Any] | None, baseline: dict[str, Any] | None
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
            if result.get("status") != cls.COMPLETE:
                refused[name] = result.get("failed", [])
                continue
            current = new.get(name)
            if current is not None and Env.same_measurement(
                current.get("env"), result.get("env")
            ):
                continue
            previous = (
                {k: v for k, v in current.items() if k != "previous"}
                if current
                else None
            )
            new[name] = {**copy.deepcopy(result), "previous": previous}
            promoted.append(name)
        return new, promoted, refused


class ResultsStore:
    """The results files: ``run.json``, ``baseline.json`` and the in-progress file.

    Everything lives in ``results/``: the committed baseline and its reports
    at the top, the run, in-progress file and ad-hoc reports in the
    gitignored ``results/tmp/``.

    *run* / *baseline* override the default paths. Without an override, a
    missing default falls back to its pre-rename name (``latest.json`` /
    ``results.json``) if only that exists.
    """

    RESULTS_DIR = BENCH_DIR / "results"
    TMP_DIR = RESULTS_DIR / "tmp"
    RUN_FILE = TMP_DIR / "run.json"
    BASELINE_FILE = RESULTS_DIR / "baseline.json"
    LEGACY_RUN_FILE = BENCH_DIR / "latest.json"
    LEGACY_BASELINE_FILE = BENCH_DIR / "results.json"

    def __init__(self, run: Path | None = None, baseline: Path | None = None):
        self._run = Path(run) if run is not None else None
        self._baseline = Path(baseline) if baseline is not None else None

    # ---- paths -------------------------------------------------------------

    @staticmethod
    def _with_legacy(path: Path | None, default: Path, legacy_path: Path) -> Path:
        if path is not None:
            return path
        if not default.exists() and legacy_path.exists():
            return legacy_path
        return default

    @property
    def run_path(self) -> Path:
        return self._with_legacy(self._run, self.RUN_FILE, self.LEGACY_RUN_FILE)

    @property
    def baseline_path(self) -> Path:
        return self._with_legacy(
            self._baseline, self.BASELINE_FILE, self.LEGACY_BASELINE_FILE
        )

    @property
    def partial_path(self) -> Path:
        """``run.json`` -> ``run.partial.json``."""
        run = self.run_path
        return run.with_name(f"{run.stem}.partial{run.suffix}")

    @property
    def run_is_partial(self) -> bool:
        return self._run is not None and self._run.stem.endswith(".partial")

    # ---- reading -----------------------------------------------------------

    def load_run(self) -> dict[str, Any] | None:
        """The run file (or an original-format results file), or None if missing."""
        return self._load(self.run_path, baseline=False)

    def load_baseline(self) -> dict[str, Any] | None:
        """The baseline file (or an original-format file), or None if missing."""
        return self._load(self.baseline_path, baseline=True)

    def load_partial(self) -> dict[str, Any] | None:
        return self._load(self.partial_path, baseline=False)

    @classmethod
    def _load(cls, path: Path, baseline: bool) -> dict[str, Any] | None:
        data = cls.read(path)
        if data is None:
            return None
        return (cls.upgrade_baseline if baseline else cls.upgrade_run)(data, str(path))

    @staticmethod
    def read(path: Path) -> dict[str, Any] | None:
        """Parsed JSON at *path*; None if missing, ``CorruptResultsError`` if bad."""
        if not path.exists():
            return None
        try:
            with open(path) as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise CorruptResultsError(
                f"{path} is not valid JSON ({e}); fix or restore it"
            ) from e

    @classmethod
    def upgrade_run(
        cls, data: dict[str, Any], source: str = "results"
    ) -> dict[str, Any]:
        """A run (current or original format) as ``{name: result}``."""
        return {
            k: {kk: vv for kk, vv in v.items() if kk != "previous"}
            for k, v in cls._upgrade(data, source).items()
        }

    @classmethod
    def upgrade_baseline(
        cls, data: dict[str, Any], source: str = "results"
    ) -> dict[str, Any]:
        """A baseline (current or original format) as ``{name: result + previous}``."""
        return {
            k: {**v, "previous": v.get("previous")}
            for k, v in cls._upgrade(data, source).items()
        }

    @classmethod
    def _upgrade(cls, data: dict[str, Any], source: str) -> dict[str, Any]:
        from . import legacy

        if all(isinstance(v, dict) and "benchmark" in v for v in data.values()):
            return copy.deepcopy(data)
        if legacy.is_v1(data):
            return cls._from_v1(data)
        raise UnknownFormatError(
            f"{source} is not a results file this version reads (current format, "
            "or the original results.json format)"
        )

    @staticmethod
    def _definitions_for(dimension: str, kind: str) -> list[BenchmarkDefinition]:
        current = list(BenchmarkDefinition.load_all().values())
        archived = BenchmarkDefinition.load_archive()
        return [d for d in current + archived if d.dimension_kind == (dimension, kind)]

    @classmethod
    def _from_v1(cls, data: dict[str, Any]) -> dict[str, Any]:
        """The original ``results.json`` format as results.

        Each is versioned by the (current or archived) definition whose test
        set its tests match exactly.
        """
        from . import legacy

        out = {}
        for part in legacy.read_v1(data):
            dimension, kind, outcomes = (
                part["dimension"],
                part["kind"],
                part["outcomes"],
            )
            ids = {Result.case_id(o) for o in outcomes}
            candidates = cls._definitions_for(dimension, kind)
            defn = next(
                (
                    d
                    for d in candidates
                    if {Result.case_id(t) for t in d.tests()} == ids
                ),
                None,
            )
            if defn is None:
                name = next((d["name"] for d in candidates), f"{dimension}_{kind}")
                benchmark = {
                    "name": name,
                    "version": None,
                    "config_hash": None,
                    "kind": kind,
                    "dimension": dimension,
                }
                out[name] = Result.make(
                    None, part["env"], part["meta_params"], outcomes, benchmark
                )
            else:
                meta = {**defn["meta_params"], **part["meta_params"]}
                out[defn["name"]] = Result.make(defn, part["env"], meta, outcomes)
        return out

    def recorded_stamps(self, name: str) -> list[dict[str, Any]]:
        """The ``benchmark`` stamps recorded for *name* in the run and the baseline."""
        out = []
        for doc in (self.load_run(), self.load_baseline()):
            entry = (doc or {}).get(name)
            if entry and entry.get("benchmark"):
                out.append(entry["benchmark"])
        return out

    # ---- writing -----------------------------------------------------------

    @staticmethod
    def save_json(path: Path, data: dict[str, Any]) -> None:
        """Write *data* atomically: temp file in the same directory + ``os.replace``."""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp = tempfile.mkstemp(
            dir=path.parent, prefix=f".{path.name}.", suffix=".tmp"
        )
        try:
            with os.fdopen(fd, "w") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
            os.replace(tmp, path)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise

    def write_result(self, name: str, result: dict[str, Any]) -> None:
        """Replace *name*'s entry in the run file; other entries are kept."""
        run = self.load_run() or {}
        run[name] = result
        self.save_json(self.run_path, run)

    # ---- in-progress file --------------------------------------------------

    def save_partial(self, name: str, result: dict[str, Any]) -> None:
        """Record a benchmark's progress in the in-progress file."""
        doc = self.load_partial() or {}
        doc[name] = result
        self.save_json(self.partial_path, doc)

    def clear_partial(self, name: str) -> None:
        """Drop a finished benchmark from the in-progress file; delete it once empty."""
        doc = self.load_partial()
        if doc is None:
            return
        doc.pop(name, None)
        if doc:
            self.save_json(self.partial_path, doc)
        else:
            self.partial_path.unlink(missing_ok=True)

    def partial_notice(self) -> str | None:
        """A one-line notice naming interrupted benchmarks, if there are any."""
        if self.run_is_partial:
            return None
        doc = self.load_partial()
        if not doc:
            return None
        path = self.partial_path
        return (
            f"note: interrupted benchmark(s) {', '.join(sorted(doc))}: "
            f"partial results in {path} "
            f"(not promotable; inspect with --run {path} --show)"
        )

    # ---- promotion ---------------------------------------------------------

    def promote(self) -> dict[str, Any] | None:
        """Promote the run file into the baseline, benchmark by benchmark.

        Never promotes from an in-progress file.
        """
        if self.run_is_partial:
            print(
                f"REFUSED: {self._run} is an in-progress file; only finished results "
                "in run.json can be promoted."
            )
            return None
        run = self.load_run()
        if run is None:
            print(f"No run found at {self.run_path} — nothing to promote.")
            return None
        new_baseline, promoted, refused = Result.promote(run, self.load_baseline())
        for name, failed in refused.items():
            if run[name].get("status") == Result.IN_PROGRESS:
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
                f"promoted {Result.label(new_baseline[name])} "
                f"(previous: {Result.label(prev)})"
            )
        unchanged = [n for n in run if n not in promoted and n not in refused]
        for name in unchanged:
            print(f"{name}: already the baseline (same result), unchanged")
        if promoted:
            target = self._baseline or self.BASELINE_FILE
            self.save_json(target, new_baseline)
            print(f"baseline written to {target}")
            self.write_baseline_reports(target, new_baseline)
        return new_baseline

    @staticmethod
    def retitle(markdown: str, title: str, intro: str) -> str:
        """Replace a report's ``# heading`` with *title* and an *intro* line."""
        _, _, body = markdown.partition("\n")
        return f"# {title}\n\n{intro}\n{body}"

    @staticmethod
    def baseline_report_paths(baseline_path: Path) -> tuple[Path, Path]:
        """``baseline.json`` -> ``baseline.md``, ``baseline_diff_with_prev.md``."""
        base = Path(baseline_path)
        return (
            base.with_suffix(".md"),
            base.with_name(f"{base.stem}_diff_with_prev.md"),
        )

    @classmethod
    def write_baseline_reports(
        cls, baseline_path: Path, baseline: dict[str, Any]
    ) -> None:
        """Write the Markdown reports committed next to the baseline, with plots.

        One shows the baseline; the other diffs each benchmark's result
        against the result it replaced, so a promote's effect can be
        reviewed without the JSON.
        """
        from .diff import markdown_diff, markdown_results

        current = {
            name: {k: v for k, v in result.items() if k != "previous"}
            for name, result in baseline.items()
        }
        previous = {
            name: result["previous"]
            for name, result in baseline.items()
            if result.get("previous")
        }
        results_md, diff_md = cls.baseline_report_paths(baseline_path)
        results_md.write_text(
            cls.retitle(
                markdown_results(current, plots=True),
                "Benchmark Baseline",
                "The promoted result of each benchmark.",
            )
        )
        diff_md.write_text(
            cls.retitle(
                markdown_diff(current, previous, plots=True),
                "Benchmark Baseline vs. Previous",
                "Each benchmark's promoted result (current) against the result "
                "it replaced (baseline); a benchmark with no previous result "
                "shows its tests as new.",
            )
        )
        print(f"reports written to {results_md} and {diff_md}")
