import React, { useEffect, useRef } from "react";
import type { ActivationPatchingData, ActivationPatchingMode } from "../types/activation-patching";
import { ActivationPatchingCore } from "../visualizations/activation-patching";

interface ActivationPatchingWidgetProps {
    data: ActivationPatchingData;
    mode?: ActivationPatchingMode;
    darkMode?: boolean;
    title?: string;
    transparentBackground?: boolean;
}

export function ActivationPatchingWidget({
    data,
    mode = "probability",
    darkMode = false,
    title,
    transparentBackground = false,
}: ActivationPatchingWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<ActivationPatchingCore | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        coreRef.current = new ActivationPatchingCore(containerRef.current, data, { mode, darkMode, title, transparentBackground });
        return () => {
            coreRef.current?.destroy();
            coreRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Sync mode from external prop (e.g. if parent still controls mode)
    useEffect(() => {
        coreRef.current?.setMode(mode);
    }, [mode]);

    useEffect(() => {
        coreRef.current?.setDarkMode(darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (title !== undefined) {
            coreRef.current?.setTitle(title);
        }
    }, [title]);

    if (!data.lines || data.lines.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a" }}>
                No data to display
            </div>
        );
    }

    return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 300 }} />;
}
