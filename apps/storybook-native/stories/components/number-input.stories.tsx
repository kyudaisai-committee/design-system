import type { Meta, StoryObj } from "@storybook/react-native";

import { NumberInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  args: {
    label: "数量",
    value: "",
    min: 0,
    max: 999,
    integer: true,
    onValueChange: action("value-changed"),
  },
  parameters: {
    notes:
      "値は文字列です。空欄を0に変換せず、入力中のマイナス記号や小数点を保持します。フォーカスを外したときに数値・範囲・整数の条件を確認します。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <NumberInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Decimal: Story = {
  args: { label: "数値", value: "-1.5", min: -10, max: 10, integer: false },
};
export const PositiveDecimal: Story = {
  args: { label: "長さ", value: "1.5", min: 0, integer: false },
};
export const SignedInteger: Story = {
  args: { label: "増減", value: "-1", min: -10, max: 10, integer: true },
};
export const Invalid: Story = { args: { value: "12.5", error: "整数を入力してください。" } };
export const Disabled: Story = { args: { value: "2", disabled: true } };
export const ReadOnly: Story = { args: { value: "2", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
