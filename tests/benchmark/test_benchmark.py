"""Tests for the benchmark harness itself (no GPU, no network).

Run with ``pytest tests/benchmark``.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tests.benchmark import config as bench_config
from tests.benchmark import store
from tests.benchmark.config import (
    BlockConfig,
    ToolBenchmarkConfig,
    UnsupportedTest,
    block_slots,
    config_slots,
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
from tests.benchmark.runner import BenchmarkRunner, model_footprint, peak_pct
from tests.benchmark.store import (
    CorruptResultsError,
    get_block,
    identity,
    last_changes,
    load_baseline,
    load_run,
    merge_run_block,
    promote,
    promote_files,
    same_identity,
    save_json,
    slot_counts,
    slot_id,
    upgrade,
)

OLD_RESULTS = Path(__file__).parent / "fixtures" / "results_v1.json"
OLD_HASH = "f66305ccbe2b543fe3f58715e8806dcf01d0c03c"
OLD_TS = "2026-04-23T19:28:25-0400"
OLD_STALE = "stale @ f66305c 2026-04-23"
MIB = 2**20
GPT2, GEMMA, LLAMA = "openai-community/gpt2", "google/gemma-3-1b-pt", "meta-llama/Llama-3.1-8B"
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


def _lat(tool: str, model: str, n: int, mean: float | None = None, remote: bool = False, status: str | None = None) -> dict:
    slot = {"tool": tool, "model": model, "params": {"prompt_length": n}}
    if mean is None:
        return {**slot, "status": status or "not_run", "stats": None}
    return {**slot, "status": "ok", "stats": _stats(mean, remote)}


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


def _peak(model: str, lengths: dict | None = None, **kw) -> dict:
    slot = {"tool": "logit_lens", "model": model, "params": {}}
    if lengths is None:
        return {**slot, "status": "not_run", "stats": None}
    return {**slot, "status": "ok", "stats": _peak_stats(lengths, **kw)}


LAT_META = {"n_repeat": 3, "n_warmup": 3}
PEAK_META = {"thresholds": [0.1, 0.25, 0.5], "swept": "prompt_length", "min_length": 2,
             "max_length": 4096, "n_repeat": 3, "n_warmup": 1}


def _block(env: dict | None, runs: list, meta: dict | None = None) -> dict:
    return {"env": env, "meta_params": dict(meta or LAT_META), "runs": runs}


def _doc(local=None, remote=None, peak=None) -> dict:
    return {"latency": {"local": local, "remote": remote}, "peak_mem": peak}


def _ids(slots: list) -> list:
    return [{k: s[k] for k in ("tool", "model", "params")} for s in slots]


def _slot(doc: dict, block: str, tool: str, model: str, params: dict) -> dict:
    sid = slot_id({"tool": tool, "model": model, "params": params})
    return next(s for s in get_block(doc, block)["runs"] if slot_id(s) == sid)


# ---------------------------------------------------------------------------
# Shape, config matrix
# ---------------------------------------------------------------------------


class TestConfig:
    def test_default_matrix(self):
        slots = config_slots()
        assert set(slots) == {"latency.local", "latency.remote", "peak_mem"}
        assert len(slots["latency.local"]) == 3 * 3 * 3
        assert len(slots["latency.remote"]) == 3 * 4 * 3
        assert len(slots["peak_mem"]) == 3 * 3
        assert {s["tool"] for s in slots["latency.local"]} == {LL, "activation_patching[length]", "j_lens[length]"}
        assert {s["tool"] for s in slots["peak_mem"]} == {"logit_lens", "activation_patching", "j_lens"}
        assert {s["model"] for s in slots["latency.remote"]} == {
            GPT2, LLAMA, "meta-llama/Llama-3.1-70B", "meta-llama/Llama-3.1-405B-Instruct",
        }
        assert {s["params"]["prompt_length"] for s in slots["latency.local"]} == {10, 25, 50}

    def test_j_lens_without_lens_is_unsupported(self, monkeypatch):
        monkeypatch.setattr(bench_config.JLensTool, "get_available_lenses", classmethod(lambda cls: {}))

        class Model:
            repo_id, dispatched, tokenizer = "org/no-lens", False, None

        with pytest.raises(UnsupportedTest):
            bench_config._j_lens_length_build(Model(), {}, {"prompt_length": 10})


# ---------------------------------------------------------------------------
# Runner: subset runs, placeholders, failed vs not-run, never aborting
# ---------------------------------------------------------------------------


class _FakeModel:
    repo_id = "org/fake"
    dispatched = True


def _tool(fail_on: int | None = None):
    def tool(model, n=0, **kwargs):
        if n == fail_on:
            raise RuntimeError("boom")
        return n

    return tool


def _builder(unsupported_model: str | None = None):
    def build(model, fixed, sweep):
        if model.repo_id == unsupported_model:
            raise UnsupportedTest("no lens")
        return {**fixed, "n": sweep["prompt_length"]}

    return build


def _cfg(name: str, **kw) -> ToolBenchmarkConfig:
    return ToolBenchmarkConfig(name, _tool(kw.pop("fail_on", None)), sweep_params={"prompt_length": [1, 2]},
                               build_args=_builder(kw.pop("unsupported", None)))


@pytest.fixture
def runner(monkeypatch):
    r = BenchmarkRunner(n_repeat=1, n_warmup=1, autocast=False)
    monkeypatch.setattr(r, "env", lambda: _env("run1234"))
    return r


class TestRunner:
    def test_subset_run_fills_placeholders(self, runner, tmp_path):
        block_cfg = BlockConfig(["org/fake", "org/other"], [_cfg("a"), _cfg("b")])
        slots = block_slots("latency.local", block_cfg)
        measured = runner.run("org/fake", _FakeModel(), [block_cfg.tools[0]])
        runner.save("latency.local", measured, slots, tmp_path / "run.json")

        doc = load_run(tmp_path / "run.json")
        runs = get_block(doc, "latency.local")["runs"]
        assert _ids(runs) == slots
        assert slot_counts(get_block(doc, "latency.local")) == {
            "current": 2, "stale": 0, "failed": 0, "unsupported": 0, "not_run": 6,
        }
        assert get_block(doc, "latency.remote") is None and get_block(doc, "peak_mem") is None
        assert get_block(doc, "latency.local")["env"]["git_hash"] == "run1234"

    def test_failed_and_unsupported_never_abort(self, runner, tmp_path):
        model = _FakeModel()
        cfgs = [_cfg("a", fail_on=2), _cfg("b", unsupported="org/fake"), _cfg("c")]
        slots = runner.run("org/fake", model, cfgs)
        by = {(s["tool"], s["params"]["prompt_length"]): s for s in slots}
        assert by[("a", 1)]["status"] == "ok"
        assert by[("a", 2)]["status"] == "failed" and "boom" in by[("a", 2)]["error"]
        assert by[("a", 2)]["stats"] is None
        assert {by[("b", n)]["status"] for n in (1, 2)} == {"unsupported"}
        assert {by[("c", n)]["status"] for n in (1, 2)} == {"ok"}

    def test_real_j_lens_config_without_lens_does_not_abort(self, runner, monkeypatch):
        monkeypatch.setattr(bench_config.JLensTool, "get_available_lenses", classmethod(lambda cls: {}))
        j_lens_cfg = next(c for c in bench_config.default_configs() if c.tool_name == "j_lens[length]")
        slots = runner.run("org/fake", _FakeModel(), [j_lens_cfg])
        assert len(slots) == 3 and {s["status"] for s in slots} == {"unsupported"}

    def test_run_file_merges_per_slot(self, runner, tmp_path):
        block_cfg = BlockConfig(["org/fake"], [_cfg("a"), _cfg("b")])
        slots = block_slots("latency.local", block_cfg)
        path = tmp_path / "run.json"
        runner.save("latency.local", runner.run("org/fake", _FakeModel(), [block_cfg.tools[0]]), slots, path)
        runner.save("latency.local", runner.run("org/fake", _FakeModel(), [block_cfg.tools[1]]), slots, path)
        assert slot_counts(get_block(load_run(path), "latency.local"))["current"] == 4

    def test_run_file_replaced_on_new_identity(self):
        old = _block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.2)])
        new = _block(_env("b"), [_lat("t", "m", 1, 0.3), _lat("t", "m", 2)])
        merged, did = merge_run_block(old, new)
        assert not did and merged == new
        new_same = _block(_env("a", day="2026-10-09"), [_lat("t", "m", 1, 0.3), _lat("t", "m", 2)])
        merged, did = merge_run_block(old, new_same)
        assert did
        assert [s["stats"]["mean"] for s in merged["runs"]] == [0.3, 0.2]


# ---------------------------------------------------------------------------
# Staleness identity
# ---------------------------------------------------------------------------


class TestIdentity:
    def test_timestamp_and_python_ignored(self):
        assert same_identity(_env(), _env(day="2027-01-01", python="3.13"))

    @pytest.mark.parametrize("change", [
        {"git_hash": "other"},
        {"dirty": True, "dirty_fingerprint": "f"},
        {"nnsight": "0.9"}, {"nnterp_commit": "c"}, {"transformers": "6"}, {"torch": "3"},
        {"gpu": "other"}, {"dtype": "float32"}, {"autocast": False},
    ])
    def test_code_dependencies_and_setup_count(self, change):
        assert not same_identity(_env(), _env(**change))

    def test_dirty_fingerprints(self):
        a = _env(dirty=True, dirty_fingerprint="f1")
        assert same_identity(a, dict(a))
        assert not same_identity(a, _env(dirty=True, dirty_fingerprint="f2"))

    def test_remote_server(self):
        a = _env(kind="remote")
        b = _env(kind="remote", remote_server={"packages": {"ndif": "2.0"}})
        assert not same_identity(a, b)
        assert "gpu" not in identity(a)

    def test_meta_params_only_warn(self, capsys):
        base = _doc(local=_block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.2)]))
        run = _doc(local=_block(_env("a", day="2026-10-09"), [_lat("t", "m", 1, 0.3)], meta={"n_repeat": 9, "n_warmup": 3}))
        new, _ = promote(run, base)
        assert "n_repeat changed (3 -> 9)" in capsys.readouterr().out
        assert slot_counts(get_block(new, "latency.local"))["stale"] == 0


# ---------------------------------------------------------------------------
# Promotion
# ---------------------------------------------------------------------------


SLOTS = _ids([_lat("t", "m", n) for n in (1, 2, 3)])


class TestPromote:
    def test_rerun_becomes_current_and_env_moves(self):
        base = _doc(local=_block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.2), _lat("t", "m", 3)]))
        run = _doc(local=_block(_env("b"), [_lat("t", "m", 1, 0.5), _lat("t", "m", 2), _lat("t", "m", 3)]))
        new, _ = promote(run, base, {"latency.local": SLOTS})
        block = get_block(new, "latency.local")
        assert block["env"]["git_hash"] == "b"
        s1, s2, s3 = block["runs"]
        assert s1["stats"]["mean"] == 0.5 and "stale" not in s1 and "env" not in s1
        assert s2["stats"]["mean"] == 0.2 and s2["stale"] is True and s2["env"]["git_hash"] == "a"
        assert s3 == _lat("t", "m", 3)

    def test_same_identity_stays_current(self):
        base = _doc(local=_block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.2)]))
        run = _doc(local=_block(_env("a", day="2026-10-09"), [_lat("t", "m", 1, 0.5)]))
        new, _ = promote(run, base)
        assert slot_counts(get_block(new, "latency.local"))["current"] == 2

    def test_stale_slot_back_to_current_when_identity_matches(self):
        stale = {**_lat("t", "m", 2, 0.2), "stale": True, "env": _env("a")}
        base = _doc(local=_block(_env("b"), [_lat("t", "m", 1, 0.1), stale]))
        run = _doc(local=_block(_env("a", day="2026-11-01"), [_lat("t", "m", 3, 0.3)]))
        new, _ = promote(run, base)
        runs = {s["params"]["prompt_length"]: s for s in get_block(new, "latency.local")["runs"]}
        assert "stale" not in runs[2] and "env" not in runs[2]
        assert runs[1]["stale"] is True and runs[1]["env"]["git_hash"] == "b"

    def test_placeholder_and_failure_never_overwrite(self):
        base = _doc(local=_block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.2), _lat("t", "m", 3)]))
        run = _doc(local=_block(_env("b"), [
            _lat("t", "m", 1), {**_lat("t", "m", 2, status="failed"), "error": "x"},
            {**_lat("t", "m", 3, status="unsupported"), "error": "no lens"}, _lat("t", "m", 4, 0.4),
        ]))
        new, _ = promote(run, base)
        runs = {s["params"]["prompt_length"]: s for s in get_block(new, "latency.local")["runs"]}
        assert runs[1]["stats"]["mean"] == 0.1 and runs[2]["stats"]["mean"] == 0.2
        assert runs[3]["status"] == "unsupported"

    def test_unrun_block_untouched_except_config_sync(self):
        remote = _block(_env("r", kind="remote"), [_lat("t", "m", 1, 1.0, remote=True), _lat("t", "gone", 1, 2.0, remote=True)])
        base = _doc(remote=remote)
        run = _doc(local=_block(_env("b"), [_lat("t", "m", 1, 0.5)]))
        new, _ = promote(run, base)
        assert get_block(new, "latency.remote") == remote
        new, _ = promote(run, base, {"latency.remote": SLOTS, "latency.local": SLOTS})
        remote_runs = get_block(new, "latency.remote")["runs"]
        assert _ids(remote_runs) == SLOTS
        assert remote_runs[0]["stats"]["mean"] == 1.0 and remote_runs[1]["status"] == "not_run"

    def test_new_config_slots_start_as_placeholders(self):
        new, _ = promote(_doc(), None, config_slots())
        for block in ("latency.local", "latency.remote", "peak_mem"):
            b = get_block(new, block)
            assert b["env"] is None and b["runs"]
            assert {s["status"] for s in b["runs"]} == {"not_run"}

    def test_peak_promotes_like_latency(self):
        base = _doc(peak=_block(_env("a"), [_peak(GPT2, {"10%": 17}), _peak(GEMMA, {"10%": 14})], PEAK_META))
        run = _doc(peak=_block(_env("b"), [_peak(GPT2, {"10%": 18}), _peak(GEMMA)], PEAK_META))
        new, changes = promote(run, base)
        gpt2 = _slot(new, "peak_mem", "logit_lens", GPT2, {})
        gemma = _slot(new, "peak_mem", "logit_lens", GEMMA, {})
        assert gpt2["stats"]["max_prompt_length"] == {"10%": 18}
        assert gpt2["last_change"]["delta"] == {"10%": 1}
        assert gemma["stale"] is True and gemma["env"]["git_hash"] == "a"
        assert [c["block"] for c in changes] == ["peak_mem"]


class TestLastChange:
    def test_written_on_rerun_with_both_endpoints(self):
        base = load_baseline(OLD_RESULTS)
        old_mean = _slot(base, "latency.local", LL, GPT2, {"prompt_length": 10})["stats"]["mean"]
        run = _doc(local=_block(_env("new5678"), [_lat(LL, GPT2, 10, 0.0125), _lat("j_lens[length]", GPT2, 10, 0.02)]))
        new, changes = promote(run, base)
        change = _slot(new, "latency.local", LL, GPT2, {"prompt_length": 10})["last_change"]
        assert change["from"] == {"value": old_mean, "git_hash": OLD_HASH, "timestamp": OLD_TS}
        assert change["to"]["value"] == 0.0125 and change["to"]["git_hash"] == "new5678"
        assert change["delta"] == round(0.0125 - old_mean, 6)
        assert change["pct"] == round((0.0125 - old_mean) / old_mean * 100, 3)
        assert "last_change" not in _slot(new, "latency.local", "j_lens[length]", GPT2, {"prompt_length": 10})
        assert len(changes) == 1

    def test_peak_null_thresholds(self):
        base = _doc(peak=_block(_env("a"), [_peak(GEMMA, {"10%": 14, "25%": 36, "50%": None})], PEAK_META))
        run = _doc(peak=_block(_env("b"), [_peak(GEMMA, {"10%": 15, "25%": 36, "50%": 70})], PEAK_META))
        new, _ = promote(run, base)
        change = _slot(new, "peak_mem", "logit_lens", GEMMA, {})["last_change"]
        assert change["delta"] == {"10%": 1, "25%": 0, "50%": None}
        assert change["pct"] == {"10%": round(100 / 14, 3), "25%": 0.0, "50%": None}

    def test_kept_on_stale_move_and_replaced_by_next_change(self):
        base = _doc(local=_block(_env("a"), [_lat("t", "m", 1, 0.1), _lat("t", "m", 2, 0.1)]))
        base, _ = promote(_doc(local=_block(_env("b"), [_lat("t", "m", 1, 0.2), _lat("t", "m", 2, 0.3)])), base)
        base, _ = promote(_doc(local=_block(_env("c"), [_lat("t", "m", 1, 0.4)])), base)
        runs = {s["params"]["prompt_length"]: s for s in get_block(base, "latency.local")["runs"]}
        assert (runs[1]["last_change"]["from"]["value"], runs[1]["last_change"]["to"]["value"]) == (0.2, 0.4)
        assert runs[2]["stale"] is True
        assert (runs[2]["last_change"]["from"]["value"], runs[2]["last_change"]["to"]["value"]) == (0.1, 0.3)

    def test_repromote_same_measurement_keeps_it(self, tmp_path):
        paths = {"run": tmp_path / "run.json", "base": tmp_path / "baseline.json"}
        save_json(paths["base"], load_baseline(OLD_RESULTS))
        save_json(paths["run"], _doc(local=_block(_env("new"), [_lat(LL, GPT2, 10, 0.01)])))
        promote_files(paths["run"], paths["base"])
        first = last_changes(load_baseline(paths["base"]))
        assert len(first) == 1

        promote_files(paths["run"], paths["base"])
        assert last_changes(load_baseline(paths["base"])) == first
        assert promote(load_run(paths["run"]), load_baseline(paths["base"]))[1] == []

        save_json(paths["run"], _doc(local=_block(_env("new", day="2026-10-09"), [_lat(LL, GPT2, 10, 0.01)])))
        promote_files(paths["run"], paths["base"])
        (change,) = last_changes(load_baseline(paths["base"])).values()
        assert change["delta"] == 0.0 and change["from"]["timestamp"] != change["to"]["timestamp"]

    def test_absent_is_fine(self):
        assert last_changes(load_baseline(OLD_RESULTS)) == {}


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------


class TestMigration:
    def test_v1_rows_land_in_their_block_unchanged(self):
        old = _old()
        doc = upgrade(old, as_baseline=True)
        local, remote = get_block(doc, "latency.local"), get_block(doc, "latency.remote")
        assert get_block(doc, "peak_mem") is None
        assert local["env"] == {
            "kind": "local", "git_hash": OLD_HASH, "timestamp": OLD_TS, "python": "3.12.3",
            "nnsight": "0.6.3", "transformers": "4.55.4", "torch": "2.9.0+cpu",
        }
        assert remote["env"] == {
            "kind": "remote", "git_hash": OLD_HASH, "timestamp": OLD_TS, "nnsight": "0.6.3", "remote_server": "unknown",
        }
        assert local["meta_params"] == remote["meta_params"] == {"n_repeat": 10, "n_warmup": 3}
        for kind, block in (("local", local), ("remote", remote)):
            assert len(block["runs"]) == len(old["results"][kind])
            by_id = {slot_id(s): s for s in block["runs"]}
            for row in old["results"][kind]:
                expected = dict(row["latency"])
                if kind == "remote":
                    expected["breakdown"] = row["latency_breakdown"]
                slot = by_id[slot_id(row)]
                assert slot["stats"] == expected
                assert slot["status"] == "ok" and set(slot) == {"tool", "model", "params", "status", "stats"}

    def test_promote_adds_placeholders_keeps_values(self):
        base = load_baseline(OLD_RESULTS)
        new, changes = promote(None, base, config_slots())
        assert changes == []
        local = get_block(new, "latency.local")
        assert slot_counts(local) == {"current": 12, "stale": 0, "failed": 0, "unsupported": 0, "not_run": 15}
        assert slot_counts(get_block(new, "latency.remote"))["current"] == 24
        assert slot_counts(get_block(new, "peak_mem")) == {"current": 0, "stale": 0, "failed": 0, "unsupported": 0, "not_run": 9}
        for block in ("latency.local", "latency.remote"):
            old_by = {slot_id(s): s for s in get_block(base, block)["runs"]}
            for slot in get_block(new, block)["runs"]:
                if slot_id(slot) in old_by:
                    assert slot == old_by[slot_id(slot)]

    def test_kind_first_formats(self):
        kind_first_base = {
            "local": {
                "current": {"env": {"git_hash": "x", "dirty": False, "gpu": "G"},
                            "latency": {"meta_params": LAT_META, "runs": [{"tool": "t", "model": "m", "params": {"prompt_length": 1},
                                                                           "local": {**_stats(0.1), "last_change": {"delta": 1}}}]},
                            "peak_mem": {"meta_params": PEAK_META, "runs": [{"tool": "p", "model": "m", "params": {}, **_peak_stats({"10%": 3})}]}},
                "stale": [{"env": {"git_hash": "old"}, "latency": {"meta_params": {}, "runs": [
                    {"tool": "t", "model": "m", "params": {"prompt_length": 2}, "local": _stats(0.2)}]}, "peak_mem": {"meta_params": {}, "runs": []}}],
            },
            "remote": {"current": None, "stale": []},
        }
        doc = upgrade(kind_first_base, as_baseline=True)
        local = get_block(doc, "latency.local")
        assert local["env"] == {"kind": "local", "git_hash": "x", "dirty": False, "gpu": "G"}
        s1 = _slot(doc, "latency.local", "t", "m", {"prompt_length": 1})
        assert s1["stats"] == _stats(0.1) and s1["last_change"] == {"delta": 1}
        s2 = _slot(doc, "latency.local", "t", "m", {"prompt_length": 2})
        assert s2["stale"] is True and s2["env"] == {"kind": "local", "git_hash": "old"}
        peak = _slot(doc, "peak_mem", "p", "m", {})
        assert peak["stats"] == _peak_stats({"10%": 3})
        assert get_block(doc, "peak_mem")["meta_params"] == PEAK_META
        assert get_block(doc, "latency.remote") is None

        kind_first_run = {"local": kind_first_base["local"]["current"], "remote": None}
        run = upgrade(kind_first_run, as_baseline=False)
        assert _slot(run, "latency.local", "t", "m", {"prompt_length": 1})["stats"] == _stats(0.1)

    def test_current_format_round_trips(self, tmp_path):
        doc, _ = promote(None, load_baseline(OLD_RESULTS), config_slots())
        save_json(tmp_path / "b.json", doc)
        assert load_baseline(tmp_path / "b.json") == doc

    def test_old_file_names_still_load(self, tmp_path, monkeypatch):
        monkeypatch.setattr(store, "BASELINE_FILE", tmp_path / "baseline.json")
        monkeypatch.setattr(store, "LEGACY_BASELINE_FILE", tmp_path / "results.json")
        monkeypatch.setattr(store, "RUN_FILE", tmp_path / "run.json")
        monkeypatch.setattr(store, "LEGACY_RUN_FILE", tmp_path / "latest.json")
        (tmp_path / "results.json").write_text(OLD_RESULTS.read_text())
        (tmp_path / "latest.json").write_text(OLD_RESULTS.read_text())
        assert get_block(load_baseline(), "latency.local")["env"]["git_hash"] == OLD_HASH
        assert get_block(load_run(), "latency.remote")["env"]["git_hash"] == OLD_HASH


class TestCorruptFiles:
    @pytest.mark.parametrize("bad", ['{"latency": {', "<<<<<<< HEAD\n{}\n=======\n{}\n>>>>>>> x\n", ""])
    def test_corrupt_baseline_aborts_and_is_untouched(self, tmp_path, bad):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        base.write_text(bad)
        save_json(run, _doc(local=_block(_env("new"), [_lat("t", "m", 1, 0.1)])))
        with pytest.raises(CorruptResultsError, match="baseline.json"):
            promote_files(run, base)
        with pytest.raises(CorruptResultsError):
            print_diff(run, base)
        assert base.read_text() == bad

    def test_corrupt_run_aborts_and_is_untouched(self, tmp_path):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        save_json(base, load_baseline(OLD_RESULTS))
        before = base.read_text()
        run.write_text('{"latency": {"local"')
        with pytest.raises(CorruptResultsError, match="run.json"):
            promote_files(run, base)
        with pytest.raises(CorruptResultsError):
            print_results(run)
        assert run.read_text() == '{"latency": {"local"' and base.read_text() == before

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
    """Old v1 baseline whose local block was re-promoted (old local slots went stale), and a run."""
    base, _ = promote(
        _doc(
            local=_block(_env("prev123", torch="2.10"), [_lat(LL, GPT2, 50, 0.06)]),
            peak=_block(_env("prev123", torch="2.10"), [_peak(GEMMA, {"10%": 14, "25%": 36, "50%": 72}),
                                                        _peak(GPT2, {"10%": None, "25%": 24, "50%": 69})], PEAK_META),
        ),
        load_baseline(OLD_RESULTS),
    )
    _slot(base, "latency.local", "activation_patching[length]", GPT2, {"prompt_length": 10})["last_change"] = {
        "from": {"value": 0.041, "git_hash": "e0e0e0e", "timestamp": "2026-01-01T00:00:00+0000"},
        "to": {"value": 0.025, "git_hash": OLD_HASH, "timestamp": OLD_TS}, "delta": -0.016, "pct": -39.0,
    }
    _slot(base, "peak_mem", "logit_lens", GPT2, {})["last_change"] = {
        "from": {"value": {"max_prompt_length": {"10%": 10}, "capped": [], "footprint_bytes": 1}, "git_hash": "a", "timestamp": "t"},
        "to": {"value": {"max_prompt_length": {"10%": 17}, "capped": [], "footprint_bytes": 1}, "git_hash": "b", "timestamp": "t"},
        "delta": {"10%": 7}, "pct": {"10%": 70.0},
    }
    run = _doc(
        local=_block(_env("new5678"), [
            _lat(LL, GPT2, 25, 0.02), _lat(LL, GPT2, 50, 0.05), _lat("j_lens[length]", GPT2, 25, 0.03),
            {**_lat("j_lens[length]", LLAMA, 25, status="failed"), "error": "RuntimeError: boom"},
            _lat(LL, LLAMA, 10),
        ]),
        remote=_block(_env("new5678", kind="remote"), [_lat(LL, GPT2, 25, 0.4, remote=True)]),
        peak=_block(_env("new5678"), [
            _peak(GEMMA, {"10%": 15, "25%": 36, "50%": 4096}, capped=["50%"]),
            _peak(LLAMA, {"10%": 190, "25%": 480, "50%": 960}),
            _peak(GPT2),
        ], PEAK_META),
    )
    paths = {"baseline": tmp_path / "baseline.json", "run": tmp_path / "run.json"}
    save_json(paths["baseline"], base)
    save_json(paths["run"], run)
    return paths


class TestRendering:
    def test_show_both_dimensions(self, files, capsys):
        print_results(files["run"], detail=True)
        out = capsys.readouterr().out
        assert "[LOCAL]" in out and "[REMOTE (unqueued)]" in out
        assert "PEAK MEMORY" in out
        assert ">=4096" in out and "OOM" in out and "1000.0MiB" in out
        assert "latency.local new5678" in out and "latency.remote new5678" in out

    def test_setup_line_reads_block_env(self, files, capsys):
        print_results(files["run"], dims=["peak_mem"])
        assert "Setup:  local, bfloat16, autocast, swept=prompt_length, repeat=3" in capsys.readouterr().out

    def test_not_run_hidden_failed_summarized(self, files, capsys):
        print_results(files["run"], dims=["latency"], remote=False)
        out = capsys.readouterr().out
        assert "latency.local: 3 measured; 1 not run, 1 failed" in out
        assert "boom" not in out
        print_results(files["run"], dims=["latency"], remote=False, detail=True)
        assert "failed: j_lens[length] | meta-llama/Llama-3.1-8B | prompt_length=25 — RuntimeError: boom" in capsys.readouterr().out

    def test_show_one_dimension(self, files, capsys):
        print_results(files["run"], dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "PEAK MEMORY" in out and "[LOCAL]" not in out
        print_results(files["run"], remote=True)
        out = capsys.readouterr().out
        assert "PEAK MEMORY" not in out and "[REMOTE (unqueued)]" in out

    def test_null_threshold_shown(self, files, capsys):
        save_json(files["run"], _doc(peak=_block(_env(), [_peak(GPT2, {"10%": None, "25%": 24})], PEAK_META)))
        print_results(files["run"], dims=["peak_mem"])
        assert "<2" in capsys.readouterr().out

    def test_latency_sources(self, files):
        rows = {(r["section"], r["tool"], r["params"]["prompt_length"]): r
                for r in compute_diff(files["run"], files["baseline"])}
        assert rows[("local", LL, 50)]["source"] == "current" and rows[("local", LL, 50)]["old_mean"] == 0.06
        assert rows[("local", LL, 25)]["source"] == OLD_STALE
        assert rows[("remote", LL, 25)]["source"] == "current"
        assert rows[("local", "j_lens[length]", 25)]["status"] == "new"
        assert len(rows) == 4

    def test_with_previous(self, files):
        rows = compute_diff(files["run"], files["baseline"], with_previous=True)
        cached = [r for r in rows if r["source"] and r["source"].startswith("last change")]
        assert [r["tool"] for r in cached] == ["activation_patching[length]"]
        assert cached[0]["source"] == "last change -39.0% (e0e0e0e → f66305c)"
        live = next(r for r in rows if r["tool"] == LL and r["params"] == {"prompt_length": 50})
        assert live["source"] == "current" and live["old_mean"] == 0.06

    def test_peak_diff(self, files, capsys):
        rows = {r["model"]: r for r in compute_peak_diff(files["run"], files["baseline"])}
        assert rows[GEMMA]["status"] == "changed" and rows[GEMMA]["source"] == "current"
        assert rows[LLAMA]["status"] == "new"
        assert GPT2 not in rows

        rows = {r["model"]: r for r in compute_peak_diff(files["run"], files["baseline"], with_previous=True)}
        assert rows[GPT2]["source"] == "last change (a → b)"
        assert rows[GPT2]["new"]["max_prompt_length"] == {"10%": 17}

        print_diff(files["run"], files["baseline"])
        out = capsys.readouterr().out
        assert "14 -> 15 (+1)" in out and "72 -> >=4096 (+4024)" in out
        assert "BENCHMARK DIFF" in out and OLD_STALE in out

    def test_env_mismatch_warning_per_block(self, files, capsys):
        warnings = comparison_warnings(files["run"], files["baseline"])
        local_current = next(w for w in warnings if w.startswith("latency.local vs current: "))
        assert "torch: 2.10 -> 2.11" in local_current
        assert any(w.startswith(f"latency.local vs {OLD_STALE}: ") and "transformers: 4.55.4 -> -" in w for w in warnings)
        remote = next(w for w in warnings if w.startswith("latency.remote vs current: "))
        assert "nnsight: 0.6.3 -> 0.8" in remote and "remote_server: unknown ->" in remote
        assert "torch" not in remote and "gpu" not in remote
        assert any(w.startswith("peak_mem vs current: ") for w in warnings)
        assert not any("git_hash" in w for w in warnings)

        print_diff(files["run"], files["baseline"])
        assert "WARNING: comparing across different environments" in capsys.readouterr().out
        assert "> **Warning:** comparing across different environments" in markdown_diff(files["run"], files["baseline"])

    def test_markdown(self, files):
        md = markdown_results(files["run"], detail=True)
        assert "## PEAK MEMORY (local GPU)" in md
        assert "| prompt_length | Peak | % footprint | Mean | Std |" in md
        assert "## Not in the tables" in md
        md = markdown_diff(files["run"], files["baseline"])
        assert "| 🟢 | google/gemma-3-1b-pt |" in md
        assert "| Params | Baseline | Current | Delta | vs |" in md
        assert "🆕" in md

    def test_plots_smoke(self, files):
        pytest.importorskip("matplotlib")
        assert "data:image/png" in markdown_results(files["run"], plots=True)
        assert "data:image/png" in markdown_diff(files["run"], files["baseline"], plots=True)
