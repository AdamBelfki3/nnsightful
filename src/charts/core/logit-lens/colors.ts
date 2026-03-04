export const PALETTE = [
    "#2196F3", "#e91e63", "#4CAF50", "#FF9800",
    "#9C27B0", "#00BCD4", "#F44336", "#8BC34A",
];

export const LINE_STYLES = [
    { dash: "", name: "solid" },
    { dash: "8,4", name: "dashed" },
    { dash: "2,3", name: "dotted" },
    { dash: "8,4,2,4", name: "dash-dot" },
];

export function probToColor(prob: number, baseColor: string | null, darkMode: boolean): string {
    if (baseColor) {
        const hex = baseColor.replace("#", "");
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
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
