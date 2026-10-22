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
from tests.benchmark import runner as bench_runner
from tests.benchmark import store
from tests.benchmark.config import ToolRegistry, UnsupportedTest
from tests.benchmark.definitions import BenchmarkDefinition, DefinitionError
from tests.benchmark.diff import (
    Comparison,
    markdown_diff,
    markdown_results,
    print_diff,
    print_results,
)
from tests.benchmark.meters import LocalLatency, Meter, PeakMemory, RemoteLatency
from tests.benchmark.runner import BenchmarkRunner, run_benchmark, run_individual
from tests.benchmark.store import (
    CorruptResultsError,
    Result,
    ResultsStore,
    UnknownFormatError,
)
from tests.benchmark.sweeps import GridSweep, ThresholdSearch

OLD_RESULTS = Path(__file__).parent / "fixtures" / "results_v1.json"
OLD_HASH = "f66305ccbe2b543fe3f58715e8806dcf01d0c03c"
OLD_TS = "2026-04-23T19:28:25-0400"
MIB = 2**20
GPT2, GEMMA, LLAMA = (
    "openai-community/gpt2",
    "google/gemma-3-1b-pt",
    "meta-llama/Llama-3.1-8B",
)
L70, L405 = "meta-llama/Llama-3.1-70B", "meta-llama/Llama-3.1-405B-Instruct"
LL = "logit_lens[length]"


def _old() -> dict:
    return json.loads(OLD_RESULTS.read_text())


def _stats(mean: float, remote: bool = False) -> dict:
    stats = {"mean": mean, "std": 0.0, "min": mean, "max": mean, "samples": [mean]}
    if remote:
        stats["breakdown"] = {
            p: dict(stats) for p in ("total", "total_unqueued", "running", "download")
        }
    return stats


def _env(
    git_hash: str = "aaaaaaa111", kind: str = "local", day: str = "2026-10-08", **extra
) -> dict:
    env = {
        "kind": kind,
        "git_hash": git_hash,
        "dirty": False,
        "timestamp": f"{day}T10:00:00+0000",
        "nnsight": "0.8",
    }
    if kind == "local":
        env.update(torch="2.11", gpu="GPU", dtype="bfloat16", autocast=True)
    else:
        env["remote_server"] = {"packages": {"ndif": "1.0"}}
    env.update(extra)
    return env


def _peak_stats(lengths: dict, capped=(), footprint=1000 * MIB, padding=None) -> dict:
    """Peak stats; with *padding*, in the padded format (footprint = weights + it)."""
    sizes = {"footprint_bytes": footprint}
    if padding is not None:
        sizes = {
            "footprint_bytes": footprint + padding,
            "weights_bytes": footprint,
            "padding_bias": padding,
        }
    return {
        **sizes,
        "context_cap": 4096,
        "max_prompt_length": lengths,
        "capped": list(capped),
        "points": [
            {
                "prompt_length": 2,
                "peak_bytes": 20 * MIB,
                "pct": 2.0,
                "latency": _stats(0.01),
            },
            {
                "prompt_length": 4,
                "peak_bytes": 40 * MIB,
                "pct": 4.0,
                "latency": _stats(0.02),
            },
            {"prompt_length": 8, "peak_bytes": None, "pct": None, "oom": True},
        ],
    }


def _lat(tool: str, model: str, n: int, mean: float, remote: bool = False) -> dict:
    return {
        "tool": tool,
        "model": model,
        "params": {"prompt_length": n},
        "stats": _stats(mean, remote),
    }


def _pk(model: str, lengths: dict, tool: str = "logit_lens", **kw) -> dict:
    return {
        "tool": tool,
        "model": model,
        "params": {},
        "stats": _peak_stats(lengths, **kw),
    }


def _bench(
    name: str,
    version: int = 1,
    kind: str = "local",
    dimension: str = "latency",
    config_hash="h1",
) -> dict:
    return {
        "name": name,
        "version": version,
        "config_hash": config_hash,
        "kind": kind,
        "dimension": dimension,
    }


def _result(
    name="local_latency",
    results=(),
    env=None,
    version=1,
    failed=(),
    optional_failed=(),
    kind="local",
    dimension="latency",
    config_hash="h1",
    meta=None,
) -> dict:
    return {
        "benchmark": _bench(name, version, kind, dimension, config_hash),
        "status": "incomplete" if failed else "complete",
        "env": env or _env(kind=kind),
        "meta_params": meta or {"n_repeat": 3, "n_warmup": 3},
        "results": list(results),
        "failed": list(failed),
        "optional_failed": list(optional_failed),
    }


def _fail(tool, model, n, status="failed", error="RuntimeError: boom") -> dict:
    return {
        "tool": tool,
        "model": model,
        "params": {"prompt_length": n},
        "status": status,
        "error": error,
    }


def _defn(**over) -> dict:
    d = {
        "name": "fake_latency",
        "version": 1,
        "kind": "local",
        "dimension": "latency",
        "meta_params": {"n_repeat": 1, "n_warmup": 0},
        "models": ["org/a", "org/b"],
        "tools": [
            {
                "tool": "fake",
                "name": "fake[length]",
                "fixed_args": {},
                "sweep": {"prompt_length": [1, 2]},
            }
        ],
    }
    d.update(over)
    return d


# ---------------------------------------------------------------------------
# Definitions
# ---------------------------------------------------------------------------


