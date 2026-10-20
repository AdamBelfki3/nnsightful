from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..types import ToolData
from ._utils import IndexSpec, resolve_indices

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Tool():
    """Abstract base for nnsightful tools.

    Subclasses set :attr:`data_class` to their result data class and implement
    ``_run``, which sets up the trace/session, collects the tensors and, still
    inside the trace, formats them with :meth:`format` into a ``data_class``
    instance. On NDIF that runs server-side, and the instance is what is saved
    and sent back. With ``raw=True`` ``_run`` returns the tensors unformatted
    instead; :meth:`format` can be applied to them afterwards.

    End users call the tool directly::

        data = tool(model, prompt, ...)

    For async two-phase patterns (e.g. workbench), submit with ``_run`` and
    read the instance from the job's results::

        job_id = tool._run(
            model, prompt, remote=True, backend=backend, non_blocking=True
        )
        # ... later, from a backend polling that job ...
        data = backend()["results"]
    """

    data_class: type[ToolData]

    def _run(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool = False,
        backend=None,
        **kwargs,
    ) -> ToolData | Any:
        """Run the trace/session and return the formatted data.

        With ``raw=True`` returns the unformatted tensors instead, and with
        ``remote`` and ``non_blocking`` the NDIF job id to poll.
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

    def format(self, *args, **kwargs) -> ToolData:
        """Format a run's tensors into a :attr:`data_class` instance.

        Delegates to ``data_class.format`` (e.g.
        :meth:`~nnsightful.types.LogitLensData.format`), which documents the
        arguments.
        """
        return self.data_class.format(*args, **kwargs)

    def __call__(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool=False,
        backend=None,
        non_blocking=False,
        raw=False,
        **kwargs,
    ) -> ToolData | Any:
        """Run the tool; same as ``_run``."""
        return self._run(
            model,
            *args,
            remote=remote,
            backend=backend,
            non_blocking=non_blocking,
            raw=raw,
            **kwargs,
        )
