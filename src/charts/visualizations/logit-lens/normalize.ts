import type { LogitLensData } from "../../types/logit-lens";

/**
 * Internal V1 cell data structure used by the widget rendering
 */
export interface CellData {
    token: string;
    prob: number;
    trajectory: number[];
    topk: Array<{ token: string; prob: number; trajectory: number[] }>;
}

/**
 * Normalized V1 data format used internally by the widget
 */
export interface NormalizedData {
    layers: number[];
    tokens: string[];
    cells: CellData[][];
    meta: Record<string, unknown>;
}

export interface NormalizeResult {
    normalized: NormalizedData;
    v2Data: LogitLensData | null;
}

/**
 * Convert V2 compact format to V1 internal format.
 * V1 has a `cells` array with per-position, per-layer data.
 */
export function normalizeData(data: LogitLensData): NormalizeResult {
    // Already in v1 format (has cells)
    const anyData = data as unknown as Record<string, unknown>;
    if (anyData.cells) {
        if (!anyData.tokens && anyData.input) {
            anyData.tokens = anyData.input;
        }
        return { normalized: anyData as unknown as NormalizedData, v2Data: null };
    }

    const nLayers = data.layers.length;
    const nPositions = data.input.length;
    const cells: CellData[][] = [];

    for (let pos = 0; pos < nPositions; pos++) {
        const posData: CellData[] = [];
        const trackedAtPos = data.tracked[pos];

        for (let li = 0; li < nLayers; li++) {
            const topkTokens = data.topk[li][pos];
            const topkList: Array<{ token: string; prob: number; trajectory: number[] }> = [];

            for (let ki = 0; ki < topkTokens.length; ki++) {
                const tok = topkTokens[ki];
                const trajectory = trackedAtPos[tok] || [];
                const prob = trajectory[li] || 0;
                topkList.push({ token: tok, prob, trajectory });
            }

            const top1 = topkList[0] || { token: "", prob: 0, trajectory: [] };
            posData.push({
                token: top1.token,
                prob: top1.prob,
                trajectory: top1.trajectory,
                topk: topkList,
            });
        }
        cells.push(posData);
    }

    const normalized: NormalizedData = {
        layers: data.layers,
        tokens: data.input,
        cells,
        meta: (data.meta as Record<string, unknown>) || {},
    };

    return { normalized, v2Data: data };
}
