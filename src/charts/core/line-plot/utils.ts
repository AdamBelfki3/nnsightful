import type { LinePlotData } from "../../types/line-plot";

export interface ResolvedLine {
    values: (number | null)[];
    label: string;
    color?: string;
    dashPattern?: string;
    isOverlay?: boolean;
    removable?: boolean;
}

/** Resolve lines from either richLines or basic lines array */
export function resolveLines(data: LinePlotData): ResolvedLine[] {
    if (data.richLines && data.richLines.length > 0) {
        return data.richLines.map((rl, i) => ({
            values: rl.values,
            label: rl.label ?? `Line ${i + 1}`,
            color: rl.color,
            dashPattern: rl.dashPattern,
            isOverlay: rl.isOverlay,
            removable: rl.removable,
        }));
    }
    const lines = data.lines ?? [];
    return lines.map((line, i) => ({
        values: line,
        label: data.labels?.[i] ?? `Line ${i + 1}`,
    }));
}

/**
 * Render token text with visual indicators for leading spaces and newlines.
 * Returns an HTML string for use in vanilla DOM.
 */
export function renderTokenHTML(text: string | undefined): string {
    if (!text) return "";
    const parts: string[] = [];
    let index = 0;

    if (text.startsWith(" ")) {
        parts.push('<span style="color:#3b82f6">_</span>');
        index = 1;
    }

    let buffer = "";
    for (; index < text.length; index++) {
        const ch = text[index];
        if (ch === "\n") {
            if (buffer) {
                parts.push(escapeHTML(buffer));
                buffer = "";
            }
            parts.push('<span style="color:#3b82f6">\\n</span>');
        } else {
            buffer += ch;
        }
    }
    if (buffer) parts.push(escapeHTML(buffer));

    return parts.join("");
}

export function escapeHTML(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
