/**
 * interp-tools - Interpretability visualization tools
 *
 * ESM entry point: exports React wrappers, core classes, and types.
 */

// Types
export type {
    LogitLensData,
    LogitLensUIState,
    LogitLensWidgetInterface,
    LinePlotData,
    LinePlotMode,
    LinePlotOptions,
    LinePlotWidgetInterface,
} from "./types";

// Core classes (framework-agnostic)
export { LogitLensCore } from "./core/logit-lens";
export { LinePlotCore } from "./core/line-plot";

// React wrappers
export { LogitLensWidget } from "./react/LogitLensWidget";
export { LinePlotWidget } from "./react/LinePlotWidget";
