import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { MapEditingExample } from "./extended-examples";
const meta = {
  title: "Components/MapEditor",
  component: MapEditingExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "場所と配置の編集。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof MapEditingExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { empty: true } };
export const PositionEditing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "中央広場" }));
    await expect(canvas.getByLabelText("場所の名前")).toHaveValue("中央広場");
    await userEvent.clear(canvas.getByLabelText("場所の名前"));
    await userEvent.type(canvas.getByLabelText("場所の名前"), "案内所");
    await expect(canvas.getByRole("button", { name: "案内所" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "拡大" }));
    await expect(canvas.getByRole("img")).not.toHaveAttribute("viewBox", "0 0 100 100");
  },
};
