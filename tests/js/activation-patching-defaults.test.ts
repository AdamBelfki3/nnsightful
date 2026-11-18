import { test } from "node:test";
import assert from "node:assert/strict";

import type { ActivationPatchingData } from "../../src/charts/types/activation-patching";
import { ActivationPatchingCore } from "../../src/charts/visualizations/activation-patching";

/** Payload of `ranks.length` tokens over the layers given; `lines` defaults to zeros. */
function payload(ranks: number[][], lines?: number[][]): ActivationPatchingData {
    return {
        ranks,
        lines: lines ?? ranks.map(r => r.map(() => 0)),
        prob_diffs: ranks.map(r => r.map(() => 0)),
        tokenLabels: ranks.map((_, i) => `t${i}`),
    };
}

test("default selection is source, clean and every token that reaches rank 1", () => {
    const data = payload([
        [5, 0, 0],
        [0, 3, 4],
        [2, 1, 1],
        [9, 9, 0],
        [7, 0, 6],
    ]);
    assert.deepEqual(ActivationPatchingCore.defaultSelection(data), [0, 1, 3, 4]);
});

test("source and clean stay selected when they never reach rank 1", () => {
    const data = payload([
        [4, 4],
        [3, 3],
        [0, 0],
    ]);
    assert.deepEqual(ActivationPatchingCore.defaultSelection(data), [0, 1, 2]);
});

test("rank-1 tokens are capped to those with the highest peak probability", () => {
    const cap = ActivationPatchingCore.MAX_DEFAULT_TOP_TOKENS;
    const extra = 4;
    const nTop = cap + extra;
    // Tokens 0 and 1 never top a layer; tokens 2.. each top one layer, and a
    // later token has a higher peak probability.
    const ranks = [[1], [1], ...Array.from({ length: nTop }, () => [0])];
    const lines = [[0], [0], ...Array.from({ length: nTop }, (_, k) => [(k + 1) / 100])];
    const kept = Array.from({ length: cap }, (_, k) => 2 + extra + k);
    assert.deepEqual(ActivationPatchingCore.defaultSelection(payload(ranks, lines)), [0, 1, ...kept]);
});

test("payloads without ranks fall back to source and clean", () => {
    const data = { lines: [[0.1], [0.2], [0.3]], tokenLabels: ["a", "b", "c"] } as ActivationPatchingData;
    assert.deepEqual(ActivationPatchingCore.defaultSelection(data), [0, 1]);
    assert.deepEqual(ActivationPatchingCore.defaultSelection(payload([[0]])), [0]);
});
