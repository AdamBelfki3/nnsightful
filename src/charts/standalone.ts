/**
 * interp-tools standalone entry point
 *
 * IIFE build that exposes window.LogitLensWidget and window.LinePlotWidget
 * for use in Jupyter notebooks and plain HTML pages.
 */

import type { LogitLensData, LogitLensUIState } from "./types/logit-lens";
import type { LinePlotData, LinePlotOptions } from "./types/line-plot";
import { LogitLensCore } from "./core/logit-lens";
import { LinePlotCore } from "./core/line-plot";

// Backward-compatible factory functions
function createLogitLensWidget(
    container: HTMLElement | string,
    data: LogitLensData,
    uiState?: Partial<LogitLensUIState>,
) {
    return new LogitLensCore(container, data, uiState);
}

function createLinePlotWidget(
    container: HTMLElement | string,
    data: LinePlotData,
    options?: Partial<LinePlotOptions>,
) {
    let el: HTMLElement | null;
    if (typeof container === "string") {
        el = document.querySelector(container);
    } else {
        el = container;
    }
    if (!el) {
        console.error("Container not found:", container);
        return null;
    }
    return new LinePlotCore(el, data, options);
}

// Expose on window for backward compatibility
if (typeof window !== "undefined") {
    (window as any).LogitLensWidget = createLogitLensWidget;
    (window as any).LinePlotWidget = createLinePlotWidget;
}

// Also export for IIFE globalName access
export { createLogitLensWidget as LogitLensWidget, createLinePlotWidget as LinePlotWidget };
