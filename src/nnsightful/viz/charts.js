"use strict";var InterpTools=(()=>{var et=Object.defineProperty;var wn=Object.getOwnPropertyDescriptor;var Ln=Object.getOwnPropertyNames;var kn=Object.prototype.hasOwnProperty;var Mn=(t,e)=>{for(var i in e)et(t,i,{get:e[i],enumerable:!0})},Tn=(t,e,i,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Ln(e))!kn.call(t,l)&&l!==i&&et(t,l,{get:()=>e[l],enumerable:!(n=wn(e,l))||n.enumerable});return t};var En=t=>Tn(et({},"__esModule",{value:!0}),t);var to={};Mn(to,{ActivationPatchingWidget:()=>Jt,HeatmapTableWidget:()=>Zt,LinePlotWidget:()=>Qt,LogitLensWidget:()=>Xt});function tt(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let i=t.layers.length,n=t.input.length,l=[];for(let d=0;d<n;d++){let p=[],a=t.tracked[d];for(let g=0;g<i;g++){let r=t.topk[g][d],x=[];for(let h=0;h<r.length;h++){let w=r[h],k=a[w]||[],A=k[g]||0;x.push({token:w,prob:A,trajectory:k})}let $=x[0]||{token:"",prob:0,trajectory:[]};p.push({token:$.token,prob:$.prob,trajectory:$.trajectory,topk:x})}l.push(p)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function Ht(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function xe(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Sn(t){let e=`#${t}`;return`
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

        /* Flex roles for the card's stacked regions (see #${t} above).
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
        #${t}_popup {
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
        #${t}_popup.ll-visible { display: flex; }
        #${t}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${t}_popup .ll-lead-space { color: #3b82f6; }
        #${t}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${t}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${t}_popup .ll-popup-header {
            flex: 0 0 auto;
            font-weight: 600; font-size: 13px; padding-right: 16px;
            margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--p-line);
        }
        #${t}_popup .ll-popup-sub {
            font-weight: 400; font-size: 11.5px; color: var(--p-text-2); margin-top: 3px;
        }
        #${t}_popup .ll-popup-sub code {
            font-family: var(--p-mono); background: var(--p-code);
            padding: 1px 5px; border-radius: 3px;
        }
        #${t}_popup .ll-popup-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
        #${t}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${t}_popup .ll-topk:hover { background: var(--p-hover); }
        #${t}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            -webkit-user-select: text; user-select: text;
        }
        #${t}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function Pt(t){let e=document.createElement("style");return e.textContent=Sn(t),document.head.appendChild(e),e}function nt(t,e,...i){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of i)l&&n(l)}var Se=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],ot=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var G=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ve(t){return t.richLines&&t.richLines.length>0?t.richLines.map((i,n)=>({values:i.values,label:i.label??`Line ${n+1}`,color:i.color,dashPattern:i.dashPattern,isOverlay:i.isOverlay,removable:i.removable})):(t.lines??[]).map((i,n)=>({values:i,label:t.labels?.[n]??`Line ${n+1}`}))}function ye(t){if(!t)return"";let e=[],i=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),i=1);let n="";for(;i<t.length;i++){let l=t[i];l===`
`?(n&&(e.push(Dt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(Dt(n)),e.join("")}function Dt(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function $n(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let i of e)if(t<=i)return i;return 1}function It(t,e,i){let n=ve(t),l=n.length>0?n[0].values.length:i?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",d=e.minValue,p=e.maxValue;if(d===void 0||p===void 0||e.autoScale){let a=[];for(let x of n)if(!x.isOverlay)for(let $ of x.values)$!==null&&a.push($);if(i)for(let x of i.values)x!==null&&a.push(x);if(a.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let g=1/0,r=-1/0;for(let x of a)x<g&&(g=x),x>r&&(r=x);if(e.centerYAxisAtZero){let $=Math.max(Math.abs(g),Math.abs(r))*1.1;d=-$,p=$}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(g))),p===void 0||e.autoScale){let x=Math.log(Math.max(1,g)),$=Math.log(Math.max(1,r)),h=$+.15*Math.max(1,$-x);p=Math.ceil(Math.exp(h))}}else d===void 0&&(d=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(g)):Math.floor(g*.9)),(p===void 0||e.autoScale)&&(u==="rank"?p=Math.ceil(r*1.1):u==="probability"?p=e.autoScale?$n(Math.max(r,.001)):Math.min(r*1.1,1):p=r*1.1)}return{numLayers:l,minValue:d,maxValue:p,numLines:n.length}}function Rt(t,e,i,n,l,u,d,p){let a=t.getContext("2d"),g=e.getBoundingClientRect(),r=window.devicePixelRatio||1;t.width=g.width*r,t.height=g.height*r,t.style.width=`${g.width}px`,t.style.height=`${g.height}px`,a.scale(r,r);let x=g.width,$=g.height,h=n.darkMode??!1,w=n.title,k=n.mode||"probability",A=n.invertYAxis??!1,M=n.centerYAxisAtZero??!1,P=n.logScale??!1,C=n.xAxisLabel||"Layer",B=n.yAxisLabel||"Probability",D=n.xRangeStart??0;D>=l.numLayers-1&&(console.warn(`xRangeStart (${D}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),D=0);let v=n.showDataPoints??!0,y={top:w?48:24,right:24,bottom:56,left:72},_=x-y.left-y.right,z=$-y.top-y.bottom,ne={margin:y,chartWidth:_,chartHeight:z,width:x,height:$},N={background:h?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:h?"#52525b":"#a1a1aa",grid:h?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:h?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:h?"#e4e4e7":"#27272a"};n.transparentBackground?a.clearRect(0,0,x,$):(a.fillStyle=N.background,a.fillRect(0,0,x,$)),w&&(a.fillStyle=N.titleText,a.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="left",a.fillText(w,y.left,28));let oe=l.numLayers-1-D,Le=b=>oe<=0?y.left+_/2:y.left+(b-D)/oe*_,le=P?Math.log(Math.max(1,l.minValue)):0,O=P?Math.log(Math.max(1,l.maxValue)):0,F=b=>{let I;if(P){let R=Math.log(Math.max(1,b));I=O-le>0?(R-le)/(O-le):.5}else I=(b-l.minValue)/(l.maxValue-l.minValue);return A?y.top+I*z:y.top+z-I*z};a.setLineDash([4,4]),a.strokeStyle=N.grid,a.lineWidth=1;let ae=[],Te=l.maxValue-l.minValue,de=5;if(P){let b=new Set;for(let V=0;V<de;V++){let j=le+V/(de-1)*(O-le),U=Math.round(Math.exp(j));b.has(U)||(b.add(U),ae.push(U))}let I=Math.round(Math.exp(le)),R=Math.round(Math.exp(O));b.has(I)||ae.unshift(I),b.has(R)||ae.push(R)}else if(k==="rank")for(let b=0;b<de;b++)ae.push(Math.round(l.minValue+b/(de-1)*Te));else for(let b=0;b<de;b++)ae.push(l.minValue+b/(de-1)*Te);if(ae.forEach(b=>{let I=F(b);a.beginPath(),a.moveTo(y.left,I),a.lineTo(y.left+_,I),a.stroke()}),a.setLineDash([]),M){let b=F(0);a.beginPath(),a.strokeStyle=h?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",a.lineWidth=1.5,a.moveTo(y.left,b),a.lineTo(y.left+_,b),a.stroke(),a.lineWidth=1}a.fillStyle=N.text,a.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="right",a.textBaseline="middle",ae.forEach(b=>{let I=F(b),R;k==="probability"?R=b.toFixed(2):k==="prob_diff"?R=b>=0?`+${b.toFixed(2)}`:b.toFixed(2):R=Math.round(b).toString(),a.fillText(R,y.left-16,I)}),a.textAlign="center",a.textBaseline="top";let He=i.xLabels&&i.xLabels.length>0,Pe=Math.max(1,Math.ceil(l.numLayers/8));for(let b=0;b<l.numLayers;b+=Pe){let I=Le(b);if(I<y.left-5||I>y.left+_+5)continue;let R=He?String(i.xLabels[b]??b):b.toString();a.fillText(R,I,y.top+z+12)}if((l.numLayers-1)%Pe!==0){let b=He?String(i.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();a.fillText(b,Le(l.numLayers-1),y.top+z+12)}a.strokeStyle=h?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",a.lineWidth=1.5,a.beginPath(),a.moveTo(y.left,y.top),a.lineTo(y.left,y.top+z),a.lineTo(y.left+_,y.top+z),a.stroke(),a.fillStyle=N.textMuted,a.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="center",a.textBaseline="top",a.fillText(C.toUpperCase(),y.left+_/2,$-16),a.save(),a.translate(14,y.top+z/2),a.rotate(-Math.PI/2),a.textAlign="center",a.textBaseline="top",a.fillText(B.toUpperCase(),0,0),a.restore();let ke=ve(i);function Z(b,I,R,V,j){a.beginPath(),a.strokeStyle=I,a.lineWidth=R,j!==void 0&&(a.globalAlpha=j),V?a.setLineDash(V.split(",").map(Number)):a.setLineDash([]);let U=!1;for(let ee=0;ee<b.length;ee++){let ie=b[ee];if(ie===null){U=!1;continue}let fe=Le(ee),Me=F(ie);U?a.lineTo(fe,Me):(a.moveTo(fe,Me),U=!0)}a.stroke(),a.setLineDash([]),j!==void 0&&(a.globalAlpha=1)}let q=h?"#3f3f46":"#d4d4d8";if(a.lineCap="round",a.lineJoin="round",ke.forEach((b,I)=>{!u.has(I)||b.isOverlay||Z(b.values,q,2,void 0,.35)}),ke.forEach((b,I)=>{if(u.has(I)||b.isOverlay)return;let R=b.color??G[I%G.length];Z(b.values,R,4,b.dashPattern,.15),Z(b.values,R,2,b.dashPattern),v&&b.values.forEach((V,j)=>{if(V===null)return;let U=Le(j),ee=F(V),ie=d?.lineIdx===I&&d?.layerIdx===j;a.beginPath(),a.strokeStyle=R,a.lineWidth=ie?2:1.5,a.arc(U,ee,ie?5:3.5,0,Math.PI*2),a.stroke(),a.beginPath(),a.fillStyle=h?"#18181b":"#ffffff",a.arc(U,ee,ie?3.5:2.5,0,Math.PI*2),a.fill()})}),ke.forEach((b,I)=>{if(!b.isOverlay||u.has(I))return;let R=b.color??"#999";Z(b.values,R,1.5,b.dashPattern??"4,2",.7)}),p){let b=p.color??"#999";Z(p.values,b,1.5,p.dashPattern??"4,2",.7)}return ne}function _t(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function zt(t,e,i,n,l,u,d,p,a){let{margin:g,chartWidth:r,chartHeight:x}=l,$=n.xRangeStart??0,h=d-1-$,w=n.logScale?Math.log(Math.max(1,p)):0,k=n.logScale?Math.log(Math.max(1,a)):0;if(t<g.left||t>g.left+r||e<g.top||e>g.top+x)return null;let A=ve(i),M=null,P=1/0,C=20;for(let B=0;B<A.length;B++){if(u.has(B))continue;let D=A[B];if(!D.isOverlay)for(let v=0;v<D.values.length;v++){let y=D.values[v];if(y===null)continue;let _=h<=0?g.left+r/2:g.left+(v-$)/h*r,z;if(n.logScale){let oe=Math.log(Math.max(1,y));z=k-w>0?(oe-w)/(k-w):.5}else z=(y-p)/(a-p);let ne=n.invertYAxis?g.top+z*x:g.top+x-z*x,N=Math.sqrt((t-_)**2+(e-ne)**2);N<P&&N<C&&(P=N,M={visible:!0,x:_,y:ne,lineIdx:B,layerIdx:v,value:y,label:D.label,color:D.color??G[B%G.length]})}}return M}function it(t,e,i,n,l,u,d){if(!e){t.style.opacity="0";return}let p=n?"#27272a":"#fff",a=n?"#3f3f46":"#e4e4e7",g=n?"#fafafa":"#18181b",r=n?"#a1a1aa":"#71717a",$=e.x>i/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${$},-50%);`;let h=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
        <div style="background:${p};border:1px solid ${a};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${g};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${ye(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${r}">${u??"Layer"}</span>
                    <span style="font-weight:500;color:${g}">${h}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${r}">Value</span>
                    <span style="font-weight:500;color:${g}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Cn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Hn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Pn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Bt(t){let e=document.createElement("div");return Ot(e,t),e}function Ot(t,e){let i=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${i};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function At(t,e,i,n,l,u){Ot(t,n),t.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",a=n?"#a1a1aa":"#71717a",g=n?"#3f3f46":"#d4d4d8",r="rgba(161,161,170,0.3)",x=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",$=u?ve(u):[];e.forEach((h,w)=>{let k=$[w];if(k?.isOverlay)return;let A=k?.color??G[w%G.length],M=i.has(w),P=k?.removable??!1,C=document.createElement("button");C.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${M?"0.5":"1"};`,C.addEventListener("mouseenter",()=>{C.style.background=x}),C.addEventListener("mouseleave",()=>{C.style.background="transparent"}),C.addEventListener("click",()=>l.onToggle(w));let B=document.createElement("span");B.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${M?r:A};background:${M?g:"transparent"};`,C.appendChild(B);let D=document.createElement("span");if(D.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${M?p:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,D.title=h,D.innerHTML=ye(h),C.appendChild(D),P&&l.onRemove){let v=document.createElement("span");v.style.cssText=`margin-left:auto;cursor:pointer;color:${a};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,v.innerHTML=Pn,v.title="Remove",v.addEventListener("click",y=>{y.stopPropagation(),l.onRemove(w)}),C.appendChild(v),C.addEventListener("mouseenter",()=>{v.style.opacity="0.6"}),C.addEventListener("mouseleave",()=>{v.style.opacity="0"})}else{let v=document.createElement("span");v.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${a};opacity:${M?"0.6":"0"};display:flex;align-items:center;`,v.innerHTML=M?Hn:Cn,C.appendChild(v),M||(C.addEventListener("mouseenter",()=>{v.style.opacity="0.4"}),C.addEventListener("mouseleave",()=>{v.style.opacity="0"}))}t.appendChild(C)})}var ue=class{constructor(e,i,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let i=this.canvas.getBoundingClientRect(),n=e.clientX-i.left,l=e.clientY-i.top;this.tooltip=zt(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),it(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,it(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=i,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=_t(this.chartContainer),this.legendEl=Bt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let d=Math.round(u.contentRect.width),p=Math.round(u.contentRect.height);d===this.lastWidth&&p===this.lastHeight||(this.lastWidth=d,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,i)=>e.label??`Line ${i+1}`):this.data.labels||(this.data.lines??[]).map((e,i)=>`Line ${i+1}`)}draw(){this.config=It(this.data,this.options,this.overlay),this.config&&(this.geometry=Rt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",At(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:i=>this.toggleLine(i),onRemove:this.options.onLineRemoved?i=>{this.removeLine(i,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(i)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((i,n)=>({values:i,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,i=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,i||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function lt(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let i=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(i){let n=i[1],l,u,d,p=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[l,u,d,p]}return null}function rt(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function Dn(t){let e=t;for(;e;){let i=rt(lt(getComputedStyle(e).backgroundColor));if(i!==null)return i;e=e.parentElement}if(typeof document<"u")for(let i of[document.body,document.documentElement]){if(!i)continue;let n=rt(lt(getComputedStyle(i).backgroundColor));if(n!==null)return n}return null}function In(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let i=rt(lt(e));return i===null?null:i<.5}function De(t,e){let i=me(t),n=()=>{let d=me(t);d!==i&&(i=d,e(d))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function me(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=In();if(e!==null)return e;let i=Dn(t??null);return i!==null?i<.5:!1}var Ie=60,Re=30,Rn=22,_e=48,_n=18,Wt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},zn="#cc6622";function Bn(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Ft=41;function st(t,e,i){let[n,l,u]=Bn(e),d=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(i){let a=g=>Math.round(Ft+(g-Ft)*d);return`rgb(${a(n)}, ${a(l)}, ${a(u)})`}let p=a=>Math.round(255-(255-a)*d);return`rgb(${p(n)}, ${p(l)}, ${p(u)})`}function On(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function at(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-space">_</span>'+xe(t.slice(1)):xe(t)}function we(t){return t==null?"":t.startsWith(" ")?"_"+t.slice(1):t}function ze(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Nt(t,e,i){let n=Ht(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=tt(e),d=u.normalized,p=u.v2Data,a=Pt(n);function g(o){return o?o.map(s=>({token:s.tokens?.[0]??"",color:s.color})).filter(s=>s.token!==""):[]}let r={ramp:i?.ramp||"purple",showGrid:i?.showGrid??!0,dimLow:i?.dimLowProb??!0,selectedRow:i?.selectedRow??null,selectedLayerIdx:i?.selectedLayer??null,viewStart:i?.viewStart??0,viewSize:i?.viewSize??d.layers.length,darkModeOverride:i?.darkMode??null,pinned:g(i?.pinnedGroups),pinnedRows:(i?.pinnedRows??[]).map(o=>o.pos).filter(o=>typeof o=="number"),colorIndex:i?.colorIndex??0,openPopup:null},x={};function $(o,s){(x[o]||[]).forEach(c=>c(s))}let h=d.layers.length,w=d.tokens.length,k=[],A="";function M(){h=d.layers.length,w=d.tokens.length,k=[];for(let s=0;s<h;s++){let c=0;for(let m=0;m<w;m++){let f=d.cells[m]?.[s];f&&f.prob>c&&(c=f.prob)}k.push(c)}A=d.cells[w-1]?.[h-1]?.token??"",r.pinnedRows=r.pinnedRows.filter(s=>s>=0&&s<w),r.selectedRow!==null&&r.selectedRow>=w&&(r.selectedRow=null),(r.viewSize>h||r.viewSize<1)&&(r.viewSize=h);let o=Math.max(0,h-r.viewSize);r.viewStart>o&&(r.viewStart=o),r.viewStart<0&&(r.viewStart=0)}M();function P(o){let s=r.pinned.find(c=>c.token===o);return s?s.color:null}function C(o){let s=r.pinned.findIndex(c=>c.token===o);s>=0?r.pinned.splice(s,1):(r.pinned.push({token:o,color:Se[r.colorIndex%Se.length]}),r.colorIndex++)}function B(o,s){let c=p?.tracked?.[o];if(c&&Array.isArray(c[s]))return c[s];for(let m=0;m<h;m++){let f=d.cells[o]?.[m]?.topk.find(L=>L.token===s);if(f)return f.trajectory}return null}function D(o){let s=r.pinnedRows.indexOf(o);return ot[(s<0?0:s)%ot.length]}function v(o){return r.pinnedRows.indexOf(o)>=0}function y(o,s){for(let c of r.pinned){let m=B(o,c.token);if(!m)continue;let f=0;for(let L of m)L!=null&&L>f&&(f=L);if(f>=s)return!0}return!1}function _(o){let s=null,c=0;for(let m=0;m<h;m++){let f=d.cells[o]?.[m];f&&f.prob>c&&(c=f.prob,s=f.token)}return c>=.05?s:null}function z(o){let s=r.pinnedRows.indexOf(o);if(s>=0){r.pinnedRows.splice(s,1);return}if(!y(o,.01)){let c=_(o);c&&!P(c)&&(r.pinned.push({token:c,color:Se[r.colorIndex%Se.length]}),r.colorIndex++)}r.pinnedRows.push(o)}function ne(){return Wt[r.ramp]||Wt.purple}function N(){return r.darkModeOverride!==null?r.darkModeOverride:me(l)}function oe(){let o=F.clientWidth;if(o>0)return o;let s=l?.clientWidth??0;return s>0?s-42:900}function Le(){let o=Math.floor((oe()-Ie)/_e);return Math.max(1,Math.min(_n,o))}function le(){let o=Math.max(0,h-r.viewSize),s=Math.max(0,Math.min(o,r.viewStart)),c=r.viewSize,m=Le();if(c<=m){let E=[];for(let S=0;S<c;S++)E.push(s+S);return{shownLayers:E,stride:1,start:s}}let f=Math.max(1,m-1),L=Math.ceil(c/f),T=[];for(let E=s;E<s+c;E+=L)T.push(E);let H=s+c-1;return T[T.length-1]!==H&&T.push(Math.min(h-1,H)),{shownLayers:T,stride:L,start:s}}l.innerHTML=`
        <div id="${n}" tabindex="-1">
            <div class="ll-heatmap" id="${n}_heatmap">
                <div class="ll-hdr-fixed" id="${n}_hdr"></div>
                <div class="ll-scroll" id="${n}_scroll" tabindex="0"></div>
            </div>
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
    `;let O=document.getElementById(n),F=document.getElementById(n+"_scroll"),ae=document.getElementById(n+"_hdr"),Te=document.getElementById(n+"_nav"),de=document.getElementById(n+"_lp_wrap"),He=document.getElementById(n+"_lp_token"),Pe=document.getElementById(n+"_lp_box"),ke=document.getElementById(n+"_lp"),Z=document.getElementById(n+"_tt"),q=document.getElementById(n+"_popup"),b=document.getElementById(n+"_popup_hdr"),I=document.getElementById(n+"_popup_body");document.body.appendChild(q);let R=null,V=null,j=!0,U=!1,ee=getComputedStyle(O).getPropertyValue("--ll-aspect-ratio").trim(),ie=!ee;ie&&O.classList.add("ll-fill");let fe=(()=>{if(!ee||/^(unbounded|none|auto)$/i.test(ee))return null;let o=ee.split("/").map(s=>parseFloat(s.trim()));return o.length!==2||isNaN(o[0])||isNaN(o[1])||o[0]===0||o[1]===0?null:o[1]/o[0]})(),Me=_e,Fe=Re;function Kt(){let o=oe(),s=le().shownLayers.length;if(Me=s>0?Math.max(_e,Math.floor((o-Ie)/s)):_e,!ie){Fe=Re;return}let c=F.clientHeight;Fe=w>0&&w*Re<c?Math.floor(c/w):Re}function en(o,s){let c=s?"#bbb":"#555",m=o?` stroke-dasharray="${xe(o)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${m}/></svg>`}function Y(){te=null;let o=ne(),s=N(),c=r.showGrid?s?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(ie){let S=l.clientWidth;O.style.width=S>0?S+"px":"100%",O.style.maxWidth="100%",O.style.maxHeight="",F.style.maxHeight=""}else{O.style.width="",O.style.maxWidth="",F.style.maxHeight="";let S=l.clientWidth||O.clientWidth;if(fe&&S>0){let J=O.offsetHeight-F.offsetHeight,K=(J>0?J:140)+90;O.style.maxHeight=Math.max(K,Math.round(S*fe))+"px"}else O.style.maxHeight=""}Kt();let{shownLayers:m}=le(),f=m.length,L=Math.round(Ie+Me*f),T=`${Ie}px repeat(${f}, ${Me}px)`,H=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${T};height:${Rn+6}px;width:${L}px;min-width:${L}px;">`;H+='<div class="ll-corner">token</div>';for(let S of m)H+=`<div class="ll-hdr-cell">${d.layers[S]}</div>`;H+="</div>",ae.innerHTML=H;let E=`<div class="ll-grid-inner" style="width:${L}px;min-width:${L}px;">`;for(let S=0;S<w;S++){let W=d.tokens[S],J=ze(W),K=v(S),re=S===r.selectedRow||K;E+=`<div class="ll-row" data-rowwrap="${S}">`,re&&(E+='<div class="ll-row-rail"></div>'),E+=`<div class="ll-row-grid${re?" ll-row-sel":""}" data-row="${S}" style="display:grid;grid-template-columns:${T};height:${Fe}px;">`,E+=`<div class="ll-row-label" title="click to pin this position's trajectories">`,K&&(E+=en(D(S).dash,s)),E+=J?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${re?"font-weight:600;":""}">${at(W)}</span>`,E+="</div>",m.forEach((se,X)=>{let pe=d.cells[S][se],be=pe.prob,Je=A!==""&&pe.token===A,Tt=st(be,Je?zn:o,s),bn=On(be,s),xn=be<.18,vn=r.dimLow&&xn?"opacity:0.55;":"",Ke=P(pe.token),yn=Ke?`box-shadow:inset 0 0 0 2px ${Ke};`:"",Et=S===0,St=S===w-1,$t=X===0,Ct=X===f-1,Ee="";Et&&$t?Ee="border-top-left-radius:8px;":Et&&Ct?Ee="border-top-right-radius:8px;":St&&$t?Ee="border-bottom-left-radius:8px;":St&&Ct&&(Ee="border-bottom-right-radius:8px;"),E+=`<div class="ll-cell${Ke?" ll-cell-pinned":""}" data-row="${S}" data-layer="${se}" style="background:${Tt};color:${bn};padding:0 6px;${vn}${c}${yn}${Ee}"><span class="ll-cell-text">${at(pe.token)}</span></div>`}),E+="</div></div>"}E+="</div>",F.innerHTML=E}function he(){let o=ne(),s=N(),{stride:c,start:m}=le(),f=r.viewSize,L=f>=h,T=ut(),H=f<=T[0],E='<span class="ll-nav-range-key">layers</span>';L?E+=`all ${h}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):E+=`${m}\u2013${m+f-1}<span class="ll-dim"> / ${h}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let S="";for(let X=0;X<h;X++){let pe=k[X]||0,be=Math.max(8,Math.round(pe*92));S+=`<div class="ll-skyline-bar" style="height:${be}%;background:${st(pe,o,s)}"></div>`}let W=m/h*100,J=f/h*100,K=[];for(let X=0;X<h;X+=8)K.push(X);K[K.length-1]!==h-1&&K.push(h-1);let re="",se=Math.max(1,h-1);for(let X of K){let pe=X===h-1,be=X===0,Je=X/se*100;re+=`<span class="ll-nav-tick" style="left:${Je}%;transform:${pe?"translateX(-100%)":be?"translateX(0)":"translateX(-50%)"}">${d.layers[X]}</span>`}Te.innerHTML=`
            <div class="ll-nav-range">${E}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${S}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${W}%;width:${J}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${re}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${m<=0?"disabled":""}>${Wn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${m+f>=h?"disabled":""}>${Fn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${H?"disabled":""}>${Nn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${jn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${An}</button>
            </div>
        `,ln()}function tn(){let o=document.getElementById(n+"_win");if(!o)return;let s=Math.max(0,h-r.viewSize),c=Math.max(0,Math.min(s,r.viewStart));o.style.left=c/h*100+"%",o.style.width=r.viewSize/h*100+"%"}function ut(){return Array.from(new Set([h,48,32,20,14,10,8])).filter(o=>o<=h&&o>=1).sort((o,s)=>o-s)}function Ne(o){return Math.max(0,Math.min(Math.max(0,h-r.viewSize),o))}let je=!1;function mt(){je||(je=!0,requestAnimationFrame(()=>{je=!1,!U&&(Y(),tn())}))}function Ve(o){let s=Ne(r.viewStart+o);s!==r.viewStart&&(r.viewStart=s,Y(),he(),ce())}function nn(o){let s=Ne(o);s!==r.viewStart&&(r.viewStart=s,mt())}function ft(o,s){let c=ut(),m=c.findIndex(H=>H>=r.viewSize),f=m===-1?c.length-1:m,L=o<0?Math.max(0,f-1):Math.min(c.length-1,f+1),T=c[L];T!==r.viewSize&&(r.viewSize=T,r.viewStart=Math.max(0,Math.min(h-T,Math.round(s-T/2))),Y(),he(),ce())}function gt(o){ft(o,r.viewStart+r.viewSize/2)}function on(){r.viewSize=h,r.viewStart=0,Y(),he(),ce()}let ge=null;function ln(){let o=document.getElementById(n+"_sky");if(!o)return;o.addEventListener("pointerdown",c=>{let m=o.getBoundingClientRect(),f=c.clientX-m.left,L=m.width/h,T=Math.max(0,h-r.viewSize),H=Math.max(0,Math.min(T,r.viewStart)),E=H*L,S=(H+r.viewSize)*L,W=H;(f<E||f>S)&&(W=Ne(Math.round(f/L)-Math.floor(r.viewSize/2)),r.viewStart=W,mt()),ge={startX:f,startStart:W,layerW:L},o.classList.add("ll-grabbing");try{o.setPointerCapture(c.pointerId)}catch{}}),o.addEventListener("pointermove",c=>{if(!ge)return;let m=o.getBoundingClientRect(),L=(c.clientX-m.left-ge.startX)/ge.layerW;nn(Math.round(ge.startStart+L))});let s=c=>{if(ge){ge=null,o.classList.remove("ll-grabbing");try{o.releasePointerCapture(c.pointerId)}catch{}he(),ce()}};o.addEventListener("pointerup",s),o.addEventListener("pointercancel",s),o.addEventListener("wheel",c=>{c.preventDefault();let m=o.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Ve(c.deltaX>0?1:-1);return}let f=Math.round((c.clientX-m.left)/m.width*h);ft(c.deltaY<0?-1:1,f)},{passive:!1})}function rn(o,s,c=!1){r.selectedRow=o,r.selectedLayerIdx=s??d.layers.length-1,Y(),Q(),c&&sn(o),ce()}function sn(o){let s=F.querySelector(`[data-rowwrap="${o}"]`);if(!s)return;let c=s.offsetTop-F.clientHeight/2+s.offsetHeight/2;F.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function Ue(){requestAnimationFrame(()=>requestAnimationFrame(()=>{U||(F.scrollTop=F.scrollHeight)}))}let an=.45,dn=120,cn=360;function Ge(){let o;if(fe)o=(l.clientWidth||O.clientWidth)*fe;else{let c=O.clientHeight;o=c>0?c:(O.clientWidth||900)*.6}let s=Math.round(o*an);Pe.style.height=Math.max(dn,Math.min(cn,s))+"px"}function bt(o){return o+"\xB7"+(ze(d.tokens[o])?"bos":we(d.tokens[o]))}function Q(o){let s=r.pinnedRows.length>0?r.pinnedRows:r.selectedRow!==null?[r.selectedRow]:[],c=s.length>1,m=[];for(let L of s){let T=D(L);for(let H of r.pinned){let E=B(L,H.token);if(!E)continue;let S=we(H.token);c&&(S+=" ("+bt(L)+")"),m.push({values:E.map(W=>W??null),label:S,color:H.color,dashPattern:T.dash||void 0,removable:!1})}}let f=m.length===0&&!o;if(f)de.classList.add("ll-hidden");else{de.classList.remove("ll-hidden"),Ge(),He.textContent=r.pinnedRows.length>1?r.pinnedRows.length+" positions":s.length===1?"position "+bt(s[0]):"";let L={lines:[],richLines:m,xLabels:d.layers},T={darkMode:N(),mode:"probability",autoScale:!0,legendPosition:m.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};R?(R.setData(L),R.setOptions(T)):(ke.style.minHeight="0",R=new ue(ke,L,T)),o?R.setOverlay?.({values:o.values,label:o.label,color:o.color,dashPattern:"4,2",isOverlay:!0}):R.setOverlay?.(null)}ie&&f!==j?(j=f,requestAnimationFrame(()=>{U||(Y(),Ue())})):j=f}function pn(o,s,c,m){let f=d.cells[o]?.[s];if(!f)return;let L=ne(),T=ze(d.tokens[o])?"bos":we(d.tokens[o]);Z.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${st(f.prob,L,N())}"></span><span class="ll-tt-token">${xe(we(f.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(f.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[s]} / ${d.layers[h-1]}</span><span>position</span><span class="ll-tt-val">${o} \xB7 ${xe(T)}</span></div>`,Z.classList.add("ll-visible");let H=O.getBoundingClientRect(),E=Z.offsetWidth||220,S=Z.offsetHeight||90,W=c-H.left+16;c+E+24>window.innerWidth-8&&(W=c-H.left-E-12);let J=m-H.top-50;W=Math.max(6,Math.min(W,H.width-E-6)),J=Math.max(6,Math.min(J,H.height-S-6)),Z.style.left=W+"px",Z.style.top=J+"px"}function qe(){Z.classList.remove("ll-visible")}function hn(){Ye(),V=document.createElement("div"),V.style.cssText="position:fixed;inset:0;z-index:49;",V.addEventListener("mousedown",o=>{o.preventDefault(),o.stopPropagation(),vt()}),document.body.appendChild(V)}function Ye(){V&&(V.remove(),V=null)}function un(o,s,c){if(!d.cells[o]?.[s])return;let f=c.getBoundingClientRect();r.openPopup={row:o,layer:s},r.selectedRow=o,r.selectedLayerIdx=s;let L=ze(d.tokens[o])?"bos":we(d.tokens[o]);b.innerHTML=`Layer <b>${d.layers[s]}</b>, Position <b>${o}</b><div class="ll-popup-sub">input <code>${xe(L)}</code></div>`,xt(o,s),Y(),Q(),q.style.visibility="hidden",q.classList.add("ll-visible"),mn(f),q.style.visibility="",hn(),ce()}function xt(o,s){let c=d.cells[o][s],m="";c.topk.forEach((f,L)=>{let T=P(f.token),H=T?`background:${T}22;border-left-color:${T};`:"";m+=`<div class="ll-topk${T?" ll-topk-pinned":""}" data-ki="${L}" style="${H}" title="click to track trajectory"><span class="ll-topk-tok">${at(f.token)}</span><span class="ll-topk-prob">${(f.prob*100).toFixed(1)}%</span></div>`}),I.innerHTML=m,I.querySelectorAll(".ll-topk").forEach(f=>{let L=parseInt(f.dataset.ki),T=c.topk[L];f.addEventListener("mouseenter",()=>{if(j)return;let H=B(o,T.token);H&&Q({values:H.map(E=>E??null),label:we(T.token),color:"#999"})}),f.addEventListener("mouseleave",()=>{j||Q()}),f.addEventListener("click",H=>{H.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(C(T.token),Y(),xt(o,s),Q(),ce())})})}function mn(o){let m=O.getBoundingClientRect(),f=Math.max(140,m.width-2*8),L=Math.max(120,m.height-2*8);q.style.maxWidth=f+"px",q.style.maxHeight=L+"px";let T=q.offsetWidth||220,H=q.offsetHeight||160,E=m.left+8,S=m.right-8-T,W=m.top+8,J=m.bottom-8-H,K=[{left:o.right+6,top:o.top},{left:o.left-6-T,top:o.top},{left:o.left,top:o.bottom+6},{left:o.left,top:o.top-6-H}],re=K[0];for(let se of K)if(se.left>=E&&se.left<=S&&se.top>=W&&se.top<=J){re=se;break}q.style.left=Math.max(E,Math.min(re.left,Math.max(E,S)))+"px",q.style.top=Math.max(W,Math.min(re.top,Math.max(W,J)))+"px"}function vt(){r.openPopup=null,q.classList.remove("ll-visible"),Ye(),Y(),Q()}document.getElementById(n+"_popup_close").addEventListener("click",o=>{o.stopPropagation(),vt()});let te=null;function fn(o){if(j)return;let s=parseInt(o.dataset.row),c=parseInt(o.dataset.layer),m=d.cells[s]?.[c]?.token,f=m!=null?B(s,m):null;f?Q({values:f.map(L=>L??null),label:we(m),color:"#999"}):Q()}function yt(){j||Q()}F.addEventListener("mousemove",o=>{let s=o.target.closest(".ll-cell");if(!s){te&&(te.classList.remove("ll-cell-hover"),te=null,yt()),qe();return}te!==s&&(te&&te.classList.remove("ll-cell-hover"),te=s,te.classList.add("ll-cell-hover"),fn(s));let c=parseInt(s.dataset.row),m=parseInt(s.dataset.layer);pn(c,m,o.clientX,o.clientY)}),F.addEventListener("mouseleave",()=>{te&&(te.classList.remove("ll-cell-hover"),te=null,yt()),qe()}),F.addEventListener("click",o=>{if(!(window.getSelection()?.isCollapsed??!0))return;let s=o.target,c=s.closest(".ll-row-grid");if(!c)return;let m=parseInt(c.dataset.row);if(s.closest(".ll-row-label")){z(m),Y(),Q(),ce();return}let f=s.closest(".ll-cell");if(f){let L=parseInt(f.dataset.layer);if(o.shiftKey){let T=d.cells[m]?.[L]?.token;T&&(C(T),Y(),Q(),ce());return}qe(),un(m,L,f)}}),F.addEventListener("keydown",o=>{if(o.key!=="ArrowDown"&&o.key!=="ArrowUp")return;o.preventDefault();let s=r.selectedRow??-1,c=o.key==="ArrowDown"?Math.min(w-1,s+1):Math.max(0,s-1);rn(c,void 0,!0)}),Te.addEventListener("click",o=>{let s=o.target.closest("[data-nav]");if(!s||s.hasAttribute("disabled"))return;let c=s.dataset.nav;c==="panL"?Ve(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?Ve(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?gt(-1):c==="zoomOut"?gt(1):c==="reset"&&on()});function Xe(){Y(),he(),Q(),requestAnimationFrame(()=>{U||(Y(),he(),j||Ge())})}function Qe(){nt(O,N(),q)}function ce(){$("stateChange",Mt())}Xe(),Ue(),Qe();let Ze=0,wt=l?.clientWidth??0,Lt=l?.clientHeight??0,kt=new ResizeObserver(()=>{let o=l?.clientWidth??0,s=l?.clientHeight??0;o===wt&&s===Lt||(wt=o,Lt=s,!Ze&&(Ze=requestAnimationFrame(()=>{Ze=0,!U&&(Y(),j||Ge())})))});l&&kt.observe(l);let gn=De(l,o=>{r.darkModeOverride===null&&(nt(O,o,q),Y(),he(),Q())});function Mt(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,selectedLayer:r.selectedLayerIdx,viewStart:r.viewStart,viewSize:r.viewSize,colorIndex:r.colorIndex,pinnedGroups:r.pinned.map(o=>({tokens:[o.token],color:o.color})),pinnedRows:r.pinnedRows.map(o=>({pos:o,line:D(o).name})),darkMode:r.darkModeOverride}}return{widget:{getState:Mt,setState:o=>{o.ramp!==void 0&&(r.ramp=o.ramp),o.showGrid!==void 0&&(r.showGrid=o.showGrid),o.dimLowProb!==void 0&&(r.dimLow=o.dimLowProb),o.selectedRow!==void 0&&(r.selectedRow=o.selectedRow),o.selectedLayer!==void 0&&(r.selectedLayerIdx=o.selectedLayer),o.viewStart!==void 0&&(r.viewStart=o.viewStart),o.viewSize!==void 0&&(r.viewSize=o.viewSize),o.colorIndex!==void 0&&(r.colorIndex=o.colorIndex),o.pinnedGroups!==void 0&&(r.pinned=g(o.pinnedGroups)),o.pinnedRows!==void 0&&(r.pinnedRows=o.pinnedRows.map(s=>s.pos).filter(s=>typeof s=="number")),o.darkMode!==void 0&&(r.darkModeOverride=o.darkMode),M(),Qe(),Xe()},setData:o=>{u=tt(o),d=u.normalized,p=u.v2Data,r.selectedRow=null,r.selectedLayerIdx=null,r.pinned=[],r.pinnedRows=[],r.colorIndex=0,M(),Xe(),Ue()},setTitle:()=>{},setThemeMode:o=>{r.darkModeOverride=!!o,Qe(),Y(),he(),Q()},getThemeMode:()=>N(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let o of p.tracked)for(let s in o){let c=o[s];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(o,s)=>{(x[o]||(x[o]=[])).push(s)},off:(o,s)=>{x[o]=(x[o]||[]).filter(c=>c!==s)},destroy:()=>{U=!0,gn(),kt?.disconnect(),Ye(),q.remove(),R&&(R.destroy(),R=null),l&&(l.innerHTML="")}},styleEl:a}}var An='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Wn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Fn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Nn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',jn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Be=class{constructor(e,i,n){this.widget=null;this.styleEl=null;let l=Nt(e,i,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,i){this.widget?.on(e,i)}off(e,i){this.widget?.off(e,i)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function $e(t){if(typeof document>"u")return String(t??"").replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i]);let e=document.createElement("div");return e.textContent=String(t??""),e.innerHTML}function Oe(t){return t==null?"":t.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+$e(t.slice(1)):$e(t)}function Vn(t){let e=`#${t}`;return`
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
    `}function jt(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Vn(t),document.head.appendChild(e),e}var Un=0,Ae=class{constructor(e,i,n={}){this.destroyed=!1;this.hoverCell=null;this.container=e,this.data=i,this.options={cellWidth:48,cellHeight:28,rowHeaderWidth:100,darkMode:!1,showGrid:!0,...n},this.uid="hmx_"+ ++Un+"_"+Date.now().toString(36),this.styleEl=jt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render()}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,i=!!e.darkMode;this.root.classList.toggle("hmx-dark",i);let n=e.cellWidth??48,l=e.cellHeight??28,u=e.rowHeaderWidth??100,d=this.data.columns,p=d.length,a=this.data.rows,g=e.maxRows!=null?Math.min(a.length,e.maxRows):a.length,r=u+n*p,x=`${u}px repeat(${p}, ${n}px)`,$=e.showGrid?i?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",h=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${x};height:26px;width:${r}px;min-width:${r}px;">`;h+=`<div class="hmx-corner">${$e(e.cornerLabel??"")}</div>`;for(let k=0;k<p;k++)h+=`<div class="hmx-col">${Oe(d[k].label)}</div>`;h+="</div>",this.hdrEl.innerHTML=h;let w=`<div class="hmx-grid-inner" style="width:${r}px;min-width:${r}px;">`;for(let k=0;k<g;k++){let A=a[k].label;w+=`<div class="hmx-row" data-rowwrap="${k}">`,w+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${x};height:${l}px;">`,w+=`<div class="hmx-rowlabel" data-row="${k}" title="${$e(A)}"><span class="hmx-cell-text">${Oe(A)}</span></div>`;for(let M=0;M<p;M++){let P=this.data.getCellValue(k,M),C=P.highlighted&&P.highlightColor?`box-shadow:inset 0 0 0 2px ${P.highlightColor};`:"",B=P.bold?"font-weight:bold;":"",D=k===0,v=k===g-1,y=M===0,_=M===p-1,z="";D&&y?z="border-top-left-radius:8px;":D&&_?z="border-top-right-radius:8px;":v&&y?z="border-bottom-left-radius:8px;":v&&_&&(z="border-bottom-right-radius:8px;"),w+=`<div class="hmx-cell" data-row="${k}" data-col="${M}" style="background:${P.color};color:${P.textColor};padding:0 6px;${$}${C}${B}${z}"><span class="hmx-cell-text">${Oe(P.text)}</span></div>`}w+="</div></div>"}w+="</div>",this.scrollEl.innerHTML=w}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let i=e.target.closest(".hmx-cell");if(!i){this.clearHover();return}this.hoverCell!==i&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=i,i.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(i.dataset.row),parseInt(i.dataset.col)))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let i=e.target,n=i.closest(".hmx-rowlabel");if(n){this.options.onRowHeaderClick?.(parseInt(n.dataset.row));return}let l=i.closest(".hmx-cell");l&&this.options.onCellClick?.(parseInt(l.dataset.row),parseInt(l.dataset.col))})}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}destroy(){this.destroyed=!0,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var Gn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',qn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Yn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',dt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function ct(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Vt(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${dt};`;let i={isOpen:!1,searchQuery:""},n=Gt(e,t,i);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=i,e}function Ce(t,e){let i=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;i&&i();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=Gt(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function Ut(t){let e=t.__tokenSelectorCleanup;e&&e()}function Gt(t,e,i){t.innerHTML="";let n=ct(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:d,onChange:p}=e,a=document.createElement("div");a.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let g=document.createElement("span");if(g.style.cssText=`font-size:11px;color:${n.fgMuted};`,g.textContent=`Tokens (${l.length})`,a.appendChild(g),!pt(u,d)){let v=document.createElement("button");v.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${dt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,v.innerHTML=`${Gn} Reset`,v.addEventListener("mouseenter",()=>{v.style.color=n.fg}),v.addEventListener("mouseleave",()=>{v.style.color=n.fgMuted}),v.addEventListener("click",()=>{p(Array.from(d))}),a.appendChild(v)}t.appendChild(a);let x=document.createElement("div");x.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,x.addEventListener("click",()=>{C(),h.focus()});let $=Array.from(u).sort((v,y)=>v-y);for(let v of $){let y=Xn(v,l[v],e.darkMode,()=>{let _=new Set(u);_.delete(v),p(Array.from(_))});x.appendChild(y)}let h=document.createElement("input");h.type="text",h.placeholder=$.length===0?"Search tokens...":"",h.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${dt};min-width:60px;flex:1;padding:2px 0;`,h.addEventListener("input",()=>{i.searchQuery=h.value,P()}),h.addEventListener("focus",()=>C()),x.appendChild(h);let w=document.createElement("span");w.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,w.innerHTML=Yn,w.addEventListener("click",v=>{v.stopPropagation(),i.isOpen?B():C()}),x.appendChild(w),t.appendChild(x);let k=document.createElement("div");k.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let A=document.createElement("div");A.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",k.appendChild(A);let M=document.createElement("div");M.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,M.textContent="No tokens found",k.appendChild(M),t.appendChild(k);function P(){A.innerHTML="";let v=i.searchQuery.toLowerCase(),y=0;for(let _=0;_<l.length;_++){let z=l[_];if(v&&!z.toLowerCase().includes(v))continue;y++;let ne=u.has(_),N=Qn(_,z,ne,e.darkMode,()=>{let oe=new Set(u);ne?oe.delete(_):oe.add(_),p(Array.from(oe))});A.appendChild(N)}M.style.display=y===0?"":"none"}function C(){i.isOpen||(i.isOpen=!0,k.style.display="",w.style.transform="rotate(180deg)",P())}function B(){i.isOpen&&(i.isOpen=!1,k.style.display="none",w.style.transform="",h.value="",i.searchQuery="")}function D(v){t.contains(v.target)||B()}return document.addEventListener("mousedown",D),i.isOpen&&(k.style.display="",w.style.transform="rotate(180deg)",h.value=i.searchQuery,P(),requestAnimationFrame(()=>{h.isConnected&&h.focus()})),()=>{document.removeEventListener("mousedown",D)}}function Xn(t,e,i,n){let l=ct(i),u=G[t%G.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=l.chipHoverBg,d.style.borderColor=l.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=l.chipBg,d.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,d.appendChild(p);let a=document.createElement("span");a.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,a.innerHTML=ye(e),a.title=e,d.appendChild(a);let g=document.createElement("button");return g.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,g.innerHTML=qn,g.addEventListener("mouseenter",()=>{g.style.color=l.badgeText}),g.addEventListener("mouseleave",()=>{g.style.color=l.fgMuted}),g.addEventListener("click",r=>{r.stopPropagation(),n()}),d.appendChild(g),d}function Qn(t,e,i,n,l){let u=ct(n),d=G[t%G.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=u.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",x=>{x.stopPropagation(),l()});let a=document.createElement("span");a.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${i?d:"transparent"};border:1.5px solid ${i?d:u.fgMuted};`,p.appendChild(a);let g=document.createElement("span");g.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${i?u.fg:u.fgMuted};`,g.innerHTML=ye(e),g.title=e,p.appendChild(g);let r=t===0?"source pred":t===1?"target pred":null;if(r){let x=document.createElement("span");x.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,x.textContent=r,p.appendChild(x)}if(i){let x=document.createElement("span");x.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,x.textContent="selected",p.appendChild(x)}return p}function pt(t,e){if(t.size!==e.size)return!1;for(let i of t)if(!e.has(i))return!1;return!0}var Zn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Jn=["probability","prob_diff","rank"],We=class{constructor(e,i,n={}){this.modeButtons=new Map;this.container=e,this.allData=i,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=i.tokenLabels?.length??i.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,a)=>a);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Vt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new ue(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let i of Jn){let n=document.createElement("button");n.textContent=Zn[i],this.applyModeButtonStyles(n,i===this.mode),n.addEventListener("click",()=>this.setMode(i)),n.addEventListener("mouseenter",()=>{i!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{i!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(i,n)}return e}applyModeBarStyles(e){let i=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${i};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,i){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${i?l:"transparent"};color:${i?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,i]of this.modeButtons)this.applyModeButtonStyles(i,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),i=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,p)=>d-p),l=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:l?e[d].map(p=>p+1):e[d],label:i[d]??`Token ${d}`,color:G[d%G.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let i=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,i)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<i));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let i=this.getModeLines().length,n=new Set(e.filter(l=>l<i));pt(n,this.selectedTokens)||(this.selectedTokens=n,Ce(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Ut(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Kn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function ht(t,e,i){let n=Kn(t);if(!n)return null;let l=e(n);if(i===void 0){let u=De(n,p=>l.setThemeMode(p)),d=l.destroy.bind(l);l.destroy=()=>{u(),d()}}return l}function Xt(t,e,i){return new Be(t,e,i)}function Qt(t,e,i){return ht(t,n=>new ue(n,e,{darkMode:me(n),...i}),i?.darkMode)}var qt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function eo(t){if(!/^#?[0-9a-fA-F]{6}$/.test(t))return[147,51,234];let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Yt(t,e){if(typeof t.getCellValue=="function")return t;let i=t,n=i.values??[],l=i.texts,u=i.rowLabels??n.map((M,P)=>String(P)),d=i.colLabels??(n[0]??[]).map((M,P)=>String(P)),p=i.ramp??"purple",a=qt[p]??(p[0]==="#"?p:qt.purple),[g,r,x]=eo(a),[$,h]=i.valueDomain??[0,1],w=h-$,k=e?38:255,A=M=>Math.max(0,Math.min(1,M));return{rows:u.map(M=>({label:M})),columns:d.map(M=>({label:M,value:0})),getCellValue:(M,P)=>{let C=n[M]?.[P]??0,B=A(w>0?(C-$)/w:C),D=y=>Math.round(k+(y-k)*B);return{text:l?l[M]?.[P]??"":Number.isInteger(C)?String(C):C.toFixed(2),value:C,color:`rgb(${D(g)}, ${D(r)}, ${D(x)})`,textColor:B>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Zt(t,e,i){return ht(t,n=>{let l=i?.darkMode??me(n),u=new Ae(n,Yt(e,l),{darkMode:l,...i}),d=u.setThemeMode.bind(u);return u.setThemeMode=p=>{u.setData(Yt(e,p)),d(p)},u},i?.darkMode)}function Jt(t,e,i){return ht(t,n=>new We(n,e,{darkMode:me(n),...i}),i?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Xt,window.LinePlotWidget=Qt,window.HeatmapTableWidget=Zt,window.ActivationPatchingWidget=Jt);return En(to);})();
//# sourceMappingURL=charts.js.map
