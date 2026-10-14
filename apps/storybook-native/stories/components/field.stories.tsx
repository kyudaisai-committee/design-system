import type { Meta, StoryObj } from "@storybook/react-native";

import { Field } from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const meta = {
  title: "Components/Field",
  component: Field,
  args: { label: "名称", hint: "100文字以内で入力してください。", required: true },
  render: function Example(args) {
    const [value, setValue] = useState(args.value ?? "");
    useEffect(() => {
      setValue(args.value ?? "");
    }, [args.value]);
    return <Field {...args} value={value} onChangeText={setValue} />;
  },
  parameters: {
    notes:
      "名前・条件・エラーを入力欄の外に表示します。端末の文字拡大と入力内容に合ったキーボードを使います。",
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Invalid: Story = { args: { error: "名称を入力してください。" } };
export const Disabled: Story = {
  args: { editable: false, hint: "受付期間が終了したため変更できません。" },
};
export const Multiline: Story = {
  args: { label: "説明", multiline: true, hint: "対象や目的が分かるように記載してください。" },
};
export const Email: Story = {
  args: {
    label: "メールアドレス",
    keyboardType: Platform.OS === "ios" ? "ascii-capable" : "email-address",
    inputMode: Platform.OS === "ios" ? undefined : "email",
    autoCapitalize: "none",
    autoCorrect: false,
    spellCheck: false,
    autoComplete: "email",
  },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
