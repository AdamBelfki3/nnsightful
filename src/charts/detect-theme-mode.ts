/**
 * Shared theme-mode detection for all widget types.
 *
 * Detection order:
 *   1. JupyterLab theme attribute (`data-jp-theme-light` on <body>)
 *   2. Google Colab `.dark` class on <body>
 *   3. VS Code notebook webview (CSS variable `--vscode-editor-background`)
 *   4. Background luminance – walks up the DOM from the container to find
 *      the first ancestor with an opaque background, then checks luminance.
 *      Falls back to checking <body> and <html> explicitly.
 *   5. Falls back to `false` (light mode) when nothing is detectable.
 *
 * Note: system `prefers-color-scheme` is intentionally NOT used — the IDE /
 * notebook theme should take precedence over OS-level dark mode settings.
 */

/**
 * Parse a CSS color string into [r, g, b, a].
 * Handles rgb()/rgba() functional notation and #hex (3, 4, 6, 8 digit).
 * Returns null for unrecognised formats.
 */
function parseColor(color: string): [number, number, number, number] | null {
    // rgb()/rgba()
    const rgbMatch = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgbMatch) {
        return [
            Number(rgbMatch[1]),
            Number(rgbMatch[2]),
            Number(rgbMatch[3]),
            rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
        ];
    }

    // Hex: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    const hexMatch = color.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
    if (hexMatch) {
        const hex = hexMatch[1];
        let r: number, g: number, b: number, a = 1;
        if (hex.length === 3 || hex.length === 4) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
            if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
        } else {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
        }
        return [r, g, b, a];
    }

    return null;
}

/**
 * Compute luminance (0–1) from an rgba tuple, or return null if transparent
 * (alpha < 0.95 is treated as transparent to skip semi-transparent overlays).
 */
function luminanceFromColor(rgba: [number, number, number, number] | null): number | null {
    if (!rgba || rgba[3] < 0.95) return null;
    return (0.299 * rgba[0] + 0.587 * rgba[1] + 0.114 * rgba[2]) / 255;
}

/**
 * Walk up the DOM tree from `el` and return the luminance (0–1) of the first
 * ancestor with an opaque (alpha >= 0.95) background.  If the normal parent
 * walk finds nothing, explicitly checks <body> and <html> as a fallback.
 * Returns null when no opaque background is found anywhere.
 */
function getBackgroundLuminance(el: HTMLElement | null): number | null {
    let current = el;
    while (current) {
        const lum = luminanceFromColor(parseColor(getComputedStyle(current).backgroundColor));
        if (lum !== null) return lum;
        current = current.parentElement;
    }

    // Explicit fallback: check body and documentElement in case the walk
    // ended before reaching them (e.g. shadow DOM, iframe boundaries).
    if (typeof document !== "undefined") {
        for (const root of [document.body, document.documentElement]) {
            if (!root) continue;
            const lum = luminanceFromColor(parseColor(getComputedStyle(root).backgroundColor));
            if (lum !== null) return lum;
        }
    }

    return null;
}

/**
 * Check VS Code CSS custom properties for editor background color.
 * VS Code notebook outputs render in webviews where the body background is
 * transparent, but `--vscode-editor-background` reflects the actual theme.
 */
function detectVSCodeDarkMode(): boolean | null {
    if (typeof document === "undefined") return null;
    const style = getComputedStyle(document.documentElement);
    const bg = style.getPropertyValue("--vscode-editor-background").trim();
    if (!bg) return null;
    const lum = luminanceFromColor(parseColor(bg));
    if (lum === null) return null;
    return lum < 0.5;
}

/**
 * Subscribe to theme-mode changes in the environment.  Fires the callback
 * whenever the detected theme-mode state changes.
 *
 * Uses two complementary signals:
 *   - MutationObserver on <html> and <body> for class/style attribute changes
 *     (covers JupyterLab theme toggles, VS Code body-class changes, Colab).
 *   - matchMedia change listener for `prefers-color-scheme` (catches
 *     environments where theme changes surface through the media query).
 *
 * The callback receives the result of `detectThemeMode(container)` — so the
 * full detection priority order is always applied.
 *
 * @returns a cleanup function that disconnects the observer and listeners.
 */
export function onThemeModeChange(
    container: HTMLElement | null,
    callback: (isDark: boolean) => void,
): () => void {
    let last = detectThemeMode(container);

    const check = () => {
        const current = detectThemeMode(container);
        if (current !== last) {
            last = current;
            callback(current);
        }
    };

    const observer = new MutationObserver(check);
    if (typeof document !== "undefined") {
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
        if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    }

    // matchMedia is used only as a change *signal*, not as a detection source.
    let mql: MediaQueryList | null = null;
    if (typeof window !== "undefined" && window.matchMedia) {
        mql = window.matchMedia("(prefers-color-scheme: dark)");
        mql.addEventListener("change", check);
    }

    return () => {
        observer.disconnect();
        mql?.removeEventListener("change", check);
    };
}

/**
 * Auto-detect whether the current environment is in dark mode.
 * Returns `true` for dark, `false` for light.
 *
 * @param container – optional element from which to start the background
 *                    luminance walk.  When omitted, checks <body> / <html>
 *                    directly.
 */
export function detectThemeMode(container?: HTMLElement | null): boolean {
    // 1. JupyterLab: data-jp-theme-light on <body>
    if (typeof document !== "undefined" && document.body?.dataset?.jpThemeLight !== undefined) {
        return document.body.dataset.jpThemeLight === "false";
    }

    // 2. Google Colab: .dark class on <body>
    if (typeof document !== "undefined" && document.body?.classList?.contains("dark")) {
        return true;
    }

    // 3. VS Code notebook webview
    const vscode = detectVSCodeDarkMode();
    if (vscode !== null) return vscode;

    // 4. Background luminance (walks ancestors, then falls back to body/html)
    const luminance = getBackgroundLuminance(container ?? null);
    if (luminance !== null) {
        return luminance < 0.5;
    }

    // 5. Default to light
    return false;
}
