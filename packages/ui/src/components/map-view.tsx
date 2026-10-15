"use client";

import {
  clamp,
  initialViewport,
  mapControls,
  viewportChange,
  safeImage,
  type MapPoint,
} from "@kyudaisai/ui-models";
import { useState } from "react";

import { Button } from "./button";
import { Field, EmptyState } from "./compositions";
import { NumberInput } from "./form-controls";
import { Input } from "./input";

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
  const [viewport, setViewport] = useState(initialViewport);
  return (
    <section aria-label={label} className="ds-stack">
      {updatedLabel && <p className="ds-hint">{updatedLabel}</p>}
      <div className="ds-actions" role="group" aria-label="地図の表示範囲">
        {mapControls.map(([action, name]) => (
          <Button
            key={action}
            type="button"
            variant="outline"
            onClick={() => setViewport((view) => viewportChange(view, action))}
          >
            {name}
          </Button>
        ))}
      </div>
      <svg
        viewBox={`${viewport.x} ${viewport.y} ${viewport.size} ${viewport.size}`}
        className="ds-map"
        role="img"
        aria-label={`${label}。会場は下の一覧から選択できます。`}
      >
        {backgroundSrc && safeImage(backgroundSrc) && (
          <image
            href={safeImage(backgroundSrc)}
            width="100"
            height="100"
            preserveAspectRatio="none"
          />
        )}
        {points
          .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
          .map((point) => (
            <g
              key={point.id}
              aria-hidden="true"
              onClick={() => onSelect?.(point)}
              className="ds-map-point"
            >
              <circle
                cx={clamp(point.x, 0, 100)}
                cy={clamp(point.y, 0, 100)}
                r={selectedId === point.id ? 3 : 2}
              />
              <text
                x={clamp(point.x, 0, 100)}
                y={clamp(point.y - 4, 2, 98)}
                textAnchor="middle"
                fontSize="3"
              >
                {point.label}
              </text>
            </g>
          ))}
      </svg>
      {points.length ? (
        <ul className="ds-map-alternatives">
          {points.map((point) => (
            <li key={point.id}>
              {onSelect ? (
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={selectedId === point.id}
                  onClick={() => onSelect(point)}
                >
                  {point.label}
                </Button>
              ) : (
                <strong>{point.label}</strong>
              )}
              {point.description && <p>{point.description}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="会場がありません" />
      )}
    </section>
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
  const inactive = disabled || readOnly;
  function update(changes: Partial<MapPoint>) {
    if (!inactive && point)
      onChange(points.map((item) => (item.id === point.id ? { ...item, ...changes } : item)));
  }
  return (
    <div className="ds-stack">
      <MapView
        {...props}
        points={points}
        selectedId={selectedId}
        onSelect={(item) => setSelectedId(item.id)}
      />
      <Button
        type="button"
        disabled={inactive}
        onClick={() => {
          const id = createId();
          onChange([...points, { id, label: "新しい場所", x: 50, y: 50 }]);
          setSelectedId(id);
        }}
      >
        場所を追加
      </Button>
      {point && (
        <fieldset disabled={inactive} className="ds-stack">
          <legend>{point.label}の配置</legend>
          <Field label="場所の名前">
            {(attrs) => (
              <Input
                {...attrs}
                value={point.label}
                onChange={(event) => update({ label: event.target.value })}
              />
            )}
          </Field>
          {(["x", "y"] as const).map((axis) => (
            <Field key={axis} label={axis === "x" ? "横の位置（0〜100）" : "縦の位置（0〜100）"}>
              {(attrs) => (
                <NumberInput
                  {...attrs}
                  min={0}
                  max={100}
                  value={point[axis]}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (event.target.value && Number.isFinite(value))
                      update({ [axis]: clamp(value, 0, 100) });
                  }}
                />
              )}
            </Field>
          ))}
          <p className="ds-hint">
            数値で位置を調整できます。地図の拡大率を変えても配置は変わりません。
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange(points.filter((item) => item.id !== point.id));
              setSelectedId(undefined);
            }}
          >
            この場所を削除
          </Button>
        </fieldset>
      )}
    </div>
  );
}
