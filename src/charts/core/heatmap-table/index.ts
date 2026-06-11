import type { HeatmapTableData, HeatmapTableOptions, HeatmapTableWidgetInterface } from "../../types/heatmap-table";
import { escapeHtml, tokenInnerHTML } from "./renderer";
import { injectHeatmapStyles } from "./styles";

let heatmapIdCounter = 0;

/**
 * HeatmapTableCore — a generic, reusable heatmap table that abstracts the
 * polished look of the LogitLens widget's heatmap: a card with a rounded,
 * outlined cells area, a fixed column header above a scrollable rows region,
 * sticky row labels, rounded outer corner cells, a foreground hover outline,
 * and light/dark theming. Cell colors come from data.getCellValue (callers
 * compute them, e.g. a white→ramp blend), keeping this component agnostic of
 * what the values mean.
 */
export class HeatmapTableCore implements HeatmapTableWidgetInterface {
    private container: HTMLElement;
    private root!: HTMLElement;       // the card (#uid)
    private hdrEl!: HTMLElement;      // fixed column header
    private scrollEl!: HTMLElement;   // scrollable rows region
    private data: HeatmapTableData;
    private options: HeatmapTableOptions;
    private uid: string;
    private styleEl: HTMLStyleElement;
    private destroyed = false;
    private hoverCell: HTMLElement | null = null;

    constructor(container: HTMLElement, data: HeatmapTableData, options: HeatmapTableOptions = {}) {
        this.container = container;
        this.data = data;
        this.options = {
            cellWidth: 48,
            cellHeight: 28,
            rowHeaderWidth: 100,
            darkMode: false,
            showGrid: true,
            ...options,
        };
        this.uid = "hmx_" + (++heatmapIdCounter) + "_" + Date.now().toString(36);
        this.styleEl = injectHeatmapStyles(this.uid);

        container.innerHTML = `
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`;
        this.root = document.getElementById(this.uid)!;
        this.hdrEl = this.root.querySelector(".hmx-hdr-fixed")!;
        this.scrollEl = this.root.querySelector(".hmx-scroll")!;

        this.attachListeners();
        this.render();
    }

    private render(): void {
        if (this.destroyed) return;
        // The rebuild below replaces scrollEl's contents, detaching the old
        // hovered cell. Drop the stale reference so the next mousemove treats
        // the cursor as entering a fresh cell (no spurious onCellLeave).
        this.hoverCell = null;
        const o = this.options;
        const dark = !!o.darkMode;
        this.root.classList.toggle("hmx-dark", dark);

        const cellW = o.cellWidth ?? 48;
        const rowH = o.cellHeight ?? 28;
        const rowHdrW = o.rowHeaderWidth ?? 100;
        const cols = this.data.columns;
        const nCols = cols.length;
        const rows = this.data.rows;
        const rowCount = o.maxRows != null ? Math.min(rows.length, o.maxRows) : rows.length;
        const tableW = rowHdrW + cellW * nCols;
        const tpl = `${rowHdrW}px repeat(${nCols}, ${cellW}px)`;

        const grid = o.showGrid
            ? (dark
                ? "border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);"
                : "border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);")
            : "";

        // Fixed column header (outside the scroll, so rows can't bleed over it).
        let hdr = `<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${tpl};height:26px;width:${tableW}px;min-width:${tableW}px;">`;
        hdr += `<div class="hmx-corner">${escapeHtml(o.cornerLabel ?? "")}</div>`;
        for (let c = 0; c < nCols; c++) {
            hdr += `<div class="hmx-col">${tokenInnerHTML(cols[c].label)}</div>`;
        }
        hdr += `</div>`;
        this.hdrEl.innerHTML = hdr;

        // Rows.
        let html = `<div class="hmx-grid-inner" style="width:${tableW}px;min-width:${tableW}px;">`;
        for (let r = 0; r < rowCount; r++) {
            const rowLabel = rows[r].label;
            html += `<div class="hmx-row" data-rowwrap="${r}">`;
            html += `<div class="hmx-row-grid" style="display:grid;grid-template-columns:${tpl};height:${rowH}px;">`;
            html += `<div class="hmx-rowlabel" data-row="${r}" title="${escapeHtml(rowLabel)}">`
                + `<span class="hmx-cell-text">${tokenInnerHTML(rowLabel)}</span></div>`;
            for (let c = 0; c < nCols; c++) {
                const cell = this.data.getCellValue(r, c);
                const ring = cell.highlighted && cell.highlightColor
                    ? `box-shadow:inset 0 0 0 2px ${cell.highlightColor};` : "";
                const bold = cell.bold ? "font-weight:bold;" : "";
                // Round the four outer corners of the data-cell block only.
                const top = r === 0, bot = r === rowCount - 1, left = c === 0, right = c === nCols - 1;
                let radius = "";
                if (top && left) radius = "border-top-left-radius:8px;";
                else if (top && right) radius = "border-top-right-radius:8px;";
                else if (bot && left) radius = "border-bottom-left-radius:8px;";
                else if (bot && right) radius = "border-bottom-right-radius:8px;";
                html += `<div class="hmx-cell" data-row="${r}" data-col="${c}" `
                    + `style="background:${cell.color};color:${cell.textColor};padding:0 6px;${grid}${ring}${bold}${radius}">`
                    + `<span class="hmx-cell-text">${tokenInnerHTML(cell.text)}</span>`
                    + `</div>`;
            }
            html += `</div></div>`;
        }
        html += `</div>`;
        this.scrollEl.innerHTML = html;
    }

    private attachListeners(): void {
        // Hover outline (delegated; survives re-renders).
        this.scrollEl.addEventListener("mousemove", (e) => {
            const cell = (e.target as HTMLElement).closest(".hmx-cell") as HTMLElement | null;
            if (!cell) { this.clearHover(); return; }
            if (this.hoverCell !== cell) {
                this.hoverCell?.classList.remove("hmx-hover");
                this.hoverCell = cell;
                cell.classList.add("hmx-hover");
                // Fire only on cell change, not on every mousemove pixel — a
                // heavy onCellHover (React state, redraw) shouldn't run dozens
                // of times/sec while the cursor sits on one cell.
                this.options.onCellHover?.(parseInt(cell.dataset.row!), parseInt(cell.dataset.col!));
            }
        });
        this.scrollEl.addEventListener("mouseleave", () => this.clearHover());
        this.scrollEl.addEventListener("click", (e) => {
            // Don't fire actions if the click ended a text selection (copy).
            if (!(window.getSelection()?.isCollapsed ?? true)) return;
            const target = e.target as HTMLElement;
            const label = target.closest(".hmx-rowlabel") as HTMLElement | null;
            if (label) { this.options.onRowHeaderClick?.(parseInt(label.dataset.row!)); return; }
            const cell = target.closest(".hmx-cell") as HTMLElement | null;
            if (cell) this.options.onCellClick?.(parseInt(cell.dataset.row!), parseInt(cell.dataset.col!));
        });
    }

    private clearHover(): void {
        if (this.hoverCell) {
            this.hoverCell.classList.remove("hmx-hover");
            this.hoverCell = null;
            this.options.onCellLeave?.();
        }
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

    getTableElement(): HTMLElement {
        return this.root;
    }

    getTableWidth(): number {
        return this.root.offsetWidth;
    }

    destroy(): void {
        this.destroyed = true;
        this.clearHover();
        this.container.innerHTML = "";
        if (this.styleEl.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
        }
    }
}
