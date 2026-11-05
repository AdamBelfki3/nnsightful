"use strict";var InterpTools=(()=>{var it=Object.defineProperty;var Xn=Object.getOwnPropertyDescriptor;var Yn=Object.getOwnPropertyNames;var qn=Object.prototype.hasOwnProperty;var Kn=(o,e)=>{for(var n in e)it(o,n,{get:e[n],enumerable:!0})},Qn=(o,e,n,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Yn(e))!qn.call(o,l)&&l!==n&&it(o,l,{get:()=>e[l],enumerable:!(t=Xn(e,l))||t.enumerable});return o};var Zn=o=>Qn(it({},"__esModule",{value:!0}),o);var No={};Kn(No,{ActivationPatchingWidget:()=>un,HeatmapTableWidget:()=>hn,LinePlotWidget:()=>pn,LogitLensWidget:()=>cn,captureElement:()=>Ne,snapshotChart:()=>sn});function At(o){return o.completion&&o.completion.length?[...o.input,...o.completion]:o.input}function Jn(o){let e=o.positions,n=At(o).length;if(!e||e.length===n&&e.every((a,r)=>a===r))return{data:o,computedRows:null};let t=new Array(n);e.forEach((a,r)=>{Number.isInteger(a)&&a>=0&&a<n&&r<o.tracked.length&&(t[a]=r)});let l=Array.from({length:n},(a,r)=>r),d=(a,r,c)=>{let f=t[r];return f!==void 0&&a&&f<a.length?a[f]:c()};return{data:{...o,positions:null,tracked:l.map(a=>d(o.tracked,a,()=>({}))),topk:o.topk.map(a=>l.map(r=>d(a,r,()=>[]))),entropy:o.entropy?o.entropy.map(a=>l.map(r=>d(a,r,()=>0))):o.entropy},computedRows:l.filter(a=>t[a]!==void 0)}}function Ot(o){let e=o.computedRows;if(!e)return[];let n=o.tokens.length,t=[],l=0;for(let d of[...e,n])d>l&&t.push({start:l,end:d-1,collapsed:!0,locked:!0,label:"not computed"}),l=d+1;return t}function lt(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:n,computedRows:t}=Jn(o),l=n.layers.length,d=At(n),h=d.length,a=[];for(let c=0;c<h;c++){let f=[],m=n.tracked[c]??{};for(let M=0;M<l;M++){let s=n.topk[M]?.[c]??[],T=[];for(let H=0;H<s.length;H++){let E=s[H],y=m[E]||[],L=y[M]||0;T.push({token:E,prob:L,trajectory:y})}let P=T[0]||{token:"",prob:0,trajectory:[]};f.push({token:P.token,prob:P.prob,trajectory:P.trajectory,topk:T})}a.push(f)}return{normalized:{layers:n.layers,tokens:d,cells:a,meta:n.meta||{},computedRows:t},v2Data:n}}function _t(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Te(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function eo(o){let e=`#${o}`;return`
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
    `}function zt(o){let e=document.createElement("style");return e.textContent=eo(o),document.head.appendChild(e),e}function rt(o,e,...n){let t=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};t(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let l of n)l&&t(l)}var ze=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],st=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var J=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function Ee(o){return o.richLines&&o.richLines.length>0?o.richLines.map((n,t)=>({values:n.values,label:n.label??`Line ${t+1}`,color:n.color,dashPattern:n.dashPattern,isOverlay:n.isOverlay,removable:n.removable})):(o.lines??[]).map((n,t)=>({values:n,label:o.labels?.[t]??`Line ${t+1}`}))}function Ce(o){if(!o)return"";let e=[],n=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),n=1);let t="";for(;n<o.length;n++){let l=o[n];l===`
`?(t&&(e.push(Wt(t)),t=""),e.push('<span style="color:#3b82f6">\\n</span>')):t+=l}return t&&e.push(Wt(t)),e.join("")}function Wt(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function to(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let n of e)if(o<=n)return n;return 1}function Bt(o,e,n){let t=Ee(o),l=t.length>0?t[0].values.length:n?.values.length??o.xLabels?.length??0;if(l===0)return null;let d=e.mode||"probability",h=e.minValue,a=e.maxValue;if(h===void 0||a===void 0||e.autoScale){let r=[];for(let m of t)if(!m.isOverlay)for(let M of m.values)M!==null&&r.push(M);if(n)for(let m of n.values)m!==null&&r.push(m);if(r.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:t.length};let c=1/0,f=-1/0;for(let m of r)m<c&&(c=m),m>f&&(f=m);if(e.centerYAxisAtZero){let M=Math.max(Math.abs(c),Math.abs(f))*1.1;h=-M,a=M}else if(e.logScale){if(h===void 0&&(h=Math.max(1,Math.floor(c))),a===void 0||e.autoScale){let m=Math.log(Math.max(1,c)),M=Math.log(Math.max(1,f)),s=M+.15*Math.max(1,M-m);a=Math.ceil(Math.exp(s))}}else h===void 0&&(h=d==="probability"?0:d==="rank"?Math.max(1,Math.floor(c)):Math.floor(c*.9)),(a===void 0||e.autoScale)&&(d==="rank"?a=Math.ceil(f*1.1):d==="probability"?a=e.autoScale?to(Math.max(f,.001)):Math.min(f*1.1,1):a=f*1.1)}return{numLayers:l,minValue:h,maxValue:a,numLines:t.length}}function Nt(o,e,n,t,l,d,h,a){let r=o.getContext("2d"),c=e.getBoundingClientRect(),f=t.pixelRatio??(window.devicePixelRatio||1);o.width=c.width*f,o.height=c.height*f,o.style.width=`${c.width}px`,o.style.height=`${c.height}px`,r.scale(f,f);let m=c.width,M=c.height,s=t.darkMode??!1,T=t.title,P=t.mode||"probability",H=t.invertYAxis??!1,E=t.centerYAxisAtZero??!1,y=t.logScale??!1,L=t.xAxisLabel||"Layer",w=t.yAxisLabel||"Probability",I=t.xRangeStart??0;I>=l.numLayers-1&&(console.warn(`xRangeStart (${I}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),I=0);let k=t.showDataPoints??!0,S={top:T?48:24,right:24,bottom:56,left:72},_=m-S.left-S.right,F=M-S.top-S.bottom,V={margin:S,chartWidth:_,chartHeight:F,width:m,height:M},G={background:s?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:s?"#52525b":"#a1a1aa",grid:s?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:s?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:s?"#e4e4e7":"#27272a"};t.transparentBackground?r.clearRect(0,0,m,M):(r.fillStyle=G.background,r.fillRect(0,0,m,M)),T&&(r.fillStyle=G.titleText,r.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="left",r.fillText(T,S.left,28));let oe=l.numLayers-1-I,ie=x=>oe<=0?S.left+_/2:S.left+(x-I)/oe*_,ee=y?Math.log(Math.max(1,l.minValue)):0,pe=y?Math.log(Math.max(1,l.maxValue)):0,Q=x=>{let O;if(y){let R=Math.log(Math.max(1,x));O=pe-ee>0?(R-ee)/(pe-ee):.5}else O=(x-l.minValue)/(l.maxValue-l.minValue);return H?S.top+O*F:S.top+F-O*F};r.setLineDash([4,4]),r.strokeStyle=G.grid,r.lineWidth=1;let q=[],ve=l.maxValue-l.minValue,me=5;if(y){let x=new Set;for(let j=0;j<me;j++){let se=ee+j/(me-1)*(pe-ee),B=Math.round(Math.exp(se));x.has(B)||(x.add(B),q.push(B))}let O=Math.round(Math.exp(ee)),R=Math.round(Math.exp(pe));x.has(O)||q.unshift(O),x.has(R)||q.push(R)}else if(P==="rank")for(let x=0;x<me;x++)q.push(Math.round(l.minValue+x/(me-1)*ve));else for(let x=0;x<me;x++)q.push(l.minValue+x/(me-1)*ve);if(q.forEach(x=>{let O=Q(x);r.beginPath(),r.moveTo(S.left,O),r.lineTo(S.left+_,O),r.stroke()}),r.setLineDash([]),E){let x=Q(0);r.beginPath(),r.strokeStyle=s?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",r.lineWidth=1.5,r.moveTo(S.left,x),r.lineTo(S.left+_,x),r.stroke(),r.lineWidth=1}r.fillStyle=G.text,r.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="right",r.textBaseline="middle",q.forEach(x=>{let O=Q(x),R;P==="probability"?R=x.toFixed(2):P==="prob_diff"?R=x>=0?`+${x.toFixed(2)}`:x.toFixed(2):R=Math.round(x).toString(),r.fillText(R,S.left-16,O)}),r.textAlign="center",r.textBaseline="top";let g=n.xLabels&&n.xLabels.length>0,$=Math.max(1,Math.ceil(l.numLayers/8));for(let x=0;x<l.numLayers;x+=$){let O=ie(x);if(O<S.left-5||O>S.left+_+5)continue;let R=g?String(n.xLabels[x]??x):x.toString();r.fillText(R,O,S.top+F+12)}if((l.numLayers-1)%$!==0){let x=g?String(n.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();r.fillText(x,ie(l.numLayers-1),S.top+F+12)}r.strokeStyle=s?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",r.lineWidth=1.5,r.beginPath(),r.moveTo(S.left,S.top),r.lineTo(S.left,S.top+F),r.lineTo(S.left+_,S.top+F),r.stroke(),r.fillStyle=G.textMuted,r.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="center",r.textBaseline="top",r.fillText(L.toUpperCase(),S.left+_/2,M-16),r.save(),r.translate(14,S.top+F/2),r.rotate(-Math.PI/2),r.textAlign="center",r.textBaseline="top",r.fillText(w.toUpperCase(),0,0),r.restore();let z=Ee(n);function W(x,O,R,j,se){r.beginPath(),r.strokeStyle=O,r.lineWidth=R,se!==void 0&&(r.globalAlpha=se),j?r.setLineDash(j.split(",").map(Number)):r.setLineDash([]);let B=!1;for(let ae=0;ae<x.length;ae++){let Z=x[ae];if(Z===null){B=!1;continue}let Y=ie(ae),Me=Q(Z);B?r.lineTo(Y,Me):(r.moveTo(Y,Me),B=!0)}r.stroke(),r.setLineDash([]),se!==void 0&&(r.globalAlpha=1)}let D=s?"#3f3f46":"#d4d4d8";if(r.lineCap="round",r.lineJoin="round",z.forEach((x,O)=>{!d.has(O)||x.isOverlay||W(x.values,D,2,void 0,.35)}),z.forEach((x,O)=>{if(d.has(O)||x.isOverlay)return;let R=x.color??J[O%J.length];W(x.values,R,4,x.dashPattern,.15),W(x.values,R,2,x.dashPattern),k&&x.values.forEach((j,se)=>{if(j===null)return;let B=ie(se),ae=Q(j),Z=h?.lineIdx===O&&h?.layerIdx===se;r.beginPath(),r.strokeStyle=R,r.lineWidth=Z?2:1.5,r.arc(B,ae,Z?5:3.5,0,Math.PI*2),r.stroke(),r.beginPath(),r.fillStyle=s?"#18181b":"#ffffff",r.arc(B,ae,Z?3.5:2.5,0,Math.PI*2),r.fill()})}),z.forEach((x,O)=>{if(!x.isOverlay||d.has(O))return;let R=x.color??"#999";W(x.values,R,1.5,x.dashPattern??"4,2",.7)}),a){let x=a.color??"#999";W(a.values,x,1.5,a.dashPattern??"4,2",.7)}return V}function Ft(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function Vt(o,e,n,t,l,d,h,a,r){let{margin:c,chartWidth:f,chartHeight:m}=l,M=t.xRangeStart??0,s=h-1-M,T=t.logScale?Math.log(Math.max(1,a)):0,P=t.logScale?Math.log(Math.max(1,r)):0;if(o<c.left||o>c.left+f||e<c.top||e>c.top+m)return null;let H=Ee(n),E=null,y=1/0,L=20;for(let w=0;w<H.length;w++){if(d.has(w))continue;let I=H[w];if(!I.isOverlay)for(let k=0;k<I.values.length;k++){let S=I.values[k];if(S===null)continue;let _=s<=0?c.left+f/2:c.left+(k-M)/s*f,F;if(t.logScale){let oe=Math.log(Math.max(1,S));F=P-T>0?(oe-T)/(P-T):.5}else F=(S-a)/(r-a);let V=t.invertYAxis?c.top+F*m:c.top+m-F*m,G=Math.sqrt((o-_)**2+(e-V)**2);G<y&&G<L&&(y=G,E={visible:!0,x:_,y:V,lineIdx:w,layerIdx:k,value:S,label:I.label,color:I.color??J[w%J.length]})}}return E}function at(o,e,n,t,l,d,h){if(!e){o.style.opacity="0";return}let a=t?"#27272a":"#fff",r=t?"#3f3f46":"#e4e4e7",c=t?"#fafafa":"#18181b",f=t?"#a1a1aa":"#71717a",M=e.x>n/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${M},-50%);`;let s=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);o.innerHTML=`
        <div style="background:${a};border:1px solid ${r};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${c};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${Ce(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${f}">${d??"Layer"}</span>
                    <span style="font-weight:500;color:${c}">${s}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${f}">Value</span>
                    <span style="font-weight:500;color:${c}">${h==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var no='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',oo='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',io='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function jt(o){let e=document.createElement("div");return Ut(e,o),e}function Ut(o,e){let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",t=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${t};align-self:flex-start;`}function Gt(o,e,n,t,l,d){Ut(o,t),o.innerHTML="";let h=t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",a=t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",r=t?"#a1a1aa":"#71717a",c=t?"#3f3f46":"#d4d4d8",f="rgba(161,161,170,0.3)",m=t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",M=d?Ee(d):[];e.forEach((s,T)=>{let P=M[T];if(P?.isOverlay)return;let H=P?.color??J[T%J.length],E=n.has(T),y=P?.removable??!1,L=document.createElement(l?"button":"div");L.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:${l?"pointer":"default"};transition:all 0.15s;opacity:${E?"0.5":"1"};`,l&&(L.addEventListener("mouseenter",()=>{L.style.background=m}),L.addEventListener("mouseleave",()=>{L.style.background="transparent"}),L.addEventListener("click",()=>l.onToggle(T)));let w=document.createElement("span");w.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${E?f:H};background:${E?c:"transparent"};`,L.appendChild(w);let I=document.createElement("span");if(I.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${E?a:h};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,I.title=s,I.innerHTML=Ce(s),L.appendChild(I),!l){o.appendChild(L);return}if(y&&l.onRemove){let k=document.createElement("span");k.style.cssText=`margin-left:auto;cursor:pointer;color:${r};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,k.innerHTML=io,k.title="Remove",k.addEventListener("click",S=>{S.stopPropagation(),l.onRemove(T)}),L.appendChild(k),L.addEventListener("mouseenter",()=>{k.style.opacity="0.6"}),L.addEventListener("mouseleave",()=>{k.style.opacity="0"})}else{let k=document.createElement("span");k.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${r};opacity:${E?"0.6":"0"};display:flex;align-items:center;`,k.innerHTML=E?oo:no,L.appendChild(k),E||(L.addEventListener("mouseenter",()=>{k.style.opacity="0.4"}),L.addEventListener("mouseleave",()=>{k.style.opacity="0"}))}o.appendChild(L)})}var Le=class{constructor(e,n,t={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let n=this.canvas.getBoundingClientRect(),t=e.clientX-n.left,l=e.clientY-n.top;this.tooltip=Vt(t,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),at(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,at(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=n,this.options={darkMode:!1,...t},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer);let l=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${l?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=Ft(this.chartContainer),this.legendEl=jt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),l&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(d=>{if(this.destroyed)return;let h=d[0];if(!h)return;let a=Math.round(h.contentRect.width),r=Math.round(h.contentRect.height);a===this.lastWidth&&r===this.lastHeight||(this.lastWidth=a,this.lastHeight=r,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,n)=>e.label??`Line ${n+1}`):this.data.labels||(this.data.lines??[]).map((e,n)=>`Line ${n+1}`)}draw(){this.config=Bt(this.data,this.options,this.overlay),this.config&&(this.geometry=Nt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let n=this.options.interactive===!1?null:{onToggle:t=>this.toggleLine(t),onRemove:this.options.onLineRemoved?t=>{this.removeLine(t,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(t)}:void 0};Gt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,n,this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((n,t)=>({values:n,label:this.data.labels?.[t]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,n=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let t=new Set;for(let l of this.hiddenLines)l<e?t.add(l):l>e&&t.add(l-1);this.hiddenLines=t,n||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function ue(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function je(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+ue(o.slice(1)):ue(o)}function lo(o){let e=`#${o}`;return`
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
    `}function Xt(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=lo(o),document.head.appendChild(e),e}var ro=0,We=16,dt=20,Yt=7,Re=class o{constructor(e,n,t={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.windowPlan=[];this.windowYs=[];this.windowHs=[];this.windowFrom=-1;this.lastWindowKey="";this.windowScrollTimer=null;this.onWindowScroll=()=>{this.windowPlan.length&&(this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.windowScrollTimer=setTimeout(()=>{if(this.windowScrollTimer=null,this.destroyed||!this.windowPlan.length)return;let e=this.scrollEl.scrollTop,n=this.windowYs.findIndex((d,h)=>d+this.windowHs[h]/2>e);n<0&&(n=this.windowYs.length-1);let{from:t,to:l}=o.windowItems(this.windowHs,n,this.options.rowWindow.height);Math.abs(this.scrollEl.scrollTop-this.windowYs[t])>1&&(this.scrollEl.scrollTop=this.windowYs[t]),this.windowFrom=t,this.reportWindow(this.windowPlan,t,l,"scroll")},150))};this.container=e,this.data=n,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...t},this.uid="hmx_"+ ++ro+"_"+Date.now().toString(36),this.styleEl=Xt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`.trim(),this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.scrollEl.addEventListener("scroll",this.onWindowScroll),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let n=this.container?.clientWidth??0;return n>0?n-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let n=this.options.columnWindow;if(!n)return{start:0,size:e};let t=Math.max(1,Math.min(n.size,e));return{start:Math.max(0,Math.min(n.start,e-t)),size:t}}maxColsFit(){let e=this.options,n=e.minColumnWidth??48,t=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/n),d=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(d,l))}resolveVisibleColumns(){let e=this.options,{start:n,size:t}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let f=[];for(let m=0;m<t;m++)f.push(n+m);return f}let l=this.maxColsFit();if(t<=l){let f=[];for(let m=0;m<t;m++)f.push(n+m);return f}let d=!!e.alwaysShowLastColumn,h=Math.max(1,l-(d?1:0)),a=Math.ceil(t/h),r=[];for(let f=n;f<n+t;f+=a)r.push(f);let c=n+t-1;return d&&r[r.length-1]!==c&&r.push(c),r}resolveCellWidth(e){let n=this.options;if(n.columnSizing==="fit"&&e>0){let t=n.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/e);return Math.max(n.minColumnWidth??1,l)}return n.cellWidth??48}resolveRowHeight(e,n=0){let t=this.options,l=t.cellHeight??28;if(t.rowSizing!=="fill"||e<=0)return l;let d=this.scrollEl.clientHeight-n;return e*l<d?Math.floor(d/e):l}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,n=!!e.darkMode;this.root.classList.toggle("hmx-dark",n),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let t=this.isInteractive();this.root.classList.toggle("hmx-static",!t);let l=e.rowHeaderWidth??100,d=e.headerHeight??26,h=this.data.columns,a=this.resolveVisibleColumns(),r=a.length,c=this.resolveCellWidth(r),f=this.data.rows,m=e.maxRows!=null?Math.min(f.length,e.maxRows):f.length,M=o.planRows(m,e.collapsedSections),s=0,T=0;for(let g of M)g.kind==="row"?s++:g.kind==="band"?T+=We:t&&(T+=dt);let P=this.resolveRowHeight(s,T),H=l+c*r,E=M.map(g=>g.kind==="row"?P:g.kind==="band"?We:t?dt:0),y=null;if(e.rowWindow&&E.reduce((g,$)=>g+$,0)>e.rowWindow.height){let g=M.findIndex($=>o.itemRows($)[1]>=e.rowWindow.start);y=o.windowItems(E,g<0?M.length-1:g,e.rowWindow.height)}let L=!!y&&e.rowWindowMode==="scroll",w=y&&!L?M.slice(y.from,y.to):M,I=w.filter(g=>g.kind==="row"),k=y&&!L?I[0]?.row??-1:0,S=y&&!L?I[I.length-1]?.row??-1:m-1,_=`${l}px repeat(${r}, ${c}px)`,F=e.showGrid?n?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",V=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${_};height:${d}px;width:${H}px;min-width:${H}px;">`;V+=`<div class="hmx-corner">${ue(e.cornerLabel??"")}</div>`;for(let g=0;g<r;g++)V+=`<div class="hmx-col">${je(h[a[g]].label)}</div>`;V+="</div>",this.hdrEl.innerHTML=V;let G={};for(let g of e.rowHighlights??[]){let $=new Set(g.rows);for(let z of g.rows){let W=!$.has(z-1);G[z]={color:g.color,className:g.className,top:W,bottom:!$.has(z+1),label:W?g.label:void 0}}}this.lastRowH=P;let oe=g=>{let $=f[g].label,z=e.rowClassName?.(g),W=G[g],D=W?" hmx-row-hl"+(W.top?" hmx-hl-top":"")+(W.bottom?" hmx-hl-bottom":"")+(W.className?" "+W.className:""):"",x=W?(W.color?` style="--hmx-hl:${ue(W.color)}"`:"")+(W.label?` data-hl-label="${ue(W.label)}"`:""):"",O=e.renderRowLabel?e.renderRowLabel(g):`<span class="hmx-cell-text">${je($)}</span>`,R=`<div class="hmx-row${z?" "+z:""}${D}" data-rowwrap="${g}"${x}>`;R+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${_};height:${P}px;">`,R+=`<div class="hmx-rowlabel" data-row="${g}" title="${ue($)}">${O}</div>`;for(let j=0;j<r;j++){let se=a[j],B=this.data.getCellValue(g,se),ae=B.highlighted&&B.highlightColor?`box-shadow:inset 0 0 0 2px ${B.highlightColor};`:"",Z=B.bold?"font-weight:bold;":"",Y=B.opacity!=null&&B.opacity<1?`opacity:${B.opacity};`:"",Me=g===k,Ie=g===S,de=j===0,fe=j===r-1,te="";Me&&de?te="border-top-left-radius:8px;":Me&&fe?te="border-top-right-radius:8px;":Ie&&de?te="border-bottom-left-radius:8px;":Ie&&fe&&(te="border-bottom-right-radius:8px;"),R+=`<div class="hmx-cell${B.className?" "+B.className:""}" data-row="${g}" data-col="${se}" style="background:${B.color};color:${B.textColor};padding:0 6px;${Y}${F}${ae}${Z}${te}"><span class="hmx-cell-text">${je(B.text)}</span></div>`}return R+="</div></div>",R},ie=(e.rowRegions??[]).filter(g=>g.start<=g.end),ee=ie.map(()=>({top:-1,bottom:-1})),pe=(g,$,z,W)=>{for(let D=0;D<ie.length;D++)$>=ie[D].start&&g<=ie[D].end&&(ee[D].top<0&&(ee[D].top=z),ee[D].bottom=W)},Q=`<div class="hmx-grid-inner" style="width:${H}px;min-width:${H}px;">`,q=0,ve=[];for(let g of w){if(ve.push(q),g.kind==="band"){let $=g.end-g.start+1,z,W=!1;for(let j=g.start;j<=g.end;j++)if(G[j]){W=!0,z=G[j].color;break}let D=$===1?"":"s",x=`${$} row${D} ${ue(g.label??"hidden")}`,O="hmx-collapsed"+(g.locked?" hmx-collapsed-locked":"")+(W?" hmx-collapsed-hl":""),R=t&&!g.locked;Q+=`<div class="${O}"${R?` data-cs="${g.index}"`:""} data-count="${g.shown}" style="width:${H}px;min-width:${H}px;height:${We}px;${z?`--hmx-hl:${ue(z)};`:""}" title="${R?`Click to show ${$} hidden row${D}`:x}"><span class="hmx-collapsed-inner">\u2026 ${x}</span></div>`,pe(g.start,g.end,q,q+We),q+=We;continue}if(g.kind==="handle"){if(!t)continue;let $=g.end-g.start+1;Q+=`<div class="hmx-expanded-toggle" data-cs="${g.index}" data-count="${g.shown}" style="width:${H}px;min-width:${H}px;" title="Collapse these ${$} rows"><span>\u2303 collapse ${$} row${$===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,q+=dt;continue}Q+=oe(g.row),pe(g.row,g.row,q,q+P),q+=P}for(let g=0;g<ie.length;g++){let $=ee[g];if($.top<0||$.bottom<=$.top)continue;let z=ie[g],W=z.color?`--hmx-region:${ue(z.color)};`:"",D=$.top+Yt,x=Math.max(0,$.bottom-$.top-2*Yt);x<=0||(Q+=`<div class="hmx-region-rail" style="top:${D}px;height:${x}px;${W}"></div>`,z.label&&(Q+=`<div class="hmx-region-label" style="top:${D}px;height:${x}px;${W}">${ue(z.label)}</div>`))}Q+="</div>";let me=this.scrollEl.scrollTop;if(this.scrollEl.innerHTML=Q,this.root.classList.toggle("hmx-window-scroll",L),this.root.classList.toggle("hmx-window-inert",L&&e.rowWindowScrollable===!1),this.scrollEl.style.maxHeight=L?`${e.rowWindow.height}px`:"",this.windowPlan=L?M:[],this.windowYs=L?ve:[],this.windowHs=L?E:[],L?(y.from!==this.windowFrom?this.scrollEl.scrollTop=ve[y.from]:this.scrollEl.scrollTop=me,this.windowFrom=y.from):this.windowFrom=-1,y?this.reportWindow(M,y.from,y.to,"render"):e.rowWindow&&this.reportWindow(M,-1,-1,"render"),this.pendingScroll){let{scrollBefore:g,bandTop:$,delta:z}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,$<g?g+z:g)}e.onVisibleColumnsChange&&!so(a,this.lastVisibleCols)?(this.lastVisibleCols=a,e.onVisibleColumnsChange(a)):this.lastVisibleCols=a}reportWindow(e,n,t,l){let d=n<0?null:{start:o.itemRows(e[n])[0],end:o.itemRows(e[t-1])[1]},h=d?`${d.start}-${d.end}`:"none";h!==this.lastWindowKey&&(this.lastWindowKey=h,this.options.onRowWindowChange?.(d,l))}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let n=e.target.closest(".hmx-cell");if(!n){this.clearHover();return}this.hoverCell!==n&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=n,n.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(n.dataset.row),parseInt(n.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let n=e.target,t=n.closest(".hmx-collapsed, .hmx-expanded-toggle");if(t){if(t.dataset.cs===void 0)return;let h=parseInt(t.dataset.cs);if(n.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:t.offsetTop,delta:-t.offsetHeight},this.options.onRemoveCollapse?.(h);return}let a=parseInt(t.dataset.count||"0"),r=t.classList.contains("hmx-collapsed"),c=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:t.offsetTop,delta:r?a*c:-a*c},this.options.onToggleCollapse?.(h);return}let l=n.closest(".hmx-rowlabel");if(l){this.options.onRowHeaderClick?.(parseInt(l.dataset.row),e);return}let d=n.closest(".hmx-cell");d&&this.options.onCellClick?.(parseInt(d.dataset.row),parseInt(d.dataset.col),e)})}static itemRows(e){return e.kind==="row"?[e.row,e.row]:[e.start,e.end]}static windowItems(e,n,t){let l=e.length;if(l===0)return{from:0,to:0};let d=l;for(let r=0;d>0&&r+e[d-1]<=t;)r+=e[--d];let h=Math.max(0,Math.min(n,d,l-1)),a=h;for(let r=0;a<l&&(a===h||r+e[a]<=t);)r+=e[a++];return{from:h,to:a}}static planRows(e,n=[]){let t=n.map((r,c)=>({start:Math.max(0,r.start),end:Math.min(e-1,r.end),collapsed:r.collapsed!==!1,locked:!!r.locked,label:r.label,index:c})).filter(r=>r.start<=r.end),l=new Array(e);for(let r of t)if(r.locked)for(let c=r.start;c<=r.end;c++)l[c]??(l[c]=r);let d=(r,c)=>{let f=0;for(let m=r;m<=c;m++)l[m]||f++;return f},h=new Map;for(let r of t)r.locked||d(r.start,r.end)===0||h.has(r.start)||h.set(r.start,r);let a=[];for(let r=0;r<e;){let c=h.get(r);if(c?.collapsed){a.push({kind:"band",start:c.start,end:c.end,index:c.index,locked:!1,label:c.label,shown:d(c.start,c.end)}),r=c.end+1;continue}c&&a.push({kind:"handle",start:c.start,end:c.end,index:c.index,shown:d(c.start,c.end)});let f=l[r];if(f){let m=r;for(;m+1<e&&l[m+1]===f&&!h.has(m+1);)m++;a.push({kind:"band",start:r,end:m,index:f.index,locked:!0,label:f.label,shown:0}),r=m+1;continue}a.push({kind:"row",row:r}),r++}return a}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let n=this.isResponsive();this.options={...this.options,...e},this.render(),!n&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let n=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!n)return;let t=n.offsetTop-this.scrollEl.clientHeight/2+n.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,t),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.scrollEl.removeEventListener("scroll",this.onWindowScroll),this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function so(o,e){if(o.length!==e.length)return!1;for(let n=0;n<o.length;n++)if(o[n]!==e[n])return!1;return!0}function ct(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let n=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(n){let t=n[1],l,d,h,a=1;return t.length===3||t.length===4?(l=parseInt(t[0]+t[0],16),d=parseInt(t[1]+t[1],16),h=parseInt(t[2]+t[2],16),t.length===4&&(a=parseInt(t[3]+t[3],16)/255)):(l=parseInt(t.slice(0,2),16),d=parseInt(t.slice(2,4),16),h=parseInt(t.slice(4,6),16),t.length===8&&(a=parseInt(t.slice(6,8),16)/255)),[l,d,h,a]}return null}function pt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function ao(o){let e=o;for(;e;){let n=pt(ct(getComputedStyle(e).backgroundColor));if(n!==null)return n;e=e.parentElement}if(typeof document<"u")for(let n of[document.body,document.documentElement]){if(!n)continue;let t=pt(ct(getComputedStyle(n).backgroundColor));if(t!==null)return t}return null}function co(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let n=pt(ct(e));return n===null?null:n<.5}function Ue(o,e){let n=ke(o),t=()=>{let h=ke(o);h!==n&&(n=h,e(h))},l=new MutationObserver(t);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let d=null;return typeof window<"u"&&window.matchMedia&&(d=window.matchMedia("(prefers-color-scheme: dark)"),d.addEventListener("change",t)),()=>{l.disconnect(),d?.removeEventListener("change",t)}}function ke(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=co();if(e!==null)return e;let n=ao(o??null);return n!==null?n<.5:!1}var po=60,qt=30,ho=22,uo=48,mo=18,Kt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},fo="#cc6622";function go(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Qt=41;function ht(o,e,n){let[t,l,d]=go(e),h=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(n){let r=c=>Math.round(Qt+(c-Qt)*h);return`rgb(${r(t)}, ${r(l)}, ${r(d)})`}let a=r=>Math.round(255-(255-r)*h);return`rgb(${a(t)}, ${a(l)}, ${a(d)})`}function bo(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Zt(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Te(o.slice(1)):Te(o)}function $e(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function Ge(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Jt(o,e,n,t){let l=_t(),d=t?.interactive!==!1,h=d||t?.layerNavigator!==!1,a;if(typeof o=="string"?a=document.querySelector(o):o instanceof Element?a=o:a=null,!a)return console.error("Container not found:",o),null;let r=lt(e),c=r.normalized,f=r.v2Data,m=zt(l);function M(i){return i?i.map(p=>({token:p.tokens?.[0]??"",color:p.color})).filter(p=>p.token!==""):[]}let s={ramp:n?.ramp||"purple",showGrid:n?.showGrid??!0,dimLow:n?.dimLowProb??!0,selectedRow:n?.selectedRow??null,selectedLayerIdx:n?.selectedLayer??null,viewStart:n?.viewStart??0,viewSize:n?.viewSize??c.layers.length,darkModeOverride:n?.darkMode??null,pinned:M(n?.pinnedGroups),pinnedRows:(n?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:n?.colorIndex??0,openPopup:null,rowHighlights:n?.rowHighlights??[],collapsedSections:(n?.collapsedSections??[]).map(i=>({...i})),rowStart:n?.rowStart??null},T=null,P=!d&&!!t?.maxRows&&t.maxRows>0,H=null,E=t?.scrollRowsActive!==!1,y={};function L(i,p){(y[i]||[]).forEach(u=>u(p))}let w=c.layers.length,I=c.tokens.length,k=[],S="",_=new Set,F=[];function V(i){return i>=0&&i<I&&!_.has(i)}function G(){w=c.layers.length,I=c.tokens.length,F=Ot(c),_=new Set;for(let b of F)for(let v=b.start;v<=b.end;v++)_.add(v);k=[];for(let b=0;b<w;b++){let v=0;for(let C=0;C<I;C++){let A=c.cells[C]?.[b];A&&A.prob>v&&(v=A.prob)}k.push(v)}let i=c.computedRows,p=i?i[i.length-1]??-1:I-1;S=c.cells[p]?.[w-1]?.token??"",s.pinnedRows=s.pinnedRows.filter(V),s.selectedRow!==null&&!V(s.selectedRow)&&(s.selectedRow=null),(s.viewSize>w||s.viewSize<1)&&(s.viewSize=w);let u=Math.max(0,w-s.viewSize);s.viewStart>u&&(s.viewStart=u),s.viewStart<0&&(s.viewStart=0)}G();function oe(i){let p=s.pinned.find(u=>u.token===i);return p?p.color:null}function ie(i){let p=s.pinned.findIndex(u=>u.token===i);p>=0?s.pinned.splice(p,1):(s.pinned.push({token:i,color:ze[s.colorIndex%ze.length]}),s.colorIndex++)}function ee(i,p){let u=f?.tracked?.[i];if(u&&Array.isArray(u[p]))return u[p];for(let b=0;b<w;b++){let v=c.cells[i]?.[b]?.topk.find(C=>C.token===p);if(v)return v.trajectory}return null}function pe(i){let p=s.pinnedRows.indexOf(i);return st[(p<0?0:p)%st.length]}function Q(i){return s.pinnedRows.indexOf(i)>=0}function q(i,p){for(let u of s.pinned){let b=ee(i,u.token);if(!b)continue;let v=0;for(let C of b)C!=null&&C>v&&(v=C);if(v>=p)return!0}return!1}function ve(i){let p=null,u=0;for(let b=0;b<w;b++){let v=c.cells[i]?.[b];v&&v.prob>u&&(u=v.prob,p=v.token)}return u>=.05?p:null}function me(i){if(!V(i))return;let p=s.pinnedRows.indexOf(i);if(p>=0){s.pinnedRows.splice(p,1);return}if(!q(i,.01)){let u=ve(i);u&&!oe(u)&&(s.pinned.push({token:u,color:ze[s.colorIndex%ze.length]}),s.colorIndex++)}s.pinnedRows.push(i)}function g(){return Kt[s.ramp]||Kt.purple}function $(){return s.darkModeOverride!==null?s.darkModeOverride:ke(a)}let z=[];function W(){return z.length>1?Math.max(1,z[1]-z[0]):1}a.innerHTML=`
        <div id="${l}"${d?' tabindex="-1"':' class="ll-static"'}>
            <div class="ll-heatmap" id="${l}_heatmap"${d?' tabindex="0"':""}></div>
            <div class="ll-nav${h?"":" ll-hidden"}" id="${l}_nav"></div>
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
    `.trim();let D=document.getElementById(l),x=document.getElementById(l+"_heatmap"),O=document.getElementById(l+"_nav"),R,j=document.getElementById(l+"_lp_wrap"),se=document.getElementById(l+"_lp_token"),B=document.getElementById(l+"_lp_box"),ae=document.getElementById(l+"_lp"),Z=document.getElementById(l+"_tt"),Y=document.getElementById(l+"_popup"),Me=document.getElementById(l+"_popup_hdr"),Ie=document.getElementById(l+"_popup_body");d&&document.body.appendChild(Y);let de=null,fe=null,te=!0,He=!1,Fe=d?getComputedStyle(D).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",Ae=!Fe;Ae&&D.classList.add("ll-fill");let Oe=(()=>{if(!Fe||/^(unbounded|none|auto)$/i.test(Fe))return null;let i=Fe.split("/").map(p=>parseFloat(p.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})();function mn(i,p){let u=p?"#bbb":"#555",b=i?` stroke-dasharray="${Te(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${b}/></svg>`}function wt(){return{rows:c.tokens.map(i=>({label:i})),columns:c.layers.map(i=>({label:String(i),value:0})),getCellValue:(i,p)=>{let u=c.cells[i][p],b=u.prob,v=$(),C=S!==""&&u.token===S,A=oe(u.token),N=b<.18;return{text:u.token,value:b,color:ht(b,C?fo:g(),v),textColor:bo(b,v),highlighted:!!A,highlightColor:A??void 0,opacity:s.dimLow&&N?.55:void 0}}}}function fn(i){let p=c.tokens[i],u=i===s.selectedRow||Q(i),b=d?`<span class="ll-fold-handle${T===i?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return Q(i)&&(b+=mn(pe(i).dash,$())),b+=Ge(p)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${Zt(p)}</span>`,b}function gn(i){return"ll-hmx-row"+(i===s.selectedRow||Q(i)?" ll-hmx-active":"")+(xn(i)?" ll-gen-row":"")}function bn(){let i=f?.completion;return i&&i.length?c.tokens.length-i.length:c.tokens.length}function xn(i){return i>=bn()}function vn(i,p){let u=Math.min(i,p),b=Math.max(i,p);s.collapsedSections=s.collapsedSections.filter(v=>v.end<u||v.start>b).concat({start:u,end:b,collapsed:!0}).sort((v,C)=>v.start-C.start)}function wn(i){T===null?(T=i,U()):T===i?(T=null,U()):(vn(T,i),T=null,U(),ce())}function yt(){let i={interactive:d,columnSizing:"fit",minColumnWidth:uo,maxVisibleColumns:mo,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:_e(s.viewStart),size:s.viewSize},rowSizing:Ae?"fill":"fixed",cellHeight:qt,rowHeaderWidth:po,headerHeight:ho+6,height:Ae||Oe!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:s.showGrid,darkMode:$(),renderRowLabel:fn,rowClassName:gn,rowHighlights:s.rowHighlights,collapsedSections:F.length?s.collapsedSections.concat(F):s.collapsedSections,onVisibleColumnsChange:p=>{z=p},...P?{rowWindow:{start:yn(),height:t.maxRows*qt},rowWindowMode:t?.scrollRows?"scroll":"clip",rowWindowScrollable:E,onRowWindowChange:(p,u)=>{H=p?{...p,total:I}:null,u==="scroll"&&p&&(s.rowStart=p.start),L("rowWindowChange",{window:H,source:u})}}:{}};return d?{...i,onToggleCollapse:p=>{let u=s.collapsedSections[p];u&&(u.collapsed=u.collapsed===!1,U(),ce())},onRemoveCollapse:p=>{s.collapsedSections.splice(p,1),U(),ce()},onCellHover:Vn,onCellClick:jn,onRowHeaderClick:(p,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){wn(p);return}me(p),U(),le(),ce()},onCellLeave:()=>{Ze(),Fn()}}:i}function yn(){if(s.rowStart!=null)return s.rowStart;let i=s.selectedRow??s.pinnedRows[0]??null;return i!=null?Math.max(0,i-Math.floor(t.maxRows/2)):Number.MAX_SAFE_INTEGER}function Ln(){if(Ae){let p=a.clientWidth;D.style.width=p>0?p+"px":"100%",D.style.maxWidth="100%",D.style.maxHeight="";return}D.style.width="",D.style.maxWidth="";let i=a.clientWidth||D.clientWidth;if(Oe&&i>0){let u=D.offsetHeight-R.getScrollElement().offsetHeight,b=(u>0?u:140)+90;D.style.maxHeight=Math.max(b,Math.round(i*Oe))+"px"}else D.style.maxHeight=""}function U(){Ln(),R.setOptions(yt())}function we(){if(!h)return;let i=g(),p=$(),u=_e(s.viewStart),b=W(),v=s.viewSize,C=v>=w,A=Lt(),N=v<=A[0],X='<span class="ll-nav-range-key">layers</span>';C?X+=`all ${w}`+(b>1?`<span class="ll-dim"> \xB7 every ${b}</span>`:""):X+=`${u}\u2013${u+v-1}<span class="ll-dim"> / ${w}</span>`+(b>1?`<span class="ll-dim"> \xB7 \u22481/${b}</span>`:"");let re="";for(let K=0;K<w;K++){let ye=k[K]||0,ot=Math.max(8,Math.round(ye*92));re+=`<div class="ll-skyline-bar" style="height:${ot}%;background:${ht(ye,i,p)}"></div>`}let ne=u/w*100,ge=v/w*100,he=[];for(let K=0;K<w;K+=8)he.push(K);he[he.length-1]!==w-1&&he.push(w-1);let be="",xe=Math.max(1,w-1);for(let K of he){let ye=K===w-1,ot=K===0,Gn=K/xe*100;be+=`<span class="ll-nav-tick" style="left:${Gn}%;transform:${ye?"translateX(-100%)":ot?"translateX(0)":"translateX(-50%)"}">${c.layers[K]}</span>`}O.innerHTML=`
            <div class="ll-nav-range">${X}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${l}_sky">
                    <div class="ll-skyline-bars">${re}</div>
                    <div class="ll-skyline-win" id="${l}_win" style="left:${ne}%;width:${ge}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${be}</div>
            </div>
            ${d?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${vo}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+v>=w?"disabled":""}>${wo}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${N?"disabled":""}>${yo}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${C?"disabled":""}>${Lo}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${xo}</button>
            </div>`:""}
        `,d&&Tn()}function kn(){let i=document.getElementById(l+"_win");if(!i)return;let p=Math.max(0,w-s.viewSize),u=Math.max(0,Math.min(p,s.viewStart));i.style.left=u/w*100+"%",i.style.width=s.viewSize/w*100+"%"}function Lt(){return Array.from(new Set([w,48,32,20,14,10,8])).filter(i=>i<=w&&i>=1).sort((i,p)=>i-p)}function _e(i){return Math.max(0,Math.min(Math.max(0,w-s.viewSize),i))}let Ye=!1;function kt(){Ye||(Ye=!0,requestAnimationFrame(()=>{Ye=!1,!He&&(U(),kn())}))}function qe(i){let p=_e(s.viewStart+i);p!==s.viewStart&&(s.viewStart=p,U(),we(),ce())}function Mn(i){let p=_e(i);p!==s.viewStart&&(s.viewStart=p,kt())}function Mt(i,p){let u=Lt(),b=u.findIndex(N=>N>=s.viewSize),v=b===-1?u.length-1:b,C=i<0?Math.max(0,v-1):Math.min(u.length-1,v+1),A=u[C];A!==s.viewSize&&(s.viewSize=A,s.viewStart=Math.max(0,Math.min(w-A,Math.round(p-A/2))),U(),we(),ce())}function St(i){Mt(i,s.viewStart+s.viewSize/2)}function Sn(){s.viewSize=w,s.viewStart=0,U(),we(),ce()}let Se=null;function Tn(){let i=document.getElementById(l+"_sky");if(!i)return;i.addEventListener("pointerdown",u=>{let b=i.getBoundingClientRect(),v=u.clientX-b.left,C=b.width/w,A=Math.max(0,w-s.viewSize),N=Math.max(0,Math.min(A,s.viewStart)),X=N*C,re=(N+s.viewSize)*C,ne=N;(v<X||v>re)&&(ne=_e(Math.round(v/C)-Math.floor(s.viewSize/2)),s.viewStart=ne,kt()),Se={startX:v,startStart:ne,layerW:C},i.classList.add("ll-grabbing");try{i.setPointerCapture(u.pointerId)}catch{}}),i.addEventListener("pointermove",u=>{if(!Se)return;let b=i.getBoundingClientRect(),C=(u.clientX-b.left-Se.startX)/Se.layerW;Mn(Math.round(Se.startStart+C))});let p=u=>{if(Se){Se=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(u.pointerId)}catch{}we(),ce()}};i.addEventListener("pointerup",p),i.addEventListener("pointercancel",p),i.addEventListener("wheel",u=>{u.preventDefault();let b=i.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){qe(u.deltaX>0?1:-1);return}let v=Math.round((u.clientX-b.left)/b.width*w);Mt(u.deltaY<0?-1:1,v)},{passive:!1})}function En(i,p,u=!1){V(i)&&(s.selectedRow=i,s.selectedLayerIdx=p??c.layers.length-1,U(),le(),u&&Cn(i),ce())}function Cn(i){R.scrollToRow(i)}function Ke(){requestAnimationFrame(()=>requestAnimationFrame(()=>{He||R.scrollToBottom()}))}let $n=.45,Hn=120,Rn=360;function Qe(){let i;if(Oe)i=(a.clientWidth||D.clientWidth)*Oe;else{let u=D.clientHeight;i=u>0?u:(D.clientWidth||900)*.6}let p=Math.round(i*$n);B.style.height=Math.max(Hn,Math.min(Rn,p))+"px"}function Tt(i){return i+"\xB7"+(Ge(c.tokens[i])?"bos":$e(c.tokens[i]))}function le(i){let p=s.pinnedRows.length>0?s.pinnedRows:s.selectedRow!==null?[s.selectedRow]:[],u=p.length>1,b=[];for(let C of p){let A=pe(C);for(let N of s.pinned){let X=ee(C,N.token);if(!X)continue;let re=$e(N.token);u&&(re+=" ("+Tt(C)+")"),b.push({values:X.map(ne=>ne??null),label:re,color:N.color,dashPattern:A.dash||void 0,removable:!1})}}let v=b.length===0&&!i;if(v)j.classList.add("ll-hidden");else{j.classList.remove("ll-hidden"),Qe(),se.textContent=s.pinnedRows.length>1?s.pinnedRows.length+" positions":p.length===1?"position "+Tt(p[0]):"";let C={lines:[],richLines:b,xLabels:c.layers},A={darkMode:$(),mode:"probability",autoScale:!0,legendPosition:b.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:d,pixelRatio:t?.pixelRatio};de?(de.setData(C),de.setOptions(A)):(ae.style.minHeight="0",de=new Le(ae,C,A)),i?de.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):de.setOverlay?.(null)}Ae&&v!==te?(te=v,requestAnimationFrame(()=>{He||(U(),Ke())})):te=v}let Pn=56,Dn=11,In=9.5,An=15;function On(i){let p=Dn*(i>0?i/Pn:1);return Math.max(In,Math.min(An,p))}function _n(i,p,u,b,v=0){let C=c.cells[i]?.[p];if(!C||!V(i))return;let A=g(),N=Ge(c.tokens[i])?"bos":$e(c.tokens[i]);Z.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${ht(C.prob,A,$())}"></span><span class="ll-tt-token">${Te($e(C.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(C.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${c.layers[p]} / ${c.layers[w-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${Te(N)}</span></div>`,Z.style.fontSize=On(v)+"px",Z.classList.add("ll-visible");let X=D.getBoundingClientRect(),re=Z.offsetWidth||200,ne=Z.offsetHeight||80,ge=8,he=14,be=u-X.left,xe=b-X.top,K=be+he;K+re>X.width-ge&&(K=be-he-re),K=Math.max(ge,Math.min(K,X.width-re-ge));let ye=xe-50;ye=Math.max(ge,Math.min(ye,X.height-ne-ge)),Z.style.left=K+"px",Z.style.top=ye+"px"}function Ze(){Z.classList.remove("ll-visible")}function zn(){Je(),fe=document.createElement("div"),fe.style.cssText="position:fixed;inset:0;z-index:49;",fe.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),Ct()}),document.body.appendChild(fe)}function Je(){fe&&(fe.remove(),fe=null)}function Wn(i,p,u){if(!c.cells[i]?.[p]||!V(i))return;let v=u.getBoundingClientRect();s.openPopup={row:i,layer:p},s.selectedRow=i,s.selectedLayerIdx=p;let C=Ge(c.tokens[i])?"bos":$e(c.tokens[i]);Me.innerHTML=`Layer <b>${c.layers[p]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${Te(C)}</code></div>`,Et(i,p),U(),le(),Y.style.visibility="hidden",Y.classList.add("ll-visible"),Bn(v),Y.style.visibility="",zn(),ce()}function Et(i,p){let u=c.cells[i][p],b="";u.topk.forEach((v,C)=>{let A=oe(v.token),N=A?`background:${A}22;border-left-color:${A};`:"";b+=`<div class="ll-topk${A?" ll-topk-pinned":""}" data-ki="${C}" style="${N}" title="click to track trajectory"><span class="ll-topk-tok">${Zt(v.token)}</span><span class="ll-topk-prob">${(v.prob*100).toFixed(1)}%</span></div>`}),Ie.innerHTML=b,Ie.querySelectorAll(".ll-topk").forEach(v=>{let C=parseInt(v.dataset.ki),A=u.topk[C];v.addEventListener("mouseenter",()=>{if(te)return;let N=ee(i,A.token);N&&le({values:N.map(X=>X??null),label:$e(A.token),color:"#999"})}),v.addEventListener("mouseleave",()=>{te||le()}),v.addEventListener("click",N=>{N.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(ie(A.token),U(),Et(i,p),le(),ce())})})}function Bn(i){let b=D.getBoundingClientRect(),v=Math.max(140,b.width-2*8),C=Math.max(120,b.height-2*8);Y.style.maxWidth=v+"px",Y.style.maxHeight=C+"px";let A=Y.offsetWidth||220,N=Y.offsetHeight||160,X=b.left+8,re=b.right-8-A,ne=b.top+8,ge=b.bottom-8-N,he=[{left:i.right+6,top:i.top},{left:i.left-6-A,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-N}],be=he[0];for(let xe of he)if(xe.left>=X&&xe.left<=re&&xe.top>=ne&&xe.top<=ge){be=xe;break}Y.style.left=Math.max(X,Math.min(be.left,Math.max(X,re)))+"px",Y.style.top=Math.max(ne,Math.min(be.top,Math.max(ne,ge)))+"px"}function Ct(){s.openPopup=null,Y.classList.remove("ll-visible"),Je(),U(),le()}d&&document.getElementById(l+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),Ct()});function Nn(i,p){if(te||!V(i))return;let u=c.cells[i]?.[p]?.token,b=u!=null?ee(i,u):null;b?le({values:b.map(v=>v??null),label:$e(u),color:"#999"}):le()}function Fn(){te||le()}function Vn(i,p){Nn(i,p)}function jn(i,p,u){if(!V(i))return;if(u.shiftKey){let v=c.cells[i]?.[p]?.token;v&&(ie(v),U(),le(),ce());return}Ze();let b=u.target.closest(".hmx-cell");b&&Wn(i,p,b)}R=new Re(x,wt(),yt());let Ve=R.getScrollElement(),$t=i=>{let p=i.target.closest(".hmx-cell");if(!p){Ze();return}_n(parseInt(p.dataset.row),parseInt(p.dataset.col),i.clientX,i.clientY,p.offsetWidth)},Ht=i=>{i.shiftKey&&i.target.closest(".hmx-rowlabel")&&i.preventDefault()};d&&(Ve.addEventListener("mousemove",$t),Ve.addEventListener("mousedown",Ht),x.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let p=i.key==="ArrowDown"?1:-1,u=(s.selectedRow??(p>0?-1:I))+p;for(;u>=0&&u<I&&!V(u);)u+=p;V(u)&&En(u,void 0,!0)}),O.addEventListener("click",i=>{let p=i.target.closest("[data-nav]");if(!p||p.hasAttribute("disabled"))return;let u=p.dataset.nav;u==="panL"?qe(-Math.max(1,Math.floor(s.viewSize/4))):u==="panR"?qe(Math.max(1,Math.floor(s.viewSize/4))):u==="zoomIn"?St(-1):u==="zoomOut"?St(1):u==="reset"&&Sn()}));function et(){U(),we(),le(),requestAnimationFrame(()=>{He||(U(),we(),te||Qe())})}function tt(){rt(D,$(),Y)}function ce(){L("stateChange",It())}et(),d&&Ke(),tt();let nt=0,Rt=a?.clientWidth??0,Pt=a?.clientHeight??0,Dt=new ResizeObserver(()=>{let i=a?.clientWidth??0,p=a?.clientHeight??0;i===Rt&&p===Pt||(Rt=i,Pt=p,!nt&&(nt=requestAnimationFrame(()=>{nt=0,!He&&(U(),te||Qe())})))});a&&Dt.observe(a);let Un=Ue(a,i=>{s.darkModeOverride===null&&(rt(D,i,Y),U(),we(),le())});function It(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:s.pinnedRows.map(i=>({pos:i,line:pe(i).name})),darkMode:s.darkModeOverride,rowHighlights:s.rowHighlights,collapsedSections:s.collapsedSections,rowStart:s.rowStart}}return{widget:{getState:It,setState:i=>{i.ramp!==void 0&&(s.ramp=i.ramp),i.showGrid!==void 0&&(s.showGrid=i.showGrid),i.dimLowProb!==void 0&&(s.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(s.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(s.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(s.viewStart=i.viewStart),i.viewSize!==void 0&&(s.viewSize=i.viewSize),i.colorIndex!==void 0&&(s.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(s.pinned=M(i.pinnedGroups)),i.pinnedRows!==void 0&&(s.pinnedRows=i.pinnedRows.map(p=>p.pos).filter(p=>typeof p=="number")),i.darkMode!==void 0&&(s.darkModeOverride=i.darkMode),i.rowHighlights!==void 0&&(s.rowHighlights=i.rowHighlights),i.collapsedSections!==void 0&&(s.collapsedSections=i.collapsedSections.map(p=>({...p}))),i.rowStart!==void 0&&(s.rowStart=i.rowStart),G(),tt(),et()},setData:i=>{r=lt(i),c=r.normalized,f=r.v2Data,s.selectedRow=null,s.selectedLayerIdx=null,s.pinned=[],s.pinnedRows=[],s.colorIndex=0,s.rowHighlights=[],s.collapsedSections=[],s.rowStart=null,T=null,G(),z=[],R.setData(wt()),et(),d&&Ke()},setTitle:()=>{},setThemeMode:i=>{s.darkModeOverride=!!i,tt(),U(),we(),le()},getThemeMode:()=>$(),getRowWindow:()=>H,setRowScrollActive:i=>{i!==E&&(E=i,U())},hasEntropyData:()=>!!f&&Array.isArray(f.entropy)&&f.entropy.length>0,hasRankData:()=>{if(!f?.tracked)return!1;for(let i of f.tracked)for(let p in i){let u=i[p];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,p)=>{(y[i]||(y[i]=[])).push(p)},off:(i,p)=>{y[i]=(y[i]||[]).filter(u=>u!==p)},destroy:()=>{He=!0,Un(),Dt?.disconnect(),Je(),Y.remove(),de&&(de.destroy(),de=null),Ve.removeEventListener("mousemove",$t),Ve.removeEventListener("mousedown",Ht),R?.destroy(),a&&(a.innerHTML="")}},styleEl:m}}var xo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',vo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',wo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',yo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Lo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Pe=class{constructor(e,n,t,l){this.widget=null;this.styleEl=null;let d=Jt(e,n,t,l);d&&(this.widget=d.widget,this.styleEl=d.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}getRowWindow(){return this.widget?.getRowWindow()??null}setRowScrollActive(e){this.widget?.setRowScrollActive(e)}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,n){this.widget?.on(e,n)}off(e,n){this.widget?.off(e,n)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var ko='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Mo='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',So='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',ut="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function mt(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function en(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${ut};`;let n={isOpen:!1,searchQuery:""},t=nn(e,o,n);return e.__tokenSelectorCleanup=t,e.__tokenSelectorState=n,e}function Be(o,e){let n=o.__tokenSelectorCleanup,t=o.__tokenSelectorState;n&&n();let l={isOpen:t?.isOpen??!1,searchQuery:t?.searchQuery??""},d=nn(o,e,l);o.__tokenSelectorCleanup=d,o.__tokenSelectorState=l}function tn(o){let e=o.__tokenSelectorCleanup;e&&e()}function nn(o,e,n){o.innerHTML="";let t=mt(e.darkMode),{allLabels:l,selectedIndices:d,defaultIndices:h,onChange:a}=e,r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let c=document.createElement("span");if(c.style.cssText=`font-size:11px;color:${t.fgMuted};`,c.textContent=`Tokens (${l.length})`,r.appendChild(c),!ft(d,h)){let k=document.createElement("button");k.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${t.fgMuted};font-family:${ut};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,k.innerHTML=`${ko} Reset`,k.addEventListener("mouseenter",()=>{k.style.color=t.fg}),k.addEventListener("mouseleave",()=>{k.style.color=t.fgMuted}),k.addEventListener("click",()=>{a(Array.from(h))}),r.appendChild(k)}o.appendChild(r);let m=document.createElement("div");m.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.inputBg};cursor:text;min-height:30px;`,m.addEventListener("click",()=>{L(),s.focus()});let M=Array.from(d).sort((k,S)=>k-S);for(let k of M){let S=To(k,l[k],e.darkMode,()=>{let _=new Set(d);_.delete(k),a(Array.from(_))});m.appendChild(S)}let s=document.createElement("input");s.type="text",s.placeholder=M.length===0?"Search tokens...":"",s.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${t.fg};font-family:${ut};min-width:60px;flex:1;padding:2px 0;`,s.addEventListener("input",()=>{n.searchQuery=s.value,y()}),s.addEventListener("focus",()=>L()),m.appendChild(s);let T=document.createElement("span");T.style.cssText=`display:flex;align-items:center;color:${t.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,T.innerHTML=So,T.addEventListener("click",k=>{k.stopPropagation(),n.isOpen?w():L()}),m.appendChild(T),o.appendChild(m);let P=document.createElement("div");P.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${t.bg};border:1px solid ${t.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let H=document.createElement("div");H.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",P.appendChild(H);let E=document.createElement("div");E.style.cssText=`padding:8px 12px;font-size:12px;color:${t.fgMuted};display:none;text-align:center;`,E.textContent="No tokens found",P.appendChild(E),o.appendChild(P);function y(){H.innerHTML="";let k=n.searchQuery.toLowerCase(),S=0;for(let _=0;_<l.length;_++){let F=l[_];if(k&&!F.toLowerCase().includes(k))continue;S++;let V=d.has(_),G=Eo(_,F,V,e.darkMode,()=>{let oe=new Set(d);V?oe.delete(_):oe.add(_),a(Array.from(oe))});H.appendChild(G)}E.style.display=S===0?"":"none"}function L(){n.isOpen||(n.isOpen=!0,P.style.display="",T.style.transform="rotate(180deg)",y())}function w(){n.isOpen&&(n.isOpen=!1,P.style.display="none",T.style.transform="",s.value="",n.searchQuery="")}function I(k){o.contains(k.target)||w()}return document.addEventListener("mousedown",I),n.isOpen&&(P.style.display="",T.style.transform="rotate(180deg)",s.value=n.searchQuery,y(),requestAnimationFrame(()=>{s.isConnected&&s.focus()})),()=>{document.removeEventListener("mousedown",I)}}function To(o,e,n,t){let l=mt(n),d=J[o%J.length],h=document.createElement("div");h.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,h.addEventListener("mouseenter",()=>{h.style.background=l.chipHoverBg,h.style.borderColor=l.chipHoverBorder}),h.addEventListener("mouseleave",()=>{h.style.background=l.chipBg,h.style.borderColor=l.chipBorder});let a=document.createElement("span");a.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${d};`,h.appendChild(a);let r=document.createElement("span");r.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,r.innerHTML=Ce(e),r.title=e,h.appendChild(r);let c=document.createElement("button");return c.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,c.innerHTML=Mo,c.addEventListener("mouseenter",()=>{c.style.color=l.badgeText}),c.addEventListener("mouseleave",()=>{c.style.color=l.fgMuted}),c.addEventListener("click",f=>{f.stopPropagation(),t()}),h.appendChild(c),h}function Eo(o,e,n,t,l){let d=mt(t),h=J[o%J.length],a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",a.addEventListener("mouseenter",()=>{a.style.background=d.hoverBg}),a.addEventListener("mouseleave",()=>{a.style.background="transparent"}),a.addEventListener("click",m=>{m.stopPropagation(),l()});let r=document.createElement("span");r.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${n?h:"transparent"};border:1.5px solid ${n?h:d.fgMuted};`,a.appendChild(r);let c=document.createElement("span");c.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${n?d.fg:d.fgMuted};`,c.innerHTML=Ce(e),c.title=e,a.appendChild(c);let f=o===0?"source pred":o===1?"target pred":null;if(f){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${d.badgeBg};color:${d.badgeText};border:1px solid ${d.badgeBorder};`,m.textContent=f,a.appendChild(m)}if(n){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;font-size:10px;color:${d.selectedText};`,m.textContent="selected",a.appendChild(m)}return a}function ft(o,e){if(o.size!==e.size)return!1;for(let n of o)if(!e.has(n))return!1;return!0}var Co={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},$o=["probability","prob_diff","rank"],De=class{constructor(e,n,t={}){this.modeButtons=new Map;this.container=e,this.allData=n,this.mode=t.mode??"probability",this.darkMode=t.darkMode??!1,this.transparentBackground=t.transparentBackground??!1,this.title=t.title,this.interactive=t.interactive!==!1,this.pixelRatio=t.pixelRatio,this.onTokenSelectionChange=t.onTokenSelectionChange,this.onModeChange=t.onModeChange;let l=n.tokenLabels?.length??n.lines?.length??0,d=t.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(a,r)=>r);this.defaultTokens=new Set(d),this.selectedTokens=new Set(t.selectedTokens??d),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=en(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let h=document.createElement("div");h.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(h),this.linePlot=new Le(h,this.buildPlotData(),this.buildPlotOptions()),h.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Be(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let n of $o){let t=document.createElement("button");t.textContent=Co[n],this.applyModeButtonStyles(t,n===this.mode),t.addEventListener("click",()=>this.setMode(n)),t.addEventListener("mouseenter",()=>{n!==this.mode&&(t.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),t.addEventListener("mouseleave",()=>{n!==this.mode&&(t.style.background="transparent")}),e.appendChild(t),this.modeButtons.set(n,t)}return e}applyModeBarStyles(e){let n=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${n};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,n){let t=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${n?l:"transparent"};color:${n?"#fff":t};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,n]of this.modeButtons)this.applyModeButtonStyles(n,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),n=this.allData.tokenLabels??[],t=Array.from(this.selectedTokens).sort((h,a)=>h-a),l=this.mode==="rank";return{richLines:t.filter(h=>h<e.length).map(h=>({values:l?e[h].map(a=>a+1):e[h],label:n[h]??`Token ${h}`,color:J[h%J.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let n=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,n)},(l,d)=>d));let t=new Set([...this.selectedTokens].filter(l=>l<n));this.selectedTokens=t.size>0?t:new Set(this.defaultTokens),Be(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Be(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let n=this.getModeLines().length,t=new Set(e.filter(l=>l<n));ft(t,this.selectedTokens)||(this.selectedTokens=t,Be(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){tn(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function gt(o,e,n){let t=Math.max(1,o),l=Math.max(1,e),d=Math.min(16e3/t,16e3/l,Math.sqrt(25e7/(t*l)));return Math.max(.01,Math.min(n>0?n:1,d))}var bt="http://www.w3.org/1999/xhtml",Xe="http://www.w3.org/2000/svg",Ho=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,Ro=new Set(["d","x","y","cx","cy","r","rx","ry"]),Po=new Set(["script","style","link","noscript","template"]),Do=[["border-top-style","border-top-width"],["border-right-style","border-right-width"],["border-bottom-style","border-bottom-width"],["border-left-style","border-left-width"],["outline-style","outline-width"],["column-rule-style","column-rule-width"]],Io=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,Ao=o=>o.replace(Io,e=>e.length===2?e:"\uFFFD"),xt=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(Xe,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,n){let t=e.namespaceURI??bt,l=`${t} ${e.localName}${n??""}`,d=this.cache.get(l);if(d)return d;let h=this.doc.createElementNS(t,e.localName);(t===Xe?this.svgRoot:this.doc.body).appendChild(h);let a=this.win.getComputedStyle(h,n??null);d=new Map;for(let r=0;r<a.length;r++){let c=a.item(r);d.set(c,a.getPropertyValue(c))}return h.remove(),this.cache.set(l,d),d}destroy(){this.frame.remove()}};function on(o,e,n,t){let l="",d=new Set;for(let h=0;h<o.length;h++){let a=o.item(h);if(Ho.test(a)||t&&Ro.has(a))continue;let r=o.getPropertyValue(a);r===e.get(a)&&(!n||r===n.getPropertyValue(a))||(l+=`${a}:${r};`,d.add(a))}for(let[h,a]of Do){let r=o.getPropertyValue(h);r&&r!=="none"&&r!=="hidden"&&!d.has(a)&&(l+=`${a}:${o.getPropertyValue(a)};`)}return l}function ln(o,e,n){if(o.nodeType===Node.TEXT_NODE)return document.createTextNode(o.nodeValue??"");if(o.nodeType!==Node.ELEMENT_NODE)return null;let t=o;if(Po.has(t.localName.toLowerCase()))return null;let l=getComputedStyle(t);if(l.display==="none")return null;let d=t instanceof HTMLCanvasElement,h;if(d){h=document.createElement("img");try{h.setAttribute("src",t.toDataURL("image/png"))}catch{}}else h=t.cloneNode(!1);h.setAttribute("style",on(l,n.sandbox.defaults(t),e,t.namespaceURI===Xe));let a="",r="";for(let c of["::before","::after"]){let f=getComputedStyle(t,c),m=f.getPropertyValue("content");!m||m==="none"||m==="normal"||f.display==="none"||(r||(r=`nns-snap-${n.nextClass++}`),a+=`.${r}${c}{${on(f,n.sandbox.defaults(t,c),l,!1)}}`)}if(r&&(h.setAttribute("class",`${h.getAttribute("class")??""} ${r}`.trim()),n.rules.push(a)),!d)for(let c of Array.from(t.childNodes)){let f=ln(c,l,n);f&&h.appendChild(f)}return h}function Oo(o){return new Promise((e,n)=>{let t=new Image;t.onload=()=>e(t),t.onerror=()=>n(new Error("Snapshot failed: the browser could not render the captured element.")),t.src=o})}async function Ne(o,e={}){let n=Math.max(0,e.padding??0),t=o.getBoundingClientRect(),l=Math.ceil(t.width),d=Math.ceil(t.height);if(l===0||d===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let h=l+2*n,a=d+2*n,r=gt(h,a,e.scale??2),c=new xt,f;try{let H={sandbox:c,rules:[],nextClass:0},E=ln(o,null,H);if(!E)throw new Error("Snapshot failed: the element is not displayed.");E.setAttribute("style",E.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${l}px;height:${d}px;box-sizing:border-box;`);let y=document.createElementNS(bt,"div");if(y.setAttribute("style",`width:${h}px;height:${a}px;padding:${n}px;margin:0;box-sizing:border-box;`),H.rules.length){let L=document.createElementNS(bt,"style");L.textContent=H.rules.join(""),y.appendChild(L)}y.appendChild(E),f=Ao(new XMLSerializer().serializeToString(y))}finally{c.destroy()}let m=`<svg xmlns="${Xe}" width="${h*r}" height="${a*r}" viewBox="0 0 ${h} ${a}"><foreignObject x="0" y="0" width="${h}" height="${a}">${f}</foreignObject></svg>`,M=await Oo("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(m)),s=document.createElement("canvas");s.width=Math.round(h*r),s.height=Math.round(a*r);let T=s.getContext("2d");if(!T)throw new Error("Snapshot failed: no 2D canvas context.");e.background&&(T.fillStyle=e.background,T.fillRect(0,0,s.width,s.height)),T.drawImage(M,0,0,s.width,s.height);let P;try{P=s.toDataURL("image/png")}catch(H){throw new Error(`Snapshot failed: this browser won't read back the rendered image (${H.message}).`)}return{dataUrl:P,width:h,height:a,scale:r,toBlob:()=>new Promise((H,E)=>s.toBlob(y=>y?H(y):E(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var rn={light:"#ffffff",dark:"hsl(0 0% 16%)"};function _o(){return new Promise(o=>{let e=setTimeout(o,100);requestAnimationFrame(()=>{clearTimeout(e),o()})})}async function zo(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let o=0;o<3;o++)await _o()}async function sn(o,e={}){let n=Math.max(200,Math.round(e.width??880)),t=e.darkMode??!1,l=e.scale??2,d=e.background===void 0?t?rn.dark:rn.light:e.background,h=document.createElement("div");h.setAttribute("aria-hidden","true"),h.style.cssText=`position:fixed;left:-100000px;top:0;width:${n}px;pointer-events:none;`;let a=document.createElement("div");h.appendChild(a),document.body.appendChild(h);let r=()=>{},c=()=>{};try{if(o.kind==="logit-lens"){let m=new Pe(a,o.data,{...o.uiState,darkMode:t},{interactive:!1,pixelRatio:l,maxRows:e.maxRows,layerNavigator:e.layerNavigator});r=()=>m.destroy(),c=()=>m.getRowWindow()}else{let m=Math.max(160,Math.round(e.height??n*.5));h.style.height=`${m}px`;let M=new De(a,o.data,{mode:o.mode,selectedTokens:o.selectedTokens,title:o.title,darkMode:t,transparentBackground:!0,interactive:!1,pixelRatio:l});r=()=>M.destroy()}return await zo(),{...await Ne(h,{scale:l,background:d,padding:e.padding}),rows:c()}}finally{r(),h.remove()}}function Wo(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function vt(o,e,n){let t=Wo(o);if(!t)return null;let l=e(t);if(n===void 0){let d=Ue(t,a=>l.setThemeMode(a)),h=l.destroy.bind(l);l.destroy=()=>{d(),h()}}return l}function cn(o,e,n,t){return new Pe(o,e,n,t)}function pn(o,e,n){return vt(o,t=>new Le(t,e,{darkMode:ke(t),...n}),n?.darkMode)}var an={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Bo(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function dn(o,e){if(typeof o.getCellValue=="function")return o;let n=o,t=n.values??[],l=n.texts,d=n.rowLabels??t.map((E,y)=>String(y)),h=n.colLabels??(t[0]??[]).map((E,y)=>String(y)),a=n.ramp??"purple",r=an[a]??(a[0]==="#"?a:an.purple),[c,f,m]=Bo(r),[M,s]=n.valueDomain??[0,1],T=s-M,P=e?38:255,H=E=>Math.max(0,Math.min(1,E));return{rows:d.map(E=>({label:E})),columns:h.map(E=>({label:E,value:0})),getCellValue:(E,y)=>{let L=t[E]?.[y]??0,w=H(T>0?(L-M)/T:L),I=S=>Math.round(P+(S-P)*w);return{text:l?l[E]?.[y]??"":Number.isInteger(L)?String(L):L.toFixed(2),value:L,color:`rgb(${I(c)}, ${I(f)}, ${I(m)})`,textColor:w>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function hn(o,e,n){return vt(o,t=>{let l=n?.darkMode??ke(t),d=new Re(t,dn(e,l),{darkMode:l,...n}),h=d.setThemeMode.bind(d);return d.setThemeMode=a=>{d.setData(dn(e,a)),h(a)},d},n?.darkMode)}function un(o,e,n){return vt(o,t=>new De(t,e,{darkMode:ke(t),...n}),n?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=cn,window.LinePlotWidget=pn,window.HeatmapTableWidget=hn,window.ActivationPatchingWidget=un);return Zn(No);})();
//# sourceMappingURL=charts.js.map
