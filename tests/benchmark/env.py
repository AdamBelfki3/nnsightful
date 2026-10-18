"""Environment stamps: everything that makes a benchmark's results comparable.

:class:`Env` captures the stamp (git state, package versions, GPU, NDIF
server) and owns the rules on stamps (fields per kind, differences,
labels). Captured stamps are plain dicts stored in each result's ``env``.
"""

from __future__ import annotations

import hashlib
import importlib
import platform
import subprocess
import time
from pathlib import Path
from typing import Any


class Env:
    """Capture and compare environment stamps (README: ``env`` fields)."""

    DIR = Path(__file__).parent
    PRODUCTION_HOST = "https://api.ndif.us"
    CLIENT_PACKAGES = ("nnsight", "nnterp", "transformers", "torch")
    SERVER_PACKAGES = ("ndif", "nnsight", "nnterp", "torch", "transformers")
    OUTPUT_FILES = ("baseline.json", "results.md", "benchmark_diff.md")

    CODE_FIELDS = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")
    CLIENT_FIELDS = ("nnsight", "nnsight_commit", "nnterp", "nnterp_commit")
    FIELDS = {
        "local": (
            *CODE_FIELDS,
            "python",
            *CLIENT_FIELDS,
            "transformers",
            "transformers_commit",
            "torch",
            "torch_commit",
            "gpu",
            "dtype",
            "autocast",
        ),
        "remote": (*CODE_FIELDS, *CLIENT_FIELDS, "remote_server"),
    }
    NOT_WARNED = ("git_hash", "dirty", "dirty_fingerprint", "timestamp")
    UNKNOWN_SERVER = "unknown"

    # ---- capture -----------------------------------------------------------

    @classmethod
    def capture(
        cls,
        kind: str,
        dtype: str,
        autocast: bool,
        remote_server: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """The stamp of *kind* for this checkout, packages and GPU."""
        import torch

        env = {
            **cls.git_state(),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "python": platform.python_version(),
        }
        env.update(cls.package_info())
        if torch.cuda.is_available():
            env["gpu"] = torch.cuda.get_device_name(0)
        env["dtype"] = dtype
        env["autocast"] = autocast
        if remote_server is not None:
            env["remote_server"] = remote_server
        return {"kind": kind, **cls.for_kind(env, kind)}

    @staticmethod
    def _git(*args: str, cwd: Path = DIR) -> str | None:
        try:
            return subprocess.check_output(
                ["git", *args], cwd=cwd, stderr=subprocess.DEVNULL
            ).decode()
        except Exception:
            return None

    @classmethod
    def git_state(cls) -> dict[str, Any]:
        """``git_hash``, ``dirty`` and (when dirty) a ``dirty_fingerprint``.

        Benchmark outputs (baseline, reports) don't count as
        changes; ``run.json`` is gitignored. The fingerprint hashes the diff
        against HEAD plus untracked files, so two dirty runs of identical code
        share it.
        """
        git = cls._git
        head = git("rev-parse", "HEAD")
        if head is None:
            return {"git_hash": "unknown", "dirty": True}
        top = Path(git("rev-parse", "--show-toplevel").strip())
        excluded = [str((cls.DIR / f).relative_to(top)) for f in cls.OUTPUT_FILES]
        pathspec = [".", *(f":(exclude){f}" for f in excluded)]
        status = (
            git(
                "status",
                "--porcelain",
                "--untracked-files=all",
                "--",
                *pathspec,
                cwd=top,
            )
            or ""
        )
        state: dict[str, Any] = {
            "git_hash": head.strip(),
            "dirty": bool(status.strip()),
        }
        if state["dirty"]:
            digest = hashlib.sha256(
                (git("diff", "HEAD", "--", *pathspec, cwd=top) or "").encode()
            )
            untracked = (
                git(
                    "ls-files",
                    "--others",
                    "--exclude-standard",
                    "--",
                    *pathspec,
                    cwd=top,
                )
                or ""
            )
            for name in sorted(untracked.splitlines()):
                digest.update(name.encode())
                digest.update((top / name).read_bytes())
            state["dirty_fingerprint"] = digest.hexdigest()[:16]
        return state

    @classmethod
    def package_info(cls) -> dict[str, str]:
        """Versions of the key packages, plus the git commit of editable checkouts."""
        info = {}
        for name in cls.CLIENT_PACKAGES:
            module = importlib.import_module(name)
            info[name] = module.__version__
            src = Path(module.__file__)
            tracked = cls._git("ls-files", "--error-unmatch", src.name, cwd=src.parent)
            if tracked is not None:
                info[f"{name}_commit"] = cls._git(
                    "rev-parse", "HEAD", cwd=src.parent
                ).strip()
        return info

    @classmethod
    def remote_server_info(cls, host: str) -> dict[str, Any]:
        """Host plus the server's python / package versions from ``/env``."""
        import httpx

        info: dict[str, Any] = {"host": host}
        try:
            env = httpx.get(f"{host}/env", timeout=10).json()
        except Exception as exc:
            info["error"] = f"{type(exc).__name__}: {exc}"
            return info
        info["python"] = str(env.get("python_version", "")).split(" ")[0]
        packages = env.get("packages", {})
        info["packages"] = {
            k: packages[k] for k in cls.SERVER_PACKAGES if k in packages
        }
        return info

    # ---- rules on stamps ---------------------------------------------------

    @classmethod
    def for_kind(cls, env: dict[str, Any], kind: str) -> dict[str, Any]:
        """The fields of *env* that matter for *kind*.

        Remote always gets ``remote_server`` (``"unknown"`` if absent).
        """
        out = {k: env[k] for k in cls.FIELDS[kind] if k in env}
        if kind == "remote":
            out.setdefault("remote_server", cls.UNKNOWN_SERVER)
        return out

    @classmethod
    def differences(cls, base: dict[str, Any], new: dict[str, Any]) -> list[str]:
        """``field: old -> new`` for differing fields other than code-state stamps."""
        out = []
        for field in sorted(set(base) | set(new)):
            if field in cls.NOT_WARNED:
                continue
            if base.get(field) != new.get(field):
                out.append(f"{field}: {base.get(field, '-')} -> {new.get(field, '-')}")
        return out

    @staticmethod
    def label(env: dict[str, Any] | None) -> str:
        """``9f8e7d6 2026-04-23`` (``+dirty`` when the tree had changes)."""
        if not env:
            return "(none)"
        git_hash = (env.get("git_hash") or "?")[:7]
        label = f"{git_hash} {(env.get('timestamp') or '?')[:10]}"
        return label + ("+dirty" if env.get("dirty") else "")

    @staticmethod
    def same_measurement(a: dict[str, Any] | None, b: dict[str, Any] | None) -> bool:
        """Same stamp (git hash, timestamp, dirty fingerprint): the very same result."""
        return all(
            (a or {}).get(k) == (b or {}).get(k)
            for k in ("git_hash", "timestamp", "dirty_fingerprint")
        )
