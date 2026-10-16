import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { parse } from "parse5";

const root = resolve("dist");
const storyIndex = JSON.parse(await readFile(join(root, "storybook/index.json"), "utf8"));
const failures = new Set();
let checked = 0;

function extractReferences(html) {
  const references = [];
  const pending = [parse(html)];

  while (pending.length > 0) {
    const node = pending.pop();
    for (const attribute of node.attrs ?? []) {
      if (attribute.name === "href" || attribute.name === "src") {
        references.push(attribute.value);
      }
    }

    for (const childNodes of [node.childNodes, node.content?.childNodes]) {
      for (let index = (childNodes?.length ?? 0) - 1; index >= 0; index--) {
        pending.push(childNodes[index]);
      }
    }
  }

  return references;
}

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "storybook") await visit(file);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    const html = await readFile(file, "utf8");
    const page = relative(root, file)
      .replaceAll("\\", "/")
      .replace(/index\.html$/, "");
    for (const href of extractReferences(html)) {
      const url = new URL(href, `https://site.invalid/${page}`);
      if (url.origin !== "https://site.invalid") continue;
      checked++;
      const path = decodeURIComponent(url.pathname);
      if (path.startsWith("/storybook/")) {
        const id = url.searchParams.get("path")?.split("/").at(-1);
        if (id && !storyIndex.entries[id]) failures.add(`${page} → ${href}`);
        continue;
      }
      let destination = join(root, path);
      try {
        if ((await stat(destination)).isDirectory()) destination = join(destination, "index.html");
        await stat(destination);
        if (url.hash && destination.endsWith(".html")) {
          const target = await readFile(destination, "utf8");
          const anchor = decodeURIComponent(url.hash.slice(1));
          if (!target.includes(`id="${anchor}"`)) failures.add(`${page} → ${href}`);
        }
      } catch {
        failures.add(`${page} → ${href}`);
      }
    }
  }
}

await visit(root);
assert.equal(failures.size, 0, `Published links are missing:\n${[...failures].join("\n")}`);
console.log(
  `Published site: ${checked} internal links, images, anchors and Storybook destinations checked`,
);
