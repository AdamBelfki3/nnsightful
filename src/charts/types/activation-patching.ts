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

export interface ActivationPatchingOptions {
    mode?: ActivationPatchingMode;
    darkMode?: boolean;
    title?: string;
    transparentBackground?: boolean;
}
