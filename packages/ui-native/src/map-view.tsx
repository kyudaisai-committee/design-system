import { spacing } from "@kyudaisai/tokens/native";
import {
  clamp,
  initialViewport,
  mapControls,
  viewportChange,
  safeImage,
  type MapPoint,
} from "@kyudaisai/ui-models";
import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Image as SvgImage, Text as SvgText } from "react-native-svg";

import { Button, EmptyState, Field, Text } from "./components";
import { NumberInput } from "./form-controls";
import { useNativeTheme } from "./theme";

export type { MapPoint } from "@kyudaisai/ui-models";
export interface MapViewProps {
  label: string;
  points: readonly MapPoint[];
  backgroundSrc?: string;
  selectedId?: string;
  onSelect?: (point: MapPoint) => void;
  updatedLabel?: string;
}
export function MapView({
  label,
  points,
  backgroundSrc,
  selectedId,
  onSelect,
  updatedLabel,
}: MapViewProps) {
  const { colors } = useNativeTheme();
  const [viewport, setViewport] = useState(initialViewport);
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[3] }}>
      {updatedLabel && <Text tone="muted">{updatedLabel}</Text>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
        {mapControls.map(([action, title]) => (
          <Button
            key={action}
            title={title}
            variant="outline"
            onPress={() => setViewport((view) => viewportChange(view, action))}
          />
        ))}
      </View>
      <View
        style={{
          aspectRatio: 1,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
        }}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`${viewport.x} ${viewport.y} ${viewport.size} ${viewport.size}`}
          accessibilityRole="image"
          accessibilityLabel={`${label}。会場は下の一覧から選択できます。`}
        >
          {backgroundSrc && safeImage(backgroundSrc) && (
            <SvgImage
              href={safeImage(backgroundSrc)}
              width="100"
              height="100"
              preserveAspectRatio="none"
            />
          )}
          {points
            .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
            .map((point) => (
              <G key={point.id} accessible={false} onPress={() => onSelect?.(point)}>
                <Circle
                  cx={clamp(point.x, 0, 100)}
                  cy={clamp(point.y, 0, 100)}
                  r={selectedId === point.id ? 3 : 2}
                  fill={colors.primary}
                />
                <SvgText
                  x={clamp(point.x, 0, 100)}
                  y={clamp(point.y - 4, 2, 98)}
                  textAnchor="middle"
                  fontSize="3"
                  fill={colors.foreground}
                >
                  {point.label}
                </SvgText>
              </G>
            ))}
        </Svg>
      </View>
      {points.length ? (
        points.map((point) => (
          <View key={point.id}>
            {onSelect ? (
              <Button
                title={point.label}
                variant="outline"
                accessibilityState={{ selected: point.id === selectedId }}
                onPress={() => onSelect(point)}
              />
            ) : (
              <Text variant="label">{point.label}</Text>
            )}
            {point.description && <Text>{point.description}</Text>}
          </View>
        ))
      ) : (
        <EmptyState title="会場がありません" />
      )}
    </View>
  );
}
export interface MapEditorProps extends Omit<MapViewProps, "onSelect" | "selectedId"> {
  onChange: (points: MapPoint[]) => void;
  createId: () => string;
  disabled?: boolean;
  readOnly?: boolean;
}
export function MapEditor({
  points,
  onChange,
  createId,
  disabled,
  readOnly,
  ...props
}: MapEditorProps) {
  const [selectedId, setSelectedId] = useState<string>();
  const point = points.find((item) => item.id === selectedId);
  const inactive = Boolean(disabled || readOnly);
  function update(changes: Partial<MapPoint>) {
    if (!inactive && point)
      onChange(points.map((item) => (item.id === point.id ? { ...item, ...changes } : item)));
  }
  return (
    <View style={{ gap: spacing[4] }}>
      <MapView
        {...props}
        points={points}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id)}
      />
      <Button
        title="場所を追加"
        disabled={inactive}
        onPress={() => {
          const id = createId();
          onChange([...points, { id, label: "新しい場所", x: 50, y: 50 }]);
          setSelectedId(id);
        }}
      />
      {point && (
        <View style={{ gap: spacing[3] }}>
          <Text variant="heading">{point.label}の配置</Text>
          <Field
            label="場所の名前"
            value={point.label}
            editable={!inactive}
            onChangeText={(label) => update({ label })}
          />
          {(["x", "y"] as const).map((axis) => (
            <NumberInput
              key={axis}
              label={axis === "x" ? "横の位置（0〜100）" : "縦の位置（0〜100）"}
              min={0}
              max={100}
              value={String(point[axis])}
              disabled={inactive}
              onValueChange={(raw) => {
                const value = Number(raw);
                if (raw && Number.isFinite(value)) update({ [axis]: clamp(value, 0, 100) });
              }}
            />
          ))}
          <Text tone="muted">
            数値で位置を調整できます。地図の拡大率を変えても配置は変わりません。
          </Text>
          <Button
            title="この場所を削除"
            variant="outline"
            disabled={inactive}
            onPress={() => {
              onChange(points.filter((item) => item.id !== point.id));
              setSelectedId(undefined);
            }}
          />
        </View>
      )}
    </View>
  );
}
