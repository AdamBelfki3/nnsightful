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
_STANDALONE_JS_MTIME: float | None = None


# ── Global defaults ──────────────────────────────────────────────────

_default_width: str = "90%"
_default_aspect_ratio: str | None = None  # None = use per-widget default
_default_dark_mode: bool | None = None

_WIDGET_ASPECT_RATIOS = {
    # logit_lens applies its aspect-ratio to the widget root (via the
    # --ll-aspect-ratio CSS variable). That caps the widget's height
    # proportional to its width; the heatmap viewport scrolls when content
    # exceeds the cap. Not the outer-wrapper aspect-ratio used by the other
    # widgets — see _widget_html for the dispatch.
    "logit_lens": "5 / 3",
    "activation_patching": "21 / 9",
    "line_plot": "21 / 9",
    # heatmap_table is content-sized (its own cell/row dimensions); no outer
    # aspect-ratio.
    "heatmap_table": None,
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
    """Load and cache the standalone JS bundle. Reloads when charts.js changes
    on disk so local rebuilds are picked up without a kernel restart."""
    global _STANDALONE_JS, _STANDALONE_JS_MTIME
    js_path = Path(__file__).resolve().parent / "charts.js"
    if not js_path.exists():
        raise FileNotFoundError(
            f"charts.js not found at {js_path}. "
            "Run 'npm run build' in the nnsightful/ directory first."
        )
    mtime = js_path.stat().st_mtime
    if _STANDALONE_JS is None or _STANDALONE_JS_MTIME != mtime:
        _STANDALONE_JS = js_path.read_text(encoding="utf-8")
        _STANDALONE_JS_MTIME = mtime
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
    # A per-widget default of None means "content-sized": opt out of
    # aspect-ratio boxing entirely, even when the user has set a global
    # default. Only an explicit per-call aspect_ratio can override that.
    widget_ar = _WIDGET_ASPECT_RATIOS.get(widget_key)
    if widget_ar is None:
        ar = aspect_ratio
    else:
        ar = aspect_ratio or _default_aspect_ratio or widget_ar
    return w, ar


# CSS keywords that mean "no aspect-ratio". Forwarded to the widget as a
# distinct sentinel ("unbounded") so the JS layer can distinguish a Python
# opt-out from the workbench's fill-mode signal (variable unset).
_ASPECT_RATIO_OPT_OUT_KEYWORDS = {"none", "auto", "initial", "inherit", "unset"}


def _widget_html(
    widget_name: str,
    prefix: str,
    data_json: str,
    options_json: str,
    width: str,
    aspect_ratio: str | None,
    extra_js: str = "",
    use_css_vars: bool = False,
) -> str:
    """Generate the HTML/JS snippet that creates a standalone widget.

    Args:
        use_css_vars: If True, forward `width` and `aspect_ratio` as CSS
            custom properties on the inner container (used by logit_lens).
            The outer box stays at the notebook's natural width. If False,
            apply `width` and `aspect_ratio` directly to the outer box
            (used by line_plot / activation_patching).
    """
    js = _get_standalone_js()
    cid = f"{prefix}_{uuid.uuid4().hex[:12]}"
    if use_css_vars:
        outer_style = "max-width:100%;box-sizing:border-box;"
        # NOTE: --ll-heatmap-width is forwarded for backward/forward compat
        # but the redesigned logit-lens widget does not currently read it
        # (the card fills its container width and the heatmap fits columns
        # to that width). --ll-aspect-ratio drives the height cap.
        css_vars = [f"--ll-heatmap-width:{width}"]
        if isinstance(aspect_ratio, str) and aspect_ratio.strip():
            keyword = aspect_ratio.strip().lower()
            if keyword in _ASPECT_RATIO_OPT_OUT_KEYWORDS:
                # Explicit opt-out from the Python caller. JS reads
                # "unbounded" as "no cap, content-driven flow".
                css_vars.append("--ll-aspect-ratio:unbounded")
            else:
                # Pass the (presumed valid) ratio through verbatim.
                css_vars.append(f"--ll-aspect-ratio:{aspect_ratio}")
        # Note: if aspect_ratio is None/empty, the CSS variable is NOT
        # forwarded — that's the workbench fill-mode signal, but the
        # Python entry point ensures a default ratio is resolved before
        # we get here, so this branch is unreachable in practice from
        # display_logit_lens.
        inner_style = (
            ";".join(css_vars) + ";max-width:100%;box-sizing:border-box;"
        )
    elif aspect_ratio:
        # line_plot / activation_patching: fixed outer box with an aspect-
        # ratio so the widget fills it. This is the original behavior.
        outer_style = f"width:{width};aspect-ratio:{aspect_ratio};"
        inner_style = "width:100%;height:100%;"
    else:
        # Fallback for any widget without an aspect-ratio (e.g. the generic
        # heatmap table). The widget (an inline-flex card with max-width:100%)
        # shrink-wraps to its content and scrolls a wide grid internally, so
        # the outer just provides a definite width cap for that 100% to
        # resolve against.
        outer_style = f"max-width:{width};"
        inner_style = ""
    return f"""
    <div style="{outer_style}"><div id="{cid}" style="{inner_style}"></div></div>
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
    full_height: bool = False,
    return_html: bool = False,
) -> HTML | None:
    """
    Display a LogitLens visualization in a Jupyter notebook.

    Args:
        data: LogitLensData dict (V2 format with meta, layers, input, tracked, topk).
        ui_state: Optional LogitLensUIState dict for initial widget configuration.
        width: CSS width applied to the heatmap viewport (the scrollable
            area that holds the table), e.g. "90%" or "600px". The line
            plot below matches this width too. Defaults to global setting.
        aspect_ratio: CSS aspect-ratio applied to the widget root
            (width:height, e.g. "5 / 3"). The widget's height is derived
            from its width via this ratio; when content exceeds the cap,
            the heatmap viewport scrolls. The line plot keeps its own
            constant aspect-ratio via ui_state["chartAspectRatio"].

            Pass "none" / "auto" to opt out of the cap entirely: the
            widget then grows with its content. Passing None (the default)
            uses the package default ("5 / 3"), not opt-out.
        dark_mode: Force dark (True) or light (False) mode. When None,
            uses the global setting, or auto-detects from the notebook theme.
        full_height: If True, disable the vertical height cap so the heatmap
            grows to show every token row without an internal scrollbar
            (handy in notebooks). Equivalent to aspect_ratio="none", and
            takes precedence over any aspect_ratio passed.
        return_html: If True, return the HTML object instead of displaying it.
    """
    data = _to_dict(data)
    _validate_logit_lens_data(data)
    data = _densify_logit_lens_data(data)
    data_json = json.dumps(data)

    # full_height wins over aspect_ratio: opt out of the height cap so the
    # widget is content-driven (grows to fit all rows, no inner scroll).
    if full_height:
        aspect_ratio = "none"

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
                         extra_js=disable_js, use_css_vars=True)
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


def _to_2d_list(values, cast=None) -> list[list]:
    """Coerce a 2D array-like (numpy array, list of lists, etc.) to a plain
    list of lists, optionally casting each element."""
    # numpy / anything with .tolist()
    tolist = getattr(values, "tolist", None)
    rows = tolist() if callable(tolist) else values
    out = []
    for row in rows:
        row = list(row)
        out.append([cast(v) for v in row] if cast else row)
    return out


def display_heatmap_table(
    values,
    row_labels: list[str] | None = None,
    col_labels: list[str] | None = None,
    *,
    texts=None,
    ramp: str = "purple",
    value_domain: tuple[float, float] | None = None,
    cell_width: int | None = None,
    row_header_width: int | None = None,
    corner_label: str | None = None,
    width: str | None = None,
    dark_mode: bool | None = None,
    return_html: bool = False,
) -> HTML | None:
    """
    Display a generic heatmap table in a Jupyter notebook.

    Args:
        values: 2D array-like (numpy array or list of lists) of numbers that
            drive each cell's color. Normalized to [0, 1] over `value_domain`.
        row_labels: Labels for each row (left header). Defaults to row indices.
        col_labels: Labels for each column (bottom header). Defaults to indices.
        texts: Optional 2D array-like of strings shown inside the cells.
            Defaults to the formatted numeric value.
        ramp: Color ramp — "purple", "blue", "teal", or a "#rrggbb" hex.
            Cells blend from the surface toward this color by value.
        value_domain: (min, max) used to normalize `values`. Defaults to
            (0, 1).
        cell_width: Pixel width of each data column (default 48).
        row_header_width: Pixel width of the row-label column (default 100).
        corner_label: Text in the corner cell where the column header meets
            the row labels (blank if omitted).
        width: CSS width of the container. Defaults to global setting.
        dark_mode: Force dark (True) or light (False) mode. When None,
            uses the global setting, or auto-detects from the notebook theme.
        return_html: If True, return the HTML object instead of displaying it.
    """
    values = _to_2d_list(values)
    n_rows = len(values)
    n_cols = len(values[0]) if n_rows else 0

    data: dict = {
        "values": values,
        "rowLabels": list(row_labels) if row_labels is not None
        else [str(i) for i in range(n_rows)],
        "colLabels": list(col_labels) if col_labels is not None
        else [str(j) for j in range(n_cols)],
        "ramp": ramp,
    }
    if texts is not None:
        data["texts"] = _to_2d_list(texts, str)
    if value_domain is not None:
        data["valueDomain"] = list(value_domain)
    data_json = json.dumps(data)

    options: dict = {}
    if cell_width is not None:
        options["cellWidth"] = cell_width
    if row_header_width is not None:
        options["rowHeaderWidth"] = row_header_width
    if corner_label is not None:
        options["cornerLabel"] = corner_label
    options = _resolve_options(options, dark_mode)
    options_json = json.dumps(options)

    w, ar = _resolve_sizing(width, None, "heatmap_table")
    html = _widget_html("HeatmapTableWidget", "hm", data_json, options_json, w, ar)
    return _display_or_return(html, return_html)
