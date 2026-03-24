# Tests

## Running tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run all tests (uses gpt2 by default)
pytest

# Run a single test file
pytest tests/test_logit_lens.py

# Run a single test
pytest tests/test_logit_lens.py::TestLogitLensEndToEnd::test_basic_output_structure

# Use a different model
pytest --model-names "gpt2,Maykeye/TinyLLama-v0"
```

## Test files

### `test_utils.py`

Unit tests for `nnsightful.tools._utils.resolve_indices`. No model needed — these run fast and test the `IndexSpec` → sorted list conversion (None, ints, negative indices, tuple ranges, lists, deduplication, error cases).

### `test_logit_lens.py`

End-to-end tests for `nnsightful.tools.logit_lens`. Requires a model (parametrized via `--model-names`). Covers output structure, layer/position selection, top-k/top-p filtering, entropy, `logit_indices`, JSON round-trip, and the `_run`/`_format` split.

### `test_activation_patching.py`

End-to-end tests for `nnsightful.tools.activation_patching`. Requires a model. Covers output structure, layer count, rank values, range-based `src_pos`, JSON round-trip, and the `_run`/`_format` split.

### `test_viz.py`

Tests for `nnsightful.viz` display functions (`display_logit_lens`, `display_line_plot`). No model needed — uses mocked JS and synthetic data. Covers HTML output, unique container IDs, dark mode injection, Pydantic model input, missing-key validation, and the `.display()` passthrough.

## Fixtures

Defined in `conftest.py`:

- **`model`** — session-scoped `StandardizedTransformer` fixture. Caches loaded models and skips tests if a model fails to load. Parametrized by `--model-names` (comma-separated, default `gpt2`).
