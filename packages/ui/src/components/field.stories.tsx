import type { Meta, StoryObj } from "@storybook/react-vite";

import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { Field } from "./compositions";
import fieldStoriesSource from "./field.stories.tsx?raw";
import { Input } from "./input";
import { NativeSelect, NativeSelectOption } from "./native-select";
import { Textarea } from "./textarea";

function fieldExampleSource(
  args: { label: string; hint?: string; required?: boolean; error?: string },
  control: "Input" | "Textarea" | "NativeSelect",
) {
  const attributes = ["label", "hint", "required", "error"]
    .filter((name) => args[name as keyof typeof args] !== undefined)
    .map((name) => `        ${name}={${JSON.stringify(args[name as keyof typeof args])}}`)
    .join("\n");
  const imports = control === "NativeSelect" ? "NativeSelect, NativeSelectOption" : control;
  const extra = control === "Textarea" ? "\n            maxLength={200}\n            rows={4}" : "";
  const close =
    control === "NativeSelect"
      ? `>
            <NativeSelectOption value="exhibition">展示</NativeSelectOption>
            <NativeSelectOption value="food">模擬店</NativeSelectOption>
            <NativeSelectOption value="stage">ステージ</NativeSelectOption>
          </NativeSelect>`
      : "/>";
  return `import { useState } from "react";
import { Field, ${imports} } from "@kyudaisai/ui";

export function FieldExample() {
  const [value, setValue] = useState(${JSON.stringify(control === "NativeSelect" ? "exhibition" : "")});
  return (
    <div className="max-w-md">
      <Field
${attributes}
      >
        {(controlProps) => (
          <${control}
            {...controlProps}
            value={value}
            onChange={(event) => setValue(event.target.value)}${extra}
          ${close}
        )}
      </Field>
    </div>
  );
}`;
}

const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "企画名",
    hint: "パンフレットに掲載する名称を入力してください。",
    required: true,
    error: "",
    children: (props) => <Input {...props} />,
  },
  argTypes: {
    label: { control: "text", description: "入力欄の外に表示するラベル。" },
    hint: { control: "text", description: "入力前に必要な条件・書き方。" },
    error: {
      control: "text",
      description:
        "入力欄の下に表示するエラーメッセージ。修正方法を記載します。指定すると入力欄にaria-invalidを設定します。",
    },
    required: {
      control: "boolean",
      description: "ラベルの必須表示と入力のrequired属性を設定します。",
    },
    children: {
      control: false,
      description: "受け取ったid・required・aria-describedby・aria-invalidを入力部品へ渡します。",
    },
  },
  parameters: {
    docs: {
      source: {
        language: "tsx",
        type: "dynamic",
        transform: (_source: string, context: { args: Parameters<typeof fieldExampleSource>[0] }) =>
          fieldExampleSource(context.args, "Input"),
      },
      description: {
        component:
          "ラベル・補足・入力欄・エラーをまとめ、入力欄と各説明を関連付けます。ラベルや補足を個別に組み立てず、まとまった入力項目として使う場合に適しています。\n\n子の関数が受け取る`controlProps`を、Input・Textarea・NativeSelectにすべて渡してください。必須表示やエラーの読み上げに必要な属性が含まれています。",
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-md">
        <Field {...args}>
          {(props) => (
            <Input {...props} value={value} onChange={(event) => setValue(event.target.value)} />
          )}
        </Field>
      </div>
    );
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /企画名\s*（必須）/ });
    await userEvent.click(canvas.getByText("企画名"));
    await expect(input).toHaveFocus();
    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription(
      "パンフレットに掲載する名称を入力してください。",
    );
    await userEvent.type(input, "九大カフェ");
    await expect(input).toHaveValue("九大カフェ");
  },
};

export const Invalid: Story = {
  name: "入力エラー",
  args: { error: "企画名を入力してください。" },
};
export const Optional: Story = {
  name: "任意項目",
  args: {
    label: "団体のWebサイト",
    required: false,
    hint: "公開しているWebサイトがあれば入力してください。",
  },
};

export const Multiline: Story = {
  name: "複数行の入力",
  parameters: {
    docs: {
      source: {
        transform: (_source: string, context: { args: Parameters<typeof fieldExampleSource>[0] }) =>
          fieldExampleSource(context.args, "Textarea"),
      },
    },
  },
  args: {
    label: "企画紹介",
    hint: "200文字以内で入力してください。",
    required: false,
  },
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <div className="max-w-md">
        <Field {...args}>
          {(props) => (
            <Textarea
              {...props}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={200}
              rows={4}
            />
          )}
        </Field>
      </div>
    );
  },
};

export const Selection: Story = {
  name: "選択入力",
  parameters: {
    docs: {
      source: {
        transform: (_source: string, context: { args: Parameters<typeof fieldExampleSource>[0] }) =>
          fieldExampleSource(context.args, "NativeSelect"),
      },
    },
  },
  args: { label: "企画区分", hint: "主な活動内容に合わせて選んでください。" },
  render: function Render(args) {
    const [value, setValue] = useState("exhibition");
    return (
      <div className="max-w-md">
        <Field {...args}>
          {(props) => (
            <NativeSelect
              {...props}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            >
              <NativeSelectOption value="exhibition">展示</NativeSelectOption>
              <NativeSelectOption value="food">模擬店</NativeSelectOption>
              <NativeSelectOption value="stage">ステージ</NativeSelectOption>
            </NativeSelect>
          )}
        </Field>
      </div>
    );
  },
};

function ValidationExample() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const error = submitted && !value.trim() ? "企画名を入力してください。" : undefined;
  return (
    <form
      noValidate
      className="ds-stack max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        if (!value.trim()) inputRef.current?.focus();
        else setSaved(true);
      }}
    >
      <Field
        label="企画名"
        hint="パンフレットに掲載する名称を入力してください。"
        required
        error={error}
      >
        {(props) => (
          <Input
            {...props}
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
          />
        )}
      </Field>
      <div>
        <Button type="submit">保存</Button>
      </div>
      <p role="status">{saved ? "企画名を保存しました。" : ""}</p>
    </form>
  );
}

export const Validation: Story = {
  name: "入力エラーからの修正",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        type: "code",
        transform: (source: string) => source,
        code:
          `import { useRef, useState } from "react";
import { Field, Input, Button } from "@kyudaisai/ui";

` +
          fieldStoriesSource
            .slice(
              fieldStoriesSource.indexOf("function ValidationExample()"),
              fieldStoriesSource.indexOf("export const Validation:"),
            )
            .replace("function ValidationExample()", "export function ValidationExample()")
            .trim(),
      },
    },
  },
  render: () => <ValidationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: /企画名\s*（必須）/ });
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "パンフレットに掲載する名称を入力してください。 企画名を入力してください。",
    );
    await userEvent.type(input, "九大カフェ");
    await expect(input).not.toHaveAttribute("aria-invalid");
    await expect(input).toHaveAccessibleDescription(
      "パンフレットに掲載する名称を入力してください。",
    );
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("企画名を保存しました。");
  },
};

export const NarrowLongHint: Story = {
  name: "狭い画面と長い補足",
  render: () => (
    <div style={{ width: 240, maxWidth: "100%" }}>
      <Field
        label="Webサイト"
        hint="https://example.com/InternationalFestivalRegistrationInformation"
      >
        {(props) => <Input {...props} type="url" />}
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByRole("textbox").closest("[style]") as HTMLElement;
    await expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth + 1);
  },
};
