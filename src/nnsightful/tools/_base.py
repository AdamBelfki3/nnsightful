from __future__ import annotations

from collections.abc import Mapping
from typing import TYPE_CHECKING, Any

import nnsight
import torch

from ..types import ToolData, ToolOption
from ._utils import IndexSpec, resolve_indices
from .chat import ChatTemplate
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

    A tool that takes more than its base arguments, such as a model's own
    implementation of one, declares them as :attr:`OPTIONS`. A call's options
    are checked before :meth:`_prepare` and handed to :meth:`_run` by name,
    each at its default when the call leaves it out; :meth:`options` lists
    them for an interface to offer.

    An option about the prompt a tool is given, rather than about what it
    computes, is one of its :attr:`PROMPT_OPTIONS` instead: checked the same
    way, but handed to :meth:`_prepare`, which turns the prompt into the
    tokens :meth:`_run` traces. The tools that take a prompt offer how it is
    sent this way (:class:`~nnsightful.tools.chat.ChatTemplate`).

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
    OPTIONS: tuple[ToolOption, ...] = ()
    PROMPT_OPTIONS: tuple[ToolOption, ...] = ()

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
        tool = self._for_model(model)
        session_kwargs = ExecMode.resolve(exec_mode, model)
        prompt_options = tool._take_options(tool.PROMPT_OPTIONS, kwargs)
        options = tool._take_options(tool.OPTIONS, kwargs)
        run_kwargs, format_kwargs = tool._prepare(
            model, *args, **prompt_options, **kwargs
        )
        run_kwargs = {**run_kwargs, **options}

        with torch.no_grad(), model.session(**session_kwargs):
            outputs = tool._run(model, **run_kwargs)
            if raw:
                results = tool._raw(model, outputs)
            else:
                results = tool._format(model, outputs, **format_kwargs)
            nnsight.save(results)

        backend = session_kwargs.get("backend")
        if backend is not None:
            return backend
        return results

    def options(
        self, model: "StandardizedTransformer | type"
    ) -> tuple[ToolOption, ...]:
        """The options this tool takes on ``model``: a model, or the class of one.

        They are the :attr:`PROMPT_OPTIONS` and :attr:`OPTIONS` of the
        implementation that runs on it (see :meth:`_for_model`). A model
        whose tokenizer has no chat template is not offered one; the class of
        a model is offered it, since some of its models have one.
        """
        tool = self._for_model(model)
        offered = (*tool.PROMPT_OPTIONS, *tool.OPTIONS)
        if isinstance(model, type) or ChatTemplate.available(model.tokenizer):
            return offered
        return tuple(option for option in offered if option is not ChatTemplate.OPTION)

    def _for_model(self, model: "StandardizedTransformer | type") -> Tool:
        """The implementation of this tool that runs on ``model``.

        This one, unless the model's class brings its own for it: a ``TOOLS``
        mapping from a tool's class to the instance that stands in for it, as
        :class:`~nnsightful.tools.looped.LoopedTransformer` has. ``model`` may
        be that class itself.
        """
        model_class = model if isinstance(model, type) else type(model)
        return getattr(model_class, "TOOLS", {}).get(type(self), self)

    @staticmethod
    def _take_options(
        options: tuple[ToolOption, ...], kwargs: dict[str, Any]
    ) -> dict[str, str]:
        """Take ``options`` out of a call's keyword arguments.

        Returns each by name: the value given, or its default.

        Raises:
            ValueError: if a value is not one the option takes.
        """
        return {
            option.name: option.check(kwargs.pop(option.name, option.default))
            for option in options
        }

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
