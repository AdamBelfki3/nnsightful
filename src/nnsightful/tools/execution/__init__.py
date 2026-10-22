"""How a tool runs: locally, on NDIF blocking, non-blocking, or as an async stream.

A tool's ``exec_mode`` is a dict of ``model.session`` arguments (``remote``,
``backend``, ...), or an :class:`ExecMode` — a named preset of one — given as
the member or its name. A ``backend`` given as a class is built for the run's
model:

- ``ExecMode.LOCAL`` / ``ExecMode.REMOTE`` run to completion and return the
  tool's data (or raw output with ``raw=True``).
- ``ExecMode.REMOTE_NON_BLOCKING`` submits the job and returns a
  :class:`NonBlockingToolBackend` to collect the result from later — possibly
  from another process, rebuilt from the job id.
- ``ExecMode.REMOTE_ASYNC`` submits the job and returns an
  :class:`AsyncToolBackend` to await the result or stream status updates.
- Any other mapping with a ``backend`` returns that backend: the caller
  drives it. A backend serves one run, so pass a new instance (or the class,
  built afresh for each run) on every call.

The two backends are nnsight's, built for the model (with its per-request
environment) and turned to the tool: their results are the tool's result
rather than the job's raw saves.
"""

from .async_backend import AsyncToolBackend
from .exec_mode import ExecMode
from .non_blocking import NonBlockingToolBackend

__all__ = ["AsyncToolBackend", "ExecMode", "NonBlockingToolBackend"]
