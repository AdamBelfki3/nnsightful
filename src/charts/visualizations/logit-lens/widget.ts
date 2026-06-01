/**
 * LogitLens widget — redesigned.
 *
 * Composition (top → bottom): header · prompt strip · heatmap · layer
 * navigator · (line plot on cell click). The heatmap is a generic
 * white→ramp magnitude grid; the prompt strip drives row navigation and
 * the layer navigator drives column (layer) navigation via a draggable
 * skyline window with stride sampling so even 80+ layer models show at
 * most ~18 readable columns.
 *
 * Vanilla TS so the same bundle works in Jupyter (standalone) and the
 * workbench (React mount). Reuses the V2→V1 data normalizer, the shared
 * theme detector, and LinePlotCore for the kept trajectory panel.
 */

import type { LogitLensData, LogitLensUIState, LogitLensWidgetInterface } from "../../types/logit-lens";
import type { LinePlotLine } from "../../types/line-plot";
import { normalizeData, type NormalizedData } from "./normalize";
import { generateUid, escapeHtml } from "./utils";
import { injectStyles, applyDarkMode } from "./styles";
import { PALETTE } from "./colors";
import { LinePlotCore } from "../../core/line-plot";
import { detectThemeMode, onThemeModeChange } from "../../detect-theme-mode";

interface CreateWidgetResult {
    widget: LogitLensWidgetInterface;
    styleEl: HTMLStyleElement;
}

// ── Layout constants ──
const ROW_LABEL_W = 60;
const ROW_H = 30;
const HDR_H = 22;
// Column sizing: the number of visible (strided) columns adapts to the
// available width so each column keeps at least MIN_CELL px and the grid
// never needs horizontal scroll; cells then fill the width up to MAX_CELL.
const MIN_CELL = 48;   // smallest readable column → caps the column count
const MAX_CELL = 150;  // largest column → avoids absurd width for few columns
const COL_CAP = 18;    // hard ceiling on visible columns regardless of width

const RAMPS: Record<string, string> = {
    purple: "#9333ea",
    blue: "#2563eb",
    teal: "#0d9488",
};

