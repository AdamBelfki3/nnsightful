"use strict";var InterpTools=(()=>{var Ge=Object.defineProperty;var tn=Object.getOwnPropertyDescriptor;var nn=Object.getOwnPropertyNames;var on=Object.prototype.hasOwnProperty;var ln=(t,e)=>{for(var o in e)Ge(t,o,{get:e[o],enumerable:!0})},rn=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of nn(e))!on.call(t,l)&&l!==o&&Ge(t,l,{get:()=>e[l],enumerable:!(n=tn(e,l))||n.enumerable});return t};var an=t=>rn(Ge({},"__esModule",{value:!0}),t);var On={};ln(On,{ActivationPatchingWidget:()=>Wt,HeatmapTableWidget:()=>Rt,LinePlotWidget:()=>At,LogitLensWidget:()=>_t});function qe(t){let e=t;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let o=t.layers.length,n=t.input.length,l=[];for(let a=0;a<n;a++){let h=[],r=t.tracked[a];for(let f=0;f<o;f++){let s=t.topk[f][a],g=[];for(let p=0;p<s.length;p++){let M=s[p],H=r[M]||[],W=H[f]||0;g.push({token:M,prob:W,trajectory:H})}let w=g[0]||{token:"",prob:0,trajectory:[]};h.push({token:w.token,prob:w.prob,trajectory:w.trajectory,topk:g})}l.push(h)}return{normalized:{layers:t.layers,tokens:t.input,cells:l,meta:t.meta||{}},v2Data:t}}function xt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function xe(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function sn(t){let e=`#${t}`;return`
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
    `}function yt(t){let e=document.createElement("style");return e.textContent=sn(t),document.head.appendChild(e),e}function Ye(t,e,...o){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(t),e?t.style.colorScheme="dark":t.style.colorScheme="";for(let l of o)l&&n(l)}var Xe=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"];var j=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function ge(t){return t.richLines&&t.richLines.length>0?t.richLines.map((o,n)=>({values:o.values,label:o.label??`Line ${n+1}`,color:o.color,dashPattern:o.dashPattern,isOverlay:o.isOverlay,removable:o.removable})):(t.lines??[]).map((o,n)=>({values:o,label:t.labels?.[n]??`Line ${n+1}`}))}function be(t){if(!t)return"";let e=[],o=0;t.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),o=1);let n="";for(;o<t.length;o++){let l=t[o];l===`
`?(n&&(e.push(Lt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(Lt(n)),e.join("")}function Lt(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function dn(t){if(t>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let o of e)if(t<=o)return o;return 1}function wt(t,e,o){let n=ge(t),l=n.length>0?n[0].values.length:o?.values.length??t.xLabels?.length??0;if(l===0)return null;let u=e.mode||"probability",a=e.minValue,h=e.maxValue;if(a===void 0||h===void 0||e.autoScale){let r=[];for(let g of n)if(!g.isOverlay)for(let w of g.values)w!==null&&r.push(w);if(o)for(let g of o.values)g!==null&&r.push(g);if(r.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let f=1/0,s=-1/0;for(let g of r)g<f&&(f=g),g>s&&(s=g);if(e.centerYAxisAtZero){let w=Math.max(Math.abs(f),Math.abs(s))*1.1;a=-w,h=w}else if(e.logScale){if(a===void 0&&(a=Math.max(1,Math.floor(f))),h===void 0||e.autoScale){let g=Math.log(Math.max(1,f)),w=Math.log(Math.max(1,s)),p=w+.15*Math.max(1,w-g);h=Math.ceil(Math.exp(p))}}else a===void 0&&(a=u==="probability"?0:u==="rank"?Math.max(1,Math.floor(f)):Math.floor(f*.9)),(h===void 0||e.autoScale)&&(u==="rank"?h=Math.ceil(s*1.1):u==="probability"?h=e.autoScale?dn(Math.max(s,.001)):Math.min(s*1.1,1):h=s*1.1)}return{numLayers:l,minValue:a,maxValue:h,numLines:n.length}}function kt(t,e,o,n,l,u,a,h){let r=t.getContext("2d"),f=e.getBoundingClientRect(),s=window.devicePixelRatio||1;t.width=f.width*s,t.height=f.height*s,t.style.width=`${f.width}px`,t.style.height=`${f.height}px`,r.scale(s,s);let g=f.width,w=f.height,p=n.darkMode??!1,M=n.title,H=n.mode||"probability",W=n.invertYAxis??!1,A=n.centerYAxisAtZero??!1,V=n.logScale??!1,P=n.xAxisLabel||"Layer",F=n.yAxisLabel||"Probability",I=n.xRangeStart??0;I>=l.numLayers-1&&(console.warn(`xRangeStart (${I}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),I=0);let v=n.showDataPoints??!0,y={top:M?48:24,right:24,bottom:56,left:72},D=g-y.left-y.right,R=w-y.top-y.bottom,B={margin:y,chartWidth:D,chartHeight:R,width:g,height:w},S={background:p?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:p?"#52525b":"#a1a1aa",grid:p?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:p?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:p?"#e4e4e7":"#27272a"};n.transparentBackground?r.clearRect(0,0,g,w):(r.fillStyle=S.background,r.fillRect(0,0,g,w)),M&&(r.fillStyle=S.titleText,r.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="left",r.fillText(M,y.left,28));let te=l.numLayers-1-I,pe=m=>te<=0?y.left+D/2:y.left+(m-I)/te*D,ne=V?Math.log(Math.max(1,l.minValue)):0,ve=V?Math.log(Math.max(1,l.maxValue)):0,le=m=>{let E;if(V){let z=Math.log(Math.max(1,m));E=ve-ne>0?(z-ne)/(ve-ne):.5}else E=(m-l.minValue)/(l.maxValue-l.minValue);return W?y.top+E*R:y.top+R-E*R};r.setLineDash([4,4]),r.strokeStyle=S.grid,r.lineWidth=1;let U=[],G=l.maxValue-l.minValue,re=5;if(V){let m=new Set;for(let X=0;X<re;X++){let Z=ne+X/(re-1)*(ve-ne),J=Math.round(Math.exp(Z));m.has(J)||(m.add(J),U.push(J))}let E=Math.round(Math.exp(ne)),z=Math.round(Math.exp(ve));m.has(E)||U.unshift(E),m.has(z)||U.push(z)}else if(H==="rank")for(let m=0;m<re;m++)U.push(Math.round(l.minValue+m/(re-1)*G));else for(let m=0;m<re;m++)U.push(l.minValue+m/(re-1)*G);if(U.forEach(m=>{let E=le(m);r.beginPath(),r.moveTo(y.left,E),r.lineTo(y.left+D,E),r.stroke()}),r.setLineDash([]),A){let m=le(0);r.beginPath(),r.strokeStyle=p?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",r.lineWidth=1.5,r.moveTo(y.left,m),r.lineTo(y.left+D,m),r.stroke(),r.lineWidth=1}r.fillStyle=S.text,r.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="right",r.textBaseline="middle",U.forEach(m=>{let E=le(m),z;H==="probability"?z=m.toFixed(2):H==="prob_diff"?z=m>=0?`+${m.toFixed(2)}`:m.toFixed(2):z=Math.round(m).toString(),r.fillText(z,y.left-16,E)}),r.textAlign="center",r.textBaseline="top";let Le=o.xLabels&&o.xLabels.length>0,Q=Math.max(1,Math.ceil(l.numLayers/8));for(let m=0;m<l.numLayers;m+=Q){let E=pe(m);if(E<y.left-5||E>y.left+D+5)continue;let z=Le?String(o.xLabels[m]??m):m.toString();r.fillText(z,E,y.top+R+12)}if((l.numLayers-1)%Q!==0){let m=Le?String(o.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();r.fillText(m,pe(l.numLayers-1),y.top+R+12)}r.strokeStyle=p?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",r.lineWidth=1.5,r.beginPath(),r.moveTo(y.left,y.top),r.lineTo(y.left,y.top+R),r.lineTo(y.left+D,y.top+R),r.stroke(),r.fillStyle=S.textMuted,r.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="center",r.textBaseline="top",r.fillText(P.toUpperCase(),y.left+D/2,w-16),r.save(),r.translate(14,y.top+R/2),r.rotate(-Math.PI/2),r.textAlign="center",r.textBaseline="top",r.fillText(F.toUpperCase(),0,0),r.restore();let K=ge(o);function oe(m,E,z,X,Z){r.beginPath(),r.strokeStyle=E,r.lineWidth=z,Z!==void 0&&(r.globalAlpha=Z),X?r.setLineDash(X.split(",").map(Number)):r.setLineDash([]);let J=!1;for(let O=0;O<m.length;O++){let q=m[O];if(q===null){J=!1;continue}let Ee=pe(O),Se=le(q);J?r.lineTo(Ee,Se):(r.moveTo(Ee,Se),J=!0)}r.stroke(),r.setLineDash([]),Z!==void 0&&(r.globalAlpha=1)}let ae=p?"#3f3f46":"#d4d4d8";if(r.lineCap="round",r.lineJoin="round",K.forEach((m,E)=>{!u.has(E)||m.isOverlay||oe(m.values,ae,2,void 0,.35)}),K.forEach((m,E)=>{if(u.has(E)||m.isOverlay)return;let z=m.color??j[E%j.length];oe(m.values,z,4,m.dashPattern,.15),oe(m.values,z,2,m.dashPattern),v&&m.values.forEach((X,Z)=>{if(X===null)return;let J=pe(Z),O=le(X),q=a?.lineIdx===E&&a?.layerIdx===Z;r.beginPath(),r.strokeStyle=z,r.lineWidth=q?2:1.5,r.arc(J,O,q?5:3.5,0,Math.PI*2),r.stroke(),r.beginPath(),r.fillStyle=p?"#18181b":"#ffffff",r.arc(J,O,q?3.5:2.5,0,Math.PI*2),r.fill()})}),K.forEach((m,E)=>{if(!m.isOverlay||u.has(E))return;let z=m.color??"#999";oe(m.values,z,1.5,m.dashPattern??"4,2",.7)}),h){let m=h.color??"#999";oe(h.values,m,1.5,h.dashPattern??"4,2",.7)}return B}function Mt(t){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",t.appendChild(e),e}function Tt(t,e,o,n,l,u,a,h,r){let{margin:f,chartWidth:s,chartHeight:g}=l,w=n.xRangeStart??0,p=a-1-w,M=n.logScale?Math.log(Math.max(1,h)):0,H=n.logScale?Math.log(Math.max(1,r)):0;if(t<f.left||t>f.left+s||e<f.top||e>f.top+g)return null;let W=ge(o),A=null,V=1/0,P=20;for(let F=0;F<W.length;F++){if(u.has(F))continue;let I=W[F];if(!I.isOverlay)for(let v=0;v<I.values.length;v++){let y=I.values[v];if(y===null)continue;let D=p<=0?f.left+s/2:f.left+(v-w)/p*s,R;if(n.logScale){let te=Math.log(Math.max(1,y));R=H-M>0?(te-M)/(H-M):.5}else R=(y-h)/(r-h);let B=n.invertYAxis?f.top+R*g:f.top+g-R*g,S=Math.sqrt((t-D)**2+(e-B)**2);S<V&&S<P&&(V=S,A={visible:!0,x:D,y:B,lineIdx:F,layerIdx:v,value:y,label:I.label,color:I.color??j[F%j.length]})}}return A}function Qe(t,e,o,n,l,u,a){if(!e){t.style.opacity="0";return}let h=n?"#27272a":"#fff",r=n?"#3f3f46":"#e4e4e7",f=n?"#fafafa":"#18181b",s=n?"#a1a1aa":"#71717a",w=e.x>o/2?"calc(-100% - 12px)":"12px";t.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${w},-50%);`;let p=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);t.innerHTML=`
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
        </div>`}var cn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',pn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',hn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Et(t){let e=document.createElement("div");return St(e,t),e}function St(t,e){let o=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";t.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${o};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function $t(t,e,o,n,l,u){St(t,n),t.innerHTML="";let a=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",h=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",r=n?"#a1a1aa":"#71717a",f=n?"#3f3f46":"#d4d4d8",s="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",w=u?ge(u):[];e.forEach((p,M)=>{let H=w[M];if(H?.isOverlay)return;let W=H?.color??j[M%j.length],A=o.has(M),V=H?.removable??!1,P=document.createElement("button");P.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${A?"0.5":"1"};`,P.addEventListener("mouseenter",()=>{P.style.background=g}),P.addEventListener("mouseleave",()=>{P.style.background="transparent"}),P.addEventListener("click",()=>l.onToggle(M));let F=document.createElement("span");F.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${A?s:W};background:${A?f:"transparent"};`,P.appendChild(F);let I=document.createElement("span");if(I.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${A?h:a};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,I.title=p,I.innerHTML=be(p),P.appendChild(I),V&&l.onRemove){let v=document.createElement("span");v.style.cssText=`margin-left:auto;cursor:pointer;color:${r};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,v.innerHTML=hn,v.title="Remove",v.addEventListener("click",y=>{y.stopPropagation(),l.onRemove(M)}),P.appendChild(v),P.addEventListener("mouseenter",()=>{v.style.opacity="0.6"}),P.addEventListener("mouseleave",()=>{v.style.opacity="0"})}else{let v=document.createElement("span");v.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${r};opacity:${A?"0.6":"0"};display:flex;align-items:center;`,v.innerHTML=A?pn:cn,P.appendChild(v),A||(P.addEventListener("mouseenter",()=>{v.style.opacity="0.4"}),P.addEventListener("mouseleave",()=>{v.style.opacity="0"}))}t.appendChild(P)})}var de=class{constructor(e,o,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let o=this.canvas.getBoundingClientRect(),n=e.clientX-o.left,l=e.clientY-o.top;this.tooltip=Tt(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Qe(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Qe(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=o,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=Mt(this.chartContainer),this.legendEl=Et(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let u=l[0];if(!u)return;let a=Math.round(u.contentRect.width),h=Math.round(u.contentRect.height);a===this.lastWidth&&h===this.lastHeight||(this.lastWidth=a,this.lastHeight=h,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,o)=>e.label??`Line ${o+1}`):this.data.labels||(this.data.lines??[]).map((e,o)=>`Line ${o+1}`)}draw(){this.config=wt(this.data,this.options,this.overlay),this.config&&(this.geometry=kt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",$t(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:o=>this.toggleLine(o),onRemove:this.options.onLineRemoved?o=>{this.removeLine(o,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(o)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((o,n)=>({values:o,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,o=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,o||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function Ze(t){let e=t.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let o=t.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(o){let n=o[1],l,u,a,h=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),u=parseInt(n[1]+n[1],16),a=parseInt(n[2]+n[2],16),n.length===4&&(h=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),u=parseInt(n.slice(2,4),16),a=parseInt(n.slice(4,6),16),n.length===8&&(h=parseInt(n.slice(6,8),16)/255)),[l,u,a,h]}return null}function Je(t){return!t||t[3]<.95?null:(.299*t[0]+.587*t[1]+.114*t[2])/255}function un(t){let e=t;for(;e;){let o=Je(Ze(getComputedStyle(e).backgroundColor));if(o!==null)return o;e=e.parentElement}if(typeof document<"u")for(let o of[document.body,document.documentElement]){if(!o)continue;let n=Je(Ze(getComputedStyle(o).backgroundColor));if(n!==null)return n}return null}function mn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let o=Je(Ze(e));return o===null?null:o<.5}function $e(t,e){let o=ce(t),n=()=>{let a=ce(t);a!==o&&(o=a,e(a))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let u=null;return typeof window<"u"&&window.matchMedia&&(u=window.matchMedia("(prefers-color-scheme: dark)"),u.addEventListener("change",n)),()=>{l.disconnect(),u?.removeEventListener("change",n)}}function ce(t){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=mn();if(e!==null)return e;let o=un(t??null);return o!==null?o<.5:!1}var Ce=60,He=30,fn=22,Pe=48,gn=150,bn=18,Ct={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},vn="#cc6622";function xn(t){let e=t.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Ht=41;function Ke(t,e,o){let[n,l,u]=xn(e),a=Math.pow(Math.max(0,Math.min(1,t)),1.1);if(o){let r=f=>Math.round(Ht+(f-Ht)*a);return`rgb(${r(n)}, ${r(l)}, ${r(u)})`}let h=r=>Math.round(255-(255-r)*a);return`rgb(${h(n)}, ${h(l)}, ${h(u)})`}function yn(t,e){return e?t>=.62?"#fff":t>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":t>=.62?"#fff":t>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function et(t){return t==null?"":t.startsWith(" ")?'<span class="ll-lead-dot">\xB7</span>'+xe(t.slice(1)):xe(t)}function ye(t){return t==null?"":t.startsWith(" ")?"\xB7"+t.slice(1):t}function De(t){let e=t.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Pt(t,e,o){let n=xt(),l;if(typeof t=="string"?l=document.querySelector(t):t instanceof Element?l=t:l=null,!l)return console.error("Container not found:",t),null;let u=qe(e),a=u.normalized,h=u.v2Data,r=yt(n);function f(i){return i?i.map(d=>({token:d.tokens?.[0]??"",color:d.color})).filter(d=>d.token!==""):[]}let s={ramp:o?.ramp||"purple",showGrid:o?.showGrid??!0,dimLow:o?.dimLowProb??!0,selectedRow:o?.selectedRow??null,selectedLayerIdx:o?.selectedLayer??null,viewStart:o?.viewStart??0,viewSize:o?.viewSize??a.layers.length,darkModeOverride:o?.darkMode??null,pinned:f(o?.pinnedGroups),colorIndex:o?.colorIndex??0,openPopup:null},g={};function w(i,d){(g[i]||[]).forEach(c=>c(d))}let p=a.layers.length,M=a.tokens.length,H=[],W="";function A(){p=a.layers.length,M=a.tokens.length,H=[];for(let d=0;d<p;d++){let c=0;for(let x=0;x<M;x++){let b=a.cells[x]?.[d];b&&b.prob>c&&(c=b.prob)}H.push(c)}W=a.cells[M-1]?.[p-1]?.token??"",(s.viewSize>p||s.viewSize<1)&&(s.viewSize=p);let i=Math.max(0,p-s.viewSize);s.viewStart>i&&(s.viewStart=i),s.viewStart<0&&(s.viewStart=0)}A();function V(i){let d=s.pinned.find(c=>c.token===i);return d?d.color:null}function P(i){let d=s.pinned.findIndex(c=>c.token===i);d>=0?s.pinned.splice(d,1):(s.pinned.push({token:i,color:Xe[s.colorIndex%Xe.length]}),s.colorIndex++)}function F(i,d){let c=h?.tracked?.[i];if(c&&Array.isArray(c[d]))return c[d];for(let x=0;x<p;x++){let b=a.cells[i]?.[x]?.topk.find(L=>L.token===d);if(b)return b.trajectory}return null}function I(){return Ct[s.ramp]||Ct.purple}function v(){return s.darkModeOverride!==null?s.darkModeOverride:ce(l)}function y(){let i=S.clientWidth;if(i>0)return i;let d=l?.clientWidth??0;return d>0?d-42:900}function D(){let i=Math.floor((y()-Ce)/Pe);return Math.max(1,Math.min(bn,i))}function R(){let i=Math.max(0,p-s.viewSize),d=Math.max(0,Math.min(i,s.viewStart)),c=s.viewSize,x=D();if(c<=x){let k=[];for(let $=0;$<c;$++)k.push(d+$);return{shownLayers:k,stride:1,start:d}}let b=Math.ceil(c/x),L=[];for(let k=d;k<d+c;k+=b)L.push(k);let T=d+c-1;return L[L.length-1]!==T&&L.push(Math.min(p-1,T)),{shownLayers:L,stride:b,start:d}}l.innerHTML=`
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
                <div class="ll-lineplot-box"><div class="ll-lineplot" id="${n}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${n}_tt"></div>
            <div class="ll-popup" id="${n}_popup">
                <span class="ll-popup-close" id="${n}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${n}_popup_hdr"></div>
                <div class="ll-popup-body" id="${n}_popup_body"></div>
            </div>
        </div>
    `;let B=document.getElementById(n),S=document.getElementById(n+"_scroll"),te=document.getElementById(n+"_hdr"),pe=document.getElementById(n+"_nav"),ne=document.getElementById(n+"_lp_wrap"),ve=document.getElementById(n+"_lp_token"),le=document.getElementById(n+"_lp"),U=document.getElementById(n+"_tt"),G=document.getElementById(n+"_popup"),re=document.getElementById(n+"_popup_hdr"),Le=document.getElementById(n+"_popup_body");document.body.appendChild(G);let Q=null,K=null,oe=!0,ae=!1,m=getComputedStyle(B).getPropertyValue("--ll-aspect-ratio").trim(),E=!m;E&&B.classList.add("ll-fill");let z=(()=>{if(!m||/^(unbounded|none|auto)$/i.test(m))return null;let i=m.split("/").map(d=>parseFloat(d.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})(),X=Pe,Z=He;function J(){let i=y(),d=R().shownLayers.length;if(X=d>0?Math.max(Pe,Math.min(gn,Math.floor((i-Ce)/d))):Pe,!E){Z=He;return}let c=S.clientHeight;Z=M>0&&M*He<c?Math.floor(c/M):He}function O(){let i=I(),d=v(),c=s.showGrid?d?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"";if(E){let C=l.clientWidth;B.style.width=C>0?C+"px":"100%",B.style.maxWidth="100%",B.style.maxHeight="",S.style.maxHeight=""}else{B.style.width="",B.style.maxWidth="",S.style.maxHeight="";let C=l.clientWidth||B.clientWidth;if(z&&C>0){let N=B.offsetHeight-S.offsetHeight,me=(N>0?N:140)+90;B.style.maxHeight=Math.max(me,Math.round(C*z))+"px"}else B.style.maxHeight=""}J();let{shownLayers:x}=R(),b=x.length,L=Math.round(Ce+X*b),T=`${Ce}px repeat(${b}, ${X}px)`,k=`<div class="ll-hdr-row" style="display:grid;grid-template-columns:${T};height:${fn+6}px;width:${L}px;min-width:${L}px;">`;k+='<div class="ll-corner">token</div>';for(let C of x)k+=`<div class="ll-hdr-cell">${a.layers[C]}</div>`;k+="</div>",te.innerHTML=k;let $=`<div class="ll-grid-inner" style="width:${L}px;min-width:${L}px;">`;for(let C=0;C<M;C++){let _=a.tokens[C],N=De(_),me=C===s.selectedRow;$+=`<div class="ll-row" data-rowwrap="${C}">`,me&&($+='<div class="ll-row-rail"></div>'),$+=`<div class="ll-row-grid${me?" ll-row-sel":""}" data-row="${C}" style="display:grid;grid-template-columns:${T};height:${Z}px;">`,$+='<div class="ll-row-label">',$+=N?'<span class="ll-bos-pill">bos</span>':`<span class="ll-cell-text" style="${me?"font-weight:600;":""}">${et(_)}</span>`,$+="</div>",x.forEach((Y,fe)=>{let se=a.cells[C][Y],we=se.prob,mt=W!==""&&se.token===W,Qt=Ke(we,mt?vn:i,d),Zt=yn(we,d),Jt=we<.18,Kt=s.dimLow&&Jt?"opacity:0.55;":"",Ue=V(se.token),en=Ue?`box-shadow:inset 0 0 0 2px ${Ue};`:"",ft=C===0,gt=C===M-1,bt=fe===0,vt=fe===b-1,ke="";ft&&bt?ke="border-top-left-radius:8px;":ft&&vt?ke="border-top-right-radius:8px;":gt&&bt?ke="border-bottom-left-radius:8px;":gt&&vt&&(ke="border-bottom-right-radius:8px;"),$+=`<div class="ll-cell${Ue?" ll-cell-pinned":""}" data-row="${C}" data-layer="${Y}" style="background:${Qt};color:${Zt};padding:0 6px;${Kt}${c}${en}${ke}"><span class="ll-cell-text">${et(se.token)}</span></div>`}),$+="</div></div>"}$+="</div>",S.innerHTML=$}function q(){let i=I(),d=v(),{stride:c,start:x}=R(),b=s.viewSize,L=b>=p,T='<span class="ll-nav-range-key">layers</span>';L?T+=`all ${p}`+(c>1?`<span class="ll-dim"> \xB7 every ${c}</span>`:""):T+=`${x}\u2013${x+b-1}<span class="ll-dim"> / ${p}</span>`+(c>1?`<span class="ll-dim"> \xB7 \u22481/${c}</span>`:"");let k="";for(let Y=0;Y<p;Y++){let fe=H[Y]||0,se=Math.max(8,Math.round(fe*92));k+=`<div class="ll-skyline-bar" style="height:${se}%;background:${Ke(fe,i,d)}"></div>`}let $=x/p*100,C=b/p*100,_=[];for(let Y=0;Y<p;Y+=8)_.push(Y);_[_.length-1]!==p-1&&_.push(p-1);let N="",me=Math.max(1,p-1);for(let Y of _){let fe=Y===p-1,se=Y===0,we=Y/me*100;N+=`<span class="ll-nav-tick" style="left:${we}%;transform:${fe?"translateX(-100%)":se?"translateX(0)":"translateX(-50%)"}">${a.layers[Y]}</span>`}pe.innerHTML=`
            <div class="ll-nav-range">${T}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${k}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${$}%;width:${C}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${N}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${x<=0?"disabled":""}>${wn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${x+b>=p?"disabled":""}>${kn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in">${Mn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${Tn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${Ln}</button>
            </div>
        `,jt()}function Ee(){let i=document.getElementById(n+"_win");if(!i)return;let d=Math.max(0,p-s.viewSize),c=Math.max(0,Math.min(d,s.viewStart));i.style.left=c/p*100+"%",i.style.width=s.viewSize/p*100+"%"}function Se(){return Array.from(new Set([p,48,32,20,14,10,8])).filter(i=>i<=p&&i>=1).sort((i,d)=>i-d)}function Oe(i){return Math.max(0,Math.min(Math.max(0,p-s.viewSize),i))}let _e=!1;function lt(){_e||(_e=!0,requestAnimationFrame(()=>{_e=!1,!ae&&(O(),Ee())}))}function Ae(i){let d=Oe(s.viewStart+i);d!==s.viewStart&&(s.viewStart=d,O(),q(),ue())}function Ft(i){let d=Oe(i);d!==s.viewStart&&(s.viewStart=d,lt())}function rt(i,d){let c=Se(),x=c.findIndex(k=>k>=s.viewSize),b=x===-1?c.length-1:x,L=i<0?Math.max(0,b-1):Math.min(c.length-1,b+1),T=c[L];T!==s.viewSize&&(s.viewSize=T,s.viewStart=Math.max(0,Math.min(p-T,Math.round(d-T/2))),O(),q(),ue())}function at(i){rt(i,s.viewStart+s.viewSize/2)}function Nt(){s.viewSize=p,s.viewStart=0,O(),q(),ue()}let he=null;function jt(){let i=document.getElementById(n+"_sky");if(!i)return;i.addEventListener("pointerdown",c=>{let x=i.getBoundingClientRect(),b=c.clientX-x.left,L=x.width/p,T=Math.max(0,p-s.viewSize),k=Math.max(0,Math.min(T,s.viewStart)),$=k*L,C=(k+s.viewSize)*L,_=k;(b<$||b>C)&&(_=Oe(Math.round(b/L)-Math.floor(s.viewSize/2)),s.viewStart=_,lt()),he={startX:b,startStart:_,layerW:L},i.classList.add("ll-grabbing");try{i.setPointerCapture(c.pointerId)}catch{}}),i.addEventListener("pointermove",c=>{if(!he)return;let x=i.getBoundingClientRect(),L=(c.clientX-x.left-he.startX)/he.layerW;Ft(Math.round(he.startStart+L))});let d=c=>{if(he){he=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(c.pointerId)}catch{}q(),ue()}};i.addEventListener("pointerup",d),i.addEventListener("pointercancel",d),i.addEventListener("wheel",c=>{c.preventDefault();let x=i.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Ae(c.deltaX>0?1:-1);return}let b=Math.round((c.clientX-x.left)/x.width*p);rt(c.deltaY<0?-1:1,b)},{passive:!1})}function st(i,d,c=!1){s.selectedRow=i,s.selectedLayerIdx=d??a.layers.length-1,O(),ie(),c&&Vt(i),ue()}function Vt(i){let d=S.querySelector(`[data-rowwrap="${i}"]`);if(!d)return;let c=d.offsetTop-S.clientHeight/2+d.offsetHeight/2;S.scrollTo({top:Math.max(0,c),behavior:"smooth"})}function Re(){requestAnimationFrame(()=>requestAnimationFrame(()=>{ae||(S.scrollTop=S.scrollHeight)}))}function ie(i){let d=s.selectedRow,c=[];if(d!==null)for(let b of s.pinned){let L=F(d,b.token);L&&c.push({values:L.map(T=>T??null),label:ye(b.token),color:b.color,removable:!1})}let x=c.length===0&&!i;if(x)ne.classList.add("ll-hidden");else{ne.classList.remove("ll-hidden"),ve.textContent=d===null?"":De(a.tokens[d])?"position "+d+" \xB7 bos":"position "+d+" \xB7 "+ye(a.tokens[d]);let b={lines:[],richLines:c,xLabels:a.layers},L={darkMode:v(),mode:"probability",autoScale:!0,legendPosition:c.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};Q?(Q.setData(b),Q.setOptions(L)):(le.style.minHeight="0",Q=new de(le,b,L)),i?Q.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):Q.setOverlay?.(null)}E&&x!==oe?(oe=x,requestAnimationFrame(()=>{ae||(O(),Re())})):oe=x}function Ut(i,d,c,x){let b=a.cells[i]?.[d];if(!b)return;let L=I(),T=De(a.tokens[i])?"bos":ye(a.tokens[i]);U.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Ke(b.prob,L,v())}"></span><span class="ll-tt-token">${xe(ye(b.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(b.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${a.layers[d]} / ${a.layers[p-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${xe(T)}</span></div>`,U.classList.add("ll-visible");let k=B.getBoundingClientRect(),$=U.offsetWidth||220,C=U.offsetHeight||90,_=c-k.left+16;c+$+24>window.innerWidth-8&&(_=c-k.left-$-12);let N=x-k.top-50;_=Math.max(6,Math.min(_,k.width-$-6)),N=Math.max(6,Math.min(N,k.height-C-6)),U.style.left=_+"px",U.style.top=N+"px"}function We(){U.classList.remove("ll-visible")}function Gt(){Fe(),K=document.createElement("div"),K.style.cssText="position:fixed;inset:0;z-index:49;",K.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),ct()}),document.body.appendChild(K)}function Fe(){K&&(K.remove(),K=null)}function qt(i,d,c){if(!a.cells[i]?.[d])return;let b=c.getBoundingClientRect();s.openPopup={row:i,layer:d},s.selectedRow=i,s.selectedLayerIdx=d;let L=De(a.tokens[i])?"bos":ye(a.tokens[i]);re.innerHTML=`Layer <b>${a.layers[d]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${xe(L)}</code></div>`,dt(i,d),O(),ie(),G.style.visibility="hidden",G.classList.add("ll-visible"),Yt(b),G.style.visibility="",Gt(),ue()}function dt(i,d){let c=a.cells[i][d],x="";c.topk.forEach((b,L)=>{let T=V(b.token),k=T?`background:${T}22;border-left-color:${T};`:"";x+=`<div class="ll-topk${T?" ll-topk-pinned":""}" data-ki="${L}" style="${k}" title="click to track trajectory"><span class="ll-topk-tok">${et(b.token)}</span><span class="ll-topk-prob">${(b.prob*100).toFixed(1)}%</span></div>`}),Le.innerHTML=x,Le.querySelectorAll(".ll-topk").forEach(b=>{let L=parseInt(b.dataset.ki),T=c.topk[L];b.addEventListener("mouseenter",()=>{let k=F(i,T.token);k&&ie({values:k.map($=>$??null),label:ye(T.token),color:"#999"})}),b.addEventListener("mouseleave",()=>ie()),b.addEventListener("click",k=>{k.stopPropagation(),P(T.token),O(),dt(i,d),ie(),ue()})})}function Yt(i){let x=G.offsetWidth||220,b=G.offsetHeight||160,L=6,T=window.innerWidth-x-6,k=6,$=window.innerHeight-b-6,C=[{left:i.right+6,top:i.top},{left:i.left-6-x,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-b}],_=C[0];for(let N of C)if(N.left>=L&&N.left<=T&&N.top>=k&&N.top<=$){_=N;break}G.style.left=Math.max(L,Math.min(_.left,T))+"px",G.style.top=Math.max(k,Math.min(_.top,$))+"px"}function ct(){s.openPopup=null,G.classList.remove("ll-visible"),Fe(),O(),ie()}document.getElementById(n+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),ct()});let ee=null;S.addEventListener("mousemove",i=>{let d=i.target.closest(".ll-cell");if(!d){ee&&(ee.classList.remove("ll-cell-hover"),ee=null),We();return}ee!==d&&(ee&&ee.classList.remove("ll-cell-hover"),ee=d,ee.classList.add("ll-cell-hover"));let c=parseInt(d.dataset.row),x=parseInt(d.dataset.layer);Ut(c,x,i.clientX,i.clientY)}),S.addEventListener("mouseleave",()=>{ee&&(ee.classList.remove("ll-cell-hover"),ee=null),We()}),S.addEventListener("click",i=>{let d=i.target.closest(".ll-cell");if(d){let x=parseInt(d.dataset.row),b=parseInt(d.dataset.layer);We(),qt(x,b,d);return}let c=i.target.closest(".ll-row-grid");c&&st(parseInt(c.dataset.row))}),S.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let d=s.selectedRow??-1,c=i.key==="ArrowDown"?Math.min(M-1,d+1):Math.max(0,d-1);st(c,void 0,!0)}),pe.addEventListener("click",i=>{let d=i.target.closest("[data-nav]");if(!d||d.hasAttribute("disabled"))return;let c=d.dataset.nav;c==="panL"?Ae(-Math.max(1,Math.floor(s.viewSize/4))):c==="panR"?Ae(Math.max(1,Math.floor(s.viewSize/4))):c==="zoomIn"?at(-1):c==="zoomOut"?at(1):c==="reset"&&Nt()});function Ne(){O(),q(),ie(),requestAnimationFrame(()=>{ae||(O(),q())})}function je(){Ye(B,v(),G)}function ue(){w("stateChange",ut())}Ne(),Re(),je();let Ve=0,pt=l?.clientWidth??0,ht=new ResizeObserver(()=>{let i=l?.clientWidth??0;i!==pt&&(pt=i,!Ve&&(Ve=requestAnimationFrame(()=>{Ve=0,!ae&&O()})))});l&&ht.observe(l);let Xt=$e(l,i=>{s.darkModeOverride===null&&(Ye(B,i,G),O(),q(),ie())});function ut(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(i=>({tokens:[i.token],color:i.color})),darkMode:s.darkModeOverride}}return{widget:{getState:ut,setState:i=>{i.ramp!==void 0&&(s.ramp=i.ramp),i.showGrid!==void 0&&(s.showGrid=i.showGrid),i.dimLowProb!==void 0&&(s.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(s.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(s.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(s.viewStart=i.viewStart),i.viewSize!==void 0&&(s.viewSize=i.viewSize),i.colorIndex!==void 0&&(s.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(s.pinned=f(i.pinnedGroups)),i.darkMode!==void 0&&(s.darkModeOverride=i.darkMode),A(),je(),Ne()},setData:i=>{u=qe(i),a=u.normalized,h=u.v2Data,A(),s.selectedRow=null,s.selectedLayerIdx=null,Ne(),Re()},setTitle:()=>{},setThemeMode:i=>{s.darkModeOverride=!!i,je(),O(),q(),ie()},getThemeMode:()=>v(),hasEntropyData:()=>!!h&&Array.isArray(h.entropy)&&h.entropy.length>0,hasRankData:()=>{if(!h?.tracked)return!1;for(let i of h.tracked)for(let d in i){let c=i[d];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,d)=>{(g[i]||(g[i]=[])).push(d)},off:(i,d)=>{g[i]=(g[i]||[]).filter(c=>c!==d)},destroy:()=>{ae=!0,Xt(),ht?.disconnect(),Fe(),G.remove(),Q&&(Q.destroy(),Q=null),l&&(l.innerHTML="")}},styleEl:r}}var Ln='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',wn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',kn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Mn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Tn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ie=class{constructor(e,o,n){this.widget=null;this.styleEl=null;let l=Pt(e,o,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,o){this.widget?.on(e,o)}off(e,o){this.widget?.off(e,o)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};function Me(t){let e=document.createElement("div");return e.textContent=t,e.innerHTML}function Dt(t,e,o){let n=o.cellWidth??44,l=o.rowHeaderWidth??100,u=o.darkMode??!1,a="";a+="<colgroup>",a+=`<col style="width:${l}px;">`;for(let r=0;r<e.columns.length;r++)a+=`<col style="width:${n}px;">`;a+="</colgroup>";let h=o.maxRows!=null?Math.min(e.rows.length,o.maxRows):e.rows.length;for(let r=0;r<h;r++){let f=e.rows[r];a+="<tr>";let s=`width:${l}px;max-width:${l}px;`;f.pinned&&(s+=u?"background:#4a4a00;color:#fff;":"background:#fff59d;"),a+=`<td class="hm-row-header${f.pinned?" hm-pinned":""}" data-row="${r}" title="${Me(f.label)}" style="${s}">`,a+=Me(f.label),a+="</td>";for(let g=0;g<e.columns.length;g++){let w=e.getCellValue(r,g),p=`background:${w.color};color:${w.textColor};width:${n}px;max-width:${n}px;`;w.highlighted&&w.highlightColor&&(p+=`box-shadow:inset 0 0 0 2px ${w.highlightColor};`),w.bold&&(p+="font-weight:bold;"),a+=`<td class="hm-cell${w.highlighted?" hm-highlighted":""}" data-row="${r}" data-col="${g}" style="${p}">`,a+=Me(w.text),a+="</td>"}a+="</tr>"}a+="<tr>",a+=`<th class="hm-corner" style="width:${l}px;max-width:${l}px;">${Me(o.cornerLabel??"Layer")}</th>`;for(let r=0;r<e.columns.length;r++)a+=`<th class="hm-col-header" style="width:${n}px;max-width:${n}px;">${Me(e.columns[r].label)}</th>`;return a+="</tr>",a}function En(t){return`
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
    `}function It(t){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=En(t),document.head.appendChild(e),e}var Sn=0,Be=class{constructor(e,o,n={}){this.destroyed=!1;this.container=e,this.data=o,this.options={cellWidth:44,rowHeaderWidth:100,darkMode:!1,...n},this.uid="hm_"+ ++Sn+"_"+Date.now().toString(36),this.styleEl=It(this.uid),this.table=document.createElement("table"),this.table.className=`heatmap-${this.uid}`,e.appendChild(this.table),this.render()}render(){if(this.destroyed)return;let e=Dt(this.uid,this.data,this.options);this.table.innerHTML=e,this.options.darkMode?this.table.classList.add("hm-dark"):this.table.classList.remove("hm-dark"),this.attachListeners()}attachListeners(){this.table.querySelectorAll(".hm-cell").forEach(e=>{let o=parseInt(e.dataset.row),n=parseInt(e.dataset.col);e.addEventListener("mouseenter",()=>{this.options.onCellHover?.(o,n)}),e.addEventListener("mouseleave",()=>{this.options.onCellLeave?.()}),e.addEventListener("click",l=>{l.stopPropagation(),this.options.onCellClick?.(o,n)})}),this.table.querySelectorAll(".hm-row-header").forEach(e=>{let o=parseInt(e.dataset.row);e.addEventListener("click",n=>{n.stopPropagation(),this.options.onRowHeaderClick?.(o)})})}setData(e){this.data=e,this.render()}setOptions(e){this.options={...this.options,...e},this.render()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.table}getTableWidth(){return this.table.offsetWidth}destroy(){this.destroyed=!0,this.container.removeChild(this.table),this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};var $n='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Cn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Hn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',tt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function nt(t){return{fg:t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:t?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:t?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:t?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:t?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:t?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:t?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:t?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:t?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function Bt(t){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${tt};`;let o={isOpen:!1,searchQuery:""},n=Ot(e,t,o);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=o,e}function Te(t,e){let o=t.__tokenSelectorCleanup,n=t.__tokenSelectorState;o&&o();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},u=Ot(t,e,l);t.__tokenSelectorCleanup=u,t.__tokenSelectorState=l}function zt(t){let e=t.__tokenSelectorCleanup;e&&e()}function Ot(t,e,o){t.innerHTML="";let n=nt(e.darkMode),{allLabels:l,selectedIndices:u,defaultIndices:a,onChange:h}=e,r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let f=document.createElement("span");if(f.style.cssText=`font-size:11px;color:${n.fgMuted};`,f.textContent=`Tokens (${l.length})`,r.appendChild(f),!ot(u,a)){let v=document.createElement("button");v.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${tt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,v.innerHTML=`${$n} Reset`,v.addEventListener("mouseenter",()=>{v.style.color=n.fg}),v.addEventListener("mouseleave",()=>{v.style.color=n.fgMuted}),v.addEventListener("click",()=>{h(Array.from(a))}),r.appendChild(v)}t.appendChild(r);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{P(),p.focus()});let w=Array.from(u).sort((v,y)=>v-y);for(let v of w){let y=Pn(v,l[v],e.darkMode,()=>{let D=new Set(u);D.delete(v),h(Array.from(D))});g.appendChild(y)}let p=document.createElement("input");p.type="text",p.placeholder=w.length===0?"Search tokens...":"",p.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${tt};min-width:60px;flex:1;padding:2px 0;`,p.addEventListener("input",()=>{o.searchQuery=p.value,V()}),p.addEventListener("focus",()=>P()),g.appendChild(p);let M=document.createElement("span");M.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,M.innerHTML=Hn,M.addEventListener("click",v=>{v.stopPropagation(),o.isOpen?F():P()}),g.appendChild(M),t.appendChild(g);let H=document.createElement("div");H.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let W=document.createElement("div");W.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",H.appendChild(W);let A=document.createElement("div");A.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,A.textContent="No tokens found",H.appendChild(A),t.appendChild(H);function V(){W.innerHTML="";let v=o.searchQuery.toLowerCase(),y=0;for(let D=0;D<l.length;D++){let R=l[D];if(v&&!R.toLowerCase().includes(v))continue;y++;let B=u.has(D),S=Dn(D,R,B,e.darkMode,()=>{let te=new Set(u);B?te.delete(D):te.add(D),h(Array.from(te))});W.appendChild(S)}A.style.display=y===0?"":"none"}function P(){o.isOpen||(o.isOpen=!0,H.style.display="",M.style.transform="rotate(180deg)",V())}function F(){o.isOpen&&(o.isOpen=!1,H.style.display="none",M.style.transform="",p.value="",o.searchQuery="")}function I(v){t.contains(v.target)||F()}return document.addEventListener("mousedown",I),o.isOpen&&(H.style.display="",M.style.transform="rotate(180deg)",p.value=o.searchQuery,V(),requestAnimationFrame(()=>{p.isConnected&&p.focus()})),()=>{document.removeEventListener("mousedown",I)}}function Pn(t,e,o,n){let l=nt(o),u=j[t%j.length],a=document.createElement("div");a.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,a.addEventListener("mouseenter",()=>{a.style.background=l.chipHoverBg,a.style.borderColor=l.chipHoverBorder}),a.addEventListener("mouseleave",()=>{a.style.background=l.chipBg,a.style.borderColor=l.chipBorder});let h=document.createElement("span");h.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${u};`,a.appendChild(h);let r=document.createElement("span");r.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,r.innerHTML=be(e),r.title=e,a.appendChild(r);let f=document.createElement("button");return f.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,f.innerHTML=Cn,f.addEventListener("mouseenter",()=>{f.style.color=l.badgeText}),f.addEventListener("mouseleave",()=>{f.style.color=l.fgMuted}),f.addEventListener("click",s=>{s.stopPropagation(),n()}),a.appendChild(f),a}function Dn(t,e,o,n,l){let u=nt(n),a=j[t%j.length],h=document.createElement("div");h.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",h.addEventListener("mouseenter",()=>{h.style.background=u.hoverBg}),h.addEventListener("mouseleave",()=>{h.style.background="transparent"}),h.addEventListener("click",g=>{g.stopPropagation(),l()});let r=document.createElement("span");r.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${o?a:"transparent"};border:1.5px solid ${o?a:u.fgMuted};`,h.appendChild(r);let f=document.createElement("span");f.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${o?u.fg:u.fgMuted};`,f.innerHTML=be(e),f.title=e,h.appendChild(f);let s=t===0?"source pred":t===1?"target pred":null;if(s){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${u.badgeBg};color:${u.badgeText};border:1px solid ${u.badgeBorder};`,g.textContent=s,h.appendChild(g)}if(o){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${u.selectedText};`,g.textContent="selected",h.appendChild(g)}return h}function ot(t,e){if(t.size!==e.size)return!1;for(let o of t)if(!e.has(o))return!1;return!0}var In={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Bn=["probability","prob_diff","rank"],ze=class{constructor(e,o,n={}){this.modeButtons=new Map;this.container=e,this.allData=o,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=o.tokenLabels?.length??o.lines?.length??0,u=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(h,r)=>r);this.defaultTokens=new Set(u),this.selectedTokens=new Set(n.selectedTokens??u),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=Bt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let a=document.createElement("div");a.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(a),this.linePlot=new de(a,this.buildPlotData(),this.buildPlotOptions()),a.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let o of Bn){let n=document.createElement("button");n.textContent=In[o],this.applyModeButtonStyles(n,o===this.mode),n.addEventListener("click",()=>this.setMode(o)),n.addEventListener("mouseenter",()=>{o!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{o!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(o,n)}return e}applyModeBarStyles(e){let o=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${o};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,o){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${o?l:"transparent"};color:${o?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,o]of this.modeButtons)this.applyModeButtonStyles(o,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),o=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((a,h)=>a-h),l=this.mode==="rank";return{richLines:n.filter(a=>a<e.length).map(a=>({values:l?e[a].map(h=>h+1):e[a],label:o[a]??`Token ${a}`,color:j[a%j.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let o=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,o)},(l,u)=>u));let n=new Set([...this.selectedTokens].filter(l=>l<o));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Te(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let o=this.getModeLines().length,n=new Set(e.filter(l=>l<o));ot(n,this.selectedTokens)||(this.selectedTokens=n,Te(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){zt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function zn(t){let e=typeof t=="string"?document.querySelector(t):t;return e||console.error("Container not found:",t),e}function it(t,e,o){let n=zn(t);if(!n)return null;let l=e(n);if(o===void 0){let u=$e(n,h=>l.setThemeMode(h)),a=l.destroy.bind(l);l.destroy=()=>{u(),a()}}return l}function _t(t,e,o){return new Ie(t,e,o)}function At(t,e,o){return it(t,n=>new de(n,e,{darkMode:ce(n),...o}),o?.darkMode)}function Rt(t,e,o){return it(t,n=>new Be(n,e,{darkMode:ce(n),...o}),o?.darkMode)}function Wt(t,e,o){return it(t,n=>new ze(n,e,{darkMode:ce(n),...o}),o?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=_t,window.LinePlotWidget=At,window.HeatmapTableWidget=Rt,window.ActivationPatchingWidget=Wt);return an(On);})();
//# sourceMappingURL=charts.js.map
