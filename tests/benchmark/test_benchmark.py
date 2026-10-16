"""Tests for the benchmark harness itself (no GPU, no network).

Run with ``pytest tests/benchmark``.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from tests.benchmark import __main__ as cli
from tests.benchmark import config as bench_config
from tests.benchmark import runner as bench_runner, store
from tests.benchmark.config import UnsupportedTest
from tests.benchmark.definitions import (
    DefinitionError,
    config_hash,
    expand_tests,
    load_archive,
    load_definitions,
    stamp,
    validate,
    version_warnings,
)
from tests.benchmark.diff import (
    comparison_warnings,
    compute_diff,
    compute_peak_diff,
    markdown_diff,
    markdown_results,
    print_diff,
    print_results,
)
from tests.benchmark.memory import coarse_grid, search_max_lengths, threshold_label
from tests.benchmark.runner import BenchmarkRunner, model_footprint, peak_pct, run_benchmark, run_individual
from tests.benchmark.store import (
    CorruptResultsError,
    UnknownFormatError,
    case_id,
    load_baseline,
    load_run,
    make_result,
    promote,
    promote_files,
    save_json,
    upgrade_baseline,
    upgrade_run,
)

OLD_RESULTS = Path(__file__).parent / "fixtures" / "results_v1.json"
OLD_HASH = "f66305ccbe2b543fe3f58715e8806dcf01d0c03c"
OLD_TS = "2026-04-23T19:28:25-0400"
MIB = 2**20
GPT2, GEMMA, LLAMA = "openai-community/gpt2", "google/gemma-3-1b-pt", "meta-llama/Llama-3.1-8B"
L70, L405 = "meta-llama/Llama-3.1-70B", "meta-llama/Llama-3.1-405B-Instruct"
LL = "logit_lens[length]"


def _old() -> dict:
    return json.loads(OLD_RESULTS.read_text())


def _stats(mean: float, remote: bool = False) -> dict:
    stats = {"mean": mean, "std": 0.0, "min": mean, "max": mean, "samples": [mean]}
    if remote:
        stats["breakdown"] = {p: dict(stats) for p in ("total", "total_unqueued", "running", "download")}
    return stats


def _env(git_hash: str = "aaaaaaa111", kind: str = "local", day: str = "2026-10-08", **extra) -> dict:
    env = {"kind": kind, "git_hash": git_hash, "dirty": False, "timestamp": f"{day}T10:00:00+0000", "nnsight": "0.8"}
    if kind == "local":
        env.update(torch="2.11", gpu="GPU", dtype="bfloat16", autocast=True)
    else:
        env["remote_server"] = {"packages": {"ndif": "1.0"}}
    env.update(extra)
    return env


def _peak_stats(lengths: dict, capped=(), footprint=1000 * MIB) -> dict:
    return {
        "footprint_bytes": footprint,
        "context_cap": 4096,
        "max_prompt_length": lengths,
        "capped": list(capped),
        "points": [
            {"prompt_length": 2, "peak_bytes": 20 * MIB, "pct": 2.0, "latency": _stats(0.01)},
            {"prompt_length": 4, "peak_bytes": 40 * MIB, "pct": 4.0, "latency": _stats(0.02)},
            {"prompt_length": 8, "peak_bytes": None, "pct": None, "oom": True},
        ],
    }


def _lat(tool: str, model: str, n: int, mean: float, remote: bool = False) -> dict:
    return {"tool": tool, "model": model, "params": {"prompt_length": n}, "stats": _stats(mean, remote)}


def _pk(model: str, lengths: dict, tool: str = "logit_lens", **kw) -> dict:
    return {"tool": tool, "model": model, "params": {}, "stats": _peak_stats(lengths, **kw)}


def _bench(name: str, version: int = 1, kind: str = "local", dimension: str = "latency", config_hash="h1") -> dict:
    return {"name": name, "version": version, "config_hash": config_hash, "kind": kind, "dimension": dimension}


def _result(name="local_latency", results=(), env=None, version=1, failed=(), optional_failed=(),
            kind="local", dimension="latency", config_hash="h1", meta=None) -> dict:
    return {
        "benchmark": _bench(name, version, kind, dimension, config_hash),
        "status": "incomplete" if failed else "complete",
        "env": env or _env(kind=kind),
        "meta_params": meta or {"n_repeat": 3, "n_warmup": 3},
        "results": list(results), "failed": list(failed), "optional_failed": list(optional_failed),
    }


def _fail(tool, model, n, status="failed", error="RuntimeError: boom") -> dict:
    return {"tool": tool, "model": model, "params": {"prompt_length": n}, "status": status, "error": error}


def _defn(**over) -> dict:
    d = {
        "name": "fake_latency", "version": 1, "kind": "local", "dimension": "latency",
        "meta_params": {"n_repeat": 1, "n_warmup": 0},
        "models": ["org/a", "org/b"],
        "tools": [{"tool": "fake", "name": "fake[length]", "fixed_args": {}, "sweep": {"prompt_length": [1, 2]}}],
    }
    d.update(over)
    return d


# ---------------------------------------------------------------------------
# Definitions
# ---------------------------------------------------------------------------


class TestDefinitions:
    def test_shipped_definitions(self):
        defs = load_definitions()
        assert set(defs) == {"local_latency", "remote_latency", "peak_mem"}
        assert {n: d["version"] for n, d in defs.items()} == {"local_latency": 1, "remote_latency": 1, "peak_mem": 1}
        counts = {n: len(expand_tests(d)) for n, d in defs.items()}
        assert counts == {"local_latency": 27, "remote_latency": 36, "peak_mem": 9}
        assert defs["local_latency"]["models"] == [GPT2, GEMMA, LLAMA]
        assert defs["remote_latency"]["models"] == [GPT2, LLAMA, L70, L405]
        assert {t["tool"] for t in expand_tests(defs["local_latency"])} == {LL, "activation_patching[length]", "j_lens[length]"}
        assert {t["params"]["prompt_length"] for t in expand_tests(defs["local_latency"])} == {10, 25, 50}

    def test_optional_defaults(self):
        defs = load_definitions()
        assert not any(t["optional"] for n in ("local_latency", "peak_mem") for t in expand_tests(defs[n]))
        optional = {(t["tool"], t["model"]) for t in expand_tests(defs["remote_latency"]) if t["optional"]}
        assert optional == {(tool, L405) for tool in (LL, "activation_patching[length]", "j_lens[length]")} | {("j_lens[length]", L70)}

    def test_archived_v0(self):
        v0 = {d["name"]: d for d in load_archive()}
        assert {n: d["version"] for n, d in v0.items()} == {"local_latency": 0, "remote_latency": 0}
        assert len(expand_tests(v0["local_latency"])) == 12
        assert len(expand_tests(v0["remote_latency"])) == 24

    @pytest.mark.parametrize("change,match", [
        ({"version": -1}, "version"),
        ({"kind": "cloud"}, "kind"),
        ({"dimension": "peak_mem", "kind": "remote"}, "local only"),
        ({"models": []}, "models"),
        ({"optional_models": ["org/zzz"]}, "optional model"),
        ({"tools": [{"tool": "fake", "sweep": {"prompt_length": [1]}, "optional": ["org/zzz"]}]}, "optional"),
        ({"tools": [{"tool": "fake"}]}, "sweep"),
    ])
    def test_validation(self, change, match):
        with pytest.raises(DefinitionError, match=match):
            validate(_defn(**change))
        with pytest.raises(DefinitionError, match="missing"):
            validate({k: v for k, v in _defn().items() if k != "models"})

    def test_directory_checks(self, tmp_path):
        save_json(tmp_path / "a.json", _defn(name="a"))
        save_json(tmp_path / "b.json", _defn(name="b"))
        with pytest.raises(DefinitionError, match="already is the local latency benchmark"):
            load_definitions(tmp_path)
        (tmp_path / "b.json").write_text("{nope")
        with pytest.raises(DefinitionError, match="not valid JSON"):
            load_definitions(tmp_path)

    def test_config_hash_and_version_warning(self):
        d = _defn()
        assert config_hash(d) == config_hash({**d, "version": 7, "description": "x"})
        assert config_hash(d) != config_hash({**d, "models": ["org/a"]})
        changed = {**d, "models": ["org/a"]}
        assert version_warnings({"fake_latency": changed}, [stamp(d)])
        assert "version wasn't bumped" in version_warnings({"fake_latency": changed}, [stamp(d)])[0]
        assert version_warnings({"fake_latency": {**changed, "version": 2}}, [stamp(d)]) == []
        assert version_warnings({"fake_latency": d}, [stamp(d)]) == []

    def test_optional_markers(self):
        d = _defn(optional_models=["org/b"], tools=[
            {"tool": "fake", "name": "x", "sweep": {"prompt_length": [1]}, "optional": True},
            {"tool": "fake", "name": "y", "sweep": {"prompt_length": [1]}, "optional": ["org/a"]},
            {"tool": "fake", "name": "z", "sweep": {"prompt_length": [1]}},
        ])
        opt = {(t["tool"], t["model"]): t["optional"] for t in expand_tests(d)}
        assert opt == {("x", "org/a"): True, ("x", "org/b"): True, ("y", "org/a"): True, ("y", "org/b"): True,
                       ("z", "org/a"): False, ("z", "org/b"): True}


# ---------------------------------------------------------------------------
# Running whole benchmarks, status, individual tests
# ---------------------------------------------------------------------------


class _FakeModel:
    dispatched = True

    def __init__(self, repo_id):
        self.repo_id = repo_id


def _fake_tool(fail_on=None):
    def tool(model, n=0, **kwargs):
        if (model.repo_id, n) == fail_on:
            raise RuntimeError("boom")
        return n

    return tool


def _fake_build(unsupported_model=None):
    def build(model, fixed, sweep):
        if model.repo_id == unsupported_model:
            raise UnsupportedTest("no lens")
        return {**fixed, "n": sweep["prompt_length"]}

    return build


@pytest.fixture
def fake(monkeypatch, tmp_path):
    """Registers a ``fake`` tool and a fixed env; returns a setter for its failure modes."""
    monkeypatch.setattr(BenchmarkRunner, "env", lambda self: _env("run1234"))
    monkeypatch.setattr(bench_runner, "_recorded_stamps", lambda name, path=None: [])

    def setup(fail_on=None, unsupported=None):
        monkeypatch.setitem(bench_config.TOOLS, "fake", (_fake_tool(fail_on), _fake_build(unsupported)))

    setup()
    return setup


def _loader(fail_model=None):
    def load(name):
        if name == fail_model:
            raise OSError("cannot load")
        return _FakeModel(name)

    return load


class TestRunning:
    def test_complete(self, fake, tmp_path):
        result = run_benchmark(_defn(), _loader(), tmp_path / "run.json")
        assert result["status"] == "complete"
        assert len(result["results"]) == 4 and result["failed"] == []
        assert result["benchmark"] == stamp(_defn())
        assert result["env"]["git_hash"] == "run1234"
        assert load_run(tmp_path / "run.json") == {"fake_latency": result}

    def test_failed_test_makes_incomplete_without_aborting(self, fake, tmp_path):
        fake(fail_on=("org/a", 2))
        result = run_benchmark(_defn(), _loader(), tmp_path / "run.json")
        assert result["status"] == "incomplete"
        assert [(f["model"], f["params"], f["status"]) for f in result["failed"]] == [("org/a", {"prompt_length": 2}, "failed")]
        assert "boom" in result["failed"][0]["error"]
        assert len(result["results"]) == 3

    def test_optional_failures_keep_complete(self, fake, tmp_path):
        fake(fail_on=("org/b", 1), unsupported="org/b")
        result = run_benchmark(_defn(optional_models=["org/b"]), _loader(), tmp_path / "run.json")
        assert result["status"] == "complete"
        assert result["failed"] == []
        assert {f["status"] for f in result["optional_failed"]} == {"unsupported"}
        assert len(result["optional_failed"]) == 2

    def test_unsupported_and_load_failure_are_failures(self, fake, tmp_path):
        fake(unsupported="org/a")
        result = run_benchmark(_defn(), _loader(fail_model="org/b"), tmp_path / "run.json")
        assert result["status"] == "incomplete"
        by_model = {}
        for f in result["failed"]:
            by_model.setdefault(f["model"], set()).add(f["status"])
        assert by_model == {"org/a": {"unsupported"}, "org/b": {"failed"}}
        assert all("model load" in f["error"] for f in result["failed"] if f["model"] == "org/b")

    def test_interrupted_run_is_incomplete(self):
        result = make_result(_defn(), _env(), {}, [{"tool": "fake[length]", "model": "org/a", "params": {"prompt_length": 1},
                                                    "status": "ok", "stats": _stats(0.1)}])
        assert result["status"] == "incomplete"
        assert {f["status"] for f in result["failed"]} == {"not_run"} and len(result["failed"]) == 3

    def test_real_j_lens_without_lens_does_not_abort(self, fake, monkeypatch):
        monkeypatch.setattr(bench_config.JLensTool, "get_available_lenses", classmethod(lambda cls: {}))
        defn = _defn(tools=[{"tool": "j_lens", "name": "j_lens[length]", "fixed_args": {}, "sweep": {"prompt_length": [1]}}])
        runner = BenchmarkRunner.for_definition(defn)
        outcomes = runner.run_tests(defn, "org/a", _loader(), bench_config.tool_configs(defn))
        assert [o["status"] for o in outcomes] == ["unsupported"]

    def test_all_vs_subset(self, monkeypatch):
        defs = load_definitions()
        monkeypatch.setattr(sys, "argv", ["bench", "--all"])
        assert [d["name"] for d in cli._selected(cli._parse_args(), defs)] == list(defs)
        monkeypatch.setattr(sys, "argv", ["bench", "--benchmarks", "peak_mem"])
        assert [d["name"] for d in cli._selected(cli._parse_args(), defs)] == ["peak_mem"]
        monkeypatch.setattr(sys, "argv", ["bench", "--benchmarks", "nope"])
        with pytest.raises(SystemExit):
            cli._selected(cli._parse_args(), defs)

    @pytest.mark.parametrize("argv", [
        ["bench"], ["bench", "--model", "gpt2", "--promote"], ["bench", "--all", "--repeat", "5"],
        ["bench", "--all", "--show"],
    ])
    def test_cli_rejects(self, monkeypatch, argv):
        monkeypatch.setattr(sys, "argv", argv)
        with pytest.raises(SystemExit):
            cli._parse_args()

    def test_param_parsing(self):
        assert cli._parse_param("prompt_length=10,25") == ("prompt_length", [10, 25])

    def test_individual_tests_print_and_write_nothing(self, fake, tmp_path, monkeypatch, capsys):
        monkeypatch.chdir(tmp_path)
        before = sorted(p.name for p in store.BENCH_DIR.iterdir())
        result = run_individual(_defn(), _loader(), models=["org/a"], params={"prompt_length": [5]})
        assert [(r["model"], r["params"]) for r in result["results"]] == [("org/a", {"prompt_length": 5})]
        assert result["benchmark"]["individual"] is True
        print_results({"fake_latency": {**result, "benchmark": {**result["benchmark"], "dimension": "latency", "kind": "local"}}})
        out = capsys.readouterr().out
        assert "[LOCAL]" in out and "fake[length]" in out
        assert sorted(p.name for p in store.BENCH_DIR.iterdir()) == before
        assert list(tmp_path.iterdir()) == []


class TestInProgress:
    def _interrupting_loader(self, at: str):
        def load(name):
            if name == at:
                raise KeyboardInterrupt
            return _FakeModel(name)

        return load

    def test_interrupt_leaves_run_json_untouched(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        save_json(run_file, {"fake_latency": _result("fake_latency", results=[_lat("fake[length]", "org/a", 1, 9.9)]),
                             "other": _result("other")})
        before = run_file.read_bytes()
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert run_file.read_bytes() == before
        partial = load_run(store.partial_path(run_file))
        entry = partial["fake_latency"]
        assert entry["status"] == "in_progress"
        assert entry["progress"] == {"models_done": ["org/a"], "models_remaining": ["org/b"]}
        assert {(r["model"], r["params"]["prompt_length"]) for r in entry["results"]} == {("org/a", 1), ("org/a", 2)}
        assert {f["status"] for f in entry["failed"]} == {"not_run"}

    def test_finish_replaces_only_its_entry_and_clears_partial(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        other = _result("other", results=[_lat("t", "m", 1, 0.5)])
        save_json(run_file, {"fake_latency": _result("fake_latency"), "other": other})
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert store.partial_path(run_file).exists()
        result = run_benchmark(_defn(), _loader(), run_file)
        run = load_run(run_file)
        assert run["fake_latency"] == result and run["other"] == other
        assert not store.partial_path(run_file).exists()
        assert sorted(p.name for p in tmp_path.iterdir()) == ["run.json"]

    def test_partial_file_keeps_other_interrupted_benchmarks(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(name="other_latency", kind="remote"), self._interrupting_loader("org/b"), run_file)
        run_benchmark(_defn(), _loader(), run_file)
        assert list(load_run(store.partial_path(run_file))) == ["other_latency"]

    def test_finished_with_failures_is_written_incomplete(self, fake, tmp_path):
        fake(fail_on=("org/b", 1))
        run_benchmark(_defn(), _loader(), tmp_path / "run.json")
        assert load_run(tmp_path / "run.json")["fake_latency"]["status"] == "incomplete"
        assert not store.partial_path(tmp_path / "run.json").exists()

    def test_all_writes_each_benchmark_when_it_finishes(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        defs = [_defn(), _defn(name="other_latency", kind="remote")]
        loaders = [_loader(), self._interrupting_loader("org/b")]
        with pytest.raises(KeyboardInterrupt):
            for defn, loader in zip(defs, loaders):
                run_benchmark(defn, loader, run_file)
        assert list(load_run(run_file)) == ["fake_latency"]
        assert list(load_run(store.partial_path(run_file))) == ["other_latency"]

    def test_custom_run_path(self):
        assert store.partial_path(Path("/x/scratch.json")) == Path("/x/scratch.partial.json")

    def test_notice_and_show(self, fake, tmp_path, monkeypatch, capsys):
        run_file = tmp_path / "run.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        capsys.readouterr()
        monkeypatch.setattr(sys, "argv", ["bench", "--show", "--run", str(run_file)])
        cli._main()
        out = capsys.readouterr().out
        partial = store.partial_path(run_file)
        assert f"note: interrupted benchmark(s) fake_latency: partial results in {partial}" in out
        monkeypatch.setattr(sys, "argv", ["bench", "--show", "--run", str(partial)])
        cli._main()
        out = capsys.readouterr().out
        assert "note:" not in out and "fake_latency v1 (in_progress): 2 measured; 2 not run" in out

    def test_promote_refuses_partial(self, fake, tmp_path, capsys):
        run_file, base = tmp_path / "run.json", tmp_path / "baseline.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert promote_files(store.partial_path(run_file), base) is None
        assert "REFUSED" in capsys.readouterr().out and not base.exists()
        in_progress = load_run(store.partial_path(run_file))
        _, promoted, refused = promote(in_progress, None)
        assert promoted == [] and list(refused) == ["fake_latency"]

    def test_atomic_save(self, tmp_path, monkeypatch):
        target = tmp_path / "baseline.json"
        save_json(target, {"a": 1})
        assert sorted(p.name for p in tmp_path.iterdir()) == ["baseline.json"]

        def boom(*args, **kwargs):
            raise RuntimeError("disk full")

        monkeypatch.setattr(store.json, "dump", boom)
        with pytest.raises(RuntimeError):
            save_json(target, {"a": 2})
        assert json.loads(target.read_text()) == {"a": 1}
        assert sorted(p.name for p in tmp_path.iterdir()) == ["baseline.json"]


# ---------------------------------------------------------------------------
# Promotion
# ---------------------------------------------------------------------------


class TestPromote:
    def test_promotes_complete_refuses_incomplete(self):
        run = {
            "local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)]),
            "peak_mem": _result("peak_mem", dimension="peak_mem", failed=[_fail("logit_lens", GPT2, 1)]),
        }
        new, promoted, refused = promote(run, None)
        assert promoted == ["local_latency"]
        assert list(refused) == ["peak_mem"] and refused["peak_mem"][0]["error"] == "RuntimeError: boom"
        assert new == {"local_latency": {**run["local_latency"], "previous": None}}

    def test_current_moves_to_previous(self):
        first = _result(results=[_lat(LL, GPT2, 10, 0.1)], env=_env("a"))
        second = _result(results=[_lat(LL, GPT2, 10, 0.2)], env=_env("b"))
        base, _, _ = promote({"local_latency": first}, None)
        base, promoted, _ = promote({"local_latency": second}, base)
        assert promoted == ["local_latency"]
        assert base["local_latency"]["previous"] == first
        assert base["local_latency"]["results"] == second["results"]
        base, _, _ = promote({"local_latency": _result(results=[_lat(LL, GPT2, 10, 0.3)], env=_env("c"))}, base)
        assert base["local_latency"]["previous"]["env"]["git_hash"] == "b"
        assert "previous" not in base["local_latency"]["previous"]

    def test_repromote_same_result_is_a_no_op(self):
        first = _result(env=_env("a"), results=[_lat(LL, GPT2, 10, 0.1)])
        second = _result(env=_env("b"), results=[_lat(LL, GPT2, 10, 0.2)])
        base, _, _ = promote({"local_latency": first}, None)
        base, _, _ = promote({"local_latency": second}, base)
        again, promoted, _ = promote({"local_latency": second}, base)
        assert promoted == [] and again == base

    def test_other_benchmarks_untouched(self):
        base = upgrade_baseline(_old())
        new, _, _ = promote({"peak_mem": _result("peak_mem", dimension="peak_mem", results=[_pk(GPT2, {"10%": 17})])}, base)
        assert new["local_latency"] == base["local_latency"] and new["remote_latency"] == base["remote_latency"]
        assert new["peak_mem"]["previous"] is None

    def test_promote_files(self, tmp_path, capsys):
        save_json(tmp_path / "baseline.json", upgrade_baseline(_old()))
        save_json(tmp_path / "run.json", {
            "local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)], version=1),
            "remote_latency": _result("remote_latency", kind="remote", failed=[_fail(LL, GPT2, 10)]),
        })
        promote_files(tmp_path / "run.json", tmp_path / "baseline.json")
        out = capsys.readouterr().out
        assert "REFUSED remote_latency: incomplete" in out and "promoted local_latency v1" in out
        base = load_baseline(tmp_path / "baseline.json")
        assert base["local_latency"]["benchmark"]["version"] == 1
        assert base["local_latency"]["previous"]["benchmark"]["version"] == 0
        assert base["remote_latency"]["benchmark"]["version"] == 0


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------


class TestMigration:
    def test_v1_becomes_v0_benchmarks_with_exact_values(self):
        old = _old()
        base = upgrade_baseline(old)
        assert set(base) == {"local_latency", "remote_latency"}
        v0 = {d["name"]: d for d in load_archive()}
        for name, kind in (("local_latency", "local"), ("remote_latency", "remote")):
            r = base[name]
            assert r["benchmark"] == stamp(v0[name])
            assert r["status"] == "complete" and r["failed"] == [] and r["previous"] is None
            assert r["meta_params"]["n_repeat"] == 10 and r["meta_params"]["n_warmup"] == 3
            by_id = {case_id(x): x for x in r["results"]}
            assert len(by_id) == len(old["results"][kind])
            for row in old["results"][kind]:
                expected = dict(row["latency"])
                if kind == "remote":
                    expected["breakdown"] = row["latency_breakdown"]
                assert by_id[case_id(row)]["stats"] == expected
        assert base["local_latency"]["env"] == {
            "kind": "local", "git_hash": OLD_HASH, "timestamp": OLD_TS, "python": "3.12.3",
            "nnsight": "0.6.3", "transformers": "4.55.4", "torch": "2.9.0+cpu",
        }
        assert base["remote_latency"]["env"] == {
            "kind": "remote", "git_hash": OLD_HASH, "timestamp": OLD_TS, "nnsight": "0.6.3", "remote_server": "unknown",
        }

    def test_v1_with_unmatched_test_set_is_unversioned(self):
        old = _old()
        old["results"]["local"] = [dict(old["results"]["local"][0], params={"prompt_length": 7})]
        old["results"]["remote"] = []
        run = upgrade_run(old)
        assert list(run) == ["local_latency"]
        r = run["local_latency"]
        assert r["benchmark"]["version"] is None and r["benchmark"]["kind"] == "local"
        assert r["results"][0]["stats"] == old["results"]["local"][0]["latency"]

    @pytest.mark.parametrize("doc", [
        {"git_hash": "x", "latency": {"meta_params": {}, "runs": []}, "peak_mem": {"meta_params": {}, "runs": []}},
        {"local": {"current": None, "stale": []}, "remote": {"current": None, "stale": []}},
        {"latency": {"local": None, "remote": None}, "peak_mem": None},
    ])
    def test_intermediate_formats_are_rejected(self, tmp_path, doc):
        save_json(tmp_path / "baseline.json", doc)
        with pytest.raises(UnknownFormatError, match="baseline.json"):
            load_baseline(tmp_path / "baseline.json")

    def test_empty_files_are_valid(self, tmp_path):
        save_json(tmp_path / "run.json", {})
        assert load_run(tmp_path / "run.json") == {}

    def test_current_format_round_trips(self, tmp_path):
        base = upgrade_baseline(_old())
        save_json(tmp_path / "b.json", base)
        assert load_baseline(tmp_path / "b.json") == base
        run = {"local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)])}
        save_json(tmp_path / "r.json", run)
        assert load_run(tmp_path / "r.json") == run

    def test_old_file_names_still_load(self, tmp_path, monkeypatch):
        monkeypatch.setattr(store, "BASELINE_FILE", tmp_path / "baseline.json")
        monkeypatch.setattr(store, "LEGACY_BASELINE_FILE", tmp_path / "results.json")
        monkeypatch.setattr(store, "RUN_FILE", tmp_path / "run.json")
        monkeypatch.setattr(store, "LEGACY_RUN_FILE", tmp_path / "latest.json")
        (tmp_path / "results.json").write_text(OLD_RESULTS.read_text())
        (tmp_path / "latest.json").write_text(OLD_RESULTS.read_text())
        assert load_baseline()["local_latency"]["env"]["git_hash"] == OLD_HASH
        assert load_run()["remote_latency"]["benchmark"]["version"] == 0


class TestCorruptFiles:
    @pytest.mark.parametrize("bad", ['{"local_latency": {', "<<<<<<< HEAD\n{}\n=======\n{}\n>>>>>>> x\n", ""])
    def test_corrupt_baseline_aborts_and_is_untouched(self, tmp_path, bad):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        base.write_text(bad)
        save_json(run, {"local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)])})
        with pytest.raises(CorruptResultsError, match="baseline.json"):
            promote_files(run, base)
        with pytest.raises(CorruptResultsError):
            print_diff(run, base)
        assert base.read_text() == bad

    def test_corrupt_run_aborts_and_is_untouched(self, tmp_path):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        save_json(base, upgrade_baseline(_old()))
        before = base.read_text()
        run.write_text('{"local_latency": {"env"')
        with pytest.raises(CorruptResultsError, match="run.json"):
            promote_files(run, base)
        with pytest.raises(CorruptResultsError):
            print_results(run)
        assert run.read_text() == '{"local_latency": {"env"' and base.read_text() == before

    def test_missing_files_still_fine(self, tmp_path):
        assert load_baseline(tmp_path / "baseline.json") is None
        assert load_run(tmp_path / "run.json") is None
        assert promote_files(tmp_path / "run.json", tmp_path / "baseline.json") is None


# ---------------------------------------------------------------------------
# Threshold search
# ---------------------------------------------------------------------------


def _linear(slope: int, intercept: int, oom_from: int | None = None):
    calls: list[int] = []

    def measure(n: int) -> int | None:
        calls.append(n)
        if oom_from is not None and n >= oom_from:
            return None
        return slope * n + intercept

    return measure, calls


class TestSearch:
    def test_labels_and_grid(self):
        assert [threshold_label(t) for t in (0.1, 0.25, 0.5)] == ["10%", "25%", "50%"]
        assert coarse_grid(2, 100) == [2, 4, 8, 16, 32, 64, 100]
        assert coarse_grid(2, 64) == [2, 4, 8, 16, 32, 64]

    @pytest.mark.parametrize("slope,intercept", [(13 * MIB, 5 * MIB), (MIB, 0), (7, 3)])
    def test_bisection_finds_exact_values(self, slope, intercept):
        footprint = 2000 * MIB if slope > 100 else 10_000
        measure, calls = _linear(slope, intercept)
        result = search_max_lengths(measure, footprint, (0.1, 0.25, 0.5), cap=1_000_000)

        for t in (0.1, 0.25, 0.5):
            expected = int((t * footprint - intercept) // slope)
            assert result.max_lengths[threshold_label(t)] == expected
        assert result.capped == []
        assert len(calls) == len(set(calls))
        assert set(result.peaks) == set(calls)

    def test_keys_follow_threshold_order(self):
        measure, _ = _linear(1, 0)
        result = search_max_lengths(measure, 1000, (0.5, 0.1), cap=10_000)
        assert list(result.max_lengths) == ["50%", "10%"]
        assert result.max_lengths == {"50%": 500, "10%": 100}

    def test_smallest_length_already_over_is_none(self):
        measure, _ = _linear(1, 150)
        result = search_max_lengths(measure, 1000, (0.1, 0.25, 0.5), cap=10_000, start=2)
        assert result.max_lengths == {"10%": None, "25%": 100, "50%": 350}

    def test_cap_reached_without_crossing(self):
        measure, _ = _linear(1, 0)
        result = search_max_lengths(measure, 1000, (0.1, 0.25, 0.5), cap=200)
        assert result.max_lengths == {"10%": 100, "25%": 200, "50%": 200}
        assert result.capped == ["25%", "50%"]

    def test_oom_counts_as_over(self):
        measure, _ = _linear(1, 0, oom_from=300)
        result = search_max_lengths(measure, 1000, (0.1, 0.25, 0.5), cap=10_000)
        assert result.max_lengths == {"10%": 100, "25%": 250, "50%": 299}
        assert result.peaks[300] is None


class TestPercent:
    def test_peak_pct(self):
        assert peak_pct(50, 200) == 25.0
        assert peak_pct(1, 3) == 33.333

    def test_model_footprint_counts_params_and_buffers(self):
        torch = pytest.importorskip("torch")
        module = torch.nn.Linear(4, 8).to(torch.bfloat16)
        module.register_buffer("scale", torch.zeros(10, dtype=torch.float32))
        assert model_footprint(module) == (4 * 8 + 8) * 2 + 10 * 4


# ---------------------------------------------------------------------------
# Show / diff rendering
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Show / diff rendering
# ---------------------------------------------------------------------------


@pytest.fixture
def files(tmp_path):
    """A baseline (v0 latency from the old fixture, a peak_mem v1 with a previous) and a v1 run."""
    base = upgrade_baseline(_old())
    old_peak = _result("peak_mem", dimension="peak_mem", env=_env("p0"),
                       results=[_pk(GPT2, {"10%": 10}), _pk(GEMMA, {"10%": 12})])
    new_peak = _result("peak_mem", dimension="peak_mem", env=_env("p1", torch="2.10"),
                       results=[_pk(GEMMA, {"10%": 14, "25%": 36, "50%": 72}), _pk(GPT2, {"10%": 17})])
    base, _, _ = promote({"peak_mem": old_peak}, base)
    base, _, _ = promote({"peak_mem": new_peak}, base)
    run = {
        "local_latency": _result(env=_env("new5678"), results=[
            _lat(LL, GPT2, 25, 0.02), _lat(LL, GPT2, 50, 0.05), _lat("j_lens[length]", GPT2, 25, 0.03),
        ], failed=[_fail("j_lens[length]", LLAMA, 25), _fail(LL, LLAMA, 10)]),
        "remote_latency": _result("remote_latency", kind="remote", version=0, env=_env("new5678", kind="remote"),
                                  config_hash=base["remote_latency"]["benchmark"]["config_hash"],
                                  results=[_lat(LL, GPT2, 25, 0.4, remote=True)]),
    }
    paths = {"baseline": tmp_path / "baseline.json", "run": tmp_path / "run.json"}
    save_json(paths["baseline"], base)
    save_json(paths["run"], run)
    return paths


def _add_peak_to_run(files):
    run = json.loads(files["run"].read_text())
    run["peak_mem"] = _result("peak_mem", dimension="peak_mem", env=_env("new5678"), results=[
        _pk(GEMMA, {"10%": 15, "25%": 36, "50%": 4096}, capped=["50%"]), _pk(LLAMA, {"10%": 190, "25%": 480, "50%": 960}),
    ], meta={"n_repeat": 3, "n_warmup": 1, "dtype": "bfloat16", "autocast": True, "swept": "prompt_length",
             "thresholds": [0.1, 0.25, 0.5], "min_length": 2, "max_length": 4096})
    save_json(files["run"], run)


class TestRendering:
    def test_show(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], detail=True)
        out = capsys.readouterr().out
        assert "[LOCAL]" in out and "[REMOTE (unqueued)]" in out
        assert "PEAK MEMORY" in out and ">=4096" in out and "OOM" in out and "1000.0MiB" in out
        assert "local_latency v1 @ new5678" in out
        assert "local_latency v1 (incomplete): 3 measured; 2 failed" in out
        assert "failed: j_lens[length] | meta-llama/Llama-3.1-8B | prompt_length=25 — RuntimeError: boom" in out

    def test_setup_line(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], dims=["peak_mem"])
        assert "Setup:  local, bfloat16, autocast, swept=prompt_length, repeat=3" in capsys.readouterr().out

    def test_show_one_dimension(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "PEAK MEMORY" in out and "[LOCAL]" not in out
        print_results(files["run"], remote=True)
        out = capsys.readouterr().out
        assert "PEAK MEMORY" not in out and "[REMOTE (unqueued)]" in out

    def test_different_versions_compare_shared_tests(self, files):
        rows = {(r["section"], r["tool"], r["model"], r["params"]["prompt_length"]): r
                for r in compute_diff(files["run"], files["baseline"])}
        shared = rows[("local", LL, GPT2, 25)]
        assert shared["status"] == "changed" and shared["source"] == "baseline v0"
        assert rows[("local", "j_lens[length]", GPT2, 25)]["status"] == "new"
        removed = rows[("local", LL, LLAMA, 10)]
        assert removed["status"] == "removed" and removed["source"] == "failed in run"
        assert rows[("local", "activation_patching[length]", GPT2, 10)]["source"] == "not in run"

    def test_same_version_compares_normally(self, files):
        rows = [r for r in compute_diff(files["run"], files["baseline"], remote=True)]
        changed = [r for r in rows if r["status"] == "changed"]
        assert len(changed) == 1 and changed[0]["source"] == "baseline"
        assert sum(r["status"] == "removed" for r in rows) == 23

    def test_warnings(self, files, capsys):
        warnings = comparison_warnings(files["run"], files["baseline"])
        assert any(w.startswith("local_latency: run v1 vs baseline v0 — comparing the 2 shared test(s)") for w in warnings)
        local_env = next(w for w in warnings if w.startswith("local_latency vs baseline: "))
        assert "torch: 2.9.0+cpu -> 2.11" in local_env and "git_hash" not in local_env
        remote_env = next(w for w in warnings if w.startswith("remote_latency vs baseline: "))
        assert "remote_server: unknown ->" in remote_env and "torch" not in remote_env
        print_diff(files["run"], files["baseline"])
        assert "WARNING: comparing across different environments" in capsys.readouterr().out
        assert "> **Warning:**" in markdown_diff(files["run"], files["baseline"])

    def test_same_version_changed_definition_warns(self, files):
        run = json.loads(files["run"].read_text())
        run["remote_latency"]["benchmark"]["config_hash"] = "changed"
        save_json(files["run"], run)
        assert any("same version v0 but different definitions" in w for w in comparison_warnings(files["run"], files["baseline"]))

    def test_with_previous(self, files):
        rows = compute_peak_diff(files["run"], files["baseline"])
        assert rows == []
        rows = {r["model"]: r for r in compute_peak_diff(files["run"], files["baseline"], with_previous=True)}
        assert rows[GPT2]["source"] == "last change (p0 → p1)"
        assert rows[GPT2]["old"]["max_prompt_length"] == {"10%": 10}
        assert rows[GPT2]["new"]["max_prompt_length"] == {"10%": 17}

    def test_live_comparison_takes_precedence(self, files, capsys):
        _add_peak_to_run(files)
        rows = {r["model"]: r for r in compute_peak_diff(files["run"], files["baseline"], with_previous=True)}
        assert rows[GEMMA]["source"] == "baseline" and rows[GEMMA]["old"]["max_prompt_length"]["10%"] == 14
        assert rows[LLAMA]["status"] == "new"
        assert rows[GPT2]["status"] == "removed"
        print_diff(files["run"], files["baseline"])
        out = capsys.readouterr().out
        assert "14 -> 15 (+1)" in out and "72 -> >=4096 (+4024)" in out

    def test_markdown_and_plots(self, files):
        _add_peak_to_run(files)
        md = markdown_results(files["run"], detail=True)
        assert "## PEAK MEMORY (local GPU)" in md and "## Benchmarks" in md
        md = markdown_diff(files["run"], files["baseline"])
        assert "| Params | Baseline | Current | Delta | vs |" in md and "🆕" in md
        pytest.importorskip("matplotlib")
        assert "data:image/png" in markdown_results(files["run"], plots=True)
        assert "data:image/png" in markdown_diff(files["run"], files["baseline"], plots=True)
