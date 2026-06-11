// Shared text helpers for the HeatmapTable renderer.

export function escapeHtml(text: string): string {
    if (typeof document === "undefined") {
        return String(text ?? "").replace(/[&<>"']/g, (c) =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
    }
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
}

// A leading space is shown as a blue underscore (matching the LogitLens /
// activation-patching token UI), the rest escaped.
export function tokenInnerHTML(raw: string): string {
    if (raw === undefined || raw === null) return "";
    if (raw.startsWith(" ")) {
        return '<span class="hmx-lead-space">_</span>' + escapeHtml(raw.slice(1));
    }
    return escapeHtml(raw);
}
