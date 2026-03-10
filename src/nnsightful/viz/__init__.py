"""
nnsightful.viz - Display interpretability visualizations in Jupyter notebooks.

Usage:
    from nnsightful.viz import display_logit_lens, display_line_plot

    display_logit_lens(data)
    display_line_plot(data, options={"mode": "probability"})
"""

import json
from pathlib import Path
from IPython.display import HTML, display as ipython_display
from pydantic import BaseModel


def _to_dict(obj):
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


def display_logit_lens(
    data: dict,
    ui_state: dict | None = None,
    width: str = "80%",
    height: str = "450px",
    dark_mode: bool = False,
) -> HTML:
    """
    Display a LogitLens visualization in a Jupyter notebook.

    Args:
        data: LogitLensData dict (V2 format with meta, layers, input, tracked, topk).
        ui_state: Optional LogitLensUIState dict for initial widget configuration.
        width: CSS width of the container.
        height: CSS height of the container.
        dark_mode: Whether to use dark mode.

    Returns:
        IPython.display.HTML object.
    """
    js = _get_standalone_js()
    data_json = json.dumps(_to_dict(data))
    ui_state_json = json.dumps(ui_state or {})

    if dark_mode:
        ui_state_dict = ui_state or {}
        ui_state_dict["darkMode"] = True
        ui_state_json = json.dumps(ui_state_dict)

    html = f"""
    <div id="ll_container" style="width:{width};min-height:{height};"></div>
    <script>
    (function() {{
        {js}
        var container = document.getElementById('ll_container');
        var data = {data_json};
        var uiState = {ui_state_json};
        window.LogitLensWidget(container, data, uiState);
    }})();
    </script>
    """

    result = HTML(html)
    ipython_display(result)
    return result


def display_line_plot(
    data: dict,
    options: dict | None = None,
    width: str = "80%",
    height: str = "300px",
) -> HTML:
    """
    Display a LinePlot visualization in a Jupyter notebook.

    Args:
        data: LinePlotData dict with 'lines' and optional 'labels'.
        options: Optional LinePlotOptions dict (mode, title, darkMode, etc.).
        width: CSS width of the container.
        height: CSS height of the container.

    Returns:
        IPython.display.HTML object.
    """
    js = _get_standalone_js()
    data_json = json.dumps(_to_dict(data))
    options_json = json.dumps(options or {})

    html = f"""
    <div id="lp_container" style="width:{width};height:{height};"></div>
    <script>
    (function() {{
        {js}
        var container = document.getElementById('lp_container');
        var data = {data_json};
        var options = {options_json};
        window.LinePlotWidget(container, data, options);
    }})();
    </script>
    """

    result = HTML(html)
    ipython_display(result)
    return result
