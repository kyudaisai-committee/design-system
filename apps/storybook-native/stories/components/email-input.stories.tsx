import type { Meta, StoryObj } from "@storybook/react-native";

import { EmailInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/EmailInput",
  component: EmailInput,
  args: {
    label: "メールアドレス",
    value: "",
    placeholder: "name@example.com",
    onValueChange: action("value-changed"),
  },
  parameters: {
    notes:
      "iOSは半角英数字のキーボード、Androidはメール用キーボードを指定し、OSのメール自動入力を使います。入力値は自動で削除・変換せず、検証と送信は利用側で行います。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <EmailInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof EmailInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = {
  args: { value: "sample", error: "メールアドレスの形式で入力してください。" },
};
export const Disabled: Story = { args: { value: "name@example.com", disabled: true } };
export const ReadOnly: Story = { args: { value: "name@example.com", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
