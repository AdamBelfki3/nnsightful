import type { LinePlotSection } from "../../types/line-plot";
import { PlotLayout, type TextMeasure } from "./layout";

/** A section as drawn: its pixel span on the plot, and where its dividers fall. */
export interface SectionBand {
    x0: number;
    x1: number;
    label?: string;
    tinted: boolean;
    dividers: number[];
}

/** A section's label as drawn: its text and the x it is centered on. */
export interface SectionCaption {
    text: string;
    x: number;
}

/**
 * The bands a line plot draws for its data's sections (`LinePlotSection`):
 * every other section tinted, a faint line at each divider, and the labels in
 * a row over the plot, which the plot makes room for (`LABEL_ROOM`). A label
 * wider than its band runs past it where the labels beside it leave room,
 * is shortened otherwise, and is left out only when no readable part of it
 * fits (`captions`).
 */
export class SectionBands {
    /** Height the labels' row takes over the plot. */
    static readonly LABEL_ROOM = 16;
    /** Clear space kept between two labels, and inside a band's edges. */
    static readonly LABEL_GAP = 6;
    static readonly LABEL_INSET = 2;

    static labelled(sections: LinePlotSection[]): boolean {
        return sections.some((section) => !!section.label);
    }

    /**
     * A section's label as drawn in `room` pixels: whole when it fits; else
     * its initial and number when it ends in one ("Pass 2" as "P2"), or its
     * start and an ellipsis. Null when none of those fits.
     */
    static caption(label: string, room: number, measure: TextMeasure): string | null {
        const text = label.toUpperCase();
        if (measure(text) <= room) return text;
        const numbered = /^(\S)\D*?(\d+)$/.exec(text);
        if (!numbered) return PlotLayout.clip(text, room, measure);
        const short = numbered[1] + numbered[2];
        return measure(short) <= room ? short : null;
    }

    /**
     * The labels to draw over `bands`, between `left` and `right`. A label
     * that fits its band is centered on it. One that does not keeps its whole
     * text when it clears the labels beside it by `LABEL_GAP`, shifted off
     * center as far as that takes; failing that it is shortened to its band.
     * A neighbour holds its own text when that is centered in its band, and
     * its whole band when it is not.
     */
    static captions(
        bands: SectionBand[],
        left: number,
        right: number,
        measure: TextMeasure,
    ): SectionCaption[] {
        const texts = bands.map((band) => band.label?.toUpperCase() ?? "");
        const widths = texts.map((text) => (text ? measure(text) : 0));
        const mid = (i: number) => (bands[i].x0 + bands[i].x1) / 2;
        const room = (i: number) => bands[i].x1 - bands[i].x0 - 2 * SectionBands.LABEL_INSET;
        const fits = bands.map((_, i) => !!texts[i] && widths[i] <= room(i));
        const held = (j: number, side: "x0" | "x1") => {
            if (fits[j]) return mid(j) + (side === "x1" ? 0.5 : -0.5) * widths[j];
            return texts[j] ? bands[j][side] : bands[j][side === "x1" ? "x0" : "x1"];
        };

        return bands.flatMap((band, i) => {
            if (!texts[i]) return [];
            if (fits[i]) return [{ text: texts[i], x: mid(i) }];
            const lo = i === 0 ? left : held(i - 1, "x1") + SectionBands.LABEL_GAP;
            const hi = i === bands.length - 1 ? right : held(i + 1, "x0") - SectionBands.LABEL_GAP;
            if (widths[i] <= hi - lo) {
                const half = widths[i] / 2;
                return [{ text: texts[i], x: Math.min(hi - half, Math.max(lo + half, mid(i))) }];
            }
            const short = SectionBands.caption(band.label!, room(i), measure);
            return short ? [{ text: short, x: mid(i) }] : [];
        });
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

    /** Draws the bands over the plot area that starts at `top` and is `height`
     *  tall, on a canvas `width` wide. */
    static draw(
        ctx: CanvasRenderingContext2D,
        bands: SectionBand[],
        top: number,
        height: number,
        darkMode: boolean,
        width: number,
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
        const captions = SectionBands.captions(
            bands,
            SectionBands.LABEL_INSET,
            width - SectionBands.LABEL_INSET,
            (text) => ctx.measureText(text).width,
        );
        for (const caption of captions) ctx.fillText(caption.text, caption.x, top - 5);

        ctx.restore();
    }
}
