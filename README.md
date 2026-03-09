# nnsightful

Interpretability tools for neural networks. This package provides both Python tools for running interpretability methods (logit lens, activation patching) and JavaScript/TypeScript visualizations for displaying the results.

## Installation

### Python

```bash
# Base install (types only)
pip install nnsightful

# With interpretability tools (requires torch + nnsight)
pip install "nnsightful[tools]"

# With Jupyter visualization helpers
pip install "nnsightful[viz]"

# Everything
pip install "nnsightful[all]"
```

### JavaScript/TypeScript

```bash
npm install github:AdamBelfki3/nnsightful
```

## Usage

### Python: Running interpretability methods

```python
from nnsightful.tools.logit_lens import logit_lens, format_data
from nnsightful.tools.activation_patching import activation_patching, format_data

# Run logit lens on a model
all_logits = logit_lens(prompt, model, remote=False, backend=backend)
data = format_data(all_logits, input_tokens, topk=10, include_entropy=True, model_name="gpt2", tokenizer=tokenizer)
```

### Python: Jupyter visualizations

```python
from nnsightful.viz import display_logit_lens, display_line_plot

# Display a logit lens heatmap + trajectory chart
display_logit_lens(data, dark_mode=True)

# Display a line plot
display_line_plot(data, options={"mode": "probability"})
```

### React

```tsx
import { LogitLensWidget, LinePlotWidget } from "interp-tools";

<LogitLensWidget data={data} darkMode={true} />
<LinePlotWidget data={data} darkMode={true} />
```

### Standalone (vanilla JS)

```html
<script src="dist/standalone.js"></script>
<script>
  window.LogitLensWidget(container, data);
  window.LinePlotWidget(container, data, options);
</script>
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
│       └── viz/             # Jupyter display helpers
├── examples/                # Example notebooks
├── dist/                    # JS build output (ESM + IIFE)
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
- `dist/standalone.js` — Self-contained IIFE bundle for Jupyter notebooks and standalone HTML

### Editable Python install

```bash
pip install -e ".[all]"
```
