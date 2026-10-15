import type { Meta, StoryObj } from "@storybook/react-native";

import { BoardExample } from "./extended-examples";
const meta = {
  title: "Components/AssignmentBoard",
  component: BoardExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "勤務の配置・固定・不足。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof BoardExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { empty: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