// Cells whose top-1 prediction equals the model's final next-token
// prediction are tinted with this orange ramp instead of the base ramp,
// so you can see where in the network the final answer emerges.
const FINAL_PRED_HEX = "#cc6622";

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Blend the card surface → base-color by magnitude, with perceptual
// easing that pushes most of the colour change into the high end (faint
// cells melt into the card; strong cells saturate). Light mode blends from
// white (255); dark mode blends from the dark card surface (~hsl 0 0% 16%)
// so the heatmap sits naturally in a dark UI instead of being a bright
// block.
const DARK_CELL_BASE = 41; // ≈ hsl(0 0% 16%), the dark card surface
function cellBg(value: number, baseHex: string, dark: boolean): string {
    const [r, g, b] = hexToRgb(baseHex);
    const t = Math.pow(Math.max(0, Math.min(1, value)), 1.1);
    if (dark) {
        const mix = (ch: number) => Math.round(DARK_CELL_BASE + (ch - DARK_CELL_BASE) * t);
        return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
    }
    const mix = (ch: number) => Math.round(255 - (255 - ch) * t);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function cellFg(value: number, dark: boolean): string {
    if (dark) {
        // Light text on the dark→ramp cells; white once saturated.
        if (value >= 0.62) return "#fff";
        if (value >= 0.32) return "rgba(255,255,255,0.92)";
        return "hsl(0 0% 80%)";
    }
    if (value >= 0.62) return "#fff";
    if (value >= 0.42) return "rgba(255,255,255,0.92)";
    return "hsl(0 0% 18%)";
}

// Inner HTML for a BPE token: leading space → faint "·", body escaped.
function tokenInnerHTML(raw: string): string {
    if (raw === undefined || raw === null) return "";
    if (raw.startsWith(" ")) {
        return '<span class="ll-lead-dot">·</span>' + escapeHtml(raw.slice(1));
    }
    return escapeHtml(raw);
}

// Plain-text form for tooltips (· prefix, no markup).
function tokenPlain(raw: string): string {
    if (raw === undefined || raw === null) return "";
    return raw.startsWith(" ") ? "·" + raw.slice(1) : raw;
}

function isBosToken(tok: string): boolean {
    const t = tok.trim();
    return t === "<bos>" || t === "<s>" || t === "<|endoftext|>" || t === "<|begin_of_text|>";
}

interface State {
    ramp: "purple" | "blue" | "teal";
    showGrid: boolean;
    dimLow: boolean;
    selectedRow: number | null;
    selectedLayerIdx: number | null; // absolute layer index for the line plot
    viewStart: number;
    viewSize: number;
    darkModeOverride: boolean | null;
    // Pinned trajectory tokens: each gets a palette color, draws a colored
    // contour on every cell where it's the top-1 prediction, and a line in
    // the trajectory plot.
    pinned: { token: string; color: string }[];
    colorIndex: number;
    openPopup: { row: number; layer: number } | null;
}

export function createWidget(
    containerArg: HTMLElement | string,
    inputData: LogitLensData,
    uiState?: Partial<LogitLensUIState>,
): CreateWidgetResult | null {
    const uid = generateUid();
    let container: HTMLElement | null;
    if (typeof containerArg === "string") container = document.querySelector(containerArg);
    else if (containerArg instanceof Element) container = containerArg as HTMLElement;
    else container = null;
    if (!container) {
        console.error("Container not found:", containerArg);
        return null;
    }

    // ── Data ──
    let dataResult = normalizeData(inputData);
    let widgetData: NormalizedData = dataResult.normalized;
    let v2Data = dataResult.v2Data;

    const styleEl = injectStyles(uid);

    // ── State ──
    const state: State = {
        ramp: (uiState?.ramp as State["ramp"]) || "purple",
        showGrid: uiState?.showGrid ?? true,
        dimLow: uiState?.dimLowProb ?? true,
        selectedRow: uiState?.selectedRow ?? null,
        selectedLayerIdx: null,
        viewStart: 0,
        viewSize: widgetData.layers.length,
        darkModeOverride: uiState?.darkMode ?? null,
        pinned: [],
        colorIndex: 0,
        openPopup: null,
    };

    // ── Event bus (minimal, for on/off) ──
    const listeners: Record<string, ((data: unknown) => void)[]> = {};
    function emit(ev: string, data: unknown) { (listeners[ev] || []).forEach((cb) => cb(data)); }

    // ── Derived data ──
    let nLayers = widgetData.layers.length;
    let nRows = widgetData.tokens.length;
    let layerSummary: number[] = []; // max prob across rows, per absolute layer
    let finalPredToken = "";         // model's final next-token prediction

    function recomputeDerived() {
        nLayers = widgetData.layers.length;
        nRows = widgetData.tokens.length;
        layerSummary = [];
        for (let l = 0; l < nLayers; l++) {
            let mx = 0;
            for (let r = 0; r < nRows; r++) {
                const c = widgetData.cells[r]?.[l];
                if (c && c.prob > mx) mx = c.prob;
            }
            layerSummary.push(mx);
        }
        finalPredToken = widgetData.cells[nRows - 1]?.[nLayers - 1]?.token ?? "";
        // Clamp view to data
        if (state.viewSize > nLayers || state.viewSize < 1) state.viewSize = nLayers;
        const maxStart = Math.max(0, nLayers - state.viewSize);
        if (state.viewStart > maxStart) state.viewStart = maxStart;
        if (state.viewStart < 0) state.viewStart = 0;
    }
    recomputeDerived();

    // ── Pin helpers ──
    function pinColorFor(token: string): string | null {
        const p = state.pinned.find((x) => x.token === token);
        return p ? p.color : null;
    }
    function togglePin(token: string) {
        const idx = state.pinned.findIndex((x) => x.token === token);
        if (idx >= 0) {
            state.pinned.splice(idx, 1);
        } else {
            state.pinned.push({ token, color: PALETTE[state.colorIndex % PALETTE.length] });
            state.colorIndex++;
        }
    }
    // A token's probability trajectory across layers at a given position.
    function trajectoryForToken(pos: number, token: string): number[] | null {
        const tracked = v2Data?.tracked?.[pos] as Record<string, number[]> | undefined;
        if (tracked && Array.isArray(tracked[token])) return tracked[token];
        for (let li = 0; li < nLayers; li++) {
            const found = widgetData.cells[pos]?.[li]?.topk.find((t) => t.token === token);
            if (found) return found.trajectory;
        }
        return null;
    }

    function baseHex(): string { return RAMPS[state.ramp] || RAMPS.purple; }

    function isDarkMode(): boolean {
        if (state.darkModeOverride !== null) return state.darkModeOverride;
        return detectThemeMode(container);
    }

    // Width available for the grid, in px. Measured from the scroll
    // region's true inner width (excludes the card border/padding and any
    // vertical scrollbar). The card is width-bounded before this is read
    // (see renderHeatmap), so it's reliable. Falls back to a container
    // estimate before first layout.
    function heatmapAvailW(): number {
        const sw = scrollEl.clientWidth;
        if (sw > 0) return sw;
        const cw = (container as HTMLElement)?.clientWidth ?? 0;
        return cw > 0 ? cw - 42 : 900;
    }

    // How many columns fit at the minimum readable cell width — this is what
    // makes the heatmap fit any panel: narrow panels show fewer (more
    // heavily strided) columns rather than scrolling.
    function maxColsFit(): number {
        const fitCols = Math.floor((heatmapAvailW() - ROW_LABEL_W) / MIN_CELL);
        return Math.max(1, Math.min(COL_CAP, fitCols));
    }

    // ── Layer window → shown layers (stride sampling) ──
    function computeShownLayers(): { shownLayers: number[]; stride: number; start: number } {
        const maxStart = Math.max(0, nLayers - state.viewSize);
        const start = Math.max(0, Math.min(maxStart, state.viewStart));
        const size = state.viewSize;
        const maxCols = maxColsFit();
        if (size <= maxCols) {
            const shownLayers: number[] = [];
            for (let i = 0; i < size; i++) shownLayers.push(start + i);
            return { shownLayers, stride: 1, start };
        }
        const stride = Math.ceil(size / maxCols);
        const shownLayers: number[] = [];
        for (let l = start; l < start + size; l += stride) shownLayers.push(l);
        const last = start + size - 1;
        if (shownLayers[shownLayers.length - 1] !== last) {
            shownLayers.push(Math.min(nLayers - 1, last));
        }
        return { shownLayers, stride, start };
    }

    // ═══════════════════════════════════════════════════════════════
    // DOM SHELL
    // ═══════════════════════════════════════════════════════════════
    container.innerHTML = `
        <div id="${uid}" tabindex="-1">
            <div class="ll-scroll" id="${uid}_scroll" tabindex="0"></div>
            <div class="ll-nav" id="${uid}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${uid}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${uid}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box"><div class="ll-lineplot" id="${uid}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${uid}_tt"></div>
            <div class="ll-popup" id="${uid}_popup">
                <span class="ll-popup-close" id="${uid}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${uid}_popup_hdr"></div>
                <div class="ll-popup-body" id="${uid}_popup_body"></div>
            </div>
        </div>
    `;

    const widgetEl = document.getElementById(uid)!;
    const scrollEl = document.getElementById(uid + "_scroll")!;
    const navEl = document.getElementById(uid + "_nav")!;
    const lpWrap = document.getElementById(uid + "_lp_wrap")!;
    const lpTokenEl = document.getElementById(uid + "_lp_token")!;
    const lpEl = document.getElementById(uid + "_lp")!;
    const ttEl = document.getElementById(uid + "_tt")!;
    const popupEl = document.getElementById(uid + "_popup")!;
    const popupHdrEl = document.getElementById(uid + "_popup_hdr")!;
    const popupBodyEl = document.getElementById(uid + "_popup_body")!;

    // Portal popup to body so position: fixed isn't broken by a
    // transformed ancestor (and it can extend past the card edge).
    document.body.appendChild(popupEl);

    let linePlot: LinePlotCore | null = null;
    let overlayEl: HTMLElement | null = null;
    let lpHidden = true; // current line-plot visibility (for fill-mode re-fit)

    // Fill mode = the host gives us a definite bounded box and expects the
    // widget to fill it (the workbench panel). Detected by the *absence* of
    // --ll-aspect-ratio, which the Jupyter Python wrapper sets but the
    // workbench React mount does not. In fill mode the card becomes a flex
    // column and the heatmap scroll region grows to use the leftover height;
    // otherwise (content/Jupyter) the card height is derived from the
    // aspect-ratio and the heatmap scrolls to stay inside that box.
    const aspectRaw = getComputedStyle(widgetEl).getPropertyValue("--ll-aspect-ratio").trim();
    const fillMode = !aspectRaw;
    if (fillMode) widgetEl.classList.add("ll-fill");

    // Parse --ll-aspect-ratio (e.g. "5 / 3") into h/w, computed once at
    // construction (aspectRaw is const). "unbounded"/"none"/"auto" or a
    // malformed/zero value disables the cap (fully content-driven height).
    // Faithful to the previous widget's applyOuterCap(), which derived the
    // widget's height from its width via this ratio.
    const aspectHW: number | null = (() => {
        if (!aspectRaw || /^(unbounded|none|auto)$/i.test(aspectRaw)) return null;
        const parts = aspectRaw.split("/").map((s) => parseFloat(s.trim()));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1]) || parts[0] === 0 || parts[1] === 0) {
            return null;
        }
        return parts[1] / parts[0]; // h / w
    })();

    // Effective cell dimensions, recomputed each render.
    //  - WIDTH (both modes): the visible columns fill the available width
    //    exactly (clamped to [MIN_CELL, MAX_CELL]). Because the column COUNT
    //    already adapts to the width (maxColsFit), each column is ≥ MIN_CELL,
    //    so the grid fits without horizontal scroll.
    //  - HEIGHT: fill mode (workbench) stretches rows to use the panel's
    //    spare vertical space; content mode (Jupyter) uses the fixed row
    //    height with a capped scroll region.
    let cellW = MIN_CELL;
    let rowH = ROW_H;
    function computeFillSizes() {
        const availW = heatmapAvailW();
        const nCols = computeShownLayers().shownLayers.length;
        cellW = nCols > 0
            ? Math.max(MIN_CELL, Math.min(MAX_CELL, Math.floor((availW - ROW_LABEL_W) / nCols)))
            : MIN_CELL;
        if (!fillMode) { rowH = ROW_H; return; }
        const availH = scrollEl.clientHeight;
        const reserved = HDR_H + 6 + 28; // sticky header + bottom axis caption
        const hForRows = availH - reserved;
        const stretchRows = nRows > 0 && nRows * ROW_H < hForRows;
        rowH = stretchRows ? Math.floor(hForRows / nRows) : ROW_H;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER: HEATMAP
    // ═══════════════════════════════════════════════════════════════
    function renderHeatmap() {
        const hex = baseHex();
        const dark = isDarkMode();
        // Grid separators: light "breathing room" lines on the light field,
        // subtle dark lines in dark mode (so they read on the colored cells
        // and vanish on the faint ones — mirroring the light behavior).
        const gridBorder = state.showGrid
            ? (dark
                ? "border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);"
                : "border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);")
            : "";

        // Bound the card width FIRST so computeFillSizes() reads a reliable
        // scroll inner width (the card can't be stretched by the wide grid).
        //  - fill (workbench): pin to the measured host px — the host is
        //    bounded by the display panel (overflow:hidden), a hard cap
        //    against any ancestor flex quirk. Height comes from CSS (100%).
        //  - content (Jupyter): width:100% of the (bounded) output
        //    container, and the card's HEIGHT is capped from the aspect
        //    ratio (width × h/w). The card is a flex column with overflow
        //    hidden, so the heatmap (.ll-scroll, flex:1) absorbs that cap
        //    and scrolls to keep content inside the ratio box — restoring
        //    the previous widget's applyOuterCap behavior.
        if (fillMode) {
            const hostW = (container as HTMLElement).clientWidth;
            widgetEl.style.width = hostW > 0 ? hostW + "px" : "100%";
            widgetEl.style.maxWidth = "100%";
            widgetEl.style.maxHeight = "";
            scrollEl.style.maxHeight = "";
        } else {
            widgetEl.style.width = "";
            widgetEl.style.maxWidth = "";
            scrollEl.style.maxHeight = "";
            const hostW = (container as HTMLElement).clientWidth || widgetEl.clientWidth;
            if (aspectHW && hostW > 0) {
                // Target card height = width × (h/w). Floor it at
                // chrome + a minimum heatmap so a tall ratio in a narrow
                // cell can't shrink the (overflow:hidden) card below the
                // fixed chrome — which would clip the navigator / line plot.
                // chromeHeight = everything except .ll-scroll (nav, line
                // plot, header row, axis caption, card padding), measured
                // live so it tracks whether the line plot is open.
                const MIN_SCROLL = 90;
                const chromeH = widgetEl.offsetHeight - scrollEl.offsetHeight;
                const floor = (chromeH > 0 ? chromeH : 140) + MIN_SCROLL;
                widgetEl.style.maxHeight = Math.max(floor, Math.round(hostW * aspectHW)) + "px";
            } else {
                // unbounded / malformed → content-driven (no cap), matching
                // the old opt-out path.
                widgetEl.style.maxHeight = "";
            }
        }

        computeFillSizes();
        const { shownLayers } = computeShownLayers();
        const nCols = shownLayers.length;
        const tableWidth = Math.round(ROW_LABEL_W + cellW * nCols);
        const cols = `${ROW_LABEL_W}px repeat(${nCols}, ${cellW}px)`;

        let html = `<div class="ll-grid-inner" style="width:${tableWidth}px;min-width:${tableWidth}px;">`;

        // Header row
        html += `<div class="ll-hdr-row" style="display:grid;grid-template-columns:${cols};height:${HDR_H + 6}px;">`;
        html += `<div class="ll-corner">token</div>`;
        for (const l of shownLayers) {
            html += `<div class="ll-hdr-cell">${widgetData.layers[l]}</div>`;
        }
        html += `</div>`;

        // Rows
        for (let r = 0; r < nRows; r++) {
            const tok = widgetData.tokens[r];
            const bos = isBosToken(tok);
            const sel = r === state.selectedRow;
            html += `<div class="ll-row" data-rowwrap="${r}">`;
            if (sel) html += `<div class="ll-row-rail"></div>`;
            html += `<div class="ll-row-grid${sel ? " ll-row-sel" : ""}" data-row="${r}" `
                + `style="display:grid;grid-template-columns:${cols};height:${rowH}px;">`;

            // Row label
            html += `<div class="ll-row-label">`;
            html += bos
                ? `<span class="ll-bos-pill">bos</span>`
                : `<span class="ll-cell-text" style="${sel ? "font-weight:600;" : ""}">${tokenInnerHTML(tok)}</span>`;
            html += `</div>`;

            // Cells
            for (const l of shownLayers) {
                const c = widgetData.cells[r][l];
                const prob = c.prob;
                // Orange ramp for cells predicting the final next token.
                const isFinal = finalPredToken !== "" && c.token === finalPredToken;
                const bg = cellBg(prob, isFinal ? FINAL_PRED_HEX : hex, dark);
                const fg = cellFg(prob, dark);
                const low = prob < 0.18;
                const op = state.dimLow && low ? "opacity:0.55;" : "";
                // Colored contour where a pinned trajectory token is predicted.
                const pc = pinColorFor(c.token);
                const contour = pc ? `box-shadow:inset 0 0 0 2px ${pc};` : "";
                html += `<div class="ll-cell${pc ? " ll-cell-pinned" : ""}" data-row="${r}" data-layer="${l}" `
                    + `style="background:${bg};color:${fg};padding:0 6px;${op}${gridBorder}${contour}">`
                    + `<span class="ll-cell-text">${tokenInnerHTML(c.token)}</span>`
                    + `</div>`;
            }
            html += `</div></div>`;
        }

        // Bottom axis caption
        html += `<div style="display:grid;grid-template-columns:${cols};margin-top:6px;">`
            + `<div></div>`
            + `<div class="ll-axis-caption" style="grid-column:2 / span ${nCols};">layer</div>`
            + `</div>`;

        html += `</div>`;
        scrollEl.innerHTML = html;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER: LAYER NAVIGATOR
    // ═══════════════════════════════════════════════════════════════
    function renderNavigator() {
        const hex = baseHex();
        const dark = isDarkMode();
        const { stride, start } = computeShownLayers();
        const size = state.viewSize;
        const atFull = size >= nLayers;

        // Range label
        let rangeHtml = `<span class="ll-nav-range-key">layers</span>`;
        if (atFull) {
            rangeHtml += `all ${nLayers}` + (stride > 1 ? `<span class="ll-dim"> · every ${stride}</span>` : "");
        } else {
            rangeHtml += `${start}–${start + size - 1}<span class="ll-dim"> / ${nLayers}</span>`
                + (stride > 1 ? `<span class="ll-dim"> · ≈1/${stride}</span>` : "");
        }

        // Skyline bars
        let bars = "";
        for (let l = 0; l < nLayers; l++) {
            const p = layerSummary[l] || 0;
            const h = Math.max(8, Math.round(p * 92));
            bars += `<div class="ll-skyline-bar" style="height:${h}%;background:${cellBg(p, hex, dark)}"></div>`;
        }
        const winLeft = (start / nLayers) * 100;
        const winWidth = (size / nLayers) * 100;

        // Ticks: multiples of 8 (by layer index) plus the final layer.
        const tickIdxs: number[] = [];
        for (let l = 0; l < nLayers; l += 8) tickIdxs.push(l);
        if (tickIdxs[tickIdxs.length - 1] !== nLayers - 1) tickIdxs.push(nLayers - 1);
        let ticksHtml = "";
        const denom = Math.max(1, nLayers - 1);
        for (const idx of tickIdxs) {
            const isEnd = idx === nLayers - 1;
            const isStart = idx === 0;
            const pct = (idx / denom) * 100;
            const tx = isEnd ? "translateX(-100%)" : isStart ? "translateX(0)" : "translateX(-50%)";
            ticksHtml += `<span class="ll-nav-tick" style="left:${pct}%;transform:${tx}">${widgetData.layers[idx]}</span>`;
        }

        navEl.innerHTML = `
            <div class="ll-nav-range">${rangeHtml}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${uid}_sky">
                    <div class="ll-skyline-bars">${bars}</div>
                    <div class="ll-skyline-win" id="${uid}_win" style="left:${winLeft}%;width:${winWidth}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${ticksHtml}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${start <= 0 ? "disabled" : ""}>${ICON_CHEVL}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${start + size >= nLayers ? "disabled" : ""}>${ICON_CHEVR}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in">${ICON_PLUS}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${atFull ? "disabled" : ""}>${ICON_MINUS}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${ICON_RESET_SM}</button>
            </div>
        `;
        attachSkylineDrag();
    }

    // Cheap: just reposition the window overlay during a drag.
    function updateNavWindow() {
        const win = document.getElementById(uid + "_win");
        if (!win) return;
        const maxStart = Math.max(0, nLayers - state.viewSize);
        const start = Math.max(0, Math.min(maxStart, state.viewStart));
        win.style.left = (start / nLayers) * 100 + "%";
        win.style.width = (state.viewSize / nLayers) * 100 + "%";
    }

    // ═══════════════════════════════════════════════════════════════
    // NAVIGATION ACTIONS
    // ═══════════════════════════════════════════════════════════════
    // Recomputed from current nLayers (so it stays correct after setData).
    function zoomSteps(): number[] {
        return Array.from(new Set([nLayers, 48, 32, 20, 14, 10, 8]))
            .filter((v) => v <= nLayers && v >= 1)
            .sort((a, b) => a - b);
    }

    function clampStart(s: number): number {
        return Math.max(0, Math.min(Math.max(0, nLayers - state.viewSize), s));
    }

    let rebuildScheduled = false;
    function scheduleHeatmapRebuild() {
        if (rebuildScheduled) return;
        rebuildScheduled = true;
        requestAnimationFrame(() => {
            rebuildScheduled = false;
            renderHeatmap();
            updateNavWindow();
        });
    }

    function panBy(d: number) {
        const next = clampStart(state.viewStart + d);
        if (next === state.viewStart) return;
        state.viewStart = next;
        renderHeatmap();
        renderNavigator();
        emitStateChange();
    }

    function setStart(s: number) {
        const next = clampStart(s);
        if (next === state.viewStart) return;
        state.viewStart = next;
        scheduleHeatmapRebuild();
    }

    // Zoom one step on the discrete ladder, keeping `centerLayer` roughly
    // fixed (so wheel-zoom focuses where the cursor is; button-zoom passes
    // the window center).
    function zoomAtLayer(direction: number, centerLayer: number) {
        const steps = zoomSteps();
        const idx = steps.findIndex((v) => v >= state.viewSize);
        const cur = idx === -1 ? steps.length - 1 : idx;
        const next = direction < 0 ? Math.max(0, cur - 1) : Math.min(steps.length - 1, cur + 1);
        const newSize = steps[next];
        if (newSize === state.viewSize) return;
        state.viewSize = newSize;
        state.viewStart = Math.max(0, Math.min(nLayers - newSize, Math.round(centerLayer - newSize / 2)));
        renderHeatmap();
        renderNavigator();
        emitStateChange();
    }

    function zoom(direction: number) {
        zoomAtLayer(direction, state.viewStart + state.viewSize / 2);
    }

    function resetView() {
        state.viewSize = nLayers;
        state.viewStart = 0;
        renderHeatmap();
        renderNavigator();
        emitStateChange();
    }

    // ── Skyline drag ──
    let dragState: { startX: number; startStart: number; layerW: number } | null = null;
    function attachSkylineDrag() {
        const sky = document.getElementById(uid + "_sky");
        if (!sky) return;
        sky.addEventListener("pointerdown", (e: PointerEvent) => {
            const rect = sky.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const layerW = rect.width / nLayers;
            const maxStart = Math.max(0, nLayers - state.viewSize);
            const start = Math.max(0, Math.min(maxStart, state.viewStart));
            const winL = start * layerW;
            const winR = (start + state.viewSize) * layerW;
            let newStart = start;
            if (x < winL || x > winR) {
                newStart = clampStart(Math.round(x / layerW) - Math.floor(state.viewSize / 2));
                state.viewStart = newStart;
                scheduleHeatmapRebuild();
            }
            dragState = { startX: x, startStart: newStart, layerW };
            sky.classList.add("ll-grabbing");
            try { sky.setPointerCapture(e.pointerId); } catch { /* noop */ }
        });
        sky.addEventListener("pointermove", (e: PointerEvent) => {
            if (!dragState) return;
            const rect = sky.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const dLayers = (x - dragState.startX) / dragState.layerW;
            setStart(Math.round(dragState.startStart + dLayers));
        });
        const end = (e: PointerEvent) => {
            if (!dragState) return;
            dragState = null;
            sky.classList.remove("ll-grabbing");
            try { sky.releasePointerCapture(e.pointerId); } catch { /* noop */ }
            renderNavigator(); // sync range label + button disabled states
            emitStateChange();
        };
        sky.addEventListener("pointerup", end);
        sky.addEventListener("pointercancel", end);
        // Wheel over the skyline zooms in/out, centered on the layer under
        // the cursor — a quick way to drill into a region without the
        // buttons. Horizontal-ish wheel (shift / trackpad x) pans instead.
        sky.addEventListener("wheel", (e: WheelEvent) => {
            e.preventDefault();
            const rect = sky.getBoundingClientRect();
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                panBy(e.deltaX > 0 ? 1 : -1);
                return;
            }
            const cursorLayer = Math.round((e.clientX - rect.left) / rect.width * nLayers);
            zoomAtLayer(e.deltaY < 0 ? -1 : 1, cursorLayer);
        }, { passive: false });
    }

    // ═══════════════════════════════════════════════════════════════
    // SELECTION + LINE PLOT
    // ═══════════════════════════════════════════════════════════════
    function selectRow(row: number, layerIdx?: number, scroll = false) {
        state.selectedRow = row;
        state.selectedLayerIdx = layerIdx ?? widgetData.layers.length - 1;
        renderHeatmap();
        updateLinePlot();
        if (scroll) scrollToRow(row);
        emitStateChange();
    }

    function scrollToRow(idx: number) {
        const el = scrollEl.querySelector(`[data-rowwrap="${idx}"]`) as HTMLElement | null;
        if (!el) return;
        const target = el.offsetTop - scrollEl.clientHeight / 2 + el.offsetHeight / 2;
        scrollEl.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }

    // The trajectory plot shows the pinned tokens' probability curves at the
    // currently selected row's position, plus an optional dashed hover
    // preview. Hidden entirely when nothing is pinned and nothing hovered.
    function updateLinePlot(overlay?: { values: (number | null)[]; label: string; color: string } | null) {
        const pos = state.selectedRow;
        const richLines: LinePlotLine[] = [];
        if (pos !== null) {
            for (const p of state.pinned) {
                const traj = trajectoryForToken(pos, p.token);
                if (!traj) continue;
                richLines.push({
                    values: traj.map((v) => (v === null || v === undefined ? null : v)) as (number | null)[],
                    label: tokenPlain(p.token),
                    color: p.color,
                    removable: false,
                });
            }
        }
        const shouldHide = richLines.length === 0 && !overlay;
        if (shouldHide) {
            lpWrap.classList.add("ll-hidden");
        } else {
            lpWrap.classList.remove("ll-hidden");
            lpTokenEl.textContent = pos === null
                ? ""
                : isBosToken(widgetData.tokens[pos]) ? "position " + pos + " · bos" : "position " + pos + " · " + tokenPlain(widgetData.tokens[pos]);

            const plotData = { lines: [] as number[][], richLines, xLabels: widgetData.layers };
            const plotOptions: Record<string, unknown> = {
                darkMode: isDarkMode(),
                mode: "probability" as const,
                autoScale: true,
                legendPosition: richLines.length > 1 ? ("right" as const) : ("none" as const),
                showDataPoints: true,
                xAxisLabel: "layer",
                yAxisLabel: "probability",
                transparentBackground: true,
            };
            if (!linePlot) {
                // Pre-set min-height so LinePlotCore won't force its default
                // 300px (it only sets min-height when the inline value is
                // empty). The .ll-lineplot-box already gives a definite 200px.
                lpEl.style.minHeight = "0";
                linePlot = new LinePlotCore(lpEl, plotData, plotOptions as any);
            } else {
                linePlot.setData(plotData);
                linePlot.setOptions(plotOptions as any);
            }
            if (overlay) {
                (linePlot as any).setOverlay?.({
                    values: overlay.values, label: overlay.label, color: overlay.color,
                    dashPattern: "4,2", isOverlay: true,
                });
            } else {
                (linePlot as any).setOverlay?.(null);
            }
        }

        // Showing/hiding the plot changes the heatmap's available height in
        // fill mode — re-fit the cells once, only when visibility flips.
        if (fillMode && shouldHide !== lpHidden) {
            lpHidden = shouldHide;
            requestAnimationFrame(() => renderHeatmap());
        } else {
            lpHidden = shouldHide;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLTIP
    // ═══════════════════════════════════════════════════════════════
    function showTooltip(row: number, layerIdx: number, clientX: number, clientY: number) {
        const cell = widgetData.cells[row]?.[layerIdx];
        if (!cell) return;
        const hex = baseHex();
        const truthRow = isBosToken(widgetData.tokens[row]) ? "bos" : tokenPlain(widgetData.tokens[row]);
        ttEl.innerHTML =
            `<div class="ll-tt-head">`
            + `<span class="ll-tt-swatch" style="background:${cellBg(cell.prob, hex, isDarkMode())}"></span>`
            + `<span class="ll-tt-token">${escapeHtml(tokenPlain(cell.token))}</span>`
            + `</div>`
            + `<div class="ll-tt-grid">`
            + `<span>probability</span><span class="ll-tt-val">${(cell.prob * 100).toFixed(1)}%</span>`
            + `<span>layer</span><span class="ll-tt-val">${widgetData.layers[layerIdx]} / ${widgetData.layers[nLayers - 1]}</span>`
            + `<span>position</span><span class="ll-tt-val">${row} · ${escapeHtml(truthRow)}</span>`
            + `</div>`;
        ttEl.classList.add("ll-visible");

        const wrapRect = widgetEl.getBoundingClientRect();
        const ttW = ttEl.offsetWidth || 220;
        const ttH = ttEl.offsetHeight || 90;
        let x = clientX - wrapRect.left + 16;
        // Flip to the left of the cursor if near the right edge.
        if (clientX + ttW + 24 > window.innerWidth - 8) x = clientX - wrapRect.left - ttW - 12;
        let y = clientY - wrapRect.top - 50;
        x = Math.max(6, Math.min(x, wrapRect.width - ttW - 6));
        y = Math.max(6, Math.min(y, wrapRect.height - ttH - 6));
        ttEl.style.left = x + "px";
        ttEl.style.top = y + "px";
    }
    function hideTooltip() { ttEl.classList.remove("ll-visible"); }

    // ═══════════════════════════════════════════════════════════════
    // POPUP (top-k predictions on cell click) + dismiss overlay
    // ═══════════════════════════════════════════════════════════════
    function showOverlay() {
        removeOverlay();
        overlayEl = document.createElement("div");
        overlayEl.style.cssText = "position:fixed;inset:0;z-index:49;";
        overlayEl.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); closePopup(); });
        document.body.appendChild(overlayEl);
    }
    function removeOverlay() {
        if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    }

    function showPopup(row: number, layer: number, cellEl: HTMLElement) {
        const cellData = widgetData.cells[row]?.[layer];
        if (!cellData) return;
        // Capture the cell's screen rect BEFORE renderHeatmap() rebuilds the
        // grid (which detaches cellEl and would zero out its rect).
        const cellRect = cellEl.getBoundingClientRect();
        state.openPopup = { row, layer };
        state.selectedRow = row;
        state.selectedLayerIdx = layer;

        const posTok = isBosToken(widgetData.tokens[row]) ? "bos" : tokenPlain(widgetData.tokens[row]);
        popupHdrEl.innerHTML =
            `Layer <b>${widgetData.layers[layer]}</b>, Position <b>${row}</b>`
            + `<div class="ll-popup-sub">input <code>${escapeHtml(posTok)}</code></div>`;

        renderPopupBody(row, layer);
        renderHeatmap();
        updateLinePlot();

        popupEl.style.visibility = "hidden";
        popupEl.classList.add("ll-visible");
        positionPopup(cellRect);
        popupEl.style.visibility = "";
        showOverlay();
    }

    function renderPopupBody(row: number, layer: number) {
        const cellData = widgetData.cells[row][layer];
        let html = "";
        cellData.topk.forEach((item, ki) => {
            const pc = pinColorFor(item.token);
            const pinnedStyle = pc ? `background:${pc}22;border-left-color:${pc};` : "";
            html += `<div class="ll-topk${pc ? " ll-topk-pinned" : ""}" data-ki="${ki}" style="${pinnedStyle}" title="click to track trajectory">`
                + `<span class="ll-topk-tok">${tokenInnerHTML(item.token)}</span>`
                + `<span class="ll-topk-prob">${(item.prob * 100).toFixed(1)}%</span>`
                + `</div>`;
        });
        popupBodyEl.innerHTML = html;

        popupBodyEl.querySelectorAll<HTMLElement>(".ll-topk").forEach((el) => {
            const ki = parseInt(el.dataset.ki!);
            const item = cellData.topk[ki];
            el.addEventListener("mouseenter", () => {
                const traj = trajectoryForToken(row, item.token);
                if (traj) updateLinePlot({ values: traj.map((v) => v ?? null), label: tokenPlain(item.token), color: "#999" });
            });
            el.addEventListener("mouseleave", () => updateLinePlot());
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                togglePin(item.token);
                renderHeatmap();
                renderPopupBody(row, layer);
                updateLinePlot();
                emitStateChange();
            });
        });
    }

    function positionPopup(cellRect: DOMRect) {
        const margin = 6, gap = 6;
        const w = popupEl.offsetWidth || 220;
        const h = popupEl.offsetHeight || 160;
        const minLeft = margin, maxLeft = window.innerWidth - w - margin;
        const minTop = margin, maxTop = window.innerHeight - h - margin;
        const anchors = [
            { left: cellRect.right + gap, top: cellRect.top },
            { left: cellRect.left - gap - w, top: cellRect.top },
            { left: cellRect.left, top: cellRect.bottom + gap },
            { left: cellRect.left, top: cellRect.top - gap - h },
        ];
        let chosen = anchors[0];
        for (const a of anchors) {
            if (a.left >= minLeft && a.left <= maxLeft && a.top >= minTop && a.top <= maxTop) { chosen = a; break; }
        }
        popupEl.style.left = Math.max(minLeft, Math.min(chosen.left, maxLeft)) + "px";
        popupEl.style.top = Math.max(minTop, Math.min(chosen.top, maxTop)) + "px";
    }

    function closePopup() {
        state.openPopup = null;
        popupEl.classList.remove("ll-visible");
        removeOverlay();
        renderHeatmap();
        updateLinePlot();
    }

    document.getElementById(uid + "_popup_close")!.addEventListener("click", (e) => {
        e.stopPropagation();
        closePopup();
    });

    // ═══════════════════════════════════════════════════════════════
    // EVENT WIRING (delegation)
    // ═══════════════════════════════════════════════════════════════
    let hoverCell: HTMLElement | null = null;

    scrollEl.addEventListener("mousemove", (e) => {
        const cellDiv = (e.target as HTMLElement).closest(".ll-cell") as HTMLElement | null;
        if (!cellDiv) { if (hoverCell) { hoverCell.classList.remove("ll-cell-hover"); hoverCell = null; } hideTooltip(); return; }
        if (hoverCell !== cellDiv) {
            if (hoverCell) hoverCell.classList.remove("ll-cell-hover");
            hoverCell = cellDiv;
            hoverCell.classList.add("ll-cell-hover");
        }
        const row = parseInt(cellDiv.dataset.row!);
        const layer = parseInt(cellDiv.dataset.layer!);
        showTooltip(row, layer, e.clientX, e.clientY);
    });
    scrollEl.addEventListener("mouseleave", () => {
        if (hoverCell) { hoverCell.classList.remove("ll-cell-hover"); hoverCell = null; }
        hideTooltip();
    });
    scrollEl.addEventListener("click", (e) => {
        const cellDiv = (e.target as HTMLElement).closest(".ll-cell") as HTMLElement | null;
        if (cellDiv) {
            const row = parseInt(cellDiv.dataset.row!);
            const layer = parseInt(cellDiv.dataset.layer!);
            hideTooltip();
            showPopup(row, layer, cellDiv);
            return;
        }
        const rowGrid = (e.target as HTMLElement).closest(".ll-row-grid") as HTMLElement | null;
        if (rowGrid) selectRow(parseInt(rowGrid.dataset.row!));
    });

    // Keyboard nav when heatmap focused
    scrollEl.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const cur = state.selectedRow ?? -1;
        const next = e.key === "ArrowDown" ? Math.min(nRows - 1, cur + 1) : Math.max(0, cur - 1);
        selectRow(next, undefined, true);
    });

    // Navigator buttons
    navEl.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest("[data-nav]") as HTMLElement | null;
        if (!btn || btn.hasAttribute("disabled")) return;
        const act = btn.dataset.nav;
        if (act === "panL") panBy(-Math.max(1, Math.floor(state.viewSize / 4)));
        else if (act === "panR") panBy(Math.max(1, Math.floor(state.viewSize / 4)));
        else if (act === "zoomIn") zoom(-1);
        else if (act === "zoomOut") zoom(1);
        else if (act === "reset") resetView();
    });

    // ═══════════════════════════════════════════════════════════════
    // FULL RENDER + THEME
    // ═══════════════════════════════════════════════════════════════
    function renderAll() {
        renderHeatmap();
        renderNavigator();
        updateLinePlot();
        // The scroll region's true size isn't final until the nav + line
        // plot have laid out (and, on first mount, until the host has its
        // width), so re-measure and re-render the heatmap once layout
        // settles — columns/cells then fit the real available box.
        requestAnimationFrame(() => { renderHeatmap(); renderNavigator(); });
    }

    function syncDark() {
        applyDarkMode(widgetEl, isDarkMode(), popupEl);
    }

    function emitStateChange() {
        emit("stateChange", getState());
    }

    renderAll();
    syncDark();

    // Re-fit columns/cells when the host resizes (both modes — Jupyter cell
    // resize and workbench panel resize). Observe the HOST container, not
    // the card: in fill mode the card width is pinned to the host in px, so
    // observing the card would never see the host's resize.
    let resizeRaf = 0;
    let lastObservedW = (container as HTMLElement)?.clientWidth ?? 0;
    const resizeObserver = new ResizeObserver(() => {
        const w = (container as HTMLElement)?.clientWidth ?? 0;
        if (w === lastObservedW) return; // ignore height-only changes
        lastObservedW = w;
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; renderHeatmap(); });
    });
    if (container) resizeObserver.observe(container);

    const cleanupTheme = onThemeModeChange(container, (dark) => {
        if (state.darkModeOverride === null) {
            applyDarkMode(widgetEl, dark, popupEl);
            // Cell/skyline colors are baked into the markup at render time,
            // so re-render them for the new theme.
            renderHeatmap();
            renderNavigator();
            updateLinePlot();
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC INTERFACE
    // ═══════════════════════════════════════════════════════════════
    function getState(): LogitLensUIState {
        return {
            ramp: state.ramp,
            showGrid: state.showGrid,
            dimLowProb: state.dimLow,
            selectedRow: state.selectedRow,
            darkMode: state.darkModeOverride,
        };
    }

    const widget: LogitLensWidgetInterface = {
        getState,
        setState: (s: Partial<LogitLensUIState>) => {
            if (s.ramp !== undefined) state.ramp = s.ramp;
            if (s.showGrid !== undefined) state.showGrid = s.showGrid;
            if (s.dimLowProb !== undefined) state.dimLow = s.dimLowProb;
            if (s.selectedRow !== undefined) state.selectedRow = s.selectedRow;
            if (s.darkMode !== undefined) state.darkModeOverride = s.darkMode;
            syncDark();
            renderAll();
        },
        setData: (data: LogitLensData) => {
            dataResult = normalizeData(data);
            widgetData = dataResult.normalized;
            v2Data = dataResult.v2Data;
            recomputeDerived();
            state.selectedRow = null;
            state.selectedLayerIdx = null;
            renderAll();
        },
        setTitle: () => { /* header is fixed in the new design */ },
        setThemeMode: (enabled: boolean) => {
            state.darkModeOverride = !!enabled;
            syncDark();
            renderHeatmap();
            renderNavigator();
            updateLinePlot();
        },
        getThemeMode: () => isDarkMode(),
        hasEntropyData: () => !!v2Data && Array.isArray(v2Data.entropy) && v2Data.entropy.length > 0,
        hasRankData: () => {
            if (!v2Data?.tracked) return false;
            for (const trackedAtPos of v2Data.tracked) {
                for (const token in trackedAtPos) {
                    const d = trackedAtPos[token] as unknown;
                    if (d && typeof d === "object" && Array.isArray((d as { rank?: unknown }).rank)) return true;
                }
            }
            return false;
        },
        linkColumnsTo: () => { /* column linking removed in the new design */ },
        unlinkColumns: () => { /* no-op */ },
        on: (ev: string, cb: (data: unknown) => void) => { (listeners[ev] ||= []).push(cb); },
        off: (ev: string, cb: (data: unknown) => void) => {
            listeners[ev] = (listeners[ev] || []).filter((c) => c !== cb);
        },
        destroy: () => {
            cleanupTheme();
            resizeObserver?.disconnect();
            removeOverlay();
            popupEl.remove();
            if (linePlot) { linePlot.destroy(); linePlot = null; }
            if (container) container.innerHTML = "";
        },
    };

    return { widget, styleEl };
}

// ── Inline SVG icons (lucide-style strokes) ──
const ICON_RESET_SM = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
const ICON_CHEVL = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
const ICON_CHEVR = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const ICON_PLUS = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
const ICON_MINUS = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`;
