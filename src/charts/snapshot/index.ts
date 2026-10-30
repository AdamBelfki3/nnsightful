/**
 * Snapshots: render a chart from its data and serializable UI state — the
 * same state a host persists from the widget's `stateChange` — and capture it
 * as a PNG. Nothing needs to be on screen; the chart is drawn offscreen with
 * its static (non-interactive) rendering, so the image matches what a
 * report embed of the same state shows.
 */

import type { ActivationPatchingData, ActivationPatchingMode } from "../types/activation-patching";
import type { LogitLensData, LogitLensUIState } from "../types/logit-lens";
import { ActivationPatchingCore } from "../visualizations/activation-patching";
import { LogitLensCore } from "../visualizations/logit-lens";
import { captureElement, type CaptureOptions, type ChartSnapshot } from "./capture";

export { captureElement, type CaptureOptions, type ChartSnapshot } from "./capture";
export { clampScale } from "./scale";

/** What to draw: a chart kind, its data, and its UI state. */
export type ChartSnapshotSpec =
    | {
          /** Logit lens and j-lens (both render with the LogitLens widget). */
          kind: "logit-lens";
          data: LogitLensData;
          uiState?: Partial<LogitLensUIState> | null;
      }
    | {
          kind: "activation-patching";
          data: ActivationPatchingData;
          mode?: ActivationPatchingMode;
          /** Indices of the token lines to draw; defaults to the first two. */
          selectedTokens?: number[];
          /** Plot title; defaults to one naming the mode. */
          title?: string;
      };

export interface SnapshotOptions extends CaptureOptions {
    /** Width the chart is laid out at, CSS px. Column sampling and cell sizes
     *  follow it as they would in a container this wide. Default 880. */
    width?: number;
    /** Height of charts with no natural height (activation patching), CSS
     *  px. Default width × 0.5. The logit lens takes its content height. */
    height?: number;
    /** Draw the dark theme. Default false. */
    darkMode?: boolean;
}

/** The widgets' card surfaces, the default snapshot background. */
const SURFACE = { light: "#ffffff", dark: "hsl(0 0% 16%)" };

function nextFrame(): Promise<void> {
    return new Promise((resolve) => {
        // requestAnimationFrame doesn't fire in a background tab.
        const timer = setTimeout(resolve, 100);
        requestAnimationFrame(() => {
            clearTimeout(timer);
            resolve();
        });
    });
}

/** Wait for fonts and for the widgets' deferred (rAF) re-layout passes. */
async function settle(): Promise<void> {
    if (typeof document.fonts?.ready?.then === "function") await document.fonts.ready;
    for (let i = 0; i < 3; i++) await nextFrame();
}

/**
 * Render `spec` offscreen in its static form and capture it as a PNG.
 *
 * ```ts
 * const shot = await snapshotChart(
 *     { kind: "logit-lens", data, uiState },
 *     { width: 880, scale: 2 },
 * );
 * img.src = shot.dataUrl;
 * ```
 */
export async function snapshotChart(spec: ChartSnapshotSpec, options: SnapshotOptions = {}): Promise<ChartSnapshot> {
    const width = Math.max(200, Math.round(options.width ?? 880));
    const dark = options.darkMode ?? false;
    const scale = options.scale ?? 2;
    const background = options.background === undefined ? (dark ? SURFACE.dark : SURFACE.light) : options.background;

    // A fixed-width host off the viewport; the widget mounts into an inner
    // element because the cores size their mount to 100% of its parent.
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;pointer-events:none;`;
    const mount = document.createElement("div");
    host.appendChild(mount);
    document.body.appendChild(host);

    let destroy = () => {};
    try {
        if (spec.kind === "logit-lens") {
            const core = new LogitLensCore(
                mount,
                spec.data,
                { ...spec.uiState, darkMode: dark },
                { interactive: false, pixelRatio: scale },
            );
            destroy = () => core.destroy();
        } else {
            const height = Math.max(160, Math.round(options.height ?? width * 0.5));
            host.style.height = `${height}px`;
            const core = new ActivationPatchingCore(mount, spec.data, {
                mode: spec.mode,
                selectedTokens: spec.selectedTokens,
                title: spec.title,
                darkMode: dark,
                transparentBackground: true,
                interactive: false,
                pixelRatio: scale,
            });
            destroy = () => core.destroy();
        }
        await settle();
        return await captureElement(host, { scale, background, padding: options.padding });
    } finally {
        destroy();
        host.remove();
    }
}
