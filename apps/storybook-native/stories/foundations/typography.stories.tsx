import type { Meta, StoryObj } from "@storybook/react-native";

import { Text } from "@kyudaisai/ui-native";
import { View, useWindowDimensions } from "react-native";

function Typography() {
  const { fontScale } = useWindowDimensions();
  return (
    <View style={{ gap: 24 }}>
      <Text variant="title">文字の大きさと役割</Text>
      <Text>
        端末標準の書体を使い、OSの文字サイズ設定に追従します。現在の文字倍率は{fontScale.toFixed(2)}
        です。
      </Text>
      {(["title", "heading", "body", "label", "caption"] as const).map((variant) => (
        <View key={variant} style={{ gap: 8 }}>
          <Text variant="caption" tone="muted">
            {variant}
          </Text>
          <Text variant={variant}>九大祭の案内と参加手続き 2026</Text>
        </View>
      ))}
      <Text>
        地域との交流を目的とする展示と体験企画のご案内。長い名称や説明を省略せず、画面幅と文字サイズに合わせて折り返します。
      </Text>
    </View>
  );
}
const meta = { title: "Foundations/Typography", render: () => <Typography /> } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Scale: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
