import { test } from "node:test";
import assert from "node:assert/strict";

import { clampScale, MAX_CANVAS_AREA, MAX_CANVAS_SIDE } from "../../src/charts/snapshot/scale";

test("a snapshot within canvas limits keeps the requested scale", () => {
    assert.equal(clampScale(880, 700, 2), 2);
    assert.equal(clampScale(880, 700, 3), 3);
});

test("a tall snapshot lowers its scale to fit the canvas side limit", () => {
    // 600 rows of a 30px heatmap
    const scale = clampScale(880, 18_000, 2);
    assert.ok(scale < 1);
    assert.ok(18_000 * scale <= MAX_CANVAS_SIDE);
});

test("a large snapshot lowers its scale to fit the canvas area limit", () => {
    const scale = clampScale(12_000, 12_000, 2);
    assert.ok(12_000 * scale * 12_000 * scale <= MAX_CANVAS_AREA);
    assert.ok(12_000 * scale <= MAX_CANVAS_SIDE);
});

test("degenerate sizes and scales stay positive", () => {
    assert.ok(clampScale(0, 0, 2) > 0);
    assert.equal(clampScale(100, 100, 0), 1);
    assert.equal(clampScale(100, 100, -3), 1);
});
