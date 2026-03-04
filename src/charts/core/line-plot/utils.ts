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
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
