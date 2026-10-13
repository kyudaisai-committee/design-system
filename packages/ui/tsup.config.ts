import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  external: ["react", "react-dom"],
  // tsup 8 injects baseUrl into declaration bundling; TypeScript 6 deprecates it.
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
});
