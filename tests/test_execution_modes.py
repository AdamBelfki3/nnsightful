"""Every tool through every way of running it, locally and on NDIF.

Local: ``tool(...)`` returns the typed payload, which survives the JSON trip
to the frontend; ``exec_mode`` resolves to the right session and backend.

Remote (``--remote``): ``ExecMode.REMOTE`` (blocking), the non-blocking
submit-then-collect flow workbench uses (``REMOTE_NON_BLOCKING``, collected
from a backend rebuilt from the job id) and ``REMOTE_ASYNC`` (awaited or
streamed) each return the payload the local run does. The lenses
also run with ``positions`` set (a list for the logit lens, a range for
j-lens). Results are compared on what is robust to the server's hardware and
dtype: the token labels and top predictions.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any, Callable

import pytest
from nnsight.intervention.backends.remote import RemoteBackend, RemoteError
from nnsight.schema.response import ResponseModel, Status
from nnsight.tracing.backend import Backend

from nnsightful.tools._base import Tool
from nnsightful.tools.activation_patching import activation_patching
from nnsightful.tools.execution import (
    AsyncToolBackend,
    ExecMode,
    NonBlockingToolBackend,
)
from nnsightful.tools.j_lens import JLensTool, j_lens
from nnsightful.tools.logit_lens import logit_lens
from nnsightful.types import ActivationPatchingData, JLensData, LogitLensData, ToolData

PROMPT = "The capital of France is"
SRC_PROMPT = "The Eiffel Tower is in Paris. The Eiffel Tower is in"
TGT_PROMPT = "The Colosseum is in Rome. The Colosseum is in"


@dataclass
class ToolCase:
    """How to call one tool, and what of its payload a remote run must reproduce."""

    name: str
    tool: Tool
    data_type: type[ToolData]
    inputs: Callable[[Any], tuple[tuple, dict]]
    key: Callable[[Any], Any]
    needs_lens: bool = False

    POLL_TIMEOUT = 600

    def call_args(self, model) -> tuple[tuple, dict]:
        if self.needs_lens:
            try:
                JLensTool.get_lens_config(model.repo_id)
            except ValueError:
                pytest.skip(f"no Jacobian lens for {model.repo_id}")
        return self.inputs(model)


def _patching_inputs(model):
    last = len(model.tokenizer.encode(TGT_PROMPT)) - 1
    src_last = len(model.tokenizer.encode(SRC_PROMPT)) - 1
    return (SRC_PROMPT, TGT_PROMPT), dict(
        src_pos=[src_last], tgt_pos=[last], tgt_freeze=[]
    )


CASES = [
    ToolCase(
        "logit_lens",
        logit_lens,
        LogitLensData,
        inputs=lambda model: ((PROMPT,), dict(top_k=3)),
        key=lambda d: (d.input, d.layers, d.topk[-1][-1][0]),
    ),
    ToolCase(
        "j_lens",
        j_lens,
        JLensData,
        inputs=lambda model: ((PROMPT,), dict(top_k=3, max_new_tokens=2)),
        key=lambda d: (d.input, d.completion, d.topk[-1][-1][0]),
        needs_lens=True,
    ),
    ToolCase(
        "logit_lens[positions]",
        logit_lens,
        LogitLensData,
        inputs=lambda model: ((PROMPT,), dict(top_k=3, positions=[0, -1])),
        key=lambda d: (d.input, d.positions, d.topk[-1][-1][0]),
    ),
    ToolCase(
        "j_lens[positions]",
        j_lens,
        JLensData,
        inputs=lambda model: (
            (PROMPT,),
            dict(top_k=3, max_new_tokens=2, positions=(-2, -1)),
        ),
        key=lambda d: (d.input, d.completion, d.positions, d.topk[-1][-1][0]),
        needs_lens=True,
    ),
    ToolCase(
        "activation_patching",
        activation_patching,
        ActivationPatchingData,
        inputs=_patching_inputs,
        key=lambda d: d.tokenLabels[:2],
    ),
]


@pytest.fixture(params=CASES, ids=[case.name for case in CASES])
def case(request) -> ToolCase:
    return request.param


_local_payloads: dict[tuple[str, str], ToolData] = {}


@pytest.fixture
def local_payload(model, case):
    """``tool(...)`` run locally, once per model and tool."""
    cache_key = (model.repo_id, case.name)
    if cache_key not in _local_payloads:
        args, kwargs = case.call_args(model)
        _local_payloads[cache_key] = case.tool(model, *args, **kwargs)
    return _local_payloads[cache_key]


class TestLocal:
    def test_call_returns_the_typed_payload(self, case, local_payload):
        assert type(local_payload) is case.data_type

    def test_payload_survives_json(self, case, local_payload):
        restored = case.data_type.model_validate_json(local_payload.model_dump_json())
        assert restored == local_payload


class TestExecMode:
    """``exec_mode`` resolves to a session and the backend the call returns."""

    def test_modes_accept_their_names(self, model):
        assert ExecMode.resolve("local", model) == {}
        assert ExecMode.resolve("Remote", model) == {"remote": True}
        session = ExecMode.resolve("REMOTE_ASYNC", model)
        assert session["remote"] is True
        assert type(session["backend"]) is AsyncToolBackend

    def test_an_unknown_mode_raises(self, model):
        with pytest.raises(ValueError, match="expected one of local, remote"):
            ExecMode.resolve("cloud", model)

    @pytest.mark.parametrize("bad", [None, True, ["remote"]], ids=repr)
    def test_an_exec_mode_of_the_wrong_type_raises(self, model, bad):
        with pytest.raises(TypeError, match="exec_mode must be an ExecMode"):
            logit_lens(model, PROMPT, exec_mode=bad)

    def test_a_backend_class_that_isnt_a_tool_backend_raises(self, model):
        """Only a tool backend knows how to be built for a model."""
        with pytest.raises(TypeError, match="RemoteBackend is a class"):
            logit_lens(
                model, PROMPT, exec_mode={"remote": True, "backend": RemoteBackend}
            )

    def test_a_run_never_changes_a_mode(self, model):
        """Every call shares a mode's preset; each gets its own session and
        its own backend."""
        first = ExecMode.resolve(ExecMode.REMOTE_NON_BLOCKING, model)
        first["blocking"] = True
        second = ExecMode.resolve(ExecMode.REMOTE_NON_BLOCKING, model)
        assert second["backend"] is not first["backend"]
        assert ExecMode.REMOTE_NON_BLOCKING.value == {
            "remote": True,
            "backend": NonBlockingToolBackend,
        }
        with pytest.raises(TypeError):
            ExecMode.REMOTE.value["blocking"] = False

    def test_a_dict_backend_class_is_built_for_the_model(self, model):
        session = ExecMode.resolve(
            {"remote": True, "backend": NonBlockingToolBackend}, model
        )
        assert type(session["backend"]) is NonBlockingToolBackend
        assert session["backend"].model_key == model.to_model_key()

    @pytest.mark.parametrize(
        "mode", [ExecMode.REMOTE_NON_BLOCKING, ExecMode.REMOTE_ASYNC]
    )
    def test_built_backends_carry_the_models_env(self, model, mode):
        """What nnsight sends when it builds a remote backend itself."""
        backend = ExecMode.resolve(mode, model)["backend"]
        assert backend.model_key == model.to_model_key()
        assert backend.env == model._remoteable_get_env()

    def test_a_non_blocking_dict_without_a_backend_is_refused(self, model):
        with pytest.raises(ValueError, match="REMOTE_NON_BLOCKING"):
            logit_lens(model, PROMPT, exec_mode={"remote": True, "blocking": False})

    def test_a_dict_runs_the_session_it_describes(self, model):
        assert logit_lens(
            model, PROMPT, top_k=3, exec_mode={"remote": False}
        ) == logit_lens(model, PROMPT, top_k=3)

    def test_a_dict_backend_is_returned_after_running(self, model):
        class Recording(Backend):
            ran = False

            def __call__(self, tracer):
                self.ran = True
                super().__call__(tracer)

        backend = Recording()
        assert logit_lens(model, PROMPT, exec_mode={"backend": backend}) is backend
        assert backend.ran


class TestNonBlockingToolBackend:
    """Collecting a submitted job's result, without the network."""

    @staticmethod
    def _backend(monkeypatch, polls):
        backend = NonBlockingToolBackend("key", host="http://ndif.test", job_id="j")
        answers = iter(polls)
        monkeypatch.setattr(
            RemoteBackend, "poll", lambda self, tracer=None: next(answers)
        )
        return backend

    def test_poll_is_the_tools_result_once_complete(self, monkeypatch):
        backend = self._backend(monkeypatch, [None, {"results": "data", "x": 1}])
        assert backend.poll() is None
        assert backend.poll() == "data"

    def test_result_waits_for_completion(self, monkeypatch):
        backend = self._backend(monkeypatch, [None, None, {"results": "data"}])
        assert backend.result(interval=0) == "data"

    def test_result_times_out(self, monkeypatch):
        backend = self._backend(monkeypatch, iter(lambda: None, 1))
        with pytest.raises(TimeoutError, match="job j"):
            backend.result(timeout=0.01, interval=0)


