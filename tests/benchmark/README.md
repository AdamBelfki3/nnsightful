# Benchmarks

Performance benchmarking for nnsightful tools. Loops over models and
parameter sweeps, captures latency (with a per-phase breakdown for
remote runs), writes each run to a local `latest.json`, and diffs it
against the committed `results.json` baseline.

## Two files, two roles

| File | Tracked by git? | Role |
|------|-----------------|------|
| `latest.json` | **No** (gitignored) | Overwritten (or section-merged) by every benchmark run. What the diff and show commands read. |
| `results.json` | **Yes** | The baseline you diff against. Updated explicitly via `--promote`, then committed. |

Workflow:

1. `python -m tests.benchmark` → writes `latest.json`.
2. `python -m tests.benchmark --show-diff` → shows `latest.json` vs. `results.json`.
3. Happy with the numbers? `python -m tests.benchmark --promote` → merges `latest.json` into `results.json`.
4. `git add results.json && git commit` → the new baseline is recorded.

## Running

```bash
# Default: run with gpt2, 3 repeats per config
python -m tests.benchmark

# Multiple models
python -m tests.benchmark --models gpt2 Maykeye/TinyLLama-v0

# Scope to a subset of tools (substring match on tool_name)
python -m tests.benchmark --tools logit_lens

# More samples per config
python -m tests.benchmark --repeat 5

# Tune per-(config, model) warmup (default 3)
python -m tests.benchmark --warmup 5 --repeat 5

# Execute remotely (NDIF / configured backend) instead of locally
python -m tests.benchmark --remote

# Write the run to a named file (tests/benchmark/NAME.json)
python -m tests.benchmark -n llama_sweep --models meta-llama/Llama-3.1-8B

# Run + show diff against the baseline
python -m tests.benchmark --diff

# Only show diff (no new run)
python -m tests.benchmark --show-diff

# Only show the latest run's results as a table (no diff, no new run)
python -m tests.benchmark --show

# Show the full latency breakdown (min/max + remote sub-phases)
python -m tests.benchmark --show --detail

# Filter display by tools / models (substring, OR-matched)
python -m tests.benchmark --show-diff --tools logit_lens
python -m tests.benchmark --show --models gpt2 Llama

# Show only the remote or local section
python -m tests.benchmark --show --remote
python -m tests.benchmark --show-diff --local

# Export a display to Markdown alongside stdout
python -m tests.benchmark --show --md report.md
python -m tests.benchmark --show-diff --md diff.md

# Promote latest.json into results.json (update the baseline), then commit
python -m tests.benchmark --promote
```

### Flags that do double duty

`--tools` and `--models` work in both benchmark and display modes:

- **Benchmark run**: narrow the set of configs / models to run.
  `--tools logit_lens` only runs configs whose name contains
  `logit_lens`. `--models gpt2 llama` loads both models and benchmarks
  them.
- **Display mode** (`--show` / `--diff` / `--show-diff`): OR-substring
  filter. A row is kept if its field contains *any* of the provided
  strings.

`--remote` and `--local` (mutually exclusive):

- **Benchmark run**: `--remote` dispatches tools to the configured
  backend. `--local` has no effect here (already the default).
- **Display mode**: `--remote` restricts output to the remote section;
  `--local` to the local section. Without either, both sections show
  as separate tables.

### File-name shortcuts

- `-n NAME` → shortcut for `--latest tests/benchmark/NAME.json`. Useful
  for keeping multiple named scratch files side by side.
- `--latest PATH` → full override of the latest-run file path. Takes
  any path (absolute, relative, outside the repo).
- `--baseline PATH` → same idea for the comparison target.

Precedence: explicit `--latest` wins over `-n`; neither falls back to
`tests/benchmark/latest.json`.

## Files

| File | Purpose |
|------|---------|
| `config.py` | `ToolBenchmarkConfig` + `default_configs()` — tool, fixed args, parameter sweeps |
| `prompts.py` | `prompt_of_length()` — builds prompts of a target token count |
| `runner.py` | `BenchmarkRunner`, `promote_latest_to_baseline()`, section-merge logic |
| `backend.py` | `RemoteBackendCounter` — captures per-phase latency for remote runs |
| `diff.py` | `print_diff`, `print_results`, `markdown_diff`, `markdown_results` |
| `__main__.py` | CLI entry point |
| `results.json` | Committed: the baseline to diff against |

## Configuring a sweep

