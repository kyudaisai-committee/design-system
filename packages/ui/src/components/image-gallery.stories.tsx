import type { Meta, StoryObj } from "@storybook/react-vite";

import { GalleryExample } from "./extended-examples";
const meta = {
  title: "Components/ImageGallery",
  component: GalleryExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "写真一覧と拡大。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof GalleryExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
