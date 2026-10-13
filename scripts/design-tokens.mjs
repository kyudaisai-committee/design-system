import { readFile, writeFile } from "node:fs/promises";
import { parse, stringify } from "yaml";

const documentPath = new URL(
  "../apps/docs/content/system/DESIGN.md",
  import.meta.url,
);
const cssPath = new URL(
  "../packages/ui/src/styles/tokens.css",
  import.meta.url,
);

function declarations(block) {
  if (!block) throw new Error("Token theme block was not found");
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim().replace(/\s+/g, " "),
    ]),
  );
}

export async function designTokenIndex() {
  const css = await readFile(cssPath, "utf8");
  const light = declarations(
    css.match(/\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)?.[1],
  );
  const dark = {
    ...light,
    ...declarations(css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1]),
  };
  function resolve(theme, name, visited = []) {
    if (visited.includes(name)) throw new Error(`Cyclic token: ${name}`);
    const value = theme[name];
    if (value === undefined) throw new Error(`Missing token: ${name}`);
    return value.replace(/var\(--([\w-]+)\)/g, (_, ref) =>
      resolve(theme, ref, [...visited, name]),
    );
  }
  const colorNames = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "border",
    "input",
    "ring",
    "destructive",
    "destructive-foreground",
    "success",
    "success-background",
    "warning",
    "warning-background",
    "danger",
    "danger-background",
    "info",
    "info-background",
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring",
  ];
  const colors = Object.fromEntries([
    ...[...colorNames].map((name) => [name, resolve(light, name)]),
    ...colorNames.map((name) => [`dark-${name}`, resolve(dark, name)]),
  ]);
  const typography = Object.fromEntries(
    [
      ["title", "text-title", "font-weight-semibold", "line-height-heading"],
      ["heading", "text-lg", "font-weight-semibold", "line-height-heading"],
      ["body", "text-base", "font-weight-normal", "line-height-body"],
      ["label", "text-sm", "font-weight-medium", "line-height-body"],
      ["caption", "text-sm", "font-weight-normal", "line-height-body"],
    ].map(([name, size, weight, line]) => [
      name,
      {
        fontFamily: resolve(light, "font-sans"),
        fontSize: resolve(light, size),
        fontWeight: Number(resolve(light, weight)),
        lineHeight: Number(resolve(light, line)),
      },
    ]),
  );
  const spacing = Object.fromEntries(
    [1, 2, 3, 4, 6, 8, 12].map((n) => [
      `step-${n}`,
      resolve(light, `space-${n}`),
    ]),
  );
  const rounded = Object.fromEntries(
    ["none", "sm", "md", "lg", "xl"].map((name) => [
      name,
      resolve(light, `radius-${name}`),
    ]),
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
    console.log("System DESIGN.md: token index synchronized from tokens.css");
  } else {
    const mismatched = Object.keys(expected).filter(
      (group) =>
        JSON.stringify(metadata[group]) !== JSON.stringify(expected[group]),
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
