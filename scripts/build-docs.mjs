import { spawn } from "node:child_process";
import { access, cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const docs = fileURLToPath(new URL("../apps/docs/", import.meta.url));
const staging = await mkdtemp(join(docs, ".build-"));

// A normal build produces search and AI indexes. Blume's --isolated mode
// skips them, so build in a temporary workspace without touching blume dev.
try {
  await cp(join(docs, "blume.config.ts"), join(staging, "blume.config.ts"));
  await cp(join(docs, "theme.css"), join(staging, "theme.css"));
  await writeFile(join(staging, "package.json"), '{"type":"module"}\n');
  await symlink(join(docs, "content"), join(staging, "content"));
  await symlink(join(docs, "node_modules"), join(staging, "node_modules"));
  await new Promise((resolve, reject) => {
    const child = spawn(join(docs, "node_modules/.bin/blume"), ["build"], {
      cwd: staging,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Blume build exited ${code}`)),
    );
  });
  for (const file of ["llms.txt", "llms-full.txt", "blume-search.json"]) {
    await access(join(staging, "dist", file));
  }
  await rm(join(docs, "dist"), { recursive: true, force: true });
  await cp(join(staging, "dist"), join(docs, "dist"), { recursive: true });
} finally {
  await rm(staging, { recursive: true, force: true });
}
