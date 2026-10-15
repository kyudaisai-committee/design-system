import { spacing } from "@kyudaisai/tokens/native";
import { type ResultDatum } from "@kyudaisai/ui-models";
import { View } from "react-native";

import { EmptyState, Notice, Text } from "./components";
import { useNativeTheme } from "./theme";

export type { ResultDatum } from "@kyudaisai/ui-models";
export interface ResultChartProps {
  label: string;
  data: readonly ResultDatum[];
  unit: string;
  note?: string;
  formatValue?: (value: number) => string;
}
export function ResultChart({
  label,
  data,
  unit,
  note,
  formatValue = (value) => value.toLocaleString("ja-JP", { maximumFractionDigits: 20 }),
}: ResultChartProps) {
  const { colors } = useNativeTheme();
  if (!data.length) return <EmptyState title="表示できる結果がありません" />;
  if (data.some((item) => !Number.isFinite(item.value) || item.value < 0))
    return (
      <Notice title="結果を表示できません" tone="danger">
        数値を再取得してください。
      </Notice>
    );
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      <Text variant="heading">{label}</Text>
      {note && <Text tone="muted">{note}</Text>}
      {data.map((item) => (
        <View key={item.id} style={{ gap: spacing[2] }}>
          <Text>
            {item.rank === undefined ? "" : `${item.rank}位・`}
            {item.label}：{formatValue(item.value)}
            {unit}
          </Text>
          <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            style={{ height: spacing[3], backgroundColor: colors.muted }}
          >
            <View
              style={{
                width: `${(item.value / max) * 100}%`,
                height: "100%",
                backgroundColor: colors.primary,
              }}
            />
          </View>
          {item.detail && <Text variant="caption">{item.detail}</Text>}
        </View>
      ))}
    </View>
  );
}
