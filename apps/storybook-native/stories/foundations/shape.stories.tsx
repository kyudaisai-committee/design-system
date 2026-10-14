import type { Meta, StoryObj } from "@storybook/react-native";

import { radii } from "@kyudaisai/tokens/native";
import { Text, useNativeTheme } from "@kyudaisai/ui-native";
import { Platform, View } from "react-native";

function Shapes() {
  const { colors } = useNativeTheme();
  return (
    <View style={{ gap: 24 }}>
      <Text variant="title">形と操作領域</Text>
      <Text>
        角丸は役割に合わせて選びます。操作領域は{Platform.OS === "android" ? "48dp" : "44pt"}
        以上を基本とし、文字が大きいときは高さを広げます。
      </Text>
      {Object.entries(radii).map(([name, radius]) => (
        <View key={name} style={{ gap: 8 }}>
          <Text>
            {name}：{radius}
          </Text>
          <View
            style={{
              height: 64,
              width: 144,
              borderWidth: 1,
              borderColor: colors.input,
              borderRadius: radius,
              backgroundColor: colors.muted,
            }}
          />
        </View>
      ))}
    </View>
  );
}
const meta = { title: "Foundations/Shape", render: () => <Shapes /> } satisfies Meta;
export default meta;
export const Roles: StoryObj<typeof meta> = {};
