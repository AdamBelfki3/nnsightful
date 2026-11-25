import { test } from "node:test";
import assert from "node:assert/strict";

import { SectionBands } from "../../src/charts/core/line-plot/sections";
import type { LinePlotSection } from "../../src/charts/types/line-plot";

/** A looped model's 16 visits: two before the loop, three passes of four, two after. */
const SECTIONS: LinePlotSection[] = [
    { start: 0, end: 1, label: "prelude" },
    { start: 2, end: 5, label: "pass 1", dividers: [4] },
    { start: 6, end: 9, label: "pass 2", dividers: [8] },
    { start: 10, end: 13, label: "pass 3", dividers: [12] },
    { start: 14, end: 15, label: "coda" },
];

test("bands reach half a step past their ends and stop at the plot's edges", () => {
    const bands = SectionBands.layout(SECTIONS, 0, 15, 100, 150);
    assert.deepEqual(bands.map((b) => [b.x0, b.x1]), [[100, 115], [115, 155], [155, 195], [195, 235], [235, 250]]);
});

test("every other section is tinted and dividers fall between two indices", () => {
    const bands = SectionBands.layout(SECTIONS, 0, 15, 100, 150);
    assert.deepEqual(bands.map((b) => b.tinted), [false, true, false, true, false]);
    assert.deepEqual(bands.map((b) => b.dividers), [[], [135], [175], [215], []]);
});

test("a plot that starts later drops what it no longer shows and keeps the tints", () => {
    const bands = SectionBands.layout(SECTIONS, 6, 15, 0, 90);
    assert.deepEqual(bands.map((b) => b.label), ["pass 2", "pass 3", "coda"]);
    assert.deepEqual(bands.map((b) => b.tinted), [false, true, false]);
    assert.deepEqual(bands[0], { x0: 0, x1: 35, label: "pass 2", tinted: false, dividers: [15] });
});

test("a divider at a section's start or outside it is ignored", () => {
    const [band] = SectionBands.layout([{ start: 2, end: 5, dividers: [2, 4, 6] }], 0, 10, 0, 100);
    assert.deepEqual(band.dividers, [35]);
});

test("a single point has no room for bands", () => {
    assert.deepEqual(SectionBands.layout(SECTIONS, 3, 3, 0, 100), []);
});

test("the label at an index is its section's, and labels ask for room", () => {
    assert.equal(SectionBands.labelAt(SECTIONS, 8), "pass 2");
    assert.equal(SectionBands.labelAt(SECTIONS, 16), undefined);
    assert.equal(SectionBands.labelAt(null, 3), undefined);
    assert.equal(SectionBands.labelled(SECTIONS), true);
    assert.equal(SectionBands.labelled([{ start: 0, end: 3 }]), false);
});
