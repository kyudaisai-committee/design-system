import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

const meta = {
  title: "Components/AlertDialog",
  component: AlertDialog,
  subcomponents: {
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
  },
  args: { open: false, onOpenChange: fn() },
  argTypes: {
    open: {
      control: "boolean",
      description: "アプリ側で管理する開閉状態。onOpenChangeで更新する。",
    },
    defaultOpen: { control: false, description: "初回表示時の開閉状態。" },
    onOpenChange: {
      control: false,
      description: "開閉要求を受け取る。非同期処理の成否は利用側で制御する。",
    },
    children: {
      control: false,
      description:
        "Trigger、Content、Title、Description、Action、Cancel で構成する。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "削除や取消の前に、対象と影響を確認するダイアログです。非同期処理の実行・失敗・再試行までまとめて扱う場合は、ConfirmDialogを使います。\n\nAlertDialogActionは自動で閉じないため、処理の結果に合わせて開閉を制御してください。Tabキーでダイアログ内を移動します。キャンセルまたはEscapeキーで閉じると、開くときに使ったボタンへフォーカスが戻ります。",
      },
    },
  },
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <AlertDialog
        {...args}
        onOpenChange={(open, details) => {
          updateArgs({ open });
          args.onOpenChange?.(open, details);
        }}
      >
        <AlertDialogTrigger render={<Button variant="outline" />}>
          編集を終了
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>変更を破棄しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              保存していない企画紹介の変更が失われます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>編集を続ける</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => updateArgs({ open: false })}
            >
              変更を破棄
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
};
export const Open: Story = {
  name: "開いた状態",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
};
export const Keyboard: Story = {
  name: "キーボード操作",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "編集を終了",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog", {
      name: "変更を破棄しますか？",
    });
    await expect(dialog).toHaveAccessibleDescription(
      "保存していない企画紹介の変更が失われます。",
    );
    const cancel = within(dialog).getByRole("button", { name: "編集を続ける" });
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "変更を破棄" }),
      ).toHaveFocus(),
    );
    await userEvent.tab();
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
export const Confirm: Story = {
  name: "確定",
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "編集を終了" }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "変更を破棄" }),
    );
    await waitFor(() =>
      expect(body.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  },
};
