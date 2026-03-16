export function generateHeatmapStyles(uid: string): string {
    return `
        .heatmap-${uid} {
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed;
        }
        .heatmap-${uid} td, .heatmap-${uid} th {
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        .heatmap-${uid} .hm-cell {
            height: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 0.9em;
            cursor: pointer;
            position: relative;
        }
        .heatmap-${uid} .hm-cell:hover {
            outline: 2px solid #e91e63;
            outline-offset: -1px;
        }
        .heatmap-${uid} .hm-row-header {
            padding: 2px 8px;
            text-align: right;
            font-weight: 500;
            color: #333;
            background: #f5f5f5;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: monospace;
            cursor: pointer;
            position: relative;
        }
        .heatmap-${uid} .hm-row-header:hover {
            background: #e8e8e8;
        }
        .heatmap-${uid} .hm-col-header {
            padding: 4px 2px;
            text-align: center;
            font-weight: 500;
            color: #666;
            background: #f5f5f5;
            position: relative;
        }
        .heatmap-${uid} .hm-corner {
            padding: 4px 8px;
            text-align: right;
            font-weight: 500;
            color: #666;
            background: white;
            position: relative;
        }
        /* Dark mode */
        .heatmap-${uid}.hm-dark td, .heatmap-${uid}.hm-dark th {
            border-color: #444;
        }
        .heatmap-${uid}.hm-dark .hm-row-header {
            background: #2d2d2d;
            color: #e0e0e0;
        }
        .heatmap-${uid}.hm-dark .hm-row-header:hover {
            background: #3d3d3d;
        }
        .heatmap-${uid}.hm-dark .hm-col-header {
            background: #2d2d2d;
            color: #aaa;
        }
        .heatmap-${uid}.hm-dark .hm-corner {
            background: #1e1e1e;
            color: #aaa;
        }
    `;
}

export function injectHeatmapStyles(uid: string): HTMLStyleElement {
    if (typeof document === 'undefined') {
        return {} as HTMLStyleElement;
    }
    const style = document.createElement("style");
    style.textContent = generateHeatmapStyles(uid);
    document.head.appendChild(style);
    return style;
}
