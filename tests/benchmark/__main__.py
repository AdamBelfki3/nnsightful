"""CLI entry point for benchmarks.

Benchmarks are named, versioned JSON definitions in ``benchmarks/``
(``local_latency``, ``remote_latency``, ``peak_mem``). A benchmark always
runs whole and records one result in ``run.json``; ``--promote`` moves
complete results into the committed ``baseline.json``.

Usage:
    # Run every benchmark (best practice before promoting)
    python -m tests.benchmark --all

    # Run some benchmarks
    python -m tests.benchmark --benchmarks local_latency peak_mem

    # Run individual tests (printed only; not written to run.json)
    python -m tests.benchmark --model gpt2 --tool logit_lens --param prompt_length=25

    # Diff run.json against the baseline, or just show it
    python -m tests.benchmark --show-diff
    python -m tests.benchmark --show --detail

    # Also show the last change of benchmarks not in run.json
    python -m tests.benchmark --show-diff --with-previous

    # Promote complete benchmarks of run.json into baseline.json; commit it
    python -m tests.benchmark --promote
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Sentinel for `--md` with no argument — resolved to a mode-specific default
# filename at call time.
_MD_DEFAULT = object()

_INDIVIDUAL_ONLY_FLAGS = {
    "--repeat",
    "--warmup",
    "--dtype",
    "--no-autocast",
    "--thresholds",
    "--min-length",
    "--max-length",
}


def _resolve_md_path(raw, mode: str, baseline_path: Path) -> Path | None:
    """``None`` (no ``--md``), the default file next to the baseline, or *raw*."""
    if raw is None:
        return None
    if raw is _MD_DEFAULT:
        filename = "results.md" if mode == "show" else "benchmark_diff.md"
        return baseline_path.parent / filename
    return Path(raw)


def _parse_param(text: str) -> tuple[str, list]:
    """``prompt_length=10,25`` -> ``("prompt_length", [10, 25])``."""
    key, _, value = text.partition("=")
    if not key or not value:
        raise argparse.ArgumentTypeError(
            f"expected NAME=VALUE[,VALUE...], got {text!r}"
        )
    values = []
    for v in value.split(","):
        try:
            values.append(int(v))
        except ValueError:
            try:
                values.append(float(v))
            except ValueError:
                values.append(v)
    return key, values


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Run performance benchmarks for nnsightful tools."
    )

    run = p.add_argument_group("running benchmarks")
    run.add_argument(
        "--all",
        action="store_true",
        help="Run every benchmark (best practice before --promote)",
    )
    run.add_argument(
        "--benchmarks",
        nargs="+",
        default=None,
        metavar="NAME",
        help="Run these benchmarks (whole), e.g. local_latency peak_mem",
    )

    ind = p.add_argument_group(
        "individual tests (printed only, never written to run.json)"
    )
    ind.add_argument(
        "--model",
        nargs="+",
        default=None,
        metavar="MODEL",
        help="Model substring(s) of the benchmark definitions, or a full HF name",
    )
    ind.add_argument(
        "--tool", nargs="+", default=None, metavar="TOOL", help="Tool name substring(s)"
    )
    ind.add_argument(
        "--param",
        action="append",
        type=_parse_param,
        default=None,
        metavar="NAME=V[,V]",
        help="Override a sweep parameter's values (latency), e.g. prompt_length=25",
    )
    ind.add_argument("--repeat", type=int, default=None, help="Override n_repeat")
    ind.add_argument("--warmup", type=int, default=None, help="Override n_warmup")
    ind.add_argument("--dtype", default=None, help="Override the local dtype")
    ind.add_argument(
        "--no-autocast",
        action="store_true",
        help="Run without NDIF's torch.autocast context",
    )
    ind.add_argument(
        "--thresholds",
        nargs="+",
        type=float,
        default=None,
        help="Override peak_mem thresholds",
    )
    ind.add_argument(
        "--min-length",
        type=int,
        default=None,
        help="Override the peak_mem search start",
    )
    ind.add_argument(
        "--max-length", type=int, default=None, help="Override the peak_mem search cap"
    )

    show = p.add_argument_group("showing and diffing")
    show.add_argument("--show", action="store_true", help="Print run.json as tables")
    show.add_argument(
        "--show-diff",
        action="store_true",
        help="Print the diff of run.json vs baseline.json",
    )
    show.add_argument(
        "--diff",
        action="store_true",
        help="After running, diff run.json against baseline.json",
    )
    show.add_argument(
        "--with-previous",
        action="store_true",
        help=(
            "In diffs, also show each benchmark not in run.json vs. its previous "
            "baseline result"
        ),
    )
    show.add_argument(
        "--detail",
        action="store_true",
        help=(
            "Full latency columns, every peak-memory point, and failed tests with "
            "errors"
        ),
    )
    show.add_argument(
        "--dims",
        nargs="+",
        choices=["latency", "peak_mem"],
        default=None,
        help="Show only these dimensions",
    )
    show.add_argument(
        "--tools",
        nargs="+",
        default=None,
        help="Show only rows whose tool contains any of these",
    )
    show.add_argument(
        "--models",
        nargs="+",
        default=None,
        help="Show only rows whose model contains any of these",
    )
    show.add_argument("--remote", action="store_true", help="Show only remote latency")
    show.add_argument("--local", action="store_true", help="Show only local results")
    show.add_argument(
        "--md",
        nargs="?",
        default=None,
        const=_MD_DEFAULT,
        help="Also write the output as Markdown (default file next to baseline.json)",
    )
    show.add_argument(
        "--plots",
        action="store_true",
        help="Embed plots in the Markdown (needs matplotlib)",
    )

    files = p.add_argument_group("files")
    files.add_argument(
        "--promote",
        action="store_true",
        help="Promote complete benchmarks of run.json into baseline.json and exit",
    )
    files.add_argument(
        "-n",
        "--name",
        default=None,
        help="Run file tests/benchmark/NAME.json (shortcut for --run)",
    )
    files.add_argument(
        "--run",
        "--latest",
        dest="run",
        type=Path,
        default=None,
        help="Path to the run file (default: tests/benchmark/run.json)",
    )
    files.add_argument(
        "--baseline",
        type=Path,
        default=None,
        help="Path to the baseline file (default: tests/benchmark/baseline.json)",
    )
    args = p.parse_args()

    if args.remote and args.local:
        p.error("--remote and --local are mutually exclusive")
    if args.name is not None:
        if args.run is not None:
            p.error("-n/--name and --run are mutually exclusive")
        from .store import BENCH_DIR

        args.run = BENCH_DIR / f"{args.name}.json"

    args.individual = bool(args.model or args.tool or args.param)
    display = args.show or args.show_diff or args.promote
    if args.individual and (display or args.diff):
        p.error(
            "individual tests (--model / --tool / --param) aren't recorded; they "
            "can't be shown, diffed or promoted"
        )
    if not args.individual:
        provided = sorted(a for a in sys.argv[1:] if a in _INDIVIDUAL_ONLY_FLAGS)
        if provided:
            p.error(
                f"{', '.join(provided)} only apply to individual tests; benchmarks "
                "use their definition's meta_params"
            )
    if not (display or args.individual or args.all or args.benchmarks):
        p.error(
            "nothing to do: pass --all, --benchmarks NAME..., individual-test flags, "
            "or --show / --show-diff / --promote"
        )
    if (args.all or args.benchmarks) and display:
        p.error(
            "run benchmarks and show / promote in separate invocations (use --diff "
            "to diff right after a run)"
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


def _loader(defn: dict, dtype: str | None = None):
    remote = defn["kind"] == "remote"
    dtype = dtype or defn["meta_params"].get("dtype", "bfloat16")
    return lambda name: _load_model(name, remote=remote, dtype=dtype)


def _selected(args, defs: dict) -> list[dict]:
    names = list(defs) if args.all or not args.benchmarks else args.benchmarks
    unknown = [n for n in names if n not in defs]
    if unknown:
        sys.exit(f"error: unknown benchmark(s) {unknown}; defined: {sorted(defs)}")
    return [defs[n] for n in names]


def _run_individual(args, defs: dict) -> None:
    from .diff import print_results
    from .runner import run_individual

    if args.benchmarks:
        chosen = _selected(args, defs)
    else:
        chosen = [d for d in defs.values() if d["kind"] == "local"]
    params = dict(args.param or [])
    overrides = {
        "n_repeat": args.repeat,
        "n_warmup": args.warmup,
        "dtype": args.dtype,
        "autocast": False if args.no_autocast else None,
        "thresholds": tuple(args.thresholds) if args.thresholds else None,
        "min_length": args.min_length,
        "max_length": args.max_length,
    }
    results = {}
    for defn in chosen:
        result = run_individual(
            defn,
            _loader(defn, args.dtype),
            models=args.model,
            tools=args.tool,
            params=params,
            **overrides,
        )
        if result is not None:
            results[defn["name"]] = result
    if not results:
        print("No tests match the given --model / --tool / --param.")
        return
    print("\n(individual tests — not written to run.json)")
    print_results(results, detail=args.detail)


def main() -> None:
    from .definitions import DefinitionError
    from .store import CorruptResultsError

    try:
        _main()
    except (CorruptResultsError, DefinitionError) as e:
        sys.exit(f"error: {e}")


def _main() -> None:
    args = _parse_args()

    from .definitions import BenchmarkDefinition
    from .store import ResultsStore

    store = ResultsStore(run=args.run, baseline=args.baseline)
    if args.promote or args.show or args.show_diff:
        notice = store.partial_notice()
        if notice:
            print(notice)

    if args.promote:
        store.promote()
        return

    if args.individual:
        _run_individual(args, BenchmarkDefinition.load_all())
        return

    filter_remote: bool | None = (
        True if args.remote else (False if args.local else None)
    )

    baseline_path = args.baseline or ResultsStore.BASELINE_FILE
    display = dict(
        tools=args.tools, models=args.models, remote=filter_remote, dims=args.dims
    )

    if args.show:
        from .diff import markdown_results, print_results

        print_results(args.run, detail=args.detail, **display)
        md_path = _resolve_md_path(args.md, "show", baseline_path)
        if md_path is not None:
            md_path.write_text(
                markdown_results(
                    args.run, detail=args.detail, plots=args.plots, **display
                )
            )
            print(f"\n  markdown written to {md_path}")
        return

    if not args.show_diff:
        from .runner import run_benchmark

        for defn in _selected(args, BenchmarkDefinition.load_all()):
            run_benchmark(defn, _loader(defn), args.run)
        if not args.diff:
            return

    from .diff import markdown_diff, print_diff

    print()
    print_diff(args.run, args.baseline, with_previous=args.with_previous, **display)
    md_path = _resolve_md_path(args.md, "diff", baseline_path)
    if md_path is not None:
        md_path.write_text(
            markdown_diff(
                args.run,
                args.baseline,
                plots=args.plots,
                with_previous=args.with_previous,
                **display,
            )
        )
        print(f"\n  markdown written to {md_path}")


if __name__ == "__main__":
    main()
