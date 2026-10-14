import type { Meta, StoryObj } from "@storybook/react-vite";

import { Download } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipProvider, TooltipTrigger, TooltipContent },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "初期表示。開閉を制御する場合は open と onOpenChange を使う。",
    },
    open: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "アイコンへの短い補足を、マウスポインターを重ねたときやキーボードでフォーカスしたときに表示します。必須の案内やエラーは、常に見える場所に記載してください。\n\nアイコンボタンには`aria-label`で操作名を付けます。Tooltip内にはリンクやボタンを入れません。Escapeキーで閉じられます。",
      },
    },
  },
  render: (args) => (
    <div className="p-10">
      <TooltipProvider delay={200}>
        <Tooltip {...args}>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" aria-label="控えをPDFで保存" />}
          >
            <Download aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>控えをPDFで保存</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "控えをPDFで保存",
    });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByText("控えをPDFで保存")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByText("控えをPDFで保存")).not.toBeInTheDocument());
    await expect(button).toHaveFocus();
  },
};
export const Open: Story = {
  name: "表示中",
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, height: "160px" } } },
};
export const Bottom: Story = {
  name: "下に表示",
  parameters: { docs: { story: { inline: false, height: "180px" } } },
  render: (args) => (
    <div className="p-10">
      <TooltipProvider>
        <Tooltip {...args} defaultOpen>
          <TooltipTrigger render={<Button variant="outline" />}>受付番号</TooltipTrigger>
          <TooltipContent side="bottom">問い合わせの際にお伝えください</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
};
