import React, { useEffect, useRef, useCallback } from "react";
import type { LogitLensData, LogitLensUIState } from "../types/logit-lens";
import { LogitLensCore } from "../visualizations/logit-lens";

interface LogitLensWidgetProps {
    data: LogitLensData | null;
    uiState?: LogitLensUIState;
    onStateChange?: (state: LogitLensUIState) => void;
    darkMode?: boolean;
    className?: string;
    titleSize?: string;
    contentSize?: string;
}

export function LogitLensWidget({
    data,
    uiState,
    onStateChange,
    darkMode,
    className,
    titleSize = "16px",
    contentSize = "12px",
}: LogitLensWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<LogitLensCore | null>(null);

    // Initialize or recreate on data/uiState change
    useEffect(() => {
        if (!containerRef.current || !data) return;

        // Clean up existing
        coreRef.current?.destroy();
        coreRef.current = null;
        containerRef.current.innerHTML = "";

        try {
            const mergedState: LogitLensUIState = {
                ...uiState,
                darkMode: darkMode ?? uiState?.darkMode ?? null,
            };
            coreRef.current = new LogitLensCore(containerRef.current, data, mergedState);
        } catch (e) {
            console.error("Failed to create LogitLensWidget:", e);
        }
    }, [data, uiState, darkMode]);

    // Sync dark mode
    useEffect(() => {
        if (coreRef.current && darkMode !== undefined) {
            coreRef.current.setDarkMode(darkMode);
        }
    }, [darkMode]);

    // CSS custom properties
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty("--ll-title-size", titleSize);
            containerRef.current.style.setProperty("--ll-content-size", contentSize);
        }
    }, [titleSize, contentSize]);

    // State change callback
    const handleStateChange = useCallback(() => {
        if (coreRef.current && onStateChange) {
            onStateChange(coreRef.current.getState());
        }
    }, [onStateChange]);

    useEffect(() => {
        if (!coreRef.current || !onStateChange) return;
        coreRef.current.on("stateChange", handleStateChange);
        return () => {
            coreRef.current?.off("stateChange", handleStateChange);
        };
    }, [onStateChange, handleStateChange]);

    // Cleanup
    useEffect(() => {
        return () => {
            coreRef.current?.destroy();
            coreRef.current = null;
        };
    }, []);

    if (!data) {
        return (
            <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16, color: "#71717a" }}>
                No data available
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                // @ts-expect-error CSS custom properties
                "--ll-title-size": titleSize,
                "--ll-content-size": contentSize,
            }}
        />
    );
}
