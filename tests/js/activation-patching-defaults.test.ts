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

test("the selection is capped, keeping source, clean and the highest peak probabilities", () => {
    const cap = ActivationPatchingCore.MAX_DEFAULT_TOKENS;
    const extra = 4;
    const nTop = cap - 2 + extra;
    // Tokens 0 and 1 never top a layer; tokens 2.. each top one layer, and a
    // later token has a higher peak probability.
    const ranks = [[1], [1], ...Array.from({ length: nTop }, () => [0])];
    const lines = [[0], [0], ...Array.from({ length: nTop }, (_, k) => [(k + 1) / 100])];
    const kept = Array.from({ length: cap - 2 }, (_, k) => 2 + extra + k);
    const selection = ActivationPatchingCore.defaultSelection(payload(ranks, lines));
    assert.equal(selection.length, cap);
    assert.deepEqual(selection, [0, 1, ...kept]);
});

test("source and clean take two of the capped slots when they reach rank 1 too", () => {
    const cap = ActivationPatchingCore.MAX_DEFAULT_TOKENS;
    const ranks = Array.from({ length: cap + 5 }, () => [0]);
    const lines = ranks.map((_, i) => [i / 100]);
    const selection = ActivationPatchingCore.defaultSelection(payload(ranks, lines));
    assert.deepEqual(selection, [0, 1, ...Array.from({ length: cap - 2 }, (_, k) => 7 + k)]);
});

test("payloads without ranks fall back to source and clean", () => {
    const data = { lines: [[0.1], [0.2], [0.3]], tokenLabels: ["a", "b", "c"] } as ActivationPatchingData;
    assert.deepEqual(ActivationPatchingCore.defaultSelection(data), [0, 1]);
    assert.deepEqual(ActivationPatchingCore.defaultSelection(payload([[0]])), [0]);
});
