/**
 * Data for a line plot visualization
 */
export interface LinePlotData {
    lines: number[][];
    labels?: string[];
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
}

/**
 * Public API of a LinePlot widget instance
 */
export interface LinePlotWidgetInterface {
    setData: (data: LinePlotData) => void;
    setOptions: (options: Partial<LinePlotOptions>) => void;
    setDarkMode: (dark: boolean) => void;
    toggleLine: (lineIdx: number) => void;
    destroy: () => void;
}
