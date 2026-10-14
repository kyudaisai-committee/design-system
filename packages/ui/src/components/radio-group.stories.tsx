import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  subcomponents: { RadioGroupItem },
  args: { value: "indoor", disabled: false, readOnly: false, required: false },
  argTypes: {
    defaultValue: {
      control: false,
      description:
        "初回表示時とフォームリセット後の値。新しい初期値で始める場合はkeyを変えて再表示します。",
    },
    value: {
      control: "select",
      options: ["indoor", "outdoor", "stage"],
      description: "選択している Item の value。",
    },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    onValueChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "少数の選択肢を並べ、一つを選びます。選択肢を見比べられるよう、短く区別しやすい名前を付けてください。複数選択にはCheckbox、選択肢を並べる余地が少ない場合はNativeSelectを使います。\n\n選択肢全体に設問を付けます。矢印キーで選択を変え、Tabキーで次の入力項目へ移動します。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <fieldset>
        <legend className="mb-3 font-medium">企画の開催場所</legend>
        <RadioGroup
          {...args}
          aria-label="企画の開催場所"
          onValueChange={(value) => updateArgs({ value })}
        >
          {[
            ["indoor", "屋内"],
            ["outdoor", "屋外"],
            ["stage", "ステージ"],
          ].map(([value, label]) => (
            <div key={value} className="flex min-h-11 items-center gap-3">
              <RadioGroupItem id={`${id}-${value}`} value={value} />
              <Label htmlFor={`${id}-${value}`} className="min-h-11">
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>
    );
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("radio", { name: "屋内" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("radio", { name: "屋外" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    await expect(canvas.getByRole("radio", { name: "屋内" })).toBeChecked();
  },
};
export const Disabled: Story = {
  name: "無効",
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole("radio", { name: "屋内" });
    await expect(radio).toHaveAttribute("aria-disabled", "true");
    await expect(Number(getComputedStyle(radio).opacity)).toBeLessThan(1);
    await expect(
      Number(getComputedStyle(within(canvasElement).getByText("屋内")).opacity),
    ).toBeLessThan(1);
  },
};
export const ReadOnly: Story = {
  name: "読み取り専用",
  args: { readOnly: true },
};
export const Invalid: Story = {
  name: "未選択エラー",
  args: { value: null, required: true },
  render: (args, { id }) => (
    <fieldset>
      <legend className="mb-3 font-medium">
        企画の開催場所 <span className="text-sm text-muted-foreground">必須</span>
      </legend>
      <RadioGroup
        {...args}
        value={undefined}
        aria-label="企画の開催場所"
        aria-invalid
        aria-describedby={`${id}-error`}
      >
        {[
          ["indoor", "屋内"],
          ["outdoor", "屋外"],
        ].map(([value, label]) => (
          <div key={value} className="flex min-h-11 items-center gap-3">
            <RadioGroupItem id={`${id}-${value}`} value={value} aria-invalid />
            <Label htmlFor={`${id}-${value}`} className="min-h-11">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <p id={`${id}-error`} className="mt-2 text-sm text-destructive">
        開催場所を選択してください。
      </p>
    </fieldset>
  ),
};
