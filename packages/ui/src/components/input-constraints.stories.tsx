import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Field } from "./compositions";
import { Input } from "./input";

const constraints = [
  {
    label: "文字の制限なし",
    hint: "日本語・英数字などを入力できます。",
    value: "見本 A",
    pattern: undefined,
  },
  {
    label: "半角文字",
    hint: "半角の英数字・記号・空白で入力してください。",
    value: "Sample 1!",
    pattern: "[\\x20-\\x7E]*",
  },
  {
    label: "英数字",
    hint: "半角の英字と数字で入力してください。",
    value: "Sample123",
    pattern: "[A-Za-z0-9]*",
  },
  {
    label: "識別名",
    hint: "半角英数字・ハイフン・アンダースコアが使えます。",
    value: "sample_1",
    pattern: "[A-Za-z0-9_\\-]*",
  },
  {
    label: "数字の文字列",
    hint: "半角数字で入力してください。先頭の0も保持します。",
    value: "00123",
    pattern: "[0-9]*",
  },
  {
    label: "カタカナ",
    hint: "全角カタカナ・長音・半角空白で入力してください。",
    value: "サンプル",
    pattern: "[ァ-ヶー ]*",
  },
];
const meta = {
  title: "Foundations/InputConstraints",
  parameters: {
    docs: {
      description: {
        component:
          "Inputのpatternと条件説明を組み合わせます。入力途中の文字を強制的に除去せず、日本語変換や貼り付けを保ちます。フォームの確認時に妥当性を調べ、必要な修正をerrorで伝えます。",
      },
    },
  },
  render: () => (
    <div className="max-w-md space-y-6">
      {constraints.map((item) => (
        <Field key={item.label} label={item.label} hint={item.hint}>
          {(props) => (
            <Input
              {...props}
              pattern={item.pattern}
              defaultValue={item.value}
              inputMode={item.label === "数字の文字列" ? "numeric" : undefined}
              autoCapitalize={item.pattern ? "none" : undefined}
              autoCorrect={item.pattern ? "off" : undefined}
              spellCheck={item.pattern ? false : undefined}
            />
          )}
        </Field>
      ))}
    </div>
  ),
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const item of constraints) await expect(canvas.getByLabelText(item.label)).toBeValid();
    const digits = canvas.getByLabelText("数字の文字列");
    await expect(digits).toHaveValue("00123");
    const katakana = canvas.getByLabelText("カタカナ");
    await userEvent.clear(katakana);
    await userEvent.type(katakana, "ひらがな");
    await expect(katakana).toHaveValue("ひらがな");
    await expect(katakana).toBeInvalid();
    await userEvent.clear(katakana);
    await userEvent.type(katakana, "カタカナ");
    await expect(katakana).toBeValid();
  },
};
