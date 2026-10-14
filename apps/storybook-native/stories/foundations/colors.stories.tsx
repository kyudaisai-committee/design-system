import type { Meta, StoryObj } from "@storybook/react-native";

import { Text, useNativeTheme } from "@kyudaisai/ui-native";
import { View } from "react-native";

function Colors() {
  const { colors } = useNativeTheme();
  const roles = [
    ["背景と本文", colors.background, colors.foreground],
    ["主な操作", colors.primary, colors.primaryForeground],
    ["補足情報", colors.muted, colors.mutedForeground],
    ["完了", colors.successBackground, colors.success],
    ["注意", colors.warningBackground, colors.warning],
    ["失敗", colors.dangerBackground, colors.danger],
    ["案内", colors.infoBackground, colors.info],
  ];
  return (
    <View style={{ gap: 16 }}>
      <Text variant="title">役割で色を選ぶ</Text>
      <Text>
        Webと同じ役割を持つ色を使います。状態名も表示し、色だけで結果を伝えないようにします。
      </Text>
      {roles.map(([label, background, foreground]) => (
        <View
          key={label}
          style={{
            padding: 16,
            gap: 4,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: background,
          }}
        >
          <Text variant="heading" style={{ color: foreground }}>
            {label}
          </Text>
          <Text style={{ color: foreground }}>
            {foreground} / {background}
          </Text>
        </View>
      ))}
    </View>
  );
}
const meta = { title: "Foundations/Colors", render: () => <Colors /> } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Palette: Story = {};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
