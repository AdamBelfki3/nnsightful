// Bundles tests/js/*.test.ts with esbuild and runs them with node's built-in
// test runner (no test framework dependency).
import * as esbuild from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const entries = readdirSync(here).filter((f) => f.endsWith(".test.ts")).map((f) => join(here, f));
const outdir = mkdtempSync(join(tmpdir(), "nnsightful-js-tests-"));
try {
    await esbuild.build({
        entryPoints: entries,
        outdir,
        bundle: true,
        platform: "node",
        format: "esm",
        outExtension: { ".js": ".mjs" },
        logLevel: "warning",
    });
    const files = readdirSync(outdir).filter((f) => f.endsWith(".mjs")).map((f) => join(outdir, f));
    const { status } = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
    process.exitCode = status ?? 1;
} finally {
    rmSync(outdir, { recursive: true, force: true });
}
