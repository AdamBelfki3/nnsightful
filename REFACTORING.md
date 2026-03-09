# Visualization Library Refactoring

This document describes the refactoring of the Lens2 (LogitLens) and ActivationPatching (LinePlot) visualization components from tightly-coupled Next.js code into a standalone, framework-agnostic library under `nnsightful/visualizations/`.

---

## Table of Contents

1. [Motivation](#motivation)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Package Scaffold + Build System](#phase-1-package-scaffold--build-system)
4. [Phase 2: LinePlot Vanilla Core](#phase-2-lineplot-vanilla-core)
5. [Phase 3: LogitLens TypeScript Refactoring](#phase-3-logitlens-typescript-refactoring)
6. [Phase 4: Entry Points + Build Verification](#phase-4-entry-points--build-verification)
7. [Phase 5: Python Jupyter Helper](#phase-5-python-jupyter-helper)
8. [Phase 6: Next.js Consumer Updates](#phase-6-nextjs-consumer-updates)
9. [Issues Encountered and Fixes](#issues-encountered-and-fixes)
10. [Final File Structure](#final-file-structure)

---

## Motivation

Before this refactoring, the visualization code was spread across two locations and tightly coupled to the Next.js app:

- **LogitLens** (`logit-lens-widget.js`): A 3,208-line vanilla JavaScript IIFE loaded via a `<script>` tag from `public/interp-tools/`. The React wrapper (`LogitLensWidgetWrapper.tsx`) injected the script into the DOM, waited for `window.LogitLensWidget` to appear, then called it. This approach bypassed the module system entirely.

- **LinePlotWidget** (`LinePlotWidget.tsx`): A 660-line React component using Canvas 2D rendering, importing `useTheme` from `next-themes`, `Eye`/`EyeOff` icons from `lucide-react`, and Tailwind CSS classes. It was impossible to use outside the Next.js app.

The goals of the refactoring were:

1. **Framework-agnostic cores**: Both widgets should work with plain DOM — no React, no Tailwind, no Next.js required.
2. **Thin React wrappers**: React components that delegate all rendering to the framework-agnostic cores.
3. **Dual build output**: An ESM bundle (externalizing React) for Next.js consumers, and an IIFE bundle (self-contained) for Jupyter notebooks and standalone HTML.
4. **Type safety**: Full TypeScript with exported type definitions.
5. **Jupyter support**: Python helpers that inline the IIFE bundle into `IPython.display.HTML`.

---

## Architecture Overview

```
visualizations/
├── src/
│   ├── types/              # Shared TypeScript interfaces
│   │   ├── logit-lens.ts   # LogitLensData, LogitLensUIState, LogitLensWidgetInterface
│   │   └── line-plot.ts    # LinePlotData, LinePlotMode, LinePlotOptions, LinePlotWidgetInterface
│   │
│   ├── core/               # Framework-agnostic widget implementations
│   │   ├── logit-lens/     # Heatmap + trajectory chart (DOM + SVG)
│   │   └── line-plot/      # Multi-line chart (DOM + Canvas 2D)
│   │
│   ├── react/              # Thin React wrappers
│   │   ├── LogitLensWidget.tsx
│   │   └── LinePlotWidget.tsx
│   │
│   ├── index.ts            # ESM entry: types + cores + React
│   └── standalone.ts       # IIFE entry: window.LogitLensWidget + window.LinePlotWidget
│
├── python/                 # Jupyter display helpers
├── dist/                   # Build output (ESM + IIFE + .d.ts)
├── esbuild.config.mjs      # Dual-build configuration
├── tsconfig.json           # TypeScript (declaration-only emit)
└── package.json            # Package metadata + exports map
```

The key design principle is a **layered architecture**:

```
  Jupyter (Python)  ──>  standalone.ts  ──>  Core classes  (DOM/Canvas/SVG)
  Next.js (React)   ──>  react/*.tsx    ──>  Core classes  (DOM/Canvas/SVG)
```

Both consumption paths share the same core rendering logic. React wrappers are ~70-100 lines each and handle only lifecycle (mount/unmount/update), delegating all DOM manipulation to the core classes.

---

## Phase 1: Package Scaffold + Build System

### package.json

Set up dual exports with React as a peer dependency:

```json
{
  "type": "module",
  "main": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.mjs", "types": "./dist/index.d.ts" },
    "./standalone": "./dist/standalone.js"
  },
  "peerDependencies": {
    "react": "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "typescript": "^5.0.0"
  }
}
```

React is a **peer dependency** — the ESM bundle externalizes it so the host app provides its own copy. The IIFE bundle doesn't include React at all since the standalone widgets are pure DOM.

### tsconfig.json

TypeScript is configured with `emitDeclarationOnly: true`. esbuild handles the actual bundling (it's ~100x faster than `tsc` for this), while `tsc` only generates `.d.ts` declaration files for type-checking consumers.

### esbuild.config.mjs

Two builds run in parallel:

| Build | Entry | Output | Format | React |
|-------|-------|--------|--------|-------|
| ESM | `src/index.ts` | `dist/index.mjs` | ES modules | Externalized |
| IIFE | `src/standalone.ts` | `dist/standalone.js` | IIFE (minified) | Not included |

The ESM build produces 117 KB (with source maps). The IIFE build produces 68 KB minified. Both complete in ~15ms.

---

## Phase 2: LinePlot Vanilla Core

The original `LinePlotWidget.tsx` was a React component that mixed rendering logic with React state management (`useState`, `useCallback`, `useMemo`, `useRef`, `useEffect`), Tailwind CSS classes (`cn()`, `className` strings), `next-themes` (`useTheme`), and lucide-react icons (`Eye`, `EyeOff`).

### Decomposition

The vanilla core was split into focused modules:

| Module | Responsibility |
|--------|---------------|
| `colors.ts` | `LINE_COLORS` palette (8 colors) |
| `utils.ts` | `renderTokenHTML()` for token display with space/newline visualization, `escapeHTML()` |
| `tooltip.ts` | `hitTest()` for nearest-point detection, `createTooltipElement()`, `updateTooltipDOM()` |
| `legend.ts` | `createLegendElement()`, `updateLegend()` with inline SVG eye/eye-off icons (replacing lucide-react) |
| `renderer.ts` | `computeChartConfig()` for axis bounds, `drawChart()` for full Canvas 2D rendering |
| `index.ts` | `LinePlotCore` class orchestrating all modules |

### Key changes from the React version

- **CSS classes replaced with inline styles**: All Tailwind classes (`cn(...)`, `bg-popover/95`, etc.) replaced with equivalent inline CSS on DOM elements.
- **lucide-react icons replaced with inline SVG**: The `Eye` and `EyeOff` toggle icons are now inline SVG strings in `legend.ts`.
- **`useTheme()` replaced with `darkMode` option**: Dark mode is passed as a configuration option rather than read from a React context provider.
- **`useState` → instance properties**: Tooltip state, hidden lines set, resize counter — all managed as properties on the `LinePlotCore` instance.
- **`ResizeObserver` managed directly**: The core creates and disconnects its own `ResizeObserver` in `constructor`/`destroy()`.

### React wrapper (`react/LinePlotWidget.tsx`, ~70 lines)

The wrapper does only three things:
1. Creates a `LinePlotCore` instance in a `useEffect` keyed on `data` identity.
2. Syncs option props via `coreRef.current.setOptions(...)`.
3. Cleans up on unmount via `coreRef.current.destroy()`.

---

## Phase 3: LogitLens TypeScript Refactoring

The original `logit-lens-widget.js` was a single 3,208-line IIFE containing all rendering, interaction, popup, menu, resize, chart, and linking logic in deeply intertwined closures sharing mutable state.

### Strategy: Extract the separable, keep the intertwined

Rather than attempting to fully decompose the IIFE (which would risk breaking the complex interaction model), the approach was:

1. **Extract clearly separable concerns** into standalone modules.
2. **Keep the core widget logic together** in `widget.ts` as a faithful TypeScript port.
3. **Add types everywhere** for safety and editor support.

### Extracted modules

| Module | Lines | Extracted from |
|--------|-------|---------------|
| `normalize.ts` | 80 | V2 → V1 data conversion (`CellData[][]` format) |
| `utils.ts` | 60 | `generateUid`, `escapeHtml`, `niceMax`, `formatPct`, `visualizeSpaces`, `hasSimilarTokensInList` |
| `colors.ts` | 38 | `PALETTE` (8 colors), `LINE_STYLES` (4 dash patterns), `probToColor()` |
| `styles.ts` | 156 | `generateStyles()` (scoped CSS with dark mode), `injectStyles()`, `applyDarkMode()` |
| `state.ts` | 199 | `WidgetState` interface, `createInitialState()`, `emitEvent()`, `addEventListener()`, `removeEventListener()` |

### The main widget file (`widget.ts`, ~2,600 lines)

This file contains `createWidget()` — a faithful port of the original IIFE's closure body. The internal architecture was preserved:

- **Closure-based shared state**: All helper functions close over `widgetData`, `v2Data`, `state`, `dom`, `uid`, etc.
- **DOM queries via `dom` object**: Helper functions like `dom.chart()`, `dom.table()`, `dom.popup()` that query by the scoped `uid` prefix.
- **`buildTable()` as the central render function**: Rebuilds the HTML table, reattaches event listeners, redraws the SVG chart.
- **`drawAllTrajectories()`**: Clears and redraws the entire trajectory SVG on every hover/click/state change.

### V2 → V1 Data Normalization

The LogitLens data comes from the backend in V2 format:

```typescript
interface LogitLensData {
  meta: { version: number; timestamp: string; model: string };
  layers: number[];
  input: string[];        // Input tokens
  tracked: Record<string, number[]>[];  // Per-position: token → probability trajectory
  topk: string[][][];     // [layer][position] → top-k token strings
  entropy?: number[][];   // [layer][position] → entropy value
}
```

The widget internally works with V1 format (`cells[position][layer]`). `normalizeData()` converts V2 to V1 by:
1. Iterating positions × layers.
2. Looking up each topk token's trajectory from `tracked[pos][token]`.
3. Building `CellData` objects with `{ token, prob, trajectory, topk: [...] }`.

### React wrapper (`react/LogitLensWidget.tsx`, ~100 lines)

The wrapper manages:
- Widget creation keyed on `[data, uiState, darkMode]`.
- Dark mode sync via `coreRef.current.setDarkMode(darkMode)`.
- CSS custom properties (`--ll-title-size`, `--ll-content-size`) for font scaling.
- State change callback forwarding via the `on("stateChange", ...)` event system.

---

## Phase 4: Entry Points + Build Verification

### ESM entry (`src/index.ts`)

Exports everything a Next.js consumer needs:

```typescript
export type { LogitLensData, LogitLensUIState, ... } from "./types";
export { LogitLensCore } from "./core/logit-lens";
export { LinePlotCore } from "./core/line-plot";
export { LogitLensWidget } from "./react/LogitLensWidget";
export { LinePlotWidget } from "./react/LinePlotWidget";
```

### IIFE entry (`src/standalone.ts`)

Creates backward-compatible factory functions on `window`:

```typescript
window.LogitLensWidget = (container, data, uiState?) => new LogitLensCore(container, data, uiState);
window.LinePlotWidget = (container, data, options?) => new LinePlotCore(container, data, options);
```

### Build output

```
dist/index.mjs        117.4 KB  (ESM, React externalized)
dist/standalone.js      67.6 KB  (IIFE, minified, self-contained)
dist/index.d.ts                  (TypeScript declarations)
```

---

## Phase 5: Python Jupyter Helper

`python/interp_tools_viz/__init__.py` provides two functions:

- `display_logit_lens(data, ui_state=None, dark_mode=False)` — Renders a LogitLens heatmap + trajectory chart.
- `display_line_plot(data, options=None)` — Renders a LinePlot chart.

Both work by:
1. Loading `dist/standalone.js` (cached after first read).
2. Inlining it into an HTML string with a container `<div>` and a `<script>` block.
3. The script calls `window.LogitLensWidget()` or `window.LinePlotWidget()` with the serialized data.
4. Returning `IPython.display.HTML(html)`.

This makes the visualization fully self-contained — a single notebook cell output contains all JS needed.

---

## Phase 6: Next.js Consumer Updates

### Dependency setup

The `interp-tools` package is linked via a `postinstall` script in `_web/package.json`:

```json
"postinstall": "rm -rf node_modules/interp-tools && ln -s ../../../nnsightful/visualizations node_modules/interp-tools"
```

A `file:` dependency was initially used but abandoned because **bun creates per-file symlinks** (each `.js`, `.json` gets its own symlink), which Turbopack cannot follow. A direct directory symlink works instead.

### Turbopack configuration

Turbopack auto-detects its filesystem root by finding `bun.lock`. Since `bun.lock` lives in `_web/`, Turbopack's root was `workbench/_web/` — but the symlink points to `../../nnsightful/visualizations` which is **outside** that root. This caused `"Invalid symlink"` errors.

Fix in `next.config.js`:

```javascript
turbopack: {
    root: path.join(__dirname, "..", ".."),  // Expand to repo root
},
transpilePackages: ["interp-tools"],
```

### Updated imports

**`Lens2Display.tsx`** — Before:
```tsx
import { LogitLensWidgetWrapper } from "./LogitLensWidgetWrapper";
// ...
<LogitLensWidgetWrapper data={data} darkMode={isDarkMode} />
```

After:
```tsx
import { LogitLensWidget } from "interp-tools";
import type { LogitLensData } from "interp-tools";
// ...
<LogitLensWidget data={data as LogitLensData} darkMode={isDarkMode} className="w-full min-h-[400px]" />
```

**`ActivationPatchingDisplay.tsx`** — Before:
```tsx
import { LinePlotWidget } from "./LinePlotWidget";
// (dark mode was handled internally via useTheme)
```

After:
```tsx
import { LinePlotWidget } from "interp-tools";
import { useTheme } from "next-themes";
// ...
const { resolvedTheme } = useTheme();
const isDarkMode = resolvedTheme === "dark";
// ...
<LinePlotWidget ... darkMode={isDarkMode} />
```

### Type consolidation

`lens2.ts` types now re-export from `interp-tools`:

```typescript
import type { LogitLensData, LogitLensUIState } from "interp-tools";
export type Lens2Data = LogitLensData;
export type Lens2UIState = LogitLensUIState;
```

API-specific types (`Lens2ConfigData`) remain local.

### Deleted files

| File | Reason |
|------|--------|
| `LogitLensWidgetWrapper.tsx` | Replaced by `LogitLensWidget` from `interp-tools` |
| `LinePlotWidget.tsx` (activation-patching) | Replaced by `LinePlotWidget` from `interp-tools` |
| `public/interp-tools/logit-lens-widget.js` | No longer loaded via `<script>` tag |
| `nnsightful/visualizations/src/logit-lens-widget.js` | Replaced by TypeScript modules in `core/logit-lens/` |

---

## Issues Encountered and Fixes

### 1. TypeScript double-cast for V2 data normalization

**Error**: `Conversion of type 'LogitLensData' to type 'Record<string, unknown>' may be a mistake`

**Fix**: Used double-cast `data as unknown as Record<string, unknown>` in `normalize.ts` to check for V1 `cells` property on V2-typed data.

### 2. Stale old `LogitLensWidget.tsx` causing TS errors

**Error**: TypeScript found the old `src/LogitLensWidget.tsx` (the original React wrapper) alongside the new `src/react/LogitLensWidget.tsx`.

**Fix**: Deleted the old file. The new module structure under `src/react/` is the replacement.

### 3. Bun `file:` dependency + Turbopack symlink incompatibility

**Error**: `Module not found: Can't resolve 'interp-tools'` — `Invalid symlink` when Turbopack tried to read `package.json` through bun's per-file symlinks.

**Fix (two parts)**:
- Replaced `file:` dependency with a `postinstall` script creating a direct directory symlink.
- Added `turbopack.root` to `next.config.js` pointing to the repo root, so the symlinked `nnsightful/visualizations/` directory falls within Turbopack's filesystem scope.

### 4. SVG `dataset` property is read-only

**Error**: `TypeError: Cannot set property dataset of #<SVGElement> which has only a getter` — occurred inside `drawAllTrajectories()` when setting up x-axis tick labels.

This crashed the entire trajectory drawing function, meaning **no lines appeared on the chart** — not on hover, not on click, not on pin.

**Root cause**: The TS port used `tickGroup.dataset = { layerIdx: ... }` which works on HTML elements but not SVG elements. SVG elements have a read-only `dataset` getter.

**Fix**: Changed to `tickGroup.setAttribute("data-layer-idx", String(layerIdx))`. The attribute was set but never read back from the DOM (the `layerIdx` value was captured by closure in the mousedown handler), so this was a straightforward fix.

---

## Final File Structure

```
visualizations/
├── package.json                    # Package config with dual exports
├── tsconfig.json                   # TS config (declaration-only emit)
├── esbuild.config.mjs              # ESM + IIFE dual build
├── .gitignore                      # dist/, node_modules/
│
├── src/
│   ├── index.ts                    # ESM entry
│   ├── standalone.ts               # IIFE entry (window globals)
│   │
│   ├── types/
│   │   ├── index.ts                # Re-exports
│   │   ├── logit-lens.ts           # LogitLensData, LogitLensUIState, LogitLensWidgetInterface
│   │   └── line-plot.ts            # LinePlotData, LinePlotMode, LinePlotOptions
│   │
│   ├── core/
│   │   ├── line-plot/
│   │   │   ├── index.ts            # LinePlotCore class
│   │   │   ├── colors.ts           # LINE_COLORS palette
│   │   │   ├── utils.ts            # renderTokenHTML, escapeHTML
│   │   │   ├── tooltip.ts          # hitTest, tooltip DOM
│   │   │   ├── legend.ts           # Legend with inline SVG icons
│   │   │   └── renderer.ts         # Canvas 2D chart rendering
│   │   │
│   │   └── logit-lens/
│   │       ├── index.ts            # LogitLensCore class
│   │       ├── normalize.ts        # V2 → V1 data conversion
│   │       ├── utils.ts            # Utility functions
│   │       ├── colors.ts           # PALETTE, LINE_STYLES, probToColor
│   │       ├── styles.ts           # Scoped CSS generation + injection
│   │       ├── state.ts            # WidgetState, createInitialState, events
│   │       └── widget.ts           # Main widget engine (~2,600 lines)
│   │
│   └── react/
│       ├── index.ts                # Re-exports
│       ├── LogitLensWidget.tsx      # Thin React wrapper (~100 lines)
│       └── LinePlotWidget.tsx       # Thin React wrapper (~70 lines)
│
├── python/
│   └── interp_tools_viz/
│       └── __init__.py             # display_logit_lens(), display_line_plot()
│
└── dist/                           # Build output
    ├── index.mjs                   # ESM bundle (117 KB)
    ├── standalone.js               # IIFE bundle (68 KB, minified)
    ├── index.d.ts                  # Type declarations
    └── ...                         # Per-module .d.ts files
```
