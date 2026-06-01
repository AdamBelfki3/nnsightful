"use strict";var InterpTools=(()=>{var Ne=Object.defineProperty;var Ut=Object.getOwnPropertyDescriptor;var Gt=Object.getOwnPropertyNames;var qt=Object.prototype.hasOwnProperty;var Yt=(t,e)=>{for(var o in e)Ne(t,o,{get:e[o],enumerable:!0})},Xt=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Gt(e))!qt.call(t,l)&&l!==o&&Ne(t,l,{get:()=>e[l],enumerable:!(n=Ut(e,l))||n.enumerable});return t};var Qt=t=>Xt(Ne({},"__esModule",{value:!0}),t);var Tn={};Yt(Tn,{ActivationPatchingWidget:()=>Dt,HeatmapTableWidget:()=>Pt,LinePlotWidget:()=>Ht,LogitLensWidget:()=>Ct});function je(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let o=t.layers.length,n=t.input.length,l=[];for(let a=0;a<n;a++){let p=[],s=t.tracked[a];for(let r=0;r<o;r++){let w=t.topk[r][a],g=[];for(let v=0;v<w.length;v++){let $=w[v],D=s[$]||[],V=D[r]||0;g.push({token:$,prob:V,trajectory:D})}let h=g[0]||{token:"",prob:0,trajectory:[]};p.push({token:h.token,prob:h.prob,trajectory:h.trajectory,topk:g})}l.push(p)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function ct(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function be(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Zt(t){let e=`#${t}`;return`
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

        /* Flex roles for the card's three stacked regions (see #${t} above). */
        ${e} .ll-scroll { flex: 1 1 auto; min-height: 0; }
        ${e} .ll-nav,
        ${e} .ll-lineplot-wrap { flex: 0 0 auto; }
        ${e}.ll-fill { width: 100%; height: 100%; }

        /* Leading-space marker, used in cell + row-label token rendering. */
        ${e} .ll-lead-dot { opacity: 0.35; margin-right: 1px; }

        /* \u2500\u2500 Heatmap scroll region \u2500\u2500 */
        ${e} .ll-scroll {
            overflow: auto;
            min-width: 0; max-width: 100%;
            border-top: 1px solid var(--ll-line-faint);
            border-bottom: 1px solid var(--ll-line-faint);
        }
        ${e} .ll-grid-inner { /* width set inline */ }
        ${e} .ll-hdr-row {
            align-items: end; padding-bottom: 4px;
            position: sticky; top: 0; z-index: 5; background: var(--ll-surface);
        }
        ${e} .ll-corner {
            font-size: 10px; color: var(--ll-text-muted);
            text-align: right; padding-right: 8px;
            letter-spacing: 0.04em; text-transform: uppercase;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            position: sticky; left: 0; z-index: 4; background: var(--ll-surface);
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
            position: sticky; left: 0; z-index: 3; background: var(--ll-surface);
            box-shadow: 1px 0 0 var(--ll-line-faint);
            overflow: hidden;
        }
        ${e} .ll-row-grid.ll-row-sel .ll-row-label { background: var(--ll-surface-2); }
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
        ${e} .ll-axis-caption {
            text-align: center; font-size: 10.5px; color: var(--ll-text-muted);
            letter-spacing: 0.18em; text-transform: uppercase;
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
    `}function pt(t){let e=document.createElement("style");return e.textContent=Zt(t),document.head.appendChild(e),e}function Ve(t,e,...o){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of o)l&&n(l)}var Ue=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"];var j=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function pe(t){return t.richLines&&t.richLines.length>0?t.richLines.map((o,n)=>({values:o.values,label:o.label??`Line ${n+1}`,color:o.color,dashPattern:o.dashPattern,isOverlay:o.isOverlay,removable:o.removable})):(t.lines??[]).map((o,n)=>({values:o,label:t.labels?.[n]??`Line ${n+1}`}))}function he(t){if(!t)return"";let e=[],o=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),o=1);let n="";for(;o<t.length;o++){let l=t[o];l===`
`?(n&&(e.push(ht(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(ht(n)),e.join("")}function ht(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Jt(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let o of e)if(t<=o)return o;return 1}function ut(t,e,o){let n=pe(t),l=n.length>0?n[0].values.length:o?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",a=e.minValue,p=e.maxValue;if(a===void 0||p===void 0||e.autoScale){let s=[];for(let g of n)if(!g.isOverlay)for(let h of g.values)h!==null&&s.push(h);if(o)for(let g of o.values)g!==null&&s.push(g);if(s.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let r=1/0,w=-1/0;for(let g of s)g<r&&(r=g),g>w&&(w=g);if(e.centerYAxisAtZero){let h=Math.max(Math.abs(r),Math.abs(w))*1.1;a=-h,p=h}else if(e.logScale){if(a===void 0&&(a=Math.max(1,Math.floor(r))),p===void 0||e.autoScale){let g=Math.log(Math.max(1,r)),h=Math.log(Math.max(1,w)),v=h+.15*Math.max(1,h-g);p=Math.ceil(Math.exp(v))}}else a===void 0&&(a=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(r)):Math.floor(r*.9)),(p===void 0||e.autoScale)&&(u==="rank"?p=Math.ceil(w*1.1):u==="probability"?p=e.autoScale?Jt(Math.max(w,.001)):Math.min(w*1.1,1):p=w*1.1)}return{numLayers:l,minValue:a,maxValue:p,numLines:n.length}}function mt(t,e,o,n,l,u,a,p){let s=t.getContext("2d"),r=e.getBoundingClientRect(),w=window.devicePixelRatio||1;t.width=r.width*w,t.height=r.height*w,t.style.width=`${r.width}px`,t.style.height=`${r.height}px`,s.scale(w,w);let g=r.width,h=r.height,v=n.darkMode??!1,$=n.title,D=n.mode||"probability",V=n.invertYAxis??!1,_=n.centerYAxisAtZero??!1,G=n.logScale??!1,C=n.xAxisLabel||"Layer",R=n.yAxisLabel||"Probability",H=n.xRangeStart??0;H>=l.numLayers-1&&(console.warn(`xRangeStart (${H}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),H=0);let y=n.showDataPoints??!0,L={top:$?48:24,right:24,bottom:56,left:72},P=g-L.left-L.right,E=h-L.top-L.bottom,O={margin:L,chartWidth:P,chartHeight:E,width:g,height:h},q={background:v?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:v?"#52525b":"#a1a1aa",grid:v?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:v?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:v?"#e4e4e7":"#27272a"};n.transparentBackground?s.clearRect(0,0,g,h):(s.fillStyle=q.background,s.fillRect(0,0,g,h)),$&&(s.fillStyle=q.titleText,s.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="left",s.fillText($,L.left,28));let Z=l.numLayers-1-H,ue=m=>Z<=0?L.left+P/2:L.left+(m-H)/Z*P,ne=G?Math.log(Math.max(1,l.minValue)):0,Y=G?Math.log(Math.max(1,l.maxValue)):0,A=m=>{let S;if(G){let z=Math.log(Math.max(1,m));S=Y-ne>0?(z-ne)/(Y-ne):.5}else S=(m-l.minValue)/(l.maxValue-l.minValue);return V?L.top+S*E:L.top+E-S*E};s.setLineDash([4,4]),s.strokeStyle=q.grid,s.lineWidth=1;let oe=[],xe=l.maxValue-l.minValue,U=5;if(G){let m=new Set;for(let I=0;I<U;I++){let F=ne+I/(U-1)*(Y-ne),X=Math.round(Math.exp(F));m.has(X)||(m.add(X),oe.push(X))}let S=Math.round(Math.exp(ne)),z=Math.round(Math.exp(Y));m.has(S)||oe.unshift(S),m.has(z)||oe.push(z)}else if(D==="rank")for(let m=0;m<U;m++)oe.push(Math.round(l.minValue+m/(U-1)*xe));else for(let m=0;m<U;m++)oe.push(l.minValue+m/(U-1)*xe);if(oe.forEach(m=>{let S=A(m);s.beginPath(),s.moveTo(L.left,S),s.lineTo(L.left+P,S),s.stroke()}),s.setLineDash([]),_){let m=A(0);s.beginPath(),s.strokeStyle=v?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",s.lineWidth=1.5,s.moveTo(L.left,m),s.lineTo(L.left+P,m),s.stroke(),s.lineWidth=1}s.fillStyle=q.text,s.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="right",s.textBaseline="middle",oe.forEach(m=>{let S=A(m),z;D==="probability"?z=m.toFixed(2):D==="prob_diff"?z=m>=0?`+${m.toFixed(2)}`:m.toFixed(2):z=Math.round(m).toString(),s.fillText(z,L.left-16,S)}),s.textAlign="center",s.textBaseline="top";let K=o.xLabels&&o.xLabels.length>0,me=Math.max(1,Math.ceil(l.numLayers/8));for(let m=0;m<l.numLayers;m+=me){let S=ue(m);if(S<L.left-5||S>L.left+P+5)continue;let z=K?String(o.xLabels[m]??m):m.toString();s.fillText(z,S,L.top+E+12)}if((l.numLayers-1)%me!==0){let m=K?String(o.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();s.fillText(m,ue(l.numLayers-1),L.top+E+12)}s.strokeStyle=v?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",s.lineWidth=1.5,s.beginPath(),s.moveTo(L.left,L.top),s.lineTo(L.left,L.top+E),s.lineTo(L.left+P,L.top+E),s.stroke(),s.fillStyle=q.textMuted,s.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(C.toUpperCase(),L.left+P/2,h-16),s.save(),s.translate(14,L.top+E/2),s.rotate(-Math.PI/2),s.textAlign="center",s.textBaseline="top",s.fillText(R.toUpperCase(),0,0),s.restore();let re=pe(o);function ee(m,S,z,I,F){s.beginPath(),s.strokeStyle=S,s.lineWidth=z,F!==void 0&&(s.globalAlpha=F),I?s.setLineDash(I.split(",").map(Number)):s.setLineDash([]);let X=!1;for(let ie=0;ie<m.length;ie++){let te=m[ie];if(te===null){X=!1;continue}let fe=ue(ie),ye=A(te);X?s.lineTo(fe,ye):(s.moveTo(fe,ye),X=!0)}s.stroke(),s.setLineDash([]),F!==void 0&&(s.globalAlpha=1)}let Me=v?"#3f3f46":"#d4d4d8";if(s.lineCap="round",s.lineJoin="round",re.forEach((m,S)=>{!u.has(S)||m.isOverlay||ee(m.values,Me,2,void 0,.35)}),re.forEach((m,S)=>{if(u.has(S)||m.isOverlay)return;let z=m.color??j[S%j.length];ee(m.values,z,4,m.dashPattern,.15),ee(m.values,z,2,m.dashPattern),y&&m.values.forEach((I,F)=>{if(I===null)return;let X=ue(F),ie=A(I),te=a?.lineIdx===S&&a?.layerIdx===F;s.beginPath(),s.strokeStyle=z,s.lineWidth=te?2:1.5,s.arc(X,ie,te?5:3.5,0,Math.PI*2),s.stroke(),s.beginPath(),s.fillStyle=v?"#18181b":"#ffffff",s.arc(X,ie,te?3.5:2.5,0,Math.PI*2),s.fill()})}),re.forEach((m,S)=>{if(!m.isOverlay||u.has(S))return;let z=m.color??"#999";ee(m.values,z,1.5,m.dashPattern??"4,2",.7)}),p){let m=p.color??"#999";ee(p.values,m,1.5,p.dashPattern??"4,2",.7)}return O}function ft(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function gt(t,e,o,n,l,u,a,p,s){let{margin:r,chartWidth:w,chartHeight:g}=l,h=n.xRangeStart??0,v=a-1-h,$=n.logScale?Math.log(Math.max(1,p)):0,D=n.logScale?Math.log(Math.max(1,s)):0;if(t<r.left||t>r.left+w||e<r.top||e>r.top+g)return null;let V=pe(o),_=null,G=1/0,C=20;for(let R=0;R<V.length;R++){if(u.has(R))continue;let H=V[R];if(!H.isOverlay)for(let y=0;y<H.values.length;y++){let L=H.values[y];if(L===null)continue;let P=v<=0?r.left+w/2:r.left+(y-h)/v*w,E;if(n.logScale){let Z=Math.log(Math.max(1,L));E=D-$>0?(Z-$)/(D-$):.5}else E=(L-p)/(s-p);let O=n.invertYAxis?r.top+E*g:r.top+g-E*g,q=Math.sqrt((t-P)**2+(e-O)**2);q<G&&q<C&&(G=q,_={visible:!0,x:P,y:O,lineIdx:R,layerIdx:y,value:L,label:H.label,color:H.color??j[R%j.length]})}}return _}function Ge(t,e,o,n,l,u,a){if(!e){t.style.opacity="0";return}let p=n?"#27272a":"#fff",s=n?"#3f3f46":"#e4e4e7",r=n?"#fafafa":"#18181b",w=n?"#a1a1aa":"#71717a",h=e.x>o/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${h},-50%);`;let v=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
        <div style="background:${p};border:1px solid ${s};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${r};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${he(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${w}">${u??"Layer"}</span>
                    <span style="font-weight:500;color:${r}">${v}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${w}">Value</span>
                    <span style="font-weight:500;color:${r}">${a==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Kt='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',en='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',tn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function bt(t){let e=document.createElement("div");return vt(e,t),e}function vt(t,e){let o=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${o};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function xt(t,e,o,n,l,u){vt(t,n),t.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",s=n?"#a1a1aa":"#71717a",r=n?"#3f3f46":"#d4d4d8",w="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",h=u?pe(u):[];e.forEach((v,$)=>{let D=h[$];if(D?.isOverlay)return;let V=D?.color??j[$%j.length],_=o.has($),G=D?.removable??!1,C=document.createElement("button");C.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${_?"0.5":"1"};`,C.addEventListener("mouseenter",()=>{C.style.background=g}),C.addEventListener("mouseleave",()=>{C.style.background="transparent"}),C.addEventListener("click",()=>l.onToggle($));let R=document.createElement("span");R.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${_?w:V};background:${_?r:"transparent"};`,C.appendChild(R);let H=document.createElement("span");if(H.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${_?p:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,H.title=v,H.innerHTML=he(v),C.appendChild(H),G&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${s};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=tn,y.title="Remove",y.addEventListener("click",L=>{L.stopPropagation(),l.onRemove($)}),C.appendChild(y),C.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),C.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${s};opacity:${_?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=_?en:Kt,C.appendChild(y),_||(C.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),C.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}t.appendChild(C)})}var ae=class{constructor(e,o,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let o=this.canvas.getBoundingClientRect(),n=e.clientX-o.left,l=e.clientY-o.top;this.tooltip=gt(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Ge(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Ge(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=o,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=ft(this.chartContainer),this.legendEl=bt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let a=Math.round(u.contentRect.width),p=Math.round(u.contentRect.height);a===this.lastWidth&&p===this.lastHeight||(this.lastWidth=a,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,o)=>e.label??`Line ${o+1}`):this.data.labels||(this.data.lines??[]).map((e,o)=>`Line ${o+1}`)}draw(){this.config=ut(this.data,this.options,this.overlay),this.config&&(this.geometry=mt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",xt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:o=>this.toggleLine(o),onRemove:this.options.onLineRemoved?o=>{this.removeLine(o,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(o)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((o,n)=>({values:o,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,o=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,o||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function qe(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let o=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(o){let n=o[1],l,u,a,p=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),a=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),a=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[l,u,a,p]}return null}function Ye(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function nn(t){let e=t;for(;e;){let o=Ye(qe(getComputedStyle(e).backgroundColor));if(o!==null)return o;e=e.parentElement}if(typeof document<"u")for(let o of[document.body,document.documentElement]){if(!o)continue;let n=Ye(qe(getComputedStyle(o).backgroundColor));if(n!==null)return n}return null}function on(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let o=Ye(qe(e));return o===null?null:o<.5}function Ee(t,e){let o=de(t),n=()=>{let a=de(t);a!==o&&(o=a,e(a))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function de(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=on();if(e!==null)return e;let o=nn(t??null);return o!==null?o<.5:!1}var Se=60,$e=30,yt=22,Ce=48,ln=150,rn=18,Lt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},sn="#cc6622";function an(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var wt=41;function Xe(t,e,o){let[n,l,u]=an(e),a=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(o){let s=r=>Math.round(wt+(r-wt)*a);return`rgb(${s(n)}, ${s(l)}, ${s(u)})`}let p=s=>Math.round(255-(255-s)*a);return`rgb(${p(n)}, ${p(l)}, ${p(u)})`}function dn(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Qe(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-dot">\xB7</span>'+be(t.slice(1)):be(t)}function ve(t){return t==null?"":t.startsWith(" ")?"\xB7"+t.slice(1):t}function He(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function kt(t,e,o){let n=ct(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=je(e),a=u.normalized,p=u.v2Data,s=pt(n),r={ramp:o?.ramp||"purple",showGrid:o?.showGrid??!0,dimLow:o?.dimLowProb??!0,selectedRow:o?.selectedRow??null,selectedLayerIdx:null,viewStart:0,viewSize:a.layers.length,darkModeOverride:o?.darkMode??null,pinned:[],colorIndex:0,openPopup:null},w={};function g(i,d){(w[i]||[]).forEach(c=>c(d))}let h=a.layers.length,v=a.tokens.length,$=[],D="";function V(){h=a.layers.length,v=a.tokens.length,$=[];for(let d=0;d<h;d++){let c=0;for(let b=0;b<v;b++){let f=a.cells[b]?.[d];f&&f.prob>c&&(c=f.prob)}$.push(c)}D=a.cells[v-1]?.[h-1]?.token??"",(r.viewSize>h||r.viewSize<1)&&(r.viewSize=h);let i=Math.max(0,h-r.viewSize);r.viewStart>i&&(r.viewStart=i),r.viewStart<0&&(r.viewStart=0)}V();function _(i){let d=r.pinned.find(c=>c.token===i);return d?d.color:null}function G(i){let d=r.pinned.findIndex(c=>c.token===i);d>=0?r.pinned.splice(d,1):(r.pinned.push({token:i,color:Ue[r.colorIndex%Ue.length]}),r.colorIndex++)}function C(i,d){let c=p?.tracked?.[i];if(c&&Array.isArray(c[d]))return c[d];for(let b=0;b<h;b++){let f=a.cells[i]?.[b]?.topk.find(k=>k.token===d);if(f)return f.trajectory}return null}function R(){return Lt[r.ramp]||Lt.purple}function H(){return r.darkModeOverride!==null?r.darkModeOverride:de(l)}function y(){let i=O.clientWidth;if(i>0)return i;let d=l?.clientWidth??0;return d>0?d-42:900}function L(){let i=Math.floor((y()-Se)/Ce);return Math.max(1,Math.min(rn,i))}function P(){let i=Math.max(0,h-r.viewSize),d=Math.max(0,Math.min(i,r.viewStart)),c=r.viewSize,b=L();if(c<=b){let x=[];for(let T=0;T<c;T++)x.push(d+T);return{shownLayers:x,stride:1,start:d}}let f=Math.ceil(c/b),k=[];for(let x=d;x<d+c;x+=f)k.push(x);let M=d+c-1;return k[k.length-1]!==M&&k.push(Math.min(h-1,M)),{shownLayers:k,stride:f,start:d}}l.innerHTML=`
        <div id="${n}" tabindex="-1">
            <div class="ll-scroll" id="${n}_scroll" tabindex="0"></div>
            <div class="ll-nav" id="${n}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${n}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${n}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box"><div class="ll-lineplot" id="${n}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${n}_tt"></div>
            <div class="ll-popup" id="${n}_popup">
                <span class="ll-popup-close" id="${n}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${n}_popup_hdr"></div>
                <div class="ll-popup-body" id="${n}_popup_body"></div>
            </div>
        </div>
    `;let E=document.getElementById(n),O=document.getElementById(n+"_scroll"),q=document.getElementById(n+"_nav"),Z=document.getElementById(n+"_lp_wrap"),ue=document.getElementById(n+"_lp_token"),ne=document.getElementById(n+"_lp"),Y=document.getElementById(n+"_tt"),A=document.getElementById(n+"_popup"),oe=document.getElementById(n+"_popup_hdr"),xe=document.getElementById(n+"_popup_body");document.body.appendChild(A);let U=null,K=null,me=!0,re=getComputedStyle(E).getPropertyValue("--ll-aspect-ratio").trim(),ee=!re;ee&&E.classList.add("ll-fill");let Me=(()=>{if(!re||/^(unbounded|none|auto)$/i.test(re))return null;let i=re.split("/").map(d=>parseFloat(d.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})(),m=Ce,S=$e;function z(){let i=y(),d=P().shownLayers.length;if(m=d>0?Math.max(Ce,Math.min(ln,Math.floor((i-Se)/d))):Ce,!ee){S=$e;return}let c=O.clientHeight,b=yt+6+28,f=c-b;S=v>0&&v*$e<f?Math.floor(f/v):$e}function I(){let i=R(),d=H(),c=r.showGrid?d?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(ee){let T=l.clientWidth;E.style.width=T>0?T+"px":"100%",E.style.maxWidth="100%",E.style.maxHeight="",O.style.maxHeight=""}else{E.style.width="",E.style.maxWidth="",O.style.maxHeight="";let T=l.clientWidth||E.clientWidth;if(Me&&T>0){let B=E.offsetHeight-O.offsetHeight,W=(B>0?B:140)+90;E.style.maxHeight=Math.max(W,Math.round(T*Me))+"px"}else E.style.maxHeight=""}z();let{shownLayers:b}=P(),f=b.length,k=Math.round(Se+m*f),M=`${Se}px repeat(${f}, ${m}px)`,x=`<div class="ll-grid-inner" style="width:${k}px;min-width:${k}px;">`;x+=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${M};height:${yt+6}px;">`,x+='<div class="ll-corner">token</div>';for(let T of b)x+=`<div class="ll-hdr-cell">${a.layers[T]}</div>`;x+="</div>";for(let T=0;T<v;T++){let Q=a.tokens[T],B=He(Q),W=T===r.selectedRow;x+=`<div class="ll-row" data-rowwrap="${T}">`,W&&(x+='<div class="ll-row-rail"></div>'),x+=`<div class="ll-row-grid${W?" ll-row-sel":""}" data-row="${T}" style="display:grid;grid-template-columns:${M};height:${S}px;">`,x+='<div class="ll-row-label">',x+=B?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${W?"font-weight:600;":""}">${Qe(Q)}</span>`,x+="</div>";for(let Te of b){let N=a.cells[T][Te],se=N.prob,Le=D!==""&&N.token===D,We=Xe(se,Le?sn:i,d),dt=dn(se,d),Nt=se<.18,jt=r.dimLow&&Nt?"opacity:0.55;":"",Fe=_(N.token),Vt=Fe?`box-shadow:inset 0 0 0 2px ${Fe};`:"";x+=`<div class="ll-cell${Fe?" ll-cell-pinned":""}" data-row="${T}" data-layer="${Te}" style="background:${We};color:${dt};padding:0 6px;${jt}${c}${Vt}"><span class="ll-cell-text">${Qe(N.token)}</span></div>`}x+="</div></div>"}x+=`<div style="display:grid;grid-template-columns:${M};margin-top:6px;"><div></div><div class="ll-axis-caption" style="grid-column:2 / span ${f};">layer</div></div>`,x+="</div>",O.innerHTML=x}function F(){let i=R(),d=H(),{stride:c,start:b}=P(),f=r.viewSize,k=f>=h,M='<span class="ll-nav-range-key">layers</span>';k?M+=`all ${h}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):M+=`${b}\u2013${b+f-1}<span class="ll-dim"> / ${h}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let x="";for(let N=0;N<h;N++){let se=$[N]||0,Le=Math.max(8,Math.round(se*92));x+=`<div class="ll-skyline-bar" style="height:${Le}%;background:${Xe(se,i,d)}"></div>`}let T=b/h*100,Q=f/h*100,B=[];for(let N=0;N<h;N+=8)B.push(N);B[B.length-1]!==h-1&&B.push(h-1);let W="",Te=Math.max(1,h-1);for(let N of B){let se=N===h-1,Le=N===0,We=N/Te*100;W+=`<span class="ll-nav-tick" style="left:${We}%;transform:${se?"translateX(-100%)":Le?"translateX(0)":"translateX(-50%)"}">${a.layers[N]}</span>`}q.innerHTML=`
            <div class="ll-nav-range">${M}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${x}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${T}%;width:${Q}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${W}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${b<=0?"disabled":""}>${pn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${b+f>=h?"disabled":""}>${hn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in">${un}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${k?"disabled":""}>${mn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${cn}</button>
            </div>
        `,Ot()}function X(){let i=document.getElementById(n+"_win");if(!i)return;let d=Math.max(0,h-r.viewSize),c=Math.max(0,Math.min(d,r.viewStart));i.style.left=c/h*100+"%",i.style.width=r.viewSize/h*100+"%"}function ie(){return Array.from(new Set([h,48,32,20,14,10,8])).filter(i=>i<=h&&i>=1).sort((i,d)=>i-d)}function te(i){return Math.max(0,Math.min(Math.max(0,h-r.viewSize),i))}let fe=!1;function ye(){fe||(fe=!0,requestAnimationFrame(()=>{fe=!1,I(),X()}))}function Be(i){let d=te(r.viewStart+i);d!==r.viewStart&&(r.viewStart=d,I(),F(),ge())}function It(i){let d=te(i);d!==r.viewStart&&(r.viewStart=d,ye())}function tt(i,d){let c=ie(),b=c.findIndex(x=>x>=r.viewSize),f=b===-1?c.length-1:b,k=i<0?Math.max(0,f-1):Math.min(c.length-1,f+1),M=c[k];M!==r.viewSize&&(r.viewSize=M,r.viewStart=Math.max(0,Math.min(h-M,Math.round(d-M/2))),I(),F(),ge())}function nt(i){tt(i,r.viewStart+r.viewSize/2)}function Bt(){r.viewSize=h,r.viewStart=0,I(),F(),ge()}let ce=null;function Ot(){let i=document.getElementById(n+"_sky");if(!i)return;i.addEventListener("pointerdown",c=>{let b=i.getBoundingClientRect(),f=c.clientX-b.left,k=b.width/h,M=Math.max(0,h-r.viewSize),x=Math.max(0,Math.min(M,r.viewStart)),T=x*k,Q=(x+r.viewSize)*k,B=x;(f<T||f>Q)&&(B=te(Math.round(f/k)-Math.floor(r.viewSize/2)),r.viewStart=B,ye()),ce={startX:f,startStart:B,layerW:k},i.classList.add("ll-grabbing");try{i.setPointerCapture(c.pointerId)}catch{}}),i.addEventListener("pointermove",c=>{if(!ce)return;let b=i.getBoundingClientRect(),k=(c.clientX-b.left-ce.startX)/ce.layerW;It(Math.round(ce.startStart+k))});let d=c=>{if(ce){ce=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(c.pointerId)}catch{}F(),ge()}};i.addEventListener("pointerup",d),i.addEventListener("pointercancel",d),i.addEventListener("wheel",c=>{c.preventDefault();let b=i.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Be(c.deltaX>0?1:-1);return}let f=Math.round((c.clientX-b.left)/b.width*h);tt(c.deltaY<0?-1:1,f)},{passive:!1})}function ot(i,d,c=!1){r.selectedRow=i,r.selectedLayerIdx=d??a.layers.length-1,I(),le(),c&&zt(i),ge()}function zt(i){let d=O.querySelector(`[data-rowwrap="${i}"]`);if(!d)return;let c=d.offsetTop-O.clientHeight/2+d.offsetHeight/2;O.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function le(i){let d=r.selectedRow,c=[];if(d!==null)for(let f of r.pinned){let k=C(d,f.token);k&&c.push({values:k.map(M=>M??null),label:ve(f.token),color:f.color,removable:!1})}let b=c.length===0&&!i;if(b)Z.classList.add("ll-hidden");else{Z.classList.remove("ll-hidden"),ue.textContent=d===null?"":He(a.tokens[d])?"position "+d+" \xB7 bos":"position "+d+" \xB7 "+ve(a.tokens[d]);let f={lines:[],richLines:c,xLabels:a.layers},k={darkMode:H(),mode:"probability",autoScale:!0,legendPosition:c.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};U?(U.setData(f),U.setOptions(k)):(ne.style.minHeight="0",U=new ae(ne,f,k)),i?U.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):U.setOverlay?.(null)}ee&&b!==me?(me=b,requestAnimationFrame(()=>I())):me=b}function _t(i,d,c,b){let f=a.cells[i]?.[d];if(!f)return;let k=R(),M=He(a.tokens[i])?"bos":ve(a.tokens[i]);Y.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Xe(f.prob,k,H())}"></span><span class="ll-tt-token">${be(ve(f.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(f.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${a.layers[d]} / ${a.layers[h-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${be(M)}</span></div>`,Y.classList.add("ll-visible");let x=E.getBoundingClientRect(),T=Y.offsetWidth||220,Q=Y.offsetHeight||90,B=c-x.left+16;c+T+24>window.innerWidth-8&&(B=c-x.left-T-12);let W=b-x.top-50;B=Math.max(6,Math.min(B,x.width-T-6)),W=Math.max(6,Math.min(W,x.height-Q-6)),Y.style.left=B+"px",Y.style.top=W+"px"}function Oe(){Y.classList.remove("ll-visible")}function Rt(){ze(),K=document.createElement("div"),K.style.cssText="position:fixed;inset:0;z-index:49;",K.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),lt()}),document.body.appendChild(K)}function ze(){K&&(K.remove(),K=null)}function At(i,d,c){if(!a.cells[i]?.[d])return;let f=c.getBoundingClientRect();r.openPopup={row:i,layer:d},r.selectedRow=i,r.selectedLayerIdx=d;let k=He(a.tokens[i])?"bos":ve(a.tokens[i]);oe.innerHTML=`Layer <b>${a.layers[d]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${be(k)}</code></div>`,it(i,d),I(),le(),A.style.visibility="hidden",A.classList.add("ll-visible"),Wt(f),A.style.visibility="",Rt()}function it(i,d){let c=a.cells[i][d],b="";c.topk.forEach((f,k)=>{let M=_(f.token),x=M?`background:${M}22;border-left-color:${M};`:"";b+=`<div class="ll-topk${M?" ll-topk-pinned":""}" data-ki="${k}" style="${x}" title="click to track trajectory"><span class="ll-topk-tok">${Qe(f.token)}</span><span class="ll-topk-prob">${(f.prob*100).toFixed(1)}%</span></div>`}),xe.innerHTML=b,xe.querySelectorAll(".ll-topk").forEach(f=>{let k=parseInt(f.dataset.ki),M=c.topk[k];f.addEventListener("mouseenter",()=>{let x=C(i,M.token);x&&le({values:x.map(T=>T??null),label:ve(M.token),color:"#999"})}),f.addEventListener("mouseleave",()=>le()),f.addEventListener("click",x=>{x.stopPropagation(),G(M.token),I(),it(i,d),le(),ge()})})}function Wt(i){let b=A.offsetWidth||220,f=A.offsetHeight||160,k=6,M=window.innerWidth-b-6,x=6,T=window.innerHeight-f-6,Q=[{left:i.right+6,top:i.top},{left:i.left-6-b,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-f}],B=Q[0];for(let W of Q)if(W.left>=k&&W.left<=M&&W.top>=x&&W.top<=T){B=W;break}A.style.left=Math.max(k,Math.min(B.left,M))+"px",A.style.top=Math.max(x,Math.min(B.top,T))+"px"}function lt(){r.openPopup=null,A.classList.remove("ll-visible"),ze(),I(),le()}document.getElementById(n+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),lt()});let J=null;O.addEventListener("mousemove",i=>{let d=i.target.closest(".ll-cell");if(!d){J&&(J.classList.remove("ll-cell-hover"),J=null),Oe();return}J!==d&&(J&&J.classList.remove("ll-cell-hover"),J=d,J.classList.add("ll-cell-hover"));let c=parseInt(d.dataset.row),b=parseInt(d.dataset.layer);_t(c,b,i.clientX,i.clientY)}),O.addEventListener("mouseleave",()=>{J&&(J.classList.remove("ll-cell-hover"),J=null),Oe()}),O.addEventListener("click",i=>{let d=i.target.closest(".ll-cell");if(d){let b=parseInt(d.dataset.row),f=parseInt(d.dataset.layer);Oe(),At(b,f,d);return}let c=i.target.closest(".ll-row-grid");c&&ot(parseInt(c.dataset.row))}),O.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let d=r.selectedRow??-1,c=i.key==="ArrowDown"?Math.min(v-1,d+1):Math.max(0,d-1);ot(c,void 0,!0)}),q.addEventListener("click",i=>{let d=i.target.closest("[data-nav]");if(!d||d.hasAttribute("disabled"))return;let c=d.dataset.nav;c==="panL"?Be(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?Be(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?nt(-1):c==="zoomOut"?nt(1):c==="reset"&&Bt()});function _e(){I(),F(),le(),requestAnimationFrame(()=>{I(),F()})}function Re(){Ve(E,H(),A)}function ge(){g("stateChange",at())}_e(),Re();let Ae=0,rt=l?.clientWidth??0,st=new ResizeObserver(()=>{let i=l?.clientWidth??0;i!==rt&&(rt=i,!Ae&&(Ae=requestAnimationFrame(()=>{Ae=0,I()})))});l&&st.observe(l);let Ft=Ee(l,i=>{r.darkModeOverride===null&&(Ve(E,i,A),I(),F(),le())});function at(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,darkMode:r.darkModeOverride}}return{widget:{getState:at,setState:i=>{i.ramp!==void 0&&(r.ramp=i.ramp),i.showGrid!==void 0&&(r.showGrid=i.showGrid),i.dimLowProb!==void 0&&(r.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(r.selectedRow=i.selectedRow),i.darkMode!==void 0&&(r.darkModeOverride=i.darkMode),Re(),_e()},setData:i=>{u=je(i),a=u.normalized,p=u.v2Data,V(),r.selectedRow=null,r.selectedLayerIdx=null,_e()},setTitle:()=>{},setThemeMode:i=>{r.darkModeOverride=!!i,Re(),I(),F(),le()},getThemeMode:()=>H(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let i of p.tracked)for(let d in i){let c=i[d];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,d)=>{(w[i]||(w[i]=[])).push(d)},off:(i,d)=>{w[i]=(w[i]||[]).filter(c=>c!==d)},destroy:()=>{Ft(),st?.disconnect(),ze(),A.remove(),U&&(U.destroy(),U=null),l&&(l.innerHTML="")}},styleEl:s}}var cn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',pn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',hn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',un='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',mn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Pe=class{constructor(e,o,n){this.widget=null;this.styleEl=null;let l=kt(e,o,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,o){this.widget?.on(e,o)}off(e,o){this.widget?.off(e,o)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function we(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Mt(t,e,o){let n=o.cellWidth??44,l=o.rowHeaderWidth??100,u=o.darkMode??!1,a="";a+="<colgroup>",a+=`<col style="width:${l}px;">`;for(let s=0;s<e.columns.length;s++)a+=`<col style="width:${n}px;">`;a+="</colgroup>";let p=o.maxRows!=null?Math.min(e.rows.length,o.maxRows):e.rows.length;for(let s=0;s<p;s++){let r=e.rows[s];a+="<tr>";let w=`width:${l}px;max-width:${l}px;`;r.pinned&&(w+=u?"background:#4a4a00;color:#fff;":"background:#fff59d;"),a+=`<td class="hm-row-header${r.pinned?" hm-pinned":""}" data-row="${s}" title="${we(r.label)}" style="${w}">`,a+=we(r.label),a+="</td>";for(let g=0;g<e.columns.length;g++){let h=e.getCellValue(s,g),v=`background:${h.color};color:${h.textColor};width:${n}px;max-width:${n}px;`;h.highlighted&&h.highlightColor&&(v+=`box-shadow:inset 0 0 0 2px ${h.highlightColor};`),h.bold&&(v+="font-weight:bold;"),a+=`<td class="hm-cell${h.highlighted?" hm-highlighted":""}" data-row="${s}" data-col="${g}" style="${v}">`,a+=we(h.text),a+="</td>"}a+="</tr>"}a+="<tr>",a+=`<th class="hm-corner" style="width:${l}px;max-width:${l}px;">${we(o.cornerLabel??"Layer")}</th>`;for(let s=0;s<e.columns.length;s++)a+=`<th class="hm-col-header" style="width:${n}px;max-width:${n}px;">${we(e.columns[s].label)}</th>`;return a+="</tr>",a}function fn(t){return`
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
    `}function Tt(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=fn(t),document.head.appendChild(e),e}var gn=0,De=class{constructor(e,o,n={}){this.destroyed=!1;this.container=e,this.data=o,this.options={cellWidth:44,rowHeaderWidth:100,darkMode:!1,...n},this.uid="hm_"+ ++gn+"_"+Date.now().toString(36),this.styleEl=Tt(this.uid),this.table=document.createElement("table"),this.table.className=`heatmap-${this.uid}`,e.appendChild(this.table),this.render()}render(){if(this.destroyed)return;let e=Mt(this.uid,this.data,this.options);this.table.innerHTML=e,this.options.darkMode?this.table.classList.add("hm-dark"):this.table.classList.remove("hm-dark"),this.attachListeners()}attachListeners(){this.table.querySelectorAll(".hm-cell").forEach(e=>{let o=parseInt(e.dataset.row),n=parseInt(e.dataset.col);e.addEventListener("mouseenter",()=>{this.options.onCellHover?.(o,n)}),e.addEventListener("mouseleave",()=>{this.options.onCellLeave?.()}),e.addEventListener("click",l=>{l.stopPropagation(),this.options.onCellClick?.(o,n)})}),this.table.querySelectorAll(".hm-row-header").forEach(e=>{let o=parseInt(e.dataset.row);e.addEventListener("click",n=>{n.stopPropagation(),this.options.onRowHeaderClick?.(o)})})}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.table}getTableWidth(){return this.table.offsetWidth}destroy(){this.destroyed=!0,this.container.removeChild(this.table),this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var bn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',vn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',xn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',Ze="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function Je(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Et(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${Ze};`;let o={isOpen:!1,searchQuery:""},n=$t(e,t,o);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=o,e}function ke(t,e){let o=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;o&&o();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=$t(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function St(t){let e=t.__tokenSelectorCleanup;e&&e()}function $t(t,e,o){t.innerHTML="";let n=Je(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:a,onChange:p}=e,s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let r=document.createElement("span");if(r.style.cssText=`font-size:11px;color:${n.fgMuted};`,r.textContent=`Tokens (${l.length})`,s.appendChild(r),!Ke(u,a)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${Ze};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${bn} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=n.fg}),y.addEventListener("mouseleave",()=>{y.style.color=n.fgMuted}),y.addEventListener("click",()=>{p(Array.from(a))}),s.appendChild(y)}t.appendChild(s);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{C(),v.focus()});let h=Array.from(u).sort((y,L)=>y-L);for(let y of h){let L=yn(y,l[y],e.darkMode,()=>{let P=new Set(u);P.delete(y),p(Array.from(P))});g.appendChild(L)}let v=document.createElement("input");v.type="text",v.placeholder=h.length===0?"Search tokens...":"",v.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${Ze};min-width:60px;flex:1;padding:2px 0;`,v.addEventListener("input",()=>{o.searchQuery=v.value,G()}),v.addEventListener("focus",()=>C()),g.appendChild(v);let $=document.createElement("span");$.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,$.innerHTML=xn,$.addEventListener("click",y=>{y.stopPropagation(),o.isOpen?R():C()}),g.appendChild($),t.appendChild(g);let D=document.createElement("div");D.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let V=document.createElement("div");V.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",D.appendChild(V);let _=document.createElement("div");_.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,_.textContent="No tokens found",D.appendChild(_),t.appendChild(D);function G(){V.innerHTML="";let y=o.searchQuery.toLowerCase(),L=0;for(let P=0;P<l.length;P++){let E=l[P];if(y&&!E.toLowerCase().includes(y))continue;L++;let O=u.has(P),q=Ln(P,E,O,e.darkMode,()=>{let Z=new Set(u);O?Z.delete(P):Z.add(P),p(Array.from(Z))});V.appendChild(q)}_.style.display=L===0?"":"none"}function C(){o.isOpen||(o.isOpen=!0,D.style.display="",$.style.transform="rotate(180deg)",G())}function R(){o.isOpen&&(o.isOpen=!1,D.style.display="none",$.style.transform="",v.value="",o.searchQuery="")}function H(y){t.contains(y.target)||R()}return document.addEventListener("mousedown",H),o.isOpen&&(D.style.display="",$.style.transform="rotate(180deg)",v.value=o.searchQuery,G(),requestAnimationFrame(()=>{v.isConnected&&v.focus()})),()=>{document.removeEventListener("mousedown",H)}}function yn(t,e,o,n){let l=Je(o),u=j[t%j.length],a=document.createElement("div");a.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,a.addEventListener("mouseenter",()=>{a.style.background=l.chipHoverBg,a.style.borderColor=l.chipHoverBorder}),a.addEventListener("mouseleave",()=>{a.style.background=l.chipBg,a.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,a.appendChild(p);let s=document.createElement("span");s.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,s.innerHTML=he(e),s.title=e,a.appendChild(s);let r=document.createElement("button");return r.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,r.innerHTML=vn,r.addEventListener("mouseenter",()=>{r.style.color=l.badgeText}),r.addEventListener("mouseleave",()=>{r.style.color=l.fgMuted}),r.addEventListener("click",w=>{w.stopPropagation(),n()}),a.appendChild(r),a}function Ln(t,e,o,n,l){let u=Je(n),a=j[t%j.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=u.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",g=>{g.stopPropagation(),l()});let s=document.createElement("span");s.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${o?a:"transparent"};border:1.5px solid ${o?a:u.fgMuted};`,p.appendChild(s);let r=document.createElement("span");r.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${o?u.fg:u.fgMuted};`,r.innerHTML=he(e),r.title=e,p.appendChild(r);let w=t===0?"source pred":t===1?"target pred":null;if(w){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,g.textContent=w,p.appendChild(g)}if(o){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,g.textContent="selected",p.appendChild(g)}return p}function Ke(t,e){if(t.size!==e.size)return!1;for(let o of t)if(!e.has(o))return!1;return!0}var wn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},kn=["probability","prob_diff","rank"],Ie=class{constructor(e,o,n={}){this.modeButtons=new Map;this.container=e,this.allData=o,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=o.tokenLabels?.length??o.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,s)=>s);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Et(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let a=document.createElement("div");a.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(a),this.linePlot=new ae(a,this.buildPlotData(),this.buildPlotOptions()),a.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let o of kn){let n=document.createElement("button");n.textContent=wn[o],this.applyModeButtonStyles(n,o===this.mode),n.addEventListener("click",()=>this.setMode(o)),n.addEventListener("mouseenter",()=>{o!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{o!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(o,n)}return e}applyModeBarStyles(e){let o=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${o};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,o){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${o?l:"transparent"};color:${o?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,o]of this.modeButtons)this.applyModeButtonStyles(o,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),o=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((a,p)=>a-p),l=this.mode==="rank";return{richLines:n.filter(a=>a<e.length).map(a=>({values:l?e[a].map(p=>p+1):e[a],label:o[a]??`Token ${a}`,color:j[a%j.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let o=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,o)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<o));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let o=this.getModeLines().length,n=new Set(e.filter(l=>l<o));Ke(n,this.selectedTokens)||(this.selectedTokens=n,ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){St(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Mn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function et(t,e,o){let n=Mn(t);if(!n)return null;let l=e(n);if(o===void 0){let u=Ee(n,p=>l.setThemeMode(p)),a=l.destroy.bind(l);l.destroy=()=>{u(),a()}}return l}function Ct(t,e,o){return new Pe(t,e,o)}function Ht(t,e,o){return et(t,n=>new ae(n,e,{darkMode:de(n),...o}),o?.darkMode)}function Pt(t,e,o){return et(t,n=>new De(n,e,{darkMode:de(n),...o}),o?.darkMode)}function Dt(t,e,o){return et(t,n=>new Ie(n,e,{darkMode:de(n),...o}),o?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Ct,window.LinePlotWidget=Ht,window.HeatmapTableWidget=Pt,window.ActivationPatchingWidget=Dt);return Qt(Tn);})();
//# sourceMappingURL=charts.js.map
