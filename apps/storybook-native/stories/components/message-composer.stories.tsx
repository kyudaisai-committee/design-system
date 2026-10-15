import type { Meta, StoryObj } from "@storybook/react-native";

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
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
