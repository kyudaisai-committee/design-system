import type { Meta, StoryObj } from "@storybook/react-native";

import { Toggle } from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";

const meta = {
  title: "Components/Switch",
  component: Toggle,
  args: {
    onValueChange: () => {},
    label: "画面内のお知らせを表示",
    hint: "この設定はすぐに反映されます。",
    value: false,
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    useEffect(() => {
      setValue(args.value);
    }, [args.value]);
    return <Toggle {...args} value={value} onValueChange={setValue} />;
  },
  parameters: {
    notes:
      "OS標準のスイッチで、すぐに反映される設定を切り替えます。送信前の同意にはCheckboxを使います。",
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const On: Story = { args: { value: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
