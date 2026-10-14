import type { Meta, StoryObj } from "@storybook/react-native";

import { OtpInput } from "@kyudaisai/ui-native";
import { View } from "react-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/OtpInput",
  component: OtpInput,
  args: {
    label: "確認コード",
    value: "",
    length: 6,
    required: true,
    onValueChange: action("value-changed"),
  },
  parameters: {
    notes:
      "桁ごとの下線で入力位置と必要な桁数を示します。単一のNative入力欄で選択・貼り付け・OSの確認コード自動入力を受け取り、全角数字は半角にします。文字拡大や長いコードは横スクロールで表示します。入力が揃っても自動送信・認証は行いません。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <OtpInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof OtpInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const FourDigits: Story = { args: { length: 4, value: "12" } };
export const EightDigits: Story = { args: { length: 8, value: "0123" } };
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <View style={{ width: 288, maxWidth: "100%" }}>
        <Story />
      </View>
    ),
  ],
};
export const LongCode: Story = {
  args: { length: 12, value: "012345678" },
  decorators: [
    (Story) => (
      <View style={{ width: 288, maxWidth: "100%" }}>
        <Story />
      </View>
    ),
  ],
};
export const WithValue: Story = { args: { value: "123456" } };
export const Invalid: Story = {
  args: { value: "123", error: "6桁の確認コードを入力してください。" },
};
export const Disabled: Story = { args: { value: "123456", disabled: true } };
export const ReadOnly: Story = { args: { value: "123456", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
