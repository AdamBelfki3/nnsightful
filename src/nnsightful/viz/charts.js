"use strict";var InterpTools=(()=>{var qe=Object.defineProperty;var sn=Object.getOwnPropertyDescriptor;var dn=Object.getOwnPropertyNames;var cn=Object.prototype.hasOwnProperty;var pn=(t,e)=>{for(var o in e)qe(t,o,{get:e[o],enumerable:!0})},hn=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of dn(e))!cn.call(t,l)&&l!==o&&qe(t,l,{get:()=>e[l],enumerable:!(n=sn(e,l))||n.enumerable});return t};var un=t=>hn(qe({},"__esModule",{value:!0}),t);var Nn={};pn(Nn,{ActivationPatchingWidget:()=>Nt,HeatmapTableWidget:()=>Ft,LinePlotWidget:()=>Wt,LogitLensWidget:()=>Rt});function Ye(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let o=t.layers.length,n=t.input.length,l=[];for(let a=0;a<n;a++){let h=[],r=t.tracked[a];for(let f=0;f<o;f++){let s=t.topk[f][a],g=[];for(let p=0;p<s.length;p++){let M=s[p],H=r[M]||[],F=H[f]||0;g.push({token:M,prob:F,trajectory:H})}let w=g[0]||{token:"",prob:0,trajectory:[]};h.push({token:w.token,prob:w.prob,trajectory:w.trajectory,topk:g})}l.push(h)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function Lt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function xe(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function mn(t){let e=`#${t}`;return`
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
        ${e} .ll-lead-dot { opacity: 0.35; margin-right: 1px; }

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
        }
        ${e} .ll-cell.ll-cell-hover { outline: 2px solid var(--ll-text); outline-offset: -2px; z-index: 3; }
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
            min-width: 180px; max-width: 280px;
            background: var(--p-surface); border: 1px solid var(--p-border);
            border-radius: 6px;
            box-shadow: 0 6px 20px -4px rgba(0,0,0,0.18), 0 2px 6px -2px rgba(0,0,0,0.10);
            padding: 12px; font-family: var(--p-sans); color: var(--p-text);
            -webkit-user-select: none; user-select: none;
        }
        #${t}_popup.ll-visible { display: block; }
        #${t}_popup.ll-dark {
            --p-surface: hsl(0 0% 18%); --p-border: hsl(0 0% 30%); --p-line: hsl(0 0% 28%);
            --p-text: hsl(0 0% 90%); --p-text-2: hsl(0 0% 70%); --p-muted: hsl(0 0% 60%);
            --p-hover: hsl(0 0% 24%); --p-code: hsl(0 0% 26%); color-scheme: dark;
        }
        #${t}_popup .ll-lead-dot { opacity: 0.35; margin-right: 1px; }
        #${t}_popup .ll-popup-close {
            position: absolute; top: 6px; right: 9px; cursor: pointer;
            color: var(--p-muted); font-size: 17px; line-height: 1;
        }
        #${t}_popup .ll-popup-close:hover { color: var(--p-text); }
        #${t}_popup .ll-popup-header {
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
        #${t}_popup .ll-popup-body { display: flex; flex-direction: column; gap: 1px; }
        #${t}_popup .ll-topk {
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            padding: 3px 6px; border-radius: 3px; cursor: pointer;
            border-left: 3px solid transparent;
            font-family: var(--p-mono); font-size: 12px;
        }
        #${t}_popup .ll-topk:hover { background: var(--p-hover); }
        #${t}_popup .ll-topk-tok {
            color: var(--p-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        #${t}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function wt(t){let e=document.createElement("style");return e.textContent=mn(t),document.head.appendChild(e),e}function Xe(t,e,...o){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of o)l&&n(l)}var Qe=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"];var V=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ge(t){return t.richLines&&t.richLines.length>0?t.richLines.map((o,n)=>({values:o.values,label:o.label??`Line ${n+1}`,color:o.color,dashPattern:o.dashPattern,isOverlay:o.isOverlay,removable:o.removable})):(t.lines??[]).map((o,n)=>({values:o,label:t.labels?.[n]??`Line ${n+1}`}))}function be(t){if(!t)return"";let e=[],o=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),o=1);let n="";for(;o<t.length;o++){let l=t[o];l===`
`?(n&&(e.push(kt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(kt(n)),e.join("")}function kt(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function fn(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let o of e)if(t<=o)return o;return 1}function Mt(t,e,o){let n=ge(t),l=n.length>0?n[0].values.length:o?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",a=e.minValue,h=e.maxValue;if(a===void 0||h===void 0||e.autoScale){let r=[];for(let g of n)if(!g.isOverlay)for(let w of g.values)w!==null&&r.push(w);if(o)for(let g of o.values)g!==null&&r.push(g);if(r.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let f=1/0,s=-1/0;for(let g of r)g<f&&(f=g),g>s&&(s=g);if(e.centerYAxisAtZero){let w=Math.max(Math.abs(f),Math.abs(s))*1.1;a=-w,h=w}else if(e.logScale){if(a===void 0&&(a=Math.max(1,Math.floor(f))),h===void 0||e.autoScale){let g=Math.log(Math.max(1,f)),w=Math.log(Math.max(1,s)),p=w+.15*Math.max(1,w-g);h=Math.ceil(Math.exp(p))}}else a===void 0&&(a=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(f)):Math.floor(f*.9)),(h===void 0||e.autoScale)&&(u==="rank"?h=Math.ceil(s*1.1):u==="probability"?h=e.autoScale?fn(Math.max(s,.001)):Math.min(s*1.1,1):h=s*1.1)}return{numLayers:l,minValue:a,maxValue:h,numLines:n.length}}function Tt(t,e,o,n,l,u,a,h){let r=t.getContext("2d"),f=e.getBoundingClientRect(),s=window.devicePixelRatio||1;t.width=f.width*s,t.height=f.height*s,t.style.width=`${f.width}px`,t.style.height=`${f.height}px`,r.scale(s,s);let g=f.width,w=f.height,p=n.darkMode??!1,M=n.title,H=n.mode||"probability",F=n.invertYAxis??!1,O=n.centerYAxisAtZero??!1,U=n.logScale??!1,P=n.xAxisLabel||"Layer",N=n.yAxisLabel||"Probability",B=n.xRangeStart??0;B>=l.numLayers-1&&(console.warn(`xRangeStart (${B}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),B=0);let v=n.showDataPoints??!0,y={top:M?48:24,right:24,bottom:56,left:72},I=g-y.left-y.right,A=w-y.top-y.bottom,D={margin:y,chartWidth:I,chartHeight:A,width:g,height:w},S={background:p?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:p?"#52525b":"#a1a1aa",grid:p?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:p?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:p?"#e4e4e7":"#27272a"};n.transparentBackground?r.clearRect(0,0,g,w):(r.fillStyle=S.background,r.fillRect(0,0,g,w)),M&&(r.fillStyle=S.titleText,r.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="left",r.fillText(M,y.left,28));let ee=l.numLayers-1-B,de=m=>ee<=0?y.left+I/2:y.left+(m-B)/ee*I,oe=U?Math.log(Math.max(1,l.minValue)):0,ve=U?Math.log(Math.max(1,l.maxValue)):0,ce=m=>{let E;if(U){let _=Math.log(Math.max(1,m));E=ve-oe>0?(_-oe)/(ve-oe):.5}else E=(m-l.minValue)/(l.maxValue-l.minValue);return F?y.top+E*A:y.top+A-E*A};r.setLineDash([4,4]),r.strokeStyle=S.grid,r.lineWidth=1;let te=[],ne=l.maxValue-l.minValue,W=5;if(U){let m=new Set;for(let q=0;q<W;q++){let Z=oe+q/(W-1)*(ve-oe),Y=Math.round(Math.exp(Z));m.has(Y)||(m.add(Y),te.push(Y))}let E=Math.round(Math.exp(oe)),_=Math.round(Math.exp(ve));m.has(E)||te.unshift(E),m.has(_)||te.push(_)}else if(H==="rank")for(let m=0;m<W;m++)te.push(Math.round(l.minValue+m/(W-1)*ne));else for(let m=0;m<W;m++)te.push(l.minValue+m/(W-1)*ne);if(te.forEach(m=>{let E=ce(m);r.beginPath(),r.moveTo(y.left,E),r.lineTo(y.left+I,E),r.stroke()}),r.setLineDash([]),O){let m=ce(0);r.beginPath(),r.strokeStyle=p?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",r.lineWidth=1.5,r.moveTo(y.left,m),r.lineTo(y.left+I,m),r.stroke(),r.lineWidth=1}r.fillStyle=S.text,r.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="right",r.textBaseline="middle",te.forEach(m=>{let E=ce(m),_;H==="probability"?_=m.toFixed(2):H==="prob_diff"?_=m>=0?`+${m.toFixed(2)}`:m.toFixed(2):_=Math.round(m).toString(),r.fillText(_,y.left-16,E)}),r.textAlign="center",r.textBaseline="top";let Ee=o.xLabels&&o.xLabels.length>0,Le=Math.max(1,Math.ceil(l.numLayers/8));for(let m=0;m<l.numLayers;m+=Le){let E=de(m);if(E<y.left-5||E>y.left+I+5)continue;let _=Ee?String(o.xLabels[m]??m):m.toString();r.fillText(_,E,y.top+A+12)}if((l.numLayers-1)%Le!==0){let m=Ee?String(o.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();r.fillText(m,de(l.numLayers-1),y.top+A+12)}r.strokeStyle=p?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",r.lineWidth=1.5,r.beginPath(),r.moveTo(y.left,y.top),r.lineTo(y.left,y.top+A),r.lineTo(y.left+I,y.top+A),r.stroke(),r.fillStyle=S.textMuted,r.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="center",r.textBaseline="top",r.fillText(P.toUpperCase(),y.left+I/2,w-16),r.save(),r.translate(14,y.top+A/2),r.rotate(-Math.PI/2),r.textAlign="center",r.textBaseline="top",r.fillText(N.toUpperCase(),0,0),r.restore();let X=ge(o);function Q(m,E,_,q,Z){r.beginPath(),r.strokeStyle=E,r.lineWidth=_,Z!==void 0&&(r.globalAlpha=Z),q?r.setLineDash(q.split(",").map(Number)):r.setLineDash([]);let Y=!1;for(let ie=0;ie<m.length;ie++){let R=m[ie];if(R===null){Y=!1;continue}let J=de(ie),Se=ce(R);Y?r.lineTo(J,Se):(r.moveTo(J,Se),Y=!0)}r.stroke(),r.setLineDash([]),Z!==void 0&&(r.globalAlpha=1)}let pe=p?"#3f3f46":"#d4d4d8";if(r.lineCap="round",r.lineJoin="round",X.forEach((m,E)=>{!u.has(E)||m.isOverlay||Q(m.values,pe,2,void 0,.35)}),X.forEach((m,E)=>{if(u.has(E)||m.isOverlay)return;let _=m.color??V[E%V.length];Q(m.values,_,4,m.dashPattern,.15),Q(m.values,_,2,m.dashPattern),v&&m.values.forEach((q,Z)=>{if(q===null)return;let Y=de(Z),ie=ce(q),R=a?.lineIdx===E&&a?.layerIdx===Z;r.beginPath(),r.strokeStyle=_,r.lineWidth=R?2:1.5,r.arc(Y,ie,R?5:3.5,0,Math.PI*2),r.stroke(),r.beginPath(),r.fillStyle=p?"#18181b":"#ffffff",r.arc(Y,ie,R?3.5:2.5,0,Math.PI*2),r.fill()})}),X.forEach((m,E)=>{if(!m.isOverlay||u.has(E))return;let _=m.color??"#999";Q(m.values,_,1.5,m.dashPattern??"4,2",.7)}),h){let m=h.color??"#999";Q(h.values,m,1.5,h.dashPattern??"4,2",.7)}return D}function Et(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function St(t,e,o,n,l,u,a,h,r){let{margin:f,chartWidth:s,chartHeight:g}=l,w=n.xRangeStart??0,p=a-1-w,M=n.logScale?Math.log(Math.max(1,h)):0,H=n.logScale?Math.log(Math.max(1,r)):0;if(t<f.left||t>f.left+s||e<f.top||e>f.top+g)return null;let F=ge(o),O=null,U=1/0,P=20;for(let N=0;N<F.length;N++){if(u.has(N))continue;let B=F[N];if(!B.isOverlay)for(let v=0;v<B.values.length;v++){let y=B.values[v];if(y===null)continue;let I=p<=0?f.left+s/2:f.left+(v-w)/p*s,A;if(n.logScale){let ee=Math.log(Math.max(1,y));A=H-M>0?(ee-M)/(H-M):.5}else A=(y-h)/(r-h);let D=n.invertYAxis?f.top+A*g:f.top+g-A*g,S=Math.sqrt((t-I)**2+(e-D)**2);S<U&&S<P&&(U=S,O={visible:!0,x:I,y:D,lineIdx:N,layerIdx:v,value:y,label:B.label,color:B.color??V[N%V.length]})}}return O}function Ze(t,e,o,n,l,u,a){if(!e){t.style.opacity="0";return}let h=n?"#27272a":"#fff",r=n?"#3f3f46":"#e4e4e7",f=n?"#fafafa":"#18181b",s=n?"#a1a1aa":"#71717a",w=e.x>o/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${w},-50%);`;let p=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
        <div style="background:${h};border:1px solid ${r};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${f};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${be(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${s}">${u??"Layer"}</span>
                    <span style="font-weight:500;color:${f}">${p}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${s}">Value</span>
                    <span style="font-weight:500;color:${f}">${a==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var gn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',bn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',vn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function $t(t){let e=document.createElement("div");return Ct(e,t),e}function Ct(t,e){let o=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${o};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function Ht(t,e,o,n,l,u){Ct(t,n),t.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",h=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",r=n?"#a1a1aa":"#71717a",f=n?"#3f3f46":"#d4d4d8",s="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",w=u?ge(u):[];e.forEach((p,M)=>{let H=w[M];if(H?.isOverlay)return;let F=H?.color??V[M%V.length],O=o.has(M),U=H?.removable??!1,P=document.createElement("button");P.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${O?"0.5":"1"};`,P.addEventListener("mouseenter",()=>{P.style.background=g}),P.addEventListener("mouseleave",()=>{P.style.background="transparent"}),P.addEventListener("click",()=>l.onToggle(M));let N=document.createElement("span");N.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${O?s:F};background:${O?f:"transparent"};`,P.appendChild(N);let B=document.createElement("span");if(B.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${O?h:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,B.title=p,B.innerHTML=be(p),P.appendChild(B),U&&l.onRemove){let v=document.createElement("span");v.style.cssText=`margin-left:auto;cursor:pointer;color:${r};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,v.innerHTML=vn,v.title="Remove",v.addEventListener("click",y=>{y.stopPropagation(),l.onRemove(M)}),P.appendChild(v),P.addEventListener("mouseenter",()=>{v.style.opacity="0.6"}),P.addEventListener("mouseleave",()=>{v.style.opacity="0"})}else{let v=document.createElement("span");v.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${r};opacity:${O?"0.6":"0"};display:flex;align-items:center;`,v.innerHTML=O?bn:gn,P.appendChild(v),O||(P.addEventListener("mouseenter",()=>{v.style.opacity="0.4"}),P.addEventListener("mouseleave",()=>{v.style.opacity="0"}))}t.appendChild(P)})}var ae=class{constructor(e,o,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let o=this.canvas.getBoundingClientRect(),n=e.clientX-o.left,l=e.clientY-o.top;this.tooltip=St(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Ze(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Ze(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=o,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=Et(this.chartContainer),this.legendEl=$t(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let a=Math.round(u.contentRect.width),h=Math.round(u.contentRect.height);a===this.lastWidth&&h===this.lastHeight||(this.lastWidth=a,this.lastHeight=h,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,o)=>e.label??`Line ${o+1}`):this.data.labels||(this.data.lines??[]).map((e,o)=>`Line ${o+1}`)}draw(){this.config=Mt(this.data,this.options,this.overlay),this.config&&(this.geometry=Tt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",Ht(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:o=>this.toggleLine(o),onRemove:this.options.onLineRemoved?o=>{this.removeLine(o,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(o)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((o,n)=>({values:o,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,o=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,o||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function Je(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let o=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(o){let n=o[1],l,u,a,h=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),a=parseInt(n[2]+n[2],16),n.length===4&&(h=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),a=parseInt(n.slice(4,6),16),n.length===8&&(h=parseInt(n.slice(6,8),16)/255)),[l,u,a,h]}return null}function Ke(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function xn(t){let e=t;for(;e;){let o=Ke(Je(getComputedStyle(e).backgroundColor));if(o!==null)return o;e=e.parentElement}if(typeof document<"u")for(let o of[document.body,document.documentElement]){if(!o)continue;let n=Ke(Je(getComputedStyle(o).backgroundColor));if(n!==null)return n}return null}function yn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let o=Ke(Je(e));return o===null?null:o<.5}function $e(t,e){let o=se(t),n=()=>{let a=se(t);a!==o&&(o=a,e(a))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function se(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=yn();if(e!==null)return e;let o=xn(t??null);return o!==null?o<.5:!1}var Ce=60,He=30,Ln=22,Pe=48,wn=150,kn=18,Pt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Mn="#cc6622";function Tn(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Dt=41;function et(t,e,o){let[n,l,u]=Tn(e),a=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(o){let r=f=>Math.round(Dt+(f-Dt)*a);return`rgb(${r(n)}, ${r(l)}, ${r(u)})`}let h=r=>Math.round(255-(255-r)*a);return`rgb(${h(n)}, ${h(l)}, ${h(u)})`}function En(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function tt(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-dot">\xB7</span>'+xe(t.slice(1)):xe(t)}function ye(t){return t==null?"":t.startsWith(" ")?"\xB7"+t.slice(1):t}function De(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function It(t,e,o){let n=Lt(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=Ye(e),a=u.normalized,h=u.v2Data,r=wt(n);function f(i){return i?i.map(d=>({token:d.tokens?.[0]??"",color:d.color})).filter(d=>d.token!==""):[]}let s={ramp:o?.ramp||"purple",showGrid:o?.showGrid??!0,dimLow:o?.dimLowProb??!0,selectedRow:o?.selectedRow??null,selectedLayerIdx:o?.selectedLayer??null,viewStart:o?.viewStart??0,viewSize:o?.viewSize??a.layers.length,darkModeOverride:o?.darkMode??null,pinned:f(o?.pinnedGroups),colorIndex:o?.colorIndex??0,openPopup:null},g={};function w(i,d){(g[i]||[]).forEach(c=>c(d))}let p=a.layers.length,M=a.tokens.length,H=[],F="";function O(){p=a.layers.length,M=a.tokens.length,H=[];for(let d=0;d<p;d++){let c=0;for(let x=0;x<M;x++){let b=a.cells[x]?.[d];b&&b.prob>c&&(c=b.prob)}H.push(c)}F=a.cells[M-1]?.[p-1]?.token??"",(s.viewSize>p||s.viewSize<1)&&(s.viewSize=p);let i=Math.max(0,p-s.viewSize);s.viewStart>i&&(s.viewStart=i),s.viewStart<0&&(s.viewStart=0)}O();function U(i){let d=s.pinned.find(c=>c.token===i);return d?d.color:null}function P(i){let d=s.pinned.findIndex(c=>c.token===i);d>=0?s.pinned.splice(d,1):(s.pinned.push({token:i,color:Qe[s.colorIndex%Qe.length]}),s.colorIndex++)}function N(i,d){let c=h?.tracked?.[i];if(c&&Array.isArray(c[d]))return c[d];for(let x=0;x<p;x++){let b=a.cells[i]?.[x]?.topk.find(L=>L.token===d);if(b)return b.trajectory}return null}function B(){return Pt[s.ramp]||Pt.purple}function v(){return s.darkModeOverride!==null?s.darkModeOverride:se(l)}function y(){let i=S.clientWidth;if(i>0)return i;let d=l?.clientWidth??0;return d>0?d-42:900}function I(){let i=Math.floor((y()-Ce)/Pe);return Math.max(1,Math.min(kn,i))}function A(){let i=Math.max(0,p-s.viewSize),d=Math.max(0,Math.min(i,s.viewStart)),c=s.viewSize,x=I();if(c<=x){let k=[];for(let $=0;$<c;$++)k.push(d+$);return{shownLayers:k,stride:1,start:d}}let b=Math.ceil(c/x),L=[];for(let k=d;k<d+c;k+=b)L.push(k);let T=d+c-1;return L[L.length-1]!==T&&L.push(Math.min(p-1,T)),{shownLayers:L,stride:b,start:d}}l.innerHTML=`
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
    `;let D=document.getElementById(n),S=document.getElementById(n+"_scroll"),ee=document.getElementById(n+"_hdr"),de=document.getElementById(n+"_nav"),oe=document.getElementById(n+"_lp_wrap"),ve=document.getElementById(n+"_lp_token"),ce=document.getElementById(n+"_lp_box"),te=document.getElementById(n+"_lp"),ne=document.getElementById(n+"_tt"),W=document.getElementById(n+"_popup"),Ee=document.getElementById(n+"_popup_hdr"),Le=document.getElementById(n+"_popup_body");document.body.appendChild(W);let X=null,Q=null,pe=!0,m=!1,E=getComputedStyle(D).getPropertyValue("--ll-aspect-ratio").trim(),_=!E;_&&D.classList.add("ll-fill");let q=(()=>{if(!E||/^(unbounded|none|auto)$/i.test(E))return null;let i=E.split("/").map(d=>parseFloat(d.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})(),Z=Pe,Y=He;function ie(){let i=y(),d=A().shownLayers.length;if(Z=d>0?Math.max(Pe,Math.min(wn,Math.floor((i-Ce)/d))):Pe,!_){Y=He;return}let c=S.clientHeight;Y=M>0&&M*He<c?Math.floor(c/M):He}function R(){let i=B(),d=v(),c=s.showGrid?d?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(_){let C=l.clientWidth;D.style.width=C>0?C+"px":"100%",D.style.maxWidth="100%",D.style.maxHeight="",S.style.maxHeight=""}else{D.style.width="",D.style.maxWidth="",S.style.maxHeight="";let C=l.clientWidth||D.clientWidth;if(q&&C>0){let j=D.offsetHeight-S.offsetHeight,me=(j>0?j:140)+90;D.style.maxHeight=Math.max(me,Math.round(C*q))+"px"}else D.style.maxHeight=""}ie();let{shownLayers:x}=A(),b=x.length,L=Math.round(Ce+Z*b),T=`${Ce}px repeat(${b}, ${Z}px)`,k=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${T};height:${Ln+6}px;width:${L}px;min-width:${L}px;">`;k+='<div class="ll-corner">token</div>';for(let C of x)k+=`<div class="ll-hdr-cell">${a.layers[C]}</div>`;k+="</div>",ee.innerHTML=k;let $=`<div class="ll-grid-inner" style="width:${L}px;min-width:${L}px;">`;for(let C=0;C<M;C++){let z=a.tokens[C],j=De(z),me=C===s.selectedRow;$+=`<div class="ll-row" data-rowwrap="${C}">`,me&&($+='<div class="ll-row-rail"></div>'),$+=`<div class="ll-row-grid${me?" ll-row-sel":""}" data-row="${C}" style="display:grid;grid-template-columns:${T};height:${Y}px;">`,$+='<div class="ll-row-label">',$+=j?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${me?"font-weight:600;":""}">${tt(z)}</span>`,$+="</div>",x.forEach((G,fe)=>{let re=a.cells[C][G],we=re.prob,gt=F!==""&&re.token===F,nn=et(we,gt?Mn:i,d),on=En(we,d),ln=we<.18,rn=s.dimLow&&ln?"opacity:0.55;":"",Ge=U(re.token),an=Ge?`box-shadow:inset 0 0 0 2px ${Ge};`:"",bt=C===0,vt=C===M-1,xt=fe===0,yt=fe===b-1,ke="";bt&&xt?ke="border-top-left-radius:8px;":bt&&yt?ke="border-top-right-radius:8px;":vt&&xt?ke="border-bottom-left-radius:8px;":vt&&yt&&(ke="border-bottom-right-radius:8px;"),$+=`<div class="ll-cell${Ge?" ll-cell-pinned":""}" data-row="${C}" data-layer="${G}" style="background:${nn};color:${on};padding:0 6px;${rn}${c}${an}${ke}"><span class="ll-cell-text">${tt(re.token)}</span></div>`}),$+="</div></div>"}$+="</div>",S.innerHTML=$}function J(){let i=B(),d=v(),{stride:c,start:x}=A(),b=s.viewSize,L=b>=p,T='<span class="ll-nav-range-key">layers</span>';L?T+=`all ${p}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):T+=`${x}\u2013${x+b-1}<span class="ll-dim"> / ${p}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let k="";for(let G=0;G<p;G++){let fe=H[G]||0,re=Math.max(8,Math.round(fe*92));k+=`<div class="ll-skyline-bar" style="height:${re}%;background:${et(fe,i,d)}"></div>`}let $=x/p*100,C=b/p*100,z=[];for(let G=0;G<p;G+=8)z.push(G);z[z.length-1]!==p-1&&z.push(p-1);let j="",me=Math.max(1,p-1);for(let G of z){let fe=G===p-1,re=G===0,we=G/me*100;j+=`<span class="ll-nav-tick" style="left:${we}%;transform:${fe?"translateX(-100%)":re?"translateX(0)":"translateX(-50%)"}">${a.layers[G]}</span>`}de.innerHTML=`
            <div class="ll-nav-range">${T}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${k}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${$}%;width:${C}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${j}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${x<=0?"disabled":""}>${$n}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${x+b>=p?"disabled":""}>${Cn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in">${Hn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${Pn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Sn}</button>
            </div>
        `,Gt()}function Se(){let i=document.getElementById(n+"_win");if(!i)return;let d=Math.max(0,p-s.viewSize),c=Math.max(0,Math.min(d,s.viewStart));i.style.left=c/p*100+"%",i.style.width=s.viewSize/p*100+"%"}function jt(){return Array.from(new Set([p,48,32,20,14,10,8])).filter(i=>i<=p&&i>=1).sort((i,d)=>i-d)}function ze(i){return Math.max(0,Math.min(Math.max(0,p-s.viewSize),i))}let Oe=!1;function rt(){Oe||(Oe=!0,requestAnimationFrame(()=>{Oe=!1,!m&&(R(),Se())}))}function Ae(i){let d=ze(s.viewStart+i);d!==s.viewStart&&(s.viewStart=d,R(),J(),ue())}function Vt(i){let d=ze(i);d!==s.viewStart&&(s.viewStart=d,rt())}function at(i,d){let c=jt(),x=c.findIndex(k=>k>=s.viewSize),b=x===-1?c.length-1:x,L=i<0?Math.max(0,b-1):Math.min(c.length-1,b+1),T=c[L];T!==s.viewSize&&(s.viewSize=T,s.viewStart=Math.max(0,Math.min(p-T,Math.round(d-T/2))),R(),J(),ue())}function st(i){at(i,s.viewStart+s.viewSize/2)}function Ut(){s.viewSize=p,s.viewStart=0,R(),J(),ue()}let he=null;function Gt(){let i=document.getElementById(n+"_sky");if(!i)return;i.addEventListener("pointerdown",c=>{let x=i.getBoundingClientRect(),b=c.clientX-x.left,L=x.width/p,T=Math.max(0,p-s.viewSize),k=Math.max(0,Math.min(T,s.viewStart)),$=k*L,C=(k+s.viewSize)*L,z=k;(b<$||b>C)&&(z=ze(Math.round(b/L)-Math.floor(s.viewSize/2)),s.viewStart=z,rt()),he={startX:b,startStart:z,layerW:L},i.classList.add("ll-grabbing");try{i.setPointerCapture(c.pointerId)}catch{}}),i.addEventListener("pointermove",c=>{if(!he)return;let x=i.getBoundingClientRect(),L=(c.clientX-x.left-he.startX)/he.layerW;Vt(Math.round(he.startStart+L))});let d=c=>{if(he){he=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(c.pointerId)}catch{}J(),ue()}};i.addEventListener("pointerup",d),i.addEventListener("pointercancel",d),i.addEventListener("wheel",c=>{c.preventDefault();let x=i.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Ae(c.deltaX>0?1:-1);return}let b=Math.round((c.clientX-x.left)/x.width*p);at(c.deltaY<0?-1:1,b)},{passive:!1})}function dt(i,d,c=!1){s.selectedRow=i,s.selectedLayerIdx=d??a.layers.length-1,R(),le(),c&&qt(i),ue()}function qt(i){let d=S.querySelector(`[data-rowwrap="${i}"]`);if(!d)return;let c=d.offsetTop-S.clientHeight/2+d.offsetHeight/2;S.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function Re(){requestAnimationFrame(()=>requestAnimationFrame(()=>{m||(S.scrollTop=S.scrollHeight)}))}let Yt=.45,Xt=120,Qt=360;function We(){let i;if(q)i=(l.clientWidth||D.clientWidth)*q;else{let c=D.clientHeight;i=c>0?c:(D.clientWidth||900)*.6}let d=Math.round(i*Yt);ce.style.height=Math.max(Xt,Math.min(Qt,d))+"px"}function le(i){let d=s.selectedRow,c=[];if(d!==null)for(let b of s.pinned){let L=N(d,b.token);L&&c.push({values:L.map(T=>T??null),label:ye(b.token),color:b.color,removable:!1})}let x=c.length===0&&!i;if(x)oe.classList.add("ll-hidden");else{oe.classList.remove("ll-hidden"),We(),ve.textContent=d===null?"":De(a.tokens[d])?"position "+d+" \xB7 bos":"position "+d+" \xB7 "+ye(a.tokens[d]);let b={lines:[],richLines:c,xLabels:a.layers},L={darkMode:v(),mode:"probability",autoScale:!0,legendPosition:c.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};X?(X.setData(b),X.setOptions(L)):(te.style.minHeight="0",X=new ae(te,b,L)),i?X.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):X.setOverlay?.(null)}_&&x!==pe?(pe=x,requestAnimationFrame(()=>{m||(R(),Re())})):pe=x}function Zt(i,d,c,x){let b=a.cells[i]?.[d];if(!b)return;let L=B(),T=De(a.tokens[i])?"bos":ye(a.tokens[i]);ne.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${et(b.prob,L,v())}"></span><span class="ll-tt-token">${xe(ye(b.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(b.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${a.layers[d]} / ${a.layers[p-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${xe(T)}</span></div>`,ne.classList.add("ll-visible");let k=D.getBoundingClientRect(),$=ne.offsetWidth||220,C=ne.offsetHeight||90,z=c-k.left+16;c+$+24>window.innerWidth-8&&(z=c-k.left-$-12);let j=x-k.top-50;z=Math.max(6,Math.min(z,k.width-$-6)),j=Math.max(6,Math.min(j,k.height-C-6)),ne.style.left=z+"px",ne.style.top=j+"px"}function Fe(){ne.classList.remove("ll-visible")}function Jt(){Ne(),Q=document.createElement("div"),Q.style.cssText="position:fixed;inset:0;z-index:49;",Q.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),pt()}),document.body.appendChild(Q)}function Ne(){Q&&(Q.remove(),Q=null)}function Kt(i,d,c){if(!a.cells[i]?.[d])return;let b=c.getBoundingClientRect();s.openPopup={row:i,layer:d},s.selectedRow=i,s.selectedLayerIdx=d;let L=De(a.tokens[i])?"bos":ye(a.tokens[i]);Ee.innerHTML=`Layer <b>${a.layers[d]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${xe(L)}</code></div>`,ct(i,d),R(),le(),W.style.visibility="hidden",W.classList.add("ll-visible"),en(b),W.style.visibility="",Jt(),ue()}function ct(i,d){let c=a.cells[i][d],x="";c.topk.forEach((b,L)=>{let T=U(b.token),k=T?`background:${T}22;border-left-color:${T};`:"";x+=`<div class="ll-topk${T?" ll-topk-pinned":""}" data-ki="${L}" style="${k}" title="click to track trajectory"><span class="ll-topk-tok">${tt(b.token)}</span><span class="ll-topk-prob">${(b.prob*100).toFixed(1)}%</span></div>`}),Le.innerHTML=x,Le.querySelectorAll(".ll-topk").forEach(b=>{let L=parseInt(b.dataset.ki),T=c.topk[L];b.addEventListener("mouseenter",()=>{let k=N(i,T.token);k&&le({values:k.map($=>$??null),label:ye(T.token),color:"#999"})}),b.addEventListener("mouseleave",()=>le()),b.addEventListener("click",k=>{k.stopPropagation(),P(T.token),R(),ct(i,d),le(),ue()})})}function en(i){let x=W.offsetWidth||220,b=W.offsetHeight||160,L=6,T=window.innerWidth-x-6,k=6,$=window.innerHeight-b-6,C=[{left:i.right+6,top:i.top},{left:i.left-6-x,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-b}],z=C[0];for(let j of C)if(j.left>=L&&j.left<=T&&j.top>=k&&j.top<=$){z=j;break}W.style.left=Math.max(L,Math.min(z.left,T))+"px",W.style.top=Math.max(k,Math.min(z.top,$))+"px"}function pt(){s.openPopup=null,W.classList.remove("ll-visible"),Ne(),R(),le()}document.getElementById(n+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),pt()});let K=null;S.addEventListener("mousemove",i=>{let d=i.target.closest(".ll-cell");if(!d){K&&(K.classList.remove("ll-cell-hover"),K=null),Fe();return}K!==d&&(K&&K.classList.remove("ll-cell-hover"),K=d,K.classList.add("ll-cell-hover"));let c=parseInt(d.dataset.row),x=parseInt(d.dataset.layer);Zt(c,x,i.clientX,i.clientY)}),S.addEventListener("mouseleave",()=>{K&&(K.classList.remove("ll-cell-hover"),K=null),Fe()}),S.addEventListener("click",i=>{let d=i.target.closest(".ll-cell");if(d){let x=parseInt(d.dataset.row),b=parseInt(d.dataset.layer);Fe(),Kt(x,b,d);return}let c=i.target.closest(".ll-row-grid");c&&dt(parseInt(c.dataset.row))}),S.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let d=s.selectedRow??-1,c=i.key==="ArrowDown"?Math.min(M-1,d+1):Math.max(0,d-1);dt(c,void 0,!0)}),de.addEventListener("click",i=>{let d=i.target.closest("[data-nav]");if(!d||d.hasAttribute("disabled"))return;let c=d.dataset.nav;c==="panL"?Ae(-Math.max(1,Math.floor(s.viewSize/4))):c==="panR"?Ae(Math.max(1,Math.floor(s.viewSize/4))):c==="zoomIn"?st(-1):c==="zoomOut"?st(1):c==="reset"&&Ut()});function je(){R(),J(),le(),requestAnimationFrame(()=>{m||(R(),J(),pe||We())})}function Ve(){Xe(D,v(),W)}function ue(){w("stateChange",ft())}je(),Re(),Ve();let Ue=0,ht=l?.clientWidth??0,ut=l?.clientHeight??0,mt=new ResizeObserver(()=>{let i=l?.clientWidth??0,d=l?.clientHeight??0;i===ht&&d===ut||(ht=i,ut=d,!Ue&&(Ue=requestAnimationFrame(()=>{Ue=0,!m&&(R(),pe||We())})))});l&&mt.observe(l);let tn=$e(l,i=>{s.darkModeOverride===null&&(Xe(D,i,W),R(),J(),le())});function ft(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(i=>({tokens:[i.token],color:i.color})),darkMode:s.darkModeOverride}}return{widget:{getState:ft,setState:i=>{i.ramp!==void 0&&(s.ramp=i.ramp),i.showGrid!==void 0&&(s.showGrid=i.showGrid),i.dimLowProb!==void 0&&(s.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(s.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(s.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(s.viewStart=i.viewStart),i.viewSize!==void 0&&(s.viewSize=i.viewSize),i.colorIndex!==void 0&&(s.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(s.pinned=f(i.pinnedGroups)),i.darkMode!==void 0&&(s.darkModeOverride=i.darkMode),O(),Ve(),je()},setData:i=>{u=Ye(i),a=u.normalized,h=u.v2Data,O(),s.selectedRow=null,s.selectedLayerIdx=null,je(),Re()},setTitle:()=>{},setThemeMode:i=>{s.darkModeOverride=!!i,Ve(),R(),J(),le()},getThemeMode:()=>v(),hasEntropyData:()=>!!h&&Array.isArray(h.entropy)&&h.entropy.length>0,hasRankData:()=>{if(!h?.tracked)return!1;for(let i of h.tracked)for(let d in i){let c=i[d];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,d)=>{(g[i]||(g[i]=[])).push(d)},off:(i,d)=>{g[i]=(g[i]||[]).filter(c=>c!==d)},destroy:()=>{m=!0,tn(),mt?.disconnect(),Ne(),W.remove(),X&&(X.destroy(),X=null),l&&(l.innerHTML="")}},styleEl:r}}var Sn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',$n='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Cn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Hn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Pn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ie=class{constructor(e,o,n){this.widget=null;this.styleEl=null;let l=It(e,o,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,o){this.widget?.on(e,o)}off(e,o){this.widget?.off(e,o)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function Me(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function _t(t,e,o){let n=o.cellWidth??44,l=o.rowHeaderWidth??100,u=o.darkMode??!1,a="";a+="<colgroup>",a+=`<col style="width:${l}px;">`;for(let r=0;r<e.columns.length;r++)a+=`<col style="width:${n}px;">`;a+="</colgroup>";let h=o.maxRows!=null?Math.min(e.rows.length,o.maxRows):e.rows.length;for(let r=0;r<h;r++){let f=e.rows[r];a+="<tr>";let s=`width:${l}px;max-width:${l}px;`;f.pinned&&(s+=u?"background:#4a4a00;color:#fff;":"background:#fff59d;"),a+=`<td class="hm-row-header${f.pinned?" hm-pinned":""}" data-row="${r}" title="${Me(f.label)}" style="${s}">`,a+=Me(f.label),a+="</td>";for(let g=0;g<e.columns.length;g++){let w=e.getCellValue(r,g),p=`background:${w.color};color:${w.textColor};width:${n}px;max-width:${n}px;`;w.highlighted&&w.highlightColor&&(p+=`box-shadow:inset 0 0 0 2px ${w.highlightColor};`),w.bold&&(p+="font-weight:bold;"),a+=`<td class="hm-cell${w.highlighted?" hm-highlighted":""}" data-row="${r}" data-col="${g}" style="${p}">`,a+=Me(w.text),a+="</td>"}a+="</tr>"}a+="<tr>",a+=`<th class="hm-corner" style="width:${l}px;max-width:${l}px;">${Me(o.cornerLabel??"Layer")}</th>`;for(let r=0;r<e.columns.length;r++)a+=`<th class="hm-col-header" style="width:${n}px;max-width:${n}px;">${Me(e.columns[r].label)}</th>`;return a+="</tr>",a}function Dn(t){return`
        .heatmap-${t} {
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed;
        }
        .heatmap-${t} td, .heatmap-${t} th {
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        .heatmap-${t} .hm-cell {
            height: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 0.9em;
            cursor: pointer;
            position: relative;
        }
        .heatmap-${t} .hm-cell:hover {
            outline: 2px solid #e91e63;
            outline-offset: -1px;
        }
        .heatmap-${t} .hm-row-header {
            padding: 2px 8px;
            text-align: right;
            font-weight: 500;
            color: #333;
            background: #f5f5f5;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: monospace;
            cursor: pointer;
            position: relative;
        }
        .heatmap-${t} .hm-row-header:hover {
            background: #e8e8e8;
        }
        .heatmap-${t} .hm-col-header {
            padding: 4px 2px;
            text-align: center;
            font-weight: 500;
            color: #666;
            background: #f5f5f5;
            position: relative;
        }
        .heatmap-${t} .hm-corner {
            padding: 4px 8px;
            text-align: right;
            font-weight: 500;
            color: #666;
            background: white;
            position: relative;
        }
        /* Dark mode */
        .heatmap-${t}.hm-dark td, .heatmap-${t}.hm-dark th {
            border-color: #444;
        }
        .heatmap-${t}.hm-dark .hm-row-header {
            background: #2d2d2d;
            color: #e0e0e0;
        }
        .heatmap-${t}.hm-dark .hm-row-header:hover {
            background: #3d3d3d;
        }
        .heatmap-${t}.hm-dark .hm-col-header {
            background: #2d2d2d;
            color: #aaa;
        }
        .heatmap-${t}.hm-dark .hm-corner {
            background: #1e1e1e;
            color: #aaa;
        }
    `}function Bt(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Dn(t),document.head.appendChild(e),e}var In=0,_e=class{constructor(e,o,n={}){this.destroyed=!1;this.container=e,this.data=o,this.options={cellWidth:44,rowHeaderWidth:100,darkMode:!1,...n},this.uid="hm_"+ ++In+"_"+Date.now().toString(36),this.styleEl=Bt(this.uid),this.table=document.createElement("table"),this.table.className=`heatmap-${this.uid}`,e.appendChild(this.table),this.render()}render(){if(this.destroyed)return;let e=_t(this.uid,this.data,this.options);this.table.innerHTML=e,this.options.darkMode?this.table.classList.add("hm-dark"):this.table.classList.remove("hm-dark"),this.attachListeners()}attachListeners(){this.table.querySelectorAll(".hm-cell").forEach(e=>{let o=parseInt(e.dataset.row),n=parseInt(e.dataset.col);e.addEventListener("mouseenter",()=>{this.options.onCellHover?.(o,n)}),e.addEventListener("mouseleave",()=>{this.options.onCellLeave?.()}),e.addEventListener("click",l=>{l.stopPropagation(),this.options.onCellClick?.(o,n)})}),this.table.querySelectorAll(".hm-row-header").forEach(e=>{let o=parseInt(e.dataset.row);e.addEventListener("click",n=>{n.stopPropagation(),this.options.onRowHeaderClick?.(o)})})}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.table}getTableWidth(){return this.table.offsetWidth}destroy(){this.destroyed=!0,this.container.removeChild(this.table),this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var _n='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Bn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',zn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',nt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function ot(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function zt(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${nt};`;let o={isOpen:!1,searchQuery:""},n=At(e,t,o);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=o,e}function Te(t,e){let o=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;o&&o();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=At(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function Ot(t){let e=t.__tokenSelectorCleanup;e&&e()}function At(t,e,o){t.innerHTML="";let n=ot(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:a,onChange:h}=e,r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let f=document.createElement("span");if(f.style.cssText=`font-size:11px;color:${n.fgMuted};`,f.textContent=`Tokens (${l.length})`,r.appendChild(f),!it(u,a)){let v=document.createElement("button");v.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${nt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,v.innerHTML=`${_n} Reset`,v.addEventListener("mouseenter",()=>{v.style.color=n.fg}),v.addEventListener("mouseleave",()=>{v.style.color=n.fgMuted}),v.addEventListener("click",()=>{h(Array.from(a))}),r.appendChild(v)}t.appendChild(r);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{P(),p.focus()});let w=Array.from(u).sort((v,y)=>v-y);for(let v of w){let y=On(v,l[v],e.darkMode,()=>{let I=new Set(u);I.delete(v),h(Array.from(I))});g.appendChild(y)}let p=document.createElement("input");p.type="text",p.placeholder=w.length===0?"Search tokens...":"",p.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${nt};min-width:60px;flex:1;padding:2px 0;`,p.addEventListener("input",()=>{o.searchQuery=p.value,U()}),p.addEventListener("focus",()=>P()),g.appendChild(p);let M=document.createElement("span");M.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,M.innerHTML=zn,M.addEventListener("click",v=>{v.stopPropagation(),o.isOpen?N():P()}),g.appendChild(M),t.appendChild(g);let H=document.createElement("div");H.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let F=document.createElement("div");F.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",H.appendChild(F);let O=document.createElement("div");O.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,O.textContent="No tokens found",H.appendChild(O),t.appendChild(H);function U(){F.innerHTML="";let v=o.searchQuery.toLowerCase(),y=0;for(let I=0;I<l.length;I++){let A=l[I];if(v&&!A.toLowerCase().includes(v))continue;y++;let D=u.has(I),S=An(I,A,D,e.darkMode,()=>{let ee=new Set(u);D?ee.delete(I):ee.add(I),h(Array.from(ee))});F.appendChild(S)}O.style.display=y===0?"":"none"}function P(){o.isOpen||(o.isOpen=!0,H.style.display="",M.style.transform="rotate(180deg)",U())}function N(){o.isOpen&&(o.isOpen=!1,H.style.display="none",M.style.transform="",p.value="",o.searchQuery="")}function B(v){t.contains(v.target)||N()}return document.addEventListener("mousedown",B),o.isOpen&&(H.style.display="",M.style.transform="rotate(180deg)",p.value=o.searchQuery,U(),requestAnimationFrame(()=>{p.isConnected&&p.focus()})),()=>{document.removeEventListener("mousedown",B)}}function On(t,e,o,n){let l=ot(o),u=V[t%V.length],a=document.createElement("div");a.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,a.addEventListener("mouseenter",()=>{a.style.background=l.chipHoverBg,a.style.borderColor=l.chipHoverBorder}),a.addEventListener("mouseleave",()=>{a.style.background=l.chipBg,a.style.borderColor=l.chipBorder});let h=document.createElement("span");h.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,a.appendChild(h);let r=document.createElement("span");r.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,r.innerHTML=be(e),r.title=e,a.appendChild(r);let f=document.createElement("button");return f.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,f.innerHTML=Bn,f.addEventListener("mouseenter",()=>{f.style.color=l.badgeText}),f.addEventListener("mouseleave",()=>{f.style.color=l.fgMuted}),f.addEventListener("click",s=>{s.stopPropagation(),n()}),a.appendChild(f),a}function An(t,e,o,n,l){let u=ot(n),a=V[t%V.length],h=document.createElement("div");h.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",h.addEventListener("mouseenter",()=>{h.style.background=u.hoverBg}),h.addEventListener("mouseleave",()=>{h.style.background="transparent"}),h.addEventListener("click",g=>{g.stopPropagation(),l()});let r=document.createElement("span");r.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${o?a:"transparent"};border:1.5px solid ${o?a:u.fgMuted};`,h.appendChild(r);let f=document.createElement("span");f.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${o?u.fg:u.fgMuted};`,f.innerHTML=be(e),f.title=e,h.appendChild(f);let s=t===0?"source pred":t===1?"target pred":null;if(s){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,g.textContent=s,h.appendChild(g)}if(o){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,g.textContent="selected",h.appendChild(g)}return h}function it(t,e){if(t.size!==e.size)return!1;for(let o of t)if(!e.has(o))return!1;return!0}var Rn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Wn=["probability","prob_diff","rank"],Be=class{constructor(e,o,n={}){this.modeButtons=new Map;this.container=e,this.allData=o,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=o.tokenLabels?.length??o.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(h,r)=>r);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=zt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let a=document.createElement("div");a.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(a),this.linePlot=new ae(a,this.buildPlotData(),this.buildPlotOptions()),a.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let o of Wn){let n=document.createElement("button");n.textContent=Rn[o],this.applyModeButtonStyles(n,o===this.mode),n.addEventListener("click",()=>this.setMode(o)),n.addEventListener("mouseenter",()=>{o!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{o!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(o,n)}return e}applyModeBarStyles(e){let o=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${o};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,o){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${o?l:"transparent"};color:${o?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,o]of this.modeButtons)this.applyModeButtonStyles(o,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),o=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((a,h)=>a-h),l=this.mode==="rank";return{richLines:n.filter(a=>a<e.length).map(a=>({values:l?e[a].map(h=>h+1):e[a],label:o[a]??`Token ${a}`,color:V[a%V.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let o=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,o)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<o));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let o=this.getModeLines().length,n=new Set(e.filter(l=>l<o));it(n,this.selectedTokens)||(this.selectedTokens=n,Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Ot(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Fn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function lt(t,e,o){let n=Fn(t);if(!n)return null;let l=e(n);if(o===void 0){let u=$e(n,h=>l.setThemeMode(h)),a=l.destroy.bind(l);l.destroy=()=>{u(),a()}}return l}function Rt(t,e,o){return new Ie(t,e,o)}function Wt(t,e,o){return lt(t,n=>new ae(n,e,{darkMode:se(n),...o}),o?.darkMode)}function Ft(t,e,o){return lt(t,n=>new _e(n,e,{darkMode:se(n),...o}),o?.darkMode)}function Nt(t,e,o){return lt(t,n=>new Be(n,e,{darkMode:se(n),...o}),o?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Rt,window.LinePlotWidget=Wt,window.HeatmapTableWidget=Ft,window.ActivationPatchingWidget=Nt);return un(Nn);})();
//# sourceMappingURL=charts.js.map
