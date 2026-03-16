import type { LinePlotData, LinePlotLine } from "../../types/line-plot";
import { LINE_COLORS } from "./colors";
import { renderTokenHTML, resolveLines } from "./utils";

// Inline SVG icons
const EYE_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`;
const CLOSE_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export interface LegendCallbacks {
    onToggle: (lineIdx: number) => void;
    onRemove?: (lineIdx: number) => void;
}

export function createLegendElement(darkMode: boolean): HTMLDivElement {
    const el = document.createElement("div");
    applyLegendStyles(el, darkMode);
    return el;
}

function applyLegendStyles(el: HTMLDivElement, darkMode: boolean): void {
    const bg = darkMode ? "rgba(24,24,27,0.7)" : "rgba(255,255,255,0.7)";
    const border = darkMode ? "rgba(63,63,70,0.4)" : "rgba(228,228,231,0.4)";
    el.style.cssText =
        `flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;` +
        `border-radius:6px;background:${bg};backdrop-filter:blur(12px);` +
        `border:1px solid ${border};align-self:flex-start;`;
}

export function updateLegend(
    el: HTMLDivElement,
    labels: string[],
    hiddenLines: Set<number>,
    darkMode: boolean,
    callbacks: LegendCallbacks,
    data?: LinePlotData,
): void {
    applyLegendStyles(el, darkMode);
    el.innerHTML = "";

    const fg = darkMode ? "rgba(250,250,250,0.8)" : "rgba(24,24,27,0.8)";
    const fgMuted = darkMode ? "rgba(250,250,250,0.4)" : "rgba(24,24,27,0.4)";
    const mutedFg = darkMode ? "#a1a1aa" : "#71717a";
    const bgIndicator = darkMode ? "#3f3f46" : "#d4d4d8";
    const bgIndicatorBorder = darkMode ? "rgba(161,161,170,0.3)" : "rgba(161,161,170,0.3)";
    const hoverBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

    const resolved = data ? resolveLines(data) : [];

    labels.forEach((label, idx) => {
        // Skip overlay lines from legend
        const line = resolved[idx];
        if (line?.isOverlay) return;

        const color = line?.color ?? LINE_COLORS[idx % LINE_COLORS.length];
        const isHidden = hiddenLines.has(idx);
        const removable = line?.removable ?? false;

        const btn = document.createElement("button");
        btn.style.cssText =
            `display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;` +
            `border:none;background:transparent;cursor:pointer;transition:all 0.15s;` +
            `opacity:${isHidden ? "0.5" : "1"};`;

        btn.addEventListener("mouseenter", () => {
            btn.style.background = hoverBg;
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.background = "transparent";
        });
        btn.addEventListener("click", () => callbacks.onToggle(idx));

        // Color dot
        const dot = document.createElement("span");
        dot.style.cssText =
            `display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;` +
            `border:1.5px solid ${isHidden ? bgIndicatorBorder : color};` +
            `background:${isHidden ? bgIndicator : "transparent"};`;
        btn.appendChild(dot);

        // Label text
        const span = document.createElement("span");
        span.style.cssText =
            `font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;` +
            `white-space:nowrap;max-width:72px;transition:color 0.15s;` +
            `color:${isHidden ? fgMuted : fg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`;
        span.title = label;
        span.innerHTML = renderTokenHTML(label);
        btn.appendChild(span);

        // Close button (for removable lines)
        if (removable && callbacks.onRemove) {
            const closeBtn = document.createElement("span");
            closeBtn.style.cssText =
                `margin-left:auto;cursor:pointer;color:${mutedFg};opacity:0;` +
                `display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`;
            closeBtn.innerHTML = CLOSE_SVG;
            closeBtn.title = "Remove";
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                callbacks.onRemove!(idx);
            });
            btn.appendChild(closeBtn);

            btn.addEventListener("mouseenter", () => {
                closeBtn.style.opacity = "0.6";
            });
            btn.addEventListener("mouseleave", () => {
                closeBtn.style.opacity = "0";
            });
        } else {
            // Eye icon (toggle visibility)
            const icon = document.createElement("span");
            icon.style.cssText =
                `margin-left:auto;transition:opacity 0.15s;color:${mutedFg};` +
                `opacity:${isHidden ? "0.6" : "0"};display:flex;align-items:center;`;
            icon.innerHTML = isHidden ? EYE_OFF_SVG : EYE_SVG;
            btn.appendChild(icon);

            if (!isHidden) {
                btn.addEventListener("mouseenter", () => {
                    icon.style.opacity = "0.4";
                });
                btn.addEventListener("mouseleave", () => {
                    icon.style.opacity = "0";
                });
            }
        }

        el.appendChild(btn);
    });
}
