# Tests

## Running tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run all local tests (uses openai-community/gpt2 by default)
pytest

# Also run the remote tests, which submit jobs to NDIF (needs an NDIF API key,
# and the model must be hosted there)
pytest --remote

# Run a single test file
pytest tests/test_logit_lens.py

# Use different models
pytest --model-names "openai-community/gpt2,google/gemma-3-1b-pt"

# JS/TS widget tests (node's built-in test runner, after `npm install`)
npm test
```

## What is tested

Each tool file tests the tool's own behaviour on a local model. The checks
compare against an independent reference (the model's own output, another
tool, or a run the result must not depend on) rather than only asserting
types, so a wrong number fails, not just a wrong shape.

### `test_logit_lens.py`

- **Payload**: layers, positions, top-k cells, tracked trajectories and
  entropy have the right sizes, and each position's tracked tokens are the
  union of its top-k across layers.
- **Matches the model**: the last layer's top-k, probabilities and entropy
  equal those of the model's own output distribution.
- **Options**: `top_k` sets the cell width; `include_entropy=False` drops
  entropy without changing the rest (entropy is computed in place, last).
- **Tool**: `raw=True` returns the `[layer, pos, vocab]` logits on CPU, whose
  last layer is the model's logits; `logit_lens.format` turns them (all
  positions or a selection) into exactly the non-raw payload.
- **Positions**: each `positions` form (negative, range, list, list of
  ranges) gives exactly the full run's rows for those positions, with
  `positions` listing them and `input` still every token; `raw=True` holds
  only those rows (the buffer is allocated at the selection's size); an empty
  or out-of-range selection raises `ValueError` before tracing.

### `test_j_lens.py`

- **Lens registry** (no model, HF mocked): lens files are keyed by model
  name, fetched once, looked up without the org, and a model without a lens
  raises.
- **Jacobians**: identity Jacobians reduce j-lens to the logit lens, without
  looking up a lens; with the real lens the last layer (which has no
  Jacobian) equals the logit lens and the others don't.
- **Generation**: with `max_new_tokens=n`, positions span the prompt plus
  `n - 1` generated tokens, `completion` matches `model.generate`, and the
  raw tensor concatenates the steps; `j_lens.format` turns it into exactly
  the non-raw payload (formatted step by step), with and without generated
  tokens or a position selection.
- **Positions**: selecting prompt positions keeps every generated one, and
  the rows equal the full run's; `positions` is the selected prompt indices
  followed by the generated ones; `raw=True` holds the same rows; a selection
  outside the prompt (generated positions included) raises before
  generating.

### `test_activation_patching.py`

- **Payload**: every series is tokens × layers; ranks order the
  probabilities.
- **Causal effect**: the first two labels are the source and clean
  predictions; `prob_diffs` are relative to the clean run; patching the last
  position at the last layer yields the source's probability; patching a
  prompt into itself changes nothing.
- **Options**: a one-wide `src_pos` range equals that position; a
  `batch_size` that leaves a partial batch gives the same result.
- **Tool**: `raw=True` returns the unformatted pieces, which
  `activation_patching.format(**raw)` turns into exactly the non-raw
  payload.

### `test_execution_modes.py`

Every tool through every way of running it:

- **Local**: `tool(...)` returns the typed payload, and it survives JSON.
- **Remote** (`--remote`): the blocking backend, the non-blocking
  submit-then-poll flow workbench uses, and `AsyncRemoteBackend` (submit
  with `non_blocking=True`, then `await` the backend) each return the typed
  payload, built on NDIF, with the local run's labels and top predictions. The lenses also run with
  `positions` set (a list, and a range), so both indexing forms run on NDIF.

### `test_utils.py`, `test_viz.py`

`resolve_indices` and the `nnsightful.viz` display functions; no model
needed. A payload with sparse `positions` reaches the widget unchanged (the
widget maps it onto its rows).

### `js/` (`npm test`)

`run.mjs` bundles `js/*.test.ts` with esbuild and runs them with
`node --test`. The fixtures in `js/fixtures/` are gpt2 logit-lens and j-lens
payloads (`top_k=2`, trajectories rounded to 4 decimals), each dense and with
a `positions` selection.

- **Densify**: a sparse payload maps onto the dense run's rows across
  `input + completion`, with empty cells, `{}` tracked and `0` entropy at the
  rows that weren't computed; dense payloads pass through.
- **Locked sections**: each gap of uncomputed rows becomes one locked
  collapsed section, which stays collapsed even when flagged expanded.
- **Composition**: host sections merged ahead of the locked ones keep their
  indices; a host section entirely over uncomputed rows is dropped, and
  expanding one that overlaps them still leaves those rows banded.

### `benchmark/`

The performance benchmarks and their tests; see `benchmark/README.md`.

## Fixtures and helpers

- **`model`** (`conftest.py`): session-scoped `StandardizedTransformer`,
  cached, parametrized by `--model-names`; tests skip if it fails to load.
  The same object runs locally and, in the remote tests, on NDIF.
- **`helpers.py`**: `model_logits` (the model's own output logits) and
  `decode_each` (per-token labels, as the tools decode them).

Prompts are chosen so the predictions the tests compare have clear margins;
a near-tie can flip between local and NDIF hardware.
