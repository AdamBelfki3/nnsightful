import type { LogitLensUIState } from "../../types/logit-lens";
import { LINE_STYLES } from "./colors";

export interface LineStyle {
    dash: string;
    name: string;
}

export interface PinnedGroup {
    tokens: string[];
    color: string;
    lineStyle?: LineStyle;
}

export interface PinnedRow {
    pos: number;
    lineStyle: LineStyle;
}

export interface DragState {
    active: boolean;
    type: string | null;
    startX: number;
    startWidth: number;
    colIdx: number;
}

export interface WidgetState {
    chartHeight: number | null;
    inputTokenWidth: number;
    currentCellWidth: number;
    currentMaxRows: number | null;
    maxTableWidth: number | null;
    plotMinLayer: number;

    currentVisibleIndices: number[];
    currentStride: number;

    openPopupCell: HTMLElement | null;
    currentHoverPos: number;
    colorPickerTarget: { type: string; groupIdx?: number } | null;

    pinnedGroups: PinnedGroup[];
    pinnedRows: PinnedRow[];
    lastPinnedGroupIndex: number;

    colorModes: string[];
    colorIndex: number;
    heatmapBaseColor: string | null;
    heatmapNextColor: string | null;

    customTitle: string;
    darkModeOverride: boolean | null;

    showHeatmap: boolean;
    showChart: boolean;
    trajectoryMetric: "probability" | "rank";

    eventListeners: Record<string, Array<(data: unknown) => void>>;
    linkedWidgets: Array<Record<string, unknown>>;
    isSyncing: boolean;

    colResizeDrag: DragState;
    yAxisDrag: { active: boolean; startX: number; startWidth: number };
    xAxisDrag: { active: boolean; startY: number; startHeight: number };
    plotMinLayerDrag: {
        active: boolean;
        startX: number;
        startMinLayer: number;
        layerIdx: number;
        layerXAtStart: number;
        usableWidth: number;
        dotRadius: number;
    };
    rightEdgeDrag: {
        active: boolean;
        startX: number;
        startTableWidth: number;
        startCellWidth?: number;
        hadMaxTableWidth: boolean;
        startMaxTableWidth: number | null;
    };
}

export function createInitialState(
    uiState: Partial<LogitLensUIState> | undefined,
    nLayers: number,
    nPositions: number,
    defaultNextToken: string,
): WidgetState {
    const state: WidgetState = {
        chartHeight: uiState?.chartHeight ?? null,
        inputTokenWidth: uiState?.inputTokenWidth ?? 100,
        currentCellWidth: uiState?.cellWidth ?? 44,
        currentMaxRows: uiState?.maxRows !== undefined ? (uiState.maxRows ?? null) : null,
        maxTableWidth: uiState?.maxTableWidth !== undefined ? (uiState.maxTableWidth ?? null) : null,
        plotMinLayer: Math.max(
            0,
            Math.min(nLayers - 2, uiState?.plotMinLayer ?? 0),
        ),

        currentVisibleIndices: [],
        currentStride: 1,

        openPopupCell: null,
        currentHoverPos: nPositions - 1,
        colorPickerTarget: null,

        pinnedGroups: uiState?.pinnedGroups
            ? JSON.parse(JSON.stringify(uiState.pinnedGroups))
            : [],
        pinnedRows: [],
        lastPinnedGroupIndex: uiState?.lastPinnedGroupIndex ?? -1,

        colorModes: uiState?.colorModes
            ? uiState.colorModes.slice()
            : ["top", defaultNextToken],
        colorIndex: uiState?.colorIndex ?? 0,
        heatmapBaseColor: uiState?.heatmapBaseColor ?? null,
        heatmapNextColor: uiState?.heatmapNextColor ?? null,

        customTitle: uiState?.title ?? "Logit Lens: Top Predictions by Layer",
        darkModeOverride: uiState?.darkMode !== undefined ? (uiState.darkMode ?? null) : null,

        showHeatmap: uiState?.showHeatmap ?? true,
        showChart: uiState?.showChart ?? true,
        trajectoryMetric: uiState?.trajectoryMetric ?? "probability",

        eventListeners: {},
        linkedWidgets: [],
        isSyncing: false,

        colResizeDrag: { active: false, type: null, startX: 0, startWidth: 0, colIdx: 0 },
        yAxisDrag: { active: false, startX: 0, startWidth: 0 },
        xAxisDrag: { active: false, startY: 0, startHeight: 0 },
        plotMinLayerDrag: {
            active: false,
            startX: 0,
            startMinLayer: 0,
            layerIdx: 0,
            layerXAtStart: 0,
            usableWidth: 0,
            dotRadius: 0,
        },
        rightEdgeDrag: {
            active: false,
            startX: 0,
            startTableWidth: 0,
            hadMaxTableWidth: false,
            startMaxTableWidth: null,
        },
    };

    // Restore pinned rows
    if (uiState?.pinnedRows !== undefined) {
        state.pinnedRows = (uiState.pinnedRows || []).map((pr) => {
            const style = LINE_STYLES.find((ls) => ls.name === pr.line) || LINE_STYLES[0];
            return { pos: pr.pos, lineStyle: style };
        });
    } else {
        state.pinnedRows = [{ pos: nPositions - 1, lineStyle: LINE_STYLES[0] }];
    }

    return state;
}

export function emitEvent(state: WidgetState, eventName: string, data: unknown): void {
    const listeners = state.eventListeners[eventName];
    if (!listeners) return;
    for (const listener of listeners) {
        try {
            listener(data);
        } catch (e) {
            console.error("Event listener error:", e);
        }
    }
}

export function addEventListener(
    state: WidgetState,
    eventName: string,
    callback: (data: unknown) => void,
): void {
    if (!state.eventListeners[eventName]) {
        state.eventListeners[eventName] = [];
    }
    state.eventListeners[eventName].push(callback);
}

export function removeEventListener(
    state: WidgetState,
    eventName: string,
    callback: (data: unknown) => void,
): void {
    const listeners = state.eventListeners[eventName];
    if (!listeners) return;
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
}
