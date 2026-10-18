# Benchmarks

Performance benchmarking for nnsightful tools, organized as named,
versioned **benchmarks** defined in JSON:

| Benchmark | Kind | Measures |
|-----------|------|----------|
| `local_latency` | local (this machine's GPU, no NDIF) | wall-clock latency of each tool, bf16 under NDIF's autocast |
| `remote_latency` | remote (production NDIF, `https://api.ndif.us`) | end-to-end latency excluding queue wait, with a per-phase breakdown |
| `peak_mem` | local | the largest prompt length whose peak GPU memory beyond the weights stays within 10% / 25% / 50% of the model footprint |

A benchmark always runs **whole** and produces one result with one
environment stamp. Results go to a local `run.json`, are diffed against
the committed `baseline.json`, and `--promote` makes complete results
the new baseline.

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

## Workflow

1. `python -m tests.benchmark --all` → runs every benchmark into
   `run.json`, each written when it finishes (best practice: a baseline
   built from one `--all` run is one coherent snapshot). `--benchmarks
   NAME ...` runs a subset. See *Finished and interrupted runs*.
2. `python -m tests.benchmark --show-diff` → each benchmark in
   `run.json` vs. its baseline result, test by test.
3. Happy with the numbers? `python -m tests.benchmark --promote` →
   every **complete** benchmark in `run.json` becomes the baseline;
   incomplete ones are refused.
4. `git add tests/benchmark/baseline.json && git commit`.

| File | Tracked by git? | Role |
|------|-----------------|------|
| `benchmarks/<name>.json` | **Yes** | The current definition of each benchmark |
| `benchmarks/archive/<name>.v<N>.json` | **Yes** | Older definitions that recorded results still refer to |
| `run.json` | **No** (gitignored) | The latest **finished** result of each benchmark run |
| `run.partial.json` | **No** (gitignored) | Progress of benchmarks still running or interrupted (same format, not promotable) |
| `baseline.json` | **Yes** | Per benchmark, the promoted result and the one it replaced (`previous`) |

## Running

```bash
# All benchmarks, or some of them
python -m tests.benchmark --all
python -m tests.benchmark --benchmarks local_latency peak_mem

# Run, then diff right away
python -m tests.benchmark --benchmarks local_latency --diff

# Individual tests (see below): printed only, never recorded
python -m tests.benchmark --model gpt2 --tool logit_lens --param prompt_length=25

# Show run.json as tables (--detail: min/max + remote phases, every
# peak-memory point, and failed tests with their errors)
python -m tests.benchmark --show
python -m tests.benchmark --show --detail

# Diff against the baseline; also show the last change of benchmarks not in run.json
python -m tests.benchmark --show-diff
python -m tests.benchmark --show-diff --with-previous

# Display filters (substring, OR-matched)
python -m tests.benchmark --show-diff --dims latency --tools logit_lens --models gpt2 Llama
python -m tests.benchmark --show --remote        # or --local

# Markdown export (default file next to baseline.json: results.md /
# benchmark_diff.md), optionally with plots (needs matplotlib)
python -m tests.benchmark --show --md
python -m tests.benchmark --show-diff --md diff.md --plots

# Promote complete benchmarks of run.json into baseline.json
python -m tests.benchmark --promote
```

Files: `--run PATH` (alias `--latest`) or `-n NAME`
(`tests/benchmark/NAME.json`) choose the run file, `--baseline PATH` the
baseline. Running and showing / promoting are separate invocations
(`--diff` diffs right after a run).

## Benchmark definitions

Each `benchmarks/<name>.json` defines one benchmark:

```json
{
  "name": "remote_latency",
  "version": 1,
  "kind": "remote",
  "dimension": "latency",
  "description": "End-to-end latency on production NDIF ...",
  "meta_params": {"n_repeat": 3, "n_warmup": 3},
  "models": ["openai-community/gpt2", "meta-llama/Llama-3.1-8B",
             "meta-llama/Llama-3.1-70B", "meta-llama/Llama-3.1-405B-Instruct"],
  "optional_models": ["meta-llama/Llama-3.1-405B-Instruct"],
  "tools": [
    {"tool": "logit_lens", "name": "logit_lens[length]",
     "fixed_args": {"top_k": 5, "include_entropy": true}, "sweep": {"prompt_length": [10, 25, 50]}},
    {"tool": "activation_patching", "name": "activation_patching[length]",
     "fixed_args": {}, "sweep": {"prompt_length": [10, 25, 50]}},
    {"tool": "j_lens", "name": "j_lens[length]",
     "fixed_args": {"top_k": 5, "include_entropy": true}, "sweep": {"prompt_length": [10, 25, 50]},
     "optional": ["meta-llama/Llama-3.1-70B"]}
  ]
}
```

- `kind`: `local` or `remote`; `dimension`: `latency` or `peak_mem`
  (local only). There is one benchmark per (dimension, kind).
- `meta_params`: `n_repeat`, `n_warmup`; locally `dtype` and
  `autocast`; for `peak_mem` also `swept`, `thresholds`, `min_length`,
  `max_length` (see *Peak memory*).
- `tools`: `tool` picks the nnsightful tool; `name` is what its tests
  are called (default: the tool). Latency tools sweep every combination
  of `sweep`; the test params are the sweep combo. Peak-memory tools
  have no `sweep` (prompt length is searched); their test params are
  `fixed_args`.
- A benchmark's **tests** are every tool × model × sweep combo (latency)
  or tool × model (peak memory). The latency tests keep their
  `[length]` names, which match the results recorded before definitions
  existed.

The Python side (`config.py`'s `ToolRegistry`) only maps each tool name to its
nnsightful tool and to how its arguments are built per model: prompts
of exactly *n* tokens (`prompts.py`), activation patching with
equal-length source / target prompts patching the last position
(`src_pos = tgt_pos = [n - 1]`, nothing frozen, so positions follow the
prompt as it grows), and j-lens Jacobians preloaded on CPU once per
local model (remote calls let the server load them). A model without a
published j-lens raises `UnsupportedTest`.

### Versioning

`version` is bumped **by hand** whenever the test set or setup changes.
Each result records `{"name", "version", "config_hash", "kind",
"dimension"}`; the `config_hash` covers every field except `version`
and `description`. A warning is printed (on runs and diffs) when a
definition changed but kept the version of recorded results. Older
definitions that recorded results still refer to are kept in
`benchmarks/archive/` (currently the `v0`s, see *Migration*).

### Optional tests

A test is optional if its model is in the benchmark's
`optional_models`, or its tool's `optional` is `true` (every model) or
lists the model. Optional tests that fail, error or are unsupported are
reported separately and don't make the benchmark incomplete.

Defaults: in `remote_latency`, everything on Llama-3.1-405B-Instruct
(availability on production NDIF varies) and `j_lens` on Llama-3.1-70B
(no published lens). The local benchmarks have no optional tests: every
model there has a lens.

## Results

`run.json` maps each benchmark run to its result:

```json
{
  "local_latency": {
    "benchmark": {"name": "local_latency", "version": 1, "config_hash": "…", "kind": "local", "dimension": "latency"},
    "status": "complete",
    "env": {"kind": "local", "git_hash": "a1b2c3d…", "dirty": false, "timestamp": "…", "python": "…",
            "nnsight": "<version>", "nnsight_commit": "<commit>", "nnterp": "<version>", "nnterp_commit": "<commit>",
            "transformers": "<version>", "torch": "<version>", "gpu": "<GPU name>", "dtype": "bfloat16", "autocast": true},
    "meta_params": {"n_repeat": 3, "n_warmup": 3, "dtype": "bfloat16", "autocast": true},
    "results": [
      {"tool": "logit_lens[length]", "model": "openai-community/gpt2", "params": {"prompt_length": 25},
       "stats": {"mean": 0.031, "std": 0.001, "min": 0.030, "max": 0.033, "samples": [...]}}
    ],
    "failed": [
      {"tool": "j_lens[length]", "model": "…", "params": {"prompt_length": 50},
       "status": "failed", "error": "out of memory: …"}
    ],
    "optional_failed": []
  }
}
```

- `stats` per test: latency mean / std / min / max / samples in
  seconds (remote adds the four-phase `breakdown`); peak memory
  `footprint_bytes`, `context_cap`, `max_prompt_length` (per threshold
  label), `capped` and `points` (each probed length with `peak_bytes`,
  `pct` and its own `latency`, or `oom: true`).
- `failed` / `optional_failed`: tests that didn't succeed, with
  `status` `failed` (an exception, OOM, or the model failing to load),
  `unsupported` (e.g. no j-lens) or `not_run` (not measured yet, in an
  in-progress entry).
- `status`: `complete` if every non-optional test succeeded, else
  `incomplete`; `in_progress` only in the in-progress file.
- `env`: one stamp for the whole benchmark —
  - both kinds: `git_hash`, `dirty` (the working tree has changes per
    `git status --porcelain`, untracked files included, ignoring the
    benchmark outputs `baseline.json`, `results.md`,
    `benchmark_diff.md`; `run.json` is gitignored), when dirty
    `dirty_fingerprint` (hash of the diff against HEAD plus untracked
    files), `timestamp`, and the nnsight / nnterp versions plus
    `<pkg>_commit` for packages installed from a git checkout;
  - local adds `python`, transformers and torch (+ commits), `gpu`,
    `dtype`, `autocast`;
  - remote adds `remote_server` (production NDIF's `/env`: python and
    key package versions; `"unknown"` for results from before it was
    recorded).

### Finished and interrupted runs

`run.json` only ever holds finished results. While a benchmark runs,
its progress is written after each model to the in-progress file next
to the run file (`run.json` → `run.partial.json`; with `--run
PATH.json`, `PATH.partial.json`): the same format, with `status:
"in_progress"`, the tests measured so far, the rest as `not_run`, and
`progress: {"models_done": [...], "models_remaining": [...]}`.

- When the benchmark **finishes** — complete, or incomplete because
  some tests failed — its entry in `run.json` is replaced, its entry is
  removed from the in-progress file, and the file is deleted once
  empty. Other benchmarks' entries are left alone; with `--all`, each
  benchmark is written when it finishes.
- An **interrupted** or crashed run leaves `run.json` untouched (its
  previous finished entry stays) and keeps the partial measurements in
  the in-progress file. Inspect them with `--run run.partial.json
  --show`; while the file exists, `--show`, `--show-diff` and
  `--promote` print a notice naming the interrupted benchmark(s).
  Running the benchmark again starts it over (resuming isn't
  supported yet; the file records which models are done).
- `--promote` refuses the in-progress file, and `in_progress` entries
  are never promotable.
- Individual tests write neither file.

`run.json`, the in-progress file and `baseline.json` are written
atomically (a temp file in the same directory, then a rename), so an
interrupted write never leaves a half-written file.

`baseline.json` has the same results, each with a `previous` field:
the result it replaced at promotion (or `null`).

## Promotion

`--promote` promotes each benchmark in `run.json` separately:

- **complete** → becomes that benchmark's baseline result; the
  result it replaces moves to `previous` (the one before that is
  dropped).
- **incomplete** → refused, listing its failed non-optional tests;
  the other benchmarks still promote.
- Promoting the very same result again (same `git_hash`, `timestamp`
  and `dirty_fingerprint`) changes nothing, so `previous` keeps the
  real last change.

## Diffs

`--show-diff` compares each benchmark in `run.json` with its baseline
result, test by test (tests match on tool, model and params):

- **Same version**: every test is compared (`vs` column: `baseline`).
- **Different version**: only the tests both sides have are compared
  (`vs`: e.g. `baseline v0`), with a warning giving how many tests are
  shared and how many exist on one side only.
- Tests only in the run are `(new)`; tests only in the baseline are
  `(removed)` (`vs`: `not in run`, or `failed in run`).
- Warnings are printed above the tables (and quoted in Markdown) when
  versions differ, when a definition changed without a version bump,
  and when the environments differ in anything but the code-state
  stamps (git hash, dirty) — package versions, GPU, dtype, autocast,
  server.
- `--with-previous`: each benchmark that is **not** in `run.json` is
  shown as its baseline result vs. its `previous` (`vs`: `last change
  (<old hash> → <new hash>)`). Benchmarks in `run.json` always use
  the live comparison.

```
================================================================================
BENCHMARK DIFF
================================================================================
  Current:   local_latency v1 @ a1b2c3d 2026-10-08  [run.json]
  Baseline:  local_latency v0 @ 9f8e7d6 2026-04-23; remote_latency v0 @ 9f8e7d6 2026-04-23  [baseline.json]

  [LOCAL]
  Tool                  Model  Params                    Baseline   Current                  Delta  vs
  -----------------------------------------------------------------------------------------------------------------
  logit_lens[length]    gpt2   prompt_length=10           115.4ms   112.2ms    -3.2ms (2.7% faster)  baseline v0
  j_lens[length]        gpt2   prompt_length=10                 -    74.2ms                   (new)
================================================================================
```

For remote rows Baseline / Current are `total_unqueued`. The
peak-memory diff shows `baseline -> current (delta)` for each
threshold's max prompt length (higher is better); in Markdown 🟢 / 🔴
mark rows whose lengths only grew / any shrank.

## Showing results

`--show` prints `run.json`: one latency table per kind (local /
remote, side by side by (tool, model, params)), then the peak-memory
table, then one line per benchmark with its status and counts of
failed / unsupported / not-run tests (`--detail` lists them with their
errors).

```
  [LOCAL]
  Tool                  Model  Params                 Mean        Std
  --------------------------------------------------------------------
  logit_lens[length]    gpt2   prompt_length=10     113.8ms     11.0ms

  Tool        Model                    Params                          Footprint    10%    25%    50%
  ----------------------------------------------------------------------------------------------------
  logit_lens  google/gemma-3-1b-pt     top_k=5, include_entropy=True     1.86GiB     14     35     70
```

## Individual tests

`--model`, `--tool` and `--param NAME=V[,V...]` run just the matching
tests and print them with the same tables; they are **never** written
to `run.json` and can't be promoted.

- They draw from the local benchmarks' definitions (or the ones named
  with `--benchmarks`); `--model` / `--tool` are substring filters, and
  a full model name not in a definition is run too.
- `--param` replaces a latency sweep's values (e.g. a prompt length the
  definition doesn't have).
- `--repeat`, `--warmup`, `--dtype`, `--no-autocast`, `--thresholds`,
  `--min-length`, `--max-length` override the definition's
  `meta_params` — for individual tests only; benchmark runs always use
  their definition.

## Peak memory

On NDIF each model's process gets a memory budget proportional to its
weights, so what limits a tool is the memory it needs *beyond* the
weights. `peak_mem` measures exactly that, locally:

- The model is loaded on the GPU in `dtype` and each call runs under
  `torch.autocast("cuda", dtype, cache_enabled=False)`, the context
  NDIF executes traces in (it makes softmax/exp/sum on half inputs
  return float32, so skipping it would understate memory).
- **Peak** = `torch.cuda.max_memory_allocated()` during the call minus
  `memory_allocated()` before it, measured once per point after
  `n_warmup` untimed calls. It is deterministic, so there is no repeat.
- **Footprint** = parameter + buffer bytes of the loaded model;
  **pct** = peak / footprint × 100.
- **Search**: prompt length doubles from `min_length` until the peak
  exceeds the largest threshold or the cap is reached; then each
  threshold is bisected between its bracketing points to the exact
  largest passing length. The cap is `min(max_length, context length
  - 1)`. An out-of-memory point counts as over every threshold.
- **Edge cases**: `null` (shown `<2`) means even the smallest length is
  over the threshold; a label listed in `capped` (shown `>=4096`) never
  crossed it up to the cap, so the true limit is higher.
- Every probed point (coarse and bisection) is kept with its peak,
  pct and its own latency stats (`n_warmup` + `n_repeat` timed calls,
  separate from the memory measurement, same GPU / dtype / autocast).

Remote memory isn't observable from the client yet; when NDIF reports
it, it can be added as a remote peak-memory benchmark.

## Migration

Besides the current format, only the original results format loads
(`results.local` / `results.remote` rows, upgraded in memory by
`legacy.py`): each kind's rows become one latency result, versioned by
the current or archived definition whose test set they equal (or
`version: null` if none matches). Any other file is rejected with an
error naming it. Default paths fall back to `results.json` /
`latest.json` when `baseline.json` / `run.json` don't exist.

The results recorded before definitions existed became **v0** of
`local_latency` and `remote_latency`, defined in
`benchmarks/archive/` as exactly what was measured:

- `local_latency` v0: gpt2 and Llama-3.1-8B × `logit_lens[length]` /
  `activation_patching[length]` × prompt length 10 / 25 / 50, measured
  on CPU in float32 without autocast (`n_repeat` 10, `n_warmup` 3).
  All 12 tests have results, so it is `complete`.
- `remote_latency` v0: gpt2, Llama-3.1-8B, -70B and -405B-Instruct × the
  same tools and lengths (24 tests, `complete`), with `remote_server:
  "unknown"`.

There is no `peak_mem` baseline yet. Diffing a v1 run against these
compares the shared tests and warns about the version and environment
differences.

## Remote execution

Each nnsightful tool accepts `remote=True`. The runner uses a custom
`RemoteBackendCounter` (a subclass of `nnsight`'s `RemoteBackend`)
that records per-phase latency via status callbacks:

- `total` — wall clock from submit to done.
- `total_unqueued` — `total` minus queue wait time.
- `running` — active compute time on the backend.
- `download` — time from remote completion to result arrival locally.

The stats stored per remote test are `total_unqueued`, because queue
wait is a property of backend congestion rather than the code being
measured; the other phases are in `breakdown` and appear in `--show
--detail`. The runner sets `nnsight.CONFIG.API.HOST` to production NDIF
and records the server's versions in `env.remote_server`.

## Resilience

Nothing aborts a run. Each test is isolated: an exception while
building its arguments, warming up or measuring makes it `failed`
(with the error), an `UnsupportedTest` makes it `unsupported`, and a
model that fails to load fails its tests. A failed warmup is reported
and each test is still measured. Models are loaded one at a time and
freed before the next. A results file that exists but isn't valid JSON
(e.g. a merge-conflict marker or a half-written file) stops every
command with an error naming the file instead of being overwritten.

## Markdown export

`--md` writes the same tables as stdout but as Markdown, in addition
to printing; works with `--show`, `--diff`, `--show-diff`. `--md PATH`
picks the destination; `--md` alone writes `results.md` (show) or
`benchmark_diff.md` (diffs) next to `baseline.json`.

`--plots` (requires matplotlib via `pip install -e '.[plots]'`) embeds
one line plot per (tool, section): mean latency (with ±1 std band) vs.
the swept parameter, one line per model; peak-memory tools get peak MiB
and % of footprint vs. prompt length, with the thresholds as dotted
lines and OOM points as `x`. Diff plots overlay the run (solid) on the
baseline (dashed). The Y-axis switches to log scale when values span
≥10×.

## Files

| File | Purpose |
|------|---------|
| `benchmarks/*.json`, `benchmarks/archive/*.json` | Benchmark definitions (current and archived versions) |
| `definitions.py` | `BenchmarkDefinition`: loading / validating definitions, tests, optional markers, `config_hash`, version warnings (pure) |
| `config.py` | `ToolRegistry`: tool name → nnsightful tool + argument builder, and the runnable configs of a definition |
| `prompts.py` | `Prompts.of_length()` — prompts of an exact token count |
| `runner.py` | `run_benchmark()`, `run_individual()`, `BenchmarkRunner` (the shared run loop) |
| `env.py` | `Env`: capturing the environment stamp and comparing stamps |
| `meters.py` | Meters wrapping one tool call each: `LocalLatency`, `RemoteLatency`, `PeakMemory`; NDIF-style autocast |
| `sweeps.py` | Sweep strategies: `GridSweep` (latency) and `ThresholdSearch` (peak memory: coarse sweep + bisection, pure) |
| `store.py` | `Result` (format, status, promotion rules) and `ResultsStore` (run / baseline / in-progress files) (pure) |
| `legacy.py` | Reader for the original `results.json` format (pure) |
| `backend.py` | `RemoteBackendCounter` — per-phase latency for remote runs |
| `diff.py` | Terminal and Markdown tables (`print_results`, `print_diff`, `markdown_results`, `markdown_diff`) |
| `plots.py` | Latency and peak-memory plots for the Markdown export |
| `__main__.py` | CLI entry point |
| `test_benchmark.py` | Tests for the harness itself (no GPU / network): `pytest tests/benchmark` |
| `fixtures/results_v1.json` | A results file in the original format, for the migration tests |

## How a benchmark is measured

`BenchmarkRunner` runs one loop for every benchmark: per model and
test it builds the tool's arguments, warms up, runs a **meter** around
each call, aggregates the stats, and turns failures into failed /
unsupported results.

- **Meters** (`meters.py`) are context managers around one tool call:
  `LocalLatency` (synced wall clock), `RemoteLatency` (injects
  `remote=True` and a fresh `backend=` counter, records the four
  phases) and `PeakMemory` (peak allocated beyond what was allocated
  before the call). An out-of-memory error is recorded on the meter
  instead of raised. Local calls also run under NDIF's autocast.
- **Sweeps** (`sweeps.py`): latency tests are the points of a
  `GridSweep` over the definition's `sweep`; a peak-memory test is a
  `ThresholdSearch`. Each probed length gets its warmup calls, one
  `PeakMemory` call, then separate `LocalLatency` repeats — memory and
  time are never measured in the same call.

## Notes

- **GPU timing**: the runner calls `torch.cuda.synchronize()` around
  local timed blocks, so async kernel launches are captured.
- **Warmup**: for latency, `n_warmup` untimed calls per (tool, model)
  using the last (usually largest) sweep combo, before its combos are
  timed.
- **Variance**: `std` is the sample standard deviation. If `std / mean`
  is large, raise `n_repeat` in the definition (and bump its version).
