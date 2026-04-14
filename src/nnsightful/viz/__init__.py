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


# ── Global defaults ──────────────────────────────────────────────────

_default_width: str = "90%"
_default_aspect_ratio: str | None = None  # None = use per-widget default
_default_dark_mode: bool | None = None

_WIDGET_ASPECT_RATIOS = {
    "logit_lens": 5/3,  # content-driven height (table + chart with its own aspect ratio)
    "activation_patching": "21 / 9",
    "line_plot": "21 / 9",
}

_SENTINEL = object()


def set_defaults(
    width: str | None = _SENTINEL,
    aspect_ratio: str | None = _SENTINEL,
    dark_mode: bool | None = _SENTINEL,
) -> None:
    """Set global display defaults for all visualizations.

    Pass None to reset a setting to its default behavior:
    - width=None → "70%"
    - aspect_ratio=None → per-widget default
    - dark_mode=None → auto-detect

    Args:
        width: Default CSS width (e.g. "70%", "600px"). None resets to "70%".
        aspect_ratio: Default CSS aspect-ratio (e.g. "16 / 9"). None resets
            to per-widget default.
        dark_mode: True for dark, False for light, None for auto-detect.
    """
    global _default_width, _default_aspect_ratio, _default_dark_mode
    if width is not _SENTINEL:
        _default_width = width if width is not None else "70%"
    if aspect_ratio is not _SENTINEL:
        _default_aspect_ratio = aspect_ratio
    if dark_mode is not _SENTINEL:
        _default_dark_mode = dark_mode


def get_defaults() -> dict:
    """Return current global defaults."""
    return {
        "width": _default_width,
        "aspect_ratio": _default_aspect_ratio,
        "dark_mode": _default_dark_mode,
    }


def set_dark_mode(enabled: bool | None) -> None:
    """Set the global dark mode for all visualizations.

    Args:
        enabled: True for dark mode, False for light mode, None to auto-detect.
    """
    set_defaults(dark_mode=enabled)


def get_dark_mode() -> bool | None:
    """Return the current global dark mode setting."""
    return _default_dark_mode


# ── Internal helpers ─────────────────────────────────────────────────

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


def _resolve_options(options: dict | None, dark_mode: bool | None) -> dict:
    """Copy options and inject darkMode from per-call or global setting."""
    result = dict(options or {})
    dm = dark_mode if dark_mode is not None else _default_dark_mode
    if dm is not None and "darkMode" not in result:
        result["darkMode"] = dm
    return result


def _resolve_sizing(
    width: str | None, aspect_ratio: str | None, widget_key: str
) -> tuple[str, str | None]:
    """Resolve width and aspect-ratio against global defaults."""
    w = width or _default_width
    ar = aspect_ratio or _default_aspect_ratio or _WIDGET_ASPECT_RATIOS[widget_key]
    return w, ar


def _widget_html(
    widget_name: str,
    prefix: str,
    data_json: str,
    options_json: str,
    width: str,
    aspect_ratio: str | None,
    extra_js: str = "",
) -> str:
    """Generate the HTML/JS snippet that creates a standalone widget."""
    js = _get_standalone_js()
    cid = f"{prefix}_{uuid.uuid4().hex[:12]}"
    ar_style = f"aspect-ratio:{aspect_ratio};" if aspect_ratio else ""
    inner_height = "height:100%;" if aspect_ratio else ""
    return f"""
    <div style="width:{width};{ar_style}"><div id="{cid}" style="width:100%;{inner_height}"></div></div>
    <script>
    (function() {{
        {js}
        var container = document.getElementById('{cid}');
        var data = {data_json};
        if (typeof {widget_name} !== "undefined") {{
            {widget_name}(container, data, {options_json});{extra_js}
        }} else {{
            container.innerHTML = "<pre>{widget_name} not loaded</pre>";
        }}
    }})();
    </script>
    """


def _display_or_return(html_str: str, return_html: bool) -> HTML | None:
    """Display the HTML or return it, depending on return_html."""
    result = HTML(html_str)
    if return_html:
        return result
    ipython_display(result)


# ── Validation ───────────────────────────────────────────────────────

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


