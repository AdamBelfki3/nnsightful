import type { BaseWidgetInterface } from "./base";
import type { LinePlotSection } from "./line-plot";

/**
 * Data types for the Activation Patching visualization
 */

export interface ActivationPatchingData {
    lines: number[][];
    ranks: number[][];
    prob_diffs: number[][];
    tokenLabels: string[];
    /** Spans of the layer axis the plot marks, such as a looped model's
     *  passes. Absent or null for a model with nothing to mark. */
    sections?: LinePlotSection[] | null;
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
    /** false: a static rendering — the plot and its legend only, without the
     *  mode bar and token selector. Default true. Fixed at construction. */
    interactive?: boolean;
    /** Canvas resolution for the plot; see LinePlotOptions. */
    pixelRatio?: number;
}
