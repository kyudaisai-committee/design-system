import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { ConditionExample } from "./extended-examples";
const meta = {
  title: "Components/ConditionEditor",
  component: ConditionExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "条件の組合せ。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ConditionExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { empty: true } };
export const AddGroup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "グループを追加" }));
    await expect(canvas.getAllByLabelText("条件の組合せ")).toHaveLength(2);
    await userEvent.type(canvas.getByLabelText("条件1の値"), "企画");
    await expect(canvas.getByLabelText("条件1の値")).toHaveValue("展示企画");
  },
};
