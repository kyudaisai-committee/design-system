"use client";

import { Popover } from "@base-ui/react/popover";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react";

import { cn } from "../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

type Mode = "date" | "time";
export interface DateInputProps extends Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> {
  /** Local calendar date (YYYY-MM-DD), displayed as YYYY/MM/DD. */
  value?: string;
  /** Initial uncontrolled value, also restored by an uncancelled form reset. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  min?: string;
  max?: string;
}
export interface TimeInputProps extends Omit<DateInputProps, "value" | "defaultValue"> {
  /** Wall-clock time in 24-hour HH:mm format. */
  value?: string;
  defaultValue?: string;
}
const pad = (value: number) => String(value).padStart(2, "0");
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
function makeDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(12, 0, 0, 0);
  return date;
}
function dateValue(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = makeDate(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}
function validValue(value: string, mode: Mode) {
  return mode === "date" ? Boolean(parseDate(value)) : /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
const displayValue = (value: string, mode: Mode) =>
  mode === "date" ? value.replace(/-/g, "/") : value;
function clamp(value: string, min?: string, max?: string) {
  return min && value < min ? min : max && value > max ? max : value;
}
function shiftMonth(date: Date, amount: number) {
  const first = makeDate(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = makeDate(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return makeDate(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay));
}
function Calendar({
  value,
  onValueChange,
  min,
  max,
}: {
  value: string;
  onValueChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  const selected = parseDate(value)!;
  const [month, setMonth] = useState(() =>
    makeDate(selected.getFullYear(), selected.getMonth(), 1),
  );
  const [focused, setFocused] = useState(value);
  const [yearText, setYearText] = useState(String(month.getFullYear()));
  const focusAfterMove = useRef(false);
  const dayRef = useRef<HTMLButtonElement>(null);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = month.getDay();
  const days = makeDate(year, monthIndex + 1, 0).getDate();
  const count = Math.ceil((firstDay + days) / 7) * 7;
  useEffect(() => setYearText(String(year)), [year]);
  useEffect(() => {
    if (focusAfterMove.current) {
      dayRef.current?.focus();
      focusAfterMove.current = false;
    }
  }, [focused]);
  function moveTo(next: Date, focus = false) {
    const bounded = clamp(dateValue(next), min ?? "0001-01-01", max ?? "9999-12-31");
    const parsed = parseDate(bounded);
    if (!parsed) return;
    focusAfterMove.current = focus;
    setFocused(bounded);
    setMonth(makeDate(parsed.getFullYear(), parsed.getMonth(), 1));
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, day: Date) {
    let next: Date;
    switch (event.key) {
      case "ArrowLeft":
        next = makeDate(year, monthIndex, day.getDate() - 1);
        break;
      case "ArrowRight":
        next = makeDate(year, monthIndex, day.getDate() + 1);
        break;
      case "ArrowUp":
        next = makeDate(year, monthIndex, day.getDate() - 7);
        break;
      case "ArrowDown":
        next = makeDate(year, monthIndex, day.getDate() + 7);
        break;
      case "Home":
        next = makeDate(year, monthIndex, day.getDate() - day.getDay());
        break;
      case "End":
        next = makeDate(year, monthIndex, day.getDate() + 6 - day.getDay());
        break;
      case "PageUp":
        next = shiftMonth(day, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        next = shiftMonth(day, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveTo(next, true);
  }
  const previousMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="前の月"
          disabled={
            (year === 1 && monthIndex === 0) ||
            Boolean(min && dateValue(makeDate(year, monthIndex, 0)) < min)
          }
          onClick={() => moveTo(previousMonth)}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <div className="flex min-w-0 items-center gap-1">
          <Input
            aria-label="年"
            className="w-20 px-1 text-center"
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={yearText}
            onChange={(event) => setYearText(event.target.value)}
            onBlur={() => {
              const next = Number(yearText);
              if (Number.isInteger(next) && next >= 1 && next <= 9999)
                moveTo(makeDate(next, monthIndex, 1));
              else setYearText(String(year));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
          <span>年</span>
          <select
            aria-label="月"
            value={monthIndex}
            className="min-h-11 min-w-0 rounded-lg border border-input bg-background px-1 text-base focus-visible:outline-2 focus-visible:outline-ring"
            onChange={(event) => moveTo(makeDate(year, Number(event.target.value), 1))}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index}>
                {index + 1}月
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="次の月"
          disabled={
            (year === 9999 && monthIndex === 11) || Boolean(max && dateValue(nextMonth) > max)
          }
          onClick={() => moveTo(nextMonth)}
        >
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {year}年{monthIndex + 1}月
      </p>
      <table
        role="grid"
        aria-label={`${year}年${monthIndex + 1}月`}
        className="w-full table-fixed border-collapse text-center"
      >
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th key={day} scope="col" className="h-8 text-xs font-normal text-muted-foreground">
                <abbr title={`${day}曜日`} className="no-underline">
                  {day}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count / 7 }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, weekday) => {
                const day = week * 7 + weekday - firstDay + 1;
                if (day < 1 || day > days) return <td key={weekday} />;
                const date = makeDate(year, monthIndex, day);
                const iso = dateValue(date);
                const disabled = Boolean((min && iso < min) || (max && iso > max));
                return (
                  <td key={weekday} aria-selected={iso === value} className="p-0.5">
                    <button
                      type="button"
                      ref={iso === focused ? dayRef : undefined}
                      data-calendar-focus={iso === focused ? "true" : undefined}
                      tabIndex={iso === focused ? 0 : -1}
                      disabled={disabled}
                      aria-label={`${year}年${monthIndex + 1}月${day}日（${weekdays[weekday]}曜日）`}
                      aria-current={iso === dateValue(new Date()) ? "date" : undefined}
                      className={cn(
                        "min-h-10 w-full rounded-md text-sm tabular-nums outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30",
                        iso === value &&
                          "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
                      )}
                      onKeyDown={(event) => keyDown(event, date)}
                      onClick={() => {
                        setFocused(iso);
                        onValueChange(iso);
                      }}
                    >
                      {day}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DateTimeInput({
  mode,
  value,
  defaultValue = "",
  onValueChange,
  min,
  max,
  name,
  form,
  ref,
  disabled,
  readOnly,
  onBlur,
  className,
  ...props
}: DateInputProps & { mode: Mode }) {
  const initialDefault = useRef(defaultValue);
  const [uncontrolled, setUncontrolled] = useState(initialDefault.current);
  const canonical = value ?? uncontrolled;
  const [text, setText] = useState(() => displayValue(canonical, mode));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string | undefined>(undefined);
  const previousValue = useRef({ canonical, mode });
  const inactive = Boolean(disabled || readOnly);
  useImperativeHandle(ref, () => inputRef.current!);
  const badBounds = Boolean(
    (min && !validValue(min, mode)) || (max && !validValue(max, mode)) || (min && max && min > max),
  );
  function validationMessage(raw: string) {
    if (badBounds) return "選択できる範囲の設定を確認してください。";
    if (!raw) return "";
    const next = mode === "date" ? raw.replace(/\//g, "-") : raw;
    if (!validValue(next, mode))
      return mode === "date"
        ? "実在する日付を yyyy/mm/dd の形式で入力してください。"
        : "00:00〜23:59 の形式で入力してください。";
    if (min && next < min) return `${displayValue(min, mode)}以降を指定してください。`;
    if (max && next > max) return `${displayValue(max, mode)}以前を指定してください。`;
    return "";
  }
  useLayoutEffect(() => {
    // Keep incomplete text editable, but accepted values always follow controlled props.
    const emitted = lastEmitted.current;
    const externalChange =
      previousValue.current.canonical !== canonical || previousValue.current.mode !== mode;
    if (emitted !== undefined ? emitted !== canonical : externalChange)
      setText(displayValue(canonical, mode));
    previousValue.current = { canonical, mode };
    lastEmitted.current = undefined;
  }, [canonical, mode, text]);
  useEffect(() => {
    inputRef.current?.setCustomValidity(validationMessage(text));
  });
  useEffect(() => {
    if (inactive) setOpen(false);
  }, [inactive]);
  useEffect(() => {
    const parentForm = inputRef.current?.form;
    if (value !== undefined || !parentForm) return;
    const reset = (event: Event) => {
      // A host can cancel reset to protect unsaved answers. Wait for its handlers first.
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        setUncontrolled(initialDefault.current);
        setText(displayValue(initialDefault.current, mode));
        setOpen(false);
      });
    };
    parentForm.addEventListener("reset", reset);
    return () => parentForm.removeEventListener("reset", reset);
  }, [form, mode, value]);
  function emit(next: string) {
    lastEmitted.current = next;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }
  function commit(next: string) {
    if (inactive || validationMessage(displayValue(next, mode))) return;
    setText(displayValue(next, mode));
    emit(next);
    setOpen(false);
  }
  function openChange(next: boolean) {
    if (next) {
      if (inactive || badBounds) return;
      const current = mode === "date" ? text.replace(/\//g, "-") : text;
      const initial = validValue(current, mode)
        ? current
        : mode === "date"
          ? dateValue(new Date())
          : "09:00";
      setDraft(clamp(initial, min, max));
    }
    setOpen(next);
  }
  const label = mode === "date" ? "日付" : "時刻";
  const Icon = mode === "date" ? CalendarIcon : ClockIcon;
  const draftError = draft ? validationMessage(displayValue(draft, mode)) : "";
  const rangeHint = [
    min ? `${displayValue(min, mode)}以降` : "",
    max ? `${displayValue(max, mode)}以前` : "",
  ]
    .filter(Boolean)
    .join("・");
  return (
    <Popover.Root open={open} onOpenChange={openChange} modal="trap-focus">
      <div className="relative min-w-0">
        <Input
          {...props}
          ref={inputRef}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete={props.autoComplete ?? "off"}
          placeholder={props.placeholder ?? (mode === "date" ? "yyyy/mm/dd" : "HH:mm")}
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          form={form}
          className={cn("pr-12 tabular-nums", className)}
          onChange={(event) => {
            const raw = event.target.value;
            setText(raw);
            event.currentTarget.setCustomValidity(validationMessage(raw));
            const next = mode === "date" ? raw.replace(/\//g, "-") : raw;
            if (!raw || validValue(next, mode)) emit(next);
          }}
          onBlur={(event) => {
            if (validValue(mode === "date" ? text.replace(/\//g, "-") : text, mode))
              setText(displayValue(mode === "date" ? text.replace(/\//g, "-") : text, mode));
            onBlur?.(event);
          }}
        />
        {name ? (
          <input type="hidden" name={name} form={form} value={canonical} disabled={disabled} />
        ) : null}
        <Popover.Trigger
          type="button"
          disabled={inactive || badBounds}
          aria-label={`${label}の選択画面を開く`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon aria-hidden="true" className="size-5" />
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Positioner anchor={inputRef} sideOffset={8} align="center" className="z-50">
          <Popover.Popup
            ref={popupRef}
            initialFocus={() =>
              mode === "date"
                ? (popupRef.current?.querySelector<HTMLButtonElement>(
                    '[data-calendar-focus="true"]',
                  ) ?? true)
                : true
            }
            className="max-h-[var(--available-height)] w-84 max-w-[calc(100vw-2rem)] space-y-4 overflow-y-auto rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg outline-none"
          >
            <div className="space-y-1">
              <Popover.Title className="font-semibold">{label}を選択</Popover.Title>
              <Popover.Description className="text-sm text-muted-foreground">
                {mode === "date"
                  ? "日付を選ぶと入力欄に反映されます。"
                  : "24時間表記で時と分を選んでください。"}
              </Popover.Description>
              {rangeHint ? <p className="text-xs text-muted-foreground">{rangeHint}</p> : null}
            </div>
            {mode === "date" ? (
              <Calendar value={draft} onValueChange={commit} min={min} max={max} />
            ) : (
              <div className="flex items-center gap-3">
                <label className="flex flex-1 items-center gap-2">
                  <select
                    aria-label="時"
                    className="min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-base"
                    value={draft.slice(0, 2)}
                    onChange={(event) => setDraft(`${event.target.value}:${draft.slice(3)}`)}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={pad(hour)}>
                        {pad(hour)}
                      </option>
                    ))}
                  </select>
                  時
                </label>
                <label className="flex flex-1 items-center gap-2">
                  <select
                    aria-label="分"
                    className="min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-base"
                    value={draft.slice(3)}
                    onChange={(event) => setDraft(`${draft.slice(0, 2)}:${event.target.value}`)}
                  >
                    {Array.from({ length: 60 }, (_, minute) => (
                      <option key={minute} value={pad(minute)}>
                        {pad(minute)}
                      </option>
                    ))}
                  </select>
                  分
                </label>
              </div>
            )}
            {draftError ? (
              <p role="alert" className="text-sm text-destructive">
                {draftError}
              </p>
            ) : null}
            {!props.required || mode === "time" ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {!props.required ? (
                  <Button variant="ghost" onClick={() => commit("")}>
                    クリア
                  </Button>
                ) : null}
                {mode === "time" ? (
                  <>
                    <Popover.Close render={<Button variant="outline" />}>キャンセル</Popover.Close>
                    <Button disabled={Boolean(draftError)} onClick={() => commit(draft)}>
                      {label}を決定
                    </Button>
                  </>
                ) : null}
              </div>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
export function DateInput(props: DateInputProps) {
  return <DateTimeInput {...props} mode="date" />;
}
export function TimeInput(props: TimeInputProps) {
  return <DateTimeInput {...props} mode="time" />;
}
