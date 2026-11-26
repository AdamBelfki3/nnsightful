"use strict";var InterpTools=(()=>{var gt=Object.defineProperty;var Jn=Object.getOwnPropertyDescriptor;var eo=Object.getOwnPropertyNames;var to=Object.prototype.hasOwnProperty;var no=(o,e)=>{for(var t in e)gt(o,t,{get:e[t],enumerable:!0})},oo=(o,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of eo(e))!to.call(o,r)&&r!==t&&gt(o,r,{get:()=>e[r],enumerable:!(n=Jn(e,r))||n.enumerable});return o};var io=o=>oo(gt({},"__esModule",{value:!0}),o);var Xo={};no(Xo,{ActivationPatchingWidget:()=>kn,HeatmapTableWidget:()=>Ln,LinePlotWidget:()=>yn,LogitLensWidget:()=>wn,captureElement:()=>Je,snapshotChart:()=>bn});function Gt(o){return o.completion&&o.completion.length?[...o.input,...o.completion]:o.input}function ro(o){let e=o.positions,t=Gt(o).length;if(!e||e.length===t&&e.every((a,d)=>a===d))return{data:o,computedRows:null};let n=new Array(t);e.forEach((a,d)=>{Number.isInteger(a)&&a>=0&&a<t&&d<o.tracked.length&&(n[a]=d)});let r=Array.from({length:t},(a,d)=>d),s=(a,d,l)=>{let g=n[d];return g!==void 0&&a&&g<a.length?a[g]:l()};return{data:{...o,positions:null,tracked:r.map(a=>s(o.tracked,a,()=>({}))),topk:o.topk.map(a=>r.map(d=>s(a,d,()=>[]))),entropy:o.entropy?o.entropy.map(a=>r.map(d=>s(a,d,()=>0))):o.entropy},computedRows:r.filter(a=>n[a]!==void 0)}}function Xt(o){let e=o.computedRows;if(!e)return[];let t=o.tokens.length,n=[],r=0;for(let s of[...e,t])s>r&&n.push({start:r,end:s-1,collapsed:!0,locked:!0,label:"not computed"}),r=s+1;return n}function bt(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:t,computedRows:n}=ro(o),r=t.layers.length,s=Gt(t),p=s.length,a=[];for(let l=0;l<p;l++){let g=[],f=t.tracked[l]??{};for(let x=0;x<r;x++){let c=t.topk[x]?.[l]??[],k=[];for(let S=0;S<c.length;S++){let R=c[S],L=f[R]||[],P=L[x]||0;k.push({token:R,prob:P,trajectory:L})}let $=k[0]||{token:"",prob:0,trajectory:[]};g.push({token:$.token,prob:$.prob,trajectory:$.trajectory,topk:k})}a.push(g)}return{normalized:{layers:t.layers,tokens:s,cells:a,meta:t.meta||{},computedRows:n,sections:t.sections},v2Data:t}}function Yt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function _e(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function lo(o){let e=`#${o}`;return`
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
    `}function qt(o){let e=document.createElement("style");return e.textContent=lo(o),document.head.appendChild(e),e}function xt(o,e,...t){let n=r=>{e?r.classList.add("ll-dark"):r.classList.remove("ll-dark")};n(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let r of t)r&&n(r)}var Ke=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],vt=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var J=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];var se=class se{static compact(e){return e>0&&e<se.COMPACT_BELOW}static margin(e,t,n,r){let s=Math.max(0,t-1)*se.TITLE_LINE;return e?{top:(t>0?32:14)+s+n,right:12,bottom:46,left:Math.max(40,Math.ceil(r)+se.offsets(!0).yLabel+18)}:{top:(t>0?48:24)+s+n,right:24,bottom:56,left:72}}static offsets(e){return e?{title:20,yTitle:2,yLabel:8,xLabel:8,xTitle:14}:{title:28,yTitle:14,yLabel:16,xLabel:12,xTitle:16}}static markerRadius(e){return e<se.MARKERS_OFF_BELOW?0:e<se.MARKERS_SMALL_BELOW?2.5:3.5}static xTicks(e,t,n){if(e<=0)return[];let r=e-1,s=n+se.TICK_GAP,p=Math.max(1,Math.ceil(e/8)),a=t>0?p*Math.max(1,Math.ceil(s/(p*t))):p,d=[];for(let l=0;l<r;l+=a)(r-l)*t>=s&&d.push(l);return d.push(r),d}static wrap(e,t,n,r){let s=e.split(/\s+/).filter(Boolean),p=[],a=0;for(;a<s.length&&p.length<n;){let d=s[a++];if(p.length===n-1)d=s.slice(a-1).join(" "),a=s.length;else for(;a<s.length&&r(`${d} ${s[a]}`)<=t;)d+=` ${s[a++]}`;p.push(se.clip(d,t,r)??d)}return p}static clip(e,t,n,r=3){if(n(e)<=t)return e;for(let s=e.length-1;s>=r;s--){let p=`${e.slice(0,s).trimEnd()}\u2026`;if(n(p)<=t)return p}return null}};se.COMPACT_BELOW=520,se.TITLE_MAX_LINES=2,se.TITLE_LINE=18,se.TICK_GAP=8,se.MARKERS_SMALL_BELOW=9,se.MARKERS_OFF_BELOW=6;var ne=se;var xe=class xe{static labelled(e){return e.some(t=>!!t.label)}static caption(e,t,n){let r=e.toUpperCase();if(n(r)<=t)return r;let s=/^(\S)\D*?(\d+)$/.exec(r);if(!s)return ne.clip(r,t,n);let p=s[1]+s[2];return n(p)<=t?p:null}static captions(e,t,n,r){let s=e.map(f=>f.label?.toUpperCase()??""),p=s.map(f=>f?r(f):0),a=f=>(e[f].x0+e[f].x1)/2,d=f=>e[f].x1-e[f].x0-2*xe.LABEL_INSET,l=e.map((f,x)=>!!s[x]&&p[x]<=d(x)),g=(f,x)=>l[f]?a(f)+(x==="x1"?.5:-.5)*p[f]:s[f]?e[f][x]:e[f][x==="x1"?"x0":"x1"];return e.flatMap((f,x)=>{if(!s[x])return[];if(l[x])return[{text:s[x],x:a(x)}];let c=x===0?t:g(x-1,"x1")+xe.LABEL_GAP,k=x===e.length-1?n:g(x+1,"x0")-xe.LABEL_GAP;if(p[x]<=k-c){let S=p[x]/2;return[{text:s[x],x:Math.min(k-S,Math.max(c+S,a(x)))}]}let $=xe.caption(f.label,d(x),r);return $?[{text:$,x:a(x)}]:[]})}static labelAt(e,t){return e?.find(n=>n.start<=t&&t<=n.end)?.label}static layout(e,t,n,r,s){if(n<=t)return[];let p=r+s,a=d=>Math.min(p,Math.max(r,r+(d-t)/(n-t)*s));return e.flatMap((d,l)=>{let g=a(d.start-.5),f=a(d.end+.5);if(f<=g)return[];let x=(d.dividers??[]).filter(c=>c>d.start&&c<=d.end).map(c=>a(c-.5)).filter(c=>c>g&&c<f);return[{x0:g,x1:f,label:d.label,tinted:l%2===1,dividers:x}]})}static draw(e,t,n,r,s,p){if(t.length===0)return;e.save(),e.fillStyle=s?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)";for(let d of t)d.tinted&&e.fillRect(d.x0,n,d.x1-d.x0,r);e.strokeStyle=s?"rgba(255,255,255,0.14)":"rgba(0,0,0,0.12)",e.lineWidth=1,e.setLineDash([2,3]);for(let d of t.flatMap(l=>l.dividers))e.beginPath(),e.moveTo(Math.round(d)+.5,n),e.lineTo(Math.round(d)+.5,n+r),e.stroke();e.setLineDash([]),e.fillStyle=s?"#71717a":"#a1a1aa",e.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",e.textAlign="center",e.textBaseline="bottom";let a=xe.captions(t,xe.LABEL_INSET,p-xe.LABEL_INSET,d=>e.measureText(d).width);for(let d of a)e.fillText(d.text,d.x,n-5);e.restore()}};xe.LABEL_ROOM=16,xe.LABEL_GAP=6,xe.LABEL_INSET=2;var Te=xe;function Be(o){return o.richLines&&o.richLines.length>0?o.richLines.map((t,n)=>({values:t.values,label:t.label??`Line ${n+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(o.lines??[]).map((t,n)=>({values:t,label:o.labels?.[n]??`Line ${n+1}`}))}function ze(o){if(!o)return"";let e=[],t=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let n="";for(;t<o.length;t++){let r=o[t];r===`
`?(n&&(e.push(tt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=r}return n&&e.push(tt(n)),e.join("")}function tt(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function so(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(o<=t)return t;return 1}function Kt(o,e,t){let n=Be(o),r=n.length>0?n[0].values.length:t?.values.length??o.xLabels?.length??0;if(r===0)return null;let s=e.mode||"probability",p=e.minValue,a=e.maxValue;if(p===void 0||a===void 0||e.autoScale){let d=[];for(let f of n)if(!f.isOverlay)for(let x of f.values)x!==null&&d.push(x);if(t)for(let f of t.values)f!==null&&d.push(f);if(d.length===0)return{numLayers:r,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let l=1/0,g=-1/0;for(let f of d)f<l&&(l=f),f>g&&(g=f);if(e.centerYAxisAtZero){let x=Math.max(Math.abs(l),Math.abs(g))*1.1;p=-x,a=x}else if(e.logScale){if(p===void 0&&(p=Math.max(1,Math.floor(l))),a===void 0||e.autoScale){let f=Math.log(Math.max(1,l)),x=Math.log(Math.max(1,g)),c=x+.15*Math.max(1,x-f);a=Math.ceil(Math.exp(c))}}else p===void 0&&(p=s==="probability"?0:s==="rank"?Math.max(1,Math.floor(l)):Math.floor(l*.9)),(a===void 0||e.autoScale)&&(s==="rank"?a=Math.ceil(g*1.1):s==="probability"?a=e.autoScale?so(Math.max(g,.001)):Math.min(g*1.1,1):a=g*1.1)}return{numLayers:r,minValue:p,maxValue:a,numLines:n.length}}function Qt(o,e,t,n,r,s,p,a,d=!1){let l=o.getContext("2d"),g=e.getBoundingClientRect(),f=n.pixelRatio??(window.devicePixelRatio||1);o.width=g.width*f,o.height=g.height*f,o.style.width=`${g.width}px`,o.style.height=`${g.height}px`,l.scale(f,f);let x=g.width,c=g.height,k=n.darkMode??!1,$=n.title,S=n.mode||"probability",R=n.invertYAxis??!1,L=n.centerYAxisAtZero??!1,P=n.logScale??!1,w=n.xAxisLabel||"Layer",A=n.yAxisLabel||"Probability",T=n.xRangeStart??0;T>=r.numLayers-1&&(console.warn(`xRangeStart (${T}) is >= numLayers-1 (${r.numLayers-1}), clamping to 0`),T=0);let D=n.showDataPoints??!0,O=t.sections??[],G={title:"500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",tick:"400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",axis:"500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"},W=ne.offsets(d),oe=b=>l.measureText(b).width,B=P?Math.log(Math.max(1,r.minValue)):0,me=P?Math.log(Math.max(1,r.maxValue)):0,ie=[],pe=r.maxValue-r.minValue,re=5;if(P){let b=new Set;for(let Y=0;Y<re;Y++){let Q=B+Y/(re-1)*(me-B),Z=Math.round(Math.exp(Q));b.has(Z)||(b.add(Z),ie.push(Z))}let H=Math.round(Math.exp(B)),U=Math.round(Math.exp(me));b.has(H)||ie.unshift(H),b.has(U)||ie.push(U)}else if(S==="rank")for(let b=0;b<re;b++)ie.push(Math.round(r.minValue+b/(re-1)*pe));else for(let b=0;b<re;b++)ie.push(r.minValue+b/(re-1)*pe);let De=ie.map(b=>S==="probability"?b.toFixed(2):S==="prob_diff"?b>=0?`+${b.toFixed(2)}`:b.toFixed(2):Math.round(b).toString());l.font=G.tick;let fe=Math.max(0,...De.map(oe)),he=Te.labelled(O)?Te.LABEL_ROOM:0,ke=ne.margin(d,0,he,fe);l.font=G.title;let ue=$?ne.wrap($,x-ke.left-8,ne.TITLE_MAX_LINES,oe):[],m=ne.margin(d,ue.length,he,fe),C=x-m.left-m.right,M=c-m.top-m.bottom,_={margin:m,chartWidth:C,chartHeight:M,width:x,height:c},N={background:k?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:k?"#52525b":"#a1a1aa",grid:k?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:k?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:k?"#e4e4e7":"#27272a"};n.transparentBackground?l.clearRect(0,0,x,c):(l.fillStyle=N.background,l.fillRect(0,0,x,c)),l.fillStyle=N.titleText,l.font=G.title,l.textAlign="left",ue.forEach((b,H)=>{l.fillText(b,m.left,W.title+H*ne.TITLE_LINE)});let V=r.numLayers-1-T,we=b=>V<=0?m.left+C/2:m.left+(b-T)/V*C,ee=b=>{let H;if(P){let U=Math.log(Math.max(1,b));H=me-B>0?(U-B)/(me-B):.5}else H=(b-r.minValue)/(r.maxValue-r.minValue);return R?m.top+H*M:m.top+M-H*M};if(Te.draw(l,Te.layout(O,T,r.numLayers-1,m.left,C),m.top,M,k,x),l.setLineDash([4,4]),l.strokeStyle=N.grid,l.lineWidth=1,ie.forEach(b=>{let H=ee(b);l.beginPath(),l.moveTo(m.left,H),l.lineTo(m.left+C,H),l.stroke()}),l.setLineDash([]),L){let b=ee(0);l.beginPath(),l.strokeStyle=k?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",l.lineWidth=1.5,l.moveTo(m.left,b),l.lineTo(m.left+C,b),l.stroke(),l.lineWidth=1}l.fillStyle=N.text,l.font=G.tick,l.textAlign="right",l.textBaseline="middle",ie.forEach((b,H)=>{l.fillText(De[H],m.left-W.yLabel,ee(b))}),l.textAlign="center",l.textBaseline="top";let te=b=>String(t.xLabels?.[b]??b),Ee=V>0?C/V:1/0,F=Math.max(0,...Array.from({length:r.numLayers},(b,H)=>oe(te(H))));for(let b of ne.xTicks(r.numLayers,Ee,F)){let H=we(b);H<m.left-5||H>m.left+C+5||l.fillText(te(b),H,m.top+M+W.xLabel)}l.strokeStyle=k?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",l.lineWidth=1.5,l.beginPath(),l.moveTo(m.left,m.top),l.lineTo(m.left,m.top+M),l.lineTo(m.left+C,m.top+M),l.stroke(),l.fillStyle=N.textMuted,l.font=G.axis,l.textAlign="center",l.textBaseline="top",l.fillText(w.toUpperCase(),m.left+C/2,c-W.xTitle),l.save(),l.translate(W.yTitle,m.top+M/2),l.rotate(-Math.PI/2),l.textAlign="center",l.textBaseline="top",l.fillText(A.toUpperCase(),0,0),l.restore();let X=Be(t);function Me(b,H,U,Y,Q){l.beginPath(),l.strokeStyle=H,l.lineWidth=U,Q!==void 0&&(l.globalAlpha=Q),Y?l.setLineDash(Y.split(",").map(Number)):l.setLineDash([]);let Z=!1;for(let $e=0;$e<b.length;$e++){let Se=b[$e];if(Se===null){Z=!1;continue}let Ie=we($e),Ae=ee(Se);Z?l.lineTo(Ie,Ae):(l.moveTo(Ie,Ae),Z=!0)}l.stroke(),l.setLineDash([]),Q!==void 0&&(l.globalAlpha=1)}let Fe=ne.markerRadius(Ee),ae=k?"#3f3f46":"#d4d4d8";if(l.lineCap="round",l.lineJoin="round",X.forEach((b,H)=>{!s.has(H)||b.isOverlay||Me(b.values,ae,2,void 0,.35)}),X.forEach((b,H)=>{if(s.has(H)||b.isOverlay)return;let U=b.color??J[H%J.length];Me(b.values,U,4,b.dashPattern,.15),Me(b.values,U,2,b.dashPattern),D&&b.values.forEach((Y,Q)=>{if(Y===null)return;let Z=p?.lineIdx===H&&p?.layerIdx===Q,$e=b.values[Q-1]==null&&b.values[Q+1]==null,Se=Z?5:Fe||($e?2:0);if(Se===0)return;let Ie=we(Q),Ae=ee(Y);l.beginPath(),l.strokeStyle=U,l.lineWidth=Z?2:1.5,l.arc(Ie,Ae,Se,0,Math.PI*2),l.stroke(),l.beginPath(),l.fillStyle=k?"#18181b":"#ffffff",l.arc(Ie,Ae,Se-(Z?1.5:1),0,Math.PI*2),l.fill()})}),X.forEach((b,H)=>{if(!b.isOverlay||s.has(H))return;let U=b.color??"#999";Me(b.values,U,1.5,b.dashPattern??"4,2",.7)}),a){let b=a.color??"#999";Me(a.values,b,1.5,a.dashPattern??"4,2",.7)}return _}function Zt(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function Jt(o,e,t,n,r,s,p,a,d){let{margin:l,chartWidth:g,chartHeight:f}=r,x=n.xRangeStart??0,c=p-1-x,k=n.logScale?Math.log(Math.max(1,a)):0,$=n.logScale?Math.log(Math.max(1,d)):0;if(o<l.left||o>l.left+g||e<l.top||e>l.top+f)return null;let S=Be(t),R=null,L=1/0,P=20;for(let w=0;w<S.length;w++){if(s.has(w))continue;let A=S[w];if(!A.isOverlay)for(let T=0;T<A.values.length;T++){let D=A.values[T];if(D===null)continue;let O=c<=0?l.left+g/2:l.left+(T-x)/c*g,G;if(n.logScale){let B=Math.log(Math.max(1,D));G=$-k>0?(B-k)/($-k):.5}else G=(D-a)/(d-a);let W=n.invertYAxis?l.top+G*f:l.top+f-G*f,oe=Math.sqrt((o-O)**2+(e-W)**2);oe<L&&oe<P&&(L=oe,R={visible:!0,x:O,y:W,lineIdx:w,layerIdx:T,value:D,label:A.label,color:A.color??J[w%J.length]})}}return R}function wt(o,e,t,n,r,s,p,a){if(!e){o.style.opacity="0";return}let d=n?"#27272a":"#fff",l=n?"#3f3f46":"#e4e4e7",g=n?"#fafafa":"#18181b",f=n?"#a1a1aa":"#71717a",c=e.x>t/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${c},-50%);`;let k=String(r?r[e.layerIdx]??e.layerIdx:e.layerIdx),$=Te.labelAt(a,e.layerIdx),S=$?`<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px;">
                    <span style="color:${f}">Section</span>
                    <span style="font-weight:500;color:${g}">${tt($)}</span>
                </div>`:"";o.innerHTML=`
        <div style="background:${d};border:1px solid ${l};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
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
        </div>`}var ao='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',co='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',po='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function en(o,e=!1){let t=document.createElement("div");return tn(t,o,e),t}function tn(o,e,t){if(t){o.style.cssText="flex-shrink:0;order:-1;display:flex;flex-direction:row;flex-wrap:wrap;gap:0 2px;padding:0 2px;";return}let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",r=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${r};align-self:flex-start;`}function nn(o,e,t,n,r,s,p=!1){tn(o,n,p),o.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",d=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",l=n?"#a1a1aa":"#71717a",g=n?"#3f3f46":"#d4d4d8",f="rgba(161,161,170,0.3)",x=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",c=s?Be(s):[];e.forEach((k,$)=>{let S=c[$];if(S?.isOverlay)return;let R=S?.color??J[$%J.length],L=t.has($),P=S?.removable??!1,w=document.createElement(r?"button":"div");w.style.cssText=`display:flex;align-items:center;gap:${p?6:8}px;padding:${p?"3px 6px":"4px 8px"};border-radius:4px;border:none;background:transparent;cursor:${r?"pointer":"default"};transition:all 0.15s;opacity:${L?"0.5":"1"};`,r&&(w.addEventListener("mouseenter",()=>{w.style.background=x}),w.addEventListener("mouseleave",()=>{w.style.background="transparent"}),w.addEventListener("click",()=>r.onToggle($)));let A=document.createElement("span");A.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${L?f:R};background:${L?g:"transparent"};`,w.appendChild(A);let T=document.createElement("span");if(T.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:${p?120:72}px;transition:color 0.15s;color:${L?d:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,T.title=k,T.innerHTML=ze(k),w.appendChild(T),!r){o.appendChild(w);return}if(P&&r.onRemove){let D=document.createElement("span");D.style.cssText=`margin-left:auto;cursor:pointer;color:${l};opacity:${p?.6:0};display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,D.innerHTML=po,D.title="Remove",D.addEventListener("click",O=>{O.stopPropagation(),r.onRemove($)}),w.appendChild(D),w.addEventListener("mouseenter",()=>{D.style.opacity="0.6"}),w.addEventListener("mouseleave",()=>{D.style.opacity=p?"0.6":"0"})}else if(!p||L){let D=document.createElement("span");D.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${l};opacity:${L?"0.6":"0"};display:flex;align-items:center;`,D.innerHTML=L?co:ao,w.appendChild(D),L||(w.addEventListener("mouseenter",()=>{D.style.opacity="0.4"}),w.addEventListener("mouseleave",()=>{D.style.opacity="0"}))}o.appendChild(w)})}var Re=class{constructor(e,t,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.compact=!1;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;this.tooltip=Jt(n,r,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),wt(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode,this.data.sections),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,wt(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...n},this.compact=ne.compact(e.clientWidth),e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),this.arrange(),e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;",e.appendChild(this.chartContainer);let r=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${r?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=Zt(this.chartContainer),this.legendEl=en(this.options.darkMode??!1,this.compact),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),r&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(s=>{if(!this.destroyed)for(let p of s){if(p.target===this.container){this.fit(p.contentRect.width);continue}let a=Math.round(p.contentRect.width),d=Math.round(p.contentRect.height);a===this.lastWidth&&d===this.lastHeight||(this.lastWidth=a,this.lastHeight=d,this.draw())}}),this.resizeObserver.observe(this.chartContainer),this.resizeObserver.observe(this.container),this.draw(),this.updateLegendUI()}fit(e){let t=ne.compact(e);t!==this.compact&&(this.compact=t,this.arrange(),this.draw(),this.updateLegendUI())}arrange(){this.container.style.flexDirection=this.compact?"column":"row",this.container.style.gap=this.compact?"4px":"12px"}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=Kt(this.data,this.options,this.overlay),this.config&&(this.geometry=Qt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay,this.compact))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let t=this.options.interactive===!1?null:{onToggle:n=>this.toggleLine(n),onRemove:this.options.onLineRemoved?n=>{this.removeLine(n,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(n)}:void 0};nn(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,t,this.data,this.compact)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,n)=>({values:t,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let r of this.hiddenLines)r<e?n.add(r):r>e&&n.add(r-1);this.hiddenLines=n,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function ve(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function nt(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+ve(o.slice(1)):ve(o)}function ho(o){let e=`#${o}`;return`
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
    `}function on(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=ho(o),document.head.appendChild(e),e}var uo=0,Qe=16,yt=20,rn=7,Ue=class o{constructor(e,t,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.windowPlan=[];this.windowYs=[];this.windowHs=[];this.windowFrom=-1;this.lastWindowKey="";this.windowScrollTimer=null;this.onWindowScroll=()=>{this.windowPlan.length&&(this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.windowScrollTimer=setTimeout(()=>{if(this.windowScrollTimer=null,this.destroyed||!this.windowPlan.length)return;let e=this.scrollEl.scrollTop,t=this.windowYs.findIndex((s,p)=>s+this.windowHs[p]/2>e);t<0&&(t=this.windowYs.length-1);let{from:n,to:r}=o.windowItems(this.windowHs,t,this.options.rowWindow.height);Math.abs(this.scrollEl.scrollTop-this.windowYs[n])>1&&(this.scrollEl.scrollTop=this.windowYs[n]),this.windowFrom=n,this.reportWindow(this.windowPlan,n,r,"scroll")},150))};this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...n},this.uid="hmx_"+ ++uo+"_"+Date.now().toString(36),this.styleEl=on(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`.trim(),this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.scrollEl.addEventListener("scroll",this.onWindowScroll),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let n=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-n)),size:n}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,n=e.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/t),s=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(s,r))}resolveVisibleColumns(){let e=this.options,{start:t,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let g=[];for(let f=0;f<n;f++)g.push(t+f);return g}let r=this.maxColsFit();if(n<=r){let g=[];for(let f=0;f<n;f++)g.push(t+f);return g}let s=!!e.alwaysShowLastColumn,p=Math.max(1,r-(s?1:0)),a=Math.ceil(n/p),d=[];for(let g=t;g<t+n;g+=a)d.push(g);let l=t+n-1;return s&&d[d.length-1]!==l&&d.push(l),d}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let n=t.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/e);return Math.max(t.minColumnWidth??1,r)}return t.cellWidth??48}resolveRowHeight(e,t=0){let n=this.options,r=n.cellHeight??28;if(n.rowSizing!=="fill"||e<=0)return r;let s=this.scrollEl.clientHeight-t;return e*r<s?Math.floor(s/e):r}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=this.isInteractive();this.root.classList.toggle("hmx-static",!n);let r=e.rowHeaderWidth??100,s=e.headerHeight??26,p=this.data.columns,a=this.resolveVisibleColumns(),d=a.length,l=this.resolveCellWidth(d),g=this.data.rows,f=e.maxRows!=null?Math.min(g.length,e.maxRows):g.length,x=o.planRows(f,e.collapsedSections),c=0,k=0;for(let m of x)m.kind==="row"?c++:m.kind==="band"?k+=Qe:n&&(k+=yt);let $=this.resolveRowHeight(c,k),S=r+l*d,R=x.map(m=>m.kind==="row"?$:m.kind==="band"?Qe:n?yt:0),L=null;if(e.rowWindow&&R.reduce((m,C)=>m+C,0)>e.rowWindow.height){let m=x.findIndex(C=>o.itemRows(C)[1]>=e.rowWindow.start);L=o.windowItems(R,m<0?x.length-1:m,e.rowWindow.height)}let P=!!L&&e.rowWindowMode==="scroll",w=L&&!P?x.slice(L.from,L.to):x,A=w.filter(m=>m.kind==="row"),T=L&&!P?A[0]?.row??-1:0,D=L&&!P?A[A.length-1]?.row??-1:f-1,O=`${r}px repeat(${d}, ${l}px)`,G=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",W=o.columnSpans(a,e.columnSections??[]),oe=new Set(W.map(m=>m.from).filter(m=>m>0)),B="";if(W.length>0){B+=`<div class="hmx-sec-row" style="display:grid;grid-template-columns:${O};width:${S}px;min-width:${S}px;">`;for(let m of W){let C=m.parts.map(M=>`<i style="flex:${M}"></i>`).join("");B+=`<div class="hmx-sec" style="grid-row:1;grid-column:${m.from+2} / span ${m.to-m.from+1};"><span class="hmx-sec-label">${ve(m.label??"")}</span><span class="hmx-sec-rule">${C}</span></div>`}B+="</div>"}B+=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${O};height:${s}px;width:${S}px;min-width:${S}px;">`,B+=`<div class="hmx-corner">${ve(e.cornerLabel??"")}</div>`;for(let m=0;m<d;m++)B+=`<div class="hmx-col">${nt(p[a[m]].label)}</div>`;B+="</div>",this.hdrEl.innerHTML=B;let me={};for(let m of e.rowHighlights??[]){let C=new Set(m.rows);for(let M of m.rows){let _=!C.has(M-1);me[M]={color:m.color,className:m.className,top:_,bottom:!C.has(M+1),label:_?m.label:void 0}}}this.lastRowH=$;let ie=m=>{let C=g[m].label,M=e.rowClassName?.(m),_=me[m],N=_?" hmx-row-hl"+(_.top?" hmx-hl-top":"")+(_.bottom?" hmx-hl-bottom":"")+(_.className?" "+_.className:""):"",V=_?(_.color?` style="--hmx-hl:${ve(_.color)}"`:"")+(_.label?` data-hl-label="${ve(_.label)}"`:""):"",we=e.renderRowLabel?e.renderRowLabel(m):`<span class="hmx-cell-text">${nt(C)}</span>`,ee=`<div class="hmx-row${M?" "+M:""}${N}" data-rowwrap="${m}"${V}>`;ee+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${O};height:${$}px;">`,ee+=`<div class="hmx-rowlabel" data-row="${m}" title="${ve(C)}">${we}</div>`;for(let te=0;te<d;te++){let Ee=a[te],F=this.data.getCellValue(m,Ee),X=F.highlighted&&F.highlightColor?`box-shadow:inset 0 0 0 2px ${F.highlightColor};`:"",Me=F.bold?"font-weight:bold;":"",Fe=F.opacity!=null&&F.opacity<1?`opacity:${F.opacity};`:"",ae=m===T,b=m===D,H=te===0,U=te===d-1,Y="";ae&&H?Y="border-top-left-radius:8px;":ae&&U?Y="border-top-right-radius:8px;":b&&H?Y="border-bottom-left-radius:8px;":b&&U&&(Y="border-bottom-right-radius:8px;");let Q=oe.has(te)?" hmx-sec-start":"";ee+=`<div class="hmx-cell${Q}${F.className?" "+F.className:""}" data-row="${m}" data-col="${Ee}" style="background:${F.color};color:${F.textColor};padding:0 6px;${Fe}${G}${X}${Me}${Y}"><span class="hmx-cell-text">${nt(F.text)}</span></div>`}return ee+="</div></div>",ee},pe=(e.rowRegions??[]).filter(m=>m.start<=m.end),re=pe.map(()=>({top:-1,bottom:-1})),De=(m,C,M,_)=>{for(let N=0;N<pe.length;N++)C>=pe[N].start&&m<=pe[N].end&&(re[N].top<0&&(re[N].top=M),re[N].bottom=_)},fe=`<div class="hmx-grid-inner" style="width:${S}px;min-width:${S}px;">`,he=0,ke=[];for(let m of w){if(ke.push(he),m.kind==="band"){let C=m.end-m.start+1,M,_=!1;for(let te=m.start;te<=m.end;te++)if(me[te]){_=!0,M=me[te].color;break}let N=C===1?"":"s",V=`${C} row${N} ${ve(m.label??"hidden")}`,we="hmx-collapsed"+(m.locked?" hmx-collapsed-locked":"")+(_?" hmx-collapsed-hl":""),ee=n&&!m.locked;fe+=`<div class="${we}"${ee?` data-cs="${m.index}"`:""} data-count="${m.shown}" style="width:${S}px;min-width:${S}px;height:${Qe}px;${M?`--hmx-hl:${ve(M)};`:""}" title="${ee?`Click to show ${C} hidden row${N}`:V}"><span class="hmx-collapsed-inner">\u2026 ${V}</span></div>`,De(m.start,m.end,he,he+Qe),he+=Qe;continue}if(m.kind==="handle"){if(!n)continue;let C=m.end-m.start+1;fe+=`<div class="hmx-expanded-toggle" data-cs="${m.index}" data-count="${m.shown}" style="width:${S}px;min-width:${S}px;" title="Collapse these ${C} rows"><span>\u2303 collapse ${C} row${C===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,he+=yt;continue}fe+=ie(m.row),De(m.row,m.row,he,he+$),he+=$}for(let m=0;m<pe.length;m++){let C=re[m];if(C.top<0||C.bottom<=C.top)continue;let M=pe[m],_=M.color?`--hmx-region:${ve(M.color)};`:"",N=C.top+rn,V=Math.max(0,C.bottom-C.top-2*rn);V<=0||(fe+=`<div class="hmx-region-rail" style="top:${N}px;height:${V}px;${_}"></div>`,M.label&&(fe+=`<div class="hmx-region-label" style="top:${N}px;height:${V}px;${_}">${ve(M.label)}</div>`))}fe+="</div>";let ue=this.scrollEl.scrollTop;if(this.scrollEl.innerHTML=fe,this.root.classList.toggle("hmx-window-scroll",P),this.root.classList.toggle("hmx-window-inert",P&&e.rowWindowScrollable===!1),this.scrollEl.style.maxHeight=P?`${e.rowWindow.height}px`:"",this.windowPlan=P?x:[],this.windowYs=P?ke:[],this.windowHs=P?R:[],P?(L.from!==this.windowFrom?this.scrollEl.scrollTop=ke[L.from]:this.scrollEl.scrollTop=ue,this.windowFrom=L.from):this.windowFrom=-1,L?this.reportWindow(x,L.from,L.to,"render"):e.rowWindow&&this.reportWindow(x,-1,-1,"render"),this.pendingScroll){let{scrollBefore:m,bandTop:C,delta:M}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,C<m?m+M:m)}e.onVisibleColumnsChange&&!mo(a,this.lastVisibleCols)?(this.lastVisibleCols=a,e.onVisibleColumnsChange(a)):this.lastVisibleCols=a}reportWindow(e,t,n,r){let s=t<0?null:{start:o.itemRows(e[t])[0],end:o.itemRows(e[n-1])[1]},p=s?`${s.start}-${s.end}`:"none";p!==this.lastWindowKey&&(this.lastWindowKey=p,this.options.onRowWindowChange?.(s,r))}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,n=t.closest(".hmx-collapsed, .hmx-expanded-toggle");if(n){if(n.dataset.cs===void 0)return;let p=parseInt(n.dataset.cs);if(t.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:-n.offsetHeight},this.options.onRemoveCollapse?.(p);return}let a=parseInt(n.dataset.count||"0"),d=n.classList.contains("hmx-collapsed"),l=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:d?a*l:-a*l},this.options.onToggleCollapse?.(p);return}let r=t.closest(".hmx-rowlabel");if(r){this.options.onRowHeaderClick?.(parseInt(r.dataset.row),e);return}let s=t.closest(".hmx-cell");s&&this.options.onCellClick?.(parseInt(s.dataset.row),parseInt(s.dataset.col),e)})}static columnSpans(e,t=[]){let n=[];for(let r of t){let s=e.map((d,l)=>({column:d,display:l})).filter(({column:d})=>d>=r.start&&d<=r.end);if(s.length===0)continue;let p=(r.dividers??[]).filter(d=>d>r.start&&d<=r.end),a=new Array(p.length+1).fill(0);for(let{column:d}of s)a[p.filter(l=>l<=d).length]++;n.push({label:r.label,from:s[0].display,to:s[s.length-1].display,parts:a.filter(d=>d>0)})}return n}static itemRows(e){return e.kind==="row"?[e.row,e.row]:[e.start,e.end]}static windowItems(e,t,n){let r=e.length;if(r===0)return{from:0,to:0};let s=r;for(let d=0;s>0&&d+e[s-1]<=n;)d+=e[--s];let p=Math.max(0,Math.min(t,s,r-1)),a=p;for(let d=0;a<r&&(a===p||d+e[a]<=n);)d+=e[a++];return{from:p,to:a}}static planRows(e,t=[]){let n=t.map((d,l)=>({start:Math.max(0,d.start),end:Math.min(e-1,d.end),collapsed:d.collapsed!==!1,locked:!!d.locked,label:d.label,index:l})).filter(d=>d.start<=d.end),r=new Array(e);for(let d of n)if(d.locked)for(let l=d.start;l<=d.end;l++)r[l]??(r[l]=d);let s=(d,l)=>{let g=0;for(let f=d;f<=l;f++)r[f]||g++;return g},p=new Map;for(let d of n)d.locked||s(d.start,d.end)===0||p.has(d.start)||p.set(d.start,d);let a=[];for(let d=0;d<e;){let l=p.get(d);if(l?.collapsed){a.push({kind:"band",start:l.start,end:l.end,index:l.index,locked:!1,label:l.label,shown:s(l.start,l.end)}),d=l.end+1;continue}l&&a.push({kind:"handle",start:l.start,end:l.end,index:l.index,shown:s(l.start,l.end)});let g=r[d];if(g){let f=d;for(;f+1<e&&r[f+1]===g&&!p.has(f+1);)f++;a.push({kind:"band",start:d,end:f,index:g.index,locked:!0,label:g.label,shown:0}),d=f+1;continue}a.push({kind:"row",row:d}),d++}return a}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let n=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.scrollEl.removeEventListener("scroll",this.onWindowScroll),this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function mo(o,e){if(o.length!==e.length)return!1;for(let t=0;t<o.length;t++)if(o[t]!==e[t])return!1;return!0}function Lt(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let n=t[1],r,s,p,a=1;return n.length===3||n.length===4?(r=parseInt(n[0]+n[0],16),s=parseInt(n[1]+n[1],16),p=parseInt(n[2]+n[2],16),n.length===4&&(a=parseInt(n[3]+n[3],16)/255)):(r=parseInt(n.slice(0,2),16),s=parseInt(n.slice(2,4),16),p=parseInt(n.slice(4,6),16),n.length===8&&(a=parseInt(n.slice(6,8),16)/255)),[r,s,p,a]}return null}function kt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function fo(o){let e=o;for(;e;){let t=kt(Lt(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let n=kt(Lt(getComputedStyle(t).backgroundColor));if(n!==null)return n}return null}function go(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=kt(Lt(e));return t===null?null:t<.5}function ot(o,e){let t=Pe(o),n=()=>{let p=Pe(o);p!==t&&(t=p,e(p))},r=new MutationObserver(n);typeof document<"u"&&(r.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&r.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let s=null;return typeof window<"u"&&window.matchMedia&&(s=window.matchMedia("(prefers-color-scheme: dark)"),s.addEventListener("change",n)),()=>{r.disconnect(),s?.removeEventListener("change",n)}}function Pe(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=go();if(e!==null)return e;let t=fo(o??null);return t!==null?t<.5:!1}var bo=60,ln=30,xo=22,vo=48,wo=18,sn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},yo="#cc6622";function Lo(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var an=41;function Mt(o,e,t){let[n,r,s]=Lo(e),p=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(t){let d=l=>Math.round(an+(l-an)*p);return`rgb(${d(n)}, ${d(r)}, ${d(s)})`}let a=d=>Math.round(255-(255-d)*p);return`rgb(${a(n)}, ${a(r)}, ${a(s)})`}function ko(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function dn(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+_e(o.slice(1)):_e(o)}function Ne(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function it(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function cn(o,e,t,n){let r=Yt(),s=n?.interactive!==!1,p=s||n?.layerNavigator!==!1,a;if(typeof o=="string"?a=document.querySelector(o):o instanceof Element?a=o:a=null,!a)return console.error("Container not found:",o),null;let d=bt(e),l=d.normalized,g=d.v2Data,f=qt(r);function x(i){return i?i.map(h=>({token:h.tokens?.[0]??"",color:h.color})).filter(h=>h.token!==""):[]}let c={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??l.layers.length,darkModeOverride:t?.darkMode??null,pinned:x(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:t?.colorIndex??0,openPopup:null,rowHighlights:t?.rowHighlights??[],collapsedSections:(t?.collapsedSections??[]).map(i=>({...i})),rowStart:t?.rowStart??null},k=null,$=!s&&!!n?.maxRows&&n.maxRows>0,S=null,R=n?.scrollRowsActive!==!1,L={};function P(i,h){(L[i]||[]).forEach(u=>u(h))}let w=l.layers.length,A=l.tokens.length,T=[],D="",O=new Set,G=[];function W(i){return i>=0&&i<A&&!O.has(i)}function oe(){w=l.layers.length,A=l.tokens.length,G=Xt(l),O=new Set;for(let v of G)for(let y=v.start;y<=v.end;y++)O.add(y);T=[];for(let v=0;v<w;v++){let y=0;for(let E=0;E<A;E++){let I=l.cells[E]?.[v];I&&I.prob>y&&(y=I.prob)}T.push(y)}let i=l.computedRows,h=i?i[i.length-1]??-1:A-1;D=l.cells[h]?.[w-1]?.token??"",c.pinnedRows=c.pinnedRows.filter(W),c.selectedRow!==null&&!W(c.selectedRow)&&(c.selectedRow=null),(c.viewSize>w||c.viewSize<1)&&(c.viewSize=w);let u=Math.max(0,w-c.viewSize);c.viewStart>u&&(c.viewStart=u),c.viewStart<0&&(c.viewStart=0)}oe();function B(i){let h=c.pinned.find(u=>u.token===i);return h?h.color:null}function me(i){let h=c.pinned.findIndex(u=>u.token===i);h>=0?c.pinned.splice(h,1):(c.pinned.push({token:i,color:Ke[c.colorIndex%Ke.length]}),c.colorIndex++)}function ie(i,h){let u=g?.tracked?.[i];if(u&&Array.isArray(u[h]))return u[h];for(let v=0;v<w;v++){let y=l.cells[i]?.[v]?.topk.find(E=>E.token===h);if(y)return y.trajectory}return null}function pe(i){let h=c.pinnedRows.indexOf(i);return vt[(h<0?0:h)%vt.length]}function re(i){return c.pinnedRows.indexOf(i)>=0}function De(i,h){for(let u of c.pinned){let v=ie(i,u.token);if(!v)continue;let y=0;for(let E of v)E!=null&&E>y&&(y=E);if(y>=h)return!0}return!1}function fe(i){let h=null,u=0;for(let v=0;v<w;v++){let y=l.cells[i]?.[v];y&&y.prob>u&&(u=y.prob,h=y.token)}return u>=.05?h:null}function he(i){if(!W(i))return;let h=c.pinnedRows.indexOf(i);if(h>=0){c.pinnedRows.splice(h,1);return}if(!De(i,.01)){let u=fe(i);u&&!B(u)&&(c.pinned.push({token:u,color:Ke[c.colorIndex%Ke.length]}),c.colorIndex++)}c.pinnedRows.push(i)}function ke(){return sn[c.ramp]||sn.purple}function ue(){return c.darkModeOverride!==null?c.darkModeOverride:Pe(a)}let m=[];function C(){return m.length>1?Math.max(1,m[1]-m[0]):1}a.innerHTML=`
        <div id="${r}"${s?' tabindex="-1"':' class="ll-static"'}>
            <div class="ll-heatmap" id="${r}_heatmap"${s?' tabindex="0"':""}></div>
            <div class="ll-nav${p?"":" ll-hidden"}" id="${r}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${r}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${r}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${r}_lp_box"><div class="ll-lineplot" id="${r}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${r}_tt"></div>
            <div class="ll-popup" id="${r}_popup">
                <span class="ll-popup-close" id="${r}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${r}_popup_hdr"></div>
                <div class="ll-popup-body" id="${r}_popup_body"></div>
            </div>
        </div>
    `.trim();let M=document.getElementById(r),_=document.getElementById(r+"_heatmap"),N=document.getElementById(r+"_nav"),V,we=document.getElementById(r+"_lp_wrap"),ee=document.getElementById(r+"_lp_token"),te=document.getElementById(r+"_lp_box"),Ee=document.getElementById(r+"_lp"),F=document.getElementById(r+"_tt"),X=document.getElementById(r+"_popup"),Me=document.getElementById(r+"_popup_hdr"),Fe=document.getElementById(r+"_popup_body");s&&document.body.appendChild(X);let ae=null,b=null,H=!0,U=!1,Y=s?getComputedStyle(M).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",Q=!Y;Q&&M.classList.add("ll-fill");let Z=(()=>{if(!Y||/^(unbounded|none|auto)$/i.test(Y))return null;let i=Y.split("/").map(h=>parseFloat(h.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})();function $e(i,h){let u=h?"#bbb":"#555",v=i?` stroke-dasharray="${_e(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${v}/></svg>`}function Se(){return{rows:l.tokens.map(i=>({label:i})),columns:l.layers.map(i=>({label:String(i),value:0})),getCellValue:(i,h)=>{let u=l.cells[i][h],v=u.prob,y=ue(),E=D!==""&&u.token===D,I=B(u.token),z=v<.18;return{text:u.token,value:v,color:Mt(v,E?yo:ke(),y),textColor:ko(v,y),highlighted:!!I,highlightColor:I??void 0,opacity:c.dimLow&&z?.55:void 0}}}}function Ie(i){let h=l.tokens[i],u=i===c.selectedRow||re(i),v=s?`<span class="ll-fold-handle${k===i?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return re(i)&&(v+=$e(pe(i).dash,ue())),v+=it(h)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${dn(h)}</span>`,v}function Ae(i){return"ll-hmx-row"+(i===c.selectedRow||re(i)?" ll-hmx-active":"")+(Sn(i)?" ll-gen-row":"")}function Mn(){let i=g?.completion;return i&&i.length?l.tokens.length-i.length:l.tokens.length}function Sn(i){return i>=Mn()}function Tn(i,h){let u=Math.min(i,h),v=Math.max(i,h);c.collapsedSections=c.collapsedSections.filter(y=>y.end<u||y.start>v).concat({start:u,end:v,collapsed:!0}).sort((y,E)=>y.start-E.start)}function En(i){k===null?(k=i,j()):k===i?(k=null,j()):(Tn(k,i),k=null,j(),ge())}function Pt(){let i={interactive:s,columnSizing:"fit",minColumnWidth:vo,maxVisibleColumns:wo,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:Ye(c.viewStart),size:c.viewSize},rowSizing:Q?"fill":"fixed",cellHeight:ln,rowHeaderWidth:bo,headerHeight:xo+6,height:Q||Z!=null?"fill":"content",chrome:"none",cornerLabel:"token",columnSections:l.sections,showGrid:c.showGrid,darkMode:ue(),renderRowLabel:Ie,rowClassName:Ae,rowHighlights:c.rowHighlights,collapsedSections:G.length?c.collapsedSections.concat(G):c.collapsedSections,onVisibleColumnsChange:h=>{m=h},...$?{rowWindow:{start:$n(),height:n.maxRows*ln},rowWindowMode:n?.scrollRows?"scroll":"clip",rowWindowScrollable:R,onRowWindowChange:(h,u)=>{S=h?{...h,total:A}:null,u==="scroll"&&h&&(c.rowStart=h.start),P("rowWindowChange",{window:S,source:u})}}:{}};return s?{...i,onToggleCollapse:h=>{let u=c.collapsedSections[h];u&&(u.collapsed=u.collapsed===!1,j(),ge())},onRemoveCollapse:h=>{c.collapsedSections.splice(h,1),j(),ge()},onCellHover:Kn,onCellClick:Qn,onRowHeaderClick:(h,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){En(h);return}he(h),j(),de(),ge()},onCellLeave:()=>{ct(),qn()}}:i}function $n(){if(c.rowStart!=null)return c.rowStart;let i=c.selectedRow??c.pinnedRows[0]??null;return i!=null?Math.max(0,i-Math.floor(n.maxRows/2)):Number.MAX_SAFE_INTEGER}function Cn(){if(Q){let h=a.clientWidth;M.style.width=h>0?h+"px":"100%",M.style.maxWidth="100%",M.style.maxHeight="";return}M.style.width="",M.style.maxWidth="";let i=a.clientWidth||M.clientWidth;if(Z&&i>0){let u=M.offsetHeight-V.getScrollElement().offsetHeight,v=(u>0?u:140)+90;M.style.maxHeight=Math.max(v,Math.round(i*Z))+"px"}else M.style.maxHeight=""}function j(){Cn(),V.setOptions(Pt())}function Ce(){if(!p)return;let i=ke(),h=ue(),u=Ye(c.viewStart),v=C(),y=c.viewSize,E=y>=w,I=Dt(),z=y<=I[0],q='<span class="ll-nav-range-key">layers</span>';E?q+=`all ${w}`+(v>1?`<span class="ll-dim"> \xB7 every ${v}</span>`:""):q+=`${u}\u2013${u+y-1}<span class="ll-dim"> / ${w}</span>`+(v>1?`<span class="ll-dim"> \xB7 \u22481/${v}</span>`:"");let ce="";for(let K=0;K<w;K++){let Ve=T[K]||0,qe=Math.max(8,Math.round(Ve*92));ce+=`<div class="ll-skyline-bar" style="height:${qe}%;background:${Mt(Ve,i,h)}"></div>`}let le=u/w*100,ye=y/w*100,He="";(l.sections??[]).forEach((K,Ve)=>{if(Ve%2===0)return;let qe=K.start/w*100,ft=(K.end-K.start+1)/w*100;He+=`<i style="left:${qe}%;width:${ft}%"></i>`});let be=[];for(let K=0;K<w;K+=8)be.push(K);be[be.length-1]!==w-1&&be.push(w-1);let Le="",We=Math.max(1,w-1);for(let K of be){let Ve=K===w-1,qe=K===0,ft=K/We*100;Le+=`<span class="ll-nav-tick" style="left:${ft}%;transform:${Ve?"translateX(-100%)":qe?"translateX(0)":"translateX(-50%)"}">${l.layers[K]}</span>`}N.innerHTML=`
            <div class="ll-nav-range">${q}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${r}_sky">
                    <div class="ll-skyline-secs">${He}</div>
                    <div class="ll-skyline-bars">${ce}</div>
                    <div class="ll-skyline-win" id="${r}_win" style="left:${le}%;width:${ye}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${Le}</div>
            </div>
            ${s?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${So}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+y>=w?"disabled":""}>${To}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${z?"disabled":""}>${Eo}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${E?"disabled":""}>${$o}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Mo}</button>
            </div>`:""}
        `,s&&Dn()}function Hn(){let i=document.getElementById(r+"_win");if(!i)return;let h=Math.max(0,w-c.viewSize),u=Math.max(0,Math.min(h,c.viewStart));i.style.left=u/w*100+"%",i.style.width=c.viewSize/w*100+"%"}function Dt(){return Array.from(new Set([w,48,32,20,14,10,8])).filter(i=>i<=w&&i>=1).sort((i,h)=>i-h)}function Ye(i){return Math.max(0,Math.min(Math.max(0,w-c.viewSize),i))}let lt=!1;function It(){lt||(lt=!0,requestAnimationFrame(()=>{lt=!1,!U&&(j(),Hn())}))}function st(i){let h=Ye(c.viewStart+i);h!==c.viewStart&&(c.viewStart=h,j(),Ce(),ge())}function Rn(i){let h=Ye(i);h!==c.viewStart&&(c.viewStart=h,It())}function At(i,h){let u=Dt(),v=u.findIndex(z=>z>=c.viewSize),y=v===-1?u.length-1:v,E=i<0?Math.max(0,y-1):Math.min(u.length-1,y+1),I=u[E];I!==c.viewSize&&(c.viewSize=I,c.viewStart=Math.max(0,Math.min(w-I,Math.round(h-I/2))),j(),Ce(),ge())}function Ot(i){At(i,c.viewStart+c.viewSize/2)}function Pn(){c.viewSize=w,c.viewStart=0,j(),Ce(),ge()}let Oe=null;function Dn(){let i=document.getElementById(r+"_sky");if(!i)return;i.addEventListener("pointerdown",u=>{let v=i.getBoundingClientRect(),y=u.clientX-v.left,E=v.width/w,I=Math.max(0,w-c.viewSize),z=Math.max(0,Math.min(I,c.viewStart)),q=z*E,ce=(z+c.viewSize)*E,le=z;(y<q||y>ce)&&(le=Ye(Math.round(y/E)-Math.floor(c.viewSize/2)),c.viewStart=le,It()),Oe={startX:y,startStart:le,layerW:E},i.classList.add("ll-grabbing");try{i.setPointerCapture(u.pointerId)}catch{}}),i.addEventListener("pointermove",u=>{if(!Oe)return;let v=i.getBoundingClientRect(),E=(u.clientX-v.left-Oe.startX)/Oe.layerW;Rn(Math.round(Oe.startStart+E))});let h=u=>{if(Oe){Oe=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(u.pointerId)}catch{}Ce(),ge()}};i.addEventListener("pointerup",h),i.addEventListener("pointercancel",h),i.addEventListener("wheel",u=>{u.preventDefault();let v=i.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){st(u.deltaX>0?1:-1);return}let y=Math.round((u.clientX-v.left)/v.width*w);At(u.deltaY<0?-1:1,y)},{passive:!1})}function In(i,h,u=!1){W(i)&&(c.selectedRow=i,c.selectedLayerIdx=h??l.layers.length-1,j(),de(),u&&An(i),ge())}function An(i){V.scrollToRow(i)}function at(){requestAnimationFrame(()=>requestAnimationFrame(()=>{U||V.scrollToBottom()}))}let On=.45,Wn=120,_n=360;function dt(){let i;if(Z)i=(a.clientWidth||M.clientWidth)*Z;else{let u=M.clientHeight;i=u>0?u:(M.clientWidth||900)*.6}let h=Math.round(i*On);te.style.height=Math.max(Wn,Math.min(_n,h))+"px"}function Wt(i){return i+"\xB7"+(it(l.tokens[i])?"bos":Ne(l.tokens[i]))}function de(i){let h=c.pinnedRows.length>0?c.pinnedRows:c.selectedRow!==null?[c.selectedRow]:[],u=h.length>1,v=[];for(let E of h){let I=pe(E);for(let z of c.pinned){let q=ie(E,z.token);if(!q)continue;let ce=Ne(z.token);u&&(ce+=" ("+Wt(E)+")"),v.push({values:q.map(le=>le??null),label:ce,color:z.color,dashPattern:I.dash||void 0,removable:!1})}}let y=v.length===0&&!i;if(y)we.classList.add("ll-hidden");else{we.classList.remove("ll-hidden"),dt(),ee.textContent=c.pinnedRows.length>1?c.pinnedRows.length+" positions":h.length===1?"position "+Wt(h[0]):"";let E={lines:[],richLines:v,xLabels:l.layers,sections:l.sections},I={darkMode:ue(),mode:"probability",autoScale:!0,legendPosition:v.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:s,pixelRatio:n?.pixelRatio};ae?(ae.setData(E),ae.setOptions(I)):(Ee.style.minHeight="0",ae=new Re(Ee,E,I)),i?ae.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):ae.setOverlay?.(null)}Q&&y!==H?(H=y,requestAnimationFrame(()=>{U||(j(),at())})):H=y}let Bn=56,zn=11,Nn=9.5,Fn=15;function Vn(i){let h=zn*(i>0?i/Bn:1);return Math.max(Nn,Math.min(Fn,h))}function Un(i,h,u,v,y=0){let E=l.cells[i]?.[h];if(!E||!W(i))return;let I=ke(),z=it(l.tokens[i])?"bos":Ne(l.tokens[i]);F.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Mt(E.prob,I,ue())}"></span><span class="ll-tt-token">${_e(Ne(E.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(E.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${l.layers[h]} / ${l.layers[w-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${_e(z)}</span></div>`,F.style.fontSize=Vn(y)+"px",F.classList.add("ll-visible");let q=M.getBoundingClientRect(),ce=F.offsetWidth||200,le=F.offsetHeight||80,ye=8,He=14,be=u-q.left,Le=v-q.top,We=be+He;We+ce>q.width-ye&&(We=be-He-ce),We=Math.max(ye,Math.min(We,q.width-ce-ye));let K=Le-50;K=Math.max(ye,Math.min(K,q.height-le-ye)),F.style.left=We+"px",F.style.top=K+"px"}function ct(){F.classList.remove("ll-visible")}function jn(){pt(),b=document.createElement("div"),b.style.cssText="position:fixed;inset:0;z-index:49;",b.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),Bt()}),document.body.appendChild(b)}function pt(){b&&(b.remove(),b=null)}function Gn(i,h,u){if(!l.cells[i]?.[h]||!W(i))return;let y=u.getBoundingClientRect();c.openPopup={row:i,layer:h},c.selectedRow=i,c.selectedLayerIdx=h;let E=it(l.tokens[i])?"bos":Ne(l.tokens[i]);Me.innerHTML=`Layer <b>${l.layers[h]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${_e(E)}</code></div>`,_t(i,h),j(),de(),X.style.visibility="hidden",X.classList.add("ll-visible"),Xn(y),X.style.visibility="",jn(),ge()}function _t(i,h){let u=l.cells[i][h],v="";u.topk.forEach((y,E)=>{let I=B(y.token),z=I?`background:${I}22;border-left-color:${I};`:"";v+=`<div class="ll-topk${I?" ll-topk-pinned":""}" data-ki="${E}" style="${z}" title="click to track trajectory"><span class="ll-topk-tok">${dn(y.token)}</span><span class="ll-topk-prob">${(y.prob*100).toFixed(1)}%</span></div>`}),Fe.innerHTML=v,Fe.querySelectorAll(".ll-topk").forEach(y=>{let E=parseInt(y.dataset.ki),I=u.topk[E];y.addEventListener("mouseenter",()=>{if(H)return;let z=ie(i,I.token);z&&de({values:z.map(q=>q??null),label:Ne(I.token),color:"#999"})}),y.addEventListener("mouseleave",()=>{H||de()}),y.addEventListener("click",z=>{z.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(me(I.token),j(),_t(i,h),de(),ge())})})}function Xn(i){let v=M.getBoundingClientRect(),y=Math.max(140,v.width-2*8),E=Math.max(120,v.height-2*8);X.style.maxWidth=y+"px",X.style.maxHeight=E+"px";let I=X.offsetWidth||220,z=X.offsetHeight||160,q=v.left+8,ce=v.right-8-I,le=v.top+8,ye=v.bottom-8-z,He=[{left:i.right+6,top:i.top},{left:i.left-6-I,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-z}],be=He[0];for(let Le of He)if(Le.left>=q&&Le.left<=ce&&Le.top>=le&&Le.top<=ye){be=Le;break}X.style.left=Math.max(q,Math.min(be.left,Math.max(q,ce)))+"px",X.style.top=Math.max(le,Math.min(be.top,Math.max(le,ye)))+"px"}function Bt(){c.openPopup=null,X.classList.remove("ll-visible"),pt(),j(),de()}s&&document.getElementById(r+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),Bt()});function Yn(i,h){if(H||!W(i))return;let u=l.cells[i]?.[h]?.token,v=u!=null?ie(i,u):null;v?de({values:v.map(y=>y??null),label:Ne(u),color:"#999"}):de()}function qn(){H||de()}function Kn(i,h){Yn(i,h)}function Qn(i,h,u){if(!W(i))return;if(u.shiftKey){let y=l.cells[i]?.[h]?.token;y&&(me(y),j(),de(),ge());return}ct();let v=u.target.closest(".hmx-cell");v&&Gn(i,h,v)}V=new Ue(_,Se(),Pt());let et=V.getScrollElement(),zt=i=>{let h=i.target.closest(".hmx-cell");if(!h){ct();return}Un(parseInt(h.dataset.row),parseInt(h.dataset.col),i.clientX,i.clientY,h.offsetWidth)},Nt=i=>{i.shiftKey&&i.target.closest(".hmx-rowlabel")&&i.preventDefault()};s&&(et.addEventListener("mousemove",zt),et.addEventListener("mousedown",Nt),_.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let h=i.key==="ArrowDown"?1:-1,u=(c.selectedRow??(h>0?-1:A))+h;for(;u>=0&&u<A&&!W(u);)u+=h;W(u)&&In(u,void 0,!0)}),N.addEventListener("click",i=>{let h=i.target.closest("[data-nav]");if(!h||h.hasAttribute("disabled"))return;let u=h.dataset.nav;u==="panL"?st(-Math.max(1,Math.floor(c.viewSize/4))):u==="panR"?st(Math.max(1,Math.floor(c.viewSize/4))):u==="zoomIn"?Ot(-1):u==="zoomOut"?Ot(1):u==="reset"&&Pn()}));function ht(){j(),Ce(),de(),requestAnimationFrame(()=>{U||(j(),Ce(),H||dt())})}function ut(){xt(M,ue(),X)}function ge(){P("stateChange",jt())}ht(),s&&at(),ut();let mt=0,Ft=a?.clientWidth??0,Vt=a?.clientHeight??0,Ut=new ResizeObserver(()=>{let i=a?.clientWidth??0,h=a?.clientHeight??0;i===Ft&&h===Vt||(Ft=i,Vt=h,!mt&&(mt=requestAnimationFrame(()=>{mt=0,!U&&(j(),H||dt())})))});a&&Ut.observe(a);let Zn=ot(a,i=>{c.darkModeOverride===null&&(xt(M,i,X),j(),Ce(),de())});function jt(){return{ramp:c.ramp,showGrid:c.showGrid,dimLowProb:c.dimLow,selectedRow:c.selectedRow,selectedLayer:c.selectedLayerIdx,viewStart:c.viewStart,viewSize:c.viewSize,colorIndex:c.colorIndex,pinnedGroups:c.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:c.pinnedRows.map(i=>({pos:i,line:pe(i).name})),darkMode:c.darkModeOverride,rowHighlights:c.rowHighlights,collapsedSections:c.collapsedSections,rowStart:c.rowStart}}return{widget:{getState:jt,setState:i=>{i.ramp!==void 0&&(c.ramp=i.ramp),i.showGrid!==void 0&&(c.showGrid=i.showGrid),i.dimLowProb!==void 0&&(c.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(c.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(c.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(c.viewStart=i.viewStart),i.viewSize!==void 0&&(c.viewSize=i.viewSize),i.colorIndex!==void 0&&(c.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(c.pinned=x(i.pinnedGroups)),i.pinnedRows!==void 0&&(c.pinnedRows=i.pinnedRows.map(h=>h.pos).filter(h=>typeof h=="number")),i.darkMode!==void 0&&(c.darkModeOverride=i.darkMode),i.rowHighlights!==void 0&&(c.rowHighlights=i.rowHighlights),i.collapsedSections!==void 0&&(c.collapsedSections=i.collapsedSections.map(h=>({...h}))),i.rowStart!==void 0&&(c.rowStart=i.rowStart),oe(),ut(),ht()},setData:i=>{d=bt(i),l=d.normalized,g=d.v2Data,c.selectedRow=null,c.selectedLayerIdx=null,c.pinned=[],c.pinnedRows=[],c.colorIndex=0,c.rowHighlights=[],c.collapsedSections=[],c.rowStart=null,k=null,oe(),m=[],V.setData(Se()),ht(),s&&at()},setTitle:()=>{},setThemeMode:i=>{c.darkModeOverride=!!i,ut(),j(),Ce(),de()},getThemeMode:()=>ue(),getRowWindow:()=>S,setRowScrollActive:i=>{i!==R&&(R=i,j())},hasEntropyData:()=>!!g&&Array.isArray(g.entropy)&&g.entropy.length>0,hasRankData:()=>{if(!g?.tracked)return!1;for(let i of g.tracked)for(let h in i){let u=i[h];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,h)=>{(L[i]||(L[i]=[])).push(h)},off:(i,h)=>{L[i]=(L[i]||[]).filter(u=>u!==h)},destroy:()=>{U=!0,Zn(),Ut?.disconnect(),pt(),X.remove(),ae&&(ae.destroy(),ae=null),et.removeEventListener("mousemove",zt),et.removeEventListener("mousedown",Nt),V?.destroy(),a&&(a.innerHTML="")}},styleEl:f}}var Mo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',So='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',To='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Eo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',$o='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var je=class{constructor(e,t,n,r){this.widget=null;this.styleEl=null;let s=cn(e,t,n,r);s&&(this.widget=s.widget,this.styleEl=s.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}getRowWindow(){return this.widget?.getRowWindow()??null}setRowScrollActive(e){this.widget?.setRowScrollActive(e)}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var Co='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Ho='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Ro='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',St="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function Tt(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function pn(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${St};`;let t={isOpen:!1,searchQuery:""},n=un(e,o,t);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=t,e}function Ze(o,e){let t=o.__tokenSelectorCleanup,n=o.__tokenSelectorState;t&&t();let r={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},s=un(o,e,r);o.__tokenSelectorCleanup=s,o.__tokenSelectorState=r}function hn(o){let e=o.__tokenSelectorCleanup;e&&e()}function un(o,e,t){o.innerHTML="";let n=Tt(e.darkMode),{allLabels:r,selectedIndices:s,defaultIndices:p,onChange:a}=e,d=document.createElement("div");d.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let l=document.createElement("span");if(l.style.cssText=`font-size:11px;color:${n.fgMuted};`,l.textContent=`Tokens (${r.length})`,d.appendChild(l),!Et(s,p)){let T=document.createElement("button");T.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${St};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,T.innerHTML=`${Co} Reset`,T.addEventListener("mouseenter",()=>{T.style.color=n.fg}),T.addEventListener("mouseleave",()=>{T.style.color=n.fgMuted}),T.addEventListener("click",()=>{a(Array.from(p))}),d.appendChild(T)}o.appendChild(d);let f=document.createElement("div");f.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,f.addEventListener("click",()=>{P(),c.focus()});let x=Array.from(s).sort((T,D)=>T-D);for(let T of x){let D=Po(T,r[T],e.darkMode,()=>{let O=new Set(s);O.delete(T),a(Array.from(O))});f.appendChild(D)}let c=document.createElement("input");c.type="text",c.placeholder=x.length===0?"Search tokens...":"",c.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${St};min-width:60px;flex:1;padding:2px 0;`,c.addEventListener("input",()=>{t.searchQuery=c.value,L()}),c.addEventListener("focus",()=>P()),f.appendChild(c);let k=document.createElement("span");k.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,k.innerHTML=Ro,k.addEventListener("click",T=>{T.stopPropagation(),t.isOpen?w():P()}),f.appendChild(k),o.appendChild(f);let $=document.createElement("div");$.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let S=document.createElement("div");S.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",$.appendChild(S);let R=document.createElement("div");R.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,R.textContent="No tokens found",$.appendChild(R),o.appendChild($);function L(){S.innerHTML="";let T=t.searchQuery.toLowerCase(),D=0;for(let O=0;O<r.length;O++){let G=r[O];if(T&&!G.toLowerCase().includes(T))continue;D++;let W=s.has(O),oe=Do(O,G,W,e.darkMode,()=>{let B=new Set(s);W?B.delete(O):B.add(O),a(Array.from(B))});S.appendChild(oe)}R.style.display=D===0?"":"none"}function P(){t.isOpen||(t.isOpen=!0,$.style.display="",k.style.transform="rotate(180deg)",L())}function w(){t.isOpen&&(t.isOpen=!1,$.style.display="none",k.style.transform="",c.value="",t.searchQuery="")}function A(T){o.contains(T.target)||w()}return document.addEventListener("mousedown",A),t.isOpen&&($.style.display="",k.style.transform="rotate(180deg)",c.value=t.searchQuery,L(),requestAnimationFrame(()=>{c.isConnected&&c.focus()})),()=>{document.removeEventListener("mousedown",A)}}function Po(o,e,t,n){let r=Tt(t),s=J[o%J.length],p=document.createElement("div");p.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${r.chipBorder};background:${r.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,p.addEventListener("mouseenter",()=>{p.style.background=r.chipHoverBg,p.style.borderColor=r.chipHoverBorder}),p.addEventListener("mouseleave",()=>{p.style.background=r.chipBg,p.style.borderColor=r.chipBorder});let a=document.createElement("span");a.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${s};`,p.appendChild(a);let d=document.createElement("span");d.style.cssText=`font-size:11px;color:${r.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,d.innerHTML=ze(e),d.title=e,p.appendChild(d);let l=document.createElement("button");return l.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${r.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,l.innerHTML=Ho,l.addEventListener("mouseenter",()=>{l.style.color=r.badgeText}),l.addEventListener("mouseleave",()=>{l.style.color=r.fgMuted}),l.addEventListener("click",g=>{g.stopPropagation(),n()}),p.appendChild(l),p}function Do(o,e,t,n,r){let s=Tt(n),p=J[o%J.length],a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",a.addEventListener("mouseenter",()=>{a.style.background=s.hoverBg}),a.addEventListener("mouseleave",()=>{a.style.background="transparent"}),a.addEventListener("click",f=>{f.stopPropagation(),r()});let d=document.createElement("span");d.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?p:"transparent"};border:1.5px solid ${t?p:s.fgMuted};`,a.appendChild(d);let l=document.createElement("span");l.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?s.fg:s.fgMuted};`,l.innerHTML=ze(e),l.title=e,a.appendChild(l);let g=o===0?"source pred":o===1?"target pred":null;if(g){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${s.badgeBg};color:${s.badgeText};border:1px solid ${s.badgeBorder};`,f.textContent=g,a.appendChild(f)}if(t){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;font-size:10px;color:${s.selectedText};`,f.textContent="selected",a.appendChild(f)}return a}function Et(o,e){if(o.size!==e.size)return!1;for(let t of o)if(!e.has(t))return!1;return!0}var Io={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Ao=["probability","prob_diff","rank"],Ge=class Ge{constructor(e,t,n={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.interactive=n.interactive!==!1,this.pixelRatio=n.pixelRatio,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let r=n.defaultSelectedTokens??Ge.defaultSelection(t);this.customDefaultTokens=n.defaultSelectedTokens!==void 0,this.defaultTokens=new Set(r),this.selectedTokens=new Set(n.selectedTokens??r),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=pn(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let s=document.createElement("div");s.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(s),this.linePlot=new Re(s,this.buildPlotData(),this.buildPlotOptions()),s.style.height="auto"}static defaultSelection(e){let t=e.tokenLabels?.length??e.lines?.length??0,n=new Set(Array.from({length:Math.min(2,t)},(s,p)=>p)),r=s=>Math.max(...e.lines?.[s]??[0]);return(e.ranks??[]).slice(0,t).flatMap((s,p)=>!n.has(p)&&s.includes(0)?[p]:[]).sort((s,p)=>r(p)-r(s)||s-p).slice(0,Ge.MAX_DEFAULT_TOKENS-n.size).forEach(s=>n.add(s)),Array.from(n).sort((s,p)=>s-p)}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ze(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of Ao){let n=document.createElement("button");n.textContent=Io[t],this.applyModeButtonStyles(n,t===this.mode),n.addEventListener("click",()=>this.setMode(t)),n.addEventListener("mouseenter",()=>{t!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{t!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(t,n)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",r="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?r:"transparent"};color:${t?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((p,a)=>p-a),r=this.mode==="rank";return{richLines:n.filter(p=>p<e.length).map(p=>({values:r?e[p].map(a=>a+1):e[p],label:t[p]??`Token ${p}`,color:J[p%J.length]})),sections:this.allData.sections}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.customDefaultTokens||(this.defaultTokens=new Set(Ge.defaultSelection(e)));let n=new Set([...this.selectedTokens].filter(r=>r<t));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Ze(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ze(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,n=new Set(e.filter(r=>r<t));Et(n,this.selectedTokens)||(this.selectedTokens=n,Ze(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){hn(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};Ge.MAX_DEFAULT_TOKENS=10;var Xe=Ge;function $t(o,e,t){let n=Math.max(1,o),r=Math.max(1,e),s=Math.min(16e3/n,16e3/r,Math.sqrt(25e7/(n*r)));return Math.max(.01,Math.min(t>0?t:1,s))}var Ct="http://www.w3.org/1999/xhtml",rt="http://www.w3.org/2000/svg",Oo=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,Wo=new Set(["d","x","y","cx","cy","r","rx","ry"]),_o=new Set(["script","style","link","noscript","template"]),Bo=[["border-top-style","border-top-width"],["border-right-style","border-right-width"],["border-bottom-style","border-bottom-width"],["border-left-style","border-left-width"],["outline-style","outline-width"],["column-rule-style","column-rule-width"]],zo=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,No=o=>o.replace(zo,e=>e.length===2?e:"\uFFFD"),Ht=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(rt,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,t){let n=e.namespaceURI??Ct,r=`${n} ${e.localName}${t??""}`,s=this.cache.get(r);if(s)return s;let p=this.doc.createElementNS(n,e.localName);(n===rt?this.svgRoot:this.doc.body).appendChild(p);let a=this.win.getComputedStyle(p,t??null);s=new Map;for(let d=0;d<a.length;d++){let l=a.item(d);s.set(l,a.getPropertyValue(l))}return p.remove(),this.cache.set(r,s),s}destroy(){this.frame.remove()}};function mn(o,e,t,n){let r="",s=new Set;for(let p=0;p<o.length;p++){let a=o.item(p);if(Oo.test(a)||n&&Wo.has(a))continue;let d=o.getPropertyValue(a);d===e.get(a)&&(!t||d===t.getPropertyValue(a))||(r+=`${a}:${d};`,s.add(a))}for(let[p,a]of Bo){let d=o.getPropertyValue(p);d&&d!=="none"&&d!=="hidden"&&!s.has(a)&&(r+=`${a}:${o.getPropertyValue(a)};`)}return r}function fn(o,e,t){if(o.nodeType===Node.TEXT_NODE)return document.createTextNode(o.nodeValue??"");if(o.nodeType!==Node.ELEMENT_NODE)return null;let n=o;if(_o.has(n.localName.toLowerCase()))return null;let r=getComputedStyle(n);if(r.display==="none")return null;let s=n instanceof HTMLCanvasElement,p;if(s){p=document.createElement("img");try{p.setAttribute("src",n.toDataURL("image/png"))}catch{}}else p=n.cloneNode(!1);p.setAttribute("style",mn(r,t.sandbox.defaults(n),e,n.namespaceURI===rt));let a="",d="";for(let l of["::before","::after"]){let g=getComputedStyle(n,l),f=g.getPropertyValue("content");!f||f==="none"||f==="normal"||g.display==="none"||(d||(d=`nns-snap-${t.nextClass++}`),a+=`.${d}${l}{${mn(g,t.sandbox.defaults(n,l),r,!1)}}`)}if(d&&(p.setAttribute("class",`${p.getAttribute("class")??""} ${d}`.trim()),t.rules.push(a)),!s)for(let l of Array.from(n.childNodes)){let g=fn(l,r,t);g&&p.appendChild(g)}return p}function Fo(o){return new Promise((e,t)=>{let n=new Image;n.onload=()=>e(n),n.onerror=()=>t(new Error("Snapshot failed: the browser could not render the captured element.")),n.src=o})}async function Je(o,e={}){let t=Math.max(0,e.padding??0),n=o.getBoundingClientRect(),r=Math.ceil(n.width),s=Math.ceil(n.height);if(r===0||s===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let p=r+2*t,a=s+2*t,d=$t(p,a,e.scale??2),l=new Ht,g;try{let S={sandbox:l,rules:[],nextClass:0},R=fn(o,null,S);if(!R)throw new Error("Snapshot failed: the element is not displayed.");R.setAttribute("style",R.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${r}px;height:${s}px;box-sizing:border-box;`);let L=document.createElementNS(Ct,"div");if(L.setAttribute("style",`width:${p}px;height:${a}px;padding:${t}px;margin:0;box-sizing:border-box;`),S.rules.length){let P=document.createElementNS(Ct,"style");P.textContent=S.rules.join(""),L.appendChild(P)}L.appendChild(R),g=No(new XMLSerializer().serializeToString(L))}finally{l.destroy()}let f=`<svg xmlns="${rt}" width="${p*d}" height="${a*d}" viewBox="0 0 ${p} ${a}"><foreignObject x="0" y="0" width="${p}" height="${a}">${g}</foreignObject></svg>`,x=await Fo("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(f)),c=document.createElement("canvas");c.width=Math.round(p*d),c.height=Math.round(a*d);let k=c.getContext("2d");if(!k)throw new Error("Snapshot failed: no 2D canvas context.");e.background&&(k.fillStyle=e.background,k.fillRect(0,0,c.width,c.height)),k.drawImage(x,0,0,c.width,c.height);let $;try{$=c.toDataURL("image/png")}catch(S){throw new Error(`Snapshot failed: this browser won't read back the rendered image (${S.message}).`)}return{dataUrl:$,width:p,height:a,scale:d,toBlob:()=>new Promise((S,R)=>c.toBlob(L=>L?S(L):R(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var gn={light:"#ffffff",dark:"hsl(0 0% 16%)"};function Vo(){return new Promise(o=>{let e=setTimeout(o,100);requestAnimationFrame(()=>{clearTimeout(e),o()})})}async function Uo(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let o=0;o<3;o++)await Vo()}async function bn(o,e={}){let t=Math.max(200,Math.round(e.width??880)),n=e.darkMode??!1,r=e.scale??2,s=e.background===void 0?n?gn.dark:gn.light:e.background,p=document.createElement("div");p.setAttribute("aria-hidden","true"),p.style.cssText=`position:fixed;left:-100000px;top:0;width:${t}px;pointer-events:none;`;let a=document.createElement("div");p.appendChild(a),document.body.appendChild(p);let d=()=>{},l=()=>{};try{if(o.kind==="logit-lens"){let f=new je(a,o.data,{...o.uiState,darkMode:n},{interactive:!1,pixelRatio:r,maxRows:e.maxRows,layerNavigator:e.layerNavigator});d=()=>f.destroy(),l=()=>f.getRowWindow()}else{let f=Math.max(160,Math.round(e.height??t*.5));p.style.height=`${f}px`;let x=new Xe(a,o.data,{mode:o.mode,selectedTokens:o.selectedTokens,title:o.title,darkMode:n,transparentBackground:!0,interactive:!1,pixelRatio:r});d=()=>x.destroy()}return await Uo(),{...await Je(p,{scale:r,background:s,padding:e.padding}),rows:l()}}finally{d(),p.remove()}}function jo(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function Rt(o,e,t){let n=jo(o);if(!n)return null;let r=e(n);if(t===void 0){let s=ot(n,a=>r.setThemeMode(a)),p=r.destroy.bind(r);r.destroy=()=>{s(),p()}}return r}function wn(o,e,t,n){return new je(o,e,t,n)}function yn(o,e,t){return Rt(o,n=>new Re(n,e,{darkMode:Pe(n),...t}),t?.darkMode)}var xn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Go(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function vn(o,e){if(typeof o.getCellValue=="function")return o;let t=o,n=t.values??[],r=t.texts,s=t.rowLabels??n.map((R,L)=>String(L)),p=t.colLabels??(n[0]??[]).map((R,L)=>String(L)),a=t.ramp??"purple",d=xn[a]??(a[0]==="#"?a:xn.purple),[l,g,f]=Go(d),[x,c]=t.valueDomain??[0,1],k=c-x,$=e?38:255,S=R=>Math.max(0,Math.min(1,R));return{rows:s.map(R=>({label:R})),columns:p.map(R=>({label:R,value:0})),getCellValue:(R,L)=>{let P=n[R]?.[L]??0,w=S(k>0?(P-x)/k:P),A=D=>Math.round($+(D-$)*w);return{text:r?r[R]?.[L]??"":Number.isInteger(P)?String(P):P.toFixed(2),value:P,color:`rgb(${A(l)}, ${A(g)}, ${A(f)})`,textColor:w>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Ln(o,e,t){return Rt(o,n=>{let r=t?.darkMode??Pe(n),s=new Ue(n,vn(e,r),{darkMode:r,...t}),p=s.setThemeMode.bind(s);return s.setThemeMode=a=>{s.setData(vn(e,a)),p(a)},s},t?.darkMode)}function kn(o,e,t){return Rt(o,n=>new Xe(n,e,{darkMode:Pe(n),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=wn,window.LinePlotWidget=yn,window.HeatmapTableWidget=Ln,window.ActivationPatchingWidget=kn);return io(Xo);})();
//# sourceMappingURL=charts.js.map