class TestDefinitions:
    def test_shipped_definitions(self):
        defs = BenchmarkDefinition.load_all()
        assert set(defs) == {"local_latency", "remote_latency", "peak_mem"}
        assert {n: d["version"] for n, d in defs.items()} == {
            "local_latency": 1,
            "remote_latency": 1,
            "peak_mem": 1,
        }
        assert defs["peak_mem"]["meta_params"]["padding_bias"] == 500 * MIB
        assert BenchmarkRunner.DEFAULT_PADDING_BIAS == 500 * MIB
        counts = {n: len(BenchmarkDefinition.of(d).tests()) for n, d in defs.items()}
        assert counts == {"local_latency": 27, "remote_latency": 36, "peak_mem": 9}
        assert defs["local_latency"]["models"] == [GPT2, GEMMA, LLAMA]
        assert defs["remote_latency"]["models"] == [GPT2, LLAMA, L70, L405]
        assert {
            t["tool"] for t in BenchmarkDefinition.of(defs["local_latency"]).tests()
        } == {
            LL,
            "activation_patching[length]",
            "j_lens[length]",
        }
        assert {
            t["params"]["prompt_length"]
            for t in BenchmarkDefinition.of(defs["local_latency"]).tests()
        } == {10, 25, 50}

    def test_optional_defaults(self):
        defs = BenchmarkDefinition.load_all()
        assert not any(
            t["optional"]
            for n in ("local_latency", "peak_mem")
            for t in BenchmarkDefinition.of(defs[n]).tests()
        )
        optional = {
            (t["tool"], t["model"])
            for t in BenchmarkDefinition.of(defs["remote_latency"]).tests()
            if t["optional"]
        }
        assert optional == {
            (tool, L405)
            for tool in (LL, "activation_patching[length]", "j_lens[length]")
        } | {("j_lens[length]", L70)}

    def test_archived_v0(self):
        v0 = {d["name"]: d for d in BenchmarkDefinition.load_archive()}
        assert {n: d["version"] for n, d in v0.items()} == {
            "local_latency": 0,
            "remote_latency": 0,
        }
        assert len(BenchmarkDefinition.of(v0["local_latency"]).tests()) == 12
        assert len(BenchmarkDefinition.of(v0["remote_latency"]).tests()) == 24

    @pytest.mark.parametrize("bias", [-1, 1.5, "500MiB", True])
    def test_padding_bias_must_be_non_negative_bytes(self, bias):
        defn = BenchmarkDefinition.load_all()["peak_mem"]
        meta = {**defn["meta_params"], "padding_bias": bias}
        with pytest.raises(DefinitionError, match="padding_bias"):
            BenchmarkDefinition({**defn, "meta_params": meta}).validate()

    def test_padding_bias_is_part_of_the_config_hash(self):
        defn = BenchmarkDefinition.load_all()["peak_mem"]
        meta = {**defn["meta_params"], "padding_bias": 0}
        changed = BenchmarkDefinition({**defn, "meta_params": meta})
        assert changed.config_hash() != defn.config_hash()
        (warning,) = defn.version_warnings([changed.stamp()])
        assert "but its version wasn't bumped" in warning

    @pytest.mark.parametrize(
        "change,match",
        [
            ({"version": -1}, "version"),
            ({"kind": "cloud"}, "kind"),
            ({"dimension": "peak_mem", "kind": "remote"}, "local only"),
            ({"models": []}, "models"),
            ({"optional_models": ["org/zzz"]}, "optional model"),
            (
                {
                    "tools": [
                        {
                            "tool": "fake",
                            "sweep": {"prompt_length": [1]},
                            "optional": ["org/zzz"],
                        }
                    ]
                },
                "optional",
            ),
            ({"tools": [{"tool": "fake"}]}, "sweep"),
        ],
    )
    def test_validation(self, change, match):
        with pytest.raises(DefinitionError, match=match):
            BenchmarkDefinition(_defn(**change)).validate()
        with pytest.raises(DefinitionError, match="missing"):
            BenchmarkDefinition(
                {k: v for k, v in _defn().items() if k != "models"}
            ).validate()

    def test_directory_checks(self, tmp_path):
        ResultsStore.save_json(tmp_path / "a.json", _defn(name="a"))
        ResultsStore.save_json(tmp_path / "b.json", _defn(name="b"))
        with pytest.raises(
            DefinitionError, match="already is the local latency benchmark"
        ):
            BenchmarkDefinition.load_all(tmp_path)
        (tmp_path / "b.json").write_text("{nope")
        with pytest.raises(DefinitionError, match="not valid JSON"):
            BenchmarkDefinition.load_all(tmp_path)

    def test_config_hash_and_version_warning(self):
        d = _defn()
        assert (
            BenchmarkDefinition(d).config_hash()
            == BenchmarkDefinition(
                {**d, "version": 7, "description": "x"}
            ).config_hash()
        )
        assert (
            BenchmarkDefinition(d).config_hash()
            != BenchmarkDefinition({**d, "models": ["org/a"]}).config_hash()
        )
        changed = {**d, "models": ["org/a"]}
        assert BenchmarkDefinition.of(changed).version_warnings(
            [BenchmarkDefinition.of(d).stamp()]
        )
        assert (
            "version wasn't bumped"
            in BenchmarkDefinition.of(changed).version_warnings(
                [BenchmarkDefinition.of(d).stamp()]
            )[0]
        )
        assert (
            BenchmarkDefinition.of({**changed, "version": 2}).version_warnings(
                [BenchmarkDefinition.of(d).stamp()]
            )
            == []
        )
        assert (
            BenchmarkDefinition.of(d).version_warnings(
                [BenchmarkDefinition.of(d).stamp()]
            )
            == []
        )

    def test_optional_markers(self):
        d = _defn(
            optional_models=["org/b"],
            tools=[
                {
                    "tool": "fake",
                    "name": "x",
                    "sweep": {"prompt_length": [1]},
                    "optional": True,
                },
                {
                    "tool": "fake",
                    "name": "y",
                    "sweep": {"prompt_length": [1]},
                    "optional": ["org/a"],
                },
                {"tool": "fake", "name": "z", "sweep": {"prompt_length": [1]}},
            ],
        )
        opt = {
            (t["tool"], t["model"]): t["optional"]
            for t in BenchmarkDefinition.of(d).tests()
        }
        assert opt == {
            ("x", "org/a"): True,
            ("x", "org/b"): True,
            ("y", "org/a"): True,
            ("y", "org/b"): True,
            ("z", "org/a"): False,
            ("z", "org/b"): True,
        }


# ---------------------------------------------------------------------------
# Running whole benchmarks, status, individual tests
# ---------------------------------------------------------------------------


class _FakeModel:
    dispatched = True

    def __init__(self, repo_id):
        self.repo_id = repo_id

    def to_model_key(self):
        return f"key:{self.repo_id}"


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
    """Registers a ``fake`` tool and a fixed env; returns a failure-mode setter."""
    monkeypatch.setattr(BenchmarkRunner, "env", lambda self: _env("run1234"))
    monkeypatch.setattr(ResultsStore, "recorded_stamps", lambda self, name: [])

    def setup(fail_on=None, unsupported=None):
        monkeypatch.setitem(
            ToolRegistry.TOOLS, "fake", (_fake_tool(fail_on), _fake_build(unsupported))
        )

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
        assert result["benchmark"] == BenchmarkDefinition.of(_defn()).stamp()
        assert result["env"]["git_hash"] == "run1234"
        assert ResultsStore(run=tmp_path / "run.json").load_run() == {
            "fake_latency": result
        }

    def test_failed_test_makes_incomplete_without_aborting(self, fake, tmp_path):
        fake(fail_on=("org/a", 2))
        result = run_benchmark(_defn(), _loader(), tmp_path / "run.json")
        assert result["status"] == "incomplete"
        assert [(f["model"], f["params"], f["status"]) for f in result["failed"]] == [
            ("org/a", {"prompt_length": 2}, "failed")
        ]
        assert "boom" in result["failed"][0]["error"]
        assert len(result["results"]) == 3

    def test_optional_failures_keep_complete(self, fake, tmp_path):
        fake(fail_on=("org/b", 1), unsupported="org/b")
        result = run_benchmark(
            _defn(optional_models=["org/b"]), _loader(), tmp_path / "run.json"
        )
        assert result["status"] == "complete"
        assert result["failed"] == []
        assert {f["status"] for f in result["optional_failed"]} == {"unsupported"}
        assert len(result["optional_failed"]) == 2

    def test_unsupported_and_load_failure_are_failures(self, fake, tmp_path):
        fake(unsupported="org/a")
        result = run_benchmark(
            _defn(), _loader(fail_model="org/b"), tmp_path / "run.json"
        )
        assert result["status"] == "incomplete"
        by_model = {}
        for f in result["failed"]:
            by_model.setdefault(f["model"], set()).add(f["status"])
        assert by_model == {"org/a": {"unsupported"}, "org/b": {"failed"}}
        assert all(
            "model load" in f["error"]
            for f in result["failed"]
            if f["model"] == "org/b"
        )

    def test_interrupted_run_is_incomplete(self):
        result = Result.make(
            _defn(),
            _env(),
            {},
            [
                {
                    "tool": "fake[length]",
                    "model": "org/a",
                    "params": {"prompt_length": 1},
                    "status": "ok",
                    "stats": _stats(0.1),
                }
            ],
        )
        assert result["status"] == "incomplete"
        assert {f["status"] for f in result["failed"]} == {"not_run"} and len(
            result["failed"]
        ) == 3

    def test_real_j_lens_without_lens_does_not_abort(self, fake, monkeypatch):
        monkeypatch.setattr(
            bench_config.JLensTool, "get_available_lenses", classmethod(lambda cls: {})
        )
        defn = _defn(
            tools=[
                {
                    "tool": "j_lens",
                    "name": "j_lens[length]",
                    "fixed_args": {},
                    "sweep": {"prompt_length": [1]},
                }
            ]
        )
        runner = BenchmarkRunner.for_definition(defn)
        outcomes = runner.run_tests(
            defn, "org/a", _loader(), ToolRegistry.configs(defn)
        )
        assert [o["status"] for o in outcomes] == ["unsupported"]

    def test_all_vs_subset(self, monkeypatch):
        defs = BenchmarkDefinition.load_all()
        monkeypatch.setattr(sys, "argv", ["bench", "--all"])
        assert [d["name"] for d in cli._selected(cli._parse_args(), defs)] == list(defs)
        monkeypatch.setattr(sys, "argv", ["bench", "--benchmarks", "peak_mem"])
        assert [d["name"] for d in cli._selected(cli._parse_args(), defs)] == [
            "peak_mem"
        ]
        monkeypatch.setattr(sys, "argv", ["bench", "--benchmarks", "nope"])
        with pytest.raises(SystemExit):
            cli._selected(cli._parse_args(), defs)

    @pytest.mark.parametrize(
        "argv",
        [
            ["bench"],
            ["bench", "--model", "gpt2", "--promote"],
            ["bench", "--all", "--repeat", "5"],
            ["bench", "--all", "--padding-bias", "0"],
            ["bench", "--benchmarks", "peak_mem", "--padding-bias", "500MiB"],
            ["bench", "--model", "gpt2", "--padding-bias", "-1"],
            ["bench", "--model", "gpt2", "--padding-bias", "lots"],
            ["bench", "--all", "--show"],
        ],
    )
    def test_cli_rejects(self, monkeypatch, argv):
        monkeypatch.setattr(sys, "argv", argv)
        with pytest.raises(SystemExit):
            cli._parse_args()

    def test_padding_override_for_individual_tests(self, monkeypatch):
        seen = []

        def fake_run(defn, load_model, **kwargs):
            seen.append(kwargs)

        monkeypatch.setattr(bench_runner, "run_individual", fake_run)
        argv = ["bench", "--benchmarks", "peak_mem", "--model", "gpt2"]
        for flag, expected in (("0", 0), ("1234", 1234), ("500MiB", 500 * MIB)):
            monkeypatch.setattr(sys, "argv", [*argv, "--padding-bias", flag])
            cli._run_individual(cli._parse_args(), BenchmarkDefinition.load_all())
            assert seen[-1]["padding_bias"] == expected
        monkeypatch.setattr(sys, "argv", argv)
        cli._run_individual(cli._parse_args(), BenchmarkDefinition.load_all())
        assert seen[-1]["padding_bias"] is None

    def test_param_parsing(self):
        assert cli._parse_param("prompt_length=10,25") == ("prompt_length", [10, 25])

    def test_individual_tests_print_and_write_nothing(
        self, fake, tmp_path, monkeypatch, capsys
    ):
        monkeypatch.chdir(tmp_path)
        before = sorted(p.name for p in store.BENCH_DIR.iterdir())
        result = run_individual(
            _defn(), _loader(), models=["org/a"], params={"prompt_length": [5]}
        )
        assert [(r["model"], r["params"]) for r in result["results"]] == [
            ("org/a", {"prompt_length": 5})
        ]
        assert result["benchmark"]["individual"] is True
        print_results(
            {
                "fake_latency": {
                    **result,
                    "benchmark": {
                        **result["benchmark"],
                        "dimension": "latency",
                        "kind": "local",
                    },
                }
            }
        )
        out = capsys.readouterr().out
        assert "[LOCAL]" in out and "fake[length]" in out
        assert sorted(p.name for p in store.BENCH_DIR.iterdir()) == before
        assert list(tmp_path.iterdir()) == []


