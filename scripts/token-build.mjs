import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const tokenSourcePath = new URL("../packages/tokens/src/tokens.json", import.meta.url);
const webCssPath = new URL("../packages/ui/src/styles/tokens.css", import.meta.url);
const nativeTsPath = new URL("../packages/tokens/src/native.ts", import.meta.url);
const generatedNotice =
  "Generated from packages/tokens/src/tokens.json. Do not edit; run pnpm tokens:build.";

export async function readTokenSource(path = tokenSourcePath) {
  const source = JSON.parse(await readFile(path, "utf8"));
  if (source.version !== 1) throw new Error("Unsupported token source version");
  if (!Number.isFinite(source.baseFontSize) || source.baseFontSize <= 0) {
    throw new Error("baseFontSize must be a positive number");
  }
  for (const scheme of ["light", "dark"]) {
    const theme = source.themes?.[scheme];
    if (!theme?.values || !theme.selectors?.length) {
      throw new Error(`Missing ${scheme} theme values or selectors`);
    }
    for (const [name, value] of Object.entries(theme.values)) {
      if (!/^[a-z][a-z0-9-]*$/.test(name) || typeof value !== "string") {
        throw new Error(`Invalid ${scheme} token: ${name}`);
      }
    }
  }
  return source;
}

export function themeValues(source, scheme) {
  if (!Object.hasOwn(source.themes, scheme)) {
    throw new Error(`Unknown token theme: ${scheme}`);
  }
  return { ...source.themes.light.values, ...source.themes[scheme].values };
}

export function resolveToken(values, name, visited = []) {
  if (visited.includes(name)) {
    throw new Error(`Cyclic token: ${[...visited, name].join(" -> ")}`);
  }
  const value = values[name];
  if (value === undefined) throw new Error(`Missing token: ${name}`);
  return value.replace(/var\(--([\w-]+)\)/g, (_, ref) =>
    resolveToken(values, ref, [...visited, name]),
  );
}

