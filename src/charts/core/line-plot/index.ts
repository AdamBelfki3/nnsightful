import type { LinePlotData, LinePlotOptions, LinePlotWidgetInterface } from "../../types/line-plot";
import { computeChartConfig, drawChart, type ChartConfig } from "./renderer";
import {
    createTooltipElement,
    hitTest,
    updateTooltipDOM,
    type ChartGeometry,
    type TooltipState,
} from "./tooltip";
import { createLegendElement, updateLegend } from "./legend";

export class LinePlotCore implements LinePlotWidgetInterface {
    private container: HTMLElement;
    private chartContainer: HTMLElement;
    private canvas: HTMLCanvasElement;
    private tooltipEl: HTMLDivElement;
    private legendEl: HTMLDivElement;

    private data: LinePlotData;
    private options: LinePlotOptions;
    private hiddenLines = new Set<number>();
    private tooltip: TooltipState | null = null;
    private geometry: ChartGeometry | null = null;
    private config: ChartConfig | null = null;
    private resizeObserver: ResizeObserver;
    private destroyed = false;
    private lastWidth = 0;
    private lastHeight = 0;

    constructor(container: HTMLElement, data: LinePlotData, options: LinePlotOptions = {}) {
        this.container = container;
        this.data = data;
        this.options = { darkMode: false, ...options };

        // Root layout: flex row
        container.style.display = "flex";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.minHeight = "300px";
        container.style.gap = "12px";
        container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        container.style.overflow = "hidden";

        // Chart area
        this.chartContainer = document.createElement("div");
        this.chartContainer.style.cssText = "position:relative;flex:1;min-width:0;overflow:hidden;";
        container.appendChild(this.chartContainer);

        this.canvas = document.createElement("canvas");
        this.canvas.style.cssText = "display:block;width:100%;height:100%;cursor:crosshair;";
        this.chartContainer.appendChild(this.canvas);

        // Tooltip
        this.tooltipEl = createTooltipElement(this.chartContainer);

        // Legend
        this.legendEl = createLegendElement(this.options.darkMode ?? false);
        container.appendChild(this.legendEl);

        // Events
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave);

        // Resize — only redraw when container size actually changes to avoid infinite loops
        // (drawChart sets canvas.width/height which can re-trigger ResizeObserver)
        this.resizeObserver = new ResizeObserver((entries) => {
            if (this.destroyed) return;
            const entry = entries[0];
            if (!entry) return;
            const w = Math.round(entry.contentRect.width);
            const h = Math.round(entry.contentRect.height);
            if (w === this.lastWidth && h === this.lastHeight) return;
            this.lastWidth = w;
            this.lastHeight = h;
            this.draw();
        });
        this.resizeObserver.observe(this.chartContainer);

        this.draw();
        this.updateLegendUI();
    }

    private draw(): void {
        this.config = computeChartConfig(this.data, this.options);
        if (!this.config) return;

        this.geometry = drawChart(
            this.canvas,
            this.chartContainer,
            this.data,
            this.options,
            this.config,
            this.hiddenLines,
            this.tooltip,
        );
    }

    private updateLegendUI(): void {
        const labels = this.data.labels || this.data.lines.map((_, i) => `Line ${i + 1}`);
        updateLegend(this.legendEl, labels, this.hiddenLines, this.options.darkMode ?? false, {
            onToggle: (idx) => this.toggleLine(idx),
        });
    }

    private handleMouseMove = (e: MouseEvent): void => {
        if (!this.config || !this.geometry) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.tooltip = hitTest(
            mouseX,
            mouseY,
            this.data,
            this.options,
            this.geometry,
            this.hiddenLines,
            this.config.numLayers,
            this.config.minValue,
            this.config.maxValue,
        );

        updateTooltipDOM(this.tooltipEl, this.tooltip, this.geometry.width, this.options.darkMode ?? false);
        this.draw();
    };

    private handleMouseLeave = (): void => {
        this.tooltip = null;
        updateTooltipDOM(this.tooltipEl, null, 0, false);
        this.draw();
    };

    // Public API

    setData(data: LinePlotData): void {
        this.data = data;
        this.hiddenLines.clear();
        this.tooltip = null;
        this.draw();
        this.updateLegendUI();
    }

    setOptions(opts: Partial<LinePlotOptions>): void {
        this.options = { ...this.options, ...opts };
        this.draw();
        this.updateLegendUI();
    }

    setDarkMode(dark: boolean): void {
        this.options.darkMode = dark;
        this.draw();
        this.updateLegendUI();
    }

    toggleLine(lineIdx: number): void {
        if (this.hiddenLines.has(lineIdx)) {
            this.hiddenLines.delete(lineIdx);
        } else {
            this.hiddenLines.add(lineIdx);
        }
        this.draw();
        this.updateLegendUI();
    }

    destroy(): void {
        this.destroyed = true;
        this.resizeObserver.disconnect();
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
        this.container.innerHTML = "";
    }
}
