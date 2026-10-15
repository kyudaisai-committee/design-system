import type { Meta, StoryObj } from "@storybook/react-native";

import { MapExample } from "./extended-examples";
const meta = {
  title: "Components/MapView",
  component: MapExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component: "地図と会場一覧。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof MapExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
