"use strict";var InterpTools=(()=>{var bt=Object.defineProperty;var to=Object.getOwnPropertyDescriptor;var no=Object.getOwnPropertyNames;var oo=Object.prototype.hasOwnProperty;var io=(o,e)=>{for(var t in e)bt(o,t,{get:e[t],enumerable:!0})},lo=(o,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of no(e))!oo.call(o,l)&&l!==t&&bt(o,l,{get:()=>e[l],enumerable:!(n=to(e,l))||n.enumerable});return o};var ro=o=>lo(bt({},"__esModule",{value:!0}),o);var Ko={};io(Ko,{ActivationPatchingWidget:()=>Mn,HeatmapTableWidget:()=>kn,LinePlotWidget:()=>Ln,LogitLensWidget:()=>yn,captureElement:()=>et,snapshotChart:()=>xn});function Xt(o){return o.completion&&o.completion.length?[...o.input,...o.completion]:o.input}function so(o){let e=o.positions,t=Xt(o).length;if(!e||e.length===t&&e.every((a,d)=>a===d))return{data:o,computedRows:null};let n=new Array(t);e.forEach((a,d)=>{Number.isInteger(a)&&a>=0&&a<t&&d<o.tracked.length&&(n[a]=d)});let l=Array.from({length:t},(a,d)=>d),s=(a,d,r)=>{let g=n[d];return g!==void 0&&a&&g<a.length?a[g]:r()};return{data:{...o,positions:null,tracked:l.map(a=>s(o.tracked,a,()=>({}))),topk:o.topk.map(a=>l.map(d=>s(a,d,()=>[]))),entropy:o.entropy?o.entropy.map(a=>l.map(d=>s(a,d,()=>0))):o.entropy},computedRows:l.filter(a=>n[a]!==void 0)}}function Yt(o){let e=o.computedRows;if(!e)return[];let t=o.tokens.length,n=[],l=0;for(let s of[...e,t])s>l&&n.push({start:l,end:s-1,collapsed:!0,locked:!0,label:"not computed"}),l=s+1;return n}function xt(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:t,computedRows:n}=so(o),l=t.layers.length,s=Xt(t),p=s.length,a=[];for(let r=0;r<p;r++){let g=[],f=t.tracked[r]??{};for(let x=0;x<l;x++){let c=t.topk[x]?.[r]??[],k=[];for(let S=0;S<c.length;S++){let R=c[S],L=f[R]||[],P=L[x]||0;k.push({token:R,prob:P,trajectory:L})}let $=k[0]||{token:"",prob:0,trajectory:[]};g.push({token:$.token,prob:$.prob,trajectory:$.trajectory,topk:k})}a.push(g)}return{normalized:{layers:t.layers,tokens:s,cells:a,meta:t.meta||{},computedRows:n,sections:t.sections},v2Data:t}}function qt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function _e(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function ao(o){let e=`#${o}`;return`
        ${e} {
            /* \u2500\u2500 Local design tokens (light) \u2500\u2500 */
            --ll-surface: hsl(0 0% 100%);
            --ll-surface-2: hsl(0 0% 98%);
            --ll-surface-3: hsl(0 0% 97%);
            --ll-card-border: hsl(0 0% 82%);
            --ll-line: hsl(0 0% 90%);
            --ll-line-2: hsl(0 0% 88%);
            --ll-line-faint: hsl(0 0% 93%);
            --ll-text: hsl(0 0% 9%);
            --ll-text-2: hsl(0 0% 20%);
            --ll-text-muted: hsl(0 0% 40%);
            --ll-text-faint: hsl(0 0% 58%);
            --ll-primary: hsl(217.2193 91.2195% 59.8039%);
            --ll-primary-061: hsl(217.2193 91.2195% 59.8039% / 0.06);
            --ll-primary-018: hsl(217.2193 91.2195% 59.8039% / 0.18);
            --ll-primary-007: hsl(217.2193 91.2195% 59.8039% / 0.07);
            --ll-shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
            --ll-font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            --ll-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

            box-sizing: border-box;
            position: relative;
            font-family: var(--ll-font-sans);
            color: var(--ll-text);
            -webkit-font-smoothing: antialiased;
            /* Don't inherit a host's pre-wrap (e.g. a contenteditable editor),
               which would render the markup's whitespace as blank lines. */
            white-space: normal; word-break: normal;
            background: var(--ll-surface);
            border: 1px solid var(--ll-card-border);
            border-radius: 0.75rem;
            box-shadow: var(--ll-shadow-xs);
            padding: 20px;
            /* width:100% + max-width:100% + min-width:0 keep the card bounded
               to its container (never grown by the wide heatmap inside, which
               fits its columns to width and scrolls within .ll-heatmap). */
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
            /* Flex column in BOTH modes: the heatmap (.ll-heatmap, hosting the
               HeatmapTableCore) flex-grows to absorb available height and the
               core scrolls inside it; the navigator and line plot keep their
               natural size below.
                - Content (Jupyter): applyCardSizing sets an inline max-height
                  on the root from --ll-aspect-ratio, so the card caps at the
                  width\xD7ratio box and the heatmap scrolls inside it (faithful
                  to the old applyOuterCap).
                - Fill (workbench): .ll-fill makes the card fill the panel. */
            display: flex; flex-direction: column;
        }
        ${e} *, ${e} *::before, ${e} *::after { box-sizing: border-box; }

        /* \u2500\u2500 Dark theme overrides (chrome only; cells stay light) \u2500\u2500 */
        ${e}.ll-dark {
            --ll-surface: hsl(0 0% 16%);
            --ll-surface-2: hsl(0 0% 13%);
            --ll-surface-3: hsl(0 0% 20%);
            --ll-card-border: hsl(0 0% 26%);
            --ll-line: hsl(0 0% 26%);
            --ll-line-2: hsl(0 0% 30%);
            --ll-line-faint: hsl(0 0% 24%);
            --ll-text: hsl(0 0% 90%);
            --ll-text-2: hsl(0 0% 80%);
            --ll-text-muted: hsl(0 0% 64%);
            --ll-text-faint: hsl(0 0% 55%);
            color-scheme: dark;
        }

        /* Flex roles for the card's stacked regions (see #${o} above).
           .ll-heatmap (fixed layer header + scrollable rows) takes the
           growable slot; nav + line plot keep their natural size. */
        ${e} .ll-heatmap { flex: 1 1 auto; min-height: 0; }
        ${e} .ll-nav,
        ${e} .ll-lineplot-wrap { flex: 0 0 auto; }

        /* Fill mode (workbench): the host panel already frames the widget, so
           drop our own card chrome (border, rounded corner, shadow, surface
           background, padding) \u2014 it would otherwise be a redundant box inside
           the panel. The notebook (content mode) keeps the full card since it
           stands alone in a cell. */
        ${e}.ll-fill {
            width: 100%; height: 100%;
            border: none; border-radius: 0; box-shadow: none;
            background: transparent; padding: 0;
        }

        /* Static (report / snapshot): bare like fill mode, sized to content,
           and inert \u2014 the host frames it and owns any click. */
        ${e}.ll-static {
            border: none; border-radius: 0; box-shadow: none;
            background: transparent; padding: 0;
            pointer-events: none;
        }
        ${e}.ll-static .ll-skyline { cursor: default; }
        ${e}.ll-static .ll-skyline-handle { display: none; }

        /* Leading-space marker, used in cell + row-label token rendering. */
        ${e} .ll-lead-space { color: #3b82f6; }

        /* \u2500\u2500 Heatmap region: rendered by HeatmapTableCore, mounted into
              .ll-heatmap. The core owns the grid (fixed header, scroll, cells,
              corner rounding, hover outline) under its OWN #hmx_* root \u2014 which
              is nested inside this widget root, so the #uid-scoped rules below
              reach the few domain visuals we inject into the core's labels /
              rows via renderRowLabel + rowClassName (bos pill, dash marker,
              active-row rail + tint, row cursor). \u2500\u2500 */
        ${e} .ll-heatmap {
            display: flex; flex-direction: column;
            min-width: 0; max-width: 100%;
        }
        /* Every logit-lens row is clickable (pin position / open popup). */
        ${e} .ll-hmx-row .hmx-row-grid,
        ${e} .ll-hmx-row .hmx-rowlabel { cursor: pointer; }
        /* Active row (selected or pinned): a left accent rail + a subtle tint.
           The cells are opaque, so the tint reads in the label gutter \u2014 the old
           .ll-row-sel look. .hmx-row is position:relative (core), so ::before
           anchors to it. */
        ${e} .hmx-row.ll-hmx-active::before {
            content: ""; position: absolute; left: -1px; top: 0; bottom: 0;
            width: 3px; background: var(--ll-primary); border-radius: 2px; z-index: 2;
        }
        ${e} .hmx-row.ll-hmx-active .hmx-row-grid {
            background: var(--ll-surface-2);
            box-shadow: 0 0 0 1px var(--ll-primary-018);
            border-radius: 4px;
        }
        /* Pinned-row line-style marker + bos pill, emitted by renderRowLabel. */
        ${e} .ll-row-style { flex-shrink: 0; }
        ${e} .ll-bos-pill {
            display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
            border: 1px solid var(--ll-line-2); border-radius: 3px;
            font-family: var(--ll-font-mono); font-size: 10px; font-weight: 500;
            color: var(--ll-text-muted); background: var(--ll-surface-3); letter-spacing: 0.02em;
        }

        /* Generation phase (keyed by original row index, so it survives
           collapse): generated token labels are italic only \u2014 same color as
           every other token label. */
        ${e} .ll-gen-row .hmx-rowlabel .hmx-cell-text { font-style: italic; }

        /* A chat template's own tokens: dimmed labels, so the rows of the
           prompt read as the subject. The active row keeps its weight. */
        ${e} .ll-template-row .hmx-rowlabel .hmx-cell-text,
        ${e} .ll-template-row .hmx-rowlabel .ll-bos-pill { opacity: 0.45; }

        /* On-demand fold handle (\u229F) in the row-label gutter: revealed on row
           hover, lit while it's the fold anchor. margin-right:auto pushes it to
           the outer (left) edge so it reads as a side control and doesn't shift
           the right-aligned token. */
        ${e} .ll-fold-handle {
            margin-right: auto; flex: 0 0 auto;
            display: none; align-items: center; justify-content: center;
            width: 15px; height: 15px; border-radius: 4px;
            border: 1px solid var(--ll-line-2); background: var(--ll-surface);
            color: var(--ll-text-muted); font-size: 11px; line-height: 1; cursor: pointer;
        }
        ${e} .hmx-row:hover .ll-fold-handle { display: inline-flex; }
        ${e} .ll-fold-handle:hover { border-color: var(--ll-primary); color: var(--ll-primary); }
        ${e} .ll-fold-handle.ll-armed {
            display: inline-flex; border-color: var(--ll-primary);
            color: var(--ll-primary); background: var(--ll-primary-061);
        }

        /* \u2500\u2500 Layer navigator \u2500\u2500 */
        ${e} .ll-nav { margin-top: 14px; display: flex; align-items: center; gap: 14px; }
        ${e} .ll-nav.ll-hidden { display: none; }
        ${e} .ll-nav-range {
            font-family: var(--ll-font-mono); font-size: 11.5px; color: var(--ll-text-2);
            white-space: nowrap; font-variant-numeric: tabular-nums; min-width: 110px;
        }
        ${e} .ll-nav-range .ll-nav-range-key {
            color: var(--ll-text-muted); margin-right: 6px;
            letter-spacing: 0.08em; text-transform: uppercase;
            font-family: var(--ll-font-sans); font-size: 10px;
        }
        ${e} .ll-nav-range .ll-dim { color: var(--ll-text-faint); }
        ${e} .ll-nav-mid { flex: 1; position: relative; min-width: 0; }
        ${e} .ll-skyline {
            position: relative; height: 28px; background: var(--ll-surface-3);
            border: 1px solid var(--ll-line-2); border-radius: 4px;
            cursor: grab; user-select: none; touch-action: none; overflow: hidden;
        }
        ${e} .ll-skyline.ll-grabbing { cursor: grabbing; }
        ${e} .ll-skyline-bars {
            position: absolute; inset: 0; display: flex; align-items: flex-end;
            pointer-events: none;
        }
        ${e} .ll-skyline-bar { flex: 1; min-width: 1px; }
        ${e} .ll-skyline-secs { position: absolute; inset: 0; pointer-events: none; }
        ${e} .ll-skyline-secs i { position: absolute; top: 0; bottom: 0; background: var(--ll-line-2); opacity: 0.55; }
        ${e} .ll-skyline-win {
            position: absolute; top: -1px; bottom: -1px;
            background: var(--ll-primary-007); border: 1.5px solid var(--ll-primary);
            border-radius: 4px; box-shadow: 0 0 0 3px var(--ll-primary-007);
            pointer-events: none;
        }
        ${e} .ll-skyline-handle {
            position: absolute; top: 4px; bottom: 4px; width: 2px;
            background: var(--ll-primary); border-radius: 2px;
        }
        ${e} .ll-nav-ticks {
            position: relative; height: 12px; margin-top: 2px;
            font-family: var(--ll-font-mono); font-size: 9.5px;
            color: var(--ll-text-faint); font-variant-numeric: tabular-nums;
        }
        ${e} .ll-nav-tick { position: absolute; white-space: nowrap; }
        ${e} .ll-nav-controls { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        ${e} .ll-nav-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 26px; height: 26px; padding: 0;
            border: 1px solid var(--ll-line-2); background: var(--ll-surface);
            color: var(--ll-text-2); border-radius: 4px; cursor: pointer;
        }
        ${e} .ll-nav-btn:hover:not(:disabled) { background: var(--ll-surface-3); color: var(--ll-text); }
        ${e} .ll-nav-btn:disabled { opacity: 0.35; cursor: default; }
        ${e} .ll-nav-sep { width: 1px; height: 16px; background: var(--ll-line-2); margin: 0 4px; }
        /* A narrow widget: the label and the controls share a row, and the
           strip, which they would squeeze to a sliver, takes the next one. */
        ${e} .ll-nav.ll-nav-stacked { flex-wrap: wrap; row-gap: 8px; }
        ${e} .ll-nav-stacked .ll-nav-range { min-width: 0; }
        ${e} .ll-nav-stacked .ll-nav-controls { margin-left: auto; }
        ${e} .ll-nav-stacked .ll-nav-mid { order: 3; flex-basis: 100%; }

        /* \u2500\u2500 Line plot (kept on cell click) \u2500\u2500 */
        ${e} .ll-lineplot-wrap {
            margin-top: 14px; padding-top: 14px;
            border-top: 1px solid var(--ll-line-faint);
        }
        ${e} .ll-lineplot-wrap.ll-hidden { display: none; }
        ${e} .ll-lineplot-head {
            display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;
        }
        ${e} .ll-lineplot-title {
            font-size: 11px; color: var(--ll-text-muted);
            letter-spacing: 0.06em; text-transform: uppercase;
        }
        ${e} .ll-lineplot-token { font-family: var(--ll-font-mono); font-size: 12px; color: var(--ll-text); }
        /* Definite-height box so LinePlotCore's height:100% resolves and the
           plot can't grow unbounded (it sets height:100% on its mount). */
        /* Height is set inline by applyLinePlotHeight() so the plot's aspect
           ratio stays proportional to the widget's; 200px is just a fallback
           before the first sizing pass. */
        ${e} .ll-lineplot-box { height: 200px; overflow: hidden; }
        ${e} .ll-lineplot { width: 100%; height: 100%; }

        /* \u2500\u2500 Tooltip \u2500\u2500
           Sized in em so its root font-size (set inline, proportional to the
           hovered cell's width and capped) scales the whole box uniformly. */
        ${e} .ll-tooltip {
            position: absolute; font-size: 11px;
            width: max-content; max-width: 11.5em; padding: 0.5em 0.62em;
            background: var(--ll-surface); border: 1px solid var(--ll-line-2);
            border-radius: 0.42em;
            box-shadow: 0 4px 14px -4px rgba(0,0,0,0.12), 0 2px 5px -2px rgba(0,0,0,0.08);
            pointer-events: none; z-index: 50; font-family: var(--ll-font-sans);
            display: none;
        }
        ${e} .ll-tooltip.ll-visible { display: block; }
        ${e} .ll-tt-head { display: flex; align-items: center; gap: 0.45em; }
        ${e} .ll-tt-swatch { width: 0.85em; height: 0.85em; border-radius: 0.15em; border: 1px solid var(--ll-line-2); flex-shrink: 0; }
        ${e} .ll-tt-token {
            font-family: var(--ll-font-mono); font-size: 0.97em; font-weight: 500;
            color: var(--ll-text); max-width: 8.5em;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        ${e} .ll-tt-grid {
            margin-top: 0.36em; display: grid; grid-template-columns: auto auto; justify-content: space-between;
            gap: 0.1em 0.7em; font-size: 0.85em; color: var(--ll-text-muted);
        }
        ${e} .ll-tt-grid .ll-tt-val {
            font-family: var(--ll-font-mono); color: var(--ll-text); text-align: right;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* \u2500\u2500 Top-k popup (portaled to <body>, so it carries its own token
              block + ID-scoped selectors; .ll-dark mirrored from the root). \u2500\u2500 */
        #${o}_popup {
            --p-surface: hsl(0 0% 100%);
            --p-border: hsl(0 0% 86%);
            --p-line: hsl(0 0% 92%);
            --p-text: hsl(0 0% 12%);
            --p-text-2: hsl(0 0% 38%);
            --p-muted: hsl(0 0% 50%);
            --p-hover: hsl(0 0% 96%);
            --p-code: hsl(0 0% 95%);
            --p-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            --p-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            box-sizing: border-box;
            display: none; position: fixed; z-index: 100;
            flex-direction: column; min-height: 0;
            min-width: 0; max-width: 280px;
            background: var(--p-surface); border: 1px solid var(--p-border);
            border-radius: 6px;
            box-shadow: 0 6px 20px -4px rgba(0,0,0,0.18), 0 2px 6px -2px rgba(0,0,0,0.10);
            padding: 12px; font-family: var(--p-sans); color: var(--p-text);
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
        }
        #${o}_popup.ll-visible { display: flex; }
        #${o}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${o}_popup .ll-lead-space { color: #3b82f6; }
        #${o}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${o}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${o}_popup .ll-popup-header {
            flex: 0 0 auto;
            font-weight: 600; font-size: 13px; padding-right: 16px;
            margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--p-line);
        }
        #${o}_popup .ll-popup-sub {
            font-weight: 400; font-size: 11.5px; color: var(--p-text-2); margin-top: 3px;
        }
        #${o}_popup .ll-popup-sub code {
            font-family: var(--p-mono); background: var(--p-code);
            padding: 1px 5px; border-radius: 3px;
        }
        #${o}_popup .ll-popup-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
        #${o}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${o}_popup .ll-topk:hover { background: var(--p-hover); }
        #${o}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            -webkit-user-select: text; user-select: text;
        }
        #${o}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function Kt(o){let e=document.createElement("style");return e.textContent=ao(o),document.head.appendChild(e),e}function vt(o,e,...t){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let l of t)l&&n(l)}var Qe=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],wt=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var Z=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];var se=class se{static compact(e){return e>0&&e<se.COMPACT_BELOW}static margin(e,t,n,l){let s=Math.max(0,t-1)*se.TITLE_LINE;return e?{top:(t>0?32:14)+s+n,right:12,bottom:46,left:Math.max(40,Math.ceil(l)+se.offsets(!0).yLabel+18)}:{top:(t>0?48:24)+s+n,right:24,bottom:56,left:72}}static offsets(e){return e?{title:20,yTitle:2,yLabel:8,xLabel:8,xTitle:14}:{title:28,yTitle:14,yLabel:16,xLabel:12,xTitle:16}}static markerRadius(e){return e<se.MARKERS_OFF_BELOW?0:e<se.MARKERS_SMALL_BELOW?2.5:3.5}static xTicks(e,t,n){if(e<=0)return[];let l=e-1,s=n+se.TICK_GAP,p=Math.max(1,Math.ceil(e/8)),a=t>0?p*Math.max(1,Math.ceil(s/(p*t))):p,d=[];for(let r=0;r<l;r+=a)(l-r)*t>=s&&d.push(r);return d.push(l),d}static wrap(e,t,n,l){let s=e.split(/\s+/).filter(Boolean),p=[],a=0;for(;a<s.length&&p.length<n;){let d=s[a++];if(p.length===n-1)d=s.slice(a-1).join(" "),a=s.length;else for(;a<s.length&&l(`${d} ${s[a]}`)<=t;)d+=` ${s[a++]}`;p.push(se.clip(d,t,l)??d)}return p}static clip(e,t,n,l=3){if(n(e)<=t)return e;for(let s=e.length-1;s>=l;s--){let p=`${e.slice(0,s).trimEnd()}\u2026`;if(n(p)<=t)return p}return null}};se.COMPACT_BELOW=520,se.TITLE_MAX_LINES=2,se.TITLE_LINE=18,se.TICK_GAP=8,se.MARKERS_SMALL_BELOW=9,se.MARKERS_OFF_BELOW=6;var ne=se;var xe=class xe{static labelled(e){return e.some(t=>!!t.label)}static caption(e,t,n){let l=e.toUpperCase();if(n(l)<=t)return l;let s=/^(\S)\D*?(\d+)$/.exec(l);if(!s)return ne.clip(l,t,n);let p=s[1]+s[2];return n(p)<=t?p:null}static captions(e,t,n,l){let s=e.map(f=>f.label?.toUpperCase()??""),p=s.map(f=>f?l(f):0),a=f=>(e[f].x0+e[f].x1)/2,d=f=>e[f].x1-e[f].x0-2*xe.LABEL_INSET,r=e.map((f,x)=>!!s[x]&&p[x]<=d(x)),g=(f,x)=>r[f]?a(f)+(x==="x1"?.5:-.5)*p[f]:s[f]?e[f][x]:e[f][x==="x1"?"x0":"x1"];return e.flatMap((f,x)=>{if(!s[x])return[];if(r[x])return[{text:s[x],x:a(x)}];let c=x===0?t:g(x-1,"x1")+xe.LABEL_GAP,k=x===e.length-1?n:g(x+1,"x0")-xe.LABEL_GAP;if(p[x]<=k-c){let S=p[x]/2;return[{text:s[x],x:Math.min(k-S,Math.max(c+S,a(x)))}]}let $=xe.caption(f.label,d(x),l);return $?[{text:$,x:a(x)}]:[]})}static labelAt(e,t){return e?.find(n=>n.start<=t&&t<=n.end)?.label}static layout(e,t,n,l,s){if(n<=t)return[];let p=l+s,a=d=>Math.min(p,Math.max(l,l+(d-t)/(n-t)*s));return e.flatMap((d,r)=>{let g=a(d.start-.5),f=a(d.end+.5);if(f<=g)return[];let x=(d.dividers??[]).filter(c=>c>d.start&&c<=d.end).map(c=>a(c-.5)).filter(c=>c>g&&c<f);return[{x0:g,x1:f,label:d.label,tinted:r%2===1,dividers:x}]})}static draw(e,t,n,l,s,p){if(t.length===0)return;e.save(),e.fillStyle=s?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)";for(let d of t)d.tinted&&e.fillRect(d.x0,n,d.x1-d.x0,l);e.strokeStyle=s?"rgba(255,255,255,0.14)":"rgba(0,0,0,0.12)",e.lineWidth=1,e.setLineDash([2,3]);for(let d of t.flatMap(r=>r.dividers))e.beginPath(),e.moveTo(Math.round(d)+.5,n),e.lineTo(Math.round(d)+.5,n+l),e.stroke();e.setLineDash([]),e.fillStyle=s?"#71717a":"#a1a1aa",e.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",e.textAlign="center",e.textBaseline="bottom";let a=xe.captions(t,xe.LABEL_INSET,p-xe.LABEL_INSET,d=>e.measureText(d).width);for(let d of a)e.fillText(d.text,d.x,n-5);e.restore()}};xe.LABEL_ROOM=16,xe.LABEL_GAP=6,xe.LABEL_INSET=2;var Ee=xe;function Be(o){return o.richLines&&o.richLines.length>0?o.richLines.map((t,n)=>({values:t.values,label:t.label??`Line ${n+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(o.lines??[]).map((t,n)=>({values:t,label:o.labels?.[n]??`Line ${n+1}`}))}function ze(o){if(!o)return"";let e=[],t=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let n="";for(;t<o.length;t++){let l=o[t];l===`
`?(n&&(e.push(nt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(nt(n)),e.join("")}function nt(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function co(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(o<=t)return t;return 1}function Qt(o,e,t){let n=Be(o),l=n.length>0?n[0].values.length:t?.values.length??o.xLabels?.length??0;if(l===0)return null;let s=e.mode||"probability",p=e.minValue,a=e.maxValue;if(p===void 0||a===void 0||e.autoScale){let d=[];for(let f of n)if(!f.isOverlay)for(let x of f.values)x!==null&&d.push(x);if(t)for(let f of t.values)f!==null&&d.push(f);if(d.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let r=1/0,g=-1/0;for(let f of d)f<r&&(r=f),f>g&&(g=f);if(e.centerYAxisAtZero){let x=Math.max(Math.abs(r),Math.abs(g))*1.1;p=-x,a=x}else if(e.logScale){if(p===void 0&&(p=Math.max(1,Math.floor(r))),a===void 0||e.autoScale){let f=Math.log(Math.max(1,r)),x=Math.log(Math.max(1,g)),c=x+.15*Math.max(1,x-f);a=Math.ceil(Math.exp(c))}}else p===void 0&&(p=s==="probability"?0:s==="rank"?Math.max(1,Math.floor(r)):Math.floor(r*.9)),(a===void 0||e.autoScale)&&(s==="rank"?a=Math.ceil(g*1.1):s==="probability"?a=e.autoScale?co(Math.max(g,.001)):Math.min(g*1.1,1):a=g*1.1)}return{numLayers:l,minValue:p,maxValue:a,numLines:n.length}}function Zt(o,e,t,n,l,s,p,a,d=!1){let r=o.getContext("2d"),g=e.getBoundingClientRect(),f=n.pixelRatio??(window.devicePixelRatio||1);o.width=g.width*f,o.height=g.height*f,o.style.width=`${g.width}px`,o.style.height=`${g.height}px`,r.scale(f,f);let x=g.width,c=g.height,k=n.darkMode??!1,$=n.title,S=n.mode||"probability",R=n.invertYAxis??!1,L=n.centerYAxisAtZero??!1,P=n.logScale??!1,w=n.xAxisLabel||"Layer",A=n.yAxisLabel||"Probability",T=n.xRangeStart??0;T>=l.numLayers-1&&(console.warn(`xRangeStart (${T}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),T=0);let D=n.showDataPoints??!0,O=t.sections??[],G={title:"500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",tick:"400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",axis:"500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"},W=ne.offsets(d),oe=b=>r.measureText(b).width,B=P?Math.log(Math.max(1,l.minValue)):0,me=P?Math.log(Math.max(1,l.maxValue)):0,ie=[],pe=l.maxValue-l.minValue,le=5;if(P){let b=new Set;for(let Y=0;Y<le;Y++){let K=B+Y/(le-1)*(me-B),Q=Math.round(Math.exp(K));b.has(Q)||(b.add(Q),ie.push(Q))}let H=Math.round(Math.exp(B)),U=Math.round(Math.exp(me));b.has(H)||ie.unshift(H),b.has(U)||ie.push(U)}else if(S==="rank")for(let b=0;b<le;b++)ie.push(Math.round(l.minValue+b/(le-1)*pe));else for(let b=0;b<le;b++)ie.push(l.minValue+b/(le-1)*pe);let De=ie.map(b=>S==="probability"?b.toFixed(2):S==="prob_diff"?b>=0?`+${b.toFixed(2)}`:b.toFixed(2):Math.round(b).toString());r.font=G.tick;let fe=Math.max(0,...De.map(oe)),he=Ee.labelled(O)?Ee.LABEL_ROOM:0,ke=ne.margin(d,0,he,fe);r.font=G.title;let ue=$?ne.wrap($,x-ke.left-8,ne.TITLE_MAX_LINES,oe):[],m=ne.margin(d,ue.length,he,fe),C=x-m.left-m.right,M=c-m.top-m.bottom,_={margin:m,chartWidth:C,chartHeight:M,width:x,height:c},z={background:k?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:k?"#52525b":"#a1a1aa",grid:k?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:k?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:k?"#e4e4e7":"#27272a"};n.transparentBackground?r.clearRect(0,0,x,c):(r.fillStyle=z.background,r.fillRect(0,0,x,c)),r.fillStyle=z.titleText,r.font=G.title,r.textAlign="left",ue.forEach((b,H)=>{r.fillText(b,m.left,W.title+H*ne.TITLE_LINE)});let V=l.numLayers-1-T,we=b=>V<=0?m.left+C/2:m.left+(b-T)/V*C,J=b=>{let H;if(P){let U=Math.log(Math.max(1,b));H=me-B>0?(U-B)/(me-B):.5}else H=(b-l.minValue)/(l.maxValue-l.minValue);return R?m.top+H*M:m.top+M-H*M};if(Ee.draw(r,Ee.layout(O,T,l.numLayers-1,m.left,C),m.top,M,k,x),r.setLineDash([4,4]),r.strokeStyle=z.grid,r.lineWidth=1,ie.forEach(b=>{let H=J(b);r.beginPath(),r.moveTo(m.left,H),r.lineTo(m.left+C,H),r.stroke()}),r.setLineDash([]),L){let b=J(0);r.beginPath(),r.strokeStyle=k?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",r.lineWidth=1.5,r.moveTo(m.left,b),r.lineTo(m.left+C,b),r.stroke(),r.lineWidth=1}r.fillStyle=z.text,r.font=G.tick,r.textAlign="right",r.textBaseline="middle",ie.forEach((b,H)=>{r.fillText(De[H],m.left-W.yLabel,J(b))}),r.textAlign="center",r.textBaseline="top";let ee=b=>String(t.xLabels?.[b]??b),$e=V>0?C/V:1/0,F=Math.max(0,...Array.from({length:l.numLayers},(b,H)=>oe(ee(H))));for(let b of ne.xTicks(l.numLayers,$e,F)){let H=we(b);H<m.left-5||H>m.left+C+5||r.fillText(ee(b),H,m.top+M+W.xLabel)}r.strokeStyle=k?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",r.lineWidth=1.5,r.beginPath(),r.moveTo(m.left,m.top),r.lineTo(m.left,m.top+M),r.lineTo(m.left+C,m.top+M),r.stroke(),r.fillStyle=z.textMuted,r.font=G.axis,r.textAlign="center",r.textBaseline="top",r.fillText(w.toUpperCase(),m.left+C/2,c-W.xTitle),r.save(),r.translate(W.yTitle,m.top+M/2),r.rotate(-Math.PI/2),r.textAlign="center",r.textBaseline="top",r.fillText(A.toUpperCase(),0,0),r.restore();let X=Be(t);function Me(b,H,U,Y,K){r.beginPath(),r.strokeStyle=H,r.lineWidth=U,K!==void 0&&(r.globalAlpha=K),Y?r.setLineDash(Y.split(",").map(Number)):r.setLineDash([]);let Q=!1;for(let Ce=0;Ce<b.length;Ce++){let Se=b[Ce];if(Se===null){Q=!1;continue}let Ie=we(Ce),Ae=J(Se);Q?r.lineTo(Ie,Ae):(r.moveTo(Ie,Ae),Q=!0)}r.stroke(),r.setLineDash([]),K!==void 0&&(r.globalAlpha=1)}let Fe=ne.markerRadius($e),ae=k?"#3f3f46":"#d4d4d8";if(r.lineCap="round",r.lineJoin="round",X.forEach((b,H)=>{!s.has(H)||b.isOverlay||Me(b.values,ae,2,void 0,.35)}),X.forEach((b,H)=>{if(s.has(H)||b.isOverlay)return;let U=b.color??Z[H%Z.length];Me(b.values,U,4,b.dashPattern,.15),Me(b.values,U,2,b.dashPattern),D&&b.values.forEach((Y,K)=>{if(Y===null)return;let Q=p?.lineIdx===H&&p?.layerIdx===K,Ce=b.values[K-1]==null&&b.values[K+1]==null,Se=Q?5:Fe||(Ce?2:0);if(Se===0)return;let Ie=we(K),Ae=J(Y);r.beginPath(),r.strokeStyle=U,r.lineWidth=Q?2:1.5,r.arc(Ie,Ae,Se,0,Math.PI*2),r.stroke(),r.beginPath(),r.fillStyle=k?"#18181b":"#ffffff",r.arc(Ie,Ae,Se-(Q?1.5:1),0,Math.PI*2),r.fill()})}),X.forEach((b,H)=>{if(!b.isOverlay||s.has(H))return;let U=b.color??"#999";Me(b.values,U,1.5,b.dashPattern??"4,2",.7)}),a){let b=a.color??"#999";Me(a.values,b,1.5,a.dashPattern??"4,2",.7)}return _}function Jt(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function en(o,e,t,n,l,s,p,a,d){let{margin:r,chartWidth:g,chartHeight:f}=l,x=n.xRangeStart??0,c=p-1-x,k=n.logScale?Math.log(Math.max(1,a)):0,$=n.logScale?Math.log(Math.max(1,d)):0;if(o<r.left||o>r.left+g||e<r.top||e>r.top+f)return null;let S=Be(t),R=null,L=1/0,P=20;for(let w=0;w<S.length;w++){if(s.has(w))continue;let A=S[w];if(!A.isOverlay)for(let T=0;T<A.values.length;T++){let D=A.values[T];if(D===null)continue;let O=c<=0?r.left+g/2:r.left+(T-x)/c*g,G;if(n.logScale){let B=Math.log(Math.max(1,D));G=$-k>0?(B-k)/($-k):.5}else G=(D-a)/(d-a);let W=n.invertYAxis?r.top+G*f:r.top+f-G*f,oe=Math.sqrt((o-O)**2+(e-W)**2);oe<L&&oe<P&&(L=oe,R={visible:!0,x:O,y:W,lineIdx:w,layerIdx:T,value:D,label:A.label,color:A.color??Z[w%Z.length]})}}return R}function yt(o,e,t,n,l,s,p,a){if(!e){o.style.opacity="0";return}let d=n?"#27272a":"#fff",r=n?"#3f3f46":"#e4e4e7",g=n?"#fafafa":"#18181b",f=n?"#a1a1aa":"#71717a",c=e.x>t/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${c},-50%);`;let k=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx),$=Ee.labelAt(a,e.layerIdx),S=$?`<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px;">
                    <span style="color:${f}">Section</span>
                    <span style="font-weight:500;color:${g}">${nt($)}</span>
                </div>`:"";o.innerHTML=`
        <div style="background:${d};border:1px solid ${r};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${g};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${ze(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                ${S}
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${f}">${s??"Layer"}</span>
                    <span style="font-weight:500;color:${g}">${k}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${f}">Value</span>
                    <span style="font-weight:500;color:${g}">${p==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var po='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',ho='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',uo='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function tn(o,e=!1){let t=document.createElement("div");return nn(t,o,e),t}function nn(o,e,t){if(t){o.style.cssText="flex-shrink:0;order:-1;display:flex;flex-direction:row;flex-wrap:wrap;gap:0 2px;padding:0 2px;";return}let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",l=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${l};align-self:flex-start;`}function on(o,e,t,n,l,s,p=!1){nn(o,n,p),o.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",d=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",r=n?"#a1a1aa":"#71717a",g=n?"#3f3f46":"#d4d4d8",f="rgba(161,161,170,0.3)",x=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",c=s?Be(s):[];e.forEach((k,$)=>{let S=c[$];if(S?.isOverlay)return;let R=S?.color??Z[$%Z.length],L=t.has($),P=S?.removable??!1,w=document.createElement(l?"button":"div");w.style.cssText=`display:flex;align-items:center;gap:${p?6:8}px;padding:${p?"3px 6px":"4px 8px"};border-radius:4px;border:none;background:transparent;cursor:${l?"pointer":"default"};transition:all 0.15s;opacity:${L?"0.5":"1"};`,l&&(w.addEventListener("mouseenter",()=>{w.style.background=x}),w.addEventListener("mouseleave",()=>{w.style.background="transparent"}),w.addEventListener("click",()=>l.onToggle($)));let A=document.createElement("span");A.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${L?f:R};background:${L?g:"transparent"};`,w.appendChild(A);let T=document.createElement("span");if(T.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:${p?120:72}px;transition:color 0.15s;color:${L?d:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,T.title=k,T.innerHTML=ze(k),w.appendChild(T),!l){o.appendChild(w);return}if(P&&l.onRemove){let D=document.createElement("span");D.style.cssText=`margin-left:auto;cursor:pointer;color:${r};opacity:${p?.6:0};display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,D.innerHTML=uo,D.title="Remove",D.addEventListener("click",O=>{O.stopPropagation(),l.onRemove($)}),w.appendChild(D),w.addEventListener("mouseenter",()=>{D.style.opacity="0.6"}),w.addEventListener("mouseleave",()=>{D.style.opacity=p?"0.6":"0"})}else if(!p||L){let D=document.createElement("span");D.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${r};opacity:${L?"0.6":"0"};display:flex;align-items:center;`,D.innerHTML=L?ho:po,w.appendChild(D),L||(w.addEventListener("mouseenter",()=>{D.style.opacity="0.4"}),w.addEventListener("mouseleave",()=>{D.style.opacity="0"}))}o.appendChild(w)})}var Re=class{constructor(e,t,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.compact=!1;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,l=e.clientY-t.top;this.tooltip=en(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),yt(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode,this.data.sections),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,yt(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...n},this.compact=ne.compact(e.clientWidth),e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),this.arrange(),e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;",e.appendChild(this.chartContainer);let l=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${l?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=Jt(this.chartContainer),this.legendEl=tn(this.options.darkMode??!1,this.compact),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),l&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(s=>{if(!this.destroyed)for(let p of s){if(p.target===this.container){this.fit(p.contentRect.width);continue}let a=Math.round(p.contentRect.width),d=Math.round(p.contentRect.height);a===this.lastWidth&&d===this.lastHeight||(this.lastWidth=a,this.lastHeight=d,this.draw())}}),this.resizeObserver.observe(this.chartContainer),this.resizeObserver.observe(this.container),this.draw(),this.updateLegendUI()}fit(e){let t=ne.compact(e);t!==this.compact&&(this.compact=t,this.arrange(),this.draw(),this.updateLegendUI())}arrange(){this.container.style.flexDirection=this.compact?"column":"row",this.container.style.gap=this.compact?"4px":"12px"}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=Qt(this.data,this.options,this.overlay),this.config&&(this.geometry=Zt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay,this.compact))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let t=this.options.interactive===!1?null:{onToggle:n=>this.toggleLine(n),onRemove:this.options.onLineRemoved?n=>{this.removeLine(n,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(n)}:void 0};on(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,t,this.data,this.compact)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,n)=>({values:t,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function ve(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function ot(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+ve(o.slice(1)):ve(o)}function mo(o){let e=`#${o}`;return`
        ${e} {
            /* Local tokens (light) */
            --hmx-surface: hsl(0 0% 100%);
            --hmx-surface-2: hsl(0 0% 98%);
            --hmx-card-border: hsl(0 0% 82%);
            --hmx-line-faint: hsl(0 0% 93%);
            --hmx-text: hsl(0 0% 9%);
            --hmx-text-2: hsl(0 0% 20%);
            --hmx-text-muted: hsl(0 0% 40%);
            --hmx-shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
            --hmx-font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
            --hmx-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

            box-sizing: border-box;
            display: inline-flex; flex-direction: column;
            max-width: 100%; min-width: 0;
            font-family: var(--hmx-font-sans);
            color: var(--hmx-text);
            -webkit-font-smoothing: antialiased;
            background: var(--hmx-surface);
            border: 1px solid var(--hmx-card-border);
            border-radius: 0.75rem;
            box-shadow: var(--hmx-shadow-xs);
            padding: 16px;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
            white-space: normal; word-break: normal;
        }
        ${e} *, ${e} *::before, ${e} *::after { box-sizing: border-box; }
        ${e}.hmx-dark {
            --hmx-surface: hsl(0 0% 16%);
            --hmx-surface-2: hsl(0 0% 13%);
            --hmx-card-border: hsl(0 0% 26%);
            --hmx-line-faint: hsl(0 0% 24%);
            --hmx-text: hsl(0 0% 90%);
            --hmx-text-2: hsl(0 0% 80%);
            --hmx-text-muted: hsl(0 0% 64%);
            color-scheme: dark;
        }

        /* fill: fill the host's bounded box (flex column) instead of
           shrink-wrapping content; the scroll region absorbs the overflow. */
        ${e}.hmx-fill {
            display: flex; width: 100%; height: 100%;
            min-height: 0; max-width: none;
        }
        ${e}.hmx-fill .hmx-frame { flex: 1 1 auto; min-height: 0; }

        /* bare: drop the card chrome so the grid can be embedded as a plain
           region inside another widget (no double border/padding/shadow). */
        ${e}.hmx-bare {
            border: 0; box-shadow: none; padding: 0;
            border-radius: 0; background: transparent;
        }

        /* Heatmap region: fixed column header above a scrollable rows area.
           No frame outline \u2014 the rounding lives on the corner data cells
           (set inline by the renderer), so only the cells area is rounded,
           not the axis. */
        ${e} .hmx-frame {
            display: flex; flex-direction: column;
            min-width: 0; max-width: 100%;
        }
        ${e} .hmx-hdr-fixed { flex: 0 0 auto; overflow: hidden; }
        ${e} .hmx-scroll {
            flex: 1 1 auto; min-height: 0;
            overflow: auto; min-width: 0; max-width: 100%;
        }

        ${e} .hmx-hdr-row { align-items: end; padding-bottom: 4px; }
        ${e} .hmx-corner {
            font-size: 10px; color: var(--hmx-text-muted);
            text-align: right; padding-right: 8px;
            letter-spacing: 0.04em; text-transform: uppercase;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            display: flex; align-items: flex-end; justify-content: flex-end;
        }
        ${e} .hmx-col {
            text-align: center; font-family: var(--hmx-font-mono); font-size: 11px;
            color: var(--hmx-text-muted); font-variant-numeric: tabular-nums;
            overflow: hidden; white-space: nowrap;
        }
        /* Column sections: a label on a rule over each run of columns, the
           rule broken where a part of the section starts, and a hairline
           before a section's first column in every row. */
        ${e} .hmx-sec-row { height: 18px; align-items: end; padding-bottom: 2px; }
        ${e} .hmx-sec {
            min-width: 0; padding: 0 3px;
            display: flex; flex-direction: column; gap: 3px;
        }
        ${e} .hmx-sec-label {
            font-size: 9px; font-weight: 600; line-height: 11px;
            letter-spacing: 0.1em; text-transform: uppercase; text-align: center;
            color: var(--hmx-text-muted);
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }
        ${e} .hmx-sec-rule { display: flex; gap: 3px; height: 2px; }
        ${e} .hmx-sec-rule i { min-width: 0; border-radius: 1px; background: var(--hmx-card-border); }
        ${e} .hmx-cell.hmx-sec-start::before {
            content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
            background: rgba(255,255,255,0.92); pointer-events: none;
        }
        ${e}.hmx-dark .hmx-cell.hmx-sec-start::before { background: rgba(0,0,0,0.6); }
        ${e} .hmx-grid-inner { position: relative; }
        /* Region trackers (rail + rotated label) \u2014 sit in the left gutter and
           scroll with the rows (children of grid-inner). Position/height are
           set inline from the measured layout. */
        ${e} .hmx-region-rail {
            position: absolute; left: 6px; width: 3px; border-radius: 3px;
            background: var(--hmx-region, var(--hmx-text-faint)); pointer-events: none;
        }
        ${e} .hmx-region-label {
            position: absolute; left: 12px; width: 13px;
            display: flex; align-items: center; justify-content: center;
            writing-mode: vertical-rl; transform: rotate(180deg);
            font-family: var(--hmx-font-sans); font-size: 9px; font-weight: 600;
            letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
            color: var(--hmx-region, var(--hmx-text-faint)); pointer-events: none;
            overflow: hidden;
        }
        ${e} .hmx-row { position: relative; }
        ${e} .hmx-row-grid { cursor: default; position: relative; }
        ${e} .hmx-rowlabel {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 6px; padding: 0 8px; font-size: 12px; color: var(--hmx-text-2);
            overflow: hidden;
            -webkit-user-select: text; user-select: text;
        }
        ${e} .hmx-cell {
            display: flex; align-items: center; justify-content: center;
            min-width: 0; font-size: 11px; font-family: var(--hmx-font-mono);
            position: relative; color: hsl(0 0% 18%);
        }
        ${e} .hmx-cell-text {
            display: block; min-width: 0; max-width: 100%;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            -webkit-user-select: text; user-select: text;
        }
        ${e} .hmx-cell.hmx-hover { outline: 2px solid var(--hmx-text); outline-offset: -2px; z-index: 3; }
        ${e} .hmx-lead-space { color: #3b82f6; }

        /* \u2500\u2500 Row highlights (declarative rowHighlights) \u2500\u2500
           Just a faint accent band on each highlighted row, plus an optional
           caption chip on the block's first row \u2014 no rail, no block-edge
           dividers. --hmx-hl carries the per-highlight accent (falls back to
           amber). Agnostic to meaning. (The hmx-hl-top/bottom run-edge flags
           are still emitted so the label can ride the block's first row.) */
        ${e} .hmx-row-hl { --hmx-hl: #f59e0b; }
        ${e}.hmx-dark .hmx-row-hl { --hmx-hl: #fbbf24; }
        ${e} .hmx-row-hl .hmx-row-grid {
            background: color-mix(in srgb, var(--hmx-hl) 12%, transparent);
        }
        ${e} .hmx-row-hl[data-hl-label]::after {
            content: attr(data-hl-label);
            position: absolute; left: 6px; top: 0; transform: translateY(-50%);
            font-family: var(--hmx-font-sans); font-size: 9px; font-weight: 600;
            letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;
            color: #fff; background: var(--hmx-hl);
            padding: 1px 5px; border-radius: 999px; z-index: 4; pointer-events: none;
        }

        /* \u2500\u2500 Collapsed-row band + expanded-section handle \u2500\u2500
           A thin clickable band that stands in for a hidden row range, and a
           smaller handle above an expanded section to re-collapse it. Both keep
           original row indices intact \u2014 they're purely a rendering stand-in. */
        ${e} .hmx-collapsed {
            display: flex; align-items: center; position: relative; cursor: pointer;
            background: var(--hmx-surface-2); color: var(--hmx-text-muted);
            border-top: 1px solid var(--hmx-card-border);
            border-bottom: 1px solid var(--hmx-card-border);
            font-family: var(--hmx-font-sans); font-size: 9.5px; letter-spacing: 0.02em;
            -webkit-user-select: none; user-select: none;
        }
        ${e} .hmx-collapsed:hover { background: var(--hmx-surface); color: var(--hmx-text); }
        ${e} .hmx-collapsed-inner { padding: 0 12px; letter-spacing: 0.02em; }
        /* Accent rail when the collapsed rows include a highlight. */
        ${e} .hmx-collapsed-hl::before {
            content: ""; position: absolute; left: 0; top: 0; bottom: 0;
            width: 3px; background: var(--hmx-hl, #f59e0b);
        }
        /* Locked band: a static, faintly hatched seam \u2014 no hover, no pointer. */
        ${e} .hmx-collapsed-locked,
        ${e} .hmx-collapsed-locked:hover {
            cursor: default; color: var(--hmx-text-muted);
            background: repeating-linear-gradient(135deg,
                var(--hmx-surface-2) 0 5px, var(--hmx-surface) 5px 10px);
        }
        /* Match the collapsed band (.hmx-collapsed / COLLAPSED_BAND_H) exactly \u2014
           same 16px height, 9.5px sans, and sentence case (no uppercase). */
        ${e} .hmx-expanded-toggle {
            display: flex; align-items: center; height: 16px; cursor: pointer;
            padding: 0 12px; color: var(--hmx-text-muted);
            font-family: var(--hmx-font-sans); font-size: 9.5px;
            letter-spacing: 0.02em;
            -webkit-user-select: none; user-select: none;
        }
        ${e} .hmx-expanded-toggle:hover { color: var(--hmx-text); }
        /* \xD7 on the right removes the section entirely. */
        ${e} .hmx-toggle-x {
            margin-left: auto; padding: 0 4px; font-size: 14px; line-height: 1;
            color: var(--hmx-text-muted); cursor: pointer;
        }
        ${e} .hmx-toggle-x:hover { color: var(--hmx-text); }

        /* static: a picture of the grid \u2014 no hover outline, pointer cursors
           or band hover states. */
        ${e}.hmx-static .hmx-frame { pointer-events: none; }

        /* Scrollable row window: the viewport scrolls (also on a static table)
           and snaps to whole rows; a static table's content stays inert. */
        ${e}.hmx-window-scroll .hmx-scroll {
            overflow-y: auto; scroll-snap-type: y mandatory; pointer-events: auto;
            /* Reaching the first / last row doesn't scroll the page instead. */
            overscroll-behavior: contain;
        }
        /* Not scrollable right now: the pointer goes through to the page. */
        ${e}.hmx-window-scroll.hmx-window-inert .hmx-scroll { pointer-events: none; }
        ${e}.hmx-static.hmx-window-scroll .hmx-grid-inner { pointer-events: none; }
        ${e}.hmx-window-scroll .hmx-row,
        ${e}.hmx-window-scroll .hmx-collapsed { scroll-snap-align: start; }
    `}function ln(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=mo(o),document.head.appendChild(e),e}var fo=0,Ze=16,Lt=20,rn=7,je=class o{constructor(e,t,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.windowPlan=[];this.windowYs=[];this.windowHs=[];this.windowFrom=-1;this.lastWindowKey="";this.windowScrollTimer=null;this.onWindowScroll=()=>{this.windowPlan.length&&(this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.windowScrollTimer=setTimeout(()=>{if(this.windowScrollTimer=null,this.destroyed||!this.windowPlan.length)return;let e=this.scrollEl.scrollTop,t=this.windowYs.findIndex((s,p)=>s+this.windowHs[p]/2>e);t<0&&(t=this.windowYs.length-1);let{from:n,to:l}=o.windowItems(this.windowHs,t,this.options.rowWindow.height);Math.abs(this.scrollEl.scrollTop-this.windowYs[n])>1&&(this.scrollEl.scrollTop=this.windowYs[n]),this.windowFrom=n,this.reportWindow(this.windowPlan,n,l,"scroll")},150))};this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...n},this.uid="hmx_"+ ++fo+"_"+Date.now().toString(36),this.styleEl=ln(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`.trim(),this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.scrollEl.addEventListener("scroll",this.onWindowScroll),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let n=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-n)),size:n}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,n=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/t),s=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(s,l))}resolveVisibleColumns(){let e=this.options,{start:t,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let g=[];for(let f=0;f<n;f++)g.push(t+f);return g}let l=this.maxColsFit();if(n<=l){let g=[];for(let f=0;f<n;f++)g.push(t+f);return g}let s=!!e.alwaysShowLastColumn,p=Math.max(1,l-(s?1:0)),a=Math.ceil(n/p),d=[];for(let g=t;g<t+n;g+=a)d.push(g);let r=t+n-1;return s&&d[d.length-1]!==r&&d.push(r),d}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let n=t.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/e);return Math.max(t.minColumnWidth??1,l)}return t.cellWidth??48}resolveRowHeight(e,t=0){let n=this.options,l=n.cellHeight??28;if(n.rowSizing!=="fill"||e<=0)return l;let s=this.scrollEl.clientHeight-t;return e*l<s?Math.floor(s/e):l}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=this.isInteractive();this.root.classList.toggle("hmx-static",!n);let l=e.rowHeaderWidth??100,s=e.headerHeight??26,p=this.data.columns,a=this.resolveVisibleColumns(),d=a.length,r=this.resolveCellWidth(d),g=this.data.rows,f=e.maxRows!=null?Math.min(g.length,e.maxRows):g.length,x=o.planRows(f,e.collapsedSections),c=0,k=0;for(let m of x)m.kind==="row"?c++:m.kind==="band"?k+=Ze:n&&(k+=Lt);let $=this.resolveRowHeight(c,k),S=l+r*d,R=x.map(m=>m.kind==="row"?$:m.kind==="band"?Ze:n?Lt:0),L=null;if(e.rowWindow&&R.reduce((m,C)=>m+C,0)>e.rowWindow.height){let m=x.findIndex(C=>o.itemRows(C)[1]>=e.rowWindow.start);L=o.windowItems(R,m<0?x.length-1:m,e.rowWindow.height)}let P=!!L&&e.rowWindowMode==="scroll",w=L&&!P?x.slice(L.from,L.to):x,A=w.filter(m=>m.kind==="row"),T=L&&!P?A[0]?.row??-1:0,D=L&&!P?A[A.length-1]?.row??-1:f-1,O=`${l}px repeat(${d}, ${r}px)`,G=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",W=o.columnSpans(a,e.columnSections??[]),oe=new Set(W.map(m=>m.from).filter(m=>m>0)),B="";if(W.length>0){B+=`<div class="hmx-sec-row" style="display:grid;grid-template-columns:${O};width:${S}px;min-width:${S}px;">`;for(let m of W){let C=m.parts.map(M=>`<i style="flex:${M}"></i>`).join("");B+=`<div class="hmx-sec" style="grid-row:1;grid-column:${m.from+2} / span ${m.to-m.from+1};"><span class="hmx-sec-label">${ve(m.label??"")}</span><span class="hmx-sec-rule">${C}</span></div>`}B+="</div>"}B+=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${O};height:${s}px;width:${S}px;min-width:${S}px;">`,B+=`<div class="hmx-corner">${ve(e.cornerLabel??"")}</div>`;for(let m=0;m<d;m++)B+=`<div class="hmx-col">${ot(p[a[m]].label)}</div>`;B+="</div>",this.hdrEl.innerHTML=B;let me={};for(let m of e.rowHighlights??[]){let C=new Set(m.rows);for(let M of m.rows){let _=!C.has(M-1);me[M]={color:m.color,className:m.className,top:_,bottom:!C.has(M+1),label:_?m.label:void 0}}}this.lastRowH=$;let ie=m=>{let C=g[m].label,M=e.rowClassName?.(m),_=me[m],z=_?" hmx-row-hl"+(_.top?" hmx-hl-top":"")+(_.bottom?" hmx-hl-bottom":"")+(_.className?" "+_.className:""):"",V=_?(_.color?` style="--hmx-hl:${ve(_.color)}"`:"")+(_.label?` data-hl-label="${ve(_.label)}"`:""):"",we=e.renderRowLabel?e.renderRowLabel(m):`<span class="hmx-cell-text">${ot(C)}</span>`,J=`<div class="hmx-row${M?" "+M:""}${z}" data-rowwrap="${m}"${V}>`;J+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${O};height:${$}px;">`,J+=`<div class="hmx-rowlabel" data-row="${m}" title="${ve(C)}">${we}</div>`;for(let ee=0;ee<d;ee++){let $e=a[ee],F=this.data.getCellValue(m,$e),X=F.highlighted&&F.highlightColor?`box-shadow:inset 0 0 0 2px ${F.highlightColor};`:"",Me=F.bold?"font-weight:bold;":"",Fe=F.opacity!=null&&F.opacity<1?`opacity:${F.opacity};`:"",ae=m===T,b=m===D,H=ee===0,U=ee===d-1,Y="";ae&&H?Y="border-top-left-radius:8px;":ae&&U?Y="border-top-right-radius:8px;":b&&H?Y="border-bottom-left-radius:8px;":b&&U&&(Y="border-bottom-right-radius:8px;");let K=oe.has(ee)?" hmx-sec-start":"";J+=`<div class="hmx-cell${K}${F.className?" "+F.className:""}" data-row="${m}" data-col="${$e}" style="background:${F.color};color:${F.textColor};padding:0 6px;${Fe}${G}${X}${Me}${Y}"><span class="hmx-cell-text">${ot(F.text)}</span></div>`}return J+="</div></div>",J},pe=(e.rowRegions??[]).filter(m=>m.start<=m.end),le=pe.map(()=>({top:-1,bottom:-1})),De=(m,C,M,_)=>{for(let z=0;z<pe.length;z++)C>=pe[z].start&&m<=pe[z].end&&(le[z].top<0&&(le[z].top=M),le[z].bottom=_)},fe=`<div class="hmx-grid-inner" style="width:${S}px;min-width:${S}px;">`,he=0,ke=[];for(let m of w){if(ke.push(he),m.kind==="band"){let C=m.end-m.start+1,M,_=!1;for(let ee=m.start;ee<=m.end;ee++)if(me[ee]){_=!0,M=me[ee].color;break}let z=C===1?"":"s",V=`${C} row${z} ${ve(m.label??"hidden")}`,we="hmx-collapsed"+(m.locked?" hmx-collapsed-locked":"")+(_?" hmx-collapsed-hl":""),J=n&&!m.locked;fe+=`<div class="${we}"${J?` data-cs="${m.index}"`:""} data-count="${m.shown}" style="width:${S}px;min-width:${S}px;height:${Ze}px;${M?`--hmx-hl:${ve(M)};`:""}" title="${J?`Click to show ${C} hidden row${z}`:V}"><span class="hmx-collapsed-inner">\u2026 ${V}</span></div>`,De(m.start,m.end,he,he+Ze),he+=Ze;continue}if(m.kind==="handle"){if(!n)continue;let C=m.end-m.start+1;fe+=`<div class="hmx-expanded-toggle" data-cs="${m.index}" data-count="${m.shown}" style="width:${S}px;min-width:${S}px;" title="Collapse these ${C} rows"><span>\u2303 collapse ${C} row${C===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,he+=Lt;continue}fe+=ie(m.row),De(m.row,m.row,he,he+$),he+=$}for(let m=0;m<pe.length;m++){let C=le[m];if(C.top<0||C.bottom<=C.top)continue;let M=pe[m],_=M.color?`--hmx-region:${ve(M.color)};`:"",z=C.top+rn,V=Math.max(0,C.bottom-C.top-2*rn);V<=0||(fe+=`<div class="hmx-region-rail" style="top:${z}px;height:${V}px;${_}"></div>`,M.label&&(fe+=`<div class="hmx-region-label" style="top:${z}px;height:${V}px;${_}">${ve(M.label)}</div>`))}fe+="</div>";let ue=this.scrollEl.scrollTop;if(this.scrollEl.innerHTML=fe,this.root.classList.toggle("hmx-window-scroll",P),this.root.classList.toggle("hmx-window-inert",P&&e.rowWindowScrollable===!1),this.scrollEl.style.maxHeight=P?`${e.rowWindow.height}px`:"",this.windowPlan=P?x:[],this.windowYs=P?ke:[],this.windowHs=P?R:[],P?(L.from!==this.windowFrom?this.scrollEl.scrollTop=ke[L.from]:this.scrollEl.scrollTop=ue,this.windowFrom=L.from):this.windowFrom=-1,L?this.reportWindow(x,L.from,L.to,"render"):e.rowWindow&&this.reportWindow(x,-1,-1,"render"),this.pendingScroll){let{scrollBefore:m,bandTop:C,delta:M}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,C<m?m+M:m)}e.onVisibleColumnsChange&&!go(a,this.lastVisibleCols)?(this.lastVisibleCols=a,e.onVisibleColumnsChange(a)):this.lastVisibleCols=a}reportWindow(e,t,n,l){let s=t<0?null:{start:o.itemRows(e[t])[0],end:o.itemRows(e[n-1])[1]},p=s?`${s.start}-${s.end}`:"none";p!==this.lastWindowKey&&(this.lastWindowKey=p,this.options.onRowWindowChange?.(s,l))}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,n=t.closest(".hmx-collapsed, .hmx-expanded-toggle");if(n){if(n.dataset.cs===void 0)return;let p=parseInt(n.dataset.cs);if(t.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:-n.offsetHeight},this.options.onRemoveCollapse?.(p);return}let a=parseInt(n.dataset.count||"0"),d=n.classList.contains("hmx-collapsed"),r=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:d?a*r:-a*r},this.options.onToggleCollapse?.(p);return}let l=t.closest(".hmx-rowlabel");if(l){this.options.onRowHeaderClick?.(parseInt(l.dataset.row),e);return}let s=t.closest(".hmx-cell");s&&this.options.onCellClick?.(parseInt(s.dataset.row),parseInt(s.dataset.col),e)})}static columnSpans(e,t=[]){let n=[];for(let l of t){let s=e.map((d,r)=>({column:d,display:r})).filter(({column:d})=>d>=l.start&&d<=l.end);if(s.length===0)continue;let p=(l.dividers??[]).filter(d=>d>l.start&&d<=l.end),a=new Array(p.length+1).fill(0);for(let{column:d}of s)a[p.filter(r=>r<=d).length]++;n.push({label:l.label,from:s[0].display,to:s[s.length-1].display,parts:a.filter(d=>d>0)})}return n}static itemRows(e){return e.kind==="row"?[e.row,e.row]:[e.start,e.end]}static windowItems(e,t,n){let l=e.length;if(l===0)return{from:0,to:0};let s=l;for(let d=0;s>0&&d+e[s-1]<=n;)d+=e[--s];let p=Math.max(0,Math.min(t,s,l-1)),a=p;for(let d=0;a<l&&(a===p||d+e[a]<=n);)d+=e[a++];return{from:p,to:a}}static planRows(e,t=[]){let n=t.map((d,r)=>({start:Math.max(0,d.start),end:Math.min(e-1,d.end),collapsed:d.collapsed!==!1,locked:!!d.locked,label:d.label,index:r})).filter(d=>d.start<=d.end),l=new Array(e);for(let d of n)if(d.locked)for(let r=d.start;r<=d.end;r++)l[r]??(l[r]=d);let s=(d,r)=>{let g=0;for(let f=d;f<=r;f++)l[f]||g++;return g},p=new Map;for(let d of n)d.locked||s(d.start,d.end)===0||p.has(d.start)||p.set(d.start,d);let a=[];for(let d=0;d<e;){let r=p.get(d);if(r?.collapsed){a.push({kind:"band",start:r.start,end:r.end,index:r.index,locked:!1,label:r.label,shown:s(r.start,r.end)}),d=r.end+1;continue}r&&a.push({kind:"handle",start:r.start,end:r.end,index:r.index,shown:s(r.start,r.end)});let g=l[d];if(g){let f=d;for(;f+1<e&&l[f+1]===g&&!p.has(f+1);)f++;a.push({kind:"band",start:d,end:f,index:g.index,locked:!0,label:g.label,shown:0}),d=f+1;continue}a.push({kind:"row",row:d}),d++}return a}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let n=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.scrollEl.removeEventListener("scroll",this.onWindowScroll),this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function go(o,e){if(o.length!==e.length)return!1;for(let t=0;t<o.length;t++)if(o[t]!==e[t])return!1;return!0}function kt(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let n=t[1],l,s,p,a=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),s=parseInt(n[1]+n[1],16),p=parseInt(n[2]+n[2],16),n.length===4&&(a=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),s=parseInt(n.slice(2,4),16),p=parseInt(n.slice(4,6),16),n.length===8&&(a=parseInt(n.slice(6,8),16)/255)),[l,s,p,a]}return null}function Mt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function bo(o){let e=o;for(;e;){let t=Mt(kt(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let n=Mt(kt(getComputedStyle(t).backgroundColor));if(n!==null)return n}return null}function xo(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=Mt(kt(e));return t===null?null:t<.5}function it(o,e){let t=Pe(o),n=()=>{let p=Pe(o);p!==t&&(t=p,e(p))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let s=null;return typeof window<"u"&&window.matchMedia&&(s=window.matchMedia("(prefers-color-scheme: dark)"),s.addEventListener("change",n)),()=>{l.disconnect(),s?.removeEventListener("change",n)}}function Pe(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=xo();if(e!==null)return e;let t=bo(o??null);return t!==null?t<.5:!1}var vo=60,sn=30,wo=22,yo=48,Lo=18,ko=480,an={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Mo="#cc6622";function So(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var dn=41;function St(o,e,t){let[n,l,s]=So(e),p=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(t){let d=r=>Math.round(dn+(r-dn)*p);return`rgb(${d(n)}, ${d(l)}, ${d(s)})`}let a=d=>Math.round(255-(255-d)*p);return`rgb(${a(n)}, ${a(l)}, ${a(s)})`}function To(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function cn(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+_e(o.slice(1)):_e(o)}function Ne(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function lt(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function pn(o,e,t,n){let l=qt(),s=n?.interactive!==!1,p=s||n?.layerNavigator!==!1,a;if(typeof o=="string"?a=document.querySelector(o):o instanceof Element?a=o:a=null,!a)return console.error("Container not found:",o),null;let d=xt(e),r=d.normalized,g=d.v2Data,f=Kt(l);function x(i){return i?i.map(h=>({token:h.tokens?.[0]??"",color:h.color})).filter(h=>h.token!==""):[]}let c={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??r.layers.length,darkModeOverride:t?.darkMode??null,pinned:x(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:t?.colorIndex??0,openPopup:null,rowHighlights:t?.rowHighlights??[],collapsedSections:(t?.collapsedSections??[]).map(i=>({...i})),rowStart:t?.rowStart??null},k=null,$=!s&&!!n?.maxRows&&n.maxRows>0,S=null,R=n?.scrollRowsActive!==!1,L={};function P(i,h){(L[i]||[]).forEach(u=>u(h))}let w=r.layers.length,A=r.tokens.length,T=[],D="",O=new Set,G=[];function W(i){return i>=0&&i<A&&!O.has(i)}function oe(){w=r.layers.length,A=r.tokens.length,G=Yt(r),O=new Set;for(let v of G)for(let y=v.start;y<=v.end;y++)O.add(y);T=[];for(let v=0;v<w;v++){let y=0;for(let E=0;E<A;E++){let I=r.cells[E]?.[v];I&&I.prob>y&&(y=I.prob)}T.push(y)}let i=r.computedRows,h=i?i[i.length-1]??-1:A-1;D=r.cells[h]?.[w-1]?.token??"",c.pinnedRows=c.pinnedRows.filter(W),c.selectedRow!==null&&!W(c.selectedRow)&&(c.selectedRow=null),(c.viewSize>w||c.viewSize<1)&&(c.viewSize=w);let u=Math.max(0,w-c.viewSize);c.viewStart>u&&(c.viewStart=u),c.viewStart<0&&(c.viewStart=0)}oe();function B(i){let h=c.pinned.find(u=>u.token===i);return h?h.color:null}function me(i){let h=c.pinned.findIndex(u=>u.token===i);h>=0?c.pinned.splice(h,1):(c.pinned.push({token:i,color:Qe[c.colorIndex%Qe.length]}),c.colorIndex++)}function ie(i,h){let u=g?.tracked?.[i];if(u&&Array.isArray(u[h]))return u[h];for(let v=0;v<w;v++){let y=r.cells[i]?.[v]?.topk.find(E=>E.token===h);if(y)return y.trajectory}return null}function pe(i){let h=c.pinnedRows.indexOf(i);return wt[(h<0?0:h)%wt.length]}function le(i){return c.pinnedRows.indexOf(i)>=0}function De(i,h){for(let u of c.pinned){let v=ie(i,u.token);if(!v)continue;let y=0;for(let E of v)E!=null&&E>y&&(y=E);if(y>=h)return!0}return!1}function fe(i){let h=null,u=0;for(let v=0;v<w;v++){let y=r.cells[i]?.[v];y&&y.prob>u&&(u=y.prob,h=y.token)}return u>=.05?h:null}function he(i){if(!W(i))return;let h=c.pinnedRows.indexOf(i);if(h>=0){c.pinnedRows.splice(h,1);return}if(!De(i,.01)){let u=fe(i);u&&!B(u)&&(c.pinned.push({token:u,color:Qe[c.colorIndex%Qe.length]}),c.colorIndex++)}c.pinnedRows.push(i)}function ke(){return an[c.ramp]||an.purple}function ue(){return c.darkModeOverride!==null?c.darkModeOverride:Pe(a)}let m=[];function C(){return m.length>1?Math.max(1,m[1]-m[0]):1}a.innerHTML=`
        <div id="${l}"${s?' tabindex="-1"':' class="ll-static"'}>
            <div class="ll-heatmap" id="${l}_heatmap"${s?' tabindex="0"':""}></div>
            <div class="ll-nav${p?"":" ll-hidden"}" id="${l}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${l}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${l}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${l}_lp_box"><div class="ll-lineplot" id="${l}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${l}_tt"></div>
            <div class="ll-popup" id="${l}_popup">
                <span class="ll-popup-close" id="${l}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${l}_popup_hdr"></div>
                <div class="ll-popup-body" id="${l}_popup_body"></div>
            </div>
        </div>
    `.trim();let M=document.getElementById(l),_=document.getElementById(l+"_heatmap"),z=document.getElementById(l+"_nav"),V,we=document.getElementById(l+"_lp_wrap"),J=document.getElementById(l+"_lp_token"),ee=document.getElementById(l+"_lp_box"),$e=document.getElementById(l+"_lp"),F=document.getElementById(l+"_tt"),X=document.getElementById(l+"_popup"),Me=document.getElementById(l+"_popup_hdr"),Fe=document.getElementById(l+"_popup_body");s&&document.body.appendChild(X);let ae=null,b=null,H=!0,U=!1,Y=s?getComputedStyle(M).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",K=!Y;K&&M.classList.add("ll-fill");let Q=(()=>{if(!Y||/^(unbounded|none|auto)$/i.test(Y))return null;let i=Y.split("/").map(h=>parseFloat(h.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})();function Ce(i,h){let u=h?"#bbb":"#555",v=i?` stroke-dasharray="${_e(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${v}/></svg>`}function Se(){return{rows:r.tokens.map(i=>({label:i})),columns:r.layers.map(i=>({label:String(i),value:0})),getCellValue:(i,h)=>{let u=r.cells[i][h],v=u.prob,y=ue(),E=D!==""&&u.token===D,I=B(u.token),N=v<.18;return{text:u.token,value:v,color:St(v,E?Mo:ke(),y),textColor:To(v,y),highlighted:!!I,highlightColor:I??void 0,opacity:c.dimLow&&N?.55:void 0}}}}function Ie(i){let h=r.tokens[i],u=i===c.selectedRow||le(i),v=s?`<span class="ll-fold-handle${k===i?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return le(i)&&(v+=Ce(pe(i).dash,ue())),v+=lt(h)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${cn(h)}</span>`,v}function Ae(i){return"ll-hmx-row"+(i===c.selectedRow||le(i)?" ll-hmx-active":"")+(En(i)?" ll-gen-row":"")+(Sn(i)?" ll-template-row":"")}function Sn(i){return!!g?.template?.includes(i)}function Tn(){let i=g?.completion;return i&&i.length?r.tokens.length-i.length:r.tokens.length}function En(i){return i>=Tn()}function $n(i,h){let u=Math.min(i,h),v=Math.max(i,h);c.collapsedSections=c.collapsedSections.filter(y=>y.end<u||y.start>v).concat({start:u,end:v,collapsed:!0}).sort((y,E)=>y.start-E.start)}function Cn(i){k===null?(k=i,j()):k===i?(k=null,j()):($n(k,i),k=null,j(),ge())}function Dt(){let i={interactive:s,columnSizing:"fit",minColumnWidth:yo,maxVisibleColumns:Lo,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:qe(c.viewStart),size:c.viewSize},rowSizing:K?"fill":"fixed",cellHeight:sn,rowHeaderWidth:vo,headerHeight:wo+6,height:K||Q!=null?"fill":"content",chrome:"none",cornerLabel:"token",columnSections:r.sections,showGrid:c.showGrid,darkMode:ue(),renderRowLabel:Ie,rowClassName:Ae,rowHighlights:c.rowHighlights,collapsedSections:G.length?c.collapsedSections.concat(G):c.collapsedSections,onVisibleColumnsChange:h=>{m=h},...$?{rowWindow:{start:Hn(),height:n.maxRows*sn},rowWindowMode:n?.scrollRows?"scroll":"clip",rowWindowScrollable:R,onRowWindowChange:(h,u)=>{S=h?{...h,total:A}:null,u==="scroll"&&h&&(c.rowStart=h.start),P("rowWindowChange",{window:S,source:u})}}:{}};return s?{...i,onToggleCollapse:h=>{let u=c.collapsedSections[h];u&&(u.collapsed=u.collapsed===!1,j(),ge())},onRemoveCollapse:h=>{c.collapsedSections.splice(h,1),j(),ge()},onCellHover:Zn,onCellClick:Jn,onRowHeaderClick:(h,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){Cn(h);return}he(h),j(),de(),ge()},onCellLeave:()=>{pt(),Qn()}}:i}function Hn(){if(c.rowStart!=null)return c.rowStart;let i=c.selectedRow??c.pinnedRows[0]??null;return i!=null?Math.max(0,i-Math.floor(n.maxRows/2)):Number.MAX_SAFE_INTEGER}function Rn(){if(K){let h=a.clientWidth;M.style.width=h>0?h+"px":"100%",M.style.maxWidth="100%",M.style.maxHeight="";return}M.style.width="",M.style.maxWidth="";let i=a.clientWidth||M.clientWidth;if(Q&&i>0){let u=M.offsetHeight-V.getScrollElement().offsetHeight,v=(u>0?u:140)+90;M.style.maxHeight=Math.max(v,Math.round(i*Q))+"px"}else M.style.maxHeight=""}function j(){Rn(),V.setOptions(Dt())}function Te(){if(!p)return;let i=ke(),h=ue(),u=qe(c.viewStart),v=C(),y=c.viewSize,E=y>=w,I=It(),N=y<=I[0],q='<span class="ll-nav-range-key">layers</span>';E?q+=`all ${w}`+(v>1?`<span class="ll-dim"> \xB7 every ${v}</span>`:""):q+=`${u}\u2013${u+y-1}<span class="ll-dim"> / ${w}</span>`+(v>1?`<span class="ll-dim"> \xB7 \u22481/${v}</span>`:"");let ce="";for(let te=0;te<w;te++){let Ue=T[te]||0,Ke=Math.max(8,Math.round(Ue*92));ce+=`<div class="ll-skyline-bar" style="height:${Ke}%;background:${St(Ue,i,h)}"></div>`}let re=u/w*100,ye=y/w*100,He="";(r.sections??[]).forEach((te,Ue)=>{if(Ue%2===0)return;let Ke=te.start/w*100,gt=(te.end-te.start+1)/w*100;He+=`<i style="left:${Ke}%;width:${gt}%"></i>`});let be=[];for(let te=0;te<w;te+=8)be.push(te);be[be.length-1]!==w-1&&be.push(w-1);let Le="",We=Math.max(1,w-1);for(let te of be){let Ue=te===w-1,Ke=te===0,gt=te/We*100;Le+=`<span class="ll-nav-tick" style="left:${gt}%;transform:${Ue?"translateX(-100%)":Ke?"translateX(0)":"translateX(-50%)"}">${r.layers[te]}</span>`}let Ve=a?.clientWidth||M.clientWidth;z.classList.toggle("ll-nav-stacked",s&&Ve>0&&Ve<ko),z.innerHTML=`
            <div class="ll-nav-range">${q}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${l}_sky">
                    <div class="ll-skyline-secs">${He}</div>
                    <div class="ll-skyline-bars">${ce}</div>
                    <div class="ll-skyline-win" id="${l}_win" style="left:${re}%;width:${ye}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${Le}</div>
            </div>
            ${s?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${$o}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+y>=w?"disabled":""}>${Co}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${N?"disabled":""}>${Ho}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${E?"disabled":""}>${Ro}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Eo}</button>
            </div>`:""}
        `,s&&An()}function Pn(){let i=document.getElementById(l+"_win");if(!i)return;let h=Math.max(0,w-c.viewSize),u=Math.max(0,Math.min(h,c.viewStart));i.style.left=u/w*100+"%",i.style.width=c.viewSize/w*100+"%"}function It(){return Array.from(new Set([w,48,32,20,14,10,8])).filter(i=>i<=w&&i>=1).sort((i,h)=>i-h)}function qe(i){return Math.max(0,Math.min(Math.max(0,w-c.viewSize),i))}let st=!1;function At(){st||(st=!0,requestAnimationFrame(()=>{st=!1,!U&&(j(),Pn())}))}function at(i){let h=qe(c.viewStart+i);h!==c.viewStart&&(c.viewStart=h,j(),Te(),ge())}function Dn(i){let h=qe(i);h!==c.viewStart&&(c.viewStart=h,At())}function Ot(i,h){let u=It(),v=u.findIndex(N=>N>=c.viewSize),y=v===-1?u.length-1:v,E=i<0?Math.max(0,y-1):Math.min(u.length-1,y+1),I=u[E];I!==c.viewSize&&(c.viewSize=I,c.viewStart=Math.max(0,Math.min(w-I,Math.round(h-I/2))),j(),Te(),ge())}function Wt(i){Ot(i,c.viewStart+c.viewSize/2)}function In(){c.viewSize=w,c.viewStart=0,j(),Te(),ge()}let Oe=null;function An(){let i=document.getElementById(l+"_sky");if(!i)return;i.addEventListener("pointerdown",u=>{let v=i.getBoundingClientRect(),y=u.clientX-v.left,E=v.width/w,I=Math.max(0,w-c.viewSize),N=Math.max(0,Math.min(I,c.viewStart)),q=N*E,ce=(N+c.viewSize)*E,re=N;(y<q||y>ce)&&(re=qe(Math.round(y/E)-Math.floor(c.viewSize/2)),c.viewStart=re,At()),Oe={startX:y,startStart:re,layerW:E},i.classList.add("ll-grabbing");try{i.setPointerCapture(u.pointerId)}catch{}}),i.addEventListener("pointermove",u=>{if(!Oe)return;let v=i.getBoundingClientRect(),E=(u.clientX-v.left-Oe.startX)/Oe.layerW;Dn(Math.round(Oe.startStart+E))});let h=u=>{if(Oe){Oe=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(u.pointerId)}catch{}Te(),ge()}};i.addEventListener("pointerup",h),i.addEventListener("pointercancel",h),i.addEventListener("wheel",u=>{u.preventDefault();let v=i.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){at(u.deltaX>0?1:-1);return}let y=Math.round((u.clientX-v.left)/v.width*w);Ot(u.deltaY<0?-1:1,y)},{passive:!1})}function On(i,h,u=!1){W(i)&&(c.selectedRow=i,c.selectedLayerIdx=h??r.layers.length-1,j(),de(),u&&Wn(i),ge())}function Wn(i){V.scrollToRow(i)}function dt(){requestAnimationFrame(()=>requestAnimationFrame(()=>{U||V.scrollToBottom()}))}let _n=.45,Bn=120,zn=360;function ct(){let i;if(Q)i=(a.clientWidth||M.clientWidth)*Q;else{let u=M.clientHeight;i=u>0?u:(M.clientWidth||900)*.6}let h=Math.round(i*_n);ee.style.height=Math.max(Bn,Math.min(zn,h))+"px"}function _t(i){return i+"\xB7"+(lt(r.tokens[i])?"bos":Ne(r.tokens[i]))}function de(i){let h=c.pinnedRows.length>0?c.pinnedRows:c.selectedRow!==null?[c.selectedRow]:[],u=h.length>1,v=[];for(let E of h){let I=pe(E);for(let N of c.pinned){let q=ie(E,N.token);if(!q)continue;let ce=Ne(N.token);u&&(ce+=" ("+_t(E)+")"),v.push({values:q.map(re=>re??null),label:ce,color:N.color,dashPattern:I.dash||void 0,removable:!1})}}let y=v.length===0&&!i;if(y)we.classList.add("ll-hidden");else{we.classList.remove("ll-hidden"),ct(),J.textContent=c.pinnedRows.length>1?c.pinnedRows.length+" positions":h.length===1?"position "+_t(h[0]):"";let E={lines:[],richLines:v,xLabels:r.layers,sections:r.sections},I={darkMode:ue(),mode:"probability",autoScale:!0,legendPosition:v.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:s,pixelRatio:n?.pixelRatio};ae?(ae.setData(E),ae.setOptions(I)):($e.style.minHeight="0",ae=new Re($e,E,I)),i?ae.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):ae.setOverlay?.(null)}K&&y!==H?(H=y,requestAnimationFrame(()=>{U||(j(),dt())})):H=y}let Nn=56,Fn=11,Vn=9.5,Un=15;function jn(i){let h=Fn*(i>0?i/Nn:1);return Math.max(Vn,Math.min(Un,h))}function Gn(i,h,u,v,y=0){let E=r.cells[i]?.[h];if(!E||!W(i))return;let I=ke(),N=lt(r.tokens[i])?"bos":Ne(r.tokens[i]);F.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${St(E.prob,I,ue())}"></span><span class="ll-tt-token">${_e(Ne(E.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(E.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${r.layers[h]} / ${r.layers[w-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${_e(N)}</span></div>`,F.style.fontSize=jn(y)+"px",F.classList.add("ll-visible");let q=M.getBoundingClientRect(),ce=F.offsetWidth||200,re=F.offsetHeight||80,ye=8,He=14,be=u-q.left,Le=v-q.top,We=be+He;We+ce>q.width-ye&&(We=be-He-ce),We=Math.max(ye,Math.min(We,q.width-ce-ye));let Ve=Le-50;Ve=Math.max(ye,Math.min(Ve,q.height-re-ye)),F.style.left=We+"px",F.style.top=Ve+"px"}function pt(){F.classList.remove("ll-visible")}function Xn(){ht(),b=document.createElement("div"),b.style.cssText="position:fixed;inset:0;z-index:49;",b.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),zt()}),document.body.appendChild(b)}function ht(){b&&(b.remove(),b=null)}function Yn(i,h,u){if(!r.cells[i]?.[h]||!W(i))return;let y=u.getBoundingClientRect();c.openPopup={row:i,layer:h},c.selectedRow=i,c.selectedLayerIdx=h;let E=lt(r.tokens[i])?"bos":Ne(r.tokens[i]);Me.innerHTML=`Layer <b>${r.layers[h]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${_e(E)}</code></div>`,Bt(i,h),j(),de(),X.style.visibility="hidden",X.classList.add("ll-visible"),qn(y),X.style.visibility="",Xn(),ge()}function Bt(i,h){let u=r.cells[i][h],v="";u.topk.forEach((y,E)=>{let I=B(y.token),N=I?`background:${I}22;border-left-color:${I};`:"";v+=`<div class="ll-topk${I?" ll-topk-pinned":""}" data-ki="${E}" style="${N}" title="click to track trajectory"><span class="ll-topk-tok">${cn(y.token)}</span><span class="ll-topk-prob">${(y.prob*100).toFixed(1)}%</span></div>`}),Fe.innerHTML=v,Fe.querySelectorAll(".ll-topk").forEach(y=>{let E=parseInt(y.dataset.ki),I=u.topk[E];y.addEventListener("mouseenter",()=>{if(H)return;let N=ie(i,I.token);N&&de({values:N.map(q=>q??null),label:Ne(I.token),color:"#999"})}),y.addEventListener("mouseleave",()=>{H||de()}),y.addEventListener("click",N=>{N.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(me(I.token),j(),Bt(i,h),de(),ge())})})}function qn(i){let v=M.getBoundingClientRect(),y=Math.max(140,v.width-2*8),E=Math.max(120,v.height-2*8);X.style.maxWidth=y+"px",X.style.maxHeight=E+"px";let I=X.offsetWidth||220,N=X.offsetHeight||160,q=v.left+8,ce=v.right-8-I,re=v.top+8,ye=v.bottom-8-N,He=[{left:i.right+6,top:i.top},{left:i.left-6-I,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-N}],be=He[0];for(let Le of He)if(Le.left>=q&&Le.left<=ce&&Le.top>=re&&Le.top<=ye){be=Le;break}X.style.left=Math.max(q,Math.min(be.left,Math.max(q,ce)))+"px",X.style.top=Math.max(re,Math.min(be.top,Math.max(re,ye)))+"px"}function zt(){c.openPopup=null,X.classList.remove("ll-visible"),ht(),j(),de()}s&&document.getElementById(l+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),zt()});function Kn(i,h){if(H||!W(i))return;let u=r.cells[i]?.[h]?.token,v=u!=null?ie(i,u):null;v?de({values:v.map(y=>y??null),label:Ne(u),color:"#999"}):de()}function Qn(){H||de()}function Zn(i,h){Kn(i,h)}function Jn(i,h,u){if(!W(i))return;if(u.shiftKey){let y=r.cells[i]?.[h]?.token;y&&(me(y),j(),de(),ge());return}pt();let v=u.target.closest(".hmx-cell");v&&Yn(i,h,v)}V=new je(_,Se(),Dt());let tt=V.getScrollElement(),Nt=i=>{let h=i.target.closest(".hmx-cell");if(!h){pt();return}Gn(parseInt(h.dataset.row),parseInt(h.dataset.col),i.clientX,i.clientY,h.offsetWidth)},Ft=i=>{i.shiftKey&&i.target.closest(".hmx-rowlabel")&&i.preventDefault()};s&&(tt.addEventListener("mousemove",Nt),tt.addEventListener("mousedown",Ft),_.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let h=i.key==="ArrowDown"?1:-1,u=(c.selectedRow??(h>0?-1:A))+h;for(;u>=0&&u<A&&!W(u);)u+=h;W(u)&&On(u,void 0,!0)}),z.addEventListener("click",i=>{let h=i.target.closest("[data-nav]");if(!h||h.hasAttribute("disabled"))return;let u=h.dataset.nav;u==="panL"?at(-Math.max(1,Math.floor(c.viewSize/4))):u==="panR"?at(Math.max(1,Math.floor(c.viewSize/4))):u==="zoomIn"?Wt(-1):u==="zoomOut"?Wt(1):u==="reset"&&In()}));function ut(){j(),Te(),de(),requestAnimationFrame(()=>{U||(j(),Te(),H||ct())})}function mt(){vt(M,ue(),X)}function ge(){P("stateChange",Gt())}ut(),s&&dt(),mt();let ft=0,Vt=a?.clientWidth??0,Ut=a?.clientHeight??0,jt=new ResizeObserver(()=>{let i=a?.clientWidth??0,h=a?.clientHeight??0;i===Vt&&h===Ut||(Vt=i,Ut=h,!ft&&(ft=requestAnimationFrame(()=>{ft=0,!U&&(j(),Te(),H||ct())})))});a&&jt.observe(a);let eo=it(a,i=>{c.darkModeOverride===null&&(vt(M,i,X),j(),Te(),de())});function Gt(){return{ramp:c.ramp,showGrid:c.showGrid,dimLowProb:c.dimLow,selectedRow:c.selectedRow,selectedLayer:c.selectedLayerIdx,viewStart:c.viewStart,viewSize:c.viewSize,colorIndex:c.colorIndex,pinnedGroups:c.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:c.pinnedRows.map(i=>({pos:i,line:pe(i).name})),darkMode:c.darkModeOverride,rowHighlights:c.rowHighlights,collapsedSections:c.collapsedSections,rowStart:c.rowStart}}return{widget:{getState:Gt,setState:i=>{i.ramp!==void 0&&(c.ramp=i.ramp),i.showGrid!==void 0&&(c.showGrid=i.showGrid),i.dimLowProb!==void 0&&(c.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(c.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(c.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(c.viewStart=i.viewStart),i.viewSize!==void 0&&(c.viewSize=i.viewSize),i.colorIndex!==void 0&&(c.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(c.pinned=x(i.pinnedGroups)),i.pinnedRows!==void 0&&(c.pinnedRows=i.pinnedRows.map(h=>h.pos).filter(h=>typeof h=="number")),i.darkMode!==void 0&&(c.darkModeOverride=i.darkMode),i.rowHighlights!==void 0&&(c.rowHighlights=i.rowHighlights),i.collapsedSections!==void 0&&(c.collapsedSections=i.collapsedSections.map(h=>({...h}))),i.rowStart!==void 0&&(c.rowStart=i.rowStart),oe(),mt(),ut()},setData:i=>{d=xt(i),r=d.normalized,g=d.v2Data,c.selectedRow=null,c.selectedLayerIdx=null,c.pinned=[],c.pinnedRows=[],c.colorIndex=0,c.rowHighlights=[],c.collapsedSections=[],c.rowStart=null,k=null,oe(),m=[],V.setData(Se()),ut(),s&&dt()},setTitle:()=>{},setThemeMode:i=>{c.darkModeOverride=!!i,mt(),j(),Te(),de()},getThemeMode:()=>ue(),getRowWindow:()=>S,setRowScrollActive:i=>{i!==R&&(R=i,j())},hasEntropyData:()=>!!g&&Array.isArray(g.entropy)&&g.entropy.length>0,hasRankData:()=>{if(!g?.tracked)return!1;for(let i of g.tracked)for(let h in i){let u=i[h];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,h)=>{(L[i]||(L[i]=[])).push(h)},off:(i,h)=>{L[i]=(L[i]||[]).filter(u=>u!==h)},destroy:()=>{U=!0,eo(),jt?.disconnect(),ht(),X.remove(),ae&&(ae.destroy(),ae=null),tt.removeEventListener("mousemove",Nt),tt.removeEventListener("mousedown",Ft),V?.destroy(),a&&(a.innerHTML="")}},styleEl:f}}var Eo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',$o='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Co='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Ho='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Ro='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ge=class{constructor(e,t,n,l){this.widget=null;this.styleEl=null;let s=pn(e,t,n,l);s&&(this.widget=s.widget,this.styleEl=s.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}getRowWindow(){return this.widget?.getRowWindow()??null}setRowScrollActive(e){this.widget?.setRowScrollActive(e)}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var Po='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Do='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Io='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',Tt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function Et(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function hn(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${Tt};`;let t={isOpen:!1,searchQuery:""},n=mn(e,o,t);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=t,e}function Je(o,e){let t=o.__tokenSelectorCleanup,n=o.__tokenSelectorState;t&&t();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},s=mn(o,e,l);o.__tokenSelectorCleanup=s,o.__tokenSelectorState=l}function un(o){let e=o.__tokenSelectorCleanup;e&&e()}function mn(o,e,t){o.innerHTML="";let n=Et(e.darkMode),{allLabels:l,selectedIndices:s,defaultIndices:p,onChange:a}=e,d=document.createElement("div");d.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let r=document.createElement("span");if(r.style.cssText=`font-size:11px;color:${n.fgMuted};`,r.textContent=`Tokens (${l.length})`,d.appendChild(r),!$t(s,p)){let T=document.createElement("button");T.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${Tt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,T.innerHTML=`${Po} Reset`,T.addEventListener("mouseenter",()=>{T.style.color=n.fg}),T.addEventListener("mouseleave",()=>{T.style.color=n.fgMuted}),T.addEventListener("click",()=>{a(Array.from(p))}),d.appendChild(T)}o.appendChild(d);let f=document.createElement("div");f.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,f.addEventListener("click",()=>{P(),c.focus()});let x=Array.from(s).sort((T,D)=>T-D);for(let T of x){let D=Ao(T,l[T],e.darkMode,()=>{let O=new Set(s);O.delete(T),a(Array.from(O))});f.appendChild(D)}let c=document.createElement("input");c.type="text",c.placeholder=x.length===0?"Search tokens...":"",c.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${Tt};min-width:60px;flex:1;padding:2px 0;`,c.addEventListener("input",()=>{t.searchQuery=c.value,L()}),c.addEventListener("focus",()=>P()),f.appendChild(c);let k=document.createElement("span");k.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,k.innerHTML=Io,k.addEventListener("click",T=>{T.stopPropagation(),t.isOpen?w():P()}),f.appendChild(k),o.appendChild(f);let $=document.createElement("div");$.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let S=document.createElement("div");S.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",$.appendChild(S);let R=document.createElement("div");R.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,R.textContent="No tokens found",$.appendChild(R),o.appendChild($);function L(){S.innerHTML="";let T=t.searchQuery.toLowerCase(),D=0;for(let O=0;O<l.length;O++){let G=l[O];if(T&&!G.toLowerCase().includes(T))continue;D++;let W=s.has(O),oe=Oo(O,G,W,e.darkMode,()=>{let B=new Set(s);W?B.delete(O):B.add(O),a(Array.from(B))});S.appendChild(oe)}R.style.display=D===0?"":"none"}function P(){t.isOpen||(t.isOpen=!0,$.style.display="",k.style.transform="rotate(180deg)",L())}function w(){t.isOpen&&(t.isOpen=!1,$.style.display="none",k.style.transform="",c.value="",t.searchQuery="")}function A(T){o.contains(T.target)||w()}return document.addEventListener("mousedown",A),t.isOpen&&($.style.display="",k.style.transform="rotate(180deg)",c.value=t.searchQuery,L(),requestAnimationFrame(()=>{c.isConnected&&c.focus()})),()=>{document.removeEventListener("mousedown",A)}}function Ao(o,e,t,n){let l=Et(t),s=Z[o%Z.length],p=document.createElement("div");p.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,p.addEventListener("mouseenter",()=>{p.style.background=l.chipHoverBg,p.style.borderColor=l.chipHoverBorder}),p.addEventListener("mouseleave",()=>{p.style.background=l.chipBg,p.style.borderColor=l.chipBorder});let a=document.createElement("span");a.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${s};`,p.appendChild(a);let d=document.createElement("span");d.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,d.innerHTML=ze(e),d.title=e,p.appendChild(d);let r=document.createElement("button");return r.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,r.innerHTML=Do,r.addEventListener("mouseenter",()=>{r.style.color=l.badgeText}),r.addEventListener("mouseleave",()=>{r.style.color=l.fgMuted}),r.addEventListener("click",g=>{g.stopPropagation(),n()}),p.appendChild(r),p}function Oo(o,e,t,n,l){let s=Et(n),p=Z[o%Z.length],a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",a.addEventListener("mouseenter",()=>{a.style.background=s.hoverBg}),a.addEventListener("mouseleave",()=>{a.style.background="transparent"}),a.addEventListener("click",f=>{f.stopPropagation(),l()});let d=document.createElement("span");d.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?p:"transparent"};border:1.5px solid ${t?p:s.fgMuted};`,a.appendChild(d);let r=document.createElement("span");r.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?s.fg:s.fgMuted};`,r.innerHTML=ze(e),r.title=e,a.appendChild(r);let g=o===0?"source pred":o===1?"target pred":null;if(g){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${s.badgeBg};color:${s.badgeText};border:1px solid ${s.badgeBorder};`,f.textContent=g,a.appendChild(f)}if(t){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;font-size:10px;color:${s.selectedText};`,f.textContent="selected",a.appendChild(f)}return a}function $t(o,e){if(o.size!==e.size)return!1;for(let t of o)if(!e.has(t))return!1;return!0}var Wo={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},_o=["probability","prob_diff","rank"],Xe=class Xe{constructor(e,t,n={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.interactive=n.interactive!==!1,this.pixelRatio=n.pixelRatio,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=n.defaultSelectedTokens??Xe.defaultSelection(t);this.customDefaultTokens=n.defaultSelectedTokens!==void 0,this.defaultTokens=new Set(l),this.selectedTokens=new Set(n.selectedTokens??l),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=hn(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let s=document.createElement("div");s.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(s),this.linePlot=new Re(s,this.buildPlotData(),this.buildPlotOptions()),s.style.height="auto"}static defaultSelection(e){let t=e.tokenLabels?.length??e.lines?.length??0,n=new Set(Array.from({length:Math.min(2,t)},(s,p)=>p)),l=s=>Math.max(...e.lines?.[s]??[0]);return(e.ranks??[]).slice(0,t).flatMap((s,p)=>!n.has(p)&&s.includes(0)?[p]:[]).sort((s,p)=>l(p)-l(s)||s-p).slice(0,Xe.MAX_DEFAULT_TOKENS-n.size).forEach(s=>n.add(s)),Array.from(n).sort((s,p)=>s-p)}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Je(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of _o){let n=document.createElement("button");n.textContent=Wo[t],this.applyModeButtonStyles(n,t===this.mode),n.addEventListener("click",()=>this.setMode(t)),n.addEventListener("mouseenter",()=>{t!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{t!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(t,n)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?l:"transparent"};color:${t?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((p,a)=>p-a),l=this.mode==="rank";return{richLines:n.filter(p=>p<e.length).map(p=>({values:l?e[p].map(a=>a+1):e[p],label:t[p]??`Token ${p}`,color:Z[p%Z.length]})),sections:this.allData.sections}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.customDefaultTokens||(this.defaultTokens=new Set(Xe.defaultSelection(e)));let n=new Set([...this.selectedTokens].filter(l=>l<t));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Je(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Je(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,n=new Set(e.filter(l=>l<t));$t(n,this.selectedTokens)||(this.selectedTokens=n,Je(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){un(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};Xe.MAX_DEFAULT_TOKENS=10;var Ye=Xe;function Ct(o,e,t){let n=Math.max(1,o),l=Math.max(1,e),s=Math.min(16e3/n,16e3/l,Math.sqrt(25e7/(n*l)));return Math.max(.01,Math.min(t>0?t:1,s))}var Ht="http://www.w3.org/1999/xhtml",rt="http://www.w3.org/2000/svg",Bo=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,zo=new Set(["d","x","y","cx","cy","r","rx","ry"]),No=new Set(["script","style","link","noscript","template"]),Fo=[["border-top-style","border-top-width"],["border-right-style","border-right-width"],["border-bottom-style","border-bottom-width"],["border-left-style","border-left-width"],["outline-style","outline-width"],["column-rule-style","column-rule-width"]],Vo=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,Uo=o=>o.replace(Vo,e=>e.length===2?e:"\uFFFD"),Rt=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(rt,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,t){let n=e.namespaceURI??Ht,l=`${n} ${e.localName}${t??""}`,s=this.cache.get(l);if(s)return s;let p=this.doc.createElementNS(n,e.localName);(n===rt?this.svgRoot:this.doc.body).appendChild(p);let a=this.win.getComputedStyle(p,t??null);s=new Map;for(let d=0;d<a.length;d++){let r=a.item(d);s.set(r,a.getPropertyValue(r))}return p.remove(),this.cache.set(l,s),s}destroy(){this.frame.remove()}};function fn(o,e,t,n){let l="",s=new Set;for(let p=0;p<o.length;p++){let a=o.item(p);if(Bo.test(a)||n&&zo.has(a))continue;let d=o.getPropertyValue(a);d===e.get(a)&&(!t||d===t.getPropertyValue(a))||(l+=`${a}:${d};`,s.add(a))}for(let[p,a]of Fo){let d=o.getPropertyValue(p);d&&d!=="none"&&d!=="hidden"&&!s.has(a)&&(l+=`${a}:${o.getPropertyValue(a)};`)}return l}function gn(o,e,t){if(o.nodeType===Node.TEXT_NODE)return document.createTextNode(o.nodeValue??"");if(o.nodeType!==Node.ELEMENT_NODE)return null;let n=o;if(No.has(n.localName.toLowerCase()))return null;let l=getComputedStyle(n);if(l.display==="none")return null;let s=n instanceof HTMLCanvasElement,p;if(s){p=document.createElement("img");try{p.setAttribute("src",n.toDataURL("image/png"))}catch{}}else p=n.cloneNode(!1);p.setAttribute("style",fn(l,t.sandbox.defaults(n),e,n.namespaceURI===rt));let a="",d="";for(let r of["::before","::after"]){let g=getComputedStyle(n,r),f=g.getPropertyValue("content");!f||f==="none"||f==="normal"||g.display==="none"||(d||(d=`nns-snap-${t.nextClass++}`),a+=`.${d}${r}{${fn(g,t.sandbox.defaults(n,r),l,!1)}}`)}if(d&&(p.setAttribute("class",`${p.getAttribute("class")??""} ${d}`.trim()),t.rules.push(a)),!s)for(let r of Array.from(n.childNodes)){let g=gn(r,l,t);g&&p.appendChild(g)}return p}function jo(o){return new Promise((e,t)=>{let n=new Image;n.onload=()=>e(n),n.onerror=()=>t(new Error("Snapshot failed: the browser could not render the captured element.")),n.src=o})}async function et(o,e={}){let t=Math.max(0,e.padding??0),n=o.getBoundingClientRect(),l=Math.ceil(n.width),s=Math.ceil(n.height);if(l===0||s===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let p=l+2*t,a=s+2*t,d=Ct(p,a,e.scale??2),r=new Rt,g;try{let S={sandbox:r,rules:[],nextClass:0},R=gn(o,null,S);if(!R)throw new Error("Snapshot failed: the element is not displayed.");R.setAttribute("style",R.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${l}px;height:${s}px;box-sizing:border-box;`);let L=document.createElementNS(Ht,"div");if(L.setAttribute("style",`width:${p}px;height:${a}px;padding:${t}px;margin:0;box-sizing:border-box;`),S.rules.length){let P=document.createElementNS(Ht,"style");P.textContent=S.rules.join(""),L.appendChild(P)}L.appendChild(R),g=Uo(new XMLSerializer().serializeToString(L))}finally{r.destroy()}let f=`<svg xmlns="${rt}" width="${p*d}" height="${a*d}" viewBox="0 0 ${p} ${a}"><foreignObject x="0" y="0" width="${p}" height="${a}">${g}</foreignObject></svg>`,x=await jo("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(f)),c=document.createElement("canvas");c.width=Math.round(p*d),c.height=Math.round(a*d);let k=c.getContext("2d");if(!k)throw new Error("Snapshot failed: no 2D canvas context.");e.background&&(k.fillStyle=e.background,k.fillRect(0,0,c.width,c.height)),k.drawImage(x,0,0,c.width,c.height);let $;try{$=c.toDataURL("image/png")}catch(S){throw new Error(`Snapshot failed: this browser won't read back the rendered image (${S.message}).`)}return{dataUrl:$,width:p,height:a,scale:d,toBlob:()=>new Promise((S,R)=>c.toBlob(L=>L?S(L):R(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var bn={light:"#ffffff",dark:"hsl(0 0% 16%)"};function Go(){return new Promise(o=>{let e=setTimeout(o,100);requestAnimationFrame(()=>{clearTimeout(e),o()})})}async function Xo(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let o=0;o<3;o++)await Go()}async function xn(o,e={}){let t=Math.max(200,Math.round(e.width??880)),n=e.darkMode??!1,l=e.scale??2,s=e.background===void 0?n?bn.dark:bn.light:e.background,p=document.createElement("div");p.setAttribute("aria-hidden","true"),p.style.cssText=`position:fixed;left:-100000px;top:0;width:${t}px;pointer-events:none;`;let a=document.createElement("div");p.appendChild(a),document.body.appendChild(p);let d=()=>{},r=()=>{};try{if(o.kind==="logit-lens"){let f=new Ge(a,o.data,{...o.uiState,darkMode:n},{interactive:!1,pixelRatio:l,maxRows:e.maxRows,layerNavigator:e.layerNavigator});d=()=>f.destroy(),r=()=>f.getRowWindow()}else{let f=Math.max(160,Math.round(e.height??t*.5));p.style.height=`${f}px`;let x=new Ye(a,o.data,{mode:o.mode,selectedTokens:o.selectedTokens,title:o.title,darkMode:n,transparentBackground:!0,interactive:!1,pixelRatio:l});d=()=>x.destroy()}return await Xo(),{...await et(p,{scale:l,background:s,padding:e.padding}),rows:r()}}finally{d(),p.remove()}}function Yo(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function Pt(o,e,t){let n=Yo(o);if(!n)return null;let l=e(n);if(t===void 0){let s=it(n,a=>l.setThemeMode(a)),p=l.destroy.bind(l);l.destroy=()=>{s(),p()}}return l}function yn(o,e,t,n){return new Ge(o,e,t,n)}function Ln(o,e,t){return Pt(o,n=>new Re(n,e,{darkMode:Pe(n),...t}),t?.darkMode)}var vn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function qo(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function wn(o,e){if(typeof o.getCellValue=="function")return o;let t=o,n=t.values??[],l=t.texts,s=t.rowLabels??n.map((R,L)=>String(L)),p=t.colLabels??(n[0]??[]).map((R,L)=>String(L)),a=t.ramp??"purple",d=vn[a]??(a[0]==="#"?a:vn.purple),[r,g,f]=qo(d),[x,c]=t.valueDomain??[0,1],k=c-x,$=e?38:255,S=R=>Math.max(0,Math.min(1,R));return{rows:s.map(R=>({label:R})),columns:p.map(R=>({label:R,value:0})),getCellValue:(R,L)=>{let P=n[R]?.[L]??0,w=S(k>0?(P-x)/k:P),A=D=>Math.round($+(D-$)*w);return{text:l?l[R]?.[L]??"":Number.isInteger(P)?String(P):P.toFixed(2),value:P,color:`rgb(${A(r)}, ${A(g)}, ${A(f)})`,textColor:w>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function kn(o,e,t){return Pt(o,n=>{let l=t?.darkMode??Pe(n),s=new je(n,wn(e,l),{darkMode:l,...t}),p=s.setThemeMode.bind(s);return s.setThemeMode=a=>{s.setData(wn(e,a)),p(a)},s},t?.darkMode)}function Mn(o,e,t){return Pt(o,n=>new Ye(n,e,{darkMode:Pe(n),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=yn,window.LinePlotWidget=Ln,window.HeatmapTableWidget=kn,window.ActivationPatchingWidget=Mn);return ro(Ko);})();
//# sourceMappingURL=charts.js.map
