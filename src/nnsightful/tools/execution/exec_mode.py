"""The ways a tool can run, and how each becomes a ``model.session``."""

from __future__ import annotations

from collections.abc import Mapping
from enum import Enum
from types import MappingProxyType
from typing import TYPE_CHECKING, Any

from .async_backend import AsyncToolBackend
from .non_blocking import NonBlockingToolBackend

if TYPE_CHECKING:
    from nnterp import StandardizedTransformer


class ExecMode(Enum):
    """The ways a tool can run; see the package docstring.

    Each mode is a preset of the ``model.session`` arguments it stands for,
    read-only since every call shares it. A ``backend`` given as a class is
    built for the run's model.
    """

    LOCAL = MappingProxyType({})
    REMOTE = MappingProxyType({"remote": True})
    REMOTE_NON_BLOCKING = MappingProxyType(
        {"remote": True, "backend": NonBlockingToolBackend}
    )
    REMOTE_ASYNC = MappingProxyType({"remote": True, "backend": AsyncToolBackend})

    @classmethod
    def resolve(
        cls,
        exec_mode: "ExecMode | str | Mapping[str, Any]",
        model: "StandardizedTransformer",
    ) -> dict[str, Any]:
        """The ``model.session`` kwargs ``exec_mode`` stands for.

        A mode is used by its preset, a string by the mode it names (any case),
        and a mapping as is. A ``backend`` class is built for ``model``; the
        ``backend``, built or given, is what the run returns, and without one
        it returns its result instead.

        Raises:
            ValueError: for an unknown mode name, or a non-blocking remote run
                with no backend to collect it from (use
                ``ExecMode.REMOTE_NON_BLOCKING``).
        """
        if isinstance(exec_mode, str):
            try:
                exec_mode = cls[exec_mode.upper()]
            except KeyError:
                names = ", ".join(mode.name.lower() for mode in cls)
                raise ValueError(
                    f"unknown exec_mode {exec_mode!r}; expected one of {names}"
                ) from None
        session = dict(exec_mode.value if isinstance(exec_mode, cls) else exec_mode)

        backend = session.get("backend")
        if isinstance(backend, type):
            backend = session["backend"] = backend.for_model(model)
        if (
            backend is None
            and session.get("remote")
            and session.get("blocking") is False
        ):
            raise ValueError(
                "exec_mode={'remote': True, 'blocking': False} submits a job with "
                "no backend to collect it from; use ExecMode.REMOTE_NON_BLOCKING, "
                "or pass the backend"
            )
        return session