export function colorToNative(value) {
  const hex = value.match(/^#([a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i);
  if (hex) {
    const digits = hex[1].toLowerCase();
    return `#${digits.length < 5 ? [...digits].map((digit) => digit + digit).join("") : digits}`;
  }

  const oklch = value.match(/^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!oklch) throw new Error(`Unsupported native color: ${value}`);
  const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
  const chroma = Number(oklch[3]);
  const hue = Number(oklch[4]);
  if (!Number.isFinite(lightness) || lightness < 0 || lightness > 1 || !Number.isFinite(hue)) {
    throw new Error(`Invalid OKLCH color: ${value}`);
  }
  if (chroma !== 0) {
    throw new Error(`Native conversion supports neutral OKLCH only: ${value}`);
  }

  // Neutral OKLCH has equal linear sRGB channels of L³. Encode with the
  // CSS Color 4 sRGB transfer function, then round to an 8-bit channel.
  // https://www.w3.org/TR/css-color-4/#color-conversion-code
  const linear = lightness ** 3;
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  const channel = Math.round(encoded * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${channel.repeat(3)}`;
}

export function lengthToNative(value, baseFontSize = 16) {
  const match = value.match(/^(\d+(?:\.\d+)?)(rem|px)$/);
  if (!match || !Number.isFinite(baseFontSize) || baseFontSize <= 0) {
    throw new Error(`Unsupported native length: ${value}`);
  }
  const result = Number(match[1]) * (match[2] === "rem" ? baseFontSize : 1);
  if (!Number.isFinite(result)) throw new Error(`Invalid native length: ${value}`);
  return result;
}

function finiteNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid number for ${name}: ${value}`);
  return number;
}

function camelCase(name) {
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function nativeTokenValues(source) {
  const light = themeValues(source, "light");
  const resolveLight = (name) => resolveToken(light, name);
  const length = (name) => lengthToNative(resolveLight(name), source.baseFontSize);
  const colors = Object.fromEntries(
    ["light", "dark"].map((scheme) => {
      const values = themeValues(source, scheme);
      return [
        scheme,
        Object.fromEntries(
          source.groups.colors.map((name) => [
            camelCase(name),
            colorToNative(resolveToken(values, name)),
          ]),
        ),
      ];
    }),
  );
  const typography = Object.fromEntries(
    Object.entries(source.groups.typography).map(([name, refs]) => {
      const fontSize = length(refs.fontSize);
      const lineHeight = fontSize * finiteNumber(resolveLight(refs.lineHeight), refs.lineHeight);
      const fontWeight = resolveLight(refs.fontWeight);
      if (!/^[1-9]00$/.test(fontWeight)) throw new Error(`Invalid font weight: ${fontWeight}`);
      return [
        name,
        {
          fontSize,
          fontWeight,
          // React Native expects a length, whereas the Web value is a ratio.
          lineHeight: Number(lineHeight.toFixed(6)),
        },
      ];
    }),
  );
  const lengthGroup = (group) =>
    Object.fromEntries(
      Object.entries(source.groups[group]).map(([name, ref]) => [name, length(ref)]),
    );
  const motion = Object.fromEntries(
    Object.entries(source.groups.motion).map(([name, ref]) => {
      const value = resolveLight(ref);
      if (!/^\d+(?:\.\d+)?ms$/.test(value))
        throw new Error(`Unsupported native duration: ${value}`);
      return [name, Number(value.slice(0, -2))];
    }),
  );
  return {
    colors,
    typography,
    spacing: lengthGroup("spacing"),
    radii: lengthGroup("radii"),
    sizes: lengthGroup("sizes"),
    motion,
  };
}

export function renderWebCss(source) {
  const blocks = ["light", "dark"].map((scheme) => {
    const { selectors, colorScheme, values } = source.themes[scheme];
    const declarations = Object.entries(values).map(([name, value]) => {
      const line = `  --${name}: ${value};`;
      return line.length > 80 ? `  --${name}:\n    ${value};` : line;
    });
    return `${selectors.join(",\n")} {\n  color-scheme: ${colorScheme};\n${declarations.join("\n")}\n}`;
  });
  return `/* ${generatedNotice} */\n${blocks.join("\n")}\n`;
}

export function renderNativeTs(source) {
  const tokens = nativeTokenValues(source);
  const declarations = Object.entries(tokens).map(
    ([name, values]) => `export const ${name} = ${JSON.stringify(values, null, 2)} as const;`,
  );
  return `// ${generatedNotice}\n// Lengths use a ${source.baseFontSize}px rem baseline and native density-independent units.\n// Leave fontFamily to the native UI so each OS uses its system font.\n// Typography lineHeight is an absolute length; motion durations are milliseconds.\n\n${declarations.join("\n\n")}\n\nexport type ColorScheme = keyof typeof colors;\nexport type ColorTokens = { [Name in keyof typeof colors.light]: string };\nexport type TypographyRole = keyof typeof typography;\n\nexport const nativeTokens = { colors, typography, spacing, radii, sizes, motion } as const;\n`;
}

export async function buildTokens({
  check = false,
  sourcePath = tokenSourcePath,
  cssPath = webCssPath,
  nativePath = nativeTsPath,
} = {}) {
  const source = await readTokenSource(sourcePath);
  const artifacts = [
    [cssPath, renderWebCss(source)],
    [nativePath, renderNativeTs(source)],
  ];
  const outdated = [];
  for (const [path, expected] of artifacts) {
    const filename = typeof path === "string" ? path : fileURLToPath(path);
    if (check) {
      const actual = await readFile(path, "utf8").catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      if (actual !== expected) outdated.push(filename);
    } else {
      await mkdir(dirname(filename), { recursive: true });
      await writeFile(path, expected);
    }
  }
  if (outdated.length) {
    throw new Error(
      `Generated tokens are out of date: ${outdated.join(", ")}. Run pnpm tokens:build.`,
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  await buildTokens({ check });
  console.log(
    check ? "Web and native tokens match the canonical source" : "Generated Web and native tokens",
  );
}
