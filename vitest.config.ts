import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["light", "dark"].flatMap((theme) =>
      [1280, 320].map((width) => ({
        plugins: [
          storybookTest({
            configDir: "apps/storybook/.storybook",
            initialGlobals: { theme },
          }),
        ],
        test: {
          name: `storybook-${theme}${width === 320 ? "-narrow" : ""}`,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            viewport: { width, height: 740 },
          },
        },
      })),
    ),
  },
});
