/**
 * Capture a rendered DOM element as a PNG, in the browser, with no
 * dependencies.
 *
 * The element is cloned with every computed style written inline (so the
 * copy no longer needs the page's stylesheets), wrapped in an SVG
 * <foreignObject>, drawn as an image onto a canvas and read back as a PNG.
 * Canvases inside the element (the line plots) are copied as images, and
 * ::before / ::after content is kept through a scoped <style>.
 *
 * Inline styles only carry what differs from a browser-default element of
 * the same tag, or from the element's parent (so inheritance still lands
 * right); the UA defaults come from elements probed in a blank iframe.
 *
 * Limits: scroll offsets are not reproduced (capture static renderings,
 * which don't scroll), and only system or embedded fonts render — an SVG
 * image can't load the page's web fonts.
 */

import { clampScale } from "./scale";

const XHTML_NS = "http://www.w3.org/1999/xhtml";
const SVG_NS = "http://www.w3.org/2000/svg";

export interface CaptureOptions {
    /** Pixel density of the PNG: 2 renders twice the CSS size. Lowered
     *  automatically when the canvas would exceed browser limits. Default 2. */
    scale?: number;
    /** Fill behind the element, any CSS color; null leaves it transparent.
     *  Default null. */
    background?: string | null;
    /** Whitespace around the element, CSS px. Default 0. */
    padding?: number;
}

export interface ChartSnapshot {
    /** The PNG, as a data URL. */
    dataUrl: string;
    /** Size of the image in CSS px, padding included. The PNG itself is
     *  `width * scale` × `height * scale` pixels. */
    width: number;
    height: number;
    /** Pixel density the PNG was rendered at (≤ the requested scale). */
    scale: number;
    /** The PNG as a Blob. */
    toBlob(): Promise<Blob>;
}

// Properties that don't change how a still image looks.
const SKIP_PROP =
    /^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/;
// SVG geometry lives in attributes, which the clone keeps.
const SVG_GEOMETRY = new Set(["d", "x", "y", "cx", "cy", "r", "rx", "ry"]);
const SKIP_TAG = new Set(["script", "style", "link", "noscript", "template"]);
// A line's computed width reads 0px while its style is none, whatever was
// specified; once the style is set (Tailwind's preflight makes every border
// solid), an omitted width would fall back to the initial `medium`.
const LINE_WIDTH_OF: [style: string, width: string][] = [
    ["border-top-style", "border-top-width"],
    ["border-right-style", "border-right-width"],
    ["border-bottom-style", "border-bottom-width"],
    ["border-left-style", "border-left-width"],
    ["outline-style", "outline-width"],
    ["column-rule-style", "column-rule-width"],
];
// XML 1.0 forbids most C0 controls and U+FFFE/U+FFFF; lone surrogates are not
// characters at all (and make encodeURIComponent throw). Model tokens can
// hold any of these.
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/** Browser-default computed styles, per tag, probed in a blank iframe. */
class StyleSandbox {
    private frame: HTMLIFrameElement;
    private win: Window;
    private doc: Document;
    private svgRoot: Element;
    private cache = new Map<string, Map<string, string>>();

    constructor() {
        this.frame = document.createElement("iframe");
        this.frame.setAttribute("aria-hidden", "true");
        this.frame.tabIndex = -1;
        this.frame.style.cssText =
            "position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;";
        document.body.appendChild(this.frame);
        this.win = this.frame.contentWindow!;
        this.doc = this.frame.contentDocument!;
        this.doc.open();
        this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
        this.doc.close();
        this.svgRoot = this.doc.createElementNS(SVG_NS, "svg");
        this.doc.body.appendChild(this.svgRoot);
    }

    /** The default computed style of an element with `el`'s namespace and
     *  tag (or of its `pseudo` element). */
    defaults(el: Element, pseudo?: string): Map<string, string> {
        const ns = el.namespaceURI ?? XHTML_NS;
        const key = `${ns} ${el.localName}${pseudo ?? ""}`;
        let map = this.cache.get(key);
        if (map) return map;
        const probe = this.doc.createElementNS(ns, el.localName);
        (ns === SVG_NS ? this.svgRoot : this.doc.body).appendChild(probe);
        const cs = this.win.getComputedStyle(probe, pseudo ?? null);
        map = new Map();
        for (let i = 0; i < cs.length; i++) {
            const prop = cs.item(i);
            map.set(prop, cs.getPropertyValue(prop));
        }
        probe.remove();
        this.cache.set(key, map);
        return map;
    }

    destroy(): void {
        this.frame.remove();
    }
}

/** Inline CSS for `cs`: every property that differs from the tag default,
 *  or from the parent's value (an inherited property must be restated when
 *  the parent's differs, even if it equals the default), plus the width of
 *  every border/outline that has a style. */
function styleText(
    cs: CSSStyleDeclaration,
    defaults: Map<string, string>,
    parent: CSSStyleDeclaration | null,
    svg: boolean,
): string {
    let out = "";
    const written = new Set<string>();
    for (let i = 0; i < cs.length; i++) {
        const prop = cs.item(i);
        if (SKIP_PROP.test(prop) || (svg && SVG_GEOMETRY.has(prop))) continue;
        const value = cs.getPropertyValue(prop);
        if (value === defaults.get(prop) && (!parent || value === parent.getPropertyValue(prop))) continue;
        out += `${prop}:${value};`;
        written.add(prop);
    }
    for (const [style, width] of LINE_WIDTH_OF) {
        const lineStyle = cs.getPropertyValue(style);
        if (lineStyle && lineStyle !== "none" && lineStyle !== "hidden" && !written.has(width)) {
            out += `${width}:${cs.getPropertyValue(width)};`;
        }
    }
    return out;
}

