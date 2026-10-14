import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { designTokenIndex } from "./design-tokens.mjs";
import {
  buildTokens,
  colorToNative,
  lengthToNative,
  nativeTokenValues,
  readTokenSource,
  renderWebCss,
  resolveToken,
  themeValues,
} from "./token-build.mjs";

const source = await readTokenSource();
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

test("Web migration preserves every selector and declaration from the CSS baseline", () => {
  const css = renderWebCss(source).replace(/^\/\*[\s\S]*?\*\/\n/, "");
  // Captured from the existing CSS before migration, excluding only its comment.
  // Intentional future token changes require reviewing and updating this baseline.
  assert.equal(sha256(css), "2ec3580de962586435a1326e3de8ad3bf8f1a5b69cee71792a0ff427af277acc");
});

test("designTokenIndex keeps its existing values, keys, and value types", async () => {
  const index = await designTokenIndex();
  assert.equal(
    sha256(JSON.stringify(index)),
    "5ba617bccf753c702882d6adfc19f67b2e9f4fe1d0329742cc4c4d0004ed4b67",
  );
  assert.equal(index.colors["dark-sidebar-foreground"], "oklch(0.985 0 0)");
  assert.equal(index.typography.body.lineHeight, 1.65);
  assert.equal(index.rounded.lg, "0.625rem");
});

test("neutral OKLCH uses the sRGB transfer curve rather than linear channel scaling", () => {
  for (const [oklch, hex] of [
    ["oklch(0 0 0)", "#000000"],
    ["oklch(1 0 0)", "#ffffff"],
    ["oklch(0.145 0 0)", "#0a0a0a"],
    ["oklch(0.205 0 0)", "#171717"],
    ["oklch(0.5 0 0)", "#636363"],
    ["oklch(50% 0 240)", "#636363"],
    ["oklch(0.922 0 0)", "#e5e5e5"],
    ["oklch(0.985 0 0)", "#fafafa"],
  ]) {
    assert.equal(colorToNative(oklch), hex);
  }
  assert.equal(colorToNative("#FfF"), "#ffffff");
  assert.equal(colorToNative("#AbCd"), "#aabbccdd");
  assert.equal(colorToNative("#F0FDF4"), "#f0fdf4");
  assert.equal(colorToNative("#ffffffaa"), "#ffffffaa");
});

test("unsupported colors fail instead of silently losing chroma or alpha", () => {
  assert.throws(() => colorToNative("oklch(0.7 0.2 30)"), /neutral OKLCH only/);
  assert.throws(() => colorToNative("oklch(1.1 0 0)"), /Invalid OKLCH/);
  assert.throws(() => colorToNative("oklch(0.5 0 0 / 0.5)"), /Unsupported native color/);
  assert.throws(() => colorToNative("var(--foreground)"), /Unsupported native color/);
  assert.throws(() => colorToNative("#zzzzzz"), /Unsupported native color/);
});

test("native lengths use the configured rem baseline and reject unresolved CSS", () => {
  assert.equal(lengthToNative("0.625rem", 16), 10);
  assert.equal(lengthToNative("2.75rem", 16), 44);
  assert.equal(lengthToNative("1rem", 20), 20);
  assert.equal(lengthToNative("3px", 20), 3);
  assert.equal(lengthToNative("0px"), 0);
  assert.throws(() => lengthToNative("calc(1rem + 2px)"), /Unsupported native length/);
  assert.throws(() => lengthToNative("44pt"), /Unsupported native length/);
  assert.throws(() => lengthToNative("1rem", 0), /Unsupported native length/);
});

