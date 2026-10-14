import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, Field, Text } from "@kyudaisai/ui-native";
import { useState } from "react";
import { Platform, View } from "react-native";

const constraints = [
  {
    label: "文字の制限なし",
    hint: "日本語・英数字などを入力できます。",
    value: "見本 A",
    keyboard: "text",
    pattern: /.*/su,
  },
  {
    label: "半角文字",
    hint: "半角の英数字・記号・空白で入力してください。",
    value: "Sample 1!",
    keyboard: "ascii",
    pattern: /^[\x20-\x7e]*$/,
  },
  {
    label: "英数字",
    hint: "半角の英字と数字で入力してください。",
    value: "Sample123",
    keyboard: "ascii",
    pattern: /^[A-Za-z0-9]*$/,
  },
  {
    label: "識別名",
    hint: "半角英数字・ハイフン・アンダースコアが使えます。",
    value: "sample_1",
    keyboard: "ascii",
    pattern: /^[A-Za-z0-9_-]*$/,
  },
  {
    label: "数字の文字列",
    hint: "半角数字で入力してください。先頭の0も保持します。",
    value: "00123",
    keyboard: "numeric",
    pattern: /^[0-9]*$/,
  },
  {
    label: "カタカナ",
    hint: "全角カタカナ・長音・半角空白で入力してください。",
    value: "サンプル",
    keyboard: "text",
    pattern: /^[ァ-ヶー ]*$/u,
  },
];

function InputConstraints() {
  const [values, setValues] = useState(constraints.map((item) => item.value));
  const [checked, setChecked] = useState(false);
  const [description, setDescription] = useState("");
  return (
    <View style={{ gap: 24 }}>
      <Text variant="title">入力できる文字の条件</Text>
      <Text>
        文字をそのまま入力し、確認時に条件を調べます。修正が必要な場合も入力した文字は残ります。
      </Text>
      {constraints.map((item, index) => (
        <Field
          key={item.label}
          label={item.label}
          hint={item.hint}
          value={values[index]}
          keyboardType={
            item.keyboard === "numeric"
              ? "number-pad"
              : item.keyboard === "ascii" && Platform.OS === "ios"
                ? "ascii-capable"
                : "default"
          }
          inputMode={
            item.keyboard === "numeric"
              ? "numeric"
              : item.keyboard === "ascii" && Platform.OS === "ios"
                ? undefined
                : "text"
          }
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          error={checked && !item.pattern.test(values[index] ?? "") ? item.hint : undefined}
          onChangeText={(value) =>
            setValues((previous) =>
              previous.map((entry, position) => (position === index ? value : entry)),
            )
          }
        />
      ))}
      <Field
        label="複数行の説明"
        hint={`日本語・英数字・改行を含めて100文字以内。現在${description.length}文字です。`}
        multiline
        maxLength={100}
        value={description}
        onChangeText={setDescription}
      />
      <Button title="文字の条件を確認" onPress={() => setChecked(true)} />
    </View>
  );
}

const meta = {
  title: "Foundations/InputConstraints",
  component: InputConstraints,
  parameters: {
    notes:
      "Fieldの値を保持し、文字種の検証結果をerrorに渡す例です。日本語変換中の文字を除去しません。数字の文字列は数量と区別し、先頭の0を保持します。",
  },
} satisfies Meta<typeof InputConstraints>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
