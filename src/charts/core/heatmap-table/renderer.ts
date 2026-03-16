import type { HeatmapTableData, HeatmapTableOptions } from "../../types/heatmap-table";

function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

export function buildTableHTML(
    uid: string,
    data: HeatmapTableData,
    options: HeatmapTableOptions,
): string {
    const cellWidth = options.cellWidth ?? 44;
    const rowHeaderWidth = options.rowHeaderWidth ?? 100;
    const darkMode = options.darkMode ?? false;

    let html = "";

    // Colgroup
    html += "<colgroup>";
    html += `<col style="width:${rowHeaderWidth}px;">`;
    for (let c = 0; c < data.columns.length; c++) {
        html += `<col style="width:${cellWidth}px;">`;
    }
    html += "</colgroup>";

    // Data rows
    const rowCount = options.maxRows != null
        ? Math.min(data.rows.length, options.maxRows)
        : data.rows.length;
    for (let r = 0; r < rowCount; r++) {
        const row = data.rows[r];
        html += "<tr>";

        // Row header
        let headerStyle = `width:${rowHeaderWidth}px;max-width:${rowHeaderWidth}px;`;
        if (row.pinned) {
            headerStyle += darkMode ? "background:#4a4a00;color:#fff;" : "background:#fff59d;";
        }
        html += `<td class="hm-row-header${row.pinned ? " hm-pinned" : ""}" data-row="${r}" title="${escapeHtml(row.label)}" style="${headerStyle}">`;
        html += escapeHtml(row.label);
        html += "</td>";

        // Data cells
        for (let c = 0; c < data.columns.length; c++) {
            const cell = data.getCellValue(r, c);
            let cellStyle = `background:${cell.color};color:${cell.textColor};width:${cellWidth}px;max-width:${cellWidth}px;`;
            if (cell.highlighted && cell.highlightColor) {
                cellStyle += `box-shadow:inset 0 0 0 2px ${cell.highlightColor};`;
            }
            if (cell.bold) {
                cellStyle += "font-weight:bold;";
            }
            html += `<td class="hm-cell${cell.highlighted ? " hm-highlighted" : ""}" data-row="${r}" data-col="${c}" style="${cellStyle}">`;
            html += escapeHtml(cell.text);
            html += "</td>";
        }

        html += "</tr>";
    }

    // Column header row (at the bottom, matching LogitLens layout)
    html += "<tr>";
    html += `<th class="hm-corner" style="width:${rowHeaderWidth}px;max-width:${rowHeaderWidth}px;">${escapeHtml(options.cornerLabel ?? "Layer")}</th>`;
    for (let c = 0; c < data.columns.length; c++) {
        html += `<th class="hm-col-header" style="width:${cellWidth}px;max-width:${cellWidth}px;">${escapeHtml(data.columns[c].label)}</th>`;
    }
    html += "</tr>";

    return html;
}
