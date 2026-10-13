import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  args: { className: "h-5 w-64 max-w-full", "aria-hidden": true },
  argTypes: {
    className: {
      control: "text",
      description: "読み込み後の内容に合わせた幅・高さ。",
    },
    "aria-hidden": {
      control: false,
      description: "装飾自体を読み上げないよう true を指定する。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "読み込み後に表示する内容のおおよその形を示します。読み込んでいる対象は別のテキストで伝え、Skeleton自体には`aria-hidden=\"true\"`を指定してください。\n\n読み上げも含めて表示する場合はLoadingState、処理の進捗率を示す場合はProgressを使います。",
      },
    },
  },
  render: (args) => (
    <div role="status" aria-busy="true">
      <span className="sr-only">企画名を読み込み中</span>
      <Skeleton {...args} />
    </div>
  ),
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const TextBlock: Story = {
  name: "文章",
  render: () => (
    <div role="status" aria-busy="true" className="grid max-w-lg gap-3">
      <span className="sr-only">企画紹介を読み込み中</span>
      <Skeleton aria-hidden="true" className="h-6 w-40" />
      <Skeleton aria-hidden="true" className="h-4 w-full" />
      <Skeleton aria-hidden="true" className="h-4 w-full" />
      <Skeleton aria-hidden="true" className="h-4 w-3/4" />
    </div>
  ),
};
export const Detail: Story = {
  name: "詳細情報",
  render: () => (
    <div role="status" aria-busy="true" className="grid max-w-md gap-5">
      <span className="sr-only">企画情報を読み込み中</span>
      <Skeleton aria-hidden="true" className="aspect-video w-full" />
      <div className="grid gap-3">
        <Skeleton aria-hidden="true" className="h-6 w-3/4" />
        <Skeleton aria-hidden="true" className="h-4 w-full" />
        <Skeleton aria-hidden="true" className="h-4 w-2/3" />
      </div>
    </div>
  ),
};
