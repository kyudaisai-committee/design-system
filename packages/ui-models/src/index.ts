import type { Root, Content, PhrasingContent } from "mdast";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type MarkdownNode = Content | PhrasingContent;
const parser = unified().use(remarkParse).use(remarkGfm);
/** HTML is deliberately not interpreted by either renderer. */
export function parseMarkdown(source: string): Root {
  return parser.parse(source);
}

/** Absolute HTTP(S), same-origin paths and fragment links only; no scheme-relative URLs. */
export function safeLink(value: string): string | undefined {
  // eslint-disable-next-line no-control-regex -- reject whitespace/control characters in untrusted URLs
  if (!value || /[\u0000-\u0020\u007f\\]/u.test(value)) return undefined;
  if (/^#[^\s]*$/u.test(value) || /^\/(?!\/)/u.test(value)) return value;
  try {
    const url = new URL(value);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password)
      return url.href;
  } catch {
    /* Invalid and arbitrary relative URLs stay as text. */
  }
  return undefined;
}
export function safeImage(value: string): string | undefined {
  const safe = safeLink(value);
  return safe && !safe.startsWith("#") ? safe : undefined;
}
export type MediaState = "ready" | "loading" | "error" | "unavailable";
export interface ImageAsset {
  id: string;
  src?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  expiresAt?: number;
  state?: MediaState;
}
export interface MapPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  description?: string;
}
export interface MapViewport {
  x: number;
  y: number;
  size: number;
}
export const initialViewport: MapViewport = { x: 0, y: 0, size: 100 };
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export function viewportChange(
  view: MapViewport,
  action: "in" | "out" | "left" | "right" | "up" | "down" | "reset",
): MapViewport {
  if (action === "reset") return initialViewport;
  const size = clamp(
    action === "in" ? view.size / 1.5 : action === "out" ? view.size * 1.5 : view.size,
    12,
    100,
  );
  const x =
    view.x +
    (view.size - size) / 2 +
    (action === "left" ? -size / 4 : action === "right" ? size / 4 : 0);
  const y =
    view.y +
    (view.size - size) / 2 +
    (action === "up" ? -size / 4 : action === "down" ? size / 4 : 0);
  return { x: clamp(x, 0, 100 - size), y: clamp(y, 0, 100 - size), size };
}
export interface ResultDatum {
  id: string;
  label: string;
  value: number;
  rank?: number;
  detail?: string;
}
export interface ComparisonItem {
  id: string;
  label: string;
  before?: string;
  after?: string;
}
export interface BoardLane {
  id: string;
  label: string;
  description?: string;
  capacity?: number;
}
export interface BoardItem {
  id: string;
  label: string;
  laneId: string;
  description?: string;
  locked?: boolean;
  conflict?: string;
}
export interface ConditionLeaf {
  id: string;
  type: "rule";
  field: string;
  operator: "equals" | "notEquals" | "contains";
  value: string;
}
export interface ConditionGroup {
  id: string;
  type: "group";
  operator: "and" | "or" | "not";
  children: readonly Condition[];
}
export type Condition = ConditionLeaf | ConditionGroup;
export type FormFieldKind =
  | "text"
  | "multiline"
  | "number"
  | "choice"
  | "file"
  | "description"
  | "date"
  | "time"
  | "group"
  | "table";
export interface BuilderField {
  id: string;
  label: string;
  kind: FormFieldKind;
  hint?: string;
  required?: boolean;
  options?: readonly { id: string; label: string }[];
  multiple?: boolean;
  min?: number;
  max?: number;
  condition?: ConditionGroup;
  children?: readonly BuilderField[];
}
export const fieldKinds: readonly { value: FormFieldKind; label: string }[] = [
  { value: "text", label: "短文" },
  { value: "multiline", label: "長文" },
  { value: "number", label: "数値" },
  { value: "choice", label: "選択" },
  { value: "file", label: "添付" },
  { value: "description", label: "説明" },
  { value: "date", label: "日付" },
  { value: "time", label: "時刻" },
  { value: "group", label: "繰り返し" },
  { value: "table", label: "表" },
];
export function moveItem<T>(items: readonly T[], index: number, delta: number): T[] {
  const result = [...items];
  const target = index + delta;
  if (index < 0 || index >= result.length || target < 0 || target >= result.length) return result;
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}
/** IDs are supplied by the host so duplication never reuses field/condition/option IDs. */
export function cloneField(field: BuilderField, createId: () => string): BuilderField {
  const ids = new Map<string, string>();
  function collect(item: BuilderField) {
    ids.set(item.id, createId());
    item.children?.forEach(collect);
  }
  collect(field);
  function conditionCopy(condition: Condition): Condition {
    return condition.type === "group"
      ? { ...condition, id: createId(), children: condition.children.map(conditionCopy) }
      : { ...condition, id: createId(), field: ids.get(condition.field) ?? condition.field };
  }
  function copy(item: BuilderField): BuilderField {
    return {
      ...item,
      id: ids.get(item.id)!,
      options: item.options?.map((option) => ({ ...option, id: createId() })),
      children: item.children?.map(copy),
      condition: item.condition ? (conditionCopy(item.condition) as ConditionGroup) : undefined,
    };
  }
  return copy(field);
}
export const mapControls = [
  ["in", "拡大"],
  ["out", "縮小"],
  ["left", "左へ"],
  ["right", "右へ"],
  ["up", "上へ"],
  ["down", "下へ"],
  ["reset", "全体を表示"],
] as const;
