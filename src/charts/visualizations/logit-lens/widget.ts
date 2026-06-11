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
import type { HeatmapTableData, HeatmapTableOptions } from "../../types/heatmap-table";
import { normalizeData, type NormalizedData } from "./normalize";
import { generateUid, escapeHtml } from "./utils";
import { injectStyles, applyDarkMode } from "./styles";
import { PALETTE, LINE_STYLES } from "./colors";
import { LinePlotCore } from "../../core/line-plot";
import { HeatmapTableCore } from "../../core/heatmap-table";
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
// never needs horizontal scroll; cells then stretch to fill the width (no
// upper cap — fewer columns just means wider cells, never whitespace).
const MIN_CELL = 48;   // smallest readable column → caps the column count
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

// Inner HTML for a BPE token: a leading space is shown as a blue underscore
// (matching the activation-patching token UI), body escaped.
function tokenInnerHTML(raw: string): string {
    if (raw === undefined || raw === null) return "";
    if (raw.startsWith(" ")) {
        return '<span class="ll-lead-space">_</span>' + escapeHtml(raw.slice(1));
    }
    return escapeHtml(raw);
}

// Plain-text form for tooltips / chart labels (leading space → "_" prefix,
// no markup).
function tokenPlain(raw: string): string {
    if (raw === undefined || raw === null) return "";
    return raw.startsWith(" ") ? "_" + raw.slice(1) : raw;
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
    // Pinned rows (prompt positions). Each pinned token's trajectory is
    // drawn at every pinned position (token → color, position → dash style),
    // letting you compare a token across positions. When empty, the plot
    // falls back to the single selectedRow.
    pinnedRows: number[];
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

    // Restore pinned trajectories from serialized pinnedGroups (each pin is a
    // single-token group: { tokens: [token], color }). Tolerant of partials.
    function pinsFromGroups(
        groups: LogitLensUIState["pinnedGroups"] | undefined,
    ): { token: string; color: string }[] {
        if (!groups) return [];
        return groups
            .map((g) => ({ token: g.tokens?.[0] ?? "", color: g.color }))
            .filter((p) => p.token !== "");
    }

    // ── State ──
    const state: State = {
        ramp: (uiState?.ramp as State["ramp"]) || "purple",
        showGrid: uiState?.showGrid ?? true,
        dimLow: uiState?.dimLowProb ?? true,
        selectedRow: uiState?.selectedRow ?? null,
        selectedLayerIdx: uiState?.selectedLayer ?? null,
        viewStart: uiState?.viewStart ?? 0,
        viewSize: uiState?.viewSize ?? widgetData.layers.length,
        darkModeOverride: uiState?.darkMode ?? null,
        pinned: pinsFromGroups(uiState?.pinnedGroups),
        pinnedRows: (uiState?.pinnedRows ?? []).map((r) => r.pos).filter((p) => typeof p === "number"),
        colorIndex: uiState?.colorIndex ?? 0,
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
        // Drop any pinned rows / selection that fall outside the new data.
        state.pinnedRows = state.pinnedRows.filter((p) => p >= 0 && p < nRows);
        if (state.selectedRow !== null && state.selectedRow >= nRows) state.selectedRow = null;
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

    // ── Pinned-row helpers ──
    // The line style for a pinned row, derived from its order so each pinned
    // position is visually distinguishable (solid / dashed / dotted / …).
    // Callers only pass positions that ARE in pinnedRows; the idx<0 branch is
    // a defensive fallback (solid). Note: unpinning a row re-indexes the rest,
    // so their styles shift — callers always re-render the heatmap AND the
    // plot together, keeping the row markers and lines consistent.
    function lineStyleForRow(pos: number): { dash: string; name: string } {
        const idx = state.pinnedRows.indexOf(pos);
        return LINE_STYLES[(idx < 0 ? 0 : idx) % LINE_STYLES.length];
    }
    function isPinnedRow(pos: number): boolean {
        return state.pinnedRows.indexOf(pos) >= 0;
    }
    // Whether any currently-pinned token reaches `threshold` probability at
    // this position (used to decide if pinning a row should auto-add a token).
    function anyPinnedTokenRelevantAt(pos: number, threshold: number): boolean {
        for (const p of state.pinned) {
            const traj = trajectoryForToken(pos, p.token);
            if (!traj) continue;
            // reduce (not Math.max(...spread)) — robust regardless of length.
            let mx = 0;
            for (const v of traj) if (v != null && v > mx) mx = v;
            if (mx >= threshold) return true;
        }
        return false;
    }
    // The row's most confident top-1 token (across layers), for auto-pinning.
    function topTokenAtRow(pos: number): string | null {
        let best: string | null = null, bestP = 0;
        for (let li = 0; li < nLayers; li++) {
            const c = widgetData.cells[pos]?.[li];
            if (c && c.prob > bestP) { bestP = c.prob; best = c.token; }
        }
        return bestP >= 0.05 ? best : null;
    }
    function togglePinnedRow(pos: number) {
        const idx = state.pinnedRows.indexOf(pos);
        if (idx >= 0) {
            // Unpin the row only. Any token auto-pinned earlier is left in
            // state.pinned intentionally — it's a global trajectory marker
            // the user removes separately (via the popup / shift-click), not
            // something this row "owns". So no auto-unpin / colorIndex rewind.
            state.pinnedRows.splice(idx, 1);
            return;
        }
        // Auto-pin this row's dominant token if nothing pinned is relevant
        // here, so pinning a bare row immediately shows a trajectory.
        if (!anyPinnedTokenRelevantAt(pos, 0.01)) {
            const best = topTokenAtRow(pos);
            if (best && !pinColorFor(best)) {
                state.pinned.push({ token: best, color: PALETTE[state.colorIndex % PALETTE.length] });
                state.colorIndex++;
            }
        }
        state.pinnedRows.push(pos);
    }

    function baseHex(): string { return RAMPS[state.ramp] || RAMPS.purple; }

    function isDarkMode(): boolean {
        if (state.darkModeOverride !== null) return state.darkModeOverride;
        return detectThemeMode(container);
    }

    // ── Shown layers / stride ──
    // Column down-sampling now lives in HeatmapTableCore (columnSizing 'fit' +
    // sampleColumns 'uniform'); it reports the visible ABSOLUTE layer indices
    // via onVisibleColumnsChange. The navigator reads this for its stride/range
    // label. Seeded so the first navigator render before the core reports is
    // sane.
    let shownLayers: number[] = [];
    function navStride(): number {
        return shownLayers.length > 1 ? Math.max(1, shownLayers[1] - shownLayers[0]) : 1;
    }

    // ═══════════════════════════════════════════════════════════════
    // DOM SHELL
    // ═══════════════════════════════════════════════════════════════
    container.innerHTML = `
        <div id="${uid}" tabindex="-1">
            <div class="ll-heatmap" id="${uid}_heatmap" tabindex="0"></div>
            <div class="ll-nav" id="${uid}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${uid}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${uid}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${uid}_lp_box"><div class="ll-lineplot" id="${uid}_lp"></div></div>
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
    const heatmapEl = document.getElementById(uid + "_heatmap")!;
    const navEl = document.getElementById(uid + "_nav")!;
    // The heatmap grid is rendered by a shared HeatmapTableCore (assigned just
    // before the first render). Its scroll element stands in for the old
    // scrollEl where we need to drive scrolling.
    let hmCore!: HeatmapTableCore;
    const lpWrap = document.getElementById(uid + "_lp_wrap")!;
    const lpTokenEl = document.getElementById(uid + "_lp_token")!;
    const lpBoxEl = document.getElementById(uid + "_lp_box")!;
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
    // Set in destroy(); guards deferred (rAF) callbacks so they don't touch
    // the (now-cleared) DOM after teardown.
    let destroyed = false;

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

    // A tiny dashed-line swatch shown in a pinned row's label so the row
    // maps to its (dash-styled) lines in the trajectory plot.
    function rowStyleMarker(dash: string, dark: boolean): string {
        const stroke = dark ? "#bbb" : "#555";
        const da = dash ? ` stroke-dasharray="${escapeHtml(dash)}"` : "";
        return `<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8">`
            + `<line x1="0" y1="4" x2="16" y2="4" stroke="${stroke}" stroke-width="1.5"${da}/></svg>`;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER: HEATMAP (delegated to HeatmapTableCore)
    // ═══════════════════════════════════════════════════════════════
    // The grid — magnitude coloring, the final-prediction orange tint, low-prob
    // dimming and the pinned-token contour — is expressed as HeatmapTableData;
    // the core paints it. getCellValue closes over live state so colors / pins
    // / dimming update on every (re-)render without rebuilding the data.
    function buildHeatmapData(): HeatmapTableData {
        return {
            rows: widgetData.tokens.map((label) => ({ label })),
            columns: widgetData.layers.map((lab) => ({ label: String(lab), value: 0 })),
            getCellValue: (r, l) => {
                const c = widgetData.cells[r][l];
                const prob = c.prob;
                const dark = isDarkMode();
                const isFinal = finalPredToken !== "" && c.token === finalPredToken;
                const pc = pinColorFor(c.token);
                const low = prob < 0.18;
                return {
                    text: c.token,
                    value: prob,
                    color: cellBg(prob, isFinal ? FINAL_PRED_HEX : baseHex(), dark),
                    textColor: cellFg(prob, dark),
                    highlighted: !!pc,
                    highlightColor: pc ?? undefined,
                    opacity: state.dimLow && low ? 0.55 : undefined,
                };
            },
        };
    }

    // Row label: bos pill / blue-underscore token, bold when active, with a
    // dash marker on pinned rows. The host owns this markup (renderRowLabel).
    function renderRowLabel(r: number): string {
        const tok = widgetData.tokens[r];
        const active = r === state.selectedRow || isPinnedRow(r);
        let html = "";
        if (isPinnedRow(r)) html += rowStyleMarker(lineStyleForRow(r).dash, isDarkMode());
        html += isBosToken(tok)
            ? `<span class="ll-bos-pill">bos</span>`
            : `<span class="hmx-cell-text"${active ? ' style="font-weight:600"' : ""}>${tokenInnerHTML(tok)}</span>`;
        return html;
    }
    // Mark every row (cursor affordance) and the active one (rail + tint).
    function rowClassName(r: number): string {
        return "ll-hmx-row" + (r === state.selectedRow || isPinnedRow(r) ? " ll-hmx-active" : "");
    }

    // The options that drive the core each render. Striding/fit-to-width and
    // fill-vs-content are now core policies configured from widget state.
    function heatmapOptions(): Partial<HeatmapTableOptions> {
        return {
            columnSizing: "fit",
            minColumnWidth: MIN_CELL,
            maxVisibleColumns: COL_CAP,
            sampleColumns: "uniform",
            alwaysShowLastColumn: true,
            columnWindow: { start: clampStart(state.viewStart), size: state.viewSize },
            rowSizing: fillMode ? "fill" : "fixed",
            cellHeight: ROW_H,
            rowHeaderWidth: ROW_LABEL_W,
            headerHeight: HDR_H + 6,
            // Fill the bounded heatmap region (fill mode, or content mode with
            // an aspect-ratio cap). With no cap (the opt-out) there's no
            // bounded parent, so size to content and let the rows define height.
            height: fillMode || aspectHW != null ? "fill" : "content",
            chrome: "none",
            cornerLabel: "token",
            showGrid: state.showGrid,
            darkMode: isDarkMode(),
            renderRowLabel,
            rowClassName,
            onVisibleColumnsChange: (visible) => { shownLayers = visible; },
            onCellHover: onHeatmapCellHover,
            onCellClick: onHeatmapCellClick,
            onRowHeaderClick: (row) => {
                togglePinnedRow(row);
                renderHeatmap();
                updateLinePlot();
                emitStateChange();
            },
            onCellLeave: () => { hideTooltip(); clearCellPreview(); },
        };
    }

    // Size the widget card (fill the panel, or cap to the aspect ratio in
    // content mode), then let the core re-fit/-sample the grid for the box.
    function applyCardSizing() {
        if (fillMode) {
            const hostW = (container as HTMLElement).clientWidth;
            widgetEl.style.width = hostW > 0 ? hostW + "px" : "100%";
            widgetEl.style.maxWidth = "100%";
            widgetEl.style.maxHeight = "";
            return;
        }
        widgetEl.style.width = "";
        widgetEl.style.maxWidth = "";
        const hostW = (container as HTMLElement).clientWidth || widgetEl.clientWidth;
        if (aspectHW && hostW > 0) {
            // Card height = width × (h/w), floored at chrome + a min heatmap so
            // a tall ratio in a narrow cell can't clip the nav / line plot.
            const MIN_SCROLL = 90;
            const chromeH = widgetEl.offsetHeight - hmCore.getScrollElement().offsetHeight;
            const floor = (chromeH > 0 ? chromeH : 140) + MIN_SCROLL;
            widgetEl.style.maxHeight = Math.max(floor, Math.round(hostW * aspectHW)) + "px";
        } else {
            widgetEl.style.maxHeight = "";
        }
    }

    function renderHeatmap() {
        applyCardSizing();
        hmCore.setOptions(heatmapOptions());
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER: LAYER NAVIGATOR
    // ═══════════════════════════════════════════════════════════════
    function renderNavigator() {
        const hex = baseHex();
        const dark = isDarkMode();
        const start = clampStart(state.viewStart);
        const stride = navStride();
        const size = state.viewSize;
        const atFull = size >= nLayers;
        const steps = zoomSteps();
        const atMinZoom = size <= steps[0]; // can't zoom in further

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
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${atMinZoom ? "disabled" : ""}>${ICON_PLUS}</button>
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
            if (destroyed) return;
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
        hmCore.scrollToRow(idx);
    }

    // Default the heatmap to the bottom (the last prompt tokens) since the
    // final position's predictions are usually what you care about most.
    // Double rAF so it runs after renderAll's deferred re-render has set the
    // final content height. No-op (clamped) when the heatmap doesn't scroll.
    function scrollToBottom() {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (destroyed) return;
            hmCore.scrollToBottom();
        }));
    }

    // Size the line plot so its aspect ratio is proportional to the whole
    // widget's. The plot spans the widget's width, so making its height a
    // fixed fraction of the widget's (aspect-ratio-derived) height keeps
    // plotAR = widgetAR × LP_FRACTION — i.e. a flatter widget gives a
    // flatter plot, a taller one a taller plot.
    //   - content (Jupyter): widget height basis = hostWidth × aspectHW
    //     (the configured ratio), independent of how short the content is.
    //   - fill (workbench): basis = the widget's measured (panel) height.
    const LP_FRACTION = 0.45;
    const LP_MIN_H = 120;
    const LP_MAX_H = 360;
    function applyLinePlotHeight() {
        let basis: number;
        if (aspectHW) {
            const hostW = (container as HTMLElement).clientWidth || widgetEl.clientWidth;
            basis = hostW * aspectHW;
        } else {
            const wh = widgetEl.clientHeight;
            basis = wh > 0 ? wh : (widgetEl.clientWidth || 900) * 0.6;
        }
        const h = Math.round(basis * LP_FRACTION);
        lpBoxEl.style.height = Math.max(LP_MIN_H, Math.min(LP_MAX_H, h)) + "px";
    }

    // Short label for a position, e.g. "8·Paris" / "0·bos".
    function posLabel(pos: number): string {
        return pos + "·" + (isBosToken(widgetData.tokens[pos]) ? "bos" : tokenPlain(widgetData.tokens[pos]));
    }

    // The trajectory plot draws every (pinned token × shown position): the
    // shown positions are the pinned rows, or the single selected row when
    // none are pinned. Token → line color, position → dash style. When more
    // than one position is shown, labels include the position so you can tell
    // a token's curves apart across rows. Plus an optional dashed hover
    // preview. Hidden when nothing is pinned and nothing hovered.
    function updateLinePlot(overlay?: { values: (number | null)[]; label: string; color: string } | null) {
        const positions = state.pinnedRows.length > 0
            ? state.pinnedRows
            : (state.selectedRow !== null ? [state.selectedRow] : []);
        const multi = positions.length > 1;
        const richLines: LinePlotLine[] = [];
        for (const pos of positions) {
            const style = lineStyleForRow(pos);
            for (const p of state.pinned) {
                const traj = trajectoryForToken(pos, p.token);
                if (!traj) continue;
                let label = tokenPlain(p.token);
                if (multi) label += " (" + posLabel(pos) + ")";
                richLines.push({
                    values: traj.map((v) => (v === null || v === undefined ? null : v)) as (number | null)[],
                    label,
                    color: p.color,
                    dashPattern: style.dash || undefined,
                    removable: false,
                });
            }
        }
        const shouldHide = richLines.length === 0 && !overlay;
        if (shouldHide) {
            lpWrap.classList.add("ll-hidden");
        } else {
            lpWrap.classList.remove("ll-hidden");
            applyLinePlotHeight(); // keep the plot proportional to the widget
            lpTokenEl.textContent = state.pinnedRows.length > 1
                ? state.pinnedRows.length + " positions"
                : positions.length === 1
                    ? "position " + posLabel(positions[0])
                    : "";

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
        // fill mode — re-fit the cells once, only when visibility flips, and
        // re-anchor to the bottom so the last tokens stay in view (the plot
        // appearing would otherwise shrink the viewport and push them off).
        if (fillMode && shouldHide !== lpHidden) {
            lpHidden = shouldHide;
            requestAnimationFrame(() => { if (destroyed) return; renderHeatmap(); scrollToBottom(); });
        } else {
            lpHidden = shouldHide;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLTIP
    // ═══════════════════════════════════════════════════════════════
    // The tooltip scales with the cell it describes: its root font-size (which
    // all of its em-based internals key off) is proportional to the cell width,
    // clamped so it never gets unreadably small or unwieldy on very wide cells.
    const TT_REF_CELL = 56;   // cell width at which the tooltip is its base size
    const TT_BASE_FONT = 11;
    const TT_MIN_FONT = 9.5;
    const TT_MAX_FONT = 15;   // the "max size" cap
    function tooltipFontPx(cellWidth: number): number {
        const f = TT_BASE_FONT * (cellWidth > 0 ? cellWidth / TT_REF_CELL : 1);
        return Math.max(TT_MIN_FONT, Math.min(TT_MAX_FONT, f));
    }

    function showTooltip(row: number, layerIdx: number, clientX: number, clientY: number, cellWidth = 0) {
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
        // Set the scaled font BEFORE measuring offsetWidth/Height for placement.
        ttEl.style.fontSize = tooltipFontPx(cellWidth) + "px";
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
        emitStateChange(); // selection changed → host can persist
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
            // Preview the token's trajectory on hover, but ONLY when the line
            // plot is already open (something is pinned). With the plot closed,
            // a hover preview would pop the whole panel in and out as the
            // cursor crossed rows — so previewing is gated on its visibility.
            el.addEventListener("mouseenter", () => {
                if (lpHidden) return;
                const traj = trajectoryForToken(row, item.token);
                if (traj) updateLinePlot({ values: traj.map((v) => v ?? null), label: tokenPlain(item.token), color: "#999" });
            });
            el.addEventListener("mouseleave", () => { if (!lpHidden) updateLinePlot(); });
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                // Don't toggle the pin if the click ended a text selection
                // (the user was highlighting the token to copy it).
                if (!(window.getSelection()?.isCollapsed ?? true)) return;
                togglePin(item.token);
                renderHeatmap();
                renderPopupBody(row, layer);
                updateLinePlot();
                emitStateChange();
            });
        });
    }

    function positionPopup(cellRect: DOMRect) {
        const margin = 8, gap = 6;
        // Keep the popup fully inside the heatmap widget. Cap its width/height
        // to the space the widget offers (shrinking it if the widget is small),
        // so it can never spill outside the card or off-screen.
        const host = widgetEl.getBoundingClientRect();
        const maxW = Math.max(140, host.width - 2 * margin);
        const maxH = Math.max(120, host.height - 2 * margin);
        popupEl.style.maxWidth = maxW + "px";
        popupEl.style.maxHeight = maxH + "px";
        const w = popupEl.offsetWidth || 220;
        const h = popupEl.offsetHeight || 160;
        const minLeft = host.left + margin, maxLeft = host.right - margin - w;
        const minTop = host.top + margin, maxTop = host.bottom - margin - h;
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
        // maxLeft/maxTop can fall below their min when the widget is very small;
        // clamp against the min in that degenerate case so we pin to the edge.
        popupEl.style.left = Math.max(minLeft, Math.min(chosen.left, Math.max(minLeft, maxLeft))) + "px";
        popupEl.style.top = Math.max(minTop, Math.min(chosen.top, Math.max(minTop, maxTop))) + "px";
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
    // EVENT WIRING (via HeatmapTableCore callbacks)
    // ═══════════════════════════════════════════════════════════════
    // Preview the hovered cell's token trajectory, but ONLY when the plot is
    // already open (something pinned) — so a bare hover never pops the panel
    // in/out. The core fires onCellHover on cell *change*, so this is naturally
    // throttled to one preview per cell.
    function previewCellTrajectory(row: number, layer: number) {
        if (lpHidden) return;
        const token = widgetData.cells[row]?.[layer]?.token;
        const traj = token != null ? trajectoryForToken(row, token) : null;
        if (traj) updateLinePlot({ values: traj.map((v) => v ?? null), label: tokenPlain(token!), color: "#999" });
        else updateLinePlot(); // no trajectory for this token → just the pinned lines
    }
    function clearCellPreview() {
        if (!lpHidden) updateLinePlot();
    }

    function onHeatmapCellHover(row: number, layer: number) {
        previewCellTrajectory(row, layer);
    }
    function onHeatmapCellClick(row: number, layer: number, ev: MouseEvent) {
        // Shift-click → pin this cell's token trajectory directly.
        if (ev.shiftKey) {
            const tok = widgetData.cells[row]?.[layer]?.token;
            if (tok) { togglePin(tok); renderHeatmap(); updateLinePlot(); emitStateChange(); }
            return;
        }
        hideTooltip();
        const cellEl = (ev.target as HTMLElement).closest(".hmx-cell") as HTMLElement | null;
        if (cellEl) showPopup(row, layer, cellEl);
    }

    // Build the core now that all its callbacks exist. It renders immediately;
    // renderAll() re-renders once the card is sized so fit/fill measure right.
    hmCore = new HeatmapTableCore(heatmapEl, buildHeatmapData(), heatmapOptions());

    // The core fires onCellHover only on cell change; reposition the tooltip on
    // every move so it tracks the cursor within a cell (and hide it off-cell).
    // Named + on a captured element so destroy() can detach it cleanly.
    const hmScrollEl = hmCore.getScrollElement();
    const onScrollMove = (e: MouseEvent) => {
        const cell = (e.target as HTMLElement).closest(".hmx-cell") as HTMLElement | null;
        if (!cell) { hideTooltip(); return; }
        showTooltip(parseInt(cell.dataset.row!), parseInt(cell.dataset.col!), e.clientX, e.clientY, cell.offsetWidth);
    };
    hmScrollEl.addEventListener("mousemove", onScrollMove);

    // Keyboard nav when the heatmap is focused.
    heatmapEl.addEventListener("keydown", (e: KeyboardEvent) => {
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
        requestAnimationFrame(() => {
            if (destroyed) return;
            renderHeatmap();
            renderNavigator();
            if (!lpHidden) applyLinePlotHeight();
        });
    }

    function syncDark() {
        applyDarkMode(widgetEl, isDarkMode(), popupEl);
    }

    function emitStateChange() {
        emit("stateChange", getState());
    }

    renderAll();
    scrollToBottom(); // default view: last prompt tokens
    syncDark();

    // Re-fit columns/cells when the host resizes (both modes — Jupyter cell
    // resize and workbench panel resize). Observe the HOST container, not
    // the card: in fill mode the card width is pinned to the host in px, so
    // observing the card would never see the host's resize.
    let resizeRaf = 0;
    let lastObservedW = (container as HTMLElement)?.clientWidth ?? 0;
    let lastObservedH = (container as HTMLElement)?.clientHeight ?? 0;
    const resizeObserver = new ResizeObserver(() => {
        const w = (container as HTMLElement)?.clientWidth ?? 0;
        const h = (container as HTMLElement)?.clientHeight ?? 0;
        // React to width (column fit) and height (fill-mode row stretch +
        // line-plot proportion). Equality guard makes content mode converge.
        if (w === lastObservedW && h === lastObservedH) return;
        lastObservedW = w;
        lastObservedH = h;
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            if (destroyed) return;
            renderHeatmap();
            if (!lpHidden) applyLinePlotHeight();
        });
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
    // Full serializable UI state — enough to restore the heatmap exactly
    // (appearance, layer window, selection, and pinned trajectories) so it
    // survives a reload when the host saves this and feeds it back as
    // uiState. Pins map to single-token pinnedGroups for type compatibility.
    function getState(): LogitLensUIState {
        return {
            ramp: state.ramp,
            showGrid: state.showGrid,
            dimLowProb: state.dimLow,
            selectedRow: state.selectedRow,
            selectedLayer: state.selectedLayerIdx,
            viewStart: state.viewStart,
            viewSize: state.viewSize,
            colorIndex: state.colorIndex,
            pinnedGroups: state.pinned.map((p) => ({ tokens: [p.token], color: p.color })),
            pinnedRows: state.pinnedRows.map((pos) => ({ pos, line: lineStyleForRow(pos).name })),
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
            if (s.selectedLayer !== undefined) state.selectedLayerIdx = s.selectedLayer;
            if (s.viewStart !== undefined) state.viewStart = s.viewStart;
            if (s.viewSize !== undefined) state.viewSize = s.viewSize;
            if (s.colorIndex !== undefined) state.colorIndex = s.colorIndex;
            if (s.pinnedGroups !== undefined) state.pinned = pinsFromGroups(s.pinnedGroups);
            if (s.pinnedRows !== undefined) {
                state.pinnedRows = s.pinnedRows.map((r) => r.pos).filter((p) => typeof p === "number");
            }
            if (s.darkMode !== undefined) state.darkModeOverride = s.darkMode;
            recomputeDerived(); // clamp the restored layer window to the data
            syncDark();
            renderAll();
        },
        setData: (data: LogitLensData) => {
            dataResult = normalizeData(data);
            widgetData = dataResult.normalized;
            v2Data = dataResult.v2Data;
            // New data → drop selection, pinned tokens and pinned rows (they
            // reference the old prompt's positions/tokens).
            state.selectedRow = null;
            state.selectedLayerIdx = null;
            state.pinned = [];
            state.pinnedRows = [];
            state.colorIndex = 0;
            recomputeDerived();
            shownLayers = [];
            hmCore.setData(buildHeatmapData()); // new prompt → new rows/columns
            renderAll();
            scrollToBottom(); // new data → show the last prompt tokens
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
            destroyed = true; // stop any pending rAF callbacks touching the DOM
            cleanupTheme();
            resizeObserver?.disconnect();
            removeOverlay();
            popupEl.remove();
            if (linePlot) { linePlot.destroy(); linePlot = null; }
            hmScrollEl.removeEventListener("mousemove", onScrollMove);
            hmCore?.destroy();
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
