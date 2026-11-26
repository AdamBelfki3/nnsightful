import { test } from "node:test";
import assert from "node:assert/strict";

import { PlotLayout } from "../../src/charts/core/line-plot/layout";
import { SectionBands } from "../../src/charts/core/line-plot/sections";

/** Every character six pixels wide. */
const measure = (text: string) => text.length * 6;

test("a plot is compact below the threshold, and never at no width", () => {
    assert.equal(PlotLayout.compact(PlotLayout.COMPACT_BELOW - 1), true);
    assert.equal(PlotLayout.compact(PlotLayout.COMPACT_BELOW), false);
    assert.equal(PlotLayout.compact(0), false);
});

test("a wide plot keeps its margins, growing only for a wrapped title and section labels", () => {
    assert.deepEqual(PlotLayout.margin(false, 0, 0, 30), { top: 24, right: 24, bottom: 56, left: 72 });
    assert.deepEqual(PlotLayout.margin(false, 1, 0, 30), { top: 48, right: 24, bottom: 56, left: 72 });
    assert.equal(PlotLayout.margin(false, 2, 16, 30).top, 48 + PlotLayout.TITLE_LINE + 16);
});

test("a compact plot's left margin follows its y labels", () => {
    const narrow = PlotLayout.margin(true, 0, 0, 24);
    const wide = PlotLayout.margin(true, 0, 0, 40);
    assert.equal(narrow.left, 50);
    assert.equal(wide.left - narrow.left, 16);
    assert.equal(PlotLayout.margin(true, 0, 0, 0).left, 40);
    assert.ok(narrow.right < PlotLayout.margin(false, 0, 0, 24).right);
});

test("markers shrink, then go, as points crowd", () => {
    assert.equal(PlotLayout.markerRadius(14), 3.5);
    assert.equal(PlotLayout.markerRadius(7), 2.5);
    assert.equal(PlotLayout.markerRadius(5), 0);
    assert.equal(PlotLayout.markerRadius(Infinity), 3.5);
});

test("x ticks keep their step while the labels clear one another", () => {
    assert.deepEqual(PlotLayout.xTicks(48, 28, 12), [0, 6, 12, 18, 24, 30, 36, 42, 47]);
    assert.deepEqual(PlotLayout.xTicks(13, 30, 12), [0, 2, 4, 6, 8, 10, 12]);
});

test("crowded x ticks widen their step, and the last label wins its place", () => {
    assert.deepEqual(PlotLayout.xTicks(48, 3.5, 12), [0, 6, 12, 18, 24, 30, 36, 47]);
    assert.deepEqual(PlotLayout.xTicks(48, 2, 12), [0, 12, 24, 36, 47]);
});

test("x ticks of one point, or none", () => {
    assert.deepEqual(PlotLayout.xTicks(1, Infinity, 12), [0]);
    assert.deepEqual(PlotLayout.xTicks(0, 10, 12), []);
});

test("a title wraps at spaces and clips what is left on its last line", () => {
    assert.deepEqual(PlotLayout.wrap("Token Probability", 200, 2, measure), ["Token Probability"]);
    assert.deepEqual(PlotLayout.wrap("Activation Patching: Token Probability by Layer", 160, 2, measure), [
        "Activation Patching: Token",
        "Probability by Layer",
    ]);
    assert.deepEqual(PlotLayout.wrap("one two three four five six", 60, 2, measure), ["one two", "three fou…"]);
});

test("clipped text keeps a readable start, or is dropped", () => {
    assert.equal(PlotLayout.clip("PRELUDE", 42, measure), "PRELUDE");
    assert.equal(PlotLayout.clip("PRELUDE", 30, measure), "PREL…");
    assert.equal(PlotLayout.clip("PRELUDE", 20, measure), null);
});

test("a section's label shortens to fit its band", () => {
    assert.equal(SectionBands.caption("pass 2", 40, measure), "PASS 2");
    assert.equal(SectionBands.caption("pass 2", 20, measure), "P2");
    assert.equal(SectionBands.caption("pass 12", 10, measure), null);
    assert.equal(SectionBands.caption("prelude", 30, measure), "PREL…");
    assert.equal(SectionBands.caption("prelude", 12, measure), null);
});

/** A phone's plot of a looped model: narrow first and last bands, wide passes. */
const BANDS = [
    { x0: 50, x1: 80, label: "prelude", tinted: false, dividers: [] },
    { x0: 80, x1: 145, label: "pass 1", tinted: true, dividers: [] },
    { x0: 145, x1: 210, label: "pass 2", tinted: false, dividers: [] },
    { x0: 210, x1: 275, label: "pass 3", tinted: true, dividers: [] },
    { x0: 275, x1: 304, label: "coda", tinted: false, dividers: [] },
];

test("a label wider than its band keeps its text where its neighbours leave room", () => {
    const captions = SectionBands.captions(BANDS, 2, 314, measure);
    assert.deepEqual(captions.map((c) => c.text), ["PRELUDE", "PASS 1", "PASS 2", "PASS 3", "CODA"]);
    assert.deepEqual(captions.map((c) => c.x), [65, 112.5, 177.5, 242.5, 289.5]);
});

test("a label is shifted off center to stay clear of the next one", () => {
    const [prelude, pass] = SectionBands.captions(BANDS.slice(0, 2), 2, 314, (text) => text.length * 8);
    assert.equal(pass.x, 112.5);
    assert.equal(prelude.text, "PRELUDE");
    assert.equal(prelude.x + 28, 112.5 - 24 - SectionBands.LABEL_GAP);
});

test("labels with no room past their bands are shortened, or dropped", () => {
    const tight = [
        { x0: 0, x1: 30, label: "prelude", tinted: false, dividers: [] },
        { x0: 30, x1: 60, label: "pass 1", tinted: true, dividers: [] },
        { x0: 60, x1: 70, label: "coda", tinted: false, dividers: [] },
    ];
    const captions = SectionBands.captions(tight, 0, 70, measure);
    assert.deepEqual(captions.map((c) => c.text), ["PRE…", "P1"]);
    assert.deepEqual(captions.map((c) => c.x), [15, 45]);
});

test("a section without a label draws none and leaves its band to its neighbours", () => {
    const bands = [
        { x0: 0, x1: 20, label: "prelude", tinted: false, dividers: [] },
        { x0: 20, x1: 80, tinted: true, dividers: [] },
    ];
    assert.deepEqual(SectionBands.captions(bands, 0, 80, measure), [{ text: "PRELUDE", x: 21 }]);
});
