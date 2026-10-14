import type { Meta, StoryObj } from "@storybook/react-native";

import { UrlInput } from "@kyudaisai/ui-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/UrlInput",
  component: UrlInput,
  args: {
    label: "WebサイトのURL",
    value: "",
    placeholder: "https://example.com",
    hint: "https:// から入力してください。",
    onValueChange: action("value-changed"),
  },
  parameters: {
    notes:
      "iOSは半角英数字のキーボード、AndroidはURL用キーボードを指定し、自動大文字化・自動修正を止めます。入力したURLを自動では開きません。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <UrlInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof UrlInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = {
  args: { value: "example", error: "https:// から始まるURLを入力してください。" },
};
export const Disabled: Story = { args: { value: "https://example.com", disabled: true } };
export const ReadOnly: Story = { args: { value: "https://example.com", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
