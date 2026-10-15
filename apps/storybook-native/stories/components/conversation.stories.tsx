import type { Meta, StoryObj } from "@storybook/react-native";

import { ConversationExample } from "./extended-examples";
const meta = {
  title: "Components/Conversation",
  component: ConversationExample,
  args: { disabled: false, empty: false, failed: false, loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "会話一覧・投稿・スレッド。表示する対象・権限・保存処理は利用側で確認してください。",
      },
    },
  },
} satisfies Meta<typeof ConversationExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
