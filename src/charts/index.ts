/**
 * interp-tools - Interpretability visualization tools
 *
 * ESM entry point: exports React wrappers, core classes, and types.
 */

// Types
export type {
    BaseWidgetInterface,
    LogitLensData,
    LogitLensOptions,
    LogitLensUIState,
    LogitLensWidgetInterface,
    LinePlotData,
    LinePlotLine,
    LinePlotMode,
    LinePlotOptions,
    LinePlotWidgetInterface,
    HeatmapRow,
    HeatmapColumn,
    HeatmapCellData,
    HeatmapTableData,
    HeatmapTableOptions,
    HeatmapTableWidgetInterface,
    ActivationPatchingData,
    ActivationPatchingMode,
    ActivationPatchingOptions,
    ActivationPatchingWidgetInterface,
} from "./types";

// Core classes (framework-agnostic)
export { LogitLensCore } from "./visualizations/logit-lens";
export { LinePlotCore } from "./core/line-plot";
export { HeatmapTableCore } from "./core/heatmap-table";
export { ActivationPatchingCore } from "./visualizations/activation-patching";

// Snapshots: render a chart from its data + UI state and capture it as a PNG
export { snapshotChart, captureElement } from "./snapshot";
export type { ChartSnapshot, ChartSnapshotSpec, SnapshotOptions, CaptureOptions } from "./snapshot";

// React wrappers
export { LogitLensWidget } from "./react/LogitLensWidget";
export { LinePlotWidget } from "./react/LinePlotWidget";
export { HeatmapTableWidget } from "./react/HeatmapTableWidget";
export { ActivationPatchingWidget } from "./react/ActivationPatchingWidget";
