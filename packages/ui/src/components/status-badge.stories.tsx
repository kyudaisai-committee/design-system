import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "./compositions";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  args: { children: "審査中", tone: undefined },
  argTypes: {
    children: { control: "text", description: "文字でも意味が分かる状態名。" },
    tone: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
      mapping: { neutral: undefined },
      description: "中立・案内・成功・注意・失敗。省略時は中立です。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "「下書き」「要修正」などの状態名を短く表示します。審査中などの通常の状態は中立色とし、完了・注意・失敗を強調する場合に色を使います。\n\n理由や必要な操作は、近くの本文で説明してください。状態の分類や更新条件は、利用するサービスごとに決めます。",
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "基本" };
export const Tones: Story = {
  name: "意味別の色",
  render: () => (
    <div className="ds-row">
      <StatusBadge>下書き</StatusBadge>
      <StatusBadge>審査中</StatusBadge>
      <StatusBadge tone="info">更新あり</StatusBadge>
      <StatusBadge tone="success">承認済み</StatusBadge>
      <StatusBadge tone="warning">要修正</StatusBadge>
      <StatusBadge tone="danger">受付不可</StatusBadge>
    </div>
  ),
};
export const WithReason: Story = {
  name: "理由を添える",
  args: { children: "要修正", tone: "warning" },
  render: (args) => (
    <div className="ds-stack max-w-md">
      <div>
        <StatusBadge {...args} />
      </div>
      <p>会場配置図に避難経路を追記し、10月20日 17:00までに再提出してください。</p>
    </div>
  ),
};
export const LongLabel: Story = {
  name: "長い状態名",
  args: { children: "会場設備と食品の取扱いについて担当部署が確認中" },
  render: (args) => (
    <div style={{ maxWidth: "16rem" }}>
      <StatusBadge {...args} />
    </div>
  ),
};
