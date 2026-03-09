# nnsightful

A higher-level extension of [NNsight](https://github.com/ndif-team/nnsight) providing ready-to-use mechanistic interpretability methods and interactive visualizations for exploring the results.

## Installation

```bash
pip install nnsightful
```

## Usage

### Running interpretability methods

```python
from nnsightful import logit_lens, activation_patching

# Logit lens
all_logits = logit_lens.logit_lens(prompt, model, remote=False, backend=backend)
data = logit_lens.format_data(all_logits, input_tokens, topk=10, include_entropy=True, model_name="gpt2", tokenizer=tokenizer)

# Activation patching
results = activation_patching.activation_patching(model, src_prompt, tgt_prompt, src_pos, tgt_pos, tgt_freeze, backend)
data = activation_patching.format_data(patched_logits, tokenizer, src_pred, clean_pred, clean_logits)
```

### Jupyter visualizations

```python
from nnsightful import display_logit_lens, display_line_plot

# Display a logit lens heatmap + trajectory chart
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
│       ├── types.py         # Pydantic data models
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
```

This produces:
- `dist/index.mjs` — ESM bundle (React externalized) for use in React/Next.js apps
- `src/nnsightful/viz/charts.js` — Self-contained IIFE bundle for Jupyter notebooks, bundled with the Python package

### Editable Python install

```bash
pip install -e .
```
