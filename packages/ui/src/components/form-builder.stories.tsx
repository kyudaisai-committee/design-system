import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { BuilderExample } from "./extended-examples";
const meta = {
  title: "Components/FormBuilder",
  component: BuilderExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "フォームの作成と並替え。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof BuilderExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { empty: true } };
export const ReorderAndDuplicate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "項目1を複製" }));
    await expect(canvas.getAllByLabelText("項目名")).toHaveLength(2);
    const names = canvas.getAllByLabelText("項目名");
    await userEvent.clear(names[1]);
    await userEvent.type(names[1], "会場名");
    await userEvent.click(canvas.getByRole("button", { name: "項目2を上へ" }));
    await expect(canvas.getAllByLabelText("項目名")[0]).toHaveValue("会場名");
    await userEvent.click(canvas.getByRole("button", { name: "プレビュー" }));
    await expect(canvas.getByLabelText("フォームのプレビュー")).toHaveTextContent("会場名");
  },
};
