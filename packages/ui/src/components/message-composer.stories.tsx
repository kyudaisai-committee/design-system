import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { ComposerExample } from "./extended-examples";
const meta = {
  title: "Components/MessageComposer",
  component: ComposerExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "本文・添付と送信状態。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ComposerExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Failure: Story = { args: { failed: true } };
export const Pending: Story = { args: { loading: true } };
export const ImeAndExplicitSend: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("本文");
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    await userEvent.click(canvas.getByRole("button", { name: "送信" }));
    await expect(canvas.queryByText("送信済み")).toBeNull();
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    await userEvent.click(canvas.getByRole("button", { name: "送信" }));
    await expect(canvas.getByText("送信済み")).toBeVisible();
  },
};
