import type { Meta, StoryObj } from "@storybook/react-native";

import { Progress } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: { label: "資料を送信中", value: 45 },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Determinate: Story = {};
export const Indeterminate: Story = { args: { label: "読み込み中", value: undefined } };
export const Complete: Story = { args: { label: "資料を送信しました", value: 100 } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
