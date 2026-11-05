import type { BaseWidgetInterface } from "./base";

/**
 * Rich line descriptor for fine-grained control over individual lines.
 * When provided via richLines, these override the basic lines/labels arrays.
 */
export interface LinePlotLine {
    values: (number | null)[];
    label?: string;
    color?: string;
    dashPattern?: string;
    isOverlay?: boolean;
    removable?: boolean;
}

/**
 * Data for a line plot visualization
 */
export interface LinePlotData {
    lines?: number[][];
    labels?: string[];
    richLines?: LinePlotLine[];
    xLabels?: (string | number)[];
}

/**
 * Display mode for the line plot
 */
export type LinePlotMode = "probability" | "prob_diff" | "rank";

/**
 * Options for configuring the line plot
 */
export interface LinePlotOptions {
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    transparentBackground?: boolean;
    mode?: LinePlotMode;
    minValue?: number;
    maxValue?: number;
    invertYAxis?: boolean;
    centerYAxisAtZero?: boolean;
    logScale?: boolean;
    darkMode?: boolean;
    xRangeStart?: number;
    autoScale?: boolean;
    legendPosition?: "right" | "none";
    showDataPoints?: boolean;
    onLineRemoved?: (lineIdx: number) => void;
    /** false: a static rendering — no hover crosshair/tooltip, and the legend
     *  is a plain key rather than toggle buttons. Default true. */
    interactive?: boolean;
    /** Canvas resolution multiplier. Defaults to window.devicePixelRatio; set
     *  it higher to draw a sharper plot for a snapshot. */
    pixelRatio?: number;
}

/**
 * Public API of a LinePlot widget instance
 */
export interface LinePlotWidgetInterface extends BaseWidgetInterface<LinePlotData> {
    setOptions: (options: Partial<LinePlotOptions>) => void;
    toggleLine: (lineIdx: number) => void;
    addLine: (line: LinePlotLine) => number;
    removeLine: (lineIdx: number) => void;
    setOverlay: (line: LinePlotLine | null) => void;
}
