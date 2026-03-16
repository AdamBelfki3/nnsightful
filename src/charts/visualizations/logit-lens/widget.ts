/**
 * LogitLens Widget Engine
 *
 * This module contains the full widget creation logic, adapted from the original
 * logit-lens-widget.js IIFE into an ES module export. The rendering and interaction
 * logic is preserved as-is to maintain behavioral fidelity.
 *
 * The original closure-based architecture is maintained internally because:
 * - The table rendering, chart SVG, popup, menu, and resize handlers are deeply
 *   intertwined through shared mutable state
 * - Extracting into separate modules would risk breaking the complex interactions
 * - The extracted utility modules (normalize, styles, colors, utils, state) handle
 *   the clearly separable concerns
 *
 * This file is intentionally large (~2600 lines) as a faithful port. Further
 * modularization can happen incrementally after verification.
 */

import type { LogitLensData, LogitLensUIState, LogitLensWidgetInterface } from "../../types/logit-lens";
import type { LinePlotLine } from "../../types/line-plot";
import { normalizeData } from "./normalize";
import { generateUid, escapeHtml, visualizeSpaces, hasSimilarTokensInList } from "./utils";
import { PALETTE, LINE_STYLES, probToColor } from "./colors";
import { injectStyles, applyDarkMode } from "./styles";
import { createInitialState, emitEvent, addEventListener, removeEventListener, type WidgetState } from "./state";
import { LinePlotCore } from "../../core/line-plot";

interface CreateWidgetResult {
    widget: LogitLensWidgetInterface;
    styleEl: HTMLStyleElement;
}

