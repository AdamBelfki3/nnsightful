"""CLI entry point for benchmarks.

Two files are involved:

- ``latest.json`` (gitignored) — the most recent run. Written by every
  ``python -m tests.benchmark`` invocation.
- ``results.json`` (committed) — the baseline to diff against.
  Promoted from ``latest.json`` when you're happy with the numbers.

Usage:
    # Run benchmarks with default models and configs
    python -m tests.benchmark

    # Specify models
    python -m tests.benchmark --models gpt2 Maykeye/TinyLLama-v0

    # More samples per config
    python -m tests.benchmark --repeat 5

    # Show diff against the committed baseline (results.json)
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

    # Export the show / diff output as a Markdown file too
    python -m tests.benchmark --show --md report.md
    python -m tests.benchmark --show-diff --md diff.md

    # Write the run to a named file (tests/benchmark/NAME.json)
    python -m tests.benchmark -n llama_sweep --models meta-llama/Llama-3.1-8B

    # Promote latest.json -> results.json to set the new baseline,
    # then commit results.json
    python -m tests.benchmark --promote
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Flags that only affect a benchmark run. If any are present on the command
# line while a display-only mode is active, we warn — they'd be silently
# ignored otherwise. (Note: --models is *not* in this set — it doubles as a
# display-time substring filter.)
_BENCHMARK_ONLY_FLAGS = {"--repeat", "--warmup"}


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Run performance benchmarks for nnsightful tools.",
    )
    p.add_argument(
        "--models",
        nargs="+",
        default=None,
        help=(
            "HuggingFace model names. In benchmark mode: models to load "
            "(default: gpt2). In display modes (--show / --diff / "
            "--show-diff): substring filters — a row matches if its model "
            "contains ANY of the given strings."
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
        default=3,
        help="Per-tool warmup calls fired once before each (config, model)'s combo sweep (default: 3). Independent of the once-per-model forward-pass warmup at startup.",
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
        help="After running, diff latest.json against results.json",
    )
    p.add_argument(
        "--show-diff",
        action="store_true",
        help="Only print diff of latest.json vs results.json (skip running benchmarks)",
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
        type=Path,
        default=None,
        help=(
            "Also write the --show / --diff / --show-diff output to this file "
            "as Markdown tables. Stdout output is unchanged."
        ),
    )
    p.add_argument(
        "--promote",
        action="store_true",
        help="Promote latest.json into results.json (set it as the new baseline) and exit",
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
            "Name for the latest-run file (resolved to "
            "tests/benchmark/NAME.json). Shortcut for --latest; cannot be "
            "combined with --latest."
        ),
    )
    p.add_argument(
        "--latest",
        type=Path,
        default=None,
        help="Path to the latest-run file (default: tests/benchmark/latest.json)",
    )
    p.add_argument(
        "--baseline",
        type=Path,
        default=None,
        help="Path to the baseline file (default: tests/benchmark/results.json)",
    )
    args = p.parse_args()

    if args.remote and args.local:
        p.error("--remote and --local are mutually exclusive")

    if args.name is not None:
        if args.latest is not None:
            p.error("-n/--name and --latest are mutually exclusive")
        from .runner import LATEST_FILE

        args.latest = LATEST_FILE.parent / f"{args.name}.json"

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


def main() -> None:
    args = _parse_args()

    if args.promote:
        from .runner import promote_latest_to_baseline

        promote_latest_to_baseline(args.latest, args.baseline)
        return

    # --remote filters display to remote rows; --local filters to local rows;
    # neither → show all rows.
    if args.remote:
        filter_remote: bool | None = True
    elif args.local:
        filter_remote = False
    else:
        filter_remote = None

    if args.show:
        from .diff import markdown_results, print_results

        print_results(
            args.latest,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
            detail=args.detail,
        )
        if args.md:
            args.md.write_text(markdown_results(
                args.latest,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
                detail=args.detail,
            ))
            print(f"\n  markdown written to {args.md}")
        return

    if args.show_diff:
        from .diff import markdown_diff, print_diff

        print_diff(
            args.latest,
            args.baseline,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
        )
        if args.md:
            args.md.write_text(markdown_diff(
                args.latest,
                args.baseline,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
            ))
            print(f"\n  markdown written to {args.md}")
        return

    from nnterp import StandardizedTransformer

    from .config import default_configs
    from .diff import print_diff
    from .runner import BenchmarkRunner

    models_to_load = args.models or ["gpt2"]
    models: dict[str, StandardizedTransformer] = {}
    for name in models_to_load:
        print(f"Loading model: {name}")

        models[name] = StandardizedTransformer(
            name,
            device_map="auto",
            dispatch=not args.remote,
            allow_dispatch=not args.remote,
            check_renaming=not args.remote,
            remote=False,
        )

    runner = BenchmarkRunner(
        n_repeat=args.repeat,
        n_warmup=args.warmup,
        remote=args.remote,
    )
    configs = default_configs()
    if args.tools:
        configs = [
            c for c in configs
            if any(t in c.tool_name for t in args.tools)
        ]
        if not configs:
            print(
                f"warning: no configs match --tools {args.tools}; nothing to run."
            )
            return

    mode = "remote" if args.remote else "local"
    print(
        f"\nRunning benchmarks [{mode}] "
        f"({args.warmup} warmup + {args.repeat} repeat per task)..."
    )
    runner.run_and_save(models, configs, args.latest)

    if args.diff:
        print()
        # Match the mode we just ran in: if --remote, show remote rows only
        print_diff(
            args.latest,
            args.baseline,
            tools=args.tools,
            models=args.models,
            remote=filter_remote,
        )
        if args.md:
            from .diff import markdown_diff

            args.md.write_text(markdown_diff(
                args.latest,
                args.baseline,
                tools=args.tools,
                models=args.models,
                remote=filter_remote,
            ))
            print(f"\n  markdown written to {args.md}")


if __name__ == "__main__":
    main()
