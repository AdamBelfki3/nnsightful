"use strict";var InterpTools=(()=>{var Qe=Object.defineProperty;var Hn=Object.getOwnPropertyDescriptor;var Pn=Object.getOwnPropertyNames;var Rn=Object.prototype.hasOwnProperty;var Dn=(i,e)=>{for(var n in e)Qe(i,n,{get:e[n],enumerable:!0})},In=(i,e,n,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Pn(e))!Rn.call(i,r)&&r!==n&&Qe(i,r,{get:()=>e[r],enumerable:!(o=Hn(e,r))||o.enumerable});return i};var zn=i=>In(Qe({},"__esModule",{value:!0}),i);var go={};Dn(go,{ActivationPatchingWidget:()=>Qt,HeatmapTableWidget:()=>Xt,LinePlotWidget:()=>Yt,LogitLensWidget:()=>qt});function kt(i){return i.completion&&i.completion.length?[...i.input,...i.completion]:i.input}function _n(i){let e=i.positions,n=kt(i).length;if(!e||e.length===n&&e.every((c,s)=>c===s))return{data:i,computedRows:null};let o=new Array(n);e.forEach((c,s)=>{Number.isInteger(c)&&c>=0&&c<n&&s<i.tracked.length&&(o[c]=s)});let r=Array.from({length:n},(c,s)=>s),h=(c,s,u)=>{let l=o[s];return l!==void 0&&c&&l<c.length?c[l]:u()};return{data:{...i,positions:null,tracked:r.map(c=>h(i.tracked,c,()=>({}))),topk:i.topk.map(c=>r.map(s=>h(c,s,()=>[]))),entropy:i.entropy?i.entropy.map(c=>r.map(s=>h(c,s,()=>0))):i.entropy},computedRows:r.filter(c=>o[c]!==void 0)}}function Mt(i){let e=i.computedRows;if(!e)return[];let n=i.tokens.length,o=[],r=0;for(let h of[...e,n])h>r&&o.push({start:r,end:h-1,collapsed:!0,locked:!0,label:"not computed"}),r=h+1;return o}function Ze(i){let e=i;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:n,computedRows:o}=_n(i),r=n.layers.length,h=kt(n),d=h.length,c=[];for(let u=0;u<d;u++){let l=[],m=n.tracked[u]??{};for(let k=0;k<r;k++){let M=n.topk[k]?.[u]??[],x=[];for(let N=0;N<M.length;N++){let C=M[N],I=m[C]||[],T=I[k]||0;x.push({token:C,prob:T,trajectory:I})}let S=x[0]||{token:"",prob:0,trajectory:[]};l.push({token:S.token,prob:S.prob,trajectory:S.trajectory,topk:x})}c.push(l)}return{normalized:{layers:n.layers,tokens:h,cells:c,meta:n.meta||{},computedRows:o},v2Data:n}}function Tt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Le(i){let e=document.createElement("div");return e.textContent=i,e.innerHTML}function On(i){let e=`#${i}`;return`
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

        /* Flex roles for the card's stacked regions (see #${i} above).
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
        #${i}_popup {
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
        #${i}_popup.ll-visible { display: flex; }
        #${i}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${i}_popup .ll-lead-space { color: #3b82f6; }
        #${i}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${i}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${i}_popup .ll-popup-header {
            flex: 0 0 auto;
            font-weight: 600; font-size: 13px; padding-right: 16px;
            margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--p-line);
        }
        #${i}_popup .ll-popup-sub {
            font-weight: 400; font-size: 11.5px; color: var(--p-text-2); margin-top: 3px;
        }
        #${i}_popup .ll-popup-sub code {
            font-family: var(--p-mono); background: var(--p-code);
            padding: 1px 5px; border-radius: 3px;
        }
        #${i}_popup .ll-popup-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
        #${i}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${i}_popup .ll-topk:hover { background: var(--p-hover); }
        #${i}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            -webkit-user-select: text; user-select: text;
        }
        #${i}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function St(i){let e=document.createElement("style");return e.textContent=On(i),document.head.appendChild(e),e}function Je(i,e,...n){let o=r=>{e?r.classList.add("ll-dark"):r.classList.remove("ll-dark")};o(i),e?i.style.colorScheme="dark":i.style.colorScheme="";for(let r of n)r&&o(r)}var Pe=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],Ke=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var Z=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ke(i){return i.richLines&&i.richLines.length>0?i.richLines.map((n,o)=>({values:n.values,label:n.label??`Line ${o+1}`,color:n.color,dashPattern:n.dashPattern,isOverlay:n.isOverlay,removable:n.removable})):(i.lines??[]).map((n,o)=>({values:n,label:i.labels?.[o]??`Line ${o+1}`}))}function Me(i){if(!i)return"";let e=[],n=0;i.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),n=1);let o="";for(;n<i.length;n++){let r=i[n];r===`
`?(o&&(e.push(Et(o)),o=""),e.push('<span style="color:#3b82f6">\\n</span>')):o+=r}return o&&e.push(Et(o)),e.join("")}function Et(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Bn(i){if(i>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let n of e)if(i<=n)return n;return 1}function $t(i,e,n){let o=ke(i),r=o.length>0?o[0].values.length:n?.values.length??i.xLabels?.length??0;if(r===0)return null;let h=e.mode||"probability",d=e.minValue,c=e.maxValue;if(d===void 0||c===void 0||e.autoScale){let s=[];for(let m of o)if(!m.isOverlay)for(let k of m.values)k!==null&&s.push(k);if(n)for(let m of n.values)m!==null&&s.push(m);if(s.length===0)return{numLayers:r,minValue:e.logScale?1:0,maxValue:1,numLines:o.length};let u=1/0,l=-1/0;for(let m of s)m<u&&(u=m),m>l&&(l=m);if(e.centerYAxisAtZero){let k=Math.max(Math.abs(u),Math.abs(l))*1.1;d=-k,c=k}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(u))),c===void 0||e.autoScale){let m=Math.log(Math.max(1,u)),k=Math.log(Math.max(1,l)),M=k+.15*Math.max(1,k-m);c=Math.ceil(Math.exp(M))}}else d===void 0&&(d=h==="probability"?0:h==="rank"?Math.max(1,Math.floor(u)):Math.floor(u*.9)),(c===void 0||e.autoScale)&&(h==="rank"?c=Math.ceil(l*1.1):h==="probability"?c=e.autoScale?Bn(Math.max(l,.001)):Math.min(l*1.1,1):c=l*1.1)}return{numLayers:r,minValue:d,maxValue:c,numLines:o.length}}function Ct(i,e,n,o,r,h,d,c){let s=i.getContext("2d"),u=e.getBoundingClientRect(),l=window.devicePixelRatio||1;i.width=u.width*l,i.height=u.height*l,i.style.width=`${u.width}px`,i.style.height=`${u.height}px`,s.scale(l,l);let m=u.width,k=u.height,M=o.darkMode??!1,x=o.title,S=o.mode||"probability",N=o.invertYAxis??!1,C=o.centerYAxisAtZero??!1,I=o.logScale??!1,T=o.xAxisLabel||"Layer",z=o.yAxisLabel||"Probability",R=o.xRangeStart??0;R>=r.numLayers-1&&(console.warn(`xRangeStart (${R}) is >= numLayers-1 (${r.numLayers-1}), clamping to 0`),R=0);let y=o.showDataPoints??!0,w={top:x?48:24,right:24,bottom:56,left:72},P=m-w.left-w.right,O=k-w.top-w.bottom,g={margin:w,chartWidth:P,chartHeight:O,width:m,height:k},E={background:M?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:M?"#52525b":"#a1a1aa",grid:M?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:M?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:M?"#e4e4e7":"#27272a"};o.transparentBackground?s.clearRect(0,0,m,k):(s.fillStyle=E.background,s.fillRect(0,0,m,k)),x&&(s.fillStyle=E.titleText,s.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="left",s.fillText(x,w.left,28));let _=r.numLayers-1-R,B=v=>_<=0?w.left+P/2:w.left+(v-R)/_*P,W=I?Math.log(Math.max(1,r.minValue)):0,V=I?Math.log(Math.max(1,r.maxValue)):0,K=v=>{let $;if(I){let H=Math.log(Math.max(1,v));$=V-W>0?(H-W)/(V-W):.5}else $=(v-r.minValue)/(r.maxValue-r.minValue);return N?w.top+$*O:w.top+O-$*O};s.setLineDash([4,4]),s.strokeStyle=E.grid,s.lineWidth=1;let U=[],A=r.maxValue-r.minValue,le=5;if(I){let v=new Set;for(let Q=0;Q<le;Q++){let se=W+Q/(le-1)*(V-W),G=Math.round(Math.exp(se));v.has(G)||(v.add(G),U.push(G))}let $=Math.round(Math.exp(W)),H=Math.round(Math.exp(V));v.has($)||U.unshift($),v.has(H)||U.push(H)}else if(S==="rank")for(let v=0;v<le;v++)U.push(Math.round(r.minValue+v/(le-1)*A));else for(let v=0;v<le;v++)U.push(r.minValue+v/(le-1)*A);if(U.forEach(v=>{let $=K(v);s.beginPath(),s.moveTo(w.left,$),s.lineTo(w.left+P,$),s.stroke()}),s.setLineDash([]),C){let v=K(0);s.beginPath(),s.strokeStyle=M?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",s.lineWidth=1.5,s.moveTo(w.left,v),s.lineTo(w.left+P,v),s.stroke(),s.lineWidth=1}s.fillStyle=E.text,s.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="right",s.textBaseline="middle",U.forEach(v=>{let $=K(v),H;S==="probability"?H=v.toFixed(2):S==="prob_diff"?H=v>=0?`+${v.toFixed(2)}`:v.toFixed(2):H=Math.round(v).toString(),s.fillText(H,w.left-16,$)}),s.textAlign="center",s.textBaseline="top";let Y=n.xLabels&&n.xLabels.length>0,ie=Math.max(1,Math.ceil(r.numLayers/8));for(let v=0;v<r.numLayers;v+=ie){let $=B(v);if($<w.left-5||$>w.left+P+5)continue;let H=Y?String(n.xLabels[v]??v):v.toString();s.fillText(H,$,w.top+O+12)}if((r.numLayers-1)%ie!==0){let v=Y?String(n.xLabels[r.numLayers-1]??r.numLayers-1):(r.numLayers-1).toString();s.fillText(v,B(r.numLayers-1),w.top+O+12)}s.strokeStyle=M?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",s.lineWidth=1.5,s.beginPath(),s.moveTo(w.left,w.top),s.lineTo(w.left,w.top+O),s.lineTo(w.left+P,w.top+O),s.stroke(),s.fillStyle=E.textMuted,s.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(T.toUpperCase(),w.left+P/2,k-16),s.save(),s.translate(14,w.top+O/2),s.rotate(-Math.PI/2),s.textAlign="center",s.textBaseline="top",s.fillText(z.toUpperCase(),0,0),s.restore();let fe=ke(n);function pe(v,$,H,Q,se){s.beginPath(),s.strokeStyle=$,s.lineWidth=H,se!==void 0&&(s.globalAlpha=se),Q?s.setLineDash(Q.split(",").map(Number)):s.setLineDash([]);let G=!1;for(let ee=0;ee<v.length;ee++){let J=v[ee];if(J===null){G=!1;continue}let he=B(ee),ye=K(J);G?s.lineTo(he,ye):(s.moveTo(he,ye),G=!0)}s.stroke(),s.setLineDash([]),se!==void 0&&(s.globalAlpha=1)}let Se=M?"#3f3f46":"#d4d4d8";if(s.lineCap="round",s.lineJoin="round",fe.forEach((v,$)=>{!h.has($)||v.isOverlay||pe(v.values,Se,2,void 0,.35)}),fe.forEach((v,$)=>{if(h.has($)||v.isOverlay)return;let H=v.color??Z[$%Z.length];pe(v.values,H,4,v.dashPattern,.15),pe(v.values,H,2,v.dashPattern),y&&v.values.forEach((Q,se)=>{if(Q===null)return;let G=B(se),ee=K(Q),J=d?.lineIdx===$&&d?.layerIdx===se;s.beginPath(),s.strokeStyle=H,s.lineWidth=J?2:1.5,s.arc(G,ee,J?5:3.5,0,Math.PI*2),s.stroke(),s.beginPath(),s.fillStyle=M?"#18181b":"#ffffff",s.arc(G,ee,J?3.5:2.5,0,Math.PI*2),s.fill()})}),fe.forEach((v,$)=>{if(!v.isOverlay||h.has($))return;let H=v.color??"#999";pe(v.values,H,1.5,v.dashPattern??"4,2",.7)}),c){let v=c.color??"#999";pe(c.values,v,1.5,c.dashPattern??"4,2",.7)}return g}function Ht(i){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",i.appendChild(e),e}function Pt(i,e,n,o,r,h,d,c,s){let{margin:u,chartWidth:l,chartHeight:m}=r,k=o.xRangeStart??0,M=d-1-k,x=o.logScale?Math.log(Math.max(1,c)):0,S=o.logScale?Math.log(Math.max(1,s)):0;if(i<u.left||i>u.left+l||e<u.top||e>u.top+m)return null;let N=ke(n),C=null,I=1/0,T=20;for(let z=0;z<N.length;z++){if(h.has(z))continue;let R=N[z];if(!R.isOverlay)for(let y=0;y<R.values.length;y++){let w=R.values[y];if(w===null)continue;let P=M<=0?u.left+l/2:u.left+(y-k)/M*l,O;if(o.logScale){let _=Math.log(Math.max(1,w));O=S-x>0?(_-x)/(S-x):.5}else O=(w-c)/(s-c);let g=o.invertYAxis?u.top+O*m:u.top+m-O*m,E=Math.sqrt((i-P)**2+(e-g)**2);E<I&&E<T&&(I=E,C={visible:!0,x:P,y:g,lineIdx:z,layerIdx:y,value:w,label:R.label,color:R.color??Z[z%Z.length]})}}return C}function et(i,e,n,o,r,h,d){if(!e){i.style.opacity="0";return}let c=o?"#27272a":"#fff",s=o?"#3f3f46":"#e4e4e7",u=o?"#fafafa":"#18181b",l=o?"#a1a1aa":"#71717a",k=e.x>n/2?"calc(-100% - 12px)":"12px";i.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${k},-50%);`;let M=String(r?r[e.layerIdx]??e.layerIdx:e.layerIdx);i.innerHTML=`
        <div style="background:${c};border:1px solid ${s};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${u};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${Me(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${l}">${h??"Layer"}</span>
                    <span style="font-weight:500;color:${u}">${M}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${l}">Value</span>
                    <span style="font-weight:500;color:${u}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var An='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Wn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Fn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Rt(i){let e=document.createElement("div");return Dt(e,i),e}function Dt(i,e){let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",o=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";i.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${o};align-self:flex-start;`}function It(i,e,n,o,r,h){Dt(i,o),i.innerHTML="";let d=o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",c=o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",s=o?"#a1a1aa":"#71717a",u=o?"#3f3f46":"#d4d4d8",l="rgba(161,161,170,0.3)",m=o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",k=h?ke(h):[];e.forEach((M,x)=>{let S=k[x];if(S?.isOverlay)return;let N=S?.color??Z[x%Z.length],C=n.has(x),I=S?.removable??!1,T=document.createElement("button");T.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${C?"0.5":"1"};`,T.addEventListener("mouseenter",()=>{T.style.background=m}),T.addEventListener("mouseleave",()=>{T.style.background="transparent"}),T.addEventListener("click",()=>r.onToggle(x));let z=document.createElement("span");z.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${C?l:N};background:${C?u:"transparent"};`,T.appendChild(z);let R=document.createElement("span");if(R.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${C?c:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,R.title=M,R.innerHTML=Me(M),T.appendChild(R),I&&r.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${s};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=Fn,y.title="Remove",y.addEventListener("click",w=>{w.stopPropagation(),r.onRemove(x)}),T.appendChild(y),T.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),T.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${s};opacity:${C?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=C?Wn:An,T.appendChild(y),C||(T.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),T.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}i.appendChild(T)})}var xe=class{constructor(e,n,o={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let n=this.canvas.getBoundingClientRect(),o=e.clientX-n.left,r=e.clientY-n.top;this.tooltip=Pt(o,r,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),et(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,et(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=n,this.options={darkMode:!1,...o},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=Ht(this.chartContainer),this.legendEl=Rt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(r=>{if(this.destroyed)return;let h=r[0];if(!h)return;let d=Math.round(h.contentRect.width),c=Math.round(h.contentRect.height);d===this.lastWidth&&c===this.lastHeight||(this.lastWidth=d,this.lastHeight=c,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,n)=>e.label??`Line ${n+1}`):this.data.labels||(this.data.lines??[]).map((e,n)=>`Line ${n+1}`)}draw(){this.config=$t(this.data,this.options,this.overlay),this.config&&(this.geometry=Ct(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",It(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:n=>this.toggleLine(n),onRemove:this.options.onLineRemoved?n=>{this.removeLine(n,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(n)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((n,o)=>({values:n,label:this.data.labels?.[o]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,n=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let o=new Set;for(let r of this.hiddenLines)r<e?o.add(r):r>e&&o.add(r-1);this.hiddenLines=o,n||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function de(i){if(typeof document>"u")return String(i??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]);let e=document.createElement("div");return e.textContent=String(i??""),e.innerHTML}function Ie(i){return i==null?"":i.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+de(i.slice(1)):de(i)}function Nn(i){let e=`#${i}`;return`
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
    `}function zt(i){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Nn(i),document.head.appendChild(e),e}var Vn=0,ze=16,_t=20,Ot=7,Ee=class i{constructor(e,n,o={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.container=e,this.data=n,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,...o},this.uid="hmx_"+ ++Vn+"_"+Date.now().toString(36),this.styleEl=zt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render(),this.setupResponsive()}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let n=this.container?.clientWidth??0;return n>0?n-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let n=this.options.columnWindow;if(!n)return{start:0,size:e};let o=Math.max(1,Math.min(n.size,e));return{start:Math.max(0,Math.min(n.start,e-o)),size:o}}maxColsFit(){let e=this.options,n=e.minColumnWidth??48,o=e.rowHeaderWidth??100,r=Math.floor((this.availWidth()-o)/n),h=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(h,r))}resolveVisibleColumns(){let e=this.options,{start:n,size:o}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let l=[];for(let m=0;m<o;m++)l.push(n+m);return l}let r=this.maxColsFit();if(o<=r){let l=[];for(let m=0;m<o;m++)l.push(n+m);return l}let h=!!e.alwaysShowLastColumn,d=Math.max(1,r-(h?1:0)),c=Math.ceil(o/d),s=[];for(let l=n;l<n+o;l+=c)s.push(l);let u=n+o-1;return h&&s[s.length-1]!==u&&s.push(u),s}resolveCellWidth(e){let n=this.options;if(n.columnSizing==="fit"&&e>0){let o=n.rowHeaderWidth??100,r=Math.floor((this.availWidth()-o)/e);return Math.max(n.minColumnWidth??1,r)}return n.cellWidth??48}resolveRowHeight(e,n=0){let o=this.options,r=o.cellHeight??28;if(o.rowSizing!=="fill"||e<=0)return r;let h=this.scrollEl.clientHeight-n;return e*r<h?Math.floor(h/e):r}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,n=!!e.darkMode;this.root.classList.toggle("hmx-dark",n),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let o=e.rowHeaderWidth??100,r=e.headerHeight??26,h=this.data.columns,d=this.resolveVisibleColumns(),c=d.length,s=this.resolveCellWidth(c),u=this.data.rows,l=e.maxRows!=null?Math.min(u.length,e.maxRows):u.length,m=i.planRows(l,e.collapsedSections),k=0,M=0;for(let g of m)g.kind==="row"?k++:M+=g.kind==="band"?ze:_t;let x=this.resolveRowHeight(k,M),S=o+s*c,N=`${o}px repeat(${c}, ${s}px)`,C=e.showGrid?n?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",I=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${N};height:${r}px;width:${S}px;min-width:${S}px;">`;I+=`<div class="hmx-corner">${de(e.cornerLabel??"")}</div>`;for(let g=0;g<c;g++)I+=`<div class="hmx-col">${Ie(h[d[g]].label)}</div>`;I+="</div>",this.hdrEl.innerHTML=I;let T={};for(let g of e.rowHighlights??[]){let E=new Set(g.rows);for(let _ of g.rows){let B=!E.has(_-1);T[_]={color:g.color,className:g.className,top:B,bottom:!E.has(_+1),label:B?g.label:void 0}}}this.lastRowH=x;let z=g=>{let E=u[g].label,_=e.rowClassName?.(g),B=T[g],W=B?" hmx-row-hl"+(B.top?" hmx-hl-top":"")+(B.bottom?" hmx-hl-bottom":"")+(B.className?" "+B.className:""):"",V=B?(B.color?` style="--hmx-hl:${de(B.color)}"`:"")+(B.label?` data-hl-label="${de(B.label)}"`:""):"",K=e.renderRowLabel?e.renderRowLabel(g):`<span class="hmx-cell-text">${Ie(E)}</span>`,U=`<div class="hmx-row${_?" "+_:""}${W}" data-rowwrap="${g}"${V}>`;U+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${N};height:${x}px;">`,U+=`<div class="hmx-rowlabel" data-row="${g}" title="${de(E)}">${K}</div>`;for(let A=0;A<c;A++){let le=d[A],Y=this.data.getCellValue(g,le),ie=Y.highlighted&&Y.highlightColor?`box-shadow:inset 0 0 0 2px ${Y.highlightColor};`:"",fe=Y.bold?"font-weight:bold;":"",pe=Y.opacity!=null&&Y.opacity<1?`opacity:${Y.opacity};`:"",Se=g===0,v=g===l-1,$=A===0,H=A===c-1,Q="";Se&&$?Q="border-top-left-radius:8px;":Se&&H?Q="border-top-right-radius:8px;":v&&$?Q="border-bottom-left-radius:8px;":v&&H&&(Q="border-bottom-right-radius:8px;"),U+=`<div class="hmx-cell${Y.className?" "+Y.className:""}" data-row="${g}" data-col="${le}" style="background:${Y.color};color:${Y.textColor};padding:0 6px;${pe}${C}${ie}${fe}${Q}"><span class="hmx-cell-text">${Ie(Y.text)}</span></div>`}return U+="</div></div>",U},R=(e.rowRegions??[]).filter(g=>g.start<=g.end),y=R.map(()=>({top:-1,bottom:-1})),w=(g,E,_,B)=>{for(let W=0;W<R.length;W++)E>=R[W].start&&g<=R[W].end&&(y[W].top<0&&(y[W].top=_),y[W].bottom=B)},P=`<div class="hmx-grid-inner" style="width:${S}px;min-width:${S}px;">`,O=0;for(let g of m){if(g.kind==="band"){let E=g.end-g.start+1,_,B=!1;for(let U=g.start;U<=g.end;U++)if(T[U]){B=!0,_=T[U].color;break}let W=E===1?"":"s",V=`${E} row${W} ${de(g.label??"hidden")}`,K="hmx-collapsed"+(g.locked?" hmx-collapsed-locked":"")+(B?" hmx-collapsed-hl":"");P+=`<div class="${K}"${g.locked?"":` data-cs="${g.index}"`} data-count="${g.shown}" style="width:${S}px;min-width:${S}px;height:${ze}px;${_?`--hmx-hl:${de(_)};`:""}" title="${g.locked?V:`Click to show ${E} hidden row${W}`}"><span class="hmx-collapsed-inner">\u2026 ${V}</span></div>`,w(g.start,g.end,O,O+ze),O+=ze;continue}if(g.kind==="handle"){let E=g.end-g.start+1;P+=`<div class="hmx-expanded-toggle" data-cs="${g.index}" data-count="${g.shown}" style="width:${S}px;min-width:${S}px;" title="Collapse these ${E} rows"><span>\u2303 collapse ${E} row${E===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,O+=_t;continue}P+=z(g.row),w(g.row,g.row,O,O+x),O+=x}for(let g=0;g<R.length;g++){let E=y[g];if(E.top<0||E.bottom<=E.top)continue;let _=R[g],B=_.color?`--hmx-region:${de(_.color)};`:"",W=E.top+Ot,V=Math.max(0,E.bottom-E.top-2*Ot);V<=0||(P+=`<div class="hmx-region-rail" style="top:${W}px;height:${V}px;${B}"></div>`,_.label&&(P+=`<div class="hmx-region-label" style="top:${W}px;height:${V}px;${B}">${de(_.label)}</div>`))}if(P+="</div>",this.scrollEl.innerHTML=P,this.pendingScroll){let{scrollBefore:g,bandTop:E,delta:_}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,E<g?g+_:g)}e.onVisibleColumnsChange&&!jn(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let n=e.target.closest(".hmx-cell");if(!n){this.clearHover();return}this.hoverCell!==n&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=n,n.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(n.dataset.row),parseInt(n.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let n=e.target,o=n.closest(".hmx-collapsed, .hmx-expanded-toggle");if(o){if(o.dataset.cs===void 0)return;let d=parseInt(o.dataset.cs);if(n.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:o.offsetTop,delta:-o.offsetHeight},this.options.onRemoveCollapse?.(d);return}let c=parseInt(o.dataset.count||"0"),s=o.classList.contains("hmx-collapsed"),u=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:o.offsetTop,delta:s?c*u:-c*u},this.options.onToggleCollapse?.(d);return}let r=n.closest(".hmx-rowlabel");if(r){this.options.onRowHeaderClick?.(parseInt(r.dataset.row),e);return}let h=n.closest(".hmx-cell");h&&this.options.onCellClick?.(parseInt(h.dataset.row),parseInt(h.dataset.col),e)})}static planRows(e,n=[]){let o=n.map((s,u)=>({start:Math.max(0,s.start),end:Math.min(e-1,s.end),collapsed:s.collapsed!==!1,locked:!!s.locked,label:s.label,index:u})).filter(s=>s.start<=s.end),r=new Array(e);for(let s of o)if(s.locked)for(let u=s.start;u<=s.end;u++)r[u]??(r[u]=s);let h=(s,u)=>{let l=0;for(let m=s;m<=u;m++)r[m]||l++;return l},d=new Map;for(let s of o)s.locked||h(s.start,s.end)===0||d.has(s.start)||d.set(s.start,s);let c=[];for(let s=0;s<e;){let u=d.get(s);if(u?.collapsed){c.push({kind:"band",start:u.start,end:u.end,index:u.index,locked:!1,label:u.label,shown:h(u.start,u.end)}),s=u.end+1;continue}u&&c.push({kind:"handle",start:u.start,end:u.end,index:u.index,shown:h(u.start,u.end)});let l=r[s];if(l){let m=s;for(;m+1<e&&r[m+1]===l&&!d.has(m+1);)m++;c.push({kind:"band",start:s,end:m,index:l.index,locked:!0,label:l.label,shown:0}),s=m+1;continue}c.push({kind:"row",row:s}),s++}return c}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let n=this.isResponsive();this.options={...this.options,...e},this.render(),!n&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let n=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!n)return;let o=n.offsetTop-this.scrollEl.clientHeight/2+n.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,o),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function jn(i,e){if(i.length!==e.length)return!1;for(let n=0;n<i.length;n++)if(i[n]!==e[n])return!1;return!0}function tt(i){let e=i.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let n=i.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(n){let o=n[1],r,h,d,c=1;return o.length===3||o.length===4?(r=parseInt(o[0]+o[0],16),h=parseInt(o[1]+o[1],16),d=parseInt(o[2]+o[2],16),o.length===4&&(c=parseInt(o[3]+o[3],16)/255)):(r=parseInt(o.slice(0,2),16),h=parseInt(o.slice(2,4),16),d=parseInt(o.slice(4,6),16),o.length===8&&(c=parseInt(o.slice(6,8),16)/255)),[r,h,d,c]}return null}function nt(i){return!i||i[3]<.95?null:(.299*i[0]+.587*i[1]+.114*i[2])/255}function Un(i){let e=i;for(;e;){let n=nt(tt(getComputedStyle(e).backgroundColor));if(n!==null)return n;e=e.parentElement}if(typeof document<"u")for(let n of[document.body,document.documentElement]){if(!n)continue;let o=nt(tt(getComputedStyle(n).backgroundColor));if(o!==null)return o}return null}function Gn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let n=nt(tt(e));return n===null?null:n<.5}function _e(i,e){let n=ve(i),o=()=>{let d=ve(i);d!==n&&(n=d,e(d))},r=new MutationObserver(o);typeof document<"u"&&(r.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&r.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let h=null;return typeof window<"u"&&window.matchMedia&&(h=window.matchMedia("(prefers-color-scheme: dark)"),h.addEventListener("change",o)),()=>{r.disconnect(),h?.removeEventListener("change",o)}}function ve(i){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=Gn();if(e!==null)return e;let n=Un(i??null);return n!==null?n<.5:!1}var qn=60,Yn=30,Xn=22,Qn=48,Zn=18,Bt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Jn="#cc6622";function Kn(i){let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var At=41;function ot(i,e,n){let[o,r,h]=Kn(e),d=Math.pow(Math.max(0,Math.min(1,i)),1.1);if(n){let s=u=>Math.round(At+(u-At)*d);return`rgb(${s(o)}, ${s(r)}, ${s(h)})`}let c=s=>Math.round(255-(255-s)*d);return`rgb(${c(o)}, ${c(r)}, ${c(h)})`}function eo(i,e){return e?i>=.62?"#fff":i>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":i>=.62?"#fff":i>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Wt(i){return i==null?"":i.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Le(i.slice(1)):Le(i)}function Te(i){return i==null?"":i.startsWith(" ")?"_"+i.slice(1):i}function Oe(i){let e=i.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Ft(i,e,n){let o=Tt(),r;if(typeof i=="string"?r=document.querySelector(i):i instanceof Element?r=i:r=null,!r)return console.error("Container not found:",i),null;let h=Ze(e),d=h.normalized,c=h.v2Data,s=St(o);function u(t){return t?t.map(a=>({token:a.tokens?.[0]??"",color:a.color})).filter(a=>a.token!==""):[]}let l={ramp:n?.ramp||"purple",showGrid:n?.showGrid??!0,dimLow:n?.dimLowProb??!0,selectedRow:n?.selectedRow??null,selectedLayerIdx:n?.selectedLayer??null,viewStart:n?.viewStart??0,viewSize:n?.viewSize??d.layers.length,darkModeOverride:n?.darkMode??null,pinned:u(n?.pinnedGroups),pinnedRows:(n?.pinnedRows??[]).map(t=>t.pos).filter(t=>typeof t=="number"),colorIndex:n?.colorIndex??0,openPopup:null,rowHighlights:n?.rowHighlights??[],collapsedSections:(n?.collapsedSections??[]).map(t=>({...t}))},m=null,k={};function M(t,a){(k[t]||[]).forEach(p=>p(a))}let x=d.layers.length,S=d.tokens.length,N=[],C="",I=new Set,T=[];function z(t){return t>=0&&t<S&&!I.has(t)}function R(){x=d.layers.length,S=d.tokens.length,T=Mt(d),I=new Set;for(let f of T)for(let b=f.start;b<=f.end;b++)I.add(b);N=[];for(let f=0;f<x;f++){let b=0;for(let L=0;L<S;L++){let D=d.cells[L]?.[f];D&&D.prob>b&&(b=D.prob)}N.push(b)}let t=d.computedRows,a=t?t[t.length-1]??-1:S-1;C=d.cells[a]?.[x-1]?.token??"",l.pinnedRows=l.pinnedRows.filter(z),l.selectedRow!==null&&!z(l.selectedRow)&&(l.selectedRow=null),(l.viewSize>x||l.viewSize<1)&&(l.viewSize=x);let p=Math.max(0,x-l.viewSize);l.viewStart>p&&(l.viewStart=p),l.viewStart<0&&(l.viewStart=0)}R();function y(t){let a=l.pinned.find(p=>p.token===t);return a?a.color:null}function w(t){let a=l.pinned.findIndex(p=>p.token===t);a>=0?l.pinned.splice(a,1):(l.pinned.push({token:t,color:Pe[l.colorIndex%Pe.length]}),l.colorIndex++)}function P(t,a){let p=c?.tracked?.[t];if(p&&Array.isArray(p[a]))return p[a];for(let f=0;f<x;f++){let b=d.cells[t]?.[f]?.topk.find(L=>L.token===a);if(b)return b.trajectory}return null}function O(t){let a=l.pinnedRows.indexOf(t);return Ke[(a<0?0:a)%Ke.length]}function g(t){return l.pinnedRows.indexOf(t)>=0}function E(t,a){for(let p of l.pinned){let f=P(t,p.token);if(!f)continue;let b=0;for(let L of f)L!=null&&L>b&&(b=L);if(b>=a)return!0}return!1}function _(t){let a=null,p=0;for(let f=0;f<x;f++){let b=d.cells[t]?.[f];b&&b.prob>p&&(p=b.prob,a=b.token)}return p>=.05?a:null}function B(t){if(!z(t))return;let a=l.pinnedRows.indexOf(t);if(a>=0){l.pinnedRows.splice(a,1);return}if(!E(t,.01)){let p=_(t);p&&!y(p)&&(l.pinned.push({token:p,color:Pe[l.colorIndex%Pe.length]}),l.colorIndex++)}l.pinnedRows.push(t)}function W(){return Bt[l.ramp]||Bt.purple}function V(){return l.darkModeOverride!==null?l.darkModeOverride:ve(r)}let K=[];function U(){return K.length>1?Math.max(1,K[1]-K[0]):1}r.innerHTML=`
        <div id="${o}" tabindex="-1">
            <div class="ll-heatmap" id="${o}_heatmap" tabindex="0"></div>
            <div class="ll-nav" id="${o}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${o}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${o}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${o}_lp_box"><div class="ll-lineplot" id="${o}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${o}_tt"></div>
            <div class="ll-popup" id="${o}_popup">
                <span class="ll-popup-close" id="${o}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${o}_popup_hdr"></div>
                <div class="ll-popup-body" id="${o}_popup_body"></div>
            </div>
        </div>
    `;let A=document.getElementById(o),le=document.getElementById(o+"_heatmap"),Y=document.getElementById(o+"_nav"),ie,fe=document.getElementById(o+"_lp_wrap"),pe=document.getElementById(o+"_lp_token"),Se=document.getElementById(o+"_lp_box"),v=document.getElementById(o+"_lp"),$=document.getElementById(o+"_tt"),H=document.getElementById(o+"_popup"),Q=document.getElementById(o+"_popup_hdr"),se=document.getElementById(o+"_popup_body");document.body.appendChild(H);let G=null,ee=null,J=!0,he=!1,ye=getComputedStyle(A).getPropertyValue("--ll-aspect-ratio").trim(),$e=!ye;$e&&A.classList.add("ll-fill");let Ce=(()=>{if(!ye||/^(unbounded|none|auto)$/i.test(ye))return null;let t=ye.split("/").map(a=>parseFloat(a.trim()));return t.length!==2||isNaN(t[0])||isNaN(t[1])||t[0]===0||t[1]===0?null:t[1]/t[0]})();function Zt(t,a){let p=a?"#bbb":"#555",f=t?` stroke-dasharray="${Le(t)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${p}" stroke-width="1.5"${f}/></svg>`}function at(){return{rows:d.tokens.map(t=>({label:t})),columns:d.layers.map(t=>({label:String(t),value:0})),getCellValue:(t,a)=>{let p=d.cells[t][a],f=p.prob,b=V(),L=C!==""&&p.token===C,D=y(p.token),F=f<.18;return{text:p.token,value:f,color:ot(f,L?Jn:W(),b),textColor:eo(f,b),highlighted:!!D,highlightColor:D??void 0,opacity:l.dimLow&&F?.55:void 0}}}}function Jt(t){let a=d.tokens[t],p=t===l.selectedRow||g(t),f=`<span class="ll-fold-handle${m===t?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`;return g(t)&&(f+=Zt(O(t).dash,V())),f+=Oe(a)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${p?' style="font-weight:600"':""}>${Wt(a)}</span>`,f}function Kt(t){return"ll-hmx-row"+(t===l.selectedRow||g(t)?" ll-hmx-active":"")+(tn(t)?" ll-gen-row":"")}function en(){let t=c?.completion;return t&&t.length?d.tokens.length-t.length:d.tokens.length}function tn(t){return t>=en()}function nn(t,a){let p=Math.min(t,a),f=Math.max(t,a);l.collapsedSections=l.collapsedSections.filter(b=>b.end<p||b.start>f).concat({start:p,end:f,collapsed:!0}).sort((b,L)=>b.start-L.start)}function on(t){m===null?(m=t,j()):m===t?(m=null,j()):(nn(m,t),m=null,j(),re())}function dt(){return{columnSizing:"fit",minColumnWidth:Qn,maxVisibleColumns:Zn,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:He(l.viewStart),size:l.viewSize},rowSizing:$e?"fill":"fixed",cellHeight:Yn,rowHeaderWidth:qn,headerHeight:Xn+6,height:$e||Ce!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:l.showGrid,darkMode:V(),renderRowLabel:Jt,rowClassName:Kt,rowHighlights:l.rowHighlights,collapsedSections:T.length?l.collapsedSections.concat(T):l.collapsedSections,onToggleCollapse:t=>{let a=l.collapsedSections[t];a&&(a.collapsed=a.collapsed===!1,j(),re())},onRemoveCollapse:t=>{l.collapsedSections.splice(t,1),j(),re()},onVisibleColumnsChange:t=>{K=t},onCellHover:Sn,onCellClick:En,onRowHeaderClick:(t,a)=>{if(!!a.target.closest(".ll-fold-handle")||a.shiftKey){on(t);return}B(t),j(),ne(),re()},onCellLeave:()=>{je(),Tn()}}}function ln(){if($e){let a=r.clientWidth;A.style.width=a>0?a+"px":"100%",A.style.maxWidth="100%",A.style.maxHeight="";return}A.style.width="",A.style.maxWidth="";let t=r.clientWidth||A.clientWidth;if(Ce&&t>0){let p=A.offsetHeight-ie.getScrollElement().offsetHeight,f=(p>0?p:140)+90;A.style.maxHeight=Math.max(f,Math.round(t*Ce))+"px"}else A.style.maxHeight=""}function j(){ln(),ie.setOptions(dt())}function ge(){let t=W(),a=V(),p=He(l.viewStart),f=U(),b=l.viewSize,L=b>=x,D=ct(),F=b<=D[0],q='<span class="ll-nav-range-key">layers</span>';L?q+=`all ${x}`+(f>1?`<span class="ll-dim"> \xB7 every ${f}</span>`:""):q+=`${p}\u2013${p+b-1}<span class="ll-dim"> / ${x}</span>`+(f>1?`<span class="ll-dim"> \xB7 \u22481/${f}</span>`:"");let oe="";for(let X=0;X<x;X++){let be=N[X]||0,Xe=Math.max(8,Math.round(be*92));oe+=`<div class="ll-skyline-bar" style="height:${Xe}%;background:${ot(be,t,a)}"></div>`}let te=p/x*100,ce=b/x*100,ae=[];for(let X=0;X<x;X+=8)ae.push(X);ae[ae.length-1]!==x-1&&ae.push(x-1);let ue="",me=Math.max(1,x-1);for(let X of ae){let be=X===x-1,Xe=X===0,Cn=X/me*100;ue+=`<span class="ll-nav-tick" style="left:${Cn}%;transform:${be?"translateX(-100%)":Xe?"translateX(0)":"translateX(-50%)"}">${d.layers[X]}</span>`}Y.innerHTML=`
            <div class="ll-nav-range">${q}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${o}_sky">
                    <div class="ll-skyline-bars">${oe}</div>
                    <div class="ll-skyline-win" id="${o}_win" style="left:${te}%;width:${ce}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${ue}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${p<=0?"disabled":""}>${no}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${p+b>=x?"disabled":""}>${oo}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${F?"disabled":""}>${io}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${lo}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${to}</button>
            </div>
        `,dn()}function rn(){let t=document.getElementById(o+"_win");if(!t)return;let a=Math.max(0,x-l.viewSize),p=Math.max(0,Math.min(a,l.viewStart));t.style.left=p/x*100+"%",t.style.width=l.viewSize/x*100+"%"}function ct(){return Array.from(new Set([x,48,32,20,14,10,8])).filter(t=>t<=x&&t>=1).sort((t,a)=>t-a)}function He(t){return Math.max(0,Math.min(Math.max(0,x-l.viewSize),t))}let We=!1;function pt(){We||(We=!0,requestAnimationFrame(()=>{We=!1,!he&&(j(),rn())}))}function Fe(t){let a=He(l.viewStart+t);a!==l.viewStart&&(l.viewStart=a,j(),ge(),re())}function sn(t){let a=He(t);a!==l.viewStart&&(l.viewStart=a,pt())}function ht(t,a){let p=ct(),f=p.findIndex(F=>F>=l.viewSize),b=f===-1?p.length-1:f,L=t<0?Math.max(0,b-1):Math.min(p.length-1,b+1),D=p[L];D!==l.viewSize&&(l.viewSize=D,l.viewStart=Math.max(0,Math.min(x-D,Math.round(a-D/2))),j(),ge(),re())}function ut(t){ht(t,l.viewStart+l.viewSize/2)}function an(){l.viewSize=x,l.viewStart=0,j(),ge(),re()}let we=null;function dn(){let t=document.getElementById(o+"_sky");if(!t)return;t.addEventListener("pointerdown",p=>{let f=t.getBoundingClientRect(),b=p.clientX-f.left,L=f.width/x,D=Math.max(0,x-l.viewSize),F=Math.max(0,Math.min(D,l.viewStart)),q=F*L,oe=(F+l.viewSize)*L,te=F;(b<q||b>oe)&&(te=He(Math.round(b/L)-Math.floor(l.viewSize/2)),l.viewStart=te,pt()),we={startX:b,startStart:te,layerW:L},t.classList.add("ll-grabbing");try{t.setPointerCapture(p.pointerId)}catch{}}),t.addEventListener("pointermove",p=>{if(!we)return;let f=t.getBoundingClientRect(),L=(p.clientX-f.left-we.startX)/we.layerW;sn(Math.round(we.startStart+L))});let a=p=>{if(we){we=null,t.classList.remove("ll-grabbing");try{t.releasePointerCapture(p.pointerId)}catch{}ge(),re()}};t.addEventListener("pointerup",a),t.addEventListener("pointercancel",a),t.addEventListener("wheel",p=>{p.preventDefault();let f=t.getBoundingClientRect();if(Math.abs(p.deltaX)>Math.abs(p.deltaY)){Fe(p.deltaX>0?1:-1);return}let b=Math.round((p.clientX-f.left)/f.width*x);ht(p.deltaY<0?-1:1,b)},{passive:!1})}function cn(t,a,p=!1){z(t)&&(l.selectedRow=t,l.selectedLayerIdx=a??d.layers.length-1,j(),ne(),p&&pn(t),re())}function pn(t){ie.scrollToRow(t)}function Ne(){requestAnimationFrame(()=>requestAnimationFrame(()=>{he||ie.scrollToBottom()}))}let hn=.45,un=120,mn=360;function Ve(){let t;if(Ce)t=(r.clientWidth||A.clientWidth)*Ce;else{let p=A.clientHeight;t=p>0?p:(A.clientWidth||900)*.6}let a=Math.round(t*hn);Se.style.height=Math.max(un,Math.min(mn,a))+"px"}function mt(t){return t+"\xB7"+(Oe(d.tokens[t])?"bos":Te(d.tokens[t]))}function ne(t){let a=l.pinnedRows.length>0?l.pinnedRows:l.selectedRow!==null?[l.selectedRow]:[],p=a.length>1,f=[];for(let L of a){let D=O(L);for(let F of l.pinned){let q=P(L,F.token);if(!q)continue;let oe=Te(F.token);p&&(oe+=" ("+mt(L)+")"),f.push({values:q.map(te=>te??null),label:oe,color:F.color,dashPattern:D.dash||void 0,removable:!1})}}let b=f.length===0&&!t;if(b)fe.classList.add("ll-hidden");else{fe.classList.remove("ll-hidden"),Ve(),pe.textContent=l.pinnedRows.length>1?l.pinnedRows.length+" positions":a.length===1?"position "+mt(a[0]):"";let L={lines:[],richLines:f,xLabels:d.layers},D={darkMode:V(),mode:"probability",autoScale:!0,legendPosition:f.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};G?(G.setData(L),G.setOptions(D)):(v.style.minHeight="0",G=new xe(v,L,D)),t?G.setOverlay?.({values:t.values,label:t.label,color:t.color,dashPattern:"4,2",isOverlay:!0}):G.setOverlay?.(null)}$e&&b!==J?(J=b,requestAnimationFrame(()=>{he||(j(),Ne())})):J=b}let fn=56,gn=11,bn=9.5,xn=15;function vn(t){let a=gn*(t>0?t/fn:1);return Math.max(bn,Math.min(xn,a))}function yn(t,a,p,f,b=0){let L=d.cells[t]?.[a];if(!L||!z(t))return;let D=W(),F=Oe(d.tokens[t])?"bos":Te(d.tokens[t]);$.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${ot(L.prob,D,V())}"></span><span class="ll-tt-token">${Le(Te(L.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(L.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[a]} / ${d.layers[x-1]}</span><span>position</span><span class="ll-tt-val">${t} \xB7 ${Le(F)}</span></div>`,$.style.fontSize=vn(b)+"px",$.classList.add("ll-visible");let q=A.getBoundingClientRect(),oe=$.offsetWidth||200,te=$.offsetHeight||80,ce=8,ae=14,ue=p-q.left,me=f-q.top,X=ue+ae;X+oe>q.width-ce&&(X=ue-ae-oe),X=Math.max(ce,Math.min(X,q.width-oe-ce));let be=me-50;be=Math.max(ce,Math.min(be,q.height-te-ce)),$.style.left=X+"px",$.style.top=be+"px"}function je(){$.classList.remove("ll-visible")}function wn(){Ue(),ee=document.createElement("div"),ee.style.cssText="position:fixed;inset:0;z-index:49;",ee.addEventListener("mousedown",t=>{t.preventDefault(),t.stopPropagation(),gt()}),document.body.appendChild(ee)}function Ue(){ee&&(ee.remove(),ee=null)}function Ln(t,a,p){if(!d.cells[t]?.[a]||!z(t))return;let b=p.getBoundingClientRect();l.openPopup={row:t,layer:a},l.selectedRow=t,l.selectedLayerIdx=a;let L=Oe(d.tokens[t])?"bos":Te(d.tokens[t]);Q.innerHTML=`Layer <b>${d.layers[a]}</b>, Position <b>${t}</b><div class="ll-popup-sub">input <code>${Le(L)}</code></div>`,ft(t,a),j(),ne(),H.style.visibility="hidden",H.classList.add("ll-visible"),kn(b),H.style.visibility="",wn(),re()}function ft(t,a){let p=d.cells[t][a],f="";p.topk.forEach((b,L)=>{let D=y(b.token),F=D?`background:${D}22;border-left-color:${D};`:"";f+=`<div class="ll-topk${D?" ll-topk-pinned":""}" data-ki="${L}" style="${F}" title="click to track trajectory"><span class="ll-topk-tok">${Wt(b.token)}</span><span class="ll-topk-prob">${(b.prob*100).toFixed(1)}%</span></div>`}),se.innerHTML=f,se.querySelectorAll(".ll-topk").forEach(b=>{let L=parseInt(b.dataset.ki),D=p.topk[L];b.addEventListener("mouseenter",()=>{if(J)return;let F=P(t,D.token);F&&ne({values:F.map(q=>q??null),label:Te(D.token),color:"#999"})}),b.addEventListener("mouseleave",()=>{J||ne()}),b.addEventListener("click",F=>{F.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(w(D.token),j(),ft(t,a),ne(),re())})})}function kn(t){let f=A.getBoundingClientRect(),b=Math.max(140,f.width-2*8),L=Math.max(120,f.height-2*8);H.style.maxWidth=b+"px",H.style.maxHeight=L+"px";let D=H.offsetWidth||220,F=H.offsetHeight||160,q=f.left+8,oe=f.right-8-D,te=f.top+8,ce=f.bottom-8-F,ae=[{left:t.right+6,top:t.top},{left:t.left-6-D,top:t.top},{left:t.left,top:t.bottom+6},{left:t.left,top:t.top-6-F}],ue=ae[0];for(let me of ae)if(me.left>=q&&me.left<=oe&&me.top>=te&&me.top<=ce){ue=me;break}H.style.left=Math.max(q,Math.min(ue.left,Math.max(q,oe)))+"px",H.style.top=Math.max(te,Math.min(ue.top,Math.max(te,ce)))+"px"}function gt(){l.openPopup=null,H.classList.remove("ll-visible"),Ue(),j(),ne()}document.getElementById(o+"_popup_close").addEventListener("click",t=>{t.stopPropagation(),gt()});function Mn(t,a){if(J||!z(t))return;let p=d.cells[t]?.[a]?.token,f=p!=null?P(t,p):null;f?ne({values:f.map(b=>b??null),label:Te(p),color:"#999"}):ne()}function Tn(){J||ne()}function Sn(t,a){Mn(t,a)}function En(t,a,p){if(!z(t))return;if(p.shiftKey){let b=d.cells[t]?.[a]?.token;b&&(w(b),j(),ne(),re());return}je();let f=p.target.closest(".hmx-cell");f&&Ln(t,a,f)}ie=new Ee(le,at(),dt());let De=ie.getScrollElement(),bt=t=>{let a=t.target.closest(".hmx-cell");if(!a){je();return}yn(parseInt(a.dataset.row),parseInt(a.dataset.col),t.clientX,t.clientY,a.offsetWidth)};De.addEventListener("mousemove",bt);let xt=t=>{t.shiftKey&&t.target.closest(".hmx-rowlabel")&&t.preventDefault()};De.addEventListener("mousedown",xt),le.addEventListener("keydown",t=>{if(t.key!=="ArrowDown"&&t.key!=="ArrowUp")return;t.preventDefault();let a=t.key==="ArrowDown"?1:-1,p=(l.selectedRow??(a>0?-1:S))+a;for(;p>=0&&p<S&&!z(p);)p+=a;z(p)&&cn(p,void 0,!0)}),Y.addEventListener("click",t=>{let a=t.target.closest("[data-nav]");if(!a||a.hasAttribute("disabled"))return;let p=a.dataset.nav;p==="panL"?Fe(-Math.max(1,Math.floor(l.viewSize/4))):p==="panR"?Fe(Math.max(1,Math.floor(l.viewSize/4))):p==="zoomIn"?ut(-1):p==="zoomOut"?ut(1):p==="reset"&&an()});function Ge(){j(),ge(),ne(),requestAnimationFrame(()=>{he||(j(),ge(),J||Ve())})}function qe(){Je(A,V(),H)}function re(){M("stateChange",Lt())}Ge(),Ne(),qe();let Ye=0,vt=r?.clientWidth??0,yt=r?.clientHeight??0,wt=new ResizeObserver(()=>{let t=r?.clientWidth??0,a=r?.clientHeight??0;t===vt&&a===yt||(vt=t,yt=a,!Ye&&(Ye=requestAnimationFrame(()=>{Ye=0,!he&&(j(),J||Ve())})))});r&&wt.observe(r);let $n=_e(r,t=>{l.darkModeOverride===null&&(Je(A,t,H),j(),ge(),ne())});function Lt(){return{ramp:l.ramp,showGrid:l.showGrid,dimLowProb:l.dimLow,selectedRow:l.selectedRow,selectedLayer:l.selectedLayerIdx,viewStart:l.viewStart,viewSize:l.viewSize,colorIndex:l.colorIndex,pinnedGroups:l.pinned.map(t=>({tokens:[t.token],color:t.color})),pinnedRows:l.pinnedRows.map(t=>({pos:t,line:O(t).name})),darkMode:l.darkModeOverride,rowHighlights:l.rowHighlights,collapsedSections:l.collapsedSections}}return{widget:{getState:Lt,setState:t=>{t.ramp!==void 0&&(l.ramp=t.ramp),t.showGrid!==void 0&&(l.showGrid=t.showGrid),t.dimLowProb!==void 0&&(l.dimLow=t.dimLowProb),t.selectedRow!==void 0&&(l.selectedRow=t.selectedRow),t.selectedLayer!==void 0&&(l.selectedLayerIdx=t.selectedLayer),t.viewStart!==void 0&&(l.viewStart=t.viewStart),t.viewSize!==void 0&&(l.viewSize=t.viewSize),t.colorIndex!==void 0&&(l.colorIndex=t.colorIndex),t.pinnedGroups!==void 0&&(l.pinned=u(t.pinnedGroups)),t.pinnedRows!==void 0&&(l.pinnedRows=t.pinnedRows.map(a=>a.pos).filter(a=>typeof a=="number")),t.darkMode!==void 0&&(l.darkModeOverride=t.darkMode),t.rowHighlights!==void 0&&(l.rowHighlights=t.rowHighlights),t.collapsedSections!==void 0&&(l.collapsedSections=t.collapsedSections.map(a=>({...a}))),R(),qe(),Ge()},setData:t=>{h=Ze(t),d=h.normalized,c=h.v2Data,l.selectedRow=null,l.selectedLayerIdx=null,l.pinned=[],l.pinnedRows=[],l.colorIndex=0,l.rowHighlights=[],l.collapsedSections=[],m=null,R(),K=[],ie.setData(at()),Ge(),Ne()},setTitle:()=>{},setThemeMode:t=>{l.darkModeOverride=!!t,qe(),j(),ge(),ne()},getThemeMode:()=>V(),hasEntropyData:()=>!!c&&Array.isArray(c.entropy)&&c.entropy.length>0,hasRankData:()=>{if(!c?.tracked)return!1;for(let t of c.tracked)for(let a in t){let p=t[a];if(p&&typeof p=="object"&&Array.isArray(p.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(t,a)=>{(k[t]||(k[t]=[])).push(a)},off:(t,a)=>{k[t]=(k[t]||[]).filter(p=>p!==a)},destroy:()=>{he=!0,$n(),wt?.disconnect(),Ue(),H.remove(),G&&(G.destroy(),G=null),De.removeEventListener("mousemove",bt),De.removeEventListener("mousedown",xt),ie?.destroy(),r&&(r.innerHTML="")}},styleEl:s}}var to='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',no='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',oo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',io='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',lo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Be=class{constructor(e,n,o){this.widget=null;this.styleEl=null;let r=Ft(e,n,o);r&&(this.widget=r.widget,this.styleEl=r.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,n){this.widget?.on(e,n)}off(e,n){this.widget?.off(e,n)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var ro='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',so='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ao='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',it="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function lt(i){return{fg:i?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:i?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:i?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:i?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:i?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:i?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:i?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:i?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:i?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:i?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Nt(i){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${it};`;let n={isOpen:!1,searchQuery:""},o=jt(e,i,n);return e.__tokenSelectorCleanup=o,e.__tokenSelectorState=n,e}function Re(i,e){let n=i.__tokenSelectorCleanup,o=i.__tokenSelectorState;n&&n();let r={isOpen:o?.isOpen??!1,searchQuery:o?.searchQuery??""},h=jt(i,e,r);i.__tokenSelectorCleanup=h,i.__tokenSelectorState=r}function Vt(i){let e=i.__tokenSelectorCleanup;e&&e()}function jt(i,e,n){i.innerHTML="";let o=lt(e.darkMode),{allLabels:r,selectedIndices:h,defaultIndices:d,onChange:c}=e,s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let u=document.createElement("span");if(u.style.cssText=`font-size:11px;color:${o.fgMuted};`,u.textContent=`Tokens (${r.length})`,s.appendChild(u),!rt(h,d)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${o.fgMuted};font-family:${it};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${ro} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=o.fg}),y.addEventListener("mouseleave",()=>{y.style.color=o.fgMuted}),y.addEventListener("click",()=>{c(Array.from(d))}),s.appendChild(y)}i.appendChild(s);let m=document.createElement("div");m.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${o.border};border-radius:6px;background:${o.inputBg};cursor:text;min-height:30px;`,m.addEventListener("click",()=>{T(),M.focus()});let k=Array.from(h).sort((y,w)=>y-w);for(let y of k){let w=co(y,r[y],e.darkMode,()=>{let P=new Set(h);P.delete(y),c(Array.from(P))});m.appendChild(w)}let M=document.createElement("input");M.type="text",M.placeholder=k.length===0?"Search tokens...":"",M.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${o.fg};font-family:${it};min-width:60px;flex:1;padding:2px 0;`,M.addEventListener("input",()=>{n.searchQuery=M.value,I()}),M.addEventListener("focus",()=>T()),m.appendChild(M);let x=document.createElement("span");x.style.cssText=`display:flex;align-items:center;color:${o.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,x.innerHTML=ao,x.addEventListener("click",y=>{y.stopPropagation(),n.isOpen?z():T()}),m.appendChild(x),i.appendChild(m);let S=document.createElement("div");S.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${o.bg};border:1px solid ${o.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let N=document.createElement("div");N.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",S.appendChild(N);let C=document.createElement("div");C.style.cssText=`padding:8px 12px;font-size:12px;color:${o.fgMuted};display:none;text-align:center;`,C.textContent="No tokens found",S.appendChild(C),i.appendChild(S);function I(){N.innerHTML="";let y=n.searchQuery.toLowerCase(),w=0;for(let P=0;P<r.length;P++){let O=r[P];if(y&&!O.toLowerCase().includes(y))continue;w++;let g=h.has(P),E=po(P,O,g,e.darkMode,()=>{let _=new Set(h);g?_.delete(P):_.add(P),c(Array.from(_))});N.appendChild(E)}C.style.display=w===0?"":"none"}function T(){n.isOpen||(n.isOpen=!0,S.style.display="",x.style.transform="rotate(180deg)",I())}function z(){n.isOpen&&(n.isOpen=!1,S.style.display="none",x.style.transform="",M.value="",n.searchQuery="")}function R(y){i.contains(y.target)||z()}return document.addEventListener("mousedown",R),n.isOpen&&(S.style.display="",x.style.transform="rotate(180deg)",M.value=n.searchQuery,I(),requestAnimationFrame(()=>{M.isConnected&&M.focus()})),()=>{document.removeEventListener("mousedown",R)}}function co(i,e,n,o){let r=lt(n),h=Z[i%Z.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${r.chipBorder};background:${r.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=r.chipHoverBg,d.style.borderColor=r.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=r.chipBg,d.style.borderColor=r.chipBorder});let c=document.createElement("span");c.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${h};`,d.appendChild(c);let s=document.createElement("span");s.style.cssText=`font-size:11px;color:${r.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,s.innerHTML=Me(e),s.title=e,d.appendChild(s);let u=document.createElement("button");return u.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${r.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,u.innerHTML=so,u.addEventListener("mouseenter",()=>{u.style.color=r.badgeText}),u.addEventListener("mouseleave",()=>{u.style.color=r.fgMuted}),u.addEventListener("click",l=>{l.stopPropagation(),o()}),d.appendChild(u),d}function po(i,e,n,o,r){let h=lt(o),d=Z[i%Z.length],c=document.createElement("div");c.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",c.addEventListener("mouseenter",()=>{c.style.background=h.hoverBg}),c.addEventListener("mouseleave",()=>{c.style.background="transparent"}),c.addEventListener("click",m=>{m.stopPropagation(),r()});let s=document.createElement("span");s.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${n?d:"transparent"};border:1.5px solid ${n?d:h.fgMuted};`,c.appendChild(s);let u=document.createElement("span");u.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${n?h.fg:h.fgMuted};`,u.innerHTML=Me(e),u.title=e,c.appendChild(u);let l=i===0?"source pred":i===1?"target pred":null;if(l){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${h.badgeBg};color:${h.badgeText};border:1px solid ${h.badgeBorder};`,m.textContent=l,c.appendChild(m)}if(n){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;font-size:10px;color:${h.selectedText};`,m.textContent="selected",c.appendChild(m)}return c}function rt(i,e){if(i.size!==e.size)return!1;for(let n of i)if(!e.has(n))return!1;return!0}var ho={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},uo=["probability","prob_diff","rank"],Ae=class{constructor(e,n,o={}){this.modeButtons=new Map;this.container=e,this.allData=n,this.mode=o.mode??"probability",this.darkMode=o.darkMode??!1,this.transparentBackground=o.transparentBackground??!1,this.title=o.title,this.onTokenSelectionChange=o.onTokenSelectionChange,this.onModeChange=o.onModeChange;let r=n.tokenLabels?.length??n.lines?.length??0,h=o.defaultSelectedTokens??Array.from({length:Math.min(2,r)},(c,s)=>s);this.defaultTokens=new Set(h),this.selectedTokens=new Set(o.selectedTokens??h),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Nt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new xe(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Re(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let n of uo){let o=document.createElement("button");o.textContent=ho[n],this.applyModeButtonStyles(o,n===this.mode),o.addEventListener("click",()=>this.setMode(n)),o.addEventListener("mouseenter",()=>{n!==this.mode&&(o.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),o.addEventListener("mouseleave",()=>{n!==this.mode&&(o.style.background="transparent")}),e.appendChild(o),this.modeButtons.set(n,o)}return e}applyModeBarStyles(e){let n=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${n};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,n){let o=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",r="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${n?r:"transparent"};color:${n?"#fff":o};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,n]of this.modeButtons)this.applyModeButtonStyles(n,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),n=this.allData.tokenLabels??[],o=Array.from(this.selectedTokens).sort((d,c)=>d-c),r=this.mode==="rank";return{richLines:o.filter(d=>d<e.length).map(d=>({values:r?e[d].map(c=>c+1):e[d],label:n[d]??`Token ${d}`,color:Z[d%Z.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let n=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,n)},(r,h)=>h));let o=new Set([...this.selectedTokens].filter(r=>r<n));this.selectedTokens=o.size>0?o:new Set(this.defaultTokens),Re(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Re(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let n=this.getModeLines().length,o=new Set(e.filter(r=>r<n));rt(o,this.selectedTokens)||(this.selectedTokens=o,Re(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Vt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function mo(i){let e=typeof i=="string"?document.querySelector(i):i;return e||console.error("Container not found:",i),e}function st(i,e,n){let o=mo(i);if(!o)return null;let r=e(o);if(n===void 0){let h=_e(o,c=>r.setThemeMode(c)),d=r.destroy.bind(r);r.destroy=()=>{h(),d()}}return r}function qt(i,e,n){return new Be(i,e,n)}function Yt(i,e,n){return st(i,o=>new xe(o,e,{darkMode:ve(o),...n}),n?.darkMode)}var Ut={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function fo(i){if(!/^#?[0-9a-fA-F]{6}$/.test(i))return[147,51,234];let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Gt(i,e){if(typeof i.getCellValue=="function")return i;let n=i,o=n.values??[],r=n.texts,h=n.rowLabels??o.map((C,I)=>String(I)),d=n.colLabels??(o[0]??[]).map((C,I)=>String(I)),c=n.ramp??"purple",s=Ut[c]??(c[0]==="#"?c:Ut.purple),[u,l,m]=fo(s),[k,M]=n.valueDomain??[0,1],x=M-k,S=e?38:255,N=C=>Math.max(0,Math.min(1,C));return{rows:h.map(C=>({label:C})),columns:d.map(C=>({label:C,value:0})),getCellValue:(C,I)=>{let T=o[C]?.[I]??0,z=N(x>0?(T-k)/x:T),R=w=>Math.round(S+(w-S)*z);return{text:r?r[C]?.[I]??"":Number.isInteger(T)?String(T):T.toFixed(2),value:T,color:`rgb(${R(u)}, ${R(l)}, ${R(m)})`,textColor:z>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Xt(i,e,n){return st(i,o=>{let r=n?.darkMode??ve(o),h=new Ee(o,Gt(e,r),{darkMode:r,...n}),d=h.setThemeMode.bind(h);return h.setThemeMode=c=>{h.setData(Gt(e,c)),d(c)},h},n?.darkMode)}function Qt(i,e,n){return st(i,o=>new Ae(o,e,{darkMode:ve(o),...n}),n?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=qt,window.LinePlotWidget=Yt,window.HeatmapTableWidget=Xt,window.ActivationPatchingWidget=Qt);return zn(go);})();
//# sourceMappingURL=charts.js.map
