"use client";

import { useId } from "react";

import { LabeledCheckbox } from "./compositions";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  options: readonly ChoiceOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  maxSelections?: number;
}

export function CheckboxGroup({
  label,
  hint,
  error,
  required,
  disabled,
  readOnly,
  name,
  options,
  value,
  onValueChange,
  maxSelections,
}: CheckboxGroupProps) {
  const id = useId();
  const selection = [...new Set(value)].filter((entry) =>
    options.some((option) => option.value === entry),
  );
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      className="min-w-0 space-y-3"
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
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
      {options.map((option) => {
        const checked = selection.includes(option.value);
        return (
          <LabeledCheckbox
            key={option.value}
            name={name}
            value={option.value}
            checked={checked}
            disabled={
              disabled ||
              option.disabled ||
              (!checked && maxSelections !== undefined && selection.length >= maxSelections)
            }
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            onCheckedChange={(next) => {
              if (disabled || readOnly || option.disabled) return;
              if (next && maxSelections !== undefined && selection.length >= maxSelections) return;
              onValueChange(
                next
                  ? [...selection, option.value]
                  : selection.filter((item) => item !== option.value),
              );
            }}
          >
            {option.label}
            {option.description ? (
              <span className="ds-hint block">{option.description}</span>
            ) : null}
          </LabeledCheckbox>
        );
      })}
      {error ? (
        <p className="ds-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export interface SocialProfileInputProps extends CheckboxGroupProps {
  noAccount: boolean;
  onNoAccountChange: (value: boolean) => void;
  allowNoAccount?: boolean;
}

/** Options describe existing profiles. Registration and provider verification belong to the host. */
export function SocialProfileInput({
  noAccount,
  onNoAccountChange,
  allowNoAccount = true,
  disabled,
  readOnly,
  onValueChange,
  ...props
}: SocialProfileInputProps) {
  return (
    <div className="space-y-4">
      <CheckboxGroup
        {...props}
        value={noAccount ? [] : props.value}
        disabled={disabled || noAccount}
        readOnly={readOnly}
        onValueChange={onValueChange}
      />
      {allowNoAccount ? (
        <LabeledCheckbox
          checked={noAccount}
          disabled={disabled}
          readOnly={readOnly}
          onCheckedChange={(checked) => {
            if (disabled || readOnly) return;
            if (checked) onValueChange([]);
            onNoAccountChange(checked);
          }}
        >
          アカウントを持っていません
        </LabeledCheckbox>
      ) : null}
    </div>
  );
}
