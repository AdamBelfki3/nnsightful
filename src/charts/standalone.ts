/**
 * interp-tools standalone entry point
 *
 * IIFE build that exposes widget factories on window
 * for use in Jupyter notebooks and plain HTML pages.
 */

import type { LogitLensData, LogitLensUIState } from "./types/logit-lens";
import type { LinePlotData, LinePlotOptions } from "./types/line-plot";
import type { HeatmapTableData, HeatmapTableOptions } from "./types/heatmap-table";
import type { ActivationPatchingData } from "./types/activation-patching";
import { LogitLensCore } from "./visualizations/logit-lens";
import { LinePlotCore } from "./core/line-plot";
import { HeatmapTableCore } from "./core/heatmap-table";
import type { ActivationPatchingOptions } from "./types/activation-patching";
import { ActivationPatchingCore } from "./visualizations/activation-patching";

/**
 * Auto-detect dark mode from the notebook/browser environment.
 * Checks (in order): JupyterLab theme attribute, Colab body class,
 * computed background luminance of the container, system preference.
 */
function detectDarkMode(container?: HTMLElement | null): boolean {
    // JupyterLab: data-jp-theme-light on <body>
    if (typeof document !== "undefined" && document.body?.dataset?.jpThemeLight !== undefined) {
        return document.body.dataset.jpThemeLight === "false";
    }
    // Google Colab: .dark class on <body>
    if (typeof document !== "undefined" && document.body?.classList?.contains("dark")) {
        return true;
    }
    // Computed background luminance of the output cell
    if (container) {
        const bg = getComputedStyle(container).backgroundColor;
        const match = bg.match(/\d+/g);
        if (match && match.length >= 3) {
            const [r, g, b] = match.map(Number);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance < 0.5;
        }
    }
    // System preference
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
}

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
    const resolvedOptions: Partial<LinePlotOptions> = {
        darkMode: detectDarkMode(el),
        ...options,
    };
    return new LinePlotCore(el, data, resolvedOptions);
}

function createHeatmapTableWidget(
    container: HTMLElement | string,
    data: HeatmapTableData,
    options?: Partial<HeatmapTableOptions>,
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
    return new HeatmapTableCore(el, data, options);
}

function createActivationPatchingWidget(
    container: HTMLElement | string,
    data: ActivationPatchingData,
    options?: ActivationPatchingOptions,
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
    // Auto-detect dark mode if not explicitly set
    const resolvedOptions: ActivationPatchingOptions = {
        darkMode: detectDarkMode(el),
        ...options,
    };
    return new ActivationPatchingCore(el, data, resolvedOptions);
}

// Expose on window for backward compatibility
if (typeof window !== "undefined") {
    (window as any).LogitLensWidget = createLogitLensWidget;
    (window as any).LinePlotWidget = createLinePlotWidget;
    (window as any).HeatmapTableWidget = createHeatmapTableWidget;
    (window as any).ActivationPatchingWidget = createActivationPatchingWidget;
}

// Also export for IIFE globalName access
export {
    createLogitLensWidget as LogitLensWidget,
    createLinePlotWidget as LinePlotWidget,
    createHeatmapTableWidget as HeatmapTableWidget,
    createActivationPatchingWidget as ActivationPatchingWidget,
};
