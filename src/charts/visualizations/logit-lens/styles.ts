/**
 * Scoped CSS for the redesigned LogitLens widget.
 *
 * The design follows the Workbench design system (tokens.css). Those CSS
 * variables only exist in the workbench app, so we re-declare the subset
 * we need *locally* on the widget root — that way the widget looks right
 * in a Jupyter notebook (no globals.css) AND in the workbench (where our
 * local values simply match the inherited ones). Dark mode swaps the same
 * locals via the `.ll-dark` class, which the host toggles.
 *
 * Heatmap CELLS always render on a light field (white → ramp blend) in
 * both themes — they are the data ink. Only the surrounding chrome
 * (card, labels, strips, navigator) adapts to dark mode.
 */
export function generateStyles(uid: string): string {
    const root = `#${uid}`;
    return `
        ${root} {
            /* ── Local design tokens (light) ── */
            --ll-surface: hsl(0 0% 100%);
            --ll-surface-2: hsl(0 0% 98%);
            --ll-surface-3: hsl(0 0% 97%);
            --ll-card-border: hsl(0 0% 82%);
            --ll-line: hsl(0 0% 90%);
            --ll-line-2: hsl(0 0% 88%);
            --ll-line-faint: hsl(0 0% 93%);
            --ll-text: hsl(0 0% 9%);
            --ll-text-2: hsl(0 0% 20%);
            --ll-text-muted: hsl(0 0% 40%);
            --ll-text-faint: hsl(0 0% 58%);
            --ll-primary: hsl(217.2193 91.2195% 59.8039%);
            --ll-primary-061: hsl(217.2193 91.2195% 59.8039% / 0.06);
            --ll-primary-018: hsl(217.2193 91.2195% 59.8039% / 0.18);
            --ll-primary-007: hsl(217.2193 91.2195% 59.8039% / 0.07);
            --ll-shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
            --ll-font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            --ll-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

            box-sizing: border-box;
            position: relative;
            font-family: var(--ll-font-sans);
            color: var(--ll-text);
            -webkit-font-smoothing: antialiased;
            background: var(--ll-surface);
            border: 1px solid var(--ll-card-border);
            border-radius: 0.75rem;
            box-shadow: var(--ll-shadow-xs);
            padding: 20px;
            /* width:100% + max-width:100% + min-width:0 keep the card bounded
               to its container (never grown by the wide heatmap inside,
               which is clipped/scrolled by .ll-scroll). Content mode adds an
               inline max-width to hug the content; fill mode clears it. */
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
        }
        ${root} *, ${root} *::before, ${root} *::after { box-sizing: border-box; }

        /* ── Dark theme overrides (chrome only; cells stay light) ── */
        ${root}.ll-dark {
            --ll-surface: hsl(0 0% 16%);
            --ll-surface-2: hsl(0 0% 13%);
            --ll-surface-3: hsl(0 0% 20%);
            --ll-card-border: hsl(0 0% 26%);
            --ll-line: hsl(0 0% 26%);
            --ll-line-2: hsl(0 0% 30%);
            --ll-line-faint: hsl(0 0% 24%);
            --ll-text: hsl(0 0% 90%);
            --ll-text-2: hsl(0 0% 80%);
            --ll-text-muted: hsl(0 0% 64%);
            --ll-text-faint: hsl(0 0% 55%);
            color-scheme: dark;
        }

        /* Fill mode: the host (workbench panel) gives a bounded box; the card
           fills it as a flex column and the heatmap scroll region grows to
           consume the leftover height (navigator + line plot keep their
           natural size). Content mode (Jupyter) keeps the card content-sized
           with a fixed-height scroll region set inline by renderHeatmap. */
        ${root}.ll-fill {
            display: flex; flex-direction: column;
            width: 100%; height: 100%;
        }
        ${root}.ll-fill .ll-scroll { flex: 1 1 auto; min-height: 0; }
        ${root}.ll-fill .ll-nav,
        ${root}.ll-fill .ll-lineplot-wrap { flex: 0 0 auto; }

        /* Leading-space marker, used in cell + row-label token rendering. */
        ${root} .ll-lead-dot { opacity: 0.35; margin-right: 1px; }

        /* ── Heatmap scroll region ── */
        ${root} .ll-scroll {
            overflow: auto;
            min-width: 0; max-width: 100%;
            border-top: 1px solid var(--ll-line-faint);
            border-bottom: 1px solid var(--ll-line-faint);
        }
        ${root} .ll-grid-inner { /* width set inline */ }
        ${root} .ll-hdr-row {
            align-items: end; padding-bottom: 4px;
            position: sticky; top: 0; z-index: 5; background: var(--ll-surface);
        }
        ${root} .ll-corner {
            font-size: 10px; color: var(--ll-text-muted);
            text-align: right; padding-right: 8px;
            letter-spacing: 0.04em; text-transform: uppercase;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            position: sticky; left: 0; z-index: 4; background: var(--ll-surface);
            display: flex; align-items: flex-end; justify-content: flex-end;
        }
        ${root} .ll-hdr-cell {
            text-align: center; font-family: var(--ll-font-mono); font-size: 11px;
            color: var(--ll-text-muted); font-variant-numeric: tabular-nums;
            overflow: hidden; white-space: nowrap;
        }
        ${root} .ll-row { position: relative; }
        ${root} .ll-row-rail {
            position: absolute; left: -1px; top: 0; bottom: 0;
            width: 3px; background: var(--ll-primary); border-radius: 2px; z-index: 2;
        }
        ${root} .ll-row-grid {
            cursor: pointer; position: relative; z-index: 1;
        }
        ${root} .ll-row-grid.ll-row-sel {
            background: var(--ll-surface-2);
            box-shadow: 0 0 0 1px var(--ll-primary-018);
            border-radius: 4px;
        }
        ${root} .ll-row-label {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 6px; padding: 0 8px; font-size: 12px; color: var(--ll-text-2);
            position: sticky; left: 0; z-index: 3; background: var(--ll-surface);
            box-shadow: 1px 0 0 var(--ll-line-faint);
            overflow: hidden;
        }
        ${root} .ll-row-grid.ll-row-sel .ll-row-label { background: var(--ll-surface-2); }
        ${root} .ll-cell {
            display: flex; align-items: center; justify-content: center;
            min-width: 0; font-size: 11px; font-family: var(--ll-font-mono);
            position: relative; color: hsl(0 0% 18%);
        }
        ${root} .ll-cell-text {
            display: block; min-width: 0; max-width: 100%;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        ${root} .ll-cell.ll-cell-hover { outline: 2px solid var(--ll-text); outline-offset: -2px; z-index: 3; }
        ${root} .ll-bos-pill {
            display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
            border: 1px solid var(--ll-line-2); border-radius: 3px;
            font-family: var(--ll-font-mono); font-size: 10px; font-weight: 500;
            color: var(--ll-text-muted); background: var(--ll-surface-3); letter-spacing: 0.02em;
        }
        ${root} .ll-axis-caption {
            text-align: center; font-size: 10.5px; color: var(--ll-text-muted);
            letter-spacing: 0.18em; text-transform: uppercase;
        }

        /* ── Layer navigator ── */
        ${root} .ll-nav { margin-top: 14px; display: flex; align-items: center; gap: 14px; }
        ${root} .ll-nav-range {
            font-family: var(--ll-font-mono); font-size: 11.5px; color: var(--ll-text-2);
            white-space: nowrap; font-variant-numeric: tabular-nums; min-width: 110px;
        }
        ${root} .ll-nav-range .ll-nav-range-key {
            color: var(--ll-text-muted); margin-right: 6px;
            letter-spacing: 0.08em; text-transform: uppercase;
            font-family: var(--ll-font-sans); font-size: 10px;
        }
        ${root} .ll-nav-range .ll-dim { color: var(--ll-text-faint); }
        ${root} .ll-nav-mid { flex: 1; position: relative; min-width: 0; }
        ${root} .ll-skyline {
            position: relative; height: 28px; background: var(--ll-surface-3);
            border: 1px solid var(--ll-line-2); border-radius: 4px;
            cursor: grab; user-select: none; touch-action: none; overflow: hidden;
        }
        ${root} .ll-skyline.ll-grabbing { cursor: grabbing; }
        ${root} .ll-skyline-bars {
            position: absolute; inset: 0; display: flex; align-items: flex-end;
            pointer-events: none;
        }
        ${root} .ll-skyline-bar { flex: 1; min-width: 1px; }
        ${root} .ll-skyline-win {
            position: absolute; top: -1px; bottom: -1px;
            background: var(--ll-primary-007); border: 1.5px solid var(--ll-primary);
            border-radius: 4px; box-shadow: 0 0 0 3px var(--ll-primary-007);
            pointer-events: none;
        }
        ${root} .ll-skyline-handle {
            position: absolute; top: 4px; bottom: 4px; width: 2px;
            background: var(--ll-primary); border-radius: 2px;
        }
        ${root} .ll-nav-ticks {
            position: relative; height: 12px; margin-top: 2px;
            font-family: var(--ll-font-mono); font-size: 9.5px;
            color: var(--ll-text-faint); font-variant-numeric: tabular-nums;
        }
        ${root} .ll-nav-tick { position: absolute; white-space: nowrap; }
        ${root} .ll-nav-controls { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        ${root} .ll-nav-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 26px; height: 26px; padding: 0;
            border: 1px solid var(--ll-line-2); background: var(--ll-surface);
            color: var(--ll-text-2); border-radius: 4px; cursor: pointer;
        }
        ${root} .ll-nav-btn:hover:not(:disabled) { background: var(--ll-surface-3); color: var(--ll-text); }
        ${root} .ll-nav-btn:disabled { opacity: 0.35; cursor: default; }
        ${root} .ll-nav-sep { width: 1px; height: 16px; background: var(--ll-line-2); margin: 0 4px; }

        /* ── Line plot (kept on cell click) ── */
        ${root} .ll-lineplot-wrap {
            margin-top: 14px; padding-top: 14px;
            border-top: 1px solid var(--ll-line-faint);
        }
        ${root} .ll-lineplot-wrap.ll-hidden { display: none; }
        ${root} .ll-lineplot-head {
            display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;
        }
        ${root} .ll-lineplot-title {
            font-size: 11px; color: var(--ll-text-muted);
            letter-spacing: 0.06em; text-transform: uppercase;
        }
        ${root} .ll-lineplot-token { font-family: var(--ll-font-mono); font-size: 12px; color: var(--ll-text); }
        /* Definite-height box so LinePlotCore's height:100% resolves and the
           plot can't grow unbounded (it sets height:100% on its mount). */
        ${root} .ll-lineplot-box { height: 200px; overflow: hidden; }
        ${root} .ll-lineplot { width: 100%; height: 100%; }

        /* ── Tooltip ── */
        ${root} .ll-tooltip {
            position: absolute; width: 220px; padding: 12px 14px;
            background: var(--ll-surface); border: 1px solid var(--ll-line-2);
            border-radius: 6px;
            box-shadow: 0 6px 20px -4px rgba(0,0,0,0.12), 0 2px 6px -2px rgba(0,0,0,0.08);
            pointer-events: none; z-index: 50; font-family: var(--ll-font-sans);
            display: none;
        }
        ${root} .ll-tooltip.ll-visible { display: block; }
        ${root} .ll-tt-head { display: flex; align-items: center; gap: 8px; }
        ${root} .ll-tt-swatch { width: 12px; height: 12px; border-radius: 2px; border: 1px solid var(--ll-line-2); flex-shrink: 0; }
        ${root} .ll-tt-token {
            font-family: var(--ll-font-mono); font-size: 13px; font-weight: 500;
            color: var(--ll-text); max-width: 160px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        ${root} .ll-tt-grid {
            margin-top: 8px; display: grid; grid-template-columns: auto 1fr; gap: 3px 12px;
            font-size: 11.5px; color: var(--ll-text-muted);
        }
        ${root} .ll-tt-grid .ll-tt-val {
            font-family: var(--ll-font-mono); color: var(--ll-text); text-align: right;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── Top-k popup (portaled to <body>, so it carries its own token
              block + ID-scoped selectors; .ll-dark mirrored from the root). ── */
        #${uid}_popup {
            --p-surface: hsl(0 0% 100%);
            --p-border: hsl(0 0% 86%);
            --p-line: hsl(0 0% 92%);
            --p-text: hsl(0 0% 12%);
            --p-text-2: hsl(0 0% 38%);
            --p-muted: hsl(0 0% 50%);
            --p-hover: hsl(0 0% 96%);
            --p-code: hsl(0 0% 95%);
            --p-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            --p-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            box-sizing: border-box;
            display: none; position: fixed; z-index: 100;
            min-width: 180px; max-width: 280px;
            background: var(--p-surface); border: 1px solid var(--p-border);
            border-radius: 6px;
            box-shadow: 0 6px 20px -4px rgba(0,0,0,0.18), 0 2px 6px -2px rgba(0,0,0,0.10);
            padding: 12px; font-family: var(--p-sans); color: var(--p-text);
            -webkit-user-select: none; user-select: none;
        }
        #${uid}_popup.ll-visible { display: block; }
        #${uid}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${uid}_popup .ll-lead-dot { opacity: 0.35; margin-right: 1px; }
        #${uid}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${uid}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${uid}_popup .ll-popup-header {
            font-weight: 600; font-size: 13px; padding-right: 16px;
            margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--p-line);
        }
        #${uid}_popup .ll-popup-sub {
            font-weight: 400; font-size: 11.5px; color: var(--p-text-2); margin-top: 3px;
        }
        #${uid}_popup .ll-popup-sub code {
            font-family: var(--p-mono); background: var(--p-code);
            padding: 1px 5px; border-radius: 3px;
        }
        #${uid}_popup .ll-popup-body { display: flex; flex-direction: column; gap: 1px; }
        #${uid}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${uid}_popup .ll-topk:hover { background: var(--p-hover); }
        #${uid}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        #${uid}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `;
}

export function injectStyles(uid: string): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = generateStyles(uid);
    document.head.appendChild(style);
    return style;
}

export function applyDarkMode(
    widgetEl: HTMLElement,
    enabled: boolean,
    ...extras: (HTMLElement | null | undefined)[]
): void {
    const toggle = (el: HTMLElement) => {
        if (enabled) el.classList.add("ll-dark");
        else el.classList.remove("ll-dark");
    };
    toggle(widgetEl);
    if (enabled) widgetEl.style.colorScheme = "dark";
    else widgetEl.style.colorScheme = "";
    for (const el of extras) if (el) toggle(el);
}
