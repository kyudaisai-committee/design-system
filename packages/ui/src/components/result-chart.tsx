"use client";
import { type ResultDatum } from "@kyudaisai/ui-models";

import { EmptyState, Notice } from "./compositions";

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
  if (!data.length) return <EmptyState title="表示できる結果がありません" />;
  if (data.some((item) => !Number.isFinite(item.value) || item.value < 0))
    return (
      <Notice title="結果を表示できません" tone="danger">
        数値を再取得してください。
      </Notice>
    );
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <figure className="ds-stack" aria-label={label}>
      <figcaption>
        {label}
        {note && <p className="ds-hint">{note}</p>}
      </figcaption>
      <div className="ds-bars" aria-hidden="true">
        {data.map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <span className="ds-bar-track">
              <span style={{ width: `${(item.value / max) * 100}%` }} />
            </span>
            <span>
              {formatValue(item.value)}
              {unit}
            </span>
          </div>
        ))}
      </div>
      <div className="ds-table-scroll" role="region" aria-label={`${label}の数値`} tabIndex={0}>
        <table>
          <caption className="sr-only">{label}の数値</caption>
          <thead>
            <tr>
              <th scope="col">順位</th>
              <th scope="col">対象</th>
              <th scope="col">値（{unit}）</th>
              <th scope="col">内訳・注記</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.rank ?? "—"}</td>
                <th scope="row">{item.label}</th>
                <td>{formatValue(item.value)}</td>
                <td>{item.detail ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
