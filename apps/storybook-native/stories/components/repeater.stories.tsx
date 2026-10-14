import type { Meta, StoryObj } from "@storybook/react-native";

import { RepeaterExample } from "./form-control-examples";

const meta = {
  title: "Components/Repeater",
  component: RepeaterExample,
  args: { disabled: false, readOnly: false },
  parameters: {
    notes:
      "安定したidを持つ行を追加・削除します。行の内容は利用側がrenderItemで渡し、行の識別子を位置番号で置き換えません。renderItemのdisabled/readOnlyを各入力欄へ引き継ぎます。",
  },
} satisfies Meta<typeof RepeaterExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = { args: { error: "各項目の名称と数量を確認してください。" } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
