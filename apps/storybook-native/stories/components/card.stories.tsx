import type { Meta, StoryObj } from "@storybook/react-native";

import { Card, Text } from "@kyudaisai/ui-native";

const meta = {
  title: "Components/Card",
  component: Card,
  args: {
    title: "対象の情報",
    children: <Text>名称・日時・場所を一つのまとまりで示します。</Text>,
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongContent: Story = {
  args: {
    title: "地域との交流を目的とする展示と体験企画のご案内",
    children: (
      <Text>
        長い名称や説明は省略せず、文字の拡大に合わせて折り返します。必要な情報を読み終えてから、次の操作を選べるようにします。
      </Text>
    ),
  },
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