class TestAsyncToolBackend:
    """Reading a submitted job's status stream, without the network: a fake
    websocket hands back canned updates and the download is stubbed."""

    class _Connection:
        def __init__(self, statuses):
            self.messages = [
                ResponseModel(
                    id="job",
                    status=status,
                    description="boom" if status == Status.ERROR else "",
                ).model_dump_json()
                for status in statuses
            ]
            self.closed = False

        def recv(self):
            return self.messages.pop(0)

        def close(self):
            self.closed = True

    def _backend(self, statuses):
        backend = AsyncToolBackend("key", host="http://ndif.test")
        backend.connection = connection = self._Connection(statuses)
        downloads = []

        async def download(url):
            downloads.append(url)
            return {"results": "data", "other": 1}

        backend.download = download
        return backend, connection, downloads

    def test_result_waits_for_the_job(self):
        backend, connection, _ = self._backend(
            [Status.QUEUED, Status.RUNNING, Status.COMPLETED]
        )
        assert asyncio.run(backend.result()) == "data"
        assert backend.job_id == "job"
        assert connection.closed

    def test_streamed_updates_then_result_without_reading_again(self):
        backend, connection, downloads = self._backend(
            [Status.QUEUED, Status.RUNNING, Status.COMPLETED]
        )

        async def run():
            statuses = [update.status async for update in backend.updates()]
            return statuses, await backend.result(), await backend.result()

        statuses, first, again = asyncio.run(run())
        assert statuses == [Status.QUEUED, Status.RUNNING, Status.COMPLETED]
        assert first == again == "data"
        assert len(downloads) == 1 and connection.messages == []

    def test_a_loop_stopped_at_completed_still_has_the_result(self):
        backend, _, _ = self._backend([Status.RUNNING, Status.COMPLETED])

        async def run():
            async for update in backend.updates():
                if update.status == Status.COMPLETED:
                    break
            return await backend.result()

        assert asyncio.run(run()) == "data"

    def test_a_loop_stopped_early_makes_result_say_so(self):
        backend, connection, _ = self._backend([Status.QUEUED, Status.COMPLETED])

        async def run():
            async for _ in backend.updates():
                break
            return await backend.result()

        with pytest.raises(RuntimeError, match="stopped early"):
            asyncio.run(run())
        assert connection.closed

    def test_an_error_raises_from_the_stream_and_from_result(self):
        backend, _, _ = self._backend([Status.RUNNING, Status.ERROR])
        seen = []

        async def stream():
            async for update in backend.updates():
                seen.append(update.status)

        with pytest.raises(RemoteError, match="boom"):
            asyncio.run(stream())
        assert seen == [Status.RUNNING, Status.ERROR]
        with pytest.raises(RemoteError, match="boom"):
            asyncio.run(backend.result())

    def test_the_stream_is_read_once(self):
        backend, _, _ = self._backend([Status.COMPLETED])

        async def run():
            await backend.result()
            async for _ in backend.updates():
                pass

        with pytest.raises(RuntimeError, match="already read"):
            asyncio.run(run())


