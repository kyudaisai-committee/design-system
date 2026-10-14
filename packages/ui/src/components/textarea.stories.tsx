import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Label } from "./label";
import { useStoryControls } from "./story-controls";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    value: "学生が淹れるコーヒーと手作りのお菓子で、ひと休みしませんか。",
    rows: 3,
    placeholder: "企画の見どころを入力",
    disabled: false,
    readOnly: false,
    maxLength: 200,
  },
  argTypes: {
    value: {
      control: "text",
      description: "アプリ側で管理する入力値。onChangeで更新する。",
    },
    defaultValue: { control: false, description: "初回表示時の入力値。" },
    rows: {
      control: { type: "number", min: 1, max: 12 },
      description: "初期の行数。内容に合わせて高さが伸びる。",
    },
    maxLength: {
      control: { type: "number", min: 1 },
      description: "入力可能な最大文字数。制限は入力前に説明する。",
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "紹介文や連絡事項など、複数行の文章を入力します。ラベルを常時表示し、文字数や書き方の条件を入力前に伝えてください。ラベル・補足・エラーをまとめる場合はFieldを使います。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="ds-stack max-w-lg">
        <Label htmlFor={`${id}-input`}>企画紹介</Label>
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {args.maxLength}文字以内で入力してください。
        </p>
        <Textarea
          {...args}
          id={`${id}-input`}
          aria-describedby={`${id}-hint`}
          onChange={(event) => {
            updateArgs({ value: event.target.value });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: "企画紹介",
    });
    await userEvent.clear(input);
    await userEvent.type(input, "コーヒーをご用意しています。{Enter}ぜひお立ち寄りください。");
    await expect(input).toHaveValue("コーヒーをご用意しています。\nぜひお立ち寄りください。");
  },
};
export const Empty: Story = { name: "未入力", args: { value: "" } };
export const Disabled: Story = { name: "無効", args: { disabled: true } };
export const ReadOnly: Story = {
  name: "読み取り専用",
  args: { readOnly: true },
};
export const Invalid: Story = {
  name: "入力エラー",
  args: { "aria-invalid": true, value: "", required: true },
  render: (args) => (
    <div className="ds-stack max-w-lg">
      <Label htmlFor="missing-description">
        企画紹介 <span>必須</span>
      </Label>
      <Textarea
        {...args}
        value={undefined}
        id="missing-description"
        aria-describedby="description-error"
      />
      <p id="description-error" className="text-sm text-destructive">
        企画紹介を入力してください。
      </p>
    </div>
  ),
};
export const LongContent: Story = {
  name: "長い文章",
  args: {
    maxLength: 500,
    value:
      "会場では、学生が焙煎した豆を使ったコーヒーと手作りのお菓子をご用意しています。\n\nカフェインを控えている方には、紅茶とジュースもあります。食物アレルギーがある方は、注文前にスタッフへお知らせください。\n\n休憩スペースは混雑時に譲り合ってご利用ください。車いすで通れる通路を確保しています。",
  },
};
