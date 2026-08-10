import type { BaseWidgetInterface } from "./base";

/**
 * LogitLensKit V2 Data Format
 */
export interface LogitLensData {
    meta: {
        version: number;
        timestamp: string;
        model: string;
    };
    layers: number[];
    input: string[];
    /** Generated token strings (parallel to `input`). When present, the full
     *  row sequence is `input + completion`; the widget derives the
     *  prompt/generation split — and a highlight — from the two lengths. */
    completion?: string[];
    tracked: Record<string, number[]>[];
    topk: string[][][];
    entropy?: number[][];
}

/**
 * Serializable UI state for the LogitLens widget
 */
export interface LogitLensUIState {
    chartHeight?: number | null;
    chartAspectRatio?: string | null;
    inputTokenWidth?: number;
    cellWidth?: number;
    maxRows?: number | null;
    maxTableWidth?: number | null;
    plotMinLayer?: number;
    colorModes?: string[];
    title?: string;
    colorIndex?: number;
    pinnedGroups?: Array<{
        tokens: string[];
        color: string;
        lineStyle?: { name: string; dash: string };
    }>;
    lastPinnedGroupIndex?: number;
    // Pinned prompt positions. `line` (the dash-style name) is informational
    // only — on restore the style is recomputed from array order, so the
    // order of this array determines each row's style.
    pinnedRows?: Array<{ pos: number; line: string }>;
    heatmapBaseColor?: string | null;
    heatmapNextColor?: string | null;
    darkMode?: boolean | null;
    showHeatmap?: boolean;
    showChart?: boolean;
    trajectoryMetric?: "probability" | "rank";

    // Redesigned-widget options
    ramp?: "purple" | "blue" | "teal";
    showGrid?: boolean;
    dimLowProb?: boolean;
    selectedRow?: number | null;
    // Absolute layer index of the cell driving the trajectory line plot.
    selectedLayer?: number | null;
    // Layer-navigator window (which layers are shown / zoom level).
    viewStart?: number;
    viewSize?: number;
    // Note: pinned trajectories round-trip through `pinnedGroups` +
    // `colorIndex` (declared above) — each pin is a single-token group.
    // Declarative row highlights, forwarded verbatim to the heatmap core (bands
    // / rails / block dividers, "Design A"). Generic — a host marks any rows.
    rowHighlights?: import("./heatmap-table").HeatmapRowHighlight[];
    // Collapsible row sections (original ranges). The widget owns the
    // collapsed/expanded flags; this persists the current state.
    collapsedSections?: import("./heatmap-table").HeatmapCollapsedSection[];
}

/**
 * Public API of a LogitLens widget instance
 */
export interface LogitLensWidgetInterface extends BaseWidgetInterface<LogitLensData> {
    getState: () => LogitLensUIState;
    setState: (state: Partial<LogitLensUIState>) => void;
    setTitle: (title: string) => void;
    getThemeMode: () => boolean;
    hasEntropyData: () => boolean;
    hasRankData: () => boolean;
    linkColumnsTo: (other: LogitLensWidgetInterface) => void;
    unlinkColumns: (other: LogitLensWidgetInterface) => void;
    on: (event: string, callback: (data: unknown) => void) => void;
    off: (event: string, callback: (data: unknown) => void) => void;
}
