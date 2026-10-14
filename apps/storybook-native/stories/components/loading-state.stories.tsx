import type { Meta, StoryObj } from "@storybook/react-native";

import { LoadingState } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/LoadingState",
  component: LoadingState,
  args: { label: "最新の受付状況を確認しています" },
} satisfies Meta<typeof LoadingState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
