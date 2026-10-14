import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { LabeledCheckbox } from "./compositions";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/LabeledCheckbox",
  component: LabeledCheckbox,
  args: {
    children: "掲載内容を確認しました",
    checked: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    children: {
      control: "text",
      description: "クリックして選択できるラベル。",
    },
    checked: {
      control: "boolean",
      description: "選択状態。onCheckedChangeと組み合わせます。",
    },
    indeterminate: {
      control: "boolean",
      description: "一部だけ選択した状態。",
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    onCheckedChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "チェックボックスと確認文を、一つの操作領域にまとめます。長い文章を伴う同意や確認に使います。\n\nラベル内にリンクや別のボタンを入れないでください。リンクを含む補足はラベルの外に表示し、`aria-describedby`で関連付けます。",
      },
    },
  },
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="max-w-md">
        <LabeledCheckbox
          {...args}
          onCheckedChange={(checked, details) => {
            updateArgs({ checked, indeterminate: false });
            args.onCheckedChange?.(checked, details);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof LabeledCheckbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", {
      name: "掲載内容を確認しました",
    });
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    await userEvent.click(canvas.getByText("掲載内容を確認しました"));
    await expect(checkbox).not.toBeChecked();
  },
};
export const Checked: Story = { name: "選択済み", args: { checked: true } };
export const Indeterminate: Story = {
  name: "一部選択",
  args: { children: "すべての設備を選択", indeterminate: true },
};
export const Disabled: Story = {
  name: "変更不可",
  args: { checked: true, disabled: true },
  render: (args) => (
    <div className="max-w-md">
      <LabeledCheckbox {...args} aria-describedby="submitted-confirmation" />
      <p id="submitted-confirmation" className="ds-hint">
        提出済みのため変更できません。
      </p>
    </div>
  ),
};
export const LongLabel: Story = {
  name: "長いラベル",
  args: {
    children:
      "企画責任者と当日連絡先を確認し、記載内容に変更がある場合は九大祭実行委員会へ連絡します。",
  },
};
export const Group: Story = {
  name: "複数選択",
  render: () => (
    <fieldset className="max-w-md">
      <legend className="font-medium">必要な設備</legend>
      <LabeledCheckbox name="equipment" value="table" defaultChecked>
        机
      </LabeledCheckbox>
      <LabeledCheckbox name="equipment" value="chair">
        椅子
      </LabeledCheckbox>
      <LabeledCheckbox name="equipment" value="power">
        電源
      </LabeledCheckbox>
    </fieldset>
  ),
};