test("theme aliases resolve against dark overrides and fail for missing or cyclic values", () => {
  const light = themeValues(source, "light");
  const dark = themeValues(source, "dark");
  assert.equal(resolveToken(light, "sidebar-foreground"), "oklch(0.145 0 0)");
  assert.equal(resolveToken(dark, "sidebar-foreground"), "oklch(0.985 0 0)");
  assert.equal(resolveToken(dark, "sidebar"), "oklch(0.205 0 0)");
  assert.throws(() => resolveToken({ a: "var(--missing)" }, "a"), /Missing token: missing/);
  assert.throws(() => resolveToken({ a: "var(--b)", b: "var(--a)" }, "a"), /Cyclic token/);
  assert.throws(() => themeValues(source, "unknown"), /Unknown token theme/);
});

test("native typography, spacing, radii, sizes, and motion use native units", () => {
  const tokens = nativeTokenValues(source);
  assert.deepEqual(tokens.typography.body, { fontSize: 16, fontWeight: "400", lineHeight: 26.4 });
  assert.deepEqual(tokens.typography.title, { fontSize: 28, fontWeight: "600", lineHeight: 39.2 });
  assert.deepEqual(tokens.typography.label, { fontSize: 14, fontWeight: "500", lineHeight: 23.1 });
  assert.deepEqual(tokens.spacing, { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48 });
  assert.deepEqual(tokens.radii, { none: 0, sm: 6, md: 8, lg: 10, xl: 14 });
  assert.deepEqual(tokens.sizes, { controlHeight: 44, contentWidth: 1152 });
  assert.deepEqual(tokens.motion, { fast: 120 });
  assert.equal(tokens.colors.light.primaryForeground, "#fafafa");
  assert.equal(tokens.colors.dark.sidebarForeground, "#fafafa");
  assert.equal(tokens.colors.dark.sidebar, "#171717");
});

test("generated TypeScript exports the full native token set without Web font families", async () => {
  const { nativeTokens, ...exports } = await import("../packages/tokens/src/native.ts");
  assert.deepEqual(nativeTokens, nativeTokenValues(source));
  assert.deepEqual(exports, nativeTokens);
  for (const style of Object.values(nativeTokens.typography)) {
    assert.equal(Object.hasOwn(style, "fontFamily"), false);
  }
});

test("generated files match the canonical source", async () => {
  await buildTokens({ check: true });
});

test("sync check detects edited or missing artifacts and never overwrites them", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "kyudaisai-token-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const cssPath = join(directory, "tokens.css");
  const nativePath = join(directory, "native.ts");
  await buildTokens({ cssPath, nativePath });
  await buildTokens({ check: true, cssPath, nativePath });

  await writeFile(cssPath, "edited CSS\n");
  await assert.rejects(
    buildTokens({ check: true, cssPath, nativePath }),
    /tokens\.css.*Run pnpm tokens:build/,
  );
  assert.equal(await readFile(cssPath, "utf8"), "edited CSS\n");
  await buildTokens({ cssPath, nativePath });
  await rm(nativePath);
  await assert.rejects(
    buildTokens({ check: true, cssPath, nativePath }),
    /native\.ts.*Run pnpm tokens:build/,
  );
});

test("a canonical token change updates both Web and native artifacts", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "kyudaisai-token-source-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourcePath = join(directory, "tokens.json");
  const cssPath = join(directory, "tokens.css");
  const nativePath = join(directory, "native.ts");
  await writeFile(sourcePath, JSON.stringify(source));
  await buildTokens({ sourcePath, cssPath, nativePath });

  const changed = structuredClone(source);
  changed.themes.light.values["space-4"] = "1.25rem";
  await writeFile(sourcePath, JSON.stringify(changed));
  await assert.rejects(
    buildTokens({ check: true, sourcePath, cssPath, nativePath }),
    /tokens\.css.*native\.ts/,
  );
  await buildTokens({ sourcePath, cssPath, nativePath });
  assert.match(await readFile(cssPath, "utf8"), /--space-4: 1\.25rem;/);
  assert.match(await readFile(nativePath, "utf8"), /"4": 20/);
  await buildTokens({ check: true, sourcePath, cssPath, nativePath });
});