Each `ToolBenchmarkConfig` defines one tool, its fixed args, and
parameter sweeps. The runner tests every combination (cartesian
product) of the sweep values.

```python
from nnsightful.tools.logit_lens import logit_lens
from tests.benchmark import ToolBenchmarkConfig

ToolBenchmarkConfig(
    tool_name="logit_lens",
    tool=logit_lens,
    fixed_args={"prompt": "The capital of France is"},
    sweep_params={
        "top_k": [3, 5, 10],
        "layers": [None, [0, -1]],
        "include_entropy": [True, False],
    },
)
```

That config produces `3 × 2 × 2 = 12` runs per model.

### Prompt-length sweeps

Prompt length is the dominant latency driver for both tools, so the
built-in configs sweep it directly. Because tokenization is
model-dependent, the prompt string has to be built per-model — the
config uses `build_args`, a hook that receives the model and the
current sweep combo and returns the final kwargs:

```python
def build(model, fixed, sweep):
    n = sweep["prompt_length"]
    return {**fixed, "prompt": prompt_of_length(model.tokenizer, n)}

ToolBenchmarkConfig(
    tool_name="logit_lens[length]",
    tool=logit_lens,
    fixed_args={"top_k": 5},
    sweep_params={"prompt_length": [10, 25, 50]},
    build_args=build,
)
```

`prompt_of_length()` (in `prompts.py`) tokenizes a long base text,
slices to approximately *n* tokens, then iteratively adjusts the
prefix boundary until the re-encoded string has exactly *n* tokens.
The convergence loop handles BPE boundary drift.

To add a new tool, edit `default_configs()` in `config.py` or pass a
custom list to `BenchmarkRunner.run_and_save()`.

## File format

Both `latest.json` and `results.json` use the same single-object
format. Results are split into `local` and `remote` sections:

```json
{
  "timestamp": "2026-04-17T12:34:56+0000",
  "git_hash": "abc123...",
  "system_info": {
    "python": "3.11",
    "torch": "...",
    "transformers": "...",
    "nnsight": "..."
  },
  "n_repeat": 3,
  "n_warmup": 3,
  "results": {
    "local": [
      {
        "tool": "logit_lens[length]",
        "model": "gpt2",
        "params": {"prompt_length": 25},
        "latency": {"mean": 0.123, "std": 0.005, "min": 0.118, "max": 0.130, "samples": [...]}
      }
    ],
    "remote": [
      {
        "tool": "logit_lens[length]",
        "model": "gpt2",
        "params": {"prompt_length": 25},
        "latency": {"mean": 1.25, "std": 0.05, "min": 1.2, "max": 1.31, "samples": [...]},
        "latency_breakdown": {
          "total":          {"mean": 2.60, ...},
          "total_unqueued": {"mean": 1.25, ...},
          "running":        {"mean": 0.80, ...},
          "download":       {"mean": 0.30, ...}
        }
      }
    ]
  }
}
```

