import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  subcomponents: {
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
  },
  args: { open: false },
  argTypes: {
    open: { control: "boolean", description: "メニューの開閉状態。" },
    onOpenChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "同じ対象に対する補助操作をメニューにまとめます。よく使う操作はメニューの外に表示してください。入力値の選択にはNativeSelectやRadioGroupを使います。\n\n上下キーで項目を選び、Enterキーで実行します。Escapeキーで閉じると、開くときに使ったボタンへフォーカスが戻ります。",
      },
    },
  },
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    const [action, setAction] = useState("");
    return (
      <div className="grid justify-items-start gap-4">
        <DropdownMenu {...args} onOpenChange={(open) => updateArgs({ open })}>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            申請の操作
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>企画申請書</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setAction("控えを保存しました。")}>
                控えを保存
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAction("申請を複製しました。")}>
                複製
              </DropdownMenuItem>
              <DropdownMenuItem disabled>担当者を変更</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setAction("下書きを削除しました。")}
            >
              下書きを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {action && (
          <p role="status" className="text-sm">
            {action}
          </p>
        )}
      </div>
    );
  },
} satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "申請の操作",
    });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole("menu");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const Open: Story = {
  name: "開いた状態",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
};
export const Selection: Story = {
  name: "表示設定",
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    const [showDate, setShowDate] = useState(true);
    const [density, setDensity] = useState("standard");
    return (
      <DropdownMenu {...args} onOpenChange={(open) => updateArgs({ open })}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>表示設定</DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>表示する項目</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={showDate} onCheckedChange={setShowDate}>
              更新日
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>表示密度</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="standard">標準</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact">コンパクト</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
export const Submenu: Story = {
  name: "サブメニュー",
  render: function Render(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <DropdownMenu {...args} onOpenChange={(open) => updateArgs({ open })}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>資料の操作</DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuItem>表示</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>書き出す</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            印刷
            <DropdownMenuShortcut aria-hidden="true">⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shortcut はキー表示のみです。実画面では対応するキー操作も実装してください。サブメニューは左右キーで出入りできます。",
      },
    },
  },
};
