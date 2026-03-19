import type { ActivationPatchingData, ActivationPatchingMode, ActivationPatchingOptions } from "../../types/activation-patching";
import type { LinePlotData, LinePlotOptions } from "../../types/line-plot";
import { LinePlotCore } from "../../core/line-plot";

const MODE_LABELS: Record<ActivationPatchingMode, string> = {
    probability: "Probability",
    prob_diff: "Prob \u0394",
    rank: "Rank",
};

const MODES: ActivationPatchingMode[] = ["probability", "prob_diff", "rank"];

/**
 * ActivationPatchingCore wraps LinePlotCore with activation-patching-specific defaults.
 * It manages mode switching between probability, rank, and prob_diff views,
 * and renders a built-in mode toggle bar.
 */
export class ActivationPatchingCore {
    private linePlot: LinePlotCore;
    private apData: ActivationPatchingData;
    private mode: ActivationPatchingMode;
    private darkMode: boolean;
    private transparentBackground: boolean;
    private title?: string;

    private container: HTMLElement;
    private modeBar: HTMLDivElement;
    private modeButtons: Map<ActivationPatchingMode, HTMLButtonElement> = new Map();

    constructor(container: HTMLElement, data: ActivationPatchingData, options: ActivationPatchingOptions = {}) {
        this.container = container;
        this.apData = data;
        this.mode = options.mode ?? "probability";
        this.darkMode = options.darkMode ?? false;
        this.transparentBackground = options.transparentBackground ?? false;
        this.title = options.title;

        // Outer layout: column with mode bar on top, chart below
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.width = "100%";
        container.style.height = "100%";

        // Mode toggle bar
        this.modeBar = this.createModeBar();
        container.appendChild(this.modeBar);

        // Chart container takes remaining space
        const plotContainer = document.createElement("div");
        plotContainer.style.cssText = "flex:1;min-height:0;overflow:hidden;";
        container.appendChild(plotContainer);

        const plotData = this.buildPlotData();
        const plotOptions = this.buildPlotOptions();

        this.linePlot = new LinePlotCore(plotContainer, plotData, plotOptions);

        // LinePlotCore sets height:100% on its container, which conflicts with
        // flex:1 sizing inside our column layout. Override to let flex handle it.
        plotContainer.style.height = "auto";
    }

    // ── Mode bar UI ──────────────────────────────────────────────────

    private createModeBar(): HTMLDivElement {
        const bar = document.createElement("div");
        this.applyModeBarStyles(bar);

        for (const mode of MODES) {
            const btn = document.createElement("button");
            btn.textContent = MODE_LABELS[mode];
            this.applyModeButtonStyles(btn, mode === this.mode);

            btn.addEventListener("click", () => this.setMode(mode));
            btn.addEventListener("mouseenter", () => {
                if (mode !== this.mode) {
                    btn.style.background = this.darkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)";
                }
            });
            btn.addEventListener("mouseleave", () => {
                if (mode !== this.mode) {
                    btn.style.background = "transparent";
                }
            });

            bar.appendChild(btn);
            this.modeButtons.set(mode, btn);
        }

        return bar;
    }

    private applyModeBarStyles(el: HTMLDivElement): void {
        const border = this.darkMode ? "rgba(63,63,70,0.4)" : "rgba(228,228,231,0.4)";
        el.style.cssText =
            `display:inline-flex;align-items:center;gap:0;padding:2px;` +
            `border-radius:6px;border:1px solid ${border};align-self:flex-start;` +
            `margin-bottom:6px;flex-shrink:0;`;
    }

    private applyModeButtonStyles(btn: HTMLButtonElement, isActive: boolean): void {
        const fg = this.darkMode ? "rgba(250,250,250,0.8)" : "rgba(24,24,27,0.8)";
        const fgMuted = this.darkMode ? "rgba(250,250,250,0.5)" : "rgba(24,24,27,0.5)";
        const activeBg = this.darkMode ? "rgba(139,92,246,0.9)" : "rgba(139,92,246,0.9)";

        btn.style.cssText =
            `padding:3px 10px;border-radius:4px;border:none;cursor:pointer;` +
            `font-size:12px;font-weight:500;transition:all 0.15s;` +
            `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;` +
            `background:${isActive ? activeBg : "transparent"};` +
            `color:${isActive ? "#fff" : fgMuted};`;
    }

    private updateModeBarUI(): void {
        this.applyModeBarStyles(this.modeBar);
        for (const [mode, btn] of this.modeButtons) {
            this.applyModeButtonStyles(btn, mode === this.mode);
        }
    }

    // ── Data/options builders ────────────────────────────────────────

    private buildPlotData(): LinePlotData {
        let lines: number[][];
        if (this.mode === "rank") {
            lines = this.apData.ranks;
        } else if (this.mode === "prob_diff") {
            lines = this.apData.prob_diffs;
        } else {
            lines = this.apData.lines;
        }
        return {
            lines,
            labels: this.apData.tokenLabels,
        };
    }

    private getModeTitle(): string {
        if (this.mode === "rank") return "Activation Patching: Token Rank by Layer";
        if (this.mode === "prob_diff") return "Activation Patching: Probability Difference by Layer";
        return "Activation Patching: Token Probability by Layer";
    }

    private buildPlotOptions(): LinePlotOptions {
        const plotOptions: LinePlotOptions = {
            darkMode: this.darkMode,
            transparentBackground: this.transparentBackground,
            title: this.title ?? this.getModeTitle(),
            mode: this.mode,
            xAxisLabel: "Layer",
            invertYAxis: false,
            centerYAxisAtZero: false,
        };

        if (this.mode === "rank") {
            plotOptions.invertYAxis = true;
            plotOptions.yAxisLabel = "Rank";
        } else if (this.mode === "prob_diff") {
            plotOptions.centerYAxisAtZero = true;
            plotOptions.yAxisLabel = "Prob Δ (Patched - Clean)";
        } else {
            plotOptions.yAxisLabel = "Probability";
        }

        return plotOptions;
    }

    // ── Public API ───────────────────────────────────────────────────

    setMode(mode: ActivationPatchingMode): void {
        if (mode === this.mode) return;
        this.mode = mode;
        this.linePlot.setData(this.buildPlotData());
        this.linePlot.setOptions(this.buildPlotOptions());
        this.updateModeBarUI();
    }

    setData(data: ActivationPatchingData): void {
        this.apData = data;
        this.linePlot.setData(this.buildPlotData());
    }

    setDarkMode(dark: boolean): void {
        this.darkMode = dark;
        this.linePlot.setDarkMode(dark);
        this.updateModeBarUI();
    }

    setTitle(title: string): void {
        this.title = title;
        this.linePlot.setOptions(this.buildPlotOptions());
    }

    destroy(): void {
        this.linePlot.destroy();
        this.container.innerHTML = "";
    }
}
