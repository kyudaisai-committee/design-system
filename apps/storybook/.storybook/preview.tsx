import type { Preview } from "@storybook/react-vite";

import "../../../packages/ui/src/styles/styles.css";
import "./catalog.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "表示テーマ",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "ライト" },
          { value: "dark", title: "ダーク" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme;
      document.documentElement.lang = "ja";
      document.body.style.background = "var(--background)";
      return (
        <div className="ds-root sb-preview">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    controls: { expanded: true },
    docs: {
      codePanel: true,
      source: {
        transform: (source: string) =>
          source.replace(
            /icon:\s*\{\s*\$\$typeof: Symbol\(react\.forward_ref\),\s*displayName: ['"](\w+)['"],\s*render: function [\w$]*\(\)\s*\{\}\s*\}/g,
            "icon: $1",
          ),
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Overview",
          ["Component Catalog"],
          "Foundations",
          ["Colors", "Typography", "Spacing", "Shape"],
          "Components",
          "Patterns",
        ],
      },
    },
  },
  tags: ["autodocs"],
};
export default preview;
