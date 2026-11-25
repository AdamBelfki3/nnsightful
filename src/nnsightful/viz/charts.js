"use strict";var InterpTools=(()=>{var st=Object.defineProperty;var qn=Object.getOwnPropertyDescriptor;var Kn=Object.getOwnPropertyNames;var Qn=Object.prototype.hasOwnProperty;var Zn=(o,e)=>{for(var n in e)st(o,n,{get:e[n],enumerable:!0})},Jn=(o,e,n,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let l of Kn(e))!Qn.call(o,l)&&l!==n&&st(o,l,{get:()=>e[l],enumerable:!(t=qn(e,l))||t.enumerable});return o};var eo=o=>Jn(st({},"__esModule",{value:!0}),o);var Vo={};Zn(Vo,{ActivationPatchingWidget:()=>fn,HeatmapTableWidget:()=>mn,LinePlotWidget:()=>un,LogitLensWidget:()=>hn,captureElement:()=>Ve,snapshotChart:()=>dn});function zt(o){return o.completion&&o.completion.length?[...o.input,...o.completion]:o.input}function to(o){let e=o.positions,n=zt(o).length;if(!e||e.length===n&&e.every((a,r)=>a===r))return{data:o,computedRows:null};let t=new Array(n);e.forEach((a,r)=>{Number.isInteger(a)&&a>=0&&a<n&&r<o.tracked.length&&(t[a]=r)});let l=Array.from({length:n},(a,r)=>r),d=(a,r,p)=>{let f=t[r];return f!==void 0&&a&&f<a.length?a[f]:p()};return{data:{...o,positions:null,tracked:l.map(a=>d(o.tracked,a,()=>({}))),topk:o.topk.map(a=>l.map(r=>d(a,r,()=>[]))),entropy:o.entropy?o.entropy.map(a=>l.map(r=>d(a,r,()=>0))):o.entropy},computedRows:l.filter(a=>t[a]!==void 0)}}function Wt(o){let e=o.computedRows;if(!e)return[];let n=o.tokens.length,t=[],l=0;for(let d of[...e,n])d>l&&t.push({start:l,end:d-1,collapsed:!0,locked:!0,label:"not computed"}),l=d+1;return t}function at(o){let e=o;if(e.cells)return!e.tokens&&e.input&&(e.tokens=e.input),e.computedRows===void 0&&(e.computedRows=null),{normalized:e,v2Data:null};let{data:n,computedRows:t}=to(o),l=n.layers.length,d=zt(n),c=d.length,a=[];for(let p=0;p<c;p++){let f=[],m=n.tracked[p]??{};for(let L=0;L<l;L++){let s=n.topk[L]?.[p]??[],T=[];for(let H=0;H<s.length;H++){let E=s[H],y=m[E]||[],k=y[L]||0;T.push({token:E,prob:k,trajectory:y})}let D=T[0]||{token:"",prob:0,trajectory:[]};f.push({token:D.token,prob:D.prob,trajectory:D.trajectory,topk:T})}a.push(f)}return{normalized:{layers:n.layers,tokens:d,cells:a,meta:n.meta||{},computedRows:t},v2Data:n}}function Bt(){return typeof crypto<"u"&&crypto.randomUUID?"ll_"+crypto.randomUUID().replace(/-/g,"").slice(0,12):"ll_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function Ee(o){let e=document.createElement("div");return e.textContent=o,e.innerHTML}function no(o){let e=`#${o}`;return`
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
            /* Don't inherit a host's pre-wrap (e.g. a contenteditable editor),
               which would render the markup's whitespace as blank lines. */
            white-space: normal; word-break: normal;
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

        /* Static (report / snapshot): bare like fill mode, sized to content,
           and inert \u2014 the host frames it and owns any click. */
        ${e}.ll-static {
            border: none; border-radius: 0; box-shadow: none;
            background: transparent; padding: 0;
            pointer-events: none;
        }
        ${e}.ll-static .ll-skyline { cursor: default; }
        ${e}.ll-static .ll-skyline-handle { display: none; }

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
        ${e} .ll-nav.ll-hidden { display: none; }
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
    `}function Nt(o){let e=document.createElement("style");return e.textContent=no(o),document.head.appendChild(e),e}function dt(o,e,...n){let t=l=>{e?l.classList.add("ll-dark"):l.classList.remove("ll-dark")};t(o),e?o.style.colorScheme="dark":o.style.colorScheme="";for(let l of n)l&&t(l)}var Be=["#2196F3","#e91e63","#4CAF50","#FF9800","#9C27B0","#00BCD4","#F44336","#8BC34A"],ct=[{dash:"",name:"solid"},{dash:"8,4",name:"dashed"},{dash:"2,3",name:"dotted"},{dash:"8,4,2,4",name:"dash-dot"}];var K=["#6366f1","#f43f5e","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16"];var be=class{static labelled(e){return e.some(n=>!!n.label)}static labelAt(e,n){return e?.find(t=>t.start<=n&&n<=t.end)?.label}static layout(e,n,t,l,d){if(t<=n)return[];let c=l+d,a=r=>Math.min(c,Math.max(l,l+(r-n)/(t-n)*d));return e.flatMap((r,p)=>{let f=a(r.start-.5),m=a(r.end+.5);if(m<=f)return[];let L=(r.dividers??[]).filter(s=>s>r.start&&s<=r.end).map(s=>a(s-.5)).filter(s=>s>f&&s<m);return[{x0:f,x1:m,label:r.label,tinted:p%2===1,dividers:L}]})}static draw(e,n,t,l,d){if(n.length!==0){e.save(),e.fillStyle=d?"rgba(255,255,255,0.045)":"rgba(0,0,0,0.035)";for(let c of n)c.tinted&&e.fillRect(c.x0,t,c.x1-c.x0,l);e.strokeStyle=d?"rgba(255,255,255,0.14)":"rgba(0,0,0,0.12)",e.lineWidth=1,e.setLineDash([2,3]);for(let c of n.flatMap(a=>a.dividers))e.beginPath(),e.moveTo(Math.round(c)+.5,t),e.lineTo(Math.round(c)+.5,t+l),e.stroke();e.setLineDash([]),e.fillStyle=d?"#71717a":"#a1a1aa",e.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",e.textAlign="center",e.textBaseline="bottom";for(let c of n){if(!c.label)continue;let a=c.label.toUpperCase();e.measureText(a).width>c.x1-c.x0-4||e.fillText(a,(c.x0+c.x1)/2,t-5)}e.restore()}}};be.LABEL_ROOM=16;function $e(o){return o.richLines&&o.richLines.length>0?o.richLines.map((n,t)=>({values:n.values,label:n.label??`Line ${t+1}`,color:n.color,dashPattern:n.dashPattern,isOverlay:n.isOverlay,removable:n.removable})):(o.lines??[]).map((n,t)=>({values:n,label:o.labels?.[t]??`Line ${t+1}`}))}function Ce(o){if(!o)return"";let e=[],n=0;o.startsWith(" ")&&(e.push('<span style="color:#3b82f6">_</span>'),n=1);let t="";for(;n<o.length;n++){let l=o[n];l===`
`?(t&&(e.push(Ge(t)),t=""),e.push('<span style="color:#3b82f6">\\n</span>')):t+=l}return t&&e.push(Ge(t)),e.join("")}function Ge(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function oo(o){if(o>=.95)return 1;let e=[.003,.005,.01,.02,.03,.05,.1,.2,.3,.5,1];for(let n of e)if(o<=n)return n;return 1}function Ft(o,e,n){let t=$e(o),l=t.length>0?t[0].values.length:n?.values.length??o.xLabels?.length??0;if(l===0)return null;let d=e.mode||"probability",c=e.minValue,a=e.maxValue;if(c===void 0||a===void 0||e.autoScale){let r=[];for(let m of t)if(!m.isOverlay)for(let L of m.values)L!==null&&r.push(L);if(n)for(let m of n.values)m!==null&&r.push(m);if(r.length===0)return{numLayers:l,minValue:e.logScale?1:0,maxValue:1,numLines:t.length};let p=1/0,f=-1/0;for(let m of r)m<p&&(p=m),m>f&&(f=m);if(e.centerYAxisAtZero){let L=Math.max(Math.abs(p),Math.abs(f))*1.1;c=-L,a=L}else if(e.logScale){if(c===void 0&&(c=Math.max(1,Math.floor(p))),a===void 0||e.autoScale){let m=Math.log(Math.max(1,p)),L=Math.log(Math.max(1,f)),s=L+.15*Math.max(1,L-m);a=Math.ceil(Math.exp(s))}}else c===void 0&&(c=d==="probability"?0:d==="rank"?Math.max(1,Math.floor(p)):Math.floor(p*.9)),(a===void 0||e.autoScale)&&(d==="rank"?a=Math.ceil(f*1.1):d==="probability"?a=e.autoScale?oo(Math.max(f,.001)):Math.min(f*1.1,1):a=f*1.1)}return{numLayers:l,minValue:c,maxValue:a,numLines:t.length}}function Vt(o,e,n,t,l,d,c,a){let r=o.getContext("2d"),p=e.getBoundingClientRect(),f=t.pixelRatio??(window.devicePixelRatio||1);o.width=p.width*f,o.height=p.height*f,o.style.width=`${p.width}px`,o.style.height=`${p.height}px`,r.scale(f,f);let m=p.width,L=p.height,s=t.darkMode??!1,T=t.title,D=t.mode||"probability",H=t.invertYAxis??!1,E=t.centerYAxisAtZero??!1,y=t.logScale??!1,k=t.xAxisLabel||"Layer",w=t.yAxisLabel||"Probability",I=t.xRangeStart??0;I>=l.numLayers-1&&(console.warn(`xRangeStart (${I}) is >= numLayers-1 (${l.numLayers-1}), clamping to 0`),I=0);let M=t.showDataPoints??!0,N=n.sections??[],S={top:(T?48:24)+(be.labelled(N)?be.LABEL_ROOM:0),right:24,bottom:56,left:72},F=m-S.left-S.right,_=L-S.top-S.bottom,Q={margin:S,chartWidth:F,chartHeight:_,width:m,height:L},q={background:s?"#0a0a0a":"#fafafa",text:"#71717a",textMuted:s?"#52525b":"#a1a1aa",grid:s?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)",axis:s?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)",titleText:s?"#e4e4e7":"#27272a"};t.transparentBackground?r.clearRect(0,0,m,L):(r.fillStyle=q.background,r.fillRect(0,0,m,L)),T&&(r.fillStyle=q.titleText,r.font="500 14px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="left",r.fillText(T,S.left,28));let ce=l.numLayers-1-I,oe=v=>ce<=0?S.left+F/2:S.left+(v-I)/ce*F,se=y?Math.log(Math.max(1,l.minValue)):0,Z=y?Math.log(Math.max(1,l.maxValue)):0,J=v=>{let C;if(y){let O=Math.log(Math.max(1,v));C=Z-se>0?(O-se)/(Z-se):.5}else C=(v-l.minValue)/(l.maxValue-l.minValue);return H?S.top+C*_:S.top+_-C*_};be.draw(r,be.layout(N,I,l.numLayers-1,S.left,F),S.top,_,s),r.setLineDash([4,4]),r.strokeStyle=q.grid,r.lineWidth=1;let ae=[],Re=l.maxValue-l.minValue,g=5;if(y){let v=new Set;for(let ie=0;ie<g;ie++){let V=se+ie/(g-1)*(Z-se),ee=Math.round(Math.exp(V));v.has(ee)||(v.add(ee),ae.push(ee))}let C=Math.round(Math.exp(se)),O=Math.round(Math.exp(Z));v.has(C)||ae.unshift(C),v.has(O)||ae.push(O)}else if(D==="rank")for(let v=0;v<g;v++)ae.push(Math.round(l.minValue+v/(g-1)*Re));else for(let v=0;v<g;v++)ae.push(l.minValue+v/(g-1)*Re);if(ae.forEach(v=>{let C=J(v);r.beginPath(),r.moveTo(S.left,C),r.lineTo(S.left+F,C),r.stroke()}),r.setLineDash([]),E){let v=J(0);r.beginPath(),r.strokeStyle=s?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.3)",r.lineWidth=1.5,r.moveTo(S.left,v),r.lineTo(S.left+F,v),r.stroke(),r.lineWidth=1}r.fillStyle=q.text,r.font="400 11px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="right",r.textBaseline="middle",ae.forEach(v=>{let C=J(v),O;D==="probability"?O=v.toFixed(2):D==="prob_diff"?O=v>=0?`+${v.toFixed(2)}`:v.toFixed(2):O=Math.round(v).toString(),r.fillText(O,S.left-16,C)}),r.textAlign="center",r.textBaseline="top";let R=n.xLabels&&n.xLabels.length>0,z=Math.max(1,Math.ceil(l.numLayers/8));for(let v=0;v<l.numLayers;v+=z){let C=oe(v);if(C<S.left-5||C>S.left+F+5)continue;let O=R?String(n.xLabels[v]??v):v.toString();r.fillText(O,C,S.top+_+12)}if((l.numLayers-1)%z!==0){let v=R?String(n.xLabels[l.numLayers-1]??l.numLayers-1):(l.numLayers-1).toString();r.fillText(v,oe(l.numLayers-1),S.top+_+12)}r.strokeStyle=s?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.25)",r.lineWidth=1.5,r.beginPath(),r.moveTo(S.left,S.top),r.lineTo(S.left,S.top+_),r.lineTo(S.left+F,S.top+_),r.stroke(),r.fillStyle=q.textMuted,r.font="500 10px 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",r.textAlign="center",r.textBaseline="top",r.fillText(k.toUpperCase(),S.left+F/2,L-16),r.save(),r.translate(14,S.top+_/2),r.rotate(-Math.PI/2),r.textAlign="center",r.textBaseline="top",r.fillText(w.toUpperCase(),0,0),r.restore();let W=$e(n);function P(v,C,O,ie,V){r.beginPath(),r.strokeStyle=C,r.lineWidth=O,V!==void 0&&(r.globalAlpha=V),ie?r.setLineDash(ie.split(",").map(Number)):r.setLineDash([]);let ee=!1;for(let X=0;X<v.length;X++){let j=v[X];if(j===null){ee=!1;continue}let Se=oe(X),we=J(j);ee?r.lineTo(Se,we):(r.moveTo(Se,we),ee=!0)}r.stroke(),r.setLineDash([]),V!==void 0&&(r.globalAlpha=1)}let de=s?"#3f3f46":"#d4d4d8";if(r.lineCap="round",r.lineJoin="round",W.forEach((v,C)=>{!d.has(C)||v.isOverlay||P(v.values,de,2,void 0,.35)}),W.forEach((v,C)=>{if(d.has(C)||v.isOverlay)return;let O=v.color??K[C%K.length];P(v.values,O,4,v.dashPattern,.15),P(v.values,O,2,v.dashPattern),M&&v.values.forEach((ie,V)=>{if(ie===null)return;let ee=oe(V),X=J(ie),j=c?.lineIdx===C&&c?.layerIdx===V;r.beginPath(),r.strokeStyle=O,r.lineWidth=j?2:1.5,r.arc(ee,X,j?5:3.5,0,Math.PI*2),r.stroke(),r.beginPath(),r.fillStyle=s?"#18181b":"#ffffff",r.arc(ee,X,j?3.5:2.5,0,Math.PI*2),r.fill()})}),W.forEach((v,C)=>{if(!v.isOverlay||d.has(C))return;let O=v.color??"#999";P(v.values,O,1.5,v.dashPattern??"4,2",.7)}),a){let v=a.color??"#999";P(a.values,v,1.5,a.dashPattern??"4,2",.7)}return Q}function jt(o){let e=document.createElement("div");return e.style.cssText="position:absolute;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.1s;transform-origin:center center;",o.appendChild(e),e}function Ut(o,e,n,t,l,d,c,a,r){let{margin:p,chartWidth:f,chartHeight:m}=l,L=t.xRangeStart??0,s=c-1-L,T=t.logScale?Math.log(Math.max(1,a)):0,D=t.logScale?Math.log(Math.max(1,r)):0;if(o<p.left||o>p.left+f||e<p.top||e>p.top+m)return null;let H=$e(n),E=null,y=1/0,k=20;for(let w=0;w<H.length;w++){if(d.has(w))continue;let I=H[w];if(!I.isOverlay)for(let M=0;M<I.values.length;M++){let N=I.values[M];if(N===null)continue;let S=s<=0?p.left+f/2:p.left+(M-L)/s*f,F;if(t.logScale){let q=Math.log(Math.max(1,N));F=D-T>0?(q-T)/(D-T):.5}else F=(N-a)/(r-a);let _=t.invertYAxis?p.top+F*m:p.top+m-F*m,Q=Math.sqrt((o-S)**2+(e-_)**2);Q<y&&Q<k&&(y=Q,E={visible:!0,x:S,y:_,lineIdx:w,layerIdx:M,value:N,label:I.label,color:I.color??K[w%K.length]})}}return E}function pt(o,e,n,t,l,d,c,a){if(!e){o.style.opacity="0";return}let r=t?"#27272a":"#fff",p=t?"#3f3f46":"#e4e4e7",f=t?"#fafafa":"#18181b",m=t?"#a1a1aa":"#71717a",s=e.x>n/2?"calc(-100% - 12px)":"12px";o.style.cssText=`position:absolute;pointer-events:none;z-index:50;opacity:1;left:${e.x}px;top:${e.y}px;transform:translate(${s},-50%);`;let T=String(l?l[e.layerIdx]??e.layerIdx:e.layerIdx),D=be.labelAt(a,e.layerIdx),H=D?`<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px;">
                    <span style="color:${m}">Section</span>
                    <span style="font-weight:500;color:${f}">${Ge(D)}</span>
                </div>`:"";o.innerHTML=`
        <div style="background:${r};border:1px solid ${p};border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);padding:8px 12px;min-width:120px;backdrop-filter:blur(8px);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${e.color};flex-shrink:0;"></span>
                <span style="font-size:12px;font-weight:500;color:${f};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px;">${Ce(e.label)}</span>
            </div>
            <div style="font-size:11px;">
                ${H}
                <div style="display:flex;justify-content:space-between;gap:16px;">
                    <span style="color:${m}">${d??"Layer"}</span>
                    <span style="font-weight:500;color:${f}">${T}</span>
                </div>
                <div style="display:flex;justify-content:space-between;gap:16px;margin-top:2px;">
                    <span style="color:${m}">Value</span>
                    <span style="font-weight:500;color:${f}">${c==="rank"?Math.round(e.value).toString():e.value.toFixed(4)}</span>
                </div>
            </div>
        </div>`}var io='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',lo='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>',ro='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function Gt(o){let e=document.createElement("div");return Xt(e,o),e}function Xt(o,e){let n=e?"rgba(24,24,27,0.7)":"rgba(255,255,255,0.7)",t=e?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";o.style.cssText=`flex-shrink:0;display:flex;flex-direction:column;gap:2px;padding:6px 4px;border-radius:6px;background:${n};backdrop-filter:blur(12px);border:1px solid ${t};align-self:flex-start;`}function Yt(o,e,n,t,l,d){Xt(o,t),o.innerHTML="";let c=t?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",a=t?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)",r=t?"#a1a1aa":"#71717a",p=t?"#3f3f46":"#d4d4d8",f="rgba(161,161,170,0.3)",m=t?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",L=d?$e(d):[];e.forEach((s,T)=>{let D=L[T];if(D?.isOverlay)return;let H=D?.color??K[T%K.length],E=n.has(T),y=D?.removable??!1,k=document.createElement(l?"button":"div");k.style.cssText=`display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;border:none;background:transparent;cursor:${l?"pointer":"default"};transition:all 0.15s;opacity:${E?"0.5":"1"};`,l&&(k.addEventListener("mouseenter",()=>{k.style.background=m}),k.addEventListener("mouseleave",()=>{k.style.background="transparent"}),k.addEventListener("click",()=>l.onToggle(T)));let w=document.createElement("span");w.style.cssText=`display:block;width:10px;height:10px;border-radius:50%;flex-shrink:0;border:1.5px solid ${E?f:H};background:${E?p:"transparent"};`,k.appendChild(w);let I=document.createElement("span");if(I.style.cssText=`font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;transition:color 0.15s;color:${E?a:c};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`,I.title=s,I.innerHTML=Ce(s),k.appendChild(I),!l){o.appendChild(k);return}if(y&&l.onRemove){let M=document.createElement("span");M.style.cssText=`margin-left:auto;cursor:pointer;color:${r};opacity:0;display:flex;align-items:center;transition:opacity 0.15s;padding:2px;`,M.innerHTML=ro,M.title="Remove",M.addEventListener("click",N=>{N.stopPropagation(),l.onRemove(T)}),k.appendChild(M),k.addEventListener("mouseenter",()=>{M.style.opacity="0.6"}),k.addEventListener("mouseleave",()=>{M.style.opacity="0"})}else{let M=document.createElement("span");M.style.cssText=`margin-left:auto;transition:opacity 0.15s;color:${r};opacity:${E?"0.6":"0"};display:flex;align-items:center;`,M.innerHTML=E?lo:io,k.appendChild(M),E||(k.addEventListener("mouseenter",()=>{M.style.opacity="0.4"}),k.addEventListener("mouseleave",()=>{M.style.opacity="0"}))}o.appendChild(k)})}var ke=class{constructor(e,n,t={}){this.hiddenLines=new Set;this.tooltip=null;this.geometry=null;this.config=null;this.destroyed=!1;this.lastWidth=0;this.lastHeight=0;this.overlay=null;this.handleMouseMove=e=>{if(!this.config||!this.geometry)return;let n=this.canvas.getBoundingClientRect(),t=e.clientX-n.left,l=e.clientY-n.top;this.tooltip=Ut(t,l,this.data,this.options,this.geometry,this.hiddenLines,this.config.numLayers,this.config.minValue,this.config.maxValue),pt(this.tooltipEl,this.tooltip,this.geometry.width,this.options.darkMode??!1,this.data.xLabels,this.options.xAxisLabel,this.options.mode,this.data.sections),this.draw()};this.handleMouseLeave=()=>{this.tooltip=null,pt(this.tooltipEl,null,0,!1),this.draw()};this.container=e,this.data=n,this.options={darkMode:!1,...t},e.style.display="flex",e.style.width="100%",e.style.height="100%",e.style.minHeight||(e.style.minHeight="300px"),e.style.gap="12px",e.style.fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",e.style.overflow="hidden",this.chartContainer=document.createElement("div"),this.chartContainer.style.cssText="position:relative;flex:1;min-width:0;overflow:hidden;",e.appendChild(this.chartContainer);let l=this.options.interactive!==!1;this.canvas=document.createElement("canvas"),this.canvas.style.cssText=`display:block;width:100%;height:100%;cursor:${l?"crosshair":"default"};`,this.chartContainer.appendChild(this.canvas),this.tooltipEl=jt(this.chartContainer),this.legendEl=Gt(this.options.darkMode??!1),this.options.legendPosition==="none"&&(this.legendEl.style.display="none"),e.appendChild(this.legendEl),l&&(this.canvas.addEventListener("mousemove",this.handleMouseMove),this.canvas.addEventListener("mouseleave",this.handleMouseLeave)),this.resizeObserver=new ResizeObserver(d=>{if(this.destroyed)return;let c=d[0];if(!c)return;let a=Math.round(c.contentRect.width),r=Math.round(c.contentRect.height);a===this.lastWidth&&r===this.lastHeight||(this.lastWidth=a,this.lastHeight=r,this.draw())}),this.resizeObserver.observe(this.chartContainer),this.draw(),this.updateLegendUI()}getLabels(){return this.data.richLines&&this.data.richLines.length>0?this.data.richLines.map((e,n)=>e.label??`Line ${n+1}`):this.data.labels||(this.data.lines??[]).map((e,n)=>`Line ${n+1}`)}draw(){this.config=Ft(this.data,this.options,this.overlay),this.config&&(this.geometry=Vt(this.canvas,this.chartContainer,this.data,this.options,this.config,this.hiddenLines,this.tooltip,this.overlay))}updateLegendUI(){if(this.options.legendPosition==="none"){this.legendEl.style.display="none";return}let e=this.getLabels();if(e.length===0){this.legendEl.style.display="none";return}this.legendEl.style.display="";let n=this.options.interactive===!1?null:{onToggle:t=>this.toggleLine(t),onRemove:this.options.onLineRemoved?t=>{this.removeLine(t,!0),this.draw(),this.updateLegendUI(),this.options.onLineRemoved(t)}:void 0};Yt(this.legendEl,e,this.hiddenLines,this.options.darkMode??!1,n,this.data)}setData(e){this.data=e,this.hiddenLines.clear(),this.tooltip=null,this.overlay=null,this.draw(),this.updateLegendUI()}setOptions(e){this.options={...this.options,...e},e.legendPosition!==void 0&&(e.legendPosition==="none"?this.legendEl.style.display="none":this.legendEl.style.display=""),this.draw(),this.updateLegendUI()}setThemeMode(e){this.options.darkMode=e,this.draw(),this.updateLegendUI()}toggleLine(e){this.hiddenLines.has(e)?this.hiddenLines.delete(e):this.hiddenLines.add(e),this.draw(),this.updateLegendUI()}addLine(e){return this.data.richLines||(this.data.richLines=(this.data.lines??[]).map((n,t)=>({values:n,label:this.data.labels?.[t]}))),this.data.richLines.push(e),this.draw(),this.updateLegendUI(),this.data.richLines.length-1}removeLine(e,n=!1){this.data.richLines?this.data.richLines.splice(e,1):(this.data.lines?.splice(e,1),this.data.labels&&this.data.labels.splice(e,1));let t=new Set;for(let l of this.hiddenLines)l<e?t.add(l):l>e&&t.add(l-1);this.hiddenLines=t,n||(this.draw(),this.updateLegendUI())}setOverlay(e){this.overlay=e,this.draw()}destroy(){this.destroyed=!0,this.resizeObserver.disconnect(),this.canvas.removeEventListener("mousemove",this.handleMouseMove),this.canvas.removeEventListener("mouseleave",this.handleMouseLeave),this.container.innerHTML=""}};function me(o){if(typeof document>"u")return String(o??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]);let e=document.createElement("div");return e.textContent=String(o??""),e.innerHTML}function Xe(o){return o==null?"":o.startsWith(" ")?'<span class="hmx-lead-space">_</span>'+me(o.slice(1)):me(o)}function so(o){let e=`#${o}`;return`
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
            white-space: normal; word-break: normal;
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
        /* Locked band: a static, faintly hatched seam \u2014 no hover, no pointer. */
        ${e} .hmx-collapsed-locked,
        ${e} .hmx-collapsed-locked:hover {
            cursor: default; color: var(--hmx-text-muted);
            background: repeating-linear-gradient(135deg,
                var(--hmx-surface-2) 0 5px, var(--hmx-surface) 5px 10px);
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

        /* static: a picture of the grid \u2014 no hover outline, pointer cursors
           or band hover states. */
        ${e}.hmx-static .hmx-frame { pointer-events: none; }

        /* Scrollable row window: the viewport scrolls (also on a static table)
           and snaps to whole rows; a static table's content stays inert. */
        ${e}.hmx-window-scroll .hmx-scroll {
            overflow-y: auto; scroll-snap-type: y mandatory; pointer-events: auto;
            /* Reaching the first / last row doesn't scroll the page instead. */
            overscroll-behavior: contain;
        }
        /* Not scrollable right now: the pointer goes through to the page. */
        ${e}.hmx-window-scroll.hmx-window-inert .hmx-scroll { pointer-events: none; }
        ${e}.hmx-static.hmx-window-scroll .hmx-grid-inner { pointer-events: none; }
        ${e}.hmx-window-scroll .hmx-row,
        ${e}.hmx-window-scroll .hmx-collapsed { scroll-snap-align: start; }
    `}function qt(o){if(typeof document>"u")return{};let e=document.createElement("style");return e.textContent=so(o),document.head.appendChild(e),e}var ao=0,Ne=16,ht=20,Kt=7,De=class o{constructor(e,n,t={}){this.destroyed=!1;this.hoverCell=null;this.resizeObserver=null;this.reflowRaf=0;this.lastVisibleCols=[];this.lastRowH=0;this.pendingScroll=null;this.windowPlan=[];this.windowYs=[];this.windowHs=[];this.windowFrom=-1;this.lastWindowKey="";this.windowScrollTimer=null;this.onWindowScroll=()=>{this.windowPlan.length&&(this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.windowScrollTimer=setTimeout(()=>{if(this.windowScrollTimer=null,this.destroyed||!this.windowPlan.length)return;let e=this.scrollEl.scrollTop,n=this.windowYs.findIndex((d,c)=>d+this.windowHs[c]/2>e);n<0&&(n=this.windowYs.length-1);let{from:t,to:l}=o.windowItems(this.windowHs,n,this.options.rowWindow.height);Math.abs(this.scrollEl.scrollTop-this.windowYs[t])>1&&(this.scrollEl.scrollTop=this.windowYs[t]),this.windowFrom=t,this.reportWindow(this.windowPlan,t,l,"scroll")},150))};this.container=e,this.data=n,this.options={columnSizing:"fixed",cellWidth:48,minColumnWidth:48,rowSizing:"fixed",cellHeight:28,rowHeaderWidth:100,headerHeight:26,height:"content",chrome:"card",sampleColumns:"none",alwaysShowLastColumn:!1,darkMode:!1,showGrid:!0,interactive:!0,...t},this.uid="hmx_"+ ++ao+"_"+Date.now().toString(36),this.styleEl=qt(this.uid),e.innerHTML=`
            <div id="${this.uid}">
                <div class="hmx-frame">
                    <div class="hmx-hdr-fixed"></div>
                    <div class="hmx-scroll"></div>
                </div>
            </div>`.trim(),this.root=document.getElementById(this.uid),this.hdrEl=this.root.querySelector(".hmx-hdr-fixed"),this.scrollEl=this.root.querySelector(".hmx-scroll"),this.isInteractive()&&this.attachListeners(),this.scrollEl.addEventListener("scroll",this.onWindowScroll),this.render(),this.setupResponsive()}isInteractive(){return this.options.interactive!==!1}isResponsive(){let e=this.options;return e.columnSizing==="fit"||e.rowSizing==="fill"||e.height==="fill"||e.sampleColumns==="uniform"}setupResponsive(){!this.isResponsive()||typeof ResizeObserver>"u"||(this.scheduleReflow(),this.resizeObserver=new ResizeObserver(()=>this.scheduleReflow()),this.resizeObserver.observe(this.container))}scheduleReflow(){this.destroyed||typeof requestAnimationFrame>"u"||this.reflowRaf||(this.reflowRaf=requestAnimationFrame(()=>{this.reflowRaf=0,this.destroyed||this.render()}))}availWidth(){let e=this.scrollEl.clientWidth;if(e>0)return e;let n=this.container?.clientWidth??0;return n>0?n-34:720}resolveWindow(){let e=this.data.columns.length;if(e===0)return{start:0,size:0};let n=this.options.columnWindow;if(!n)return{start:0,size:e};let t=Math.max(1,Math.min(n.size,e));return{start:Math.max(0,Math.min(n.start,e-t)),size:t}}maxColsFit(){let e=this.options,n=e.minColumnWidth??48,t=e.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/n),d=e.maxVisibleColumns??Number.POSITIVE_INFINITY;return Math.max(1,Math.min(d,l))}resolveVisibleColumns(){let e=this.options,{start:n,size:t}=this.resolveWindow();if(e.sampleColumns!=="uniform"){let f=[];for(let m=0;m<t;m++)f.push(n+m);return f}let l=this.maxColsFit();if(t<=l){let f=[];for(let m=0;m<t;m++)f.push(n+m);return f}let d=!!e.alwaysShowLastColumn,c=Math.max(1,l-(d?1:0)),a=Math.ceil(t/c),r=[];for(let f=n;f<n+t;f+=a)r.push(f);let p=n+t-1;return d&&r[r.length-1]!==p&&r.push(p),r}resolveCellWidth(e){let n=this.options;if(n.columnSizing==="fit"&&e>0){let t=n.rowHeaderWidth??100,l=Math.floor((this.availWidth()-t)/e);return Math.max(n.minColumnWidth??1,l)}return n.cellWidth??48}resolveRowHeight(e,n=0){let t=this.options,l=t.cellHeight??28;if(t.rowSizing!=="fill"||e<=0)return l;let d=this.scrollEl.clientHeight-n;return e*l<d?Math.floor(d/e):l}render(){if(this.destroyed)return;this.hoverCell=null;let e=this.options,n=!!e.darkMode;this.root.classList.toggle("hmx-dark",n),this.root.classList.toggle("hmx-bare",e.chrome==="none"),this.root.classList.toggle("hmx-fill",e.height==="fill");let t=this.isInteractive();this.root.classList.toggle("hmx-static",!t);let l=e.rowHeaderWidth??100,d=e.headerHeight??26,c=this.data.columns,a=this.resolveVisibleColumns(),r=a.length,p=this.resolveCellWidth(r),f=this.data.rows,m=e.maxRows!=null?Math.min(f.length,e.maxRows):f.length,L=o.planRows(m,e.collapsedSections),s=0,T=0;for(let g of L)g.kind==="row"?s++:g.kind==="band"?T+=Ne:t&&(T+=ht);let D=this.resolveRowHeight(s,T),H=l+p*r,E=L.map(g=>g.kind==="row"?D:g.kind==="band"?Ne:t?ht:0),y=null;if(e.rowWindow&&E.reduce((g,R)=>g+R,0)>e.rowWindow.height){let g=L.findIndex(R=>o.itemRows(R)[1]>=e.rowWindow.start);y=o.windowItems(E,g<0?L.length-1:g,e.rowWindow.height)}let k=!!y&&e.rowWindowMode==="scroll",w=y&&!k?L.slice(y.from,y.to):L,I=w.filter(g=>g.kind==="row"),M=y&&!k?I[0]?.row??-1:0,N=y&&!k?I[I.length-1]?.row??-1:m-1,S=`${l}px repeat(${r}, ${p}px)`,F=e.showGrid?n?"border-right:1px solid rgba(0,0,0,0.28);border-bottom:1px solid rgba(0,0,0,0.22);":"border-right:1px solid rgba(255,255,255,0.55);border-bottom:1px solid rgba(255,255,255,0.45);":"",_=`<div class="hmx-hdr-row" style="display:grid;grid-template-columns:${S};height:${d}px;width:${H}px;min-width:${H}px;">`;_+=`<div class="hmx-corner">${me(e.cornerLabel??"")}</div>`;for(let g=0;g<r;g++)_+=`<div class="hmx-col">${Xe(c[a[g]].label)}</div>`;_+="</div>",this.hdrEl.innerHTML=_;let Q={};for(let g of e.rowHighlights??[]){let R=new Set(g.rows);for(let z of g.rows){let W=!R.has(z-1);Q[z]={color:g.color,className:g.className,top:W,bottom:!R.has(z+1),label:W?g.label:void 0}}}this.lastRowH=D;let q=g=>{let R=f[g].label,z=e.rowClassName?.(g),W=Q[g],P=W?" hmx-row-hl"+(W.top?" hmx-hl-top":"")+(W.bottom?" hmx-hl-bottom":"")+(W.className?" "+W.className:""):"",de=W?(W.color?` style="--hmx-hl:${me(W.color)}"`:"")+(W.label?` data-hl-label="${me(W.label)}"`:""):"",v=e.renderRowLabel?e.renderRowLabel(g):`<span class="hmx-cell-text">${Xe(R)}</span>`,C=`<div class="hmx-row${z?" "+z:""}${P}" data-rowwrap="${g}"${de}>`;C+=`<div class="hmx-row-grid" style="display:grid;grid-template-columns:${S};height:${D}px;">`,C+=`<div class="hmx-rowlabel" data-row="${g}" title="${me(R)}">${v}</div>`;for(let O=0;O<r;O++){let ie=a[O],V=this.data.getCellValue(g,ie),ee=V.highlighted&&V.highlightColor?`box-shadow:inset 0 0 0 2px ${V.highlightColor};`:"",X=V.bold?"font-weight:bold;":"",j=V.opacity!=null&&V.opacity<1?`opacity:${V.opacity};`:"",Se=g===M,we=g===N,pe=O===0,fe=O===r-1,te="";Se&&pe?te="border-top-left-radius:8px;":Se&&fe?te="border-top-right-radius:8px;":we&&pe?te="border-bottom-left-radius:8px;":we&&fe&&(te="border-bottom-right-radius:8px;"),C+=`<div class="hmx-cell${V.className?" "+V.className:""}" data-row="${g}" data-col="${ie}" style="background:${V.color};color:${V.textColor};padding:0 6px;${j}${F}${ee}${X}${te}"><span class="hmx-cell-text">${Xe(V.text)}</span></div>`}return C+="</div></div>",C},ce=(e.rowRegions??[]).filter(g=>g.start<=g.end),oe=ce.map(()=>({top:-1,bottom:-1})),se=(g,R,z,W)=>{for(let P=0;P<ce.length;P++)R>=ce[P].start&&g<=ce[P].end&&(oe[P].top<0&&(oe[P].top=z),oe[P].bottom=W)},Z=`<div class="hmx-grid-inner" style="width:${H}px;min-width:${H}px;">`,J=0,ae=[];for(let g of w){if(ae.push(J),g.kind==="band"){let R=g.end-g.start+1,z,W=!1;for(let O=g.start;O<=g.end;O++)if(Q[O]){W=!0,z=Q[O].color;break}let P=R===1?"":"s",de=`${R} row${P} ${me(g.label??"hidden")}`,v="hmx-collapsed"+(g.locked?" hmx-collapsed-locked":"")+(W?" hmx-collapsed-hl":""),C=t&&!g.locked;Z+=`<div class="${v}"${C?` data-cs="${g.index}"`:""} data-count="${g.shown}" style="width:${H}px;min-width:${H}px;height:${Ne}px;${z?`--hmx-hl:${me(z)};`:""}" title="${C?`Click to show ${R} hidden row${P}`:de}"><span class="hmx-collapsed-inner">\u2026 ${de}</span></div>`,se(g.start,g.end,J,J+Ne),J+=Ne;continue}if(g.kind==="handle"){if(!t)continue;let R=g.end-g.start+1;Z+=`<div class="hmx-expanded-toggle" data-cs="${g.index}" data-count="${g.shown}" style="width:${H}px;min-width:${H}px;" title="Collapse these ${R} rows"><span>\u2303 collapse ${R} row${R===1?"":"s"}</span><span class="hmx-toggle-x" title="Remove \u2014 keep these rows expanded">\xD7</span></div>`,J+=ht;continue}Z+=q(g.row),se(g.row,g.row,J,J+D),J+=D}for(let g=0;g<ce.length;g++){let R=oe[g];if(R.top<0||R.bottom<=R.top)continue;let z=ce[g],W=z.color?`--hmx-region:${me(z.color)};`:"",P=R.top+Kt,de=Math.max(0,R.bottom-R.top-2*Kt);de<=0||(Z+=`<div class="hmx-region-rail" style="top:${P}px;height:${de}px;${W}"></div>`,z.label&&(Z+=`<div class="hmx-region-label" style="top:${P}px;height:${de}px;${W}">${me(z.label)}</div>`))}Z+="</div>";let Re=this.scrollEl.scrollTop;if(this.scrollEl.innerHTML=Z,this.root.classList.toggle("hmx-window-scroll",k),this.root.classList.toggle("hmx-window-inert",k&&e.rowWindowScrollable===!1),this.scrollEl.style.maxHeight=k?`${e.rowWindow.height}px`:"",this.windowPlan=k?L:[],this.windowYs=k?ae:[],this.windowHs=k?E:[],k?(y.from!==this.windowFrom?this.scrollEl.scrollTop=ae[y.from]:this.scrollEl.scrollTop=Re,this.windowFrom=y.from):this.windowFrom=-1,y?this.reportWindow(L,y.from,y.to,"render"):e.rowWindow&&this.reportWindow(L,-1,-1,"render"),this.pendingScroll){let{scrollBefore:g,bandTop:R,delta:z}=this.pendingScroll;this.pendingScroll=null,this.scrollEl.scrollTop=Math.max(0,R<g?g+z:g)}e.onVisibleColumnsChange&&!co(a,this.lastVisibleCols)?(this.lastVisibleCols=a,e.onVisibleColumnsChange(a)):this.lastVisibleCols=a}reportWindow(e,n,t,l){let d=n<0?null:{start:o.itemRows(e[n])[0],end:o.itemRows(e[t-1])[1]},c=d?`${d.start}-${d.end}`:"none";c!==this.lastWindowKey&&(this.lastWindowKey=c,this.options.onRowWindowChange?.(d,l))}attachListeners(){this.scrollEl.addEventListener("mousemove",e=>{let n=e.target.closest(".hmx-cell");if(!n){this.clearHover();return}this.hoverCell!==n&&(this.hoverCell?.classList.remove("hmx-hover"),this.hoverCell=n,n.classList.add("hmx-hover"),this.options.onCellHover?.(parseInt(n.dataset.row),parseInt(n.dataset.col),e))}),this.scrollEl.addEventListener("mouseleave",()=>this.clearHover()),this.scrollEl.addEventListener("click",e=>{if(!(window.getSelection()?.isCollapsed??!0))return;let n=e.target,t=n.closest(".hmx-collapsed, .hmx-expanded-toggle");if(t){if(t.dataset.cs===void 0)return;let c=parseInt(t.dataset.cs);if(n.closest(".hmx-toggle-x")){this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:t.offsetTop,delta:-t.offsetHeight},this.options.onRemoveCollapse?.(c);return}let a=parseInt(t.dataset.count||"0"),r=t.classList.contains("hmx-collapsed"),p=this.lastRowH||28;this.pendingScroll={scrollBefore:this.scrollEl.scrollTop,bandTop:t.offsetTop,delta:r?a*p:-a*p},this.options.onToggleCollapse?.(c);return}let l=n.closest(".hmx-rowlabel");if(l){this.options.onRowHeaderClick?.(parseInt(l.dataset.row),e);return}let d=n.closest(".hmx-cell");d&&this.options.onCellClick?.(parseInt(d.dataset.row),parseInt(d.dataset.col),e)})}static itemRows(e){return e.kind==="row"?[e.row,e.row]:[e.start,e.end]}static windowItems(e,n,t){let l=e.length;if(l===0)return{from:0,to:0};let d=l;for(let r=0;d>0&&r+e[d-1]<=t;)r+=e[--d];let c=Math.max(0,Math.min(n,d,l-1)),a=c;for(let r=0;a<l&&(a===c||r+e[a]<=t);)r+=e[a++];return{from:c,to:a}}static planRows(e,n=[]){let t=n.map((r,p)=>({start:Math.max(0,r.start),end:Math.min(e-1,r.end),collapsed:r.collapsed!==!1,locked:!!r.locked,label:r.label,index:p})).filter(r=>r.start<=r.end),l=new Array(e);for(let r of t)if(r.locked)for(let p=r.start;p<=r.end;p++)l[p]??(l[p]=r);let d=(r,p)=>{let f=0;for(let m=r;m<=p;m++)l[m]||f++;return f},c=new Map;for(let r of t)r.locked||d(r.start,r.end)===0||c.has(r.start)||c.set(r.start,r);let a=[];for(let r=0;r<e;){let p=c.get(r);if(p?.collapsed){a.push({kind:"band",start:p.start,end:p.end,index:p.index,locked:!1,label:p.label,shown:d(p.start,p.end)}),r=p.end+1;continue}p&&a.push({kind:"handle",start:p.start,end:p.end,index:p.index,shown:d(p.start,p.end)});let f=l[r];if(f){let m=r;for(;m+1<e&&l[m+1]===f&&!c.has(m+1);)m++;a.push({kind:"band",start:r,end:m,index:f.index,locked:!0,label:f.label,shown:0}),r=m+1;continue}a.push({kind:"row",row:r}),r++}return a}clearHover(){this.hoverCell&&(this.hoverCell.classList.remove("hmx-hover"),this.hoverCell=null,this.options.onCellLeave?.())}setData(e){this.data=e,this.lastVisibleCols=[],this.render()}setOptions(e){let n=this.isResponsive();this.options={...this.options,...e},this.render(),!n&&this.isResponsive()&&this.setupResponsive()}setThemeMode(e){this.options.darkMode=e,this.render()}setCellWidth(e){this.options.cellWidth=e,this.render()}setRowHeaderWidth(e){this.options.rowHeaderWidth=e,this.render()}getTableElement(){return this.root}getTableWidth(){return this.root.offsetWidth}getScrollElement(){return this.scrollEl}scrollToRow(e){let n=this.scrollEl.querySelector(`[data-rowwrap="${e}"]`);if(!n)return;let t=n.offsetTop-this.scrollEl.clientHeight/2+n.offsetHeight/2;this.scrollEl.scrollTo({top:Math.max(0,t),behavior:"smooth"})}scrollToBottom(){this.scrollEl.scrollTop=this.scrollEl.scrollHeight}destroy(){this.destroyed=!0,this.reflowRaf&&typeof cancelAnimationFrame<"u"&&cancelAnimationFrame(this.reflowRaf),this.resizeObserver?.disconnect(),this.resizeObserver=null,this.windowScrollTimer&&clearTimeout(this.windowScrollTimer),this.scrollEl.removeEventListener("scroll",this.onWindowScroll),this.clearHover(),this.container.innerHTML="",this.styleEl.parentNode&&this.styleEl.parentNode.removeChild(this.styleEl)}};function co(o,e){if(o.length!==e.length)return!1;for(let n=0;n<o.length;n++)if(o[n]!==e[n])return!1;return!0}function ut(o){let e=o.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);if(e)return[Number(e[1]),Number(e[2]),Number(e[3]),e[4]!==void 0?Number(e[4]):1];let n=o.match(/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);if(n){let t=n[1],l,d,c,a=1;return t.length===3||t.length===4?(l=parseInt(t[0]+t[0],16),d=parseInt(t[1]+t[1],16),c=parseInt(t[2]+t[2],16),t.length===4&&(a=parseInt(t[3]+t[3],16)/255)):(l=parseInt(t.slice(0,2),16),d=parseInt(t.slice(2,4),16),c=parseInt(t.slice(4,6),16),t.length===8&&(a=parseInt(t.slice(6,8),16)/255)),[l,d,c,a]}return null}function mt(o){return!o||o[3]<.95?null:(.299*o[0]+.587*o[1]+.114*o[2])/255}function po(o){let e=o;for(;e;){let n=mt(ut(getComputedStyle(e).backgroundColor));if(n!==null)return n;e=e.parentElement}if(typeof document<"u")for(let n of[document.body,document.documentElement]){if(!n)continue;let t=mt(ut(getComputedStyle(n).backgroundColor));if(t!==null)return t}return null}function ho(){if(typeof document>"u")return null;let e=getComputedStyle(document.documentElement).getPropertyValue("--vscode-editor-background").trim();if(!e)return null;let n=mt(ut(e));return n===null?null:n<.5}function Ye(o,e){let n=Me(o),t=()=>{let c=Me(o);c!==n&&(n=c,e(c))},l=new MutationObserver(t);typeof document<"u"&&(l.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"]}),document.body&&l.observe(document.body,{attributes:!0,attributeFilter:["style","class"]}));let d=null;return typeof window<"u"&&window.matchMedia&&(d=window.matchMedia("(prefers-color-scheme: dark)"),d.addEventListener("change",t)),()=>{l.disconnect(),d?.removeEventListener("change",t)}}function Me(o){if(typeof document<"u"&&document.body?.dataset?.jpThemeLight!==void 0)return document.body.dataset.jpThemeLight==="false";if(typeof document<"u"&&document.body?.classList?.contains("dark"))return!0;let e=ho();if(e!==null)return e;let n=po(o??null);return n!==null?n<.5:!1}var uo=60,Qt=30,mo=22,fo=48,go=18,Zt={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"},bo="#cc6622";function xo(o){let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}var Jt=41;function ft(o,e,n){let[t,l,d]=xo(e),c=Math.pow(Math.max(0,Math.min(1,o)),1.1);if(n){let r=p=>Math.round(Jt+(p-Jt)*c);return`rgb(${r(t)}, ${r(l)}, ${r(d)})`}let a=r=>Math.round(255-(255-r)*c);return`rgb(${a(t)}, ${a(l)}, ${a(d)})`}function vo(o,e){return e?o>=.62?"#fff":o>=.32?"rgba(255,255,255,0.92)":"hsl(0 0% 80%)":o>=.62?"#fff":o>=.42?"rgba(255,255,255,0.92)":"hsl(0 0% 18%)"}function en(o){return o==null?"":o.startsWith(" ")?'<span class="ll-lead-space">_</span>'+Ee(o.slice(1)):Ee(o)}function He(o){return o==null?"":o.startsWith(" ")?"_"+o.slice(1):o}function qe(o){let e=o.trim();return e==="<bos>"||e==="<s>"||e==="<|endoftext|>"||e==="<|begin_of_text|>"}function tn(o,e,n,t){let l=Bt(),d=t?.interactive!==!1,c=d||t?.layerNavigator!==!1,a;if(typeof o=="string"?a=document.querySelector(o):o instanceof Element?a=o:a=null,!a)return console.error("Container not found:",o),null;let r=at(e),p=r.normalized,f=r.v2Data,m=Nt(l);function L(i){return i?i.map(h=>({token:h.tokens?.[0]??"",color:h.color})).filter(h=>h.token!==""):[]}let s={ramp:n?.ramp||"purple",showGrid:n?.showGrid??!0,dimLow:n?.dimLowProb??!0,selectedRow:n?.selectedRow??null,selectedLayerIdx:n?.selectedLayer??null,viewStart:n?.viewStart??0,viewSize:n?.viewSize??p.layers.length,darkModeOverride:n?.darkMode??null,pinned:L(n?.pinnedGroups),pinnedRows:(n?.pinnedRows??[]).map(i=>i.pos).filter(i=>typeof i=="number"),colorIndex:n?.colorIndex??0,openPopup:null,rowHighlights:n?.rowHighlights??[],collapsedSections:(n?.collapsedSections??[]).map(i=>({...i})),rowStart:n?.rowStart??null},T=null,D=!d&&!!t?.maxRows&&t.maxRows>0,H=null,E=t?.scrollRowsActive!==!1,y={};function k(i,h){(y[i]||[]).forEach(u=>u(h))}let w=p.layers.length,I=p.tokens.length,M=[],N="",S=new Set,F=[];function _(i){return i>=0&&i<I&&!S.has(i)}function Q(){w=p.layers.length,I=p.tokens.length,F=Wt(p),S=new Set;for(let b of F)for(let x=b.start;x<=b.end;x++)S.add(x);M=[];for(let b=0;b<w;b++){let x=0;for(let $=0;$<I;$++){let A=p.cells[$]?.[b];A&&A.prob>x&&(x=A.prob)}M.push(x)}let i=p.computedRows,h=i?i[i.length-1]??-1:I-1;N=p.cells[h]?.[w-1]?.token??"",s.pinnedRows=s.pinnedRows.filter(_),s.selectedRow!==null&&!_(s.selectedRow)&&(s.selectedRow=null),(s.viewSize>w||s.viewSize<1)&&(s.viewSize=w);let u=Math.max(0,w-s.viewSize);s.viewStart>u&&(s.viewStart=u),s.viewStart<0&&(s.viewStart=0)}Q();function q(i){let h=s.pinned.find(u=>u.token===i);return h?h.color:null}function ce(i){let h=s.pinned.findIndex(u=>u.token===i);h>=0?s.pinned.splice(h,1):(s.pinned.push({token:i,color:Be[s.colorIndex%Be.length]}),s.colorIndex++)}function oe(i,h){let u=f?.tracked?.[i];if(u&&Array.isArray(u[h]))return u[h];for(let b=0;b<w;b++){let x=p.cells[i]?.[b]?.topk.find($=>$.token===h);if(x)return x.trajectory}return null}function se(i){let h=s.pinnedRows.indexOf(i);return ct[(h<0?0:h)%ct.length]}function Z(i){return s.pinnedRows.indexOf(i)>=0}function J(i,h){for(let u of s.pinned){let b=oe(i,u.token);if(!b)continue;let x=0;for(let $ of b)$!=null&&$>x&&(x=$);if(x>=h)return!0}return!1}function ae(i){let h=null,u=0;for(let b=0;b<w;b++){let x=p.cells[i]?.[b];x&&x.prob>u&&(u=x.prob,h=x.token)}return u>=.05?h:null}function Re(i){if(!_(i))return;let h=s.pinnedRows.indexOf(i);if(h>=0){s.pinnedRows.splice(h,1);return}if(!J(i,.01)){let u=ae(i);u&&!q(u)&&(s.pinned.push({token:u,color:Be[s.colorIndex%Be.length]}),s.colorIndex++)}s.pinnedRows.push(i)}function g(){return Zt[s.ramp]||Zt.purple}function R(){return s.darkModeOverride!==null?s.darkModeOverride:Me(a)}let z=[];function W(){return z.length>1?Math.max(1,z[1]-z[0]):1}a.innerHTML=`
        <div id="${l}"${d?' tabindex="-1"':' class="ll-static"'}>
            <div class="ll-heatmap" id="${l}_heatmap"${d?' tabindex="0"':""}></div>
            <div class="ll-nav${c?"":" ll-hidden"}" id="${l}_nav"></div>
            <div class="ll-lineplot-wrap ll-hidden" id="${l}_lp_wrap">
                <div class="ll-lineplot-head">
                    <span class="ll-lineplot-title">trajectory</span>
                    <span class="ll-lineplot-token" id="${l}_lp_token"></span>
                </div>
                <div class="ll-lineplot-box" id="${l}_lp_box"><div class="ll-lineplot" id="${l}_lp"></div></div>
            </div>
            <div class="ll-tooltip" id="${l}_tt"></div>
            <div class="ll-popup" id="${l}_popup">
                <span class="ll-popup-close" id="${l}_popup_close">&times;</span>
                <div class="ll-popup-header" id="${l}_popup_hdr"></div>
                <div class="ll-popup-body" id="${l}_popup_body"></div>
            </div>
        </div>
    `.trim();let P=document.getElementById(l),de=document.getElementById(l+"_heatmap"),v=document.getElementById(l+"_nav"),C,O=document.getElementById(l+"_lp_wrap"),ie=document.getElementById(l+"_lp_token"),V=document.getElementById(l+"_lp_box"),ee=document.getElementById(l+"_lp"),X=document.getElementById(l+"_tt"),j=document.getElementById(l+"_popup"),Se=document.getElementById(l+"_popup_hdr"),we=document.getElementById(l+"_popup_body");d&&document.body.appendChild(j);let pe=null,fe=null,te=!0,Pe=!1,je=d?getComputedStyle(P).getPropertyValue("--ll-aspect-ratio").trim():"unbounded",_e=!je;_e&&P.classList.add("ll-fill");let ze=(()=>{if(!je||/^(unbounded|none|auto)$/i.test(je))return null;let i=je.split("/").map(h=>parseFloat(h.trim()));return i.length!==2||isNaN(i[0])||isNaN(i[1])||i[0]===0||i[1]===0?null:i[1]/i[0]})();function gn(i,h){let u=h?"#bbb":"#555",b=i?` stroke-dasharray="${Ee(i)}"`:"";return`<svg class="ll-row-style" width="16" height="8" viewBox="0 0 16 8"><line x1="0" y1="4" x2="16" y2="4" stroke="${u}" stroke-width="1.5"${b}/></svg>`}function kt(){return{rows:p.tokens.map(i=>({label:i})),columns:p.layers.map(i=>({label:String(i),value:0})),getCellValue:(i,h)=>{let u=p.cells[i][h],b=u.prob,x=R(),$=N!==""&&u.token===N,A=q(u.token),B=b<.18;return{text:u.token,value:b,color:ft(b,$?bo:g(),x),textColor:vo(b,x),highlighted:!!A,highlightColor:A??void 0,opacity:s.dimLow&&B?.55:void 0}}}}function bn(i){let h=p.tokens[i],u=i===s.selectedRow||Z(i),b=d?`<span class="ll-fold-handle${T===i?" ll-armed":""}" title="Fold rows: click / shift-click, then pick another row">\u229F</span>`:"";return Z(i)&&(b+=gn(se(i).dash,R())),b+=qe(h)?'<span class="ll-bos-pill">bos</span>':`<span class="hmx-cell-text"${u?' style="font-weight:600"':""}>${en(h)}</span>`,b}function xn(i){return"ll-hmx-row"+(i===s.selectedRow||Z(i)?" ll-hmx-active":"")+(wn(i)?" ll-gen-row":"")}function vn(){let i=f?.completion;return i&&i.length?p.tokens.length-i.length:p.tokens.length}function wn(i){return i>=vn()}function yn(i,h){let u=Math.min(i,h),b=Math.max(i,h);s.collapsedSections=s.collapsedSections.filter(x=>x.end<u||x.start>b).concat({start:u,end:b,collapsed:!0}).sort((x,$)=>x.start-$.start)}function Ln(i){T===null?(T=i,U()):T===i?(T=null,U()):(yn(T,i),T=null,U(),he())}function Mt(){let i={interactive:d,columnSizing:"fit",minColumnWidth:fo,maxVisibleColumns:go,sampleColumns:"uniform",alwaysShowLastColumn:!0,columnWindow:{start:We(s.viewStart),size:s.viewSize},rowSizing:_e?"fill":"fixed",cellHeight:Qt,rowHeaderWidth:uo,headerHeight:mo+6,height:_e||ze!=null?"fill":"content",chrome:"none",cornerLabel:"token",showGrid:s.showGrid,darkMode:R(),renderRowLabel:bn,rowClassName:xn,rowHighlights:s.rowHighlights,collapsedSections:F.length?s.collapsedSections.concat(F):s.collapsedSections,onVisibleColumnsChange:h=>{z=h},...D?{rowWindow:{start:kn(),height:t.maxRows*Qt},rowWindowMode:t?.scrollRows?"scroll":"clip",rowWindowScrollable:E,onRowWindowChange:(h,u)=>{H=h?{...h,total:I}:null,u==="scroll"&&h&&(s.rowStart=h.start),k("rowWindowChange",{window:H,source:u})}}:{}};return d?{...i,onToggleCollapse:h=>{let u=s.collapsedSections[h];u&&(u.collapsed=u.collapsed===!1,U(),he())},onRemoveCollapse:h=>{s.collapsedSections.splice(h,1),U(),he()},onCellHover:Un,onCellClick:Gn,onRowHeaderClick:(h,u)=>{if(!!u.target.closest(".ll-fold-handle")||u.shiftKey){Ln(h);return}Re(h),U(),le(),he()},onCellLeave:()=>{tt(),jn()}}:i}function kn(){if(s.rowStart!=null)return s.rowStart;let i=s.selectedRow??s.pinnedRows[0]??null;return i!=null?Math.max(0,i-Math.floor(t.maxRows/2)):Number.MAX_SAFE_INTEGER}function Mn(){if(_e){let h=a.clientWidth;P.style.width=h>0?h+"px":"100%",P.style.maxWidth="100%",P.style.maxHeight="";return}P.style.width="",P.style.maxWidth="";let i=a.clientWidth||P.clientWidth;if(ze&&i>0){let u=P.offsetHeight-C.getScrollElement().offsetHeight,b=(u>0?u:140)+90;P.style.maxHeight=Math.max(b,Math.round(i*ze))+"px"}else P.style.maxHeight=""}function U(){Mn(),C.setOptions(Mt())}function ye(){if(!c)return;let i=g(),h=R(),u=We(s.viewStart),b=W(),x=s.viewSize,$=x>=w,A=St(),B=x<=A[0],G='<span class="ll-nav-range-key">layers</span>';$?G+=`all ${w}`+(b>1?`<span class="ll-dim"> \xB7 every ${b}</span>`:""):G+=`${u}\u2013${u+x-1}<span class="ll-dim"> / ${w}</span>`+(b>1?`<span class="ll-dim"> \xB7 \u22481/${b}</span>`:"");let re="";for(let Y=0;Y<w;Y++){let Le=M[Y]||0,rt=Math.max(8,Math.round(Le*92));re+=`<div class="ll-skyline-bar" style="height:${rt}%;background:${ft(Le,i,h)}"></div>`}let ne=u/w*100,ge=x/w*100,ue=[];for(let Y=0;Y<w;Y+=8)ue.push(Y);ue[ue.length-1]!==w-1&&ue.push(w-1);let xe="",ve=Math.max(1,w-1);for(let Y of ue){let Le=Y===w-1,rt=Y===0,Yn=Y/ve*100;xe+=`<span class="ll-nav-tick" style="left:${Yn}%;transform:${Le?"translateX(-100%)":rt?"translateX(0)":"translateX(-50%)"}">${p.layers[Y]}</span>`}v.innerHTML=`
            <div class="ll-nav-range">${G}</div>
            <div class="ll-nav-mid">
                <div class="ll-skyline" id="${l}_sky">
                    <div class="ll-skyline-bars">${re}</div>
                    <div class="ll-skyline-win" id="${l}_win" style="left:${ne}%;width:${ge}%">
                        <div class="ll-skyline-handle" style="left:-1px"></div>
                        <div class="ll-skyline-handle" style="right:-1px"></div>
                    </div>
                </div>
                <div class="ll-nav-ticks">${xe}</div>
            </div>
            ${d?`<div class="ll-nav-controls">
                <button class="ll-nav-btn" data-nav="panL" title="Pan left" ${u<=0?"disabled":""}>${yo}</button>
                <button class="ll-nav-btn" data-nav="panR" title="Pan right" ${u+x>=w?"disabled":""}>${Lo}</button>
                <div class="ll-nav-sep"></div>
                <button class="ll-nav-btn" data-nav="zoomIn" title="Zoom in" ${B?"disabled":""}>${ko}</button>
                <button class="ll-nav-btn" data-nav="zoomOut" title="Zoom out" ${$?"disabled":""}>${Mo}</button>
                <button class="ll-nav-btn" data-nav="reset" title="Reset to overview">${wo}</button>
            </div>`:""}
        `,d&&$n()}function Sn(){let i=document.getElementById(l+"_win");if(!i)return;let h=Math.max(0,w-s.viewSize),u=Math.max(0,Math.min(h,s.viewStart));i.style.left=u/w*100+"%",i.style.width=s.viewSize/w*100+"%"}function St(){return Array.from(new Set([w,48,32,20,14,10,8])).filter(i=>i<=w&&i>=1).sort((i,h)=>i-h)}function We(i){return Math.max(0,Math.min(Math.max(0,w-s.viewSize),i))}let Qe=!1;function Tt(){Qe||(Qe=!0,requestAnimationFrame(()=>{Qe=!1,!Pe&&(U(),Sn())}))}function Ze(i){let h=We(s.viewStart+i);h!==s.viewStart&&(s.viewStart=h,U(),ye(),he())}function Tn(i){let h=We(i);h!==s.viewStart&&(s.viewStart=h,Tt())}function Et(i,h){let u=St(),b=u.findIndex(B=>B>=s.viewSize),x=b===-1?u.length-1:b,$=i<0?Math.max(0,x-1):Math.min(u.length-1,x+1),A=u[$];A!==s.viewSize&&(s.viewSize=A,s.viewStart=Math.max(0,Math.min(w-A,Math.round(h-A/2))),U(),ye(),he())}function $t(i){Et(i,s.viewStart+s.viewSize/2)}function En(){s.viewSize=w,s.viewStart=0,U(),ye(),he()}let Te=null;function $n(){let i=document.getElementById(l+"_sky");if(!i)return;i.addEventListener("pointerdown",u=>{let b=i.getBoundingClientRect(),x=u.clientX-b.left,$=b.width/w,A=Math.max(0,w-s.viewSize),B=Math.max(0,Math.min(A,s.viewStart)),G=B*$,re=(B+s.viewSize)*$,ne=B;(x<G||x>re)&&(ne=We(Math.round(x/$)-Math.floor(s.viewSize/2)),s.viewStart=ne,Tt()),Te={startX:x,startStart:ne,layerW:$},i.classList.add("ll-grabbing");try{i.setPointerCapture(u.pointerId)}catch{}}),i.addEventListener("pointermove",u=>{if(!Te)return;let b=i.getBoundingClientRect(),$=(u.clientX-b.left-Te.startX)/Te.layerW;Tn(Math.round(Te.startStart+$))});let h=u=>{if(Te){Te=null,i.classList.remove("ll-grabbing");try{i.releasePointerCapture(u.pointerId)}catch{}ye(),he()}};i.addEventListener("pointerup",h),i.addEventListener("pointercancel",h),i.addEventListener("wheel",u=>{u.preventDefault();let b=i.getBoundingClientRect();if(Math.abs(u.deltaX)>Math.abs(u.deltaY)){Ze(u.deltaX>0?1:-1);return}let x=Math.round((u.clientX-b.left)/b.width*w);Et(u.deltaY<0?-1:1,x)},{passive:!1})}function Cn(i,h,u=!1){_(i)&&(s.selectedRow=i,s.selectedLayerIdx=h??p.layers.length-1,U(),le(),u&&Hn(i),he())}function Hn(i){C.scrollToRow(i)}function Je(){requestAnimationFrame(()=>requestAnimationFrame(()=>{Pe||C.scrollToBottom()}))}let Rn=.45,Pn=120,Dn=360;function et(){let i;if(ze)i=(a.clientWidth||P.clientWidth)*ze;else{let u=P.clientHeight;i=u>0?u:(P.clientWidth||900)*.6}let h=Math.round(i*Rn);V.style.height=Math.max(Pn,Math.min(Dn,h))+"px"}function Ct(i){return i+"\xB7"+(qe(p.tokens[i])?"bos":He(p.tokens[i]))}function le(i){let h=s.pinnedRows.length>0?s.pinnedRows:s.selectedRow!==null?[s.selectedRow]:[],u=h.length>1,b=[];for(let $ of h){let A=se($);for(let B of s.pinned){let G=oe($,B.token);if(!G)continue;let re=He(B.token);u&&(re+=" ("+Ct($)+")"),b.push({values:G.map(ne=>ne??null),label:re,color:B.color,dashPattern:A.dash||void 0,removable:!1})}}let x=b.length===0&&!i;if(x)O.classList.add("ll-hidden");else{O.classList.remove("ll-hidden"),et(),ie.textContent=s.pinnedRows.length>1?s.pinnedRows.length+" positions":h.length===1?"position "+Ct(h[0]):"";let $={lines:[],richLines:b,xLabels:p.layers},A={darkMode:R(),mode:"probability",autoScale:!0,legendPosition:b.length>1?"right":"none",showDataPoints:!0,xAxisLabel:"layer",yAxisLabel:"probability",transparentBackground:!0,interactive:d,pixelRatio:t?.pixelRatio};pe?(pe.setData($),pe.setOptions(A)):(ee.style.minHeight="0",pe=new ke(ee,$,A)),i?pe.setOverlay?.({values:i.values,label:i.label,color:i.color,dashPattern:"4,2",isOverlay:!0}):pe.setOverlay?.(null)}_e&&x!==te?(te=x,requestAnimationFrame(()=>{Pe||(U(),Je())})):te=x}let In=56,An=11,On=9.5,_n=15;function zn(i){let h=An*(i>0?i/In:1);return Math.max(On,Math.min(_n,h))}function Wn(i,h,u,b,x=0){let $=p.cells[i]?.[h];if(!$||!_(i))return;let A=g(),B=qe(p.tokens[i])?"bos":He(p.tokens[i]);X.innerHTML=`<div class="ll-tt-head"><span class="ll-tt-swatch" style="background:${ft($.prob,A,R())}"></span><span class="ll-tt-token">${Ee(He($.token))}</span></div><div class="ll-tt-grid"><span>probability</span><span class="ll-tt-val">${($.prob*100).toFixed(1)}%</span><span>layer</span><span class="ll-tt-val">${p.layers[h]} / ${p.layers[w-1]}</span><span>position</span><span class="ll-tt-val">${i} \xB7 ${Ee(B)}</span></div>`,X.style.fontSize=zn(x)+"px",X.classList.add("ll-visible");let G=P.getBoundingClientRect(),re=X.offsetWidth||200,ne=X.offsetHeight||80,ge=8,ue=14,xe=u-G.left,ve=b-G.top,Y=xe+ue;Y+re>G.width-ge&&(Y=xe-ue-re),Y=Math.max(ge,Math.min(Y,G.width-re-ge));let Le=ve-50;Le=Math.max(ge,Math.min(Le,G.height-ne-ge)),X.style.left=Y+"px",X.style.top=Le+"px"}function tt(){X.classList.remove("ll-visible")}function Bn(){nt(),fe=document.createElement("div"),fe.style.cssText="position:fixed;inset:0;z-index:49;",fe.addEventListener("mousedown",i=>{i.preventDefault(),i.stopPropagation(),Rt()}),document.body.appendChild(fe)}function nt(){fe&&(fe.remove(),fe=null)}function Nn(i,h,u){if(!p.cells[i]?.[h]||!_(i))return;let x=u.getBoundingClientRect();s.openPopup={row:i,layer:h},s.selectedRow=i,s.selectedLayerIdx=h;let $=qe(p.tokens[i])?"bos":He(p.tokens[i]);Se.innerHTML=`Layer <b>${p.layers[h]}</b>, Position <b>${i}</b><div class="ll-popup-sub">input <code>${Ee($)}</code></div>`,Ht(i,h),U(),le(),j.style.visibility="hidden",j.classList.add("ll-visible"),Fn(x),j.style.visibility="",Bn(),he()}function Ht(i,h){let u=p.cells[i][h],b="";u.topk.forEach((x,$)=>{let A=q(x.token),B=A?`background:${A}22;border-left-color:${A};`:"";b+=`<div class="ll-topk${A?" ll-topk-pinned":""}" data-ki="${$}" style="${B}" title="click to track trajectory"><span class="ll-topk-tok">${en(x.token)}</span><span class="ll-topk-prob">${(x.prob*100).toFixed(1)}%</span></div>`}),we.innerHTML=b,we.querySelectorAll(".ll-topk").forEach(x=>{let $=parseInt(x.dataset.ki),A=u.topk[$];x.addEventListener("mouseenter",()=>{if(te)return;let B=oe(i,A.token);B&&le({values:B.map(G=>G??null),label:He(A.token),color:"#999"})}),x.addEventListener("mouseleave",()=>{te||le()}),x.addEventListener("click",B=>{B.stopPropagation(),(window.getSelection()?.isCollapsed??!0)&&(ce(A.token),U(),Ht(i,h),le(),he())})})}function Fn(i){let b=P.getBoundingClientRect(),x=Math.max(140,b.width-2*8),$=Math.max(120,b.height-2*8);j.style.maxWidth=x+"px",j.style.maxHeight=$+"px";let A=j.offsetWidth||220,B=j.offsetHeight||160,G=b.left+8,re=b.right-8-A,ne=b.top+8,ge=b.bottom-8-B,ue=[{left:i.right+6,top:i.top},{left:i.left-6-A,top:i.top},{left:i.left,top:i.bottom+6},{left:i.left,top:i.top-6-B}],xe=ue[0];for(let ve of ue)if(ve.left>=G&&ve.left<=re&&ve.top>=ne&&ve.top<=ge){xe=ve;break}j.style.left=Math.max(G,Math.min(xe.left,Math.max(G,re)))+"px",j.style.top=Math.max(ne,Math.min(xe.top,Math.max(ne,ge)))+"px"}function Rt(){s.openPopup=null,j.classList.remove("ll-visible"),nt(),U(),le()}d&&document.getElementById(l+"_popup_close").addEventListener("click",i=>{i.stopPropagation(),Rt()});function Vn(i,h){if(te||!_(i))return;let u=p.cells[i]?.[h]?.token,b=u!=null?oe(i,u):null;b?le({values:b.map(x=>x??null),label:He(u),color:"#999"}):le()}function jn(){te||le()}function Un(i,h){Vn(i,h)}function Gn(i,h,u){if(!_(i))return;if(u.shiftKey){let x=p.cells[i]?.[h]?.token;x&&(ce(x),U(),le(),he());return}tt();let b=u.target.closest(".hmx-cell");b&&Nn(i,h,b)}C=new De(de,kt(),Mt());let Ue=C.getScrollElement(),Pt=i=>{let h=i.target.closest(".hmx-cell");if(!h){tt();return}Wn(parseInt(h.dataset.row),parseInt(h.dataset.col),i.clientX,i.clientY,h.offsetWidth)},Dt=i=>{i.shiftKey&&i.target.closest(".hmx-rowlabel")&&i.preventDefault()};d&&(Ue.addEventListener("mousemove",Pt),Ue.addEventListener("mousedown",Dt),de.addEventListener("keydown",i=>{if(i.key!=="ArrowDown"&&i.key!=="ArrowUp")return;i.preventDefault();let h=i.key==="ArrowDown"?1:-1,u=(s.selectedRow??(h>0?-1:I))+h;for(;u>=0&&u<I&&!_(u);)u+=h;_(u)&&Cn(u,void 0,!0)}),v.addEventListener("click",i=>{let h=i.target.closest("[data-nav]");if(!h||h.hasAttribute("disabled"))return;let u=h.dataset.nav;u==="panL"?Ze(-Math.max(1,Math.floor(s.viewSize/4))):u==="panR"?Ze(Math.max(1,Math.floor(s.viewSize/4))):u==="zoomIn"?$t(-1):u==="zoomOut"?$t(1):u==="reset"&&En()}));function ot(){U(),ye(),le(),requestAnimationFrame(()=>{Pe||(U(),ye(),te||et())})}function it(){dt(P,R(),j)}function he(){k("stateChange",_t())}ot(),d&&Je(),it();let lt=0,It=a?.clientWidth??0,At=a?.clientHeight??0,Ot=new ResizeObserver(()=>{let i=a?.clientWidth??0,h=a?.clientHeight??0;i===It&&h===At||(It=i,At=h,!lt&&(lt=requestAnimationFrame(()=>{lt=0,!Pe&&(U(),te||et())})))});a&&Ot.observe(a);let Xn=Ye(a,i=>{s.darkModeOverride===null&&(dt(P,i,j),U(),ye(),le())});function _t(){return{ramp:s.ramp,showGrid:s.showGrid,dimLowProb:s.dimLow,selectedRow:s.selectedRow,selectedLayer:s.selectedLayerIdx,viewStart:s.viewStart,viewSize:s.viewSize,colorIndex:s.colorIndex,pinnedGroups:s.pinned.map(i=>({tokens:[i.token],color:i.color})),pinnedRows:s.pinnedRows.map(i=>({pos:i,line:se(i).name})),darkMode:s.darkModeOverride,rowHighlights:s.rowHighlights,collapsedSections:s.collapsedSections,rowStart:s.rowStart}}return{widget:{getState:_t,setState:i=>{i.ramp!==void 0&&(s.ramp=i.ramp),i.showGrid!==void 0&&(s.showGrid=i.showGrid),i.dimLowProb!==void 0&&(s.dimLow=i.dimLowProb),i.selectedRow!==void 0&&(s.selectedRow=i.selectedRow),i.selectedLayer!==void 0&&(s.selectedLayerIdx=i.selectedLayer),i.viewStart!==void 0&&(s.viewStart=i.viewStart),i.viewSize!==void 0&&(s.viewSize=i.viewSize),i.colorIndex!==void 0&&(s.colorIndex=i.colorIndex),i.pinnedGroups!==void 0&&(s.pinned=L(i.pinnedGroups)),i.pinnedRows!==void 0&&(s.pinnedRows=i.pinnedRows.map(h=>h.pos).filter(h=>typeof h=="number")),i.darkMode!==void 0&&(s.darkModeOverride=i.darkMode),i.rowHighlights!==void 0&&(s.rowHighlights=i.rowHighlights),i.collapsedSections!==void 0&&(s.collapsedSections=i.collapsedSections.map(h=>({...h}))),i.rowStart!==void 0&&(s.rowStart=i.rowStart),Q(),it(),ot()},setData:i=>{r=at(i),p=r.normalized,f=r.v2Data,s.selectedRow=null,s.selectedLayerIdx=null,s.pinned=[],s.pinnedRows=[],s.colorIndex=0,s.rowHighlights=[],s.collapsedSections=[],s.rowStart=null,T=null,Q(),z=[],C.setData(kt()),ot(),d&&Je()},setTitle:()=>{},setThemeMode:i=>{s.darkModeOverride=!!i,it(),U(),ye(),le()},getThemeMode:()=>R(),getRowWindow:()=>H,setRowScrollActive:i=>{i!==E&&(E=i,U())},hasEntropyData:()=>!!f&&Array.isArray(f.entropy)&&f.entropy.length>0,hasRankData:()=>{if(!f?.tracked)return!1;for(let i of f.tracked)for(let h in i){let u=i[h];if(u&&typeof u=="object"&&Array.isArray(u.rank))return!0}return!1},linkColumnsTo:()=>{},unlinkColumns:()=>{},on:(i,h)=>{(y[i]||(y[i]=[])).push(h)},off:(i,h)=>{y[i]=(y[i]||[]).filter(u=>u!==h)},destroy:()=>{Pe=!0,Xn(),Ot?.disconnect(),nt(),j.remove(),pe&&(pe.destroy(),pe=null),Ue.removeEventListener("mousemove",Pt),Ue.removeEventListener("mousedown",Dt),C?.destroy(),a&&(a.innerHTML="")}},styleEl:m}}var wo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',yo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',Lo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',ko='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',Mo='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>';var Ie=class{constructor(e,n,t,l){this.widget=null;this.styleEl=null;let d=tn(e,n,t,l);d&&(this.widget=d.widget,this.styleEl=d.styleEl)}getState(){return this.widget?.getState()??{}}setState(e){this.widget?.setState(e)}setData(e){this.widget?.setData(e)}setTitle(e){this.widget?.setTitle(e)}setThemeMode(e){this.widget?.setThemeMode(e)}getThemeMode(){return this.widget?.getThemeMode()??!1}getRowWindow(){return this.widget?.getRowWindow()??null}setRowScrollActive(e){this.widget?.setRowScrollActive(e)}hasEntropyData(){return this.widget?.hasEntropyData()??!1}hasRankData(){return this.widget?.hasRankData()??!1}linkColumnsTo(e){this.widget&&this.widget.linkColumnsTo(e)}unlinkColumns(e){this.widget&&this.widget.unlinkColumns(e)}on(e,n){this.widget?.on(e,n)}off(e,n){this.widget?.off(e,n)}destroy(){this.widget?.destroy(),this.widget=null,this.styleEl?.parentNode&&(this.styleEl.parentNode.removeChild(this.styleEl),this.styleEl=null)}};var So='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',To='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Eo='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',gt="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";function bt(o){return{fg:o?"rgba(250,250,250,0.8)":"rgba(24,24,27,0.8)",fgMuted:o?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",border:o?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)",bg:o?"rgba(24,24,27,0.95)":"rgba(255,255,255,0.95)",inputBg:o?"rgba(24,24,27,0.5)":"rgba(255,255,255,0.5)",hoverBg:o?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)",chipBg:o?"rgba(63,63,70,0.5)":"rgba(244,244,245,1)",chipBorder:o?"rgba(82,82,91,0.5)":"rgba(228,228,231,1)",chipHoverBg:o?"rgba(139,92,246,0.15)":"rgba(139,92,246,0.1)",chipHoverBorder:o?"rgba(139,92,246,0.4)":"rgba(139,92,246,0.3)",badgeBg:"rgba(139,92,246,0.15)",badgeText:"rgba(139,92,246,0.9)",badgeBorder:"rgba(139,92,246,0.2)",selectedText:o?"rgba(250,250,250,0.4)":"rgba(24,24,27,0.4)"}}function nn(o){let e=document.createElement("div");e.style.cssText=`position:relative;flex-shrink:0;margin-bottom:4px;font-family:${gt};`;let n={isOpen:!1,searchQuery:""},t=ln(e,o,n);return e.__tokenSelectorCleanup=t,e.__tokenSelectorState=n,e}function Fe(o,e){let n=o.__tokenSelectorCleanup,t=o.__tokenSelectorState;n&&n();let l={isOpen:t?.isOpen??!1,searchQuery:t?.searchQuery??""},d=ln(o,e,l);o.__tokenSelectorCleanup=d,o.__tokenSelectorState=l}function on(o){let e=o.__tokenSelectorCleanup;e&&e()}function ln(o,e,n){o.innerHTML="";let t=bt(e.darkMode),{allLabels:l,selectedIndices:d,defaultIndices:c,onChange:a}=e,r=document.createElement("div");r.style.cssText="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;";let p=document.createElement("span");if(p.style.cssText=`font-size:11px;color:${t.fgMuted};`,p.textContent=`Tokens (${l.length})`,r.appendChild(p),!xt(d,c)){let M=document.createElement("button");M.style.cssText=`display:inline-flex;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;font-size:11px;color:${t.fgMuted};font-family:${gt};padding:2px 4px;border-radius:3px;transition:all 0.15s;`,M.innerHTML=`${So} Reset`,M.addEventListener("mouseenter",()=>{M.style.color=t.fg}),M.addEventListener("mouseleave",()=>{M.style.color=t.fgMuted}),M.addEventListener("click",()=>{a(Array.from(c))}),r.appendChild(M)}o.appendChild(r);let m=document.createElement("div");m.style.cssText=`display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.inputBg};cursor:text;min-height:30px;`,m.addEventListener("click",()=>{k(),s.focus()});let L=Array.from(d).sort((M,N)=>M-N);for(let M of L){let N=$o(M,l[M],e.darkMode,()=>{let S=new Set(d);S.delete(M),a(Array.from(S))});m.appendChild(N)}let s=document.createElement("input");s.type="text",s.placeholder=L.length===0?"Search tokens...":"",s.style.cssText=`border:none;outline:none;background:transparent;font-size:12px;color:${t.fg};font-family:${gt};min-width:60px;flex:1;padding:2px 0;`,s.addEventListener("input",()=>{n.searchQuery=s.value,y()}),s.addEventListener("focus",()=>k()),m.appendChild(s);let T=document.createElement("span");T.style.cssText=`display:flex;align-items:center;color:${t.fgMuted};flex-shrink:0;margin-left:auto;padding:0 2px;cursor:pointer;transition:transform 0.15s;`,T.innerHTML=Eo,T.addEventListener("click",M=>{M.stopPropagation(),n.isOpen?w():k()}),m.appendChild(T),o.appendChild(m);let D=document.createElement("div");D.style.cssText=`position:absolute;left:0;right:0;top:100%;margin-top:2px;z-index:50;background:${t.bg};border:1px solid ${t.border};border-radius:6px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;overflow:hidden;backdrop-filter:blur(12px);`;let H=document.createElement("div");H.style.cssText="max-height:200px;overflow-y:auto;padding:4px 0;",D.appendChild(H);let E=document.createElement("div");E.style.cssText=`padding:8px 12px;font-size:12px;color:${t.fgMuted};display:none;text-align:center;`,E.textContent="No tokens found",D.appendChild(E),o.appendChild(D);function y(){H.innerHTML="";let M=n.searchQuery.toLowerCase(),N=0;for(let S=0;S<l.length;S++){let F=l[S];if(M&&!F.toLowerCase().includes(M))continue;N++;let _=d.has(S),Q=Co(S,F,_,e.darkMode,()=>{let q=new Set(d);_?q.delete(S):q.add(S),a(Array.from(q))});H.appendChild(Q)}E.style.display=N===0?"":"none"}function k(){n.isOpen||(n.isOpen=!0,D.style.display="",T.style.transform="rotate(180deg)",y())}function w(){n.isOpen&&(n.isOpen=!1,D.style.display="none",T.style.transform="",s.value="",n.searchQuery="")}function I(M){o.contains(M.target)||w()}return document.addEventListener("mousedown",I),n.isOpen&&(D.style.display="",T.style.transform="rotate(180deg)",s.value=n.searchQuery,y(),requestAnimationFrame(()=>{s.isConnected&&s.focus()})),()=>{document.removeEventListener("mousedown",I)}}function $o(o,e,n,t){let l=bt(n),d=K[o%K.length],c=document.createElement("div");c.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 6px;border-radius:4px;border:1px solid ${l.chipBorder};background:${l.chipBg};cursor:default;transition:all 0.15s;flex-shrink:0;`,c.addEventListener("mouseenter",()=>{c.style.background=l.chipHoverBg,c.style.borderColor=l.chipHoverBorder}),c.addEventListener("mouseleave",()=>{c.style.background=l.chipBg,c.style.borderColor=l.chipBorder});let a=document.createElement("span");a.style.cssText=`display:block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:${d};`,c.appendChild(a);let r=document.createElement("span");r.style.cssText=`font-size:11px;color:${l.fg};max-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,r.innerHTML=Ce(e),r.title=e,c.appendChild(r);let p=document.createElement("button");return p.style.cssText=`display:flex;align-items:center;border:none;background:transparent;cursor:pointer;color:${l.fgMuted};padding:1px;border-radius:2px;transition:color 0.15s;flex-shrink:0;`,p.innerHTML=To,p.addEventListener("mouseenter",()=>{p.style.color=l.badgeText}),p.addEventListener("mouseleave",()=>{p.style.color=l.fgMuted}),p.addEventListener("click",f=>{f.stopPropagation(),t()}),c.appendChild(p),c}function Co(o,e,n,t,l){let d=bt(t),c=K[o%K.length],a=document.createElement("div");a.style.cssText="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;transition:background 0.1s;font-size:12px;",a.addEventListener("mouseenter",()=>{a.style.background=d.hoverBg}),a.addEventListener("mouseleave",()=>{a.style.background="transparent"}),a.addEventListener("click",m=>{m.stopPropagation(),l()});let r=document.createElement("span");r.style.cssText=`display:block;width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${n?c:"transparent"};border:1.5px solid ${n?c:d.fgMuted};`,a.appendChild(r);let p=document.createElement("span");p.style.cssText=`flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${n?d.fg:d.fgMuted};`,p.innerHTML=Ce(e),p.title=e,a.appendChild(p);let f=o===0?"source pred":o===1?"target pred":null;if(f){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;padding:1px 5px;font-size:9px;font-weight:500;border-radius:3px;background:${d.badgeBg};color:${d.badgeText};border:1px solid ${d.badgeBorder};`,m.textContent=f,a.appendChild(m)}if(n){let m=document.createElement("span");m.style.cssText=`flex-shrink:0;font-size:10px;color:${d.selectedText};`,m.textContent="selected",a.appendChild(m)}return a}function xt(o,e){if(o.size!==e.size)return!1;for(let n of o)if(!e.has(n))return!1;return!0}var Ho={probability:"Probability",prob_diff:"Prob \u0394",rank:"Rank"},Ro=["probability","prob_diff","rank"],Ae=class Ae{constructor(e,n,t={}){this.modeButtons=new Map;this.container=e,this.allData=n,this.mode=t.mode??"probability",this.darkMode=t.darkMode??!1,this.transparentBackground=t.transparentBackground??!1,this.title=t.title,this.interactive=t.interactive!==!1,this.pixelRatio=t.pixelRatio,this.onTokenSelectionChange=t.onTokenSelectionChange,this.onModeChange=t.onModeChange;let l=t.defaultSelectedTokens??Ae.defaultSelection(n);this.customDefaultTokens=t.defaultSelectedTokens!==void 0,this.defaultTokens=new Set(l),this.selectedTokens=new Set(t.selectedTokens??l),e.style.display="flex",e.style.flexDirection="column",e.style.width="100%",e.style.height="100%",this.modeBar=this.createModeBar(),this.tokenSelectorEl=nn(this.buildTokenSelectorConfig()),this.interactive&&(e.appendChild(this.modeBar),e.appendChild(this.tokenSelectorEl));let d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:hidden;",e.appendChild(d),this.linePlot=new ke(d,this.buildPlotData(),this.buildPlotOptions()),d.style.height="auto"}static defaultSelection(e){let n=e.tokenLabels?.length??e.lines?.length??0,t=new Set(Array.from({length:Math.min(2,n)},(d,c)=>c)),l=d=>Math.max(...e.lines?.[d]??[0]);return(e.ranks??[]).slice(0,n).flatMap((d,c)=>!t.has(c)&&d.includes(0)?[c]:[]).sort((d,c)=>l(c)-l(d)||d-c).slice(0,Ae.MAX_DEFAULT_TOKENS-t.size).forEach(d=>t.add(d)),Array.from(t).sort((d,c)=>d-c)}buildTokenSelectorConfig(){return{allLabels:this.allData.tokenLabels??[],selectedIndices:this.selectedTokens,defaultIndices:this.defaultTokens,darkMode:this.darkMode,onChange:e=>this.handleTokenSelectionChange(e)}}handleTokenSelectionChange(e){this.selectedTokens=new Set(e),Fe(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()),this.onTokenSelectionChange?.(e)}createModeBar(){let e=document.createElement("div");this.applyModeBarStyles(e);for(let n of Ro){let t=document.createElement("button");t.textContent=Ho[n],this.applyModeButtonStyles(t,n===this.mode),t.addEventListener("click",()=>this.setMode(n)),t.addEventListener("mouseenter",()=>{n!==this.mode&&(t.style.background=this.darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)")}),t.addEventListener("mouseleave",()=>{n!==this.mode&&(t.style.background="transparent")}),e.appendChild(t),this.modeButtons.set(n,t)}return e}applyModeBarStyles(e){let n=this.darkMode?"rgba(63,63,70,0.4)":"rgba(228,228,231,0.4)";e.style.cssText=`display:inline-flex;align-items:center;gap:0;padding:2px;border-radius:6px;border:1px solid ${n};align-self:flex-start;margin-bottom:6px;flex-shrink:0;`}applyModeButtonStyles(e,n){let t=this.darkMode?"rgba(250,250,250,0.5)":"rgba(24,24,27,0.5)",l="rgba(139,92,246,0.9)";e.style.cssText=`padding:3px 10px;border-radius:4px;border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${n?l:"transparent"};color:${n?"#fff":t};`}updateModeBarUI(){this.applyModeBarStyles(this.modeBar);for(let[e,n]of this.modeButtons)this.applyModeButtonStyles(n,e===this.mode)}getModeLines(){return this.mode==="rank"?this.allData.ranks??[]:this.mode==="prob_diff"?this.allData.prob_diffs??[]:this.allData.lines??[]}buildPlotData(){let e=this.getModeLines(),n=this.allData.tokenLabels??[],t=Array.from(this.selectedTokens).sort((c,a)=>c-a),l=this.mode==="rank";return{richLines:t.filter(c=>c<e.length).map(c=>({values:l?e[c].map(a=>a+1):e[c],label:n[c]??`Token ${c}`,color:K[c%K.length]})),sections:this.allData.sections}}getModeTitle(){return this.mode==="rank"?"Activation Patching: Token Rank by Layer":this.mode==="prob_diff"?"Activation Patching: Probability Difference by Layer":"Activation Patching: Token Probability by Layer"}buildPlotOptions(){let e={darkMode:this.darkMode,transparentBackground:this.transparentBackground,title:this.title??this.getModeTitle(),mode:this.mode,xAxisLabel:"Layer",invertYAxis:!1,centerYAxisAtZero:!1,logScale:!1,interactive:this.interactive,pixelRatio:this.pixelRatio};return this.mode==="rank"?(e.invertYAxis=!0,e.logScale=!0,e.yAxisLabel="Rank (log)"):this.mode==="prob_diff"?(e.centerYAxisAtZero=!0,e.yAxisLabel="Prob \u0394 (Patched - Clean)"):e.yAxisLabel="Probability",e}setMode(e){e!==this.mode&&(this.mode=e,this.linePlot.setData(this.buildPlotData()),this.linePlot.setOptions(this.buildPlotOptions()),this.updateModeBarUI(),this.onModeChange?.(e))}setData(e){this.allData=e;let n=e.tokenLabels?.length??e.lines?.length??0;this.customDefaultTokens||(this.defaultTokens=new Set(Ae.defaultSelection(e)));let t=new Set([...this.selectedTokens].filter(l=>l<n));this.selectedTokens=t.size>0?t:new Set(this.defaultTokens),Fe(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData())}setThemeMode(e){this.darkMode=e,this.linePlot.setThemeMode(e),this.updateModeBarUI(),Fe(this.tokenSelectorEl,this.buildTokenSelectorConfig())}setTitle(e){this.title=e,this.linePlot.setOptions(this.buildPlotOptions())}setSelectedTokens(e){let n=this.getModeLines().length,t=new Set(e.filter(l=>l<n));xt(t,this.selectedTokens)||(this.selectedTokens=t,Fe(this.tokenSelectorEl,this.buildTokenSelectorConfig()),this.linePlot.setData(this.buildPlotData()))}destroy(){on(this.tokenSelectorEl),this.linePlot.destroy(),this.container.innerHTML=""}};Ae.MAX_DEFAULT_TOKENS=10;var Oe=Ae;function vt(o,e,n){let t=Math.max(1,o),l=Math.max(1,e),d=Math.min(16e3/t,16e3/l,Math.sqrt(25e7/(t*l)));return Math.max(.01,Math.min(n>0?n:1,d))}var wt="http://www.w3.org/1999/xhtml",Ke="http://www.w3.org/2000/svg",Po=/^(--|transition|animation|cursor$|pointer-events$|user-select$|-webkit-user-select$|touch-action$|will-change$|caret-color$)/,Do=new Set(["d","x","y","cx","cy","r","rx","ry"]),Io=new Set(["script","style","link","noscript","template"]),Ao=[["border-top-style","border-top-width"],["border-right-style","border-right-width"],["border-bottom-style","border-bottom-width"],["border-left-style","border-left-width"],["outline-style","outline-width"],["column-rule-style","column-rule-width"]],Oo=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g,_o=o=>o.replace(Oo,e=>e.length===2?e:"\uFFFD"),yt=class{constructor(){this.cache=new Map;this.frame=document.createElement("iframe"),this.frame.setAttribute("aria-hidden","true"),this.frame.tabIndex=-1,this.frame.style.cssText="position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden;",document.body.appendChild(this.frame),this.win=this.frame.contentWindow,this.doc=this.frame.contentDocument,this.doc.open(),this.doc.write("<!DOCTYPE html><html><head></head><body></body></html>"),this.doc.close(),this.svgRoot=this.doc.createElementNS(Ke,"svg"),this.doc.body.appendChild(this.svgRoot)}defaults(e,n){let t=e.namespaceURI??wt,l=`${t} ${e.localName}${n??""}`,d=this.cache.get(l);if(d)return d;let c=this.doc.createElementNS(t,e.localName);(t===Ke?this.svgRoot:this.doc.body).appendChild(c);let a=this.win.getComputedStyle(c,n??null);d=new Map;for(let r=0;r<a.length;r++){let p=a.item(r);d.set(p,a.getPropertyValue(p))}return c.remove(),this.cache.set(l,d),d}destroy(){this.frame.remove()}};function rn(o,e,n,t){let l="",d=new Set;for(let c=0;c<o.length;c++){let a=o.item(c);if(Po.test(a)||t&&Do.has(a))continue;let r=o.getPropertyValue(a);r===e.get(a)&&(!n||r===n.getPropertyValue(a))||(l+=`${a}:${r};`,d.add(a))}for(let[c,a]of Ao){let r=o.getPropertyValue(c);r&&r!=="none"&&r!=="hidden"&&!d.has(a)&&(l+=`${a}:${o.getPropertyValue(a)};`)}return l}function sn(o,e,n){if(o.nodeType===Node.TEXT_NODE)return document.createTextNode(o.nodeValue??"");if(o.nodeType!==Node.ELEMENT_NODE)return null;let t=o;if(Io.has(t.localName.toLowerCase()))return null;let l=getComputedStyle(t);if(l.display==="none")return null;let d=t instanceof HTMLCanvasElement,c;if(d){c=document.createElement("img");try{c.setAttribute("src",t.toDataURL("image/png"))}catch{}}else c=t.cloneNode(!1);c.setAttribute("style",rn(l,n.sandbox.defaults(t),e,t.namespaceURI===Ke));let a="",r="";for(let p of["::before","::after"]){let f=getComputedStyle(t,p),m=f.getPropertyValue("content");!m||m==="none"||m==="normal"||f.display==="none"||(r||(r=`nns-snap-${n.nextClass++}`),a+=`.${r}${p}{${rn(f,n.sandbox.defaults(t,p),l,!1)}}`)}if(r&&(c.setAttribute("class",`${c.getAttribute("class")??""} ${r}`.trim()),n.rules.push(a)),!d)for(let p of Array.from(t.childNodes)){let f=sn(p,l,n);f&&c.appendChild(f)}return c}function zo(o){return new Promise((e,n)=>{let t=new Image;t.onload=()=>e(t),t.onerror=()=>n(new Error("Snapshot failed: the browser could not render the captured element.")),t.src=o})}async function Ve(o,e={}){let n=Math.max(0,e.padding??0),t=o.getBoundingClientRect(),l=Math.ceil(t.width),d=Math.ceil(t.height);if(l===0||d===0)throw new Error("Snapshot failed: the element has no size (is it attached and visible?).");let c=l+2*n,a=d+2*n,r=vt(c,a,e.scale??2),p=new yt,f;try{let H={sandbox:p,rules:[],nextClass:0},E=sn(o,null,H);if(!E)throw new Error("Snapshot failed: the element is not displayed.");E.setAttribute("style",E.getAttribute("style")+`position:relative;left:auto;top:auto;right:auto;bottom:auto;margin:0;transform:none;translate:none;scale:none;rotate:none;width:${l}px;height:${d}px;box-sizing:border-box;`);let y=document.createElementNS(wt,"div");if(y.setAttribute("style",`width:${c}px;height:${a}px;padding:${n}px;margin:0;box-sizing:border-box;`),H.rules.length){let k=document.createElementNS(wt,"style");k.textContent=H.rules.join(""),y.appendChild(k)}y.appendChild(E),f=_o(new XMLSerializer().serializeToString(y))}finally{p.destroy()}let m=`<svg xmlns="${Ke}" width="${c*r}" height="${a*r}" viewBox="0 0 ${c} ${a}"><foreignObject x="0" y="0" width="${c}" height="${a}">${f}</foreignObject></svg>`,L=await zo("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(m)),s=document.createElement("canvas");s.width=Math.round(c*r),s.height=Math.round(a*r);let T=s.getContext("2d");if(!T)throw new Error("Snapshot failed: no 2D canvas context.");e.background&&(T.fillStyle=e.background,T.fillRect(0,0,s.width,s.height)),T.drawImage(L,0,0,s.width,s.height);let D;try{D=s.toDataURL("image/png")}catch(H){throw new Error(`Snapshot failed: this browser won't read back the rendered image (${H.message}).`)}return{dataUrl:D,width:c,height:a,scale:r,toBlob:()=>new Promise((H,E)=>s.toBlob(y=>y?H(y):E(new Error("Snapshot failed: could not encode the PNG.")),"image/png"))}}var an={light:"#ffffff",dark:"hsl(0 0% 16%)"};function Wo(){return new Promise(o=>{let e=setTimeout(o,100);requestAnimationFrame(()=>{clearTimeout(e),o()})})}async function Bo(){typeof document.fonts?.ready?.then=="function"&&await document.fonts.ready;for(let o=0;o<3;o++)await Wo()}async function dn(o,e={}){let n=Math.max(200,Math.round(e.width??880)),t=e.darkMode??!1,l=e.scale??2,d=e.background===void 0?t?an.dark:an.light:e.background,c=document.createElement("div");c.setAttribute("aria-hidden","true"),c.style.cssText=`position:fixed;left:-100000px;top:0;width:${n}px;pointer-events:none;`;let a=document.createElement("div");c.appendChild(a),document.body.appendChild(c);let r=()=>{},p=()=>{};try{if(o.kind==="logit-lens"){let m=new Ie(a,o.data,{...o.uiState,darkMode:t},{interactive:!1,pixelRatio:l,maxRows:e.maxRows,layerNavigator:e.layerNavigator});r=()=>m.destroy(),p=()=>m.getRowWindow()}else{let m=Math.max(160,Math.round(e.height??n*.5));c.style.height=`${m}px`;let L=new Oe(a,o.data,{mode:o.mode,selectedTokens:o.selectedTokens,title:o.title,darkMode:t,transparentBackground:!0,interactive:!1,pixelRatio:l});r=()=>L.destroy()}return await Bo(),{...await Ve(c,{scale:l,background:d,padding:e.padding}),rows:p()}}finally{r(),c.remove()}}function No(o){let e=typeof o=="string"?document.querySelector(o):o;return e||console.error("Container not found:",o),e}function Lt(o,e,n){let t=No(o);if(!t)return null;let l=e(t);if(n===void 0){let d=Ye(t,a=>l.setThemeMode(a)),c=l.destroy.bind(l);l.destroy=()=>{d(),c()}}return l}function hn(o,e,n,t){return new Ie(o,e,n,t)}function un(o,e,n){return Lt(o,t=>new ke(t,e,{darkMode:Me(t),...n}),n?.darkMode)}var cn={purple:"#9333ea",blue:"#2563eb",teal:"#0d9488"};function Fo(o){if(!/^#?[0-9a-fA-F]{6}$/.test(o))return[147,51,234];let e=o.replace("#","");return[parseInt(e.slice(0,2),16),parseInt(e.slice(2,4),16),parseInt(e.slice(4,6),16)]}function pn(o,e){if(typeof o.getCellValue=="function")return o;let n=o,t=n.values??[],l=n.texts,d=n.rowLabels??t.map((E,y)=>String(y)),c=n.colLabels??(t[0]??[]).map((E,y)=>String(y)),a=n.ramp??"purple",r=cn[a]??(a[0]==="#"?a:cn.purple),[p,f,m]=Fo(r),[L,s]=n.valueDomain??[0,1],T=s-L,D=e?38:255,H=E=>Math.max(0,Math.min(1,E));return{rows:d.map(E=>({label:E})),columns:c.map(E=>({label:E,value:0})),getCellValue:(E,y)=>{let k=t[E]?.[y]??0,w=H(T>0?(k-L)/T:k),I=N=>Math.round(D+(N-D)*w);return{text:l?l[E]?.[y]??"":Number.isInteger(k)?String(k):k.toFixed(2),value:k,color:`rgb(${I(p)}, ${I(f)}, ${I(m)})`,textColor:w>=.62?"#fff":e?"#e0e0e0":"hsl(0 0% 18%)"}}}}function mn(o,e,n){return Lt(o,t=>{let l=n?.darkMode??Me(t),d=new De(t,pn(e,l),{darkMode:l,...n}),c=d.setThemeMode.bind(d);return d.setThemeMode=a=>{d.setData(pn(e,a)),c(a)},d},n?.darkMode)}function fn(o,e,n){return Lt(o,t=>new Oe(t,e,{darkMode:Me(t),...n}),n?.darkMode)}typeof window<"u"&&(window.LogitLensWidget=hn,window.LinePlotWidget=un,window.HeatmapTableWidget=mn,window.ActivationPatchingWidget=fn);return eo(Vo);})();
//# sourceMappingURL=charts.js.map
