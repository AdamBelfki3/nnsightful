from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

from ..types import ToolData

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Tool(ABC):
    """Abstract base for nnsightful tools.

    Subclasses implement ``_run`` (trace/session setup) and ``_format``
    (result processing).  End users call the tool directly::

        data = tool(model, prompt, ...)

    For async two-phase patterns (e.g. workbench), call ``_run`` and
    ``_format`` separately::

        raw = tool._run(model, prompt, remote=True, backend=backend)
        job_id = raw["job_id"]
        # ... later, after fetching results from backend ...
        data = tool._format(raw_results, ...)
    """

    @abstractmethod
    def _run(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool = False,
        backend=None,
        **kwargs,
    ) -> dict[str, Any]:
        """Run the trace/session and collect raw results.

        Returns a dict of raw results.  When *remote* and *backend* are
        set, the dict includes a ``"job_id"`` key.
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
        backend=None,
        **kwargs,
    ) -> ToolData:
        """Run the tool end-to-end: trace + format."""
        raw = self._run(model, *args, remote=remote, backend=backend, **kwargs)
        return self._format(raw, **kwargs)
