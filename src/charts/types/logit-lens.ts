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
    pinnedRows?: Array<{ pos: number; line: string }>;
    heatmapBaseColor?: string | null;
    heatmapNextColor?: string | null;
    darkMode?: boolean | null;
    showHeatmap?: boolean;
    showChart?: boolean;
    trajectoryMetric?: "probability" | "rank";
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