For remote rows, the primary `latency` field holds `total_unqueued`
stats — the cost excluding queue wait (which the user can't control).
The four-phase `latency_breakdown` dict is available for the detailed
view (`--show --detail`). Rows carry no `remote` field — the section
they live in determines their execution mode.

### Same-hash merge semantics

Writes to either file follow the same rule:

- **Same `git_hash` as the existing content**: each section is merged
  independently. Within a section, matching `(tool, model, params)`
  rows are updated with the fresh numbers; non-overlapping rows are
  preserved. Sections that the new run didn't write to are left
  untouched.
- **Different git_hash**: the file is replaced entirely — old numbers
  from a different code state aren't comparable.

Running `python -m tests.benchmark` writes to `results.local`;
`python -m tests.benchmark --remote` writes to `results.remote`.
Both sections accumulate naturally at the same git hash without
overwriting each other.

## Show workflow

`print_results()` renders the latest run's rows, grouped by section.

**Default (compact)** — Mean and Std only:

```
  [LOCAL]
  Tool                  Model  Params                 Mean        Std
  --------------------------------------------------------------------
  logit_lens[length]    gpt2   prompt_length=10     113.8ms     11.0ms
  logit_lens[length]    gpt2   prompt_length=25     249.9ms      2.9ms
```

**`--detail`** — adds Min/Max for local; adds Min/Max + Running/Download/Total for remote:

```
  [REMOTE (unqueued)]
  Tool                  Model  Params                 Mean        Std        Min        Max    Running   Download      Total
  ----------------------------------------------------------------------------------------------------------------------------
  logit_lens[length]    gpt2   prompt_length=25    1406.0ms    152.5ms    1200.0ms   1500.0ms   800.0ms   300.0ms   2600.0ms
```

## Diff workflow

`print_diff()` compares `latest.json` against `results.json`, section
by section. Each non-empty section gets its own table:

```
================================================================================
BENCHMARK DIFF
================================================================================
  Current:   2026-04-17T12:34:56+0000  (abc12345)  [latest.json]
  Baseline:  2026-04-10T09:00:00+0000  (def67890)  [results.json]

  [LOCAL]
  Tool                      Model  Params                    Baseline   Current                  Delta
  ----------------------------------------------------------------------------------------------------
  logit_lens[length]        gpt2   prompt_length=10           115.4ms   112.2ms    -3.2ms (2.7% faster)
  logit_lens[length]        gpt2   prompt_length=25           124.1ms   119.7ms    -4.4ms (3.5% faster)

  [REMOTE (unqueued)]
  Tool                      Model  Params                    Baseline   Current                  Delta
  ----------------------------------------------------------------------------------------------------
  logit_lens[length]        gpt2   prompt_length=25          2340.0ms  2210.0ms   -130.0ms (5.6% faster)
================================================================================
```

Both sections use the same columns; for remote rows Baseline/Current
are `total_unqueued`. Running/Download aren't shown in the diff —
they're noise for regression detection. Use `--remote` or `--local`
to show only one section's table.

Rows in each section are sorted by `(tool, model, params)` so all
rows for a given tool stay grouped even after merges across runs.

## Markdown export

`--md PATH` writes the same tables as stdout but as Markdown, in
addition to printing. Works with `--show`, `--diff`, `--show-diff`.

```bash
python -m tests.benchmark --show --detail --md report.md
python -m tests.benchmark --show-diff --md diff.md
```

Output contains a metadata header, then one `## LOCAL` / `## REMOTE
(unqueued)` section per non-empty table, with right-aligned numeric
columns.

## Remote execution

Each nnsightful tool accepts `remote=True`. The runner uses a custom
`RemoteBackendCounter` (a subclass of `nnsight`'s `RemoteBackend`)
that records per-phase latency via status callbacks:

- `total` — wall clock from submit to done.
- `total_unqueued` — `total` minus queue wait time.
- `running` — active compute time on the backend.
- `download` — time from remote completion to result arrival locally.

The primary `latency` stored per row is `total_unqueued`, because
queue wait is a property of backend congestion rather than the code
being measured. The other three phases live in `latency_breakdown`
and appear in `--show --detail`.

When `--remote` is used:

- Rows are written to `results.remote` instead of `results.local`.
- The diff shows them in a separate `[REMOTE (unqueued)]` table.
- Local results (if any) in the same file are untouched.

## Resilience

The runner catches exceptions at both the warmup and measurement
level. If warmup fails for a given (config, model) pair, all its
combos are skipped but the runner continues with the next
(config, model). If a single combo's measurement fails, that combo is
skipped but other combos and configs proceed. Failed combos are
reported in a summary at the end of the run; successful rows still
get saved to `latest.json` via the same merge semantics (so a failed
combo doesn't wipe the previously-saved value for that key).

## Notes

- **GPU timing**: the runner calls `torch.cuda.synchronize()` around
  local timed blocks when CUDA is available, so async kernel launches
  are captured correctly. (No-op for remote runs.)
- **Progress**: each task's timed repeats render a `tqdm` progress bar.
  The bar uses `leave=False` so it disappears once the task finishes,
  keeping the output clean.
- **Warmup**: once per (config, model), inside `run()`. `--warmup N`
  untimed calls using the **last** combo's kwargs (default 3). Fires
  before the combo sweep begins, not once per combo. The last combo is
  usually the largest/most expensive (sweeps are conventionally ordered
  ascending), so warming there exercises the widest set of kernels and
  covers the cheaper combos too. Set `--warmup 0` to skip.
- **Variance**: `std` in the latency dict is sample standard deviation
  (Bessel-corrected). If `std / mean` is large, increase `--repeat`.
  Remote runs typically have higher variance due to network jitter
  and backend queuing.
- **Settings mismatch**: merging runs with different `n_repeat` or
  `n_warmup` at the same git hash produces a warning. Rows you re-ran
  use the new setting; rows from the prior run that you didn't re-run
  retain their original measurement.
