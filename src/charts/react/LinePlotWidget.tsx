import { useEffect, useRef } from "react";
import type { LinePlotData, LinePlotOptions } from "../types/line-plot";
import { LinePlotCore } from "../core/line-plot";

interface LinePlotWidgetProps {
    data: LinePlotData;
    title?: string;
    yAxisLabel?: string;
    xAxisLabel?: string;
    transparentBackground?: boolean;
    mode?: LinePlotOptions["mode"];
    minValue?: number;
    maxValue?: number;
    invertYAxis?: boolean;
    centerYAxisAtZero?: boolean;
    darkMode?: boolean;
}

export function LinePlotWidget({
    data,
    title,
    yAxisLabel,
    xAxisLabel,
    transparentBackground,
    mode,
    minValue,
    maxValue,
    invertYAxis,
    centerYAxisAtZero,
    darkMode = false,
}: LinePlotWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<LinePlotCore | null>(null);

    const options: LinePlotOptions = {
        title,
        yAxisLabel,
        xAxisLabel,
        transparentBackground,
        mode,
        minValue,
        maxValue,
        invertYAxis,
        centerYAxisAtZero,
        darkMode,
    };

    // Initialize core
    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        coreRef.current = new LinePlotCore(containerRef.current, data, options);
        return () => {
            coreRef.current?.destroy();
            coreRef.current = null;
        };
        // Only re-create on data identity change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Sync options
    useEffect(() => {
        coreRef.current?.setOptions(options);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, yAxisLabel, xAxisLabel, transparentBackground, mode, minValue, maxValue, invertYAxis, centerYAxisAtZero, darkMode]);

    if (!data.lines || data.lines.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a" }}>
                No data to display
            </div>
        );
    }

    return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 300 }} />;
}
