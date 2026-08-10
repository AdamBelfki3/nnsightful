/**
 * Styles for the generic HeatmapTable — abstracts the polished heatmap look
 * used by the LogitLens widget: a card with a rounded, outlined cells area, a
 * layer-style fixed column header above a scrollable rows region, sticky row
 * labels, rounded outer corner cells, white→/dark→ramp colored cells (colors
 * come from the data), and a foreground hover outline. Light + dark aware.
 */
export function generateHeatmapStyles(uid: string): string {
    const root = `#${uid}`;
    return `
        ${root} {
            /* Local tokens (light) */
            --hmx-surface: hsl(0 0% 100%);
            --hmx-surface-2: hsl(0 0% 98%);
            --hmx-card-border: hsl(0 0% 82%);
            --hmx-line-faint: hsl(0 0% 93%);
            --hmx-text: hsl(0 0% 9%);
            --hmx-text-2: hsl(0 0% 20%);
            --hmx-text-muted: hsl(0 0% 40%);
            --hmx-shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
            --hmx-font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            --hmx-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

            box-sizing: border-box;
            display: inline-flex; flex-direction: column;
            max-width: 100%; min-width: 0;
            font-family: var(--hmx-font-sans);
            color: var(--hmx-text);
            -webkit-font-smoothing: antialiased;
            background: var(--hmx-surface);
            border: 1px solid var(--hmx-card-border);
            border-radius: 0.75rem;
            box-shadow: var(--hmx-shadow-xs);
            padding: 16px;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
        }
        ${root} *, ${root} *::before, ${root} *::after { box-sizing: border-box; }
        ${root}.hmx-dark {
            --hmx-surface: hsl(0 0% 16%);
            --hmx-surface-2: hsl(0 0% 13%);
            --hmx-card-border: hsl(0 0% 26%);
            --hmx-line-faint: hsl(0 0% 24%);
            --hmx-text: hsl(0 0% 90%);
            --hmx-text-2: hsl(0 0% 80%);
            --hmx-text-muted: hsl(0 0% 64%);
            color-scheme: dark;
        }

        /* fill: fill the host's bounded box (flex column) instead of
           shrink-wrapping content; the scroll region absorbs the overflow. */
        ${root}.hmx-fill {
            display: flex; width: 100%; height: 100%;
            min-height: 0; max-width: none;
        }
        ${root}.hmx-fill .hmx-frame { flex: 1 1 auto; min-height: 0; }

        /* bare: drop the card chrome so the grid can be embedded as a plain
           region inside another widget (no double border/padding/shadow). */
        ${root}.hmx-bare {
            border: 0; box-shadow: none; padding: 0;
            border-radius: 0; background: transparent;
        }

        /* Heatmap region: fixed column header above a scrollable rows area.
           No frame outline — the rounding lives on the corner data cells
           (set inline by the renderer), so only the cells area is rounded,
           not the axis. */
        ${root} .hmx-frame {
            display: flex; flex-direction: column;
            min-width: 0; max-width: 100%;
        }
        ${root} .hmx-hdr-fixed { flex: 0 0 auto; overflow: hidden; }
        ${root} .hmx-scroll {
            flex: 1 1 auto; min-height: 0;
            overflow: auto; min-width: 0; max-width: 100%;
        }

        ${root} .hmx-hdr-row { align-items: end; padding-bottom: 4px; }
        ${root} .hmx-corner {
            font-size: 10px; color: var(--hmx-text-muted);
            text-align: right; padding-right: 8px;
            letter-spacing: 0.04em; text-transform: uppercase;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            display: flex; align-items: flex-end; justify-content: flex-end;
        }
        ${root} .hmx-col {
            text-align: center; font-family: var(--hmx-font-mono); font-size: 11px;
            color: var(--hmx-text-muted); font-variant-numeric: tabular-nums;
            overflow: hidden; white-space: nowrap;
        }
        ${root} .hmx-grid-inner { position: relative; }
        /* Region trackers (rail + rotated label) — sit in the left gutter and
           scroll with the rows (children of grid-inner). Position/height are
           set inline from the measured layout. */
        ${root} .hmx-region-rail {
            position: absolute; left: 6px; width: 3px; border-radius: 3px;
            background: var(--hmx-region, var(--hmx-text-faint)); pointer-events: none;
        }
        ${root} .hmx-region-label {
            position: absolute; left: 12px; width: 13px;
            display: flex; align-items: center; justify-content: center;
            writing-mode: vertical-rl; transform: rotate(180deg);
            font-family: var(--hmx-font-sans); font-size: 9px; font-weight: 600;
            letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
            color: var(--hmx-region, var(--hmx-text-faint)); pointer-events: none;
            overflow: hidden;
        }
        ${root} .hmx-row { position: relative; }
        ${root} .hmx-row-grid { cursor: default; position: relative; }
        ${root} .hmx-rowlabel {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 6px; padding: 0 8px; font-size: 12px; color: var(--hmx-text-2);
            overflow: hidden;
            -webkit-user-select: text; user-select: text;
        }
        ${root} .hmx-cell {
            display: flex; align-items: center; justify-content: center;
            min-width: 0; font-size: 11px; font-family: var(--hmx-font-mono);
            position: relative; color: hsl(0 0% 18%);
        }
        ${root} .hmx-cell-text {
            display: block; min-width: 0; max-width: 100%;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            -webkit-user-select: text; user-select: text;
        }
        ${root} .hmx-cell.hmx-hover { outline: 2px solid var(--hmx-text); outline-offset: -2px; z-index: 3; }
        ${root} .hmx-lead-space { color: #3b82f6; }

        /* ── Row highlights (declarative rowHighlights) ──
           Just a faint accent band on each highlighted row, plus an optional
           caption chip on the block's first row — no rail, no block-edge
           dividers. --hmx-hl carries the per-highlight accent (falls back to
           amber). Agnostic to meaning. (The hmx-hl-top/bottom run-edge flags
           are still emitted so the label can ride the block's first row.) */
        ${root} .hmx-row-hl { --hmx-hl: #f59e0b; }
        ${root}.hmx-dark .hmx-row-hl { --hmx-hl: #fbbf24; }
        ${root} .hmx-row-hl .hmx-row-grid {
            background: color-mix(in srgb, var(--hmx-hl) 12%, transparent);
        }
        ${root} .hmx-row-hl[data-hl-label]::after {
            content: attr(data-hl-label);
            position: absolute; left: 6px; top: 0; transform: translateY(-50%);
            font-family: var(--hmx-font-sans); font-size: 9px; font-weight: 600;
            letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;
            color: #fff; background: var(--hmx-hl);
            padding: 1px 5px; border-radius: 999px; z-index: 4; pointer-events: none;
        }

        /* ── Collapsed-row band + expanded-section handle ──
           A thin clickable band that stands in for a hidden row range, and a
           smaller handle above an expanded section to re-collapse it. Both keep
           original row indices intact — they're purely a rendering stand-in. */
        ${root} .hmx-collapsed {
            display: flex; align-items: center; position: relative; cursor: pointer;
            background: var(--hmx-surface-2); color: var(--hmx-text-muted);
            border-top: 1px solid var(--hmx-card-border);
            border-bottom: 1px solid var(--hmx-card-border);
            font-family: var(--hmx-font-sans); font-size: 9.5px; letter-spacing: 0.02em;
            -webkit-user-select: none; user-select: none;
        }
        ${root} .hmx-collapsed:hover { background: var(--hmx-surface); color: var(--hmx-text); }
        ${root} .hmx-collapsed-inner { padding: 0 12px; letter-spacing: 0.02em; }
        /* Accent rail when the collapsed rows include a highlight. */
        ${root} .hmx-collapsed-hl::before {
            content: ""; position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; background: var(--hmx-hl, #f59e0b);
        }
        /* Match the collapsed band (.hmx-collapsed / COLLAPSED_BAND_H) exactly —
           same 16px height, 9.5px sans, and sentence case (no uppercase). */
        ${root} .hmx-expanded-toggle {
            display: flex; align-items: center; height: 16px; cursor: pointer;
            padding: 0 12px; color: var(--hmx-text-muted);
            font-family: var(--hmx-font-sans); font-size: 9.5px;
            letter-spacing: 0.02em;
            -webkit-user-select: none; user-select: none;
        }
        ${root} .hmx-expanded-toggle:hover { color: var(--hmx-text); }
        /* × on the right removes the section entirely. */
        ${root} .hmx-toggle-x {
            margin-left: auto; padding: 0 4px; font-size: 14px; line-height: 1;
            color: var(--hmx-text-muted); cursor: pointer;
        }
        ${root} .hmx-toggle-x:hover { color: var(--hmx-text); }
    `;
}

export function injectHeatmapStyles(uid: string): HTMLStyleElement {
    if (typeof document === "undefined") {
        return {} as HTMLStyleElement;
    }
    const style = document.createElement("style");
    style.textContent = generateHeatmapStyles(uid);
    document.head.appendChild(style);
    return style;
}
