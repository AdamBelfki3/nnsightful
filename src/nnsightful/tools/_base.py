from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any

import nnsight
import torch

from ..types import ToolData
from ._utils import IndexSpec, resolve_indices
from .execution import ExecMode

if TYPE_CHECKING:
    from nnsight.tracing.backend import Backend
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
    them handles where the run executes or saving.

    Where it runs is the call's ``exec_mode`` (see
    :mod:`nnsightful.tools.execution`)::

        data = tool(model, prompt)                                # local
        data = tool(model, prompt, exec_mode=ExecMode.REMOTE)     # NDIF, blocking

        job = tool(model, prompt, exec_mode=ExecMode.REMOTE_NON_BLOCKING)
        data = job.result()             # or job.poll(); or, elsewhere,
        # NonBlockingToolBackend.from_job(model, job.job_id).poll()

        run = tool(model, prompt, exec_mode=ExecMode.REMOTE_ASYNC)
        data = await run.result()       # or: async for update in run.updates()
    """

    data_class: type[ToolData]

    def __call__(
        self,
        model: "StandardizedTransformer",
        *args: Any,
        exec_mode: ExecMode | str | Mapping[str, Any] = ExecMode.LOCAL,
        raw: bool = False,
        **kwargs: Any,
    ) -> ToolData | Backend | Any:
        """Run the tool, where ``exec_mode`` says.

        ``LOCAL`` and ``REMOTE`` return the :attr:`data_class` instance (with
        ``raw=True``, the unformatted tensors; see :meth:`_raw`).
        ``REMOTE_NON_BLOCKING`` and ``REMOTE_ASYNC`` return the backend to
        collect it from, and a mapping with a ``backend`` returns that backend
        (built for ``model`` when given as a class).
        """
        session_kwargs = ExecMode.resolve(exec_mode, model)
        run_kwargs, format_kwargs = self._prepare(model, *args, **kwargs)

        with torch.no_grad(), model.session(**session_kwargs):
            outputs = self._run(model, **run_kwargs)
            if raw:
                results = self._raw(model, outputs)
            else:
                results = self._format(model, outputs, **format_kwargs)
            nnsight.save(results)

        backend = session_kwargs.get("backend")
        if backend is not None:
            return backend
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
