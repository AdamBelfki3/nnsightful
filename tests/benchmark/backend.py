"""Custom nnsight remote backend that captures per-phase latency.

Wraps ``RemoteBackend`` and tracks queue, run, and download times
via the status callback. After a trace completes, ``get_latency()``
returns a dict with ``total``, ``total_unqueued``, ``running``, and
``download`` — all in seconds.
"""

from __future__ import annotations

import time

from nnsight.intervention.backends.remote import RemoteBackend


class RemoteBackendCounter(RemoteBackend):
    """Remote backend that records per-phase latency for benchmarking."""

    def __init__(self, *args, **kwargs):
        self.start_time = time.time()

        self.queue_start: float = 0
        self.queue_latency: float = 0

        self.run_start: float = 0
        self.run_latency: float = 0

        self.completed_time: float = 0

        super().__init__(*args, **kwargs)

    def handle(self, response):
        """Record the phase timestamps, then let ``RemoteBackend`` process the update.

        nnsight routes every status update through ``handle``, and on
        COMPLETED it also downloads the result, so the timestamps are taken
        first to keep the download out of ``running``.
        """
        status = response.status.value

        if status == "QUEUED" and self.queue_start == 0:
            self.queue_start = time.time()
        if status == "DISPATCHED" and self.queue_start != 0:
            self.queue_latency = time.time() - self.queue_start
        if status == "RUNNING":
            self.run_start = time.time()
        if status == "COMPLETED":
            self.completed_time = time.time()
            self.run_latency = self.completed_time - self.run_start

        return super().handle(response)

    def get_latency(self) -> dict[str, float]:
        """Return per-phase latencies in seconds."""
        end_time = time.time()
        return {
            "total": end_time - self.start_time,
            "total_unqueued": end_time - self.start_time - self.queue_latency,
            "running": self.run_latency,
            "download": end_time - self.completed_time,
        }
