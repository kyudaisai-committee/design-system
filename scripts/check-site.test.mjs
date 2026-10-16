import assert from "node:assert/strict";
import test from "node:test";

import { extractReferences } from "./site-references.mjs";

test("extracts element references and ignores script text and comments", () => {
  const html = `
    <script src="/assets/app.js">
      const markup = '<a href="/script-string"><img src="/script-image">';
    </script >
    <!-- <a href="/comment"> -->
    <script type="text/plain">
      <img src='/raw-script-text'>
    </ScRiPt data-end="yes">
    <a href="/actual">actual</a>
    <img src='/single-quoted'>
    <img src=/unquoted>
    <a href="/query?a=1&amp;b=2">query</a>
  `;

  assert.deepEqual(extractReferences(html), [
    "/assets/app.js",
    "/actual",
    "/single-quoted",
    "/unquoted",
    "/query?a=1&b=2",
  ]);
});

test("reads only parsed elements from malformed and nested markup", () => {
  const html = `
    <div title="<a href='/quoted-attribute'>"></div>
    <a href='/outer'><a href=/inner>nested</a>
    <img src='/valid'>
    <img src='/unfinished'
  `;

  assert.deepEqual(extractReferences(html), ["/outer", "/inner", "/valid"]);
});

test("does not merge markup when script-like text appears in a tag name", () => {
  const html = '<scrip<script>is removed</script>t><a href="/visible">visible</a></script>';

  assert.deepEqual(extractReferences(html), ["/visible"]);
});
