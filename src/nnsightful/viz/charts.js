"use strict";var InterpTools=(()=>{var et=Object.defineProperty;var Nn=Object.getOwnPropertyDescriptor;var Fn=Object.getOwnPropertyNames;var Vn=Object.prototype.hasOwnProperty;var jn=(n,e)=>{for(var t in e)et(n,t,{get:e[t],enumerable:!0})},Un=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Fn(e))!Vn.call(n,r)&&r!==t&&et(n,r,{get:()=>e[r],enumerable:!(i=Nn(e,r))||i.enumerable});return n};var Gn=n=>Un(et({},"__esModule",{value:!0}),n);var Io={};jn(Io,{ActivationPatchingWidget:()=>an,HeatmapTableWidget:()=>sn,LinePlotWidget:()=>rn,LogitLensWidget:()=>ln,captureElement:()=>_e,snapshotChart:()=>tn});function Ht(n){return n.completion&&n.completion.length?[...n.input,...n.completion]:n.input}function Xn(n){let e=n.positions,t=Ht(n).length;if(!e||e.length===t&&e.every((d,l)=>d===l))return{data:n,computedRows:null};let i=new Array(t);e.forEach((d,l)=>{Number.isInteger(d)&&d>=0&&d<t&&l<n.tracked.length&&(i[d]=l)});let r=Array.from({length:t},(d,l)=>l),c=(d,l,h)=>{let b=i[l];return b!==void 0&&d&&b<d.length?d[b]:h()};return{data:{...n,positions:null,tracked:r.map(d=>c(n.tracked,d,()=>({}))),topk:n.topk.map(d=>r.map(l=>c(d,l,()=>[]))),entropy:n.entropy?n.entropy.map(d=>r.map(l=>c(d,l,()=>0))):n.entropy},computedRows:r.filter(d=>i[d]!==void 0)}}function Pt(n){let e=n.computedRows;if(!e)return[];let t=n.tokens.length,i=[],r=0;for(let c of[...e,t])c>r&&i.push({start:r,end:c-1,collapsed:!0,locked:!0,label:"not computed"}),r=c+1;return i}function tt(n){let e=n;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:t,computedRows:i}=Xn(n),r=t.layers.length,c=Ht(t),a=c.length,d=[];for(let h=0;h<a;h++){let b=[],m=t.tracked[h]??{};for(let s=0;s<r;s++){let L=t.topk[s]?.[h]??[],T=[];for(let v=0;v<L.length;v++){let M=L[v],P=m[M]||[],E=P[s]||0;T.push({token:M,prob:E,trajectory:P})}let C=T[0]||{token:"",prob:0,trajectory:[]};b.push({token:C.token,prob:C.prob,trajectory:C.trajectory,topk:T})}d.push(b)}return{normalized:{layers:t.layers,tokens:c,cells:d,meta:t.meta||{},computedRows:i},v2Data:t}}function Rt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Le(n){let e=document.createElement("div");return e.textContent=n,e.innerHTML}function qn(n){let e=`#${n}`;return`
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

        /* Flex roles for the card's stacked regions (see #${n} above).
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
        #${n}_popup {
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
        #${n}_popup.ll-visible { display: flex; }
        #${n}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${n}_popup .ll-lead-space { color: #3b82f6; }
        #${n}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${n}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${n}_popup .ll-popup-header {
            flex: 0 0 auto;
            font-weight: 600; font-size: 13px; padding-right: 16px;
            margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--p-line);
        }
        #${n}_popup .ll-popup-sub {
            font-weight: 400; font-size: 11.5px; color: var(--p-text-2); margin-top: 3px;
        }
        #${n}_popup .ll-popup-sub code {
            font-family: var(--p-mono); background: var(--p-code);
            padding: 1px 5px; border-radius: 3px;
        }
        #${n}_popup .ll-popup-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
        #${n}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${n}_popup .ll-topk:hover { background: var(--p-hover); }
        #${n}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            -webkit-user-select: text; user-select: text;
        }
        #${n}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function Dt(n){let e=document.createElement("style");return e.textContent=qn(n),document.head.appendChild(e),e}function nt(n,e,...t){let i=r=>{e?r.classList.add("ll-dark"):r.classList.remove("ll-dark")};i(n),e?n.style.colorScheme="dark":n.style.colorScheme="";for(let r of t)r&&i(r)}var Ie=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],ot=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var ee=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ke(n){return n.richLines&&n.richLines.length>0?n.richLines.map((t,i)=>({values:t.values,label:t.label??`Line ${i+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(n.lines??[]).map((t,i)=>({values:t,label:n.labels?.[i]??`Line ${i+1}`}))}function Me(n){if(!n)return"";let e=[],t=0;n.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let i="";for(;t<n.length;t++){let r=n[t];r===`
`?(i&&(e.push(It(i)),i=""),e.push('<span style="color:#3b82f6">\\n</span>')):i+=r}return i&&e.push(It(i)),e.join("")}function It(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Yn(n){if(n>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(n<=t)return t;return 1}function At(n,e,t){let i=ke(n),r=i.length>0?i[0].values.length:t?.values.length??n.xLabels?.length??0;if(r===0)return null;let c=e.mode||"probability",a=e.minValue,d=e.maxValue;if(a===void 0||d===void 0||e.autoScale){let l=[];for(let m of i)if(!m.isOverlay)for(let s of m.values)s!==null&&l.push(s);if(t)for(let m of t.values)m!==null&&l.push(m);if(l.length===0)return{numLayers:r,minValue:e.logScale?1:0,maxValue:1,numLines:i.length};let h=1/0,b=-1/0;for(let m of l)m<h&&(h=m),m>b&&(b=m);if(e.centerYAxisAtZero){let s=Math.max(Math.abs(h),Math.abs(b))*1.1;a=-s,d=s}else if(e.logScale){if(a===void 0&&(a=Math.max(1,Math.floor(h))),d===void 0||e.autoScale){let m=Math.log(Math.max(1,h)),s=Math.log(Math.max(1,b)),L=s+.15*Math.max(1,s-m);d=Math.ceil(Math.exp(L))}}else a===void 0&&(a=c==="probability"?0:c==="rank"?Math.max(1,Math.floor(h)):Math.floor(h*.9)),(d===void 0||e.autoScale)&&(c==="rank"?d=Math.ceil(b*1.1):c==="probability"?d=e.autoScale?Yn(Math.max(b,.001)):Math.min(b*1.1,1):d=b*1.1)}return{numLayers:r,minValue:a,maxValue:d,numLines:i.length}}function _t(n,e,t,i,r,c,a,d){let l=n.getContext("2d"),h=e.getBoundingClientRect(),b=i.pixelRatio??(window.devicePixelRatio||1);n.width=h.width*b,n.height=h.height*b,n.style.width=`${h.width}px`,n.style.height=`${h.height}px`,l.scale(b,b);let m=h.width,s=h.height,L=i.darkMode??!1,T=i.title,C=i.mode||"probability",v=i.invertYAxis??!1,M=i.centerYAxisAtZero??!1,P=i.logScale??!1,E=i.xAxisLabel||"Layer",z=i.yAxisLabel||"Probability",D=i.xRangeStart??0;D>=r.numLayers-1&&(console.warn(`xRangeStart (${D}) is >= numLayers-1 (${r.numLayers-1}), clamping to 0`),D=0);let w=i.showDataPoints??!0,k={top:T?48:24,right:24,bottom:56,left:72},A=m-k.left-k.right,O=s-k.top-k.bottom,G={margin:k,chartWidth:A,chartHeight:O,width:m,height:s},f={background:L?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:L?"#52525b":"#a1a1aa",grid:L?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:L?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:L?"#e4e4e7":"#27272a"};i.transparentBackground?l.clearRect(0,0,m,s):(l.fillStyle=f.background,l.fillRect(0,0,m,s)),T&&(l.fillStyle=f.titleText,l.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="left",l.fillText(T,k.left,28));let $=r.numLayers-1-D,B=y=>$<=0?k.left+A/2:k.left+(y-D)/$*A,I=P?Math.log(Math.max(1,r.minValue)):0,V=P?Math.log(Math.max(1,r.maxValue)):0,Q=y=>{let R;if(P){let W=Math.log(Math.max(1,y));R=V-I>0?(W-I)/(V-I):.5}else R=(y-r.minValue)/(r.maxValue-r.minValue);return v?k.top+R*O:k.top+O-R*O};l.setLineDash([4,4]),l.strokeStyle=f.grid,l.lineWidth=1;let X=[],J=r.maxValue-r.minValue,Y=5;if(P){let y=new Set;for(let j=0;j<Y;j++){let _=I+j/(Y-1)*(V-I),re=Math.round(Math.exp(_));y.has(re)||(y.add(re),X.push(re))}let R=Math.round(Math.exp(I)),W=Math.round(Math.exp(V));y.has(R)||X.unshift(R),y.has(W)||X.push(W)}else if(C==="rank")for(let y=0;y<Y;y++)X.push(Math.round(r.minValue+y/(Y-1)*J));else for(let y=0;y<Y;y++)X.push(r.minValue+y/(Y-1)*J);if(X.forEach(y=>{let R=Q(y);l.beginPath(),l.moveTo(k.left,R),l.lineTo(k.left+A,R),l.stroke()}),l.setLineDash([]),M){let y=Q(0);l.beginPath(),l.strokeStyle=L?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",l.lineWidth=1.5,l.moveTo(k.left,y),l.lineTo(k.left+A,y),l.stroke(),l.lineWidth=1}l.fillStyle=f.text,l.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="right",l.textBaseline="middle",X.forEach(y=>{let R=Q(y),W;C==="probability"?W=y.toFixed(2):C==="prob_diff"?W=y>=0?`+${y.toFixed(2)}`:y.toFixed(2):W=Math.round(y).toString(),l.fillText(W,k.left-16,R)}),l.textAlign="center",l.textBaseline="top";let F=t.xLabels&&t.xLabels.length>0,K=Math.max(1,Math.ceil(r.numLayers/8));for(let y=0;y<r.numLayers;y+=K){let R=B(y);if(R<k.left-5||R>k.left+A+5)continue;let W=F?String(t.xLabels[y]??y):y.toString();l.fillText(W,R,k.top+O+12)}if((r.numLayers-1)%K!==0){let y=F?String(t.xLabels[r.numLayers-1]??r.numLayers-1):(r.numLayers-1).toString();l.fillText(y,B(r.numLayers-1),k.top+O+12)}l.strokeStyle=L?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",l.lineWidth=1.5,l.beginPath(),l.moveTo(k.left,k.top),l.lineTo(k.left,k.top+O),l.lineTo(k.left+A,k.top+O),l.stroke(),l.fillStyle=f.textMuted,l.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="center",l.textBaseline="top",l.fillText(E.toUpperCase(),k.left+A/2,s-16),l.save(),l.translate(14,k.top+O/2),l.rotate(-Math.PI/2),l.textAlign="center",l.textBaseline="top",l.fillText(z.toUpperCase(),0,0),l.restore();let ge=ke(t);function te(y,R,W,j,_){l.beginPath(),l.strokeStyle=R,l.lineWidth=W,_!==void 0&&(l.globalAlpha=_),j?l.setLineDash(j.split(",").map(Number)):l.setLineDash([]);let re=!1;for(let pe=0;pe<y.length;pe++){let ne=y[pe];if(ne===null){re=!1;continue}let he=B(pe),se=Q(ne);re?l.lineTo(he,se):(l.moveTo(he,se),re=!0)}l.stroke(),l.setLineDash([]),_!==void 0&&(l.globalAlpha=1)}let Te=L?"#3f3f46":"#d4d4d8";if(l.lineCap="round",l.lineJoin="round",ge.forEach((y,R)=>{!c.has(R)||y.isOverlay||te(y.values,Te,2,void 0,.35)}),ge.forEach((y,R)=>{if(c.has(R)||y.isOverlay)return;let W=y.color??ee[R%ee.length];te(y.values,W,4,y.dashPattern,.15),te(y.values,W,2,y.dashPattern),w&&y.values.forEach((j,_)=>{if(j===null)return;let re=B(_),pe=Q(j),ne=a?.lineIdx===R&&a?.layerIdx===_;l.beginPath(),l.strokeStyle=W,l.lineWidth=ne?2:1.5,l.arc(re,pe,ne?5:3.5,0,Math.PI*2),l.stroke(),l.beginPath(),l.fillStyle=L?"#18181b":"#ffffff",l.arc(re,pe,ne?3.5:2.5,0,Math.PI*2),l.fill()})}),ge.forEach((y,R)=>{if(!y.isOverlay||c.has(R))return;let W=y.color??"#999";te(y.values,W,1.5,y.dashPattern??"4,2",.7)}),d){let y=d.color??"#999";te(d.values,y,1.5,d.dashPattern??"4,2",.7)}return G}function Ot(n){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",n.appendChild(e),e}function zt(n,e,t,i,r,c,a,d,l){let{margin:h,chartWidth:b,chartHeight:m}=r,s=i.xRangeStart??0,L=a-1-s,T=i.logScale?Math.log(Math.max(1,d)):0,C=i.logScale?Math.log(Math.max(1,l)):0;if(n<h.left||n>h.left+b||e<h.top||e>h.top+m)return null;let v=ke(t),M=null,P=1/0,E=20;for(let z=0;z<v.length;z++){if(c.has(z))continue;let D=v[z];if(!D.isOverlay)for(let w=0;w<D.values.length;w++){let k=D.values[w];if(k===null)continue;let A=L<=0?h.left+b/2:h.left+(w-s)/L*b,O;if(i.logScale){let $=Math.log(Math.max(1,k));O=C-T>0?($-T)/(C-T):.5}else O=(k-d)/(l-d);let G=i.invertYAxis?h.top+O*m:h.top+m-O*m,f=Math.sqrt((n-A)**2+(e-G)**2);f<P&&f<E&&(P=f,M={visible:!0,x:A,y:G,lineIdx:z,layerIdx:w,value:k,label:D.label,color:D.color??ee[z%ee.length]})}}return M}function it(n,e,t,i,r,c,a){if(!e){n.style.opacity="0";return}let d=i?"#27272a":"#fff",l=i?"#3f3f46":"#e4e4e7",h=i?"#fafafa":"#18181b",b=i?"#a1a1aa":"#71717a",s=e.x>t/2?"calc(-100% - 12px)":"12px";n.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${s},-50%);`;let L=String(r?r[e.layerIdx]??e.layerIdx:e.layerIdx);n.innerHTML=`
        <div style="background:${d};border:1px solid ${l};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${h};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${Me(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${b}">${c??"Layer"}</span>
                    <span style="font-weight:500;color:${h}">${L}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${b}">Value</span>
                    <span style="font-weight:500;color:${h}">${a==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Qn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Kn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Zn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Bt(n){let e=document.createElement("div");return Wt(e,n),e}function Wt(n,e){let t=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",i=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";n.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${t};backdrop-filter:blur(12px);border:1px solid ${i};align-self:flex-start;`}function Nt(n,e,t,i,r,c){Wt(n,i),n.innerHTML="";let a=i?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",d=i?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",l=i?"#a1a1aa":"#71717a",h=i?"#3f3f46":"#d4d4d8",b="rgba(161,161,170,0.3)",m=i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",s=c?ke(c):[];e.forEach((L,T)=>{let C=s[T];if(C?.isOverlay)return;let v=C?.color??ee[T%ee.length],M=t.has(T),P=C?.removable??!1,E=document.createElement(r?"button":"div");E.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:${r?"pointer":"default"};transition:all 0.15s;opacity:${M?"0.5":"1"};`,r&&(E.addEventListener("mouseenter",()=>{E.style.background=m}),E.addEventListener("mouseleave",()=>{E.style.background="transparent"}),E.addEventListener("click",()=>r.onToggle(T)));let z=document.createElement("span");z.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${M?b:v};background:${M?h:"transparent"};`,E.appendChild(z);let D=document.createElement("span");if(D.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${M?d:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,D.title=L,D.innerHTML=Me(L),E.appendChild(D),!r){n.appendChild(E);return}if(P&&r.onRemove){let w=document.createElement("span");w.style.cssText=`margin-left:auto;cursor:pointer;color:${l};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,w.innerHTML=Zn,w.title="Remove",w.addEventListener("click",k=>{k.stopPropagation(),r.onRemove(T)}),E.appendChild(w),E.addEventListener("mouseenter",()=>{w.style.opacity="0.6"}),E.addEventListener("mouseleave",()=>{w.style.opacity="0"})}else{let w=document.createElement("span");w.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${l};opacity:${M?"0.6":"0"};display:flex;align-items:center;`,w.innerHTML=M?Kn:Qn,E.appendChild(w),M||(E.addEventListener("mouseenter",()=>{w.style.opacity="0.4"}),E.addEventListener("mouseleave",()=>{w.style.opacity="0"}))}n.appendChild(E)})}var ve=class{constructor(e,t,i={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),i=e.clientX-t.left,r=e.clientY-t.top;this.tooltip=zt(i,r,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),it(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,it(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...i},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer);let r=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${r?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=Ot(this.chartContainer),this.legendEl=Bt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),r&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(c=>{if(this.destroyed)return;let a=c[0];if(!a)return;let d=Math.round(a.contentRect.width),l=Math.round(a.contentRect.height);d===this.lastWidth&&l===this.lastHeight||(this.lastWidth=d,this.lastHeight=l,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=At(this.data,this.options,this.overlay),this.config&&(this.geometry=_t(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let t=this.options.interactive===!1?null:{onToggle:i=>this.toggleLine(i),onRemove:this.options.onLineRemoved?i=>{this.removeLine(i,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(i)}:void 0};Nt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,t,this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,i)=>({values:t,label:this.data.labels?.[i]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let i=new Set;for(let r of this.hiddenLines)r<e?i.add(r):r>e&&i.add(r-1);this.hiddenLines=i,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function ce(n){if(typeof document>"u")return String(n??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(n??""),e.innerHTML}function Be(n){return n==null?"":n.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+ce(n.slice(1)):ce(n)}function Jn(n){let e=`#${n}`;return`
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
    `}function Ft(n){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Jn(n),document.head.appendChild(e),e}var eo=0,We=16,Vt=20,jt=7,Ce=class n{constructor(e,t,i={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...i},this.uid="hmx_"+ ++eo+"_"+Date.now().toString(36),this.styleEl=Ft(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let i=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-i)),size:i}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,i=e.rowHeaderWidth??100,r=Math.floor((this.availWidth()-i)/t),c=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(c,r))}resolveVisibleColumns(){let e=this.options,{start:t,size:i}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let b=[];for(let m=0;m<i;m++)b.push(t+m);return b}let r=this.maxColsFit();if(i<=r){let b=[];for(let m=0;m<i;m++)b.push(t+m);return b}let c=!!e.alwaysShowLastColumn,a=Math.max(1,r-(c?1:0)),d=Math.ceil(i/a),l=[];for(let b=t;b<t+i;b+=d)l.push(b);let h=t+i-1;return c&&l[l.length-1]!==h&&l.push(h),l}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let i=t.rowHeaderWidth??100,r=Math.floor((this.availWidth()-i)/e);return Math.max(t.minColumnWidth??1,r)}return t.cellWidth??48}resolveRowHeight(e,t=0){let i=this.options,r=i.cellHeight??28;if(i.rowSizing!=="fill"||e<=0)return r;let c=this.scrollEl.clientHeight-t;return e*r<c?Math.floor(c/e):r}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let i=this.isInteractive();this.root.classList.toggle("hmx-static",!i);let r=e.rowHeaderWidth??100,c=e.headerHeight??26,a=this.data.columns,d=this.resolveVisibleColumns(),l=d.length,h=this.resolveCellWidth(l),b=this.data.rows,m=e.maxRows!=null?Math.min(b.length,e.maxRows):b.length,s=n.planRows(m,e.collapsedSections),L=0,T=0;for(let f of s)f.kind==="row"?L++:f.kind==="band"?T+=We:i&&(T+=Vt);let C=this.resolveRowHeight(L,T),v=r+h*l,M=`${r}px repeat(${l}, ${h}px)`,P=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",E=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${M};height:${c}px;width:${v}px;min-width:${v}px;">`;E+=`<div class="hmx-corner">${ce(e.cornerLabel??"")}</div>`;for(let f=0;f<l;f++)E+=`<div class="hmx-col">${Be(a[d[f]].label)}</div>`;E+="</div>",this.hdrEl.innerHTML=E;let z={};for(let f of e.rowHighlights??[]){let $=new Set(f.rows);for(let B of f.rows){let I=!$.has(B-1);z[B]={color:f.color,className:f.className,top:I,bottom:!$.has(B+1),label:I?f.label:void 0}}}this.lastRowH=C;let D=f=>{let $=b[f].label,B=e.rowClassName?.(f),I=z[f],V=I?" hmx-row-hl"+(I.top?" hmx-hl-top":"")+(I.bottom?" hmx-hl-bottom":"")+(I.className?" "+I.className:""):"",Q=I?(I.color?` style="--hmx-hl:${ce(I.color)}"`:"")+(I.label?` data-hl-label="${ce(I.label)}"`:""):"",X=e.renderRowLabel?e.renderRowLabel(f):`<span class="hmx-cell-text">${Be($)}</span>`,J=`<div class="hmx-row${B?" "+B:""}${V}" data-rowwrap="${f}"${Q}>`;J+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${M};height:${C}px;">`,J+=`<div class="hmx-rowlabel" data-row="${f}" title="${ce($)}">${X}</div>`;for(let Y=0;Y<l;Y++){let F=d[Y],K=this.data.getCellValue(f,F),ge=K.highlighted&&K.highlightColor?`box-shadow:inset 0 0 0 2px ${K.highlightColor};`:"",te=K.bold?"font-weight:bold;":"",Te=K.opacity!=null&&K.opacity<1?`opacity:${K.opacity};`:"",y=f===0,R=f===m-1,W=Y===0,j=Y===l-1,_="";y&&W?_="border-top-left-radius:8px;":y&&j?_="border-top-right-radius:8px;":R&&W?_="border-bottom-left-radius:8px;":R&&j&&(_="border-bottom-right-radius:8px;"),J+=`<div class="hmx-cell${K.className?" "+K.className:""}" data-row="${f}" data-col="${F}" style="background:${K.color};color:${K.textColor};padding:0 6px;${Te}${P}${ge}${te}${_}"><span class="hmx-cell-text">${Be(K.text)}</span></div>`}return J+="</div></div>",J},w=(e.rowRegions??[]).filter(f=>f.start<=f.end),k=w.map(()=>({top:-1,bottom:-1})),A=(f,$,B,I)=>{for(let V=0;V<w.length;V++)$>=w[V].start&&f<=w[V].end&&(k[V].top<0&&(k[V].top=B),k[V].bottom=I)},O=`<div class="hmx-grid-inner" style="width:${v}px;min-width:${v}px;">`,G=0;for(let f of s){if(f.kind==="band"){let $=f.end-f.start+1,B,I=!1;for(let Y=f.start;Y<=f.end;Y++)if(z[Y]){I=!0,B=z[Y].color;break}let V=$===1?"":"s",Q=`${$} row${V} ${ce(f.label??"hidden")}`,X="hmx-collapsed"+(f.locked?" hmx-collapsed-locked":"")+(I?" hmx-collapsed-hl":""),J=i&&!f.locked;O+=`<div class="${X}"${J?` data-cs="${f.index}"`:""} data-count="${f.shown}" style="width:${v}px;min-width:${v}px;height:${We}px;${B?`--hmx-hl:${ce(B)};`:""}" title="${J?`Click to show ${$} hidden row${V}`:Q}"><span class="hmx-collapsed-inner">\u2026 ${Q}</span></div>`,A(f.start,f.end,G,G+We),G+=We;continue}if(f.kind==="handle"){if(!i)continue;let $=f.end-f.start+1;O+=`<div class="hmx-expanded-toggle" data-cs="${f.index}" data-count="${f.shown}" style="width:${v}px;min-width:${v}px;" title="Collapse these ${$} rows"><span>\u2303 collapse ${$} row${$===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,G+=Vt;continue}O+=D(f.row),A(f.row,f.row,G,G+C),G+=C}for(let f=0;f<w.length;f++){let $=k[f];if($.top<0||$.bottom<=$.top)continue;let B=w[f],I=B.color?`--hmx-region:${ce(B.color)};`:"",V=$.top+jt,Q=Math.max(0,$.bottom-$.top-2*jt);Q<=0||(O+=`<div class="hmx-region-rail" style="top:${V}px;height:${Q}px;${I}"></div>`,B.label&&(O+=`<div class="hmx-region-label" style="top:${V}px;height:${Q}px;${I}">${ce(B.label)}</div>`))}if(O+="</div>",this.scrollEl.innerHTML=O,this.pendingScroll){let{scrollBefore:f,bandTop:$,delta:B}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,$<f?f+B:f)}e.onVisibleColumnsChange&&!to(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,i=t.closest(".hmx-collapsed, .hmx-expanded-toggle");if(i){if(i.dataset.cs===void 0)return;let a=parseInt(i.dataset.cs);if(t.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:i.offsetTop,delta:-i.offsetHeight},this.options.onRemoveCollapse?.(a);return}let d=parseInt(i.dataset.count||"0"),l=i.classList.contains("hmx-collapsed"),h=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:i.offsetTop,delta:l?d*h:-d*h},this.options.onToggleCollapse?.(a);return}let r=t.closest(".hmx-rowlabel");if(r){this.options.onRowHeaderClick?.(parseInt(r.dataset.row),e);return}let c=t.closest(".hmx-cell");c&&this.options.onCellClick?.(parseInt(c.dataset.row),parseInt(c.dataset.col),e)})}static planRows(e,t=[]){let i=t.map((l,h)=>({start:Math.max(0,l.start),end:Math.min(e-1,l.end),collapsed:l.collapsed!==!1,locked:!!l.locked,label:l.label,index:h})).filter(l=>l.start<=l.end),r=new Array(e);for(let l of i)if(l.locked)for(let h=l.start;h<=l.end;h++)r[h]??(r[h]=l);let c=(l,h)=>{let b=0;for(let m=l;m<=h;m++)r[m]||b++;return b},a=new Map;for(let l of i)l.locked||c(l.start,l.end)===0||a.has(l.start)||a.set(l.start,l);let d=[];for(let l=0;l<e;){let h=a.get(l);if(h?.collapsed){d.push({kind:"band",start:h.start,end:h.end,index:h.index,locked:!1,label:h.label,shown:c(h.start,h.end)}),l=h.end+1;continue}h&&d.push({kind:"handle",start:h.start,end:h.end,index:h.index,shown:c(h.start,h.end)});let b=r[l];if(b){let m=l;for(;m+1<e&&r[m+1]===b&&!a.has(m+1);)m++;d.push({kind:"band",start:l,end:m,index:b.index,locked:!0,label:b.label,shown:0}),l=m+1;continue}d.push({kind:"row",row:l}),l++}return d}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let i=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,i),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function to(n,e){if(n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}function lt(n){let e=n.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=n.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let i=t[1],r,c,a,d=1;return i.length===3||i.length===4?(r=parseInt(i[0]+i[0],16),c=parseInt(i[1]+i[1],16),a=parseInt(i[2]+i[2],16),i.length===4&&(d=parseInt(i[3]+i[3],16)/255)):(r=parseInt(i.slice(0,2),16),c=parseInt(i.slice(2,4),16),a=parseInt(i.slice(4,6),16),i.length===8&&(d=parseInt(i.slice(6,8),16)/255)),[r,c,a,d]}return null}function rt(n){return!n||n[3]<.95?null:(.299*n[0]+.587*n[1]+.114*n[2])/255}function no(n){let e=n;for(;e;){let t=rt(lt(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let i=rt(lt(getComputedStyle(t).backgroundColor));if(i!==null)return i}return null}function oo(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=rt(lt(e));return t===null?null:t<.5}function Ne(n,e){let t=ye(n),i=()=>{let a=ye(n);a!==t&&(t=a,e(a))},r=new MutationObserver(i);typeof document<"u"&&(r.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&r.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let c=null;return typeof window<"u"&&window.matchMedia&&(c=window.matchMedia("(prefers-color-scheme: dark)"),c.addEventListener("change",i)),()=>{r.disconnect(),c?.removeEventListener("change",i)}}function ye(n){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=oo();if(e!==null)return e;let t=no(n??null);return t!==null?t<.5:!1}var io=60,lo=30,ro=22,so=48,ao=18,Ut={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},co="#cc6622";function po(n){let e=n.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Gt=41;function st(n,e,t){let[i,r,c]=po(e),a=Math.pow(Math.max(0,Math.min(1,n)),1.1);if(t){let l=h=>Math.round(Gt+(h-Gt)*a);return`rgb(${l(i)}, ${l(r)}, ${l(c)})`}let d=l=>Math.round(255-(255-l)*a);return`rgb(${d(i)}, ${d(r)}, ${d(c)})`}function ho(n,e){return e?n>=.62?"#fff":n>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":n>=.62?"#fff":n>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Xt(n){return n==null?"":n.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Le(n.slice(1)):Le(n)}function Se(n){return n==null?"":n.startsWith(" ")?"_"+n.slice(1):n}function Fe(n){let e=n.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function qt(n,e,t,i){let r=Rt(),c=i?.interactive!==!1,a;if(typeof n=="string"?a=document.querySelector(n):n instanceof Element?a=n:a=null,!a)return console.error("Container not found:",n),null;let d=tt(e),l=d.normalized,h=d.v2Data,b=Dt(r);function m(o){return o?o.map(p=>({token:p.tokens?.[0]??"",color:p.color})).filter(p=>p.token!==""):[]}let s={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??l.layers.length,darkModeOverride:t?.darkMode??null,pinned:m(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(o=>o.pos).filter(o=>typeof o=="number"),colorIndex:t?.colorIndex??0,openPopup:null,rowHighlights:t?.rowHighlights??[],collapsedSections:(t?.collapsedSections??[]).map(o=>({...o}))},L=null,T={};function C(o,p){(T[o]||[]).forEach(u=>u(p))}let v=l.layers.length,M=l.tokens.length,P=[],E="",z=new Set,D=[];function w(o){return o>=0&&o<M&&!z.has(o)}function k(){v=l.layers.length,M=l.tokens.length,D=Pt(l),z=new Set;for(let g of D)for(let x=g.start;x<=g.end;x++)z.add(x);P=[];for(let g=0;g<v;g++){let x=0;for(let S=0;S<M;S++){let H=l.cells[S]?.[g];H&&H.prob>x&&(x=H.prob)}P.push(x)}let o=l.computedRows,p=o?o[o.length-1]??-1:M-1;E=l.cells[p]?.[v-1]?.token??"",s.pinnedRows=s.pinnedRows.filter(w),s.selectedRow!==null&&!w(s.selectedRow)&&(s.selectedRow=null),(s.viewSize>v||s.viewSize<1)&&(s.viewSize=v);let u=Math.max(0,v-s.viewSize);s.viewStart>u&&(s.viewStart=u),s.viewStart<0&&(s.viewStart=0)}k();function A(o){let p=s.pinned.find(u=>u.token===o);return p?p.color:null}function O(o){let p=s.pinned.findIndex(u=>u.token===o);p>=0?s.pinned.splice(p,1):(s.pinned.push({token:o,color:Ie[s.colorIndex%Ie.length]}),s.colorIndex++)}function G(o,p){let u=h?.tracked?.[o];if(u&&Array.isArray(u[p]))return u[p];for(let g=0;g<v;g++){let x=l.cells[o]?.[g]?.topk.find(S=>S.token===p);if(x)return x.trajectory}return null}function f(o){let p=s.pinnedRows.indexOf(o);return ot[(p<0?0:p)%ot.length]}function $(o){return s.pinnedRows.indexOf(o)>=0}function B(o,p){for(let u of s.pinned){let g=G(o,u.token);if(!g)continue;let x=0;for(let S of g)S!=null&&S>x&&(x=S);if(x>=p)return!0}return!1}function I(o){let p=null,u=0;for(let g=0;g<v;g++){let x=l.cells[o]?.[g];x&&x.prob>u&&(u=x.prob,p=x.token)}return u>=.05?p:null}function V(o){if(!w(o))return;let p=s.pinnedRows.indexOf(o);if(p>=0){s.pinnedRows.splice(p,1);return}if(!B(o,.01)){let u=I(o);u&&!A(u)&&(s.pinned.push({token:u,color:Ie[s.colorIndex%Ie.length]}),s.colorIndex++)}s.pinnedRows.push(o)}function Q(){return Ut[s.ramp]||Ut.purple}function X(){return s.darkModeOverride!==null?s.darkModeOverride:ye(a)}let J=[];function Y(){return J.length>1?Math.max(1,J[1]-J[0]):1}a.innerHTML=`
        <div id="${r}"${c?' tabindex="-1"':' class="ll-static"'}>
            <div class="ll-heatmap" id="${r}_heatmap"${c?' tabindex="0"':""}></div>
            <div class="ll-nav" id="${r}_nav"></div>
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
    `;let F=document.getElementById(r),K=document.getElementById(r+"_heatmap"),ge=document.getElementById(r+"_nav"),te,Te=document.getElementById(r+"_lp_wrap"),y=document.getElementById(r+"_lp_token"),R=document.getElementById(r+"_lp_box"),W=document.getElementById(r+"_lp"),j=document.getElementById(r+"_tt"),_=document.getElementById(r+"_popup"),re=document.getElementById(r+"_popup_hdr"),pe=document.getElementById(r+"_popup_body");c&&document.body.appendChild(_);let ne=null,he=null,se=!0,Ee=!1,Oe=c?getComputedStyle(F).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",Pe=!Oe;Pe&&F.classList.add("ll-fill");let Re=(()=>{if(!Oe||/^(unbounded|none|auto)$/i.test(Oe))return null;let o=Oe.split("/").map(p=>parseFloat(p.trim()));return o.length!==2||isNaN(o[0])||isNaN(o[1])||o[0]===0||o[1]===0?null:o[1]/o[0]})();function dn(o,p){let u=p?"#bbb":"#555",g=o?` stroke-dasharray="${Le(o)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${g}/></svg>`}function ft(){return{rows:l.tokens.map(o=>({label:o})),columns:l.layers.map(o=>({label:String(o),value:0})),getCellValue:(o,p)=>{let u=l.cells[o][p],g=u.prob,x=X(),S=E!==""&&u.token===E,H=A(u.token),N=g<.18;return{text:u.token,value:g,color:st(g,S?co:Q(),x),textColor:ho(g,x),highlighted:!!H,highlightColor:H??void 0,opacity:s.dimLow&&N?.55:void 0}}}}function cn(o){let p=l.tokens[o],u=o===s.selectedRow||$(o),g=c?`<span class="ll-fold-handle${L===o?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return $(o)&&(g+=dn(f(o).dash,X())),g+=Fe(p)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${Xt(p)}</span>`,g}function pn(o){return"ll-hmx-row"+(o===s.selectedRow||$(o)?" ll-hmx-active":"")+(un(o)?" ll-gen-row":"")}function hn(){let o=h?.completion;return o&&o.length?l.tokens.length-o.length:l.tokens.length}function un(o){return o>=hn()}function mn(o,p){let u=Math.min(o,p),g=Math.max(o,p);s.collapsedSections=s.collapsedSections.filter(x=>x.end<u||x.start>g).concat({start:u,end:g,collapsed:!0}).sort((x,S)=>x.start-S.start)}function fn(o){L===null?(L=o,U()):L===o?(L=null,U()):(mn(L,o),L=null,U(),ae())}function gt(){let o={interactive:c,columnSizing:"fit",minColumnWidth:so,maxVisibleColumns:ao,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:De(s.viewStart),size:s.viewSize},rowSizing:Pe?"fill":"fixed",cellHeight:lo,rowHeaderWidth:io,headerHeight:ro+6,height:Pe||Re!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:s.showGrid,darkMode:X(),renderRowLabel:cn,rowClassName:pn,rowHighlights:s.rowHighlights,collapsedSections:D.length?s.collapsedSections.concat(D):s.collapsedSections,onVisibleColumnsChange:p=>{J=p}};return c?{...o,onToggleCollapse:p=>{let u=s.collapsedSections[p];u&&(u.collapsed=u.collapsed===!1,U(),ae())},onRemoveCollapse:p=>{s.collapsedSections.splice(p,1),U(),ae()},onCellHover:On,onCellClick:zn,onRowHeaderClick:(p,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){fn(p);return}V(p),U(),ie(),ae()},onCellLeave:()=>{qe(),_n()}}:o}function gn(){if(Pe){let p=a.clientWidth;F.style.width=p>0?p+"px":"100%",F.style.maxWidth="100%",F.style.maxHeight="";return}F.style.width="",F.style.maxWidth="";let o=a.clientWidth||F.clientWidth;if(Re&&o>0){let u=F.offsetHeight-te.getScrollElement().offsetHeight,g=(u>0?u:140)+90;F.style.maxHeight=Math.max(g,Math.round(o*Re))+"px"}else F.style.maxHeight=""}function U(){gn(),te.setOptions(gt())}function be(){let o=Q(),p=X(),u=De(s.viewStart),g=Y(),x=s.viewSize,S=x>=v,H=bt(),N=x<=H[0],q='<span class="ll-nav-range-key">layers</span>';S?q+=`all ${v}`+(g>1?`<span class="ll-dim"> \xB7 every ${g}</span>`:""):q+=`${u}\u2013${u+x-1}<span class="ll-dim"> / ${v}</span>`+(g>1?`<span class="ll-dim"> \xB7 \u22481/${g}</span>`:"");let le="";for(let Z=0;Z<v;Z++){let xe=P[Z]||0,Je=Math.max(8,Math.round(xe*92));le+=`<div class="ll-skyline-bar" style="height:${Je}%;background:${st(xe,o,p)}"></div>`}let oe=u/v*100,ue=x/v*100,de=[];for(let Z=0;Z<v;Z+=8)de.push(Z);de[de.length-1]!==v-1&&de.push(v-1);let me="",fe=Math.max(1,v-1);for(let Z of de){let xe=Z===v-1,Je=Z===0,Wn=Z/fe*100;me+=`<span class="ll-nav-tick" style="left:${Wn}%;transform:${xe?"translateX(-100%)":Je?"translateX(0)":"translateX(-50%)"}">${l.layers[Z]}</span>`}ge.innerHTML=`
            <div class="ll-nav-range">${q}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${r}_sky">
                    <div class="ll-skyline-bars">${le}</div>
                    <div class="ll-skyline-win" id="${r}_win" style="left:${oe}%;width:${ue}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${me}</div>
            </div>
            ${c?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${mo}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+x>=v?"disabled":""}>${fo}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${N?"disabled":""}>${go}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${S?"disabled":""}>${bo}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${uo}</button>
            </div>`:""}
        `,c&&yn()}function bn(){let o=document.getElementById(r+"_win");if(!o)return;let p=Math.max(0,v-s.viewSize),u=Math.max(0,Math.min(p,s.viewStart));o.style.left=u/v*100+"%",o.style.width=s.viewSize/v*100+"%"}function bt(){return Array.from(new Set([v,48,32,20,14,10,8])).filter(o=>o<=v&&o>=1).sort((o,p)=>o-p)}function De(o){return Math.max(0,Math.min(Math.max(0,v-s.viewSize),o))}let je=!1;function xt(){je||(je=!0,requestAnimationFrame(()=>{je=!1,!Ee&&(U(),bn())}))}function Ue(o){let p=De(s.viewStart+o);p!==s.viewStart&&(s.viewStart=p,U(),be(),ae())}function xn(o){let p=De(o);p!==s.viewStart&&(s.viewStart=p,xt())}function vt(o,p){let u=bt(),g=u.findIndex(N=>N>=s.viewSize),x=g===-1?u.length-1:g,S=o<0?Math.max(0,x-1):Math.min(u.length-1,x+1),H=u[S];H!==s.viewSize&&(s.viewSize=H,s.viewStart=Math.max(0,Math.min(v-H,Math.round(p-H/2))),U(),be(),ae())}function yt(o){vt(o,s.viewStart+s.viewSize/2)}function vn(){s.viewSize=v,s.viewStart=0,U(),be(),ae()}let we=null;function yn(){let o=document.getElementById(r+"_sky");if(!o)return;o.addEventListener("pointerdown",u=>{let g=o.getBoundingClientRect(),x=u.clientX-g.left,S=g.width/v,H=Math.max(0,v-s.viewSize),N=Math.max(0,Math.min(H,s.viewStart)),q=N*S,le=(N+s.viewSize)*S,oe=N;(x<q||x>le)&&(oe=De(Math.round(x/S)-Math.floor(s.viewSize/2)),s.viewStart=oe,xt()),we={startX:x,startStart:oe,layerW:S},o.classList.add("ll-grabbing");try{o.setPointerCapture(u.pointerId)}catch{}}),o.addEventListener("pointermove",u=>{if(!we)return;let g=o.getBoundingClientRect(),S=(u.clientX-g.left-we.startX)/we.layerW;xn(Math.round(we.startStart+S))});let p=u=>{if(we){we=null,o.classList.remove("ll-grabbing");try{o.releasePointerCapture(u.pointerId)}catch{}be(),ae()}};o.addEventListener("pointerup",p),o.addEventListener("pointercancel",p),o.addEventListener("wheel",u=>{u.preventDefault();let g=o.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){Ue(u.deltaX>0?1:-1);return}let x=Math.round((u.clientX-g.left)/g.width*v);vt(u.deltaY<0?-1:1,x)},{passive:!1})}function wn(o,p,u=!1){w(o)&&(s.selectedRow=o,s.selectedLayerIdx=p??l.layers.length-1,U(),ie(),u&&Ln(o),ae())}function Ln(o){te.scrollToRow(o)}function Ge(){requestAnimationFrame(()=>requestAnimationFrame(()=>{Ee||te.scrollToBottom()}))}let kn=.45,Mn=120,Sn=360;function Xe(){let o;if(Re)o=(a.clientWidth||F.clientWidth)*Re;else{let u=F.clientHeight;o=u>0?u:(F.clientWidth||900)*.6}let p=Math.round(o*kn);R.style.height=Math.max(Mn,Math.min(Sn,p))+"px"}function wt(o){return o+"\xB7"+(Fe(l.tokens[o])?"bos":Se(l.tokens[o]))}function ie(o){let p=s.pinnedRows.length>0?s.pinnedRows:s.selectedRow!==null?[s.selectedRow]:[],u=p.length>1,g=[];for(let S of p){let H=f(S);for(let N of s.pinned){let q=G(S,N.token);if(!q)continue;let le=Se(N.token);u&&(le+=" ("+wt(S)+")"),g.push({values:q.map(oe=>oe??null),label:le,color:N.color,dashPattern:H.dash||void 0,removable:!1})}}let x=g.length===0&&!o;if(x)Te.classList.add("ll-hidden");else{Te.classList.remove("ll-hidden"),Xe(),y.textContent=s.pinnedRows.length>1?s.pinnedRows.length+" positions":p.length===1?"position "+wt(p[0]):"";let S={lines:[],richLines:g,xLabels:l.layers},H={darkMode:X(),mode:"probability",autoScale:!0,legendPosition:g.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:c,pixelRatio:i?.pixelRatio};ne?(ne.setData(S),ne.setOptions(H)):(W.style.minHeight="0",ne=new ve(W,S,H)),o?ne.setOverlay?.({values:o.values,label:o.label,color:o.color,dashPattern:"4,2",isOverlay:!0}):ne.setOverlay?.(null)}Pe&&x!==se?(se=x,requestAnimationFrame(()=>{Ee||(U(),Ge())})):se=x}let Tn=56,En=11,Cn=9.5,$n=15;function Hn(o){let p=En*(o>0?o/Tn:1);return Math.max(Cn,Math.min($n,p))}function Pn(o,p,u,g,x=0){let S=l.cells[o]?.[p];if(!S||!w(o))return;let H=Q(),N=Fe(l.tokens[o])?"bos":Se(l.tokens[o]);j.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${st(S.prob,H,X())}"></span><span class="ll-tt-token">${Le(Se(S.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(S.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${l.layers[p]} / ${l.layers[v-1]}</span><span>position</span><span class="ll-tt-val">${o} \xB7 ${Le(N)}</span></div>`,j.style.fontSize=Hn(x)+"px",j.classList.add("ll-visible");let q=F.getBoundingClientRect(),le=j.offsetWidth||200,oe=j.offsetHeight||80,ue=8,de=14,me=u-q.left,fe=g-q.top,Z=me+de;Z+le>q.width-ue&&(Z=me-de-le),Z=Math.max(ue,Math.min(Z,q.width-le-ue));let xe=fe-50;xe=Math.max(ue,Math.min(xe,q.height-oe-ue)),j.style.left=Z+"px",j.style.top=xe+"px"}function qe(){j.classList.remove("ll-visible")}function Rn(){Ye(),he=document.createElement("div"),he.style.cssText="position:fixed;inset:0;z-index:49;",he.addEventListener("mousedown",o=>{o.preventDefault(),o.stopPropagation(),kt()}),document.body.appendChild(he)}function Ye(){he&&(he.remove(),he=null)}function Dn(o,p,u){if(!l.cells[o]?.[p]||!w(o))return;let x=u.getBoundingClientRect();s.openPopup={row:o,layer:p},s.selectedRow=o,s.selectedLayerIdx=p;let S=Fe(l.tokens[o])?"bos":Se(l.tokens[o]);re.innerHTML=`Layer <b>${l.layers[p]}</b>, Position <b>${o}</b><div class="ll-popup-sub">input <code>${Le(S)}</code></div>`,Lt(o,p),U(),ie(),_.style.visibility="hidden",_.classList.add("ll-visible"),In(x),_.style.visibility="",Rn(),ae()}function Lt(o,p){let u=l.cells[o][p],g="";u.topk.forEach((x,S)=>{let H=A(x.token),N=H?`background:${H}22;border-left-color:${H};`:"";g+=`<div class="ll-topk${H?" ll-topk-pinned":""}" data-ki="${S}" style="${N}" title="click to track trajectory"><span class="ll-topk-tok">${Xt(x.token)}</span><span class="ll-topk-prob">${(x.prob*100).toFixed(1)}%</span></div>`}),pe.innerHTML=g,pe.querySelectorAll(".ll-topk").forEach(x=>{let S=parseInt(x.dataset.ki),H=u.topk[S];x.addEventListener("mouseenter",()=>{if(se)return;let N=G(o,H.token);N&&ie({values:N.map(q=>q??null),label:Se(H.token),color:"#999"})}),x.addEventListener("mouseleave",()=>{se||ie()}),x.addEventListener("click",N=>{N.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(O(H.token),U(),Lt(o,p),ie(),ae())})})}function In(o){let g=F.getBoundingClientRect(),x=Math.max(140,g.width-2*8),S=Math.max(120,g.height-2*8);_.style.maxWidth=x+"px",_.style.maxHeight=S+"px";let H=_.offsetWidth||220,N=_.offsetHeight||160,q=g.left+8,le=g.right-8-H,oe=g.top+8,ue=g.bottom-8-N,de=[{left:o.right+6,top:o.top},{left:o.left-6-H,top:o.top},{left:o.left,top:o.bottom+6},{left:o.left,top:o.top-6-N}],me=de[0];for(let fe of de)if(fe.left>=q&&fe.left<=le&&fe.top>=oe&&fe.top<=ue){me=fe;break}_.style.left=Math.max(q,Math.min(me.left,Math.max(q,le)))+"px",_.style.top=Math.max(oe,Math.min(me.top,Math.max(oe,ue)))+"px"}function kt(){s.openPopup=null,_.classList.remove("ll-visible"),Ye(),U(),ie()}c&&document.getElementById(r+"_popup_close").addEventListener("click",o=>{o.stopPropagation(),kt()});function An(o,p){if(se||!w(o))return;let u=l.cells[o]?.[p]?.token,g=u!=null?G(o,u):null;g?ie({values:g.map(x=>x??null),label:Se(u),color:"#999"}):ie()}function _n(){se||ie()}function On(o,p){An(o,p)}function zn(o,p,u){if(!w(o))return;if(u.shiftKey){let x=l.cells[o]?.[p]?.token;x&&(O(x),U(),ie(),ae());return}qe();let g=u.target.closest(".hmx-cell");g&&Dn(o,p,g)}te=new Ce(K,ft(),gt());let ze=te.getScrollElement(),Mt=o=>{let p=o.target.closest(".hmx-cell");if(!p){qe();return}Pn(parseInt(p.dataset.row),parseInt(p.dataset.col),o.clientX,o.clientY,p.offsetWidth)},St=o=>{o.shiftKey&&o.target.closest(".hmx-rowlabel")&&o.preventDefault()};c&&(ze.addEventListener("mousemove",Mt),ze.addEventListener("mousedown",St),K.addEventListener("keydown",o=>{if(o.key!=="ArrowDown"&&o.key!=="ArrowUp")return;o.preventDefault();let p=o.key==="ArrowDown"?1:-1,u=(s.selectedRow??(p>0?-1:M))+p;for(;u>=0&&u<M&&!w(u);)u+=p;w(u)&&wn(u,void 0,!0)}),ge.addEventListener("click",o=>{let p=o.target.closest("[data-nav]");if(!p||p.hasAttribute("disabled"))return;let u=p.dataset.nav;u==="panL"?Ue(-Math.max(1,Math.floor(s.viewSize/4))):u==="panR"?Ue(Math.max(1,Math.floor(s.viewSize/4))):u==="zoomIn"?yt(-1):u==="zoomOut"?yt(1):u==="reset"&&vn()}));function Qe(){U(),be(),ie(),requestAnimationFrame(()=>{Ee||(U(),be(),se||Xe())})}function Ke(){nt(F,X(),_)}function ae(){C("stateChange",$t())}Qe(),Ge(),Ke();let Ze=0,Tt=a?.clientWidth??0,Et=a?.clientHeight??0,Ct=new ResizeObserver(()=>{let o=a?.clientWidth??0,p=a?.clientHeight??0;o===Tt&&p===Et||(Tt=o,Et=p,!Ze&&(Ze=requestAnimationFrame(()=>{Ze=0,!Ee&&(U(),se||Xe())})))});a&&Ct.observe(a);let Bn=Ne(a,o=>{s.darkModeOverride===null&&(nt(F,o,_),U(),be(),ie())});function $t(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(o=>({tokens:[o.token],color:o.color})),pinnedRows:s.pinnedRows.map(o=>({pos:o,line:f(o).name})),darkMode:s.darkModeOverride,rowHighlights:s.rowHighlights,collapsedSections:s.collapsedSections}}return{widget:{getState:$t,setState:o=>{o.ramp!==void 0&&(s.ramp=o.ramp),o.showGrid!==void 0&&(s.showGrid=o.showGrid),o.dimLowProb!==void 0&&(s.dimLow=o.dimLowProb),o.selectedRow!==void 0&&(s.selectedRow=o.selectedRow),o.selectedLayer!==void 0&&(s.selectedLayerIdx=o.selectedLayer),o.viewStart!==void 0&&(s.viewStart=o.viewStart),o.viewSize!==void 0&&(s.viewSize=o.viewSize),o.colorIndex!==void 0&&(s.colorIndex=o.colorIndex),o.pinnedGroups!==void 0&&(s.pinned=m(o.pinnedGroups)),o.pinnedRows!==void 0&&(s.pinnedRows=o.pinnedRows.map(p=>p.pos).filter(p=>typeof p=="number")),o.darkMode!==void 0&&(s.darkModeOverride=o.darkMode),o.rowHighlights!==void 0&&(s.rowHighlights=o.rowHighlights),o.collapsedSections!==void 0&&(s.collapsedSections=o.collapsedSections.map(p=>({...p}))),k(),Ke(),Qe()},setData:o=>{d=tt(o),l=d.normalized,h=d.v2Data,s.selectedRow=null,s.selectedLayerIdx=null,s.pinned=[],s.pinnedRows=[],s.colorIndex=0,s.rowHighlights=[],s.collapsedSections=[],L=null,k(),J=[],te.setData(ft()),Qe(),Ge()},setTitle:()=>{},setThemeMode:o=>{s.darkModeOverride=!!o,Ke(),U(),be(),ie()},getThemeMode:()=>X(),hasEntropyData:()=>!!h&&Array.isArray(h.entropy)&&h.entropy.length>0,hasRankData:()=>{if(!h?.tracked)return!1;for(let o of h.tracked)for(let p in o){let u=o[p];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(o,p)=>{(T[o]||(T[o]=[])).push(p)},off:(o,p)=>{T[o]=(T[o]||[]).filter(u=>u!==p)},destroy:()=>{Ee=!0,Bn(),Ct?.disconnect(),Ye(),_.remove(),ne&&(ne.destroy(),ne=null),ze.removeEventListener("mousemove",Mt),ze.removeEventListener("mousedown",St),te?.destroy(),a&&(a.innerHTML="")}},styleEl:b}}var uo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',mo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',fo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',go='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',bo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var $e=class{constructor(e,t,i,r){this.widget=null;this.styleEl=null;let c=qt(e,t,i,r);c&&(this.widget=c.widget,this.styleEl=c.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var xo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',vo='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',yo='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',at="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function dt(n){return{fg:n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:n?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:n?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:n?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:n?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:n?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:n?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:n?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:n?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Yt(n){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${at};`;let t={isOpen:!1,searchQuery:""},i=Kt(e,n,t);return e.__tokenSelectorCleanup=i,e.__tokenSelectorState=t,e}function Ae(n,e){let t=n.__tokenSelectorCleanup,i=n.__tokenSelectorState;t&&t();let r={isOpen:i?.isOpen??!1,searchQuery:i?.searchQuery??""},c=Kt(n,e,r);n.__tokenSelectorCleanup=c,n.__tokenSelectorState=r}function Qt(n){let e=n.__tokenSelectorCleanup;e&&e()}function Kt(n,e,t){n.innerHTML="";let i=dt(e.darkMode),{allLabels:r,selectedIndices:c,defaultIndices:a,onChange:d}=e,l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let h=document.createElement("span");if(h.style.cssText=`font-size:11px;color:${i.fgMuted};`,h.textContent=`Tokens (${r.length})`,l.appendChild(h),!ct(c,a)){let w=document.createElement("button");w.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${i.fgMuted};font-family:${at};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,w.innerHTML=`${xo} Reset`,w.addEventListener("mouseenter",()=>{w.style.color=i.fg}),w.addEventListener("mouseleave",()=>{w.style.color=i.fgMuted}),w.addEventListener("click",()=>{d(Array.from(a))}),l.appendChild(w)}n.appendChild(l);let m=document.createElement("div");m.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${i.border};border-radius:6px;background:${i.inputBg};cursor:text;min-height:30px;`,m.addEventListener("click",()=>{E(),L.focus()});let s=Array.from(c).sort((w,k)=>w-k);for(let w of s){let k=wo(w,r[w],e.darkMode,()=>{let A=new Set(c);A.delete(w),d(Array.from(A))});m.appendChild(k)}let L=document.createElement("input");L.type="text",L.placeholder=s.length===0?"Search tokens...":"",L.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${i.fg};font-family:${at};min-width:60px;flex:1;padding:2px 0;`,L.addEventListener("input",()=>{t.searchQuery=L.value,P()}),L.addEventListener("focus",()=>E()),m.appendChild(L);let T=document.createElement("span");T.style.cssText=`display:flex;align-items:center;color:${i.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,T.innerHTML=yo,T.addEventListener("click",w=>{w.stopPropagation(),t.isOpen?z():E()}),m.appendChild(T),n.appendChild(m);let C=document.createElement("div");C.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${i.bg};border:1px solid ${i.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let v=document.createElement("div");v.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",C.appendChild(v);let M=document.createElement("div");M.style.cssText=`padding:8px 12px;font-size:12px;color:${i.fgMuted};display:none;text-align:center;`,M.textContent="No tokens found",C.appendChild(M),n.appendChild(C);function P(){v.innerHTML="";let w=t.searchQuery.toLowerCase(),k=0;for(let A=0;A<r.length;A++){let O=r[A];if(w&&!O.toLowerCase().includes(w))continue;k++;let G=c.has(A),f=Lo(A,O,G,e.darkMode,()=>{let $=new Set(c);G?$.delete(A):$.add(A),d(Array.from($))});v.appendChild(f)}M.style.display=k===0?"":"none"}function E(){t.isOpen||(t.isOpen=!0,C.style.display="",T.style.transform="rotate(180deg)",P())}function z(){t.isOpen&&(t.isOpen=!1,C.style.display="none",T.style.transform="",L.value="",t.searchQuery="")}function D(w){n.contains(w.target)||z()}return document.addEventListener("mousedown",D),t.isOpen&&(C.style.display="",T.style.transform="rotate(180deg)",L.value=t.searchQuery,P(),requestAnimationFrame(()=>{L.isConnected&&L.focus()})),()=>{document.removeEventListener("mousedown",D)}}function wo(n,e,t,i){let r=dt(t),c=ee[n%ee.length],a=document.createElement("div");a.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${r.chipBorder};background:${r.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,a.addEventListener("mouseenter",()=>{a.style.background=r.chipHoverBg,a.style.borderColor=r.chipHoverBorder}),a.addEventListener("mouseleave",()=>{a.style.background=r.chipBg,a.style.borderColor=r.chipBorder});let d=document.createElement("span");d.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${c};`,a.appendChild(d);let l=document.createElement("span");l.style.cssText=`font-size:11px;color:${r.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,l.innerHTML=Me(e),l.title=e,a.appendChild(l);let h=document.createElement("button");return h.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${r.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,h.innerHTML=vo,h.addEventListener("mouseenter",()=>{h.style.color=r.badgeText}),h.addEventListener("mouseleave",()=>{h.style.color=r.fgMuted}),h.addEventListener("click",b=>{b.stopPropagation(),i()}),a.appendChild(h),a}function Lo(n,e,t,i,r){let c=dt(i),a=ee[n%ee.length],d=document.createElement("div");d.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",d.addEventListener("mouseenter",()=>{d.style.background=c.hoverBg}),d.addEventListener("mouseleave",()=>{d.style.background="transparent"}),d.addEventListener("click",m=>{m.stopPropagation(),r()});let l=document.createElement("span");l.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?a:"transparent"};border:1.5px solid ${t?a:c.fgMuted};`,d.appendChild(l);let h=document.createElement("span");h.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?c.fg:c.fgMuted};`,h.innerHTML=Me(e),h.title=e,d.appendChild(h);let b=n===0?"source pred":n===1?"target pred":null;if(b){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${c.badgeBg};color:${c.badgeText};border:1px solid ${c.badgeBorder};`,m.textContent=b,d.appendChild(m)}if(t){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;font-size:10px;color:${c.selectedText};`,m.textContent="selected",d.appendChild(m)}return d}function ct(n,e){if(n.size!==e.size)return!1;for(let t of n)if(!e.has(t))return!1;return!0}var ko={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Mo=["probability","prob_diff","rank"],He=class{constructor(e,t,i={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=i.mode??"probability",this.darkMode=i.darkMode??!1,this.transparentBackground=i.transparentBackground??!1,this.title=i.title,this.interactive=i.interactive!==!1,this.pixelRatio=i.pixelRatio,this.onTokenSelectionChange=i.onTokenSelectionChange,this.onModeChange=i.onModeChange;let r=t.tokenLabels?.length??t.lines?.length??0,c=i.defaultSelectedTokens??Array.from({length:Math.min(2,r)},(d,l)=>l);this.defaultTokens=new Set(c),this.selectedTokens=new Set(i.selectedTokens??c),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=Yt(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let a=document.createElement("div");a.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(a),this.linePlot=new ve(a,this.buildPlotData(),this.buildPlotOptions()),a.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ae(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of Mo){let i=document.createElement("button");i.textContent=ko[t],this.applyModeButtonStyles(i,t===this.mode),i.addEventListener("click",()=>this.setMode(t)),i.addEventListener("mouseenter",()=>{t!==this.mode&&(i.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),i.addEventListener("mouseleave",()=>{t!==this.mode&&(i.style.background="transparent")}),e.appendChild(i),this.modeButtons.set(t,i)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let i=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",r="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?r:"transparent"};color:${t?"#fff":i};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],i=Array.from(this.selectedTokens).sort((a,d)=>a-d),r=this.mode==="rank";return{richLines:i.filter(a=>a<e.length).map(a=>({values:r?e[a].map(d=>d+1):e[a],label:t[a]??`Token ${a}`,color:ee[a%ee.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,t)},(r,c)=>c));let i=new Set([...this.selectedTokens].filter(r=>r<t));this.selectedTokens=i.size>0?i:new Set(this.defaultTokens),Ae(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ae(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,i=new Set(e.filter(r=>r<t));ct(i,this.selectedTokens)||(this.selectedTokens=i,Ae(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Qt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function pt(n,e,t){let i=Math.max(1,n),r=Math.max(1,e),c=Math.min(16e3/i,16e3/r,Math.sqrt(25e7/(i*r)));return Math.max(.01,Math.min(t>0?t:1,c))}var ht="http://www.w3.org/1999/xhtml",Ve="http://www.w3.org/2000/svg",So=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,To=new Set(["d","x","y","cx","cy","r","rx","ry"]),Eo=new Set(["script","style","link","noscript","template"]),Co=/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,ut=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(Ve,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,t){let i=e.namespaceURI??ht,r=`${i} ${e.localName}${t??""}`,c=this.cache.get(r);if(c)return c;let a=this.doc.createElementNS(i,e.localName);(i===Ve?this.svgRoot:this.doc.body).appendChild(a);let d=this.win.getComputedStyle(a,t??null);c=new Map;for(let l=0;l<d.length;l++){let h=d.item(l);c.set(h,d.getPropertyValue(h))}return a.remove(),this.cache.set(r,c),c}destroy(){this.frame.remove()}};function Zt(n,e,t,i){let r="";for(let c=0;c<n.length;c++){let a=n.item(c);if(So.test(a)||i&&To.has(a))continue;let d=n.getPropertyValue(a);d===e.get(a)&&(!t||d===t.getPropertyValue(a))||(r+=`${a}:${d};`)}return r}function Jt(n,e,t){if(n.nodeType===Node.TEXT_NODE)return document.createTextNode(n.nodeValue??"");if(n.nodeType!==Node.ELEMENT_NODE)return null;let i=n;if(Eo.has(i.localName.toLowerCase()))return null;let r=getComputedStyle(i);if(r.display==="none")return null;let c=i instanceof HTMLCanvasElement,a;if(c){a=document.createElement("img");try{a.setAttribute("src",i.toDataURL("image/png"))}catch{}}else a=i.cloneNode(!1);a.setAttribute("style",Zt(r,t.sandbox.defaults(i),e,i.namespaceURI===Ve));let d="",l="";for(let h of["::before","::after"]){let b=getComputedStyle(i,h),m=b.getPropertyValue("content");!m||m==="none"||m==="normal"||b.display==="none"||(l||(l=`nns-snap-${t.nextClass++}`),d+=`.${l}${h}{${Zt(b,t.sandbox.defaults(i,h),r,!1)}}`)}if(l&&(a.setAttribute("class",`${a.getAttribute("class")??""} ${l}`.trim()),t.rules.push(d)),!c)for(let h of Array.from(i.childNodes)){let b=Jt(h,r,t);b&&a.appendChild(b)}return a}function $o(n){return new Promise((e,t)=>{let i=new Image;i.onload=()=>e(i),i.onerror=()=>t(new Error("Snapshot failed: the browser could not render the captured element.")),i.src=n})}async function _e(n,e={}){let t=Math.max(0,e.padding??0),i=n.getBoundingClientRect(),r=Math.ceil(i.width),c=Math.ceil(i.height);if(r===0||c===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let a=r+2*t,d=c+2*t,l=pt(a,d,e.scale??2),h=new ut,b;try{let C={sandbox:h,rules:[],nextClass:0},v=Jt(n,null,C);if(!v)throw new Error("Snapshot failed: the element is not displayed.");v.setAttribute("style",v.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${r}px;height:${c}px;box-sizing:border-box;`);let M=document.createElementNS(ht,"div");if(M.setAttribute("style",`width:${a}px;height:${d}px;padding:${t}px;margin:0;box-sizing:border-box;`),C.rules.length){let P=document.createElementNS(ht,"style");P.textContent=C.rules.join(""),M.appendChild(P)}M.appendChild(v),b=new XMLSerializer().serializeToString(M).replace(Co,"\uFFFD")}finally{h.destroy()}let m=`<svg xmlns="${Ve}" width="${a*l}" height="${d*l}" viewBox="0 0 ${a} ${d}"><foreignObject x="0" y="0" width="${a}" height="${d}">${b}</foreignObject></svg>`,s=await $o("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(m)),L=document.createElement("canvas");L.width=Math.round(a*l),L.height=Math.round(d*l);let T=L.getContext("2d");if(!T)throw new Error("Snapshot failed: no 2D canvas context.");return e.background&&(T.fillStyle=e.background,T.fillRect(0,0,L.width,L.height)),T.drawImage(s,0,0,L.width,L.height),{dataUrl:L.toDataURL("image/png"),width:a,height:d,scale:l,toBlob:()=>new Promise((C,v)=>L.toBlob(M=>M?C(M):v(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var en={light:"#ffffff",dark:"hsl(0 0% 16%)"};function Ho(){return new Promise(n=>{let e=setTimeout(n,100);requestAnimationFrame(()=>{clearTimeout(e),n()})})}async function Po(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let n=0;n<3;n++)await Ho()}async function tn(n,e={}){let t=Math.max(200,Math.round(e.width??880)),i=e.darkMode??!1,r=e.scale??2,c=e.background===void 0?i?en.dark:en.light:e.background,a=document.createElement("div");a.setAttribute("aria-hidden","true"),a.style.cssText=`position:fixed;left:-100000px;top:0;width:${t}px;pointer-events:none;`;let d=document.createElement("div");a.appendChild(d),document.body.appendChild(a);let l=()=>{};try{if(n.kind==="logit-lens"){let h=new $e(d,n.data,{...n.uiState,darkMode:i},{interactive:!1,pixelRatio:r});l=()=>h.destroy()}else{let h=Math.max(160,Math.round(e.height??t*.5));a.style.height=`${h}px`;let b=new He(d,n.data,{mode:n.mode,selectedTokens:n.selectedTokens,title:n.title,darkMode:i,transparentBackground:!0,interactive:!1,pixelRatio:r});l=()=>b.destroy()}return await Po(),await _e(a,{scale:r,background:c,padding:e.padding})}finally{l(),a.remove()}}function Ro(n){let e=typeof n=="string"?document.querySelector(n):n;return e||console.error("Container not found:",n),e}function mt(n,e,t){let i=Ro(n);if(!i)return null;let r=e(i);if(t===void 0){let c=Ne(i,d=>r.setThemeMode(d)),a=r.destroy.bind(r);r.destroy=()=>{c(),a()}}return r}function ln(n,e,t,i){return new $e(n,e,t,i)}function rn(n,e,t){return mt(n,i=>new ve(i,e,{darkMode:ye(i),...t}),t?.darkMode)}var nn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Do(n){if(!/^#?[0-9a-fA-F]{6}$/.test(n))return[147,51,234];let e=n.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function on(n,e){if(typeof n.getCellValue=="function")return n;let t=n,i=t.values??[],r=t.texts,c=t.rowLabels??i.map((M,P)=>String(P)),a=t.colLabels??(i[0]??[]).map((M,P)=>String(P)),d=t.ramp??"purple",l=nn[d]??(d[0]==="#"?d:nn.purple),[h,b,m]=Do(l),[s,L]=t.valueDomain??[0,1],T=L-s,C=e?38:255,v=M=>Math.max(0,Math.min(1,M));return{rows:c.map(M=>({label:M})),columns:a.map(M=>({label:M,value:0})),getCellValue:(M,P)=>{let E=i[M]?.[P]??0,z=v(T>0?(E-s)/T:E),D=k=>Math.round(C+(k-C)*z);return{text:r?r[M]?.[P]??"":Number.isInteger(E)?String(E):E.toFixed(2),value:E,color:`rgb(${D(h)}, ${D(b)}, ${D(m)})`,textColor:z>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function sn(n,e,t){return mt(n,i=>{let r=t?.darkMode??ye(i),c=new Ce(i,on(e,r),{darkMode:r,...t}),a=c.setThemeMode.bind(c);return c.setThemeMode=d=>{c.setData(on(e,d)),a(d)},c},t?.darkMode)}function an(n,e,t){return mt(n,i=>new He(i,e,{darkMode:ye(i),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=ln,window.LinePlotWidget=rn,window.HeatmapTableWidget=sn,window.ActivationPatchingWidget=an);return Gn(Io);})();
//# sourceMappingURL=charts.js.map
