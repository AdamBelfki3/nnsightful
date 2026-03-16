import type { ActivationPatchingData, ActivationPatchingMode, ActivationPatchingOptions } from "../../types/activation-patching";
import type { LinePlotData, LinePlotOptions } from "../../types/line-plot";
import { LinePlotCore } from "../../core/line-plot";

/**
 * ActivationPatchingCore wraps LinePlotCore with activation-patching-specific defaults.
 * It manages mode switching between probability, rank, and prob_diff views.
 */
export class ActivationPatchingCore {
    private linePlot: LinePlotCore;
    private apData: ActivationPatchingData;
    private mode: ActivationPatchingMode;
    private darkMode: boolean;
    private title?: string;

    constructor(container: HTMLElement, data: ActivationPatchingData, options: ActivationPatchingOptions = {}) {
        this.apData = data;
        this.mode = options.mode ?? "probability";
        this.darkMode = options.darkMode ?? false;
        this.title = options.title;

        const plotData = this.buildPlotData();
        const plotOptions = this.buildPlotOptions();

        this.linePlot = new LinePlotCore(container, plotData, plotOptions);
    }

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

    private buildPlotOptions(): LinePlotOptions {
        const plotOptions: LinePlotOptions = {
            darkMode: this.darkMode,
            title: this.title,
            mode: this.mode,
            xAxisLabel: "Layer",
        };

        if (this.mode === "rank") {
            plotOptions.invertYAxis = true;
            plotOptions.yAxisLabel = "Rank";
        } else if (this.mode === "prob_diff") {
            plotOptions.centerYAxisAtZero = true;
            plotOptions.yAxisLabel = "Probability Difference";
        } else {
            plotOptions.yAxisLabel = "Probability";
        }

        return plotOptions;
    }

    setMode(mode: ActivationPatchingMode): void {
        this.mode = mode;
        this.linePlot.setData(this.buildPlotData());
        this.linePlot.setOptions(this.buildPlotOptions());
    }

    setData(data: ActivationPatchingData): void {
        this.apData = data;
        this.linePlot.setData(this.buildPlotData());
    }

    setDarkMode(dark: boolean): void {
        this.darkMode = dark;
        this.linePlot.setDarkMode(dark);
    }

    setTitle(title: string): void {
        this.title = title;
        this.linePlot.setOptions(this.buildPlotOptions());
    }

    destroy(): void {
        this.linePlot.destroy();
    }
}
