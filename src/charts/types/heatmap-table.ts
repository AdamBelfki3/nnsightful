import type { BaseWidgetInterface } from "./base";

/**
 * Data types for the HeatmapTable atomic chart component
 */

export interface HeatmapRow {
    label: string;
    pinned?: boolean;
    lineStyle?: { dash: string; name: string };
}

export interface HeatmapColumn {
    label: string;
    value: number;
}

export interface HeatmapCellData {
    text: string;
    value: number;
    color: string;
    textColor: string;
    highlighted?: boolean;
    highlightColor?: string;
    bold?: boolean;
    /** De-emphasize a cell (e.g. low-magnitude) without changing its color. */
    opacity?: number;
    /** Extra class(es) on the cell element — escape hatch for host styling. */
    className?: string;
}

export interface HeatmapTableData {
    rows: HeatmapRow[];
    /** All columns, in absolute index order. The core may show a sampled
     *  subset (see sampleColumns / columnWindow); getCellValue and the
     *  interaction callbacks always address columns by their ABSOLUTE index. */
    columns: HeatmapColumn[];
    getCellValue: (row: number, col: number) => HeatmapCellData;
}

/** External pan/zoom window over the columns. The host owns this state (and
 *  its persistence); the core just renders the slice and samples it to fit. */
export interface HeatmapColumnWindow {
    start: number;
    size: number;
}

export interface HeatmapTableOptions {
    // ── Column sizing ──────────────────────────────────────────────
    /** 'fixed' (default): each column is exactly cellWidth, scroll if wide.
     *  'fit': the visible columns stretch to fill the available width. */
    columnSizing?: "fixed" | "fit";
    /** 'fixed' sizing: exact column width. 'fit' sizing: ignored. */
    cellWidth?: number;
    /** 'fit' sizing: smallest readable column — caps how many columns show
     *  before sampling kicks in. */
    minColumnWidth?: number;

    // ── Row sizing ─────────────────────────────────────────────────
    /** 'fixed' (default): rows are exactly cellHeight.
     *  'fill': rows stretch to fill the scroll region's height. */
    rowSizing?: "fixed" | "fill";
    cellHeight?: number;
    rowHeaderWidth?: number;
    /** Height of the column-header row, px. */
    headerHeight?: number;

    // ── Container fit ──────────────────────────────────────────────
    /** 'content' (default): the card shrink-wraps its content.
     *  'fill': the card fills its host box (flex), scroll absorbs overflow. */
    height?: "content" | "fill";
    /** 'card' (default): full card chrome. 'none': bare embeddable region
     *  (no border/radius/shadow/padding) for nesting inside another widget. */
    chrome?: "card" | "none";

    // ── Column down-sampling (wide grids) ──────────────────────────
    /** 'none' (default): show every column in the window (scroll if wide).
     *  'uniform': evenly stride-sample the window so it fits the width. */
    sampleColumns?: "none" | "uniform";
    /** Hard cap on the number of visible columns regardless of width. */
    maxVisibleColumns?: number;
    /** Always include the window's last column (e.g. the final layer). */
    alwaysShowLastColumn?: boolean;
    /** Restrict rendering to a window of the columns (host pan/zoom input). */
    columnWindow?: HeatmapColumnWindow | null;
    /** Fired (after a render) with the absolute indices of the visible
     *  columns — lets a host navigator stay in sync with what's shown. */
    onVisibleColumnsChange?: (absoluteColumns: number[]) => void;

    // ── Misc display ───────────────────────────────────────────────
    darkMode?: boolean;
    cornerLabel?: string;
    showGrid?: boolean;
    maxRows?: number | null;

    // ── Render hooks (domain visuals) ──────────────────────────────
    /** Custom inner HTML for a row's label (e.g. a bos pill, a line-style
     *  marker). Falls back to the plain token rendering when omitted. */
    renderRowLabel?: (row: number) => string;
    /** Extra class(es) on a row's wrapper — host CSS can then draw an active
     *  rail, selection tint, etc. without the core knowing the semantics. */
    rowClassName?: (row: number) => string;

    // ── Interaction ────────────────────────────────────────────────
    onCellHover?: (row: number, col: number, ev: MouseEvent) => void;
    onCellClick?: (row: number, col: number, ev: MouseEvent) => void;
    onRowHeaderClick?: (row: number, ev: MouseEvent) => void;
    onCellLeave?: () => void;
}

export interface HeatmapTableWidgetInterface extends BaseWidgetInterface<HeatmapTableData> {
    setOptions: (opts: Partial<HeatmapTableOptions>) => void;
    setCellWidth: (width: number) => void;
    setRowHeaderWidth: (width: number) => void;
    getTableElement: () => HTMLElement;
    getTableWidth: () => number;
    /** The scrollable rows region (for the host to drive scrolling). */
    getScrollElement: () => HTMLElement;
    /** Smooth-scroll a row to the vertical center of the viewport. */
    scrollToRow: (row: number) => void;
    /** Jump the scroll region to the bottom (e.g. last prompt token). */
    scrollToBottom: () => void;
}
