import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { CheckboxGroup } from "./selection-fields";
import { useStoryControls } from "./story-controls";

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  args: {
    label: "必要なもの",
    hint: "2つまで選択できます。",
    required: true,
    options: [
      { value: "desk", label: "机" },
      { value: "chair", label: "椅子" },
      { value: "board", label: "掲示板" },
    ],
    value: [] as string[],
    maxSelections: 2,
    disabled: false,
    readOnly: false,
    onValueChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "同じ設問の複数選択を、名前・条件・エラーとまとめます。選択上限に達しても、選択済みの項目は解除できます。必須や最少選択数の検証は利用側で行い、errorに修正方法を渡します。",
      },
    },
  },
  render: function Example(incoming) {
    const [args, updateArgs] = useStoryControls(incoming);
    return (
      <CheckboxGroup
        {...args}
        onValueChange={(value) => {
          updateArgs({ value });
          args.onValueChange(value);
        }}
      />
    );
  },
} satisfies Meta<typeof CheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "机" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "椅子" }));
    await expect(canvas.getByRole("checkbox", { name: "掲示板" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: "机" }));
    await expect(canvas.getByRole("checkbox", { name: "掲示板" })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await userEvent.click(canvas.getByRole("checkbox", { name: "掲示板" }));
    await expect(canvas.getByRole("checkbox", { name: "椅子" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "掲示板" })).toBeChecked();
  },
};
export const Invalid: Story = { args: { error: "1つ以上選択してください。" } };
export const Disabled: Story = { args: { value: ["desk"], disabled: true } };
export const ReadOnly: Story = { args: { value: ["desk"], readOnly: true } };
export const OptionsChanged: Story = {
  args: { value: ["removed-option"], maxSelections: 1, hint: "1つまで選択できます。" },
  play: async ({ args, canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", { name: "机" });
    await expect(checkbox).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["desk"]);
  },
};

export const NarrowLongChoice: Story = {
  name: "狭い画面と長い選択肢",
  render: (args) => (
    <div style={{ width: 240, maxWidth: "100%" }}>
      <CheckboxGroup
        {...args}
        options={[{ value: "long", label: "InternationalFestivalRegistrationInformation" }]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByRole("checkbox").closest("[style]") as HTMLElement;
    await expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth + 1);
  },
};
