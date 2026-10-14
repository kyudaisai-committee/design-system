import type { ReactNode } from "react";

import { spacing } from "@kyudaisai/tokens/native";
import { useState } from "react";
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from "react-native";

import { Button, Checkbox, Text } from "./components";
import {
  FormChoiceOptions,
  FormControlFrame,
  choiceHint,
  controlHint,
  type FormControlProps,
} from "./form-control-parts";
import { type FormChoiceOption } from "./form-controls";
import { useNativeTheme } from "./theme";

export interface NativeFileAsset {
  id: string;
  name: string;
  uri?: string;
  size?: number;
  mimeType?: string;
}

export interface FileInputProps extends FormControlProps {
  value: readonly NativeFileAsset[];
  onChoose: () => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxBytes?: number;
  acceptLabel?: string;
  choosing?: boolean;
}

function fileSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

/** The host selects files and owns their local URIs. This component never uploads or reads them. */
export function FileInput({
  value,
  onChoose,
  onRemove,
  maxFiles,
  maxBytes,
  acceptLabel,
  choosing = false,
  hint,
  ...props
}: FileInputProps) {
  const { colors } = useNativeTheme();
  const inactive = Boolean(props.disabled || props.readOnly || choosing);
  const limit = maxFiles !== undefined && value.length >= maxFiles;
  const conditions = [
    acceptLabel,
    maxFiles !== undefined ? `${maxFiles}ファイルまで` : undefined,
    maxBytes !== undefined ? `1ファイル${fileSize(maxBytes)}まで` : undefined,
  ]
    .filter(Boolean)
    .join("・");
  return (
    <FormControlFrame {...props} hint={controlHint(hint, conditions || undefined)}>
      <Button
        title="ファイルを選ぶ"
        variant="outline"
        loading={choosing}
        disabled={inactive || limit}
        accessibilityLabel={`${props.label}のファイルを選ぶ`}
        accessibilityHint={controlHint(hint, conditions, props.error)}
        onPress={() => {
          if (!inactive && !limit) onChoose();
        }}
      />
      {value.length ? (
        value.map((file) => (
          <View
            key={file.id}
            style={{
              gap: spacing[2],
              paddingVertical: spacing[2],
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text>{file.name}</Text>
            <Text variant="caption" tone="muted">
              {file.size === undefined ? "容量不明" : fileSize(file.size)}
              {file.mimeType ? `・${file.mimeType}` : ""}
            </Text>
            {maxBytes !== undefined && file.size !== undefined && file.size > maxBytes ? (
              <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                容量の上限を超えています。別のファイルを選んでください。
              </Text>
            ) : null}
            <Button
              title="選択を外す"
              variant="ghost"
              disabled={inactive}
              accessibilityLabel={`${file.name}の選択を外す`}
              onPress={() => {
                if (!inactive) onRemove(file.id);
              }}
            />
          </View>
        ))
      ) : (
        <Text tone="muted">ファイルは選択されていません。</Text>
      )}
      {maxFiles !== undefined ? (
        <Text variant="caption" tone="muted">
          {value.length} / {maxFiles}ファイル
        </Text>
      ) : null}
    </FormControlFrame>
  );
}

export interface InputRenderState {
  disabled: boolean;
  readOnly: boolean;
}

export interface RepeaterItem {
  id: string;
  label?: string;
}

export interface RepeaterProps<Item extends RepeaterItem = RepeaterItem> extends FormControlProps {
  items: readonly Item[];
  minItems?: number;
  maxItems?: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  /** Pass the render state into the inputs rendered inside this row. */
  renderItem: (item: Item, index: number, state: InputRenderState) => ReactNode;
  addLabel?: string;
}

function RemoveItemButton({
  label,
  disabled,
  onPress,
  kind = "item",
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  kind?: "item" | "row";
}) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  const size = Platform.OS === "android" ? 48 : 44;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        kind === "row" ? "この行の入力を削除します。" : "この項目の入力を削除します。"
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        width: size,
        height: size,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderRadius: 8,
        borderColor: focused ? colors.ring : "transparent",
        backgroundColor: pressed ? colors.muted : "transparent",
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}
      >
        {kind === "row" ? (
          <>
            <View
              style={{
                position: "absolute",
                top: 1,
                width: 6,
                height: 3,
                borderWidth: 1.5,
                borderBottomWidth: 0,
                borderColor: colors.foreground,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 4,
                width: 16,
                height: 1.5,
                backgroundColor: colors.foreground,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 6,
                width: 12,
                height: 12,
                borderWidth: 1.5,
                borderTopWidth: 0,
                borderColor: colors.foreground,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                flexDirection: "row",
                justifyContent: "center",
                gap: 3,
                paddingTop: 2,
              }}
            >
              <View style={{ width: 1.5, height: 6, backgroundColor: colors.foreground }} />
              <View style={{ width: 1.5, height: 6, backgroundColor: colors.foreground }} />
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                position: "absolute",
                width: 18,
                height: 2,
                borderRadius: 1,
                backgroundColor: colors.foreground,
                transform: [{ rotate: "45deg" }],
              }}
            />
            <View
              style={{
                position: "absolute",
                width: 18,
                height: 2,
                borderRadius: 1,
                backgroundColor: colors.foreground,
                transform: [{ rotate: "-45deg" }],
              }}
            />
          </>
        )}
      </View>
    </Pressable>
  );
}

