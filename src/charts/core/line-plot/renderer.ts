import type { LinePlotData, LinePlotLine, LinePlotOptions } from "../../types/line-plot";
import type { ChartGeometry, TooltipState } from "./tooltip";
import { LINE_COLORS } from "./colors";
import { resolveLines } from "./utils";

export interface ChartConfig {
    numLayers: number;
    minValue: number;
    maxValue: number;
    numLines: number;
}

/** Round to a nice display threshold (used for autoScale) */
function niceMax(p: number): number {
    if (p >= 0.95) return 1.0;
    const niceValues = [0.003, 0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1.0];
    for (const v of niceValues) {
        if (p <= v) return v;
    }
    return 1.0;
}

export function computeChartConfig(
    data: LinePlotData,
    options: LinePlotOptions,
    overlay?: LinePlotLine | null,
): ChartConfig | null {
    const resolved = resolveLines(data);

    const numLayers = resolved.length > 0
        ? resolved[0].values.length
        : overlay?.values.length
            ?? data.xLabels?.length
            ?? 0;

    if (numLayers === 0) return null;

    const mode = options.mode || "probability";

    let minValue = options.minValue;
    let maxValue = options.maxValue;

    if (minValue === undefined || maxValue === undefined || options.autoScale) {
        // Collect all non-null values
        const allValues: number[] = [];
        for (const line of resolved) {
            if (!line.isOverlay) {
                for (const v of line.values) {
                    if (v !== null) allValues.push(v);
                }
            }
        }
        if (overlay) {
            for (const v of overlay.values) {
                if (v !== null) allValues.push(v);
            }
        }

        if (allValues.length === 0) {
            return { numLayers, minValue: 0, maxValue: 1, numLines: resolved.length };
        }

        let dataMin = Infinity, dataMax = -Infinity;
        for (const v of allValues) { if (v < dataMin) dataMin = v; if (v > dataMax) dataMax = v; }

        if (options.centerYAxisAtZero) {
            const absMax = Math.max(Math.abs(dataMin), Math.abs(dataMax));
            const paddedMax = absMax * 1.1;
            minValue = -paddedMax;
            maxValue = paddedMax;
        } else {
            if (minValue === undefined) {
                minValue = mode === "probability" ? 0 : Math.floor(dataMin * 0.9);
            }
            if (maxValue === undefined || options.autoScale) {
                if (mode === "rank") {
                    maxValue = Math.ceil(dataMax * 1.1);
                } else if (mode === "probability") {
                    maxValue = options.autoScale ? niceMax(Math.max(dataMax, 0.001)) : Math.min(dataMax * 1.1, 1.0);
                } else {
                    maxValue = dataMax * 1.1;
                }
            }
        }
    }

    return { numLayers, minValue, maxValue, numLines: resolved.length };
}

export function drawChart(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    data: LinePlotData,
    options: LinePlotOptions,
    config: ChartConfig,
    hiddenLines: Set<number>,
    tooltip: TooltipState | null,
    overlay?: LinePlotLine | null,
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
    let xRangeStart = options.xRangeStart ?? 0;
    if (xRangeStart >= config.numLayers - 1) {
        console.warn(`xRangeStart (${xRangeStart}) is >= numLayers-1 (${config.numLayers - 1}), clamping to 0`);
        xRangeStart = 0;
    }
    const showDataPoints = options.showDataPoints ?? true;

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
    const effectiveRange = (config.numLayers - 1) - xRangeStart;
    const xScale = (layerIdx: number) => {
        if (effectiveRange <= 0) return margin.left + chartWidth / 2;
        return margin.left + ((layerIdx - xRangeStart) / effectiveRange) * chartWidth;
    };

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

    const hasCustomXLabels = data.xLabels && data.xLabels.length > 0;
    const layerStep = Math.max(1, Math.ceil(config.numLayers / 8));

    for (let i = 0; i < config.numLayers; i += layerStep) {
        const x = xScale(i);
        if (x < margin.left - 5 || x > margin.left + chartWidth + 5) continue;
        const label = hasCustomXLabels ? String(data.xLabels![i] ?? i) : i.toString();
        ctx.fillText(label, x, margin.top + chartHeight + 12);
    }
    if ((config.numLayers - 1) % layerStep !== 0) {
        const lastLabel = hasCustomXLabels
            ? String(data.xLabels![config.numLayers - 1] ?? (config.numLayers - 1))
            : (config.numLayers - 1).toString();
        ctx.fillText(
            lastLabel,
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

    // Resolve lines
    const resolved = resolveLines(data);

    // Draw helper for a single line path with null-gap support
    function drawLinePath(
        values: (number | null)[],
        color: string,
        lineWidth: number,
        dashPattern?: string,
        alpha?: number,
    ): void {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        if (alpha !== undefined) ctx.globalAlpha = alpha;
        if (dashPattern) {
            ctx.setLineDash(dashPattern.split(",").map(Number));
        } else {
            ctx.setLineDash([]);
        }

        let penDown = false;
        for (let layerIdx = 0; layerIdx < values.length; layerIdx++) {
            const value = values[layerIdx];
            if (value === null) {
                penDown = false;
                continue;
            }
            const x = xScale(layerIdx);
            const y = yScale(value);
            if (!penDown) {
                ctx.moveTo(x, y);
                penDown = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        if (alpha !== undefined) ctx.globalAlpha = 1;
    }

    // Draw lines
    const fadedColor = darkMode ? "#3f3f46" : "#d4d4d8";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Hidden lines (faded)
    resolved.forEach((line, lineIdx) => {
        if (!hiddenLines.has(lineIdx) || line.isOverlay) return;
        drawLinePath(line.values, fadedColor, 2, undefined, 0.35);
    });

    // Active lines (non-overlay)
    resolved.forEach((line, lineIdx) => {
        if (hiddenLines.has(lineIdx) || line.isOverlay) return;
        const color = line.color ?? LINE_COLORS[lineIdx % LINE_COLORS.length];

        // Shadow
        drawLinePath(line.values, color, 4, line.dashPattern, 0.15);

        // Main line
        drawLinePath(line.values, color, 2, line.dashPattern);

        // Data points
        if (showDataPoints) {
            line.values.forEach((value, layerIdx) => {
                if (value === null) return;
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
        }
    });

    // Overlay lines from richLines
    resolved.forEach((line, lineIdx) => {
        if (!line.isOverlay || hiddenLines.has(lineIdx)) return;
        const color = line.color ?? "#999";
        drawLinePath(line.values, color, 1.5, line.dashPattern ?? "4,2", 0.7);
    });

    // External overlay (from setOverlay)
    if (overlay) {
        const color = overlay.color ?? "#999";
        drawLinePath(overlay.values, color, 1.5, overlay.dashPattern ?? "4,2", 0.7);
        // No data points for overlay
    }

    return geometry;
}
