import type { Meta, StoryObj } from "@storybook/react-vite";

import { CircleAlert, Info } from "lucide-react";
import { expect, within } from "storybook/test";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

const meta = {
  title: "Components/Alert",
  component: Alert,
  subcomponents: { AlertTitle, AlertDescription, AlertAction },
  args: { variant: "default", role: "status" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "destructive"],
      table: { defaultValue: { summary: "default" } },
    },
    role: {
      control: "select",
      options: ["status", "alert", "note"],
      description:
        "通常の更新は status、直ちに伝える失敗は alert、静的な補足は note。部品の初期値は alert。",
      table: { defaultValue: { summary: "alert" } },
    },
    children: {
      control: false,
      description: "AlertTitle、AlertDescription、必要な場合のみ AlertAction。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "案内や操作結果を画面内に表示します。AlertTitleに要点、AlertDescriptionに理由や次の行動を書きます。案内・完了・注意・失敗に対応する色を使う場合は、Noticeを選びます。\n\n読み上げの優先度はroleで指定します。初期値は`alert`のため、静的な補足には`note`、通常の操作結果には`status`を指定してください。",
      },
    },
  },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <Info aria-hidden="true" />
      <AlertTitle>受付を開始しました</AlertTitle>
      <AlertDescription>企画申請書を10月20日 17:00までに提出してください。</AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Destructive: Story = {
  name: "エラー",
  args: { variant: "destructive", role: "alert" },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>保存できませんでした</AlertTitle>
      <AlertDescription>
        入力内容は残っています。接続を確認して、もう一度保存してください。
      </AlertDescription>
    </Alert>
  ),
};
export const WithAction: Story = {
  name: "操作付き",
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <AlertTitle>新しい提出内容があります</AlertTitle>
      <AlertDescription>表示を更新して内容を確認してください。</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          更新
        </Button>
      </AlertAction>
    </Alert>
  ),
};
export const LongContent: Story = {
  name: "複数の案内",
  args: { role: "note" },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <Info aria-hidden="true" />
      <AlertTitle>提出前に確認してください</AlertTitle>
      <AlertDescription>
        <ul className="list-disc space-y-1 pl-5">
          <li>企画名はパンフレットに掲載する名称と一致させてください。</li>
          <li>当日連絡が取れる責任者の電話番号を入力してください。</li>
          <li>添付する会場配置図に、出入口と避難経路を記載してください。</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
};

export const LongAction: Story = {
  name: "狭い領域の操作付き案内",
  render: (args) => (
    <div style={{ width: 256, maxWidth: "100%" }}>
      <Alert {...args}>
        <Info aria-hidden="true" />
        <AlertTitle>新しい提出内容があります</AlertTitle>
        <AlertDescription>最新の回答を読み込んで、変更内容を確認してください。</AlertDescription>
        <AlertAction>
          <Button variant="outline">最新の提出内容を読み込む</Button>
        </AlertAction>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button").getBoundingClientRect();
    const description = canvas
      .getByText("最新の回答を読み込んで、変更内容を確認してください。")
      .getBoundingClientRect();
    const alert = canvas.getByRole("status");
    await expect(button.top).toBeGreaterThanOrEqual(description.bottom);
    await expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth);
  },
};
