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
    /** Absolute row indices (over `input + completion`) the lens was computed
     *  at, in order. When set, `tracked[i]`, `topk[layer][i]` and
     *  `entropy[layer][i]` describe row `positions[i]` only; the widget maps
     *  them back onto their rows and hides the rest behind locked bands.
     *  Omitted / null = dense (every row, in order). */
    positions?: number[] | null;
    tracked: Record<string, number[]>[];
    topk: string[][][];
    entropy?: number[][] | null;
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
    // First row (original index) of a static widget's row window, see
    // LogitLensOptions.maxRows. Null/absent: the default window.
    rowStart?: number | null;
}

/** The rows a static widget's row window shows (original indices,
 *  inclusive) out of `total` rows. */
export interface LogitLensRowWindow {
    start: number;
    end: number;
    total: number;
}

/**
 * Rendering options for a LogitLens widget — how it is drawn, not what it
 * shows (that is LogitLensUIState). Fixed at construction.
 */
export interface LogitLensOptions {
    /** false: a static rendering of the UI state, e.g. for a report or a
     *  snapshot. The heatmap takes its full content height (every row, with
     *  collapsed sections as bands), and there are no controls, hover,
     *  popups or keyboard focus. Default true. */
    interactive?: boolean;
    /** Canvas resolution for the trajectory plot; see LinePlotOptions. */
    pixelRatio?: number;
    /** Static only: when the rows (folded sections counting as thin bands)
     *  are taller than this many rows, show a window of that many. It starts
     *  at `uiState.rowStart` if set, else around the selected (or first
     *  pinned) row, else at the last rows. */
    maxRows?: number;
    /** Static only, with maxRows: the window is a viewport the user scrolls
     *  through; it snaps to whole rows and fires `rowWindowChange`. Without
     *  it, only the window's rows are rendered (e.g. for a snapshot). */
    scrollRows?: boolean;
    /** With scrollRows: whether the viewport scrolls now (default true).
     *  Inert, wheel / touch scrolling over it goes to the page; a host
     *  embedding the widget in a scrolling document can enable it only
     *  while the embed is selected. Change it with setRowScrollActive. */
    scrollRowsActive?: boolean;
    /** Static only: false leaves out the layer navigator under the heatmap
     *  (e.g. for a thumbnail). Default true. */
    layerNavigator?: boolean;
}

/**
 * Public API of a LogitLens widget instance
 */
export interface LogitLensWidgetInterface extends BaseWidgetInterface<LogitLensData> {
    getState: () => LogitLensUIState;
    setState: (state: Partial<LogitLensUIState>) => void;
    setTitle: (title: string) => void;
    getThemeMode: () => boolean;
    /** The rows the row window shows; null when there is no window. */
    getRowWindow: () => LogitLensRowWindow | null;
    /** Make a scrollRows viewport scroll, or leave it inert. */
    setRowScrollActive: (active: boolean) => void;
    hasEntropyData: () => boolean;
    hasRankData: () => boolean;
    linkColumnsTo: (other: LogitLensWidgetInterface) => void;
    unlinkColumns: (other: LogitLensWidgetInterface) => void;
    on: (event: string, callback: (data: unknown) => void) => void;
    off: (event: string, callback: (data: unknown) => void) => void;
}
