import type { Meta, StoryObj } from "@storybook/react-native";

import { PhotoExample } from "./extended-examples";
const meta = {
  title: "Components/PhotoPicker",
  component: PhotoExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "端末標準の写真選択・切り抜き。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof PhotoExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