export function createWidget(
    containerArg: HTMLElement | string,
    inputData: LogitLensData,
    uiState?: Partial<LogitLensUIState>,
): CreateWidgetResult | null {
    const uid = generateUid();
    let container: HTMLElement | null;

    if (typeof containerArg === "string") {
        container = document.querySelector(containerArg);
    } else if (containerArg instanceof Element) {
        container = containerArg as HTMLElement;
    } else {
        container = null;
    }

    if (!container) {
        console.error("Container not found:", containerArg);
        return null;
    }

    // Normalize data
    const dataResult = normalizeData(inputData);
    let widgetData = dataResult.normalized;
    let v2Data = dataResult.v2Data;

    // Inject styles
    const styleEl = injectStyles(uid);

    // Inject HTML structure
    container.innerHTML = `
        <div id="${uid}">
            <div class="ll-title" id="${uid}_title">Logit Lens: Top Predictions by Layer</div>
            <div class="table-wrapper">
                <table class="ll-table" id="${uid}_table"></table>
                <div class="resize-handle-bottom" id="${uid}_resize_bottom"></div>
                <div class="resize-handle-right" id="${uid}_resize_right"></div>
            </div>
            <div class="resize-hint" id="${uid}_resize_hint">drag column borders to resize</div>
            <div class="chart-container" id="${uid}_chart_container">
                <div id="${uid}_chart_div" style="width:100%;height:100%;min-height:120px;"></div>
            </div>
            <div class="popup" id="${uid}_popup">
                <span class="popup-close" id="${uid}_popup_close">&times;</span>
                <div class="popup-header">
                    Layer <span id="${uid}_popup_layer"></span>, Position <span id="${uid}_popup_pos"></span>
                </div>
                <div id="${uid}_popup_content"></div>
            </div>
            <input type="color" id="${uid}_color_picker" style="position: absolute; opacity: 0; pointer-events: none;">
            <div class="color-menu" id="${uid}_color_menu"></div>
        </div>
    `;

    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    const nLayers = widgetData.layers.length;
    const nPositions = widgetData.tokens.length;
    const defaultNextToken = widgetData.cells[nPositions - 1][nLayers - 1].token;
    const colors = PALETTE;
    const lineStyles = LINE_STYLES;

    let maxEntropy = 0;
    if (v2Data?.entropy) {
        for (const layer of v2Data.entropy) {
            for (const val of layer) {
                if (val > maxEntropy) maxEntropy = val;
            }
        }
    }
    maxEntropy = Math.max(maxEntropy, 1.0);

    const minChartHeight = 60;
    const maxChartHeight = 400;
    const minCellWidth = 10;
    const maxCellWidth = 200;

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    const state = createInitialState(uiState, nLayers, nPositions, defaultNextToken);

    // LinePlotCore instance (created lazily after DOM is ready)
    let linePlot: LinePlotCore | null = null;

    // ═══════════════════════════════════════════════════════════════
    // DOM HELPERS
    // ═══════════════════════════════════════════════════════════════
    const dom = {
        widget: () => document.getElementById(uid)!,
        table: () => document.getElementById(uid + "_table")!,
        chartDiv: () => document.getElementById(uid + "_chart_div")!,
        popup: () => document.getElementById(uid + "_popup")!,
        popupClose: () => document.getElementById(uid + "_popup_close")!,
        popupLayer: () => document.getElementById(uid + "_popup_layer")!,
        popupPos: () => document.getElementById(uid + "_popup_pos")!,
        popupContent: () => document.getElementById(uid + "_popup_content")!,
        colorMenu: () => document.getElementById(uid + "_color_menu")!,
        colorBtn: () => document.getElementById(uid + "_color_btn"),
        colorPicker: () => document.getElementById(uid + "_color_picker") as HTMLInputElement,
        title: () => document.getElementById(uid + "_title")!,
        titleText: () => document.getElementById(uid + "_title_text"),
        overlay: () => document.getElementById(uid + "_overlay"),
        resizeHint: () => document.getElementById(uid + "_resize_hint")!,
        resizeBottom: () => document.getElementById(uid + "_resize_bottom")!,
        resizeRight: () => document.getElementById(uid + "_resize_right")!,
        chartContainer: () => document.getElementById(uid + "_chart_container")!,
        tableWrapper: () => document.querySelector("#" + uid + " .table-wrapper") as HTMLElement | null,
    };

    // ═══════════════════════════════════════════════════════════════
    // DATA CAPABILITY DETECTION
    // ═══════════════════════════════════════════════════════════════
    function hasEntropyData(): boolean {
        return !!v2Data && Array.isArray(v2Data.entropy) && v2Data.entropy.length > 0;
    }

    function hasRankData(): boolean {
        if (!v2Data?.tracked) return false;
        for (const trackedAtPos of v2Data.tracked) {
            for (const token in trackedAtPos) {
                const data = trackedAtPos[token];
                if (data && typeof data === "object" && Array.isArray((data as any).rank)) {
                    return true;
                }
            }
        }
        return false;
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    function getContentFontSizePx(): number {
        const widgetEl = dom.widget();
        if (!widgetEl) return 14;
        const style = getComputedStyle(widgetEl);
        const sizeStr = style.getPropertyValue("--ll-content-size").trim() || "14px";
        const match = sizeStr.match(/^([\d.]+)px$/);
        return match ? parseFloat(match[1]) : 14;
    }

    function getDefaultChartHeight(): number {
        const fontSize = getContentFontSizePx();
        const topMargin = Math.max(10, fontSize * 1.2);
        const bottomMargin = Math.max(25, fontSize * 1.5);
        const table = dom.table();
        let rowHeight = fontSize * 2;
        if (table) {
            const rows = table.querySelectorAll("tr");
            if (rows.length >= 2) {
                rowHeight = rows[1].getBoundingClientRect().height || rowHeight;
            }
        }
        return topMargin + rowHeight * 6 + bottomMargin;
    }

    function getActualChartHeight(): number {
        return state.chartHeight !== null ? state.chartHeight : getDefaultChartHeight();
    }

    function isDarkMode(): boolean {
        if (state.darkModeOverride !== null) return state.darkModeOverride;
        return getComputedStyle(container!).colorScheme === "dark";
    }

    function getNextColor(): string {
        const c = colors[state.colorIndex % colors.length];
        state.colorIndex++;
        return c;
    }

    function getColorForToken(token: string): string | null {
        for (const group of state.pinnedGroups) {
            if (group.tokens.indexOf(token) >= 0) return group.color;
        }
        return null;
    }

    function findGroupForToken(token: string): number {
        for (let i = 0; i < state.pinnedGroups.length; i++) {
            if (state.pinnedGroups[i].tokens.indexOf(token) >= 0) return i;
        }
        return -1;
    }

    function getGroupLabel(group: { tokens: string[] }): string {
        return group.tokens.map((t) => visualizeSpaces(t)).join("+");
    }

    function getTrajectoryForToken(token: string, pos: number): number[] | null {
        for (let li = 0; li < widgetData.cells[pos].length; li++) {
            const cellData = widgetData.cells[pos][li];
            if (cellData.token === token) return cellData.trajectory;
            for (const item of cellData.topk) {
                if (item.token === token) return item.trajectory;
            }
        }
        return null;
    }

    function isTokenTracked(token: string, pos: number): boolean {
        for (let li = 0; li < widgetData.cells[pos].length; li++) {
            const cellData = widgetData.cells[pos][li];
            if (cellData.token === token) return true;
            for (const item of cellData.topk) {
                if (item.token === token) return true;
            }
        }
        return false;
    }

    function getRankTrajectoryForToken(token: string, pos: number): (number | null)[] | null {
        if (v2Data?.tracked?.[pos]) {
            const tokenData = v2Data.tracked[pos][token] as any;
            if (tokenData && typeof tokenData === "object" && Array.isArray(tokenData.rank)) {
                return tokenData.rank;
            }
        }
        const ranks: (number | null)[] = [];
        for (let li = 0; li < widgetData.cells[pos].length; li++) {
            const cellData = widgetData.cells[pos][li];
            let rank: number | null = null;
            if (cellData.token === token) {
                rank = 1;
            } else {
                for (let ki = 0; ki < cellData.topk.length; ki++) {
                    if (cellData.topk[ki].token === token) {
                        rank = ki + 1;
                        break;
                    }
                }
            }
            ranks.push(rank);
        }
        return ranks.some((r) => r !== null) ? ranks : null;
    }

    function getGroupTrajectory(group: { tokens: string[] }, pos: number): (number | null)[] | null {
        if (state.trajectoryMetric === "rank") {
            const result: (number | null)[] = widgetData.layers.map(() => null);
            let hasAnyData = false;
            for (const tok of group.tokens) {
                const rankTraj = getRankTrajectoryForToken(tok, pos);
                if (rankTraj) {
                    hasAnyData = true;
                    for (let j = 0; j < result.length; j++) {
                        if (rankTraj[j] !== null) {
                            if (result[j] === null || rankTraj[j]! < result[j]!) {
                                result[j] = rankTraj[j];
                            }
                        }
                    }
                }
            }
            return hasAnyData ? result : null;
        }

        const result: number[] = widgetData.layers.map(() => 0);
        let hasAnyData = false;
        for (const tok of group.tokens) {
            const traj = getTrajectoryForToken(tok, pos);
            if (traj) {
                hasAnyData = true;
                for (let j = 0; j < result.length; j++) {
                    result[j] += traj[j];
                }
            }
        }
        return hasAnyData ? result : null;
    }

    function getGroupProbAtLayer(group: { tokens: string[] }, pos: number, layerIdx: number): number {
        let sum = 0;
        for (const tok of group.tokens) {
            const traj = getTrajectoryForToken(tok, pos);
            if (traj) sum += traj[layerIdx] || 0;
        }
        return sum;
    }

    function getWinningGroupAtCell(pos: number, layerIdx: number) {
        const cellData = widgetData.cells[pos][layerIdx];
        let winningProb = cellData.prob;
        let winningGroup: { color: string } | null = null;
        for (const group of state.pinnedGroups) {
            const groupProb = getGroupProbAtLayer(group, pos, layerIdx);
            if (groupProb > winningProb) {
                winningProb = groupProb;
                winningGroup = group;
            }
        }
        return winningGroup;
    }

    function findPinnedRow(pos: number): number {
        for (let i = 0; i < state.pinnedRows.length; i++) {
            if (state.pinnedRows[i].pos === pos) return i;
        }
        return -1;
    }

    function getLineStyleForRow(pos: number) {
        const idx = findPinnedRow(pos);
        if (idx >= 0) return state.pinnedRows[idx].lineStyle;
        return lineStyles[0];
    }

    function allPinnedGroupsBelowThreshold(pos: number, threshold: number): boolean {
        if (state.pinnedGroups.length === 0) return true;
        for (const group of state.pinnedGroups) {
            const traj = getGroupTrajectory(group, pos);
            if (traj) {
                const maxProb = Math.max(...traj.filter((v): v is number => v !== null));
                if (maxProb >= threshold) return false;
            }
        }
        return true;
    }

    function findHighestProbToken(pos: number, minLayer: number, minProb: number): string | null {
        let bestToken: string | null = null;
        let bestProb = 0;
        for (let li = minLayer; li < widgetData.cells[pos].length; li++) {
            const cellData = widgetData.cells[pos][li];
            if (cellData.prob > bestProb) {
                bestProb = cellData.prob;
                bestToken = cellData.token;
            }
            for (const item of cellData.topk) {
                if (item.prob > bestProb) {
                    bestProb = item.prob;
                    bestToken = item.token;
                }
            }
        }
        return bestProb >= minProb ? bestToken : null;
    }

    function togglePinnedRow(pos: number): boolean {
        const idx = findPinnedRow(pos);
        if (idx >= 0) {
            state.pinnedRows.splice(idx, 1);
            return false;
        }
        if (allPinnedGroupsBelowThreshold(pos, 0.01)) {
            const bestToken = findHighestProbToken(pos, 2, 0.05);
            if (bestToken && findGroupForToken(bestToken) < 0) {
                state.pinnedGroups.push({ color: getNextColor(), tokens: [bestToken] });
                state.lastPinnedGroupIndex = state.pinnedGroups.length - 1;
            }
        }
        const styleIdx = state.pinnedRows.length % lineStyles.length;
        state.pinnedRows.push({ pos, lineStyle: lineStyles[styleIdx] });
        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════

    function render() {
        buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows, state.currentStride);
    }

    function computeVisibleLayers(cellWidth: number, containerWidth: number) {
        const availableWidth = containerWidth - state.inputTokenWidth - 1;
        const maxCols = Math.max(1, Math.floor(availableWidth / cellWidth));
        if (maxCols >= nLayers) {
            return { stride: 1, indices: widgetData.layers.map((_: number, i: number) => i) };
        }
        const stride = maxCols > 1 ? Math.max(1, Math.floor((nLayers - 1) / (maxCols - 1))) : nLayers;
        const indices: number[] = [];
        for (let i = nLayers - 1; i >= 0; i -= stride) indices.unshift(i);
        while (indices.length > maxCols) indices.shift();
        return { stride, indices };
    }

    function updateChartDimensions(): void {
        const table = dom.table();
        const tableWidth = table.offsetWidth;
        const chartContainer = dom.chartContainer();
        // Match chart container width to table width
        chartContainer.style.width = tableWidth + "px";
    }

    // Stable reference for current positions used by onLineRemoved
    let currentPositionsToShow: number[] = [];

    // Stable onLineRemoved callback — only created once, references currentPositionsToShow
    const stableOnLineRemoved = (lineIdx: number) => {
        // Map lineIdx back to group
        let idx = 0;
        for (let pi = 0; pi < currentPositionsToShow.length; pi++) {
            for (let gi = 0; gi < state.pinnedGroups.length; gi++) {
                const traj = getGroupTrajectory(state.pinnedGroups[gi], currentPositionsToShow[pi]);
                if (!traj) continue;
                if (idx === lineIdx) {
                    state.pinnedGroups.splice(gi, 1);
                    if (state.lastPinnedGroupIndex >= state.pinnedGroups.length) {
                        state.lastPinnedGroupIndex = state.pinnedGroups.length - 1;
                    }
                    buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
                    return;
                }
                idx++;
            }
        }
    };

    /**
     * Update LinePlotCore with current trajectory data.
     * Replaces the old SVG-based drawAllTrajectories.
     */
    function updateChart(
        hoverTrajectory: number[] | null,
        hoverColor: string | null,
        hoverLabel: string | null,
        pos: number,
    ): void {
        updateChartDimensions();

        const isRankMode = state.trajectoryMetric === "rank";
        currentPositionsToShow = state.pinnedRows.length > 0
            ? state.pinnedRows.map((pr) => pr.pos)
            : [pos];

        // Build richLines from pinned groups
        const richLines: LinePlotLine[] = [];
        currentPositionsToShow.forEach((showPos) => {
            const lineStyle = getLineStyleForRow(showPos);
            state.pinnedGroups.forEach((group) => {
                const traj = getGroupTrajectory(group, showPos);
                if (!traj) return;
                const values = traj.map(v => v === null ? null : v) as (number | null)[];
                let label = getGroupLabel(group);
                if (state.pinnedRows.length > 1) {
                    label += " (" + visualizeSpaces(widgetData.tokens[showPos]) + ")";
                }
                richLines.push({
                    values,
                    label,
                    color: group.color,
                    dashPattern: lineStyle.dash || undefined,
                    removable: true,
                });
            });
        });

        // Build xLabels from layer indices
        const xLabels = widgetData.layers.map((l: number) => l);

        const plotData = {
            lines: [] as number[][],
            richLines,
            xLabels,
        };

        const plotOptions: Record<string, unknown> = {
            darkMode: isDarkMode(),
            mode: isRankMode ? "rank" as const : "probability" as const,
            invertYAxis: isRankMode,
            autoScale: true,
            legendPosition: "right" as const,
            showDataPoints: true,
            xRangeStart: state.plotMinLayer,
            xAxisLabel: "Layer",
            yAxisLabel: isRankMode ? "Rank" : "Probability",
            transparentBackground: true,
        };

        if (!linePlot) {
            const chartDiv = dom.chartDiv();
            linePlot = new LinePlotCore(chartDiv, plotData, { ...plotOptions, onLineRemoved: stableOnLineRemoved } as any);
        } else {
            linePlot.setData(plotData);
            linePlot.setOptions(plotOptions as any);
        }

        // Set overlay for hover trajectory
        if (hoverTrajectory && hoverLabel) {
            linePlot.setOverlay({
                values: hoverTrajectory,
                label: hoverLabel,
                color: hoverColor || "#999",
                dashPattern: "4,2",
                isOverlay: true,
            });
        } else {
            linePlot.setOverlay(null);
        }
    }

    function buildTable(cellWidth: number, visibleLayerIndices: number[], maxRows: number | null, stride?: number) {
        state.currentVisibleIndices = visibleLayerIndices;
        state.currentMaxRows = maxRows;
        if (stride !== undefined) state.currentStride = stride;
        const table = dom.table();
        let html = "";
        const totalTokens = widgetData.tokens.length;
        let visiblePositions: number[];

        if (maxRows === null || maxRows >= totalTokens) {
            visiblePositions = widgetData.tokens.map((_: string, i: number) => i);
        } else {
            const pinnedPositions = state.pinnedRows.map((pr) => pr.pos);
            const pinnedSet = new Set(pinnedPositions);
            if (pinnedPositions.length >= maxRows) {
                visiblePositions = pinnedPositions.slice();
                if (!pinnedSet.has(totalTokens - 1)) visiblePositions.push(totalTokens - 1);
            } else {
                const remainingSlots = maxRows - pinnedPositions.length;
                const unpinnedPositions: number[] = [];
                for (let i = totalTokens - 1; i >= 0 && unpinnedPositions.length < remainingSlots; i--) {
                    if (!pinnedSet.has(i)) unpinnedPositions.push(i);
                }
                unpinnedPositions.reverse();
                visiblePositions = [];
                for (let i = 0; i < totalTokens; i++) {
                    if (pinnedSet.has(i) || unpinnedPositions.indexOf(i) >= 0) {
                        visiblePositions.push(i);
                    }
                }
            }
        }

        html += "<colgroup>";
        html += '<col style="width:' + state.inputTokenWidth + 'px;">';
        visibleLayerIndices.forEach(() => {
            html += '<col style="width:' + cellWidth + 'px;">';
        });
        html += "</colgroup>";

        const halfwayCol = Math.floor(visibleLayerIndices.length / 2);
        const defaultBaseColor = "#8844ff";
        const defaultNextColor = "#cc6622";

        function getColorForMode(mode: string): string {
            if (mode === "top") return state.heatmapBaseColor || defaultBaseColor;
            if (mode === "entropy") return "#9c27b0";
            const groupColor = getColorForToken(mode);
            if (groupColor) return groupColor;
            return state.heatmapNextColor || defaultNextColor;
        }

        function getProbForMode(mode: string, cellData: any, pos: number, li: number): number {
            if (mode === "top") return cellData.prob;
            if (mode === "entropy") {
                if (v2Data?.entropy?.[li]) return v2Data.entropy[li][pos] / maxEntropy;
                return 0;
            }
            const found = cellData.topk.find((t: any) => t.token === mode);
            return found ? found.prob : 0;
        }

        visiblePositions.forEach((pos, rowIdx) => {
            const tok = widgetData.tokens[pos];
            const isFirstVisibleRow = rowIdx === 0;
            const isPinnedRow = findPinnedRow(pos) >= 0;
            const rowLineStyle = getLineStyleForRow(pos);

            html += "<tr>";
            let inputStyle = "width:" + state.inputTokenWidth + "px; max-width:" + state.inputTokenWidth + "px;";
            if (isPinnedRow) {
                inputStyle += isDarkMode() ? " background: #4a4a00; color: #fff;" : " background: #fff59d;";
            }
            html += '<td class="input-token' + (isPinnedRow ? " pinned-row" : "") + '" data-pos="' + pos + '" title="' + escapeHtml(tok) + '" style="' + inputStyle + '">';

            if (isPinnedRow) {
                const miniScale = getContentFontSizePx() / 10;
                const miniWidth = 20 * miniScale;
                const miniHeight = 10 * miniScale;
                const miniStroke = 1.5 * miniScale;
                html += '<svg width="' + miniWidth + '" height="' + miniHeight + '" style="vertical-align: middle; margin-right: 2px;">';
                html += '<line x1="0" y1="' + miniHeight / 2 + '" x2="' + miniWidth + '" y2="' + miniHeight / 2 + '" stroke="' + (isDarkMode() ? "#ccc" : "#333") + '" stroke-width="' + miniStroke + '"';
                if (rowLineStyle.dash) {
                    const scaledDash = rowLineStyle.dash.split(",").map((v) => parseFloat(v) * miniScale).join(",");
                    html += ' stroke-dasharray="' + scaledDash + '"';
                }
                html += "/></svg>";
            }

            html += escapeHtml(tok);
            if (isFirstVisibleRow) html += '<div class="resize-handle-input" data-col="-1"></div>';
            html += "</td>";

            visibleLayerIndices.forEach((li, colIdx) => {
                const cellData = widgetData.cells[pos][li];
                let cellProb = 0;
                let winningColor: string | null = null;
                let winningMode: string | null = null;

                if (state.colorModes.length > 0) {
                    state.colorModes.forEach((mode) => {
                        const modeProb = getProbForMode(mode, cellData, pos, li);
                        const wins = winningMode === "top" ? modeProb >= cellProb
                            : mode === "top" ? modeProb > cellProb
                            : modeProb >= cellProb;
                        if (wins) {
                            cellProb = modeProb;
                            winningColor = getColorForMode(mode);
                            winningMode = mode;
                        }
                    });
                }

                let color: string;
                let textColor: string;
                if (!state.showHeatmap || state.colorModes.length === 0) {
                    color = isDarkMode() ? "#1e1e1e" : "#fff";
                    textColor = isDarkMode() ? "#e0e0e0" : "#333";
                } else {
                    color = probToColor(cellProb, winningColor, isDarkMode());
                    textColor = isDarkMode()
                        ? (cellProb < 0.7 ? "#e0e0e0" : "#fff")
                        : (cellProb < 0.5 ? "#333" : "#fff");
                }

                let pinnedColor = getColorForToken(cellData.token);
                if (!pinnedColor) {
                    const wg = getWinningGroupAtCell(pos, li);
                    if (wg) pinnedColor = wg.color;
                }
                const pinnedStyle = pinnedColor ? "box-shadow: inset 0 0 0 2px " + pinnedColor + ";" : "";
                const isMainPrediction = rowIdx === visiblePositions.length - 1 && colIdx === visibleLayerIndices.length - 1;
                const boldStyle = isMainPrediction ? "font-weight: bold;" : "";
                const hasHandle = isFirstVisibleRow && colIdx < halfwayCol;

                html += '<td class="pred-cell' + (pinnedColor ? " pinned" : "") + '" data-pos="' + pos + '" data-li="' + li + '" data-col="' + colIdx + '" style="background:' + color + "; color:" + textColor + "; width:" + cellWidth + "px; max-width:" + cellWidth + "px; " + pinnedStyle + boldStyle + '">' + escapeHtml(cellData.token);
                if (hasHandle) html += '<div class="resize-handle" data-col="' + colIdx + '"></div>';
                html += "</td>";
            });
            html += "</tr>";
        });

        html += "<tr>";
        html += '<th class="corner-hdr" style="width:' + state.inputTokenWidth + "px; max-width:" + state.inputTokenWidth + 'px;">Layer<div class="resize-handle-input" data-col="-1"></div></th>';
        visibleLayerIndices.forEach((li, colIdx) => {
            const hasHandle = colIdx < halfwayCol;
            html += '<th class="layer-hdr" style="width:' + cellWidth + "px; max-width:" + cellWidth + 'px;">' + widgetData.layers[li];
            if (hasHandle) html += '<div class="resize-handle" data-col="' + colIdx + '"></div>';
            html += "</th>";
        });
        html += "</tr>";

        table.innerHTML = html;
        attachCellListeners();
        attachResizeListeners();

        updateChart(null, null, null, state.currentHoverPos);
        updateTitle();

        const hint = dom.resizeHint();
        const hintMain = state.currentStride > 1
            ? "showing every " + state.currentStride + " layers ending at " + (nLayers - 1)
            : "showing all " + nLayers + " layers";
        hint.innerHTML = '<span class="resize-hint-main">' + hintMain + '</span><span class="resize-hint-extra"> (drag column borders to adjust)</span>';
        hint.addEventListener("mouseenter", function () {
            const extra = hint.querySelector(".resize-hint-extra") as HTMLElement;
            if (extra) extra.style.display = "inline";
            dom.widget().classList.add("show-all-handles");
        });
        hint.addEventListener("mouseleave", function () {
            const extra = hint.querySelector(".resize-hint-extra") as HTMLElement;
            if (extra) extra.style.display = "none";
            dom.widget().classList.remove("show-all-handles");
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // TITLE AND MENU
    // ═══════════════════════════════════════════════════════════════

    function updateTitle() {
        const titleEl = dom.title();
        if (state.maxTableWidth !== null) {
            titleEl.style.maxWidth = state.maxTableWidth + "px";
        } else {
            titleEl.style.maxWidth = "";
        }
        titleEl.style.whiteSpace = "normal";

        let displayLabel = "";
        let pinnedColor: string | null = null;
        let useColoredBy = true;

        if (state.colorModes.length === 0) {
            displayLabel = "";
            useColoredBy = false;
        } else if (state.colorModes.length === 1) {
            const mode = state.colorModes[0];
            if (mode === "top") {
                displayLabel = "top prediction";
            } else {
                const groupIdx = findGroupForToken(mode);
                if (groupIdx >= 0) {
                    displayLabel = getGroupLabel(state.pinnedGroups[groupIdx]);
                    pinnedColor = state.pinnedGroups[groupIdx].color;
                } else {
                    displayLabel = visualizeSpaces(mode);
                }
                const lastPos = widgetData.tokens.length - 1;
                const lastLayerIdx = state.currentVisibleIndices[state.currentVisibleIndices.length - 1];
                const topToken = widgetData.cells[lastPos][lastLayerIdx].token;
                if (mode === topToken) {
                    const tokens = widgetData.tokens.slice();
                    const toks = (tokens.length > 0 && /^<[^>]+>$/.test(tokens[0].trim())) ? tokens.slice(1) : tokens;
                    if (toks.length >= 3) {
                        const suffix = toks.slice(-3).join("");
                        if (suffix.length > 0 && state.customTitle.endsWith(suffix)) useColoredBy = false;
                    }
                }
            }
        } else {
            const labels = state.colorModes.map((mode) => {
                if (mode === "top") return "top prediction";
                const groupIdx = findGroupForToken(mode);
                if (groupIdx >= 0) return getGroupLabel(state.pinnedGroups[groupIdx]);
                return visualizeSpaces(mode);
            });
            displayLabel = labels.join(" and ");
        }

        let btnStyle = pinnedColor ? "background: " + pinnedColor + "22;" : "";
        if (state.colorModes.length === 0) {
            btnStyle = "background: transparent; border: none; color: transparent; cursor: pointer;";
            displayLabel = "colored by None";
        }

        const labelPrefix = useColoredBy ? "colored by " : "";
        const labelContent = "(" + labelPrefix + escapeHtml(displayLabel) + ")";
        titleEl.innerHTML = '<span class="ll-title-text" id="' + uid + '_title_text" style="cursor: text;">' + escapeHtml(state.customTitle) + "</span> " + '<span class="color-mode-btn" id="' + uid + '_color_btn" style="' + btnStyle + '">' + labelContent + "</span>";
        dom.colorBtn()?.addEventListener("click", showColorModeMenu);
        dom.titleText()?.addEventListener("click", startTitleEdit);
    }

    function startTitleEdit(e: Event) {
        e.stopPropagation();
        const titleTextEl = dom.titleText();
        if (!titleTextEl) return;
        const currentText = state.customTitle;
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.style.cssText = "font-size: var(--ll-title-size, 20px); font-weight: 600; font-family: inherit; border: 1px solid #2196F3; border-radius: 3px; padding: 1px 4px; outline: none; width: " + Math.max(200, titleTextEl.offsetWidth) + "px;" + (isDarkMode() ? " background: #1e1e1e; color: #e0e0e0;" : "");
        titleTextEl.innerHTML = "";
        titleTextEl.appendChild(input);
        input.focus();
        input.select();

        function finishEdit() {
            const newTitle = input.value.trim();
            if (newTitle) {
                state.customTitle = newTitle;
            } else {
                const tokens = widgetData.tokens.slice();
                const toks = (tokens.length > 0 && /^<[^>]+>$/.test(tokens[0].trim())) ? tokens.slice(1) : tokens;
                state.customTitle = toks.join("");
            }
            updateTitle();
        }

        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter") { ev.preventDefault(); input.blur(); }
            else if (ev.key === "Escape") { ev.preventDefault(); input.value = state.customTitle; input.blur(); }
        });
    }

    function showColorModeMenu(e: Event) {
        e.stopPropagation();
        closePopup();
        state.colorPickerTarget = null;
        const menu = dom.colorMenu();
        if (menu.classList.contains("visible")) { menu.classList.remove("visible"); return; }
        const btn = e.target as HTMLElement;
        const rect = btn.getBoundingClientRect();
        const containerRect = dom.widget().getBoundingClientRect();
        menu.style.left = (rect.left - containerRect.left) + "px";
        menu.style.top = (rect.bottom - containerRect.top + 5) + "px";

        const lastPos = widgetData.tokens.length - 1;
        const lastLayerIdx = state.currentVisibleIndices[state.currentVisibleIndices.length - 1];
        const topToken = widgetData.cells[lastPos][lastLayerIdx].token;

        interface MenuItem { mode: string; label: string; color: string; colorType: string; groupIdx: number | null; borderColor?: string }
        const menuItems: MenuItem[] = [];
        menuItems.push({ mode: "top", label: "top prediction", color: state.heatmapBaseColor || "#8844ff", colorType: "heatmap", groupIdx: null });
        if (hasEntropyData()) {
            menuItems.push({ mode: "entropy", label: "entropy (uncertainty)", color: "#9c27b0", colorType: "entropy", groupIdx: null });
        }
        if (findGroupForToken(topToken) < 0) {
            menuItems.push({ mode: topToken, label: topToken, color: state.heatmapNextColor || "#cc6622", colorType: "heatmapNext", groupIdx: null });
        }
        state.pinnedGroups.forEach((group, idx) => {
            menuItems.push({ mode: group.tokens[0], label: getGroupLabel(group), color: group.color, colorType: "trajectory", groupIdx: idx, borderColor: group.color });
        });

        let html = "";
        menuItems.forEach((item, idx) => {
            const isActive = state.colorModes.indexOf(item.mode) >= 0;
            const borderStyle = item.borderColor ? "border-left: 3px solid " + item.borderColor + ";" : "";
            const checkmark = isActive ? '<span style="padding: 8px 10px 8px 20px; font-weight: bold;">\u2713</span>' : '<span style="padding: 8px 10px 8px 20px; visibility: hidden;">\u2713</span>';
            html += '<div class="color-menu-item" data-mode="' + escapeHtml(item.mode) + '" data-idx="' + idx + '" style="' + borderStyle + '">';
            html += checkmark + '<span class="color-menu-label">' + escapeHtml(item.label) + "</span>";
            html += '<input type="color" class="color-swatch" value="' + item.color + '" data-idx="' + idx + '">';
            html += "</div>";
        });

        const noneActive = state.colorModes.length === 0;
        const noneCheck = noneActive ? '<span style="padding: 8px 10px 8px 20px; font-weight: bold;">\u2713</span>' : '<span style="padding: 8px 10px 8px 20px; visibility: hidden;">\u2713</span>';
        html += '<div class="color-menu-item" data-mode="none" style="border-top: 1px solid #eee; margin-top: 4px;">' + noneCheck + '<span class="color-menu-label">None</span></div>';

        menu.innerHTML = html;
        menu.classList.add("visible");
        showOverlay(closeColorModeMenu);

        menu.querySelectorAll<HTMLElement>(".color-menu-item").forEach((item) => {
            item.addEventListener("click", function (ev: MouseEvent) {
                if ((ev.target as HTMLElement).classList.contains("color-swatch")) return;
                ev.stopPropagation();
                const mode = item.dataset.mode!;
                const isModifierClick = ev.shiftKey || ev.ctrlKey || ev.metaKey;

                if (isModifierClick && mode !== "none") {
                    const idx = state.colorModes.indexOf(mode);
                    if (idx >= 0) state.colorModes.splice(idx, 1);
                    else state.colorModes.push(mode);
                    buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
                    return;
                }

                item.style.animation = "menuBlink-" + uid + " 0.2s ease-in-out";
                setTimeout(function () {
                    if (mode === "none") state.colorModes = [];
                    else state.colorModes = [mode];
                    menu.classList.remove("visible");
                    buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
                }, 200);
            });
        });

        menu.querySelectorAll<HTMLInputElement>(".color-swatch").forEach((swatch) => {
            const idx = parseInt(swatch.dataset.idx!);
            const itemData = menuItems[idx];
            const menuItem = swatch.closest(".color-menu-item") as HTMLElement;
            swatch.addEventListener("click", (ev) => { ev.stopPropagation(); menuItem?.classList.add("picking"); });
            swatch.addEventListener("input", (ev) => {
                ev.stopPropagation();
                const newColor = swatch.value;
                if (itemData.colorType === "heatmap") state.heatmapBaseColor = newColor;
                else if (itemData.colorType === "heatmapNext") state.heatmapNextColor = newColor;
                else if (itemData.colorType === "trajectory" && itemData.groupIdx !== null) {
                    state.pinnedGroups[itemData.groupIdx].color = newColor;
                    if (menuItem) menuItem.style.borderLeftColor = newColor;
                }
                buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
            });
            swatch.addEventListener("change", () => { menuItem?.classList.remove("picking"); });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // CELL INTERACTION + POPUP
    // ═══════════════════════════════════════════════════════════════

    function attachCellListeners() {
        document.querySelectorAll<HTMLElement>("#" + uid + " .pred-cell, #" + uid + " .input-token").forEach((cell) => {
            const pos = parseInt(cell.dataset.pos!);
            if (isNaN(pos)) return;
            const isInputToken = cell.classList.contains("input-token");

            cell.addEventListener("mouseenter", function () {
                state.currentHoverPos = pos;
                if (isInputToken) {
                    const bestToken = findHighestProbToken(pos, 2, 0.05);
                    if (bestToken && findGroupForToken(bestToken) < 0) {
                        const traj = getTrajectoryForToken(bestToken, pos);
                        updateChart(traj, "#999", bestToken, pos);
                    } else {
                        updateChart(null, null, null, pos);
                    }
                } else {
                    const li = cell.dataset.li ? parseInt(cell.dataset.li) : 0;
                    const cellData = widgetData.cells[pos][li] || widgetData.cells[pos][0];
                    updateChart(cellData.trajectory, "#999", cellData.token, pos);
                }
            });

            cell.addEventListener("mouseleave", function () {
                updateChart(null, null, null, state.currentHoverPos);
            });
        });

        document.querySelectorAll<HTMLElement>("#" + uid + " .input-token").forEach((cell) => {
            const pos = parseInt(cell.dataset.pos!);
            if (isNaN(pos)) return;
            cell.addEventListener("click", function (e) {
                e.stopPropagation();
                closePopup();
                dom.colorMenu().classList.remove("visible");
                togglePinnedRow(pos);
                buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
            });
        });

        document.querySelectorAll<HTMLElement>("#" + uid + " .pred-cell").forEach((cell) => {
            const pos = parseInt(cell.dataset.pos!);
            const li = parseInt(cell.dataset.li!);
            const cellData = widgetData.cells[pos][li];

            cell.addEventListener("click", function (e) {
                e.stopPropagation();
                if (e.shiftKey) {
                    togglePinnedTrajectory(cellData.token, true);
                    buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
                    return;
                }
                const colorMenu = dom.colorMenu();
                if (colorMenu?.classList.contains("visible")) { colorMenu.classList.remove("visible"); return; }
                if (state.openPopupCell) { closePopup(); return; }
                document.querySelectorAll("#" + uid + " .pred-cell.selected").forEach((c) => c.classList.remove("selected"));
                cell.classList.add("selected");
                showPopup(cell, pos, li, cellData);
            });
        });

        dom.popupClose().addEventListener("click", closePopup);
    }

    function closePopup() {
        const popup = dom.popup();
        if (popup) popup.classList.remove("visible");
        document.querySelectorAll("#" + uid + " .pred-cell.selected").forEach((c) => c.classList.remove("selected"));
        state.openPopupCell = null;
        removeOverlay();
    }

    function closeColorModeMenu() {
        const menu = dom.colorMenu();
        if (menu) menu.classList.remove("visible");
        removeOverlay();
    }

    function showOverlay(onDismiss: () => void) {
        removeOverlay();
        const overlay = document.createElement("div");
        overlay.id = uid + "_overlay";
        overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;";
        overlay.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            e.preventDefault();
            onDismiss();
        });
        document.body.appendChild(overlay);
    }

    function removeOverlay() {
        const overlay = dom.overlay();
        if (overlay) overlay.remove();
    }

    function showPopup(cell: HTMLElement, pos: number, li: number, cellData: any) {
        closeColorModeMenu();
        state.colorPickerTarget = null;
        state.openPopupCell = cell;
        const popup = dom.popup();
        const rect = cell.getBoundingClientRect();
        const containerRect = dom.widget().getBoundingClientRect();
        const gap = 5;
        popup.style.left = (rect.left - containerRect.left + rect.width + gap) + "px";
        popup.style.top = (rect.top - containerRect.top) + "px";

        dom.popupLayer().textContent = String(widgetData.layers[li]);
        dom.popupPos().innerHTML = pos + "<br>Input <code>" + escapeHtml(visualizeSpaces(widgetData.tokens[pos])) + "</code>";

        let contentHtml = "";
        cellData.topk.forEach((item: any, ki: number) => {
            const probPct = (item.prob * 100).toFixed(1);
            const pinnedColor = getColorForToken(item.token);
            const pinnedStyle = pinnedColor ? "background: " + pinnedColor + "22; border-left-color: " + pinnedColor + ";" : "";
            const visualizedToken = visualizeSpaces(item.token);
            const tooltipToken = visualizeSpaces(item.token, true);
            contentHtml += '<div class="topk-item' + (pinnedColor ? " pinned" : "") + '" data-ki="' + ki + '" style="' + pinnedStyle + '" title="' + escapeHtml(tooltipToken) + '">';
            contentHtml += '<span class="topk-token">' + escapeHtml(visualizedToken) + "</span>";
            contentHtml += '<span class="topk-prob">' + probPct + "%</span></div>";
        });

        const firstToken = cellData.topk[0].token;
        const firstIsPinned = findGroupForToken(firstToken) >= 0;
        if (firstIsPinned && hasSimilarTokensInList(cellData.topk, firstToken)) {
            contentHtml += '<div style="font-size: var(--ll-content-size, 14px); font-style: italic; color: #666; margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee;">Shift-click to group tokens</div>';
        }

        dom.popupContent().innerHTML = contentHtml;

        document.querySelectorAll<HTMLElement>("#" + uid + "_popup_content .topk-item").forEach((item) => {
            const ki = parseInt(item.dataset.ki!);
            const tokData = cellData.topk[ki];

            item.addEventListener("mouseenter", function () {
                document.querySelectorAll("#" + uid + "_popup_content .topk-item").forEach((it) => it.classList.remove("active"));
                item.classList.add("active");
                updateChart(tokData.trajectory, "#999", tokData.token, pos);
            });
            item.addEventListener("mouseleave", function () {
                item.classList.remove("active");
                updateChart(null, null, null, pos);
            });
            item.addEventListener("click", function (e) {
                e.stopPropagation();
                const addToGroup = e.shiftKey || e.ctrlKey || e.metaKey;
                togglePinnedTrajectory(tokData.token, addToGroup);
                buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
                const newCell = document.querySelector("#" + uid + " .pred-cell[data-pos='" + pos + "'][data-li='" + li + "']") as HTMLElement;
                if (newCell) { newCell.classList.add("selected"); showPopup(newCell, pos, li, cellData); }
            });
        });

        popup.classList.add("visible");
        const popupRect = popup.getBoundingClientRect();
        if (popupRect.right > window.innerWidth && rect.left - gap - popupRect.width >= 0) {
            popup.style.left = (rect.left - containerRect.left - popupRect.width - gap) + "px";
        }
        showOverlay(closePopup);
        updateChart(cellData.trajectory, "#999", cellData.token, pos);
    }

    function togglePinnedTrajectory(token: string, addToGroup: boolean): boolean {
        const existingGroupIdx = findGroupForToken(token);
        if (addToGroup && state.lastPinnedGroupIndex >= 0 && state.lastPinnedGroupIndex < state.pinnedGroups.length) {
            const lastGroup = state.pinnedGroups[state.lastPinnedGroupIndex];
            if (existingGroupIdx === state.lastPinnedGroupIndex) {
                lastGroup.tokens = lastGroup.tokens.filter((t) => t !== token);
                if (lastGroup.tokens.length === 0) {
                    state.pinnedGroups.splice(state.lastPinnedGroupIndex, 1);
                    state.lastPinnedGroupIndex = state.pinnedGroups.length - 1;
                }
                return false;
            } else if (existingGroupIdx >= 0) {
                state.pinnedGroups[existingGroupIdx].tokens = state.pinnedGroups[existingGroupIdx].tokens.filter((t) => t !== token);
                if (state.pinnedGroups[existingGroupIdx].tokens.length === 0) {
                    state.pinnedGroups.splice(existingGroupIdx, 1);
                    if (state.lastPinnedGroupIndex > existingGroupIdx) state.lastPinnedGroupIndex--;
                }
                lastGroup.tokens.push(token);
                return true;
            } else {
                lastGroup.tokens.push(token);
                return true;
            }
        } else {
            if (existingGroupIdx >= 0) {
                const group = state.pinnedGroups[existingGroupIdx];
                group.tokens = group.tokens.filter((t) => t !== token);
                if (group.tokens.length === 0) {
                    state.pinnedGroups.splice(existingGroupIdx, 1);
                    if (state.lastPinnedGroupIndex >= state.pinnedGroups.length) state.lastPinnedGroupIndex = state.pinnedGroups.length - 1;
                }
                return false;
            } else {
                state.pinnedGroups.push({ color: getNextColor(), tokens: [token] });
                state.lastPinnedGroupIndex = state.pinnedGroups.length - 1;
                return true;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RESIZE HANDLING
    // ═══════════════════════════════════════════════════════════════

    function getContainerWidth(): number {
        const el = dom.widget();
        const actualWidth = el.offsetWidth || 900;
        return state.maxTableWidth !== null ? Math.min(state.maxTableWidth, actualWidth) : actualWidth;
    }

    function getActualContainerWidth(): number {
        return dom.widget().offsetWidth || 900;
    }

    function attachResizeListeners() {
        document.querySelectorAll<HTMLElement>("#" + uid + " .resize-handle-input").forEach((handle) => {
            handle.addEventListener("mousedown", (e: MouseEvent) => {
                closePopup();
                state.colResizeDrag = { active: true, type: "input", startX: e.clientX, startWidth: state.inputTokenWidth, colIdx: 0 };
                handle.classList.add("dragging");
                e.preventDefault();
                e.stopPropagation();
            });
        });
        document.querySelectorAll<HTMLElement>("#" + uid + " .resize-handle").forEach((handle) => {
            const colIdx = parseInt(handle.dataset.col!);
            handle.addEventListener("mousedown", (e: MouseEvent) => {
                closePopup();
                state.colResizeDrag = { active: true, type: "column", startX: e.clientX, startWidth: state.currentCellWidth, colIdx };
                handle.classList.add("dragging");
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    // Document-level listeners for drag handling (named for cleanup in destroy)
    const handleColResizeMove = (e: MouseEvent) => {
        if (!state.colResizeDrag.active) return;
        const delta = e.clientX - state.colResizeDrag.startX;
        if (state.colResizeDrag.type === "input") {
            state.inputTokenWidth = Math.max(40, Math.min(200, state.colResizeDrag.startWidth + delta));
            const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
            buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
            notifyLinkedWidgets();
        } else if (state.colResizeDrag.type === "column") {
            const numCols = state.colResizeDrag.colIdx + 1;
            const widthDelta = delta / numCols;
            const newWidth = Math.max(minCellWidth, Math.min(maxCellWidth, state.colResizeDrag.startWidth + widthDelta));
            if (Math.abs(newWidth - state.currentCellWidth) > 1) {
                state.currentCellWidth = newWidth;
                const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
                buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
                notifyLinkedWidgets();
            }
        }
    };
    document.addEventListener("mousemove", handleColResizeMove);

    const handleGlobalMouseUp = () => {
        if (state.colResizeDrag.active) {
            state.colResizeDrag.active = false;
            document.querySelectorAll("#" + uid + " .resize-handle-input, #" + uid + " .resize-handle").forEach((h) => h.classList.remove("dragging"));
        }
        state.yAxisDrag.active = false;
        state.xAxisDrag.active = false;
        state.plotMinLayerDrag.active = false;
        if (state.rightEdgeDrag.active) {
            state.rightEdgeDrag.active = false;
            dom.resizeRight().classList.remove("dragging");
        }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);

    const handleXAxisDragMove = (e: MouseEvent) => {
        if (!state.xAxisDrag.active) return;
        const delta = e.clientY - state.xAxisDrag.startY;
        const newHeight = Math.max(minChartHeight, Math.min(maxChartHeight, state.xAxisDrag.startHeight + delta));
        if (Math.abs(newHeight - getActualChartHeight()) > 2) {
            state.chartHeight = newHeight;
            const chartContainer = dom.chartContainer();
            chartContainer.style.flex = "none";
            chartContainer.style.height = newHeight + "px";
            updateChart(null, null, null, state.currentHoverPos);
        }
    };
    document.addEventListener("mousemove", handleXAxisDragMove);

    const handleYAxisDragMove = (e: MouseEvent) => {
        if (!state.yAxisDrag.active) return;
        const delta = e.clientX - state.yAxisDrag.startX;
        state.inputTokenWidth = Math.max(40, Math.min(200, state.yAxisDrag.startWidth + delta));
        const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
        buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
        notifyLinkedWidgets();
    };
    document.addEventListener("mousemove", handleYAxisDragMove);

    const handlePlotMinLayerDragMove = (e: MouseEvent) => {
        if (!state.plotMinLayerDrag.active) return;
        const delta = e.clientX - state.plotMinLayerDrag.startX;
        const dr = state.plotMinLayerDrag.dotRadius;
        const uw = state.plotMinLayerDrag.usableWidth;
        const layerIdx = state.plotMinLayerDrag.layerIdx;
        let targetX = Math.max(dr, Math.min(uw - dr, state.plotMinLayerDrag.layerXAtStart + delta));
        const t = (targetX - dr) / (uw - 2 * dr);
        if (Math.abs(t - 1) < 0.001) return;
        let newMinLayer = (t * (nLayers - 1) - layerIdx) / (t - 1);
        newMinLayer = Math.max(0, Math.min(layerIdx - 0.1, newMinLayer));
        if (Math.abs(newMinLayer - state.plotMinLayer) > 0.01) {
            state.plotMinLayer = newMinLayer;
            updateChart(null, null, null, state.currentHoverPos);
        }
    };
    document.addEventListener("mousemove", handlePlotMinLayerDragMove);

    // Bottom resize handle
    let bottomDragActive = false, bottomStartY = 0, bottomStartMaxRows: number | null = null, bottomMeasuredRowHeight = 20;
    {
        const handle = dom.resizeBottom();
        const table = dom.table();
        handle.addEventListener("mousedown", (e: MouseEvent) => {
            closePopup();
            bottomDragActive = true;
            bottomStartY = e.clientY;
            bottomStartMaxRows = state.currentMaxRows;
            const rows = table.querySelectorAll("tr");
            if (rows.length >= 2) bottomMeasuredRowHeight = rows[1].getBoundingClientRect().height;
            handle.classList.add("dragging");
            e.preventDefault();
            e.stopPropagation();
        });
    }
    const handleBottomResizeMove = (e: MouseEvent) => {
        if (!bottomDragActive) return;
        const delta = e.clientY - bottomStartY;
        const rowDelta = Math.round(delta / bottomMeasuredRowHeight);
        const totalTokens = widgetData.tokens.length;
        const startRows = bottomStartMaxRows === null ? totalTokens : bottomStartMaxRows;
        let newMaxRows: number | null = Math.max(1, Math.min(totalTokens, startRows + rowDelta));
        if (newMaxRows >= totalTokens) newMaxRows = null;
        if (newMaxRows !== state.currentMaxRows) buildTable(state.currentCellWidth, state.currentVisibleIndices, newMaxRows);
    };
    document.addEventListener("mousemove", handleBottomResizeMove);
    const handleBottomResizeUp = () => {
        if (bottomDragActive) { bottomDragActive = false; dom.resizeBottom().classList.remove("dragging"); }
    };
    document.addEventListener("mouseup", handleBottomResizeUp);

    // Right edge resize handle
    (function () {
        const handle = dom.resizeRight();
        handle.addEventListener("mousedown", (e: MouseEvent) => {
            closePopup();
            state.rightEdgeDrag = {
                active: true, startX: e.clientX,
                startTableWidth: dom.table().offsetWidth,
                startCellWidth: state.currentCellWidth,
                hadMaxTableWidth: state.maxTableWidth !== null,
                startMaxTableWidth: state.maxTableWidth,
            };
            handle.classList.add("dragging");
            e.preventDefault();
            e.stopPropagation();
        });
    })();

    const handleRightEdgeResizeMove = (e: MouseEvent) => {
        if (!state.rightEdgeDrag.active) return;
        const delta = e.clientX - state.rightEdgeDrag.startX;
        const actualContainerWidth = getActualContainerWidth();
        let targetTableWidth = state.rightEdgeDrag.startTableWidth + delta;

        if (delta >= 0) {
            targetTableWidth = Math.min(targetTableWidth, actualContainerWidth);
            if (targetTableWidth >= actualContainerWidth - state.currentCellWidth) state.maxTableWidth = null;
            else state.maxTableWidth = targetTableWidth;

            const availableForCells = targetTableWidth - state.inputTokenWidth - 1;
            let numVisibleCols = state.currentVisibleIndices.length;
            if (numVisibleCols > 0) {
                let newCellWidth = availableForCells / numVisibleCols;
                if (newCellWidth > maxCellWidth && numVisibleCols < nLayers) {
                    numVisibleCols++;
                    newCellWidth = availableForCells / numVisibleCols;
                }
                newCellWidth = Math.max(minCellWidth, Math.min(maxCellWidth, newCellWidth));
                const threshold = 0.5 / Math.max(1, numVisibleCols);
                if (Math.abs(newCellWidth - state.currentCellWidth) > threshold) {
                    state.currentCellWidth = newCellWidth;
                    const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
                    buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
                    notifyLinkedWidgets();
                }
            }
        } else {
            targetTableWidth = Math.max(state.inputTokenWidth + minCellWidth + 1, targetTableWidth);
            if (!state.rightEdgeDrag.hadMaxTableWidth && targetTableWidth >= state.rightEdgeDrag.startTableWidth) state.maxTableWidth = null;
            else state.maxTableWidth = targetTableWidth;
            const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
            buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
            notifyLinkedWidgets();
        }
    };
    document.addEventListener("mousemove", handleRightEdgeResizeMove);

    // ═══════════════════════════════════════════════════════════════
    // CHART RENDERING (now delegated to LinePlotCore via updateChart above)
    // The old SVG-based drawAllTrajectories and drawSingleTrajectory have been
    // replaced by updateChart() which uses LinePlotCore for canvas rendering.
    // ═══════════════════════════════════════════════════════════════


    // ═══════════════════════════════════════════════════════════════
    // WIDGET LINKING + STATE SERIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function getColumnState() {
        return { cellWidth: state.currentCellWidth, inputTokenWidth: state.inputTokenWidth, maxTableWidth: state.maxTableWidth };
    }

    function setColumnState(colState: Record<string, unknown>, fromSync?: boolean) {
        if (state.isSyncing) return;
        let changed = false;
        if (typeof colState.cellWidth === "number" && colState.cellWidth !== state.currentCellWidth) { state.currentCellWidth = colState.cellWidth; changed = true; }
        if (typeof colState.inputTokenWidth === "number" && colState.inputTokenWidth !== state.inputTokenWidth) { state.inputTokenWidth = colState.inputTokenWidth; changed = true; }
        if (colState.maxTableWidth !== undefined && colState.maxTableWidth !== state.maxTableWidth) { state.maxTableWidth = colState.maxTableWidth as number | null; changed = true; }
        if (changed) {
            const result = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
            buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);
            if (!fromSync) notifyLinkedWidgets();
        }
    }

    function notifyLinkedWidgets() {
        if (state.isSyncing) return;
        state.isSyncing = true;
        const colState = getColumnState();
        state.linkedWidgets.forEach((w: any) => { if (w.setColumnState) w.setColumnState(colState, true); });
        state.isSyncing = false;
    }

    function getState(): LogitLensUIState {
        return {
            chartHeight: state.chartHeight,
            inputTokenWidth: state.inputTokenWidth,
            cellWidth: state.currentCellWidth,
            maxRows: state.currentMaxRows,
            maxTableWidth: state.maxTableWidth,
            plotMinLayer: state.plotMinLayer,
            colorModes: state.colorModes.slice(),
            title: state.customTitle,
            colorIndex: state.colorIndex,
            pinnedGroups: JSON.parse(JSON.stringify(state.pinnedGroups)),
            lastPinnedGroupIndex: state.lastPinnedGroupIndex,
            pinnedRows: state.pinnedRows.map((pr) => ({ pos: pr.pos, line: pr.lineStyle.name })),
            heatmapBaseColor: state.heatmapBaseColor,
            heatmapNextColor: state.heatmapNextColor,
            darkMode: state.darkModeOverride,
            showHeatmap: state.showHeatmap,
            showChart: state.showChart,
            trajectoryMetric: state.trajectoryMetric,
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════

    dom.widget().addEventListener("mousedown", (e) => { if (e.shiftKey) e.preventDefault(); });
    dom.widget().addEventListener("mouseleave", () => {
        state.currentHoverPos = widgetData.tokens.length - 1;
        updateChart(null, null, null, state.currentHoverPos);
    });

    const colorPicker = dom.colorPicker();
    colorPicker.addEventListener("input", (e) => {
        if (!state.colorPickerTarget) return;
        const newColor = (e.target as HTMLInputElement).value;
        if (state.colorPickerTarget.type === "trajectory" && state.colorPickerTarget.groupIdx !== undefined) {
            const group = state.pinnedGroups[state.colorPickerTarget.groupIdx];
            if (group) { group.color = newColor; buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows); }
        } else if (state.colorPickerTarget.type === "heatmap") {
            state.heatmapBaseColor = newColor;
            buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows);
        }
    });
    colorPicker.addEventListener("change", () => { state.colorPickerTarget = null; });

    // Initial build
    const containerWidth = getContainerWidth();
    const result = computeVisibleLayers(state.currentCellWidth, containerWidth);
    buildTable(state.currentCellWidth, result.indices, state.currentMaxRows, result.stride);

    // If user previously set a specific chart height, apply it; otherwise let flex fill
    if (state.chartHeight !== null) {
        const chartContainer = dom.chartContainer();
        chartContainer.style.flex = "none";
        chartContainer.style.height = state.chartHeight + "px";
    }

    // Observe container resizes (window resize, panel resize, etc.)
    let lastContainerWidth = containerWidth;
    const containerResizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const newWidth = Math.round(entry.contentRect.width);
        if (newWidth === lastContainerWidth || newWidth === 0) return;
        lastContainerWidth = newWidth;
        const r = computeVisibleLayers(state.currentCellWidth, getContainerWidth());
        buildTable(state.currentCellWidth, r.indices, state.currentMaxRows, r.stride);
        notifyLinkedWidgets();
    });
    containerResizeObserver.observe(container);

    applyDarkMode(dom.widget(), isDarkMode());

    // Style observer
    let lastDetectedDarkMode = isDarkMode();
    const styleObserver = new MutationObserver(() => {
        const widgetEl = dom.widget();
        if (!widgetEl) { styleObserver.disconnect(); return; }
        let needsRebuild = false;
        if (state.darkModeOverride === null) {
            const currentDarkMode = isDarkMode();
            if (currentDarkMode !== lastDetectedDarkMode) {
                lastDetectedDarkMode = currentDarkMode;
                applyDarkMode(widgetEl, currentDarkMode);
                needsRebuild = true;
            }
        }
        if (needsRebuild) buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows, state.currentStride);
    });
    styleObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    if (document.body) styleObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC INTERFACE
    // ═══════════════════════════════════════════════════════════════

    const publicInterface: LogitLensWidgetInterface = {
        getState,
        setState: (s: Partial<LogitLensUIState>) => {
            // Apply individual state fields
            if (s.darkMode !== undefined) state.darkModeOverride = s.darkMode;
            if (s.title !== undefined) state.customTitle = s.title;
            if (s.showHeatmap !== undefined) state.showHeatmap = s.showHeatmap;
            if (s.showChart !== undefined) state.showChart = s.showChart;
            if (s.trajectoryMetric !== undefined) state.trajectoryMetric = s.trajectoryMetric;
            if (s.colorModes !== undefined) state.colorModes = s.colorModes.slice();
            if (s.pinnedGroups !== undefined) state.pinnedGroups = JSON.parse(JSON.stringify(s.pinnedGroups));
            applyDarkMode(dom.widget(), isDarkMode());
            render();
        },
        setData: (data: LogitLensData) => {
            const dr = normalizeData(data);
            widgetData = dr.normalized;
            v2Data = dr.v2Data;
            render();
        },
        setTitle: (title: string) => {
            state.customTitle = title || "";
            updateTitle();
            emitEvent(state, "title", state.customTitle);
        },
        setDarkMode: (enabled: boolean) => {
            state.darkModeOverride = enabled === null ? null : !!enabled;
            applyDarkMode(dom.widget(), isDarkMode());
            buildTable(state.currentCellWidth, state.currentVisibleIndices, state.currentMaxRows, state.currentStride);
        },
        getDarkMode: () => isDarkMode(),
        hasEntropyData,
        hasRankData,
        linkColumnsTo: (other: LogitLensWidgetInterface) => {
            if (state.linkedWidgets.indexOf(other as any) < 0) state.linkedWidgets.push(other as any);
            (other as any).setColumnState?.(getColumnState(), true);
        },
        unlinkColumns: (other: LogitLensWidgetInterface) => {
            const idx = state.linkedWidgets.indexOf(other as any);
            if (idx >= 0) state.linkedWidgets.splice(idx, 1);
        },
        on: (eventName: string, callback: (data: unknown) => void) => { addEventListener(state, eventName, callback); },
        off: (eventName: string, callback: (data: unknown) => void) => { removeEventListener(state, eventName, callback); },
        destroy: () => {
            styleObserver.disconnect();
            containerResizeObserver.disconnect();
            // Remove all document-level event listeners
            document.removeEventListener("mousemove", handleColResizeMove);
            document.removeEventListener("mouseup", handleGlobalMouseUp);
            document.removeEventListener("mousemove", handleXAxisDragMove);
            document.removeEventListener("mousemove", handleYAxisDragMove);
            document.removeEventListener("mousemove", handlePlotMinLayerDragMove);
            document.removeEventListener("mousemove", handleBottomResizeMove);
            document.removeEventListener("mouseup", handleBottomResizeUp);
            document.removeEventListener("mousemove", handleRightEdgeResizeMove);
            if (linePlot) { linePlot.destroy(); linePlot = null; }
            if (container) container.innerHTML = "";
        },
    };

    return { widget: publicInterface, styleEl };
}
