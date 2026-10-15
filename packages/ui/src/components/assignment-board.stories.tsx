import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { BoardExample } from "./extended-examples";
const meta = {
  title: "Components/AssignmentBoard",
  component: BoardExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "勤務の配置・固定・不足。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof BoardExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { empty: true } };
export const MoveAndLock: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("受付担当Aの配置先")).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "受付担当Aの配置を固定する" }));
    await expect(canvas.getByLabelText("受付担当Aの配置先")).toBeEnabled();
    await userEvent.selectOptions(canvas.getByLabelText("受付担当Aの配置先"), "afternoon");
    await expect(canvas.getByText("2人・1人超過")).toBeVisible();
  },
};
