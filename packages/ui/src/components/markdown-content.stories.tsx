import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { MarkdownExample } from "./extended-examples";
import { MarkdownContent } from "./markdown-content";
const meta = {
  title: "Components/MarkdownContent",
  component: MarkdownExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "本文の安全な表示。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof MarkdownExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const UnsafeMarkup: Story = {
  render: () => (
    <MarkdownContent
      source={
        "## 案内\n\n[危険](javascript:alert(1))\n\n<script>alert(1)</script>\n\n[正規のリンク](https://example.com/)"
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "https://example.com/");
    await expect(canvasElement.querySelector("script")).toBeNull();
  },
};
