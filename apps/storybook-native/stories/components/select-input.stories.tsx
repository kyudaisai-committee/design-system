import type { Meta, StoryObj } from "@storybook/react-native";

import { SelectInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/SelectInput",
  component: SelectInput,
  args: {
    label: "形式",
    value: "",
    onValueChange: action("value-changed"),
    options: [
      { value: "text", label: "テキスト" },
      { value: "image", label: "画像" },
      { value: "document", label: "文書", description: "複数ページの内容" },
    ],
  },
  parameters: {
    notes:
      "一つの項目を選択します。選択肢はOSのモーダル画面に表示し、キャンセルでは元の値を保持します。任意項目は選択をクリアできます。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <SelectInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof SelectInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = { args: { value: "text" } };
export const Invalid: Story = { args: { required: true, error: "形式を選択してください。" } };
export const Disabled: Story = { args: { value: "text", disabled: true } };
export const ReadOnly: Story = { args: { value: "text", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
