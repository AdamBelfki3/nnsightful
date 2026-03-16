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
    darkMode?: boolean;
    xRangeStart?: number;
    autoScale?: boolean;
    legendPosition?: "right" | "none";
    showDataPoints?: boolean;
    onLineRemoved?: (lineIdx: number) => void;
}

/**
 * Public API of a LinePlot widget instance
 */
export interface LinePlotWidgetInterface {
    setData: (data: LinePlotData) => void;
    setOptions: (options: Partial<LinePlotOptions>) => void;
    setDarkMode: (dark: boolean) => void;
    toggleLine: (lineIdx: number) => void;
    addLine: (line: LinePlotLine) => number;
    removeLine: (lineIdx: number) => void;
    setOverlay: (line: LinePlotLine | null) => void;
    destroy: () => void;
}
