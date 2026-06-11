"use strict";var InterpTools=(()=>{var Ge=Object.defineProperty;var gn=Object.getOwnPropertyDescriptor;var bn=Object.getOwnPropertyNames;var xn=Object.prototype.hasOwnProperty;var vn=(i,e)=>{for(var t in e)Ge(i,t,{get:e[t],enumerable:!0})},yn=(i,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of bn(e))!xn.call(i,l)&&l!==t&&Ge(i,l,{get:()=>e[l],enumerable:!(n=gn(e,l))||n.enumerable});return i};var wn=i=>yn(Ge({},"__esModule",{value:!0}),i);var eo={};vn(eo,{ActivationPatchingWidget:()=>Ft,HeatmapTableWidget:()=>At,LinePlotWidget:()=>Wt,LogitLensWidget:()=>Bt});function qe(i){let e=i;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let t=i.layers.length,n=i.input.length,l=[];for(let d=0;d<n;d++){let p=[],s=i.tracked[d];for(let f=0;f<t;f++){let r=i.topk[f][d],g=[];for(let u=0;u<r.length;u++){let M=r[u],S=s[M]||[],P=S[f]||0;g.push({token:M,prob:P,trajectory:S})}let k=g[0]||{token:"",prob:0,trajectory:[]};p.push({token:k.token,prob:k.prob,trajectory:k.trajectory,topk:g})}l.push(p)}return{normalized:{layers:i.layers,tokens:i.input,cells:l,meta:i.meta||{}},v2Data:i}}function xt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function me(i){let e=document.createElement("div");return e.textContent=i,e.innerHTML}function Ln(i){let e=`#${i}`;return`
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
    `}function vt(i){let e=document.createElement("style");return e.textContent=Ln(i),document.head.appendChild(e),e}function Ye(i,e,...t){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(i),e?i.style.colorScheme="dark":i.style.colorScheme="";for(let l of t)l&&n(l)}var Me=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],Xe=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var V=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function fe(i){return i.richLines&&i.richLines.length>0?i.richLines.map((t,n)=>({values:t.values,label:t.label??`Line ${n+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(i.lines??[]).map((t,n)=>({values:t,label:i.labels?.[n]??`Line ${n+1}`}))}function ge(i){if(!i)return"";let e=[],t=0;i.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let n="";for(;t<i.length;t++){let l=i[t];l===`
`?(n&&(e.push(yt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(yt(n)),e.join("")}function yt(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function kn(i){if(i>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(i<=t)return t;return 1}function wt(i,e,t){let n=fe(i),l=n.length>0?n[0].values.length:t?.values.length??i.xLabels?.length??0;if(l===0)return null;let h=e.mode||"probability",d=e.minValue,p=e.maxValue;if(d===void 0||p===void 0||e.autoScale){let s=[];for(let g of n)if(!g.isOverlay)for(let k of g.values)k!==null&&s.push(k);if(t)for(let g of t.values)g!==null&&s.push(g);if(s.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let f=1/0,r=-1/0;for(let g of s)g<f&&(f=g),g>r&&(r=g);if(e.centerYAxisAtZero){let k=Math.max(Math.abs(f),Math.abs(r))*1.1;d=-k,p=k}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(f))),p===void 0||e.autoScale){let g=Math.log(Math.max(1,f)),k=Math.log(Math.max(1,r)),u=k+.15*Math.max(1,k-g);p=Math.ceil(Math.exp(u))}}else d===void 0&&(d=h==="probability"?0:h==="rank"?Math.max(1,Math.floor(f)):Math.floor(f*.9)),(p===void 0||e.autoScale)&&(h==="rank"?p=Math.ceil(r*1.1):h==="probability"?p=e.autoScale?kn(Math.max(r,.001)):Math.min(r*1.1,1):p=r*1.1)}return{numLayers:l,minValue:d,maxValue:p,numLines:n.length}}function Lt(i,e,t,n,l,h,d,p){let s=i.getContext("2d"),f=e.getBoundingClientRect(),r=window.devicePixelRatio||1;i.width=f.width*r,i.height=f.height*r,i.style.width=`${f.width}px`,i.style.height=`${f.height}px`,s.scale(r,r);let g=f.width,k=f.height,u=n.darkMode??!1,M=n.title,S=n.mode||"probability",P=n.invertYAxis??!1,w=n.centerYAxisAtZero??!1,D=n.logScale??!1,T=n.xAxisLabel||"Layer",_=n.yAxisLabel||"Probability",C=n.xRangeStart??0;C>=l.numLayers-1&&(console.warn(`xRangeStart (${C}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),C=0);let y=n.showDataPoints??!0,v={top:M?48:24,right:24,bottom:56,left:72},R=g-v.left-v.right,B=k-v.top-v.bottom,Z={margin:v,chartWidth:R,chartHeight:B,width:g,height:k},O={background:u?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:u?"#52525b":"#a1a1aa",grid:u?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:u?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:u?"#e4e4e7":"#27272a"};n.transparentBackground?s.clearRect(0,0,g,k):(s.fillStyle=O.background,s.fillRect(0,0,g,k)),M&&(s.fillStyle=O.titleText,s.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="left",s.fillText(M,v.left,28));let N=l.numLayers-1-C,ie=b=>N<=0?v.left+R/2:v.left+(b-C)/N*R,H=D?Math.log(Math.max(1,l.minValue)):0,J=D?Math.log(Math.max(1,l.maxValue)):0,se=b=>{let E;if(D){let I=Math.log(Math.max(1,b));E=J-H>0?(I-H)/(J-H):.5}else E=(b-l.minValue)/(l.maxValue-l.minValue);return P?v.top+E*B:v.top+B-E*B};s.setLineDash([4,4]),s.strokeStyle=O.grid,s.lineWidth=1;let j=[],ye=l.maxValue-l.minValue,ae=5;if(D){let b=new Set;for(let F=0;F<ae;F++){let G=H+F/(ae-1)*(J-H),q=Math.round(Math.exp(G));b.has(q)||(b.add(q),j.push(q))}let E=Math.round(Math.exp(H)),I=Math.round(Math.exp(J));b.has(E)||j.unshift(E),b.has(I)||j.push(I)}else if(S==="rank")for(let b=0;b<ae;b++)j.push(Math.round(l.minValue+b/(ae-1)*ye));else for(let b=0;b<ae;b++)j.push(l.minValue+b/(ae-1)*ye);if(j.forEach(b=>{let E=se(b);s.beginPath(),s.moveTo(v.left,E),s.lineTo(v.left+R,E),s.stroke()}),s.setLineDash([]),w){let b=se(0);s.beginPath(),s.strokeStyle=u?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",s.lineWidth=1.5,s.moveTo(v.left,b),s.lineTo(v.left+R,b),s.stroke(),s.lineWidth=1}s.fillStyle=O.text,s.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="right",s.textBaseline="middle",j.forEach(b=>{let E=se(b),I;S==="probability"?I=b.toFixed(2):S==="prob_diff"?I=b>=0?`+${b.toFixed(2)}`:b.toFixed(2):I=Math.round(b).toString(),s.fillText(I,v.left-16,E)}),s.textAlign="center",s.textBaseline="top";let Se=t.xLabels&&t.xLabels.length>0,we=Math.max(1,Math.ceil(l.numLayers/8));for(let b=0;b<l.numLayers;b+=we){let E=ie(b);if(E<v.left-5||E>v.left+R+5)continue;let I=Se?String(t.xLabels[b]??b):b.toString();s.fillText(I,E,v.top+B+12)}if((l.numLayers-1)%we!==0){let b=Se?String(t.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();s.fillText(b,ie(l.numLayers-1),v.top+B+12)}s.strokeStyle=u?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",s.lineWidth=1.5,s.beginPath(),s.moveTo(v.left,v.top),s.lineTo(v.left,v.top+B),s.lineTo(v.left+R,v.top+B),s.stroke(),s.fillStyle=O.textMuted,s.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(T.toUpperCase(),v.left+R/2,k-16),s.save(),s.translate(14,v.top+B/2),s.rotate(-Math.PI/2),s.textAlign="center",s.textBaseline="top",s.fillText(_.toUpperCase(),0,0),s.restore();let ee=fe(t);function W(b,E,I,F,G){s.beginPath(),s.strokeStyle=E,s.lineWidth=I,G!==void 0&&(s.globalAlpha=G),F?s.setLineDash(F.split(",").map(Number)):s.setLineDash([]);let q=!1;for(let K=0;K<b.length;K++){let te=b[K];if(te===null){q=!1;continue}let Ce=ie(K),Le=se(te);q?s.lineTo(Ce,Le):(s.moveTo(Ce,Le),q=!0)}s.stroke(),s.setLineDash([]),G!==void 0&&(s.globalAlpha=1)}let ze=u?"#3f3f46":"#d4d4d8";if(s.lineCap="round",s.lineJoin="round",ee.forEach((b,E)=>{!h.has(E)||b.isOverlay||W(b.values,ze,2,void 0,.35)}),ee.forEach((b,E)=>{if(h.has(E)||b.isOverlay)return;let I=b.color??V[E%V.length];W(b.values,I,4,b.dashPattern,.15),W(b.values,I,2,b.dashPattern),y&&b.values.forEach((F,G)=>{if(F===null)return;let q=ie(G),K=se(F),te=d?.lineIdx===E&&d?.layerIdx===G;s.beginPath(),s.strokeStyle=I,s.lineWidth=te?2:1.5,s.arc(q,K,te?5:3.5,0,Math.PI*2),s.stroke(),s.beginPath(),s.fillStyle=u?"#18181b":"#ffffff",s.arc(q,K,te?3.5:2.5,0,Math.PI*2),s.fill()})}),ee.forEach((b,E)=>{if(!b.isOverlay||h.has(E))return;let I=b.color??"#999";W(b.values,I,1.5,b.dashPattern??"4,2",.7)}),p){let b=p.color??"#999";W(p.values,b,1.5,p.dashPattern??"4,2",.7)}return Z}function kt(i){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",i.appendChild(e),e}function Mt(i,e,t,n,l,h,d,p,s){let{margin:f,chartWidth:r,chartHeight:g}=l,k=n.xRangeStart??0,u=d-1-k,M=n.logScale?Math.log(Math.max(1,p)):0,S=n.logScale?Math.log(Math.max(1,s)):0;if(i<f.left||i>f.left+r||e<f.top||e>f.top+g)return null;let P=fe(t),w=null,D=1/0,T=20;for(let _=0;_<P.length;_++){if(h.has(_))continue;let C=P[_];if(!C.isOverlay)for(let y=0;y<C.values.length;y++){let v=C.values[y];if(v===null)continue;let R=u<=0?f.left+r/2:f.left+(y-k)/u*r,B;if(n.logScale){let N=Math.log(Math.max(1,v));B=S-M>0?(N-M)/(S-M):.5}else B=(v-p)/(s-p);let Z=n.invertYAxis?f.top+B*g:f.top+g-B*g,O=Math.sqrt((i-R)**2+(e-Z)**2);O<D&&O<T&&(D=O,w={visible:!0,x:R,y:Z,lineIdx:_,layerIdx:y,value:v,label:C.label,color:C.color??V[_%V.length]})}}return w}function Qe(i,e,t,n,l,h,d){if(!e){i.style.opacity="0";return}let p=n?"#27272a":"#fff",s=n?"#3f3f46":"#e4e4e7",f=n?"#fafafa":"#18181b",r=n?"#a1a1aa":"#71717a",k=e.x>t/2?"calc(-100% - 12px)":"12px";i.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${k},-50%);`;let u=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);i.innerHTML=`
        <div style="background:${p};border:1px solid ${s};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${f};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${ge(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${r}">${h??"Layer"}</span>
                    <span style="font-weight:500;color:${f}">${u}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${r}">Value</span>
                    <span style="font-weight:500;color:${f}">${d==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var Mn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Tn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',En='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Tt(i){let e=document.createElement("div");return Et(e,i),e}function Et(i,e){let t=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";i.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${t};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function St(i,e,t,n,l,h){Et(i,n),i.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",s=n?"#a1a1aa":"#71717a",f=n?"#3f3f46":"#d4d4d8",r="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",k=h?fe(h):[];e.forEach((u,M)=>{let S=k[M];if(S?.isOverlay)return;let P=S?.color??V[M%V.length],w=t.has(M),D=S?.removable??!1,T=document.createElement("button");T.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${w?"0.5":"1"};`,T.addEventListener("mouseenter",()=>{T.style.background=g}),T.addEventListener("mouseleave",()=>{T.style.background="transparent"}),T.addEventListener("click",()=>l.onToggle(M));let _=document.createElement("span");_.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${w?r:P};background:${w?f:"transparent"};`,T.appendChild(_);let C=document.createElement("span");if(C.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${w?p:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,C.title=u,C.innerHTML=ge(u),T.appendChild(C),D&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${s};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=En,y.title="Remove",y.addEventListener("click",v=>{v.stopPropagation(),l.onRemove(M)}),T.appendChild(y),T.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),T.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${s};opacity:${w?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=w?Tn:Mn,T.appendChild(y),w||(T.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),T.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}i.appendChild(T)})}var ce=class{constructor(e,t,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,l=e.clientY-t.top;this.tooltip=Mt(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Qe(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Qe(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=kt(this.chartContainer),this.legendEl=Tt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let h=l[0];if(!h)return;let d=Math.round(h.contentRect.width),p=Math.round(h.contentRect.height);d===this.lastWidth&&p===this.lastHeight||(this.lastWidth=d,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=wt(this.data,this.options,this.overlay),this.config&&(this.geometry=Lt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",St(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:t=>this.toggleLine(t),onRemove:this.options.onLineRemoved?t=>{this.removeLine(t,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(t)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,n)=>({values:t,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function Te(i){if(typeof document>"u")return String(i??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(i??""),e.innerHTML}function He(i){return i==null?"":i.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+Te(i.slice(1)):Te(i)}function Sn(i){let e=`#${i}`;return`
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
    `}function Ct(i){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Sn(i),document.head.appendChild(e),e}var Cn=0,ve=class{constructor(e,t,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,...n},this.uid="hmx_"+ ++Cn+"_"+Date.now().toString(36),this.styleEl=Ct(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render(),this.setupResponsive()}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let n=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-n)),size:n}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,n=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/t),h=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(h,l))}resolveVisibleColumns(){let e=this.options,{start:t,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let r=[];for(let g=0;g<n;g++)r.push(t+g);return r}let l=this.maxColsFit();if(n<=l){let r=[];for(let g=0;g<n;g++)r.push(t+g);return r}let h=!!e.alwaysShowLastColumn,d=Math.max(1,l-(h?1:0)),p=Math.ceil(n/d),s=[];for(let r=t;r<t+n;r+=p)s.push(r);let f=t+n-1;return h&&s[s.length-1]!==f&&s.push(f),s}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let n=t.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/e);return Math.max(t.minColumnWidth??1,l)}return t.cellWidth??48}resolveRowHeight(e){let t=this.options,n=t.cellHeight??28;if(t.rowSizing!=="fill"||e<=0)return n;let l=this.scrollEl.clientHeight;return e*n<l?Math.floor(l/e):n}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=e.rowHeaderWidth??100,l=e.headerHeight??26,h=this.data.columns,d=this.resolveVisibleColumns(),p=d.length,s=this.resolveCellWidth(p),f=this.data.rows,r=e.maxRows!=null?Math.min(f.length,e.maxRows):f.length,g=this.resolveRowHeight(r),k=n+s*p,u=`${n}px repeat(${p}, ${s}px)`,M=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",S=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${u};height:${l}px;width:${k}px;min-width:${k}px;">`;S+=`<div class="hmx-corner">${Te(e.cornerLabel??"")}</div>`;for(let w=0;w<p;w++)S+=`<div class="hmx-col">${He(h[d[w]].label)}</div>`;S+="</div>",this.hdrEl.innerHTML=S;let P=`<div class="hmx-grid-inner" style="width:${k}px;min-width:${k}px;">`;for(let w=0;w<r;w++){let D=f[w].label,T=e.rowClassName?.(w),_=e.renderRowLabel?e.renderRowLabel(w):`<span class="hmx-cell-text">${He(D)}</span>`;P+=`<div class="hmx-row${T?" "+T:""}" data-rowwrap="${w}">`,P+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${u};height:${g}px;">`,P+=`<div class="hmx-rowlabel" data-row="${w}" title="${Te(D)}">${_}</div>`;for(let C=0;C<p;C++){let y=d[C],v=this.data.getCellValue(w,y),R=v.highlighted&&v.highlightColor?`box-shadow:inset 0 0 0 2px ${v.highlightColor};`:"",B=v.bold?"font-weight:bold;":"",Z=v.opacity!=null&&v.opacity<1?`opacity:${v.opacity};`:"",O=w===0,N=w===r-1,ie=C===0,H=C===p-1,J="";O&&ie?J="border-top-left-radius:8px;":O&&H?J="border-top-right-radius:8px;":N&&ie?J="border-bottom-left-radius:8px;":N&&H&&(J="border-bottom-right-radius:8px;"),P+=`<div class="hmx-cell${v.className?" "+v.className:""}" data-row="${w}" data-col="${y}" style="background:${v.color};color:${v.textColor};padding:0 6px;${Z}${M}${R}${B}${J}"><span class="hmx-cell-text">${He(v.text)}</span></div>`}P+="</div></div>"}P+="</div>",this.scrollEl.innerHTML=P,e.onVisibleColumnsChange&&!$n(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,n=t.closest(".hmx-rowlabel");if(n){this.options.onRowHeaderClick?.(parseInt(n.dataset.row),e);return}let l=t.closest(".hmx-cell");l&&this.options.onCellClick?.(parseInt(l.dataset.row),parseInt(l.dataset.col),e)})}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let n=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function $n(i,e){if(i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0}function Ze(i){let e=i.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=i.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let n=t[1],l,h,d,p=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),h=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),h=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[l,h,d,p]}return null}function Je(i){return!i||i[3]<.95?null:(.299*i[0]+.587*i[1]+.114*i[2])/255}function Hn(i){let e=i;for(;e;){let t=Je(Ze(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let n=Je(Ze(getComputedStyle(t).backgroundColor));if(n!==null)return n}return null}function Pn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=Je(Ze(e));return t===null?null:t<.5}function Pe(i,e){let t=pe(i),n=()=>{let d=pe(i);d!==t&&(t=d,e(d))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let h=null;return typeof window<"u"&&window.matchMedia&&(h=window.matchMedia("(prefers-color-scheme: dark)"),h.addEventListener("change",n)),()=>{l.disconnect(),h?.removeEventListener("change",n)}}function pe(i){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=Pn();if(e!==null)return e;let t=Hn(i??null);return t!==null?t<.5:!1}var Dn=60,In=30,Rn=22,zn=48,_n=18,$t={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},On="#cc6622";function Bn(i){let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Ht=41;function Ke(i,e,t){let[n,l,h]=Bn(e),d=Math.pow(Math.max(0,Math.min(1,i)),1.1);if(t){let s=f=>Math.round(Ht+(f-Ht)*d);return`rgb(${s(n)}, ${s(l)}, ${s(h)})`}let p=s=>Math.round(255-(255-s)*d);return`rgb(${p(n)}, ${p(l)}, ${p(h)})`}function Wn(i,e){return e?i>=.62?"#fff":i>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":i>=.62?"#fff":i>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function Pt(i){return i==null?"":i.startsWith(" ")?'<span class="ll-lead-space">_</span>'+me(i.slice(1)):me(i)}function be(i){return i==null?"":i.startsWith(" ")?"_"+i.slice(1):i}function De(i){let e=i.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Dt(i,e,t){let n=xt(),l;if(typeof i=="string"?l=document.querySelector(i):i instanceof Element?l=i:l=null,!l)return console.error("Container not found:",i),null;let h=qe(e),d=h.normalized,p=h.v2Data,s=vt(n);function f(o){return o?o.map(a=>({token:a.tokens?.[0]??"",color:a.color})).filter(a=>a.token!==""):[]}let r={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??d.layers.length,darkModeOverride:t?.darkMode??null,pinned:f(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(o=>o.pos).filter(o=>typeof o=="number"),colorIndex:t?.colorIndex??0,openPopup:null},g={};function k(o,a){(g[o]||[]).forEach(c=>c(a))}let u=d.layers.length,M=d.tokens.length,S=[],P="";function w(){u=d.layers.length,M=d.tokens.length,S=[];for(let a=0;a<u;a++){let c=0;for(let m=0;m<M;m++){let x=d.cells[m]?.[a];x&&x.prob>c&&(c=x.prob)}S.push(c)}P=d.cells[M-1]?.[u-1]?.token??"",r.pinnedRows=r.pinnedRows.filter(a=>a>=0&&a<M),r.selectedRow!==null&&r.selectedRow>=M&&(r.selectedRow=null),(r.viewSize>u||r.viewSize<1)&&(r.viewSize=u);let o=Math.max(0,u-r.viewSize);r.viewStart>o&&(r.viewStart=o),r.viewStart<0&&(r.viewStart=0)}w();function D(o){let a=r.pinned.find(c=>c.token===o);return a?a.color:null}function T(o){let a=r.pinned.findIndex(c=>c.token===o);a>=0?r.pinned.splice(a,1):(r.pinned.push({token:o,color:Me[r.colorIndex%Me.length]}),r.colorIndex++)}function _(o,a){let c=p?.tracked?.[o];if(c&&Array.isArray(c[a]))return c[a];for(let m=0;m<u;m++){let x=d.cells[o]?.[m]?.topk.find(L=>L.token===a);if(x)return x.trajectory}return null}function C(o){let a=r.pinnedRows.indexOf(o);return Xe[(a<0?0:a)%Xe.length]}function y(o){return r.pinnedRows.indexOf(o)>=0}function v(o,a){for(let c of r.pinned){let m=_(o,c.token);if(!m)continue;let x=0;for(let L of m)L!=null&&L>x&&(x=L);if(x>=a)return!0}return!1}function R(o){let a=null,c=0;for(let m=0;m<u;m++){let x=d.cells[o]?.[m];x&&x.prob>c&&(c=x.prob,a=x.token)}return c>=.05?a:null}function B(o){let a=r.pinnedRows.indexOf(o);if(a>=0){r.pinnedRows.splice(a,1);return}if(!v(o,.01)){let c=R(o);c&&!D(c)&&(r.pinned.push({token:c,color:Me[r.colorIndex%Me.length]}),r.colorIndex++)}r.pinnedRows.push(o)}function Z(){return $t[r.ramp]||$t.purple}function O(){return r.darkModeOverride!==null?r.darkModeOverride:pe(l)}let N=[];function ie(){return N.length>1?Math.max(1,N[1]-N[0]):1}l.innerHTML=`
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
    `;let H=document.getElementById(n),J=document.getElementById(n+"_heatmap"),se=document.getElementById(n+"_nav"),j,ye=document.getElementById(n+"_lp_wrap"),ae=document.getElementById(n+"_lp_token"),Se=document.getElementById(n+"_lp_box"),we=document.getElementById(n+"_lp"),ee=document.getElementById(n+"_tt"),W=document.getElementById(n+"_popup"),ze=document.getElementById(n+"_popup_hdr"),b=document.getElementById(n+"_popup_body");document.body.appendChild(W);let E=null,I=null,F=!0,G=!1,q=getComputedStyle(H).getPropertyValue("--ll-aspect-ratio").trim(),K=!q;K&&H.classList.add("ll-fill");let te=(()=>{if(!q||/^(unbounded|none|auto)$/i.test(q))return null;let o=q.split("/").map(a=>parseFloat(a.trim()));return o.length!==2||isNaN(o[0])||isNaN(o[1])||o[0]===0||o[1]===0?null:o[1]/o[0]})();function Ce(o,a){let c=a?"#bbb":"#555",m=o?` stroke-dasharray="${me(o)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${m}/></svg>`}function Le(){return{rows:d.tokens.map(o=>({label:o})),columns:d.layers.map(o=>({label:String(o),value:0})),getCellValue:(o,a)=>{let c=d.cells[o][a],m=c.prob,x=O(),L=P!==""&&c.token===P,$=D(c.token),z=m<.18;return{text:c.token,value:m,color:Ke(m,L?On:Z(),x),textColor:Wn(m,x),highlighted:!!$,highlightColor:$??void 0,opacity:r.dimLow&&z?.55:void 0}}}}function Nt(o){let a=d.tokens[o],c=o===r.selectedRow||y(o),m="";return y(o)&&(m+=Ce(C(o).dash,O())),m+=De(a)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${c?' style="font-weight:600"':""}>${Pt(a)}</span>`,m}function Vt(o){return"ll-hmx-row"+(o===r.selectedRow||y(o)?" ll-hmx-active":"")}function it(){return{columnSizing:"fit",minColumnWidth:zn,maxVisibleColumns:_n,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:ke(r.viewStart),size:r.viewSize},rowSizing:K?"fill":"fixed",cellHeight:In,rowHeaderWidth:Dn,headerHeight:Rn+6,height:K||te!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:r.showGrid,darkMode:O(),renderRowLabel:Nt,rowClassName:Vt,onVisibleColumnsChange:o=>{N=o},onCellHover:hn,onCellClick:un,onRowHeaderClick:o=>{B(o),U(),X(),le()},onCellLeave:()=>{Ae(),pn()}}}function jt(){if(K){let a=l.clientWidth;H.style.width=a>0?a+"px":"100%",H.style.maxWidth="100%",H.style.maxHeight="";return}H.style.width="",H.style.maxWidth="";let o=l.clientWidth||H.clientWidth;if(te&&o>0){let c=H.offsetHeight-j.getScrollElement().offsetHeight,m=(c>0?c:140)+90;H.style.maxHeight=Math.max(m,Math.round(o*te))+"px"}else H.style.maxHeight=""}function U(){jt(),j.setOptions(it())}function de(){let o=Z(),a=O(),c=ke(r.viewStart),m=ie(),x=r.viewSize,L=x>=u,$=lt(),z=x<=$[0],A='<span class="ll-nav-range-key">layers</span>';L?A+=`all ${u}`+(m>1?`<span class="ll-dim"> \xB7 every ${m}</span>`:""):A+=`${c}\u2013${c+x-1}<span class="ll-dim"> / ${u}</span>`+(m>1?`<span class="ll-dim"> \xB7 \u22481/${m}</span>`:"");let Q="";for(let oe=0;oe<u;oe++){let $e=S[oe]||0,Ue=Math.max(8,Math.round($e*92));Q+=`<div class="ll-skyline-bar" style="height:${Ue}%;background:${Ke($e,o,a)}"></div>`}let Y=c/u*100,re=x/u*100,ne=[];for(let oe=0;oe<u;oe+=8)ne.push(oe);ne[ne.length-1]!==u-1&&ne.push(u-1);let xe="",ue=Math.max(1,u-1);for(let oe of ne){let $e=oe===u-1,Ue=oe===0,fn=oe/ue*100;xe+=`<span class="ll-nav-tick" style="left:${fn}%;transform:${$e?"translateX(-100%)":Ue?"translateX(0)":"translateX(-50%)"}">${d.layers[oe]}</span>`}se.innerHTML=`
            <div class="ll-nav-range">${A}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${Q}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${Y}%;width:${re}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${xe}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${c<=0?"disabled":""}>${Fn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${c+x>=u?"disabled":""}>${Nn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${z?"disabled":""}>${Vn}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${L?"disabled":""}>${jn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${An}</button>
            </div>
        `,Yt()}function Ut(){let o=document.getElementById(n+"_win");if(!o)return;let a=Math.max(0,u-r.viewSize),c=Math.max(0,Math.min(a,r.viewStart));o.style.left=c/u*100+"%",o.style.width=r.viewSize/u*100+"%"}function lt(){return Array.from(new Set([u,48,32,20,14,10,8])).filter(o=>o<=u&&o>=1).sort((o,a)=>o-a)}function ke(o){return Math.max(0,Math.min(Math.max(0,u-r.viewSize),o))}let _e=!1;function rt(){_e||(_e=!0,requestAnimationFrame(()=>{_e=!1,!G&&(U(),Ut())}))}function Oe(o){let a=ke(r.viewStart+o);a!==r.viewStart&&(r.viewStart=a,U(),de(),le())}function Gt(o){let a=ke(o);a!==r.viewStart&&(r.viewStart=a,rt())}function st(o,a){let c=lt(),m=c.findIndex(z=>z>=r.viewSize),x=m===-1?c.length-1:m,L=o<0?Math.max(0,x-1):Math.min(c.length-1,x+1),$=c[L];$!==r.viewSize&&(r.viewSize=$,r.viewStart=Math.max(0,Math.min(u-$,Math.round(a-$/2))),U(),de(),le())}function at(o){st(o,r.viewStart+r.viewSize/2)}function qt(){r.viewSize=u,r.viewStart=0,U(),de(),le()}let he=null;function Yt(){let o=document.getElementById(n+"_sky");if(!o)return;o.addEventListener("pointerdown",c=>{let m=o.getBoundingClientRect(),x=c.clientX-m.left,L=m.width/u,$=Math.max(0,u-r.viewSize),z=Math.max(0,Math.min($,r.viewStart)),A=z*L,Q=(z+r.viewSize)*L,Y=z;(x<A||x>Q)&&(Y=ke(Math.round(x/L)-Math.floor(r.viewSize/2)),r.viewStart=Y,rt()),he={startX:x,startStart:Y,layerW:L},o.classList.add("ll-grabbing");try{o.setPointerCapture(c.pointerId)}catch{}}),o.addEventListener("pointermove",c=>{if(!he)return;let m=o.getBoundingClientRect(),L=(c.clientX-m.left-he.startX)/he.layerW;Gt(Math.round(he.startStart+L))});let a=c=>{if(he){he=null,o.classList.remove("ll-grabbing");try{o.releasePointerCapture(c.pointerId)}catch{}de(),le()}};o.addEventListener("pointerup",a),o.addEventListener("pointercancel",a),o.addEventListener("wheel",c=>{c.preventDefault();let m=o.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){Oe(c.deltaX>0?1:-1);return}let x=Math.round((c.clientX-m.left)/m.width*u);st(c.deltaY<0?-1:1,x)},{passive:!1})}function Xt(o,a,c=!1){r.selectedRow=o,r.selectedLayerIdx=a??d.layers.length-1,U(),X(),c&&Qt(o),le()}function Qt(o){j.scrollToRow(o)}function Be(){requestAnimationFrame(()=>requestAnimationFrame(()=>{G||j.scrollToBottom()}))}let Zt=.45,Jt=120,Kt=360;function We(){let o;if(te)o=(l.clientWidth||H.clientWidth)*te;else{let c=H.clientHeight;o=c>0?c:(H.clientWidth||900)*.6}let a=Math.round(o*Zt);Se.style.height=Math.max(Jt,Math.min(Kt,a))+"px"}function dt(o){return o+"\xB7"+(De(d.tokens[o])?"bos":be(d.tokens[o]))}function X(o){let a=r.pinnedRows.length>0?r.pinnedRows:r.selectedRow!==null?[r.selectedRow]:[],c=a.length>1,m=[];for(let L of a){let $=C(L);for(let z of r.pinned){let A=_(L,z.token);if(!A)continue;let Q=be(z.token);c&&(Q+=" ("+dt(L)+")"),m.push({values:A.map(Y=>Y??null),label:Q,color:z.color,dashPattern:$.dash||void 0,removable:!1})}}let x=m.length===0&&!o;if(x)ye.classList.add("ll-hidden");else{ye.classList.remove("ll-hidden"),We(),ae.textContent=r.pinnedRows.length>1?r.pinnedRows.length+" positions":a.length===1?"position "+dt(a[0]):"";let L={lines:[],richLines:m,xLabels:d.layers},$={darkMode:O(),mode:"probability",autoScale:!0,legendPosition:m.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};E?(E.setData(L),E.setOptions($)):(we.style.minHeight="0",E=new ce(we,L,$)),o?E.setOverlay?.({values:o.values,label:o.label,color:o.color,dashPattern:"4,2",isOverlay:!0}):E.setOverlay?.(null)}K&&x!==F?(F=x,requestAnimationFrame(()=>{G||(U(),Be())})):F=x}let en=56,tn=11,nn=9.5,on=15;function ln(o){let a=tn*(o>0?o/en:1);return Math.max(nn,Math.min(on,a))}function rn(o,a,c,m,x=0){let L=d.cells[o]?.[a];if(!L)return;let $=Z(),z=De(d.tokens[o])?"bos":be(d.tokens[o]);ee.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Ke(L.prob,$,O())}"></span><span class="ll-tt-token">${me(be(L.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(L.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[a]} / ${d.layers[u-1]}</span><span>position</span><span class="ll-tt-val">${o} \xB7 ${me(z)}</span></div>`,ee.style.fontSize=ln(x)+"px",ee.classList.add("ll-visible");let A=H.getBoundingClientRect(),Q=ee.offsetWidth||220,Y=ee.offsetHeight||90,re=c-A.left+16;c+Q+24>window.innerWidth-8&&(re=c-A.left-Q-12);let ne=m-A.top-50;re=Math.max(6,Math.min(re,A.width-Q-6)),ne=Math.max(6,Math.min(ne,A.height-Y-6)),ee.style.left=re+"px",ee.style.top=ne+"px"}function Ae(){ee.classList.remove("ll-visible")}function sn(){Fe(),I=document.createElement("div"),I.style.cssText="position:fixed;inset:0;z-index:49;",I.addEventListener("mousedown",o=>{o.preventDefault(),o.stopPropagation(),pt()}),document.body.appendChild(I)}function Fe(){I&&(I.remove(),I=null)}function an(o,a,c){if(!d.cells[o]?.[a])return;let x=c.getBoundingClientRect();r.openPopup={row:o,layer:a},r.selectedRow=o,r.selectedLayerIdx=a;let L=De(d.tokens[o])?"bos":be(d.tokens[o]);ze.innerHTML=`Layer <b>${d.layers[a]}</b>, Position <b>${o}</b><div class="ll-popup-sub">input <code>${me(L)}</code></div>`,ct(o,a),U(),X(),W.style.visibility="hidden",W.classList.add("ll-visible"),dn(x),W.style.visibility="",sn(),le()}function ct(o,a){let c=d.cells[o][a],m="";c.topk.forEach((x,L)=>{let $=D(x.token),z=$?`background:${$}22;border-left-color:${$};`:"";m+=`<div class="ll-topk${$?" ll-topk-pinned":""}" data-ki="${L}" style="${z}" title="click to track trajectory"><span class="ll-topk-tok">${Pt(x.token)}</span><span class="ll-topk-prob">${(x.prob*100).toFixed(1)}%</span></div>`}),b.innerHTML=m,b.querySelectorAll(".ll-topk").forEach(x=>{let L=parseInt(x.dataset.ki),$=c.topk[L];x.addEventListener("mouseenter",()=>{if(F)return;let z=_(o,$.token);z&&X({values:z.map(A=>A??null),label:be($.token),color:"#999"})}),x.addEventListener("mouseleave",()=>{F||X()}),x.addEventListener("click",z=>{z.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(T($.token),U(),ct(o,a),X(),le())})})}function dn(o){let m=H.getBoundingClientRect(),x=Math.max(140,m.width-2*8),L=Math.max(120,m.height-2*8);W.style.maxWidth=x+"px",W.style.maxHeight=L+"px";let $=W.offsetWidth||220,z=W.offsetHeight||160,A=m.left+8,Q=m.right-8-$,Y=m.top+8,re=m.bottom-8-z,ne=[{left:o.right+6,top:o.top},{left:o.left-6-$,top:o.top},{left:o.left,top:o.bottom+6},{left:o.left,top:o.top-6-z}],xe=ne[0];for(let ue of ne)if(ue.left>=A&&ue.left<=Q&&ue.top>=Y&&ue.top<=re){xe=ue;break}W.style.left=Math.max(A,Math.min(xe.left,Math.max(A,Q)))+"px",W.style.top=Math.max(Y,Math.min(xe.top,Math.max(Y,re)))+"px"}function pt(){r.openPopup=null,W.classList.remove("ll-visible"),Fe(),U(),X()}document.getElementById(n+"_popup_close").addEventListener("click",o=>{o.stopPropagation(),pt()});function cn(o,a){if(F)return;let c=d.cells[o]?.[a]?.token,m=c!=null?_(o,c):null;m?X({values:m.map(x=>x??null),label:be(c),color:"#999"}):X()}function pn(){F||X()}function hn(o,a){cn(o,a)}function un(o,a,c){if(c.shiftKey){let x=d.cells[o]?.[a]?.token;x&&(T(x),U(),X(),le());return}Ae();let m=c.target.closest(".hmx-cell");m&&an(o,a,m)}j=new ve(J,Le(),it());let ht=j.getScrollElement(),ut=o=>{let a=o.target.closest(".hmx-cell");if(!a){Ae();return}rn(parseInt(a.dataset.row),parseInt(a.dataset.col),o.clientX,o.clientY,a.offsetWidth)};ht.addEventListener("mousemove",ut),J.addEventListener("keydown",o=>{if(o.key!=="ArrowDown"&&o.key!=="ArrowUp")return;o.preventDefault();let a=r.selectedRow??-1,c=o.key==="ArrowDown"?Math.min(M-1,a+1):Math.max(0,a-1);Xt(c,void 0,!0)}),se.addEventListener("click",o=>{let a=o.target.closest("[data-nav]");if(!a||a.hasAttribute("disabled"))return;let c=a.dataset.nav;c==="panL"?Oe(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?Oe(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?at(-1):c==="zoomOut"?at(1):c==="reset"&&qt()});function Ne(){U(),de(),X(),requestAnimationFrame(()=>{G||(U(),de(),F||We())})}function Ve(){Ye(H,O(),W)}function le(){k("stateChange",bt())}Ne(),Be(),Ve();let je=0,mt=l?.clientWidth??0,ft=l?.clientHeight??0,gt=new ResizeObserver(()=>{let o=l?.clientWidth??0,a=l?.clientHeight??0;o===mt&&a===ft||(mt=o,ft=a,!je&&(je=requestAnimationFrame(()=>{je=0,!G&&(U(),F||We())})))});l&&gt.observe(l);let mn=Pe(l,o=>{r.darkModeOverride===null&&(Ye(H,o,W),U(),de(),X())});function bt(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,selectedLayer:r.selectedLayerIdx,viewStart:r.viewStart,viewSize:r.viewSize,colorIndex:r.colorIndex,pinnedGroups:r.pinned.map(o=>({tokens:[o.token],color:o.color})),pinnedRows:r.pinnedRows.map(o=>({pos:o,line:C(o).name})),darkMode:r.darkModeOverride}}return{widget:{getState:bt,setState:o=>{o.ramp!==void 0&&(r.ramp=o.ramp),o.showGrid!==void 0&&(r.showGrid=o.showGrid),o.dimLowProb!==void 0&&(r.dimLow=o.dimLowProb),o.selectedRow!==void 0&&(r.selectedRow=o.selectedRow),o.selectedLayer!==void 0&&(r.selectedLayerIdx=o.selectedLayer),o.viewStart!==void 0&&(r.viewStart=o.viewStart),o.viewSize!==void 0&&(r.viewSize=o.viewSize),o.colorIndex!==void 0&&(r.colorIndex=o.colorIndex),o.pinnedGroups!==void 0&&(r.pinned=f(o.pinnedGroups)),o.pinnedRows!==void 0&&(r.pinnedRows=o.pinnedRows.map(a=>a.pos).filter(a=>typeof a=="number")),o.darkMode!==void 0&&(r.darkModeOverride=o.darkMode),w(),Ve(),Ne()},setData:o=>{h=qe(o),d=h.normalized,p=h.v2Data,r.selectedRow=null,r.selectedLayerIdx=null,r.pinned=[],r.pinnedRows=[],r.colorIndex=0,w(),N=[],j.setData(Le()),Ne(),Be()},setTitle:()=>{},setThemeMode:o=>{r.darkModeOverride=!!o,Ve(),U(),de(),X()},getThemeMode:()=>O(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let o of p.tracked)for(let a in o){let c=o[a];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(o,a)=>{(g[o]||(g[o]=[])).push(a)},off:(o,a)=>{g[o]=(g[o]||[]).filter(c=>c!==a)},destroy:()=>{G=!0,mn(),gt?.disconnect(),Fe(),W.remove(),E&&(E.destroy(),E=null),ht.removeEventListener("mousemove",ut),j?.destroy(),l&&(l.innerHTML="")}},styleEl:s}}var An='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Fn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Nn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',Vn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',jn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ie=class{constructor(e,t,n){this.widget=null;this.styleEl=null;let l=Dt(e,t,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var Un='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Gn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',qn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',et="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function tt(i){return{fg:i?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:i?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:i?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:i?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:i?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:i?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:i?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:i?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:i?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:i?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function It(i){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${et};`;let t={isOpen:!1,searchQuery:""},n=zt(e,i,t);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=t,e}function Ee(i,e){let t=i.__tokenSelectorCleanup,n=i.__tokenSelectorState;t&&t();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},h=zt(i,e,l);i.__tokenSelectorCleanup=h,i.__tokenSelectorState=l}function Rt(i){let e=i.__tokenSelectorCleanup;e&&e()}function zt(i,e,t){i.innerHTML="";let n=tt(e.darkMode),{allLabels:l,selectedIndices:h,defaultIndices:d,onChange:p}=e,s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let f=document.createElement("span");if(f.style.cssText=`font-size:11px;color:${n.fgMuted};`,f.textContent=`Tokens (${l.length})`,s.appendChild(f),!nt(h,d)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${et};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${Un} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=n.fg}),y.addEventListener("mouseleave",()=>{y.style.color=n.fgMuted}),y.addEventListener("click",()=>{p(Array.from(d))}),s.appendChild(y)}i.appendChild(s);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{T(),u.focus()});let k=Array.from(h).sort((y,v)=>y-v);for(let y of k){let v=Yn(y,l[y],e.darkMode,()=>{let R=new Set(h);R.delete(y),p(Array.from(R))});g.appendChild(v)}let u=document.createElement("input");u.type="text",u.placeholder=k.length===0?"Search tokens...":"",u.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${et};min-width:60px;flex:1;padding:2px 0;`,u.addEventListener("input",()=>{t.searchQuery=u.value,D()}),u.addEventListener("focus",()=>T()),g.appendChild(u);let M=document.createElement("span");M.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,M.innerHTML=qn,M.addEventListener("click",y=>{y.stopPropagation(),t.isOpen?_():T()}),g.appendChild(M),i.appendChild(g);let S=document.createElement("div");S.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let P=document.createElement("div");P.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",S.appendChild(P);let w=document.createElement("div");w.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,w.textContent="No tokens found",S.appendChild(w),i.appendChild(S);function D(){P.innerHTML="";let y=t.searchQuery.toLowerCase(),v=0;for(let R=0;R<l.length;R++){let B=l[R];if(y&&!B.toLowerCase().includes(y))continue;v++;let Z=h.has(R),O=Xn(R,B,Z,e.darkMode,()=>{let N=new Set(h);Z?N.delete(R):N.add(R),p(Array.from(N))});P.appendChild(O)}w.style.display=v===0?"":"none"}function T(){t.isOpen||(t.isOpen=!0,S.style.display="",M.style.transform="rotate(180deg)",D())}function _(){t.isOpen&&(t.isOpen=!1,S.style.display="none",M.style.transform="",u.value="",t.searchQuery="")}function C(y){i.contains(y.target)||_()}return document.addEventListener("mousedown",C),t.isOpen&&(S.style.display="",M.style.transform="rotate(180deg)",u.value=t.searchQuery,D(),requestAnimationFrame(()=>{u.isConnected&&u.focus()})),()=>{document.removeEventListener("mousedown",C)}}function Yn(i,e,t,n){let l=tt(t),h=V[i%V.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=l.chipHoverBg,d.style.borderColor=l.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=l.chipBg,d.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${h};`,d.appendChild(p);let s=document.createElement("span");s.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,s.innerHTML=ge(e),s.title=e,d.appendChild(s);let f=document.createElement("button");return f.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,f.innerHTML=Gn,f.addEventListener("mouseenter",()=>{f.style.color=l.badgeText}),f.addEventListener("mouseleave",()=>{f.style.color=l.fgMuted}),f.addEventListener("click",r=>{r.stopPropagation(),n()}),d.appendChild(f),d}function Xn(i,e,t,n,l){let h=tt(n),d=V[i%V.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=h.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",g=>{g.stopPropagation(),l()});let s=document.createElement("span");s.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?d:"transparent"};border:1.5px solid ${t?d:h.fgMuted};`,p.appendChild(s);let f=document.createElement("span");f.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?h.fg:h.fgMuted};`,f.innerHTML=ge(e),f.title=e,p.appendChild(f);let r=i===0?"source pred":i===1?"target pred":null;if(r){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${h.badgeBg};color:${h.badgeText};border:1px solid ${h.badgeBorder};`,g.textContent=r,p.appendChild(g)}if(t){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${h.selectedText};`,g.textContent="selected",p.appendChild(g)}return p}function nt(i,e){if(i.size!==e.size)return!1;for(let t of i)if(!e.has(t))return!1;return!0}var Qn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Zn=["probability","prob_diff","rank"],Re=class{constructor(e,t,n={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=t.tokenLabels?.length??t.lines?.length??0,h=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,s)=>s);this.defaultTokens=new Set(h),this.selectedTokens=new Set(n.selectedTokens??h),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=It(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new ce(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of Zn){let n=document.createElement("button");n.textContent=Qn[t],this.applyModeButtonStyles(n,t===this.mode),n.addEventListener("click",()=>this.setMode(t)),n.addEventListener("mouseenter",()=>{t!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{t!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(t,n)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?l:"transparent"};color:${t?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,p)=>d-p),l=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:l?e[d].map(p=>p+1):e[d],label:t[d]??`Token ${d}`,color:V[d%V.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,t)},(l,h)=>h));let n=new Set([...this.selectedTokens].filter(l=>l<t));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,n=new Set(e.filter(l=>l<t));nt(n,this.selectedTokens)||(this.selectedTokens=n,Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Rt(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Jn(i){let e=typeof i=="string"?document.querySelector(i):i;return e||console.error("Container not found:",i),e}function ot(i,e,t){let n=Jn(i);if(!n)return null;let l=e(n);if(t===void 0){let h=Pe(n,p=>l.setThemeMode(p)),d=l.destroy.bind(l);l.destroy=()=>{h(),d()}}return l}function Bt(i,e,t){return new Ie(i,e,t)}function Wt(i,e,t){return ot(i,n=>new ce(n,e,{darkMode:pe(n),...t}),t?.darkMode)}var _t={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Kn(i){if(!/^#?[0-9a-fA-F]{6}$/.test(i))return[147,51,234];let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Ot(i,e){if(typeof i.getCellValue=="function")return i;let t=i,n=t.values??[],l=t.texts,h=t.rowLabels??n.map((w,D)=>String(D)),d=t.colLabels??(n[0]??[]).map((w,D)=>String(D)),p=t.ramp??"purple",s=_t[p]??(p[0]==="#"?p:_t.purple),[f,r,g]=Kn(s),[k,u]=t.valueDomain??[0,1],M=u-k,S=e?38:255,P=w=>Math.max(0,Math.min(1,w));return{rows:h.map(w=>({label:w})),columns:d.map(w=>({label:w,value:0})),getCellValue:(w,D)=>{let T=n[w]?.[D]??0,_=P(M>0?(T-k)/M:T),C=v=>Math.round(S+(v-S)*_);return{text:l?l[w]?.[D]??"":Number.isInteger(T)?String(T):T.toFixed(2),value:T,color:`rgb(${C(f)}, ${C(r)}, ${C(g)})`,textColor:_>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function At(i,e,t){return ot(i,n=>{let l=t?.darkMode??pe(n),h=new ve(n,Ot(e,l),{darkMode:l,...t}),d=h.setThemeMode.bind(h);return h.setThemeMode=p=>{h.setData(Ot(e,p)),d(p)},h},t?.darkMode)}function Ft(i,e,t){return ot(i,n=>new Re(n,e,{darkMode:pe(n),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=Bt,window.LinePlotWidget=Wt,window.HeatmapTableWidget=At,window.ActivationPatchingWidget=Ft);return wn(eo);})();
//# sourceMappingURL=charts.js.map
