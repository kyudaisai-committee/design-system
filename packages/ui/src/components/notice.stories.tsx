import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { Field, Notice } from "./compositions";
import { Input } from "./input";

const meta = {
  title: "Components/Notice",
  component: Notice,
  args: {
    title: "受付期間を延長しました",
    tone: "info",
    children: "企画申請書を10月20日 17:00までに提出してください。",
  },
  argTypes: {
    title: { control: "text", description: "案内の要点。" },
    children: { control: "text", description: "理由・期限・次の行動。" },
    tone: {
      control: "inline-radio",
      options: ["info", "success", "warning", "danger"],
      table: { defaultValue: { summary: "info" } },
    },
    role: {
      control: "select",
      options: ["static", "status", "alert"],
      mapping: { static: undefined },
      description: "静的な案内は指定なし。操作結果はstatus、直ちに伝える失敗はalert。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '案内・完了・注意・失敗を、意味に応じた色で画面内に表示します。タイトルに要点、本文に理由や次の行動を書いてください。\n\nroleを省略した場合は、自動読み上げを行いません。操作結果を追加表示する場合は`role="status"`、すぐに伝える必要があるエラーには`role="alert"`を指定します。',
      },
    },
  },
  render: (args) => <Notice {...args} className="max-w-xl" />,
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "案内" };
export const Success: Story = {
  name: "完了",
  args: {
    title: "企画情報を提出しました",
    tone: "success",
    children: "受付番号：A-2026-001",
    role: "status",
  },
};
export const Warning: Story = {
  name: "対応が必要",
  args: {
    title: "配置図を修正してください",
    tone: "warning",
    children: "避難経路を追記し、10月20日 17:00までに再提出してください。",
  },
};
export const Failure: Story = {
  name: "失敗",
  args: {
    title: "保存できませんでした",
    tone: "danger",
    children: "入力内容は残っています。接続を確認して、もう一度保存してください。",
    role: "alert",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(
      "もう一度保存してください",
    );
  },
};

function SaveExample() {
  const [name, setName] = useState("九大カフェ");
  const [state, setState] = useState<"dirty" | "saving" | "saved">("dirty");
  return (
    <form
      className="ds-stack max-w-xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setState("saving");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setState("saved");
      }}
    >
      <Field label="企画名" required>
        {(props) => (
          <Input
            {...props}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setState("dirty");
            }}
            readOnly={state === "saving"}
          />
        )}
      </Field>
      <Notice
        role="status"
        tone={state === "saved" ? "success" : "info"}
        title={
          state === "saved"
            ? "企画名を保存しました"
            : state === "saving"
              ? "保存しています"
              : "未保存の変更があります"
        }
      />
      <div>
        <Button type="submit" pending={state === "saving"} disabled={state === "saved"}>
          {state === "saving" ? "保存中…" : "保存"}
        </Button>
      </div>
    </form>
  );
}

export const UpdatedResult: Story = {
  name: "操作結果の更新",
  render: () => <SaveExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "保存" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("保存しています");
    await expect(canvas.getByRole("button", { name: "保存中…" })).toBeDisabled();
    await expect(await canvas.findByText("企画名を保存しました")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("企画名を保存しました");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
