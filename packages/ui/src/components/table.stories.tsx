import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Checkbox } from "./checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const rows = [
  { id: "K-080", name: "九大カフェ", count: 12, amount: 3000 },
  {
    id: "K-081",
    name: "九州大学の研究を体験できる科学実験とワークショップ",
    count: 24,
    amount: 6000,
  },
  { id: "K-082", name: "写真展「伊都の四季」", count: 8, amount: 2000 },
];
const meta = {
  title: "Components/Table",
  component: Table,
  subcomponents: {
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
  },
  argTypes: {
    children: {
      control: false,
      description:
        "caption、thead、tbody、tfoot に対応する各部品。見出しセルには scope を指定する。",
    },
    className: {
      control: "text",
      description: "表要素に適用するCSSクラス。長い名称のセルには whitespace-normal を指定する。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "同じ項目で複数の対象を比較します。列見出しと必要に応じた行見出しを付け、captionに表の内容を書いてください。数値は右揃えにします。\n\n狭い画面では、表の領域内を横にスクロールできます。表のスクロール領域にフォーカスすると、左右キーでもスクロールできます。",
      },
    },
  },
  render: (args) => (
    <div className="max-w-3xl">
      <Table {...args}>
        <TableCaption>企画ごとの参加人数と会場使用料</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">企画番号</TableHead>
            <TableHead scope="col">企画名</TableHead>
            <TableHead scope="col" className="text-right">
              参加人数
            </TableHead>
            <TableHead scope="col" className="text-right">
              会場使用料
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tabular-nums">{row.id}</TableCell>
              <TableHead scope="row" className="min-w-48 py-3 whitespace-normal">
                {row.name}
              </TableHead>
              <TableCell className="text-right tabular-nums">{row.count}人</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.amount.toLocaleString("ja-JP")}円
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead scope="row" colSpan={2}>
              合計
            </TableHead>
            <TableCell className="text-right tabular-nums">44人</TableCell>
            <TableCell className="text-right tabular-nums">11,000円</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Selectable: Story = {
  name: "行の選択",
  render: () => (
    <div className="max-w-xl">
      <Table>
        <TableCaption>確認する企画を選択</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">選択</TableHead>
            <TableHead scope="col">企画名</TableHead>
            <TableHead scope="col">企画番号</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex min-h-11 min-w-11 items-center justify-center">
                  <Checkbox aria-label={`${row.name}を選択`} />
                </div>
              </TableCell>
              <TableHead scope="row" className="py-3 whitespace-normal">
                {row.name}
              </TableHead>
              <TableCell>{row.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "九大カフェを選択",
    });
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
  },
};
export const Empty: Story = {
  name: "該当なし",
  render: () => (
    <div className="max-w-xl">
      <Table>
        <TableCaption>審査中の企画</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">企画名</TableHead>
            <TableHead scope="col">提出日</TableHead>
            <TableHead scope="col">担当者</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-28 text-center whitespace-normal text-muted-foreground"
            >
              審査中の企画はありません。
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
