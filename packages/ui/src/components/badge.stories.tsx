import type { Meta, StoryObj } from "@storybook/react-vite";

import { Utensils, Paperclip } from "lucide-react";
import { expect, within } from "storybook/test";

import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: { children: "模擬店", variant: "default" },
  argTypes: {
    children: {
      control: "text",
      description: "種別や開催回などを表す短い文字。",
    },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
      description: "表示の強さ。状態に応じた色を使う場合はStatusBadgeを使用する。",
      table: { defaultValue: { summary: "default" } },
    },
    render: {
      control: false,
      description: "描画要素を変更する Base UI の render。通常は span。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "種別や開催回など、短い分類を添えます。状態に応じた色を使う場合はStatusBadgeを選びます。通常は操作を伴いません。リンクとして使う場合は、renderにa要素を指定してください。",
      },
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Variants: Story = {
  name: "表示の強さ",
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(["default", "secondary", "destructive", "outline", "ghost", "link"] as const).map(
        (variant) => (
          <div key={variant} className="grid justify-items-start gap-2">
            <span className="text-sm text-muted-foreground">{variant}</span>
            <Badge variant={variant}>模擬店</Badge>
          </div>
        ),
      )}
    </div>
  ),
};
export const WithIcon: Story = {
  name: "アイコン付き",
  render: () => (
    <div className="ds-row">
      <Badge variant="secondary">
        <Utensils aria-hidden="true" data-icon="inline-start" />
        模擬店
      </Badge>
      <Badge variant="outline">
        <Paperclip aria-hidden="true" data-icon="inline-start" />
        添付あり
      </Badge>
    </div>
  ),
};
export const AsLink: Story = {
  name: "リンク",
  args: {
    variant: "link",
    children: "添付資料 3件",
    render: <a href="#attachments" />,
  },
  render: (args) => (
    <div className="ds-stack">
      <Badge {...args} />
      <section id="attachments">
        <h2>添付資料</h2>
        <p>企画書・会場配置図・備品一覧</p>
      </section>
    </div>
  ),
};

export const EnlargedText: Story = {
  name: "文字拡大と長い分類名",
  render: () => (
    <div style={{ width: 256, maxWidth: "100%" }}>
      <Badge style={{ fontSize: "1.5rem" }}>事前申込みが必要なワークショップ</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText("事前申込みが必要なワークショップ");
    await expect(badge.getBoundingClientRect().width).toBeLessThanOrEqual(
      badge.parentElement!.getBoundingClientRect().width,
    );
    await expect(badge.scrollHeight).toBeLessThanOrEqual(badge.clientHeight);
    await expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth);
  },
};
