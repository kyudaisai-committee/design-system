"use client";

import { useEffect, useImperativeHandle, useRef, type ComponentProps } from "react";

import { Input } from "./input";

export { OtpInput, type OtpInputProps } from "./otp-input";
export { DateInput, TimeInput, type DateInputProps, type TimeInputProps } from "./date-controls";

export type TypedInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function EmailInput(props: TypedInputProps) {
  return (
    <Input
      autoComplete="email"
      inputMode="email"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      type="email"
    />
  );
}

export function UrlInput(props: TypedInputProps) {
  return (
    <Input
      autoComplete="url"
      inputMode="url"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      type="url"
    />
  );
}

function validateIntegerInput(
  input: HTMLInputElement,
  integer: boolean,
  integerError: { current: boolean },
) {
  const message = "整数を入力してください。";
  if (integer && input.value !== "" && !Number.isInteger(input.valueAsNumber)) {
    input.setCustomValidity(message);
    integerError.current = true;
  } else if (integerError.current) {
    // Disabled/read-only fields hide validationMessage, but retain customValidity.
    if (!input.willValidate || input.validationMessage === message) input.setCustomValidity("");
    integerError.current = false;
  }
}

/** Keep the editing value as a string; convert and validate when the form is submitted. */
export function NumberInput({
  integer = false,
  step,
  min,
  max,
  value,
  defaultValue,
  disabled,
  readOnly,
  onChange,
  ref,
  ...props
}: TypedInputProps & { integer?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const integerError = useRef(false);
  useImperativeHandle(ref, () => inputRef.current!);
  // HTML step uses min or the value attribute as its base; step=1 alone permits fractions.
  useEffect(() => {
    const input = inputRef.current;
    if (input) validateIntegerInput(input, integer, integerError);
  }, [integer, value, defaultValue, disabled, readOnly]);
  useEffect(() => {
    const input = inputRef.current;
    const parentForm = input?.form;
    if (!input || !parentForm) return;
    const reset = () => {
      // The reset event runs before the browser restores the input's default value.
      queueMicrotask(() => validateIntegerInput(input, integer, integerError));
    };
    parentForm.addEventListener("reset", reset);
    return () => parentForm.removeEventListener("reset", reset);
  }, [integer, props.form]);
  const integerBound = (bound: TypedInputProps["min"], round: (value: number) => number) =>
    integer && bound !== undefined && bound !== "" && Number.isFinite(Number(bound))
      ? round(Number(bound))
      : bound;
  return (
    <Input
      inputMode={
        min !== undefined && min !== "" && Number(min) >= 0
          ? integer
            ? "numeric"
            : "decimal"
          : "text"
      }
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      ref={inputRef}
      type="number"
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      min={integerBound(min, Math.ceil)}
      max={integerBound(max, Math.floor)}
      step={integer ? "any" : (step ?? "any")}
      onChange={(event) => {
        validateIntegerInput(event.currentTarget, integer, integerError);
        onChange?.(event);
      }}
    />
  );
}
