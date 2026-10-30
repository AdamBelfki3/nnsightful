// Browsers cap a canvas at 16384 px per side (Chrome, Firefox) and around
// 268M px in total; past either the canvas silently comes out blank. Stay a
// little under both.
export const MAX_CANVAS_SIDE = 16000;
export const MAX_CANVAS_AREA = 250_000_000;

/**
 * The pixel density to rasterize a `width` × `height` (CSS px) snapshot at:
 * the requested `scale`, lowered as far as needed for the canvas to stay
 * within the browser's limits (so a very tall heatmap comes out at a lower
 * density instead of blank). Never below a tiny positive floor.
 */
export function clampScale(width: number, height: number, scale: number): number {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const fits = Math.min(
        MAX_CANVAS_SIDE / w,
        MAX_CANVAS_SIDE / h,
        Math.sqrt(MAX_CANVAS_AREA / (w * h)),
    );
    return Math.max(0.01, Math.min(scale > 0 ? scale : 1, fits));
}
