import type { LinePlotData, LinePlotOptions } from "../../types/line-plot";
import type { ChartGeometry, TooltipState } from "./tooltip";
import { LINE_COLORS } from "./colors";

export interface ChartConfig {
    numLayers: number;
    minValue: number;
    maxValue: number;
    numLines: number;
}

export function computeChartConfig(
    data: LinePlotData,
    options: LinePlotOptions,
): ChartConfig | null {
    if (!data.lines || data.lines.length === 0) return null;

    const numLayers = data.lines[0]?.length || 0;
    const mode = options.mode || "probability";

    let minValue = options.minValue;
    let maxValue = options.maxValue;

    if (minValue === undefined || maxValue === undefined) {
        const allValues = data.lines.flat();
        const dataMin = Math.min(...allValues);
        const dataMax = Math.max(...allValues);

        if (options.centerYAxisAtZero) {
            const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax));
            const paddedMax = absMax * 1.1;
            minValue = -paddedMax;
            maxValue = paddedMax;
        } else {
            if (minValue === undefined) {
                minValue = mode === "probability" ? 0 : Math.floor(dataMin * 0.9);
            }
            if (maxValue === undefined) {
                if (mode === "rank") {
                    maxValue = Math.ceil(dataMax * 1.1);
                } else if (mode === "probability") {
                    maxValue = Math.min(dataMax * 1.1, 1.0);
                } else {
                    maxValue = dataMax * 1.1;
                }
            }
        }
    }

    return { numLayers, minValue, maxValue, numLines: data.lines.length };
}

export function drawChart(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    data: LinePlotData,
    options: LinePlotOptions,
    config: ChartConfig,
    hiddenLines: Set<number>,
    tooltip: TooltipState | null,
): ChartGeometry {
    const ctx = canvas.getContext("2d")!;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const darkMode = options.darkMode ?? false;
    const title = options.title;
    const mode = options.mode || "probability";
    const invertYAxis = options.invertYAxis ?? false;
    const centerYAxisAtZero = options.centerYAxisAtZero ?? false;
    const xAxisLabel = options.xAxisLabel || "Layer";
    const yAxisLabel = options.yAxisLabel || "Probability";

    const margin = { top: title ? 48 : 24, right: 24, bottom: 56, left: 72 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const geometry: ChartGeometry = { margin, chartWidth, chartHeight, width, height };

    const colors = {
        background: darkMode ? "#0a0a0a" : "#fafafa",
        text: "#71717a",
        textMuted: darkMode ? "#52525b" : "#a1a1aa",
        grid: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        axis: darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        titleText: darkMode ? "#e4e4e7" : "#27272a",
    };

    // Clear
    if (options.transparentBackground) {
        ctx.clearRect(0, 0, width, height);
    } else {
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, width, height);
    }

    // Title
    if (title) {
        ctx.fillStyle = colors.titleText;
        ctx.font = "500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(title, margin.left, 28);
    }

    // Scale functions
    const xScale = (layerIdx: number) =>
        config.numLayers <= 1
            ? margin.left + chartWidth / 2
            : margin.left + (layerIdx / (config.numLayers - 1)) * chartWidth;

    const yScale = (value: number) => {
        const normalized = (value - config.minValue) / (config.maxValue - config.minValue);
        return invertYAxis
            ? margin.top + normalized * chartHeight
            : margin.top + chartHeight - normalized * chartHeight;
    };

    // Grid lines
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    const yTicks: number[] = [];
    const range = config.maxValue - config.minValue;
    const numTicks = 5;

    if (mode === "rank") {
        for (let i = 0; i < numTicks; i++) {
            yTicks.push(Math.round(config.minValue + (i / (numTicks - 1)) * range));
        }
    } else {
        for (let i = 0; i < numTicks; i++) {
            yTicks.push(config.minValue + (i / (numTicks - 1)) * range);
        }
    }

    yTicks.forEach((tick) => {
        const y = yScale(tick);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
    });

    ctx.setLineDash([]);

    // Zero line for centered axis
    if (centerYAxisAtZero) {
        const zeroY = yScale(0);
        ctx.beginPath();
        ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1.5;
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(margin.left + chartWidth, zeroY);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // Y-axis labels
    ctx.fillStyle = colors.text;
    ctx.font = "400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    yTicks.forEach((tick) => {
        const y = yScale(tick);
        let label: string;
        if (mode === "probability") {
            label = tick.toFixed(2);
        } else if (mode === "prob_diff") {
            label = tick >= 0 ? `+${tick.toFixed(2)}` : tick.toFixed(2);
        } else {
            label = Math.round(tick).toString();
        }
        ctx.fillText(label, margin.left - 16, y);
    });

    // X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const layerStep = Math.max(1, Math.ceil(config.numLayers / 8));
    for (let i = 0; i < config.numLayers; i += layerStep) {
        ctx.fillText(i.toString(), xScale(i), margin.top + chartHeight + 12);
    }
    if ((config.numLayers - 1) % layerStep !== 0) {
        ctx.fillText(
            (config.numLayers - 1).toString(),
            xScale(config.numLayers - 1),
            margin.top + chartHeight + 12,
        );
    }

    // Axes (L-shape)
    ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = "500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(xAxisLabel.toUpperCase(), margin.left + chartWidth / 2, height - 16);

    ctx.save();
    ctx.translate(14, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(yAxisLabel.toUpperCase(), 0, 0);
    ctx.restore();

    // Draw lines
    const fadedColor = darkMode ? "#3f3f46" : "#d4d4d8";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Hidden lines (faded)
    data.lines.forEach((line, lineIdx) => {
        if (!hiddenLines.has(lineIdx)) return;
        ctx.beginPath();
        ctx.strokeStyle = fadedColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.35;
        line.forEach((value, layerIdx) => {
            const x = xScale(layerIdx);
            const y = yScale(value);
            if (layerIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
    });

    // Active lines
    data.lines.forEach((line, lineIdx) => {
        if (hiddenLines.has(lineIdx)) return;
        const color = LINE_COLORS[lineIdx % LINE_COLORS.length];

        // Shadow
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.15;
        line.forEach((value, layerIdx) => {
            const x = xScale(layerIdx);
            const y = yScale(value);
            if (layerIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Main line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        line.forEach((value, layerIdx) => {
            const x = xScale(layerIdx);
            const y = yScale(value);
            if (layerIdx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Data points
        line.forEach((value, layerIdx) => {
            const x = xScale(layerIdx);
            const y = yScale(value);
            const isHovered =
                tooltip?.lineIdx === lineIdx && tooltip?.layerIdx === layerIdx;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = isHovered ? 2 : 1.5;
            ctx.arc(x, y, isHovered ? 5 : 3.5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = darkMode ? "#18181b" : "#ffffff";
            ctx.arc(x, y, isHovered ? 3.5 : 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    return geometry;
}
