import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("apps/docs/dist", "dist", { recursive: true });
await cp("apps/storybook/storybook-static", "dist/storybook", {
  recursive: true,
});
console.log("dist/: Blume at /, Storybook at /storybook/");
