import type { Meta, StoryObj } from "@storybook/react-native";

import { Checkbox } from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { onCheckedChange: () => {}, label: "案内の内容を確認しました", checked: false },
  render: function Example(args) {
    const [checked, setChecked] = useState(args.checked);
    useEffect(() => {
      setChecked(args.checked);
    }, [args.checked]);
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />;
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const LongLabel: Story = {
  args: { label: "対象、実施日時、変更時の連絡方法について案内を読み、入力内容を確認しました" },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