@pytest.mark.remote
class TestRemote:
    def test_blocking(self, model, case, local_payload):
        args, kwargs = case.call_args(model)
        data = case.tool(model, *args, exec_mode=ExecMode.REMOTE, **kwargs)

        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_non_blocking_collected_from_the_job_id(self, model, case, local_payload):
        """Workbench's flow: submit, then collect from a backend rebuilt from
        the job id (another request, possibly another process)."""
        args, kwargs = case.call_args(model)
        job = case.tool(model, *args, exec_mode=ExecMode.REMOTE_NON_BLOCKING, **kwargs)
        assert type(job) is NonBlockingToolBackend
        assert job.job_id

        collector = NonBlockingToolBackend.from_job(model, job.job_id)
        data = collector.result(timeout=case.POLL_TIMEOUT)
        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_async_result(self, model, case, local_payload):
        args, kwargs = case.call_args(model)

        async def run():
            backend = case.tool(model, *args, exec_mode=ExecMode.REMOTE_ASYNC, **kwargs)
            assert type(backend) is AsyncToolBackend
            return await backend.result()

        data = asyncio.run(run())
        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_async_updates_then_result(self, model, case, local_payload):
        """Streamed status updates, then the result without waiting again."""
        args, kwargs = case.call_args(model)

        async def run():
            backend = case.tool(model, *args, exec_mode=ExecMode.REMOTE_ASYNC, **kwargs)
            statuses = [update.status async for update in backend.updates()]
            return backend, statuses, await backend.result()

        backend, statuses, data = asyncio.run(run())
        assert statuses[-1] == Status.COMPLETED
        assert Status.RUNNING in statuses
        assert backend.job_id
        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)
