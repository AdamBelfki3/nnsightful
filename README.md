# nnsightful

A higher-level extension of [NNsight](https://github.com/ndif-team/nnsight) providing ready-to-use mechanistic interpretability methods and interactive visualizations for exploring the results.

## Installation

Install the latest version directly from GitHub:

```bash
pip install git+https://github.com/AdamBelfki3/nnsightful.git
```

## Usage

### Running interpretability methods

```python
from nnterp import StandardizedTransformer
from nnsightful import activation_patching, j_lens, logit_lens

model = StandardizedTransformer("gpt2")

# Logit lens — returns LogitLensData directly
data = logit_lens(model, prompt, top_k=10)

# Only project some positions: an int, an (start, end) range, a list of ints
# or of ranges; negatives count from the end. Cost scales with the selection,
# not the prompt length. `input` keeps every token; `positions` lists the
# selected indices, which `topk`, `tracked` and `entropy` follow.
data = logit_lens(model, prompt, positions=[0, 1, -1])

# J-lens — the same over `max_new_tokens` generation steps; `positions` selects
# prompt positions, and every generated position is kept
data = j_lens(model, prompt, max_new_tokens=5, positions=-1)

# Activation patching — returns ActivationPatchingData directly
data = activation_patching(model, src_prompt, tgt_prompt, src_pos, tgt_pos, tgt_freeze)
```

### Running on NDIF

Where a tool runs is its `exec_mode`. On [NDIF](https://ndif.us) the result is
formatted there and only the payload comes back.

```python
from nnsightful import ExecMode, NonBlockingToolBackend

# Local (the default) or blocking remote: the data, as usual
data = logit_lens(model, prompt)
data = logit_lens(model, prompt, exec_mode=ExecMode.REMOTE)

# Non-blocking: submit, and collect the result later — here or, from the job
# id, in another request or process
job = logit_lens(model, prompt, exec_mode=ExecMode.REMOTE_NON_BLOCKING)
job.job_id
data = job.poll()                 # None until the job completes
data = job.result(timeout=300)    # or wait for it
data = NonBlockingToolBackend.from_job(model, job.job_id).result()

# Async, on an event loop: await the result, or stream the status updates
run = logit_lens(model, prompt, exec_mode=ExecMode.REMOTE_ASYNC)
data = await run.result()
async for update in run.updates():
    print(update.status)          # QUEUED, DISPATCHED, RUNNING, COMPLETED
data = await run.result()         # returns at once after the stream

# Your own backend: pass `model.session` arguments; the backend is returned
backend = logit_lens(model, prompt, exec_mode={"remote": True, "backend": my_backend})
```

A backend serves one run: pass a new one (or the class, e.g.
`NonBlockingToolBackend`, built for each run) on every call. A non-blocking
backend that already has a job id polls that job instead of submitting a new
one. The modes also accept their names (`exec_mode="remote_async"`). The backends
the tool builds carry the model's per-request environment (attention
implementation, PEFT adapter), as nnsight's own remote backends do. An async
run's status stream is consumed once, and an `ERROR` status raises
`RemoteError`. The data classes are built on NDIF, so the client's pydantic
version has to match the server's to load them.

### Jupyter visualizations

```python
from nnsightful import display_logit_lens, display_line_plot

# Display a logit lens heatmap + trajectory chart. With a `positions`
# selection only the computed rows show; each run of the others folds into a
# locked "… N rows not computed" band
display_logit_lens(data, dark_mode=True)

# Display an activation patching line plot
display_line_plot(data, options={"mode": "probability"})
```

### React components

```tsx
import { LogitLensWidget, LinePlotWidget } from "nnsightful";

<LogitLensWidget data={data} darkMode={true} />
<LinePlotWidget data={data} darkMode={true} />
```

The logit-lens widget takes the tools' payload as is, sparse `positions`
included. Rows it wasn't computed at are hidden behind locked collapsed
sections, kept apart from the `collapsedSections` in its UI state: those are
the host's (indices in `onToggleCollapse` / `onRemoveCollapse` refer to that
array) and only they are persisted.

In the generic heatmap core, a `collapsedSections` entry with `locked: true`
is always collapsed — its band has no expand affordance and ignores clicks —
and wins over any other section overlapping its rows; `label` replaces the
"hidden" in "… N rows hidden".

## Project Structure

```
nnsightful/
├── src/
│   ├── charts/              # JS/TS visualization library
│   │   ├── core/            # Framework-agnostic widget implementations
│   │   ├── react/           # Thin React wrappers
│   │   └── types/           # TypeScript type definitions
│   └── nnsightful/          # Python package
│       ├── tools/           # Interpretability methods (logit lens, activation patching)
│       ├── types.py         # Pydantic data models, each formatting its tool's results
│       └── viz/             # Jupyter display helpers (includes bundled charts.js)
├── examples/                # Example notebooks
├── dist/                    # JS build output (ESM for React/Next.js apps)
├── package.json             # npm package config
└── pyproject.toml           # pip package config
```

## Development

### Building the JS/TS visualizations

```bash
npm install
npm run build
npm test       # widget tests (node's built-in test runner)
```

This produces:
- `dist/index.mjs` — ESM bundle (React externalized) for use in React/Next.js apps
- `src/nnsightful/viz/charts.js` — Self-contained IIFE bundle for Jupyter notebooks, bundled with the Python package

### Editable Python install

```bash
pip install -e .
```
