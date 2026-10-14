import type { Meta, StoryObj } from "@storybook/react-native";

import { Notice } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/Notice",
  component: Notice,
  args: {
    title: "受付期間を確認してください",
    tone: "info",
    children: "受付は10月20日17時までです。",
  },
  parameters: { notes: "案内・完了・注意・失敗を文字で伝えます。重要な結果は画面に残します。" },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Information: Story = {};
export const Success: Story = {
  args: { tone: "success", title: "保存しました", children: "保存日時：10月13日 15:30" },
};
export const Warning: Story = {
  args: {
    tone: "warning",
    title: "入力を見直してください",
    children: "連絡先が入力されていません。",
  },
};
export const Failure: Story = {
  args: {
    tone: "danger",
    title: "保存できませんでした",
    children: "入力内容は保持しています。通信を確認して、もう一度保存してください。",
  },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
