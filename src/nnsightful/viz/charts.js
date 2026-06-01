"use strict";var InterpTools=(()=>{var Fe=Object.defineProperty;var Vt=Object.getOwnPropertyDescriptor;var Nt=Object.getOwnPropertyNames;var Ut=Object.prototype.hasOwnProperty;var Gt=(t,e)=>{for(var o in e)Fe(t,o,{get:e[o],enumerable:!0})},qt=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Nt(e))!Ut.call(t,l)&&l!==o&&Fe(t,l,{get:()=>e[l],enumerable:!(n=Vt(e,l))||n.enumerable});return t};var Yt=t=>qt(Fe({},"__esModule",{value:!0}),t);var Mn={};Gt(Mn,{ActivationPatchingWidget:()=>Pt,HeatmapTableWidget:()=>Ht,LinePlotWidget:()=>Ct,LogitLensWidget:()=>$t});function je(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let o=t.layers.length,n=t.input.length,l=[];for(let a=0;a<n;a++){let p=[],s=t.tracked[a];for(let r=0;r<o;r++){let w=t.topk[r][a],g=[];for(let v=0;v<w.length;v++){let S=w[v],I=s[S]||[],F=I[r]||0;g.push({token:S,prob:F,trajectory:I})}let h=g[0]||{token:"",prob:0,trajectory:[]};p.push({token:h.token,prob:h.prob,trajectory:h.trajectory,topk:g})}l.push(p)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function dt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function be(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Xt(t){let e=`#${t}`;return`
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
               which is clipped/scrolled by .ll-scroll). Content mode adds an
               inline max-width to hug the content; fill mode clears it. */
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
            -webkit-user-select: none; user-select: none;
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

        /* Fill mode: the host (workbench panel) gives a bounded box; the card
           fills it as a flex column and the heatmap scroll region grows to
           consume the leftover height (navigator + line plot keep their
           natural size). Content mode (Jupyter) keeps the card content-sized
           with a fixed-height scroll region set inline by renderHeatmap. */
        ${e}.ll-fill {
            display: flex; flex-direction: column;
            width: 100%; height: 100%;
        }
        ${e}.ll-fill .ll-scroll { flex: 1 1 auto; min-height: 0; }
        ${e}.ll-fill .ll-nav,
        ${e}.ll-fill .ll-lineplot-wrap { flex: 0 0 auto; }

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
    `}function ct(t){let e=document.createElement("style");return e.textContent=Xt(t),document.head.appendChild(e),e}function Ve(t,e,...o){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of o)l&&n(l)}var Ne=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"];var W=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function pe(t){return t.richLines&&t.richLines.length>0?t.richLines.map((o,n)=>({values:o.values,label:o.label??`Line ${n+1}`,color:o.color,dashPattern:o.dashPattern,isOverlay:o.isOverlay,removable:o.removable})):(t.lines??[]).map((o,n)=>({values:o,label:t.labels?.[n]??`Line ${n+1}`}))}function he(t){if(!t)return"";let e=[],o=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),o=1);let n="";for(;o<t.length;o++){let l=t[o];l===`
`?(n&&(e.push(pt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(pt(n)),e.join("")}function pt(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Qt(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let o of e)if(t<=o)return o;return 1}function ht(t,e,o){let n=pe(t),l=n.length>0?n[0].values.length:o?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",a=e.minValue,p=e.maxValue;if(a===void 0||p===void 0||e.autoScale){let s=[];for(let g of n)if(!g.isOverlay)for(let h of g.values)h!==null&&s.push(h);if(o)for(let g of o.values)g!==null&&s.push(g);if(s.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let r=1/0,w=-1/0;for(let g of s)g<r&&(r=g),g>w&&(w=g);if(e.centerYAxisAtZero){let h=Math.max(Math.abs(r),Math.abs(w))*1.1;a=-h,p=h}else if(e.logScale){if(a===void 0&&(a=Math.max(1,Math.floor(r))),p===void 0||e.autoScale){let g=Math.log(Math.max(1,r)),h=Math.log(Math.max(1,w)),v=h+.15*Math.max(1,h-g);p=Math.ceil(Math.exp(v))}}else a===void 0&&(a=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(r)):Math.floor(r*.9)),(p===void 0||e.autoScale)&&(u==="rank"?p=Math.ceil(w*1.1):u==="probability"?p=e.autoScale?Qt(Math.max(w,.001)):Math.min(w*1.1,1):p=w*1.1)}return{numLayers:l,minValue:a,maxValue:p,numLines:n.length}}function ut(t,e,o,n,l,u,a,p){let s=t.getContext("2d"),r=e.getBoundingClientRect(),w=window.devicePixelRatio||1;t.width=r.width*w,t.height=r.height*w,t.style.width=`${r.width}px`,t.style.height=`${r.height}px`,s.scale(w,w);let g=r.width,h=r.height,v=n.darkMode??!1,S=n.title,I=n.mode||"probability",F=n.invertYAxis??!1,B=n.centerYAxisAtZero??!1,N=n.logScale??!1,H=n.xAxisLabel||"Layer",_=n.yAxisLabel||"Probability",P=n.xRangeStart??0;P>=l.numLayers-1&&(console.warn(`xRangeStart (${P}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),P=0);let y=n.showDataPoints??!0,L={top:S?48:24,right:24,bottom:56,left:72},D=g-L.left-L.right,C=h-L.top-L.bottom,z={margin:L,chartWidth:D,chartHeight:C,width:g,height:h},U={background:v?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:v?"#52525b":"#a1a1aa",grid:v?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:v?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:v?"#e4e4e7":"#27272a"};n.transparentBackground?s.clearRect(0,0,g,h):(s.fillStyle=U.background,s.fillRect(0,0,g,h)),S&&(s.fillStyle=U.titleText,s.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="left",s.fillText(S,L.left,28));let Y=l.numLayers-1-P,ue=m=>Y<=0?L.left+D/2:L.left+(m-P)/Y*D,te=N?Math.log(Math.max(1,l.minValue)):0,q=N?Math.log(Math.max(1,l.maxValue)):0,A=m=>{let k;if(N){let $=Math.log(Math.max(1,m));k=q-te>0?($-te)/(q-te):.5}else k=(m-l.minValue)/(l.maxValue-l.minValue);return F?L.top+k*C:L.top+C-k*C};s.setLineDash([4,4]),s.strokeStyle=U.grid,s.lineWidth=1;let ne=[],xe=l.maxValue-l.minValue,j=5;if(N){let m=new Set;for(let X=0;X<j;X++){let ee=te+X/(j-1)*(q-te),G=Math.round(Math.exp(ee));m.has(G)||(m.add(G),ne.push(G))}let k=Math.round(Math.exp(te)),$=Math.round(Math.exp(q));m.has(k)||ne.unshift(k),m.has($)||ne.push($)}else if(I==="rank")for(let m=0;m<j;m++)ne.push(Math.round(l.minValue+m/(j-1)*xe));else for(let m=0;m<j;m++)ne.push(l.minValue+m/(j-1)*xe);if(ne.forEach(m=>{let k=A(m);s.beginPath(),s.moveTo(L.left,k),s.lineTo(L.left+D,k),s.stroke()}),s.setLineDash([]),B){let m=A(0);s.beginPath(),s.strokeStyle=v?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",s.lineWidth=1.5,s.moveTo(L.left,m),s.lineTo(L.left+D,m),s.stroke(),s.lineWidth=1}s.fillStyle=U.text,s.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="right",s.textBaseline="middle",ne.forEach(m=>{let k=A(m),$;I==="probability"?$=m.toFixed(2):I==="prob_diff"?$=m>=0?`+${m.toFixed(2)}`:m.toFixed(2):$=Math.round(m).toString(),s.fillText($,L.left-16,k)}),s.textAlign="center",s.textBaseline="top";let K=o.xLabels&&o.xLabels.length>0,me=Math.max(1,Math.ceil(l.numLayers/8));for(let m=0;m<l.numLayers;m+=me){let k=ue(m);if(k<L.left-5||k>L.left+D+5)continue;let $=K?String(o.xLabels[m]??m):m.toString();s.fillText($,k,L.top+C+12)}if((l.numLayers-1)%me!==0){let m=K?String(o.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();s.fillText(m,ue(l.numLayers-1),L.top+C+12)}s.strokeStyle=v?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",s.lineWidth=1.5,s.beginPath(),s.moveTo(L.left,L.top),s.lineTo(L.left,L.top+C),s.lineTo(L.left+D,L.top+C),s.stroke(),s.fillStyle=U.textMuted,s.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(H.toUpperCase(),L.left+D/2,h-16),s.save(),s.translate(14,L.top+C/2),s.rotate(-Math.PI/2),s.textAlign="center",s.textBaseline="top",s.fillText(_.toUpperCase(),0,0),s.restore();let re=pe(o);function oe(m,k,$,X,ee){s.beginPath(),s.strokeStyle=k,s.lineWidth=$,ee!==void 0&&(s.globalAlpha=ee),X?s.setLineDash(X.split(",").map(Number)):s.setLineDash([]);let G=!1;for(let Q=0;Q<m.length;Q++){let ie=m[Q];if(ie===null){G=!1;continue}let fe=ue(Q),Me=A(ie);G?s.lineTo(fe,Me):(s.moveTo(fe,Me),G=!0)}s.stroke(),s.setLineDash([]),ee!==void 0&&(s.globalAlpha=1)}let ye=v?"#3f3f46":"#d4d4d8";if(s.lineCap="round",s.lineJoin="round",re.forEach((m,k)=>{!u.has(k)||m.isOverlay||oe(m.values,ye,2,void 0,.35)}),re.forEach((m,k)=>{if(u.has(k)||m.isOverlay)return;let $=m.color??W[k%W.length];oe(m.values,$,4,m.dashPattern,.15),oe(m.values,$,2,m.dashPattern),y&&m.values.forEach((X,ee)=>{if(X===null)return;let G=ue(ee),Q=A(X),ie=a?.lineIdx===k&&a?.layerIdx===ee;s.beginPath(),s.strokeStyle=$,s.lineWidth=ie?2:1.5,s.arc(G,Q,ie?5:3.5,0,Math.PI*2),s.stroke(),s.beginPath(),s.fillStyle=v?"#18181b":"#ffffff",s.arc(G,Q,ie?3.5:2.5,0,Math.PI*2),s.fill()})}),re.forEach((m,k)=>{if(!m.isOverlay||u.has(k))return;let $=m.color??"#999";oe(m.values,$,1.5,m.dashPattern??"4,2",.7)}),p){let m=p.color??"#999";oe(p.values,m,1.5,p.dashPattern??"4,2",.7)}return z}function mt(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function ft(t,e,o,n,l,u,a,p,s){let{margin:r,chartWidth:w,chartHeight:g}=l,h=n.xRangeStart??0,v=a-1-h,S=n.logScale?Math.log(Math.max(1,p)):0,I=n.logScale?Math.log(Math.max(1,s)):0;if(t<r.left||t>r.left+w||e<r.top||e>r.top+g)return null;let F=pe(o),B=null,N=1/0,H=20;for(let _=0;_<F.length;_++){if(u.has(_))continue;let P=F[_];if(!P.isOverlay)for(let y=0;y<P.values.length;y++){let L=P.values[y];if(L===null)continue;let D=v<=0?r.left+w/2:r.left+(y-h)/v*w,C;if(n.logScale){let Y=Math.log(Math.max(1,L));C=I-S>0?(Y-S)/(I-S):.5}else C=(L-p)/(s-p);let z=n.invertYAxis?r.top+C*g:r.top+g-C*g,U=Math.sqrt((t-D)**2+(e-z)**2);U<N&&U<H&&(N=U,B={visible:!0,x:D,y:z,lineIdx:_,layerIdx:y,value:L,label:P.label,color:P.color??W[_%W.length]})}}return B}function Ue(t,e,o,n,l,u,a){if(!e){t.style.opacity="0";return}let p=n?"#27272a":"#fff",s=n?"#3f3f46":"#e4e4e7",r=n?"#fafafa":"#18181b",w=n?"#a1a1aa":"#71717a",h=e.x>o/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${h},-50%);`;let v=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
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
        </div>`}var Zt='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Jt='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',Kt='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function gt(t){let e=document.createElement("div");return bt(e,t),e}function bt(t,e){let o=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${o};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function vt(t,e,o,n,l,u){bt(t,n),t.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",s=n?"#a1a1aa":"#71717a",r=n?"#3f3f46":"#d4d4d8",w="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",h=u?pe(u):[];e.forEach((v,S)=>{let I=h[S];if(I?.isOverlay)return;let F=I?.color??W[S%W.length],B=o.has(S),N=I?.removable??!1,H=document.createElement("button");H.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${B?"0.5":"1"};`,H.addEventListener("mouseenter",()=>{H.style.background=g}),H.addEventListener("mouseleave",()=>{H.style.background="transparent"}),H.addEventListener("click",()=>l.onToggle(S));let _=document.createElement("span");_.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${B?w:F};background:${B?r:"transparent"};`,H.appendChild(_);let P=document.createElement("span");if(P.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${B?p:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,P.title=v,P.innerHTML=he(v),H.appendChild(P),N&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${s};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=Kt,y.title="Remove",y.addEventListener("click",L=>{L.stopPropagation(),l.onRemove(S)}),H.appendChild(y),H.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),H.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${s};opacity:${B?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=B?Jt:Zt,H.appendChild(y),B||(H.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),H.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}t.appendChild(H)})}var ae=class{constructor(e,o,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let o=this.canvas.getBoundingClientRect(),n=e.clientX-o.left,l=e.clientY-o.top;this.tooltip=ft(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Ue(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Ue(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=o,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=mt(this.chartContainer),this.legendEl=gt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let a=Math.round(u.contentRect.width),p=Math.round(u.contentRect.height);a===this.lastWidth&&p===this.lastHeight||(this.lastWidth=a,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,o)=>e.label??`Line ${o+1}`):this.data.labels||(this.data.lines??[]).map((e,o)=>`Line ${o+1}`)}draw(){this.config=ht(this.data,this.options,this.overlay),this.config&&(this.geometry=ut(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",vt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:o=>this.toggleLine(o),onRemove:this.options.onLineRemoved?o=>{this.removeLine(o,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(o)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((o,n)=>({values:o,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,o=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,o||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function Ge(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let o=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(o){let n=o[1],l,u,a,p=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),a=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),a=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[l,u,a,p]}return null}function qe(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function en(t){let e=t;for(;e;){let o=qe(Ge(getComputedStyle(e).backgroundColor));if(o!==null)return o;e=e.parentElement}if(typeof document<"u")for(let o of[document.body,document.documentElement]){if(!o)continue;let n=qe(Ge(getComputedStyle(o).backgroundColor));if(n!==null)return n}return null}function tn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let o=qe(Ge(e));return o===null?null:o<.5}function Ee(t,e){let o=de(t),n=()=>{let a=de(t);a!==o&&(o=a,e(a))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function de(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=tn();if(e!==null)return e;let o=en(t??null);return o!==null?o<.5:!1}var Se=60,$e=30,xt=22,nn=360,Ce=48,on=150,ln=18,yt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},rn="#cc6622";function sn(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Lt=41;function Ye(t,e,o){let[n,l,u]=sn(e),a=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(o){let s=r=>Math.round(Lt+(r-Lt)*a);return`rgb(${s(n)}, ${s(l)}, ${s(u)})`}let p=s=>Math.round(255-(255-s)*a);return`rgb(${p(n)}, ${p(l)}, ${p(u)})`}function an(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Xe(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-dot">\xB7</span>'+be(t.slice(1)):be(t)}function ve(t){return t==null?"":t.startsWith(" ")?"\xB7"+t.slice(1):t}function He(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function wt(t,e,o){let n=dt(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=je(e),a=u.normalized,p=u.v2Data,s=ct(n),r={ramp:o?.ramp||"purple",showGrid:o?.showGrid??!0,dimLow:o?.dimLowProb??!0,selectedRow:o?.selectedRow??null,selectedLayerIdx:null,viewStart:0,viewSize:a.layers.length,darkModeOverride:o?.darkMode??null,pinned:[],colorIndex:0,openPopup:null},w={};function g(i,d){(w[i]||[]).forEach(c=>c(d))}let h=a.layers.length,v=a.tokens.length,S=[],I="";function F(){h=a.layers.length,v=a.tokens.length,S=[];for(let d=0;d<h;d++){let c=0;for(let b=0;b<v;b++){let f=a.cells[b]?.[d];f&&f.prob>c&&(c=f.prob)}S.push(c)}I=a.cells[v-1]?.[h-1]?.token??"",(r.viewSize>h||r.viewSize<1)&&(r.viewSize=h);let i=Math.max(0,h-r.viewSize);r.viewStart>i&&(r.viewStart=i),r.viewStart<0&&(r.viewStart=0)}F();function B(i){let d=r.pinned.find(c=>c.token===i);return d?d.color:null}function N(i){let d=r.pinned.findIndex(c=>c.token===i);d>=0?r.pinned.splice(d,1):(r.pinned.push({token:i,color:Ne[r.colorIndex%Ne.length]}),r.colorIndex++)}function H(i,d){let c=p?.tracked?.[i];if(c&&Array.isArray(c[d]))return c[d];for(let b=0;b<h;b++){let f=a.cells[i]?.[b]?.topk.find(M=>M.token===d);if(f)return f.trajectory}return null}function _(){return yt[r.ramp]||yt.purple}function P(){return r.darkModeOverride!==null?r.darkModeOverride:de(l)}function y(){let i=z.clientWidth;if(i>0)return i;let d=l?.clientWidth??0;return d>0?d-42:900}function L(){let i=Math.floor((y()-Se)/Ce);return Math.max(1,Math.min(ln,i))}function D(){let i=Math.max(0,h-r.viewSize),d=Math.max(0,Math.min(i,r.viewStart)),c=r.viewSize,b=L();if(c<=b){let x=[];for(let E=0;E<c;E++)x.push(d+E);return{shownLayers:x,stride:1,start:d}}let f=Math.ceil(c/b),M=[];for(let x=d;x<d+c;x+=f)M.push(x);let T=d+c-1;return M[M.length-1]!==T&&M.push(Math.min(h-1,T)),{shownLayers:M,stride:f,start:d}}l.innerHTML=`
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
    `;let C=document.getElementById(n),z=document.getElementById(n+"_scroll"),U=document.getElementById(n+"_nav"),Y=document.getElementById(n+"_lp_wrap"),ue=document.getElementById(n+"_lp_token"),te=document.getElementById(n+"_lp"),q=document.getElementById(n+"_tt"),A=document.getElementById(n+"_popup"),ne=document.getElementById(n+"_popup_hdr"),xe=document.getElementById(n+"_popup_body");document.body.appendChild(A);let j=null,K=null,me=!0,re=!getComputedStyle(C).getPropertyValue("--ll-aspect-ratio").trim();re&&C.classList.add("ll-fill");let oe=Ce,ye=$e;function m(){let i=y(),d=D().shownLayers.length;if(oe=d>0?Math.max(Ce,Math.min(on,Math.floor((i-Se)/d))):Ce,!re){ye=$e;return}let c=z.clientHeight,b=xt+6+28,f=c-b;ye=v>0&&v*$e<f?Math.floor(f/v):$e}function k(){let i=_(),d=P(),c=r.showGrid?d?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(re){let E=l.clientWidth;C.style.width=E>0?E+"px":"100%",C.style.maxWidth="100%",z.style.maxHeight=""}else C.style.width="",C.style.maxWidth="",z.style.maxHeight=nn+"px";m();let{shownLayers:b}=D(),f=b.length,M=Math.round(Se+oe*f),T=`${Se}px repeat(${f}, ${oe}px)`,x=`<div class="ll-grid-inner" style="width:${M}px;min-width:${M}px;">`;x+=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${T};height:${xt+6}px;">`,x+='<div class="ll-corner">token</div>';for(let E of b)x+=`<div class="ll-hdr-cell">${a.layers[E]}</div>`;x+="</div>";for(let E=0;E<v;E++){let J=a.tokens[E],O=He(J),V=E===r.selectedRow;x+=`<div class="ll-row" data-rowwrap="${E}">`,V&&(x+='<div class="ll-row-rail"></div>'),x+=`<div class="ll-row-grid${V?" ll-row-sel":""}" data-row="${E}" style="display:grid;grid-template-columns:${T};height:${ye}px;">`,x+='<div class="ll-row-label">',x+=O?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${V?"font-weight:600;":""}">${Xe(J)}</span>`,x+="</div>";for(let Te of b){let R=a.cells[E][Te],se=R.prob,Le=I!==""&&R.token===I,Re=Ye(se,Le?rn:i,d),at=an(se,d),Wt=se<.18,Ft=r.dimLow&&Wt?"opacity:0.55;":"",We=B(R.token),jt=We?`box-shadow:inset 0 0 0 2px ${We};`:"";x+=`<div class="ll-cell${We?" ll-cell-pinned":""}" data-row="${E}" data-layer="${Te}" style="background:${Re};color:${at};padding:0 6px;${Ft}${c}${jt}"><span class="ll-cell-text">${Xe(R.token)}</span></div>`}x+="</div></div>"}x+=`<div style="display:grid;grid-template-columns:${T};margin-top:6px;"><div></div><div class="ll-axis-caption" style="grid-column:2 / span ${f};">layer</div></div>`,x+="</div>",z.innerHTML=x}function $(){let i=_(),d=P(),{stride:c,start:b}=D(),f=r.viewSize,M=f>=h,T='<span class="ll-nav-range-key">layers</span>';M?T+=`all ${h}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):T+=`${b}\u2013${b+f-1}<span class="ll-dim"> / ${h}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let x="";for(let R=0;R<h;R++){let se=S[R]||0,Le=Math.max(8,Math.round(se*92));x+=`<div class="ll-skyline-bar" style="height:${Le}%;background:${Ye(se,i,d)}"></div>`}let E=b/h*100,J=f/h*100,O=[];for(let R=0;R<h;R+=8)O.push(R);O[O.length-1]!==h-1&&O.push(h-1);let V="",Te=Math.max(1,h-1);for(let R of O){let se=R===h-1,Le=R===0,Re=R/Te*100;V+=`<span class="ll-nav-tick" style="left:${Re}%;transform:${se?"translateX(-100%)":Le?"translateX(0)":"translateX(-50%)"}">${a.layers[R]}</span>`}U.innerHTML=`
            <div class="ll-nav-range">${T}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${x}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${E}%;width:${J}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${V}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${b<=0?"disabled":""}>${cn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${b+f>=h?"disabled":""}>${pn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in">${hn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${M?"disabled":""}>${un}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${dn}</button>
            </div>
        `,It()}function X(){let i=document.getElementById(n+"_win");if(!i)return;let d=Math.max(0,h-r.viewSize),c=Math.max(0,Math.min(d,r.viewStart));i.style.left=c/h*100+"%",i.style.width=r.viewSize/h*100+"%"}function ee(){return Array.from(new Set([h,48,32,20,14,10,8])).filter(i=>i<=h&&i>=1).sort((i,d)=>i-d)}function G(i){return Math.max(0,Math.min(Math.max(0,h-r.viewSize),i))}let Q=!1;function ie(){Q||(Q=!0,requestAnimationFrame(()=>{Q=!1,k(),X()}))}function fe(i){let d=G(r.viewStart+i);d!==r.viewStart&&(r.viewStart=d,k(),$(),ge())}function Me(i){let d=G(i);d!==r.viewStart&&(r.viewStart=d,ie())}function et(i,d){let c=ee(),b=c.findIndex(x=>x>=r.viewSize),f=b===-1?c.length-1:b,M=i<0?Math.max(0,f-1):Math.min(c.length-1,f+1),T=c[M];T!==r.viewSize&&(r.viewSize=T,r.viewStart=Math.max(0,Math.min(h-T,Math.round(d-T/2))),k(),$(),ge())}function tt(i){et(i,r.viewStart+r.viewSize/2)}function Dt(){r.viewSize=h,r.viewStart=0,k(),$(),ge()}let ce=null;function It(){let i=document.getElementById(n+"_sky");if(!i)return;i.addEventListener("pointerdown",c=>{let b=i.getBoundingClientRect(),f=c.clientX-b.left,M=b.width/h,T=Math.max(0,h-r.viewSize),x=Math.max(0,Math.min(T,r.viewStart)),E=x*M,J=(x+r.viewSize)*M,O=x;(f<E||f>J)&&(O=G(Math.round(f/M)-Math.floor(r.viewSize/2)),r.viewStart=O,ie()),ce={startX:f,startStart:O,layerW:M},i.classList.add("ll-grabbing");try{i.setPointerCapture(c.pointerId)}catch{}}),i.addEventListener("pointermove",c=>{if(!ce)return;let b=i.getBoundingClientRect(),M=(c.clientX-b.left-ce.startX)/ce.layerW;Me(Math.round(ce.startStart+M))});let d=c=>{if(ce){ce=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(c.pointerId)}catch{}$(),ge()}};i.addEventListener("pointerup",d),i.addEventListener("pointercancel",d),i.addEventListener("wheel",c=>{c.preventDefault();let b=i.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){fe(c.deltaX>0?1:-1);return}let f=Math.round((c.clientX-b.left)/b.width*h);et(c.deltaY<0?-1:1,f)},{passive:!1})}function nt(i,d,c=!1){r.selectedRow=i,r.selectedLayerIdx=d??a.layers.length-1,k(),le(),c&&Bt(i),ge()}function Bt(i){let d=z.querySelector(`[data-rowwrap="${i}"]`);if(!d)return;let c=d.offsetTop-z.clientHeight/2+d.offsetHeight/2;z.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function le(i){let d=r.selectedRow,c=[];if(d!==null)for(let f of r.pinned){let M=H(d,f.token);M&&c.push({values:M.map(T=>T??null),label:ve(f.token),color:f.color,removable:!1})}let b=c.length===0&&!i;if(b)Y.classList.add("ll-hidden");else{Y.classList.remove("ll-hidden"),ue.textContent=d===null?"":He(a.tokens[d])?"position "+d+" \xB7 bos":"position "+d+" \xB7 "+ve(a.tokens[d]);let f={lines:[],richLines:c,xLabels:a.layers},M={darkMode:P(),mode:"probability",autoScale:!0,legendPosition:c.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};j?(j.setData(f),j.setOptions(M)):(te.style.minHeight="0",j=new ae(te,f,M)),i?j.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):j.setOverlay?.(null)}re&&b!==me?(me=b,requestAnimationFrame(()=>k())):me=b}function zt(i,d,c,b){let f=a.cells[i]?.[d];if(!f)return;let M=_(),T=He(a.tokens[i])?"bos":ve(a.tokens[i]);q.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Ye(f.prob,M,P())}"></span><span class="ll-tt-token">${be(ve(f.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(f.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${a.layers[d]} / ${a.layers[h-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${be(T)}</span></div>`,q.classList.add("ll-visible");let x=C.getBoundingClientRect(),E=q.offsetWidth||220,J=q.offsetHeight||90,O=c-x.left+16;c+E+24>window.innerWidth-8&&(O=c-x.left-E-12);let V=b-x.top-50;O=Math.max(6,Math.min(O,x.width-E-6)),V=Math.max(6,Math.min(V,x.height-J-6)),q.style.left=O+"px",q.style.top=V+"px"}function Be(){q.classList.remove("ll-visible")}function Ot(){ze(),K=document.createElement("div"),K.style.cssText="position:fixed;inset:0;z-index:49;",K.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),it()}),document.body.appendChild(K)}function ze(){K&&(K.remove(),K=null)}function _t(i,d,c){if(!a.cells[i]?.[d])return;let f=c.getBoundingClientRect();r.openPopup={row:i,layer:d},r.selectedRow=i,r.selectedLayerIdx=d;let M=He(a.tokens[i])?"bos":ve(a.tokens[i]);ne.innerHTML=`Layer <b>${a.layers[d]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${be(M)}</code></div>`,ot(i,d),k(),le(),A.style.visibility="hidden",A.classList.add("ll-visible"),At(f),A.style.visibility="",Ot()}function ot(i,d){let c=a.cells[i][d],b="";c.topk.forEach((f,M)=>{let T=B(f.token),x=T?`background:${T}22;border-left-color:${T};`:"";b+=`<div class="ll-topk${T?" ll-topk-pinned":""}" data-ki="${M}" style="${x}" title="click to track trajectory"><span class="ll-topk-tok">${Xe(f.token)}</span><span class="ll-topk-prob">${(f.prob*100).toFixed(1)}%</span></div>`}),xe.innerHTML=b,xe.querySelectorAll(".ll-topk").forEach(f=>{let M=parseInt(f.dataset.ki),T=c.topk[M];f.addEventListener("mouseenter",()=>{let x=H(i,T.token);x&&le({values:x.map(E=>E??null),label:ve(T.token),color:"#999"})}),f.addEventListener("mouseleave",()=>le()),f.addEventListener("click",x=>{x.stopPropagation(),N(T.token),k(),ot(i,d),le(),ge()})})}function At(i){let b=A.offsetWidth||220,f=A.offsetHeight||160,M=6,T=window.innerWidth-b-6,x=6,E=window.innerHeight-f-6,J=[{left:i.right+6,top:i.top},{left:i.left-6-b,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-f}],O=J[0];for(let V of J)if(V.left>=M&&V.left<=T&&V.top>=x&&V.top<=E){O=V;break}A.style.left=Math.max(M,Math.min(O.left,T))+"px",A.style.top=Math.max(x,Math.min(O.top,E))+"px"}function it(){r.openPopup=null,A.classList.remove("ll-visible"),ze(),k(),le()}document.getElementById(n+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),it()});let Z=null;z.addEventListener("mousemove",i=>{let d=i.target.closest(".ll-cell");if(!d){Z&&(Z.classList.remove("ll-cell-hover"),Z=null),Be();return}Z!==d&&(Z&&Z.classList.remove("ll-cell-hover"),Z=d,Z.classList.add("ll-cell-hover"));let c=parseInt(d.dataset.row),b=parseInt(d.dataset.layer);zt(c,b,i.clientX,i.clientY)}),z.addEventListener("mouseleave",()=>{Z&&(Z.classList.remove("ll-cell-hover"),Z=null),Be()}),z.addEventListener("click",i=>{let d=i.target.closest(".ll-cell");if(d){let b=parseInt(d.dataset.row),f=parseInt(d.dataset.layer);Be(),_t(b,f,d);return}let c=i.target.closest(".ll-row-grid");c&&nt(parseInt(c.dataset.row))}),z.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let d=r.selectedRow??-1,c=i.key==="ArrowDown"?Math.min(v-1,d+1):Math.max(0,d-1);nt(c,void 0,!0)}),U.addEventListener("click",i=>{let d=i.target.closest("[data-nav]");if(!d||d.hasAttribute("disabled"))return;let c=d.dataset.nav;c==="panL"?fe(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?fe(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?tt(-1):c==="zoomOut"?tt(1):c==="reset"&&Dt()});function Oe(){k(),$(),le(),requestAnimationFrame(()=>{k(),$()})}function _e(){Ve(C,P(),A)}function ge(){g("stateChange",st())}Oe(),_e();let Ae=0,lt=l?.clientWidth??0,rt=new ResizeObserver(()=>{let i=l?.clientWidth??0;i!==lt&&(lt=i,!Ae&&(Ae=requestAnimationFrame(()=>{Ae=0,k()})))});l&&rt.observe(l);let Rt=Ee(l,i=>{r.darkModeOverride===null&&(Ve(C,i,A),k(),$(),le())});function st(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,darkMode:r.darkModeOverride}}return{widget:{getState:st,setState:i=>{i.ramp!==void 0&&(r.ramp=i.ramp),i.showGrid!==void 0&&(r.showGrid=i.showGrid),i.dimLowProb!==void 0&&(r.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(r.selectedRow=i.selectedRow),i.darkMode!==void 0&&(r.darkModeOverride=i.darkMode),_e(),Oe()},setData:i=>{u=je(i),a=u.normalized,p=u.v2Data,F(),r.selectedRow=null,r.selectedLayerIdx=null,Oe()},setTitle:()=>{},setThemeMode:i=>{r.darkModeOverride=!!i,_e(),k(),$(),le()},getThemeMode:()=>P(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let i of p.tracked)for(let d in i){let c=i[d];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,d)=>{(w[i]||(w[i]=[])).push(d)},off:(i,d)=>{w[i]=(w[i]||[]).filter(c=>c!==d)},destroy:()=>{Rt(),rt?.disconnect(),ze(),A.remove(),j&&(j.destroy(),j=null),l&&(l.innerHTML="")}},styleEl:s}}var dn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',cn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',pn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',hn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',un='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Pe=class{constructor(e,o,n){this.widget=null;this.styleEl=null;let l=wt(e,o,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,o){this.widget?.on(e,o)}off(e,o){this.widget?.off(e,o)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function we(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function kt(t,e,o){let n=o.cellWidth??44,l=o.rowHeaderWidth??100,u=o.darkMode??!1,a="";a+="<colgroup>",a+=`<col style="width:${l}px;">`;for(let s=0;s<e.columns.length;s++)a+=`<col style="width:${n}px;">`;a+="</colgroup>";let p=o.maxRows!=null?Math.min(e.rows.length,o.maxRows):e.rows.length;for(let s=0;s<p;s++){let r=e.rows[s];a+="<tr>";let w=`width:${l}px;max-width:${l}px;`;r.pinned&&(w+=u?"background:#4a4a00;color:#fff;":"background:#fff59d;"),a+=`<td class="hm-row-header${r.pinned?" hm-pinned":""}" data-row="${s}" title="${we(r.label)}" style="${w}">`,a+=we(r.label),a+="</td>";for(let g=0;g<e.columns.length;g++){let h=e.getCellValue(s,g),v=`background:${h.color};color:${h.textColor};width:${n}px;max-width:${n}px;`;h.highlighted&&h.highlightColor&&(v+=`box-shadow:inset 0 0 0 2px ${h.highlightColor};`),h.bold&&(v+="font-weight:bold;"),a+=`<td class="hm-cell${h.highlighted?" hm-highlighted":""}" data-row="${s}" data-col="${g}" style="${v}">`,a+=we(h.text),a+="</td>"}a+="</tr>"}a+="<tr>",a+=`<th class="hm-corner" style="width:${l}px;max-width:${l}px;">${we(o.cornerLabel??"Layer")}</th>`;for(let s=0;s<e.columns.length;s++)a+=`<th class="hm-col-header" style="width:${n}px;max-width:${n}px;">${we(e.columns[s].label)}</th>`;return a+="</tr>",a}function mn(t){return`
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
    `}function Mt(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=mn(t),document.head.appendChild(e),e}var fn=0,De=class{constructor(e,o,n={}){this.destroyed=!1;this.container=e,this.data=o,this.options={cellWidth:44,rowHeaderWidth:100,darkMode:!1,...n},this.uid="hm_"+ ++fn+"_"+Date.now().toString(36),this.styleEl=Mt(this.uid),this.table=document.createElement("table"),this.table.className=`heatmap-${this.uid}`,e.appendChild(this.table),this.render()}render(){if(this.destroyed)return;let e=kt(this.uid,this.data,this.options);this.table.innerHTML=e,this.options.darkMode?this.table.classList.add("hm-dark"):this.table.classList.remove("hm-dark"),this.attachListeners()}attachListeners(){this.table.querySelectorAll(".hm-cell").forEach(e=>{let o=parseInt(e.dataset.row),n=parseInt(e.dataset.col);e.addEventListener("mouseenter",()=>{this.options.onCellHover?.(o,n)}),e.addEventListener("mouseleave",()=>{this.options.onCellLeave?.()}),e.addEventListener("click",l=>{l.stopPropagation(),this.options.onCellClick?.(o,n)})}),this.table.querySelectorAll(".hm-row-header").forEach(e=>{let o=parseInt(e.dataset.row);e.addEventListener("click",n=>{n.stopPropagation(),this.options.onRowHeaderClick?.(o)})})}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.table}getTableWidth(){return this.table.offsetWidth}destroy(){this.destroyed=!0,this.container.removeChild(this.table),this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var gn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',bn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',vn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',Qe="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function Ze(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Tt(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${Qe};`;let o={isOpen:!1,searchQuery:""},n=St(e,t,o);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=o,e}function ke(t,e){let o=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;o&&o();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=St(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function Et(t){let e=t.__tokenSelectorCleanup;e&&e()}function St(t,e,o){t.innerHTML="";let n=Ze(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:a,onChange:p}=e,s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let r=document.createElement("span");if(r.style.cssText=`font-size:11px;color:${n.fgMuted};`,r.textContent=`Tokens (${l.length})`,s.appendChild(r),!Je(u,a)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${Qe};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${gn} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=n.fg}),y.addEventListener("mouseleave",()=>{y.style.color=n.fgMuted}),y.addEventListener("click",()=>{p(Array.from(a))}),s.appendChild(y)}t.appendChild(s);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{H(),v.focus()});let h=Array.from(u).sort((y,L)=>y-L);for(let y of h){let L=xn(y,l[y],e.darkMode,()=>{let D=new Set(u);D.delete(y),p(Array.from(D))});g.appendChild(L)}let v=document.createElement("input");v.type="text",v.placeholder=h.length===0?"Search tokens...":"",v.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${Qe};min-width:60px;flex:1;padding:2px 0;`,v.addEventListener("input",()=>{o.searchQuery=v.value,N()}),v.addEventListener("focus",()=>H()),g.appendChild(v);let S=document.createElement("span");S.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,S.innerHTML=vn,S.addEventListener("click",y=>{y.stopPropagation(),o.isOpen?_():H()}),g.appendChild(S),t.appendChild(g);let I=document.createElement("div");I.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let F=document.createElement("div");F.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",I.appendChild(F);let B=document.createElement("div");B.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,B.textContent="No tokens found",I.appendChild(B),t.appendChild(I);function N(){F.innerHTML="";let y=o.searchQuery.toLowerCase(),L=0;for(let D=0;D<l.length;D++){let C=l[D];if(y&&!C.toLowerCase().includes(y))continue;L++;let z=u.has(D),U=yn(D,C,z,e.darkMode,()=>{let Y=new Set(u);z?Y.delete(D):Y.add(D),p(Array.from(Y))});F.appendChild(U)}B.style.display=L===0?"":"none"}function H(){o.isOpen||(o.isOpen=!0,I.style.display="",S.style.transform="rotate(180deg)",N())}function _(){o.isOpen&&(o.isOpen=!1,I.style.display="none",S.style.transform="",v.value="",o.searchQuery="")}function P(y){t.contains(y.target)||_()}return document.addEventListener("mousedown",P),o.isOpen&&(I.style.display="",S.style.transform="rotate(180deg)",v.value=o.searchQuery,N(),requestAnimationFrame(()=>{v.isConnected&&v.focus()})),()=>{document.removeEventListener("mousedown",P)}}function xn(t,e,o,n){let l=Ze(o),u=W[t%W.length],a=document.createElement("div");a.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,a.addEventListener("mouseenter",()=>{a.style.background=l.chipHoverBg,a.style.borderColor=l.chipHoverBorder}),a.addEventListener("mouseleave",()=>{a.style.background=l.chipBg,a.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,a.appendChild(p);let s=document.createElement("span");s.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,s.innerHTML=he(e),s.title=e,a.appendChild(s);let r=document.createElement("button");return r.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,r.innerHTML=bn,r.addEventListener("mouseenter",()=>{r.style.color=l.badgeText}),r.addEventListener("mouseleave",()=>{r.style.color=l.fgMuted}),r.addEventListener("click",w=>{w.stopPropagation(),n()}),a.appendChild(r),a}function yn(t,e,o,n,l){let u=Ze(n),a=W[t%W.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=u.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",g=>{g.stopPropagation(),l()});let s=document.createElement("span");s.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${o?a:"transparent"};border:1.5px solid ${o?a:u.fgMuted};`,p.appendChild(s);let r=document.createElement("span");r.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${o?u.fg:u.fgMuted};`,r.innerHTML=he(e),r.title=e,p.appendChild(r);let w=t===0?"source pred":t===1?"target pred":null;if(w){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,g.textContent=w,p.appendChild(g)}if(o){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,g.textContent="selected",p.appendChild(g)}return p}function Je(t,e){if(t.size!==e.size)return!1;for(let o of t)if(!e.has(o))return!1;return!0}var Ln={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},wn=["probability","prob_diff","rank"],Ie=class{constructor(e,o,n={}){this.modeButtons=new Map;this.container=e,this.allData=o,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=o.tokenLabels?.length??o.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,s)=>s);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Tt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let a=document.createElement("div");a.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(a),this.linePlot=new ae(a,this.buildPlotData(),this.buildPlotOptions()),a.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let o of wn){let n=document.createElement("button");n.textContent=Ln[o],this.applyModeButtonStyles(n,o===this.mode),n.addEventListener("click",()=>this.setMode(o)),n.addEventListener("mouseenter",()=>{o!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{o!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(o,n)}return e}applyModeBarStyles(e){let o=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${o};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,o){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${o?l:"transparent"};color:${o?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,o]of this.modeButtons)this.applyModeButtonStyles(o,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),o=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((a,p)=>a-p),l=this.mode==="rank";return{richLines:n.filter(a=>a<e.length).map(a=>({values:l?e[a].map(p=>p+1):e[a],label:o[a]??`Token ${a}`,color:W[a%W.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let o=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,o)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<o));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),ke(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let o=this.getModeLines().length,n=new Set(e.filter(l=>l<o));Je(n,this.selectedTokens)||(this.selectedTokens=n,ke(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Et(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function kn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function Ke(t,e,o){let n=kn(t);if(!n)return null;let l=e(n);if(o===void 0){let u=Ee(n,p=>l.setThemeMode(p)),a=l.destroy.bind(l);l.destroy=()=>{u(),a()}}return l}function $t(t,e,o){return new Pe(t,e,o)}function Ct(t,e,o){return Ke(t,n=>new ae(n,e,{darkMode:de(n),...o}),o?.darkMode)}function Ht(t,e,o){return Ke(t,n=>new De(n,e,{darkMode:de(n),...o}),o?.darkMode)}function Pt(t,e,o){return Ke(t,n=>new Ie(n,e,{darkMode:de(n),...o}),o?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=$t,window.LinePlotWidget=Ct,window.HeatmapTableWidget=Ht,window.ActivationPatchingWidget=Pt);return Yt(Mn);})();
//# sourceMappingURL=charts.js.map
