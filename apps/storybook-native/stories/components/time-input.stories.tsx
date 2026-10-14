import type { Meta, StoryObj } from "@storybook/react-native";

import { TimeInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/TimeInput",
  component: TimeInput,
  args: { label: "時刻", value: "", onValueChange: action("value-changed") },
  parameters: {
    notes:
      "ほかの入力欄と同じ枠に値・未入力の形式を表示します。欄をタップすると選択画面を開きます。iOS・Androidの標準時刻選択を使います。値はHH:mmです。Androidの標準時刻選択に範囲指定がないため、確定時にも範囲を確認し、範囲外なら元の値を保持します。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <TimeInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof TimeInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithValue: Story = { args: { value: "09:30" } };
export const LimitedRange: Story = { args: { min: "09:00", max: "17:00" } };
export const Invalid: Story = { args: { value: "25:00" } };
export const Disabled: Story = { args: { value: "09:30", disabled: true } };
export const ReadOnly: Story = { args: { value: "09:30", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
