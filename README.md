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

Every tool takes `remote=True` to run on [NDIF](https://ndif.us); the result
is formatted there and only the payload comes back.

```python
# Blocking: waits for the job and returns the data, as locally
data = logit_lens(model, prompt, remote=True)

# Non-blocking: submit, get the job id, and collect the result later
from nnsight.intervention.backends.remote import RemoteBackend

job_id = logit_lens(model, prompt, remote=True, non_blocking=True,
                    backend=RemoteBackend(model.to_model_key(), blocking=False))
poll = RemoteBackend(model.to_model_key(), job_id=job_id, blocking=False)
saves = poll()                    # None until the job completes
data = saves["results"]

# Async: an AsyncRemoteBackend gives a RemoteRun, consumed on an event loop
from nnsight.intervention.backends.remote import AsyncRemoteBackend

run = logit_lens(model, prompt, remote=True,
                 backend=AsyncRemoteBackend(model.to_model_key()))
data = await run                  # wait for the result

# ...or stream the job's status updates as they land, e.g. to a client
async for update in run:
    print(update.status)          # RECEIVED, QUEUED, RUNNING, ... COMPLETED
data = run.result
```

A `RemoteRun` is consumed once (await it or iterate it), and an `ERROR`
status raises `RemoteError`. The data classes are built on NDIF, so the
client's pydantic version has to match the server's to load them.

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

### Static rendering and snapshots

Pass `interactive={false}` (or `{ interactive: false }` to `LogitLensCore` /
`ActivationPatchingCore`) for a static rendering of a chart's UI state, e.g.
to embed it in a document. The logit lens then shows its full content height
— every row, with collapsed sections as bands — without controls, hover,
popups or keyboard focus; activation patching shows the plot and its legend
without the mode bar and token selector. Updating `uiState` still re-renders.

`snapshotChart` draws the same static rendering offscreen from a chart's data
and UI state — the state the widget emits on `stateChange` — and captures it
as a PNG, in the browser:

```ts
import { snapshotChart } from "nnsightful";

const shot = await snapshotChart(
    { kind: "logit-lens", data, uiState },          // logit lens and j-lens
    { width: 880, scale: 2, darkMode: false },
);
shot.dataUrl;          // PNG data URL, shot.width × shot.height CSS px
await shot.toBlob();

await snapshotChart({ kind: "activation-patching", data, mode: "rank", selectedTokens: [0, 3] });
```

`width` sets the layout width (the logit lens samples its layer columns to
fit it, as on screen); activation patching also takes a `height`. `scale` is
the pixel density, lowered automatically for images too large for a canvas.
`captureElement(el, options)` captures any rendered element the same way.
Both are also on the standalone bundle (`InterpTools.snapshotChart`). Verified
in Chromium; WebKit browsers may refuse to read back the image (the snapshot
then rejects with an error saying so).

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
