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
    // JSON of the last uiState the widget itself emitted, so we can skip
    // re-applying the host's persisted echo of that same state (which would
    // otherwise fight the widget's own live interaction).
    const lastEmittedRef = useRef<string | null>(null);

    // Construct the core ONCE per `data`. Rebuilding on every uiState change
    // tears down the transient top-k popup / overlay DOM (which isn't part of
    // the serialized state), so the first click's popup would vanish ~500ms
    // later when the host persisted the selection and fed it back. Later
    // uiState changes are pushed into the existing instance via setState below.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Push later uiState changes into the existing core WITHOUT rebuilding, so
    // the transient popup/overlay survives. Skip echoes of what we just emitted.
    useEffect(() => {
        if (!coreRef.current || !uiState) return;
        if (lastEmittedRef.current === JSON.stringify(uiState)) return;
        // Apply darkMode with the same prop-wins precedence as construction.
        coreRef.current.setState({
            ...uiState,
            darkMode: darkMode ?? uiState.darkMode ?? null,
        });
    }, [uiState, darkMode]);

    // Sync dark mode imperatively (no rebuild).
    useEffect(() => {
        if (coreRef.current && darkMode !== undefined) {
            coreRef.current.setThemeMode(darkMode);
        }
    }, [darkMode]);

    // CSS custom properties
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty("--ll-title-size", titleSize);
            containerRef.current.style.setProperty("--ll-content-size", contentSize);
        }
    }, [titleSize, contentSize]);

    // State change callback. Record what we emit so the setState effect can
    // ignore the host's persisted echo of this exact state.
    const handleStateChange = useCallback(() => {
        if (!coreRef.current) return;
        const state = coreRef.current.getState();
        lastEmittedRef.current = JSON.stringify(state);
        onStateChange?.(state);
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
