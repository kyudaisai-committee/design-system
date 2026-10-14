"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";

import { cn } from "../lib/utils";

export interface OtpInputProps extends Omit<
  ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "maxLength" | "pattern" | "inputMode"
> {
  value: string;
  onValueChange: (value: string) => void;
  length?: number;
}

const normalizeDigits = (value: string) => value.normalize("NFKC").replace(/[^0-9]/g, "");

/** A single native input owns editing, clipboard and autofill; slots only present its value. */
export function OtpInput({
  value,
  onValueChange,
  length = 6,
  className,
  style,
  disabled,
  readOnly,
  ref,
  onFocus,
  onBlur,
  onSelect,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: OtpInputProps) {
  const digits = Number.isFinite(length) ? Math.max(1, Math.floor(length)) : 6;
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCursor = useRef<number | null>(null);
  const composing = useRef(false);
  const [compositionValue, setCompositionValue] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  useImperativeHandle(ref, () => inputRef.current!);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && pendingCursor.current !== null) {
      const cursor = Math.min(pendingCursor.current, value.length);
      input.setSelectionRange(cursor, cursor);
      pendingCursor.current = null;
    }
  });
  function trackSelection(input: HTMLInputElement) {
    // The final letter-spacing extends beyond the final digit; keep hit targets aligned.
    input.scrollLeft = 0;
    setSelection({ start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 });
  }
  function updateValue(input: HTMLInputElement) {
    const next = normalizeDigits(input.value).slice(0, digits);
    const cursor = Math.min(
      normalizeDigits(input.value.slice(0, input.selectionStart ?? input.value.length)).length,
      digits,
    );
    pendingCursor.current = cursor;
    setSelection({ start: cursor, end: cursor });
    onValueChange(next);
  }
  const displayedValue = compositionValue ?? value;
  const active = Math.min(selection.start, digits - 1);
  return (
    <div
      className={cn("ds-otp mx-auto", className)}
      style={{ "--otp-digits": digits, ...style } as CSSProperties}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={
        Boolean(props["aria-invalid"] && props["aria-invalid"] !== "false") || undefined
      }
      data-focused={focused || undefined}
    >
      <div className="ds-otp-slots" aria-hidden="true">
        {Array.from({ length: digits }, (_, index) => {
          const selected =
            focused &&
            selection.end > selection.start &&
            index >= selection.start &&
            index < selection.end;
          return (
            <span
              key={index}
              className="ds-otp-slot"
              data-active={(focused && !readOnly && index === active) || undefined}
              data-selected={selected || undefined}
            >
              {displayedValue[index] ?? ""}
              {focused && !readOnly && index === active && !displayedValue[index] ? (
                <span className="ds-otp-caret" />
              ) : null}
            </span>
          );
        })}
      </div>
      <input
        autoComplete="one-time-code"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        {...props}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern={`[0-9]{${digits}}`}
        value={displayedValue}
        disabled={disabled}
        readOnly={readOnly}
        className="ds-otp-control"
        data-slot="otp-input"
        onFocus={(event) => {
          setFocused(true);
          trackSelection(event.currentTarget);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onSelect={(event) => {
          trackSelection(event.currentTarget);
          onSelect?.(event);
        }}
        onCompositionStart={(event) => {
          composing.current = true;
          setCompositionValue(event.currentTarget.value);
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          setCompositionValue(null);
          if (!disabled && !readOnly) updateValue(event.currentTarget);
          onCompositionEnd?.(event);
        }}
        onChange={(event) => {
          if (disabled || readOnly) return;
          const input = event.currentTarget;
          // IME owns its uncommitted text. Normalize only after composition is confirmed.
          if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
            setCompositionValue(input.value);
            return;
          }
          updateValue(input);
        }}
      />
    </div>
  );
}
