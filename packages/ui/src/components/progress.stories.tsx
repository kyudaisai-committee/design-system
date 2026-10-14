import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "./progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  subcomponents: {
    ProgressLabel,
    ProgressValue,
    ProgressTrack,
    ProgressIndicator,
  },
  args: { value: 65, min: 0, max: 100, locale: "ja-JP" },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "処理が完了した量。minからmaxの範囲で指定する。進捗が分からない場合はnull。",
    },
    min: { control: "number", table: { defaultValue: { summary: "0" } } },
    max: { control: "number", table: { defaultValue: { summary: "100" } } },
    locale: { control: "text", description: "数値表記のロケール。" },
    children: {
      control: false,
      description: "ProgressLabel と ProgressValue。Track と Indicator は自動で含まれる。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "ファイル送信など、完了した量を測れる処理の進み具合を示します。ProgressLabelで対象を明示し、ProgressValueで割合を表示します。進捗が分からない場合は`value`に`null`を指定してください。\n\n手続きの段階表示にはProcessSteps、内容の読み込み待ちにはLoadingStateを使います。",
      },
    },
  },
  render: (args) => (
    <Progress {...args} className="max-w-md">
      <ProgressLabel>会場配置図を送信中</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole("progressbar", {
      name: "会場配置図を送信中",
    });
    await expect(progress).toHaveAttribute("aria-valuenow", "65");
  },
};
export const Starting: Story = { name: "開始", args: { value: 0 } };
export const Complete: Story = {
  name: "完了",
  args: { value: 100 },
  render: (args) => (
    <Progress {...args} className="max-w-md">
      <ProgressLabel>会場配置図の送信が完了しました</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};
export const Indeterminate: Story = {
  name: "進捗不明",
  args: { value: null },
  render: (args) => (
    <Progress {...args} className="max-w-md">
      <ProgressLabel>会場配置図を確認中</ProgressLabel>
    </Progress>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  },
};
