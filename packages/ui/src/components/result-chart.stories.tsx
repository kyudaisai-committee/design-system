import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChartExample } from "./extended-examples";
const meta = {
  title: "Components/ResultChart",
  component: ChartExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "数値と結果図表。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ChartExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
export const Failure: Story = { args: { failed: true } };
