import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Button } from "./button";

const meta = {
  title: "Components/Card",
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
  args: { size: "default" },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["default", "sm"],
      description: "内容の余白と見出しの大きさ。",
      table: { defaultValue: { summary: "default" } },
    },
    children: {
      control: false,
      description:
        "Header、Content、Footer で内容を構成する。必要な部分だけ使う。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "一つの対象に関する見出し・本文・関連操作をまとめます。同じ項目で複数の対象を比較する場合はTableを使います。\n\n必要に応じてCardHeader・CardContent・CardFooterを組み合わせます。CardTitleは見出し要素ではないため、ページの階層に合う`h2`などを内側に指定してください。",
      },
    },
  },
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h2>企画申請書</h2>
        </CardTitle>
        <CardDescription>九大カフェ · 企画番号 K-080</CardDescription>
        <CardAction>
          <Badge variant="secondary">下書き</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>会場と使用する設備を入力してください。</p>
      </CardContent>
      <CardFooter>
        <Button>入力を続ける</Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Small: Story = { name: "コンパクト", args: { size: "sm" } };
export const WithoutFooter: Story = {
  name: "情報のみ",
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h2>当日の連絡先</h2>
        </CardTitle>
        <CardDescription>企画責任者</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <dt className="text-muted-foreground">氏名</dt>
          <dd>九大 花子</dd>
          <dt className="text-muted-foreground">電話番号</dt>
          <dd className="tabular-nums">090-1234-5678</dd>
        </dl>
      </CardContent>
    </Card>
  ),
};
export const LongTitle: Story = {
  name: "長い名称",
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <h2>九州大学の研究を体験できる科学実験とワークショップ</h2>
        </CardTitle>
        <CardDescription>理学部・工学部合同企画</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          身近な道具を使った実験から最新の研究紹介まで、幅広いテーマを体験できます。
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">申請内容を確認</Button>
      </CardFooter>
    </Card>
  ),
};
