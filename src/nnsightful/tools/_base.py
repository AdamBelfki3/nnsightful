from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

from ..types import ToolData

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Tool(ABC):
    """Abstract base for nnsightful tools.

    End users call the tool directly to get formatted output::

        data = tool(model, prompt, ..., remote=False)

    For streaming / two-phase execution (e.g. workbench SSE endpoints),
    call ``_run`` with a backend.  When a backend is provided, ``_run`` runs
    the trace/session (which primes the backend via its ``__call__`` hook)
    and returns the backend itself rather than a raw dict.  The caller
    drives the backend to completion — typically by async-iterating it for
    status updates and then passing the downloaded result dict to
    ``_format`` to produce the final :class:`ToolData`::

        backend = StreamingRemoteBackend(...)
        tool._run(model, prompt, remote=True, backend=backend)
        async for response in backend:
            if response.status == JobStatus.COMPLETED:
                raw = response.data           # dict of save-keyed tensors
                raw["tokenizer"] = ...        # local context injected here
                data = tool._format(raw, ...)
    """

    @abstractmethod
    def _run(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool = False,
        backend=None,
        **kwargs,
    ) -> Any:
        """Run the trace/session.

        When ``backend`` is ``None``, returns a dict of raw results.
        When ``backend`` is provided, returns the backend — no raw dict is
        built; the caller is expected to drive the backend and inject any
        local (non-tensor) context into the downloaded result dict before
        calling :meth:`_format`.
        """
        ...

    @abstractmethod
    def _format(self, raw: dict[str, Any], **kwargs) -> ToolData:
        """Format raw results into structured output data."""
        ...

    def __call__(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool = False,
        **kwargs,
    ) -> ToolData:
        """Run the tool end-to-end (local or remote-blocking)."""
        raw = self._run(model, *args, remote=remote, backend=None, **kwargs)
        return self._format(raw, **kwargs)
