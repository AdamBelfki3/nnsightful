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
}

export interface HeatmapTableData {
    rows: HeatmapRow[];
    columns: HeatmapColumn[];
    getCellValue: (row: number, col: number) => HeatmapCellData;
}

export interface HeatmapTableOptions {
    cellWidth?: number;
    rowHeaderWidth?: number;
    darkMode?: boolean;
    cornerLabel?: string;
    maxRows?: number | null;
    onCellHover?: (row: number, col: number) => void;
    onCellClick?: (row: number, col: number) => void;
    onRowHeaderClick?: (row: number) => void;
    onCellLeave?: () => void;
}

export interface HeatmapTableWidgetInterface extends BaseWidgetInterface<HeatmapTableData> {
    setOptions: (opts: Partial<HeatmapTableOptions>) => void;
    setCellWidth: (width: number) => void;
    setRowHeaderWidth: (width: number) => void;
    getTableElement: () => HTMLTableElement;
    getTableWidth: () => number;
}
