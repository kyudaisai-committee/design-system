"use client";

import { useRef, useState } from "react";

import { Button } from "./button";
import { Field } from "./compositions";
import { Input } from "./input";

export interface FileInputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  accept?: string;
  maxFiles?: number;
  maxBytes?: number;
  value: readonly File[];
  onValueChange: (files: File[]) => void;
}

/** Selection only. The caller owns upload, persistence and server-side file validation. */
export function FileInput({
  label,
  hint,
  error,
  required,
  disabled,
  readOnly,
  accept,
  maxFiles = 1,
  maxBytes,
  value,
  onValueChange,
}: FileInputProps) {
  const [selectionError, setSelectionError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3">
      <Field label={label} hint={hint} required={required} error={selectionError || error}>
        {(controlProps) => (
          <Input
            {...controlProps}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            required={required && value.length === 0}
            disabled={disabled || readOnly}
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (disabled || readOnly || selected.length === 0) return;
              if (selected.length > maxFiles) {
                setSelectionError(`${maxFiles}ファイル以内で選択してください。`);
                return;
              }
              if (maxBytes !== undefined && selected.some((file) => file.size > maxBytes)) {
                setSelectionError(
                  `1ファイルあたり${maxBytes.toLocaleString()}バイト以内で選択してください。`,
                );
                return;
              }
              setSelectionError("");
              onValueChange(selected);
            }}
          />
        )}
      </Field>
      <ul className="space-y-2" aria-label="選択したファイル">
        {value.map((file, index) => (
          <li
            key={`${file.name}-${file.lastModified}-${index}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
          >
            <span className="min-w-0 break-all">
              {file.name}
              <span className="ds-hint block">{Math.ceil(file.size / 1024)}KB・選択済み</span>
            </span>
            {!readOnly ? (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-label={`${file.name}を取り除く`}
                onClick={() => {
                  setSelectionError("");
                  inputRef.current?.focus();
                  onValueChange(value.filter((_, itemIndex) => itemIndex !== index));
                }}
              >
                取り除く
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
