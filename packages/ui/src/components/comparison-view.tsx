"use client";
import type { ComparisonItem } from "@kyudaisai/ui-models";

import { EmptyState } from "./compositions";
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
  const visible = onlyChanges ? items.filter((item) => item.before !== item.after) : items;
  return (
    <section aria-label={label} className="ds-stack">
      {visible.length ? (
        visible.map((item) => (
          <article key={item.id} className="ds-comparison">
            <h3>
              {item.label}{" "}
              <span className="ds-hint">
                {item.before === item.after
                  ? "変更なし"
                  : item.before === undefined
                    ? "追加"
                    : item.after === undefined
                      ? "削除"
                      : "変更あり"}
              </span>
            </h3>
            <div>
              <section aria-label={`${item.label}・${beforeLabel}`}>
                <h4>{beforeLabel}</h4>
                <p>{item.before ?? "未設定"}</p>
              </section>
              <section aria-label={`${item.label}・${afterLabel}`}>
                <h4>{afterLabel}</h4>
                <p>{item.after ?? "未設定"}</p>
              </section>
            </div>
          </article>
        ))
      ) : (
        <EmptyState title={onlyChanges ? "変更はありません" : "比較する内容がありません"} />
      )}
    </section>
  );
}
