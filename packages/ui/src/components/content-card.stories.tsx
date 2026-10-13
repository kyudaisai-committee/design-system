import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentCard, StatusBadge } from "./compositions";

const meta = {
  title: "Components/ContentCard",
  component: ContentCard,
  args: {
    children: (
      <>
        <h2>当日の集合場所</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          <dt className="text-muted-foreground">日時</dt>
          <dd>
            <time dateTime="2026-10-31T08:30:00+09:00">10月31日 8:30</time>
          </dd>
          <dt className="text-muted-foreground">場所</dt>
          <dd>センター2号館 1階ロビー</dd>
        </dl>
        <p>受付で企画番号をお伝えください。</p>
      </>
    ),
  },
  argTypes: {
    children: {
      control: false,
      description: "見出し・本文・関連する状態など、一つの対象に属する内容。",
    },
    className: {
      control: false,
      description: "外側の幅などを調整するクラス。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "見出しや本文を、共通の内側余白を持つ領域にまとめます。内容を直接並べる簡単な概要表示に使います。ヘッダー・本文・フッターごとに構成する場合はCardを使います。",
      },
    },
  },
  render: (args) => <ContentCard {...args} className="max-w-md" />,
} satisfies Meta<typeof ContentCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "基本" };
export const WithStatus: Story = {
  name: "対象と状態",
  args: {
    children: (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2>企画申請書</h2>
          <StatusBadge>審査中</StatusBadge>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          <dt className="text-muted-foreground">企画名</dt>
          <dd>九大カフェ</dd>
          <dt className="text-muted-foreground">受付番号</dt>
          <dd>A-2026-001</dd>
          <dt className="text-muted-foreground">提出日時</dt>
          <dd>
            <time dateTime="2026-10-05T14:30:00+09:00">10月5日 14:30</time>
          </dd>
        </dl>
      </>
    ),
  },
};
export const LongContent: Story = {
  name: "長い名称と本文",
  args: {
    children: (
      <>
        <h2>九州大学の研究を体験できる科学実験とワークショップ</h2>
        <p>
          身近な道具を使った実験と研究紹介を行います。小さなお子さまが参加する場合は保護者の方が付き添ってください。
        </p>
        <p className="text-sm text-muted-foreground">所要時間：約30分</p>
      </>
    ),
  },
};