interface CloneContext {
    sandbox: StyleSandbox;
    rules: string[];
    nextClass: number;
}

function cloneTree(src: Node, parentCs: CSSStyleDeclaration | null, ctx: CloneContext): Node | null {
    if (src.nodeType === Node.TEXT_NODE) return document.createTextNode(src.nodeValue ?? "");
    if (src.nodeType !== Node.ELEMENT_NODE) return null;
    const el = src as Element;
    if (SKIP_TAG.has(el.localName.toLowerCase())) return null;
    const cs = getComputedStyle(el);
    if (cs.display === "none") return null;

    const isCanvas = el instanceof HTMLCanvasElement;
    let clone: Element;
    if (isCanvas) {
        // A cloned canvas is blank; carry its pixels over as an image.
        clone = document.createElement("img");
        try {
            clone.setAttribute("src", (el as HTMLCanvasElement).toDataURL("image/png"));
        } catch {
            // A tainted canvas can't be read; leave the image empty.
        }
    } else {
        clone = el.cloneNode(false) as Element;
    }
    clone.setAttribute("style", styleText(cs, ctx.sandbox.defaults(el), parentCs, el.namespaceURI === SVG_NS));

    // Generated content: restate each pseudo-element's computed style in a
    // rule scoped to a class on the clone (it keeps its attributes, so
    // `content: attr(...)` still resolves).
    let pseudoCss = "";
    let cls = "";
    for (const pseudo of ["::before", "::after"]) {
        const pcs = getComputedStyle(el, pseudo);
        const content = pcs.getPropertyValue("content");
        if (!content || content === "none" || content === "normal" || pcs.display === "none") continue;
        cls ||= `nns-snap-${ctx.nextClass++}`;
        pseudoCss += `.${cls}${pseudo}{${styleText(pcs, ctx.sandbox.defaults(el, pseudo), cs, false)}}`;
    }
    if (cls) {
        clone.setAttribute("class", `${clone.getAttribute("class") ?? ""} ${cls}`.trim());
        ctx.rules.push(pseudoCss);
    }

    if (!isCanvas) {
        for (const child of Array.from(el.childNodes)) {
            const c = cloneTree(child, cs, ctx);
            if (c) clone.appendChild(c);
        }
    }
    return clone;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Snapshot failed: the browser could not render the captured element."));
        img.src = src;
    });
}

/**
 * Capture `el` as it is currently rendered (it must be attached to the
 * document and laid out) as a PNG.
 */
export async function captureElement(el: Element, options: CaptureOptions = {}): Promise<ChartSnapshot> {
    const pad = Math.max(0, options.padding ?? 0);
    const rect = el.getBoundingClientRect();
    const elW = Math.ceil(rect.width);
    const elH = Math.ceil(rect.height);
    if (elW === 0 || elH === 0) throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");
    const width = elW + 2 * pad;
    const height = elH + 2 * pad;
    const scale = clampScale(width, height, options.scale ?? 2);

    const sandbox = new StyleSandbox();
    let xhtml: string;
    try {
        const ctx: CloneContext = { sandbox, rules: [], nextClass: 0 };
        const root = cloneTree(el, null, ctx) as Element | null;
        if (!root) throw new Error("Snapshot failed: the element is not displayed.");
        // Pin the copy at the frame's origin at its rendered size, whatever
        // positioning put the original where it is.
        root.setAttribute(
            "style",
            root.getAttribute("style")
                + `position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;`
                + `transform:none;translate:none;scale:none;rotate:none;`
                + `width:${elW}px;height:${elH}px;box-sizing:border-box;`,
        );
        const frame = document.createElementNS(XHTML_NS, "div");
        frame.setAttribute("style", `width:${width}px;height:${height}px;padding:${pad}px;margin:0;box-sizing:border-box;`);
        if (ctx.rules.length) {
            const style = document.createElementNS(XHTML_NS, "style");
            style.textContent = ctx.rules.join("");
            frame.appendChild(style);
        }
        frame.appendChild(root);
        xhtml = new XMLSerializer().serializeToString(frame).replace(INVALID_XML, "�");
    } finally {
        sandbox.destroy();
    }

    // Size the SVG at the output resolution so it rasterizes crisply.
    const svg =
        `<svg xmlns="${SVG_NS}" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">`
        + `<foreignObject x="0" y="0" width="${width}" height="${height}">${xhtml}</foreignObject></svg>`;
    const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const g = canvas.getContext("2d");
    if (!g) throw new Error("Snapshot failed: no 2D canvas context.");
    if (options.background) {
        g.fillStyle = options.background;
        g.fillRect(0, 0, canvas.width, canvas.height);
    }
    g.drawImage(img, 0, 0, canvas.width, canvas.height);

    return {
        dataUrl: canvas.toDataURL("image/png"),
        width,
        height,
        scale,
        toBlob: () =>
            new Promise<Blob>((resolve, reject) =>
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Snapshot failed: could not encode the PNG."))), "image/png"),
            ),
    };
}
