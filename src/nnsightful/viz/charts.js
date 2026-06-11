"use strict";var InterpTools=(()=>{var et=Object.defineProperty;var wn=Object.getOwnPropertyDescriptor;var Ln=Object.getOwnPropertyNames;var kn=Object.prototype.hasOwnProperty;var Mn=(o,e)=>{for(var n in e)et(o,n,{get:e[n],enumerable:!0})},Tn=(o,e,n,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Ln(e))!kn.call(o,l)&&l!==n&&et(o,l,{get:()=>e[l],enumerable:!(t=wn(e,l))||t.enumerable});return o};var En=o=>Tn(et({},"__esModule",{value:!0}),o);var no={};Mn(no,{ActivationPatchingWidget:()=>Jt,HeatmapTableWidget:()=>Zt,LinePlotWidget:()=>Qt,LogitLensWidget:()=>Xt});function tt(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let n=o.layers.length,t=o.input.length,l=[];for(let d=0;d<t;d++){let p=[],a=o.tracked[d];for(let g=0;g<n;g++){let r=o.topk[g][d],b=[];for(let u=0;u<r.length;u++){let k=r[u],H=a[k]||[],z=H[g]||0;b.push({token:k,prob:z,trajectory:H})}let T=b[0]||{token:"",prob:0,trajectory:[]};p.push({token:T.token,prob:T.prob,trajectory:T.trajectory,topk:b})}l.push(p)}return{normalized:{layers:o.layers,tokens:o.input,cells:l,meta:o.meta||{}},v2Data:o}}function Ht(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function ve(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function Sn(o){let e=`#${o}`;return`
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
               to its container (never grown by the wide heatmap inside,
               which is clipped/scrolled by .ll-scroll). */
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
            /* Flex column in BOTH modes: the heatmap (.ll-scroll) flex-grows
               to absorb available height and scrolls; the navigator and line
               plot keep their natural size below it.
                - Content (Jupyter): renderHeatmap sets an inline max-height
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

        /* Leading-space marker, used in cell + row-label token rendering. */
        ${e} .ll-lead-space { color: #3b82f6; }

        /* \u2500\u2500 Heatmap region: fixed layer header above a scrollable rows area.
              The header lives OUTSIDE the scroll viewport, so rows can never
              scroll above it \u2014 which is why neither the header nor the axis
              labels need an opaque background (no scroll bleed to hide). No
              outer frame here: the rounded corners are applied to the four
              corner DATA cells (in renderHeatmap), so only the cells area is
              rounded, not the axis. \u2500\u2500 */
        ${e} .ll-heatmap {
            display: flex; flex-direction: column;
            min-width: 0; max-width: 100%;
        }
        ${e} .ll-hdr-fixed { flex: 0 0 auto; overflow: hidden; }
        ${e} .ll-scroll {
            flex: 1 1 auto; min-height: 0;
            overflow: auto;
            min-width: 0; max-width: 100%;
        }
        ${e} .ll-grid-inner { /* width set inline */ }
        ${e} .ll-hdr-row { align-items: end; padding-bottom: 4px; }
        ${e} .ll-corner {
            font-size: 10px; color: var(--ll-text-muted);
            text-align: right; padding-right: 8px;
            letter-spacing: 0.04em; text-transform: uppercase;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            display: flex; align-items: flex-end; justify-content: flex-end;
        }
        ${e} .ll-hdr-cell {
            text-align: center; font-family: var(--ll-font-mono); font-size: 11px;
            color: var(--ll-text-muted); font-variant-numeric: tabular-nums;
            overflow: hidden; white-space: nowrap;
            -webkit-user-select: text; user-select: text;
        }
        ${e} .ll-row { position: relative; }
        ${e} .ll-row-rail {
            position: absolute; left: -1px; top: 0; bottom: 0;
            width: 3px; background: var(--ll-primary); border-radius: 2px; z-index: 2;
        }
        ${e} .ll-row-grid {
            cursor: pointer; position: relative; z-index: 1;
        }
        ${e} .ll-row-grid.ll-row-sel {
            background: var(--ll-surface-2);
            box-shadow: 0 0 0 1px var(--ll-primary-018);
            border-radius: 4px;
        }
        ${e} .ll-row-label {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 6px; padding: 0 8px; font-size: 12px; color: var(--ll-text-2);
            /* No background: the token column never has cells scrolling under
               it (columns fit to width \u2192 no horizontal scroll), and rows
               scroll vertically together with their labels. */
            overflow: hidden;
        }
        ${e} .ll-cell {
            display: flex; align-items: center; justify-content: center;
            min-width: 0; font-size: 11px; font-family: var(--ll-font-mono);
            position: relative; color: hsl(0 0% 18%);
        }
        ${e} .ll-cell-text {
            display: block; min-width: 0; max-width: 100%;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            /* The widget root is user-select:none (to keep drags clean), but
               the token labels opt back in so they can be highlighted /
               copied (drag to select). Cursor stays inherited (pointer) so
               the cell's click-to-inspect affordance is preserved. Selecting
               copies the full token even when the cell truncates it. */
            -webkit-user-select: text; user-select: text;
        }
        ${e} .ll-cell.ll-cell-hover { outline: 2px solid var(--ll-text); outline-offset: -2px; z-index: 3; }
        ${e} .ll-row-style { flex-shrink: 0; }
        ${e} .ll-bos-pill {
            display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
            border: 1px solid var(--ll-line-2); border-radius: 3px;
            font-family: var(--ll-font-mono); font-size: 10px; font-weight: 500;
            color: var(--ll-text-muted); background: var(--ll-surface-3); letter-spacing: 0.02em;
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

        /* \u2500\u2500 Tooltip \u2500\u2500 */
        ${e} .ll-tooltip {
            position: absolute; width: 220px; padding: 12px 14px;
            background: var(--ll-surface); border: 1px solid var(--ll-line-2);
            border-radius: 6px;
            box-shadow: 0 6px 20px -4px rgba(0,0,0,0.12), 0 2px 6px -2px rgba(0,0,0,0.08);
            pointer-events: none; z-index: 50; font-family: var(--ll-font-sans);
            display: none;
        }
        ${e} .ll-tooltip.ll-visible { display: block; }
        ${e} .ll-tt-head { display: flex; align-items: center; gap: 8px; }
        ${e} .ll-tt-swatch { width: 12px; height: 12px; border-radius: 2px; border: 1px solid var(--ll-line-2); flex-shrink: 0; }
        ${e} .ll-tt-token {
            font-family: var(--ll-font-mono); font-size: 13px; font-weight: 500;
            color: var(--ll-text); max-width: 160px;
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        ${e} .ll-tt-grid {
            margin-top: 8px; display: grid; grid-template-columns: auto 1fr; gap: 3px 12px;
            font-size: 11.5px; color: var(--ll-text-muted);
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
    `}function Pt(o){let e=document.createElement("style");return e.textContent=Sn(o),document.head.appendChild(e),e}function nt(o,e,...n){let t=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};t(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let l of n)l&&t(l)}var Se=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],ot=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var G=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ye(o){return o.richLines&&o.richLines.length>0?o.richLines.map((n,t)=>({values:n.values,label:n.label??`Line ${t+1}`,color:n.color,dashPattern:n.dashPattern,isOverlay:n.isOverlay,removable:n.removable})):(o.lines??[]).map((n,t)=>({values:n,label:o.labels?.[t]??`Line ${t+1}`}))}function we(o){if(!o)return"";let e=[],n=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),n=1);let t="";for(;n<o.length;n++){let l=o[n];l===`
`?(t&&(e.push(Dt(t)),t=""),e.push('<span style="color:#3b82f6">\\n</span>')):t+=l}return t&&e.push(Dt(t)),e.join("")}function Dt(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function $n(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let n of e)if(o<=n)return n;return 1}function It(o,e,n){let t=ye(o),l=t.length>0?t[0].values.length:n?.values.length??o.xLabels?.length??0;if(l===0)return null;let h=e.mode||"probability",d=e.minValue,p=e.maxValue;if(d===void 0||p===void 0||e.autoScale){let a=[];for(let b of t)if(!b.isOverlay)for(let T of b.values)T!==null&&a.push(T);if(n)for(let b of n.values)b!==null&&a.push(b);if(a.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:t.length};let g=1/0,r=-1/0;for(let b of a)b<g&&(g=b),b>r&&(r=b);if(e.centerYAxisAtZero){let T=Math.max(Math.abs(g),Math.abs(r))*1.1;d=-T,p=T}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(g))),p===void 0||e.autoScale){let b=Math.log(Math.max(1,g)),T=Math.log(Math.max(1,r)),u=T+.15*Math.max(1,T-b);p=Math.ceil(Math.exp(u))}}else d===void 0&&(d=h==="probability"?0:h==="rank"?Math.max(1,Math.floor(g)):Math.floor(g*.9)),(p===void 0||e.autoScale)&&(h==="rank"?p=Math.ceil(r*1.1):h==="probability"?p=e.autoScale?$n(Math.max(r,.001)):Math.min(r*1.1,1):p=r*1.1)}return{numLayers:l,minValue:d,maxValue:p,numLines:t.length}}function Rt(o,e,n,t,l,h,d,p){let a=o.getContext("2d"),g=e.getBoundingClientRect(),r=window.devicePixelRatio||1;o.width=g.width*r,o.height=g.height*r,o.style.width=`${g.width}px`,o.style.height=`${g.height}px`,a.scale(r,r);let b=g.width,T=g.height,u=t.darkMode??!1,k=t.title,H=t.mode||"probability",z=t.invertYAxis??!1,w=t.centerYAxisAtZero??!1,_=t.logScale??!1,$=t.xAxisLabel||"Layer",B=t.yAxisLabel||"Probability",P=t.xRangeStart??0;P>=l.numLayers-1&&(console.warn(`xRangeStart (${P}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),P=0);let y=t.showDataPoints??!0,v={top:k?48:24,right:24,bottom:56,left:72},O=b-v.left-v.right,A=T-v.top-v.bottom,J={margin:v,chartWidth:O,chartHeight:A,width:b,height:T},F={background:u?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:u?"#52525b":"#a1a1aa",grid:u?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:u?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:u?"#e4e4e7":"#27272a"};t.transparentBackground?a.clearRect(0,0,b,T):(a.fillStyle=F.background,a.fillRect(0,0,b,T)),k&&(a.fillStyle=F.titleText,a.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="left",a.fillText(k,v.left,28));let Q=l.numLayers-1-P,ae=x=>Q<=0?v.left+O/2:v.left+(x-P)/Q*O,K=_?Math.log(Math.max(1,l.minValue)):0,D=_?Math.log(Math.max(1,l.maxValue)):0,N=x=>{let I;if(_){let R=Math.log(Math.max(1,x));I=D-K>0?(R-K)/(D-K):.5}else I=(x-l.minValue)/(l.maxValue-l.minValue);return z?v.top+I*A:v.top+A-I*A};a.setLineDash([4,4]),a.strokeStyle=F.grid,a.lineWidth=1;let de=[],Te=l.maxValue-l.minValue,ce=5;if(_){let x=new Set;for(let j=0;j<ce;j++){let V=K+j/(ce-1)*(D-K),U=Math.round(Math.exp(V));x.has(U)||(x.add(U),de.push(U))}let I=Math.round(Math.exp(K)),R=Math.round(Math.exp(D));x.has(I)||de.unshift(I),x.has(R)||de.push(R)}else if(H==="rank")for(let x=0;x<ce;x++)de.push(Math.round(l.minValue+x/(ce-1)*Te));else for(let x=0;x<ce;x++)de.push(l.minValue+x/(ce-1)*Te);if(de.forEach(x=>{let I=N(x);a.beginPath(),a.moveTo(v.left,I),a.lineTo(v.left+O,I),a.stroke()}),a.setLineDash([]),w){let x=N(0);a.beginPath(),a.strokeStyle=u?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",a.lineWidth=1.5,a.moveTo(v.left,x),a.lineTo(v.left+O,x),a.stroke(),a.lineWidth=1}a.fillStyle=F.text,a.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="right",a.textBaseline="middle",de.forEach(x=>{let I=N(x),R;H==="probability"?R=x.toFixed(2):H==="prob_diff"?R=x>=0?`+${x.toFixed(2)}`:x.toFixed(2):R=Math.round(x).toString(),a.fillText(R,v.left-16,I)}),a.textAlign="center",a.textBaseline="top";let He=n.xLabels&&n.xLabels.length>0,Pe=Math.max(1,Math.ceil(l.numLayers/8));for(let x=0;x<l.numLayers;x+=Pe){let I=ae(x);if(I<v.left-5||I>v.left+O+5)continue;let R=He?String(n.xLabels[x]??x):x.toString();a.fillText(R,I,v.top+A+12)}if((l.numLayers-1)%Pe!==0){let x=He?String(n.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();a.fillText(x,ae(l.numLayers-1),v.top+A+12)}a.strokeStyle=u?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",a.lineWidth=1.5,a.beginPath(),a.moveTo(v.left,v.top),a.lineTo(v.left,v.top+A),a.lineTo(v.left+O,v.top+A),a.stroke(),a.fillStyle=F.textMuted,a.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="center",a.textBaseline="top",a.fillText($.toUpperCase(),v.left+O/2,T-16),a.save(),a.translate(14,v.top+A/2),a.rotate(-Math.PI/2),a.textAlign="center",a.textBaseline="top",a.fillText(B.toUpperCase(),0,0),a.restore();let ke=ye(n);function ee(x,I,R,j,V){a.beginPath(),a.strokeStyle=I,a.lineWidth=R,V!==void 0&&(a.globalAlpha=V),j?a.setLineDash(j.split(",").map(Number)):a.setLineDash([]);let U=!1;for(let oe=0;oe<x.length;oe++){let le=x[oe];if(le===null){U=!1;continue}let ge=ae(oe),Me=N(le);U?a.lineTo(ge,Me):(a.moveTo(ge,Me),U=!0)}a.stroke(),a.setLineDash([]),V!==void 0&&(a.globalAlpha=1)}let q=u?"#3f3f46":"#d4d4d8";if(a.lineCap="round",a.lineJoin="round",ke.forEach((x,I)=>{!h.has(I)||x.isOverlay||ee(x.values,q,2,void 0,.35)}),ke.forEach((x,I)=>{if(h.has(I)||x.isOverlay)return;let R=x.color??G[I%G.length];ee(x.values,R,4,x.dashPattern,.15),ee(x.values,R,2,x.dashPattern),y&&x.values.forEach((j,V)=>{if(j===null)return;let U=ae(V),oe=N(j),le=d?.lineIdx===I&&d?.layerIdx===V;a.beginPath(),a.strokeStyle=R,a.lineWidth=le?2:1.5,a.arc(U,oe,le?5:3.5,0,Math.PI*2),a.stroke(),a.beginPath(),a.fillStyle=u?"#18181b":"#ffffff",a.arc(U,oe,le?3.5:2.5,0,Math.PI*2),a.fill()})}),ke.forEach((x,I)=>{if(!x.isOverlay||h.has(I))return;let R=x.color??"#999";ee(x.values,R,1.5,x.dashPattern??"4,2",.7)}),p){let x=p.color??"#999";ee(p.values,x,1.5,p.dashPattern??"4,2",.7)}return J}function zt(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function _t(o,e,n,t,l,h,d,p,a){let{margin:g,chartWidth:r,chartHeight:b}=l,T=t.xRangeStart??0,u=d-1-T,k=t.logScale?Math.log(Math.max(1,p)):0,H=t.logScale?Math.log(Math.max(1,a)):0;if(o<g.left||o>g.left+r||e<g.top||e>g.top+b)return null;let z=ye(n),w=null,_=1/0,$=20;for(let B=0;B<z.length;B++){if(h.has(B))continue;let P=z[B];if(!P.isOverlay)for(let y=0;y<P.values.length;y++){let v=P.values[y];if(v===null)continue;let O=u<=0?g.left+r/2:g.left+(y-T)/u*r,A;if(t.logScale){let Q=Math.log(Math.max(1,v));A=H-k>0?(Q-k)/(H-k):.5}else A=(v-p)/(a-p);let J=t.invertYAxis?g.top+A*b:g.top+b-A*b,F=Math.sqrt((o-O)**2+(e-J)**2);F<_&&F<$&&(_=F,w={visible:!0,x:O,y:J,lineIdx:B,layerIdx:y,value:v,label:P.label,color:P.color??G[B%G.length]})}}return w}function it(o,e,n,t,l,h,d){if(!e){o.style.opacity="0";return}let p=t?"#27272a":"#fff",a=t?"#3f3f46":"#e4e4e7",g=t?"#fafafa":"#18181b",r=t?"#a1a1aa":"#71717a",T=e.x>n/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${T},-50%);`;let u=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);o.innerHTML=`
        <div style="background:${p};border:1px solid ${a};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${g};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${we(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${r}">${h??"Layer"}</span>
                    <span style="font-weight:500;color:${g}">${u}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${r}">Value</span>
                    <span style="font-weight:500;color:${g}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Cn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Hn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Pn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Ot(o){let e=document.createElement("div");return Bt(e,o),e}function Bt(o,e){let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",t=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${t};align-self:flex-start;`}function Wt(o,e,n,t,l,h){Bt(o,t),o.innerHTML="";let d=t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",a=t?"#a1a1aa":"#71717a",g=t?"#3f3f46":"#d4d4d8",r="rgba(161,161,170,0.3)",b=t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",T=h?ye(h):[];e.forEach((u,k)=>{let H=T[k];if(H?.isOverlay)return;let z=H?.color??G[k%G.length],w=n.has(k),_=H?.removable??!1,$=document.createElement("button");$.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${w?"0.5":"1"};`,$.addEventListener("mouseenter",()=>{$.style.background=b}),$.addEventListener("mouseleave",()=>{$.style.background="transparent"}),$.addEventListener("click",()=>l.onToggle(k));let B=document.createElement("span");B.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${w?r:z};background:${w?g:"transparent"};`,$.appendChild(B);let P=document.createElement("span");if(P.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${w?p:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,P.title=u,P.innerHTML=we(u),$.appendChild(P),_&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${a};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=Pn,y.title="Remove",y.addEventListener("click",v=>{v.stopPropagation(),l.onRemove(k)}),$.appendChild(y),$.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),$.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${a};opacity:${w?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=w?Hn:Cn,$.appendChild(y),w||($.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),$.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}o.appendChild($)})}var me=class{constructor(e,n,t={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let n=this.canvas.getBoundingClientRect(),t=e.clientX-n.left,l=e.clientY-n.top;this.tooltip=_t(t,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),it(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,it(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=n,this.options={darkMode:!1,...t},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=zt(this.chartContainer),this.legendEl=Ot(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let h=l[0];if(!h)return;let d=Math.round(h.contentRect.width),p=Math.round(h.contentRect.height);d===this.lastWidth&&p===this.lastHeight||(this.lastWidth=d,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,n)=>e.label??`Line ${n+1}`):this.data.labels||(this.data.lines??[]).map((e,n)=>`Line ${n+1}`)}draw(){this.config=It(this.data,this.options,this.overlay),this.config&&(this.geometry=Rt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",Wt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:n=>this.toggleLine(n),onRemove:this.options.onLineRemoved?n=>{this.removeLine(n,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(n)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((n,t)=>({values:n,label:this.data.labels?.[t]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,n=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let t=new Set;for(let l of this.hiddenLines)l<e?t.add(l):l>e&&t.add(l-1);this.hiddenLines=t,n||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function lt(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let n=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(n){let t=n[1],l,h,d,p=1;return t.length===3||t.length===4?(l=parseInt(t[0]+t[0],16),h=parseInt(t[1]+t[1],16),d=parseInt(t[2]+t[2],16),t.length===4&&(p=parseInt(t[3]+t[3],16)/255)):(l=parseInt(t.slice(0,2),16),h=parseInt(t.slice(2,4),16),d=parseInt(t.slice(4,6),16),t.length===8&&(p=parseInt(t.slice(6,8),16)/255)),[l,h,d,p]}return null}function rt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function Dn(o){let e=o;for(;e;){let n=rt(lt(getComputedStyle(e).backgroundColor));if(n!==null)return n;e=e.parentElement}if(typeof document<"u")for(let n of[document.body,document.documentElement]){if(!n)continue;let t=rt(lt(getComputedStyle(n).backgroundColor));if(t!==null)return t}return null}function In(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let n=rt(lt(e));return n===null?null:n<.5}function De(o,e){let n=fe(o),t=()=>{let d=fe(o);d!==n&&(n=d,e(d))},l=new MutationObserver(t);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let h=null;return typeof window<"u"&&window.matchMedia&&(h=window.matchMedia("(prefers-color-scheme: dark)"),h.addEventListener("change",t)),()=>{l.disconnect(),h?.removeEventListener("change",t)}}function fe(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=In();if(e!==null)return e;let n=Dn(o??null);return n!==null?n<.5:!1}var Ie=60,Re=30,Rn=22,ze=48,zn=18,At={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},_n="#cc6622";function On(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Ft=41;function st(o,e,n){let[t,l,h]=On(e),d=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(n){let a=g=>Math.round(Ft+(g-Ft)*d);return`rgb(${a(t)}, ${a(l)}, ${a(h)})`}let p=a=>Math.round(255-(255-a)*d);return`rgb(${p(t)}, ${p(l)}, ${p(h)})`}function Bn(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function at(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+ve(o.slice(1)):ve(o)}function Le(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function _e(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Nt(o,e,n){let t=Ht(),l;if(typeof o=="string"?l=document.querySelector(o):o instanceof Element?l=o:l=null,!l)return console.error("Container not found:",o),null;let h=tt(e),d=h.normalized,p=h.v2Data,a=Pt(t);function g(i){return i?i.map(s=>({token:s.tokens?.[0]??"",color:s.color})).filter(s=>s.token!==""):[]}let r={ramp:n?.ramp||"purple",showGrid:n?.showGrid??!0,dimLow:n?.dimLowProb??!0,selectedRow:n?.selectedRow??null,selectedLayerIdx:n?.selectedLayer??null,viewStart:n?.viewStart??0,viewSize:n?.viewSize??d.layers.length,darkModeOverride:n?.darkMode??null,pinned:g(n?.pinnedGroups),pinnedRows:(n?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:n?.colorIndex??0,openPopup:null},b={};function T(i,s){(b[i]||[]).forEach(c=>c(s))}let u=d.layers.length,k=d.tokens.length,H=[],z="";function w(){u=d.layers.length,k=d.tokens.length,H=[];for(let s=0;s<u;s++){let c=0;for(let m=0;m<k;m++){let f=d.cells[m]?.[s];f&&f.prob>c&&(c=f.prob)}H.push(c)}z=d.cells[k-1]?.[u-1]?.token??"",r.pinnedRows=r.pinnedRows.filter(s=>s>=0&&s<k),r.selectedRow!==null&&r.selectedRow>=k&&(r.selectedRow=null),(r.viewSize>u||r.viewSize<1)&&(r.viewSize=u);let i=Math.max(0,u-r.viewSize);r.viewStart>i&&(r.viewStart=i),r.viewStart<0&&(r.viewStart=0)}w();function _(i){let s=r.pinned.find(c=>c.token===i);return s?s.color:null}function $(i){let s=r.pinned.findIndex(c=>c.token===i);s>=0?r.pinned.splice(s,1):(r.pinned.push({token:i,color:Se[r.colorIndex%Se.length]}),r.colorIndex++)}function B(i,s){let c=p?.tracked?.[i];if(c&&Array.isArray(c[s]))return c[s];for(let m=0;m<u;m++){let f=d.cells[i]?.[m]?.topk.find(L=>L.token===s);if(f)return f.trajectory}return null}function P(i){let s=r.pinnedRows.indexOf(i);return ot[(s<0?0:s)%ot.length]}function y(i){return r.pinnedRows.indexOf(i)>=0}function v(i,s){for(let c of r.pinned){let m=B(i,c.token);if(!m)continue;let f=0;for(let L of m)L!=null&&L>f&&(f=L);if(f>=s)return!0}return!1}function O(i){let s=null,c=0;for(let m=0;m<u;m++){let f=d.cells[i]?.[m];f&&f.prob>c&&(c=f.prob,s=f.token)}return c>=.05?s:null}function A(i){let s=r.pinnedRows.indexOf(i);if(s>=0){r.pinnedRows.splice(s,1);return}if(!v(i,.01)){let c=O(i);c&&!_(c)&&(r.pinned.push({token:c,color:Se[r.colorIndex%Se.length]}),r.colorIndex++)}r.pinnedRows.push(i)}function J(){return At[r.ramp]||At.purple}function F(){return r.darkModeOverride!==null?r.darkModeOverride:fe(l)}function Q(){let i=N.clientWidth;if(i>0)return i;let s=l?.clientWidth??0;return s>0?s-42:900}function ae(){let i=Math.floor((Q()-Ie)/ze);return Math.max(1,Math.min(zn,i))}function K(){let i=Math.max(0,u-r.viewSize),s=Math.max(0,Math.min(i,r.viewStart)),c=r.viewSize,m=ae();if(c<=m){let E=[];for(let S=0;S<c;S++)E.push(s+S);return{shownLayers:E,stride:1,start:s}}let f=Math.max(1,m-1),L=Math.ceil(c/f),M=[];for(let E=s;E<s+c;E+=L)M.push(E);let C=s+c-1;return M[M.length-1]!==C&&M.push(Math.min(u-1,C)),{shownLayers:M,stride:L,start:s}}l.innerHTML=`
        <div id="${t}" tabindex="-1">
            <div class="ll-heatmap" id="${t}_heatmap">
                <div class="ll-hdr-fixed" id="${t}_hdr"></div>
                <div class="ll-scroll" id="${t}_scroll" tabindex="0"></div>
            </div>
            <div class="ll-nav" id="${t}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${t}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${t}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${t}_lp_box"><div class="ll-lineplot" id="${t}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${t}_tt"></div>
            <div class="ll-popup" id="${t}_popup">
                <span class="ll-popup-close" id="${t}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${t}_popup_hdr"></div>
                <div class="ll-popup-body" id="${t}_popup_body"></div>
            </div>
        </div>
    `;let D=document.getElementById(t),N=document.getElementById(t+"_scroll"),de=document.getElementById(t+"_hdr"),Te=document.getElementById(t+"_nav"),ce=document.getElementById(t+"_lp_wrap"),He=document.getElementById(t+"_lp_token"),Pe=document.getElementById(t+"_lp_box"),ke=document.getElementById(t+"_lp"),ee=document.getElementById(t+"_tt"),q=document.getElementById(t+"_popup"),x=document.getElementById(t+"_popup_hdr"),I=document.getElementById(t+"_popup_body");document.body.appendChild(q);let R=null,j=null,V=!0,U=!1,oe=getComputedStyle(D).getPropertyValue("--ll-aspect-ratio").trim(),le=!oe;le&&D.classList.add("ll-fill");let ge=(()=>{if(!oe||/^(unbounded|none|auto)$/i.test(oe))return null;let i=oe.split("/").map(s=>parseFloat(s.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})(),Me=ze,Fe=Re;function Kt(){let i=Q(),s=K().shownLayers.length;if(Me=s>0?Math.max(ze,Math.floor((i-Ie)/s)):ze,!le){Fe=Re;return}let c=N.clientHeight;Fe=k>0&&k*Re<c?Math.floor(c/k):Re}function en(i,s){let c=s?"#bbb":"#555",m=i?` stroke-dasharray="${ve(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${m}/></svg>`}function Y(){ie=null;let i=J(),s=F(),c=r.showGrid?s?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(le){let S=l.clientWidth;D.style.width=S>0?S+"px":"100%",D.style.maxWidth="100%",D.style.maxHeight="",N.style.maxHeight=""}else{D.style.width="",D.style.maxWidth="",N.style.maxHeight="";let S=l.clientWidth||D.clientWidth;if(ge&&S>0){let te=D.offsetHeight-N.offsetHeight,ne=(te>0?te:140)+90;D.style.maxHeight=Math.max(ne,Math.round(S*ge))+"px"}else D.style.maxHeight=""}Kt();let{shownLayers:m}=K(),f=m.length,L=Math.round(Ie+Me*f),M=`${Ie}px repeat(${f}, ${Me}px)`,C=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${M};height:${Rn+6}px;width:${L}px;min-width:${L}px;">`;C+='<div class="ll-corner">token</div>';for(let S of m)C+=`<div class="ll-hdr-cell">${d.layers[S]}</div>`;C+="</div>",de.innerHTML=C;let E=`<div class="ll-grid-inner" style="width:${L}px;min-width:${L}px;">`;for(let S=0;S<k;S++){let W=d.tokens[S],te=_e(W),ne=y(S),re=S===r.selectedRow||ne;E+=`<div class="ll-row" data-rowwrap="${S}">`,re&&(E+='<div class="ll-row-rail"></div>'),E+=`<div class="ll-row-grid${re?" ll-row-sel":""}" data-row="${S}" style="display:grid;grid-template-columns:${M};height:${Fe}px;">`,E+=`<div class="ll-row-label" title="click to pin this position's trajectories">`,ne&&(E+=en(P(S).dash,s)),E+=te?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${re?"font-weight:600;":""}">${at(W)}</span>`,E+="</div>",m.forEach((se,X)=>{let he=d.cells[S][se],xe=he.prob,Je=z!==""&&he.token===z,Tt=st(xe,Je?_n:i,s),bn=Bn(xe,s),xn=xe<.18,vn=r.dimLow&&xn?"opacity:0.55;":"",Ke=_(he.token),yn=Ke?`box-shadow:inset 0 0 0 2px ${Ke};`:"",Et=S===0,St=S===k-1,$t=X===0,Ct=X===f-1,Ee="";Et&&$t?Ee="border-top-left-radius:8px;":Et&&Ct?Ee="border-top-right-radius:8px;":St&&$t?Ee="border-bottom-left-radius:8px;":St&&Ct&&(Ee="border-bottom-right-radius:8px;"),E+=`<div class="ll-cell${Ke?" ll-cell-pinned":""}" data-row="${S}" data-layer="${se}" style="background:${Tt};color:${bn};padding:0 6px;${vn}${c}${yn}${Ee}"><span class="ll-cell-text">${at(he.token)}</span></div>`}),E+="</div></div>"}E+="</div>",N.innerHTML=E}function ue(){let i=J(),s=F(),{stride:c,start:m}=K(),f=r.viewSize,L=f>=u,M=ut(),C=f<=M[0],E='<span class="ll-nav-range-key">layers</span>';L?E+=`all ${u}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):E+=`${m}\u2013${m+f-1}<span class="ll-dim"> / ${u}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let S="";for(let X=0;X<u;X++){let he=H[X]||0,xe=Math.max(8,Math.round(he*92));S+=`<div class="ll-skyline-bar" style="height:${xe}%;background:${st(he,i,s)}"></div>`}let W=m/u*100,te=f/u*100,ne=[];for(let X=0;X<u;X+=8)ne.push(X);ne[ne.length-1]!==u-1&&ne.push(u-1);let re="",se=Math.max(1,u-1);for(let X of ne){let he=X===u-1,xe=X===0,Je=X/se*100;re+=`<span class="ll-nav-tick" style="left:${Je}%;transform:${he?"translateX(-100%)":xe?"translateX(0)":"translateX(-50%)"}">${d.layers[X]}</span>`}Te.innerHTML=`
            <div class="ll-nav-range">${E}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${t}_sky">
                    <div class="ll-skyline-bars">${S}</div>
                    <div class="ll-skyline-win" id="${t}_win" style="left:${W}%;width:${te}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${re}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${m<=0?"disabled":""}>${An}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${m+f>=u?"disabled":""}>${Fn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${C?"disabled":""}>${Nn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${Vn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Wn}</button>
            </div>
        `,ln()}function tn(){let i=document.getElementById(t+"_win");if(!i)return;let s=Math.max(0,u-r.viewSize),c=Math.max(0,Math.min(s,r.viewStart));i.style.left=c/u*100+"%",i.style.width=r.viewSize/u*100+"%"}function ut(){return Array.from(new Set([u,48,32,20,14,10,8])).filter(i=>i<=u&&i>=1).sort((i,s)=>i-s)}function Ne(i){return Math.max(0,Math.min(Math.max(0,u-r.viewSize),i))}let Ve=!1;function mt(){Ve||(Ve=!0,requestAnimationFrame(()=>{Ve=!1,!U&&(Y(),tn())}))}function je(i){let s=Ne(r.viewStart+i);s!==r.viewStart&&(r.viewStart=s,Y(),ue(),pe())}function nn(i){let s=Ne(i);s!==r.viewStart&&(r.viewStart=s,mt())}function ft(i,s){let c=ut(),m=c.findIndex(C=>C>=r.viewSize),f=m===-1?c.length-1:m,L=i<0?Math.max(0,f-1):Math.min(c.length-1,f+1),M=c[L];M!==r.viewSize&&(r.viewSize=M,r.viewStart=Math.max(0,Math.min(u-M,Math.round(s-M/2))),Y(),ue(),pe())}function gt(i){ft(i,r.viewStart+r.viewSize/2)}function on(){r.viewSize=u,r.viewStart=0,Y(),ue(),pe()}let be=null;function ln(){let i=document.getElementById(t+"_sky");if(!i)return;i.addEventListener("pointerdown",c=>{let m=i.getBoundingClientRect(),f=c.clientX-m.left,L=m.width/u,M=Math.max(0,u-r.viewSize),C=Math.max(0,Math.min(M,r.viewStart)),E=C*L,S=(C+r.viewSize)*L,W=C;(f<E||f>S)&&(W=Ne(Math.round(f/L)-Math.floor(r.viewSize/2)),r.viewStart=W,mt()),be={startX:f,startStart:W,layerW:L},i.classList.add("ll-grabbing");try{i.setPointerCapture(c.pointerId)}catch{}}),i.addEventListener("pointermove",c=>{if(!be)return;let m=i.getBoundingClientRect(),L=(c.clientX-m.left-be.startX)/be.layerW;nn(Math.round(be.startStart+L))});let s=c=>{if(be){be=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(c.pointerId)}catch{}ue(),pe()}};i.addEventListener("pointerup",s),i.addEventListener("pointercancel",s),i.addEventListener("wheel",c=>{c.preventDefault();let m=i.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){je(c.deltaX>0?1:-1);return}let f=Math.round((c.clientX-m.left)/m.width*u);ft(c.deltaY<0?-1:1,f)},{passive:!1})}function rn(i,s,c=!1){r.selectedRow=i,r.selectedLayerIdx=s??d.layers.length-1,Y(),Z(),c&&sn(i),pe()}function sn(i){let s=N.querySelector(`[data-rowwrap="${i}"]`);if(!s)return;let c=s.offsetTop-N.clientHeight/2+s.offsetHeight/2;N.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function Ue(){requestAnimationFrame(()=>requestAnimationFrame(()=>{U||(N.scrollTop=N.scrollHeight)}))}let an=.45,dn=120,cn=360;function Ge(){let i;if(ge)i=(l.clientWidth||D.clientWidth)*ge;else{let c=D.clientHeight;i=c>0?c:(D.clientWidth||900)*.6}let s=Math.round(i*an);Pe.style.height=Math.max(dn,Math.min(cn,s))+"px"}function bt(i){return i+"\xB7"+(_e(d.tokens[i])?"bos":Le(d.tokens[i]))}function Z(i){let s=r.pinnedRows.length>0?r.pinnedRows:r.selectedRow!==null?[r.selectedRow]:[],c=s.length>1,m=[];for(let L of s){let M=P(L);for(let C of r.pinned){let E=B(L,C.token);if(!E)continue;let S=Le(C.token);c&&(S+=" ("+bt(L)+")"),m.push({values:E.map(W=>W??null),label:S,color:C.color,dashPattern:M.dash||void 0,removable:!1})}}let f=m.length===0&&!i;if(f)ce.classList.add("ll-hidden");else{ce.classList.remove("ll-hidden"),Ge(),He.textContent=r.pinnedRows.length>1?r.pinnedRows.length+" positions":s.length===1?"position "+bt(s[0]):"";let L={lines:[],richLines:m,xLabels:d.layers},M={darkMode:F(),mode:"probability",autoScale:!0,legendPosition:m.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};R?(R.setData(L),R.setOptions(M)):(ke.style.minHeight="0",R=new me(ke,L,M)),i?R.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):R.setOverlay?.(null)}le&&f!==V?(V=f,requestAnimationFrame(()=>{U||(Y(),Ue())})):V=f}function pn(i,s,c,m){let f=d.cells[i]?.[s];if(!f)return;let L=J(),M=_e(d.tokens[i])?"bos":Le(d.tokens[i]);ee.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${st(f.prob,L,F())}"></span><span class="ll-tt-token">${ve(Le(f.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(f.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[s]} / ${d.layers[u-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${ve(M)}</span></div>`,ee.classList.add("ll-visible");let C=D.getBoundingClientRect(),E=ee.offsetWidth||220,S=ee.offsetHeight||90,W=c-C.left+16;c+E+24>window.innerWidth-8&&(W=c-C.left-E-12);let te=m-C.top-50;W=Math.max(6,Math.min(W,C.width-E-6)),te=Math.max(6,Math.min(te,C.height-S-6)),ee.style.left=W+"px",ee.style.top=te+"px"}function qe(){ee.classList.remove("ll-visible")}function hn(){Ye(),j=document.createElement("div"),j.style.cssText="position:fixed;inset:0;z-index:49;",j.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),vt()}),document.body.appendChild(j)}function Ye(){j&&(j.remove(),j=null)}function un(i,s,c){if(!d.cells[i]?.[s])return;let f=c.getBoundingClientRect();r.openPopup={row:i,layer:s},r.selectedRow=i,r.selectedLayerIdx=s;let L=_e(d.tokens[i])?"bos":Le(d.tokens[i]);x.innerHTML=`Layer <b>${d.layers[s]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${ve(L)}</code></div>`,xt(i,s),Y(),Z(),q.style.visibility="hidden",q.classList.add("ll-visible"),mn(f),q.style.visibility="",hn(),pe()}function xt(i,s){let c=d.cells[i][s],m="";c.topk.forEach((f,L)=>{let M=_(f.token),C=M?`background:${M}22;border-left-color:${M};`:"";m+=`<div class="ll-topk${M?" ll-topk-pinned":""}" data-ki="${L}" style="${C}" title="click to track trajectory"><span class="ll-topk-tok">${at(f.token)}</span><span class="ll-topk-prob">${(f.prob*100).toFixed(1)}%</span></div>`}),I.innerHTML=m,I.querySelectorAll(".ll-topk").forEach(f=>{let L=parseInt(f.dataset.ki),M=c.topk[L];f.addEventListener("mouseenter",()=>{if(V)return;let C=B(i,M.token);C&&Z({values:C.map(E=>E??null),label:Le(M.token),color:"#999"})}),f.addEventListener("mouseleave",()=>{V||Z()}),f.addEventListener("click",C=>{C.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&($(M.token),Y(),xt(i,s),Z(),pe())})})}function mn(i){let m=D.getBoundingClientRect(),f=Math.max(140,m.width-2*8),L=Math.max(120,m.height-2*8);q.style.maxWidth=f+"px",q.style.maxHeight=L+"px";let M=q.offsetWidth||220,C=q.offsetHeight||160,E=m.left+8,S=m.right-8-M,W=m.top+8,te=m.bottom-8-C,ne=[{left:i.right+6,top:i.top},{left:i.left-6-M,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-C}],re=ne[0];for(let se of ne)if(se.left>=E&&se.left<=S&&se.top>=W&&se.top<=te){re=se;break}q.style.left=Math.max(E,Math.min(re.left,Math.max(E,S)))+"px",q.style.top=Math.max(W,Math.min(re.top,Math.max(W,te)))+"px"}function vt(){r.openPopup=null,q.classList.remove("ll-visible"),Ye(),Y(),Z()}document.getElementById(t+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),vt()});let ie=null;function fn(i){if(V)return;let s=parseInt(i.dataset.row),c=parseInt(i.dataset.layer),m=d.cells[s]?.[c]?.token,f=m!=null?B(s,m):null;f?Z({values:f.map(L=>L??null),label:Le(m),color:"#999"}):Z()}function yt(){V||Z()}N.addEventListener("mousemove",i=>{let s=i.target.closest(".ll-cell");if(!s){ie&&(ie.classList.remove("ll-cell-hover"),ie=null,yt()),qe();return}ie!==s&&(ie&&ie.classList.remove("ll-cell-hover"),ie=s,ie.classList.add("ll-cell-hover"),fn(s));let c=parseInt(s.dataset.row),m=parseInt(s.dataset.layer);pn(c,m,i.clientX,i.clientY)}),N.addEventListener("mouseleave",()=>{ie&&(ie.classList.remove("ll-cell-hover"),ie=null,yt()),qe()}),N.addEventListener("click",i=>{if(!(window.getSelection()?.isCollapsed??!0))return;let s=i.target,c=s.closest(".ll-row-grid");if(!c)return;let m=parseInt(c.dataset.row);if(s.closest(".ll-row-label")){A(m),Y(),Z(),pe();return}let f=s.closest(".ll-cell");if(f){let L=parseInt(f.dataset.layer);if(i.shiftKey){let M=d.cells[m]?.[L]?.token;M&&($(M),Y(),Z(),pe());return}qe(),un(m,L,f)}}),N.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let s=r.selectedRow??-1,c=i.key==="ArrowDown"?Math.min(k-1,s+1):Math.max(0,s-1);rn(c,void 0,!0)}),Te.addEventListener("click",i=>{let s=i.target.closest("[data-nav]");if(!s||s.hasAttribute("disabled"))return;let c=s.dataset.nav;c==="panL"?je(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?je(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?gt(-1):c==="zoomOut"?gt(1):c==="reset"&&on()});function Xe(){Y(),ue(),Z(),requestAnimationFrame(()=>{U||(Y(),ue(),V||Ge())})}function Qe(){nt(D,F(),q)}function pe(){T("stateChange",Mt())}Xe(),Ue(),Qe();let Ze=0,wt=l?.clientWidth??0,Lt=l?.clientHeight??0,kt=new ResizeObserver(()=>{let i=l?.clientWidth??0,s=l?.clientHeight??0;i===wt&&s===Lt||(wt=i,Lt=s,!Ze&&(Ze=requestAnimationFrame(()=>{Ze=0,!U&&(Y(),V||Ge())})))});l&&kt.observe(l);let gn=De(l,i=>{r.darkModeOverride===null&&(nt(D,i,q),Y(),ue(),Z())});function Mt(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,selectedLayer:r.selectedLayerIdx,viewStart:r.viewStart,viewSize:r.viewSize,colorIndex:r.colorIndex,pinnedGroups:r.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:r.pinnedRows.map(i=>({pos:i,line:P(i).name})),darkMode:r.darkModeOverride}}return{widget:{getState:Mt,setState:i=>{i.ramp!==void 0&&(r.ramp=i.ramp),i.showGrid!==void 0&&(r.showGrid=i.showGrid),i.dimLowProb!==void 0&&(r.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(r.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(r.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(r.viewStart=i.viewStart),i.viewSize!==void 0&&(r.viewSize=i.viewSize),i.colorIndex!==void 0&&(r.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(r.pinned=g(i.pinnedGroups)),i.pinnedRows!==void 0&&(r.pinnedRows=i.pinnedRows.map(s=>s.pos).filter(s=>typeof s=="number")),i.darkMode!==void 0&&(r.darkModeOverride=i.darkMode),w(),Qe(),Xe()},setData:i=>{h=tt(i),d=h.normalized,p=h.v2Data,r.selectedRow=null,r.selectedLayerIdx=null,r.pinned=[],r.pinnedRows=[],r.colorIndex=0,w(),Xe(),Ue()},setTitle:()=>{},setThemeMode:i=>{r.darkModeOverride=!!i,Qe(),Y(),ue(),Z()},getThemeMode:()=>F(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let i of p.tracked)for(let s in i){let c=i[s];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,s)=>{(b[i]||(b[i]=[])).push(s)},off:(i,s)=>{b[i]=(b[i]||[]).filter(c=>c!==s)},destroy:()=>{U=!0,gn(),kt?.disconnect(),Ye(),q.remove(),R&&(R.destroy(),R=null),l&&(l.innerHTML="")}},styleEl:a}}var Wn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',An='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Fn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Nn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Vn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Oe=class{constructor(e,n,t){this.widget=null;this.styleEl=null;let l=Nt(e,n,t);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,n){this.widget?.on(e,n)}off(e,n){this.widget?.off(e,n)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function $e(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function Be(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+$e(o.slice(1)):$e(o)}function jn(o){let e=`#${o}`;return`
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
    `}function Vt(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=jn(o),document.head.appendChild(e),e}var Un=0,We=class{constructor(e,n,t={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.container=e,this.data=n,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,...t},this.uid="hmx_"+ ++Un+"_"+Date.now().toString(36),this.styleEl=Vt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render(),this.setupResponsive()}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let n=this.container?.clientWidth??0;return n>0?n-34:720}resolveWindow(){let e=this.data.columns.length,n=this.options.columnWindow;if(!n)return{start:0,size:e};let t=Math.max(1,Math.min(n.size,e));return{start:Math.max(0,Math.min(n.start,e-t)),size:t}}maxColsFit(){let e=this.options,n=e.minColumnWidth??48,t=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/n),h=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(h,l))}resolveVisibleColumns(){let e=this.options,{start:n,size:t}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let r=[];for(let b=0;b<t;b++)r.push(n+b);return r}let l=this.maxColsFit();if(t<=l){let r=[];for(let b=0;b<t;b++)r.push(n+b);return r}let h=!!e.alwaysShowLastColumn,d=Math.max(1,l-(h?1:0)),p=Math.ceil(t/d),a=[];for(let r=n;r<n+t;r+=p)a.push(r);let g=n+t-1;return h&&a[a.length-1]!==g&&a.push(g),a}resolveCellWidth(e){let n=this.options;if(n.columnSizing==="fit"&&e>0){let t=n.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/e);return Math.max(n.minColumnWidth??1,l)}return n.cellWidth??48}resolveRowHeight(e){let n=this.options,t=n.cellHeight??28;if(n.rowSizing!=="fill"||e<=0)return t;let l=this.scrollEl.clientHeight;return e*t<l?Math.floor(l/e):t}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,n=!!e.darkMode;this.root.classList.toggle("hmx-dark",n),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let t=e.rowHeaderWidth??100,l=e.headerHeight??26,h=this.data.columns,d=this.resolveVisibleColumns(),p=d.length,a=this.resolveCellWidth(p),g=this.data.rows,r=e.maxRows!=null?Math.min(g.length,e.maxRows):g.length,b=this.resolveRowHeight(r),T=t+a*p,u=`${t}px repeat(${p}, ${a}px)`,k=e.showGrid?n?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",H=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${u};height:${l}px;width:${T}px;min-width:${T}px;">`;H+=`<div class="hmx-corner">${$e(e.cornerLabel??"")}</div>`;for(let w=0;w<p;w++)H+=`<div class="hmx-col">${Be(h[d[w]].label)}</div>`;H+="</div>",this.hdrEl.innerHTML=H;let z=`<div class="hmx-grid-inner" style="width:${T}px;min-width:${T}px;">`;for(let w=0;w<r;w++){let _=g[w].label,$=e.rowClassName?.(w),B=e.renderRowLabel?e.renderRowLabel(w):Be(_);z+=`<div class="hmx-row${$?" "+$:""}" data-rowwrap="${w}">`,z+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${u};height:${b}px;">`,z+=`<div class="hmx-rowlabel" data-row="${w}" title="${$e(_)}"><span class="hmx-cell-text">${B}</span></div>`;for(let P=0;P<p;P++){let y=d[P],v=this.data.getCellValue(w,y),O=v.highlighted&&v.highlightColor?`box-shadow:inset 0 0 0 2px ${v.highlightColor};`:"",A=v.bold?"font-weight:bold;":"",J=v.opacity!=null&&v.opacity<1?`opacity:${v.opacity};`:"",F=w===0,Q=w===r-1,ae=P===0,K=P===p-1,D="";F&&ae?D="border-top-left-radius:8px;":F&&K?D="border-top-right-radius:8px;":Q&&ae?D="border-bottom-left-radius:8px;":Q&&K&&(D="border-bottom-right-radius:8px;"),z+=`<div class="hmx-cell${v.className?" "+v.className:""}" data-row="${w}" data-col="${y}" style="background:${v.color};color:${v.textColor};padding:0 6px;${J}${k}${O}${A}${D}"><span class="hmx-cell-text">${Be(v.text)}</span></div>`}z+="</div></div>"}z+="</div>",this.scrollEl.innerHTML=z,e.onVisibleColumnsChange&&!Gn(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let n=e.target.closest(".hmx-cell");if(!n){this.clearHover();return}this.hoverCell!==n&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=n,n.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(n.dataset.row),parseInt(n.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let n=e.target,t=n.closest(".hmx-rowlabel");if(t){this.options.onRowHeaderClick?.(parseInt(t.dataset.row),e);return}let l=n.closest(".hmx-cell");l&&this.options.onCellClick?.(parseInt(l.dataset.row),parseInt(l.dataset.col),e)})}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.render()}setOptions(e){let n=this.isResponsive();this.options={...this.options,...e},this.render(),!n&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let n=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!n)return;let t=n.offsetTop-this.scrollEl.clientHeight/2+n.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,t),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function Gn(o,e){if(o.length!==e.length)return!1;for(let n=0;n<o.length;n++)if(o[n]!==e[n])return!1;return!0}var qn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Yn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Xn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',dt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function ct(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function jt(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${dt};`;let n={isOpen:!1,searchQuery:""},t=Gt(e,o,n);return e.__tokenSelectorCleanup=t,e.__tokenSelectorState=n,e}function Ce(o,e){let n=o.__tokenSelectorCleanup,t=o.__tokenSelectorState;n&&n();let l={isOpen:t?.isOpen??!1,searchQuery:t?.searchQuery??""},h=Gt(o,e,l);o.__tokenSelectorCleanup=h,o.__tokenSelectorState=l}function Ut(o){let e=o.__tokenSelectorCleanup;e&&e()}function Gt(o,e,n){o.innerHTML="";let t=ct(e.darkMode),{allLabels:l,selectedIndices:h,defaultIndices:d,onChange:p}=e,a=document.createElement("div");a.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let g=document.createElement("span");if(g.style.cssText=`font-size:11px;color:${t.fgMuted};`,g.textContent=`Tokens (${l.length})`,a.appendChild(g),!pt(h,d)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${t.fgMuted};font-family:${dt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${qn} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=t.fg}),y.addEventListener("mouseleave",()=>{y.style.color=t.fgMuted}),y.addEventListener("click",()=>{p(Array.from(d))}),a.appendChild(y)}o.appendChild(a);let b=document.createElement("div");b.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.inputBg};cursor:text;min-height:30px;`,b.addEventListener("click",()=>{$(),u.focus()});let T=Array.from(h).sort((y,v)=>y-v);for(let y of T){let v=Qn(y,l[y],e.darkMode,()=>{let O=new Set(h);O.delete(y),p(Array.from(O))});b.appendChild(v)}let u=document.createElement("input");u.type="text",u.placeholder=T.length===0?"Search tokens...":"",u.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${t.fg};font-family:${dt};min-width:60px;flex:1;padding:2px 0;`,u.addEventListener("input",()=>{n.searchQuery=u.value,_()}),u.addEventListener("focus",()=>$()),b.appendChild(u);let k=document.createElement("span");k.style.cssText=`display:flex;align-items:center;color:${t.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,k.innerHTML=Xn,k.addEventListener("click",y=>{y.stopPropagation(),n.isOpen?B():$()}),b.appendChild(k),o.appendChild(b);let H=document.createElement("div");H.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${t.bg};border:1px solid ${t.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let z=document.createElement("div");z.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",H.appendChild(z);let w=document.createElement("div");w.style.cssText=`padding:8px 12px;font-size:12px;color:${t.fgMuted};display:none;text-align:center;`,w.textContent="No tokens found",H.appendChild(w),o.appendChild(H);function _(){z.innerHTML="";let y=n.searchQuery.toLowerCase(),v=0;for(let O=0;O<l.length;O++){let A=l[O];if(y&&!A.toLowerCase().includes(y))continue;v++;let J=h.has(O),F=Zn(O,A,J,e.darkMode,()=>{let Q=new Set(h);J?Q.delete(O):Q.add(O),p(Array.from(Q))});z.appendChild(F)}w.style.display=v===0?"":"none"}function $(){n.isOpen||(n.isOpen=!0,H.style.display="",k.style.transform="rotate(180deg)",_())}function B(){n.isOpen&&(n.isOpen=!1,H.style.display="none",k.style.transform="",u.value="",n.searchQuery="")}function P(y){o.contains(y.target)||B()}return document.addEventListener("mousedown",P),n.isOpen&&(H.style.display="",k.style.transform="rotate(180deg)",u.value=n.searchQuery,_(),requestAnimationFrame(()=>{u.isConnected&&u.focus()})),()=>{document.removeEventListener("mousedown",P)}}function Qn(o,e,n,t){let l=ct(n),h=G[o%G.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=l.chipHoverBg,d.style.borderColor=l.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=l.chipBg,d.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${h};`,d.appendChild(p);let a=document.createElement("span");a.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,a.innerHTML=we(e),a.title=e,d.appendChild(a);let g=document.createElement("button");return g.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,g.innerHTML=Yn,g.addEventListener("mouseenter",()=>{g.style.color=l.badgeText}),g.addEventListener("mouseleave",()=>{g.style.color=l.fgMuted}),g.addEventListener("click",r=>{r.stopPropagation(),t()}),d.appendChild(g),d}function Zn(o,e,n,t,l){let h=ct(t),d=G[o%G.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=h.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",b=>{b.stopPropagation(),l()});let a=document.createElement("span");a.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${n?d:"transparent"};border:1.5px solid ${n?d:h.fgMuted};`,p.appendChild(a);let g=document.createElement("span");g.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${n?h.fg:h.fgMuted};`,g.innerHTML=we(e),g.title=e,p.appendChild(g);let r=o===0?"source pred":o===1?"target pred":null;if(r){let b=document.createElement("span");b.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${h.badgeBg};color:${h.badgeText};border:1px solid ${h.badgeBorder};`,b.textContent=r,p.appendChild(b)}if(n){let b=document.createElement("span");b.style.cssText=`flex-shrink:0;font-size:10px;color:${h.selectedText};`,b.textContent="selected",p.appendChild(b)}return p}function pt(o,e){if(o.size!==e.size)return!1;for(let n of o)if(!e.has(n))return!1;return!0}var Jn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Kn=["probability","prob_diff","rank"],Ae=class{constructor(e,n,t={}){this.modeButtons=new Map;this.container=e,this.allData=n,this.mode=t.mode??"probability",this.darkMode=t.darkMode??!1,this.transparentBackground=t.transparentBackground??!1,this.title=t.title,this.onTokenSelectionChange=t.onTokenSelectionChange,this.onModeChange=t.onModeChange;let l=n.tokenLabels?.length??n.lines?.length??0,h=t.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,a)=>a);this.defaultTokens=new Set(h),this.selectedTokens=new Set(t.selectedTokens??h),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=jt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new me(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let n of Kn){let t=document.createElement("button");t.textContent=Jn[n],this.applyModeButtonStyles(t,n===this.mode),t.addEventListener("click",()=>this.setMode(n)),t.addEventListener("mouseenter",()=>{n!==this.mode&&(t.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),t.addEventListener("mouseleave",()=>{n!==this.mode&&(t.style.background="transparent")}),e.appendChild(t),this.modeButtons.set(n,t)}return e}applyModeBarStyles(e){let n=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${n};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,n){let t=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${n?l:"transparent"};color:${n?"#fff":t};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,n]of this.modeButtons)this.applyModeButtonStyles(n,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),n=this.allData.tokenLabels??[],t=Array.from(this.selectedTokens).sort((d,p)=>d-p),l=this.mode==="rank";return{richLines:t.filter(d=>d<e.length).map(d=>({values:l?e[d].map(p=>p+1):e[d],label:n[d]??`Token ${d}`,color:G[d%G.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let n=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,n)},(l,h)=>h));let t=new Set([...this.selectedTokens].filter(l=>l<n));this.selectedTokens=t.size>0?t:new Set(this.defaultTokens),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let n=this.getModeLines().length,t=new Set(e.filter(l=>l<n));pt(t,this.selectedTokens)||(this.selectedTokens=t,Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Ut(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function eo(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function ht(o,e,n){let t=eo(o);if(!t)return null;let l=e(t);if(n===void 0){let h=De(t,p=>l.setThemeMode(p)),d=l.destroy.bind(l);l.destroy=()=>{h(),d()}}return l}function Xt(o,e,n){return new Oe(o,e,n)}function Qt(o,e,n){return ht(o,t=>new me(t,e,{darkMode:fe(t),...n}),n?.darkMode)}var qt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function to(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Yt(o,e){if(typeof o.getCellValue=="function")return o;let n=o,t=n.values??[],l=n.texts,h=n.rowLabels??t.map((w,_)=>String(_)),d=n.colLabels??(t[0]??[]).map((w,_)=>String(_)),p=n.ramp??"purple",a=qt[p]??(p[0]==="#"?p:qt.purple),[g,r,b]=to(a),[T,u]=n.valueDomain??[0,1],k=u-T,H=e?38:255,z=w=>Math.max(0,Math.min(1,w));return{rows:h.map(w=>({label:w})),columns:d.map(w=>({label:w,value:0})),getCellValue:(w,_)=>{let $=t[w]?.[_]??0,B=z(k>0?($-T)/k:$),P=v=>Math.round(H+(v-H)*B);return{text:l?l[w]?.[_]??"":Number.isInteger($)?String($):$.toFixed(2),value:$,color:`rgb(${P(g)}, ${P(r)}, ${P(b)})`,textColor:B>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Zt(o,e,n){return ht(o,t=>{let l=n?.darkMode??fe(t),h=new We(t,Yt(e,l),{darkMode:l,...n}),d=h.setThemeMode.bind(h);return h.setThemeMode=p=>{h.setData(Yt(e,p)),d(p)},h},n?.darkMode)}function Jt(o,e,n){return ht(o,t=>new Ae(t,e,{darkMode:fe(t),...n}),n?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Xt,window.LinePlotWidget=Qt,window.HeatmapTableWidget=Zt,window.ActivationPatchingWidget=Jt);return En(no);})();
//# sourceMappingURL=charts.js.map
