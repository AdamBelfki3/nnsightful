/** The drawn width of a string, in pixels (a canvas context's `measureText`). */
export type TextMeasure = (text: string) => number;

export interface PlotMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/**
 * How a line plot fits the width it is given. A narrow plot is laid out
 * again, not squeezed: its legend moves over the plot, its margins follow its
 * tick labels, its title wraps, and its points and x ticks thin out as they
 * crowd, so the lines keep the room. Sizes are CSS pixels.
 */
export class PlotLayout {
    /** A plot narrower than this, legend included, is compact. */
    static readonly COMPACT_BELOW = 520;
    /** A title takes at most this many lines, each this tall. */
    static readonly TITLE_MAX_LINES = 2;
    static readonly TITLE_LINE = 18;
    /** Clear space kept between two x tick labels. */
    static readonly TICK_GAP = 8;
    /** Points closer than this draw a smaller marker; closer than
     *  `MARKERS_OFF_BELOW`, none. */
    static readonly MARKERS_SMALL_BELOW = 9;
    static readonly MARKERS_OFF_BELOW = 6;

    static compact(width: number): boolean {
        return width > 0 && width < PlotLayout.COMPACT_BELOW;
    }

    /**
     * The room around the plot area. `titleLines` is the number of lines the
     * title takes (0 without one), `labelRoom` the height of a row of labels
     * over the plot, `yLabelWidth` the widest y tick label. A compact plot
     * keeps only the room its y labels need.
     */
    static margin(
        compact: boolean,
        titleLines: number,
        labelRoom: number,
        yLabelWidth: number,
    ): PlotMargin {
        const wrapped = Math.max(0, titleLines - 1) * PlotLayout.TITLE_LINE;
        if (!compact) {
            return {
                top: (titleLines > 0 ? 48 : 24) + wrapped + labelRoom,
                right: 24,
                bottom: 56,
                left: 72,
            };
        }
        return {
            top: (titleLines > 0 ? 32 : 14) + wrapped + labelRoom,
            right: 12,
            bottom: 46,
            left: Math.max(40, Math.ceil(yLabelWidth) + PlotLayout.offsets(true).yLabel + 18),
        };
    }

    /**
     * Where the text around the plot sits: the title's first baseline, the
     * y title's left edge, and the distances of the y labels (to the axis'
     * left), the x labels (under it) and the x title (from the bottom edge).
     */
    static offsets(compact: boolean) {
        return compact
            ? { title: 20, yTitle: 2, yLabel: 8, xLabel: 8, xTitle: 14 }
            : { title: 28, yTitle: 14, yLabel: 16, xLabel: 12, xTitle: 16 };
    }

    /** The radius of a point's marker when points are `spacing` apart; 0
     *  where markers would run into one another, and the line alone shows. */
    static markerRadius(spacing: number): number {
        if (spacing < PlotLayout.MARKERS_OFF_BELOW) return 0;
        return spacing < PlotLayout.MARKERS_SMALL_BELOW ? 2.5 : 3.5;
    }

    /**
     * The x indices to label, of `count` points `spacing` apart whose widest
     * label is `labelWidth`: about eight evenly stepped ones and the last,
     * with the step widened until neighbours clear one another, and a tick
     * too close to the last one giving way to it.
     */
    static xTicks(count: number, spacing: number, labelWidth: number): number[] {
        if (count <= 0) return [];
        const last = count - 1;
        const room = labelWidth + PlotLayout.TICK_GAP;
        const base = Math.max(1, Math.ceil(count / 8));
        const step = spacing > 0 ? base * Math.max(1, Math.ceil(room / (base * spacing))) : base;
        const ticks: number[] = [];
        for (let i = 0; i < last; i += step) {
            if ((last - i) * spacing >= room) ticks.push(i);
        }
        ticks.push(last);
        return ticks;
    }

    /**
     * `text` broken at spaces into lines no wider than `room`, at most
     * `maxLines` of them; what is left over ends the last line, clipped.
     */
    static wrap(text: string, room: number, maxLines: number, measure: TextMeasure): string[] {
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let next = 0;
        while (next < words.length && lines.length < maxLines) {
            let line = words[next++];
            if (lines.length === maxLines - 1) {
                line = words.slice(next - 1).join(" ");
                next = words.length;
            } else {
                while (next < words.length && measure(`${line} ${words[next]}`) <= room) {
                    line += ` ${words[next++]}`;
                }
            }
            lines.push(PlotLayout.clip(line, room, measure) ?? line);
        }
        return lines;
    }

    /**
     * `text` if it fits `room`, else its longest start that fits with an
     * ellipsis, keeping at least `minChars` characters; null when even that
     * does not fit.
     */
    static clip(text: string, room: number, measure: TextMeasure, minChars = 3): string | null {
        if (measure(text) <= room) return text;
        for (let n = text.length - 1; n >= minChars; n--) {
            const clipped = `${text.slice(0, n).trimEnd()}…`;
            if (measure(clipped) <= room) return clipped;
        }
        return null;
    }
}
