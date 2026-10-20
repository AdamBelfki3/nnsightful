"""Every tool through every way of running it, locally and on NDIF.

Local: ``tool(...)`` returns the typed payload, which survives the JSON trip
to the frontend.

Remote (``--remote``): the blocking backend, the non-blocking submit-then-poll
flow workbench uses, and nnsight's ``AsyncRemoteBackend`` (a ``RemoteRun``,
awaited or streamed) each return the payload the local run does. The lenses
also run with ``positions`` set (a list for the logit lens, a range for
j-lens). Results are compared on what is robust to the server's hardware and
dtype: the token labels and top predictions.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Any, Callable

import pytest
from nnsight.intervention.backends.remote import AsyncRemoteBackend, RemoteBackend
from nnsight.schema.response import Status

from nnsightful.tools._base import RemoteRun, Tool
from nnsightful.tools.activation_patching import activation_patching
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


@pytest.mark.remote
class TestRemote:
    def test_blocking(self, model, case, local_payload):
        args, kwargs = case.call_args(model)
        data = case.tool(model, *args, remote=True, **kwargs)

        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_non_blocking_submit_then_poll(self, model, case, local_payload):
        """Workbench's flow: submit for a job id, poll it from a fresh backend."""
        args, kwargs = case.call_args(model)
        submit = RemoteBackend(model.to_model_key(), blocking=False)
        job_id = case.tool(
            model, *args, remote=True, backend=submit, non_blocking=True, **kwargs
        )
        assert isinstance(job_id, str) and job_id

        poll = RemoteBackend(model.to_model_key(), job_id=job_id, blocking=False)
        deadline = time.monotonic() + case.POLL_TIMEOUT
        saves = poll()
        while saves is None:
            assert time.monotonic() < deadline, f"job {job_id} didn't complete"
            time.sleep(1)
            saves = poll()

        data = saves["results"]
        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_async_backend_await(self, model, case, local_payload):
        """An ``AsyncRemoteBackend`` gives a ``RemoteRun``, which awaits to the data."""
        args, kwargs = case.call_args(model)

        async def run():
            backend = AsyncRemoteBackend(model.to_model_key())
            remote_run = case.tool(model, *args, remote=True, backend=backend, **kwargs)
            assert isinstance(remote_run, RemoteRun)
            return await remote_run

        data = asyncio.run(run())
        assert type(data) is case.data_type
        assert case.key(data) == case.key(local_payload)

    def test_async_backend_stream(self, model, case, local_payload):
        """A ``RemoteRun`` streams the job's status updates, then holds the data."""
        args, kwargs = case.call_args(model)

        async def run():
            backend = AsyncRemoteBackend(model.to_model_key())
            remote_run = case.tool(model, *args, remote=True, backend=backend, **kwargs)
            statuses = [update.status async for update in remote_run]
            return remote_run, statuses

        remote_run, statuses = asyncio.run(run())
        assert statuses[-1] == Status.COMPLETED
        assert Status.RUNNING in statuses
        assert remote_run.job_id
        assert type(remote_run.result) is case.data_type
        assert case.key(remote_run.result) == case.key(local_payload)
