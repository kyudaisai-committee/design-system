import type { Meta, StoryObj } from "@storybook/react-native";

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
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
