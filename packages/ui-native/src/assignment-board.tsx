import type { BoardItem, BoardLane } from "@kyudaisai/ui-models";

import { spacing } from "@kyudaisai/tokens/native";
import { View } from "react-native";

import { Checkbox, Notice, Text } from "./components";
import { SelectInput } from "./form-controls";
import { useNativeTheme } from "./theme";
export type { BoardItem, BoardLane } from "@kyudaisai/ui-models";
export interface AssignmentBoardProps {
  label: string;
  lanes: readonly BoardLane[];
  items: readonly BoardItem[];
  onMove: (itemId: string, laneId: string) => void;
  onLockChange?: (itemId: string, locked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
}
export function AssignmentBoard({
  label,
  lanes,
  items,
  onMove,
  onLockChange,
  disabled,
  readOnly,
}: AssignmentBoardProps) {
  const { colors } = useNativeTheme();
  const inactive = Boolean(disabled || readOnly);
  const orphaned = items.filter((item) => !lanes.some((lane) => lane.id === item.laneId));
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      {[
        ...lanes.map((lane) => ({ ...lane, orphanBucket: false })),
        ...(orphaned.length
          ? [{ id: "", label: "配置先を確認してください", orphanBucket: true }]
          : []),
      ].map((lane) => {
        const assigned = lane.orphanBucket
          ? orphaned
          : items.filter((item) => item.laneId === lane.id);
        const shortage = lane.capacity === undefined ? undefined : lane.capacity - assigned.length;
        return (
          <View
            key={`${lane.orphanBucket ? "orphan" : "lane"}:${lane.id}`}
            style={{
              gap: spacing[3],
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[4],
            }}
          >
            <Text variant="heading">{lane.label}</Text>
            {lane.description && <Text>{lane.description}</Text>}
            <Text>
              {assigned.length}人
              {shortage === undefined
                ? ""
                : shortage > 0
                  ? `・${shortage}人不足`
                  : shortage < 0
                    ? `・${-shortage}人超過`
                    : "・必要人数を充足"}
            </Text>
            {assigned.map((item) => (
              <View key={item.id} style={{ gap: spacing[2] }}>
                <Text variant="label">
                  {item.label}
                  {item.locked ? "（固定）" : ""}
                </Text>
                {item.description && <Text>{item.description}</Text>}
                {item.conflict && (
                  <Notice title="競合あり" tone="warning">
                    {item.conflict}
                  </Notice>
                )}
                <SelectInput
                  required
                  label={`${item.label}の配置先`}
                  value={item.laneId}
                  disabled={inactive || item.locked}
                  options={lanes.map((candidate) => ({
                    value: candidate.id,
                    label: candidate.label,
                  }))}
                  onValueChange={(laneId) => {
                    if (!inactive && !item.locked) onMove(item.id, laneId);
                  }}
                />
                {onLockChange && (
                  <Checkbox
                    label={`${item.label}の配置を固定する`}
                    checked={Boolean(item.locked)}
                    disabled={inactive}
                    onCheckedChange={(locked) => onLockChange(item.id, locked)}
                  />
                )}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
