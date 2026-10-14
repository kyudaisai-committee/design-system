import { defineConfig } from "blume";
import { orama } from "blume/search";
import { z } from "zod";

export default defineConfig({
  title: "九大祭 Design System",
  description: "九大祭のWebサイトとシステムに共通する、デザインの考え方と使い方。",
  i18n: { defaultLocale: "ja", locales: [{ code: "ja", label: "日本語" }] },
  content: { root: "content" },
  // DESIGN.md's full schema and token references are checked by design:check.
  frontmatter: {
    extend: {
      name: z.string().optional(),
      version: z.literal("alpha").optional(),
      colors: z.record(z.string(), z.string()).optional(),
      typography: z
        .record(z.string(), z.record(z.string(), z.union([z.string(), z.number()])))
        .optional(),
      spacing: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
      rounded: z.record(z.string(), z.string()).optional(),
      components: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
      omitted: z
        .array(
          z.union([z.string(), z.object({ section: z.string(), reason: z.string().optional() })]),
        )
        .optional(),
    },
  },
  theme: { accent: "#525252", radius: "md", mode: "system" },
  navigation: {
    repo: false,
    sidebar: [
      "index",
      "principles",
      {
        label: "システム",
        items: [
          "system/DESIGN",
          "system/patterns",
          "system/sequences",
          "system/native",
          "system/implementation",
          "system/native-implementation",
        ],
      },
      {
        label: "ホームページ",
        items: [
          "websites/guidelines",
          "websites/74th/DESIGN",
          "websites/75th/DESIGN",
          "websites/76th/DESIGN",
          "websites/77th/DESIGN",
          "websites/78th/DESIGN",
          "websites/79th/DESIGN",
        ],
      },
      "design-format",
    ],
  },
  markdown: {
    code: {
      theme: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    },
  },
  search: orama(),
  feedback: false,
  agents: { llmsTxt: true },
  footer: {
    copyright: "© 2026 Kyudaisai Committee",
    links: [{ label: "Storybook", href: "/storybook/" }],
  },
});
