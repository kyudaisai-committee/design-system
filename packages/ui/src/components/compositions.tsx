"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Card } from "./card";
import { Skeleton } from "./skeleton";
import { Label } from "./label";
import { cn, mergeClassName } from "../lib/utils";

export type Tone = "info" | "success" | "warning" | "danger";

/** Children receive the label association and hint/error IDs; forward all controlProps. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (controlProps: {
    id: string;
    required?: boolean;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
  }) => ReactNode;
}) {
  const id = useId();
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="ds-field">
      <Label className="ds-label" htmlFor={id}>
        {label}
        {required && <span>（必須）</span>}
      </Label>
      {hint && (
        <p id={`${id}-hint`} className="ds-hint">
          {hint}
        </p>
      )}
      {children({
        id,
        required,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {error && (
        <p id={`${id}-error`} className="ds-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function LabeledCheckbox({
  children,
  className,
  ...props
}: ComponentProps<typeof Checkbox>) {
  return (
    <label className="ds-checkbox">
      <Checkbox {...props} className={mergeClassName("mt-1", className)} />
      <span>{children}</span>
    </label>
  );
}
export function StatusBadge({
  tone,
  className,
  ...props
}: ComponentProps<typeof Badge> & { tone?: Tone }) {
  return (
    <Badge
      {...props}
      variant="secondary"
      className={cn("ds-badge h-auto", className)}
      data-tone={tone}
    />
  );
}
export function Notice({
  title,
  tone = "info",
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof Alert>, "title"> & {
  title: string;
  tone?: Tone;
}) {
  return (
    <Alert
      role={undefined}
      {...props}
      className={cn("ds-alert", className)}
      data-tone={tone}
    >
      <AlertTitle>{title}</AlertTitle>
      {children && (
        <AlertDescription className="text-inherit">{children}</AlertDescription>
      )}
    </Alert>
  );
}
export function ContentCard({
  className,
  ...props
}: ComponentProps<typeof Card>) {
  return <Card {...props} className={cn("ds-card", className)} />;
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="ds-empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function LoadingState({ label = "読み込み中" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="ds-stack">
      <span className="ds-sr-only">{label}</span>
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
    </div>
  );
}
