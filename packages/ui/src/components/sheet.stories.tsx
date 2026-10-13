import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

function renderSheet(
  side: "left" | "right" | "top" | "bottom",
): Meta<typeof Sheet>["render"] {
  return function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <Sheet {...args} onOpenChange={(open) => updateArgs({ open })}>
        <SheetTrigger render={<Button variant="outline" />}>
          絞り込み
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>申請の絞り込み</SheetTitle>
            <SheetDescription>
              表示する申請の状態を選択してください。
            </SheetDescription>
          </SheetHeader>
          <fieldset className="grid gap-2 px-4">
            <legend className="mb-2 font-medium">提出状況</legend>
            {[
              ["draft", "下書き"],
              ["submitted", "提出済み"],
              ["returned", "要修正"],
            ].map(([value, label]) => (
              <div key={value} className="flex min-h-11 items-center gap-3">
                <Checkbox
                  id={`${id}-${value}`}
                  defaultChecked={value === "submitted"}
                />
                <Label htmlFor={`${id}-${value}`} className="min-h-11">
                  {label}
                </Label>
              </div>
            ))}
          </fieldset>
          <SheetFooter>
            <SheetClose render={<Button />}>条件を適用</SheetClose>
            <SheetClose render={<Button variant="outline" />}>
              キャンセル
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  };
}
const meta = {
  title: "Components/Sheet",
  component: Sheet,
  subcomponents: {
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
  },
  args: { open: false },
  argTypes: {
    open: { control: "boolean", description: "パネルの開閉状態。" },
    onOpenChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "画面の端からパネルを開き、絞り込みや補足情報を表示します。元の画面を参照しながら行う、短い作業に使います。長い編集には独立したページを使ってください。\n\nSheetTitleに作業の名前を付け、SheetContentの`side`で開く方向を指定します。Escapeキーで閉じると、開くときに使ったボタンへフォーカスが戻ります。",
      },
    },
  },
  render: renderSheet("right"),
} satisfies Meta<typeof Sheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
};
export const Right: Story = {
  name: "右",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
};
export const Left: Story = {
  name: "左",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  render: renderSheet("left"),
};
export const Bottom: Story = {
  name: "下",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  render: renderSheet("bottom"),
};
export const Top: Story = {
  name: "上",
  args: { open: true },
  parameters: { docs: { story: { inline: false, height: "420px" } } },
  render: renderSheet("top"),
};
export const Keyboard: Story = {
  name: "キーボード操作",
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "絞り込み",
    });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "申請の絞り込み" });
    await expect(
      within(dialog).getByRole("checkbox", { name: "提出済み" }),
    ).toBeChecked();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
