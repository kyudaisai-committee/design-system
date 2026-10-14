import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { LoadingState } from "./compositions";

const meta = {
  title: "Components/LoadingState",
  component: LoadingState,
  args: { label: "企画一覧を読み込んでいます" },
  argTypes: {
    label: {
      control: "text",
      description: "読み込んでいる対象を伝える読み上げ名。",
      table: { defaultValue: { summary: "読み込み中" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "データを読み込んでいる間、内容の代わりにSkeletonを表示します。`label`には「申請一覧を読み込み中」のように対象を含め、読み上げでも状況が分かるようにします。\n\n周囲の見出しは残してください。取得後は内容を表示し、0件ならEmptyState、失敗した場合は理由と再試行する操作を表示します。",
      },
    },
  },
  render: (args) => (
    <div className="max-w-xl">
      <LoadingState {...args} />
    </div>
  ),
} satisfies Meta<typeof LoadingState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "企画一覧を読み込んでいます",
      }),
    ).toBeInTheDocument();
  },
};
export const InSection: Story = {
  name: "見出しを残す",
  render: (args) => (
    <section className="ds-stack max-w-xl" aria-labelledby="loading-projects-title">
      <h2 id="loading-projects-title">企画一覧</h2>
      <LoadingState {...args} />
    </section>
  ),
};
export const PartialLoading: Story = {
  name: "一部の内容を取得中",
  args: { label: "申請履歴を読み込んでいます" },
  render: (args) => (
    <div className="ds-stack max-w-xl">
      <header>
        <h2>九大カフェ</h2>
        <p className="ds-hint">企画番号 K-080</p>
      </header>
      <section className="ds-stack" aria-labelledby="loading-history-title">
        <h3 id="loading-history-title">申請履歴</h3>
        <LoadingState {...args} />
      </section>
    </div>
  ),
};
