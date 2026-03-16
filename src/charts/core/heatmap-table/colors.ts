/**
 * Color utilities for heatmap table cells.
 * probToColor blends a base color with white/dark based on probability.
 */
export function probToColor(prob: number, baseColor: string | null, darkMode: boolean): string {
    if (baseColor) {
        const hex = baseColor.replace("#", "");
        if (hex.length < 6) return darkMode ? "rgb(30,30,30)" : "rgb(255,255,255)";
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const blend = prob;

        if (darkMode) {
            const darkBase = 30;
            return `rgb(${Math.round(darkBase + (r - darkBase) * blend)},${Math.round(darkBase + (g - darkBase) * blend)},${Math.round(darkBase + (b - darkBase) * blend)})`;
        } else {
            return `rgb(${Math.round(255 - (255 - r) * blend)},${Math.round(255 - (255 - g) * blend)},${Math.round(255 - (255 - b) * blend)})`;
        }
    }

    if (darkMode) {
        const rVal = Math.round(30 + (100 - 30) * prob * 0.8);
        const gVal = Math.round(30 + (150 - 30) * prob * 0.6);
        const bVal = Math.round(30 + (255 - 30) * prob);
        return `rgb(${rVal},${gVal},${bVal})`;
    }
    const rVal = Math.round(255 * (1 - prob * 0.8));
    const gVal = Math.round(255 * (1 - prob * 0.6));
    return `rgb(${rVal},${gVal},255)`;
}