export function Repeater<Item extends RepeaterItem>({
  items,
  minItems = 0,
  maxItems,
  onAdd,
  onRemove,
  renderItem,
  addLabel = "項目を追加",
  ...props
}: RepeaterProps<Item>) {
  const { colors } = useNativeTheme();
  const inactive = Boolean(props.disabled || props.readOnly);
  const renderState = { disabled: Boolean(props.disabled), readOnly: Boolean(props.readOnly) };
  return (
    <FormControlFrame {...props}>
      {items.length ? (
        items.map((item, index) => (
          <View
            key={item.id}
            style={{
              gap: spacing[3],
              paddingVertical: spacing[3],
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: spacing[3],
              }}
            >
              <Text
                variant="body"
                accessibilityRole="header"
                style={{ flex: 1, fontWeight: "600" }}
              >
                {item.label ?? `${index + 1}件目`}
              </Text>
              <RemoveItemButton
                disabled={inactive || items.length <= minItems}
                label={`${item.label ?? `${index + 1}件目`}を削除`}
                onPress={() => {
                  if (!inactive && items.length > minItems) onRemove(item.id);
                }}
              />
            </View>
            {renderItem(item, index, renderState)}
          </View>
        ))
      ) : (
        <Text tone="muted">項目はありません。</Text>
      )}
      <Button
        title={addLabel}
        variant="outline"
        disabled={inactive || (maxItems !== undefined && items.length >= maxItems)}
        onPress={() => {
          if (!inactive && (maxItems === undefined || items.length < maxItems)) onAdd();
        }}
      />
      {maxItems !== undefined ? (
        <Text variant="caption" tone="muted">
          {items.length} / {maxItems}件
        </Text>
      ) : null}
    </FormControlFrame>
  );
}

export interface InputTableRow {
  id: string;
  label: string;
}
export interface InputTableColumn {
  key: string;
  label: string;
}

export interface InputTableProps extends FormControlProps {
  rows: readonly InputTableRow[];
  columns: readonly InputTableColumn[];
  /** Each cell input needs a label identifying its row and column. */
  renderCell: (rowId: string, columnKey: string, state: InputRenderState) => ReactNode;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  minRows?: number;
  maxRows?: number;
}

