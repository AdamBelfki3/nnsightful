import type { LinePlotData, LinePlotOptions } from "../../types/line-plot";
import { LINE_COLORS } from "./colors";
import { renderTokenHTML } from "./utils";

export interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    lineIdx: number;
    layerIdx: number;
    value: number;
    label: string;
    color: string;
}

export interface ChartGeometry {
    margin: { top: number; right: number; bottom: number; left: number };
    chartWidth: number;
    chartHeight: number;
    width: number;
    height: number;
}

export function createTooltipElement(container: HTMLElement): HTMLDivElement {
    const el = document.createElement("div");
    el.style.cssText =
        "position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;" +
        "transform-origin:center center;";
    container.appendChild(el);
    return el;
}

export function hitTest(
    mouseX: number,
    mouseY: number,
    data: LinePlotData,
    options: LinePlotOptions,
    geometry: ChartGeometry,
    hiddenLines: Set<number>,
    numLayers: number,
    minValue: number,
    maxValue: number,
): TooltipState | null {
    const { margin, chartWidth, chartHeight } = geometry;

    if (
        mouseX < margin.left ||
        mouseX > margin.left + chartWidth ||
        mouseY < margin.top ||
        mouseY > margin.top + chartHeight
    ) {
        return null;
    }

    const labels = data.labels || data.lines.map((_, i) => `Line ${i + 1}`);
    let nearest: TooltipState | null = null;
    let minDist = Infinity;
    const maxDist = 20;

    for (let lineIdx = 0; lineIdx < data.lines.length; lineIdx++) {
        if (hiddenLines.has(lineIdx)) continue;
        const line = data.lines[lineIdx];

        for (let layerIdx = 0; layerIdx < line.length; layerIdx++) {
            const value = line[layerIdx];
            const x =
                numLayers <= 1
                    ? margin.left + chartWidth / 2
                    : margin.left + (layerIdx / (numLayers - 1)) * chartWidth;
            const normalized = (value - minValue) / (maxValue - minValue);
            const y = options.invertYAxis
                ? margin.top + normalized * chartHeight
                : margin.top + chartHeight - normalized * chartHeight;

            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            if (dist < minDist && dist < maxDist) {
                minDist = dist;
                nearest = {
                    visible: true,
                    x,
                    y,
                    lineIdx,
                    layerIdx,
                    value,
                    label: labels[lineIdx] || `Line ${lineIdx + 1}`,
                    color: LINE_COLORS[lineIdx % LINE_COLORS.length],
                };
            }
        }
    }

    return nearest;
}

export function updateTooltipDOM(
    el: HTMLDivElement,
    tip: TooltipState | null,
    totalWidth: number,
    darkMode: boolean,
): void {
    if (!tip) {
        el.style.opacity = "0";
        return;
    }

    const bg = darkMode ? "#27272a" : "#fff";
    const border = darkMode ? "#3f3f46" : "#e4e4e7";
    const fg = darkMode ? "#fafafa" : "#18181b";
    const muted = darkMode ? "#a1a1aa" : "#71717a";

    const flipX = tip.x > totalWidth / 2;
    const tx = flipX ? "calc(-100% - 12px)" : "12px";

    el.style.cssText =
        `position:absolute;pointer-events:none;z-index:50;opacity:1;` +
        `left:${tip.x}px;top:${tip.y}px;transform:translate(${tx},-50%);`;

    el.innerHTML = `
        <div style="background:${bg};border:1px solid ${border};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${tip.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${fg};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${renderTokenHTML(tip.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${muted}">Layer</span>
                    <span style="font-weight:500;color:${fg}">${tip.layerIdx}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${muted}">Value</span>
                    <span style="font-weight:500;color:${fg}">${tip.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`;
}
