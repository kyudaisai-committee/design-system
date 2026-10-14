import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  subcomponents: {
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogPortal,
    DialogOverlay,
  },
  args: { open: false },
  argTypes: {
    open: { control: "boolean", description: "ダイアログの開閉状態。" },
    onOpenChange: {
      control: false,
      description: "開閉要求を受け取り、open を更新する。",
    },
    modal: {
      control: "boolean",
      description: "背景の操作を制限する。通常は true。",
      table: { defaultValue: { summary: "true" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "元の画面を離れずに、短い入力や詳細の確認を行います。長い編集には独立したページ、削除や取消の確定にはConfirmDialogを使います。\n\nDialogTitleに操作の対象を書きます。Tabキーでダイアログ内を移動し、Escapeキーで閉じると、開くときに使ったボタンへフォーカスが戻ります。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <Dialog {...args} onOpenChange={(open) => updateArgs({ open })}>
        <DialogTrigger render={<Button variant="outline" />}>連絡先を編集</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>連絡先を編集</DialogTitle>
            <DialogDescription>当日連絡が取れる電話番号を入力してください。</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              updateArgs({ open: false });
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor={`${id}-phone`}>電話番号</Label>
              <Input
                id={`${id}-phone`}
                type="tel"
                autoComplete="tel"
                defaultValue="090-1234-5678"
                required
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>キャンセル</DialogClose>
              <Button type="submit">変更を保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
} satisfies Meta<typeof Dialog>;
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
      name: "連絡先を編集",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "連絡先を編集" });
    const input = within(dialog).getByRole("textbox", { name: "電話番号" });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.clear(input);
    await userEvent.type(input, "080-1234-5678");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const LongContent: Story = {
  name: "長い内容",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <Dialog {...args} onOpenChange={(open) => updateArgs({ open })}>
        <DialogTrigger render={<Button variant="outline" />}>搬入手順を確認</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>搬入当日の手順</DialogTitle>
            <DialogDescription>受付から設営までの流れを確認してください。</DialogDescription>
          </DialogHeader>
          <ol className="grid list-decimal gap-5 pl-5">
            {[
              "指定された時間に車両受付へ到着してください。到着が遅れる場合は、運営本部へ連絡してください。",
              "受付で企画番号と責任者の名前を伝え、車両許可証を見える場所へ掲示してください。",
              "スタッフの案内に従って、指定された荷下ろし場所へ移動してください。",
              "通路と避難経路を空けて荷下ろしを行い、車両を速やかに指定の駐車場所へ移動してください。",
              "会場配置図に合わせて備品を設置してください。電源や水道の接続はスタッフの確認後に行ってください。",
              "設営が完了したら担当者へ報告し、安全確認を受けてください。",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    );
  },
};
