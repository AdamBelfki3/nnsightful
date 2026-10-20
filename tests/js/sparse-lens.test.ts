import { test } from "node:test";
import assert from "node:assert/strict";

import type { LogitLensData } from "../../src/charts/types/logit-lens";
import type { HeatmapCollapsedSection } from "../../src/charts/types/heatmap-table";
import { densifyLogitLensData, normalizeData, uncomputedSections } from "../../src/charts/visualizations/logit-lens/normalize";
import { HeatmapTableCore } from "../../src/charts/core/heatmap-table";

import llDense from "./fixtures/logit_lens_dense.json";
import llSparse from "./fixtures/logit_lens_sparse.json";
import jlDense from "./fixtures/j_lens_dense.json";
import jlSparse from "./fixtures/j_lens_sparse.json";

const LL_DENSE = llDense as unknown as LogitLensData;
const LL_SPARSE = llSparse as unknown as LogitLensData;
const JL_DENSE = jlDense as unknown as LogitLensData;
const JL_SPARSE = jlSparse as unknown as LogitLensData;

/** The densified sparse payload holds the dense run's rows at `positions` and empties elsewhere. */
function assertDensifiedMatches(sparse: LogitLensData, dense: LogitLensData) {
    const nRows = dense.input.length + (dense.completion?.length ?? 0);
    const kept = new Set(sparse.positions!);
    const { data, computedRows } = densifyLogitLensData(sparse);

    assert.deepEqual(computedRows, [...kept].sort((a, b) => a - b));
    assert.equal(data.positions, null);
    assert.deepEqual(data.input, dense.input);
    assert.deepEqual(data.completion, dense.completion);
    assert.equal(data.tracked.length, nRows);
    data.tracked.forEach((t, r) => assert.deepEqual(t, kept.has(r) ? dense.tracked[r] : {}));
    data.topk.forEach((layer, li) => {
        assert.equal(layer.length, nRows);
        layer.forEach((cell, r) => assert.deepEqual(cell, kept.has(r) ? dense.topk[li][r] : []));
    });
    data.entropy!.forEach((layer, li) => {
        layer.forEach((v, r) => assert.equal(v, kept.has(r) ? dense.entropy![li][r] : 0));
    });

    // The widget's cells for computed rows equal the dense run's.
    const sparseNorm = normalizeData(sparse);
    const denseNorm = normalizeData(dense);
    assert.deepEqual(sparseNorm.v2Data, data);
    assert.deepEqual(sparseNorm.normalized.tokens, denseNorm.normalized.tokens);
    for (const r of kept) assert.deepEqual(sparseNorm.normalized.cells[r], denseNorm.normalized.cells[r]);
    for (let r = 0; r < nRows; r++) {
        if (!kept.has(r)) assert.ok(sparseNorm.normalized.cells[r].every((c) => c.token === "" && c.topk.length === 0));
    }
}

test("a sparse logit-lens payload densifies onto the dense run's rows", () => {
    assert.deepEqual(LL_SPARSE.positions, [1, 4, 5, 6, 11]);
    assertDensifiedMatches(LL_SPARSE, LL_DENSE);
});

test("a sparse j-lens payload densifies across prompt + completion rows", () => {
    assert.deepEqual(JL_SPARSE.positions, [0, 10, 12, 13]);
    assert.equal(JL_SPARSE.completion!.length, 2);
    assertDensifiedMatches(JL_SPARSE, JL_DENSE);
});

test("dense payloads pass through untouched", () => {
    for (const dense of [LL_DENSE, JL_DENSE]) {
        const { data, computedRows } = densifyLogitLensData(dense);
        assert.equal(data, dense);
        assert.equal(computedRows, null);
        assert.equal(normalizeData(dense).normalized.computedRows, null);
        assert.deepEqual(uncomputedSections(normalizeData(dense).normalized), []);
    }
});

test("uncomputed rows become one locked section per gap", () => {
    const locked = (rows: [number, number][]) =>
        rows.map(([start, end]) => ({ start, end, collapsed: true, locked: true, label: "not computed" }));
    assert.deepEqual(uncomputedSections(normalizeData(LL_SPARSE).normalized), locked([[0, 0], [2, 3], [7, 10]]));
    assert.deepEqual(uncomputedSections(normalizeData(JL_SPARSE).normalized), locked([[1, 9], [11, 11]]));
});

test("locked sections render as bands that never expand", () => {
    const locked = uncomputedSections(normalizeData(LL_SPARSE).normalized)
        .map((s) => ({ ...s, collapsed: false }));
    const plan = HeatmapTableCore.planRows(12, locked);
    assert.deepEqual(plan.map((p) => (p.kind === "row" ? p.row : `${p.kind}:${p.start}-${p.end}`)), [
        "band:0-0", 1, "band:2-3", 4, 5, 6, "band:7-10", 11,
    ]);
    assert.ok(plan.every((p) => p.kind !== "band" || p.locked));
});

test("host sections merged with locked ones keep their indices", () => {
    // j-lens sparse rows: computed 0, 10, 12, 13; locked 1-9 and 11.
    const locked = uncomputedSections(normalizeData(JL_SPARSE).normalized);
    const host: HeatmapCollapsedSection[] = [
        { start: 12, end: 13, collapsed: true },  // 0: plain collapsed band
        { start: 0, end: 3, collapsed: false },   // 1: expanded, overlaps locked 1-9
        { start: 4, end: 8, collapsed: false },   // 2: entirely uncomputed → dropped
        { start: 9, end: 11, collapsed: true },   // 3: collapsed over 9, 10, 11
    ];
    const plan = HeatmapTableCore.planRows(14, host.concat(locked));
    assert.deepEqual(plan, [
        { kind: "handle", start: 0, end: 3, index: 1, shown: 1 },
        { kind: "row", row: 0 },
        { kind: "band", start: 1, end: 8, index: 4, locked: true, label: "not computed", shown: 0 },
        { kind: "band", start: 9, end: 11, index: 3, locked: false, label: undefined, shown: 1 },
        { kind: "band", start: 12, end: 13, index: 0, locked: false, label: undefined, shown: 2 },
    ]);

    // Expanding host section 3 reveals its computed row; its locked rows stay banded.
    host[3] = { ...host[3], collapsed: false };
    const expanded = HeatmapTableCore.planRows(14, host.concat(locked));
    assert.deepEqual(expanded.slice(3), [
        { kind: "handle", start: 9, end: 11, index: 3, shown: 1 },
        { kind: "band", start: 9, end: 9, index: 4, locked: true, label: "not computed", shown: 0 },
        { kind: "row", row: 10 },
        { kind: "band", start: 11, end: 11, index: 5, locked: true, label: "not computed", shown: 0 },
        { kind: "band", start: 12, end: 13, index: 0, locked: false, label: undefined, shown: 2 },
    ]);
});
