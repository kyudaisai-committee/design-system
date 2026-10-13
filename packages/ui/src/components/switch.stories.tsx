import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./switch";
import { Label } from "./label";

const meta = {
  title: "Components/Switch",
  component: Switch,
  args: { checked: false, disabled: false, size: "default" },
  argTypes: {
    checked: { control: "boolean", description: "設定が有効かどうか。" },
    disabled: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["default", "sm"],
      description: "見た目のサイズ。操作領域は44px以上。",
      table: { defaultValue: { summary: "default" } },
    },
    onCheckedChange: {
      control: false,
      description: "新しい有効・無効の値を受け取る。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "設定をその場で有効・無効に切り替えます。保存時にまとめて反映する選択や、同意の確認にはCheckboxを使います。\n\nラベルには「通知を受け取る」のように設定の内容を書き、状態が変わっても変更しません。Spaceキーでも切り替えられます。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="flex min-h-11 items-center gap-4">
        <Switch
          {...args}
          id={id}
          onCheckedChange={(checked) => updateArgs({ checked })}
        />
        <Label htmlFor={id} className="min-h-11 leading-normal">
          メール通知を受け取る
        </Label>
      </div>
    );
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch", {
      name: "メール通知を受け取る",
    });
    toggle.focus();
    await userEvent.keyboard(" ");
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
  },
};
export const Checked: Story = { name: "有効", args: { checked: true } };
export const Disabled: Story = { name: "操作不可", args: { disabled: true } };
export const Small: Story = {
  name: "小さい表示",
  args: { size: "sm", checked: true },
};
