import type {
    HeatmapColumnWindow,
    HeatmapTableData,
    HeatmapTableOptions,
    HeatmapTableWidgetInterface,
} from "../../types/heatmap-table";
import { escapeHtml, tokenInnerHTML } from "./renderer";
import { injectHeatmapStyles } from "./styles";

let heatmapIdCounter = 0;

// Height of a collapsed-section band, px (thin — just a seam).
const COLLAPSED_BAND_H = 16;
// Height of an expanded section's re-collapse handle, px (matches CSS).
const EXPANDED_TOGGLE_H = 20;
// Vertical inset on each region tracker so adjacent regions read as separate
// bars (a gap at every boundary) rather than one continuous rail.
const REGION_PAD = 7;

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
    private lastRowH = 0;
    // Set on a collapse/expand click; consumed by the next render() to keep the
    // viewport content stable across the height change.
    private pendingScroll: { scrollBefore: number; bandTop: number; delta: number } | null = null;

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
        if (n === 0) return { start: 0, size: 0 };
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

    private resolveRowHeight(visibleRows: number, collapseExtraH = 0): number {
        const o = this.options;
        const base = o.cellHeight ?? 28;
        if (o.rowSizing !== "fill" || visibleRows <= 0) return base;
        // Only the VISIBLE rows stretch, and only into the height left after the
        // collapse bands/handles — otherwise folding many rows leaves a gap
        // below the grid (the few visible rows never grow to fill the space).
        const avail = this.scrollEl.clientHeight - collapseExtraH;
        return visibleRows * base < avail ? Math.floor(avail / visibleRows) : base;
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

        // Collapse plan: sections (inclusive ORIGINAL ranges) hidden behind a
        // thin band unless expanded. Rows keep their original indices; a
        // collapsed section becomes one band, an expanded one gets a re-collapse
        // handle. `index` is the section's position in the option array (what
        // onToggleCollapse reports). Assumed non-overlapping. Computed here (not
        // just in the render loop) so fill sizing can account for hidden rows.
        const sections = (o.collapsedSections ?? [])
            .map((s, i) => ({
                start: Math.max(0, s.start),
                end: Math.min(rowCount - 1, s.end),
                collapsed: s.collapsed !== false,
                index: i,
            }))
            .filter((s) => s.start <= s.end)
            .sort((a, b) => a.start - b.start);
        const sectionAt = (r: number) => sections.find((s) => s.start === r);

        // Count visible rows and the height taken by collapse bands/handles, so
        // fill-mode stretches only the visible rows into the remaining space.
        let visibleRowCount = 0;
        let collapseExtraH = 0;
        for (let r = 0; r < rowCount; ) {
            const sec = sectionAt(r);
            if (sec && sec.collapsed) { collapseExtraH += COLLAPSED_BAND_H; r = sec.end + 1; continue; }
            if (sec && !sec.collapsed) collapseExtraH += EXPANDED_TOGGLE_H;
            visibleRowCount++;
            r++;
        }
        const rowH = this.resolveRowHeight(visibleRowCount, collapseExtraH);
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

        // Row highlights: map each highlighted row to its accent + run-edge
        // flags so a contiguous set renders as one block (band + top/bottom
        // divider) and isolated rows as single accents. The label rides the
        // first row of each run.
        const rowHl: Record<number, { color?: string; className?: string; top: boolean; bottom: boolean; label?: string }> = {};
        for (const hl of o.rowHighlights ?? []) {
            const set = new Set(hl.rows);
            for (const r of hl.rows) {
                const runStart = !set.has(r - 1);
                rowHl[r] = {
                    color: hl.color,
                    className: hl.className,
                    top: runStart,
                    bottom: !set.has(r + 1),
                    label: runStart ? hl.label : undefined,
                };
            }
        }

        this.lastRowH = rowH;

        // One data row's markup (original index r).
        const rowHtml = (r: number): string => {
            const rowLabel = rows[r].label;
            const extraCls = o.rowClassName?.(r);
            const hl = rowHl[r];
            const hlCls = hl
                ? " hmx-row-hl" + (hl.top ? " hmx-hl-top" : "") + (hl.bottom ? " hmx-hl-bottom" : "")
                    + (hl.className ? " " + hl.className : "")
                : "";
            const hlAttrs = hl
                ? (hl.color ? ` style="--hmx-hl:${escapeHtml(hl.color)}"` : "")
                    + (hl.label ? ` data-hl-label="${escapeHtml(hl.label)}"` : "")
                : "";
            // When a host supplies renderRowLabel it owns the label's full
            // inner markup (so multi-element labels — a pill, a marker + text —
            // sit as direct flex children); otherwise wrap the plain token.
            const labelInner = o.renderRowLabel
                ? o.renderRowLabel(r)
                : `<span class="hmx-cell-text">${tokenInnerHTML(rowLabel)}</span>`;
            let s = `<div class="hmx-row${extraCls ? " " + extraCls : ""}${hlCls}" data-rowwrap="${r}"${hlAttrs}>`;
            s += `<div class="hmx-row-grid" style="display:grid;grid-template-columns:${tpl};height:${rowH}px;">`;
            s += `<div class="hmx-rowlabel" data-row="${r}" title="${escapeHtml(rowLabel)}">${labelInner}</div>`;
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
                s += `<div class="hmx-cell${cell.className ? " " + cell.className : ""}" data-row="${r}" data-col="${c}" `
                    + `style="background:${cell.color};color:${cell.textColor};padding:0 6px;${op}${grid}${ring}${bold}${radius}">`
                    + `<span class="hmx-cell-text">${tokenInnerHTML(cell.text)}</span>`
                    + `</div>`;
            }
            s += `</div></div>`;
            return s;
        };

        // Region trackers (e.g. prompt / generation): a rail + rotated label in
        // the left gutter spanning each row range. Extents are measured from the
        // rendered layout below, so they follow rows as they collapse/expand.
        const regions = (o.rowRegions ?? []).filter((reg) => reg.start <= reg.end);
        const regionExt = regions.map(() => ({ top: -1, bottom: -1 }));
        const coverY = (lo: number, hi: number, yStart: number, yEnd: number) => {
            for (let i = 0; i < regions.length; i++) {
                if (hi >= regions[i].start && lo <= regions[i].end) {
                    if (regionExt[i].top < 0) regionExt[i].top = yStart;
                    regionExt[i].bottom = yEnd;
                }
            }
        };

        // Rows interleaved with collapse bands, in original-index order.
        let html = `<div class="hmx-grid-inner" style="width:${tableW}px;min-width:${tableW}px;">`;
        let y = 0;
        for (let r = 0; r < rowCount; ) {
            const sec = sectionAt(r);
            if (sec && sec.collapsed) {
                const count = sec.end - sec.start + 1;
                // Accent the band if it hides highlighted rows, so that cue
                // isn't lost while collapsed.
                let hlColor: string | undefined;
                let hidesHl = false;
                for (let hr = sec.start; hr <= sec.end; hr++) {
                    if (rowHl[hr]) { hidesHl = true; hlColor = rowHl[hr].color; break; }
                }
                const plural = count === 1 ? "" : "s";
                html += `<div class="hmx-collapsed${hidesHl ? " hmx-collapsed-hl" : ""}" data-cs="${sec.index}" data-count="${count}" `
                    + `style="width:${tableW}px;min-width:${tableW}px;height:${COLLAPSED_BAND_H}px;${hlColor ? `--hmx-hl:${escapeHtml(hlColor)};` : ""}" `
                    + `title="Click to show ${count} hidden row${plural}">`
                    + `<span class="hmx-collapsed-inner">… ${count} row${plural} hidden</span>`
                    + `</div>`;
                coverY(sec.start, sec.end, y, y + COLLAPSED_BAND_H);
                y += COLLAPSED_BAND_H;
                r = sec.end + 1;
                continue;
            }
            if (sec && !sec.collapsed) {
                const count = sec.end - sec.start + 1;
                html += `<div class="hmx-expanded-toggle" data-cs="${sec.index}" data-count="${count}" `
                    + `style="width:${tableW}px;min-width:${tableW}px;" title="Collapse these ${count} rows">`
                    + `<span>⌃ collapse ${count} row${count === 1 ? "" : "s"}</span>`
                    + `<span class="hmx-toggle-x" title="Remove — keep these rows expanded">×</span>`
                    + `</div>`;
                y += EXPANDED_TOGGLE_H;
            }
            html += rowHtml(r);
            coverY(r, r, y, y + rowH);
            y += rowH;
            r++;
        }
        // Region rails + labels — absolute within the (scrolling) grid-inner.
        for (let i = 0; i < regions.length; i++) {
            const ext = regionExt[i];
            if (ext.top < 0 || ext.bottom <= ext.top) continue;
            const reg = regions[i];
            const colorVar = reg.color ? `--hmx-region:${escapeHtml(reg.color)};` : "";
            // Inset so adjacent regions have a clear gap (not one continuous bar).
            const rt = ext.top + REGION_PAD;
            const rh = Math.max(0, ext.bottom - ext.top - 2 * REGION_PAD);
            if (rh <= 0) continue;
            html += `<div class="hmx-region-rail" style="top:${rt}px;height:${rh}px;${colorVar}"></div>`;
            if (reg.label) {
                html += `<div class="hmx-region-label" style="top:${rt}px;height:${rh}px;${colorVar}">`
                    + `${escapeHtml(reg.label)}</div>`;
            }
        }
        html += `</div>`;
        this.scrollEl.innerHTML = html;

        // Apply a pending scroll adjustment from a collapse/expand toggle so the
        // content the user was looking at stays put (shift only when the toggled
        // band sat above the viewport top; otherwise keep the offset).
        if (this.pendingScroll) {
            const { scrollBefore, bandTop, delta } = this.pendingScroll;
            this.pendingScroll = null;
            this.scrollEl.scrollTop = Math.max(0, bandTop < scrollBefore ? scrollBefore + delta : scrollBefore);
        }

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
            // Collapse band (expand) or expanded-section handle (collapse).
            const band = target.closest(".hmx-collapsed, .hmx-expanded-toggle") as HTMLElement | null;
            if (band) {
                const idx = parseInt(band.dataset.cs!);
                // The × on an expanded handle removes the section entirely
                // (rows stay expanded, no band/handle).
                if (target.closest(".hmx-toggle-x")) {
                    this.pendingScroll = {
                        scrollBefore: this.scrollEl.scrollTop,
                        bandTop: band.offsetTop,
                        delta: -band.offsetHeight,
                    };
                    this.options.onRemoveCollapse?.(idx);
                    return;
                }
                const count = parseInt(band.dataset.count || "0");
                const expanding = band.classList.contains("hmx-collapsed");
                const rowH = this.lastRowH || 28;
                // Record scroll bookkeeping; the widget's re-render (setOptions)
                // consumes it in render(). Approximate the height delta by the
                // rows' height (the small band height is negligible).
                this.pendingScroll = {
                    scrollBefore: this.scrollEl.scrollTop,
                    bandTop: band.offsetTop,
                    delta: expanding ? count * rowH : -count * rowH,
                };
                this.options.onToggleCollapse?.(idx);
                return;
            }
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
        // Force the next onVisibleColumnsChange even if the new data resolves
        // to the same visible set as the old (e.g. same column count) — a host
        // that reset its own derived column state needs the notification.
        this.lastVisibleCols = [];
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
