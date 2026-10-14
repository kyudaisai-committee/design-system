import { lint } from "@google/design.md/linter";
import { readFile } from "node:fs/promises";

import { checkTokenIndex } from "./design-tokens.mjs";

const sections = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
];
const paths = [
  "system/DESIGN.md",
  ...[74, 75, 76, 77, 78, 79].map((year) => `websites/${year}th/DESIGN.md`),
];
let failures = 0;
for (const path of paths) {
  const source = await readFile(new URL(`../apps/docs/content/${path}`, import.meta.url), "utf8");
  const report = lint(source);
  const ordered = JSON.stringify(report.sections) === JSON.stringify(sections);
  const problems = report.findings.filter((finding) => finding.severity !== "info");
  console.log(
    `${path}: ${report.summary.errors} errors, ${report.summary.warnings} warnings; section order ${ordered ? "OK" : "INVALID"}`,
  );
  for (const finding of problems) console.log(`  ${finding.rule}: ${finding.message}`);
  if (!ordered || report.summary.errors || report.summary.warnings) failures++;
}
await checkTokenIndex();
console.log("System token index: matches canonical token source");
if (failures) process.exitCode = 1;
