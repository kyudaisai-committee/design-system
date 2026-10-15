import { spacing } from "@kyudaisai/tokens/native";
import {
  cloneField,
  fieldKinds,
  moveItem,
  type BuilderField,
  type Condition,
  type ConditionGroup,
} from "@kyudaisai/ui-models";
import { useState, type ReactNode } from "react";
import { View } from "react-native";

import { Button, Checkbox, EmptyState, Field, Notice, Text } from "./components";
import { NumberInput, SelectInput } from "./form-controls";
import { useNativeTheme } from "./theme";

export type { BuilderField, Condition, ConditionGroup } from "@kyudaisai/ui-models";
export interface ConditionEditorProps {
  value: ConditionGroup;
  fields: readonly { id: string; label: string }[];
  onChange: (value: ConditionGroup) => void;
  createId: () => string;
  disabled?: boolean;
  readOnly?: boolean;
}
export function ConditionEditor({
  value,
  fields,
  onChange,
  createId,
  disabled,
  readOnly,
}: ConditionEditorProps) {
  const { colors } = useNativeTheme();
  const inactive = Boolean(disabled || readOnly);
  function groupEditor(
    group: ConditionGroup,
    change: (group: ConditionGroup) => void,
    depth: number,
  ): ReactNode {
    const replace = (id: string, next: Condition) => {
      if (!inactive)
        change({
          ...group,
          children: group.children.map((child) => (child.id === id ? next : child)),
        });
    };
    if (depth > 5)
      return (
        <Notice title="条件の階層が深すぎます" tone="warning">
          5階層以内に整理してください。
        </Notice>
      );
    return (
      <View
        style={{ gap: spacing[3], borderWidth: 1, borderColor: colors.border, padding: spacing[3] }}
      >
        <Text variant="label">{depth === 0 ? "適用する条件" : "条件のグループ"}</Text>
        <SelectInput
          required
          label="条件の組合せ"
          value={group.operator}
          disabled={inactive}
          options={[
            { value: "and", label: "すべて満たす（AND）" },
            { value: "or", label: "いずれかを満たす（OR）" },
            { value: "not", label: "条件を満たさない（NOT）" },
          ]}
          onValueChange={(operator) => {
            if (!inactive) change({ ...group, operator: operator as ConditionGroup["operator"] });
          }}
        />
        {group.operator === "not" && group.children.length !== 1 && (
          <Text accessibilityRole="alert">NOTには条件を1つだけ設定してください。</Text>
        )}
        {!group.children.length && <Text>条件がありません。</Text>}
        {group.children.map((child, index) => (
          <View key={child.id} style={{ gap: spacing[2] }}>
            {child.type === "group" ? (
              groupEditor(child, (next) => replace(child.id, next), depth + 1)
            ) : (
              <>
                <SelectInput
                  label={`条件${index + 1}の項目`}
                  disabled={inactive}
                  value={child.field}
                  options={fields.map((field) => ({ value: field.id, label: field.label }))}
                  onValueChange={(field) => replace(child.id, { ...child, field })}
                />
                <SelectInput
                  required
                  label={`条件${index + 1}の比較`}
                  disabled={inactive}
                  value={child.operator}
                  options={[
                    { value: "equals", label: "一致する" },
                    { value: "notEquals", label: "一致しない" },
                    { value: "contains", label: "含む" },
                  ]}
                  onValueChange={(operator) =>
                    replace(child.id, { ...child, operator: operator as typeof child.operator })
                  }
                />
                <Field
                  label={`条件${index + 1}の値`}
                  value={child.value}
                  editable={!inactive}
                  onChangeText={(next) => replace(child.id, { ...child, value: next })}
                />
              </>
            )}
            <Button
              title={`条件${index + 1}を削除`}
              variant="ghost"
              disabled={inactive}
              onPress={() =>
                change({
                  ...group,
                  children: group.children.filter((item) => item.id !== child.id),
                })
              }
            />
          </View>
        ))}
        <Button
          title="条件を追加"
          variant="outline"
          disabled={inactive || (group.operator === "not" && group.children.length >= 1)}
          onPress={() =>
            change({
              ...group,
              children: [
                ...group.children,
                {
                  id: createId(),
                  type: "rule",
                  field: fields[0]?.id ?? "",
                  operator: "equals",
                  value: "",
                },
              ],
            })
          }
        />
        <Button
          title="グループを追加"
          variant="outline"
          disabled={
            inactive || depth >= 5 || (group.operator === "not" && group.children.length >= 1)
          }
          onPress={() =>
            change({
              ...group,
              children: [
                ...group.children,
                { id: createId(), type: "group", operator: "and", children: [] },
              ],
            })
          }
        />
      </View>
    );
  }
  return groupEditor(value, onChange, 0);
}
export interface FormBuilderProps {
  value: readonly BuilderField[];
  onChange: (value: BuilderField[]) => void;
  createId: () => string;
  disabled?: boolean;
  readOnly?: boolean;
  renderPreview?: (fields: readonly BuilderField[]) => ReactNode;
  depth?: number;
}
export function FormBuilder({
  value,
  onChange,
  createId,
  disabled,
  readOnly,
  renderPreview,
  depth = 0,
}: FormBuilderProps) {
  const { colors } = useNativeTheme();
  const [preview, setPreview] = useState(false);
  const inactive = Boolean(disabled || readOnly);
  const update = (id: string, patch: Partial<BuilderField>) => {
    if (!inactive)
      onChange(value.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };
  return (
    <View accessibilityLabel="フォームの作成" style={{ gap: spacing[4] }}>
      <Button
        title={preview ? "編集に戻る" : "プレビュー"}
        variant="outline"
        onPress={() => setPreview((current) => !current)}
      />
      {preview ? (
        <View accessibilityLabel="フォームのプレビュー">
          {renderPreview ? renderPreview(value) : <FormPreview fields={value} />}
        </View>
      ) : (
        <>
          {!value.length && <EmptyState title="項目がありません" />}
          {value.map((field, index) => (
            <View
              key={field.id}
              style={{
                gap: spacing[3],
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing[4],
              }}
            >
              <Text variant="heading">
                項目{index + 1}：{field.label}
              </Text>
              <Field
                label="項目名"
                value={field.label}
                editable={!inactive}
                onChangeText={(label) => update(field.id, { label })}
              />
              <SelectInput
                required
                label="入力の種類"
                value={field.kind}
                disabled={inactive}
                options={fieldKinds}
                onValueChange={(kind) => update(field.id, { kind: kind as BuilderField["kind"] })}
              />
              <Field
                label="補足説明"
                value={field.hint ?? ""}
                multiline
                editable={!inactive}
                onChangeText={(hint) => update(field.id, { hint })}
              />
              {field.kind !== "description" && (
                <Checkbox
                  label="回答を必須にする"
                  checked={Boolean(field.required)}
                  disabled={inactive}
                  onCheckedChange={(required) => update(field.id, { required })}
                />
              )}
              {(["min", "max"] as const).map((bound) => (
                <NumberInput
                  key={bound}
                  label={bound === "min" ? "下限（文字数・値・件数）" : "上限（文字数・値・件数）"}
                  disabled={inactive}
                  value={field[bound] === undefined ? "" : String(field[bound])}
                  onValueChange={(raw) => {
                    if (!raw || Number.isFinite(Number(raw)))
                      update(field.id, { [bound]: raw ? Number(raw) : undefined });
                  }}
                />
              ))}
              {field.min !== undefined && field.max !== undefined && field.min > field.max && (
                <Text accessibilityRole="alert">下限は上限以下にしてください。</Text>
              )}
              {field.kind === "choice" && (
                <View style={{ gap: spacing[2] }}>
                  <Checkbox
                    label="複数選択を許可する"
                    checked={Boolean(field.multiple)}
                    disabled={inactive}
                    onCheckedChange={(multiple) => update(field.id, { multiple })}
                  />
                  {field.options?.map((option, optionIndex) => (
                    <View key={option.id}>
                      <Field
                        label={`選択肢${optionIndex + 1}`}
                        value={option.label}
                        editable={!inactive}
                        onChangeText={(label) =>
                          update(field.id, {
                            options: field.options?.map((item) =>
                              item.id === option.id ? { ...item, label } : item,
                            ),
                          })
                        }
                      />
                      <Button
                        title={`選択肢${optionIndex + 1}を削除`}
                        variant="ghost"
                        disabled={inactive}
                        onPress={() =>
                          update(field.id, {
                            options: field.options?.filter((item) => item.id !== option.id),
                          })
                        }
                      />
                    </View>
                  ))}
                  <Button
                    title="選択肢を追加"
                    variant="outline"
                    disabled={inactive}
                    onPress={() =>
                      update(field.id, {
                        options: [
                          ...(field.options ?? []),
                          { id: createId(), label: "新しい選択肢" },
                        ],
                      })
                    }
                  />
                </View>
              )}
              {(field.kind === "group" || field.kind === "table") &&
                (depth < 4 ? (
                  <FormBuilder
                    value={field.children ?? []}
                    onChange={(children) => update(field.id, { children })}
                    createId={createId}
                    disabled={inactive}
                    depth={depth + 1}
                  />
                ) : (
                  <Notice title="項目の階層が深すぎます" tone="warning">
                    4階層以内に整理してください。
                  </Notice>
                ))}
              {field.condition ? (
                <>
                  <ConditionEditor
                    value={field.condition}
                    fields={value
                      .filter((item) => item.id !== field.id)
                      .map((item) => ({ id: item.id, label: item.label }))}
                    onChange={(condition) => update(field.id, { condition })}
                    createId={createId}
                    disabled={inactive}
                  />
                  <Button
                    title="表示条件を解除"
                    variant="ghost"
                    disabled={inactive}
                    onPress={() => update(field.id, { condition: undefined })}
                  />
                </>
              ) : (
                <Button
                  title="表示条件を設定"
                  variant="outline"
                  disabled={inactive}
                  onPress={() =>
                    update(field.id, {
                      condition: { id: createId(), type: "group", operator: "and", children: [] },
                    })
                  }
                />
              )}
              <Button
                title={`項目${index + 1}を上へ`}
                variant="outline"
                disabled={inactive || index === 0}
                onPress={() => onChange(moveItem(value, index, -1))}
              />
              <Button
                title={`項目${index + 1}を下へ`}
                variant="outline"
                disabled={inactive || index === value.length - 1}
                onPress={() => onChange(moveItem(value, index, 1))}
              />
              <Button
                title={`項目${index + 1}を複製`}
                variant="outline"
                disabled={inactive}
                onPress={() =>
                  onChange([
                    ...value.slice(0, index + 1),
                    cloneField(field, createId),
                    ...value.slice(index + 1),
                  ])
                }
              />
              <Button
                title={`項目${index + 1}を削除`}
                variant="ghost"
                disabled={inactive}
                onPress={() => onChange(value.filter((item) => item.id !== field.id))}
              />
            </View>
          ))}
          <Button
            title="項目を追加"
            disabled={inactive}
            onPress={() =>
              onChange([...value, { id: createId(), kind: "text", label: "新しい項目" }])
            }
          />
        </>
      )}
    </View>
  );
}
function FormPreview({ fields }: { fields: readonly BuilderField[] }) {
  return (
    <View style={{ gap: spacing[3] }}>
      {fields.map((field) => (
        <View key={field.id}>
          <Text variant="label">
            {field.label}
            {field.required ? "（必須）" : ""}
          </Text>
          <Text>{field.hint}</Text>
          <Text tone="muted">
            {fieldKinds.find((kind) => kind.value === field.kind)?.label}
            {field.condition ? "・表示条件あり" : ""}
          </Text>
          {field.options?.map((option) => (
            <Text key={option.id}>○ {option.label}</Text>
          ))}
          {field.children && <FormPreview fields={field.children} />}
        </View>
      ))}
    </View>
  );
}
