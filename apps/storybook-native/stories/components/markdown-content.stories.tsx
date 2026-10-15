import type { Meta, StoryObj } from "@storybook/react-native";

import { MarkdownExample } from "./extended-examples";
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
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
