import type { Meta, StoryObj } from "@storybook/react-native";

import {
  BottomTabBar,
  Text,
  useNativeTheme,
  type BottomTabBarProps,
  type BottomTabItem,
} from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { action } from "storybook/actions";

function tabIcon(name: "home" | "list" | "settings"): BottomTabItem["renderIcon"] {
  return ({ color, size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === "home" ? (
        <Path
          d="M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : name === "list" ? (
        <Path
          d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      ) : (
        <>
          <Path
            d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Circle cx={12} cy={12} r={7} stroke={color} strokeWidth={1.8} />
          <Circle cx={12} cy={12} r={2.5} stroke={color} strokeWidth={1.8} />
        </>
      )}
    </Svg>
  );
}

const items: BottomTabItem[] = [
  { value: "home", label: "ホーム", renderIcon: tabIcon("home") },
  { value: "list", label: "一覧", renderIcon: tabIcon("list") },
  { value: "settings", label: "設定", renderIcon: tabIcon("settings") },
];

function BottomTabExample(args: BottomTabBarProps) {
  const { colors } = useNativeTheme();
  const [value, setValue] = useState(args.value);
  const [barHeight, setBarHeight] = useState(140);
  useEffect(() => setValue(args.value), [args.value]);
  const current = args.items.find((item) => item.value === value);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 24, padding: 24, paddingBottom: barHeight + 24 }}
        >
          <View style={{ gap: 8 }}>
            <Text variant="heading">{current?.label}</Text>
            <Text tone="muted">タブを選ぶと表示内容が切り替わります。</Text>
          </View>
          {Array.from({ length: 12 }, (_, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                minHeight: 96,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingBottom: 24,
              }}
            >
              <View
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: index % 2 === 0 ? colors.primary : colors.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: index % 3 === 0 ? 14 : 4,
                    borderWidth: 2,
                    borderColor: index % 2 === 0 ? colors.primaryForeground : colors.foreground,
                  }}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text>
                  {current?.label}の項目 {index + 1}
                </Text>
                <Text variant="caption" tone="muted">
                  内容の概要を表示します。
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <BottomTabBar
        {...args}
        value={value}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange?.(next);
        }}
      />
    </View>
  );
}

const meta = {
  title: "Components/BottomTabBar",
  component: BottomTabBar,
  args: {
    items,
    value: "home",
    appearance: "auto",
    onValueChange: action("tab-selected"),
  },
  argTypes: {
    value: { control: "select", options: ["home", "list", "settings"] },
    appearance: { control: "radio", options: ["auto", "solid"] },
    items: { control: false },
    onValueChange: { action: "tab-selected" },
  },
  parameters: {
    nativeFullScreen: true,
    notes:
      "主な画面を切り替える下部タブバーです。appearance=autoでは対応するiOS 26以降でネイティブのLiquid Glassを使い、旧iOS・Android・透明度を下げる設定では通常の背景を使います。solidで通常の背景に固定できます。動きを減らす設定ではガラスの押下効果を止めます。選択値は利用側で管理し、画面遷移や履歴はアプリのナビゲーターに委ねます。スクロール領域の外に置き、内容へ重ねるときはバーの実測高さを本文の下余白に確保します。この見本は背後に続く内容で透け方を比較できます。SafeAreaProvider内では下端の余白を自動で確保します。余白を確保済みの親に置くときはbottomInset=0を指定します。件数0は非表示、100以上は99+と表示し、読み上げには元の件数を使います。",
  },
  render: (args) => <BottomTabExample {...args} />,
} satisfies Meta<typeof BottomTabBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Solid: Story = { args: { appearance: "solid" } };
export const WithBadges: Story = {
  args: {
    items: items.map((item) =>
      item.value === "list"
        ? { ...item, badge: 120, badgeAccessibilityLabel: "未読120件" }
        : item.value === "settings"
          ? { ...item, badge: "新着" }
          : item,
    ),
  },
};
export const DisabledTab: Story = {
  args: { items: items.map((item) => ({ ...item, disabled: item.value === "settings" })) },
};
export const LongLabels: Story = {
  args: {
    items: [
      { ...items[0]!, label: "ホーム画面" },
      { ...items[1]!, label: "保存した項目の一覧" },
      { ...items[2]!, label: "アプリケーション設定" },
    ],
  },
};
export const LabelsOnly: Story = {
  args: { items: items.map(({ renderIcon: _renderIcon, ...item }) => item) },
};
export const BottomSafeArea: Story = { args: { bottomInset: 34 } };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
export const SolidDark: Story = {
  args: { appearance: "solid" },
  parameters: { nativeTheme: "dark" },
};
export const FiveTabs: Story = {
  args: {
    items: [
      items[0]!,
      { value: "applications", label: "申請", renderIcon: tabIcon("list") },
      { value: "notifications", label: "お知らせ", renderIcon: tabIcon("list"), badge: 3 },
      items[1]!,
      items[2]!,
    ],
  },
};
export const Narrow: Story = {
  ...FiveTabs,
  render: (args) => (
    <View style={{ flex: 1, width: "100%", maxWidth: 320, alignSelf: "center" }}>
      <BottomTabExample {...args} />
    </View>
  ),
};
