import type { Meta, StoryObj } from "@storybook/react-native";

import { spacing } from "@kyudaisai/tokens/native";
import { Text, useNativeTheme } from "@kyudaisai/ui-native";
import { View } from "react-native";

function Spacing() {
  const { colors } = useNativeTheme();
  return (
    <View style={{ gap: 24 }}>
      <Text variant="title">情報のまとまりを余白で示す</Text>
      <Text>ラベルと入力欄は8、関連する操作は12、情報のまとまり同士は24を目安にします。</Text>
      {Object.entries(spacing).map(([step, value]) => (
        <View key={step} style={{ gap: 8 }}>
          <Text>
            step-{step}：{value}
          </Text>
          <View style={{ width: value, height: 24, backgroundColor: colors.primary }} />
        </View>
      ))}
    </View>
  );
}
const meta = { title: "Foundations/Spacing", render: () => <Spacing /> } satisfies Meta;
export default meta;
export const Scale: StoryObj<typeof meta> = {};
