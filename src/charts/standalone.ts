/**
 * interp-tools standalone entry point
 *
 * IIFE build that exposes widget factories on window
 * for use in Jupyter notebooks and plain HTML pages.
 */

import type { LogitLensData, LogitLensUIState } from "./types/logit-lens";
import type { LinePlotData, LinePlotOptions } from "./types/line-plot";
import type { HeatmapTableData, HeatmapTableOptions } from "./types/heatmap-table";
import type { ActivationPatchingData, ActivationPatchingOptions } from "./types/activation-patching";
import type { BaseWidgetInterface } from "./types/base";
import { LogitLensCore } from "./visualizations/logit-lens";
import { LinePlotCore } from "./core/line-plot";
import { HeatmapTableCore } from "./core/heatmap-table";
import { ActivationPatchingCore } from "./visualizations/activation-patching";
import { detectThemeMode, onThemeModeChange } from "./detect-theme-mode";

// ── Shared helpers ──────────────────────────────────────────────────

function resolveContainer(container: HTMLElement | string): HTMLElement | null {
    const el = typeof container === "string"
        ? document.querySelector<HTMLElement>(container)
        : container;
    if (!el) console.error("Container not found:", container);
    return el;
}

/**
 * Resolve container, create widget, detect theme, wire runtime reactivity.
 * Wraps destroy() to clean up the theme-change listener automatically.
 */
function createThemedWidget<W extends BaseWidgetInterface>(
    container: HTMLElement | string,
    create: (el: HTMLElement) => W,
    explicitDarkMode?: boolean,
): W | null {
    const el = resolveContainer(container);
    if (!el) return null;
    const widget = create(el);
    if (explicitDarkMode === undefined) {
        const cleanup = onThemeModeChange(el, (isDark) => widget.setThemeMode(isDark));
        const originalDestroy = widget.destroy.bind(widget);
        widget.destroy = () => { cleanup(); originalDestroy(); };
    }
    return widget;
}

// ── Factory functions ───────────────────────────────────────────────

function createLogitLensWidget(
    container: HTMLElement | string,
    data: LogitLensData,
    uiState?: Partial<LogitLensUIState>,
) {
    // LogitLensCore handles its own container resolution and theme reactivity
    return new LogitLensCore(container, data, uiState);
}

function createLinePlotWidget(
    container: HTMLElement | string,
    data: LinePlotData,
    options?: Partial<LinePlotOptions>,
) {
    return createThemedWidget(
        container,
        (el) => new LinePlotCore(el, data, { darkMode: detectThemeMode(el), ...options }),
        options?.darkMode,
    );
}

function createHeatmapTableWidget(
    container: HTMLElement | string,
    data: HeatmapTableData,
    options?: Partial<HeatmapTableOptions>,
) {
    return createThemedWidget(
        container,
        (el) => new HeatmapTableCore(el, data, { darkMode: detectThemeMode(el), ...options }),
        options?.darkMode,
    );
}

function createActivationPatchingWidget(
    container: HTMLElement | string,
    data: ActivationPatchingData,
    options?: ActivationPatchingOptions,
) {
    return createThemedWidget(
        container,
        (el) => new ActivationPatchingCore(el, data, { darkMode: detectThemeMode(el), ...options }),
        options?.darkMode,
    );
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
