import type { LogitLensData, LogitLensUIState, LogitLensWidgetInterface } from "../../types/logit-lens";
import { createWidget } from "./widget";

/**
 * LogitLensCore - Creates and manages a LogitLens visualization widget.
 *
 * This is a framework-agnostic class that renders into a container element.
 * It wraps the full-featured LogitLens widget engine (table + heatmap + SVG chart).
 */
export class LogitLensCore implements LogitLensWidgetInterface {
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

    setThemeMode(dark: boolean): void {
        this.widget?.setThemeMode(dark);
    }

    getThemeMode(): boolean {
        return this.widget?.getThemeMode() ?? false;
    }

    hasEntropyData(): boolean {
        return this.widget?.hasEntropyData() ?? false;
    }

    hasRankData(): boolean {
        return this.widget?.hasRankData() ?? false;
    }

    linkColumnsTo(other: LogitLensWidgetInterface): void {
        if (this.widget) {
            this.widget.linkColumnsTo(other);
        }
    }

    unlinkColumns(other: LogitLensWidgetInterface): void {
        if (this.widget) {
            this.widget.unlinkColumns(other);
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
