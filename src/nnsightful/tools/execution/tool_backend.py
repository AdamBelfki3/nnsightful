"""The base of the backends a tool builds for its non-blocking and async modes."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class ToolBackend:
    """What the tool backends share: how they're built, and where the result is.

    ``RESULT`` is the name ``Tool.__call__`` saves its result under, so it is
    the key of the tool's result in the job's saves.
    """

    RESULT = "results"

    @classmethod
    def for_model(cls, model: "StandardizedTransformer", **kwargs: Any) -> Any:
        """A backend for ``model``'s deployment, carrying its per-request env.

        The env (e.g. the attention implementation, a PEFT adapter) is what
        nnsight sends when it builds a remote backend itself; a backend built
        from the model key alone would run the server's shared model as the
        last request left it.
        """
        return cls(model.to_model_key(), env=model._remoteable_get_env(), **kwargs)
