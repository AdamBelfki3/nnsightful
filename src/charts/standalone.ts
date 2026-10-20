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

// Serializable heatmap input (what the Python display_heatmap_table wrapper
// sends): plain arrays instead of a getCellValue callback. The factory below
// synthesizes getCellValue from it so the same widget works from JSON.
interface SerializableHeatmapData {
    values: number[][];
    rowLabels?: string[];
    colLabels?: string[];
    texts?: string[][];
    ramp?: "purple" | "blue" | "teal" | string; // name or #hex
    valueDomain?: [number, number];
}

const HEATMAP_RAMPS: Record<string, string> = {
    purple: "#9333ea",
    blue: "#2563eb",
    teal: "#0d9488",
};

function heatmapHexToRgb(hex: string): [number, number, number] {
    // Only full #rrggbb is supported; shorthand / empty / junk would parse to
    // NaN and yield an invalid `rgb(NaN, …)`, rendering cells blank. Fall back
    // to the purple ramp (#9333ea) so cells stay colored.
    if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return [147, 51, 234];
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Turn the serializable form into a full HeatmapTableData (with a getCellValue
// callback). Cells blend from the surface (white in light mode, a dark grey in
// dark mode) toward the ramp color by normalized value. `dark` is baked in at
// creation time. If `data` already has getCellValue, it's returned untouched.
function materializeHeatmapData(
    data: HeatmapTableData | SerializableHeatmapData,
    dark: boolean,
): HeatmapTableData {
    if (typeof (data as HeatmapTableData).getCellValue === "function") {
        return data as HeatmapTableData;
    }
    const s = data as SerializableHeatmapData;
    const values = s.values ?? [];
    const texts = s.texts;
    const rowLabels = s.rowLabels ?? values.map((_, i) => String(i));
    const colLabels = s.colLabels ?? (values[0] ?? []).map((_, j) => String(j));
    const rampKey = s.ramp ?? "purple";
    const baseHex = HEATMAP_RAMPS[rampKey] ?? (rampKey[0] === "#" ? rampKey : HEATMAP_RAMPS.purple);
    const [br, bg, bb] = heatmapHexToRgb(baseHex);
    const [lo, hi] = s.valueDomain ?? [0, 1];
    const span = hi - lo;
    const fromCh = dark ? 38 : 255; // blend origin: dark surface vs white
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
    return {
        rows: rowLabels.map((label) => ({ label })),
        columns: colLabels.map((label) => ({ label, value: 0 })),
        getCellValue: (r: number, c: number) => {
            const raw = values[r]?.[c] ?? 0;
            const t = clamp01(span > 0 ? (raw - lo) / span : raw);
            const mix = (ch: number) => Math.round(fromCh + (ch - fromCh) * t);
            const text = texts
                ? (texts[r]?.[c] ?? "")
                : (Number.isInteger(raw) ? String(raw) : raw.toFixed(2));
            return {
                text,
                value: raw,
                color: `rgb(${mix(br)}, ${mix(bg)}, ${mix(bb)})`,
                textColor: t >= 0.62 ? "#fff" : (dark ? "#e0e0e0" : "hsl(0 0% 18%)"),
            };
        },
    };
}

function createHeatmapTableWidget(
    container: HTMLElement | string,
    data: HeatmapTableData | SerializableHeatmapData,
    options?: Partial<HeatmapTableOptions>,
) {
    return createThemedWidget(
        container,
        (el) => {
            const dark = options?.darkMode ?? detectThemeMode(el);
            const core = new HeatmapTableCore(el, materializeHeatmapData(data, dark), { darkMode: dark, ...options });
            // materializeHeatmapData bakes the blend origin (white vs dark
            // surface) and text-contrast thresholds per theme. On a theme flip
            // the core just re-renders the SAME synthesized getCellValue, so
            // re-materialize from the original data to rebuild the colors.
            // No-op for the React path, where `data` already carries
            // getCellValue (materializeHeatmapData returns it untouched).
            const baseSetTheme = core.setThemeMode.bind(core);
            core.setThemeMode = (isDark: boolean) => {
                core.setData(materializeHeatmapData(data, isDark));
                baseSetTheme(isDark);
            };
            return core;
        },
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
