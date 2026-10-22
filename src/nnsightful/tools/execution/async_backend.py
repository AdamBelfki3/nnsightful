"""The backend ``ExecMode.REMOTE_ASYNC`` returns: await or stream a submitted job."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, AsyncIterator

from nnsight.intervention.backends.remote import AsyncRemoteBackend, RemoteError
from nnsight.schema.response import ResponseModel, Status

from .tool_backend import ToolBackend

if TYPE_CHECKING:
    from ...types import ToolData


class AsyncToolBackend(ToolBackend, AsyncRemoteBackend):
    """A submitted NDIF job, consumed on an asyncio event loop.

    Returned by ``ExecMode.REMOTE_ASYNC`` with the job already submitted.
    ``await backend.result()`` waits for the tool's result; ``async for
    update in backend.updates()`` yields each status update as it lands —
    e.g. to stream progress to a client — after which ``result()`` returns
    at once. An ``ERROR`` status raises ``RemoteError`` either way.

    Both read the job's one status stream, so ``result()`` is just
    ``updates()`` consumed to the end: the stream can be read once, and
    whatever it ended with — the result, or the error — is kept for every
    later ``result()``.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.job_id: str | None = None
        self._read = False
        self._done = False
        self._result: Any = None
        self._error: RemoteError | None = None

    async def updates(self) -> AsyncIterator[ResponseModel]:
        """Each status update as it lands, through ``COMPLETED`` or ``ERROR``.

        Reads nnsight's ``stream()``, which yields the saves right after
        ``COMPLETED``; they are taken before ``COMPLETED`` is yielded, so a
        loop that stops there still has the result for :meth:`result`.
        Renders nnsight's status display when remote logging is on.

        Raises:
            RemoteError: after yielding an ``ERROR`` update.
            RuntimeError: if the stream was already read.
        """
        if self._read:
            raise RuntimeError(
                "this job's status stream was already read; use result()"
            )
        self._read = True
        stream = self.stream()
        try:
            async for update in stream:
                self.job_id = update.id
                self.display.update(update)
                if update.status == Status.COMPLETED:
                    saves = await anext(stream)
                    self._result = saves[self.RESULT]
                    self._done = True
                    yield update
                    return
                if update.status == Status.ERROR:
                    self._error = RemoteError(update.description)
                    yield update
                    raise self._error
                yield update
        finally:
            await stream.aclose()

    async def result(self) -> "ToolData | Any":
        """The tool's result, waiting for the job to complete if it hasn't.

        Raises:
            RemoteError: if the job failed.
            RuntimeError: if an ``updates()`` loop stopped before the job
                completed, so the result never arrived.
        """
        if not self._read:
            async for _ in self.updates():
                pass
        if self._error is not None:
            raise self._error
        if not self._done:
            raise RuntimeError(
                "this job's status stream was closed before its result arrived "
                "(an updates() loop stopped early)"
            )
        return self._result
