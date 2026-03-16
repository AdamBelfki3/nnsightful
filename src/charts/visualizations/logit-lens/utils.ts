export function generateUid(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return "ll_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    }
    return "ll_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

export function niceMax(p: number): number {
    if (p >= 0.95) return 1.0;
    const niceValues = [0.003, 0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 1.0];
    for (const v of niceValues) {
        if (p <= v) return v;
    }
    return 1.0;
}

export function formatPct(p: number): string {
    const pct = p * 100;
    if (pct >= 1) return Math.round(pct) + "%";
    if (pct >= 0.1) return pct.toFixed(1) + "%";
    return pct.toFixed(2) + "%";
}

export function normalizeForComparison(token: string): string {
    return token.replace(/[\s.,!?;:'"()\[\]{}\-_]/g, "").toLowerCase();
}

export function hasSimilarTokensInList(
    topkList: Array<{ token: string }>,
    targetToken: string,
): boolean {
    const targetNorm = normalizeForComparison(targetToken);
    if (!targetNorm) return false;
    for (const item of topkList) {
        if (item.token === targetToken) continue;
        const otherNorm = normalizeForComparison(item.token);
        if (otherNorm && otherNorm === targetNorm) return true;
    }
    return false;
}

const invisibleEntityMap: Record<string, string> = {
    "\u00A0": "&nbsp;",
    "\u00AD": "&shy;",
    "\u200B": "&#8203;",
    "\u200C": "&zwnj;",
    "\u200D": "&zwj;",
    "\uFEFF": "&#65279;",
    "\u2060": "&#8288;",
    "\u2002": "&ensp;",
    "\u2003": "&emsp;",
    "\u2009": "&thinsp;",
    "\u200A": "&#8202;",
    "\u2006": "&#8198;",
    "\u2008": "&#8200;",
    "\u200E": "&lrm;",
    "\u200F": "&rlm;",
    "\t": "&#9;",
    "\n": "&#10;",
    "\r": "&#13;",
};

export function visualizeSpaces(text: string, spellOutEntities?: boolean): string {
    let result = text;

    if (spellOutEntities) {
        let output = "";
        for (let i = 0; i < result.length; i++) {
            const ch = result[i];
            output += invisibleEntityMap[ch] || ch;
        }
        result = output;
    }

    let leadingSpaces = 0;
    while (leadingSpaces < result.length && result[leadingSpaces] === " ") leadingSpaces++;
    if (leadingSpaces > 0) {
        result = "\u02FD".repeat(leadingSpaces) + result.slice(leadingSpaces);
    }
    let trailingSpaces = 0;
    while (trailingSpaces < result.length && result[result.length - 1 - trailingSpaces] === " ")
        trailingSpaces++;
    if (trailingSpaces > 0) {
        result = result.slice(0, result.length - trailingSpaces) + "\u02FD".repeat(trailingSpaces);
    }

    return result;
}
