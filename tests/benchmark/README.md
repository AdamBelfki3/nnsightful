# Benchmarks

Performance benchmarking for nnsightful tools along two independent
dimensions:

- **`latency`** — loops over models and parameter sweeps and times each
  call, locally (this machine's GPU) and/or remotely on NDIF (with a
  per-phase breakdown).
- **`peak_mem`** — for each (tool, model), finds the largest prompt
  length whose peak GPU memory stays within 10% / 25% / 50% of the
  model's footprint, measured locally under NDIF's execution conditions.

Each run is written to a local `run.json` and diffed against the
committed `baseline.json`; `--promote` folds a run into the baseline and
records, on each re-run test, its `last_change`.

Two environments: **local** = the model on this machine's GPU, no NDIF
involved; **remote** = production NDIF (`https://api.ndif.us`, pinned
by the runner whatever nnsight's config says).

## Environment

Local runs need a CUDA build of torch. For example, with a venv at the
repo root (`.venv/` is gitignored by uv's own `.gitignore`):

```bash
uv venv .venv --python 3.12
uv pip install --python .venv/bin/python torch --index-url https://download.pytorch.org/whl/cu128
uv pip install --python .venv/bin/python -e '.[plots]' tqdm accelerate pytest
```

To benchmark against development checkouts of nnsight or nnterp,
install them editable last, with `--no-deps`, so they replace the
released versions pulled in above (and their version metadata doesn't
block the install):

```bash
uv pip install --python .venv/bin/python --no-deps -e /path/to/nnsight -e /path/to/nnterp
```

Gated models (gemma, Llama) need `HF_TOKEN` in the environment.

## Two files, two roles

| File | Tracked by git? | Role |
|------|-----------------|------|
| `run.json` | **No** (gitignored) | The latest run: every slot of the blocks it ran (measured, failed, unsupported or placeholder). What show and diff read. |
| `baseline.json` | **Yes** | Every slot of the config matrix: current (measured in the block's env), stale (older value with its own env) or placeholder. |

Workflow:

1. `python -m tests.benchmark [--dims ...]` → writes `run.json`.
2. `python -m tests.benchmark --show-diff` → each measured test in
   `run.json` vs. its baseline slot (`current`, `stale @ …`, or `(new)`).
3. Happy with the numbers? `python -m tests.benchmark --promote` →
   `run.json` is folded into `baseline.json` (see *Promotion*), and each
   re-run test that had a previous value gets a `last_change`.
4. `git add baseline.json && git commit`.

Old `results.json` / `latest.json` files (either earlier format) still
load: they are upgraded in memory, and the default paths fall back to
those names when `baseline.json` / `run.json` don't exist.

## Running

```bash
# Default: the latency.local block of the config (all its tools × models), 3 repeats
python -m tests.benchmark

# Peak-memory search over the peak_mem block (local GPU only)
python -m tests.benchmark --dims peak_mem

# Both dimensions, one model of the config (substring match)
python -m tests.benchmark --dims latency peak_mem --models gemma

# Peak-memory knobs: thresholds (fractions of the footprint), search range
python -m tests.benchmark --dims peak_mem --thresholds 0.1 0.25 0.5 --min-length 2 --max-length 4096

# A subset of the config's models
python -m tests.benchmark --models gpt2 Llama-3.1-8B

# Scope to a subset of tools (substring match on tool_name)
python -m tests.benchmark --tools logit_lens

# More samples per config
python -m tests.benchmark --repeat 5

# Tune per-(config, model) warmup (default 3)
python -m tests.benchmark --warmup 5 --repeat 5

# The latency.remote block, on production NDIF
python -m tests.benchmark --remote

# Local dtype (default bfloat16, as NDIF serves) / skip NDIF's autocast
python -m tests.benchmark --dtype float32 --no-autocast

# Write the run to a named file (tests/benchmark/NAME.json)
python -m tests.benchmark -n llama_sweep --models Llama-3.1-8B

# Run + show diff against the baseline
python -m tests.benchmark --diff

# Only show diff (no new run)
python -m tests.benchmark --show-diff

# Only show run.json as tables (no diff, no new run)
python -m tests.benchmark --show

# Show the full latency breakdown (min/max + remote sub-phases),
# every measured peak-memory point, and failed / unsupported tests
python -m tests.benchmark --show --detail

# Show / diff one dimension only
python -m tests.benchmark --show --dims peak_mem
python -m tests.benchmark --show-diff --dims latency

# Filter display by tools / models (substring, OR-matched)
python -m tests.benchmark --show-diff --tools logit_lens
python -m tests.benchmark --show --models gpt2 Llama

# Show only the remote or local section
python -m tests.benchmark --show --remote
python -m tests.benchmark --show-diff --local

# Export a display to Markdown alongside stdout
python -m tests.benchmark --show --md report.md
python -m tests.benchmark --show-diff --md diff.md

# Or use --md with no argument to get the default filename next to
# baseline.json (results.md for --show, benchmark_diff.md for diff modes)
python -m tests.benchmark --show --md
python -m tests.benchmark --show-diff --md

# Add --plots to embed a line plot per (tool, section) in the Markdown
# report (mean latency vs. the swept parameter, one line per model).
# Requires matplotlib: pip install -e '.[plots]'
python -m tests.benchmark --show --md --plots
python -m tests.benchmark --show-diff --md --plots

# Also list tests not in run.json with their last promoted change
python -m tests.benchmark --show-diff --with-previous

# Fold run.json into baseline.json (recording last_change), then commit it
python -m tests.benchmark --promote
```

### Flags that do double duty

`--tools`, `--models` and `--dims` work in both benchmark and display modes:

- **Benchmark run**: select a subset of the config matrix (see
  *The test matrix*). `--tools logit_lens` only runs tools whose name
  contains `logit_lens`; `--models gpt2 llama` only the block's config
  models containing either string. Models outside the config can't be
  run — add them to `config.py`.
- **Display mode** (`--show` / `--diff` / `--show-diff`): OR-substring
  filter. A row is kept if its field contains *any* of the provided
  strings.

`--dims latency peak_mem`: in a benchmark run, which block(s) to run
(default `latency`); in display mode, which tables to show (default:
every dimension that has data).

`--remote` and `--local` (mutually exclusive):

- **Benchmark run**: `--remote` runs the `latency.remote` block on
  production NDIF (`peak_mem` is local only for now). `--local` has no
  effect here (already the default).
- **Display mode**: `--remote` restricts latency output to the remote
  environment (and hides `peak_mem`); `--local` to the local one.
  Without either, both environments show as separate tables.

### File-name shortcuts

- `-n NAME` → shortcut for `--run tests/benchmark/NAME.json`. Useful
  for keeping multiple named scratch files side by side.
- `--run PATH` (alias `--latest`) → full override of the run file path. Takes
  any path (absolute, relative, outside the repo).
- `--baseline PATH` → same idea for the comparison target.

Precedence: explicit `--run` wins over `-n`; neither falls back to
`tests/benchmark/run.json`.

## Files

| File | Purpose |
|------|---------|
| `config.py` | The test matrix: `benchmark_config()` (models + tool configs per block), `ToolBenchmarkConfig`, `block_slots()` / `config_slots()` |
| `prompts.py` | `prompt_of_length()` — builds prompts of a target token count |
| `runner.py` | `BenchmarkRunner` (`run` / `run_peak_mem`), peak measurement, environment stamp, `run.json` writes |
| `store.py` | Block / slot format, staleness identity, `run.json` merge, promotion, `last_change` (pure, no torch) |
| `legacy.py` | Readers for earlier results formats, upgraded by `store.py` (pure, no torch) |
| `memory.py` | `search_max_lengths()` — coarse sweep + bisection for the threshold lengths (pure, no torch) |
| `backend.py` | `RemoteBackendCounter` — captures per-phase latency for remote runs |
| `diff.py` | `print_diff`, `print_results`, `markdown_diff`, `markdown_results` for both dimensions |
| `plots.py` | Latency and peak-memory plots for the Markdown export |
| `__main__.py` | CLI entry point |
| `test_benchmark.py` | Tests for the harness itself (no GPU / network): `pytest tests/benchmark` |
| `fixtures/results_v1.json` | A pre-dimension results file, for the migration tests |
| `baseline.json` | Committed: every config slot, current / stale / placeholder |

## The test matrix

`config.py` defines the full benchmark as one matrix per dimension
block — `benchmark_config()` maps each block to its models and tool
configs:

| Block | Models | Tools | Swept |
|-------|--------|-------|-------|
| `latency.local` | gpt2, gemma-3-1b-pt, Llama-3.1-8B | `logit_lens[length]`, `activation_patching[length]`, `j_lens[length]` | `prompt_length` 10 / 25 / 50 |
| `latency.remote` | gpt2, Llama-3.1-8B, Llama-3.1-70B, Llama-3.1-405B-Instruct | same | same |
| `peak_mem` | gpt2, gemma-3-1b-pt, Llama-3.1-8B | `logit_lens`, `activation_patching`, `j_lens` | searched (see *Peak memory*) |

Every tool × model × params combination is one **slot**. Latency tool
names keep their `[length]` suffix (the sweep they belong to) so they
match earlier results; peak-memory slots use the bare tool names and
their fixed args as `params`.

A run executes the whole matrix of the selected block(s) or a subset
(`--remote`, `--dims`, `--models`, `--tools`); `run.json` always holds
every slot of each block it ran, with unexecuted ones as placeholders.

Tools that don't apply to a model are kept in the matrix and resolved
at run time: `j_lens` on a model without a published Jacobian lens
becomes an `unsupported` slot. No test — unsupported, failing,
out-of-memory, or even a model that fails to load — aborts a run.

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

The base texts continue with filler, so any length works (the
peak-memory search goes up to thousands of tokens). Activation
patching gets equal-length source and target prompts and patches the
last position (`src_pos = tgt_pos = [n - 1]`, nothing frozen), so its
positions follow the prompt as it grows. `j_lens` gets its Jacobians
preloaded on CPU once per local model; remote calls let the server load
them.

To add a tool or model, edit `default_configs()` / `memory_configs()`
or the model lists in `config.py`; new slots start as placeholders in
the baseline at the next promote, and removed ones are dropped.

## Peak memory

On NDIF each model's process gets a memory budget proportional to its
weights, so what limits a tool is the memory it needs *beyond* the
weights. `peak_mem` measures exactly that, locally:

- The model is loaded on the GPU in `--dtype` (default `bfloat16`) and
  each call runs under `torch.autocast("cuda", dtype, cache_enabled=False)`,
  the context NDIF executes traces in (it makes softmax/exp/sum on half
  inputs return float32, so skipping it would understate memory).
- **Peak** = `torch.cuda.max_memory_allocated()` during the call minus
  `memory_allocated()` before it, measured once per point after
  `--warmup` untimed calls (default 1 for this dimension). It is
  deterministic, so there is no repeat.
- **Footprint** = parameter + buffer bytes of the loaded model;
  **pct** = peak / footprint × 100.
- **Search**: prompt length doubles from `--min-length` (default 2)
  until the peak exceeds the largest threshold or the cap is reached;
  then each threshold is bisected between its bracketing points to the
  exact largest passing length. The cap is `min(--max-length,
  context length - 1)` (default `--max-length` 4096, which keeps the
  sweep for long-context models finite). An out-of-memory point counts
  as over every threshold.
- **Edge cases**: `null` (shown `<2`) means even the smallest length is
  over the threshold; a label listed in `capped` (shown `>=4096`) never
  crossed it up to the cap, so the true limit is higher.
- Every probed point (coarse and bisection) is kept with its peak,
  pct and its own latency stats (`--warmup` + `--repeat` timed calls,
  separate from the memory measurement, same GPU / dtype / autocast).

Remote memory isn't observable from the client yet. When NDIF reports
it, it can live in the remote latency entry or as `remote` fields on a
peak-memory point without restructuring.

## File format

`run.json` and `baseline.json` share one shape, dimensions on top:

```json
{
  "latency": {
    "local":  {"env": {...}, "meta_params": {"n_repeat": 3, "n_warmup": 3}, "runs": [...]},
    "remote": {"env": {...}, "meta_params": {...}, "runs": [...]}
  },
  "peak_mem": {"env": {"kind": "local", ...}, "meta_params": {...}, "runs": [...]}
}
```

A **block** (`latency.local`, `latency.remote`, `peak_mem`) has the
environment its current results were measured in, its `meta_params`,
and one entry in `runs` per slot of its matrix. A block a run didn't
touch is `null` in `run.json`.

A **slot**:

```json
{"tool": "logit_lens[length]", "model": "google/gemma-3-1b-pt", "params": {"prompt_length": 25},
 "status": "ok",
 "stats": {"mean": 0.104, "std": 0.001, "min": 0.103, "max": 0.105, "samples": [...]},
 "last_change": {...}}
```

- `status`: `ok` (`stats` holds the result), `not_run` (placeholder,
  `stats: null`), `failed` or `unsupported` (`stats: null`, `error`
  says why — e.g. the exception, `out of memory: …`, or the missing lens).
- Latency `stats`: mean / std / min / max / samples in seconds; remote
  slots also carry the four-phase `breakdown` inside `stats`.
- Peak-memory `stats`: `footprint_bytes`, `context_cap`,
  `max_prompt_length` (per threshold label), `capped` and `points`
  (each probed length with `peak_bytes`, `pct`, its own `latency`, or
  `oom: true`).
- In `baseline.json` a slot is **current** (no env of its own: measured
  in the block's `env`), **stale** (`"stale": true` plus the full `env`
  it was measured in) or a **placeholder** (never measured).

### Environment stamp

Each block's `env` (and a stale slot's) holds:

- `kind` (`local` / `remote`), `git_hash`, `dirty` (the working tree
  has changes per `git status --porcelain`, untracked files included,
  ignoring the benchmark outputs `baseline.json`, `results.md`,
  `benchmark_diff.md`; `run.json` is gitignored), when dirty
  `dirty_fingerprint` (hash of the diff against HEAD plus untracked
  files), `timestamp`, and the client's nnsight / nnterp versions plus
  `<pkg>_commit` for packages installed from a git checkout.
- **local** adds `python`, transformers and torch (+ commits), `gpu`,
  `dtype`, `autocast`.
- **remote** adds `remote_server`: production NDIF's `/env` (python and
  key package versions); `"unknown"` for results from before it was
  recorded.

The **staleness identity** is what must match for a result to stay
current: `kind`, the nnsightful commit and `dirty` /
`dirty_fingerprint` (uncommitted changes count as different code; clean
and dirty differ), the nnsight / nnterp / transformers / torch versions
and `<pkg>_commit`s, and the setup (`gpu`, `dtype`, `autocast` locally;
`remote_server` remotely). `timestamp` and `python` are ignored.
`meta_params` differences (`n_repeat`, thresholds, …) only print a
warning, never make results stale.

### `run.json` writes

Each model's results are written to its block in `run.json` as soon
as it finishes. The block always lists every config slot. When the
existing block has the same identity, the new slots merge in per slot
(a placeholder never replaces an existing result); otherwise the block
is replaced (with a warning), so a block is always one environment.

### Promotion

`--promote` folds `run.json` into `baseline.json` block by block, slot
by slot:

- **Re-run** (`ok` in the run): becomes current with the new value; the
  block's `env` becomes the run's.
- **Not re-run, has a value**: stays current if the env it was measured
  in (the old block env, or its own if stale) has the new block env's
  staleness identity; otherwise becomes stale, keeping its value and
  its own `env`. A stale slot whose env matches again becomes current.
- **Not re-run, no value**: stays a placeholder (or takes the run's
  `failed` / `unsupported` status). A placeholder or a failure never
  overwrites a value.
- A block the run has no results for keeps its env and slots.
- Every block is synced to the config: slots no longer in the matrix
  are dropped, new ones added as placeholders.

### `last_change`

On promote, every re-run slot that had a value (current or stale) gets
`last_change` = previous → new, replacing any earlier one; it stays on
the slot when it later goes stale:

```json
"last_change": {"from": {"value": 0.120, "git_hash": "9f8e7d6…", "timestamp": "…"},
                "to":   {"value": 0.104, "git_hash": "a1b2c3d…", "timestamp": "…"},
                "delta": -0.016, "pct": -13.3}
```

For latency `value` is the mean in seconds; for peak memory it is
`{"max_prompt_length", "capped", "footprint_bytes"}` and `delta` /
`pct` are per threshold label (`null` where either side is `null`).
Re-promoting the very same measurement (same `git_hash`, `timestamp`
and `dirty_fingerprint`) keeps the existing `last_change` instead of
writing a zero change; a genuine re-measurement with an identical
value is recorded.

### Upgrades from older formats

Every earlier format loads (upgraded in memory) — the original
`results.local` / `results.remote` rows, the intermediate single-env
and kind-first (`{"local": ..., "remote": ...}`) files: per-kind
entries become slots of `latency.local` / `latency.remote` with their
stats unchanged, peak-memory runs become `peak_mem` slots, the env
becomes the block env (plus `kind`; remote gets `remote_server:
"unknown"` if it had none), and older stale groups become stale slots
with their env. Missing config slots appear as placeholders at the
next promote. Default paths fall back to `results.json` / `latest.json`
when `baseline.json` / `run.json` don't exist.

## Show workflow

`print_results()` renders `run.json`: one latency table per kind
(local / remote, joined by (tool, model, params)), then the
peak-memory table. Only measured slots appear in the tables; below
them, each block lists how many slots were not run, failed or are
unsupported (`--detail` lists the failed / unsupported ones with their
error).

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

**Peak memory** — footprint and the largest prompt length within each
threshold (`--detail` adds every measured point with its peak, % of
footprint and latency):

```
  Tool        Model                    Params                          Footprint    10%    25%    50%
  ----------------------------------------------------------------------------------------------------
  logit_lens  google/gemma-3-1b-pt     top_k=5, include_entropy=True     1.86GiB     14     35     70
  logit_lens  meta-llama/Llama-3.1-8B  top_k=5, include_entropy=True    14.96GiB    185    465    930
  logit_lens  openai-community/gpt2    top_k=5, include_entropy=True    237.4MiB     17     45     91
```

## Diff workflow

`print_diff()` compares each measured slot of `run.json` with its
baseline slot: `current`, `stale @ <hash> <date>` (the slot's own env),
or `(new)` when the baseline slot is a placeholder or absent; the `vs`
column names the source (e.g. `stale @ 9f8e7d6 2026-04-23`). Slots
not measured in `run.json` aren't compared;
`--with-previous` adds those baseline tests (in `current` or `stale`)
that have a `last_change`, shown as that change (e.g. `last change
-13.3% (9f8e7d6 → a1b2c3d)`) — tests in `run.json` always use the live
comparison.

When a compared baseline environment (block or stale-slot env) differs
from the run's environment of the same block in anything but the code-state stamps (git hash,
dirty) — e.g. nnsight / torch / transformers versions, GPU or dtype for
local, client versions or `remote_server` for remote — a warning listing
the differences (prefixed with the kind) is printed above the tables
(and quoted in Markdown). The comparison is still shown.

```
================================================================================
BENCHMARK DIFF
================================================================================
  Current:   local a1b2c3d 2026-10-08 · remote a1b2c3d 2026-10-08  [run.json]
  Baseline:  local: current 3c9e0d1 2026-10-01, 0 stale; remote: current 3c9e0d1 2026-10-01, 1 stale  [baseline.json]

  [LOCAL]
  Tool                      Model  Params                    Baseline   Current                  Delta  vs
  -----------------------------------------------------------------------------------------------------------------------
  logit_lens[length]        gpt2   prompt_length=10           115.4ms   112.2ms    -3.2ms (2.7% faster)  current
  logit_lens[length]        gpt2   prompt_length=25           124.1ms   119.7ms    -4.4ms (3.5% faster)  current

  [REMOTE (unqueued)]
  Tool                      Model  Params                    Baseline   Current                  Delta  vs
  -----------------------------------------------------------------------------------------------------------------------
  logit_lens[length]        gpt2   prompt_length=25          2340.0ms  2210.0ms   -130.0ms (5.6% faster)  stale @ 9f8e7d6 2026-04-23
================================================================================
```

Both environments use the same columns; for remote rows Baseline/Current
are `total_unqueued`. Running/Download aren't shown in the diff —
they're noise for regression detection. Use `--remote` or `--local`
to show only one environment's table.

The peak-memory diff shows, per run, `baseline -> current (delta)` for
each threshold's max prompt length (higher is better); in Markdown a
🟢 / 🔴 marks runs whose lengths only grew / any shrank.

Rows in each section are sorted by `(tool, model, params)` so all
rows for a given tool stay grouped even after merges across runs.

## Markdown export

`--md` writes the same tables as stdout but as Markdown, in addition
to printing. Works with `--show`, `--diff`, `--show-diff`.

- `--md PATH` — user-chosen destination.
- `--md` (no argument) — default filename alongside `baseline.json`:
  `results.md` for `--show`, `benchmark_diff.md` for `--diff` / `--show-diff`.

```bash
python -m tests.benchmark --show --detail --md report.md
python -m tests.benchmark --show-diff --md           # → benchmark_diff.md
```

Add `--plots` (requires matplotlib via `pip install -e '.[plots]'`)
to embed one line plot per `(tool, section)` under its heading
(peak-memory tools get peak MiB and % of footprint vs. prompt length,
with the thresholds drawn as dotted lines and OOM points as `x`). The
plot shows mean latency (with ±1 std band) vs. the swept parameter,
one line per model. For `--show-diff`, each plot overlays the current
run (solid) on the baseline (dashed) in matching colors per model.
The Y-axis auto-switches to log scale when values span ≥10× and
displays human-readable units (`50ms`, `1.0s`, `2min`) at both major
and minor ticks.

Output contains a metadata header, then one `## LOCAL` / `## REMOTE
(unqueued)` section per non-empty latency table and a `## PEAK MEMORY
(local GPU)` section, with right-aligned numeric columns.

## Remote execution

Each nnsightful tool accepts `remote=True`. The runner uses a custom
`RemoteBackendCounter` (a subclass of `nnsight`'s `RemoteBackend`)
that records per-phase latency via status callbacks:

- `total` — wall clock from submit to done.
- `total_unqueued` — `total` minus queue wait time.
- `running` — active compute time on the backend.
- `download` — time from remote completion to result arrival locally.

The stats stored in a run's `remote` entry are `total_unqueued`,
because queue wait is a property of backend congestion rather than the
code being measured. The other three phases live in `breakdown` and
appear in `--show --detail`.

When `--remote` is used:

- The runner sets `nnsight.CONFIG.API.HOST` to production NDIF and
  records the server's versions in the block's `env.remote_server`.
- Results go to the `latency.remote` block; `latency.local` is untouched.
- The diff shows them in a separate `[REMOTE (unqueued)]` table.

## Resilience

Every test is isolated: an exception while building its arguments,
warming up or measuring turns that slot into `failed` (with the error)
and the run continues; an `UnsupportedTest` (e.g. no published j-lens)
turns it into `unsupported`. A model that fails to load marks its slots
`failed`. A failed warmup is reported and each test is still measured.
Failures never overwrite results, in `run.json` or the baseline.

Models are loaded one at a time and freed before the next, and each
model's results are written to `run.json` as soon as it finishes.
In a peak-memory sweep, an out-of-memory error at a point is recorded
(`"oom": true`) and treated as over every threshold.

## Notes

- **GPU timing**: the runner calls `torch.cuda.synchronize()` around
  local timed blocks when CUDA is available, so async kernel launches
  are captured correctly. (No-op for remote runs.)
- **Progress**: each task's timed repeats render a `tqdm` progress bar.
  The bar uses `leave=False` so it disappears once the task finishes,
  keeping the output clean.
- **Warmup**: for latency, once per (config, model), inside `run()`. `--warmup N`
  untimed calls using the **last** combo's kwargs (default 3). Fires
  before the combo sweep begins, not once per combo. The last combo is
  usually the largest/most expensive (sweeps are conventionally ordered
  ascending), so warming there exercises the widest set of kernels and
  covers the cheaper combos too. Set `--warmup 0` to skip.
- **Variance**: `std` in the latency dict is sample standard deviation
  (Bessel-corrected). If `std / mean` is large, increase `--repeat`.
  Remote runs typically have higher variance due to network jitter
  and backend queuing.
- **Settings mismatch**: merging runs with different `meta_params`
  (e.g. `n_repeat`, `n_warmup`, `dtype`) produces a warning. Rows you re-ran
  use the new setting; rows from the prior run that you didn't re-run
  retain their original measurement.
