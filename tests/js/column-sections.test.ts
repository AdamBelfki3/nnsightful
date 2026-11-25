import { test } from "node:test";
import assert from "node:assert/strict";

import { HeatmapTableCore } from "../../src/charts/core/heatmap-table";
import type { HeatmapColumnSection } from "../../src/charts/types/heatmap-table";

/** A looped model's 48 visits: six before the loop, three passes of twelve, six after. */
const SECTIONS: HeatmapColumnSection[] = [
    { start: 0, end: 5, label: "prelude" },
    { start: 6, end: 17, label: "pass 1", dividers: [12] },
    { start: 18, end: 29, label: "pass 2", dividers: [24] },
    { start: 30, end: 41, label: "pass 3", dividers: [36] },
    { start: 42, end: 47, label: "coda" },
];

const every = (step: number, last = 47) => {
    const columns = [];
    for (let c = 0; c <= last; c += step) columns.push(c);
    if (columns[columns.length - 1] !== last) columns.push(last);
    return columns;
};

test("every column shown: a section spans its columns and its parts split at the divider", () => {
    const spans = HeatmapTableCore.columnSpans(every(1), SECTIONS);
    assert.deepEqual(spans.map((s) => [s.label, s.from, s.to]), [
        ["prelude", 0, 5], ["pass 1", 6, 17], ["pass 2", 18, 29], ["pass 3", 30, 41], ["coda", 42, 47],
    ]);
    assert.deepEqual(spans.map((s) => s.parts), [[6], [6, 6], [6, 6], [6, 6], [6]]);
});

test("sampled columns: spans follow the columns shown, not the indices", () => {
    // 0, 3, …, 45, 47
    const spans = HeatmapTableCore.columnSpans(every(3), SECTIONS);
    assert.deepEqual(spans.map((s) => [s.from, s.to]), [[0, 1], [2, 5], [6, 9], [10, 13], [14, 16]]);
    assert.deepEqual(spans.map((s) => s.parts), [[2], [2, 2], [2, 2], [2, 2], [3]]);
});

test("a window leaves out the sections and parts it shows no column of", () => {
    const spans = HeatmapTableCore.columnSpans([24, 26, 28, 30, 32, 34], SECTIONS);
    assert.deepEqual(spans, [
        { label: "pass 2", from: 0, to: 2, parts: [3] },
        { label: "pass 3", from: 3, to: 5, parts: [3] },
    ]);
});

test("a divider at a section's start or outside it cuts nothing", () => {
    const [span] = HeatmapTableCore.columnSpans(every(1, 9), [{ start: 2, end: 7, dividers: [2, 5, 8] }]);
    assert.deepEqual(span, { label: undefined, from: 2, to: 7, parts: [3, 3] });
});

test("no sections, no spans", () => {
    assert.deepEqual(HeatmapTableCore.columnSpans(every(1)), []);
});
