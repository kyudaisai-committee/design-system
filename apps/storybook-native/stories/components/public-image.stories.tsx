import type { Meta, StoryObj } from "@storybook/react-native";

import { ImageExample } from "./extended-examples";
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
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
