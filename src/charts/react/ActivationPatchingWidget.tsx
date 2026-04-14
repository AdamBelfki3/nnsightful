import { useEffect, useRef } from "react";
import type { ActivationPatchingData, ActivationPatchingMode } from "../types/activation-patching";
import { ActivationPatchingCore } from "../visualizations/activation-patching";

interface ActivationPatchingWidgetProps {
    data: ActivationPatchingData;
    mode?: ActivationPatchingMode;
    darkMode?: boolean;
    title?: string;
    transparentBackground?: boolean;
    selectedTokens?: number[];
    defaultSelectedTokens?: number[];
    onTokenSelectionChange?: (indices: number[]) => void;
    onModeChange?: (mode: ActivationPatchingMode) => void;
}

export function ActivationPatchingWidget({
    data,
    mode = "probability",
    darkMode = false,
    title,
    transparentBackground = false,
    selectedTokens,
    defaultSelectedTokens,
    onTokenSelectionChange,
    onModeChange,
}: ActivationPatchingWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<ActivationPatchingCore | null>(null);
    const onChangeRef = useRef(onTokenSelectionChange);
    onChangeRef.current = onTokenSelectionChange;
    const onModeChangeRef = useRef(onModeChange);
    onModeChangeRef.current = onModeChange;

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        coreRef.current = new ActivationPatchingCore(containerRef.current, data, {
            mode,
            darkMode,
            title,
            transparentBackground,
            selectedTokens,
            defaultSelectedTokens,
            onTokenSelectionChange: (indices) => onChangeRef.current?.(indices),
            onModeChange: (m) => onModeChangeRef.current?.(m),
        });
        return () => {
            coreRef.current?.destroy();
            coreRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Sync mode from external prop
    useEffect(() => {
        coreRef.current?.setMode(mode);
    }, [mode]);

    useEffect(() => {
        coreRef.current?.setThemeMode(darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (title !== undefined) {
            coreRef.current?.setTitle(title);
        }
    }, [title]);

    // Sync external selectedTokens changes
    useEffect(() => {
        if (selectedTokens !== undefined) {
            coreRef.current?.setSelectedTokens(selectedTokens);
        }
    }, [selectedTokens]);

    if (!data.lines || data.lines.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a" }}>
                No data to display
            </div>
        );
    }

    return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 300 }} />;
}
