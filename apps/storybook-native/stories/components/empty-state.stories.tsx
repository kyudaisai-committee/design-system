import type { Meta, StoryObj } from "@storybook/react-native";

import { EmptyState, Button } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    title: "まだ対象がありません",
    description: "最初の内容を登録すると、ここに表示されます。",
    action: <Button title="新しく作成" onPress={() => {}} />,
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoResults: Story = {
  args: {
    title: "条件に合う対象がありません",
    description: "検索条件を変更してください。",
    action: undefined,
  },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
