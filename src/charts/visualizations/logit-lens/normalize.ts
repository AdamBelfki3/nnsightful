import type { LogitLensData } from "../../types/logit-lens";
import type { HeatmapCollapsedSection } from "../../types/heatmap-table";

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
    /** Sorted rows the lens was computed at; null when every row was. */
    computedRows: number[] | null;
}

export interface NormalizeResult {
    normalized: NormalizedData;
    /** The V2 payload, densified so every per-row array is indexed by row. */
    v2Data: LogitLensData | null;
}

export interface DensifyResult {
    data: LogitLensData;
    computedRows: number[] | null;
}

/** Row labels of a payload: the prompt (`input`) plus any generated tokens. */
function rowTokens(data: LogitLensData): string[] {
    return data.completion && data.completion.length
        ? [...data.input, ...data.completion]
        : data.input;
}

/**
 * Expand a sparse payload (one whose `positions` doesn't list every row in
 * order) so `tracked`, `topk` and `entropy` are indexed by absolute row over
 * `input + completion`. Rows the lens wasn't computed at get `{}` tracked,
 * `[]` top-k cells and `0` entropy. Positions outside the rows are ignored.
 * Dense payloads are returned unchanged with `computedRows: null`.
 */
export function densifyLogitLensData(data: LogitLensData): DensifyResult {
    const positions = data.positions;
    const nRows = rowTokens(data).length;
    if (!positions || (positions.length === nRows && positions.every((p, i) => p === i))) {
        return { data, computedRows: null };
    }

    const source: (number | undefined)[] = new Array(nRows);
    positions.forEach((row, i) => {
        if (Number.isInteger(row) && row >= 0 && row < nRows && i < data.tracked.length) source[row] = i;
    });
    const rows = Array.from({ length: nRows }, (_, r) => r);
    const pick = <T>(sparse: T[] | undefined, r: number, empty: () => T): T => {
        const i = source[r];
        return i !== undefined && sparse && i < sparse.length ? sparse[i] : empty();
    };

    const dense: LogitLensData = {
        ...data,
        positions: null,
        tracked: rows.map((r) => pick(data.tracked, r, () => ({}))),
        topk: data.topk.map((layer) => rows.map((r) => pick(layer, r, () => [] as string[]))),
        entropy: data.entropy
            ? data.entropy.map((layer) => rows.map((r) => pick(layer, r, () => 0)))
            : data.entropy,
    };
    return { data: dense, computedRows: rows.filter((r) => source[r] !== undefined) };
}

/**
 * Locked collapsed sections covering the rows the lens wasn't computed at —
 * one per contiguous gap — so a sparse run shows only its computed rows.
 */
export function uncomputedSections(normalized: NormalizedData): HeatmapCollapsedSection[] {
    const computed = normalized.computedRows;
    if (!computed) return [];
    const nRows = normalized.tokens.length;
    const sections: HeatmapCollapsedSection[] = [];
    let next = 0;
    for (const row of [...computed, nRows]) {
        if (row > next) sections.push({ start: next, end: row - 1, collapsed: true, locked: true, label: "not computed" });
        next = row + 1;
    }
    return sections;
}

/**
 * Convert V2 compact format to V1 internal format.
 * V1 has a `cells` array with per-position, per-layer data. A sparse V2
 * payload is densified first (see densifyLogitLensData).
 */
export function normalizeData(data: LogitLensData): NormalizeResult {
    // Already in v1 format (has cells)
    const anyData = data as unknown as Record<string, unknown>;
    if (anyData.cells) {
        if (!anyData.tokens && anyData.input) {
            anyData.tokens = anyData.input;
        }
        if (anyData.computedRows === undefined) anyData.computedRows = null;
        return { normalized: anyData as unknown as NormalizedData, v2Data: null };
    }

    const { data: dense, computedRows } = densifyLogitLensData(data);
    const nLayers = dense.layers.length;
    const tokens = rowTokens(dense);
    const nPositions = tokens.length;
    const cells: CellData[][] = [];

    for (let pos = 0; pos < nPositions; pos++) {
        const posData: CellData[] = [];
        const trackedAtPos = dense.tracked[pos] ?? {};

        for (let li = 0; li < nLayers; li++) {
            const topkTokens = dense.topk[li]?.[pos] ?? [];
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
        layers: dense.layers,
        tokens,
        cells,
        meta: (dense.meta as Record<string, unknown>) || {},
        computedRows,
    };

    return { normalized, v2Data: dense };
}
