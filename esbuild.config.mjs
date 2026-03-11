import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

// Shared config
const common = {
  bundle: true,
  sourcemap: true,
  target: "es2020",
  logLevel: "info",
};

// ESM build — externalize React (consumers provide it)
const esmBuild = {
  ...common,
  entryPoints: ["src/charts/index.ts"],
  outfile: "dist/index.mjs",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom", "react/jsx-runtime"],
};

// IIFE build — self-contained, no React needed
const iifeBuild = {
  ...common,
  entryPoints: ["src/charts/standalone.ts"],
  outfile: "src/nnsightful/viz/charts.js",
  format: "iife",
  globalName: "InterpTools",
  minify: true,
};

if (isWatch) {
  const esmCtx = await esbuild.context(esmBuild);
  const iifeCtx = await esbuild.context(iifeBuild);
  await Promise.all([esmCtx.watch(), iifeCtx.watch()]);
  console.log("Watching for changes...");
} else {
  await Promise.all([esbuild.build(esmBuild), esbuild.build(iifeBuild)]);
}
