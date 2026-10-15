import type { ComparisonItem } from "@kyudaisai/ui-models";

import { spacing } from "@kyudaisai/tokens/native";
import { View } from "react-native";

import { EmptyState, Text } from "./components";
import { useNativeTheme } from "./theme";
export type { ComparisonItem } from "@kyudaisai/ui-models";
export interface ComparisonViewProps {
  label: string;
  items: readonly ComparisonItem[];
  beforeLabel: string;
  afterLabel: string;
  onlyChanges?: boolean;
}
export function ComparisonView({
  label,
  items,
  beforeLabel,
  afterLabel,
  onlyChanges,
}: ComparisonViewProps) {
  const { colors } = useNativeTheme();
  const visible = onlyChanges ? items.filter((item) => item.before !== item.after) : items;
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      {visible.length ? (
        visible.map((item) => (
          <View
            key={item.id}
            style={{
              gap: spacing[2],
              paddingVertical: spacing[3],
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text variant="heading">{item.label}</Text>
            <Text variant="caption">
              {item.before === item.after
                ? "変更なし"
                : item.before === undefined
                  ? "追加"
                  : item.after === undefined
                    ? "削除"
                    : "変更あり"}
            </Text>
            <Text variant="label">{beforeLabel}</Text>
            <Text>{item.before ?? "未設定"}</Text>
            <Text variant="label">{afterLabel}</Text>
            <Text>{item.after ?? "未設定"}</Text>
          </View>
        ))
      ) : (
        <EmptyState title={onlyChanges ? "変更はありません" : "比較する内容がありません"} />
      )}
    </View>
  );
}
