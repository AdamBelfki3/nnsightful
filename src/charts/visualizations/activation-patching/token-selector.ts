import { LINE_COLORS } from "../../core/line-plot/colors";
import { renderTokenHTML } from "../../core/line-plot/utils";

// Inline SVG icons
const RESET_SVG = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
const CLOSE_SVG = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const CHEVRON_SVG = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

export interface TokenSelectorConfig {
    allLabels: string[];
    selectedIndices: Set<number>;
    defaultIndices: Set<number>;
    darkMode: boolean;
    onChange: (indices: number[]) => void;
}

interface TokenSelectorState {
    isOpen: boolean;
    searchQuery: string;
}

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`;

// ── Color helpers ────────────────────────────────────────────────────

function colors(dark: boolean) {
    return {
        fg: dark ? "rgba(250,250,250,0.8)" : "rgba(24,24,27,0.8)",
        fgMuted: dark ? "rgba(250,250,250,0.5)" : "rgba(24,24,27,0.5)",
        border: dark ? "rgba(63,63,70,0.4)" : "rgba(228,228,231,0.4)",
        bg: dark ? "rgba(24,24,27,0.95)" : "rgba(255,255,255,0.95)",
        inputBg: dark ? "rgba(24,24,27,0.5)" : "rgba(255,255,255,0.5)",
        hoverBg: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        chipBg: dark ? "rgba(63,63,70,0.5)" : "rgba(244,244,245,1)",
        chipBorder: dark ? "rgba(82,82,91,0.5)" : "rgba(228,228,231,1)",
        chipHoverBg: dark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)",
        chipHoverBorder: dark ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.3)",
        badgeBg: "rgba(139,92,246,0.15)",
        badgeText: "rgba(139,92,246,0.9)",
        badgeBorder: "rgba(139,92,246,0.2)",
        selectedText: dark ? "rgba(250,250,250,0.4)" : "rgba(24,24,27,0.4)",
    };
}

// ── Token selector factory ───────────────────────────────────────────

export function createTokenSelector(config: TokenSelectorConfig): HTMLDivElement {
    const root = document.createElement("div");
    root.style.cssText = `position:relative;flex-shrink:0;margin-bottom:4px;font-family:${FONT};`;

    const state: TokenSelectorState = { isOpen: false, searchQuery: "" };

    // Store cleanup function and state on the element
    const cleanup = buildTokenSelector(root, config, state);
    (root as any).__tokenSelectorCleanup = cleanup;
    (root as any).__tokenSelectorState = state;

    return root;
}

export function updateTokenSelector(el: HTMLDivElement, config: TokenSelectorConfig): void {
    // Preserve dropdown state across rebuilds so rapid multi-select works
    const oldCleanup = (el as any).__tokenSelectorCleanup;
    const oldState = (el as any).__tokenSelectorState as TokenSelectorState | undefined;
    if (oldCleanup) oldCleanup();

    const state: TokenSelectorState = {
        isOpen: oldState?.isOpen ?? false,
        searchQuery: oldState?.searchQuery ?? "",
    };
    const cleanup = buildTokenSelector(el, config, state);
    (el as any).__tokenSelectorCleanup = cleanup;
    (el as any).__tokenSelectorState = state;
}

export function destroyTokenSelector(el: HTMLDivElement): void {
    const cleanup = (el as any).__tokenSelectorCleanup;
    if (cleanup) cleanup();
}

// ── Build the full token selector DOM ────────────────────────────────

function buildTokenSelector(
    root: HTMLDivElement,
    config: TokenSelectorConfig,
    state: TokenSelectorState,
): () => void {
    root.innerHTML = "";
    const c = colors(config.darkMode);
    const { allLabels, selectedIndices, defaultIndices, onChange } = config;

    // ── Header row: "Tokens (N)" + Reset ──
    const header = document.createElement("div");
    header.style.cssText = `display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;`;

    const label = document.createElement("span");
    label.style.cssText = `font-size:11px;color:${c.fgMuted};`;
    label.textContent = `Tokens (${allLabels.length})`;
    header.appendChild(label);

    const isDefault = setsEqual(selectedIndices, defaultIndices);
    if (!isDefault) {
        const resetBtn = document.createElement("button");
        resetBtn.style.cssText =
            `display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;` +
            `cursor:pointer;font-size:11px;color:${c.fgMuted};font-family:${FONT};` +
            `padding:2px 4px;border-radius:3px;transition:all 0.15s;`;
        resetBtn.innerHTML = `${RESET_SVG} Reset`;
        resetBtn.addEventListener("mouseenter", () => { resetBtn.style.color = c.fg; });
        resetBtn.addEventListener("mouseleave", () => { resetBtn.style.color = c.fgMuted; });
        resetBtn.addEventListener("click", () => {
            onChange(Array.from(defaultIndices));
        });
        header.appendChild(resetBtn);
    }
    root.appendChild(header);

    // ── Control area: chips + search input ──
    const control = document.createElement("div");
    control.style.cssText =
        `display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;` +
        `border:1px solid ${c.border};border-radius:6px;background:${c.inputBg};` +
        `cursor:text;min-height:30px;`;
    control.addEventListener("click", () => {
        openDropdown();
        searchInput.focus();
    });

    // Selected token chips
    const sortedSelected = Array.from(selectedIndices).sort((a, b) => a - b);
    for (const idx of sortedSelected) {
        const chip = createChip(idx, allLabels[idx], config.darkMode, () => {
            const next = new Set(selectedIndices);
            next.delete(idx);
            onChange(Array.from(next));
        });
        control.appendChild(chip);
    }

    // Search input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = sortedSelected.length === 0 ? "Search tokens..." : "";
    searchInput.style.cssText =
        `border:none;outline:none;background:transparent;font-size:12px;` +
        `color:${c.fg};font-family:${FONT};min-width:60px;flex:1;padding:2px 0;`;
    searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        renderDropdownOptions();
    });
    searchInput.addEventListener("focus", () => openDropdown());
    control.appendChild(searchInput);

    // Chevron
    const chevron = document.createElement("span");
    chevron.style.cssText =
        `display:flex;align-items:center;color:${c.fgMuted};flex-shrink:0;` +
        `margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`;
    chevron.innerHTML = CHEVRON_SVG;
    chevron.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.isOpen) closeDropdown(); else openDropdown();
    });
    control.appendChild(chevron);

    root.appendChild(control);

    // ── Dropdown ──
    const dropdown = document.createElement("div");
    dropdown.style.cssText =
        `position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;` +
        `background:${c.bg};border:1px solid ${c.border};border-radius:6px;` +
        `box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;` +
        `backdrop-filter:blur(12px);`;

    const optionsList = document.createElement("div");
    optionsList.style.cssText = `max-height:200px;overflow-y:auto;padding:4px 0;`;
    dropdown.appendChild(optionsList);

    const noResults = document.createElement("div");
    noResults.style.cssText =
        `padding:8px 12px;font-size:12px;color:${c.fgMuted};display:none;text-align:center;`;
    noResults.textContent = "No tokens found";
    dropdown.appendChild(noResults);

    root.appendChild(dropdown);

    // ── Render dropdown options ──
    function renderDropdownOptions(): void {
        optionsList.innerHTML = "";
        const query = state.searchQuery.toLowerCase();
        let visibleCount = 0;

        for (let i = 0; i < allLabels.length; i++) {
            const tokenLabel = allLabels[i];
            if (query && !tokenLabel.toLowerCase().includes(query)) continue;
            visibleCount++;

            const isSelected = selectedIndices.has(i);
            const option = createOption(i, tokenLabel, isSelected, config.darkMode, () => {
                const next = new Set(selectedIndices);
                if (isSelected) next.delete(i); else next.add(i);
                onChange(Array.from(next));
            });
            optionsList.appendChild(option);
        }

        noResults.style.display = visibleCount === 0 ? "" : "none";
    }

    // ── Open/close dropdown ──
    function openDropdown(): void {
        if (state.isOpen) return;
        state.isOpen = true;
        dropdown.style.display = "";
        chevron.style.transform = "rotate(180deg)";
        renderDropdownOptions();
    }

    function closeDropdown(): void {
        if (!state.isOpen) return;
        state.isOpen = false;
        dropdown.style.display = "none";
        chevron.style.transform = "";
        searchInput.value = "";
        state.searchQuery = "";
    }

    // Click outside to close
    function onDocumentClick(e: MouseEvent): void {
        if (!root.contains(e.target as Node)) {
            closeDropdown();
        }
    }
    document.addEventListener("mousedown", onDocumentClick);

    // Restore dropdown state from previous build (for seamless multi-select)
    if (state.isOpen) {
        dropdown.style.display = "";
        chevron.style.transform = "rotate(180deg)";
        searchInput.value = state.searchQuery;
        renderDropdownOptions();
        // Re-focus the search input after DOM rebuild
        requestAnimationFrame(() => {
            if (searchInput.isConnected) searchInput.focus();
        });
    }

    // Return cleanup function
    return () => {
        document.removeEventListener("mousedown", onDocumentClick);
    };
}

// ── Chip element ─────────────────────────────────────────────────────

function createChip(
    index: number,
    label: string,
    darkMode: boolean,
    onRemove: () => void,
): HTMLDivElement {
    const c = colors(darkMode);
    const color = LINE_COLORS[index % LINE_COLORS.length];

    const chip = document.createElement("div");
    chip.style.cssText =
        `display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;` +
        `border-radius:4px;border:1px solid ${c.chipBorder};background:${c.chipBg};` +
        `cursor:default;transition:all 0.15s;flex-shrink:0;`;

    chip.addEventListener("mouseenter", () => {
        chip.style.background = c.chipHoverBg;
        chip.style.borderColor = c.chipHoverBorder;
    });
    chip.addEventListener("mouseleave", () => {
        chip.style.background = c.chipBg;
        chip.style.borderColor = c.chipBorder;
    });

    // Color dot
    const dot = document.createElement("span");
    dot.style.cssText =
        `display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;` +
        `background:${color};`;
    chip.appendChild(dot);

    // Label
    const span = document.createElement("span");
    span.style.cssText =
        `font-size:11px;color:${c.fg};max-width:64px;overflow:hidden;` +
        `text-overflow:ellipsis;white-space:nowrap;`;
    span.innerHTML = renderTokenHTML(label);
    span.title = label;
    chip.appendChild(span);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.style.cssText =
        `display:flex;align-items:center;border:none;background:transparent;` +
        `cursor:pointer;color:${c.fgMuted};padding:1px;border-radius:2px;` +
        `transition:color 0.15s;flex-shrink:0;`;
    removeBtn.innerHTML = CLOSE_SVG;
    removeBtn.addEventListener("mouseenter", () => { removeBtn.style.color = c.badgeText; });
    removeBtn.addEventListener("mouseleave", () => { removeBtn.style.color = c.fgMuted; });
    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onRemove();
    });
    chip.appendChild(removeBtn);

    return chip;
}

// ── Option row element ───────────────────────────────────────────────

function createOption(
    index: number,
    label: string,
    isSelected: boolean,
    darkMode: boolean,
    onToggle: () => void,
): HTMLDivElement {
    const c = colors(darkMode);
    const color = LINE_COLORS[index % LINE_COLORS.length];

    const row = document.createElement("div");
    row.style.cssText =
        `display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;` +
        `transition:background 0.1s;font-size:12px;`;
    row.addEventListener("mouseenter", () => { row.style.background = c.hoverBg; });
    row.addEventListener("mouseleave", () => { row.style.background = "transparent"; });
    row.addEventListener("click", (e) => {
        e.stopPropagation();
        onToggle();
    });

    // Color dot
    const dot = document.createElement("span");
    dot.style.cssText =
        `display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;` +
        `background:${isSelected ? color : "transparent"};` +
        `border:1.5px solid ${isSelected ? color : c.fgMuted};`;
    row.appendChild(dot);

    // Label
    const span = document.createElement("span");
    span.style.cssText =
        `flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;` +
        `color:${isSelected ? c.fg : c.fgMuted};`;
    span.innerHTML = renderTokenHTML(label);
    span.title = label;
    row.appendChild(span);

    // Badge for source/target predictions
    const badge = index === 0 ? "source pred" : index === 1 ? "target pred" : null;
    if (badge) {
        const badgeEl = document.createElement("span");
        badgeEl.style.cssText =
            `flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;` +
            `background:${c.badgeBg};color:${c.badgeText};border:1px solid ${c.badgeBorder};`;
        badgeEl.textContent = badge;
        row.appendChild(badgeEl);
    }

    // Selected indicator
    if (isSelected) {
        const sel = document.createElement("span");
        sel.style.cssText = `flex-shrink:0;font-size:10px;color:${c.selectedText};`;
        sel.textContent = "selected";
        row.appendChild(sel);
    }

    return row;
}

// ── Helpers ──────────────────────────────────────────────────────────

export function setsEqual(a: Set<number>, b: Set<number>): boolean {
    if (a.size !== b.size) return false;
    for (const v of a) {
        if (!b.has(v)) return false;
    }
    return true;
}
