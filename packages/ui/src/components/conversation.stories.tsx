import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ConversationLayout } from "./conversation";
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
export const RetainedThread: Story = {
  render: () => (
    <ConversationLayout
      view="list"
      list={<p>会話の一覧</p>}
      conversation={<p>会話の本文</p>}
      thread={<p>保持しているスレッド</p>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (canvasElement.clientWidth < 1088)
      await expect(canvas.getByText("保持しているスレッド")).not.toBeVisible();
  },
};
export const Discovery: Story = {
  render: () => (
    <ConversationLayout
      view="list"
      showDiscovery
      list={<p>会話の一覧</p>}
      conversation={<p>会話の本文</p>}
      thread={<p>保持しているスレッド</p>}
      discovery={<p>検索結果</p>}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("保持しているスレッド")).not.toBeVisible();
    await expect(canvas.getByText("検索結果")).toBeVisible();
    if (canvasElement.clientWidth < 768)
      await expect(canvas.getByText("会話の一覧")).not.toBeVisible();
  },
};
