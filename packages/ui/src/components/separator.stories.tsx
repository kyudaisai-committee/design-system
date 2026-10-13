import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "区切り線の向き。縦線は親の高さに合わせる。",
      table: { defaultValue: { summary: "horizontal" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "隣接する情報のまとまりを線で区切ります。見出しや余白だけで区別できる場合は、追加する必要はありません。装飾だけの線には`aria-hidden=\"true\"`を指定します。",
      },
    },
  },
  render: (args) => (
    <div
      className={
        args.orientation === "vertical"
          ? "flex max-w-md items-stretch gap-5"
          : "grid max-w-md gap-4"
      }
    >
      <div>
        <h2 className="font-medium">企画責任者</h2>
        <p className="text-sm text-muted-foreground">九大 花子</p>
      </div>
      <Separator {...args} />
      <div>
        <h2 className="font-medium">当日の担当者</h2>
        <p className="text-sm text-muted-foreground">九大 太郎</p>
      </div>
    </div>
  ),
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "横",
};
export const Vertical: Story = {
  name: "縦",
  args: { orientation: "vertical" },
};
export const Decorative: Story = {
  name: "装飾",
  args: { "aria-hidden": true },
};
