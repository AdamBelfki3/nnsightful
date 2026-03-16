import React, { useEffect, useRef, useCallback } from "react";
import type { HeatmapTableData, HeatmapTableOptions } from "../types/heatmap-table";
import { HeatmapTableCore } from "../core/heatmap-table";

interface HeatmapTableWidgetProps {
    data: HeatmapTableData;
    cellWidth?: number;
    rowHeaderWidth?: number;
    darkMode?: boolean;
    maxRows?: number | null;
    onCellHover?: (row: number, col: number) => void;
    onCellClick?: (row: number, col: number) => void;
    onRowHeaderClick?: (row: number) => void;
    onCellLeave?: () => void;
}

export function HeatmapTableWidget({
    data,
    cellWidth = 44,
    rowHeaderWidth = 100,
    darkMode = false,
    maxRows,
    onCellHover,
    onCellClick,
    onRowHeaderClick,
    onCellLeave,
}: HeatmapTableWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<HeatmapTableCore | null>(null);
    const callbacksRef = useRef({ onCellHover, onCellClick, onRowHeaderClick, onCellLeave });
    callbacksRef.current = { onCellHover, onCellClick, onRowHeaderClick, onCellLeave };

    const stableCellHover = useCallback((row: number, col: number) => callbacksRef.current.onCellHover?.(row, col), []);
    const stableCellClick = useCallback((row: number, col: number) => callbacksRef.current.onCellClick?.(row, col), []);
    const stableRowHeaderClick = useCallback((row: number) => callbacksRef.current.onRowHeaderClick?.(row), []);
    const stableCellLeave = useCallback(() => callbacksRef.current.onCellLeave?.(), []);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        const options: HeatmapTableOptions = {
            cellWidth,
            rowHeaderWidth,
            darkMode,
            maxRows,
            onCellHover: stableCellHover,
            onCellClick: stableCellClick,
            onRowHeaderClick: stableRowHeaderClick,
            onCellLeave: stableCellLeave,
        };
        coreRef.current = new HeatmapTableCore(containerRef.current, data, options);
        return () => {
            coreRef.current?.destroy();
            coreRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        coreRef.current?.setOptions({ cellWidth, rowHeaderWidth, darkMode, maxRows });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cellWidth, rowHeaderWidth, darkMode, maxRows]);

    if (!data.rows || data.rows.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a" }}>
                No data to display
            </div>
        );
    }

    return <div ref={containerRef} />;
}