def _oom(message="CUDA out of memory. Tried to allocate 2.00 GiB"):
    import torch

    return torch.OutOfMemoryError(message)


class _FakeCounter:
    def __init__(self, key):
        self.key = key

    def get_latency(self):
        return {"total": 3.0, "total_unqueued": 2.0, "running": 1.5, "download": 0.25}


class TestMeters:
    def test_local_latency(self):
        meter = LocalLatency()
        for _ in range(3):
            with meter as extra:
                assert extra == {}
        assert len(meter.samples) == 3 and not meter.oom
        assert set(meter.stats()) == {"mean", "std", "min", "max", "samples"}

    def test_oom_is_recorded_and_suppressed(self):
        meter = LocalLatency()
        with meter:
            raise _oom()
        assert meter.oom and meter.samples == []
        wrapped = LocalLatency()
        with wrapped:
            try:
                raise _oom()
            except Exception as inner:
                raise RuntimeError("nnsight wrapper") from inner
        assert wrapped.oom and isinstance(wrapped.oom_error, RuntimeError)

    def test_other_errors_propagate(self):
        meter = LocalLatency()
        with pytest.raises(ValueError):
            with meter:
                raise ValueError("boom")
        assert not meter.oom

    def test_remote_latency_injects_backend(self):
        meter = RemoteLatency(_FakeModel("org/a"), counter_factory=_FakeCounter)
        with meter as extra:
            mode = extra["exec_mode"]
            assert mode["remote"] is True and mode["backend"].key == "key:org/a"
        with meter as extra2:
            assert extra2["exec_mode"]["backend"] is not mode["backend"]
        stats = meter.stats()
        assert stats["mean"] == 2.0 and stats["samples"] == [2.0, 2.0]
        assert set(stats["breakdown"]) == {
            "total",
            "total_unqueued",
            "running",
            "download",
        }
        assert stats["breakdown"]["running"]["mean"] == 1.5

    def test_peak_memory(self, monkeypatch):
        import torch

        state = {"allocated": 100, "peak": 0}
        monkeypatch.setattr(torch.cuda, "is_available", lambda: True)
        monkeypatch.setattr(torch.cuda, "synchronize", lambda: None)
        monkeypatch.setattr(torch.cuda, "empty_cache", lambda: None)
        monkeypatch.setattr(torch.cuda, "memory_allocated", lambda: state["allocated"])
        monkeypatch.setattr(
            torch.cuda,
            "reset_peak_memory_stats",
            lambda: state.update(peak=state["allocated"]),
        )
        monkeypatch.setattr(torch.cuda, "max_memory_allocated", lambda: state["peak"])
        meter = PeakMemory()
        with meter:
            state["peak"] = 1100
        assert meter.peak == 1000
        oom = PeakMemory()
        with oom:
            raise _oom()
        assert oom.oom and oom.peak is None


class TestRemoteBackendCounter:
    """The counter hooks the method nnsight routes every status update through."""

    def _counter(self, monkeypatch, clock):
        from nnsight.intervention.backends.remote import RemoteBackend

        from tests.benchmark import backend

        monkeypatch.setattr(backend.time, "time", lambda: clock[0])
        monkeypatch.setattr(RemoteBackend, "__init__", lambda self, *a, **k: None)
        monkeypatch.setattr(RemoteBackend, "handle", lambda self, response: "result")
        return backend.RemoteBackendCounter("model-key")

    def test_overrides_nnsights_status_hook(self):
        from nnsight.intervention.backends.remote import RemoteBackend

        from tests.benchmark.backend import RemoteBackendCounter

        assert hasattr(RemoteBackend, "handle")
        assert RemoteBackendCounter.handle is not RemoteBackend.handle

    def test_phases_exclude_queue_time(self, monkeypatch):
        from types import SimpleNamespace

        from nnsight.schema.response import Status

        clock = [100.0]
        counter = self._counter(monkeypatch, clock)
        timeline = [
            (101.0, Status.RECEIVED),
            (102.0, Status.QUEUED),
            (110.0, Status.DISPATCHED),
            (111.0, Status.RUNNING),
            (114.0, Status.COMPLETED),
        ]
        for t, status in timeline:
            clock[0] = t
            assert counter.handle(SimpleNamespace(status=status)) == "result"
        clock[0] = 115.0

        latency = counter.get_latency()
        assert latency["total"] == pytest.approx(15.0)
        assert latency["total_unqueued"] == pytest.approx(7.0)
        assert latency["running"] == pytest.approx(3.0)
        assert latency["download"] == pytest.approx(1.0)


class TestSweeps:
    def test_grid_points(self):
        grid = GridSweep({"prompt_length": [10, 25], "top_k": [1, 5]})
        assert grid.points() == [
            {"prompt_length": 10, "top_k": 1},
            {"prompt_length": 10, "top_k": 5},
            {"prompt_length": 25, "top_k": 1},
            {"prompt_length": 25, "top_k": 5},
        ]

    def test_threshold_search(self):
        found = ThresholdSearch(1000, (0.1, 0.5), 10_000, 2).run(lambda n: n)
        assert found.max_lengths == {"10%": 100, "50%": 500}


class _FakePeak:
    """Peak = 10 bytes per prompt token; OOM from ``oom_from`` tokens on."""

    entered: list[int] = []
    oom_from: int | None = None

    def __init__(self):
        self.peak, self.oom, self.oom_error = None, False, None

    def __enter__(self):
        return {}

    def __exit__(self, exc_type, exc, tb):
        n = _FakePeak.current
        _FakePeak.entered.append(n)
        if _FakePeak.oom_from is not None and n >= _FakePeak.oom_from:
            self.oom, self.oom_error = True, _oom()
        else:
            self.peak = 10 * n
        return False


