import type { LogitLensData, LogitLensUIState, LogitLensWidgetInterface } from "../../types/logit-lens";
import { createWidget } from "./widget";

/**
 * LogitLensCore - Creates and manages a LogitLens visualization widget.
 *
 * This is a framework-agnostic class that renders into a container element.
 * It wraps the full-featured LogitLens widget engine (table + heatmap + SVG chart).
 */
export class LogitLensCore {
    private widget: LogitLensWidgetInterface | null = null;
    private styleEl: HTMLStyleElement | null = null;

    constructor(
        container: HTMLElement | string,
        data: LogitLensData,
        uiState?: Partial<LogitLensUIState>,
    ) {
        const result = createWidget(container, data, uiState);
        if (result) {
            this.widget = result.widget;
            this.styleEl = result.styleEl;
        }
    }

    getState(): LogitLensUIState {
        return this.widget?.getState() ?? ({} as LogitLensUIState);
    }

    setState(state: Partial<LogitLensUIState>): void {
        this.widget?.setState(state);
    }

    setData(data: LogitLensData): void {
        this.widget?.setData(data);
    }

    setTitle(title: string): void {
        this.widget?.setTitle(title);
    }

    setDarkMode(dark: boolean): void {
        this.widget?.setDarkMode(dark);
    }

    getDarkMode(): boolean {
        return this.widget?.getDarkMode() ?? false;
    }

    hasEntropyData(): boolean {
        return this.widget?.hasEntropyData() ?? false;
    }

    hasRankData(): boolean {
        return this.widget?.hasRankData() ?? false;
    }

    linkColumnsTo(other: LogitLensCore): void {
        if (this.widget && other.widget) {
            this.widget.linkColumnsTo(other.widget);
        }
    }

    unlinkColumns(other: LogitLensCore): void {
        if (this.widget && other.widget) {
            this.widget.unlinkColumns(other.widget);
        }
    }

    on(event: string, callback: (data: unknown) => void): void {
        this.widget?.on(event, callback);
    }

    off(event: string, callback: (data: unknown) => void): void {
        this.widget?.off(event, callback);
    }

    destroy(): void {
        this.widget?.destroy();
        this.widget = null;
        if (this.styleEl?.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
            this.styleEl = null;
        }
    }
}
