import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    projects: ["light", "dark"].map((theme) => ({
      plugins: [
        storybookTest({
          configDir: "apps/storybook/.storybook",
          initialGlobals: { theme },
        }),
      ],
      test: {
        name: `storybook-${theme}`,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: "chromium" }],
        },
      },
    })),
  },
});
