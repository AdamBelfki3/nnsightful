/**
 * Generate scoped CSS for a LogitLens widget instance.
 * All rules are scoped to #${uid} to avoid conflicts.
 */
export function generateStyles(uid: string): string {
    return `
        #${uid} {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0; padding: 0; position: relative;
            -webkit-user-select: none; user-select: none;
            box-sizing: border-box;
            /* Block-level flex column: full available width. The outer cap
               (derived from --ll-aspect-ratio) is applied as max-height via
               JS in applyOuterCap() — using CSS aspect-ratio would force a
               definite height and reserve empty space below short content.
               max-height treats the ratio as an upper bound, so the widget
               shrinks to its content when small and caps + scrolls (via
               .table-scroll) when content exceeds the cap. */
            display: flex; flex-direction: column; align-items: flex-start;
            max-width: 100%; min-width: 0;
            overflow: hidden;
        }
        #${uid} .ll-title { font-size: var(--ll-title-size, 20px); font-weight: 600; margin-bottom: 8px; padding: 2px 0; flex-shrink: 0; }
        #${uid} .color-mode-btn {
            display: inline-block; padding: 0; background: white;
            border-radius: 4px; font-size: var(--ll-title-size, 20px); cursor: pointer; color: #333; border: none;
        }
        #${uid} .color-mode-btn:hover { background: #f5f5f5; }
        #${uid} .ll-table {
            border-collapse: collapse;
            font-size: var(--ll-content-size, 14px);
            table-layout: fixed;
            /* min-height: 100% lets the table stretch to fill .table-scroll
               when content is short (rows distribute the extra space). For
               long content, the table's natural height (sum of row heights)
               exceeds 100% and .table-scroll's overflow: auto kicks in. */
            min-height: 100%;
        }
        #${uid} .ll-table td, #${uid} .ll-table th { border: 1px solid #ddd; box-sizing: border-box; }
        #${uid} .pred-cell {
            /* min-height (not height) lets the row stretch when the table
               is filling extra space vertically; falls back to 22px as the
               natural row height when content drives the layout. */
            min-height: 22px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            padding: 2px 4px; font-family: monospace; font-size: calc(var(--ll-content-size, 14px) * 0.9);
            cursor: pointer; position: relative;
        }
        #${uid} .pred-cell:hover { outline: 2px solid #e91e63; outline-offset: -1px; }
        #${uid} .pred-cell.selected { background: #fff59d !important; color: #333 !important; }
        #${uid} .input-token {
            padding: 2px 8px; text-align: right; font-weight: 500; color: #333;
            background: #f5f5f5; white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; font-family: monospace; font-size: var(--ll-content-size, 14px);
            cursor: pointer; position: relative;
        }
        #${uid} .input-token:hover { background: #e8e8e8; }
        #${uid} tr:has(.input-token:hover) { outline: 2px solid rgba(255, 193, 7, 0.8); outline-offset: -1px; }
        #${uid} tr:has(.input-token:hover) .input-token { background: #fff59d !important; }
        #${uid} .layer-hdr {
            padding: 4px 2px; text-align: center; font-weight: 500; color: #666;
            background: #f5f5f5; font-size: calc(var(--ll-content-size, 14px) * 0.9); position: relative;
        }
        #${uid} .corner-hdr { padding: 4px 8px; text-align: right; font-weight: 500; color: #666; background: white; position: relative; }
        #${uid} .chart-container {
            margin-top: 8px; background: transparent; border-radius: 4px; padding: 8px 0;
            flex: 0 0 auto; min-height: 120px;
            /* Width matches the heatmap viewport (same CSS var), so the line
               plot's horizontal extent always aligns with the heatmap.
               Height is set imperatively by applyChartSizing via aspect-ratio
               (default chartAspectRatio = "32 / 9"), giving constant
               proportions regardless of widget size. */
            width: var(--ll-heatmap-width, 100%);
            max-width: 100%;
            box-sizing: border-box;
        }
        #${uid} .chart-container svg { display: block; margin: 0; padding: 0; }
        /* Popup is portaled to document.body (so position: fixed works even
           when an ancestor of the widget is CSS-transformed). Selectors use
           the popup's ID, not #${uid} descendant, so they keep matching
           after the popup is moved out of the widget subtree. */
        #${uid}_popup {
            display: none; position: fixed; background: white; border: 1px solid #ddd;
            border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 12px;
            z-index: 100; min-width: 180px; max-width: 280px;
        }
        #${uid}_popup.visible { display: block; }
        #${uid}_popup .popup-header { font-weight: 600; font-size: min(var(--ll-title-size, 20px), calc((var(--ll-content-size, 14px) + var(--ll-title-size, 20px)) / 2)); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
        #${uid}_popup .popup-header code { font-weight: 400; font-size: min(var(--ll-title-size, 20px), calc((var(--ll-content-size, 14px) + var(--ll-title-size, 20px)) / 2)); background: #f5f5f5; padding: 2px 6px; border-radius: 3px; margin-left: 4px; }
        #${uid}_popup .popup-close { position: absolute; top: 8px; right: 10px; cursor: pointer; color: #999; font-size: var(--ll-title-size, 20px); }
        #${uid}_popup .popup-close:hover { color: #333; }
        #${uid}_popup .topk-item {
            padding: 4px 6px; margin: 2px 0; border-radius: 3px; cursor: pointer;
            display: flex; justify-content: space-between;
            font-size: min(var(--ll-title-size, 20px), calc((var(--ll-content-size, 14px) + var(--ll-title-size, 20px)) / 2));
        }
        #${uid}_popup .topk-item:hover { background: #f0f0f0; }
        #${uid}_popup .topk-item.active { background: #f0f0f0; }
        #${uid}_popup .topk-token { font-family: monospace; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        #${uid}_popup .topk-prob { color: #666; margin-left: 8px; }
        #${uid}_popup .topk-item.pinned { border-left: 3px solid currentColor; }
        #${uid} .resize-handle {
            position: absolute; width: 6px; height: 100%; background: transparent;
            cursor: col-resize; right: -3px; top: 0; z-index: 10;
        }
        #${uid} .resize-handle:hover, #${uid} .resize-handle.dragging { background: rgba(33, 150, 243, 0.4); }
        #${uid} .resize-handle-input {
            position: absolute; width: 6px; height: 100%; background: transparent;
            cursor: col-resize; right: -3px; top: 0; z-index: 10;
        }
        #${uid} .resize-handle-input:hover, #${uid} .resize-handle-input.dragging { background: rgba(76, 175, 80, 0.4); }
        #${uid} .table-wrapper {
            /* Itself a flex column inside the widget. The wrapper takes
               configured width and absorbs the vertical space the outer
               cap leaves; .table-scroll inside fills the wrapper via flex
               (not percentage-height — that fails to resolve through
               flex-shrunk parents and would let the table paint outside
               the wrapper into the chart's area). */
            position: relative;
            display: flex; flex-direction: column;
            width: var(--ll-heatmap-width, 100%);
            max-width: 100%; min-width: 0;
            box-sizing: border-box;
            flex: 1 1 auto;
            min-height: 0;
        }
        #${uid} .table-scroll {
            /* Flex-grown to fill .table-wrapper, with min-height: 0 so it
               actually shrinks under the outer cap. overflow: auto then
               kicks in in either direction. Resize handles are siblings
               with position: absolute so they're excluded from this flex
               flow. */
            flex: 1 1 auto;
            min-height: 0;
            width: 100%;
            overflow: auto;
            max-width: 100%;
            box-sizing: border-box;
        }
        #${uid} .resize-handle-bottom {
            /* Sits at the wrapper's bottom edge (not -3px past it) so the
               widget root's overflow: hidden never clips it. */
            position: absolute; bottom: 0; left: 0; right: 0; height: 6px;
            cursor: row-resize; background: transparent;
        }
        #${uid} .resize-handle-bottom:hover, #${uid} .resize-handle-bottom.dragging { background: rgba(33, 150, 243, 0.4); }
        #${uid} .resize-handle-right {
            /* Sits at the wrapper's right edge (not -3px past it) so the
               widget root's overflow: hidden never clips it — especially
               in workbench mode where heatmap-width is 100% of the widget. */
            position: absolute; top: 0; bottom: 0; right: 0; width: 6px;
            cursor: ew-resize; background: transparent;
        }
        #${uid} .resize-handle-right:hover, #${uid} .resize-handle-right.dragging { background: rgba(33, 150, 243, 0.4); }
        #${uid} .resize-hint { font-size: calc(var(--ll-content-size, 14px) * 0.9); color: #999; margin-top: 4px; cursor: default; flex-shrink: 0; }
        #${uid} .resize-hint-extra { display: none; }
        #${uid}.show-all-handles .resize-handle,
        #${uid}.show-all-handles .resize-handle-input,
        #${uid}.show-all-handles .resize-handle-right { background: rgba(33, 150, 243, 0.3); }
        /* Color menu also portaled to body — same rationale as #${uid}_popup. */
        #${uid}_color_menu {
            display: none; position: fixed; background: white; border: 1px solid #ddd;
            border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 200; min-width: 150px;
        }
        #${uid}_color_menu.visible { display: block; }
        #${uid}_color_menu .color-menu-item { padding: 0; cursor: pointer; font-size: min(var(--ll-title-size, 20px), calc((var(--ll-content-size, 14px) + var(--ll-title-size, 20px)) / 2)); display: flex; align-items: stretch; }
        #${uid}_color_menu .color-menu-item:hover, #${uid}_color_menu .color-menu-item.picking { background: #f0f0f0; }
        #${uid}_color_menu .color-menu-item .color-menu-label { padding: 8px 12px 8px 0; flex: 1; }
        #${uid}_color_menu .color-menu-item .color-swatch { width: 32px; height: auto; min-height: 24px; border: 0; border-left: 1px solid #ccc; background: transparent; cursor: pointer; opacity: 0; transition: opacity 0.15s; padding: 0; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        #${uid}_color_menu .color-menu-item:hover .color-swatch, #${uid}_color_menu .color-menu-item.picking .color-swatch { opacity: 1; }
        #${uid}_color_menu .color-menu-item .color-swatch:hover { border-left-color: #666; }
        #${uid} .legend-close { cursor: pointer; }
        #${uid} .legend-close:hover { fill: #e91e63 !important; }
        @keyframes menuBlink-${uid} {
            0% { background: #f0f0f0; }
            50% { background: #d0d0d0; }
            100% { background: #f0f0f0; }
        }
        /* Dark mode */
        #${uid}.dark-mode { background: #1e1e1e; color: #e0e0e0; }
        #${uid}.dark-mode .ll-title { color: #e0e0e0; }
        #${uid}.dark-mode .color-mode-btn { background: #2d2d2d; color: #e0e0e0; }
        #${uid}.dark-mode .color-mode-btn:hover { background: #3d3d3d; }
        #${uid}.dark-mode .ll-table td, #${uid}.dark-mode .ll-table th { border-color: #444; }
        #${uid}.dark-mode .pred-cell { color: #e0e0e0; }
        #${uid}.dark-mode .pred-cell.selected { background: #4a4a00 !important; color: #fff !important; }
        #${uid}.dark-mode .input-token { background: #2d2d2d; color: #e0e0e0; }
        #${uid}.dark-mode .input-token:hover { background: #3d3d3d; }
        #${uid}.dark-mode tr:has(.input-token:hover) .input-token { background: #4a4a00 !important; color: #fff !important; }
        #${uid}.dark-mode .layer-hdr { background: #2d2d2d; color: #aaa; }
        #${uid}.dark-mode .corner-hdr { background: #1e1e1e; color: #aaa; }
        #${uid}.dark-mode .chart-container { background: transparent; }
        /* Dark mode for the portaled popup + menu. The .dark-mode class is
           applied to the popup/menu elements directly (mirrored from the
           widget root by applyDarkMode), so the styles match regardless of
           where the elements live in the DOM. */
        #${uid}_popup.dark-mode { background: #2d2d2d; border-color: #444; color: #e0e0e0; }
        #${uid}_popup.dark-mode .popup-header { border-bottom-color: #444; }
        #${uid}_popup.dark-mode .popup-header code { background: #3d3d3d; color: #e0e0e0; }
        #${uid}_popup.dark-mode .popup-close { color: #888; }
        #${uid}_popup.dark-mode .popup-close:hover { color: #e0e0e0; }
        #${uid}_popup.dark-mode .topk-item:hover { background: #3d3d3d; }
        #${uid}_popup.dark-mode .topk-item.active { background: #3d3d3d; }
        #${uid}_popup.dark-mode .topk-prob { color: #aaa; }
        #${uid}_color_menu.dark-mode { background: #2d2d2d; border-color: #444; }
        #${uid}_color_menu.dark-mode .color-menu-item:hover, #${uid}_color_menu.dark-mode .color-menu-item.picking { background: #3d3d3d; }
        #${uid}_color_menu.dark-mode .color-menu-item .color-swatch { border-left-color: #555; }
        #${uid}.dark-mode .resize-hint { color: #888; }
        @keyframes menuBlink-${uid}-dark {
            0% { background: #3d3d3d; }
            50% { background: #4d4d4d; }
            100% { background: #3d3d3d; }
        }
    `;
}

export function injectStyles(uid: string): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = generateStyles(uid);
    document.head.appendChild(style);
    return style;
}

export function applyDarkMode(
    widgetEl: HTMLElement,
    enabled: boolean,
    ...extras: (HTMLElement | null | undefined)[]
): void {
    if (enabled) {
        widgetEl.classList.add("dark-mode");
        widgetEl.style.colorScheme = "dark";
    } else {
        widgetEl.classList.remove("dark-mode");
        widgetEl.style.colorScheme = "";
    }
    // Mirror the dark-mode class to portaled elements (popup, color menu)
    // so their styles match even after they're moved out of the widget
    // subtree. colorScheme is widget-only; the popups inherit text color
    // via their explicit dark-mode rules.
    for (const el of extras) {
        if (!el) continue;
        if (enabled) el.classList.add("dark-mode");
        else el.classList.remove("dark-mode");
    }
}
