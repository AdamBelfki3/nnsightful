import type { BaseWidgetInterface } from "./base";

/**
 * Data types for the Activation Patching visualization
 */

export interface ActivationPatchingData {
    lines: number[][];
    ranks: number[][];
    prob_diffs: number[][];
    tokenLabels: string[];
}

export type ActivationPatchingMode = "probability" | "rank" | "prob_diff";

export interface ActivationPatchingWidgetInterface extends BaseWidgetInterface<ActivationPatchingData> {
    setMode(mode: ActivationPatchingMode): void;
    setTitle(title: string): void;
    setSelectedTokens(indices: number[]): void;
}

export interface ActivationPatchingOptions {
    mode?: ActivationPatchingMode;
    darkMode?: boolean;
    title?: string;
    transparentBackground?: boolean;
    selectedTokens?: number[];
    defaultSelectedTokens?: number[];
    onTokenSelectionChange?: (indices: number[]) => void;
    onModeChange?: (mode: ActivationPatchingMode) => void;
}
