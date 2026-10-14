import type { Meta, StoryObj } from "@storybook/react-native";

import { Badge } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/StatusBadge",
  component: Badge,
  args: { label: "確認中", tone: "neutral" },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Neutral: Story = {};
export const Success: Story = { args: { label: "完了", tone: "success" } };
export const Warning: Story = { args: { label: "要修正", tone: "warning" } };
export const Danger: Story = { args: { label: "処理失敗", tone: "danger" } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
