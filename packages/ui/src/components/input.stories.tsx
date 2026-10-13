import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, fn, userEvent, within } from "storybook/test";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    value: "九大カフェ",
    type: "text",
    placeholder: "企画名を入力",
    disabled: false,
    readOnly: false,
    required: false,
    onChange: fn(),
  },
  argTypes: {
    value: {
      control: "text",
      description: "アプリ側で管理する入力値。onChangeで更新する。",
    },
    defaultValue: {
      control: false,
      description:
        "初回表示時の入力値。表示後にdefaultValueを変更しても、入力済みの値は上書きされない。",
    },
    type: {
      control: "select",
      options: [
        "text",
        "email",
        "tel",
        "url",
        "search",
        "password",
        "number",
        "date",
      ],
      description:
        "HTMLのinput要素の入力形式。emailやtelなど、入力内容に合う値を指定する。",
    },
    placeholder: {
      control: "text",
      description: "入力例。ラベルの代用にはしない。",
    },
    disabled: { control: "boolean" },
    readOnly: {
      control: "boolean",
      description: "値を編集できない状態。閲覧やコピーはできる。",
    },
    required: { control: "boolean" },
    "aria-invalid": {
      control: "boolean",
      description: "入力内容にエラーがあるかどうか。エラーの説明はaria-describedbyで入力欄と関連付ける。",
    },
    onChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "企画名や連絡先など、一行の文字列を入力します。複数行の入力にはTextareaを使います。\n\nラベルを常時表示し、Labelの`htmlFor`とInputの`id`を一致させてください。補足やエラーは`aria-describedby`で関連付けます。これらをまとめて設定する場合はFieldを使います。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="ds-stack max-w-sm">
        <Label htmlFor={`${id}-input`}>企画名</Label>
        <Input
          {...args}
          id={`${id}-input`}
          onChange={(event) => {
            updateArgs({ value: event.target.value });
            args.onChange?.(event);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", {
      name: "企画名",
    });
    await userEvent.click(within(canvasElement).getByText("企画名"));
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "九大喫茶");
    await expect(input).toHaveValue("九大喫茶");
  },
};
export const Empty: Story = { name: "未入力", args: { value: "" } };
export const Disabled: Story = { name: "無効", args: { disabled: true } };
export const ReadOnly: Story = {
  name: "読み取り専用",
  args: { value: "K-080", readOnly: true },
  render: (args) => (
    <div className="ds-stack max-w-sm">
      <Label htmlFor="project-number">企画番号</Label>
      <Input {...args} id="project-number" aria-describedby="number-hint" />
      <p id="number-hint" className="text-sm text-muted-foreground">
        企画番号は変更できません。
      </p>
    </div>
  ),
};
export const Invalid: Story = {
  name: "入力エラー",
  args: { value: "", "aria-invalid": true, required: true },
  render: (args) => (
    <div className="ds-stack max-w-sm">
      <Label htmlFor="invalid-project">
        企画名 <span className="text-sm">必須</span>
      </Label>
      <Input
        {...args}
        value={undefined}
        defaultValue=""
        id="invalid-project"
        aria-describedby="project-error"
      />
      <p id="project-error" className="text-sm text-destructive">
        企画名を入力してください。
      </p>
    </div>
  ),
};
export const InputTypes: Story = {
  name: "入力形式",
  render: () => (
    <div className="grid max-w-md gap-5">
      <div className="grid gap-2">
        <Label htmlFor="contact-email">連絡先メールアドレス</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-phone">当日の電話番号</Label>
        <Input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          placeholder="090-1234-5678"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="people-count">参加人数</Label>
        <Input
          id="people-count"
          type="number"
          min={1}
          inputMode="numeric"
          defaultValue={12}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="delivery-date">搬入日</Label>
        <Input id="delivery-date" type="date" defaultValue="2026-10-30" />
      </div>
    </div>
  ),
};
