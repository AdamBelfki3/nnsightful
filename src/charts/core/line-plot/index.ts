import type { LinePlotData, LinePlotLine, LinePlotOptions, LinePlotWidgetInterface } from "../../types/line-plot";
import { computeChartConfig, drawChart, type ChartConfig } from "./renderer";
import {
    createTooltipElement,
    hitTest,
    updateTooltipDOM,
    type ChartGeometry,
    type TooltipState,
} from "./tooltip";
import { createLegendElement, updateLegend } from "./legend";
import { PlotLayout } from "./layout";

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
    private overlay: LinePlotLine | null = null;
    private compact = false;

    constructor(container: HTMLElement, data: LinePlotData, options: LinePlotOptions = {}) {
        this.container = container;
        this.data = data;
        this.options = { darkMode: false, ...options };
        this.compact = PlotLayout.compact(container.clientWidth);

        // Root layout: the plot beside its legend, or under it when compact
        container.style.display = "flex";
        container.style.width = "100%";
        container.style.height = "100%";
        if (!container.style.minHeight) {
            container.style.minHeight = "300px";
        }
        this.arrange();
        container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        container.style.overflow = "hidden";

        // Chart area
        this.chartContainer = document.createElement("div");
        this.chartContainer.style.cssText = "position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;";
        container.appendChild(this.chartContainer);

        const interactive = this.options.interactive !== false;
        this.canvas = document.createElement("canvas");
        this.canvas.style.cssText = `display:block;width:100%;height:100%;cursor:${interactive ? "crosshair" : "default"};`;
        this.chartContainer.appendChild(this.canvas);

        // Tooltip
        this.tooltipEl = createTooltipElement(this.chartContainer);

        // Legend
        this.legendEl = createLegendElement(this.options.darkMode ?? false, this.compact);
        if (this.options.legendPosition === "none") {
            this.legendEl.style.display = "none";
        }
        container.appendChild(this.legendEl);

        // Events
        if (interactive) {
            this.canvas.addEventListener("mousemove", this.handleMouseMove);
            this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
        }

        // Resize — the root's width picks the layout; the canvas is redrawn only
        // when its own size actually changes, to avoid infinite loops
        this.resizeObserver = new ResizeObserver((entries) => {
            if (this.destroyed) return;
            for (const entry of entries) {
                if (entry.target === this.container) {
                    this.fit(entry.contentRect.width);
                    continue;
                }
                const w = Math.round(entry.contentRect.width);
                const h = Math.round(entry.contentRect.height);
                if (w === this.lastWidth && h === this.lastHeight) continue;
                this.lastWidth = w;
                this.lastHeight = h;
                this.draw();
            }
        });
        this.resizeObserver.observe(this.chartContainer);
        this.resizeObserver.observe(this.container);

        this.draw();
        this.updateLegendUI();
    }

    /** Lays the plot out again when `width`, its room with its legend,
     *  crosses into or out of the compact layout. */
    private fit(width: number): void {
        const compact = PlotLayout.compact(width);
        if (compact === this.compact) return;
        this.compact = compact;
        this.arrange();
        this.draw();
        this.updateLegendUI();
    }

    /** Puts the legend beside the plot, or in a row over it when compact. */
    private arrange(): void {
        this.container.style.flexDirection = this.compact ? "column" : "row";
        this.container.style.gap = this.compact ? "4px" : "12px";
    }

    private getLabels(): string[] {
        if (this.data.richLines && this.data.richLines.length > 0) {
            return this.data.richLines.map((rl, i) => rl.label ?? `Line ${i + 1}`);
        }
        return this.data.labels || (this.data.lines ?? []).map((_, i) => `Line ${i + 1}`);
    }

    private draw(): void {
        this.config = computeChartConfig(this.data, this.options, this.overlay);
        if (!this.config) return;

        this.geometry = drawChart(
            this.canvas,
            this.chartContainer,
            this.data,
            this.options,
            this.config,
            this.hiddenLines,
            this.tooltip,
            this.overlay,
            this.compact,
        );
    }

    private updateLegendUI(): void {
        if (this.options.legendPosition === "none") {
            this.legendEl.style.display = "none";
            return;
        }
        const labels = this.getLabels();
        if (labels.length === 0) {
            this.legendEl.style.display = "none";
            return;
        }
        this.legendEl.style.display = "";
        const callbacks = this.options.interactive === false ? null : {
            onToggle: (idx: number) => this.toggleLine(idx),
            onRemove: this.options.onLineRemoved ? (idx: number) => {
                this.removeLine(idx, true);
                this.draw();
                this.updateLegendUI();
                this.options.onLineRemoved!(idx);
            } : undefined,
        };
        updateLegend(
            this.legendEl,
            labels,
            this.hiddenLines,
            this.options.darkMode ?? false,
            callbacks,
            this.data,
            this.compact,
        );
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

        updateTooltipDOM(
            this.tooltipEl,
            this.tooltip,
            this.geometry.width,
            this.options.darkMode ?? false,
            this.data.xLabels,
            this.options.xAxisLabel,
            this.options.mode,
            this.data.sections,
        );
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
        this.overlay = null;
        this.draw();
        this.updateLegendUI();
    }

    setOptions(opts: Partial<LinePlotOptions>): void {
        this.options = { ...this.options, ...opts };
        if (opts.legendPosition !== undefined) {
            if (opts.legendPosition === "none") {
                this.legendEl.style.display = "none";
            } else {
                this.legendEl.style.display = "";
            }
        }
        this.draw();
        this.updateLegendUI();
    }

    setThemeMode(dark: boolean): void {
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

    addLine(line: LinePlotLine): number {
        if (!this.data.richLines) {
            // Convert existing lines to richLines
            this.data.richLines = (this.data.lines ?? []).map((values, i) => ({
                values,
                label: this.data.labels?.[i],
            }));
        }
        this.data.richLines.push(line);
        this.draw();
        this.updateLegendUI();
        return this.data.richLines.length - 1;
    }

    removeLine(lineIdx: number, skipRedraw = false): void {
        if (this.data.richLines) {
            this.data.richLines.splice(lineIdx, 1);
        } else {
            this.data.lines?.splice(lineIdx, 1);
            if (this.data.labels) this.data.labels.splice(lineIdx, 1);
        }
        // Adjust hidden lines indices
        const newHidden = new Set<number>();
        for (const idx of this.hiddenLines) {
            if (idx < lineIdx) newHidden.add(idx);
            else if (idx > lineIdx) newHidden.add(idx - 1);
        }
        this.hiddenLines = newHidden;
        if (!skipRedraw) {
            this.draw();
            this.updateLegendUI();
        }
    }

    setOverlay(line: LinePlotLine | null): void {
        this.overlay = line;
        this.draw();
    }

    destroy(): void {
        this.destroyed = true;
        this.resizeObserver.disconnect();
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
        this.container.innerHTML = "";
    }
}
