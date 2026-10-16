import { parse } from "parse5";

export function extractReferences(html) {
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