class TestRunLoop:
    def _peak_runner(self, monkeypatch, oom_from=None, n_repeat=2, padding=0):
        monkeypatch.setattr(bench_runner, "PeakMemory", _FakePeak)
        monkeypatch.setattr(
            BenchmarkRunner, "model_weights", staticmethod(lambda model: 1000)
        )
        monkeypatch.setattr(
            BenchmarkRunner, "context_length", staticmethod(lambda model: None)
        )
        _FakePeak.entered, _FakePeak.oom_from = [], oom_from
        return BenchmarkRunner(
            n_repeat=n_repeat,
            n_warmup=1,
            autocast=False,
            thresholds=(0.1, 0.5),
            max_length=256,
            padding_bias=padding,
        )

    def _peak_config(self, calls):
        def tool(model, n=0, **kwargs):
            _FakePeak.current = n
            calls.append(n)

        def build(model, fixed, sweep):
            return {"n": sweep["prompt_length"]}

        return bench_config.ToolBenchmarkConfig("fake", tool, build_args=build)

    def test_peak_mem_separate_passes(self, monkeypatch):
        runner = self._peak_runner(monkeypatch)
        calls = []
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [self._peak_config(calls)]
        )
        assert outcome["status"] == "ok"
        stats = outcome["stats"]
        assert stats["max_prompt_length"] == {"10%": 10, "50%": 50}
        assert stats["footprint_bytes"] == 1000 and stats["context_cap"] == 256
        assert stats["weights_bytes"] == 1000 and stats["padding_bias"] == 0
        points = {p["prompt_length"]: p for p in stats["points"]}
        assert sorted(_FakePeak.entered) == sorted(points)
        for n, point in points.items():
            assert point["peak_bytes"] == 10 * n and point[
                "pct"
            ] == BenchmarkRunner.peak_pct(10 * n, 1000)
            assert len(point["latency"]["samples"]) == 2
            assert calls.count(n) == 1 + 1 + 2  # warmup, peak, timed repeats

    def test_peak_mem_footprint_includes_padding(self, monkeypatch):
        runner = self._peak_runner(monkeypatch, padding=1000)
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [self._peak_config([])]
        )
        stats = outcome["stats"]
        assert (stats["weights_bytes"], stats["padding_bias"]) == (1000, 1000)
        assert stats["footprint_bytes"] == 2000
        assert stats["max_prompt_length"] == {"10%": 20, "50%": 100}
        for point in stats["points"]:
            assert point["pct"] == BenchmarkRunner.peak_pct(point["peak_bytes"], 2000)

    def test_padding_from_definition(self):
        meta = {"n_repeat": 1, "n_warmup": 0}
        runner = BenchmarkRunner.for_definition(_defn(meta_params=meta))
        assert runner.padding_bias == BenchmarkRunner.DEFAULT_PADDING_BIAS
        defn = _defn(meta_params={**meta, "padding_bias": 123})
        assert BenchmarkRunner.for_definition(defn).padding_bias == 123
        runner = BenchmarkRunner.for_definition(defn, padding_bias=0)
        assert runner.padding_bias == 0
        peak_mem = BenchmarkDefinition.load_all()["peak_mem"]
        runner = BenchmarkRunner.for_definition(peak_mem)
        assert runner.padding_bias == 500 * MIB
        with pytest.raises(ValueError, match="padding_bias"):
            BenchmarkRunner(padding_bias=-1)

    def test_zero_padding_bias_is_weights_only(self, monkeypatch):
        """``padding_bias: 0`` gives the footprint of results recorded before it."""
        runner = self._peak_runner(monkeypatch, padding=0)
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [self._peak_config([])]
        )
        stats = outcome["stats"]
        assert stats["footprint_bytes"] == stats["weights_bytes"] == 1000
        assert stats["max_prompt_length"] == {"10%": 10, "50%": 50}

    def test_peak_mem_oom_points(self, monkeypatch):
        runner = self._peak_runner(monkeypatch, oom_from=40)
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [self._peak_config([])]
        )
        stats = outcome["stats"]
        oom = [p for p in stats["points"] if p.get("oom")]
        assert oom and all(p["peak_bytes"] is None and "latency" not in p for p in oom)
        assert stats["max_prompt_length"] == {"10%": 10, "50%": 39}

    def test_latency_oom_is_a_failed_test(self, fake, monkeypatch):
        def tool(model, n=0, **kwargs):
            if n == 2:
                raise _oom()

        monkeypatch.setitem(ToolRegistry.TOOLS, "fake", (tool, _fake_build()))
        runner = BenchmarkRunner.for_definition(_defn())
        outcomes = runner.run_model(
            "latency", "org/a", _FakeModel("org/a"), ToolRegistry.configs(_defn())
        )
        by_n = {o["params"]["prompt_length"]: o for o in outcomes}
        assert by_n[1]["status"] == "ok" and len(by_n[1]["stats"]["samples"]) == 1
        assert by_n[2]["status"] == "failed" and by_n[2]["error"].startswith(
            "out of memory: "
        )

    def test_remote_calls_get_backend_kwargs(self, fake, monkeypatch):
        from tests.benchmark import backend

        seen = []

        def tool(model, n=0, **kwargs):
            seen.append(kwargs)

        monkeypatch.setattr(backend, "RemoteBackendCounter", _FakeCounter)
        monkeypatch.setitem(ToolRegistry.TOOLS, "fake", (tool, _fake_build()))
        defn = _defn(kind="remote", meta_params={"n_repeat": 2, "n_warmup": 1})
        runner = BenchmarkRunner.for_definition(defn)
        outcomes = runner.run_model(
            "latency", "org/a", _FakeModel("org/a"), ToolRegistry.configs(defn)
        )
        assert all(o["status"] == "ok" for o in outcomes)
        assert len(seen) == 1 + 2 * 2
        assert all(
            k["exec_mode"]["remote"] is True
            and isinstance(k["exec_mode"]["backend"], _FakeCounter)
            for k in seen
        )
        assert outcomes[0]["stats"]["mean"] == 2.0
        assert outcomes[0]["stats"]["breakdown"]["total"]["mean"] == 3.0


class TestMeterSafety:
    def test_oom_frames_released(self):
        import gc
        import weakref

        class Big:
            pass

        refs = []

        def fail():
            big = Big()
            refs.append(weakref.ref(big))
            raise _oom()

        meter = LocalLatency()
        with meter:
            fail()
        gc.collect()
        assert meter.oom and meter.oom_error.__traceback__ is None
        assert refs[0]() is None
        assert Meter.is_oom(meter.oom_error)

    def test_interrupt_with_oom_context_propagates(self):
        meter = LocalLatency()
        with pytest.raises(KeyboardInterrupt):
            with meter:
                try:
                    raise _oom()
                except Exception:
                    raise KeyboardInterrupt
        assert not meter.oom


class _Recorder:
    """Meters that record which kind of call they wrap, in order."""

    events: list[tuple[str, int]] = []
    kind = ""

    class Latency(LocalLatency):
        def _start(self):
            _Recorder.kind = "lat"
            return super()._start()

    class Peak(_FakePeak):
        def __enter__(self):
            _Recorder.kind = "peak"
            return {}


