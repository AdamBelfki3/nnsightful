"""
nnsightful.viz - Display interpretability visualizations in Jupyter notebooks.

Usage:
    from nnsightful.viz import display_logit_lens, display_line_plot

    display_logit_lens(data)
    display_line_plot(data, options={"mode": "probability"})
"""

import json
import uuid
from pathlib import Path

from IPython.display import HTML
from IPython.display import display as ipython_display
from pydantic import BaseModel


def _to_dict(obj: dict | BaseModel) -> dict:
    """Convert Pydantic models to dicts, pass dicts through."""
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    return obj

_STANDALONE_JS: str | None = None


def _get_standalone_js() -> str:
    """Load and cache the standalone JS bundle."""
    global _STANDALONE_JS
    if _STANDALONE_JS is None:
        js_path = Path(__file__).resolve().parent / "charts.js"
        if not js_path.exists():
            raise FileNotFoundError(
                f"charts.js not found at {js_path}. "
                "Run 'npm run build' in the nnsightful/ directory first."
            )
        _STANDALONE_JS = js_path.read_text(encoding="utf-8")
    return _STANDALONE_JS


_LOGIT_LENS_REQUIRED_KEYS = {"meta", "layers", "input", "tracked", "topk"}


def _validate_logit_lens_data(data: dict) -> None:
    """Validate that data has the required LogitLensData keys."""
    missing = _LOGIT_LENS_REQUIRED_KEYS - set(data.keys())
    if missing:
        raise ValueError(
            f"LogitLensData is missing required keys: {sorted(missing)}. "
            f"Expected keys: {sorted(_LOGIT_LENS_REQUIRED_KEYS)}. "
            f"Got keys: {sorted(data.keys())}. "
            "See nnsightful.types.LogitLensData for the expected schema."
        )


def _densify_logit_lens_data(data: dict) -> dict:
    """Expand sparse-position LogitLensData to dense format for the JS widget.

    The JS widget indexes tracked/topk by position offset into input tokens.
    When positions is not None (sparse), tracked and topk only contain entries
    for selected positions. This fills in empty entries for unselected positions.
    """
    positions = data.get("positions")
    if positions is None:
        return data

    n_tokens = len(data["input"])
    n_layers = len(data["layers"])

    # Build a mapping from token index -> sparse index
    pos_set = {p: i for i, p in enumerate(positions)}

    # Expand tracked: one dict per token position
    dense_tracked = []
    for tok_idx in range(n_tokens):
        if tok_idx in pos_set:
            dense_tracked.append(data["tracked"][pos_set[tok_idx]])
        else:
            dense_tracked.append({})

    # Expand topk: topk[layer][position] -> list of token strings
    dense_topk = []
    for li in range(n_layers):
        layer_topk = []
        for tok_idx in range(n_tokens):
            if tok_idx in pos_set:
                layer_topk.append(data["topk"][li][pos_set[tok_idx]])
            else:
                layer_topk.append([])
        dense_topk.append(layer_topk)

    # Expand entropy if present
    dense_entropy = None
    if data.get("entropy") is not None:
        dense_entropy = []
        for li in range(n_layers):
            layer_entropy = []
            for tok_idx in range(n_tokens):
                if tok_idx in pos_set:
                    layer_entropy.append(data["entropy"][li][pos_set[tok_idx]])
                else:
                    layer_entropy.append(0.0)
            dense_entropy.append(layer_entropy)

    return {
        **data,
        "positions": None,  # now dense
        "tracked": dense_tracked,
        "topk": dense_topk,
        "entropy": dense_entropy,
    }


