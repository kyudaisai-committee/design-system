import { readFile, writeFile } from "node:fs/promises";
import { parse, stringify } from "yaml";

import { readTokenSource, resolveToken, themeValues } from "./token-build.mjs";

const documentPath = new URL("../apps/docs/content/system/DESIGN.md", import.meta.url);
export async function designTokenIndex() {
  const source = await readTokenSource();
  const light = themeValues(source, "light");
  const dark = themeValues(source, "dark");
  const colorNames = source.groups.colors;
  const colors = Object.fromEntries([
    ...colorNames.map((name) => [name, resolveToken(light, name)]),
    ...colorNames.map((name) => [`dark-${name}`, resolveToken(dark, name)]),
  ]);
  const typography = Object.fromEntries(
    Object.entries(source.groups.typography).map(([name, refs]) => [
      name,
      {
        fontFamily: resolveToken(light, refs.fontFamily),
        fontSize: resolveToken(light, refs.fontSize),
        fontWeight: Number(resolveToken(light, refs.fontWeight)),
        lineHeight: Number(resolveToken(light, refs.lineHeight)),
      },
    ]),
  );
  const spacing = Object.fromEntries(
    Object.entries(source.groups.spacing).map(([n, ref]) => [
      `step-${n}`,
      resolveToken(light, ref),
    ]),
  );
  const rounded = Object.fromEntries(
    Object.entries(source.groups.radii).map(([name, ref]) => [name, resolveToken(light, ref)]),
  );
  return {
    colors,
    typography,
    spacing,
    rounded,
    omitted: [
      {
        section: "components",
        reason:
          "部品の構成・状態・使用コードはStorybookで定義する。YAMLには共有する視覚値を記録する。",
      },
    ],
  };
}

export async function checkTokenIndex({ write = false } = {}) {
  const text = await readFile(documentPath, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("System DESIGN.md needs YAML frontmatter");
  const metadata = parse(match[1]);
  const expected = await designTokenIndex();
  if (write) {
    const next = { ...metadata, ...expected };
    delete next.components;
    await writeFile(
      documentPath,
      `---\n${stringify(next, { lineWidth: 0 })}---\n${text.slice(match[0].length)}`,
    );
    console.log("System DESIGN.md: token index synchronized from packages/tokens/src/tokens.json");
  } else {
    const mismatched = Object.keys(expected).filter(
      (group) => JSON.stringify(metadata[group]) !== JSON.stringify(expected[group]),
    );
    if (mismatched.length)
      throw new Error(
        `System DESIGN.md token index is out of date (${mismatched.join(", ")}). Run pnpm design:sync.`,
      );
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await checkTokenIndex({ write: process.argv.includes("--write") });
}
