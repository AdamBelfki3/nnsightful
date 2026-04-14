import type { ActivationPatchingData, ActivationPatchingMode, ActivationPatchingOptions, ActivationPatchingWidgetInterface } from "../../types/activation-patching";
import type { LinePlotData, LinePlotOptions } from "../../types/line-plot";
import { LinePlotCore } from "../../core/line-plot";
import { LINE_COLORS } from "../../core/line-plot/colors";
import { createTokenSelector, updateTokenSelector, destroyTokenSelector, setsEqual } from "./token-selector";

const MODE_LABELS: Record<ActivationPatchingMode, string> = {
    probability: "Probability",
    prob_diff: "Prob \u0394",
    rank: "Rank",
};

const MODES: ActivationPatchingMode[] = ["probability", "prob_diff", "rank"];

/**
 * ActivationPatchingCore wraps LinePlotCore with activation-patching-specific defaults.
 * It manages mode switching, token selection, and renders built-in controls.
 */
export class ActivationPatchingCore implements ActivationPatchingWidgetInterface {
    private linePlot: LinePlotCore;
    private allData: ActivationPatchingData;
    private mode: ActivationPatchingMode;
    private darkMode: boolean;
    private transparentBackground: boolean;
    private title?: string;

    private container: HTMLElement;
    private modeBar: HTMLDivElement;
    private modeButtons: Map<ActivationPatchingMode, HTMLButtonElement> = new Map();
    private tokenSelectorEl: HTMLDivElement;

    private selectedTokens: Set<number>;
    private defaultTokens: Set<number>;
    private onTokenSelectionChange?: (indices: number[]) => void;
    private onModeChange?: (mode: ActivationPatchingMode) => void;

    constructor(container: HTMLElement, data: ActivationPatchingData, options: ActivationPatchingOptions = {}) {
        this.container = container;
        this.allData = data;
        this.mode = options.mode ?? "probability";
        this.darkMode = options.darkMode ?? false;
        this.transparentBackground = options.transparentBackground ?? false;
        this.title = options.title;
        this.onTokenSelectionChange = options.onTokenSelectionChange;
        this.onModeChange = options.onModeChange;

        const n = data.tokenLabels?.length ?? data.lines?.length ?? 0;
        const defaultArr = options.defaultSelectedTokens ?? Array.from({ length: Math.min(2, n) }, (_, i) => i);
        this.defaultTokens = new Set(defaultArr);
        this.selectedTokens = new Set(
            options.selectedTokens ?? defaultArr
        );

        // Outer layout: column with controls on top, chart below
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.width = "100%";
        container.style.height = "100%";

        // Mode toggle bar
        this.modeBar = this.createModeBar();
        container.appendChild(this.modeBar);

        // Token selector
        this.tokenSelectorEl = createTokenSelector(this.buildTokenSelectorConfig());
        container.appendChild(this.tokenSelectorEl);

        // Chart container takes remaining space
        const plotContainer = document.createElement("div");
        plotContainer.style.cssText = "flex:1;min-height:0;overflow:hidden;";
        container.appendChild(plotContainer);

        this.linePlot = new LinePlotCore(plotContainer, this.buildPlotData(), this.buildPlotOptions());

        // LinePlotCore sets height:100% which conflicts with flex:1.
        plotContainer.style.height = "auto";
    }

    // ── Token selector integration ───────────────────────────────────

    private buildTokenSelectorConfig() {
        return {
            allLabels: this.allData.tokenLabels ?? [],
            selectedIndices: this.selectedTokens,
            defaultIndices: this.defaultTokens,
            darkMode: this.darkMode,
            onChange: (indices: number[]) => this.handleTokenSelectionChange(indices),
        };
    }

    private handleTokenSelectionChange(indices: number[]): void {
        this.selectedTokens = new Set(indices);
        updateTokenSelector(this.tokenSelectorEl, this.buildTokenSelectorConfig());
        this.linePlot.setData(this.buildPlotData());
        this.onTokenSelectionChange?.(indices);
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
        const fgMuted = this.darkMode ? "rgba(250,250,250,0.5)" : "rgba(24,24,27,0.5)";
        const activeBg = "rgba(139,92,246,0.9)";

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

    private getModeLines(): number[][] {
        if (this.mode === "rank") return this.allData.ranks ?? [];
        if (this.mode === "prob_diff") return this.allData.prob_diffs ?? [];
        return this.allData.lines ?? [];
    }

    private buildPlotData(): LinePlotData {
        const modeLines = this.getModeLines();
        const labels = this.allData.tokenLabels ?? [];
        const sortedIndices = Array.from(this.selectedTokens).sort((a, b) => a - b);
        const isRank = this.mode === "rank";

        const richLines = sortedIndices
            .filter(i => i < modeLines.length)
            .map(i => ({
                // Ranks are 0-indexed from backend; shift to 1-indexed for display
                // so the y-axis starts at 1 (best prediction) and log(1)=0 works cleanly.
                values: isRank ? modeLines[i].map(v => v + 1) : modeLines[i],
                label: labels[i] ?? `Token ${i}`,
                // Color pinned to original token index (not display position) so each
                // token keeps a stable color regardless of which others are selected.
                color: LINE_COLORS[i % LINE_COLORS.length],
            }));

        return { richLines };
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
            logScale: false,
        };

        if (this.mode === "rank") {
            plotOptions.invertYAxis = true;
            plotOptions.logScale = true;
            plotOptions.yAxisLabel = "Rank (log)";
        } else if (this.mode === "prob_diff") {
            plotOptions.centerYAxisAtZero = true;
            plotOptions.yAxisLabel = "Prob \u0394 (Patched - Clean)";
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
        this.onModeChange?.(mode);
    }

    setData(data: ActivationPatchingData): void {
        this.allData = data;
        const n = data.tokenLabels?.length ?? data.lines?.length ?? 0;
        this.defaultTokens = new Set(Array.from({ length: Math.min(2, n) }, (_, i) => i));
        // Preserve existing selection if indices are still valid; fall back to defaults
        const valid = new Set([...this.selectedTokens].filter(i => i < n));
        this.selectedTokens = valid.size > 0 ? valid : new Set(this.defaultTokens);
        updateTokenSelector(this.tokenSelectorEl, this.buildTokenSelectorConfig());
        this.linePlot.setData(this.buildPlotData());
    }

    setThemeMode(dark: boolean): void {
        this.darkMode = dark;
        this.linePlot.setThemeMode(dark);
        this.updateModeBarUI();
        updateTokenSelector(this.tokenSelectorEl, this.buildTokenSelectorConfig());
    }

    setTitle(title: string): void {
        this.title = title;
        this.linePlot.setOptions(this.buildPlotOptions());
    }

    /** Programmatic selection update (does not fire onTokenSelectionChange). */
    setSelectedTokens(indices: number[]): void {
        const n = this.getModeLines().length;
        const newSet = new Set(indices.filter(i => i < n));
        if (setsEqual(newSet, this.selectedTokens)) return;
        this.selectedTokens = newSet;
        updateTokenSelector(this.tokenSelectorEl, this.buildTokenSelectorConfig());
        this.linePlot.setData(this.buildPlotData());
    }

    destroy(): void {
        destroyTokenSelector(this.tokenSelectorEl);
        this.linePlot.destroy();
        this.container.innerHTML = "";
    }
}
