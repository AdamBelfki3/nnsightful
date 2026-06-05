"use strict";var InterpTools=(()=>{var Ke=Object.defineProperty;var bn=Object.getOwnPropertyDescriptor;var vn=Object.getOwnPropertyNames;var xn=Object.prototype.hasOwnProperty;var yn=(t,e)=>{for(var i in e)Ke(t,i,{get:e[i],enumerable:!0})},wn=(t,e,i,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of vn(e))!xn.call(t,l)&&l!==i&&Ke(t,l,{get:()=>e[l],enumerable:!(n=bn(e,l))||n.enumerable});return t};var Ln=t=>wn(Ke({},"__esModule",{value:!0}),t);var Qn={};yn(Qn,{ActivationPatchingWidget:()=>Xt,HeatmapTableWidget:()=>Yt,LinePlotWidget:()=>qt,LogitLensWidget:()=>Gt});function et(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let i=t.layers.length,n=t.input.length,l=[];for(let d=0;d<n;d++){let h=[],a=t.tracked[d];for(let f=0;f<i;f++){let r=t.topk[f][d],v=[];for(let p=0;p<r.length;p++){let T=r[p],P=a[T]||[],F=P[f]||0;v.push({token:T,prob:F,trajectory:P})}let L=v[0]||{token:"",prob:0,trajectory:[]};h.push({token:L.token,prob:L.prob,trajectory:L.trajectory,topk:v})}l.push(h)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function $t(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function ge(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function kn(t){let e=`#${t}`;return`
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
        #${t}_popup .ll-lead-space { color: #3b82f6; }
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
            -webkit-user-select: text; user-select: text;
        }
        #${t}_popup .ll-topk-prob { color: var(--p-muted); flex-shrink: 0; font-variant-numeric: tabular-nums; }
    `}function Ct(t){let e=document.createElement("style");return e.textContent=kn(t),document.head.appendChild(e),e}function tt(t,e,...i){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of i)l&&n(l)}var Ee=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],nt=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var U=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function be(t){return t.richLines&&t.richLines.length>0?t.richLines.map((i,n)=>({values:i.values,label:i.label??`Line ${n+1}`,color:i.color,dashPattern:i.dashPattern,isOverlay:i.isOverlay,removable:i.removable})):(t.lines??[]).map((i,n)=>({values:i,label:t.labels?.[n]??`Line ${n+1}`}))}function ve(t){if(!t)return"";let e=[],i=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),i=1);let n="";for(;i<t.length;i++){let l=t[i];l===`
`?(n&&(e.push(Ht(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(Ht(n)),e.join("")}function Ht(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Mn(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let i of e)if(t<=i)return i;return 1}function Pt(t,e,i){let n=be(t),l=n.length>0?n[0].values.length:i?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",d=e.minValue,h=e.maxValue;if(d===void 0||h===void 0||e.autoScale){let a=[];for(let v of n)if(!v.isOverlay)for(let L of v.values)L!==null&&a.push(L);if(i)for(let v of i.values)v!==null&&a.push(v);if(a.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let f=1/0,r=-1/0;for(let v of a)v<f&&(f=v),v>r&&(r=v);if(e.centerYAxisAtZero){let L=Math.max(Math.abs(f),Math.abs(r))*1.1;d=-L,h=L}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(f))),h===void 0||e.autoScale){let v=Math.log(Math.max(1,f)),L=Math.log(Math.max(1,r)),p=L+.15*Math.max(1,L-v);h=Math.ceil(Math.exp(p))}}else d===void 0&&(d=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(f)):Math.floor(f*.9)),(h===void 0||e.autoScale)&&(u==="rank"?h=Math.ceil(r*1.1):u==="probability"?h=e.autoScale?Mn(Math.max(r,.001)):Math.min(r*1.1,1):h=r*1.1)}return{numLayers:l,minValue:d,maxValue:h,numLines:n.length}}function Dt(t,e,i,n,l,u,d,h){let a=t.getContext("2d"),f=e.getBoundingClientRect(),r=window.devicePixelRatio||1;t.width=f.width*r,t.height=f.height*r,t.style.width=`${f.width}px`,t.style.height=`${f.height}px`,a.scale(r,r);let v=f.width,L=f.height,p=n.darkMode??!1,T=n.title,P=n.mode||"probability",F=n.invertYAxis??!1,B=n.centerYAxisAtZero??!1,N=n.logScale??!1,H=n.xAxisLabel||"Layer",A=n.yAxisLabel||"Probability",I=n.xRangeStart??0;I>=l.numLayers-1&&(console.warn(`xRangeStart (${I}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),I=0);let y=n.showDataPoints??!0,w={top:T?48:24,right:24,bottom:56,left:72},D=v-w.left-w.right,z=L-w.top-w.bottom,K={margin:w,chartWidth:D,chartHeight:z,width:v,height:L},W={background:p?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:p?"#52525b":"#a1a1aa",grid:p?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:p?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:p?"#e4e4e7":"#27272a"};n.transparentBackground?a.clearRect(0,0,v,L):(a.fillStyle=W.background,a.fillRect(0,0,v,L)),T&&(a.fillStyle=W.titleText,a.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="left",a.fillText(T,w.left,28));let ee=l.numLayers-1-I,xe=g=>ee<=0?w.left+D/2:w.left+(g-I)/ee*D,ie=N?Math.log(Math.max(1,l.minValue)):0,R=N?Math.log(Math.max(1,l.maxValue)):0,O=g=>{let $;if(N){let C=Math.log(Math.max(1,g));$=R-ie>0?(C-ie)/(R-ie):.5}else $=(g-l.minValue)/(l.maxValue-l.minValue);return F?w.top+$*z:w.top+z-$*z};a.setLineDash([4,4]),a.strokeStyle=W.grid,a.lineWidth=1;let re=[],Me=l.maxValue-l.minValue,se=5;if(N){let g=new Set;for(let j=0;j<se;j++){let Q=ie+j/(se-1)*(R-ie),V=Math.round(Math.exp(Q));g.has(V)||(g.add(V),re.push(V))}let $=Math.round(Math.exp(ie)),C=Math.round(Math.exp(R));g.has($)||re.unshift($),g.has(C)||re.push(C)}else if(P==="rank")for(let g=0;g<se;g++)re.push(Math.round(l.minValue+g/(se-1)*Me));else for(let g=0;g<se;g++)re.push(l.minValue+g/(se-1)*Me);if(re.forEach(g=>{let $=O(g);a.beginPath(),a.moveTo(w.left,$),a.lineTo(w.left+D,$),a.stroke()}),a.setLineDash([]),B){let g=O(0);a.beginPath(),a.strokeStyle=p?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",a.lineWidth=1.5,a.moveTo(w.left,g),a.lineTo(w.left+D,g),a.stroke(),a.lineWidth=1}a.fillStyle=W.text,a.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="right",a.textBaseline="middle",re.forEach(g=>{let $=O(g),C;P==="probability"?C=g.toFixed(2):P==="prob_diff"?C=g>=0?`+${g.toFixed(2)}`:g.toFixed(2):C=Math.round(g).toString(),a.fillText(C,w.left-16,$)}),a.textAlign="center",a.textBaseline="top";let Ce=i.xLabels&&i.xLabels.length>0,He=Math.max(1,Math.ceil(l.numLayers/8));for(let g=0;g<l.numLayers;g+=He){let $=xe(g);if($<w.left-5||$>w.left+D+5)continue;let C=Ce?String(i.xLabels[g]??g):g.toString();a.fillText(C,$,w.top+z+12)}if((l.numLayers-1)%He!==0){let g=Ce?String(i.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();a.fillText(g,xe(l.numLayers-1),w.top+z+12)}a.strokeStyle=p?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",a.lineWidth=1.5,a.beginPath(),a.moveTo(w.left,w.top),a.lineTo(w.left,w.top+z),a.lineTo(w.left+D,w.top+z),a.stroke(),a.fillStyle=W.textMuted,a.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",a.textAlign="center",a.textBaseline="top",a.fillText(H.toUpperCase(),w.left+D/2,L-16),a.save(),a.translate(14,w.top+z/2),a.rotate(-Math.PI/2),a.textAlign="center",a.textBaseline="top",a.fillText(A.toUpperCase(),0,0),a.restore();let ye=be(i);function Z(g,$,C,j,Q){a.beginPath(),a.strokeStyle=$,a.lineWidth=C,Q!==void 0&&(a.globalAlpha=Q),j?a.setLineDash(j.split(",").map(Number)):a.setLineDash([]);let V=!1;for(let J=0;J<g.length;J++){let te=g[J];if(te===null){V=!1;continue}let ue=xe(J),we=O(te);V?a.lineTo(ue,we):(a.moveTo(ue,we),V=!0)}a.stroke(),a.setLineDash([]),Q!==void 0&&(a.globalAlpha=1)}let X=p?"#3f3f46":"#d4d4d8";if(a.lineCap="round",a.lineJoin="round",ye.forEach((g,$)=>{!u.has($)||g.isOverlay||Z(g.values,X,2,void 0,.35)}),ye.forEach((g,$)=>{if(u.has($)||g.isOverlay)return;let C=g.color??U[$%U.length];Z(g.values,C,4,g.dashPattern,.15),Z(g.values,C,2,g.dashPattern),y&&g.values.forEach((j,Q)=>{if(j===null)return;let V=xe(Q),J=O(j),te=d?.lineIdx===$&&d?.layerIdx===Q;a.beginPath(),a.strokeStyle=C,a.lineWidth=te?2:1.5,a.arc(V,J,te?5:3.5,0,Math.PI*2),a.stroke(),a.beginPath(),a.fillStyle=p?"#18181b":"#ffffff",a.arc(V,J,te?3.5:2.5,0,Math.PI*2),a.fill()})}),ye.forEach((g,$)=>{if(!g.isOverlay||u.has($))return;let C=g.color??"#999";Z(g.values,C,1.5,g.dashPattern??"4,2",.7)}),h){let g=h.color??"#999";Z(h.values,g,1.5,h.dashPattern??"4,2",.7)}return K}function It(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function Rt(t,e,i,n,l,u,d,h,a){let{margin:f,chartWidth:r,chartHeight:v}=l,L=n.xRangeStart??0,p=d-1-L,T=n.logScale?Math.log(Math.max(1,h)):0,P=n.logScale?Math.log(Math.max(1,a)):0;if(t<f.left||t>f.left+r||e<f.top||e>f.top+v)return null;let F=be(i),B=null,N=1/0,H=20;for(let A=0;A<F.length;A++){if(u.has(A))continue;let I=F[A];if(!I.isOverlay)for(let y=0;y<I.values.length;y++){let w=I.values[y];if(w===null)continue;let D=p<=0?f.left+r/2:f.left+(y-L)/p*r,z;if(n.logScale){let ee=Math.log(Math.max(1,w));z=P-T>0?(ee-T)/(P-T):.5}else z=(w-h)/(a-h);let K=n.invertYAxis?f.top+z*v:f.top+v-z*v,W=Math.sqrt((t-D)**2+(e-K)**2);W<N&&W<H&&(N=W,B={visible:!0,x:D,y:K,lineIdx:A,layerIdx:y,value:w,label:I.label,color:I.color??U[A%U.length]})}}return B}function ot(t,e,i,n,l,u,d){if(!e){t.style.opacity="0";return}let h=n?"#27272a":"#fff",a=n?"#3f3f46":"#e4e4e7",f=n?"#fafafa":"#18181b",r=n?"#a1a1aa":"#71717a",L=e.x>i/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${L},-50%);`;let p=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
        <div style="background:${h};border:1px solid ${a};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${f};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${ve(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${r}">${u??"Layer"}</span>
                    <span style="font-weight:500;color:${f}">${p}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${r}">Value</span>
                    <span style="font-weight:500;color:${f}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Tn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',En='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Sn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function _t(t){let e=document.createElement("div");return Bt(e,t),e}function Bt(t,e){let i=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${i};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function Ot(t,e,i,n,l,u){Bt(t,n),t.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",h=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",a=n?"#a1a1aa":"#71717a",f=n?"#3f3f46":"#d4d4d8",r="rgba(161,161,170,0.3)",v=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",L=u?be(u):[];e.forEach((p,T)=>{let P=L[T];if(P?.isOverlay)return;let F=P?.color??U[T%U.length],B=i.has(T),N=P?.removable??!1,H=document.createElement("button");H.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${B?"0.5":"1"};`,H.addEventListener("mouseenter",()=>{H.style.background=v}),H.addEventListener("mouseleave",()=>{H.style.background="transparent"}),H.addEventListener("click",()=>l.onToggle(T));let A=document.createElement("span");A.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${B?r:F};background:${B?f:"transparent"};`,H.appendChild(A);let I=document.createElement("span");if(I.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${B?h:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,I.title=p,I.innerHTML=ve(p),H.appendChild(I),N&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${a};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=Sn,y.title="Remove",y.addEventListener("click",w=>{w.stopPropagation(),l.onRemove(T)}),H.appendChild(y),H.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),H.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${a};opacity:${B?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=B?En:Tn,H.appendChild(y),B||(H.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),H.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}t.appendChild(H)})}var pe=class{constructor(e,i,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let i=this.canvas.getBoundingClientRect(),n=e.clientX-i.left,l=e.clientY-i.top;this.tooltip=Rt(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),ot(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,ot(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=i,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=It(this.chartContainer),this.legendEl=_t(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let d=Math.round(u.contentRect.width),h=Math.round(u.contentRect.height);d===this.lastWidth&&h===this.lastHeight||(this.lastWidth=d,this.lastHeight=h,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,i)=>e.label??`Line ${i+1}`):this.data.labels||(this.data.lines??[]).map((e,i)=>`Line ${i+1}`)}draw(){this.config=Pt(this.data,this.options,this.overlay),this.config&&(this.geometry=Dt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",Ot(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:i=>this.toggleLine(i),onRemove:this.options.onLineRemoved?i=>{this.removeLine(i,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(i)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((i,n)=>({values:i,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,i=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,i||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function it(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let i=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(i){let n=i[1],l,u,d,h=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(h=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(h=parseInt(n.slice(6,8),16)/255)),[l,u,d,h]}return null}function lt(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function $n(t){let e=t;for(;e;){let i=lt(it(getComputedStyle(e).backgroundColor));if(i!==null)return i;e=e.parentElement}if(typeof document<"u")for(let i of[document.body,document.documentElement]){if(!i)continue;let n=lt(it(getComputedStyle(i).backgroundColor));if(n!==null)return n}return null}function Cn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let i=lt(it(e));return i===null?null:i<.5}function De(t,e){let i=he(t),n=()=>{let d=he(t);d!==i&&(i=d,e(d))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function he(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=Cn();if(e!==null)return e;let i=$n(t??null);return i!==null?i<.5:!1}var Ie=60,Re=30,Hn=22,_e=48,Pn=18,zt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Dn="#cc6622";function In(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var At=41;function rt(t,e,i){let[n,l,u]=In(e),d=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(i){let a=f=>Math.round(At+(f-At)*d);return`rgb(${a(n)}, ${a(l)}, ${a(u)})`}let h=a=>Math.round(255-(255-a)*d);return`rgb(${h(n)}, ${h(l)}, ${h(u)})`}function Rn(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function st(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-space">_</span>'+ge(t.slice(1)):ge(t)}function ke(t){return t==null?"":t.startsWith(" ")?"_"+t.slice(1):t}function Be(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Wt(t,e,i){let n=$t(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=et(e),d=u.normalized,h=u.v2Data,a=Ct(n);function f(o){return o?o.map(s=>({token:s.tokens?.[0]??"",color:s.color})).filter(s=>s.token!==""):[]}let r={ramp:i?.ramp||"purple",showGrid:i?.showGrid??!0,dimLow:i?.dimLowProb??!0,selectedRow:i?.selectedRow??null,selectedLayerIdx:i?.selectedLayer??null,viewStart:i?.viewStart??0,viewSize:i?.viewSize??d.layers.length,darkModeOverride:i?.darkMode??null,pinned:f(i?.pinnedGroups),pinnedRows:(i?.pinnedRows??[]).map(o=>o.pos).filter(o=>typeof o=="number"),colorIndex:i?.colorIndex??0,openPopup:null},v={};function L(o,s){(v[o]||[]).forEach(c=>c(s))}let p=d.layers.length,T=d.tokens.length,P=[],F="";function B(){p=d.layers.length,T=d.tokens.length,P=[];for(let s=0;s<p;s++){let c=0;for(let b=0;b<T;b++){let m=d.cells[b]?.[s];m&&m.prob>c&&(c=m.prob)}P.push(c)}F=d.cells[T-1]?.[p-1]?.token??"",r.pinnedRows=r.pinnedRows.filter(s=>s>=0&&s<T),r.selectedRow!==null&&r.selectedRow>=T&&(r.selectedRow=null),(r.viewSize>p||r.viewSize<1)&&(r.viewSize=p);let o=Math.max(0,p-r.viewSize);r.viewStart>o&&(r.viewStart=o),r.viewStart<0&&(r.viewStart=0)}B();function N(o){let s=r.pinned.find(c=>c.token===o);return s?s.color:null}function H(o){let s=r.pinned.findIndex(c=>c.token===o);s>=0?r.pinned.splice(s,1):(r.pinned.push({token:o,color:Ee[r.colorIndex%Ee.length]}),r.colorIndex++)}function A(o,s){let c=h?.tracked?.[o];if(c&&Array.isArray(c[s]))return c[s];for(let b=0;b<p;b++){let m=d.cells[o]?.[b]?.topk.find(x=>x.token===s);if(m)return m.trajectory}return null}function I(o){let s=r.pinnedRows.indexOf(o);return nt[(s<0?0:s)%nt.length]}function y(o){return r.pinnedRows.indexOf(o)>=0}function w(o,s){for(let c of r.pinned){let b=A(o,c.token);if(!b)continue;let m=0;for(let x of b)x!=null&&x>m&&(m=x);if(m>=s)return!0}return!1}function D(o){let s=null,c=0;for(let b=0;b<p;b++){let m=d.cells[o]?.[b];m&&m.prob>c&&(c=m.prob,s=m.token)}return c>=.05?s:null}function z(o){let s=r.pinnedRows.indexOf(o);if(s>=0){r.pinnedRows.splice(s,1);return}if(!w(o,.01)){let c=D(o);c&&!N(c)&&(r.pinned.push({token:c,color:Ee[r.colorIndex%Ee.length]}),r.colorIndex++)}r.pinnedRows.push(o)}function K(){return zt[r.ramp]||zt.purple}function W(){return r.darkModeOverride!==null?r.darkModeOverride:he(l)}function ee(){let o=O.clientWidth;if(o>0)return o;let s=l?.clientWidth??0;return s>0?s-42:900}function xe(){let o=Math.floor((ee()-Ie)/_e);return Math.max(1,Math.min(Pn,o))}function ie(){let o=Math.max(0,p-r.viewSize),s=Math.max(0,Math.min(o,r.viewStart)),c=r.viewSize,b=xe();if(c<=b){let E=[];for(let M=0;M<c;M++)E.push(s+M);return{shownLayers:E,stride:1,start:s}}let m=Math.max(1,b-1),x=Math.ceil(c/m),k=[];for(let E=s;E<s+c;E+=x)k.push(E);let S=s+c-1;return k[k.length-1]!==S&&k.push(Math.min(p-1,S)),{shownLayers:k,stride:x,start:s}}l.innerHTML=`
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
    `;let R=document.getElementById(n),O=document.getElementById(n+"_scroll"),re=document.getElementById(n+"_hdr"),Me=document.getElementById(n+"_nav"),se=document.getElementById(n+"_lp_wrap"),Ce=document.getElementById(n+"_lp_token"),He=document.getElementById(n+"_lp_box"),ye=document.getElementById(n+"_lp"),Z=document.getElementById(n+"_tt"),X=document.getElementById(n+"_popup"),g=document.getElementById(n+"_popup_hdr"),$=document.getElementById(n+"_popup_body");document.body.appendChild(X);let C=null,j=null,Q=!0,V=!1,J=getComputedStyle(R).getPropertyValue("--ll-aspect-ratio").trim(),te=!J;te&&R.classList.add("ll-fill");let ue=(()=>{if(!J||/^(unbounded|none|auto)$/i.test(J))return null;let o=J.split("/").map(s=>parseFloat(s.trim()));return o.length!==2||isNaN(o[0])||isNaN(o[1])||o[0]===0||o[1]===0?null:o[1]/o[0]})(),we=_e,We=Re;function Qt(){let o=ee(),s=ie().shownLayers.length;if(we=s>0?Math.max(_e,Math.floor((o-Ie)/s)):_e,!te){We=Re;return}let c=O.clientHeight;We=T>0&&T*Re<c?Math.floor(c/T):Re}function Zt(o,s){let c=s?"#bbb":"#555",b=o?` stroke-dasharray="${ge(o)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${b}/></svg>`}function G(){let o=K(),s=W(),c=r.showGrid?s?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(te){let M=l.clientWidth;R.style.width=M>0?M+"px":"100%",R.style.maxWidth="100%",R.style.maxHeight="",O.style.maxHeight=""}else{R.style.width="",R.style.maxWidth="",O.style.maxHeight="";let M=l.clientWidth||R.clientWidth;if(ue&&M>0){let q=R.offsetHeight-O.offsetHeight,le=(q>0?q:140)+90;R.style.maxHeight=Math.max(le,Math.round(M*ue))+"px"}else R.style.maxHeight=""}Qt();let{shownLayers:b}=ie(),m=b.length,x=Math.round(Ie+we*m),k=`${Ie}px repeat(${m}, ${we}px)`,S=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${k};height:${Hn+6}px;width:${x}px;min-width:${x}px;">`;S+='<div class="ll-corner">token</div>';for(let M of b)S+=`<div class="ll-hdr-cell">${d.layers[M]}</div>`;S+="</div>",re.innerHTML=S;let E=`<div class="ll-grid-inner" style="width:${x}px;min-width:${x}px;">`;for(let M=0;M<T;M++){let _=d.tokens[M],q=Be(_),le=y(M),Le=M===r.selectedRow||le;E+=`<div class="ll-row" data-rowwrap="${M}">`,Le&&(E+='<div class="ll-row-rail"></div>'),E+=`<div class="ll-row-grid${Le?" ll-row-sel":""}" data-row="${M}" style="display:grid;grid-template-columns:${k};height:${We}px;">`,E+=`<div class="ll-row-label" title="click to pin this position's trajectories">`,le&&(E+=Zt(I(M).dash,s)),E+=q?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${Le?"font-weight:600;":""}">${st(_)}</span>`,E+="</div>",b.forEach((Pe,Y)=>{let de=d.cells[M][Pe],fe=de.prob,Ze=F!==""&&de.token===F,kt=rt(fe,Ze?Dn:o,s),un=Rn(fe,s),mn=fe<.18,fn=r.dimLow&&mn?"opacity:0.55;":"",Je=N(de.token),gn=Je?`box-shadow:inset 0 0 0 2px ${Je};`:"",Mt=M===0,Tt=M===T-1,Et=Y===0,St=Y===m-1,Te="";Mt&&Et?Te="border-top-left-radius:8px;":Mt&&St?Te="border-top-right-radius:8px;":Tt&&Et?Te="border-bottom-left-radius:8px;":Tt&&St&&(Te="border-bottom-right-radius:8px;"),E+=`<div class="ll-cell${Je?" ll-cell-pinned":""}" data-row="${M}" data-layer="${Pe}" style="background:${kt};color:${un};padding:0 6px;${fn}${c}${gn}${Te}"><span class="ll-cell-text">${st(de.token)}</span></div>`}),E+="</div></div>"}E+="</div>",O.innerHTML=E}function ce(){let o=K(),s=W(),{stride:c,start:b}=ie(),m=r.viewSize,x=m>=p,k=ht(),S=m<=k[0],E='<span class="ll-nav-range-key">layers</span>';x?E+=`all ${p}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):E+=`${b}\u2013${b+m-1}<span class="ll-dim"> / ${p}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let M="";for(let Y=0;Y<p;Y++){let de=P[Y]||0,fe=Math.max(8,Math.round(de*92));M+=`<div class="ll-skyline-bar" style="height:${fe}%;background:${rt(de,o,s)}"></div>`}let _=b/p*100,q=m/p*100,le=[];for(let Y=0;Y<p;Y+=8)le.push(Y);le[le.length-1]!==p-1&&le.push(p-1);let Le="",Pe=Math.max(1,p-1);for(let Y of le){let de=Y===p-1,fe=Y===0,Ze=Y/Pe*100;Le+=`<span class="ll-nav-tick" style="left:${Ze}%;transform:${de?"translateX(-100%)":fe?"translateX(0)":"translateX(-50%)"}">${d.layers[Y]}</span>`}Me.innerHTML=`
            <div class="ll-nav-range">${E}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${M}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${_}%;width:${q}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${Le}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${b<=0?"disabled":""}>${Bn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${b+m>=p?"disabled":""}>${On}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${S?"disabled":""}>${zn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${x?"disabled":""}>${An}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${_n}</button>
            </div>
        `,tn()}function Jt(){let o=document.getElementById(n+"_win");if(!o)return;let s=Math.max(0,p-r.viewSize),c=Math.max(0,Math.min(s,r.viewStart));o.style.left=c/p*100+"%",o.style.width=r.viewSize/p*100+"%"}function ht(){return Array.from(new Set([p,48,32,20,14,10,8])).filter(o=>o<=p&&o>=1).sort((o,s)=>o-s)}function Fe(o){return Math.max(0,Math.min(Math.max(0,p-r.viewSize),o))}let Ne=!1;function ut(){Ne||(Ne=!0,requestAnimationFrame(()=>{Ne=!1,!V&&(G(),Jt())}))}function je(o){let s=Fe(r.viewStart+o);s!==r.viewStart&&(r.viewStart=s,G(),ce(),ae())}function Kt(o){let s=Fe(o);s!==r.viewStart&&(r.viewStart=s,ut())}function mt(o,s){let c=ht(),b=c.findIndex(S=>S>=r.viewSize),m=b===-1?c.length-1:b,x=o<0?Math.max(0,m-1):Math.min(c.length-1,m+1),k=c[x];k!==r.viewSize&&(r.viewSize=k,r.viewStart=Math.max(0,Math.min(p-k,Math.round(s-k/2))),G(),ce(),ae())}function ft(o){mt(o,r.viewStart+r.viewSize/2)}function en(){r.viewSize=p,r.viewStart=0,G(),ce(),ae()}let me=null;function tn(){let o=document.getElementById(n+"_sky");if(!o)return;o.addEventListener("pointerdown",c=>{let b=o.getBoundingClientRect(),m=c.clientX-b.left,x=b.width/p,k=Math.max(0,p-r.viewSize),S=Math.max(0,Math.min(k,r.viewStart)),E=S*x,M=(S+r.viewSize)*x,_=S;(m<E||m>M)&&(_=Fe(Math.round(m/x)-Math.floor(r.viewSize/2)),r.viewStart=_,ut()),me={startX:m,startStart:_,layerW:x},o.classList.add("ll-grabbing");try{o.setPointerCapture(c.pointerId)}catch{}}),o.addEventListener("pointermove",c=>{if(!me)return;let b=o.getBoundingClientRect(),x=(c.clientX-b.left-me.startX)/me.layerW;Kt(Math.round(me.startStart+x))});let s=c=>{if(me){me=null,o.classList.remove("ll-grabbing");try{o.releasePointerCapture(c.pointerId)}catch{}ce(),ae()}};o.addEventListener("pointerup",s),o.addEventListener("pointercancel",s),o.addEventListener("wheel",c=>{c.preventDefault();let b=o.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){je(c.deltaX>0?1:-1);return}let m=Math.round((c.clientX-b.left)/b.width*p);mt(c.deltaY<0?-1:1,m)},{passive:!1})}function nn(o,s,c=!1){r.selectedRow=o,r.selectedLayerIdx=s??d.layers.length-1,G(),ne(),c&&on(o),ae()}function on(o){let s=O.querySelector(`[data-rowwrap="${o}"]`);if(!s)return;let c=s.offsetTop-O.clientHeight/2+s.offsetHeight/2;O.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function Ve(){requestAnimationFrame(()=>requestAnimationFrame(()=>{V||(O.scrollTop=O.scrollHeight)}))}let ln=.45,rn=120,sn=360;function Ue(){let o;if(ue)o=(l.clientWidth||R.clientWidth)*ue;else{let c=R.clientHeight;o=c>0?c:(R.clientWidth||900)*.6}let s=Math.round(o*ln);He.style.height=Math.max(rn,Math.min(sn,s))+"px"}function gt(o){return o+"\xB7"+(Be(d.tokens[o])?"bos":ke(d.tokens[o]))}function ne(o){let s=r.pinnedRows.length>0?r.pinnedRows:r.selectedRow!==null?[r.selectedRow]:[],c=s.length>1,b=[];for(let x of s){let k=I(x);for(let S of r.pinned){let E=A(x,S.token);if(!E)continue;let M=ke(S.token);c&&(M+=" ("+gt(x)+")"),b.push({values:E.map(_=>_??null),label:M,color:S.color,dashPattern:k.dash||void 0,removable:!1})}}let m=b.length===0&&!o;if(m)se.classList.add("ll-hidden");else{se.classList.remove("ll-hidden"),Ue(),Ce.textContent=r.pinnedRows.length>1?r.pinnedRows.length+" positions":s.length===1?"position "+gt(s[0]):"";let x={lines:[],richLines:b,xLabels:d.layers},k={darkMode:W(),mode:"probability",autoScale:!0,legendPosition:b.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};C?(C.setData(x),C.setOptions(k)):(ye.style.minHeight="0",C=new pe(ye,x,k)),o?C.setOverlay?.({values:o.values,label:o.label,color:o.color,dashPattern:"4,2",isOverlay:!0}):C.setOverlay?.(null)}te&&m!==Q?(Q=m,requestAnimationFrame(()=>{V||(G(),Ve())})):Q=m}function an(o,s,c,b){let m=d.cells[o]?.[s];if(!m)return;let x=K(),k=Be(d.tokens[o])?"bos":ke(d.tokens[o]);Z.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${rt(m.prob,x,W())}"></span><span class="ll-tt-token">${ge(ke(m.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(m.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[s]} / ${d.layers[p-1]}</span><span>position</span><span class="ll-tt-val">${o} \xB7 ${ge(k)}</span></div>`,Z.classList.add("ll-visible");let S=R.getBoundingClientRect(),E=Z.offsetWidth||220,M=Z.offsetHeight||90,_=c-S.left+16;c+E+24>window.innerWidth-8&&(_=c-S.left-E-12);let q=b-S.top-50;_=Math.max(6,Math.min(_,S.width-E-6)),q=Math.max(6,Math.min(q,S.height-M-6)),Z.style.left=_+"px",Z.style.top=q+"px"}function Ge(){Z.classList.remove("ll-visible")}function dn(){qe(),j=document.createElement("div"),j.style.cssText="position:fixed;inset:0;z-index:49;",j.addEventListener("mousedown",o=>{o.preventDefault(),o.stopPropagation(),vt()}),document.body.appendChild(j)}function qe(){j&&(j.remove(),j=null)}function cn(o,s,c){if(!d.cells[o]?.[s])return;let m=c.getBoundingClientRect();r.openPopup={row:o,layer:s},r.selectedRow=o,r.selectedLayerIdx=s;let x=Be(d.tokens[o])?"bos":ke(d.tokens[o]);g.innerHTML=`Layer <b>${d.layers[s]}</b>, Position <b>${o}</b><div class="ll-popup-sub">input <code>${ge(x)}</code></div>`,bt(o,s),G(),ne(),X.style.visibility="hidden",X.classList.add("ll-visible"),pn(m),X.style.visibility="",dn(),ae()}function bt(o,s){let c=d.cells[o][s],b="";c.topk.forEach((m,x)=>{let k=N(m.token),S=k?`background:${k}22;border-left-color:${k};`:"";b+=`<div class="ll-topk${k?" ll-topk-pinned":""}" data-ki="${x}" style="${S}" title="click to track trajectory"><span class="ll-topk-tok">${st(m.token)}</span><span class="ll-topk-prob">${(m.prob*100).toFixed(1)}%</span></div>`}),$.innerHTML=b,$.querySelectorAll(".ll-topk").forEach(m=>{let x=parseInt(m.dataset.ki),k=c.topk[x];m.addEventListener("mouseenter",()=>{let S=A(o,k.token);S&&ne({values:S.map(E=>E??null),label:ke(k.token),color:"#999"})}),m.addEventListener("mouseleave",()=>ne()),m.addEventListener("click",S=>{S.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(H(k.token),G(),bt(o,s),ne(),ae())})})}function pn(o){let b=X.offsetWidth||220,m=X.offsetHeight||160,x=6,k=window.innerWidth-b-6,S=6,E=window.innerHeight-m-6,M=[{left:o.right+6,top:o.top},{left:o.left-6-b,top:o.top},{left:o.left,top:o.bottom+6},{left:o.left,top:o.top-6-m}],_=M[0];for(let q of M)if(q.left>=x&&q.left<=k&&q.top>=S&&q.top<=E){_=q;break}X.style.left=Math.max(x,Math.min(_.left,k))+"px",X.style.top=Math.max(S,Math.min(_.top,E))+"px"}function vt(){r.openPopup=null,X.classList.remove("ll-visible"),qe(),G(),ne()}document.getElementById(n+"_popup_close").addEventListener("click",o=>{o.stopPropagation(),vt()});let oe=null;O.addEventListener("mousemove",o=>{let s=o.target.closest(".ll-cell");if(!s){oe&&(oe.classList.remove("ll-cell-hover"),oe=null),Ge();return}oe!==s&&(oe&&oe.classList.remove("ll-cell-hover"),oe=s,oe.classList.add("ll-cell-hover"));let c=parseInt(s.dataset.row),b=parseInt(s.dataset.layer);an(c,b,o.clientX,o.clientY)}),O.addEventListener("mouseleave",()=>{oe&&(oe.classList.remove("ll-cell-hover"),oe=null),Ge()}),O.addEventListener("click",o=>{if(!(window.getSelection()?.isCollapsed??!0))return;let s=o.target,c=s.closest(".ll-row-grid");if(!c)return;let b=parseInt(c.dataset.row);if(s.closest(".ll-row-label")){z(b),G(),ne(),ae();return}let m=s.closest(".ll-cell");if(m){let x=parseInt(m.dataset.layer);if(o.shiftKey){let k=d.cells[b]?.[x]?.token;k&&(H(k),G(),ne(),ae());return}Ge(),cn(b,x,m)}}),O.addEventListener("keydown",o=>{if(o.key!=="ArrowDown"&&o.key!=="ArrowUp")return;o.preventDefault();let s=r.selectedRow??-1,c=o.key==="ArrowDown"?Math.min(T-1,s+1):Math.max(0,s-1);nn(c,void 0,!0)}),Me.addEventListener("click",o=>{let s=o.target.closest("[data-nav]");if(!s||s.hasAttribute("disabled"))return;let c=s.dataset.nav;c==="panL"?je(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?je(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?ft(-1):c==="zoomOut"?ft(1):c==="reset"&&en()});function Ye(){G(),ce(),ne(),requestAnimationFrame(()=>{V||(G(),ce(),Q||Ue())})}function Xe(){tt(R,W(),X)}function ae(){L("stateChange",Lt())}Ye(),Ve(),Xe();let Qe=0,xt=l?.clientWidth??0,yt=l?.clientHeight??0,wt=new ResizeObserver(()=>{let o=l?.clientWidth??0,s=l?.clientHeight??0;o===xt&&s===yt||(xt=o,yt=s,!Qe&&(Qe=requestAnimationFrame(()=>{Qe=0,!V&&(G(),Q||Ue())})))});l&&wt.observe(l);let hn=De(l,o=>{r.darkModeOverride===null&&(tt(R,o,X),G(),ce(),ne())});function Lt(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,selectedLayer:r.selectedLayerIdx,viewStart:r.viewStart,viewSize:r.viewSize,colorIndex:r.colorIndex,pinnedGroups:r.pinned.map(o=>({tokens:[o.token],color:o.color})),pinnedRows:r.pinnedRows.map(o=>({pos:o,line:I(o).name})),darkMode:r.darkModeOverride}}return{widget:{getState:Lt,setState:o=>{o.ramp!==void 0&&(r.ramp=o.ramp),o.showGrid!==void 0&&(r.showGrid=o.showGrid),o.dimLowProb!==void 0&&(r.dimLow=o.dimLowProb),o.selectedRow!==void 0&&(r.selectedRow=o.selectedRow),o.selectedLayer!==void 0&&(r.selectedLayerIdx=o.selectedLayer),o.viewStart!==void 0&&(r.viewStart=o.viewStart),o.viewSize!==void 0&&(r.viewSize=o.viewSize),o.colorIndex!==void 0&&(r.colorIndex=o.colorIndex),o.pinnedGroups!==void 0&&(r.pinned=f(o.pinnedGroups)),o.pinnedRows!==void 0&&(r.pinnedRows=o.pinnedRows.map(s=>s.pos).filter(s=>typeof s=="number")),o.darkMode!==void 0&&(r.darkModeOverride=o.darkMode),B(),Xe(),Ye()},setData:o=>{u=et(o),d=u.normalized,h=u.v2Data,r.selectedRow=null,r.selectedLayerIdx=null,r.pinned=[],r.pinnedRows=[],r.colorIndex=0,B(),Ye(),Ve()},setTitle:()=>{},setThemeMode:o=>{r.darkModeOverride=!!o,Xe(),G(),ce(),ne()},getThemeMode:()=>W(),hasEntropyData:()=>!!h&&Array.isArray(h.entropy)&&h.entropy.length>0,hasRankData:()=>{if(!h?.tracked)return!1;for(let o of h.tracked)for(let s in o){let c=o[s];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(o,s)=>{(v[o]||(v[o]=[])).push(s)},off:(o,s)=>{v[o]=(v[o]||[]).filter(c=>c!==s)},destroy:()=>{V=!0,hn(),wt?.disconnect(),qe(),X.remove(),C&&(C.destroy(),C=null),l&&(l.innerHTML="")}},styleEl:a}}var _n='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Bn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',On='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',zn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',An='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Oe=class{constructor(e,i,n){this.widget=null;this.styleEl=null;let l=Wt(e,i,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,i){this.widget?.on(e,i)}off(e,i){this.widget?.off(e,i)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function Se(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Ft(t,e,i){let n=i.cellWidth??44,l=i.rowHeaderWidth??100,u=i.darkMode??!1,d="";d+="<colgroup>",d+=`<col style="width:${l}px;">`;for(let a=0;a<e.columns.length;a++)d+=`<col style="width:${n}px;">`;d+="</colgroup>";let h=i.maxRows!=null?Math.min(e.rows.length,i.maxRows):e.rows.length;for(let a=0;a<h;a++){let f=e.rows[a];d+="<tr>";let r=`width:${l}px;max-width:${l}px;`;f.pinned&&(r+=u?"background:#4a4a00;color:#fff;":"background:#fff59d;"),d+=`<td class="hm-row-header${f.pinned?" hm-pinned":""}" data-row="${a}" title="${Se(f.label)}" style="${r}">`,d+=Se(f.label),d+="</td>";for(let v=0;v<e.columns.length;v++){let L=e.getCellValue(a,v),p=`background:${L.color};color:${L.textColor};width:${n}px;max-width:${n}px;`;L.highlighted&&L.highlightColor&&(p+=`box-shadow:inset 0 0 0 2px ${L.highlightColor};`),L.bold&&(p+="font-weight:bold;"),d+=`<td class="hm-cell${L.highlighted?" hm-highlighted":""}" data-row="${a}" data-col="${v}" style="${p}">`,d+=Se(L.text),d+="</td>"}d+="</tr>"}d+="<tr>",d+=`<th class="hm-corner" style="width:${l}px;max-width:${l}px;">${Se(i.cornerLabel??"Layer")}</th>`;for(let a=0;a<e.columns.length;a++)d+=`<th class="hm-col-header" style="width:${n}px;max-width:${n}px;">${Se(e.columns[a].label)}</th>`;return d+="</tr>",d}function Wn(t){return`
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
    `}function Nt(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Wn(t),document.head.appendChild(e),e}var Fn=0,ze=class{constructor(e,i,n={}){this.destroyed=!1;this.container=e,this.data=i,this.options={cellWidth:44,rowHeaderWidth:100,darkMode:!1,...n},this.uid="hm_"+ ++Fn+"_"+Date.now().toString(36),this.styleEl=Nt(this.uid),this.table=document.createElement("table"),this.table.className=`heatmap-${this.uid}`,e.appendChild(this.table),this.render()}render(){if(this.destroyed)return;let e=Ft(this.uid,this.data,this.options);this.table.innerHTML=e,this.options.darkMode?this.table.classList.add("hm-dark"):this.table.classList.remove("hm-dark"),this.attachListeners()}attachListeners(){this.table.querySelectorAll(".hm-cell").forEach(e=>{let i=parseInt(e.dataset.row),n=parseInt(e.dataset.col);e.addEventListener("mouseenter",()=>{this.options.onCellHover?.(i,n)}),e.addEventListener("mouseleave",()=>{this.options.onCellLeave?.()}),e.addEventListener("click",l=>{l.stopPropagation(),this.options.onCellClick?.(i,n)})}),this.table.querySelectorAll(".hm-row-header").forEach(e=>{let i=parseInt(e.dataset.row);e.addEventListener("click",n=>{n.stopPropagation(),this.options.onRowHeaderClick?.(i)})})}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.table}getTableWidth(){return this.table.offsetWidth}destroy(){this.destroyed=!0,this.container.removeChild(this.table),this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var Nn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',jn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Vn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',at="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function dt(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function jt(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${at};`;let i={isOpen:!1,searchQuery:""},n=Ut(e,t,i);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=i,e}function $e(t,e){let i=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;i&&i();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=Ut(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function Vt(t){let e=t.__tokenSelectorCleanup;e&&e()}function Ut(t,e,i){t.innerHTML="";let n=dt(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:d,onChange:h}=e,a=document.createElement("div");a.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let f=document.createElement("span");if(f.style.cssText=`font-size:11px;color:${n.fgMuted};`,f.textContent=`Tokens (${l.length})`,a.appendChild(f),!ct(u,d)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${at};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${Nn} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=n.fg}),y.addEventListener("mouseleave",()=>{y.style.color=n.fgMuted}),y.addEventListener("click",()=>{h(Array.from(d))}),a.appendChild(y)}t.appendChild(a);let v=document.createElement("div");v.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,v.addEventListener("click",()=>{H(),p.focus()});let L=Array.from(u).sort((y,w)=>y-w);for(let y of L){let w=Un(y,l[y],e.darkMode,()=>{let D=new Set(u);D.delete(y),h(Array.from(D))});v.appendChild(w)}let p=document.createElement("input");p.type="text",p.placeholder=L.length===0?"Search tokens...":"",p.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${at};min-width:60px;flex:1;padding:2px 0;`,p.addEventListener("input",()=>{i.searchQuery=p.value,N()}),p.addEventListener("focus",()=>H()),v.appendChild(p);let T=document.createElement("span");T.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,T.innerHTML=Vn,T.addEventListener("click",y=>{y.stopPropagation(),i.isOpen?A():H()}),v.appendChild(T),t.appendChild(v);let P=document.createElement("div");P.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let F=document.createElement("div");F.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",P.appendChild(F);let B=document.createElement("div");B.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,B.textContent="No tokens found",P.appendChild(B),t.appendChild(P);function N(){F.innerHTML="";let y=i.searchQuery.toLowerCase(),w=0;for(let D=0;D<l.length;D++){let z=l[D];if(y&&!z.toLowerCase().includes(y))continue;w++;let K=u.has(D),W=Gn(D,z,K,e.darkMode,()=>{let ee=new Set(u);K?ee.delete(D):ee.add(D),h(Array.from(ee))});F.appendChild(W)}B.style.display=w===0?"":"none"}function H(){i.isOpen||(i.isOpen=!0,P.style.display="",T.style.transform="rotate(180deg)",N())}function A(){i.isOpen&&(i.isOpen=!1,P.style.display="none",T.style.transform="",p.value="",i.searchQuery="")}function I(y){t.contains(y.target)||A()}return document.addEventListener("mousedown",I),i.isOpen&&(P.style.display="",T.style.transform="rotate(180deg)",p.value=i.searchQuery,N(),requestAnimationFrame(()=>{p.isConnected&&p.focus()})),()=>{document.removeEventListener("mousedown",I)}}function Un(t,e,i,n){let l=dt(i),u=U[t%U.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=l.chipHoverBg,d.style.borderColor=l.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=l.chipBg,d.style.borderColor=l.chipBorder});let h=document.createElement("span");h.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,d.appendChild(h);let a=document.createElement("span");a.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,a.innerHTML=ve(e),a.title=e,d.appendChild(a);let f=document.createElement("button");return f.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,f.innerHTML=jn,f.addEventListener("mouseenter",()=>{f.style.color=l.badgeText}),f.addEventListener("mouseleave",()=>{f.style.color=l.fgMuted}),f.addEventListener("click",r=>{r.stopPropagation(),n()}),d.appendChild(f),d}function Gn(t,e,i,n,l){let u=dt(n),d=U[t%U.length],h=document.createElement("div");h.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",h.addEventListener("mouseenter",()=>{h.style.background=u.hoverBg}),h.addEventListener("mouseleave",()=>{h.style.background="transparent"}),h.addEventListener("click",v=>{v.stopPropagation(),l()});let a=document.createElement("span");a.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${i?d:"transparent"};border:1.5px solid ${i?d:u.fgMuted};`,h.appendChild(a);let f=document.createElement("span");f.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${i?u.fg:u.fgMuted};`,f.innerHTML=ve(e),f.title=e,h.appendChild(f);let r=t===0?"source pred":t===1?"target pred":null;if(r){let v=document.createElement("span");v.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,v.textContent=r,h.appendChild(v)}if(i){let v=document.createElement("span");v.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,v.textContent="selected",h.appendChild(v)}return h}function ct(t,e){if(t.size!==e.size)return!1;for(let i of t)if(!e.has(i))return!1;return!0}var qn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Yn=["probability","prob_diff","rank"],Ae=class{constructor(e,i,n={}){this.modeButtons=new Map;this.container=e,this.allData=i,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=i.tokenLabels?.length??i.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(h,a)=>a);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=jt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new pe(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),$e(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let i of Yn){let n=document.createElement("button");n.textContent=qn[i],this.applyModeButtonStyles(n,i===this.mode),n.addEventListener("click",()=>this.setMode(i)),n.addEventListener("mouseenter",()=>{i!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{i!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(i,n)}return e}applyModeBarStyles(e){let i=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${i};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,i){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${i?l:"transparent"};color:${i?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,i]of this.modeButtons)this.applyModeButtonStyles(i,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),i=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,h)=>d-h),l=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:l?e[d].map(h=>h+1):e[d],label:i[d]??`Token ${d}`,color:U[d%U.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let i=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,i)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<i));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),$e(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),$e(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let i=this.getModeLines().length,n=new Set(e.filter(l=>l<i));ct(n,this.selectedTokens)||(this.selectedTokens=n,$e(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Vt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Xn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function pt(t,e,i){let n=Xn(t);if(!n)return null;let l=e(n);if(i===void 0){let u=De(n,h=>l.setThemeMode(h)),d=l.destroy.bind(l);l.destroy=()=>{u(),d()}}return l}function Gt(t,e,i){return new Oe(t,e,i)}function qt(t,e,i){return pt(t,n=>new pe(n,e,{darkMode:he(n),...i}),i?.darkMode)}function Yt(t,e,i){return pt(t,n=>new ze(n,e,{darkMode:he(n),...i}),i?.darkMode)}function Xt(t,e,i){return pt(t,n=>new Ae(n,e,{darkMode:he(n),...i}),i?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Gt,window.LinePlotWidget=qt,window.HeatmapTableWidget=Yt,window.ActivationPatchingWidget=Xt);return Ln(Qn);})();
//# sourceMappingURL=charts.js.map
