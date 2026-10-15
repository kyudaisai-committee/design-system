"use client";
import type { BoardItem, BoardLane } from "@kyudaisai/ui-models";

import { Field, Notice } from "./compositions";
import { LabeledCheckbox } from "./compositions";
import { NativeSelect, NativeSelectOption } from "./native-select";
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
  const inactive = Boolean(disabled || readOnly);
  const orphaned = items.filter((item) => !lanes.some((lane) => lane.id === item.laneId));
  return (
    <section aria-label={label} className="ds-stack">
      <div className="ds-board">
        {[
          ...lanes.map((lane) => ({ ...lane, orphanBucket: false })),
          ...(orphaned.length
            ? [{ id: "", label: "配置先を確認してください", orphanBucket: true }]
            : []),
        ].map((lane) => {
          const assigned = lane.orphanBucket
            ? orphaned
            : items.filter((item) => item.laneId === lane.id);
          const shortage =
            lane.capacity === undefined ? undefined : lane.capacity - assigned.length;
          return (
            <section
              key={`${lane.orphanBucket ? "orphan" : "lane"}:${lane.id}`}
              className="ds-board-lane"
              aria-label={lane.label}
            >
              <h3>{lane.label}</h3>
              {lane.description && <p>{lane.description}</p>}
              <p>
                {assigned.length}人
                {shortage === undefined
                  ? ""
                  : shortage > 0
                    ? `・${shortage}人不足`
                    : shortage < 0
                      ? `・${-shortage}人超過`
                      : "・必要人数を充足"}
              </p>
              {assigned.map((item) => (
                <article key={item.id} className="ds-board-item">
                  <h4>
                    {item.label}
                    {item.locked ? "（固定）" : ""}
                  </h4>
                  {item.description && <p>{item.description}</p>}
                  {item.conflict && (
                    <Notice title="競合あり" tone="warning">
                      {item.conflict}
                    </Notice>
                  )}
                  <Field label={`${item.label}の配置先`}>
                    {(attrs) => (
                      <NativeSelect
                        {...attrs}
                        value={item.laneId}
                        disabled={inactive || item.locked}
                        onChange={(event) => {
                          if (!inactive && !item.locked) onMove(item.id, event.target.value);
                        }}
                      >
                        {!lanes.some((candidate) => candidate.id === item.laneId) && (
                          <NativeSelectOption value={item.laneId}>
                            配置先がありません
                          </NativeSelectOption>
                        )}
                        {lanes.map((candidate) => (
                          <NativeSelectOption key={candidate.id} value={candidate.id}>
                            {candidate.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    )}
                  </Field>
                  {onLockChange && (
                    <LabeledCheckbox
                      checked={Boolean(item.locked)}
                      disabled={inactive}
                      onCheckedChange={(locked) => onLockChange(item.id, Boolean(locked))}
                    >
                      {item.label}の配置を固定する
                    </LabeledCheckbox>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