def display_logit_lens(
    data: dict | BaseModel,
    ui_state: dict | None = None,
    width: str = "80%",
    height: str = "450px",
    dark_mode: bool | None = None,
    return_html: bool = False,
) -> HTML | None:
    """
    Display a LogitLens visualization in a Jupyter notebook.

    Args:
        data: LogitLensData dict (V2 format with meta, layers, input, tracked, topk).
        ui_state: Optional LogitLensUIState dict for initial widget configuration.
        width: CSS width of the container.
        height: CSS height of the container.
        dark_mode: Force dark (True) or light (False) mode. When None,
            auto-detects from the notebook theme.
        return_html: If True, return the HTML object instead of displaying it.
            Useful for serializing the widget for later viewing.
    """
    data = _to_dict(data)
    _validate_logit_lens_data(data)
    data = _densify_logit_lens_data(data)
    js = _get_standalone_js()
    data_json = json.dumps(data)
    container_id = f"ll-{uuid.uuid4().hex}"

    ui_state_dict = ui_state or {}
    if dark_mode is not None:
        ui_state_dict["darkMode"] = dark_mode
    ui_state_json = json.dumps(ui_state_dict)

    # Gray out rows where all .pred-cell elements are empty (uncomputed positions).
    # Uses a MutationObserver so styling is re-applied after widget re-renders.
    disable_js = """
            function disableEmptyRows(ct) {
                var rows = ct.querySelectorAll("tr");
                for (var i = 0; i < rows.length; i++) {
                    var cells = rows[i].querySelectorAll(".pred-cell");
                    if (cells.length === 0) continue;
                    var empty = true;
                    for (var c = 0; c < cells.length; c++) {
                        if (cells[c].textContent.trim() !== "") { empty = false; break; }
                    }
                    if (empty) {
                        rows[i].style.pointerEvents = "none";
                        for (var c = 0; c < cells.length; c++) {
                            cells[c].style.opacity = "0.5";
                        }
                    } else {
                        rows[i].style.pointerEvents = "";
                        for (var c = 0; c < cells.length; c++) {
                            cells[c].style.opacity = "";
                        }
                    }
                }
            }
            disableEmptyRows(container);
            new MutationObserver(function() { disableEmptyRows(container); })
                .observe(container, { childList: true, subtree: true });"""

    html = f"""
    <div id="{container_id}" style="width:{width};min-height:{height};"></div>
    <script>
    {js}
    (function() {{
        var data = {data_json};
        var container = document.getElementById("{container_id}");
        if (typeof LogitLensWidget !== "undefined") {{
            LogitLensWidget(container, data, {ui_state_json});
            {disable_js}
        }} else {{
            container.innerHTML = "<pre>LogitLensWidget not loaded</pre>";
        }}
    }})();
    </script>
    """

    result = HTML(html)
    if return_html:
        return result
    ipython_display(result)


_LINE_PLOT_REQUIRED_KEYS = {"lines"}


def _validate_line_plot_data(data: dict) -> None:
    """Validate that data has the required LinePlotData keys."""
    missing = _LINE_PLOT_REQUIRED_KEYS - set(data.keys())
    if missing:
        raise ValueError(
            f"LinePlotData is missing required keys: {sorted(missing)}. "
            f"Expected keys: 'lines' (required), 'labels' (optional). "
            f"Got keys: {sorted(data.keys())}."
        )


def display_line_plot(
    data: dict | BaseModel,
    options: dict | None = None,
    width: str = "80%",
    height: str = "300px",
    return_html: bool = False,
) -> HTML | None:
    """
    Display a LinePlot visualization in a Jupyter notebook.

    Args:
        data: LinePlotData dict with 'lines' and optional 'labels'.
        options: Optional LinePlotOptions dict (mode, title, darkMode, etc.).
        width: CSS width of the container.
        height: CSS height of the container.
        return_html: If True, return the HTML object instead of displaying it.
            Useful for serializing the widget for later viewing.
    """
    data = _to_dict(data)
    _validate_line_plot_data(data)
    js = _get_standalone_js()
    data_json = json.dumps(data)
    options_json = json.dumps(options or {})
    container_id = f"lp-{uuid.uuid4().hex}"

    html = f"""
    <div id="{container_id}" style="width:{width};height:{height};"></div>
    <script>
    {js}
    (function() {{
        var data = {data_json};
        var container = document.getElementById("{container_id}");
        if (typeof LinePlotWidget !== "undefined") {{
            var options = {options_json};
            LinePlotWidget(container, data, options);
        }} else {{
            container.innerHTML = "<pre>LinePlotWidget not loaded</pre>";
        }}
    }})();
    </script>
    """

    result = HTML(html)
    if return_html:
        return result
    ipython_display(result)
