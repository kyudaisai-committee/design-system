import type { Meta, StoryObj } from "@storybook/react-native";

import { ChoiceGroup } from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";

const meta = {
  title: "Components/RadioGroup",
  component: ChoiceGroup,
  args: {
    onValueChange: () => {},
    label: "受取方法",
    options: [
      { label: "会場で受け取る", value: "venue" },
      { label: "後日受け取る", value: "later" },
    ],
    value: "venue",
  },
  render: function Example(args) {
    const [value, setValue] = useState(args.value);
    useEffect(() => {
      setValue(args.value);
    }, [args.value]);
    return <ChoiceGroup {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof ChoiceGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
