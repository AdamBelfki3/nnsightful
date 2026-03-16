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
    return new ActivationPatchingCore(el, data, options);
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
