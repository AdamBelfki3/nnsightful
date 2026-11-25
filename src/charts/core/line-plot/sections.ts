import type { LinePlotSection } from "../../types/line-plot";

/** A section as drawn: its pixel span on the plot, and where its dividers fall. */
export interface SectionBand {
    x0: number;
    x1: number;
    label?: string;
    tinted: boolean;
    dividers: number[];
}

/**
 * The bands a line plot draws for its data's sections (`LinePlotSection`):
 * every other section tinted, a faint line at each divider, and the labels in
 * a row over the plot, which the plot makes room for (`LABEL_ROOM`). A label
 * wider than its band is left out, so a narrow plot keeps its bands and loses
 * only the names.
 */
export class SectionBands {
    /** Height the labels' row takes over the plot. */
    static readonly LABEL_ROOM = 16;

    static labelled(sections: LinePlotSection[]): boolean {
        return sections.some((section) => !!section.label);
    }

    /** The label of the section holding x index `index`, if it has one. */
    static labelAt(sections: LinePlotSection[] | null | undefined, index: number): string | undefined {
        return sections?.find((section) => section.start <= index && index <= section.end)?.label;
    }

    /**
     * Places the sections on a plot whose x indices `first` to `last` span
     * `width` pixels from `left`. A band reaches half a step past its first
     * and last index, clipped to the plot; a section outside the plot is
     * dropped, and the tint still alternates by a section's place in the list.
     */
    static layout(
        sections: LinePlotSection[],
        first: number,
        last: number,
        left: number,
        width: number,
    ): SectionBand[] {
        if (last <= first) return [];
        const right = left + width;
        const edge = (index: number) =>
            Math.min(right, Math.max(left, left + ((index - first) / (last - first)) * width));

        return sections.flatMap((section, i) => {
            const x0 = edge(section.start - 0.5);
            const x1 = edge(section.end + 0.5);
            if (x1 <= x0) return [];
            const dividers = (section.dividers ?? [])
                .filter((index) => index > section.start && index <= section.end)
                .map((index) => edge(index - 0.5))
                .filter((x) => x > x0 && x < x1);
            return [{ x0, x1, label: section.label, tinted: i % 2 === 1, dividers }];
        });
    }

    /** Draws the bands over the plot area that starts at `top` and is `height` tall. */
    static draw(
        ctx: CanvasRenderingContext2D,
        bands: SectionBand[],
        top: number,
        height: number,
        darkMode: boolean,
    ): void {
        if (bands.length === 0) return;
        ctx.save();

        ctx.fillStyle = darkMode ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.035)";
        for (const band of bands) {
            if (band.tinted) ctx.fillRect(band.x0, top, band.x1 - band.x0, height);
        }

        ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        for (const x of bands.flatMap((band) => band.dividers)) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, top);
            ctx.lineTo(Math.round(x) + 0.5, top + height);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.fillStyle = darkMode ? "#71717a" : "#a1a1aa";
        ctx.font = "500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        for (const band of bands) {
            if (!band.label) continue;
            const text = band.label.toUpperCase();
            if (ctx.measureText(text).width > band.x1 - band.x0 - 4) continue;
            ctx.fillText(text, (band.x0 + band.x1) / 2, top - 5);
        }

        ctx.restore();
    }
}
