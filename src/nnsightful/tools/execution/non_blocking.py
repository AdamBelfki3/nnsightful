"""The backend ``ExecMode.REMOTE_NON_BLOCKING`` returns: collect a submitted job."""

from __future__ import annotations

import time
from typing import TYPE_CHECKING, Any

from nnsight.intervention.backends.remote import RemoteBackend

from .tool_backend import ToolBackend

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer

    from ...types import ToolData


class NonBlockingToolBackend(ToolBackend, RemoteBackend):
    """A submitted NDIF job to collect a tool's result from.

    Returned by ``ExecMode.REMOTE_NON_BLOCKING`` with the job already
    submitted; :attr:`job_id` identifies it. Collect the result with
    :meth:`poll` (one check) or :meth:`result` (wait). In another process,
    rebuild the backend from the job id with :meth:`from_job`.
    """

    def __init__(self, model_key: str, **kwargs: Any) -> None:
        super().__init__(model_key, blocking=False, **kwargs)

    @classmethod
    def from_job(
        cls, model: "StandardizedTransformer", job_id: str
    ) -> "NonBlockingToolBackend":
        """A backend for an already-submitted job, to collect its result."""
        return cls.for_model(model, job_id=job_id)

    def poll(self, tracer: Any = None) -> "ToolData | Any | None":
        """Check the job once: the tool's result if it completed, else ``None``.

        Raises ``RemoteError`` if the job failed. :attr:`status` holds the
        latest status.
        """
        saves = super().poll(tracer)
        return None if saves is None else saves[self.RESULT]

    def result(
        self, timeout: float | None = None, interval: float = 1.0
    ) -> "ToolData | Any":
        """Poll every ``interval`` seconds until the job completes; its result.

        Raises:
            TimeoutError: if the job hasn't completed within ``timeout`` seconds.
            RemoteError: if the job failed.
        """
        deadline = None if timeout is None else time.monotonic() + timeout
        while (result := self.poll()) is None:
            if deadline is not None and time.monotonic() >= deadline:
                raise TimeoutError(
                    f"job {self.job_id} didn't complete within {timeout}s "
                    f"(last status: {self.status})"
                )
            time.sleep(interval)
        return result
