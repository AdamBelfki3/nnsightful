from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..types import ToolData
from ._utils import IndexSpec, resolve_indices

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Tool():
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

    @staticmethod
    def _select_positions(positions: IndexSpec, n_tokens: int) -> list[int] | None:
        """Resolve a ``positions`` argument against a prompt of ``n_tokens``.

        Returns ``None`` when ``positions`` is ``None`` (every position), else
        the sorted, de-duplicated absolute indices. Negative indices count from
        the end, as in :func:`~nnsightful.tools._utils.resolve_indices`.

        Raises:
            ValueError: if the selection is empty or reaches outside the prompt,
                so a bad selection fails before any trace is run.
        """
        if positions is None:
            return None

        selected = sorted(set(resolve_indices(positions, n_tokens)))
        if not selected:
            raise ValueError(f"positions={positions!r} selects no position.")
        if selected[0] < 0 or selected[-1] >= n_tokens:
            raise ValueError(
                f"positions={positions!r} is outside the prompt's {n_tokens} "
                f"tokens (valid: 0 to {n_tokens - 1}, or -{n_tokens} to -1)."
            )

        return selected

    @staticmethod
    def _position_index(selected: list[int] | None) -> slice | list[int]:
        """Index for the position axis selecting ``selected`` rows.

        A slice when the rows are contiguous (or all of them, for ``None``),
        otherwise the list itself; both are plain indexing that runs the same
        inside a local or remote (NDIF) trace.
        """
        if selected is None:
            return slice(None)
        if selected[-1] - selected[0] + 1 == len(selected):
            return slice(selected[0], selected[-1] + 1)
        return selected

    def _format(self, raw: dict[str, Any], **kwargs) -> ToolData:
        """Format raw results into structured output data."""
        ...

    def __call__(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool=False,
        backend=None,
        non_blocking=False,
        raw=False,
        **kwargs,
    ) -> ToolData:
        """Run the tool end-to-end: trace + format."""

        output = self._run(model, *args, remote=remote, backend=backend, non_blocking=non_blocking, raw=raw, **kwargs)

        if not (non_blocking or raw):
            output = self.__class__.to_data_obj(**output)

        return output
