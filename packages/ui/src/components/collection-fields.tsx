"use client";

import { Trash2Icon, XIcon } from "lucide-react";
import { useId, useLayoutEffect, useRef, type ReactNode } from "react";

import { Button } from "./button";

export interface CollectionItem {
  id: string;
  label?: string;
}
export interface CollectionControlState {
  disabled?: boolean;
  readOnly?: boolean;
}
interface CollectionFieldProps extends CollectionControlState {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

function useCollectionFocus(items: readonly CollectionItem[]) {
  const rootRef = useRef<HTMLFieldSetElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const pending = useRef<{
    ids: string[];
    removedId?: string;
    index?: number;
    origin: Element | null;
  } | null>(null);
  useLayoutEffect(() => {
    const request = pending.current;
    const root = rootRef.current;
    if (!request || !root) return;
    const nextItem =
      request.removedId !== undefined
        ? !items.some((item) => item.id === request.removedId)
          ? items[Math.min(request.index ?? 0, items.length - 1)]
          : undefined
        : items.find((item) => !request.ids.includes(item.id));
    const removedLast = request.removedId !== undefined && items.length === 0;
    if (!nextItem && !removedLast) return;
    pending.current = null;
    const active = root.ownerDocument.activeElement;
    // Do not take focus back if an asynchronous update finishes after the user moves on.
    if (active !== request.origin && active !== root.ownerDocument.body) return;
    const itemElement = nextItem && itemRefs.current.get(nextItem.id);
    const controls = itemElement
      ? Array.from(
          itemElement.querySelectorAll<HTMLElement>(
            'input:not([type="hidden"]), textarea, select, [role="checkbox"], [role="radio"], [role="switch"], button, [tabindex]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled, [aria-disabled="true"]') &&
            element.getClientRects().length > 0,
        )
      : [];
    const input = controls.find((element) => element.tagName !== "BUTTON") ?? controls[0];
    const add = addRef.current;
    (input ?? (add && !add.disabled ? add : root)).focus();
  });
  function prepare(removedId?: string) {
    pending.current = {
      ids: items.map((item) => item.id),
      removedId,
      index: items.findIndex((item) => item.id === removedId),
      origin: rootRef.current?.ownerDocument.activeElement ?? null,
    };
  }
  function itemRef(id: string, element: HTMLElement | null) {
    if (element) itemRefs.current.set(id, element);
    else itemRefs.current.delete(id);
  }
  return { rootRef, addRef, itemRef, prepare };
}
export interface RepeaterProps extends CollectionFieldProps {
  items: readonly CollectionItem[];
  minItems?: number;
  maxItems?: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (item: CollectionItem, index: number, state: CollectionControlState) => ReactNode;
}

/** Stable item IDs and values are owned by the caller. Forward state to the rendered fields. */
export function Repeater({
  label,
  hint,
  error,
  required,
  items,
  minItems = 0,
  maxItems,
  onAdd,
  onRemove,
  renderItem,
  disabled,
  readOnly,
}: RepeaterProps) {
  const id = useId();
  const focus = useCollectionFocus(items);
  return (
    <fieldset
      ref={focus.rootRef}
      tabIndex={-1}
      className="min-w-0 space-y-4"
      disabled={disabled}
      aria-describedby={
        [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined
      }
    >
      <legend className="ds-label">
        {label}
        {required ? "（必須）" : ""}
      </legend>
      {hint ? (
        <p className="ds-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {items.map((item, index) => (
        <fieldset
          key={item.id}
          ref={(element) => focus.itemRef(item.id, element)}
          className="min-w-0 space-y-3 rounded-lg border border-border p-4"
        >
          <legend className="sr-only">{item.label ?? `${index + 1}件目`}</legend>
          <div className="-mt-2 -mr-2 flex min-h-11 items-center justify-between gap-3">
            <span className="text-base font-semibold" aria-hidden="true">
              {item.label ?? `${index + 1}件目`}
            </span>
            {!readOnly ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || items.length <= minItems}
                aria-label={`${item.label ?? `${index + 1}件目`}を削除`}
                onClick={() => {
                  focus.prepare(item.id);
                  onRemove(item.id);
                }}
              >
                <XIcon aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          {renderItem(item, index, { disabled, readOnly })}
        </fieldset>
      ))}
      {!readOnly ? (
        <Button
          ref={focus.addRef}
          type="button"
          variant="outline"
          disabled={disabled || (maxItems !== undefined && items.length >= maxItems)}
          onClick={() => {
            focus.prepare();
            onAdd();
          }}
        >
          項目を追加
        </Button>
      ) : null}
      {error ? (
        <p className="ds-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export interface InputTableProps extends CollectionFieldProps {
  rows: readonly CollectionItem[];
  columns: readonly { key: string; label: string }[];
  renderCell: (rowId: string, columnKey: string, state: CollectionControlState) => ReactNode;
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  minRows?: number;
  maxRows?: number;
}

/** Keep every cell labelled with its row and column; renderCell owns the actual input. */
export function InputTable({
  label,
  hint,
  error,
  required,
  rows,
  columns,
  renderCell,
  onAdd,
  onRemove,
  minRows = 0,
  maxRows,
  disabled,
  readOnly,
}: InputTableProps) {
  const id = useId();
  const focus = useCollectionFocus(rows);
  return (
    <fieldset
      ref={focus.rootRef}
      tabIndex={-1}
      className="min-w-0 space-y-3"
      disabled={disabled}
      aria-describedby={
        [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined
      }
    >
      <legend className="ds-label">
        {label}
        {required ? "（必須）" : ""}
      </legend>
      {hint ? (
        <p className="ds-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      <div
        className="overflow-x-auto rounded-lg border border-border"
        role="region"
        aria-label={`${label}の入力表`}
        tabIndex={0}
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="p-3">
                項目
              </th>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="p-3">
                  {column.label}
                </th>
              ))}
              {onRemove && !readOnly ? (
                <th scope="col" className="w-17 p-3">
                  <span className="sr-only">行の削除</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                ref={(element) => focus.itemRef(row.id, element)}
                className="border-b border-border last:border-0"
              >
                <th scope="row" className="p-3 font-medium whitespace-nowrap">
                  {row.label ?? `${index + 1}行目`}
                </th>
                {columns.map((column) => (
                  <td key={column.key} className="min-w-40 p-3">
                    {renderCell(row.id, column.key, { disabled, readOnly })}
                  </td>
                ))}
                {onRemove && !readOnly ? (
                  <td className="p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={disabled || rows.length <= minRows}
                      aria-label={`${row.label ?? `${index + 1}行目`}を削除`}
                      title={`${row.label ?? `${index + 1}行目`}を削除`}
                      onClick={() => {
                        focus.prepare(row.id);
                        onRemove(row.id);
                      }}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onAdd && !readOnly ? (
        <Button
          ref={focus.addRef}
          type="button"
          variant="outline"
          disabled={disabled || (maxRows !== undefined && rows.length >= maxRows)}
          onClick={() => {
            focus.prepare();
            onAdd();
          }}
        >
          行を追加
        </Button>
      ) : null}
      {error ? (
        <p className="ds-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
