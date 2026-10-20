from __future__ import annotations

from typing import TYPE_CHECKING, Any

import nnsight
import torch

from ..types import ToolData
from ._utils import IndexSpec, resolve_indices

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class Tool():
    """Abstract base for nnsightful tools.

    ``__call__`` drives every run in the same steps:

    1. :meth:`_prepare` (client-side): resolve and validate the arguments into
       those of :meth:`_run` and :meth:`_format`, so a bad call fails before
       anything is traced or sent to NDIF.
    2. A ``model.session`` (remote or local) around:

       - :meth:`_run`: the tool's traces, returning the tensors it collected;
       - :meth:`_format` (or :meth:`_raw` with ``raw=True``): turning them
         into the :attr:`data_class` instance. It runs in the session, so on
         NDIF it runs server-side and only the payload is sent back.

    Subclasses set :attr:`data_class` and implement those hooks; none of
    them handles ``remote``, ``backend``, ``non_blocking`` or saving.

    End users call the tool directly::

        data = tool(model, prompt, ...)

    For async two-phase patterns (e.g. workbench), submit without waiting and
    read the instance from the job's results::

        job_id = tool(model, prompt, remote=True, backend=backend, non_blocking=True)
        # ... later, from a backend polling that job ...
        data = backend()["results"]
    """

    data_class: type[ToolData]

    def __call__(
        self,
        model: "StandardizedTransformer",
        *args,
        remote: bool = False,
        backend=None,
        non_blocking: bool = False,
        raw: bool = False,
        **kwargs,
    ) -> ToolData | Any:
        """Run the tool.

        Returns the :attr:`data_class` instance; with ``raw=True`` the
        unformatted tensors (see :meth:`_raw`), and with ``remote`` and
        ``non_blocking`` the NDIF job id to poll.
        """
        run_kwargs, format_kwargs = self._prepare(model, *args, **kwargs)

        with torch.no_grad(), model.session(remote=remote, backend=backend):
            outputs = self._run(model, **run_kwargs)
            if raw:
                results = self._raw(model, outputs)
            else:
                results = self._format(model, outputs, **format_kwargs)
            nnsight.save(results)

        if remote and non_blocking:
            return backend.job_id

        return results

    def format(self, *args, **kwargs) -> ToolData:
        """Format a run's tensors into a :attr:`data_class` instance.

        Delegates to ``data_class.format`` (e.g.
        :meth:`~nnsightful.types.LogitLensData.format`), which documents the
        arguments.
        """
        return self.data_class.format(*args, **kwargs)

    def _prepare(
        self, model: "StandardizedTransformer", *args, **kwargs
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Resolve and validate the call's arguments.

        Returns the keyword arguments of :meth:`_run` and of :meth:`_format`;
        each of those lists the arguments it takes.
        """
        raise NotImplementedError

    def _run(self, model: "StandardizedTransformer", **kwargs) -> dict[str, Any]:
        """Trace the model and return the tensors the tool collected."""
        raise NotImplementedError

    def _format(
        self, model: "StandardizedTransformer", outputs: dict[str, Any], **kwargs
    ) -> ToolData:
        """Turn a run's outputs into the :attr:`data_class` instance."""
        raise NotImplementedError

    def _raw(self, model: "StandardizedTransformer", outputs: dict[str, Any]) -> Any:
        """What ``raw=True`` returns: the run's outputs, unformatted."""
        return outputs

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

