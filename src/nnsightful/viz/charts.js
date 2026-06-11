"use strict";var InterpTools=(()=>{var Ge=Object.defineProperty;var un=Object.getOwnPropertyDescriptor;var mn=Object.getOwnPropertyNames;var fn=Object.prototype.hasOwnProperty;var gn=(i,e)=>{for(var t in e)Ge(i,t,{get:e[t],enumerable:!0})},bn=(i,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of mn(e))!fn.call(i,l)&&l!==t&&Ge(i,l,{get:()=>e[l],enumerable:!(n=un(e,l))||n.enumerable});return i};var xn=i=>bn(Ge({},"__esModule",{value:!0}),i);var Zn={};gn(Zn,{ActivationPatchingWidget:()=>Vt,HeatmapTableWidget:()=>Nt,LinePlotWidget:()=>Ft,LogitLensWidget:()=>At});function qe(i){let e=i;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),{normalized:e,v2Data:null};let t=i.layers.length,n=i.input.length,l=[];for(let d=0;d<n;d++){let p=[],s=i.tracked[d];for(let f=0;f<t;f++){let r=i.topk[f][d],g=[];for(let u=0;u<r.length;u++){let k=r[u],S=s[k]||[],D=S[f]||0;g.push({token:k,prob:D,trajectory:S})}let L=g[0]||{token:"",prob:0,trajectory:[]};p.push({token:L.token,prob:L.prob,trajectory:L.trajectory,topk:g})}l.push(p)}return{normalized:{layers:i.layers,tokens:i.input,cells:l,meta:i.meta||{}},v2Data:i}}function xt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function me(i){let e=document.createElement("div");return e.textContent=i,e.innerHTML}function vn(i){let e=`#${i}`;return`
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
    `}function yt(i){let e=document.createElement("style");return e.textContent=vn(i),document.head.appendChild(e),e}var vt=!1;function wt(){if(vt||typeof document>"u")return;vt=!0;let i=document.createElement("style");i.textContent=`
        .ll-hmx-row .hmx-row-grid, .ll-hmx-row .hmx-rowlabel { cursor: pointer; }
        .ll-row-style { flex-shrink: 0; }
        .ll-hmx-bos {
            display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
            border: 1px solid var(--hmx-card-border); border-radius: 3px;
            font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 10px; font-weight: 500; letter-spacing: 0.02em;
            color: var(--hmx-text-muted); background: var(--hmx-surface-2);
        }
        .hmx-row.ll-hmx-active::before {
            content: ""; position: absolute; left: -1px; top: 0; bottom: 0;
            width: 3px; background: #3b82f6; border-radius: 2px; z-index: 2;
        }
        .hmx-row.ll-hmx-active .hmx-row-grid {
            background: var(--hmx-surface-2);
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.22); border-radius: 4px;
        }
    `,document.head.appendChild(i)}function Ye(i,e,...t){let n=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};n(i),e?i.style.colorScheme="dark":i.style.colorScheme="";for(let l of t)l&&n(l)}var Me=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],Xe=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var j=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];function fe(i){return i.richLines&&i.richLines.length>0?i.richLines.map((t,n)=>({values:t.values,label:t.label??`Line ${n+1}`,color:t.color,dashPattern:t.dashPattern,isOverlay:t.isOverlay,removable:t.removable})):(i.lines??[]).map((t,n)=>({values:t,label:i.labels?.[n]??`Line ${n+1}`}))}function ge(i){if(!i)return"";let e=[],t=0;i.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),t=1);let n="";for(;t<i.length;t++){let l=i[t];l===`
`?(n&&(e.push(Lt(n)),n=""),e.push('<span style="color:#3b82f6">\\n</span>')):n+=l}return n&&e.push(Lt(n)),e.join("")}function Lt(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function yn(i){if(i>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let t of e)if(i<=t)return t;return 1}function kt(i,e,t){let n=fe(i),l=n.length>0?n[0].values.length:t?.values.length??i.xLabels?.length??0;if(l===0)return null;let h=e.mode||"probability",d=e.minValue,p=e.maxValue;if(d===void 0||p===void 0||e.autoScale){let s=[];for(let g of n)if(!g.isOverlay)for(let L of g.values)L!==null&&s.push(L);if(t)for(let g of t.values)g!==null&&s.push(g);if(s.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:n.length};let f=1/0,r=-1/0;for(let g of s)g<f&&(f=g),g>r&&(r=g);if(e.centerYAxisAtZero){let L=Math.max(Math.abs(f),Math.abs(r))*1.1;d=-L,p=L}else if(e.logScale){if(d===void 0&&(d=Math.max(1,Math.floor(f))),p===void 0||e.autoScale){let g=Math.log(Math.max(1,f)),L=Math.log(Math.max(1,r)),u=L+.15*Math.max(1,L-g);p=Math.ceil(Math.exp(u))}}else d===void 0&&(d=h==="probability"?0:h==="rank"?Math.max(1,Math.floor(f)):Math.floor(f*.9)),(p===void 0||e.autoScale)&&(h==="rank"?p=Math.ceil(r*1.1):h==="probability"?p=e.autoScale?yn(Math.max(r,.001)):Math.min(r*1.1,1):p=r*1.1)}return{numLayers:l,minValue:d,maxValue:p,numLines:n.length}}function Mt(i,e,t,n,l,h,d,p){let s=i.getContext("2d"),f=e.getBoundingClientRect(),r=window.devicePixelRatio||1;i.width=f.width*r,i.height=f.height*r,i.style.width=`${f.width}px`,i.style.height=`${f.height}px`,s.scale(r,r);let g=f.width,L=f.height,u=n.darkMode??!1,k=n.title,S=n.mode||"probability",D=n.invertYAxis??!1,w=n.centerYAxisAtZero??!1,I=n.logScale??!1,M=n.xAxisLabel||"Layer",O=n.yAxisLabel||"Probability",C=n.xRangeStart??0;C>=l.numLayers-1&&(console.warn(`xRangeStart (${C}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),C=0);let y=n.showDataPoints??!0,v={top:k?48:24,right:24,bottom:56,left:72},z=g-v.left-v.right,B=L-v.top-v.bottom,Q={margin:v,chartWidth:z,chartHeight:B,width:g,height:L},_={background:u?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:u?"#52525b":"#a1a1aa",grid:u?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:u?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:u?"#e4e4e7":"#27272a"};n.transparentBackground?s.clearRect(0,0,g,L):(s.fillStyle=_.background,s.fillRect(0,0,g,L)),k&&(s.fillStyle=_.titleText,s.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="left",s.fillText(k,v.left,28));let V=l.numLayers-1-C,oe=x=>V<=0?v.left+z/2:v.left+(x-C)/V*z,P=I?Math.log(Math.max(1,l.minValue)):0,Z=I?Math.log(Math.max(1,l.maxValue)):0,le=x=>{let T;if(I){let R=Math.log(Math.max(1,x));T=Z-P>0?(R-P)/(Z-P):.5}else T=(x-l.minValue)/(l.maxValue-l.minValue);return D?v.top+T*B:v.top+B-T*B};s.setLineDash([4,4]),s.strokeStyle=_.grid,s.lineWidth=1;let U=[],ye=l.maxValue-l.minValue,re=5;if(I){let x=new Set;for(let A=0;A<re;A++){let q=P+A/(re-1)*(Z-P),Y=Math.round(Math.exp(q));x.has(Y)||(x.add(Y),U.push(Y))}let T=Math.round(Math.exp(P)),R=Math.round(Math.exp(Z));x.has(T)||U.unshift(T),x.has(R)||U.push(R)}else if(S==="rank")for(let x=0;x<re;x++)U.push(Math.round(l.minValue+x/(re-1)*ye));else for(let x=0;x<re;x++)U.push(l.minValue+x/(re-1)*ye);if(U.forEach(x=>{let T=le(x);s.beginPath(),s.moveTo(v.left,T),s.lineTo(v.left+z,T),s.stroke()}),s.setLineDash([]),w){let x=le(0);s.beginPath(),s.strokeStyle=u?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",s.lineWidth=1.5,s.moveTo(v.left,x),s.lineTo(v.left+z,x),s.stroke(),s.lineWidth=1}s.fillStyle=_.text,s.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="right",s.textBaseline="middle",U.forEach(x=>{let T=le(x),R;S==="probability"?R=x.toFixed(2):S==="prob_diff"?R=x>=0?`+${x.toFixed(2)}`:x.toFixed(2):R=Math.round(x).toString(),s.fillText(R,v.left-16,T)}),s.textAlign="center",s.textBaseline="top";let Se=t.xLabels&&t.xLabels.length>0,we=Math.max(1,Math.ceil(l.numLayers/8));for(let x=0;x<l.numLayers;x+=we){let T=oe(x);if(T<v.left-5||T>v.left+z+5)continue;let R=Se?String(t.xLabels[x]??x):x.toString();s.fillText(R,T,v.top+B+12)}if((l.numLayers-1)%we!==0){let x=Se?String(t.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();s.fillText(x,oe(l.numLayers-1),v.top+B+12)}s.strokeStyle=u?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",s.lineWidth=1.5,s.beginPath(),s.moveTo(v.left,v.top),s.lineTo(v.left,v.top+B),s.lineTo(v.left+z,v.top+B),s.stroke(),s.fillStyle=_.textMuted,s.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(M.toUpperCase(),v.left+z/2,L-16),s.save(),s.translate(14,v.top+B/2),s.rotate(-Math.PI/2),s.textAlign="center",s.textBaseline="top",s.fillText(O.toUpperCase(),0,0),s.restore();let ne=fe(t);function W(x,T,R,A,q){s.beginPath(),s.strokeStyle=T,s.lineWidth=R,q!==void 0&&(s.globalAlpha=q),A?s.setLineDash(A.split(",").map(Number)):s.setLineDash([]);let Y=!1;for(let J=0;J<x.length;J++){let K=x[J];if(K===null){Y=!1;continue}let Ce=oe(J),Le=le(K);Y?s.lineTo(Ce,Le):(s.moveTo(Ce,Le),Y=!0)}s.stroke(),s.setLineDash([]),q!==void 0&&(s.globalAlpha=1)}let ze=u?"#3f3f46":"#d4d4d8";if(s.lineCap="round",s.lineJoin="round",ne.forEach((x,T)=>{!h.has(T)||x.isOverlay||W(x.values,ze,2,void 0,.35)}),ne.forEach((x,T)=>{if(h.has(T)||x.isOverlay)return;let R=x.color??j[T%j.length];W(x.values,R,4,x.dashPattern,.15),W(x.values,R,2,x.dashPattern),y&&x.values.forEach((A,q)=>{if(A===null)return;let Y=oe(q),J=le(A),K=d?.lineIdx===T&&d?.layerIdx===q;s.beginPath(),s.strokeStyle=R,s.lineWidth=K?2:1.5,s.arc(Y,J,K?5:3.5,0,Math.PI*2),s.stroke(),s.beginPath(),s.fillStyle=u?"#18181b":"#ffffff",s.arc(Y,J,K?3.5:2.5,0,Math.PI*2),s.fill()})}),ne.forEach((x,T)=>{if(!x.isOverlay||h.has(T))return;let R=x.color??"#999";W(x.values,R,1.5,x.dashPattern??"4,2",.7)}),p){let x=p.color??"#999";W(p.values,x,1.5,p.dashPattern??"4,2",.7)}return Q}function Tt(i){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",i.appendChild(e),e}function Et(i,e,t,n,l,h,d,p,s){let{margin:f,chartWidth:r,chartHeight:g}=l,L=n.xRangeStart??0,u=d-1-L,k=n.logScale?Math.log(Math.max(1,p)):0,S=n.logScale?Math.log(Math.max(1,s)):0;if(i<f.left||i>f.left+r||e<f.top||e>f.top+g)return null;let D=fe(t),w=null,I=1/0,M=20;for(let O=0;O<D.length;O++){if(h.has(O))continue;let C=D[O];if(!C.isOverlay)for(let y=0;y<C.values.length;y++){let v=C.values[y];if(v===null)continue;let z=u<=0?f.left+r/2:f.left+(y-L)/u*r,B;if(n.logScale){let V=Math.log(Math.max(1,v));B=S-k>0?(V-k)/(S-k):.5}else B=(v-p)/(s-p);let Q=n.invertYAxis?f.top+B*g:f.top+g-B*g,_=Math.sqrt((i-z)**2+(e-Q)**2);_<I&&_<M&&(I=_,w={visible:!0,x:z,y:Q,lineIdx:O,layerIdx:y,value:v,label:C.label,color:C.color??j[O%j.length]})}}return w}function Qe(i,e,t,n,l,h,d){if(!e){i.style.opacity="0";return}let p=n?"#27272a":"#fff",s=n?"#3f3f46":"#e4e4e7",f=n?"#fafafa":"#18181b",r=n?"#a1a1aa":"#71717a",L=e.x>t/2?"calc(-100% - 12px)":"12px";i.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${L},-50%);`;let u=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx);i.innerHTML=`
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
        </div>`}var wn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',Ln='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',kn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function St(i){let e=document.createElement("div");return Ct(e,i),e}function Ct(i,e){let t=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",n=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";i.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${t};backdrop-filter:blur(12px);border:1px solid ${n};align-self:flex-start;`}function $t(i,e,t,n,l,h){Ct(i,n),i.innerHTML="";let d=n?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",p=n?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",s=n?"#a1a1aa":"#71717a",f=n?"#3f3f46":"#d4d4d8",r="rgba(161,161,170,0.3)",g=n?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",L=h?fe(h):[];e.forEach((u,k)=>{let S=L[k];if(S?.isOverlay)return;let D=S?.color??j[k%j.length],w=t.has(k),I=S?.removable??!1,M=document.createElement("button");M.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:pointer;transition:all 0.15s;opacity:${w?"0.5":"1"};`,M.addEventListener("mouseenter",()=>{M.style.background=g}),M.addEventListener("mouseleave",()=>{M.style.background="transparent"}),M.addEventListener("click",()=>l.onToggle(k));let O=document.createElement("span");O.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${w?r:D};background:${w?f:"transparent"};`,M.appendChild(O);let C=document.createElement("span");if(C.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${w?p:d};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,C.title=u,C.innerHTML=ge(u),M.appendChild(C),I&&l.onRemove){let y=document.createElement("span");y.style.cssText=`margin-left:auto;cursor:pointer;color:${s};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,y.innerHTML=kn,y.title="Remove",y.addEventListener("click",v=>{v.stopPropagation(),l.onRemove(k)}),M.appendChild(y),M.addEventListener("mouseenter",()=>{y.style.opacity="0.6"}),M.addEventListener("mouseleave",()=>{y.style.opacity="0"})}else{let y=document.createElement("span");y.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${s};opacity:${w?"0.6":"0"};display:flex;align-items:center;`,y.innerHTML=w?Ln:wn,M.appendChild(y),w||(M.addEventListener("mouseenter",()=>{y.style.opacity="0.4"}),M.addEventListener("mouseleave",()=>{y.style.opacity="0"}))}i.appendChild(M)})}var ce=class{constructor(e,t,n={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let t=this.canvas.getBoundingClientRect(),n=e.clientX-t.left,l=e.clientY-t.top;this.tooltip=Et(n,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),Qe(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,Qe(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=t,this.options={darkMode:!1,...n},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer),this.canvas=document.createElement("canvas"),this.canvas.style.cssText="display:block;width:100%;height:100%;cursor:crosshair;",this.chartContainer.appendChild(this.canvas),this.tooltipEl=Tt(this.chartContainer),this.legendEl=St(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave),this.resizeObserver=new ResizeObserver(l=>{if(this.destroyed)return;let h=l[0];if(!h)return;let d=Math.round(h.contentRect.width),p=Math.round(h.contentRect.height);d===this.lastWidth&&p===this.lastHeight||(this.lastWidth=d,this.lastHeight=p,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,t)=>e.label??`Line ${t+1}`):this.data.labels||(this.data.lines??[]).map((e,t)=>`Line ${t+1}`)}draw(){this.config=kt(this.data,this.options,this.overlay),this.config&&(this.geometry=Mt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="",$t(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,{onToggle:t=>this.toggleLine(t),onRemove:this.options.onLineRemoved?t=>{this.removeLine(t,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(t)}:void 0},this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((t,n)=>({values:t,label:this.data.labels?.[n]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,t=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let n=new Set;for(let l of this.hiddenLines)l<e?n.add(l):l>e&&n.add(l-1);this.hiddenLines=n,t||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function Te(i){if(typeof document>"u")return String(i??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]);let e=document.createElement("div");return e.textContent=String(i??""),e.innerHTML}function He(i){return i==null?"":i.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+Te(i.slice(1)):Te(i)}function Mn(i){let e=`#${i}`;return`
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
    `}function Ht(i){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=Mn(i),document.head.appendChild(e),e}var Tn=0,ve=class{constructor(e,t,n={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.container=e,this.data=t,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,...n},this.uid="hmx_"+ ++Tn+"_"+Date.now().toString(36),this.styleEl=Ht(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`,this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.attachListeners(),this.render(),this.setupResponsive()}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let t=this.container?.clientWidth??0;return t>0?t-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let t=this.options.columnWindow;if(!t)return{start:0,size:e};let n=Math.max(1,Math.min(t.size,e));return{start:Math.max(0,Math.min(t.start,e-n)),size:n}}maxColsFit(){let e=this.options,t=e.minColumnWidth??48,n=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/t),h=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(h,l))}resolveVisibleColumns(){let e=this.options,{start:t,size:n}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let r=[];for(let g=0;g<n;g++)r.push(t+g);return r}let l=this.maxColsFit();if(n<=l){let r=[];for(let g=0;g<n;g++)r.push(t+g);return r}let h=!!e.alwaysShowLastColumn,d=Math.max(1,l-(h?1:0)),p=Math.ceil(n/d),s=[];for(let r=t;r<t+n;r+=p)s.push(r);let f=t+n-1;return h&&s[s.length-1]!==f&&s.push(f),s}resolveCellWidth(e){let t=this.options;if(t.columnSizing==="fit"&&e>0){let n=t.rowHeaderWidth??100,l=Math.floor((this.availWidth()-n)/e);return Math.max(t.minColumnWidth??1,l)}return t.cellWidth??48}resolveRowHeight(e){let t=this.options,n=t.cellHeight??28;if(t.rowSizing!=="fill"||e<=0)return n;let l=this.scrollEl.clientHeight;return e*n<l?Math.floor(l/e):n}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,t=!!e.darkMode;this.root.classList.toggle("hmx-dark",t),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let n=e.rowHeaderWidth??100,l=e.headerHeight??26,h=this.data.columns,d=this.resolveVisibleColumns(),p=d.length,s=this.resolveCellWidth(p),f=this.data.rows,r=e.maxRows!=null?Math.min(f.length,e.maxRows):f.length,g=this.resolveRowHeight(r),L=n+s*p,u=`${n}px repeat(${p}, ${s}px)`,k=e.showGrid?t?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",S=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${u};height:${l}px;width:${L}px;min-width:${L}px;">`;S+=`<div class="hmx-corner">${Te(e.cornerLabel??"")}</div>`;for(let w=0;w<p;w++)S+=`<div class="hmx-col">${He(h[d[w]].label)}</div>`;S+="</div>",this.hdrEl.innerHTML=S;let D=`<div class="hmx-grid-inner" style="width:${L}px;min-width:${L}px;">`;for(let w=0;w<r;w++){let I=f[w].label,M=e.rowClassName?.(w),O=e.renderRowLabel?e.renderRowLabel(w):`<span class="hmx-cell-text">${He(I)}</span>`;D+=`<div class="hmx-row${M?" "+M:""}" data-rowwrap="${w}">`,D+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${u};height:${g}px;">`,D+=`<div class="hmx-rowlabel" data-row="${w}" title="${Te(I)}">${O}</div>`;for(let C=0;C<p;C++){let y=d[C],v=this.data.getCellValue(w,y),z=v.highlighted&&v.highlightColor?`box-shadow:inset 0 0 0 2px ${v.highlightColor};`:"",B=v.bold?"font-weight:bold;":"",Q=v.opacity!=null&&v.opacity<1?`opacity:${v.opacity};`:"",_=w===0,V=w===r-1,oe=C===0,P=C===p-1,Z="";_&&oe?Z="border-top-left-radius:8px;":_&&P?Z="border-top-right-radius:8px;":V&&oe?Z="border-bottom-left-radius:8px;":V&&P&&(Z="border-bottom-right-radius:8px;"),D+=`<div class="hmx-cell${v.className?" "+v.className:""}" data-row="${w}" data-col="${y}" style="background:${v.color};color:${v.textColor};padding:0 6px;${Q}${k}${z}${B}${Z}"><span class="hmx-cell-text">${He(v.text)}</span></div>`}D+="</div></div>"}D+="</div>",this.scrollEl.innerHTML=D,e.onVisibleColumnsChange&&!En(d,this.lastVisibleCols)?(this.lastVisibleCols=d,e.onVisibleColumnsChange(d)):this.lastVisibleCols=d}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let t=e.target.closest(".hmx-cell");if(!t){this.clearHover();return}this.hoverCell!==t&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=t,t.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(t.dataset.row),parseInt(t.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let t=e.target,n=t.closest(".hmx-rowlabel");if(n){this.options.onRowHeaderClick?.(parseInt(n.dataset.row),e);return}let l=t.closest(".hmx-cell");l&&this.options.onCellClick?.(parseInt(l.dataset.row),parseInt(l.dataset.col),e)})}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let t=this.isResponsive();this.options={...this.options,...e},this.render(),!t&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let t=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!t)return;let n=t.offsetTop-this.scrollEl.clientHeight/2+t.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,n),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function En(i,e){if(i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0}function Ze(i){let e=i.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let t=i.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(t){let n=t[1],l,h,d,p=1;return n.length===3||n.length===4?(l=parseInt(n[0]+n[0],16),h=parseInt(n[1]+n[1],16),d=parseInt(n[2]+n[2],16),n.length===4&&(p=parseInt(n[3]+n[3],16)/255)):(l=parseInt(n.slice(0,2),16),h=parseInt(n.slice(2,4),16),d=parseInt(n.slice(4,6),16),n.length===8&&(p=parseInt(n.slice(6,8),16)/255)),[l,h,d,p]}return null}function Je(i){return!i||i[3]<.95?null:(.299*i[0]+.587*i[1]+.114*i[2])/255}function Sn(i){let e=i;for(;e;){let t=Je(Ze(getComputedStyle(e).backgroundColor));if(t!==null)return t;e=e.parentElement}if(typeof document<"u")for(let t of[document.body,document.documentElement]){if(!t)continue;let n=Je(Ze(getComputedStyle(t).backgroundColor));if(n!==null)return n}return null}function Cn(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let t=Je(Ze(e));return t===null?null:t<.5}function Pe(i,e){let t=pe(i),n=()=>{let d=pe(i);d!==t&&(t=d,e(d))},l=new MutationObserver(n);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let h=null;return typeof window<"u"&&window.matchMedia&&(h=window.matchMedia("(prefers-color-scheme: dark)"),h.addEventListener("change",n)),()=>{l.disconnect(),h?.removeEventListener("change",n)}}function pe(i){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=Cn();if(e!==null)return e;let t=Sn(i??null);return t!==null?t<.5:!1}var $n=60,Hn=30,Pn=22,Dn=48,In=18,Pt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},Rn="#cc6622";function zn(i){let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Dt=41;function Ke(i,e,t){let[n,l,h]=zn(e),d=Math.pow(Math.max(0,Math.min(1,i)),1.1);if(t){let s=f=>Math.round(Dt+(f-Dt)*d);return`rgb(${s(n)}, ${s(l)}, ${s(h)})`}let p=s=>Math.round(255-(255-s)*d);return`rgb(${p(n)}, ${p(l)}, ${p(h)})`}function On(i,e){return e?i>=.62?"#fff":i>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":i>=.62?"#fff":i>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function It(i){return i==null?"":i.startsWith(" ")?'<span class="ll-lead-space">_</span>'+me(i.slice(1)):me(i)}function be(i){return i==null?"":i.startsWith(" ")?"_"+i.slice(1):i}function De(i){let e=i.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function Rt(i,e,t){let n=xt(),l;if(typeof i=="string"?l=document.querySelector(i):i instanceof Element?l=i:l=null,!l)return console.error("Container not found:",i),null;let h=qe(e),d=h.normalized,p=h.v2Data,s=yt(n);function f(o){return o?o.map(a=>({token:a.tokens?.[0]??"",color:a.color})).filter(a=>a.token!==""):[]}let r={ramp:t?.ramp||"purple",showGrid:t?.showGrid??!0,dimLow:t?.dimLowProb??!0,selectedRow:t?.selectedRow??null,selectedLayerIdx:t?.selectedLayer??null,viewStart:t?.viewStart??0,viewSize:t?.viewSize??d.layers.length,darkModeOverride:t?.darkMode??null,pinned:f(t?.pinnedGroups),pinnedRows:(t?.pinnedRows??[]).map(o=>o.pos).filter(o=>typeof o=="number"),colorIndex:t?.colorIndex??0,openPopup:null},g={};function L(o,a){(g[o]||[]).forEach(c=>c(a))}let u=d.layers.length,k=d.tokens.length,S=[],D="";function w(){u=d.layers.length,k=d.tokens.length,S=[];for(let a=0;a<u;a++){let c=0;for(let m=0;m<k;m++){let b=d.cells[m]?.[a];b&&b.prob>c&&(c=b.prob)}S.push(c)}D=d.cells[k-1]?.[u-1]?.token??"",r.pinnedRows=r.pinnedRows.filter(a=>a>=0&&a<k),r.selectedRow!==null&&r.selectedRow>=k&&(r.selectedRow=null),(r.viewSize>u||r.viewSize<1)&&(r.viewSize=u);let o=Math.max(0,u-r.viewSize);r.viewStart>o&&(r.viewStart=o),r.viewStart<0&&(r.viewStart=0)}w();function I(o){let a=r.pinned.find(c=>c.token===o);return a?a.color:null}function M(o){let a=r.pinned.findIndex(c=>c.token===o);a>=0?r.pinned.splice(a,1):(r.pinned.push({token:o,color:Me[r.colorIndex%Me.length]}),r.colorIndex++)}function O(o,a){let c=p?.tracked?.[o];if(c&&Array.isArray(c[a]))return c[a];for(let m=0;m<u;m++){let b=d.cells[o]?.[m]?.topk.find(E=>E.token===a);if(b)return b.trajectory}return null}function C(o){let a=r.pinnedRows.indexOf(o);return Xe[(a<0?0:a)%Xe.length]}function y(o){return r.pinnedRows.indexOf(o)>=0}function v(o,a){for(let c of r.pinned){let m=O(o,c.token);if(!m)continue;let b=0;for(let E of m)E!=null&&E>b&&(b=E);if(b>=a)return!0}return!1}function z(o){let a=null,c=0;for(let m=0;m<u;m++){let b=d.cells[o]?.[m];b&&b.prob>c&&(c=b.prob,a=b.token)}return c>=.05?a:null}function B(o){let a=r.pinnedRows.indexOf(o);if(a>=0){r.pinnedRows.splice(a,1);return}if(!v(o,.01)){let c=z(o);c&&!I(c)&&(r.pinned.push({token:c,color:Me[r.colorIndex%Me.length]}),r.colorIndex++)}r.pinnedRows.push(o)}function Q(){return Pt[r.ramp]||Pt.purple}function _(){return r.darkModeOverride!==null?r.darkModeOverride:pe(l)}let V=[];function oe(){return V.length>1?Math.max(1,V[1]-V[0]):1}l.innerHTML=`
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
    `;let P=document.getElementById(n),Z=document.getElementById(n+"_heatmap"),le=document.getElementById(n+"_nav"),U;wt();let ye=document.getElementById(n+"_lp_wrap"),re=document.getElementById(n+"_lp_token"),Se=document.getElementById(n+"_lp_box"),we=document.getElementById(n+"_lp"),ne=document.getElementById(n+"_tt"),W=document.getElementById(n+"_popup"),ze=document.getElementById(n+"_popup_hdr"),x=document.getElementById(n+"_popup_body");document.body.appendChild(W);let T=null,R=null,A=!0,q=!1,Y=getComputedStyle(P).getPropertyValue("--ll-aspect-ratio").trim(),J=!Y;J&&P.classList.add("ll-fill");let K=(()=>{if(!Y||/^(unbounded|none|auto)$/i.test(Y))return null;let o=Y.split("/").map(a=>parseFloat(a.trim()));return o.length!==2||isNaN(o[0])||isNaN(o[1])||o[0]===0||o[1]===0?null:o[1]/o[0]})();function Ce(o,a){let c=a?"#bbb":"#555",m=o?` stroke-dasharray="${me(o)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${c}" stroke-width="1.5"${m}/></svg>`}function Le(){return{rows:d.tokens.map(o=>({label:o})),columns:d.layers.map(o=>({label:String(o),value:0})),getCellValue:(o,a)=>{let c=d.cells[o][a],m=c.prob,b=_(),E=D!==""&&c.token===D,$=I(c.token),H=m<.18;return{text:c.token,value:m,color:Ke(m,E?Rn:Q(),b),textColor:On(m,b),highlighted:!!$,highlightColor:$??void 0,opacity:r.dimLow&&H?.55:void 0}}}}function jt(o){let a=d.tokens[o],c=o===r.selectedRow||y(o),m="";return y(o)&&(m+=Ce(C(o).dash,_())),m+=De(a)?'<span class="ll-hmx-bos">bos</span>':`<span class="hmx-cell-text"${c?' style="font-weight:600"':""}>${It(a)}</span>`,m}function Ut(o){return"ll-hmx-row"+(o===r.selectedRow||y(o)?" ll-hmx-active":"")}function it(){return{columnSizing:"fit",minColumnWidth:Dn,maxVisibleColumns:In,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:ke(r.viewStart),size:r.viewSize},rowSizing:J?"fill":"fixed",cellHeight:Hn,rowHeaderWidth:$n,headerHeight:Pn+6,height:J||K!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:r.showGrid,darkMode:_(),renderRowLabel:jt,rowClassName:Ut,onVisibleColumnsChange:o=>{V=o},onCellHover:dn,onCellClick:cn,onRowHeaderClick:o=>{B(o),G(),X(),ie()},onCellLeave:()=>{Ae(),an()}}}function Gt(){if(J){let a=l.clientWidth;P.style.width=a>0?a+"px":"100%",P.style.maxWidth="100%",P.style.maxHeight="";return}P.style.width="",P.style.maxWidth="";let o=l.clientWidth||P.clientWidth;if(K&&o>0){let c=P.offsetHeight-U.getScrollElement().offsetHeight,m=(c>0?c:140)+90;P.style.maxHeight=Math.max(m,Math.round(o*K))+"px"}else P.style.maxHeight=""}function G(){Gt(),U.setOptions(it())}function se(){let o=Q(),a=_(),c=ke(r.viewStart),m=oe(),b=r.viewSize,E=b>=u,$=lt(),H=b<=$[0],F='<span class="ll-nav-range-key">layers</span>';E?F+=`all ${u}`+(m>1?`<span class="ll-dim"> \xB7 every ${m}</span>`:""):F+=`${c}\u2013${c+b-1}<span class="ll-dim"> / ${u}</span>`+(m>1?`<span class="ll-dim"> \xB7 \u22481/${m}</span>`:"");let ee="";for(let te=0;te<u;te++){let $e=S[te]||0,Ue=Math.max(8,Math.round($e*92));ee+=`<div class="ll-skyline-bar" style="height:${Ue}%;background:${Ke($e,o,a)}"></div>`}let N=c/u*100,ae=b/u*100,de=[];for(let te=0;te<u;te+=8)de.push(te);de[de.length-1]!==u-1&&de.push(u-1);let xe="",ue=Math.max(1,u-1);for(let te of de){let $e=te===u-1,Ue=te===0,hn=te/ue*100;xe+=`<span class="ll-nav-tick" style="left:${hn}%;transform:${$e?"translateX(-100%)":Ue?"translateX(0)":"translateX(-50%)"}">${d.layers[te]}</span>`}le.innerHTML=`
            <div class="ll-nav-range">${F}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${n}_sky">
                    <div class="ll-skyline-bars">${ee}</div>
                    <div class="ll-skyline-win" id="${n}_win" style="left:${N}%;width:${ae}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${xe}</div>
            </div>
            <div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${c<=0?"disabled":""}>${Bn}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${c+b>=u?"disabled":""}>${Wn}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${H?"disabled":""}>${An}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${E?"disabled":""}>${Fn}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${_n}</button>
            </div>
        `,Qt()}function qt(){let o=document.getElementById(n+"_win");if(!o)return;let a=Math.max(0,u-r.viewSize),c=Math.max(0,Math.min(a,r.viewStart));o.style.left=c/u*100+"%",o.style.width=r.viewSize/u*100+"%"}function lt(){return Array.from(new Set([u,48,32,20,14,10,8])).filter(o=>o<=u&&o>=1).sort((o,a)=>o-a)}function ke(o){return Math.max(0,Math.min(Math.max(0,u-r.viewSize),o))}let Oe=!1;function rt(){Oe||(Oe=!0,requestAnimationFrame(()=>{Oe=!1,!q&&(G(),qt())}))}function _e(o){let a=ke(r.viewStart+o);a!==r.viewStart&&(r.viewStart=a,G(),se(),ie())}function Yt(o){let a=ke(o);a!==r.viewStart&&(r.viewStart=a,rt())}function st(o,a){let c=lt(),m=c.findIndex(H=>H>=r.viewSize),b=m===-1?c.length-1:m,E=o<0?Math.max(0,b-1):Math.min(c.length-1,b+1),$=c[E];$!==r.viewSize&&(r.viewSize=$,r.viewStart=Math.max(0,Math.min(u-$,Math.round(a-$/2))),G(),se(),ie())}function at(o){st(o,r.viewStart+r.viewSize/2)}function Xt(){r.viewSize=u,r.viewStart=0,G(),se(),ie()}let he=null;function Qt(){let o=document.getElementById(n+"_sky");if(!o)return;o.addEventListener("pointerdown",c=>{let m=o.getBoundingClientRect(),b=c.clientX-m.left,E=m.width/u,$=Math.max(0,u-r.viewSize),H=Math.max(0,Math.min($,r.viewStart)),F=H*E,ee=(H+r.viewSize)*E,N=H;(b<F||b>ee)&&(N=ke(Math.round(b/E)-Math.floor(r.viewSize/2)),r.viewStart=N,rt()),he={startX:b,startStart:N,layerW:E},o.classList.add("ll-grabbing");try{o.setPointerCapture(c.pointerId)}catch{}}),o.addEventListener("pointermove",c=>{if(!he)return;let m=o.getBoundingClientRect(),E=(c.clientX-m.left-he.startX)/he.layerW;Yt(Math.round(he.startStart+E))});let a=c=>{if(he){he=null,o.classList.remove("ll-grabbing");try{o.releasePointerCapture(c.pointerId)}catch{}se(),ie()}};o.addEventListener("pointerup",a),o.addEventListener("pointercancel",a),o.addEventListener("wheel",c=>{c.preventDefault();let m=o.getBoundingClientRect();if(Math.abs(c.deltaX)>Math.abs(c.deltaY)){_e(c.deltaX>0?1:-1);return}let b=Math.round((c.clientX-m.left)/m.width*u);st(c.deltaY<0?-1:1,b)},{passive:!1})}function Zt(o,a,c=!1){r.selectedRow=o,r.selectedLayerIdx=a??d.layers.length-1,G(),X(),c&&Jt(o),ie()}function Jt(o){U.scrollToRow(o)}function Be(){requestAnimationFrame(()=>requestAnimationFrame(()=>{q||U.scrollToBottom()}))}let Kt=.45,en=120,tn=360;function We(){let o;if(K)o=(l.clientWidth||P.clientWidth)*K;else{let c=P.clientHeight;o=c>0?c:(P.clientWidth||900)*.6}let a=Math.round(o*Kt);Se.style.height=Math.max(en,Math.min(tn,a))+"px"}function dt(o){return o+"\xB7"+(De(d.tokens[o])?"bos":be(d.tokens[o]))}function X(o){let a=r.pinnedRows.length>0?r.pinnedRows:r.selectedRow!==null?[r.selectedRow]:[],c=a.length>1,m=[];for(let E of a){let $=C(E);for(let H of r.pinned){let F=O(E,H.token);if(!F)continue;let ee=be(H.token);c&&(ee+=" ("+dt(E)+")"),m.push({values:F.map(N=>N??null),label:ee,color:H.color,dashPattern:$.dash||void 0,removable:!1})}}let b=m.length===0&&!o;if(b)ye.classList.add("ll-hidden");else{ye.classList.remove("ll-hidden"),We(),re.textContent=r.pinnedRows.length>1?r.pinnedRows.length+" positions":a.length===1?"position "+dt(a[0]):"";let E={lines:[],richLines:m,xLabels:d.layers},$={darkMode:_(),mode:"probability",autoScale:!0,legendPosition:m.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0};T?(T.setData(E),T.setOptions($)):(we.style.minHeight="0",T=new ce(we,E,$)),o?T.setOverlay?.({values:o.values,label:o.label,color:o.color,dashPattern:"4,2",isOverlay:!0}):T.setOverlay?.(null)}J&&b!==A?(A=b,requestAnimationFrame(()=>{q||(G(),Be())})):A=b}function nn(o,a,c,m){let b=d.cells[o]?.[a];if(!b)return;let E=Q(),$=De(d.tokens[o])?"bos":be(d.tokens[o]);ne.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${Ke(b.prob,E,_())}"></span><span class="ll-tt-token">${me(be(b.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${(b.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${d.layers[a]} / ${d.layers[u-1]}</span><span>position</span><span class="ll-tt-val">${o} \xB7 ${me($)}</span></div>`,ne.classList.add("ll-visible");let H=P.getBoundingClientRect(),F=ne.offsetWidth||220,ee=ne.offsetHeight||90,N=c-H.left+16;c+F+24>window.innerWidth-8&&(N=c-H.left-F-12);let ae=m-H.top-50;N=Math.max(6,Math.min(N,H.width-F-6)),ae=Math.max(6,Math.min(ae,H.height-ee-6)),ne.style.left=N+"px",ne.style.top=ae+"px"}function Ae(){ne.classList.remove("ll-visible")}function on(){Fe(),R=document.createElement("div"),R.style.cssText="position:fixed;inset:0;z-index:49;",R.addEventListener("mousedown",o=>{o.preventDefault(),o.stopPropagation(),pt()}),document.body.appendChild(R)}function Fe(){R&&(R.remove(),R=null)}function ln(o,a,c){if(!d.cells[o]?.[a])return;let b=c.getBoundingClientRect();r.openPopup={row:o,layer:a},r.selectedRow=o,r.selectedLayerIdx=a;let E=De(d.tokens[o])?"bos":be(d.tokens[o]);ze.innerHTML=`Layer <b>${d.layers[a]}</b>, Position <b>${o}</b><div class="ll-popup-sub">input <code>${me(E)}</code></div>`,ct(o,a),G(),X(),W.style.visibility="hidden",W.classList.add("ll-visible"),rn(b),W.style.visibility="",on(),ie()}function ct(o,a){let c=d.cells[o][a],m="";c.topk.forEach((b,E)=>{let $=I(b.token),H=$?`background:${$}22;border-left-color:${$};`:"";m+=`<div class="ll-topk${$?" ll-topk-pinned":""}" data-ki="${E}" style="${H}" title="click to track trajectory"><span class="ll-topk-tok">${It(b.token)}</span><span class="ll-topk-prob">${(b.prob*100).toFixed(1)}%</span></div>`}),x.innerHTML=m,x.querySelectorAll(".ll-topk").forEach(b=>{let E=parseInt(b.dataset.ki),$=c.topk[E];b.addEventListener("mouseenter",()=>{if(A)return;let H=O(o,$.token);H&&X({values:H.map(F=>F??null),label:be($.token),color:"#999"})}),b.addEventListener("mouseleave",()=>{A||X()}),b.addEventListener("click",H=>{H.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(M($.token),G(),ct(o,a),X(),ie())})})}function rn(o){let m=P.getBoundingClientRect(),b=Math.max(140,m.width-2*8),E=Math.max(120,m.height-2*8);W.style.maxWidth=b+"px",W.style.maxHeight=E+"px";let $=W.offsetWidth||220,H=W.offsetHeight||160,F=m.left+8,ee=m.right-8-$,N=m.top+8,ae=m.bottom-8-H,de=[{left:o.right+6,top:o.top},{left:o.left-6-$,top:o.top},{left:o.left,top:o.bottom+6},{left:o.left,top:o.top-6-H}],xe=de[0];for(let ue of de)if(ue.left>=F&&ue.left<=ee&&ue.top>=N&&ue.top<=ae){xe=ue;break}W.style.left=Math.max(F,Math.min(xe.left,Math.max(F,ee)))+"px",W.style.top=Math.max(N,Math.min(xe.top,Math.max(N,ae)))+"px"}function pt(){r.openPopup=null,W.classList.remove("ll-visible"),Fe(),G(),X()}document.getElementById(n+"_popup_close").addEventListener("click",o=>{o.stopPropagation(),pt()});function sn(o,a){if(A)return;let c=d.cells[o]?.[a]?.token,m=c!=null?O(o,c):null;m?X({values:m.map(b=>b??null),label:be(c),color:"#999"}):X()}function an(){A||X()}function dn(o,a){sn(o,a)}function cn(o,a,c){if(c.shiftKey){let b=d.cells[o]?.[a]?.token;b&&(M(b),G(),X(),ie());return}Ae();let m=c.target.closest(".hmx-cell");m&&ln(o,a,m)}U=new ve(Z,Le(),it());let ht=U.getScrollElement(),ut=o=>{let a=o.target.closest(".hmx-cell");if(!a){Ae();return}nn(parseInt(a.dataset.row),parseInt(a.dataset.col),o.clientX,o.clientY)};ht.addEventListener("mousemove",ut),Z.addEventListener("keydown",o=>{if(o.key!=="ArrowDown"&&o.key!=="ArrowUp")return;o.preventDefault();let a=r.selectedRow??-1,c=o.key==="ArrowDown"?Math.min(k-1,a+1):Math.max(0,a-1);Zt(c,void 0,!0)}),le.addEventListener("click",o=>{let a=o.target.closest("[data-nav]");if(!a||a.hasAttribute("disabled"))return;let c=a.dataset.nav;c==="panL"?_e(-Math.max(1,Math.floor(r.viewSize/4))):c==="panR"?_e(Math.max(1,Math.floor(r.viewSize/4))):c==="zoomIn"?at(-1):c==="zoomOut"?at(1):c==="reset"&&Xt()});function Ne(){G(),se(),X(),requestAnimationFrame(()=>{q||(G(),se(),A||We())})}function Ve(){Ye(P,_(),W)}function ie(){L("stateChange",bt())}Ne(),Be(),Ve();let je=0,mt=l?.clientWidth??0,ft=l?.clientHeight??0,gt=new ResizeObserver(()=>{let o=l?.clientWidth??0,a=l?.clientHeight??0;o===mt&&a===ft||(mt=o,ft=a,!je&&(je=requestAnimationFrame(()=>{je=0,!q&&(G(),A||We())})))});l&&gt.observe(l);let pn=Pe(l,o=>{r.darkModeOverride===null&&(Ye(P,o,W),G(),se(),X())});function bt(){return{ramp:r.ramp,showGrid:r.showGrid,dimLowProb:r.dimLow,selectedRow:r.selectedRow,selectedLayer:r.selectedLayerIdx,viewStart:r.viewStart,viewSize:r.viewSize,colorIndex:r.colorIndex,pinnedGroups:r.pinned.map(o=>({tokens:[o.token],color:o.color})),pinnedRows:r.pinnedRows.map(o=>({pos:o,line:C(o).name})),darkMode:r.darkModeOverride}}return{widget:{getState:bt,setState:o=>{o.ramp!==void 0&&(r.ramp=o.ramp),o.showGrid!==void 0&&(r.showGrid=o.showGrid),o.dimLowProb!==void 0&&(r.dimLow=o.dimLowProb),o.selectedRow!==void 0&&(r.selectedRow=o.selectedRow),o.selectedLayer!==void 0&&(r.selectedLayerIdx=o.selectedLayer),o.viewStart!==void 0&&(r.viewStart=o.viewStart),o.viewSize!==void 0&&(r.viewSize=o.viewSize),o.colorIndex!==void 0&&(r.colorIndex=o.colorIndex),o.pinnedGroups!==void 0&&(r.pinned=f(o.pinnedGroups)),o.pinnedRows!==void 0&&(r.pinnedRows=o.pinnedRows.map(a=>a.pos).filter(a=>typeof a=="number")),o.darkMode!==void 0&&(r.darkModeOverride=o.darkMode),w(),Ve(),Ne()},setData:o=>{h=qe(o),d=h.normalized,p=h.v2Data,r.selectedRow=null,r.selectedLayerIdx=null,r.pinned=[],r.pinnedRows=[],r.colorIndex=0,w(),V=[],U.setData(Le()),Ne(),Be()},setTitle:()=>{},setThemeMode:o=>{r.darkModeOverride=!!o,Ve(),G(),se(),X()},getThemeMode:()=>_(),hasEntropyData:()=>!!p&&Array.isArray(p.entropy)&&p.entropy.length>0,hasRankData:()=>{if(!p?.tracked)return!1;for(let o of p.tracked)for(let a in o){let c=o[a];if(c&&typeof c=="object"&&Array.isArray(c.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(o,a)=>{(g[o]||(g[o]=[])).push(a)},off:(o,a)=>{g[o]=(g[o]||[]).filter(c=>c!==a)},destroy:()=>{q=!0,pn(),gt?.disconnect(),Fe(),W.remove(),T&&(T.destroy(),T=null),ht.removeEventListener("mousemove",ut),U?.destroy(),l&&(l.innerHTML="")}},styleEl:s}}var _n='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Bn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Wn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',An='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Fn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ie=class{constructor(e,t,n){this.widget=null;this.styleEl=null;let l=Rt(e,t,n);l&&(this.widget=l.widget,this.styleEl=l.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,t){this.widget?.on(e,t)}off(e,t){this.widget?.off(e,t)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var Nn='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',Vn='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',jn='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',et="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function tt(i){return{fg:i?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:i?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:i?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:i?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:i?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:i?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:i?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:i?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:i?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:i?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function zt(i){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${et};`;let t={isOpen:!1,searchQuery:""},n=_t(e,i,t);return e.__tokenSelectorCleanup=n,e.__tokenSelectorState=t,e}function Ee(i,e){let t=i.__tokenSelectorCleanup,n=i.__tokenSelectorState;t&&t();let l={isOpen:n?.isOpen??!1,searchQuery:n?.searchQuery??""},h=_t(i,e,l);i.__tokenSelectorCleanup=h,i.__tokenSelectorState=l}function Ot(i){let e=i.__tokenSelectorCleanup;e&&e()}function _t(i,e,t){i.innerHTML="";let n=tt(e.darkMode),{allLabels:l,selectedIndices:h,defaultIndices:d,onChange:p}=e,s=document.createElement("div");s.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let f=document.createElement("span");if(f.style.cssText=`font-size:11px;color:${n.fgMuted};`,f.textContent=`Tokens (${l.length})`,s.appendChild(f),!nt(h,d)){let y=document.createElement("button");y.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${n.fgMuted};font-family:${et};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,y.innerHTML=`${Nn} Reset`,y.addEventListener("mouseenter",()=>{y.style.color=n.fg}),y.addEventListener("mouseleave",()=>{y.style.color=n.fgMuted}),y.addEventListener("click",()=>{p(Array.from(d))}),s.appendChild(y)}i.appendChild(s);let g=document.createElement("div");g.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${n.border};border-radius:6px;background:${n.inputBg};cursor:text;min-height:30px;`,g.addEventListener("click",()=>{M(),u.focus()});let L=Array.from(h).sort((y,v)=>y-v);for(let y of L){let v=Un(y,l[y],e.darkMode,()=>{let z=new Set(h);z.delete(y),p(Array.from(z))});g.appendChild(v)}let u=document.createElement("input");u.type="text",u.placeholder=L.length===0?"Search tokens...":"",u.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${n.fg};font-family:${et};min-width:60px;flex:1;padding:2px 0;`,u.addEventListener("input",()=>{t.searchQuery=u.value,I()}),u.addEventListener("focus",()=>M()),g.appendChild(u);let k=document.createElement("span");k.style.cssText=`display:flex;align-items:center;color:${n.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,k.innerHTML=jn,k.addEventListener("click",y=>{y.stopPropagation(),t.isOpen?O():M()}),g.appendChild(k),i.appendChild(g);let S=document.createElement("div");S.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${n.bg};border:1px solid ${n.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let D=document.createElement("div");D.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",S.appendChild(D);let w=document.createElement("div");w.style.cssText=`padding:8px 12px;font-size:12px;color:${n.fgMuted};display:none;text-align:center;`,w.textContent="No tokens found",S.appendChild(w),i.appendChild(S);function I(){D.innerHTML="";let y=t.searchQuery.toLowerCase(),v=0;for(let z=0;z<l.length;z++){let B=l[z];if(y&&!B.toLowerCase().includes(y))continue;v++;let Q=h.has(z),_=Gn(z,B,Q,e.darkMode,()=>{let V=new Set(h);Q?V.delete(z):V.add(z),p(Array.from(V))});D.appendChild(_)}w.style.display=v===0?"":"none"}function M(){t.isOpen||(t.isOpen=!0,S.style.display="",k.style.transform="rotate(180deg)",I())}function O(){t.isOpen&&(t.isOpen=!1,S.style.display="none",k.style.transform="",u.value="",t.searchQuery="")}function C(y){i.contains(y.target)||O()}return document.addEventListener("mousedown",C),t.isOpen&&(S.style.display="",k.style.transform="rotate(180deg)",u.value=t.searchQuery,I(),requestAnimationFrame(()=>{u.isConnected&&u.focus()})),()=>{document.removeEventListener("mousedown",C)}}function Un(i,e,t,n){let l=tt(t),h=j[i%j.length],d=document.createElement("div");d.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,d.addEventListener("mouseenter",()=>{d.style.background=l.chipHoverBg,d.style.borderColor=l.chipHoverBorder}),d.addEventListener("mouseleave",()=>{d.style.background=l.chipBg,d.style.borderColor=l.chipBorder});let p=document.createElement("span");p.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${h};`,d.appendChild(p);let s=document.createElement("span");s.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,s.innerHTML=ge(e),s.title=e,d.appendChild(s);let f=document.createElement("button");return f.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,f.innerHTML=Vn,f.addEventListener("mouseenter",()=>{f.style.color=l.badgeText}),f.addEventListener("mouseleave",()=>{f.style.color=l.fgMuted}),f.addEventListener("click",r=>{r.stopPropagation(),n()}),d.appendChild(f),d}function Gn(i,e,t,n,l){let h=tt(n),d=j[i%j.length],p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",p.addEventListener("mouseenter",()=>{p.style.background=h.hoverBg}),p.addEventListener("mouseleave",()=>{p.style.background="transparent"}),p.addEventListener("click",g=>{g.stopPropagation(),l()});let s=document.createElement("span");s.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${t?d:"transparent"};border:1.5px solid ${t?d:h.fgMuted};`,p.appendChild(s);let f=document.createElement("span");f.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t?h.fg:h.fgMuted};`,f.innerHTML=ge(e),f.title=e,p.appendChild(f);let r=i===0?"source pred":i===1?"target pred":null;if(r){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${h.badgeBg};color:${h.badgeText};border:1px solid ${h.badgeBorder};`,g.textContent=r,p.appendChild(g)}if(t){let g=document.createElement("span");g.style.cssText=`flex-shrink:0;font-size:10px;color:${h.selectedText};`,g.textContent="selected",p.appendChild(g)}return p}function nt(i,e){if(i.size!==e.size)return!1;for(let t of i)if(!e.has(t))return!1;return!0}var qn={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Yn=["probability","prob_diff","rank"],Re=class{constructor(e,t,n={}){this.modeButtons=new Map;this.container=e,this.allData=t,this.mode=n.mode??"probability",this.darkMode=n.darkMode??!1,this.transparentBackground=n.transparentBackground??!1,this.title=n.title,this.onTokenSelectionChange=n.onTokenSelectionChange,this.onModeChange=n.onModeChange;let l=t.tokenLabels?.length??t.lines?.length??0,h=n.defaultSelectedTokens??Array.from({length:Math.min(2,l)},(p,s)=>s);this.defaultTokens=new Set(h),this.selectedTokens=new Set(n.selectedTokens??h),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),e.appendChild(this.modeBar),this.tokenSelectorEl=zt(this.buildTokenSelectorConfig()),e.appendChild(this.tokenSelectorEl);let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new ce(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let t of Yn){let n=document.createElement("button");n.textContent=qn[t],this.applyModeButtonStyles(n,t===this.mode),n.addEventListener("click",()=>this.setMode(t)),n.addEventListener("mouseenter",()=>{t!==this.mode&&(n.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),n.addEventListener("mouseleave",()=>{t!==this.mode&&(n.style.background="transparent")}),e.appendChild(n),this.modeButtons.set(t,n)}return e}applyModeBarStyles(e){let t=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${t};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,t){let n=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${t?l:"transparent"};color:${t?"#fff":n};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,t]of this.modeButtons)this.applyModeButtonStyles(t,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),t=this.allData.tokenLabels??[],n=Array.from(this.selectedTokens).sort((d,p)=>d-p),l=this.mode==="rank";return{richLines:n.filter(d=>d<e.length).map(d=>({values:l?e[d].map(p=>p+1):e[d],label:t[d]??`Token ${d}`,color:j[d%j.length]}))}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let t=e.tokenLabels?.length??e.lines?.length??0;this.defaultTokens=new Set(Array.from({length:Math.min(2,t)},(l,h)=>h));let n=new Set([...this.selectedTokens].filter(l=>l<t));this.selectedTokens=n.size>0?n:new Set(this.defaultTokens),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let t=this.getModeLines().length,n=new Set(e.filter(l=>l<t));nt(n,this.selectedTokens)||(this.selectedTokens=n,Ee(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){Ot(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};function Xn(i){let e=typeof i=="string"?document.querySelector(i):i;return e||console.error("Container not found:",i),e}function ot(i,e,t){let n=Xn(i);if(!n)return null;let l=e(n);if(t===void 0){let h=Pe(n,p=>l.setThemeMode(p)),d=l.destroy.bind(l);l.destroy=()=>{h(),d()}}return l}function At(i,e,t){return new Ie(i,e,t)}function Ft(i,e,t){return ot(i,n=>new ce(n,e,{darkMode:pe(n),...t}),t?.darkMode)}var Bt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Qn(i){if(!/^#?[0-9a-fA-F]{6}$/.test(i))return[147,51,234];let e=i.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function Wt(i,e){if(typeof i.getCellValue=="function")return i;let t=i,n=t.values??[],l=t.texts,h=t.rowLabels??n.map((w,I)=>String(I)),d=t.colLabels??(n[0]??[]).map((w,I)=>String(I)),p=t.ramp??"purple",s=Bt[p]??(p[0]==="#"?p:Bt.purple),[f,r,g]=Qn(s),[L,u]=t.valueDomain??[0,1],k=u-L,S=e?38:255,D=w=>Math.max(0,Math.min(1,w));return{rows:h.map(w=>({label:w})),columns:d.map(w=>({label:w,value:0})),getCellValue:(w,I)=>{let M=n[w]?.[I]??0,O=D(k>0?(M-L)/k:M),C=v=>Math.round(S+(v-S)*O);return{text:l?l[w]?.[I]??"":Number.isInteger(M)?String(M):M.toFixed(2),value:M,color:`rgb(${C(f)}, ${C(r)}, ${C(g)})`,textColor:O>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function Nt(i,e,t){return ot(i,n=>{let l=t?.darkMode??pe(n),h=new ve(n,Wt(e,l),{darkMode:l,...t}),d=h.setThemeMode.bind(h);return h.setThemeMode=p=>{h.setData(Wt(e,p)),d(p)},h},t?.darkMode)}function Vt(i,e,t){return ot(i,n=>new Re(n,e,{darkMode:pe(n),...t}),t?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=At,window.LinePlotWidget=Ft,window.HeatmapTableWidget=Nt,window.ActivationPatchingWidget=Vt);return xn(Zn);})();
//# sourceMappingURL=charts.js.map
