import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within, waitFor } from "storybook/test";

import { ConfirmDialog } from "./confirm-dialog";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    trigger: "企画を削除",
    title: "「九大カフェ」を削除しますか？",
    description: "企画と添付資料を削除します。この操作は取り消せません。",
    confirmLabel: "企画を削除",
    destructive: true,
    onConfirm: fn(),
  },
  argTypes: {
    trigger: { control: "text", description: "ダイアログを開く操作名。" },
    title: { control: "text", description: "対象と確認する操作。" },
    description: {
      control: "text",
      description: "操作の影響。件数や取り消せない内容を含める。",
    },
    confirmLabel: {
      control: "text",
      description: "確定する操作名。「はい」だけにしない。",
    },
    pendingLabel: {
      control: "text",
      description: "処理中の操作名。",
      table: { defaultValue: { summary: "処理中…" } },
    },
    errorMessage: {
      control: "text",
      description: "失敗理由と次にできる行動。入力と確認内容を保ったまま表示する。",
    },
    destructive: {
      control: "boolean",
      description: "削除・取消など、失う内容がある操作を強調する。",
      table: { defaultValue: { summary: "false" } },
    },
    onConfirm: {
      control: false,
      description: "確定する処理。Promise の成功時だけ閉じ、失敗時は再試行できる。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "削除や提出の前に対象と影響を確認し、確定後の処理を実行します。処理中は確定・キャンセル・Escapeキーによる操作を無効にし、成功時に閉じます。失敗時は確認内容を残し、再試行できます。\n\nボタンには「企画を削除」のように具体的な操作名を付けてください。開閉や内容を個別に組み立てる場合はAlertDialogを使います。",
      },
    },
  },
} satisfies Meta<typeof ConfirmDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Submit: Story = {
  name: "提出の確認",
  args: {
    trigger: "申請を提出",
    title: "「九大カフェ」の申請を提出しますか？",
    description: "企画申請書と添付資料3件を提出します。提出後の修正は担当者へ連絡してください。",
    confirmLabel: "申請を提出",
    pendingLabel: "提出中…",
    destructive: false,
  },
};

export const Cancel: Story = {
  name: "キャンセルとフォーカス復帰",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "企画を削除" });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await expect(dialog).toHaveAccessibleName("「九大カフェ」を削除しますか？");
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "キャンセル" })).toHaveFocus(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onConfirm).not.toHaveBeenCalled();
  },
};
export const Confirm: Story = {
  name: "削除の確定",
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "企画を削除" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "企画を削除" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};
export const Failure: Story = {
  name: "失敗時も内容を保持",
  args: {
    onConfirm: fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      throw new Error("Demo failure");
    }),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "企画を削除" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("alertdialog");
    const confirm = within(dialog).getByRole("button", { name: "企画を削除" });
    confirm.focus();
    await userEvent.keyboard("{Enter}");
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "処理できませんでした",
    );
    await expect(within(dialog).getByRole("button", { name: "企画を削除" })).toBeEnabled();
    await expect(confirm).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onConfirm).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(confirm).not.toHaveAttribute("aria-disabled", "true"));
    await expect(confirm).toHaveFocus();
  },
};
export const Pending: Story = {
  name: "処理中の二重操作防止",
  args: { onConfirm: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "企画を削除" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "企画を削除" }));
    await expect(within(dialog).getByRole("button", { name: "処理中…" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(within(dialog).getByRole("button", { name: "キャンセル" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(dialog).toBeInTheDocument();
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};
