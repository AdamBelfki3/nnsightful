import type {
    HeatmapColumnWindow,
    HeatmapTableData,
    HeatmapTableOptions,
    HeatmapTableWidgetInterface,
} from "../../types/heatmap-table";
import { escapeHtml, tokenInnerHTML } from "./renderer";
import { injectHeatmapStyles } from "./styles";

let heatmapIdCounter = 0;

/**
 * HeatmapTableCore — a generic, reusable heatmap table abstracted from the
 * LogitLens widget's heatmap: a card with a rounded, outlined cells area, a
 * fixed column header above a scrollable rows region, sticky row labels,
 * rounded outer corner cells, a foreground hover outline, and light/dark
 * theming. Cell colors come from data.getCellValue, keeping the component
 * agnostic of what the values mean.
 *
 * Beyond the basic fixed-cell grid it supports the policies a demanding host
 * (like LogitLens) needs, as configuration rather than forks:
 *   - columnSizing 'fit'  — visible columns stretch to fill the width
 *   - rowSizing 'fill' / height 'fill' — fill a bounded host box
 *   - chrome 'none'       — embed bare (no card) inside another widget
 *   - sampleColumns 'uniform' — stride-sample wide grids to fit, addressing
 *     cells by ABSOLUTE column index so the host never juggles a display map
 *   - render hooks (renderRowLabel/rowClassName) for domain visuals
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
    private resizeObserver: ResizeObserver | null = null;
    private reflowRaf = 0;
    private lastVisibleCols: number[] = [];

    constructor(container: HTMLElement, data: HeatmapTableData, options: HeatmapTableOptions = {}) {
        this.container = container;
        this.data = data;
        this.options = {
            columnSizing: "fixed",
            cellWidth: 48,
            minColumnWidth: 48,
            rowSizing: "fixed",
            cellHeight: 28,
            rowHeaderWidth: 100,
            headerHeight: 26,
            height: "content",
            chrome: "card",
            sampleColumns: "none",
            alwaysShowLastColumn: false,
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
        this.setupResponsive();
    }

    // ── Responsive (fit/fill/sampling) plumbing ────────────────────
    private isResponsive(): boolean {
        const o = this.options;
        return o.columnSizing === "fit" || o.rowSizing === "fill"
            || o.height === "fill" || o.sampleColumns === "uniform";
    }

    private setupResponsive(): void {
        if (!this.isResponsive() || typeof ResizeObserver === "undefined") return;
        // The true inner width/height isn't final until layout settles (and,
        // on first mount, until the host has its size) — re-render once it does
        // so fit/fill measurements are correct.
        this.scheduleReflow();
        this.resizeObserver = new ResizeObserver(() => this.scheduleReflow());
        this.resizeObserver.observe(this.container);
    }

    private scheduleReflow(): void {
        if (this.destroyed || typeof requestAnimationFrame === "undefined") return;
        if (this.reflowRaf) return;
        this.reflowRaf = requestAnimationFrame(() => {
            this.reflowRaf = 0;
            if (!this.destroyed) this.render();
        });
    }

    /** Width available to the grid (card border/padding + any scrollbar
     *  already excluded by clientWidth). Falls back to a container estimate
     *  before first layout. */
    private availWidth(): number {
        const sw = this.scrollEl.clientWidth;
        if (sw > 0) return sw;
        const cw = this.container?.clientWidth ?? 0;
        return cw > 0 ? cw - 34 : 720;
    }

    private resolveWindow(): HeatmapColumnWindow {
        const n = this.data.columns.length;
        const w = this.options.columnWindow;
        if (!w) return { start: 0, size: n };
        const size = Math.max(1, Math.min(w.size, n));
        const start = Math.max(0, Math.min(w.start, n - size));
        return { start, size };
    }

    /** How many columns fit at the minimum readable width (caps the count
     *  before sampling), bounded by maxVisibleColumns. */
    private maxColsFit(): number {
        const o = this.options;
        const minW = o.minColumnWidth ?? 48;
        const rowHdrW = o.rowHeaderWidth ?? 100;
        const fit = Math.floor((this.availWidth() - rowHdrW) / minW);
        const cap = o.maxVisibleColumns ?? Number.POSITIVE_INFINITY;
        return Math.max(1, Math.min(cap, fit));
    }

    /** The absolute column indices to render: the window, uniformly
     *  stride-sampled down to what fits when sampleColumns === 'uniform'. */
    private resolveVisibleColumns(): number[] {
        const o = this.options;
        const { start, size } = this.resolveWindow();
        if (o.sampleColumns !== "uniform") {
            const out: number[] = [];
            for (let i = 0; i < size; i++) out.push(start + i);
            return out;
        }
        const maxCols = this.maxColsFit();
        if (size <= maxCols) {
            const out: number[] = [];
            for (let i = 0; i < size; i++) out.push(start + i);
            return out;
        }
        // Uniform stride sampling with COHERENT, even gaps. Budget maxCols-1
        // strided columns and pin the last column (when requested) so the
        // total stays ≤ maxCols and the final column is always present.
        const pinLast = !!o.alwaysShowLastColumn;
        const budget = Math.max(1, maxCols - (pinLast ? 1 : 0));
        const stride = Math.ceil(size / budget);
        const out: number[] = [];
        for (let l = start; l < start + size; l += stride) out.push(l);
        const last = start + size - 1;
        if (pinLast && out[out.length - 1] !== last) out.push(last);
        return out;
    }

    private resolveCellWidth(nVisible: number): number {
        const o = this.options;
        if (o.columnSizing === "fit" && nVisible > 0) {
            const rowHdrW = o.rowHeaderWidth ?? 100;
            const fitW = Math.floor((this.availWidth() - rowHdrW) / nVisible);
            // Sampling guarantees fitW ≥ minColumnWidth; the max() is a floor
            // for the un-sampled 'fit' case so cells never collapse to nothing.
            return Math.max(o.minColumnWidth ?? 1, fitW);
        }
        return o.cellWidth ?? 48;
    }

    private resolveRowHeight(rowCount: number): number {
        const o = this.options;
        const base = o.cellHeight ?? 28;
        if (o.rowSizing !== "fill" || rowCount <= 0) return base;
        const avail = this.scrollEl.clientHeight;
        return rowCount * base < avail ? Math.floor(avail / rowCount) : base;
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
        this.root.classList.toggle("hmx-bare", o.chrome === "none");
        this.root.classList.toggle("hmx-fill", o.height === "fill");

        const rowHdrW = o.rowHeaderWidth ?? 100;
        const hdrH = o.headerHeight ?? 26;
        const cols = this.data.columns;
        const visibleCols = this.resolveVisibleColumns();
        const nCols = visibleCols.length;
        const cellW = this.resolveCellWidth(nCols);
        const rows = this.data.rows;
        const rowCount = o.maxRows != null ? Math.min(rows.length, o.maxRows) : rows.length;
        const rowH = this.resolveRowHeight(rowCount);
        const tableW = rowHdrW + cellW * nCols;
        const tpl = `${rowHdrW}px repeat(${nCols}, ${cellW}px)`;

        const grid = o.showGrid
            ? (dark
                ? "border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);"
                : "border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);")
            : "";

        // Fixed column header (outside the scroll, so rows can't bleed over it).
        let hdr = `<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${tpl};height:${hdrH}px;width:${tableW}px;min-width:${tableW}px;">`;
        hdr += `<div class="hmx-corner">${escapeHtml(o.cornerLabel ?? "")}</div>`;
        for (let di = 0; di < nCols; di++) {
            hdr += `<div class="hmx-col">${tokenInnerHTML(cols[visibleCols[di]].label)}</div>`;
        }
        hdr += `</div>`;
        this.hdrEl.innerHTML = hdr;

        // Rows.
        let html = `<div class="hmx-grid-inner" style="width:${tableW}px;min-width:${tableW}px;">`;
        for (let r = 0; r < rowCount; r++) {
            const rowLabel = rows[r].label;
            const extraCls = o.rowClassName?.(r);
            // When a host supplies renderRowLabel it owns the label's full
            // inner markup (so multi-element labels — a pill, a marker + text —
            // sit as direct flex children); otherwise wrap the plain token.
            const labelInner = o.renderRowLabel
                ? o.renderRowLabel(r)
                : `<span class="hmx-cell-text">${tokenInnerHTML(rowLabel)}</span>`;
            html += `<div class="hmx-row${extraCls ? " " + extraCls : ""}" data-rowwrap="${r}">`;
            html += `<div class="hmx-row-grid" style="display:grid;grid-template-columns:${tpl};height:${rowH}px;">`;
            html += `<div class="hmx-rowlabel" data-row="${r}" title="${escapeHtml(rowLabel)}">${labelInner}</div>`;
            for (let di = 0; di < nCols; di++) {
                const c = visibleCols[di];
                const cell = this.data.getCellValue(r, c);
                const ring = cell.highlighted && cell.highlightColor
                    ? `box-shadow:inset 0 0 0 2px ${cell.highlightColor};` : "";
                const bold = cell.bold ? "font-weight:bold;" : "";
                const op = cell.opacity != null && cell.opacity < 1 ? `opacity:${cell.opacity};` : "";
                // Round the four outer corners of the (visible) data-cell block.
                const top = r === 0, bot = r === rowCount - 1, left = di === 0, right = di === nCols - 1;
                let radius = "";
                if (top && left) radius = "border-top-left-radius:8px;";
                else if (top && right) radius = "border-top-right-radius:8px;";
                else if (bot && left) radius = "border-bottom-left-radius:8px;";
                else if (bot && right) radius = "border-bottom-right-radius:8px;";
                html += `<div class="hmx-cell${cell.className ? " " + cell.className : ""}" data-row="${r}" data-col="${c}" `
                    + `style="background:${cell.color};color:${cell.textColor};padding:0 6px;${op}${grid}${ring}${bold}${radius}">`
                    + `<span class="hmx-cell-text">${tokenInnerHTML(cell.text)}</span>`
                    + `</div>`;
            }
            html += `</div></div>`;
        }
        html += `</div>`;
        this.scrollEl.innerHTML = html;

        // Notify the host when the visible column set changes (navigator sync).
        if (o.onVisibleColumnsChange && !sameArray(visibleCols, this.lastVisibleCols)) {
            this.lastVisibleCols = visibleCols;
            o.onVisibleColumnsChange(visibleCols);
        } else {
            this.lastVisibleCols = visibleCols;
        }
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
                this.options.onCellHover?.(parseInt(cell.dataset.row!), parseInt(cell.dataset.col!), e);
            }
        });
        this.scrollEl.addEventListener("mouseleave", () => this.clearHover());
        this.scrollEl.addEventListener("click", (e) => {
            // Don't fire actions if the click ended a text selection (copy).
            if (!(window.getSelection()?.isCollapsed ?? true)) return;
            const target = e.target as HTMLElement;
            const label = target.closest(".hmx-rowlabel") as HTMLElement | null;
            if (label) { this.options.onRowHeaderClick?.(parseInt(label.dataset.row!), e); return; }
            const cell = target.closest(".hmx-cell") as HTMLElement | null;
            if (cell) this.options.onCellClick?.(parseInt(cell.dataset.row!), parseInt(cell.dataset.col!), e);
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
        const wasResponsive = this.isResponsive();
        this.options = { ...this.options, ...opts };
        this.render();
        // A host may flip into a responsive mode after construction.
        if (!wasResponsive && this.isResponsive()) this.setupResponsive();
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

    getScrollElement(): HTMLElement {
        return this.scrollEl;
    }

    scrollToRow(row: number): void {
        const el = this.scrollEl.querySelector(`[data-rowwrap="${row}"]`) as HTMLElement | null;
        if (!el) return;
        const target = el.offsetTop - this.scrollEl.clientHeight / 2 + el.offsetHeight / 2;
        this.scrollEl.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }

    scrollToBottom(): void {
        this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
    }

    destroy(): void {
        this.destroyed = true;
        if (this.reflowRaf && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this.reflowRaf);
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.clearHover();
        this.container.innerHTML = "";
        if (this.styleEl.parentNode) {
            this.styleEl.parentNode.removeChild(this.styleEl);
        }
    }
}

function sameArray(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}