class TestRunLoopDetails(TestRunLoop):
    def _counting_config(self, fail_on=None):
        """A tool failing with OOM on the given ``(n, call index at that n)`` pairs."""
        counts: dict[int, int] = {}

        def tool(model, n=0, **kwargs):
            _FakePeak.current = n
            _Recorder.events.append((_Recorder.kind, n))
            counts[n] = counts.get(n, 0) + 1
            if (n, counts[n]) in (fail_on or ()) or (n, "*") in (fail_on or ()):
                raise _oom()

        def build(model, fixed, sweep):
            return {"n": sweep["prompt_length"]}

        return bench_config.ToolBenchmarkConfig("fake", tool, build_args=build), counts

    def test_call_order_per_point(self, monkeypatch):
        runner = self._peak_runner(monkeypatch)
        monkeypatch.setattr(bench_runner, "LocalLatency", _Recorder.Latency)
        monkeypatch.setattr(bench_runner, "PeakMemory", _Recorder.Peak)
        _Recorder.events = []
        config, _ = self._counting_config()
        runner.run_model("peak_mem", "org/a", _FakeModel("org/a"), [config])
        for n in {n for _, n in _Recorder.events}:
            kinds = [k for k, m in _Recorder.events if m == n]
            assert kinds == ["lat", "peak", "lat", "lat"]

    def test_oom_during_warmup_marks_point(self, monkeypatch):
        runner = self._peak_runner(monkeypatch)
        config, counts = self._counting_config(
            fail_on={(n, "*") for n in range(40, 300)}
        )
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [config]
        )
        points = {p["prompt_length"]: p for p in outcome["stats"]["points"]}
        oom = [n for n, p in points.items() if p.get("oom")]
        assert oom and all(n >= 40 for n in oom)
        assert all(counts[n] == 1 for n in oom)
        assert not set(oom) & set(_FakePeak.entered)

    def test_oom_in_timed_repeats_fails_the_tool(self, monkeypatch):
        runner = self._peak_runner(monkeypatch)
        config, _ = self._counting_config(fail_on={(8, 3)})
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [config]
        )
        assert outcome["status"] == "failed"
        assert outcome["error"].startswith("out of memory: ")

    def test_repeat_stops_at_first_oom(self):
        runner = BenchmarkRunner(autocast=False)
        calls = []

        def tool(model, **kwargs):
            calls.append(1)
            if len(calls) == 2:
                raise _oom()

        meter = runner._repeat(tool, _FakeModel("org/a"), {}, LocalLatency(), 5)
        assert meter.oom and len(calls) == 2 and len(meter.samples) == 1

    def test_autocast_only_for_local_calls(self, monkeypatch):
        import contextlib

        import torch

        seen = []

        def autocast(dtype):
            seen.append(dtype)
            return contextlib.nullcontext()

        monkeypatch.setattr(torch.cuda, "is_available", lambda: True)
        monkeypatch.setattr(torch.cuda, "synchronize", lambda: None)
        monkeypatch.setattr(Meter, "ndif_autocast", staticmethod(autocast))
        local = BenchmarkRunner(dtype="bfloat16")
        local._call(lambda model, **kw: None, _FakeModel("org/a"), {}, LocalLatency())
        remote = BenchmarkRunner(remote=True, dtype="bfloat16")
        meter = RemoteLatency(_FakeModel("org/a"), counter_factory=_FakeCounter)
        remote._call(lambda model, **kw: None, _FakeModel("org/a"), {}, meter)
        assert seen == ["bfloat16", None]

    def test_real_peak_memory_in_the_loop(self, monkeypatch):
        import torch

        state = {"allocated": 500, "peak": 0}
        monkeypatch.setattr(torch.cuda, "is_available", lambda: True)
        monkeypatch.setattr(torch.cuda, "synchronize", lambda: None)
        monkeypatch.setattr(torch.cuda, "empty_cache", lambda: None)
        monkeypatch.setattr(torch.cuda, "memory_allocated", lambda: state["allocated"])
        monkeypatch.setattr(
            torch.cuda,
            "reset_peak_memory_stats",
            lambda: state.update(peak=state["allocated"]),
        )
        monkeypatch.setattr(torch.cuda, "max_memory_allocated", lambda: state["peak"])
        monkeypatch.setattr(
            BenchmarkRunner, "model_weights", staticmethod(lambda model: 1000)
        )
        monkeypatch.setattr(
            BenchmarkRunner, "context_length", staticmethod(lambda model: None)
        )

        def tool(model, n=0, **kwargs):
            state["peak"] = max(state["peak"], state["allocated"] + 10 * n)

        config = bench_config.ToolBenchmarkConfig(
            "fake", tool, build_args=lambda m, f, sw: {"n": sw["prompt_length"]}
        )
        runner = BenchmarkRunner(
            n_repeat=1,
            n_warmup=1,
            autocast=False,
            thresholds=(0.1,),
            max_length=64,
            padding_bias=0,
        )
        (outcome,) = runner.run_model(
            "peak_mem", "org/a", _FakeModel("org/a"), [config]
        )
        stats = outcome["stats"]
        assert stats["max_prompt_length"] == {"10%": 10}
        assert all(p["peak_bytes"] == 10 * p["prompt_length"] for p in stats["points"])


