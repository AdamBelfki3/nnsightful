"""CLI entry point for benchmarks.

Two files are involved:

- ``run.json`` (gitignored) — the most recent run: every slot of the
  selected blocks of the config matrix, measured or placeholder.
- ``baseline.json`` (committed) — the same blocks, each slot current,
  stale (with its own env) or a placeholder; promoted tests carry their
  ``last_change``.

The test matrix (tools × models × params per block) lives in
``config.py``; ``--dims``, ``--remote``, ``--models`` and ``--tools``
select a subset of it.

Usage:
    # Run the local latency block of the config
    python -m tests.benchmark

    # Only some of the config's models (substring match)
    python -m tests.benchmark --models gpt2 gemma

    # More samples per config
    python -m tests.benchmark --repeat 5

    # Show diff against the committed baseline (baseline.json)
    python -m tests.benchmark --diff

    # Both: run benchmarks, then show diff
    python -m tests.benchmark --models gpt2 --diff

    # Only show diff (skip running)
    python -m tests.benchmark --show-diff

    # Show the latest run's results (no diff, no new run)
    python -m tests.benchmark --show

    # Filter display by tools / models (substring, OR-matched)
    python -m tests.benchmark --show-diff --tools logit_lens
    python -m tests.benchmark --show --models gpt2 Llama  # match either
    python -m tests.benchmark --show --tools logit_lens activation_patching

    # Same flags work to scope a benchmark run
    python -m tests.benchmark --models gpt2 --tools logit_lens

    # Filter display to remote-only or local-only rows
    python -m tests.benchmark --show --remote
    python -m tests.benchmark --show --local

    # Export to a chosen Markdown path
    python -m tests.benchmark --show --md report.md
    python -m tests.benchmark --show-diff --md diff.md

    # Use the default path alongside baseline.json
    # (--show  → results.md ; --show-diff / --diff → benchmark_diff.md)
    python -m tests.benchmark --show --md
    python -m tests.benchmark --show-diff --md

    # Include embedded line plots in the Markdown report
    python -m tests.benchmark --show --md --plots

    # Write the run to a named file (tests/benchmark/NAME.json)
    python -m tests.benchmark -n llama_sweep --models meta-llama/Llama-3.1-8B

    # Peak-memory sweep (local GPU, bf16 under NDIF's autocast)
    python -m tests.benchmark --dims peak_mem --models google/gemma-3-1b-pt

    # Latency on production NDIF (https://api.ndif.us, whatever nnsight's config says)
    python -m tests.benchmark --remote --models openai-community/gpt2

    # Show or diff one dimension only
    python -m tests.benchmark --show --dims peak_mem --detail

    # Also show tests not in run.json with their last promoted change
    python -m tests.benchmark --show-diff --with-previous

    # Promote run.json into baseline.json (recording each test's
    # last_change); commit it
    python -m tests.benchmark --promote
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Flags that only affect a benchmark run. If any are present on the command
# line while a display-only mode is active, we warn — they'd be silently
# ignored otherwise. (Note: --models and --dims are *not* in this set — they
# double as display-time filters.)
_BENCHMARK_ONLY_FLAGS = {
    "--repeat", "--warmup", "--dtype", "--no-autocast", "--thresholds",
    "--min-length", "--max-length",
}

_DEFAULT_WARMUP = {"latency": 3, "peak_mem": 1}

# Sentinel for `--md` with no argument — resolved to a mode-specific default
# filename at call time. Using a unique object makes the check unambiguous
# vs. an actual user-supplied string.
_MD_DEFAULT = object()


def _resolve_md_path(raw, mode: str, baseline_path: Path) -> Path | None:
    """Turn the raw ``args.md`` value into a concrete Path (or None).

    - ``None`` → `--md` not passed; no markdown file.
    - ``_MD_DEFAULT`` (from ``--md`` with no argument) → default filename
      in the baseline directory: ``results.md`` for show, ``benchmark_diff.md``
      for diff variants.
    - Anything else (a string from the CLI) → user-supplied path.
    """
    if raw is None:
        return None
    if raw is _MD_DEFAULT:
        filename = "results.md" if mode == "show" else "benchmark_diff.md"
        return baseline_path.parent / filename
    return Path(raw)


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Run performance benchmarks for nnsightful tools.",
    )
    p.add_argument(
        "--models",
        nargs="+",
        default=None,
        help=(
            "Model substrings (OR-matched). In benchmark mode: run only the "
            "selected block's config models that match (default: all of them). "
            "In display modes (--show / --diff / --show-diff): a row matches "
            "if its model contains ANY of the given strings."
        ),
    )
    p.add_argument(
        "--repeat",
        type=int,
        default=3,
        help="Number of timed runs per configuration (default: 3)",
    )
    p.add_argument(
        "--warmup",
        type=int,
        default=None,
        help=(
            "Untimed warmup calls: per (config, model) before a latency sweep "
            "(default: 3), per point of a peak_mem sweep (default: 1)."
        ),
    )
    p.add_argument(
        "--dims",
        nargs="+",
        choices=["latency", "peak_mem"],
        default=None,
        help=(
            "Benchmark dimension(s). In benchmark mode: what to run "
            "(default: latency). In display modes: what to show (default: "
            "every dimension with data)."
        ),
    )
    p.add_argument(
        "--dtype",
        default="bfloat16",
        help="Dtype local models are loaded (and autocast) in (default: bfloat16, as on NDIF)",
    )
    p.add_argument(
        "--no-autocast",
        action="store_true",
        help="Run local calls without NDIF's torch.autocast context",
    )
    p.add_argument(
        "--thresholds",
        nargs="+",
        type=float,
        default=[0.10, 0.25, 0.50],
        help="peak_mem: fractions of the model footprint to find max prompt lengths for (default: 0.10 0.25 0.50)",
    )
    p.add_argument(
        "--min-length",
        type=int,
        default=2,
        help="peak_mem: smallest prompt length of the sweep (default: 2)",
    )
    p.add_argument(
        "--max-length",
        type=int,
        default=4096,
        help="peak_mem: largest prompt length searched, besides the model's context (default: 4096)",
    )
    p.add_argument(
        "--remote",
        action="store_true",
        help=(
            "On a benchmark run: dispatch tools remotely (remote=True). "
            "On --show / --diff / --show-diff: also filter the output to "
            "remote rows only. Mutually exclusive with --local."
        ),
    )
    p.add_argument(
        "--local",
        action="store_true",
        help=(
            "On --show / --diff / --show-diff: filter the output to local "
            "rows only. Has no effect during a benchmark run. Mutually "
            "exclusive with --remote."
        ),
    )
    p.add_argument(
        "--diff",
        action="store_true",
        help="After running, diff run.json against baseline.json",
    )
    p.add_argument(
        "--show-diff",
        action="store_true",
        help="Only print diff of run.json vs baseline.json (skip running benchmarks)",
    )
    p.add_argument(
        "--show",
        action="store_true",
        help="Only print the latest run's results as a table (skip running benchmarks)",
    )
    p.add_argument(
        "--detail",
        action="store_true",
        help="Show full latency columns (min/max + breakdown) instead of just mean/std",
    )
    p.add_argument(
        "--md",
        nargs="?",
        default=None,
        const=_MD_DEFAULT,
        help=(
            "Also write the --show / --diff / --show-diff output to a Markdown "
            "file. Pass a path to choose the destination, or pass --md with no "
            "argument to use the default filename in the baseline's directory "
            "(results.md for --show, benchmark_diff.md for --diff / "
            "--show-diff). Stdout output is unchanged."
        ),
    )
    p.add_argument(
        "--plots",
        action="store_true",
        help=(
            "Embed one line plot per (tool, section) in the --show Markdown "
            "export, showing mean latency vs. the swept parameter with one "
            "line per model. Requires matplotlib (install via the `plots` "
            "extra: `pip install -e '.[plots]'`)."
        ),
    )
    p.add_argument(
        "--promote",
        action="store_true",
        help=(
            "Promote run.json into baseline.json (merge into current if the "
            "environment is the same, else make it current and move what it "
            "didn't re-run to stale, per kind), record each re-run test's "
            "last_change, and exit"
        ),
    )
    p.add_argument(
        "--tools",
        nargs="+",
        default=None,
        help=(
            "Tool name substrings. In benchmark mode: only configs whose "
            "tool_name matches at least one of these are run (default: "
            "run all). In display modes: substring filters — a row matches "
            "if its tool_name contains ANY of the given strings."
        ),
    )
    p.add_argument(
        "-n",
        "--name",
        default=None,
        help=(
            "Name for the run file (resolved to "
            "tests/benchmark/NAME.json). Shortcut for --run; cannot be "
            "combined with --run."
        ),
    )
    p.add_argument(
        "--run",
        "--latest",
        dest="run",
        type=Path,
        default=None,
        help="Path to the run file (default: tests/benchmark/run.json)",
    )
    p.add_argument(
        "--with-previous",
        action="store_true",
        help=(
            "In diffs, also show tests not in run.json with their last change "
            "(the last_change recorded in the baseline; hidden by default)"
        ),
    )
    p.add_argument(
        "--baseline",
        type=Path,
        default=None,
        help="Path to the baseline file (default: tests/benchmark/baseline.json)",
    )
    args = p.parse_args()

    if args.remote and args.local:
        p.error("--remote and --local are mutually exclusive")

    running = not (args.show or args.show_diff or args.promote)
    if running and args.remote and args.dims and "peak_mem" in args.dims:
        p.error("peak_mem is measured locally; drop --remote")

    if args.name is not None:
        if args.run is not None:
            p.error("-n/--name and --run are mutually exclusive")
        from .store import BENCH_DIR

        args.run = BENCH_DIR / f"{args.name}.json"

    # Warn when benchmark-only flags are passed alongside a display-only mode;
    # they'd be silently ignored otherwise and that's confusing.
    if args.show or args.show_diff or args.promote:
        provided = {a for a in sys.argv[1:] if a in _BENCHMARK_ONLY_FLAGS}
        if provided:
            mode = next(
                m for m, v in (("--show", args.show),
                               ("--show-diff", args.show_diff),
                               ("--promote", args.promote)) if v
            )
            print(
                f"warning: {', '.join(sorted(provided))} have no effect in "
                f"{mode} mode (no benchmark run happens)."
            )

    return args


def _load_model(name: str, remote: bool, dtype: str):
    """Load *name* dispatched on the local GPU, or as a meta model for remote runs."""
    import torch
    from nnterp import StandardizedTransformer

    print(f"Loading model: {name}")
    if remote:
        return StandardizedTransformer(
            name,
            device_map="auto",
            dispatch=False,
            allow_dispatch=False,
            check_renaming=False,
            remote=False,
        )
    return StandardizedTransformer(
        name,
        dtype=getattr(torch, dtype),
        device_map="cuda" if torch.cuda.is_available() else "cpu",
        dispatch=True,
    )


def main() -> None:
    from .store import CorruptResultsError

    try:
        _main()
    except CorruptResultsError as e:
        sys.exit(f"error: {e}")


def _main() -> None:
    args = _parse_args()

    if args.promote:
        from .store import promote_files

        from .config import config_slots

        promote_files(args.run, args.baseline, config_slots())
        return

    # --remote filters display to remote rows; --local filters to local rows;
    # neither → show all rows.
    if args.remote:
        filter_remote: bool | None = True
    elif args.local:
        filter_remote = False
    else:
        filter_remote = None

    # The baseline path drives the default --md directory.
    from .store import BASELINE_FILE

    baseline_path = args.baseline or BASELINE_FILE

    if args.show:
        from .diff import markdown_results, print_results

        print_results(
            args.run,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
            detail=args.detail,
            dims=args.dims,
        )
        md_path = _resolve_md_path(args.md, "show", baseline_path)
        if md_path is not None:
            md_path.write_text(markdown_results(
                args.run,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
                detail=args.detail,
                plots=args.plots,
                dims=args.dims,
            ))
            print(f"\n  markdown written to {md_path}")
        return

    if args.show_diff:
        from .diff import markdown_diff, print_diff

        print_diff(
            args.run,
            args.baseline,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
            dims=args.dims,
            with_previous=args.with_previous,
        )
        md_path = _resolve_md_path(args.md, "diff", baseline_path)
        if md_path is not None:
            md_path.write_text(markdown_diff(
                args.run,
                args.baseline,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
                plots=args.plots,
                dims=args.dims,
                with_previous=args.with_previous,
            ))
            print(f"\n  markdown written to {md_path}")
        return

    from .config import benchmark_config, block_slots
    from .diff import print_diff
    from .runner import BenchmarkRunner, free_cuda

    config = benchmark_config()
    kind = "remote" if args.remote else "local"
    for dim in args.dims or ["latency"]:
        block = "peak_mem" if dim == "peak_mem" else f"latency.{kind}"
        block_config = config[block]
        tools = [
            c for c in block_config.tools
            if not args.tools or any(t in c.tool_name for t in args.tools)
        ]
        models = [
            m for m in block_config.models
            if not args.models or any(sub in m for sub in args.models)
        ]
        if not tools or not models:
            print(
                f"warning: no {block} tests match --tools {args.tools} / --models "
                f"{args.models} (config models: {block_config.models}); nothing to run."
            )
            continue

        warmup = args.warmup if args.warmup is not None else _DEFAULT_WARMUP[dim]
        runner = BenchmarkRunner(
            n_repeat=args.repeat,
            n_warmup=warmup,
            remote=args.remote,
            dtype=args.dtype,
            autocast=not args.no_autocast,
            thresholds=tuple(args.thresholds),
            min_length=args.min_length,
            max_length=args.max_length,
        )
        print(
            f"\nRunning {block} ({len(tools)} tool(s) × {len(models)} model(s); "
            f"{warmup} warmup + {args.repeat} repeat per task)..."
        )
        slots = block_slots(block, block_config)
        for name in models:
            try:
                model = _load_model(name, remote=args.remote, dtype=args.dtype)
            except Exception as exc:
                print(f"  FAILED to load {name}: {type(exc).__name__}: {exc}")
                failed = [
                    {**s, "status": "failed", "stats": None, "error": f"model load: {exc}"[:500]}
                    for s in slots if s["model"] == name and any(t.tool_name == s["tool"] for t in tools)
                ]
                runner.save(block, failed, slots, args.run)
                continue
            if block == "peak_mem":
                measured = runner.run_peak_mem(name, model, tools)
            else:
                measured = runner.run(name, model, tools)
            runner.save(block, measured, slots, args.run)
            del model
            free_cuda()

    if args.diff:
        print()
        # Match the mode we just ran in: if --remote, show remote rows only
        print_diff(
            args.run,
            args.baseline,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
            dims=args.dims,
            with_previous=args.with_previous,
        )
        md_path = _resolve_md_path(args.md, "diff", baseline_path)
        if md_path is not None:
            from .diff import markdown_diff

            md_path.write_text(markdown_diff(
                args.run,
                args.baseline,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
                plots=args.plots,
                dims=args.dims,
                with_previous=args.with_previous,
            ))
            print(f"\n  markdown written to {md_path}")


if __name__ == "__main__":
    main()
