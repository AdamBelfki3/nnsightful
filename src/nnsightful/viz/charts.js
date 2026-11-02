"use strict";var InterpTools=(()=>{var nt=Object.defineProperty;var Un=Object.getOwnPropertyDescriptor;var Gn=Object.getOwnPropertyNames;var Xn=Object.prototype.hasOwnProperty;var Yn=(o,e)=>{for(var t in e)nt(o,t,{get:e[t],enumerable:!0})},qn=(o,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Gn(e))!Xn.call(o,r)&&r!==t&&nt(o,r,{get:()=>e[r],enumerable:!(n=Un(e,r))||n.enumerable});return o};var Kn=o=>qn(nt({},"__esModule",{value:!0}),o);var Wo={};Yn(Wo,{ActivationPatchingWidget:()=>pn,HeatmapTableWidget:()=>cn,LinePlotWidget:()=>dn,LogitLensWidget:()=>an,captureElement:()=>Be,snapshotChart:()=>ln});function Dt(o){return o.completion&&o.completion.length?[...o.input,...o.completion]:o.input}function Qn(o){let e=o.positions,t=Dt(o).length;if(!e||e.length===t&&e.every((a,l)=>a===l))return{data:o,computedRows:null};let n=new Array(t);e.forEach((a,l)=>{Number.isInteger(a)&&a>=0&&a<t&&l<o.tracked.length&&(n[a]=l)});let r=Array.from({length:t},(a,l)=>l),c=(a,l,h)=>{let v=n[l];return v!==void 0&&a&&v<a.length?a[v]:h()};return{data:{...o,positions:null,tracked:r.map(a=>c(o.tracked,a,()=>({}))),topk:o.topk.map(a=>r.map(l=>c(a,l,()=>[]))),entropy:o.entropy?o.entropy.map(a=>r.map(l=>c(a,l,()=>0))):o.entropy},computedRows:r.filter(a=>n[a]!==void 0)}}function It(o){let e=o.computedRows;if(!e)return[];let t=o.tokens.length,n=[],r=0;for(let c of[...e,t])c>r&&n.push({start:r,end:c-1,collapsed:!0,locked:!0,label:"not computed"}),r=c+1;return n}function ot(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:t,computedRows:n}=Qn(o),r=t.layers.length,c=Dt(t),d=c.length,a=[];for(let h=0;h<d;h++){let v=[],m=t.tracked[h]??{};for(let s=0;s<r;s++){let y=t.topk[s]?.[h]??[],$=[];for(let C=0;C<y.length;C++){let S=y[C],f=m[S]||[],L=f[s]||0;$.push({token:S,prob:L,trajectory:f})}let H=$[0]||{token:"",prob:0,trajectory:[]};v.push({token:H.token,prob:H.prob,trajectory:H.trajectory,topk:$})}a.push(v)}return{normalized:{layers:t.layers,tokens:c,cells:a,meta:t.meta||{},computedRows:n},v2Data:t}}function At(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Ee(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function Zn(o){let e=`#${o}`;return`
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
    `}function Ot(o){let e=document.createElement("style");return e.textContent=Zn(o),document.head.appendChild(e),e}function it(o,e,...t){let n=r=>{e?r.classList.add("ll-dark"):r.classList.remove("ll-dark")};n(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let r of t)r&&n(r)}var _e=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],lt=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var Q=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function Ce(o){return o.richLines&&o.richLines.length>0?o.richLines.map((t,n)=>({values:t.values,label:t.label??`Line ${n+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(o.lines??[]).map((t,n)=>({values:t,label:o.labels?.[n]??`Line ${n+1}`}))}function $e(o){if(!o)return"";let e=[],t=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let n="";for(;t<o.length;t++){let r=o[t];r===`
`?(n&&(e.push(_t(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=r}return n&&e.push(_t(n)),e.join("")}function _t(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Jn(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(o<=t)return t;return 1}function zt(o,e,t){let n=Ce(o),r=n.length>0?n[0].values.length:t?.values.length??o.xLabels?.length??0;if(r===0)return null;let c=e.mode||"probability",d=e.minValue,a=e.maxValue;if(d===void 0||a===void 0||e.autoScale){let l=[];for(let m of n)if(!m.isOverlay)for(let s of m.values)s!==null&&l.push(s);if(t)for(let m of t.values)m!==null&&l.push(m);if(l.length===0)return{numLayers:r,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let h=1/0,v=-1/0;for(let m of l)m<h&&(h=m),m>v&&(v=m);if(e.centerYAxisAtZero){let s=Math.max(Math.abs(h),Math.abs(v))*1.1;d=-s,a=s}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(h))),a===void 0||e.autoScale){let m=Math.log(Math.max(1,h)),s=Math.log(Math.max(1,v)),y=s+.15*Math.max(1,s-m);a=Math.ceil(Math.exp(y))}}else d===void 0&&(d=c==="probability"?0:c==="rank"?Math.max(1,Math.floor(h)):Math.floor(h*.9)),(a===void 0||e.autoScale)&&(c==="rank"?a=Math.ceil(v*1.1):c==="probability"?a=e.autoScale?Jn(Math.max(v,.001)):Math.min(v*1.1,1):a=v*1.1)}return{numLayers:r,minValue:d,maxValue:a,numLines:n.length}}function Wt(o,e,t,n,r,c,d,a){let l=o.getContext("2d"),h=e.getBoundingClientRect(),v=n.pixelRatio??(window.devicePixelRatio||1);o.width=h.width*v,o.height=h.height*v,o.style.width=`${h.width}px`,o.style.height=`${h.height}px`,l.scale(v,v);let m=h.width,s=h.height,y=n.darkMode??!1,$=n.title,H=n.mode||"probability",C=n.invertYAxis??!1,S=n.centerYAxisAtZero??!1,f=n.logScale??!1,L=n.xAxisLabel||"Layer",B=n.yAxisLabel||"Probability",O=n.xRangeStart??0;O>=r.numLayers-1&&(console.warn(`xRangeStart (${O}) is >= numLayers-1 (${r.numLayers-1}), clamping to 0`),O=0);let k=n.showDataPoints??!0,M={top:$?48:24,right:24,bottom:56,left:72},R=m-M.left-M.right,N=s-M.top-M.bottom,Z={margin:M,chartWidth:R,chartHeight:N,width:m,height:s},X={background:y?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:y?"#52525b":"#a1a1aa",grid:y?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:y?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:y?"#e4e4e7":"#27272a"};n.transparentBackground?l.clearRect(0,0,m,s):(l.fillStyle=X.background,l.fillRect(0,0,m,s)),$&&(l.fillStyle=X.titleText,l.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="left",l.fillText($,M.left,28));let J=r.numLayers-1-O,ee=b=>J<=0?M.left+R/2:M.left+(b-O)/J*R,te=f?Math.log(Math.max(1,r.minValue)):0,be=f?Math.log(Math.max(1,r.maxValue)):0,ne=b=>{let I;if(f){let z=Math.log(Math.max(1,b));I=be-te>0?(z-te)/(be-te):.5}else I=(b-r.minValue)/(r.maxValue-r.minValue);return C?M.top+I*N:M.top+N-I*N};l.setLineDash([4,4]),l.strokeStyle=X.grid,l.lineWidth=1;let Y=[],he=r.maxValue-r.minValue,K=5;if(f){let b=new Set;for(let V=0;V<K;V++){let le=te+V/(K-1)*(be-te),A=Math.round(Math.exp(le));b.has(A)||(b.add(A),Y.push(A))}let I=Math.round(Math.exp(te)),z=Math.round(Math.exp(be));b.has(I)||Y.unshift(I),b.has(z)||Y.push(z)}else if(H==="rank")for(let b=0;b<K;b++)Y.push(Math.round(r.minValue+b/(K-1)*he));else for(let b=0;b<K;b++)Y.push(r.minValue+b/(K-1)*he);if(Y.forEach(b=>{let I=ne(b);l.beginPath(),l.moveTo(M.left,I),l.lineTo(M.left+R,I),l.stroke()}),l.setLineDash([]),S){let b=ne(0);l.beginPath(),l.strokeStyle=y?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",l.lineWidth=1.5,l.moveTo(M.left,b),l.lineTo(M.left+R,b),l.stroke(),l.lineWidth=1}l.fillStyle=X.text,l.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="right",l.textBaseline="middle",Y.forEach(b=>{let I=ne(b),z;H==="probability"?z=b.toFixed(2):H==="prob_diff"?z=b>=0?`+${b.toFixed(2)}`:b.toFixed(2):z=Math.round(b).toString(),l.fillText(z,M.left-16,I)}),l.textAlign="center",l.textBaseline="top";let g=t.xLabels&&t.xLabels.length>0,D=Math.max(1,Math.ceil(r.numLayers/8));for(let b=0;b<r.numLayers;b+=D){let I=ee(b);if(I<M.left-5||I>M.left+R+5)continue;let z=g?String(t.xLabels[b]??b):b.toString();l.fillText(z,I,M.top+N+12)}if((r.numLayers-1)%D!==0){let b=g?String(t.xLabels[r.numLayers-1]??r.numLayers-1):(r.numLayers-1).toString();l.fillText(b,ee(r.numLayers-1),M.top+N+12)}l.strokeStyle=y?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",l.lineWidth=1.5,l.beginPath(),l.moveTo(M.left,M.top),l.lineTo(M.left,M.top+N),l.lineTo(M.left+R,M.top+N),l.stroke(),l.fillStyle=X.textMuted,l.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",l.textAlign="center",l.textBaseline="top",l.fillText(L.toUpperCase(),M.left+R/2,s-16),l.save(),l.translate(14,M.top+N/2),l.rotate(-Math.PI/2),l.textAlign="center",l.textBaseline="top",l.fillText(B.toUpperCase(),0,0),l.restore();let E=Ce(t);function _(b,I,z,V,le){l.beginPath(),l.strokeStyle=I,l.lineWidth=z,le!==void 0&&(l.globalAlpha=le),V?l.setLineDash(V.split(",").map(Number)):l.setLineDash([]);let A=!1;for(let F=0;F<b.length;F++){let ue=b[F];if(ue===null){A=!1;continue}let Se=ee(F),oe=ne(ue);A?l.lineTo(Se,oe):(l.moveTo(Se,oe),A=!0)}l.stroke(),l.setLineDash([]),le!==void 0&&(l.globalAlpha=1)}let U=y?"#3f3f46":"#d4d4d8";if(l.lineCap="round",l.lineJoin="round",E.forEach((b,I)=>{!c.has(I)||b.isOverlay||_(b.values,U,2,void 0,.35)}),E.forEach((b,I)=>{if(c.has(I)||b.isOverlay)return;let z=b.color??Q[I%Q.length];_(b.values,z,4,b.dashPattern,.15),_(b.values,z,2,b.dashPattern),k&&b.values.forEach((V,le)=>{if(V===null)return;let A=ee(le),F=ne(V),ue=d?.lineIdx===I&&d?.layerIdx===le;l.beginPath(),l.strokeStyle=z,l.lineWidth=ue?2:1.5,l.arc(A,F,ue?5:3.5,0,Math.PI*2),l.stroke(),l.beginPath(),l.fillStyle=y?"#18181b":"#ffffff",l.arc(A,F,ue?3.5:2.5,0,Math.PI*2),l.fill()})}),E.forEach((b,I)=>{if(!b.isOverlay||c.has(I))return;let z=b.color??"#999";_(b.values,z,1.5,b.dashPattern??"4,2",.7)}),a){let b=a.color??"#999";_(a.values,b,1.5,a.dashPattern??"4,2",.7)}return Z}function Bt(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function Ft(o,e,t,n,r,c,d,a,l){let{margin:h,chartWidth:v,chartHeight:m}=r,s=n.xRangeStart??0,y=d-1-s,$=n.logScale?Math.log(Math.max(1,a)):0,H=n.logScale?Math.log(Math.max(1,l)):0;if(o<h.left||o>h.left+v||e<h.top||e>h.top+m)return null;let C=Ce(t),S=null,f=1/0,L=20;for(let B=0;B<C.length;B++){if(c.has(B))continue;let O=C[B];if(!O.isOverlay)for(let k=0;k<O.values.length;k++){let M=O.values[k];if(M===null)continue;let R=y<=0?h.left+v/2:h.left+(k-s)/y*v,N;if(n.logScale){let J=Math.log(Math.max(1,M));N=H-$>0?(J-$)/(H-$):.5}else N=(M-a)/(l-a);let Z=n.invertYAxis?h.top+N*m:h.top+m-N*m,X=Math.sqrt((o-R)**2+(e-Z)**2);X<f&&X<L&&(f=X,S={visible:!0,x:R,y:Z,lineIdx:B,layerIdx:k,value:M,label:O.label,color:O.color??Q[B%Q.length]})}}return S}function rt(o,e,t,n,r,c,d){if(!e){o.style.opacity="0";return}let a=n?"#27272a":"#fff",l=n?"#3f3f46":"#e4e4e7",h=n?"#fafafa":"#18181b",v=n?"#a1a1aa":"#71717a",s=e.x>t/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${s},-50%);`;let y=String(r?r[e.layerIdx]??e.layerIdx:e.layerIdx);o.innerHTML=`
        <div style="background:${a};border:1px solid ${l};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${h};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${$e(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${v}">${c??"Layer"}</span>
                    <span style="font-weight:500;color:${h}">${y}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${v}">Value</span>
                    <span style="font-weight:500;color:${h}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var eo='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',to='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',no='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Nt(o){let e=document.createElement("div");return Vt(e,o),e}function Vt(o,e){let t=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${t};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function jt(o,e,t,n,r,c){Vt(o,n),o.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",a=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",l=n?"#a1a1aa":"#71717a",h=n?"#3f3f46":"#d4d4d8",v="rgba(161,161,170,0.3)",m=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",s=c?Ce(c):[];e.forEach((y,$)=>{let H=s[$];if(H?.isOverlay)return;let C=H?.color??Q[$%Q.length],S=t.has($),f=H?.removable??!1,L=document.createElement(r?"button":"div");L.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:${r?"pointer":"default"};transition:all 0.15s;opacity:${S?"0.5":"1"};`,r&&(L.addEventListener("mouseenter",()=>{L.style.background=m}),L.addEventListener("mouseleave",()=>{L.style.background="transparent"}),L.addEventListener("click",()=>r.onToggle($)));let B=document.createElement("span");B.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${S?v:C};background:${S?h:"transparent"};`,L.appendChild(B);let O=document.createElement("span");if(O.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${S?a:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,O.title=y,O.innerHTML=$e(y),L.appendChild(O),!r){o.appendChild(L);return}if(f&&r.onRemove){let k=document.createElement("span");k.style.cssText=`margin-left:auto;cursor:pointer;color:${l};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,k.innerHTML=no,k.title="Remove",k.addEventListener("click",M=>{M.stopPropagation(),r.onRemove($)}),L.appendChild(k),L.addEventListener("mouseenter",()=>{k.style.opacity="0.6"}),L.addEventListener("mouseleave",()=>{k.style.opacity="0"})}else{let k=document.createElement("span");k.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${l};opacity:${S?"0.6":"0"};display:flex;align-items:center;`,k.innerHTML=S?to:eo,L.appendChild(k),S||(L.addEventListener("mouseenter",()=>{k.style.opacity="0.4"}),L.addEventListener("mouseleave",()=>{k.style.opacity="0"}))}o.appendChild(L)})}var ke=class{constructor(e,t,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;this.tooltip=Ft(n,r,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),rt(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,rt(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer);let r=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${r?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=Bt(this.chartContainer),this.legendEl=Nt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),r&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(c=>{if(this.destroyed)return;let d=c[0];if(!d)return;let a=Math.round(d.contentRect.width),l=Math.round(d.contentRect.height);a===this.lastWidth&&l===this.lastHeight||(this.lastWidth=a,this.lastHeight=l,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=zt(this.data,this.options,this.overlay),this.config&&(this.geometry=Wt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let t=this.options.interactive===!1?null:{onToggle:n=>this.toggleLine(n),onRemove:this.options.onLineRemoved?n=>{this.removeLine(n,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(n)}:void 0};jt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,t,this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,n)=>({values:t,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let r of this.hiddenLines)r<e?n.add(r):r>e&&n.add(r-1);this.hiddenLines=n,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function pe(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function Ne(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+pe(o.slice(1)):pe(o)}function oo(o){let e=`#${o}`;return`
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
        }
        ${e}.hmx-static.hmx-window-scroll .hmx-grid-inner { pointer-events: none; }
        ${e}.hmx-window-scroll .hmx-row,
        ${e}.hmx-window-scroll .hmx-collapsed { scroll-snap-align: start; }
    `}function Ut(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=oo(o),document.head.appendChild(e),e}var io=0,ze=16,st=20,Gt=7,Re=class o{constructor(e,t,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.windowPlan=[];this.windowYs=[];this.windowHs=[];this.windowFrom=-1;this.lastWindowKey="";this.windowScrollTimer=null;this.onWindowScroll=()=>{this.windowPlan.length&&(this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.windowScrollTimer=setTimeout(()=>{if(this.windowScrollTimer=null,this.destroyed||!this.windowPlan.length)return;let e=this.scrollEl.scrollTop,t=this.windowYs.findIndex((c,d)=>c+this.windowHs[d]/2>e);t<0&&(t=this.windowYs.length-1);let{from:n,to:r}=o.windowItems(this.windowHs,t,this.options.rowWindow.height);Math.abs(this.scrollEl.scrollTop-this.windowYs[n])>1&&(this.scrollEl.scrollTop=this.windowYs[n]),this.windowFrom=n,this.reportWindow(this.windowPlan,n,r,"scroll")},150))};this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...n},this.uid="hmx_"+ ++io+"_"+Date.now().toString(36),this.styleEl=Ut(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`.trim(),this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.scrollEl.addEventListener("scroll",this.onWindowScroll),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let n=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-n)),size:n}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,n=e.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/t),c=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(c,r))}resolveVisibleColumns(){let e=this.options,{start:t,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let v=[];for(let m=0;m<n;m++)v.push(t+m);return v}let r=this.maxColsFit();if(n<=r){let v=[];for(let m=0;m<n;m++)v.push(t+m);return v}let c=!!e.alwaysShowLastColumn,d=Math.max(1,r-(c?1:0)),a=Math.ceil(n/d),l=[];for(let v=t;v<t+n;v+=a)l.push(v);let h=t+n-1;return c&&l[l.length-1]!==h&&l.push(h),l}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let n=t.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/e);return Math.max(t.minColumnWidth??1,r)}return t.cellWidth??48}resolveRowHeight(e,t=0){let n=this.options,r=n.cellHeight??28;if(n.rowSizing!=="fill"||e<=0)return r;let c=this.scrollEl.clientHeight-t;return e*r<c?Math.floor(c/e):r}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=this.isInteractive();this.root.classList.toggle("hmx-static",!n);let r=e.rowHeaderWidth??100,c=e.headerHeight??26,d=this.data.columns,a=this.resolveVisibleColumns(),l=a.length,h=this.resolveCellWidth(l),v=this.data.rows,m=e.maxRows!=null?Math.min(v.length,e.maxRows):v.length,s=o.planRows(m,e.collapsedSections),y=0,$=0;for(let g of s)g.kind==="row"?y++:g.kind==="band"?$+=ze:n&&($+=st);let H=this.resolveRowHeight(y,$),C=r+h*l,S=s.map(g=>g.kind==="row"?H:g.kind==="band"?ze:n?st:0),f=null;if(e.rowWindow&&S.reduce((g,D)=>g+D,0)>e.rowWindow.height){let g=s.findIndex(D=>o.itemRows(D)[1]>=e.rowWindow.start);f=o.windowItems(S,g<0?s.length-1:g,e.rowWindow.height)}let L=!!f&&e.rowWindowMode==="scroll",B=f&&!L?s.slice(f.from,f.to):s,O=B.filter(g=>g.kind==="row"),k=f&&!L?O[0]?.row??-1:0,M=f&&!L?O[O.length-1]?.row??-1:m-1,R=`${r}px repeat(${l}, ${h}px)`,N=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",Z=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${R};height:${c}px;width:${C}px;min-width:${C}px;">`;Z+=`<div class="hmx-corner">${pe(e.cornerLabel??"")}</div>`;for(let g=0;g<l;g++)Z+=`<div class="hmx-col">${Ne(d[a[g]].label)}</div>`;Z+="</div>",this.hdrEl.innerHTML=Z;let X={};for(let g of e.rowHighlights??[]){let D=new Set(g.rows);for(let E of g.rows){let _=!D.has(E-1);X[E]={color:g.color,className:g.className,top:_,bottom:!D.has(E+1),label:_?g.label:void 0}}}this.lastRowH=H;let J=g=>{let D=v[g].label,E=e.rowClassName?.(g),_=X[g],U=_?" hmx-row-hl"+(_.top?" hmx-hl-top":"")+(_.bottom?" hmx-hl-bottom":"")+(_.className?" "+_.className:""):"",b=_?(_.color?` style="--hmx-hl:${pe(_.color)}"`:"")+(_.label?` data-hl-label="${pe(_.label)}"`:""):"",I=e.renderRowLabel?e.renderRowLabel(g):`<span class="hmx-cell-text">${Ne(D)}</span>`,z=`<div class="hmx-row${E?" "+E:""}${U}" data-rowwrap="${g}"${b}>`;z+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${R};height:${H}px;">`,z+=`<div class="hmx-rowlabel" data-row="${g}" title="${pe(D)}">${I}</div>`;for(let V=0;V<l;V++){let le=a[V],A=this.data.getCellValue(g,le),F=A.highlighted&&A.highlightColor?`box-shadow:inset 0 0 0 2px ${A.highlightColor};`:"",ue=A.bold?"font-weight:bold;":"",Se=A.opacity!=null&&A.opacity<1?`opacity:${A.opacity};`:"",oe=g===k,me=g===M,ae=V===0,xe=V===l-1,fe="";oe&&ae?fe="border-top-left-radius:8px;":oe&&xe?fe="border-top-right-radius:8px;":me&&ae?fe="border-bottom-left-radius:8px;":me&&xe&&(fe="border-bottom-right-radius:8px;"),z+=`<div class="hmx-cell${A.className?" "+A.className:""}" data-row="${g}" data-col="${le}" style="background:${A.color};color:${A.textColor};padding:0 6px;${Se}${N}${F}${ue}${fe}"><span class="hmx-cell-text">${Ne(A.text)}</span></div>`}return z+="</div></div>",z},ee=(e.rowRegions??[]).filter(g=>g.start<=g.end),te=ee.map(()=>({top:-1,bottom:-1})),be=(g,D,E,_)=>{for(let U=0;U<ee.length;U++)D>=ee[U].start&&g<=ee[U].end&&(te[U].top<0&&(te[U].top=E),te[U].bottom=_)},ne=`<div class="hmx-grid-inner" style="width:${C}px;min-width:${C}px;">`,Y=0,he=[];for(let g of B){if(he.push(Y),g.kind==="band"){let D=g.end-g.start+1,E,_=!1;for(let V=g.start;V<=g.end;V++)if(X[V]){_=!0,E=X[V].color;break}let U=D===1?"":"s",b=`${D} row${U} ${pe(g.label??"hidden")}`,I="hmx-collapsed"+(g.locked?" hmx-collapsed-locked":"")+(_?" hmx-collapsed-hl":""),z=n&&!g.locked;ne+=`<div class="${I}"${z?` data-cs="${g.index}"`:""} data-count="${g.shown}" style="width:${C}px;min-width:${C}px;height:${ze}px;${E?`--hmx-hl:${pe(E)};`:""}" title="${z?`Click to show ${D} hidden row${U}`:b}"><span class="hmx-collapsed-inner">\u2026 ${b}</span></div>`,be(g.start,g.end,Y,Y+ze),Y+=ze;continue}if(g.kind==="handle"){if(!n)continue;let D=g.end-g.start+1;ne+=`<div class="hmx-expanded-toggle" data-cs="${g.index}" data-count="${g.shown}" style="width:${C}px;min-width:${C}px;" title="Collapse these ${D} rows"><span>\u2303 collapse ${D} row${D===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,Y+=st;continue}ne+=J(g.row),be(g.row,g.row,Y,Y+H),Y+=H}for(let g=0;g<ee.length;g++){let D=te[g];if(D.top<0||D.bottom<=D.top)continue;let E=ee[g],_=E.color?`--hmx-region:${pe(E.color)};`:"",U=D.top+Gt,b=Math.max(0,D.bottom-D.top-2*Gt);b<=0||(ne+=`<div class="hmx-region-rail" style="top:${U}px;height:${b}px;${_}"></div>`,E.label&&(ne+=`<div class="hmx-region-label" style="top:${U}px;height:${b}px;${_}">${pe(E.label)}</div>`))}ne+="</div>";let K=this.scrollEl.scrollTop;if(this.scrollEl.innerHTML=ne,this.root.classList.toggle("hmx-window-scroll",L),this.scrollEl.style.maxHeight=L?`${e.rowWindow.height}px`:"",this.windowPlan=L?s:[],this.windowYs=L?he:[],this.windowHs=L?S:[],L?(f.from!==this.windowFrom?this.scrollEl.scrollTop=he[f.from]:this.scrollEl.scrollTop=K,this.windowFrom=f.from):this.windowFrom=-1,f?this.reportWindow(s,f.from,f.to,"render"):e.rowWindow&&this.reportWindow(s,-1,-1,"render"),this.pendingScroll){let{scrollBefore:g,bandTop:D,delta:E}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,D<g?g+E:g)}e.onVisibleColumnsChange&&!lo(a,this.lastVisibleCols)?(this.lastVisibleCols=a,e.onVisibleColumnsChange(a)):this.lastVisibleCols=a}reportWindow(e,t,n,r){let c=t<0?null:{start:o.itemRows(e[t])[0],end:o.itemRows(e[n-1])[1]},d=c?`${c.start}-${c.end}`:"none";d!==this.lastWindowKey&&(this.lastWindowKey=d,this.options.onRowWindowChange?.(c,r))}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,n=t.closest(".hmx-collapsed, .hmx-expanded-toggle");if(n){if(n.dataset.cs===void 0)return;let d=parseInt(n.dataset.cs);if(t.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:-n.offsetHeight},this.options.onRemoveCollapse?.(d);return}let a=parseInt(n.dataset.count||"0"),l=n.classList.contains("hmx-collapsed"),h=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:l?a*h:-a*h},this.options.onToggleCollapse?.(d);return}let r=t.closest(".hmx-rowlabel");if(r){this.options.onRowHeaderClick?.(parseInt(r.dataset.row),e);return}let c=t.closest(".hmx-cell");c&&this.options.onCellClick?.(parseInt(c.dataset.row),parseInt(c.dataset.col),e)})}static itemRows(e){return e.kind==="row"?[e.row,e.row]:[e.start,e.end]}static windowItems(e,t,n){let r=e.length;if(r===0)return{from:0,to:0};let c=r;for(let l=0;c>0&&l+e[c-1]<=n;)l+=e[--c];let d=Math.max(0,Math.min(t,c,r-1)),a=d;for(let l=0;a<r&&(a===d||l+e[a]<=n);)l+=e[a++];return{from:d,to:a}}static planRows(e,t=[]){let n=t.map((l,h)=>({start:Math.max(0,l.start),end:Math.min(e-1,l.end),collapsed:l.collapsed!==!1,locked:!!l.locked,label:l.label,index:h})).filter(l=>l.start<=l.end),r=new Array(e);for(let l of n)if(l.locked)for(let h=l.start;h<=l.end;h++)r[h]??(r[h]=l);let c=(l,h)=>{let v=0;for(let m=l;m<=h;m++)r[m]||v++;return v},d=new Map;for(let l of n)l.locked||c(l.start,l.end)===0||d.has(l.start)||d.set(l.start,l);let a=[];for(let l=0;l<e;){let h=d.get(l);if(h?.collapsed){a.push({kind:"band",start:h.start,end:h.end,index:h.index,locked:!1,label:h.label,shown:c(h.start,h.end)}),l=h.end+1;continue}h&&a.push({kind:"handle",start:h.start,end:h.end,index:h.index,shown:c(h.start,h.end)});let v=r[l];if(v){let m=l;for(;m+1<e&&r[m+1]===v&&!d.has(m+1);)m++;a.push({kind:"band",start:l,end:m,index:v.index,locked:!0,label:v.label,shown:0}),l=m+1;continue}a.push({kind:"row",row:l}),l++}return a}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let n=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.scrollEl.removeEventListener("scroll",this.onWindowScroll),this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function lo(o,e){if(o.length!==e.length)return!1;for(let t=0;t<o.length;t++)if(o[t]!==e[t])return!1;return!0}function at(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let n=t[1],r,c,d,a=1;return n.length===3||n.length===4?(r=parseInt(n[0]+n[0],16),c=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(a=parseInt(n[3]+n[3],16)/255)):(r=parseInt(n.slice(0,2),16),c=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(a=parseInt(n.slice(6,8),16)/255)),[r,c,d,a]}return null}function dt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function ro(o){let e=o;for(;e;){let t=dt(at(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let n=dt(at(getComputedStyle(t).backgroundColor));if(n!==null)return n}return null}function so(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=dt(at(e));return t===null?null:t<.5}function Ve(o,e){let t=Me(o),n=()=>{let d=Me(o);d!==t&&(t=d,e(d))},r=new MutationObserver(n);typeof document<"u"&&(r.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&r.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let c=null;return typeof window<"u"&&window.matchMedia&&(c=window.matchMedia("(prefers-color-scheme: dark)"),c.addEventListener("change",n)),()=>{r.disconnect(),c?.removeEventListener("change",n)}}function Me(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=so();if(e!==null)return e;let t=ro(o??null);return t!==null?t<.5:!1}var ao=60,Xt=30,co=22,po=48,ho=18,Yt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},uo="#cc6622";function mo(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var qt=41;function ct(o,e,t){let[n,r,c]=mo(e),d=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(t){let l=h=>Math.round(qt+(h-qt)*d);return`rgb(${l(n)}, ${l(r)}, ${l(c)})`}let a=l=>Math.round(255-(255-l)*d);return`rgb(${a(n)}, ${a(r)}, ${a(c)})`}function fo(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Kt(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Ee(o.slice(1)):Ee(o)}function He(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function je(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Qt(o,e,t,n){let r=At(),c=n?.interactive!==!1,d;if(typeof o=="string"?d=document.querySelector(o):o instanceof Element?d=o:d=null,!d)return console.error("Container not found:",o),null;let a=ot(e),l=a.normalized,h=a.v2Data,v=Ot(r);function m(i){return i?i.map(p=>({token:p.tokens?.[0]??"",color:p.color})).filter(p=>p.token!==""):[]}let s={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??l.layers.length,darkModeOverride:t?.darkMode??null,pinned:m(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:t?.colorIndex??0,openPopup:null,rowHighlights:t?.rowHighlights??[],collapsedSections:(t?.collapsedSections??[]).map(i=>({...i})),rowStart:t?.rowStart??null},y=null,$=!c&&!!n?.maxRows&&n.maxRows>0,H=null,C={};function S(i,p){(C[i]||[]).forEach(u=>u(p))}let f=l.layers.length,L=l.tokens.length,B=[],O="",k=new Set,M=[];function R(i){return i>=0&&i<L&&!k.has(i)}function N(){f=l.layers.length,L=l.tokens.length,M=It(l),k=new Set;for(let x of M)for(let w=x.start;w<=x.end;w++)k.add(w);B=[];for(let x=0;x<f;x++){let w=0;for(let T=0;T<L;T++){let P=l.cells[T]?.[x];P&&P.prob>w&&(w=P.prob)}B.push(w)}let i=l.computedRows,p=i?i[i.length-1]??-1:L-1;O=l.cells[p]?.[f-1]?.token??"",s.pinnedRows=s.pinnedRows.filter(R),s.selectedRow!==null&&!R(s.selectedRow)&&(s.selectedRow=null),(s.viewSize>f||s.viewSize<1)&&(s.viewSize=f);let u=Math.max(0,f-s.viewSize);s.viewStart>u&&(s.viewStart=u),s.viewStart<0&&(s.viewStart=0)}N();function Z(i){let p=s.pinned.find(u=>u.token===i);return p?p.color:null}function X(i){let p=s.pinned.findIndex(u=>u.token===i);p>=0?s.pinned.splice(p,1):(s.pinned.push({token:i,color:_e[s.colorIndex%_e.length]}),s.colorIndex++)}function J(i,p){let u=h?.tracked?.[i];if(u&&Array.isArray(u[p]))return u[p];for(let x=0;x<f;x++){let w=l.cells[i]?.[x]?.topk.find(T=>T.token===p);if(w)return w.trajectory}return null}function ee(i){let p=s.pinnedRows.indexOf(i);return lt[(p<0?0:p)%lt.length]}function te(i){return s.pinnedRows.indexOf(i)>=0}function be(i,p){for(let u of s.pinned){let x=J(i,u.token);if(!x)continue;let w=0;for(let T of x)T!=null&&T>w&&(w=T);if(w>=p)return!0}return!1}function ne(i){let p=null,u=0;for(let x=0;x<f;x++){let w=l.cells[i]?.[x];w&&w.prob>u&&(u=w.prob,p=w.token)}return u>=.05?p:null}function Y(i){if(!R(i))return;let p=s.pinnedRows.indexOf(i);if(p>=0){s.pinnedRows.splice(p,1);return}if(!be(i,.01)){let u=ne(i);u&&!Z(u)&&(s.pinned.push({token:u,color:_e[s.colorIndex%_e.length]}),s.colorIndex++)}s.pinnedRows.push(i)}function he(){return Yt[s.ramp]||Yt.purple}function K(){return s.darkModeOverride!==null?s.darkModeOverride:Me(d)}let g=[];function D(){return g.length>1?Math.max(1,g[1]-g[0]):1}d.innerHTML=`
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
    `.trim();let E=document.getElementById(r),_=document.getElementById(r+"_heatmap"),U=document.getElementById(r+"_nav"),b,I=document.getElementById(r+"_lp_wrap"),z=document.getElementById(r+"_lp_token"),V=document.getElementById(r+"_lp_box"),le=document.getElementById(r+"_lp"),A=document.getElementById(r+"_tt"),F=document.getElementById(r+"_popup"),ue=document.getElementById(r+"_popup_hdr"),Se=document.getElementById(r+"_popup_body");c&&document.body.appendChild(F);let oe=null,me=null,ae=!0,xe=!1,fe=c?getComputedStyle(E).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",Ie=!fe;Ie&&E.classList.add("ll-fill");let Ae=(()=>{if(!fe||/^(unbounded|none|auto)$/i.test(fe))return null;let i=fe.split("/").map(p=>parseFloat(p.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})();function hn(i,p){let u=p?"#bbb":"#555",x=i?` stroke-dasharray="${Ee(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${x}/></svg>`}function xt(){return{rows:l.tokens.map(i=>({label:i})),columns:l.layers.map(i=>({label:String(i),value:0})),getCellValue:(i,p)=>{let u=l.cells[i][p],x=u.prob,w=K(),T=O!==""&&u.token===O,P=Z(u.token),W=x<.18;return{text:u.token,value:x,color:ct(x,T?uo:he(),w),textColor:fo(x,w),highlighted:!!P,highlightColor:P??void 0,opacity:s.dimLow&&W?.55:void 0}}}}function un(i){let p=l.tokens[i],u=i===s.selectedRow||te(i),x=c?`<span class="ll-fold-handle${y===i?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return te(i)&&(x+=hn(ee(i).dash,K())),x+=je(p)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${Kt(p)}</span>`,x}function mn(i){return"ll-hmx-row"+(i===s.selectedRow||te(i)?" ll-hmx-active":"")+(gn(i)?" ll-gen-row":"")}function fn(){let i=h?.completion;return i&&i.length?l.tokens.length-i.length:l.tokens.length}function gn(i){return i>=fn()}function bn(i,p){let u=Math.min(i,p),x=Math.max(i,p);s.collapsedSections=s.collapsedSections.filter(w=>w.end<u||w.start>x).concat({start:u,end:x,collapsed:!0}).sort((w,T)=>w.start-T.start)}function xn(i){y===null?(y=i,j()):y===i?(y=null,j()):(bn(y,i),y=null,j(),de())}function vt(){let i={interactive:c,columnSizing:"fit",minColumnWidth:po,maxVisibleColumns:ho,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:Oe(s.viewStart),size:s.viewSize},rowSizing:Ie?"fill":"fixed",cellHeight:Xt,rowHeaderWidth:ao,headerHeight:co+6,height:Ie||Ae!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:s.showGrid,darkMode:K(),renderRowLabel:un,rowClassName:mn,rowHighlights:s.rowHighlights,collapsedSections:M.length?s.collapsedSections.concat(M):s.collapsedSections,onVisibleColumnsChange:p=>{g=p},...$?{rowWindow:{start:vn(),height:n.maxRows*Xt},rowWindowMode:n?.scrollRows?"scroll":"clip",onRowWindowChange:(p,u)=>{H=p?{...p,total:L}:null,u==="scroll"&&p&&(s.rowStart=p.start),S("rowWindowChange",{window:H,source:u})}}:{}};return c?{...i,onToggleCollapse:p=>{let u=s.collapsedSections[p];u&&(u.collapsed=u.collapsed===!1,j(),de())},onRemoveCollapse:p=>{s.collapsedSections.splice(p,1),j(),de()},onCellHover:Fn,onCellClick:Nn,onRowHeaderClick:(p,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){xn(p);return}Y(p),j(),re(),de()},onCellLeave:()=>{Ke(),Bn()}}:i}function vn(){if(s.rowStart!=null)return s.rowStart;let i=s.selectedRow??s.pinnedRows[0]??null;return i!=null?Math.max(0,i-Math.floor(n.maxRows/2)):Number.MAX_SAFE_INTEGER}function wn(){if(Ie){let p=d.clientWidth;E.style.width=p>0?p+"px":"100%",E.style.maxWidth="100%",E.style.maxHeight="";return}E.style.width="",E.style.maxWidth="";let i=d.clientWidth||E.clientWidth;if(Ae&&i>0){let u=E.offsetHeight-b.getScrollElement().offsetHeight,x=(u>0?u:140)+90;E.style.maxHeight=Math.max(x,Math.round(i*Ae))+"px"}else E.style.maxHeight=""}function j(){wn(),b.setOptions(vt())}function ye(){let i=he(),p=K(),u=Oe(s.viewStart),x=D(),w=s.viewSize,T=w>=f,P=wt(),W=w<=P[0],G='<span class="ll-nav-range-key">layers</span>';T?G+=`all ${f}`+(x>1?`<span class="ll-dim"> \xB7 every ${x}</span>`:""):G+=`${u}\u2013${u+w-1}<span class="ll-dim"> / ${f}</span>`+(x>1?`<span class="ll-dim"> \xB7 \u22481/${x}</span>`:"");let se="";for(let q=0;q<f;q++){let Le=B[q]||0,tt=Math.max(8,Math.round(Le*92));se+=`<div class="ll-skyline-bar" style="height:${tt}%;background:${ct(Le,i,p)}"></div>`}let ie=u/f*100,ge=w/f*100,ce=[];for(let q=0;q<f;q+=8)ce.push(q);ce[ce.length-1]!==f-1&&ce.push(f-1);let ve="",we=Math.max(1,f-1);for(let q of ce){let Le=q===f-1,tt=q===0,jn=q/we*100;ve+=`<span class="ll-nav-tick" style="left:${jn}%;transform:${Le?"translateX(-100%)":tt?"translateX(0)":"translateX(-50%)"}">${l.layers[q]}</span>`}U.innerHTML=`
            <div class="ll-nav-range">${G}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${r}_sky">
                    <div class="ll-skyline-bars">${se}</div>
                    <div class="ll-skyline-win" id="${r}_win" style="left:${ie}%;width:${ge}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${ve}</div>
            </div>
            ${c?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${bo}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+w>=f?"disabled":""}>${xo}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${W?"disabled":""}>${vo}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${T?"disabled":""}>${wo}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${go}</button>
            </div>`:""}
        `,c&&Mn()}function yn(){let i=document.getElementById(r+"_win");if(!i)return;let p=Math.max(0,f-s.viewSize),u=Math.max(0,Math.min(p,s.viewStart));i.style.left=u/f*100+"%",i.style.width=s.viewSize/f*100+"%"}function wt(){return Array.from(new Set([f,48,32,20,14,10,8])).filter(i=>i<=f&&i>=1).sort((i,p)=>i-p)}function Oe(i){return Math.max(0,Math.min(Math.max(0,f-s.viewSize),i))}let Ge=!1;function yt(){Ge||(Ge=!0,requestAnimationFrame(()=>{Ge=!1,!xe&&(j(),yn())}))}function Xe(i){let p=Oe(s.viewStart+i);p!==s.viewStart&&(s.viewStart=p,j(),ye(),de())}function Ln(i){let p=Oe(i);p!==s.viewStart&&(s.viewStart=p,yt())}function Lt(i,p){let u=wt(),x=u.findIndex(W=>W>=s.viewSize),w=x===-1?u.length-1:x,T=i<0?Math.max(0,w-1):Math.min(u.length-1,w+1),P=u[T];P!==s.viewSize&&(s.viewSize=P,s.viewStart=Math.max(0,Math.min(f-P,Math.round(p-P/2))),j(),ye(),de())}function kt(i){Lt(i,s.viewStart+s.viewSize/2)}function kn(){s.viewSize=f,s.viewStart=0,j(),ye(),de()}let Te=null;function Mn(){let i=document.getElementById(r+"_sky");if(!i)return;i.addEventListener("pointerdown",u=>{let x=i.getBoundingClientRect(),w=u.clientX-x.left,T=x.width/f,P=Math.max(0,f-s.viewSize),W=Math.max(0,Math.min(P,s.viewStart)),G=W*T,se=(W+s.viewSize)*T,ie=W;(w<G||w>se)&&(ie=Oe(Math.round(w/T)-Math.floor(s.viewSize/2)),s.viewStart=ie,yt()),Te={startX:w,startStart:ie,layerW:T},i.classList.add("ll-grabbing");try{i.setPointerCapture(u.pointerId)}catch{}}),i.addEventListener("pointermove",u=>{if(!Te)return;let x=i.getBoundingClientRect(),T=(u.clientX-x.left-Te.startX)/Te.layerW;Ln(Math.round(Te.startStart+T))});let p=u=>{if(Te){Te=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(u.pointerId)}catch{}ye(),de()}};i.addEventListener("pointerup",p),i.addEventListener("pointercancel",p),i.addEventListener("wheel",u=>{u.preventDefault();let x=i.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){Xe(u.deltaX>0?1:-1);return}let w=Math.round((u.clientX-x.left)/x.width*f);Lt(u.deltaY<0?-1:1,w)},{passive:!1})}function Sn(i,p,u=!1){R(i)&&(s.selectedRow=i,s.selectedLayerIdx=p??l.layers.length-1,j(),re(),u&&Tn(i),de())}function Tn(i){b.scrollToRow(i)}function Ye(){requestAnimationFrame(()=>requestAnimationFrame(()=>{xe||b.scrollToBottom()}))}let En=.45,Cn=120,$n=360;function qe(){let i;if(Ae)i=(d.clientWidth||E.clientWidth)*Ae;else{let u=E.clientHeight;i=u>0?u:(E.clientWidth||900)*.6}let p=Math.round(i*En);V.style.height=Math.max(Cn,Math.min($n,p))+"px"}function Mt(i){return i+"\xB7"+(je(l.tokens[i])?"bos":He(l.tokens[i]))}function re(i){let p=s.pinnedRows.length>0?s.pinnedRows:s.selectedRow!==null?[s.selectedRow]:[],u=p.length>1,x=[];for(let T of p){let P=ee(T);for(let W of s.pinned){let G=J(T,W.token);if(!G)continue;let se=He(W.token);u&&(se+=" ("+Mt(T)+")"),x.push({values:G.map(ie=>ie??null),label:se,color:W.color,dashPattern:P.dash||void 0,removable:!1})}}let w=x.length===0&&!i;if(w)I.classList.add("ll-hidden");else{I.classList.remove("ll-hidden"),qe(),z.textContent=s.pinnedRows.length>1?s.pinnedRows.length+" positions":p.length===1?"position "+Mt(p[0]):"";let T={lines:[],richLines:x,xLabels:l.layers},P={darkMode:K(),mode:"probability",autoScale:!0,legendPosition:x.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:c,pixelRatio:n?.pixelRatio};oe?(oe.setData(T),oe.setOptions(P)):(le.style.minHeight="0",oe=new ke(le,T,P)),i?oe.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):oe.setOverlay?.(null)}Ie&&w!==ae?(ae=w,requestAnimationFrame(()=>{xe||(j(),Ye())})):ae=w}let Hn=56,Rn=11,Pn=9.5,Dn=15;function In(i){let p=Rn*(i>0?i/Hn:1);return Math.max(Pn,Math.min(Dn,p))}function An(i,p,u,x,w=0){let T=l.cells[i]?.[p];if(!T||!R(i))return;let P=he(),W=je(l.tokens[i])?"bos":He(l.tokens[i]);A.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${ct(T.prob,P,K())}"></span><span class="ll-tt-token">${Ee(He(T.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(T.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${l.layers[p]} / ${l.layers[f-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${Ee(W)}</span></div>`,A.style.fontSize=In(w)+"px",A.classList.add("ll-visible");let G=E.getBoundingClientRect(),se=A.offsetWidth||200,ie=A.offsetHeight||80,ge=8,ce=14,ve=u-G.left,we=x-G.top,q=ve+ce;q+se>G.width-ge&&(q=ve-ce-se),q=Math.max(ge,Math.min(q,G.width-se-ge));let Le=we-50;Le=Math.max(ge,Math.min(Le,G.height-ie-ge)),A.style.left=q+"px",A.style.top=Le+"px"}function Ke(){A.classList.remove("ll-visible")}function On(){Qe(),me=document.createElement("div"),me.style.cssText="position:fixed;inset:0;z-index:49;",me.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),Tt()}),document.body.appendChild(me)}function Qe(){me&&(me.remove(),me=null)}function _n(i,p,u){if(!l.cells[i]?.[p]||!R(i))return;let w=u.getBoundingClientRect();s.openPopup={row:i,layer:p},s.selectedRow=i,s.selectedLayerIdx=p;let T=je(l.tokens[i])?"bos":He(l.tokens[i]);ue.innerHTML=`Layer <b>${l.layers[p]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${Ee(T)}</code></div>`,St(i,p),j(),re(),F.style.visibility="hidden",F.classList.add("ll-visible"),zn(w),F.style.visibility="",On(),de()}function St(i,p){let u=l.cells[i][p],x="";u.topk.forEach((w,T)=>{let P=Z(w.token),W=P?`background:${P}22;border-left-color:${P};`:"";x+=`<div class="ll-topk${P?" ll-topk-pinned":""}" data-ki="${T}" style="${W}" title="click to track trajectory"><span class="ll-topk-tok">${Kt(w.token)}</span><span class="ll-topk-prob">${(w.prob*100).toFixed(1)}%</span></div>`}),Se.innerHTML=x,Se.querySelectorAll(".ll-topk").forEach(w=>{let T=parseInt(w.dataset.ki),P=u.topk[T];w.addEventListener("mouseenter",()=>{if(ae)return;let W=J(i,P.token);W&&re({values:W.map(G=>G??null),label:He(P.token),color:"#999"})}),w.addEventListener("mouseleave",()=>{ae||re()}),w.addEventListener("click",W=>{W.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(X(P.token),j(),St(i,p),re(),de())})})}function zn(i){let x=E.getBoundingClientRect(),w=Math.max(140,x.width-2*8),T=Math.max(120,x.height-2*8);F.style.maxWidth=w+"px",F.style.maxHeight=T+"px";let P=F.offsetWidth||220,W=F.offsetHeight||160,G=x.left+8,se=x.right-8-P,ie=x.top+8,ge=x.bottom-8-W,ce=[{left:i.right+6,top:i.top},{left:i.left-6-P,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-W}],ve=ce[0];for(let we of ce)if(we.left>=G&&we.left<=se&&we.top>=ie&&we.top<=ge){ve=we;break}F.style.left=Math.max(G,Math.min(ve.left,Math.max(G,se)))+"px",F.style.top=Math.max(ie,Math.min(ve.top,Math.max(ie,ge)))+"px"}function Tt(){s.openPopup=null,F.classList.remove("ll-visible"),Qe(),j(),re()}c&&document.getElementById(r+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),Tt()});function Wn(i,p){if(ae||!R(i))return;let u=l.cells[i]?.[p]?.token,x=u!=null?J(i,u):null;x?re({values:x.map(w=>w??null),label:He(u),color:"#999"}):re()}function Bn(){ae||re()}function Fn(i,p){Wn(i,p)}function Nn(i,p,u){if(!R(i))return;if(u.shiftKey){let w=l.cells[i]?.[p]?.token;w&&(X(w),j(),re(),de());return}Ke();let x=u.target.closest(".hmx-cell");x&&_n(i,p,x)}b=new Re(_,xt(),vt());let Fe=b.getScrollElement(),Et=i=>{let p=i.target.closest(".hmx-cell");if(!p){Ke();return}An(parseInt(p.dataset.row),parseInt(p.dataset.col),i.clientX,i.clientY,p.offsetWidth)},Ct=i=>{i.shiftKey&&i.target.closest(".hmx-rowlabel")&&i.preventDefault()};c&&(Fe.addEventListener("mousemove",Et),Fe.addEventListener("mousedown",Ct),_.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let p=i.key==="ArrowDown"?1:-1,u=(s.selectedRow??(p>0?-1:L))+p;for(;u>=0&&u<L&&!R(u);)u+=p;R(u)&&Sn(u,void 0,!0)}),U.addEventListener("click",i=>{let p=i.target.closest("[data-nav]");if(!p||p.hasAttribute("disabled"))return;let u=p.dataset.nav;u==="panL"?Xe(-Math.max(1,Math.floor(s.viewSize/4))):u==="panR"?Xe(Math.max(1,Math.floor(s.viewSize/4))):u==="zoomIn"?kt(-1):u==="zoomOut"?kt(1):u==="reset"&&kn()}));function Ze(){j(),ye(),re(),requestAnimationFrame(()=>{xe||(j(),ye(),ae||qe())})}function Je(){it(E,K(),F)}function de(){S("stateChange",Pt())}Ze(),c&&Ye(),Je();let et=0,$t=d?.clientWidth??0,Ht=d?.clientHeight??0,Rt=new ResizeObserver(()=>{let i=d?.clientWidth??0,p=d?.clientHeight??0;i===$t&&p===Ht||($t=i,Ht=p,!et&&(et=requestAnimationFrame(()=>{et=0,!xe&&(j(),ae||qe())})))});d&&Rt.observe(d);let Vn=Ve(d,i=>{s.darkModeOverride===null&&(it(E,i,F),j(),ye(),re())});function Pt(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:s.pinnedRows.map(i=>({pos:i,line:ee(i).name})),darkMode:s.darkModeOverride,rowHighlights:s.rowHighlights,collapsedSections:s.collapsedSections,rowStart:s.rowStart}}return{widget:{getState:Pt,setState:i=>{i.ramp!==void 0&&(s.ramp=i.ramp),i.showGrid!==void 0&&(s.showGrid=i.showGrid),i.dimLowProb!==void 0&&(s.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(s.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(s.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(s.viewStart=i.viewStart),i.viewSize!==void 0&&(s.viewSize=i.viewSize),i.colorIndex!==void 0&&(s.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(s.pinned=m(i.pinnedGroups)),i.pinnedRows!==void 0&&(s.pinnedRows=i.pinnedRows.map(p=>p.pos).filter(p=>typeof p=="number")),i.darkMode!==void 0&&(s.darkModeOverride=i.darkMode),i.rowHighlights!==void 0&&(s.rowHighlights=i.rowHighlights),i.collapsedSections!==void 0&&(s.collapsedSections=i.collapsedSections.map(p=>({...p}))),i.rowStart!==void 0&&(s.rowStart=i.rowStart),N(),Je(),Ze()},setData:i=>{a=ot(i),l=a.normalized,h=a.v2Data,s.selectedRow=null,s.selectedLayerIdx=null,s.pinned=[],s.pinnedRows=[],s.colorIndex=0,s.rowHighlights=[],s.collapsedSections=[],s.rowStart=null,y=null,N(),g=[],b.setData(xt()),Ze(),c&&Ye()},setTitle:()=>{},setThemeMode:i=>{s.darkModeOverride=!!i,Je(),j(),ye(),re()},getThemeMode:()=>K(),getRowWindow:()=>H,hasEntropyData:()=>!!h&&Array.isArray(h.entropy)&&h.entropy.length>0,hasRankData:()=>{if(!h?.tracked)return!1;for(let i of h.tracked)for(let p in i){let u=i[p];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,p)=>{(C[i]||(C[i]=[])).push(p)},off:(i,p)=>{C[i]=(C[i]||[]).filter(u=>u!==p)},destroy:()=>{xe=!0,Vn(),Rt?.disconnect(),Qe(),F.remove(),oe&&(oe.destroy(),oe=null),Fe.removeEventListener("mousemove",Et),Fe.removeEventListener("mousedown",Ct),b?.destroy(),d&&(d.innerHTML="")}},styleEl:v}}var go='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',bo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',xo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',vo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',wo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Pe=class{constructor(e,t,n,r){this.widget=null;this.styleEl=null;let c=Qt(e,t,n,r);c&&(this.widget=c.widget,this.styleEl=c.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}getRowWindow(){return this.widget?.getRowWindow()??null}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var yo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Lo='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ko='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',pt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function ht(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Zt(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${pt};`;let t={isOpen:!1,searchQuery:""},n=en(e,o,t);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=t,e}function We(o,e){let t=o.__tokenSelectorCleanup,n=o.__tokenSelectorState;t&&t();let r={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},c=en(o,e,r);o.__tokenSelectorCleanup=c,o.__tokenSelectorState=r}function Jt(o){let e=o.__tokenSelectorCleanup;e&&e()}function en(o,e,t){o.innerHTML="";let n=ht(e.darkMode),{allLabels:r,selectedIndices:c,defaultIndices:d,onChange:a}=e,l=document.createElement("div");l.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let h=document.createElement("span");if(h.style.cssText=`font-size:11px;color:${n.fgMuted};`,h.textContent=`Tokens (${r.length})`,l.appendChild(h),!ut(c,d)){let k=document.createElement("button");k.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${pt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,k.innerHTML=`${yo} Reset`,k.addEventListener("mouseenter",()=>{k.style.color=n.fg}),k.addEventListener("mouseleave",()=>{k.style.color=n.fgMuted}),k.addEventListener("click",()=>{a(Array.from(d))}),l.appendChild(k)}o.appendChild(l);let m=document.createElement("div");m.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,m.addEventListener("click",()=>{L(),y.focus()});let s=Array.from(c).sort((k,M)=>k-M);for(let k of s){let M=Mo(k,r[k],e.darkMode,()=>{let R=new Set(c);R.delete(k),a(Array.from(R))});m.appendChild(M)}let y=document.createElement("input");y.type="text",y.placeholder=s.length===0?"Search tokens...":"",y.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${pt};min-width:60px;flex:1;padding:2px 0;`,y.addEventListener("input",()=>{t.searchQuery=y.value,f()}),y.addEventListener("focus",()=>L()),m.appendChild(y);let $=document.createElement("span");$.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,$.innerHTML=ko,$.addEventListener("click",k=>{k.stopPropagation(),t.isOpen?B():L()}),m.appendChild($),o.appendChild(m);let H=document.createElement("div");H.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let C=document.createElement("div");C.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",H.appendChild(C);let S=document.createElement("div");S.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,S.textContent="No tokens found",H.appendChild(S),o.appendChild(H);function f(){C.innerHTML="";let k=t.searchQuery.toLowerCase(),M=0;for(let R=0;R<r.length;R++){let N=r[R];if(k&&!N.toLowerCase().includes(k))continue;M++;let Z=c.has(R),X=So(R,N,Z,e.darkMode,()=>{let J=new Set(c);Z?J.delete(R):J.add(R),a(Array.from(J))});C.appendChild(X)}S.style.display=M===0?"":"none"}function L(){t.isOpen||(t.isOpen=!0,H.style.display="",$.style.transform="rotate(180deg)",f())}function B(){t.isOpen&&(t.isOpen=!1,H.style.display="none",$.style.transform="",y.value="",t.searchQuery="")}function O(k){o.contains(k.target)||B()}return document.addEventListener("mousedown",O),t.isOpen&&(H.style.display="",$.style.transform="rotate(180deg)",y.value=t.searchQuery,f(),requestAnimationFrame(()=>{y.isConnected&&y.focus()})),()=>{document.removeEventListener("mousedown",O)}}function Mo(o,e,t,n){let r=ht(t),c=Q[o%Q.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${r.chipBorder};background:${r.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=r.chipHoverBg,d.style.borderColor=r.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=r.chipBg,d.style.borderColor=r.chipBorder});let a=document.createElement("span");a.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${c};`,d.appendChild(a);let l=document.createElement("span");l.style.cssText=`font-size:11px;color:${r.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,l.innerHTML=$e(e),l.title=e,d.appendChild(l);let h=document.createElement("button");return h.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${r.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,h.innerHTML=Lo,h.addEventListener("mouseenter",()=>{h.style.color=r.badgeText}),h.addEventListener("mouseleave",()=>{h.style.color=r.fgMuted}),h.addEventListener("click",v=>{v.stopPropagation(),n()}),d.appendChild(h),d}function So(o,e,t,n,r){let c=ht(n),d=Q[o%Q.length],a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",a.addEventListener("mouseenter",()=>{a.style.background=c.hoverBg}),a.addEventListener("mouseleave",()=>{a.style.background="transparent"}),a.addEventListener("click",m=>{m.stopPropagation(),r()});let l=document.createElement("span");l.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?d:"transparent"};border:1.5px solid ${t?d:c.fgMuted};`,a.appendChild(l);let h=document.createElement("span");h.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?c.fg:c.fgMuted};`,h.innerHTML=$e(e),h.title=e,a.appendChild(h);let v=o===0?"source pred":o===1?"target pred":null;if(v){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${c.badgeBg};color:${c.badgeText};border:1px solid ${c.badgeBorder};`,m.textContent=v,a.appendChild(m)}if(t){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;font-size:10px;color:${c.selectedText};`,m.textContent="selected",a.appendChild(m)}return a}function ut(o,e){if(o.size!==e.size)return!1;for(let t of o)if(!e.has(t))return!1;return!0}var To={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Eo=["probability","prob_diff","rank"],De=class{constructor(e,t,n={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.interactive=n.interactive!==!1,this.pixelRatio=n.pixelRatio,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let r=t.tokenLabels?.length??t.lines?.length??0,c=n.defaultSelectedTokens??Array.from({length:Math.min(2,r)},(a,l)=>l);this.defaultTokens=new Set(c),this.selectedTokens=new Set(n.selectedTokens??c),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=Zt(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new ke(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),We(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of Eo){let n=document.createElement("button");n.textContent=To[t],this.applyModeButtonStyles(n,t===this.mode),n.addEventListener("click",()=>this.setMode(t)),n.addEventListener("mouseenter",()=>{t!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{t!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(t,n)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",r="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?r:"transparent"};color:${t?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,a)=>d-a),r=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:r?e[d].map(a=>a+1):e[d],label:t[d]??`Token ${d}`,color:Q[d%Q.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,t)},(r,c)=>c));let n=new Set([...this.selectedTokens].filter(r=>r<t));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),We(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),We(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,n=new Set(e.filter(r=>r<t));ut(n,this.selectedTokens)||(this.selectedTokens=n,We(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Jt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function mt(o,e,t){let n=Math.max(1,o),r=Math.max(1,e),c=Math.min(16e3/n,16e3/r,Math.sqrt(25e7/(n*r)));return Math.max(.01,Math.min(t>0?t:1,c))}var ft="http://www.w3.org/1999/xhtml",Ue="http://www.w3.org/2000/svg",Co=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,$o=new Set(["d","x","y","cx","cy","r","rx","ry"]),Ho=new Set(["script","style","link","noscript","template"]),Ro=[["border-top-style","border-top-width"],["border-right-style","border-right-width"],["border-bottom-style","border-bottom-width"],["border-left-style","border-left-width"],["outline-style","outline-width"],["column-rule-style","column-rule-width"]],Po=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,Do=o=>o.replace(Po,e=>e.length===2?e:"\uFFFD"),gt=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(Ue,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,t){let n=e.namespaceURI??ft,r=`${n} ${e.localName}${t??""}`,c=this.cache.get(r);if(c)return c;let d=this.doc.createElementNS(n,e.localName);(n===Ue?this.svgRoot:this.doc.body).appendChild(d);let a=this.win.getComputedStyle(d,t??null);c=new Map;for(let l=0;l<a.length;l++){let h=a.item(l);c.set(h,a.getPropertyValue(h))}return d.remove(),this.cache.set(r,c),c}destroy(){this.frame.remove()}};function tn(o,e,t,n){let r="",c=new Set;for(let d=0;d<o.length;d++){let a=o.item(d);if(Co.test(a)||n&&$o.has(a))continue;let l=o.getPropertyValue(a);l===e.get(a)&&(!t||l===t.getPropertyValue(a))||(r+=`${a}:${l};`,c.add(a))}for(let[d,a]of Ro){let l=o.getPropertyValue(d);l&&l!=="none"&&l!=="hidden"&&!c.has(a)&&(r+=`${a}:${o.getPropertyValue(a)};`)}return r}function nn(o,e,t){if(o.nodeType===Node.TEXT_NODE)return document.createTextNode(o.nodeValue??"");if(o.nodeType!==Node.ELEMENT_NODE)return null;let n=o;if(Ho.has(n.localName.toLowerCase()))return null;let r=getComputedStyle(n);if(r.display==="none")return null;let c=n instanceof HTMLCanvasElement,d;if(c){d=document.createElement("img");try{d.setAttribute("src",n.toDataURL("image/png"))}catch{}}else d=n.cloneNode(!1);d.setAttribute("style",tn(r,t.sandbox.defaults(n),e,n.namespaceURI===Ue));let a="",l="";for(let h of["::before","::after"]){let v=getComputedStyle(n,h),m=v.getPropertyValue("content");!m||m==="none"||m==="normal"||v.display==="none"||(l||(l=`nns-snap-${t.nextClass++}`),a+=`.${l}${h}{${tn(v,t.sandbox.defaults(n,h),r,!1)}}`)}if(l&&(d.setAttribute("class",`${d.getAttribute("class")??""} ${l}`.trim()),t.rules.push(a)),!c)for(let h of Array.from(n.childNodes)){let v=nn(h,r,t);v&&d.appendChild(v)}return d}function Io(o){return new Promise((e,t)=>{let n=new Image;n.onload=()=>e(n),n.onerror=()=>t(new Error("Snapshot failed: the browser could not render the captured element.")),n.src=o})}async function Be(o,e={}){let t=Math.max(0,e.padding??0),n=o.getBoundingClientRect(),r=Math.ceil(n.width),c=Math.ceil(n.height);if(r===0||c===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let d=r+2*t,a=c+2*t,l=mt(d,a,e.scale??2),h=new gt,v;try{let C={sandbox:h,rules:[],nextClass:0},S=nn(o,null,C);if(!S)throw new Error("Snapshot failed: the element is not displayed.");S.setAttribute("style",S.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${r}px;height:${c}px;box-sizing:border-box;`);let f=document.createElementNS(ft,"div");if(f.setAttribute("style",`width:${d}px;height:${a}px;padding:${t}px;margin:0;box-sizing:border-box;`),C.rules.length){let L=document.createElementNS(ft,"style");L.textContent=C.rules.join(""),f.appendChild(L)}f.appendChild(S),v=Do(new XMLSerializer().serializeToString(f))}finally{h.destroy()}let m=`<svg xmlns="${Ue}" width="${d*l}" height="${a*l}" viewBox="0 0 ${d} ${a}"><foreignObject x="0" y="0" width="${d}" height="${a}">${v}</foreignObject></svg>`,s=await Io("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(m)),y=document.createElement("canvas");y.width=Math.round(d*l),y.height=Math.round(a*l);let $=y.getContext("2d");if(!$)throw new Error("Snapshot failed: no 2D canvas context.");e.background&&($.fillStyle=e.background,$.fillRect(0,0,y.width,y.height)),$.drawImage(s,0,0,y.width,y.height);let H;try{H=y.toDataURL("image/png")}catch(C){throw new Error(`Snapshot failed: this browser won't read back the rendered image (${C.message}).`)}return{dataUrl:H,width:d,height:a,scale:l,toBlob:()=>new Promise((C,S)=>y.toBlob(f=>f?C(f):S(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var on={light:"#ffffff",dark:"hsl(0 0% 16%)"};function Ao(){return new Promise(o=>{let e=setTimeout(o,100);requestAnimationFrame(()=>{clearTimeout(e),o()})})}async function Oo(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let o=0;o<3;o++)await Ao()}async function ln(o,e={}){let t=Math.max(200,Math.round(e.width??880)),n=e.darkMode??!1,r=e.scale??2,c=e.background===void 0?n?on.dark:on.light:e.background,d=document.createElement("div");d.setAttribute("aria-hidden","true"),d.style.cssText=`position:fixed;left:-100000px;top:0;width:${t}px;pointer-events:none;`;let a=document.createElement("div");d.appendChild(a),document.body.appendChild(d);let l=()=>{},h=()=>{};try{if(o.kind==="logit-lens"){let m=new Pe(a,o.data,{...o.uiState,darkMode:n},{interactive:!1,pixelRatio:r,maxRows:e.maxRows});l=()=>m.destroy(),h=()=>m.getRowWindow()}else{let m=Math.max(160,Math.round(e.height??t*.5));d.style.height=`${m}px`;let s=new De(a,o.data,{mode:o.mode,selectedTokens:o.selectedTokens,title:o.title,darkMode:n,transparentBackground:!0,interactive:!1,pixelRatio:r});l=()=>s.destroy()}return await Oo(),{...await Be(d,{scale:r,background:c,padding:e.padding}),rows:h()}}finally{l(),d.remove()}}function _o(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function bt(o,e,t){let n=_o(o);if(!n)return null;let r=e(n);if(t===void 0){let c=Ve(n,a=>r.setThemeMode(a)),d=r.destroy.bind(r);r.destroy=()=>{c(),d()}}return r}function an(o,e,t,n){return new Pe(o,e,t,n)}function dn(o,e,t){return bt(o,n=>new ke(n,e,{darkMode:Me(n),...t}),t?.darkMode)}var rn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function zo(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function sn(o,e){if(typeof o.getCellValue=="function")return o;let t=o,n=t.values??[],r=t.texts,c=t.rowLabels??n.map((S,f)=>String(f)),d=t.colLabels??(n[0]??[]).map((S,f)=>String(f)),a=t.ramp??"purple",l=rn[a]??(a[0]==="#"?a:rn.purple),[h,v,m]=zo(l),[s,y]=t.valueDomain??[0,1],$=y-s,H=e?38:255,C=S=>Math.max(0,Math.min(1,S));return{rows:c.map(S=>({label:S})),columns:d.map(S=>({label:S,value:0})),getCellValue:(S,f)=>{let L=n[S]?.[f]??0,B=C($>0?(L-s)/$:L),O=M=>Math.round(H+(M-H)*B);return{text:r?r[S]?.[f]??"":Number.isInteger(L)?String(L):L.toFixed(2),value:L,color:`rgb(${O(h)}, ${O(v)}, ${O(m)})`,textColor:B>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function cn(o,e,t){return bt(o,n=>{let r=t?.darkMode??Me(n),c=new Re(n,sn(e,r),{darkMode:r,...t}),d=c.setThemeMode.bind(c);return c.setThemeMode=a=>{c.setData(sn(e,a)),d(a)},c},t?.darkMode)}function pn(o,e,t){return bt(o,n=>new De(n,e,{darkMode:Me(n),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=an,window.LinePlotWidget=dn,window.HeatmapTableWidget=cn,window.ActivationPatchingWidget=pn);return Kn(Wo);})();
//# sourceMappingURL=charts.js.map
