import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ImageExample } from "./extended-examples";
import { PublicImage } from "./media";
const meta = {
  title: "Components/PublicImage",
  component: ImageExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "公開画像と取得状態。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ImageExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Failure: Story = { args: { failed: true } };
export const Pending: Story = { args: { loading: true } };
export const Expired: Story = {
  render: () => (
    <PublicImage
      asset={{
        id: "expired",
        src: "https://example.com/private.jpg",
        alt: "非公開の説明",
        caption: "非公開の注記",
        expiresAt: 1,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(canvas.queryByLabelText("非公開の説明")).toBeNull();
    await expect(canvas.queryByText("非公開の注記")).toBeNull();
  },
};