export function InputTable({
  rows,
  columns,
  renderCell,
  onAdd,
  onRemove,
  minRows = 0,
  maxRows,
  ...props
}: InputTableProps) {
  const { colors } = useNativeTheme();
  const { width, fontScale } = useWindowDimensions();
  const cellWidth = Math.max(180, 180 * Math.min(fontScale, 2));
  const labelWidth = Math.max(120, 120 * Math.min(fontScale, 2));
  const removeWidth = onRemove ? (Platform.OS === "android" ? 48 : 44) + spacing[6] : 0;
  const tableWidth = labelWidth + columns.length * cellWidth + removeWidth;
  const inactive = Boolean(props.disabled || props.readOnly);
  const renderState = { disabled: Boolean(props.disabled), readOnly: Boolean(props.readOnly) };
  return (
    <FormControlFrame {...props}>
      {tableWidth > width - spacing[8] ? (
        <Text variant="caption" tone="muted">
          表は左右にスクロールできます。
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator keyboardShouldPersistTaps="handled">
        <View style={{ minWidth: tableWidth }}>
          <View style={{ flexDirection: "row", backgroundColor: colors.muted }}>
            <View style={{ width: labelWidth, padding: spacing[3] }}>
              <Text variant="label">項目</Text>
            </View>
            {columns.map((column) => (
              <View key={column.key} style={{ width: cellWidth, padding: spacing[3] }}>
                <Text variant="label">{column.label}</Text>
              </View>
            ))}
            {onRemove ? <View style={{ width: removeWidth }} /> : null}
          </View>
          {rows.map((row) => (
            <View
              key={row.id}
              style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border }}
            >
              <View style={{ width: labelWidth, padding: spacing[3], gap: spacing[2] }}>
                <Text variant="label">{row.label}</Text>
              </View>
              {columns.map((column) => (
                <View key={column.key} style={{ width: cellWidth, padding: spacing[3] }}>
                  {renderCell(row.id, column.key, renderState)}
                </View>
              ))}
              {onRemove ? (
                <View
                  style={{
                    width: removeWidth,
                    padding: spacing[3],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RemoveItemButton
                    kind="row"
                    label={`${row.label}の行を削除`}
                    disabled={inactive || rows.length <= minRows}
                    onPress={() => {
                      if (!inactive && rows.length > minRows) onRemove(row.id);
                    }}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
      {!rows.length ? <Text tone="muted">行はありません。</Text> : null}
      {onAdd ? (
        <Button
          title="行を追加"
          variant="outline"
          disabled={inactive || (maxRows !== undefined && rows.length >= maxRows)}
          onPress={() => {
            if (!inactive && (maxRows === undefined || rows.length < maxRows)) onAdd();
          }}
        />
      ) : null}
    </FormControlFrame>
  );
}

export type SocialProfileProvider = "x" | "tiktok" | "youtube" | "instagram" | "homepage";
export interface SocialProfileOption extends FormChoiceOption {
  provider?: SocialProfileProvider;
}

export interface SocialProfileInputProps extends FormControlProps {
  options: readonly SocialProfileOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  noAccount: boolean;
  onNoAccountChange: (value: boolean) => void;
  allowNoAccount?: boolean;
  allowedProviders?: readonly SocialProfileProvider[];
  minSelections?: number;
  maxSelections?: number;
}

/** Selects caller-supplied profiles. It never signs in or connects accounts. */
export function SocialProfileInput({
  options,
  value,
  onValueChange,
  noAccount,
  onNoAccountChange,
  allowNoAccount = false,
  allowedProviders,
  minSelections,
  maxSelections,
  ...props
}: SocialProfileInputProps) {
  const inactive = Boolean(props.disabled || props.readOnly);
  const visibleOptions = allowedProviders
    ? options.filter((option) => !option.provider || allowedProviders.includes(option.provider))
    : options;
  const none = allowNoAccount && noAccount;
  const combinedHint = controlHint(
    props.hint,
    none ? undefined : choiceHint(minSelections, maxSelections),
  );
  return (
    <FormControlFrame {...props} hint={combinedHint}>
      {allowNoAccount ? (
        <Checkbox
          label="アカウントを持っていない"
          accessibilityLabel={`${props.label}、アカウントを持っていない${props.required ? "、必須" : ""}`}
          accessibilityHint={controlHint(
            props.hint,
            props.readOnly ? "読み取り専用" : undefined,
            props.error ? `エラー: ${props.error}` : undefined,
          )}
          checked={none}
          disabled={inactive}
          onCheckedChange={(checked) => {
            if (inactive) return;
            onNoAccountChange(checked);
            if (checked) onValueChange([]);
          }}
        />
      ) : null}
      {none ? (
        <Text tone="muted">アカウントなしを選択しています。</Text>
      ) : (
        <FormChoiceOptions
          {...props}
          hint={combinedHint}
          options={visibleOptions}
          value={value}
          onValueChange={(next) => {
            if (inactive) return;
            onNoAccountChange(false);
            onValueChange(next);
          }}
          maxSelections={maxSelections}
          disabled={props.disabled}
          readOnly={props.readOnly}
        />
      )}
    </FormControlFrame>
  );
}
