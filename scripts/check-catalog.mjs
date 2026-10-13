import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../packages/ui/src/components/catalog.stories.tsx", import.meta.url),
  "utf8",
);
const index = JSON.parse(
  await readFile(
    new URL("../dist/storybook/index.json", import.meta.url),
    "utf8",
  ),
);
const entries = Object.values(index.entries);
const names = [
  ...source.matchAll(/name:\s*"([A-Z][A-Za-z]+)"\s*,\s*purpose:/g),
].map((match) => match[1]);
const documented = new Set(
  entries
    .filter(
      (entry) => entry.type === "docs" && entry.title.startsWith("Components/"),
    )
    .map((entry) => entry.title.slice("Components/".length)),
);
const missingDocs = names.filter((name) => !documented.has(name));
const missingCatalog = [...documented].filter((name) => !names.includes(name));
if (
  !names.length ||
  new Set(names).size !== names.length ||
  missingDocs.length ||
  missingCatalog.length
) {
  throw new Error(
    `Catalog mismatch. Missing docs: ${missingDocs.join(", ")}; missing catalog entries: ${missingCatalog.join(", ")}`,
  );
}
for (const name of names) {
  const expected = `components-${name.toLowerCase()}--docs`;
  if (!index.entries[expected])
    throw new Error(`Catalog destination missing: ${expected}`);
}
console.log(
  `Component catalog: ${names.length} families, every entry has a Docs page and every Docs page is listed`,
);
