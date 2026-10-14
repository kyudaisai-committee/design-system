import type { Meta, StoryObj } from "@storybook/react-native";

import { CheckboxGroup } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  args: {
    label: "表示する内容",
    value: [],
    onValueChange: action("value-changed"),
    options: [
      { value: "text", label: "テキスト" },
      { value: "image", label: "画像" },
      { value: "document", label: "文書" },
    ],
    maxSelections: 2,
  },
  parameters: {
    notes:
      "複数選択の名前・条件・エラーをまとめます。上限に達しても、選択済みの項目は解除できます。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue<readonly string[]>(args.value, (next) =>
      args.onValueChange([...next]),
    );
    return <CheckboxGroup {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof CheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const AtLimit: Story = { args: { value: ["text", "image"] } };
export const Invalid: Story = {
  args: { minSelections: 1, required: true, error: "1項目以上選択してください。" },
};
export const Disabled: Story = { args: { value: ["text"], disabled: true } };
export const ReadOnly: Story = { args: { value: ["text", "image"], readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
