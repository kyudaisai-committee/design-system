import type { ReactNode } from "react";

import { spacing } from "@kyudaisai/tokens/native";
import { View } from "react-native";

import { Checkbox, Text } from "./components";
import { useNativeTheme } from "./theme";

export interface FormControlProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export function controlHint(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ") || undefined;
}

export function choiceHint(minSelections?: number, maxSelections?: number) {
  return (
    [
      minSelections !== undefined && minSelections > 0 ? `${minSelections}項目以上` : undefined,
      maxSelections !== undefined ? `${maxSelections}項目まで` : undefined,
    ]
      .filter(Boolean)
      .join("・") || undefined
  );
}

export function FormChoiceOptions({
  options,
  value,
  onValueChange,
  maxSelections,
  ...props
}: FormControlProps & {
  options: readonly { value: string; label: string; description?: string; disabled?: boolean }[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  maxSelections?: number;
}) {
  const inactive = Boolean(props.disabled || props.readOnly);
  const currentSelection = [...new Set(value)].filter((entry) =>
    options.some((option) => option.value === entry),
  );
  const limit = maxSelections !== undefined && currentSelection.length >= maxSelections;
  return options.length ? (
    options.map((option) => {
      const selected = currentSelection.includes(option.value);
      const optionLabel = option.description
        ? `${option.label}（${option.description}）`
        : option.label;
      return (
        <Checkbox
          key={option.value}
          label={optionLabel}
          accessibilityLabel={`${props.label}、${optionLabel}${props.required ? "、必須" : ""}`}
          accessibilityHint={controlHint(
            props.hint,
            props.readOnly ? "読み取り専用" : undefined,
            props.error ? `エラー: ${props.error}` : undefined,
          )}
          checked={selected}
          disabled={inactive || option.disabled || (!selected && limit)}
          onCheckedChange={(checked) => {
            if (inactive || option.disabled || (checked && limit)) return;
            onValueChange(
              checked
                ? [...currentSelection, option.value]
                : currentSelection.filter((entry) => entry !== option.value),
            );
          }}
        />
      );
    })
  ) : (
    <Text tone="muted">選択肢はありません。</Text>
  );
}

export function FormControlFrame({
  label,
  hint,
  error,
  required,
  readOnly,
  children,
}: FormControlProps & { children: ReactNode }) {
  const { colors } = useNativeTheme();
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="label">
        {label}
        {required ? "（必須）" : ""}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
      {readOnly ? (
        <Text variant="caption" tone="muted">
          読み取り専用
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text
          variant="caption"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: colors.danger }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>{children}</View>
  );
}
