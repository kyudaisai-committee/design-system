import type { Meta, StoryObj } from "@storybook/react-native";

import { spacing } from "@kyudaisai/tokens/native";
import { DateInput, Field, Text, TimeInput } from "@kyudaisai/ui-native";
import { useState } from "react";
import { View } from "react-native";
import { action } from "storybook/actions";

import { useStoryValue } from "./form-control-examples";

const meta = {
  title: "Components/DateInput",
  component: DateInput,
  args: { label: "日付", value: "", onValueChange: action("value-changed") },
  parameters: {
    notes:
      "ほかの入力欄と同じ枠に値・未入力の形式を表示します。欄をタップすると選択画面を開きます。表示はyyyy/mm/ddです。iOSは月間カレンダー、Androidは端末標準のカレンダーを開きます。値はYYYY-MM-DDのローカル日付として扱い、UTCへ変換しません。キャンセルでは元の値を保持し、任意項目はクリアできます。",
  },
  render: function Example(args) {
    const [value, onValueChange] = useStoryValue(args.value, args.onValueChange);
    return <DateInput {...args} value={value} onValueChange={onValueChange} />;
  },
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithValue: Story = { args: { value: "2030-05-20" } };
export const LimitedRange: Story = { args: { min: "2030-05-01", max: "2030-05-31" } };
export const Invalid: Story = { args: { value: "2030-02-30" } };
export const Disabled: Story = { args: { value: "2030-05-20", disabled: true } };
export const ReadOnly: Story = { args: { value: "2030-05-20", readOnly: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };

export const InputAppearance: Story = {
  parameters: {
    notes:
      "文字・日付・時刻の入力欄を同じラベル配置で並べています。未入力の形式表示と入力済みの値を比べられます。各項目はこの画面内で編集できます。",
  },
  render: function Appearance() {
    const [examples, setExamples] = useState([
      { title: "未入力", text: "", date: "", time: "" },
      { title: "入力済み", text: "入力例", date: "2030-05-20", time: "09:30" },
    ]);
    const update = (index: number, key: "text" | "date" | "time", value: string) => {
      setExamples((current) =>
        current.map((example, item) => (item === index ? { ...example, [key]: value } : example)),
      );
    };
    return (
      <View style={{ gap: spacing[6] }}>
        {examples.map((example, index) => (
          <View key={example.title} style={{ gap: spacing[4] }}>
            <Text variant="heading">{example.title}</Text>
            <Field
              label="文字"
              placeholder="文字を入力"
              value={example.text}
              onChangeText={(value) => update(index, "text", value)}
            />
            <DateInput
              label="日付"
              value={example.date}
              onValueChange={(value) => update(index, "date", value)}
            />
            <TimeInput
              label="時刻"
              value={example.time}
              onValueChange={(value) => update(index, "time", value)}
            />
          </View>
        ))}
      </View>
    );
  },
};