class TestInProgress:
    def _interrupting_loader(self, at: str):
        def load(name):
            if name == at:
                raise KeyboardInterrupt
            return _FakeModel(name)

        return load

    def test_interrupt_leaves_run_json_untouched(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        ResultsStore.save_json(
            run_file,
            {
                "fake_latency": _result(
                    "fake_latency", results=[_lat("fake[length]", "org/a", 1, 9.9)]
                ),
                "other": _result("other"),
            },
        )
        before = run_file.read_bytes()
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert run_file.read_bytes() == before
        partial = ResultsStore(run=ResultsStore(run=run_file).partial_path).load_run()
        entry = partial["fake_latency"]
        assert entry["status"] == "in_progress"
        assert entry["progress"] == {
            "models_done": ["org/a"],
            "models_remaining": ["org/b"],
        }
        assert {
            (r["model"], r["params"]["prompt_length"]) for r in entry["results"]
        } == {("org/a", 1), ("org/a", 2)}
        assert {f["status"] for f in entry["failed"]} == {"not_run"}

    def test_finish_replaces_only_its_entry_and_clears_partial(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        other = _result("other", results=[_lat("t", "m", 1, 0.5)])
        ResultsStore.save_json(
            run_file, {"fake_latency": _result("fake_latency"), "other": other}
        )
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert ResultsStore(run=run_file).partial_path.exists()
        result = run_benchmark(_defn(), _loader(), run_file)
        run = ResultsStore(run=run_file).load_run()
        assert run["fake_latency"] == result and run["other"] == other
        assert not ResultsStore(run=run_file).partial_path.exists()
        assert sorted(p.name for p in tmp_path.iterdir()) == ["run.json"]

    def test_partial_file_keeps_other_interrupted_benchmarks(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(
                _defn(name="other_latency", kind="remote"),
                self._interrupting_loader("org/b"),
                run_file,
            )
        run_benchmark(_defn(), _loader(), run_file)
        assert list(
            ResultsStore(run=ResultsStore(run=run_file).partial_path).load_run()
        ) == ["other_latency"]

    def test_finished_with_failures_is_written_incomplete(self, fake, tmp_path):
        fake(fail_on=("org/b", 1))
        run_benchmark(_defn(), _loader(), tmp_path / "run.json")
        assert (
            ResultsStore(run=tmp_path / "run.json").load_run()["fake_latency"]["status"]
            == "incomplete"
        )
        assert not ResultsStore(run=tmp_path / "run.json").partial_path.exists()

    def test_all_writes_each_benchmark_when_it_finishes(self, fake, tmp_path):
        run_file = tmp_path / "run.json"
        defs = [_defn(), _defn(name="other_latency", kind="remote")]
        loaders = [_loader(), self._interrupting_loader("org/b")]
        with pytest.raises(KeyboardInterrupt):
            for defn, loader in zip(defs, loaders):
                run_benchmark(defn, loader, run_file)
        assert list(ResultsStore(run=run_file).load_run()) == ["fake_latency"]
        assert list(
            ResultsStore(run=ResultsStore(run=run_file).partial_path).load_run()
        ) == ["other_latency"]

    def test_custom_run_path(self):
        assert ResultsStore(run=Path("/x/scratch.json")).partial_path == Path(
            "/x/scratch.partial.json"
        )

    def test_notice_and_show(self, fake, tmp_path, monkeypatch, capsys):
        run_file = tmp_path / "run.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        capsys.readouterr()
        monkeypatch.setattr(sys, "argv", ["bench", "--show", "--run", str(run_file)])
        cli._main()
        out = capsys.readouterr().out
        partial = ResultsStore(run=run_file).partial_path
        assert (
            f"note: interrupted benchmark(s) fake_latency: partial results in {partial}"
            in out
        )
        monkeypatch.setattr(sys, "argv", ["bench", "--show", "--run", str(partial)])
        cli._main()
        out = capsys.readouterr().out
        assert (
            "note:" not in out
            and "fake_latency v1 (in_progress): 2 measured; 2 not run" in out
        )

    def test_promote_refuses_partial(self, fake, tmp_path, capsys):
        run_file, base = tmp_path / "run.json", tmp_path / "baseline.json"
        with pytest.raises(KeyboardInterrupt):
            run_benchmark(_defn(), self._interrupting_loader("org/b"), run_file)
        assert (
            ResultsStore(ResultsStore(run=run_file).partial_path, base).promote()
            is None
        )
        assert "REFUSED" in capsys.readouterr().out and not base.exists()
        in_progress = ResultsStore(
            run=ResultsStore(run=run_file).partial_path
        ).load_run()
        _, promoted, refused = Result.promote(in_progress, None)
        assert promoted == [] and list(refused) == ["fake_latency"]

    def test_atomic_save(self, tmp_path, monkeypatch):
        target = tmp_path / "baseline.json"
        ResultsStore.save_json(target, {"a": 1})
        assert sorted(p.name for p in tmp_path.iterdir()) == ["baseline.json"]

        def boom(*args, **kwargs):
            raise RuntimeError("disk full")

        monkeypatch.setattr(store.json, "dump", boom)
        with pytest.raises(RuntimeError):
            ResultsStore.save_json(target, {"a": 2})
        assert json.loads(target.read_text()) == {"a": 1}
        assert sorted(p.name for p in tmp_path.iterdir()) == ["baseline.json"]


# ---------------------------------------------------------------------------
# Promotion
# ---------------------------------------------------------------------------


class TestPromote:
    def test_promotes_complete_refuses_incomplete(self):
        run = {
            "local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)]),
            "peak_mem": _result(
                "peak_mem", dimension="peak_mem", failed=[_fail("logit_lens", GPT2, 1)]
            ),
        }
        new, promoted, refused = Result.promote(run, None)
        assert promoted == ["local_latency"]
        assert (
            list(refused) == ["peak_mem"]
            and refused["peak_mem"][0]["error"] == "RuntimeError: boom"
        )
        assert new == {"local_latency": {**run["local_latency"], "previous": None}}

    def test_current_moves_to_previous(self):
        first = _result(results=[_lat(LL, GPT2, 10, 0.1)], env=_env("a"))
        second = _result(results=[_lat(LL, GPT2, 10, 0.2)], env=_env("b"))
        base, _, _ = Result.promote({"local_latency": first}, None)
        base, promoted, _ = Result.promote({"local_latency": second}, base)
        assert promoted == ["local_latency"]
        assert base["local_latency"]["previous"] == first
        assert base["local_latency"]["results"] == second["results"]
        base, _, _ = Result.promote(
            {
                "local_latency": _result(
                    results=[_lat(LL, GPT2, 10, 0.3)], env=_env("c")
                )
            },
            base,
        )
        assert base["local_latency"]["previous"]["env"]["git_hash"] == "b"
        assert "previous" not in base["local_latency"]["previous"]

    def test_repromote_same_result_is_a_no_op(self):
        first = _result(env=_env("a"), results=[_lat(LL, GPT2, 10, 0.1)])
        second = _result(env=_env("b"), results=[_lat(LL, GPT2, 10, 0.2)])
        base, _, _ = Result.promote({"local_latency": first}, None)
        base, _, _ = Result.promote({"local_latency": second}, base)
        again, promoted, _ = Result.promote({"local_latency": second}, base)
        assert promoted == [] and again == base

    def test_other_benchmarks_untouched(self):
        base = ResultsStore.upgrade_baseline(_old())
        new, _, _ = Result.promote(
            {
                "peak_mem": _result(
                    "peak_mem", dimension="peak_mem", results=[_pk(GPT2, {"10%": 17})]
                )
            },
            base,
        )
        assert (
            new["local_latency"] == base["local_latency"]
            and new["remote_latency"] == base["remote_latency"]
        )
        assert new["peak_mem"]["previous"] is None

    def test_promote_files(self, tmp_path, capsys):
        ResultsStore.save_json(
            tmp_path / "baseline.json", ResultsStore.upgrade_baseline(_old())
        )
        ResultsStore.save_json(
            tmp_path / "run.json",
            {
                "local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)], version=1),
                "remote_latency": _result(
                    "remote_latency", kind="remote", failed=[_fail(LL, GPT2, 10)]
                ),
            },
        )
        ResultsStore(tmp_path / "run.json", tmp_path / "baseline.json").promote()
        out = capsys.readouterr().out
        assert (
            "REFUSED remote_latency: incomplete" in out
            and "promoted local_latency v1" in out
        )
        base = ResultsStore(baseline=tmp_path / "baseline.json").load_baseline()
        assert base["local_latency"]["benchmark"]["version"] == 1
        assert base["local_latency"]["previous"]["benchmark"]["version"] == 0
        assert base["remote_latency"]["benchmark"]["version"] == 0

        results_md = (tmp_path / "baseline.md").read_text()
        diff_md = (tmp_path / "baseline_diff_with_prev.md").read_text()
        assert results_md.startswith("# Benchmark Baseline\n")
        assert "prompt_length=10" in results_md
        assert diff_md.startswith("# Benchmark Baseline vs. Previous")
        assert "local_latency v1" in diff_md and "local_latency v0" in diff_md

    def test_refused_promote_writes_no_reports(self, tmp_path, capsys):
        ResultsStore.save_json(
            tmp_path / "run.json",
            {"local_latency": _result(failed=[_fail(LL, GPT2, 10)])},
        )
        ResultsStore(tmp_path / "run.json", tmp_path / "baseline.json").promote()
        assert "REFUSED local_latency" in capsys.readouterr().out
        assert list(tmp_path.iterdir()) == [tmp_path / "run.json"]

    def test_default_layout(self):
        assert ResultsStore.BASELINE_FILE.parent == ResultsStore.RESULTS_DIR
        assert ResultsStore.RUN_FILE.parent == ResultsStore.TMP_DIR
        assert ResultsStore.baseline_report_paths(ResultsStore.BASELINE_FILE) == (
            ResultsStore.RESULTS_DIR / "baseline.md",
            ResultsStore.RESULTS_DIR / "baseline_diff_with_prev.md",
        )


# ---------------------------------------------------------------------------
# Migration
# ---------------------------------------------------------------------------


class TestMigration:
    def test_v1_becomes_v0_benchmarks_with_exact_values(self):
        old = _old()
        base = ResultsStore.upgrade_baseline(old)
        assert set(base) == {"local_latency", "remote_latency"}
        v0 = {d["name"]: d for d in BenchmarkDefinition.load_archive()}
        for name, kind in (("local_latency", "local"), ("remote_latency", "remote")):
            r = base[name]
            assert r["benchmark"] == BenchmarkDefinition.of(v0[name]).stamp()
            assert (
                r["status"] == "complete"
                and r["failed"] == []
                and r["previous"] is None
            )
            assert (
                r["meta_params"]["n_repeat"] == 10 and r["meta_params"]["n_warmup"] == 3
            )
            by_id = {Result.case_id(x): x for x in r["results"]}
            assert len(by_id) == len(old["results"][kind])
            for row in old["results"][kind]:
                expected = dict(row["latency"])
                if kind == "remote":
                    expected["breakdown"] = row["latency_breakdown"]
                assert by_id[Result.case_id(row)]["stats"] == expected
        assert base["local_latency"]["env"] == {
            "kind": "local",
            "git_hash": OLD_HASH,
            "timestamp": OLD_TS,
            "python": "3.12.3",
            "nnsight": "0.6.3",
            "transformers": "4.55.4",
            "torch": "2.9.0+cpu",
        }
        assert base["remote_latency"]["env"] == {
            "kind": "remote",
            "git_hash": OLD_HASH,
            "timestamp": OLD_TS,
            "nnsight": "0.6.3",
            "remote_server": "unknown",
        }

    def test_v1_with_unmatched_test_set_is_unversioned(self):
        old = _old()
        old["results"]["local"] = [
            dict(old["results"]["local"][0], params={"prompt_length": 7})
        ]
        old["results"]["remote"] = []
        run = ResultsStore.upgrade_run(old)
        assert list(run) == ["local_latency"]
        r = run["local_latency"]
        assert r["benchmark"]["version"] is None and r["benchmark"]["kind"] == "local"
        assert r["results"][0]["stats"] == old["results"]["local"][0]["latency"]

    @pytest.mark.parametrize(
        "doc",
        [
            {
                "git_hash": "x",
                "latency": {"meta_params": {}, "runs": []},
                "peak_mem": {"meta_params": {}, "runs": []},
            },
            {
                "local": {"current": None, "stale": []},
                "remote": {"current": None, "stale": []},
            },
            {"latency": {"local": None, "remote": None}, "peak_mem": None},
        ],
    )
    def test_intermediate_formats_are_rejected(self, tmp_path, doc):
        ResultsStore.save_json(tmp_path / "baseline.json", doc)
        with pytest.raises(UnknownFormatError, match="baseline.json"):
            ResultsStore(baseline=tmp_path / "baseline.json").load_baseline()

    def test_empty_files_are_valid(self, tmp_path):
        ResultsStore.save_json(tmp_path / "run.json", {})
        assert ResultsStore(run=tmp_path / "run.json").load_run() == {}

    def test_current_format_round_trips(self, tmp_path):
        base = ResultsStore.upgrade_baseline(_old())
        ResultsStore.save_json(tmp_path / "b.json", base)
        assert ResultsStore(baseline=tmp_path / "b.json").load_baseline() == base
        run = {"local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)])}
        ResultsStore.save_json(tmp_path / "r.json", run)
        assert ResultsStore(run=tmp_path / "r.json").load_run() == run

    def test_old_file_names_still_load(self, tmp_path, monkeypatch):
        monkeypatch.setattr(ResultsStore, "BASELINE_FILE", tmp_path / "baseline.json")
        monkeypatch.setattr(
            ResultsStore, "LEGACY_BASELINE_FILE", tmp_path / "results.json"
        )
        monkeypatch.setattr(ResultsStore, "RUN_FILE", tmp_path / "run.json")
        monkeypatch.setattr(ResultsStore, "LEGACY_RUN_FILE", tmp_path / "latest.json")
        (tmp_path / "results.json").write_text(OLD_RESULTS.read_text())
        (tmp_path / "latest.json").write_text(OLD_RESULTS.read_text())
        assert (
            ResultsStore().load_baseline()["local_latency"]["env"]["git_hash"]
            == OLD_HASH
        )
        assert ResultsStore().load_run()["remote_latency"]["benchmark"]["version"] == 0


class TestCorruptFiles:
    @pytest.mark.parametrize(
        "bad", ['{"local_latency": {', "<<<<<<< HEAD\n{}\n=======\n{}\n>>>>>>> x\n", ""]
    )
    def test_corrupt_baseline_aborts_and_is_untouched(self, tmp_path, bad):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        base.write_text(bad)
        ResultsStore.save_json(
            run, {"local_latency": _result(results=[_lat(LL, GPT2, 10, 0.1)])}
        )
        with pytest.raises(CorruptResultsError, match="baseline.json"):
            ResultsStore(run, base).promote()
        with pytest.raises(CorruptResultsError):
            print_diff(run, base)
        assert base.read_text() == bad

    def test_corrupt_run_aborts_and_is_untouched(self, tmp_path):
        base, run = tmp_path / "baseline.json", tmp_path / "run.json"
        ResultsStore.save_json(base, ResultsStore.upgrade_baseline(_old()))
        before = base.read_text()
        run.write_text('{"local_latency": {"env"')
        with pytest.raises(CorruptResultsError, match="run.json"):
            ResultsStore(run, base).promote()
        with pytest.raises(CorruptResultsError):
            print_results(run)
        assert (
            run.read_text() == '{"local_latency": {"env"' and base.read_text() == before
        )

    def test_missing_files_still_fine(self, tmp_path):
        assert ResultsStore(baseline=tmp_path / "baseline.json").load_baseline() is None
        assert ResultsStore(run=tmp_path / "run.json").load_run() is None
        assert (
            ResultsStore(tmp_path / "run.json", tmp_path / "baseline.json").promote()
            is None
        )


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
        assert [ThresholdSearch.label(t) for t in (0.1, 0.25, 0.5)] == [
            "10%",
            "25%",
            "50%",
        ]
        assert ThresholdSearch.coarse_grid(2, 100) == [2, 4, 8, 16, 32, 64, 100]
        assert ThresholdSearch.coarse_grid(2, 64) == [2, 4, 8, 16, 32, 64]

    @pytest.mark.parametrize("slope,intercept", [(13 * MIB, 5 * MIB), (MIB, 0), (7, 3)])
    def test_bisection_finds_exact_values(self, slope, intercept):
        footprint = 2000 * MIB if slope > 100 else 10_000
        measure, calls = _linear(slope, intercept)
        result = ThresholdSearch(footprint, (0.1, 0.25, 0.5), cap=1_000_000).run(
            measure
        )

        for t in (0.1, 0.25, 0.5):
            expected = int((t * footprint - intercept) // slope)
            assert result.max_lengths[ThresholdSearch.label(t)] == expected
        assert result.capped == []
        assert len(calls) == len(set(calls))
        assert set(result.peaks) == set(calls)

    def test_keys_follow_threshold_order(self):
        measure, _ = _linear(1, 0)
        result = ThresholdSearch(1000, (0.5, 0.1), cap=10_000).run(measure)
        assert list(result.max_lengths) == ["50%", "10%"]
        assert result.max_lengths == {"50%": 500, "10%": 100}

    def test_smallest_length_already_over_is_none(self):
        measure, _ = _linear(1, 150)
        result = ThresholdSearch(1000, (0.1, 0.25, 0.5), cap=10_000, start=2).run(
            measure
        )
        assert result.max_lengths == {"10%": None, "25%": 100, "50%": 350}

    def test_cap_reached_without_crossing(self):
        measure, _ = _linear(1, 0)
        result = ThresholdSearch(1000, (0.1, 0.25, 0.5), cap=200).run(measure)
        assert result.max_lengths == {"10%": 100, "25%": 200, "50%": 200}
        assert result.capped == ["25%", "50%"]

    def test_oom_counts_as_over(self):
        measure, _ = _linear(1, 0, oom_from=300)
        result = ThresholdSearch(1000, (0.1, 0.25, 0.5), cap=10_000).run(measure)
        assert result.max_lengths == {"10%": 100, "25%": 250, "50%": 299}
        assert result.peaks[300] is None


class TestPercent:
    def test_peak_pct(self):
        assert BenchmarkRunner.peak_pct(50, 200) == 25.0
        assert BenchmarkRunner.peak_pct(1, 3) == 33.333

    def test_model_weights_counts_params_and_buffers(self):
        torch = pytest.importorskip("torch")
        module = torch.nn.Linear(4, 8).to(torch.bfloat16)
        module.register_buffer("scale", torch.zeros(10, dtype=torch.float32))
        assert BenchmarkRunner.model_weights(module) == (4 * 8 + 8) * 2 + 10 * 4


# ---------------------------------------------------------------------------
# Show / diff rendering
# ---------------------------------------------------------------------------


@pytest.fixture
def files(tmp_path):
    """A baseline (v0 latency from the fixture, peak_mem v1 + previous) and a v1 run."""
    base = ResultsStore.upgrade_baseline(_old())
    old_peak = _result(
        "peak_mem",
        dimension="peak_mem",
        env=_env("p0"),
        results=[_pk(GPT2, {"10%": 10}), _pk(GEMMA, {"10%": 12})],
    )
    new_peak = _result(
        "peak_mem",
        dimension="peak_mem",
        env=_env("p1", torch="2.10"),
        results=[_pk(GEMMA, {"10%": 14, "25%": 36, "50%": 72}), _pk(GPT2, {"10%": 17})],
    )
    base, _, _ = Result.promote({"peak_mem": old_peak}, base)
    base, _, _ = Result.promote({"peak_mem": new_peak}, base)
    run = {
        "local_latency": _result(
            env=_env("new5678"),
            results=[
                _lat(LL, GPT2, 25, 0.02),
                _lat(LL, GPT2, 50, 0.05),
                _lat("j_lens[length]", GPT2, 25, 0.03),
            ],
            failed=[_fail("j_lens[length]", LLAMA, 25), _fail(LL, LLAMA, 10)],
        ),
        "remote_latency": _result(
            "remote_latency",
            kind="remote",
            version=0,
            env=_env("new5678", kind="remote"),
            config_hash=base["remote_latency"]["benchmark"]["config_hash"],
            results=[_lat(LL, GPT2, 25, 0.4, remote=True)],
        ),
    }
    paths = {"baseline": tmp_path / "baseline.json", "run": tmp_path / "run.json"}
    ResultsStore.save_json(paths["baseline"], base)
    ResultsStore.save_json(paths["run"], run)
    return paths


def _add_peak_to_run(files):
    run = json.loads(files["run"].read_text())
    run["peak_mem"] = _result(
        "peak_mem",
        dimension="peak_mem",
        env=_env("new5678"),
        results=[
            _pk(GEMMA, {"10%": 15, "25%": 36, "50%": 4096}, capped=["50%"]),
            _pk(LLAMA, {"10%": 190, "25%": 480, "50%": 960}),
        ],
        meta={
            "n_repeat": 3,
            "n_warmup": 1,
            "dtype": "bfloat16",
            "autocast": True,
            "swept": "prompt_length",
            "thresholds": [0.1, 0.25, 0.5],
            "min_length": 2,
            "max_length": 4096,
        },
    )
    ResultsStore.save_json(files["run"], run)


class TestRendering:
    def test_show(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], detail=True)
        out = capsys.readouterr().out
        assert "[LOCAL]" in out and "[REMOTE (unqueued)]" in out
        assert (
            "PEAK MEMORY" in out
            and ">=4096" in out
            and "OOM" in out
            and "1000.0MiB" in out
        )
        assert "local_latency v1 @ new5678" in out
        assert "local_latency v1 (incomplete): 3 measured; 2 failed" in out
        assert (
            "failed: j_lens[length] | meta-llama/Llama-3.1-8B | prompt_length=25 — "
            "RuntimeError: boom" in out
        )

    def test_setup_line(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], dims=["peak_mem"])
        assert (
            "Setup:  local, bfloat16, autocast, swept=prompt_length, repeat=3"
            in capsys.readouterr().out
        )

    def test_unpadded_results_render_as_before(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "within N% of the model footprint\n" in out
        assert "Weights" not in out and "footprint=" not in out
        md = markdown_results(files["run"])
        assert "| Model | Params | Footprint |" in md and "Weights" not in md

    def test_padded_results_show_weights_and_padding(self, tmp_path, capsys):
        meta = {"n_repeat": 3, "swept": "prompt_length", "padding_bias": 500 * MIB}
        run = {
            "peak_mem": _result(
                "peak_mem",
                dimension="peak_mem",
                meta=meta,
                results=[_pk(GPT2, {"10%": 30}, padding=500 * MIB)],
            )
        }
        print_results(run, dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "repeat=3, footprint=weights + 500.0MiB padding bias" in out
        assert "within N% of the model footprint (weights + padding bias)" in out
        assert "Weights   Footprint" in out
        assert "1000.0MiB     1.46GiB" in out
        md = markdown_results(run)
        assert "| Model | Params | Weights | Footprint |" in md
        assert "| 1000.0MiB | 1.46GiB | 30 |" in md

    def test_padded_run_vs_unpadded_baseline(self, tmp_path, capsys):
        """A result recorded before padding_bias diffs with both footprints shown."""
        meta = {"swept": "prompt_length", "padding_bias": 500 * MIB}
        base = {
            "peak_mem": {
                **_result(
                    "peak_mem",
                    dimension="peak_mem",
                    results=[_pk(GPT2, {"10%": 10})],
                ),
                "previous": None,
            }
        }
        run = {
            "peak_mem": _result(
                "peak_mem",
                dimension="peak_mem",
                meta=meta,
                results=[_pk(GPT2, {"10%": 30}, padding=500 * MIB)],
            )
        }
        paths = {"baseline": tmp_path / "baseline.json", "run": tmp_path / "run.json"}
        ResultsStore.save_json(paths["baseline"], base)
        ResultsStore.save_json(paths["run"], run)
        print_diff(paths["run"], paths["baseline"], dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "Footprint: weights + padding bias" in out
        assert "1000.0MiB -> 1.46GiB" in out and "10 -> 30 (+20)" in out
        md = markdown_diff(paths["run"], paths["baseline"], dims=["peak_mem"])
        assert "| Weights | Footprint |" in md
        assert "| 1000.0MiB | 1000.0MiB -> 1.46GiB |" in md
        assert "within N% of the model footprint (weights + padding bias)" in md

    def test_show_one_dimension(self, files, capsys):
        _add_peak_to_run(files)
        print_results(files["run"], dims=["peak_mem"])
        out = capsys.readouterr().out
        assert "PEAK MEMORY" in out and "[LOCAL]" not in out
        print_results(files["run"], remote=True)
        out = capsys.readouterr().out
        assert "PEAK MEMORY" not in out and "[REMOTE (unqueued)]" in out

    def test_different_versions_compare_shared_tests(self, files):
        rows = {
            (r["section"], r["tool"], r["model"], r["params"]["prompt_length"]): r
            for r in Comparison.compute_diff(files["run"], files["baseline"])
        }
        shared = rows[("local", LL, GPT2, 25)]
        assert shared["status"] == "changed" and shared["source"] == "baseline v0"
        assert rows[("local", "j_lens[length]", GPT2, 25)]["status"] == "new"
        removed = rows[("local", LL, LLAMA, 10)]
        assert removed["status"] == "removed" and removed["source"] == "failed in run"
        assert (
            rows[("local", "activation_patching[length]", GPT2, 10)]["source"]
            == "not in run"
        )

    def test_same_version_compares_normally(self, files):
        rows = [
            r
            for r in Comparison.compute_diff(
                files["run"], files["baseline"], remote=True
            )
        ]
        changed = [r for r in rows if r["status"] == "changed"]
        assert len(changed) == 1 and changed[0]["source"] == "baseline"
        assert sum(r["status"] == "removed" for r in rows) == 23

    def test_warnings(self, files, capsys):
        warnings = Comparison.warnings(files["run"], files["baseline"])
        assert any(
            w.startswith(
                "local_latency: run v1 vs baseline v0 — comparing the 2 shared test(s)"
            )
            for w in warnings
        )
        local_env = next(
            w for w in warnings if w.startswith("local_latency vs baseline: ")
        )
        assert "torch: 2.9.0+cpu -> 2.11" in local_env and "git_hash" not in local_env
        remote_env = next(
            w for w in warnings if w.startswith("remote_latency vs baseline: ")
        )
        assert "remote_server: unknown ->" in remote_env and "torch" not in remote_env
        print_diff(files["run"], files["baseline"])
        assert (
            "WARNING: comparing across different environments"
            in capsys.readouterr().out
        )
        assert "> **Warning:**" in markdown_diff(files["run"], files["baseline"])

    def test_same_version_changed_definition_warns(self, files):
        run = json.loads(files["run"].read_text())
        run["remote_latency"]["benchmark"]["config_hash"] = "changed"
        ResultsStore.save_json(files["run"], run)
        assert any(
            "same version v0 but different definitions" in w
            for w in Comparison.warnings(files["run"], files["baseline"])
        )

    def test_with_previous(self, files):
        rows = Comparison.compute_peak_diff(files["run"], files["baseline"])
        assert rows == []
        rows = {
            r["model"]: r
            for r in Comparison.compute_peak_diff(
                files["run"], files["baseline"], with_previous=True
            )
        }
        assert rows[GPT2]["source"] == "last change (p0 → p1)"
        assert rows[GPT2]["old"]["max_prompt_length"] == {"10%": 10}
        assert rows[GPT2]["new"]["max_prompt_length"] == {"10%": 17}

    def test_live_comparison_takes_precedence(self, files, capsys):
        _add_peak_to_run(files)
        rows = {
            r["model"]: r
            for r in Comparison.compute_peak_diff(
                files["run"], files["baseline"], with_previous=True
            )
        }
        assert (
            rows[GEMMA]["source"] == "baseline"
            and rows[GEMMA]["old"]["max_prompt_length"]["10%"] == 14
        )
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
        assert "data:image/png" in markdown_diff(
            files["run"], files["baseline"], plots=True
        )
