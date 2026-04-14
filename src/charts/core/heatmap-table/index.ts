import type { HeatmapTableData, HeatmapTableOptions, HeatmapTableWidgetInterface } from "../../types/heatmap-table";
import { buildTableHTML } from "./renderer";
import { injectHeatmapStyles } from "./styles";

let heatmapIdCounter = 0;

export class HeatmapTableCore implements HeatmapTableWidgetInterface {
    private container: HTMLElement;
    private table: HTMLTableElement;
    private data: HeatmapTableData;
    private options: HeatmapTableOptions;
    private uid: string;
    private styleEl: HTMLStyleElement;
    private destroyed = false;

    constructor(container: HTMLElement, data: HeatmapTableData, options: HeatmapTableOptions = {}) {
        this.container = container;
        this.data = data;
        this.options = { cellWidth: 44, rowHeaderWidth: 100, darkMode: false, ...options };
        this.uid = "hm_" + (++heatmapIdCounter) + "_" + Date.now().toString(36);
        this.styleEl = injectHeatmapStyles(this.uid);

        this.table = document.createElement("table");
        this.table.className = `heatmap-${this.uid}`;
        container.appendChild(this.table);

        this.render();
    }

    private render(): void {
        if (this.destroyed) return;
        const html = buildTableHTML(this.uid, this.data, this.options);
        this.table.innerHTML = html;

        if (this.options.darkMode) {
            this.table.classList.add("hm-dark");
        } else {
            this.table.classList.remove("hm-dark");
        }

        this.attachListeners();
    }

    private attachListeners(): void {
        // Cell hover
        this.table.querySelectorAll<HTMLElement>(".hm-cell").forEach((cell) => {
            const row = parseInt(cell.dataset.row!);
            const col = parseInt(cell.dataset.col!);
            cell.addEventListener("mouseenter", () => {
                this.options.onCellHover?.(row, col);
            });
            cell.addEventListener("mouseleave", () => {
                this.options.onCellLeave?.();
            });
            cell.addEventListener("click", (e) => {
                e.stopPropagation();
                this.options.onCellClick?.(row, col);
            });
        });

        // Row header click
        this.table.querySelectorAll<HTMLElement>(".hm-row-header").forEach((header) => {
            const row = parseInt(header.dataset.row!);
            header.addEventListener("click", (e) => {
                e.stopPropagation();
                this.options.onRowHeaderClick?.(row);
            });
        });
    }

    setData(data: HeatmapTableData): void {
        this.data = data;
        this.render();
    }

    setOptions(opts: Partial<HeatmapTableOptions>): void {
        this.options = { ...this.options, ...opts };
        this.render();
    }

    setThemeMode(dark: boolean): void {
        this.options.darkMode = dark;
        this.render();
    }

    setCellWidth(width: number): void {
        this.options.cellWidth = width;
        this.render();
    }

    setRowHeaderWidth(width: number): void {
        this.options.rowHeaderWidth = width;
        this.render();
    }

    getTableElement(): HTMLTableElement {
        return this.table;
    }

    getTableWidth(): number {
        return this.table.offsetWidth;
    }

    destroy(): void {
        this.destroyed = true;
        this.container.removeChild(this.table);
        if (this.styleEl.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
        }
    }
}
