import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "packages/ui");
const temporary = await mkdtemp(join(tmpdir(), "kyudaisai-package-"));
const modules = join(temporary, "node_modules");
const installed = join(modules, "@kyudaisai/ui");

try {
  const archive = join(temporary, "ui.tgz");
  execFileSync("pnpm", ["--dir", source, "pack", "--out", archive], { stdio: "pipe" });
  await mkdir(installed, { recursive: true });
  execFileSync("tar", ["-xzf", archive, "--strip-components=1", "-C", installed]);
  const manifest = JSON.parse(await readFile(join(installed, "package.json"), "utf8"));

  // Only declared runtime dependencies are visible to the packed package.
  // The existing workspace supplies their installed versions without a second install.
  for (const name of Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })) {
    const destination = join(modules, name);
    await mkdir(dirname(destination), { recursive: true });
    await symlink(await realpath(join(source, "node_modules", name)), destination, "dir");
  }
  for (const name of ["@types/react", "@types/react-dom"]) {
    const destination = join(modules, name);
    await mkdir(dirname(destination), { recursive: true });
    await symlink(await realpath(join(root, "node_modules", name)), destination, "dir");
  }
  await writeFile(join(temporary, "package.json"), '{"private":true,"type":"module"}\n');
  await writeFile(
    join(temporary, "consumer.tsx"),
    `import { Button, Field, Input, DateInput, ProcessSteps, Timeline } from "@kyudaisai/ui";
import { Button as SourceButton } from "@kyudaisai/ui/components/button";
import "@kyudaisai/ui/styles.css";
import "@kyudaisai/ui/tokens.css";
export const example = <div className="ds-root">
  <Field label="Name">{props => <Input {...props}/>}</Field>
  <Button>Save</Button><SourceButton>Source</SourceButton>
  <DateInput value="2026-10-14" onValueChange={() => {}}/>
  <ProcessSteps label="Steps" steps={[{id:"ready", title:"Ready", status:"current"}]}/>
  <Timeline label="History" events={[]}/>
</div>;
`,
  );
  await writeFile(
    join(temporary, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
      },
      include: ["consumer.tsx"],
    }),
  );
  execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "--noEmit"], {
    cwd: temporary,
    stdio: "inherit",
  });
  await writeFile(
    join(temporary, "render.mjs"),
    `import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { Button, DateInput } from "@kyudaisai/ui";
const html = renderToString(createElement(Button, null, "Save"));
assert.match(html, /<button/);
assert.match(html, /Save<\\/button>/);
assert.match(renderToString(createElement(DateInput, { defaultValue: "2026-10-14" })), /2026/);
`,
  );
  execFileSync(process.execPath, [join(temporary, "render.mjs")], { stdio: "inherit" });
  const styles = await readFile(join(installed, "dist/styles.css"), "utf8");
  assert.ok(styles.includes(".ds-root"), "The package must contain compiled component CSS");
  assert.ok(!/@import\s/.test(styles), "The consumer must not need another CSS build");
  console.log(
    "Packed Web package: declared dependencies, strict consumer types, CSS and server rendering pass",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
