import { test } from "node:test";
import assert from "node:assert/strict";

import { HeatmapTableCore } from "../../src/charts/core/heatmap-table";

const ROW = 30;
const BAND = 16;

test("a window shows as many rows as fit, from the requested one", () => {
    const heights = Array(100).fill(ROW);
    assert.deepEqual(HeatmapTableCore.windowItems(heights, 40, 24 * ROW), { from: 40, to: 64 });
    assert.deepEqual(HeatmapTableCore.windowItems(heights, 0, 24 * ROW), { from: 0, to: 24 });
});

test("a window running past the end is moved back to end at the last row", () => {
    const heights = Array(100).fill(ROW);
    assert.deepEqual(HeatmapTableCore.windowItems(heights, 90, 24 * ROW), { from: 76, to: 100 });
    assert.deepEqual(HeatmapTableCore.windowItems(heights, Number.MAX_SAFE_INTEGER, 24 * ROW), { from: 76, to: 100 });
});

test("bands count by their own height, so more items fit around them", () => {
    // row, band, row, row, band, row …
    const heights = [ROW, BAND, ROW, ROW, BAND, ROW, ROW, ROW];
    assert.deepEqual(HeatmapTableCore.windowItems(heights, 0, 3 * ROW), { from: 0, to: 3 }); // 30+16+30=76 ≤ 90, next row would be 106
    assert.deepEqual(HeatmapTableCore.windowItems(heights, 1, 3 * ROW), { from: 1, to: 4 }); // 16+30+30=76
});

test("a window always shows at least one item, even one taller than it", () => {
    assert.deepEqual(HeatmapTableCore.windowItems([ROW, ROW], 1, 10), { from: 1, to: 2 });
    assert.deepEqual(HeatmapTableCore.windowItems([], 0, 100), { from: 0, to: 0 });
});

test("a plan item's rows are its own row, or the range a band stands in for", () => {
    const plan = HeatmapTableCore.planRows(10, [{ start: 2, end: 5, collapsed: true }]);
    assert.deepEqual(plan.map((it) => HeatmapTableCore.itemRows(it)), [[0, 0], [1, 1], [2, 5], [6, 6], [7, 7], [8, 8], [9, 9]]);
});
