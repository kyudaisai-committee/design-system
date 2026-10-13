import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Label } from "./label";
import { Input } from "./input";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Components/Label",
  component: Label,
  args: { children: "企画名", htmlFor: "label-project" },
  argTypes: {
    children: { control: "text", description: "入力する内容を表す名前。" },
    htmlFor: {
      control: false,
      description: "対応する入力の id。ラベルのクリックで入力に移動する。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "入力項目の名前を常時表示し、入力欄と関連付けます。`htmlFor`に入力欄の`id`を指定してください。プレースホルダーでラベルを代用しないでください。\n\n必須項目には「必須」と記載し、入力欄にも`required`を指定します。",
      },
    },
  },
  render: (args, { id }) => (
    <div className="ds-stack max-w-sm">
      <Label {...args} htmlFor={`${id}-input`} />
      <Input id={`${id}-input`} autoComplete="off" />
    </div>
  ),
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("企画名"));
    await expect(canvas.getByRole("textbox", { name: "企画名" })).toHaveFocus();
  },
};
export const Required: Story = {
  name: "必須項目",
  render: () => (
    <div className="ds-stack max-w-sm">
      <Label htmlFor="required-name">
        企画名 <span className="text-sm text-muted-foreground">必須</span>
      </Label>
      <Input id="required-name" required />
    </div>
  ),
};
export const LongLabel: Story = {
  name: "長いラベル",
  render: () => (
    <div className="flex max-w-md items-start gap-3">
      <Checkbox id="long-label" className="mt-3.5" />
      <Label htmlFor="long-label" className="min-h-11 py-2 leading-relaxed">
        企画責任者として、提出する内容と添付資料に誤りがないことを確認しました
      </Label>
    </div>
  ),
};
