"use client";
import {
  cloneField,
  fieldKinds,
  moveItem,
  type BuilderField,
  type Condition,
  type ConditionGroup,
} from "@kyudaisai/ui-models";
import { useState, type ReactNode } from "react";

import { Button } from "./button";
import { Field, EmptyState, Notice } from "./compositions";
import { LabeledCheckbox } from "./compositions";
import { Input } from "./input";
import { NativeSelect, NativeSelectOption } from "./native-select";
import { Textarea } from "./textarea";

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
  const inactive = Boolean(disabled || readOnly);
  function groupEditor(
    group: ConditionGroup,
    change: (group: ConditionGroup) => void,
    depth: number,
  ): ReactNode {
    const replace = (id: string, next: Condition) =>
      change({
        ...group,
        children: group.children.map((child) => (child.id === id ? next : child)),
      });
    if (depth > 5)
      return (
        <Notice title="条件の階層が深すぎます" tone="warning">
          5階層以内に整理してください。
        </Notice>
      );
    return (
      <fieldset disabled={inactive} className="ds-condition">
        <legend>{depth === 0 ? "適用する条件" : "条件のグループ"}</legend>
        <Field label="条件の組合せ">
          {(attrs) => (
            <NativeSelect
              {...attrs}
              value={group.operator}
              onChange={(event) =>
                change({ ...group, operator: event.target.value as ConditionGroup["operator"] })
              }
            >
              <NativeSelectOption value="and">すべて満たす（AND）</NativeSelectOption>
              <NativeSelectOption value="or">いずれかを満たす（OR）</NativeSelectOption>
              <NativeSelectOption value="not">条件を満たさない（NOT）</NativeSelectOption>
            </NativeSelect>
          )}
        </Field>
        {group.operator === "not" && group.children.length !== 1 && (
          <p role="alert">NOTには条件を1つだけ設定してください。</p>
        )}
        {!group.children.length && <p>条件がありません。</p>}
        {group.children.map((child, index) => (
          <div className="ds-condition" key={child.id}>
            {child.type === "group" ? (
              groupEditor(child, (next) => replace(child.id, next), depth + 1)
            ) : (
              <>
                <Field label={`条件${index + 1}の項目`}>
                  {(attrs) => (
                    <NativeSelect
                      {...attrs}
                      value={child.field}
                      onChange={(event) =>
                        replace(child.id, { ...child, field: event.target.value })
                      }
                    >
                      <NativeSelectOption value="">項目を選ぶ</NativeSelectOption>
                      {fields.map((field) => (
                        <NativeSelectOption key={field.id} value={field.id}>
                          {field.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <Field label={`条件${index + 1}の比較`}>
                  {(attrs) => (
                    <NativeSelect
                      {...attrs}
                      value={child.operator}
                      onChange={(event) =>
                        replace(child.id, {
                          ...child,
                          operator: event.target.value as typeof child.operator,
                        })
                      }
                    >
                      <NativeSelectOption value="equals">一致する</NativeSelectOption>
                      <NativeSelectOption value="notEquals">一致しない</NativeSelectOption>
                      <NativeSelectOption value="contains">含む</NativeSelectOption>
                    </NativeSelect>
                  )}
                </Field>
                <Field label={`条件${index + 1}の値`}>
                  {(attrs) => (
                    <Input
                      {...attrs}
                      value={child.value}
                      onChange={(event) =>
                        replace(child.id, { ...child, value: event.target.value })
                      }
                    />
                  )}
                </Field>
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                change({
                  ...group,
                  children: group.children.filter((item) => item.id !== child.id),
                })
              }
            >
              条件{index + 1}を削除
            </Button>
          </div>
        ))}
        <div className="ds-actions">
          <Button
            type="button"
            variant="outline"
            disabled={group.operator === "not" && group.children.length >= 1}
            onClick={() =>
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
          >
            条件を追加
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={depth >= 5 || (group.operator === "not" && group.children.length >= 1)}
            onClick={() =>
              change({
                ...group,
                children: [
                  ...group.children,
                  { id: createId(), type: "group", operator: "and", children: [] },
                ],
              })
            }
          >
            グループを追加
          </Button>
        </div>
      </fieldset>
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
  const [preview, setPreview] = useState(false);
  const inactive = Boolean(disabled || readOnly);
  const update = (id: string, patch: Partial<BuilderField>) => {
    if (!inactive)
      onChange(value.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };
  return (
    <section className="ds-stack" aria-label="フォームの作成">
      <Button
        type="button"
        variant="outline"
        aria-pressed={preview}
        onClick={() => setPreview((current) => !current)}
      >
        {preview ? "編集に戻る" : "プレビュー"}
      </Button>
      {preview ? (
        <div aria-label="フォームのプレビュー">
          {renderPreview ? renderPreview(value) : <FormPreview fields={value} />}
        </div>
      ) : (
        <>
          {!value.length && <EmptyState title="項目がありません" />}
          {value.map((field, index) => (
            <fieldset key={field.id} disabled={inactive} className="ds-builder-field">
              <legend>
                項目{index + 1}：{field.label}
              </legend>
              <Field label="項目名">
                {(attrs) => (
                  <Input
                    {...attrs}
                    value={field.label}
                    onChange={(event) => update(field.id, { label: event.target.value })}
                  />
                )}
              </Field>
              <Field label="入力の種類">
                {(attrs) => (
                  <NativeSelect
                    {...attrs}
                    value={field.kind}
                    onChange={(event) =>
                      update(field.id, { kind: event.target.value as BuilderField["kind"] })
                    }
                  >
                    {fieldKinds.map((kind) => (
                      <NativeSelectOption key={kind.value} value={kind.value}>
                        {kind.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                )}
              </Field>
              <Field label="補足説明">
                {(attrs) => (
                  <Textarea
                    {...attrs}
                    value={field.hint ?? ""}
                    onChange={(event) => update(field.id, { hint: event.target.value })}
                  />
                )}
              </Field>
              {field.kind !== "description" && (
                <LabeledCheckbox
                  checked={Boolean(field.required)}
                  onCheckedChange={(checked) => update(field.id, { required: Boolean(checked) })}
                >
                  回答を必須にする
                </LabeledCheckbox>
              )}
              {(["min", "max"] as const).map((bound) => (
                <Field
                  key={bound}
                  label={bound === "min" ? "下限（文字数・値・件数）" : "上限（文字数・値・件数）"}
                >
                  {(attrs) => (
                    <Input
                      {...attrs}
                      type="number"
                      value={field[bound] ?? ""}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (!raw || Number.isFinite(Number(raw)))
                          update(field.id, { [bound]: raw ? Number(raw) : undefined });
                      }}
                    />
                  )}
                </Field>
              ))}
              {field.min !== undefined && field.max !== undefined && field.min > field.max && (
                <p role="alert">下限は上限以下にしてください。</p>
              )}
              {field.kind === "choice" && (
                <div className="ds-stack">
                  <LabeledCheckbox
                    checked={Boolean(field.multiple)}
                    onCheckedChange={(checked) => update(field.id, { multiple: Boolean(checked) })}
                  >
                    複数選択を許可する
                  </LabeledCheckbox>
                  {field.options?.map((option, optionIndex) => (
                    <div key={option.id} className="ds-actions">
                      <Field label={`選択肢${optionIndex + 1}`}>
                        {(attrs) => (
                          <Input
                            {...attrs}
                            value={option.label}
                            onChange={(event) =>
                              update(field.id, {
                                options: field.options?.map((item) =>
                                  item.id === option.id
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              })
                            }
                          />
                        )}
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          update(field.id, {
                            options: field.options?.filter((item) => item.id !== option.id),
                          })
                        }
                      >
                        選択肢{optionIndex + 1}を削除
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      update(field.id, {
                        options: [
                          ...(field.options ?? []),
                          { id: createId(), label: "新しい選択肢" },
                        ],
                      })
                    }
                  >
                    選択肢を追加
                  </Button>
                </div>
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
                    type="button"
                    variant="ghost"
                    onClick={() => update(field.id, { condition: undefined })}
                  >
                    表示条件を解除
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    update(field.id, {
                      condition: { id: createId(), type: "group", operator: "and", children: [] },
                    })
                  }
                >
                  表示条件を設定
                </Button>
              )}
              <div className="ds-actions">
                <Button
                  type="button"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(value, index, -1))}
                >
                  項目{index + 1}を上へ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={index === value.length - 1}
                  onClick={() => onChange(moveItem(value, index, 1))}
                >
                  項目{index + 1}を下へ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onChange([
                      ...value.slice(0, index + 1),
                      cloneField(field, createId),
                      ...value.slice(index + 1),
                    ])
                  }
                >
                  項目{index + 1}を複製
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onChange(value.filter((item) => item.id !== field.id))}
                >
                  項目{index + 1}を削除
                </Button>
              </div>
            </fieldset>
          ))}
          <Button
            type="button"
            disabled={inactive}
            onClick={() =>
              onChange([...value, { id: createId(), kind: "text", label: "新しい項目" }])
            }
          >
            項目を追加
          </Button>
        </>
      )}
    </section>
  );
}
function FormPreview({ fields }: { fields: readonly BuilderField[] }) {
  return (
    <div className="ds-stack">
      {fields.map((field) => (
        <div key={field.id}>
          <strong>
            {field.label}
            {field.required ? "（必須）" : ""}
          </strong>
          <p>{field.hint}</p>
          <p className="ds-hint">
            {fieldKinds.find((kind) => kind.value === field.kind)?.label}
            {field.condition ? "・表示条件あり" : ""}
          </p>
          {field.options?.map((option) => (
            <p key={option.id}>○ {option.label}</p>
          ))}
          {field.children && <FormPreview fields={field.children} />}
        </div>
      ))}
    </div>
  );
}
