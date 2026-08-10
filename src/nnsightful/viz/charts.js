"use strict";var InterpTools=(()=>{var Ye=Object.defineProperty;var Tn=Object.getOwnPropertyDescriptor;var Sn=Object.getOwnPropertyNames;var En=Object.prototype.hasOwnProperty;var $n=(i,e)=>{for(var o in e)Ye(i,o,{get:e[o],enumerable:!0})},Cn=(i,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Sn(e))!En.call(i,r)&&r!==o&&Ye(i,r,{get:()=>e[r],enumerable:!(n=Tn(e,r))||n.enumerable});return i};var Hn=i=>Cn(Ye({},"__esModule",{value:!0}),i);var co={};$n(co,{ActivationPatchingWidget:()=>Gt,HeatmapTableWidget:()=>Ut,LinePlotWidget:()=>jt,LogitLensWidget:()=>Vt});function Xe(i){let e=i;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let o=i.layers.length,n=i.completion&&i.completion.length?[...i.input,...i.completion]:i.input,r=n.length,h=[];for(let p=0;p<r;p++){let a=[],g=i.tracked[p];for(let l=0;l<o;l++){let f=i.topk[l][p],M=[];for(let b=0;b<f.length;b++){let C=f[b],_=g[C]||[],$=_[l]||0;M.push({token:C,prob:$,trajectory:_})}let k=M[0]||{token:"",prob:0,trajectory:[]};a.push({token:k.token,prob:k.prob,trajectory:k.trajectory,topk:M})}h.push(a)}return{normalized:{layers:i.layers,tokens:n,cells:h,meta:i.meta||{}},v2Data:i}}function wt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Le(i){let e=document.createElement("div");return e.textContent=i,e.innerHTML}function Pn(i){let e=`#${i}`;return`
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
    `}function Lt(i){let e=document.createElement("style");return e.textContent=Pn(i),document.head.appendChild(e),e}function Qe(i,e,...o){let n=r=>{e?r.classList.add("ll-dark"):r.classList.remove("ll-dark")};n(i),e?i.style.colorScheme="dark":i.style.colorScheme="";for(let r of o)r&&n(r)}var $e=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],Ze=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var ee=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ke(i){return i.richLines&&i.richLines.length>0?i.richLines.map((o,n)=>({values:o.values,label:o.label??`Line ${n+1}`,color:o.color,dashPattern:o.dashPattern,isOverlay:o.isOverlay,removable:o.removable})):(i.lines??[]).map((o,n)=>({values:o,label:i.labels?.[n]??`Line ${n+1}`}))}function Me(i){if(!i)return"";let e=[],o=0;i.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),o=1);let n="";for(;o<i.length;o++){let r=i[o];r===`
`?(n&&(e.push(kt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=r}return n&&e.push(kt(n)),e.join("")}function kt(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Dn(i){if(i>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let o of e)if(i<=o)return o;return 1}function Mt(i,e,o){let n=ke(i),r=n.length>0?n[0].values.length:o?.values.length??i.xLabels?.length??0;if(r===0)return null;let h=e.mode||"probability",d=e.minValue,p=e.maxValue;if(d===void 0||p===void 0||e.autoScale){let a=[];for(let f of n)if(!f.isOverlay)for(let M of f.values)M!==null&&a.push(M);if(o)for(let f of o.values)f!==null&&a.push(f);if(a.length===0)return{numLayers:r,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let g=1/0,l=-1/0;for(let f of a)f<g&&(g=f),f>l&&(l=f);if(e.centerYAxisAtZero){let M=Math.max(Math.abs(g),Math.abs(l))*1.1;d=-M,p=M}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(g))),p===void 0||e.autoScale){let f=Math.log(Math.max(1,g)),M=Math.log(Math.max(1,l)),k=M+.15*Math.max(1,M-f);p=Math.ceil(Math.exp(k))}}else d===void 0&&(d=h==="probability"?0:h==="rank"?Math.max(1,Math.floor(g)):Math.floor(g*.9)),(p===void 0||e.autoScale)&&(h==="rank"?p=Math.ceil(l*1.1):h==="probability"?p=e.autoScale?Dn(Math.max(l,.001)):Math.min(l*1.1,1):p=l*1.1)}return{numLayers:r,minValue:d,maxValue:p,numLines:n.length}}function Tt(i,e,o,n,r,h,d,p){let a=i.getContext("2d"),g=e.getBoundingClientRect(),l=window.devicePixelRatio||1;i.width=g.width*l,i.height=g.height*l,i.style.width=`${g.width}px`,i.style.height=`${g.height}px`,a.scale(l,l);let f=g.width,M=g.height,k=n.darkMode??!1,b=n.title,C=n.mode||"probability",_=n.invertYAxis??!1,$=n.centerYAxisAtZero??!1,A=n.logScale??!1,S=n.xAxisLabel||"Layer",W=n.yAxisLabel||"Probability",I=n.xRangeStart??0;I>=r.numLayers-1&&(console.warn(`xRangeStart (${I}) is >= numLayers-1 (${r.numLayers-1}), clamping to 0`),I=0);let w=n.showDataPoints??!0,L={top:b?48:24,right:24,bottom:56,left:72},O=f-L.left-L.right,B=M-L.top-L.bottom,Y={margin:L,chartWidth:O,chartHeight:B,width:f,height:M},u={background:k?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:k?"#52525b":"#a1a1aa",grid:k?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:k?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:k?"#e4e4e7":"#27272a"};n.transparentBackground?a.clearRect(0,0,f,M):(a.fillStyle=u.background,a.fillRect(0,0,f,M)),b&&(a.fillStyle=u.titleText,a.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="left",a.fillText(b,L.left,28));let y=r.numLayers-1-I,H=v=>y<=0?L.left+O/2:L.left+(v-I)/y*O,R=A?Math.log(Math.max(1,r.minValue)):0,E=A?Math.log(Math.max(1,r.maxValue)):0,X=v=>{let P;if(A){let D=Math.log(Math.max(1,v));P=E-R>0?(D-R)/(E-R):.5}else P=(v-r.minValue)/(r.maxValue-r.minValue);return _?L.top+P*B:L.top+B-P*B};a.setLineDash([4,4]),a.strokeStyle=u.grid,a.lineWidth=1;let Q=[],Z=r.maxValue-r.minValue,ne=5;if(A){let v=new Set;for(let j=0;j<ne;j++){let N=R+j/(ne-1)*(E-R),K=Math.round(Math.exp(N));v.has(K)||(v.add(K),Q.push(K))}let P=Math.round(Math.exp(R)),D=Math.round(Math.exp(E));v.has(P)||Q.unshift(P),v.has(D)||Q.push(D)}else if(C==="rank")for(let v=0;v<ne;v++)Q.push(Math.round(r.minValue+v/(ne-1)*Z));else for(let v=0;v<ne;v++)Q.push(r.minValue+v/(ne-1)*Z);if(Q.forEach(v=>{let P=X(v);a.beginPath(),a.moveTo(L.left,P),a.lineTo(L.left+O,P),a.stroke()}),a.setLineDash([]),$){let v=X(0);a.beginPath(),a.strokeStyle=k?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",a.lineWidth=1.5,a.moveTo(L.left,v),a.lineTo(L.left+O,v),a.stroke(),a.lineWidth=1}a.fillStyle=u.text,a.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="right",a.textBaseline="middle",Q.forEach(v=>{let P=X(v),D;C==="probability"?D=v.toFixed(2):C==="prob_diff"?D=v>=0?`+${v.toFixed(2)}`:v.toFixed(2):D=Math.round(v).toString(),a.fillText(D,L.left-16,P)}),a.textAlign="center",a.textBaseline="top";let ye=o.xLabels&&o.xLabels.length>0,J=Math.max(1,Math.ceil(r.numLayers/8));for(let v=0;v<r.numLayers;v+=J){let P=H(v);if(P<L.left-5||P>L.left+O+5)continue;let D=ye?String(o.xLabels[v]??v):v.toString();a.fillText(D,P,L.top+B+12)}if((r.numLayers-1)%J!==0){let v=ye?String(o.xLabels[r.numLayers-1]??r.numLayers-1):(r.numLayers-1).toString();a.fillText(v,H(r.numLayers-1),L.top+B+12)}a.strokeStyle=k?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",a.lineWidth=1.5,a.beginPath(),a.moveTo(L.left,L.top),a.lineTo(L.left,L.top+B),a.lineTo(L.left+O,L.top+B),a.stroke(),a.fillStyle=u.textMuted,a.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="center",a.textBaseline="top",a.fillText(S.toUpperCase(),L.left+O/2,M-16),a.save(),a.translate(14,L.top+B/2),a.rotate(-Math.PI/2),a.textAlign="center",a.textBaseline="top",a.fillText(W.toUpperCase(),0,0),a.restore();let me=ke(o);function te(v,P,D,j,N){a.beginPath(),a.strokeStyle=P,a.lineWidth=D,N!==void 0&&(a.globalAlpha=N),j?a.setLineDash(j.split(",").map(Number)):a.setLineDash([]);let K=!1;for(let re=0;re<v.length;re++){let se=v[re];if(se===null){K=!1;continue}let fe=H(re),He=X(se);K?a.lineTo(fe,He):(a.moveTo(fe,He),K=!0)}a.stroke(),a.setLineDash([]),N!==void 0&&(a.globalAlpha=1)}let G=k?"#3f3f46":"#d4d4d8";if(a.lineCap="round",a.lineJoin="round",me.forEach((v,P)=>{!h.has(P)||v.isOverlay||te(v.values,G,2,void 0,.35)}),me.forEach((v,P)=>{if(h.has(P)||v.isOverlay)return;let D=v.color??ee[P%ee.length];te(v.values,D,4,v.dashPattern,.15),te(v.values,D,2,v.dashPattern),w&&v.values.forEach((j,N)=>{if(j===null)return;let K=H(N),re=X(j),se=d?.lineIdx===P&&d?.layerIdx===N;a.beginPath(),a.strokeStyle=D,a.lineWidth=se?2:1.5,a.arc(K,re,se?5:3.5,0,Math.PI*2),a.stroke(),a.beginPath(),a.fillStyle=k?"#18181b":"#ffffff",a.arc(K,re,se?3.5:2.5,0,Math.PI*2),a.fill()})}),me.forEach((v,P)=>{if(!v.isOverlay||h.has(P))return;let D=v.color??"#999";te(v.values,D,1.5,v.dashPattern??"4,2",.7)}),p){let v=p.color??"#999";te(p.values,v,1.5,p.dashPattern??"4,2",.7)}return Y}function St(i){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",i.appendChild(e),e}function Et(i,e,o,n,r,h,d,p,a){let{margin:g,chartWidth:l,chartHeight:f}=r,M=n.xRangeStart??0,k=d-1-M,b=n.logScale?Math.log(Math.max(1,p)):0,C=n.logScale?Math.log(Math.max(1,a)):0;if(i<g.left||i>g.left+l||e<g.top||e>g.top+f)return null;let _=ke(o),$=null,A=1/0,S=20;for(let W=0;W<_.length;W++){if(h.has(W))continue;let I=_[W];if(!I.isOverlay)for(let w=0;w<I.values.length;w++){let L=I.values[w];if(L===null)continue;let O=k<=0?g.left+l/2:g.left+(w-M)/k*l,B;if(n.logScale){let y=Math.log(Math.max(1,L));B=C-b>0?(y-b)/(C-b):.5}else B=(L-p)/(a-p);let Y=n.invertYAxis?g.top+B*f:g.top+f-B*f,u=Math.sqrt((i-O)**2+(e-Y)**2);u<A&&u<S&&(A=u,$={visible:!0,x:O,y:Y,lineIdx:W,layerIdx:w,value:L,label:I.label,color:I.color??ee[W%ee.length]})}}return $}function Je(i,e,o,n,r,h,d){if(!e){i.style.opacity="0";return}let p=n?"#27272a":"#fff",a=n?"#3f3f46":"#e4e4e7",g=n?"#fafafa":"#18181b",l=n?"#a1a1aa":"#71717a",M=e.x>o/2?"calc(-100% - 12px)":"12px";i.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${M},-50%);`;let k=String(r?r[e.layerIdx]??e.layerIdx:e.layerIdx);i.innerHTML=`
        <div style="background:${p};border:1px solid ${a};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${g};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${Me(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${l}">${h??"Layer"}</span>
                    <span style="font-weight:500;color:${g}">${k}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${l}">Value</span>
                    <span style="font-weight:500;color:${g}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Rn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',In='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',zn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function $t(i){let e=document.createElement("div");return Ct(e,i),e}function Ct(i,e){let o=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";i.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${o};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function Ht(i,e,o,n,r,h){Ct(i,n),i.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",a=n?"#a1a1aa":"#71717a",g=n?"#3f3f46":"#d4d4d8",l="rgba(161,161,170,0.3)",f=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",M=h?ke(h):[];e.forEach((k,b)=>{let C=M[b];if(C?.isOverlay)return;let _=C?.color??ee[b%ee.length],$=o.has(b),A=C?.removable??!1,S=document.createElement("button");S.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${$?"0.5":"1"};`,S.addEventListener("mouseenter",()=>{S.style.background=f}),S.addEventListener("mouseleave",()=>{S.style.background="transparent"}),S.addEventListener("click",()=>r.onToggle(b));let W=document.createElement("span");W.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${$?l:_};background:${$?g:"transparent"};`,S.appendChild(W);let I=document.createElement("span");if(I.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${$?p:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,I.title=k,I.innerHTML=Me(k),S.appendChild(I),A&&r.onRemove){let w=document.createElement("span");w.style.cssText=`margin-left:auto;cursor:pointer;color:${a};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,w.innerHTML=zn,w.title="Remove",w.addEventListener("click",L=>{L.stopPropagation(),r.onRemove(b)}),S.appendChild(w),S.addEventListener("mouseenter",()=>{w.style.opacity="0.6"}),S.addEventListener("mouseleave",()=>{w.style.opacity="0"})}else{let w=document.createElement("span");w.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${a};opacity:${$?"0.6":"0"};display:flex;align-items:center;`,w.innerHTML=$?In:Rn,S.appendChild(w),$||(S.addEventListener("mouseenter",()=>{w.style.opacity="0.4"}),S.addEventListener("mouseleave",()=>{w.style.opacity="0"}))}i.appendChild(S)})}var xe=class{constructor(e,o,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let o=this.canvas.getBoundingClientRect(),n=e.clientX-o.left,r=e.clientY-o.top;this.tooltip=Et(n,r,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Je(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Je(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=o,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=St(this.chartContainer),this.legendEl=$t(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(r=>{if(this.destroyed)return;let h=r[0];if(!h)return;let d=Math.round(h.contentRect.width),p=Math.round(h.contentRect.height);d===this.lastWidth&&p===this.lastHeight||(this.lastWidth=d,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,o)=>e.label??`Line ${o+1}`):this.data.labels||(this.data.lines??[]).map((e,o)=>`Line ${o+1}`)}draw(){this.config=Mt(this.data,this.options,this.overlay),this.config&&(this.geometry=Tt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",Ht(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:o=>this.toggleLine(o),onRemove:this.options.onLineRemoved?o=>{this.removeLine(o,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(o)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((o,n)=>({values:o,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,o=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let r of this.hiddenLines)r<e?n.add(r):r>e&&n.add(r-1);this.hiddenLines=n,o||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function pe(i){if(typeof document>"u")return String(i??"").replace(/[&<>"']/g,o=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[o]);let e=document.createElement("div");return e.textContent=String(i??""),e.innerHTML}function De(i){return i==null?"":i.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+pe(i.slice(1)):pe(i)}function _n(i){let e=`#${i}`;return`
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
    `}function Pt(i){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=_n(i),document.head.appendChild(e),e}var On=0,Re=16,Dt=20,Rt=7,Se=class{constructor(e,o,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.container=e,this.data=o,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,...n},this.uid="hmx_"+ ++On+"_"+Date.now().toString(36),this.styleEl=Pt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render(),this.setupResponsive()}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let o=this.container?.clientWidth??0;return o>0?o-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let o=this.options.columnWindow;if(!o)return{start:0,size:e};let n=Math.max(1,Math.min(o.size,e));return{start:Math.max(0,Math.min(o.start,e-n)),size:n}}maxColsFit(){let e=this.options,o=e.minColumnWidth??48,n=e.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/o),h=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(h,r))}resolveVisibleColumns(){let e=this.options,{start:o,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let l=[];for(let f=0;f<n;f++)l.push(o+f);return l}let r=this.maxColsFit();if(n<=r){let l=[];for(let f=0;f<n;f++)l.push(o+f);return l}let h=!!e.alwaysShowLastColumn,d=Math.max(1,r-(h?1:0)),p=Math.ceil(n/d),a=[];for(let l=o;l<o+n;l+=p)a.push(l);let g=o+n-1;return h&&a[a.length-1]!==g&&a.push(g),a}resolveCellWidth(e){let o=this.options;if(o.columnSizing==="fit"&&e>0){let n=o.rowHeaderWidth??100,r=Math.floor((this.availWidth()-n)/e);return Math.max(o.minColumnWidth??1,r)}return o.cellWidth??48}resolveRowHeight(e,o=0){let n=this.options,r=n.cellHeight??28;if(n.rowSizing!=="fill"||e<=0)return r;let h=this.scrollEl.clientHeight-o;return e*r<h?Math.floor(h/e):r}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,o=!!e.darkMode;this.root.classList.toggle("hmx-dark",o),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=e.rowHeaderWidth??100,r=e.headerHeight??26,h=this.data.columns,d=this.resolveVisibleColumns(),p=d.length,a=this.resolveCellWidth(p),g=this.data.rows,l=e.maxRows!=null?Math.min(g.length,e.maxRows):g.length,f=(e.collapsedSections??[]).map((u,y)=>({start:Math.max(0,u.start),end:Math.min(l-1,u.end),collapsed:u.collapsed!==!1,index:y})).filter(u=>u.start<=u.end).sort((u,y)=>u.start-y.start),M=u=>f.find(y=>y.start===u),k=0,b=0;for(let u=0;u<l;){let y=M(u);if(y&&y.collapsed){b+=Re,u=y.end+1;continue}y&&!y.collapsed&&(b+=Dt),k++,u++}let C=this.resolveRowHeight(k,b),_=n+a*p,$=`${n}px repeat(${p}, ${a}px)`,A=e.showGrid?o?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",S=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${$};height:${r}px;width:${_}px;min-width:${_}px;">`;S+=`<div class="hmx-corner">${pe(e.cornerLabel??"")}</div>`;for(let u=0;u<p;u++)S+=`<div class="hmx-col">${De(h[d[u]].label)}</div>`;S+="</div>",this.hdrEl.innerHTML=S;let W={};for(let u of e.rowHighlights??[]){let y=new Set(u.rows);for(let H of u.rows){let R=!y.has(H-1);W[H]={color:u.color,className:u.className,top:R,bottom:!y.has(H+1),label:R?u.label:void 0}}}this.lastRowH=C;let I=u=>{let y=g[u].label,H=e.rowClassName?.(u),R=W[u],E=R?" hmx-row-hl"+(R.top?" hmx-hl-top":"")+(R.bottom?" hmx-hl-bottom":"")+(R.className?" "+R.className:""):"",X=R?(R.color?` style="--hmx-hl:${pe(R.color)}"`:"")+(R.label?` data-hl-label="${pe(R.label)}"`:""):"",Q=e.renderRowLabel?e.renderRowLabel(u):`<span class="hmx-cell-text">${De(y)}</span>`,Z=`<div class="hmx-row${H?" "+H:""}${E}" data-rowwrap="${u}"${X}>`;Z+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${$};height:${C}px;">`,Z+=`<div class="hmx-rowlabel" data-row="${u}" title="${pe(y)}">${Q}</div>`;for(let ne=0;ne<p;ne++){let ye=d[ne],J=this.data.getCellValue(u,ye),me=J.highlighted&&J.highlightColor?`box-shadow:inset 0 0 0 2px ${J.highlightColor};`:"",te=J.bold?"font-weight:bold;":"",G=J.opacity!=null&&J.opacity<1?`opacity:${J.opacity};`:"",v=u===0,P=u===l-1,D=ne===0,j=ne===p-1,N="";v&&D?N="border-top-left-radius:8px;":v&&j?N="border-top-right-radius:8px;":P&&D?N="border-bottom-left-radius:8px;":P&&j&&(N="border-bottom-right-radius:8px;"),Z+=`<div class="hmx-cell${J.className?" "+J.className:""}" data-row="${u}" data-col="${ye}" style="background:${J.color};color:${J.textColor};padding:0 6px;${G}${A}${me}${te}${N}"><span class="hmx-cell-text">${De(J.text)}</span></div>`}return Z+="</div></div>",Z},w=(e.rowRegions??[]).filter(u=>u.start<=u.end),L=w.map(()=>({top:-1,bottom:-1})),O=(u,y,H,R)=>{for(let E=0;E<w.length;E++)y>=w[E].start&&u<=w[E].end&&(L[E].top<0&&(L[E].top=H),L[E].bottom=R)},B=`<div class="hmx-grid-inner" style="width:${_}px;min-width:${_}px;">`,Y=0;for(let u=0;u<l;){let y=M(u);if(y&&y.collapsed){let H=y.end-y.start+1,R,E=!1;for(let Q=y.start;Q<=y.end;Q++)if(W[Q]){E=!0,R=W[Q].color;break}let X=H===1?"":"s";B+=`<div class="hmx-collapsed${E?" hmx-collapsed-hl":""}" data-cs="${y.index}" data-count="${H}" style="width:${_}px;min-width:${_}px;height:${Re}px;${R?`--hmx-hl:${pe(R)};`:""}" title="Click to show ${H} hidden row${X}"><span class="hmx-collapsed-inner">\u2026 ${H} row${X} hidden</span></div>`,O(y.start,y.end,Y,Y+Re),Y+=Re,u=y.end+1;continue}if(y&&!y.collapsed){let H=y.end-y.start+1;B+=`<div class="hmx-expanded-toggle" data-cs="${y.index}" data-count="${H}" style="width:${_}px;min-width:${_}px;" title="Collapse these ${H} rows"><span>\u2303 collapse ${H} row${H===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,Y+=Dt}B+=I(u),O(u,u,Y,Y+C),Y+=C,u++}for(let u=0;u<w.length;u++){let y=L[u];if(y.top<0||y.bottom<=y.top)continue;let H=w[u],R=H.color?`--hmx-region:${pe(H.color)};`:"",E=y.top+Rt,X=Math.max(0,y.bottom-y.top-2*Rt);X<=0||(B+=`<div class="hmx-region-rail" style="top:${E}px;height:${X}px;${R}"></div>`,H.label&&(B+=`<div class="hmx-region-label" style="top:${E}px;height:${X}px;${R}">${pe(H.label)}</div>`))}if(B+="</div>",this.scrollEl.innerHTML=B,this.pendingScroll){let{scrollBefore:u,bandTop:y,delta:H}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,y<u?u+H:u)}e.onVisibleColumnsChange&&!Bn(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let o=e.target.closest(".hmx-cell");if(!o){this.clearHover();return}this.hoverCell!==o&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=o,o.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(o.dataset.row),parseInt(o.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let o=e.target,n=o.closest(".hmx-collapsed, .hmx-expanded-toggle");if(n){let d=parseInt(n.dataset.cs);if(o.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:-n.offsetHeight},this.options.onRemoveCollapse?.(d);return}let p=parseInt(n.dataset.count||"0"),a=n.classList.contains("hmx-collapsed"),g=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:n.offsetTop,delta:a?p*g:-p*g},this.options.onToggleCollapse?.(d);return}let r=o.closest(".hmx-rowlabel");if(r){this.options.onRowHeaderClick?.(parseInt(r.dataset.row),e);return}let h=o.closest(".hmx-cell");h&&this.options.onCellClick?.(parseInt(h.dataset.row),parseInt(h.dataset.col),e)})}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let o=this.isResponsive();this.options={...this.options,...e},this.render(),!o&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let o=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!o)return;let n=o.offsetTop-this.scrollEl.clientHeight/2+o.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function Bn(i,e){if(i.length!==e.length)return!1;for(let o=0;o<i.length;o++)if(i[o]!==e[o])return!1;return!0}function Ke(i){let e=i.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let o=i.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(o){let n=o[1],r,h,d,p=1;return n.length===3||n.length===4?(r=parseInt(n[0]+n[0],16),h=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(r=parseInt(n.slice(0,2),16),h=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[r,h,d,p]}return null}function et(i){return!i||i[3]<.95?null:(.299*i[0]+.587*i[1]+.114*i[2])/255}function An(i){let e=i;for(;e;){let o=et(Ke(getComputedStyle(e).backgroundColor));if(o!==null)return o;e=e.parentElement}if(typeof document<"u")for(let o of[document.body,document.documentElement]){if(!o)continue;let n=et(Ke(getComputedStyle(o).backgroundColor));if(n!==null)return n}return null}function Wn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let o=et(Ke(e));return o===null?null:o<.5}function Ie(i,e){let o=ve(i),n=()=>{let d=ve(i);d!==o&&(o=d,e(d))},r=new MutationObserver(n);typeof document<"u"&&(r.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&r.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let h=null;return typeof window<"u"&&window.matchMedia&&(h=window.matchMedia("(prefers-color-scheme: dark)"),h.addEventListener("change",n)),()=>{r.disconnect(),h?.removeEventListener("change",n)}}function ve(i){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=Wn();if(e!==null)return e;let o=An(i??null);return o!==null?o<.5:!1}var Fn=60,Nn=30,Vn=22,jn=48,Un=18,It={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Gn="#cc6622";function qn(i){let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var zt=41;function tt(i,e,o){let[n,r,h]=qn(e),d=Math.pow(Math.max(0,Math.min(1,i)),1.1);if(o){let a=g=>Math.round(zt+(g-zt)*d);return`rgb(${a(n)}, ${a(r)}, ${a(h)})`}let p=a=>Math.round(255-(255-a)*d);return`rgb(${p(n)}, ${p(r)}, ${p(h)})`}function Yn(i,e){return e?i>=.62?"#fff":i>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":i>=.62?"#fff":i>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function _t(i){return i==null?"":i.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Le(i.slice(1)):Le(i)}function Te(i){return i==null?"":i.startsWith(" ")?"_"+i.slice(1):i}function ze(i){let e=i.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Ot(i,e,o){let n=wt(),r;if(typeof i=="string"?r=document.querySelector(i):i instanceof Element?r=i:r=null,!r)return console.error("Container not found:",i),null;let h=Xe(e),d=h.normalized,p=h.v2Data,a=Lt(n);function g(t){return t?t.map(s=>({token:s.tokens?.[0]??"",color:s.color})).filter(s=>s.token!==""):[]}let l={ramp:o?.ramp||"purple",showGrid:o?.showGrid??!0,dimLow:o?.dimLowProb??!0,selectedRow:o?.selectedRow??null,selectedLayerIdx:o?.selectedLayer??null,viewStart:o?.viewStart??0,viewSize:o?.viewSize??d.layers.length,darkModeOverride:o?.darkMode??null,pinned:g(o?.pinnedGroups),pinnedRows:(o?.pinnedRows??[]).map(t=>t.pos).filter(t=>typeof t=="number"),colorIndex:o?.colorIndex??0,openPopup:null,rowHighlights:o?.rowHighlights??[],collapsedSections:(o?.collapsedSections??[]).map(t=>({...t}))},f=null,M={};function k(t,s){(M[t]||[]).forEach(c=>c(s))}let b=d.layers.length,C=d.tokens.length,_=[],$="";function A(){b=d.layers.length,C=d.tokens.length,_=[];for(let s=0;s<b;s++){let c=0;for(let m=0;m<C;m++){let x=d.cells[m]?.[s];x&&x.prob>c&&(c=x.prob)}_.push(c)}$=d.cells[C-1]?.[b-1]?.token??"",l.pinnedRows=l.pinnedRows.filter(s=>s>=0&&s<C),l.selectedRow!==null&&l.selectedRow>=C&&(l.selectedRow=null),(l.viewSize>b||l.viewSize<1)&&(l.viewSize=b);let t=Math.max(0,b-l.viewSize);l.viewStart>t&&(l.viewStart=t),l.viewStart<0&&(l.viewStart=0)}A();function S(t){let s=l.pinned.find(c=>c.token===t);return s?s.color:null}function W(t){let s=l.pinned.findIndex(c=>c.token===t);s>=0?l.pinned.splice(s,1):(l.pinned.push({token:t,color:$e[l.colorIndex%$e.length]}),l.colorIndex++)}function I(t,s){let c=p?.tracked?.[t];if(c&&Array.isArray(c[s]))return c[s];for(let m=0;m<b;m++){let x=d.cells[t]?.[m]?.topk.find(T=>T.token===s);if(x)return x.trajectory}return null}function w(t){let s=l.pinnedRows.indexOf(t);return Ze[(s<0?0:s)%Ze.length]}function L(t){return l.pinnedRows.indexOf(t)>=0}function O(t,s){for(let c of l.pinned){let m=I(t,c.token);if(!m)continue;let x=0;for(let T of m)T!=null&&T>x&&(x=T);if(x>=s)return!0}return!1}function B(t){let s=null,c=0;for(let m=0;m<b;m++){let x=d.cells[t]?.[m];x&&x.prob>c&&(c=x.prob,s=x.token)}return c>=.05?s:null}function Y(t){let s=l.pinnedRows.indexOf(t);if(s>=0){l.pinnedRows.splice(s,1);return}if(!O(t,.01)){let c=B(t);c&&!S(c)&&(l.pinned.push({token:c,color:$e[l.colorIndex%$e.length]}),l.colorIndex++)}l.pinnedRows.push(t)}function u(){return It[l.ramp]||It.purple}function y(){return l.darkModeOverride!==null?l.darkModeOverride:ve(r)}let H=[];function R(){return H.length>1?Math.max(1,H[1]-H[0]):1}r.innerHTML=`
        <div id="${n}" tabindex="-1">
            <div class="ll-heatmap" id="${n}_heatmap" tabindex="0"></div>
            <div class="ll-nav" id="${n}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${n}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${n}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${n}_lp_box"><div class="ll-lineplot" id="${n}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${n}_tt"></div>
            <div class="ll-popup" id="${n}_popup">
                <span class="ll-popup-close" id="${n}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${n}_popup_hdr"></div>
                <div class="ll-popup-body" id="${n}_popup_body"></div>
            </div>
        </div>
    `;let E=document.getElementById(n),X=document.getElementById(n+"_heatmap"),Q=document.getElementById(n+"_nav"),Z,ne=document.getElementById(n+"_lp_wrap"),ye=document.getElementById(n+"_lp_token"),J=document.getElementById(n+"_lp_box"),me=document.getElementById(n+"_lp"),te=document.getElementById(n+"_tt"),G=document.getElementById(n+"_popup"),v=document.getElementById(n+"_popup_hdr"),P=document.getElementById(n+"_popup_body");document.body.appendChild(G);let D=null,j=null,N=!0,K=!1,re=getComputedStyle(E).getPropertyValue("--ll-aspect-ratio").trim(),se=!re;se&&E.classList.add("ll-fill");let fe=(()=>{if(!re||/^(unbounded|none|auto)$/i.test(re))return null;let t=re.split("/").map(s=>parseFloat(s.trim()));return t.length!==2||isNaN(t[0])||isNaN(t[1])||t[0]===0||t[1]===0?null:t[1]/t[0]})();function He(t,s){let c=s?"#bbb":"#555",m=t?` stroke-dasharray="${Le(t)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${m}/></svg>`}function rt(){return{rows:d.tokens.map(t=>({label:t})),columns:d.layers.map(t=>({label:String(t),value:0})),getCellValue:(t,s)=>{let c=d.cells[t][s],m=c.prob,x=y(),T=$!==""&&c.token===$,z=S(c.token),F=m<.18;return{text:c.token,value:m,color:tt(m,T?Gn:u(),x),textColor:Yn(m,x),highlighted:!!z,highlightColor:z??void 0,opacity:l.dimLow&&F?.55:void 0}}}}function qt(t){let s=d.tokens[t],c=t===l.selectedRow||L(t),m=`<span class="ll-fold-handle${f===t?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`;return L(t)&&(m+=He(w(t).dash,y())),m+=ze(s)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${c?' style="font-weight:600"':""}>${_t(s)}</span>`,m}function Yt(t){return"ll-hmx-row"+(t===l.selectedRow||L(t)?" ll-hmx-active":"")+(Qt(t)?" ll-gen-row":"")}function Xt(){let t=p?.completion;return t&&t.length?d.tokens.length-t.length:d.tokens.length}function Qt(t){return t>=Xt()}function Zt(t,s){let c=Math.min(t,s),m=Math.max(t,s);l.collapsedSections=l.collapsedSections.filter(x=>x.end<c||x.start>m).concat({start:c,end:m,collapsed:!0}).sort((x,T)=>x.start-T.start)}function Jt(t){f===null?(f=t,V()):f===t?(f=null,V()):(Zt(f,t),f=null,V(),ae())}function st(){return{columnSizing:"fit",minColumnWidth:jn,maxVisibleColumns:Un,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:Ee(l.viewStart),size:l.viewSize},rowSizing:se?"fill":"fixed",cellHeight:Nn,rowHeaderWidth:Fn,headerHeight:Vn+6,height:se||fe!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:l.showGrid,darkMode:y(),renderRowLabel:qt,rowClassName:Yt,rowHighlights:l.rowHighlights,collapsedSections:l.collapsedSections,onToggleCollapse:t=>{let s=l.collapsedSections[t];s&&(s.collapsed=s.collapsed===!1,V(),ae())},onRemoveCollapse:t=>{l.collapsedSections.splice(t,1),V(),ae()},onVisibleColumnsChange:t=>{H=t},onCellHover:wn,onCellClick:Ln,onRowHeaderClick:(t,s)=>{if(!!s.target.closest(".ll-fold-handle")||s.shiftKey){Jt(t);return}Y(t),V(),ie(),ae()},onCellLeave:()=>{Ne(),yn()}}}function Kt(){if(se){let s=r.clientWidth;E.style.width=s>0?s+"px":"100%",E.style.maxWidth="100%",E.style.maxHeight="";return}E.style.width="",E.style.maxWidth="";let t=r.clientWidth||E.clientWidth;if(fe&&t>0){let c=E.offsetHeight-Z.getScrollElement().offsetHeight,m=(c>0?c:140)+90;E.style.maxHeight=Math.max(m,Math.round(t*fe))+"px"}else E.style.maxHeight=""}function V(){Kt(),Z.setOptions(st())}function ge(){let t=u(),s=y(),c=Ee(l.viewStart),m=R(),x=l.viewSize,T=x>=b,z=at(),F=x<=z[0],U='<span class="ll-nav-range-key">layers</span>';T?U+=`all ${b}`+(m>1?`<span class="ll-dim"> \xB7 every ${m}</span>`:""):U+=`${c}\u2013${c+x-1}<span class="ll-dim"> / ${b}</span>`+(m>1?`<span class="ll-dim"> \xB7 \u22481/${m}</span>`:"");let le="";for(let q=0;q<b;q++){let be=_[q]||0,qe=Math.max(8,Math.round(be*92));le+=`<div class="ll-skyline-bar" style="height:${qe}%;background:${tt(be,t,s)}"></div>`}let oe=c/b*100,ce=x/b*100,de=[];for(let q=0;q<b;q+=8)de.push(q);de[de.length-1]!==b-1&&de.push(b-1);let he="",ue=Math.max(1,b-1);for(let q of de){let be=q===b-1,qe=q===0,Mn=q/ue*100;he+=`<span class="ll-nav-tick" style="left:${Mn}%;transform:${be?"translateX(-100%)":qe?"translateX(0)":"translateX(-50%)"}">${d.layers[q]}</span>`}Q.innerHTML=`
            <div class="ll-nav-range">${U}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${le}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${oe}%;width:${ce}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${he}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${c<=0?"disabled":""}>${Qn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${c+x>=b?"disabled":""}>${Zn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${F?"disabled":""}>${Jn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${T?"disabled":""}>${Kn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Xn}</button>
            </div>
        `,on()}function en(){let t=document.getElementById(n+"_win");if(!t)return;let s=Math.max(0,b-l.viewSize),c=Math.max(0,Math.min(s,l.viewStart));t.style.left=c/b*100+"%",t.style.width=l.viewSize/b*100+"%"}function at(){return Array.from(new Set([b,48,32,20,14,10,8])).filter(t=>t<=b&&t>=1).sort((t,s)=>t-s)}function Ee(t){return Math.max(0,Math.min(Math.max(0,b-l.viewSize),t))}let Be=!1;function dt(){Be||(Be=!0,requestAnimationFrame(()=>{Be=!1,!K&&(V(),en())}))}function Ae(t){let s=Ee(l.viewStart+t);s!==l.viewStart&&(l.viewStart=s,V(),ge(),ae())}function tn(t){let s=Ee(t);s!==l.viewStart&&(l.viewStart=s,dt())}function ct(t,s){let c=at(),m=c.findIndex(F=>F>=l.viewSize),x=m===-1?c.length-1:m,T=t<0?Math.max(0,x-1):Math.min(c.length-1,x+1),z=c[T];z!==l.viewSize&&(l.viewSize=z,l.viewStart=Math.max(0,Math.min(b-z,Math.round(s-z/2))),V(),ge(),ae())}function pt(t){ct(t,l.viewStart+l.viewSize/2)}function nn(){l.viewSize=b,l.viewStart=0,V(),ge(),ae()}let we=null;function on(){let t=document.getElementById(n+"_sky");if(!t)return;t.addEventListener("pointerdown",c=>{let m=t.getBoundingClientRect(),x=c.clientX-m.left,T=m.width/b,z=Math.max(0,b-l.viewSize),F=Math.max(0,Math.min(z,l.viewStart)),U=F*T,le=(F+l.viewSize)*T,oe=F;(x<U||x>le)&&(oe=Ee(Math.round(x/T)-Math.floor(l.viewSize/2)),l.viewStart=oe,dt()),we={startX:x,startStart:oe,layerW:T},t.classList.add("ll-grabbing");try{t.setPointerCapture(c.pointerId)}catch{}}),t.addEventListener("pointermove",c=>{if(!we)return;let m=t.getBoundingClientRect(),T=(c.clientX-m.left-we.startX)/we.layerW;tn(Math.round(we.startStart+T))});let s=c=>{if(we){we=null,t.classList.remove("ll-grabbing");try{t.releasePointerCapture(c.pointerId)}catch{}ge(),ae()}};t.addEventListener("pointerup",s),t.addEventListener("pointercancel",s),t.addEventListener("wheel",c=>{c.preventDefault();let m=t.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Ae(c.deltaX>0?1:-1);return}let x=Math.round((c.clientX-m.left)/m.width*b);ct(c.deltaY<0?-1:1,x)},{passive:!1})}function ln(t,s,c=!1){l.selectedRow=t,l.selectedLayerIdx=s??d.layers.length-1,V(),ie(),c&&rn(t),ae()}function rn(t){Z.scrollToRow(t)}function We(){requestAnimationFrame(()=>requestAnimationFrame(()=>{K||Z.scrollToBottom()}))}let sn=.45,an=120,dn=360;function Fe(){let t;if(fe)t=(r.clientWidth||E.clientWidth)*fe;else{let c=E.clientHeight;t=c>0?c:(E.clientWidth||900)*.6}let s=Math.round(t*sn);J.style.height=Math.max(an,Math.min(dn,s))+"px"}function ht(t){return t+"\xB7"+(ze(d.tokens[t])?"bos":Te(d.tokens[t]))}function ie(t){let s=l.pinnedRows.length>0?l.pinnedRows:l.selectedRow!==null?[l.selectedRow]:[],c=s.length>1,m=[];for(let T of s){let z=w(T);for(let F of l.pinned){let U=I(T,F.token);if(!U)continue;let le=Te(F.token);c&&(le+=" ("+ht(T)+")"),m.push({values:U.map(oe=>oe??null),label:le,color:F.color,dashPattern:z.dash||void 0,removable:!1})}}let x=m.length===0&&!t;if(x)ne.classList.add("ll-hidden");else{ne.classList.remove("ll-hidden"),Fe(),ye.textContent=l.pinnedRows.length>1?l.pinnedRows.length+" positions":s.length===1?"position "+ht(s[0]):"";let T={lines:[],richLines:m,xLabels:d.layers},z={darkMode:y(),mode:"probability",autoScale:!0,legendPosition:m.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};D?(D.setData(T),D.setOptions(z)):(me.style.minHeight="0",D=new xe(me,T,z)),t?D.setOverlay?.({values:t.values,label:t.label,color:t.color,dashPattern:"4,2",isOverlay:!0}):D.setOverlay?.(null)}se&&x!==N?(N=x,requestAnimationFrame(()=>{K||(V(),We())})):N=x}let cn=56,pn=11,hn=9.5,un=15;function mn(t){let s=pn*(t>0?t/cn:1);return Math.max(hn,Math.min(un,s))}function fn(t,s,c,m,x=0){let T=d.cells[t]?.[s];if(!T)return;let z=u(),F=ze(d.tokens[t])?"bos":Te(d.tokens[t]);te.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${tt(T.prob,z,y())}"></span><span class="ll-tt-token">${Le(Te(T.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(T.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[s]} / ${d.layers[b-1]}</span><span>position</span><span class="ll-tt-val">${t} \xB7 ${Le(F)}</span></div>`,te.style.fontSize=mn(x)+"px",te.classList.add("ll-visible");let U=E.getBoundingClientRect(),le=te.offsetWidth||200,oe=te.offsetHeight||80,ce=8,de=14,he=c-U.left,ue=m-U.top,q=he+de;q+le>U.width-ce&&(q=he-de-le),q=Math.max(ce,Math.min(q,U.width-le-ce));let be=ue-50;be=Math.max(ce,Math.min(be,U.height-oe-ce)),te.style.left=q+"px",te.style.top=be+"px"}function Ne(){te.classList.remove("ll-visible")}function gn(){Ve(),j=document.createElement("div"),j.style.cssText="position:fixed;inset:0;z-index:49;",j.addEventListener("mousedown",t=>{t.preventDefault(),t.stopPropagation(),mt()}),document.body.appendChild(j)}function Ve(){j&&(j.remove(),j=null)}function bn(t,s,c){if(!d.cells[t]?.[s])return;let x=c.getBoundingClientRect();l.openPopup={row:t,layer:s},l.selectedRow=t,l.selectedLayerIdx=s;let T=ze(d.tokens[t])?"bos":Te(d.tokens[t]);v.innerHTML=`Layer <b>${d.layers[s]}</b>, Position <b>${t}</b><div class="ll-popup-sub">input <code>${Le(T)}</code></div>`,ut(t,s),V(),ie(),G.style.visibility="hidden",G.classList.add("ll-visible"),xn(x),G.style.visibility="",gn(),ae()}function ut(t,s){let c=d.cells[t][s],m="";c.topk.forEach((x,T)=>{let z=S(x.token),F=z?`background:${z}22;border-left-color:${z};`:"";m+=`<div class="ll-topk${z?" ll-topk-pinned":""}" data-ki="${T}" style="${F}" title="click to track trajectory"><span class="ll-topk-tok">${_t(x.token)}</span><span class="ll-topk-prob">${(x.prob*100).toFixed(1)}%</span></div>`}),P.innerHTML=m,P.querySelectorAll(".ll-topk").forEach(x=>{let T=parseInt(x.dataset.ki),z=c.topk[T];x.addEventListener("mouseenter",()=>{if(N)return;let F=I(t,z.token);F&&ie({values:F.map(U=>U??null),label:Te(z.token),color:"#999"})}),x.addEventListener("mouseleave",()=>{N||ie()}),x.addEventListener("click",F=>{F.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(W(z.token),V(),ut(t,s),ie(),ae())})})}function xn(t){let m=E.getBoundingClientRect(),x=Math.max(140,m.width-2*8),T=Math.max(120,m.height-2*8);G.style.maxWidth=x+"px",G.style.maxHeight=T+"px";let z=G.offsetWidth||220,F=G.offsetHeight||160,U=m.left+8,le=m.right-8-z,oe=m.top+8,ce=m.bottom-8-F,de=[{left:t.right+6,top:t.top},{left:t.left-6-z,top:t.top},{left:t.left,top:t.bottom+6},{left:t.left,top:t.top-6-F}],he=de[0];for(let ue of de)if(ue.left>=U&&ue.left<=le&&ue.top>=oe&&ue.top<=ce){he=ue;break}G.style.left=Math.max(U,Math.min(he.left,Math.max(U,le)))+"px",G.style.top=Math.max(oe,Math.min(he.top,Math.max(oe,ce)))+"px"}function mt(){l.openPopup=null,G.classList.remove("ll-visible"),Ve(),V(),ie()}document.getElementById(n+"_popup_close").addEventListener("click",t=>{t.stopPropagation(),mt()});function vn(t,s){if(N)return;let c=d.cells[t]?.[s]?.token,m=c!=null?I(t,c):null;m?ie({values:m.map(x=>x??null),label:Te(c),color:"#999"}):ie()}function yn(){N||ie()}function wn(t,s){vn(t,s)}function Ln(t,s,c){if(c.shiftKey){let x=d.cells[t]?.[s]?.token;x&&(W(x),V(),ie(),ae());return}Ne();let m=c.target.closest(".hmx-cell");m&&bn(t,s,m)}Z=new Se(X,rt(),st());let Pe=Z.getScrollElement(),ft=t=>{let s=t.target.closest(".hmx-cell");if(!s){Ne();return}fn(parseInt(s.dataset.row),parseInt(s.dataset.col),t.clientX,t.clientY,s.offsetWidth)};Pe.addEventListener("mousemove",ft);let gt=t=>{t.shiftKey&&t.target.closest(".hmx-rowlabel")&&t.preventDefault()};Pe.addEventListener("mousedown",gt),X.addEventListener("keydown",t=>{if(t.key!=="ArrowDown"&&t.key!=="ArrowUp")return;t.preventDefault();let s=l.selectedRow??-1,c=t.key==="ArrowDown"?Math.min(C-1,s+1):Math.max(0,s-1);ln(c,void 0,!0)}),Q.addEventListener("click",t=>{let s=t.target.closest("[data-nav]");if(!s||s.hasAttribute("disabled"))return;let c=s.dataset.nav;c==="panL"?Ae(-Math.max(1,Math.floor(l.viewSize/4))):c==="panR"?Ae(Math.max(1,Math.floor(l.viewSize/4))):c==="zoomIn"?pt(-1):c==="zoomOut"?pt(1):c==="reset"&&nn()});function je(){V(),ge(),ie(),requestAnimationFrame(()=>{K||(V(),ge(),N||Fe())})}function Ue(){Qe(E,y(),G)}function ae(){k("stateChange",yt())}je(),We(),Ue();let Ge=0,bt=r?.clientWidth??0,xt=r?.clientHeight??0,vt=new ResizeObserver(()=>{let t=r?.clientWidth??0,s=r?.clientHeight??0;t===bt&&s===xt||(bt=t,xt=s,!Ge&&(Ge=requestAnimationFrame(()=>{Ge=0,!K&&(V(),N||Fe())})))});r&&vt.observe(r);let kn=Ie(r,t=>{l.darkModeOverride===null&&(Qe(E,t,G),V(),ge(),ie())});function yt(){return{ramp:l.ramp,showGrid:l.showGrid,dimLowProb:l.dimLow,selectedRow:l.selectedRow,selectedLayer:l.selectedLayerIdx,viewStart:l.viewStart,viewSize:l.viewSize,colorIndex:l.colorIndex,pinnedGroups:l.pinned.map(t=>({tokens:[t.token],color:t.color})),pinnedRows:l.pinnedRows.map(t=>({pos:t,line:w(t).name})),darkMode:l.darkModeOverride,rowHighlights:l.rowHighlights,collapsedSections:l.collapsedSections}}return{widget:{getState:yt,setState:t=>{t.ramp!==void 0&&(l.ramp=t.ramp),t.showGrid!==void 0&&(l.showGrid=t.showGrid),t.dimLowProb!==void 0&&(l.dimLow=t.dimLowProb),t.selectedRow!==void 0&&(l.selectedRow=t.selectedRow),t.selectedLayer!==void 0&&(l.selectedLayerIdx=t.selectedLayer),t.viewStart!==void 0&&(l.viewStart=t.viewStart),t.viewSize!==void 0&&(l.viewSize=t.viewSize),t.colorIndex!==void 0&&(l.colorIndex=t.colorIndex),t.pinnedGroups!==void 0&&(l.pinned=g(t.pinnedGroups)),t.pinnedRows!==void 0&&(l.pinnedRows=t.pinnedRows.map(s=>s.pos).filter(s=>typeof s=="number")),t.darkMode!==void 0&&(l.darkModeOverride=t.darkMode),t.rowHighlights!==void 0&&(l.rowHighlights=t.rowHighlights),t.collapsedSections!==void 0&&(l.collapsedSections=t.collapsedSections.map(s=>({...s}))),A(),Ue(),je()},setData:t=>{h=Xe(t),d=h.normalized,p=h.v2Data,l.selectedRow=null,l.selectedLayerIdx=null,l.pinned=[],l.pinnedRows=[],l.colorIndex=0,l.rowHighlights=[],l.collapsedSections=[],f=null,A(),H=[],Z.setData(rt()),je(),We()},setTitle:()=>{},setThemeMode:t=>{l.darkModeOverride=!!t,Ue(),V(),ge(),ie()},getThemeMode:()=>y(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let t of p.tracked)for(let s in t){let c=t[s];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(t,s)=>{(M[t]||(M[t]=[])).push(s)},off:(t,s)=>{M[t]=(M[t]||[]).filter(c=>c!==s)},destroy:()=>{K=!0,kn(),vt?.disconnect(),Ve(),G.remove(),D&&(D.destroy(),D=null),Pe.removeEventListener("mousemove",ft),Pe.removeEventListener("mousedown",gt),Z?.destroy(),r&&(r.innerHTML="")}},styleEl:a}}var Xn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Qn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Zn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Jn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Kn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var _e=class{constructor(e,o,n){this.widget=null;this.styleEl=null;let r=Ot(e,o,n);r&&(this.widget=r.widget,this.styleEl=r.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,o){this.widget?.on(e,o)}off(e,o){this.widget?.off(e,o)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var eo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',to='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',no='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',nt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function ot(i){return{fg:i?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:i?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:i?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:i?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:i?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:i?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:i?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:i?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:i?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:i?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Bt(i){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${nt};`;let o={isOpen:!1,searchQuery:""},n=Wt(e,i,o);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=o,e}function Ce(i,e){let o=i.__tokenSelectorCleanup,n=i.__tokenSelectorState;o&&o();let r={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},h=Wt(i,e,r);i.__tokenSelectorCleanup=h,i.__tokenSelectorState=r}function At(i){let e=i.__tokenSelectorCleanup;e&&e()}function Wt(i,e,o){i.innerHTML="";let n=ot(e.darkMode),{allLabels:r,selectedIndices:h,defaultIndices:d,onChange:p}=e,a=document.createElement("div");a.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let g=document.createElement("span");if(g.style.cssText=`font-size:11px;color:${n.fgMuted};`,g.textContent=`Tokens (${r.length})`,a.appendChild(g),!it(h,d)){let w=document.createElement("button");w.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${nt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,w.innerHTML=`${eo} Reset`,w.addEventListener("mouseenter",()=>{w.style.color=n.fg}),w.addEventListener("mouseleave",()=>{w.style.color=n.fgMuted}),w.addEventListener("click",()=>{p(Array.from(d))}),a.appendChild(w)}i.appendChild(a);let f=document.createElement("div");f.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,f.addEventListener("click",()=>{S(),k.focus()});let M=Array.from(h).sort((w,L)=>w-L);for(let w of M){let L=oo(w,r[w],e.darkMode,()=>{let O=new Set(h);O.delete(w),p(Array.from(O))});f.appendChild(L)}let k=document.createElement("input");k.type="text",k.placeholder=M.length===0?"Search tokens...":"",k.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${nt};min-width:60px;flex:1;padding:2px 0;`,k.addEventListener("input",()=>{o.searchQuery=k.value,A()}),k.addEventListener("focus",()=>S()),f.appendChild(k);let b=document.createElement("span");b.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,b.innerHTML=no,b.addEventListener("click",w=>{w.stopPropagation(),o.isOpen?W():S()}),f.appendChild(b),i.appendChild(f);let C=document.createElement("div");C.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let _=document.createElement("div");_.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",C.appendChild(_);let $=document.createElement("div");$.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,$.textContent="No tokens found",C.appendChild($),i.appendChild(C);function A(){_.innerHTML="";let w=o.searchQuery.toLowerCase(),L=0;for(let O=0;O<r.length;O++){let B=r[O];if(w&&!B.toLowerCase().includes(w))continue;L++;let Y=h.has(O),u=io(O,B,Y,e.darkMode,()=>{let y=new Set(h);Y?y.delete(O):y.add(O),p(Array.from(y))});_.appendChild(u)}$.style.display=L===0?"":"none"}function S(){o.isOpen||(o.isOpen=!0,C.style.display="",b.style.transform="rotate(180deg)",A())}function W(){o.isOpen&&(o.isOpen=!1,C.style.display="none",b.style.transform="",k.value="",o.searchQuery="")}function I(w){i.contains(w.target)||W()}return document.addEventListener("mousedown",I),o.isOpen&&(C.style.display="",b.style.transform="rotate(180deg)",k.value=o.searchQuery,A(),requestAnimationFrame(()=>{k.isConnected&&k.focus()})),()=>{document.removeEventListener("mousedown",I)}}function oo(i,e,o,n){let r=ot(o),h=ee[i%ee.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${r.chipBorder};background:${r.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=r.chipHoverBg,d.style.borderColor=r.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=r.chipBg,d.style.borderColor=r.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${h};`,d.appendChild(p);let a=document.createElement("span");a.style.cssText=`font-size:11px;color:${r.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,a.innerHTML=Me(e),a.title=e,d.appendChild(a);let g=document.createElement("button");return g.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${r.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,g.innerHTML=to,g.addEventListener("mouseenter",()=>{g.style.color=r.badgeText}),g.addEventListener("mouseleave",()=>{g.style.color=r.fgMuted}),g.addEventListener("click",l=>{l.stopPropagation(),n()}),d.appendChild(g),d}function io(i,e,o,n,r){let h=ot(n),d=ee[i%ee.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=h.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",f=>{f.stopPropagation(),r()});let a=document.createElement("span");a.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${o?d:"transparent"};border:1.5px solid ${o?d:h.fgMuted};`,p.appendChild(a);let g=document.createElement("span");g.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${o?h.fg:h.fgMuted};`,g.innerHTML=Me(e),g.title=e,p.appendChild(g);let l=i===0?"source pred":i===1?"target pred":null;if(l){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${h.badgeBg};color:${h.badgeText};border:1px solid ${h.badgeBorder};`,f.textContent=l,p.appendChild(f)}if(o){let f=document.createElement("span");f.style.cssText=`flex-shrink:0;font-size:10px;color:${h.selectedText};`,f.textContent="selected",p.appendChild(f)}return p}function it(i,e){if(i.size!==e.size)return!1;for(let o of i)if(!e.has(o))return!1;return!0}var lo={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},ro=["probability","prob_diff","rank"],Oe=class{constructor(e,o,n={}){this.modeButtons=new Map;this.container=e,this.allData=o,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let r=o.tokenLabels?.length??o.lines?.length??0,h=n.defaultSelectedTokens??Array.from({length:Math.min(2,r)},(p,a)=>a);this.defaultTokens=new Set(h),this.selectedTokens=new Set(n.selectedTokens??h),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Bt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new xe(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let o of ro){let n=document.createElement("button");n.textContent=lo[o],this.applyModeButtonStyles(n,o===this.mode),n.addEventListener("click",()=>this.setMode(o)),n.addEventListener("mouseenter",()=>{o!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{o!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(o,n)}return e}applyModeBarStyles(e){let o=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${o};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,o){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",r="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${o?r:"transparent"};color:${o?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,o]of this.modeButtons)this.applyModeButtonStyles(o,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),o=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,p)=>d-p),r=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:r?e[d].map(p=>p+1):e[d],label:o[d]??`Token ${d}`,color:ee[d%ee.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let o=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,o)},(r,h)=>h));let n=new Set([...this.selectedTokens].filter(r=>r<o));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let o=this.getModeLines().length,n=new Set(e.filter(r=>r<o));it(n,this.selectedTokens)||(this.selectedTokens=n,Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){At(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function so(i){let e=typeof i=="string"?document.querySelector(i):i;return e||console.error("Container not found:",i),e}function lt(i,e,o){let n=so(i);if(!n)return null;let r=e(n);if(o===void 0){let h=Ie(n,p=>r.setThemeMode(p)),d=r.destroy.bind(r);r.destroy=()=>{h(),d()}}return r}function Vt(i,e,o){return new _e(i,e,o)}function jt(i,e,o){return lt(i,n=>new xe(n,e,{darkMode:ve(n),...o}),o?.darkMode)}var Ft={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function ao(i){if(!/^#?[0-9a-fA-F]{6}$/.test(i))return[147,51,234];let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Nt(i,e){if(typeof i.getCellValue=="function")return i;let o=i,n=o.values??[],r=o.texts,h=o.rowLabels??n.map(($,A)=>String(A)),d=o.colLabels??(n[0]??[]).map(($,A)=>String(A)),p=o.ramp??"purple",a=Ft[p]??(p[0]==="#"?p:Ft.purple),[g,l,f]=ao(a),[M,k]=o.valueDomain??[0,1],b=k-M,C=e?38:255,_=$=>Math.max(0,Math.min(1,$));return{rows:h.map($=>({label:$})),columns:d.map($=>({label:$,value:0})),getCellValue:($,A)=>{let S=n[$]?.[A]??0,W=_(b>0?(S-M)/b:S),I=L=>Math.round(C+(L-C)*W);return{text:r?r[$]?.[A]??"":Number.isInteger(S)?String(S):S.toFixed(2),value:S,color:`rgb(${I(g)}, ${I(l)}, ${I(f)})`,textColor:W>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Ut(i,e,o){return lt(i,n=>{let r=o?.darkMode??ve(n),h=new Se(n,Nt(e,r),{darkMode:r,...o}),d=h.setThemeMode.bind(h);return h.setThemeMode=p=>{h.setData(Nt(e,p)),d(p)},h},o?.darkMode)}function Gt(i,e,o){return lt(i,n=>new Oe(n,e,{darkMode:ve(n),...o}),o?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Vt,window.LinePlotWidget=jt,window.HeatmapTableWidget=Ut,window.ActivationPatchingWidget=Gt);return Hn(co);})();
//# sourceMappingURL=charts.js.map
