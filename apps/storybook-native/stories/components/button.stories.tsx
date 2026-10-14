import type { Meta, StoryObj } from "@storybook/react-native";

import { Button } from "@kyudaisai/ui-native";
import { fn } from "storybook/test";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { title: "下書きを保存", onPress: fn() },
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "ghost", "destructive"] },
  },
  parameters: {
    notes: "操作の結果が分かる名前を付けます。処理中は二重実行を防ぎ、結果を別の領域に残します。",
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Secondary: Story = { args: { variant: "outline", title: "内容を見直す" } };
export const Destructive: Story = { args: { variant: "destructive", title: "予約を取り消す" } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, title: "保存中" } };
export const LongLabel: Story = { args: { title: "入力した内容を保存して、後から編集を再開する" } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