def _densify_logit_lens_data(data: dict) -> dict:
    """Expand sparse-position LogitLensData to dense format for the JS widget."""
    positions = data.get("positions")
    if positions is None:
        return data

    n_tokens = len(data["input"])
    n_layers = len(data["layers"])
    pos_set = {p: i for i, p in enumerate(positions)}

    dense_tracked = []
    for tok_idx in range(n_tokens):
        if tok_idx in pos_set:
            dense_tracked.append(data["tracked"][pos_set[tok_idx]])
        else:
            dense_tracked.append({})

    dense_topk = []
    for li in range(n_layers):
        layer_topk = []
        for tok_idx in range(n_tokens):
            if tok_idx in pos_set:
                layer_topk.append(data["topk"][li][pos_set[tok_idx]])
            else:
                layer_topk.append([])
        dense_topk.append(layer_topk)

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
        "positions": None,
        "tracked": dense_tracked,
        "topk": dense_topk,
        "entropy": dense_entropy,
    }


# ── Display functions ────────────────────────────────────────────────

def display_logit_lens(
    data: dict | BaseModel,
    ui_state: dict | None = None,
    width: str | None = None,
    aspect_ratio: str | None = None,
    dark_mode: bool | None = None,
    return_html: bool = False,
) -> HTML | None:
    """
    Display a LogitLens visualization in a Jupyter notebook.

    Args:
        data: LogitLensData dict (V2 format with meta, layers, input, tracked, topk).
        ui_state: Optional LogitLensUIState dict for initial widget configuration.
        width: CSS width of the container. Defaults to global setting.
        aspect_ratio: CSS aspect-ratio for the outer wrapper. Defaults to None
            (content-driven height). The chart uses its own aspect ratio
            set via ui_state["chartAspectRatio"] (default "21 / 9").
        dark_mode: Force dark (True) or light (False) mode. When None,
            uses the global setting, or auto-detects from the notebook theme.
        return_html: If True, return the HTML object instead of displaying it.
    """
    data = _to_dict(data)
    _validate_logit_lens_data(data)
    data = _densify_logit_lens_data(data)
    data_json = json.dumps(data)

    ui_state_dict = _resolve_options(ui_state, dark_mode)
    ui_state_json = json.dumps(ui_state_dict)
    w, ar = _resolve_sizing(width, aspect_ratio, "logit_lens")

    # Gray out rows where all .pred-cell elements are empty (uncomputed positions).
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

    html = _widget_html("LogitLensWidget", "ll", data_json, ui_state_json, w, ar,
                         extra_js=disable_js)
    return _display_or_return(html, return_html)


def display_activation_patching(
    data: dict | BaseModel,
    options: dict | None = None,
    width: str | None = None,
    aspect_ratio: str | None = None,
    dark_mode: bool | None = None,
    return_html: bool = False,
) -> HTML | None:
    """
    Display an Activation Patching visualization in a Jupyter notebook.

    Args:
        data: ActivationPatchingData dict with 'lines', 'ranks', 'prob_diffs', 'tokenLabels'.
        options: Optional ActivationPatchingOptions dict (mode, darkMode, title, etc.).
        width: CSS width of the container. Defaults to global setting.
        aspect_ratio: CSS aspect-ratio (e.g. "16 / 9"). Defaults to "16 / 9".
        dark_mode: Force dark (True) or light (False) mode. When None,
            uses the global setting, or auto-detects from the notebook theme.
        return_html: If True, return the HTML object instead of displaying it.
    """
    data_json = json.dumps(_to_dict(data))
    resolved_options = _resolve_options(options, dark_mode)
    options_json = json.dumps(resolved_options)
    w, ar = _resolve_sizing(width, aspect_ratio, "activation_patching")

    html = _widget_html("ActivationPatchingWidget", "ap", data_json, options_json, w, ar)
    return _display_or_return(html, return_html)


def display_line_plot(
    data: dict | BaseModel,
    options: dict | None = None,
    width: str | None = None,
    aspect_ratio: str | None = None,
    dark_mode: bool | None = None,
    return_html: bool = False,
) -> HTML | None:
    """
    Display a LinePlot visualization in a Jupyter notebook.

    Args:
        data: LinePlotData dict with 'lines' and optional 'labels'.
        options: Optional LinePlotOptions dict (mode, title, darkMode, etc.).
        width: CSS width of the container. Defaults to global setting.
        aspect_ratio: CSS aspect-ratio (e.g. "21 / 9"). Defaults to "21 / 9".
        dark_mode: Force dark (True) or light (False) mode. When None,
            uses the global setting, or auto-detects from the notebook theme.
        return_html: If True, return the HTML object instead of displaying it.
    """
    data = _to_dict(data)
    _validate_line_plot_data(data)
    data_json = json.dumps(data)
    resolved_options = _resolve_options(options, dark_mode)
    options_json = json.dumps(resolved_options)
    w, ar = _resolve_sizing(width, aspect_ratio, "line_plot")

    html = _widget_html("LinePlotWidget", "lp", data_json, options_json, w, ar)
    return _display_or_return(html, return_html)
