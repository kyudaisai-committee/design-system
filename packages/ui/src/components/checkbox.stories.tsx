import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStoryControls } from "./story-controls";
import { expect, fn, userEvent, within } from "storybook/test";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "選択状態。制御する場合は onCheckedChange で更新する。",
    },
    defaultChecked: { control: false, description: "初回表示時の選択状態。" },
    indeterminate: {
      control: "boolean",
      description:
        "一部だけ選択されている状態。読み上げでは mixed として伝わる。",
    },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    onCheckedChange: {
      control: false,
      description: "(checked, eventDetails) を受け取る。",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "複数の選択肢を選ぶ場合や、内容への同意を確認する場合に使います。一つだけを選ぶ設問にはRadioGroup、設定をすぐに反映する切り替えにはSwitchを使います。\n\nLabelと関連付け、ラベルを含めて44px以上の操作領域を確保してください。関連する選択肢は`fieldset`でまとめ、`legend`に設問を書きます。",
      },
    },
  },
  render: function Render(incoming, { id }) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox
          {...args}
          id={`${id}-checkbox`}
          onCheckedChange={(checked, details) => {
            updateArgs({ checked, indeterminate: false });
            args.onCheckedChange?.(checked, details);
          }}
        />
        <Label htmlFor={`${id}-checkbox`} className="min-h-11 leading-normal">
          掲載内容を確認しました
        </Label>
      </div>
    );
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "基本",
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "掲載内容を確認しました",
    });
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    await userEvent.click(
      within(canvasElement).getByText("掲載内容を確認しました"),
    );
    await expect(checkbox).not.toBeChecked();
  },
};
export const Checked: Story = { name: "選択済み", args: { checked: true } };
export const StateClassName: Story = {
  name: "状態に応じたスタイル",
  args: {
    className: fn((state: { checked: boolean }) =>
      state.checked ? "outline outline-2 outline-offset-2" : undefined,
    ),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("checkbox"));
    await expect(args.className).toHaveBeenCalledWith(
      expect.objectContaining({ checked: true }),
    );
  },
};
export const Indeterminate: Story = {
  name: "一部選択",
  args: { indeterminate: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  },
};
export const Disabled: Story = {
  name: "無効",
  render: () => (
    <div className="grid gap-2">
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox id="disabled-off" disabled />
        <Label htmlFor="disabled-off" className="min-h-11 leading-normal">
          受付開始前
        </Label>
      </div>
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox id="disabled-on" checked disabled />
        <Label htmlFor="disabled-on" className="min-h-11 leading-normal">
          提出済み
        </Label>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "受付開始前",
    });
    await expect(checkbox).toHaveAttribute("aria-disabled", "true");
    await expect(Number(getComputedStyle(checkbox).opacity)).toBeLessThan(1);
    await expect(
      Number(
        getComputedStyle(within(canvasElement).getByText("受付開始前")).opacity,
      ),
    ).toBeLessThan(1);
  },
};
export const Invalid: Story = {
  name: "確認エラー",
  render: () => (
    <div className="grid gap-2">
      <div className="flex min-h-11 items-center gap-3">
        <Checkbox
          id="required-review"
          aria-invalid
          aria-describedby="review-error"
          required
        />
        <Label htmlFor="required-review" className="min-h-11 leading-normal">
          掲載内容を確認しました <span>必須</span>
        </Label>
      </div>
      <p id="review-error" className="text-sm text-destructive">
        掲載内容を確認してから提出してください。
      </p>
    </div>
  ),
};
export const Group: Story = {
  name: "複数選択",
  render: () => (
    <fieldset className="grid gap-2">
      <legend className="mb-2 font-medium">必要な設備</legend>
      {[
        ["table", "机"],
        ["chair", "椅子"],
        ["power", "電源"],
      ].map(([id, label]) => (
        <div key={id} className="flex min-h-11 items-center gap-3">
          <Checkbox
            id={id}
            name="equipment"
            value={id}
            defaultChecked={id === "table"}
          />
          <Label htmlFor={id} className="min-h-11 leading-normal">
            {label}
          </Label>
        </div>
      ))}
    </fieldset>
  ),
};
