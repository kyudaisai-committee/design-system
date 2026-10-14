"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "../lib/utils";

function Input({ className, type, value, defaultValue, ...props }: React.ComponentProps<"input">) {
  // Uncontrolled defaults initialize once. Consumers explicitly remount to reset a form.
  const initialDefault = React.useRef(defaultValue);
  const isControlled = value !== undefined;
  const literal =
    type !== undefined && ["email", "url", "tel", "password", "number"].includes(type);
  const inputMode =
    type === "email"
      ? "email"
      : type === "url"
        ? "url"
        : type === "tel"
          ? "tel"
          : type === "search"
            ? "search"
            : undefined;
  return (
    <InputPrimitive
      type={type}
      inputMode={inputMode}
      autoComplete={type === "email" || type === "url" || type === "tel" ? type : undefined}
      autoCapitalize={literal ? "none" : undefined}
      autoCorrect={literal ? "off" : undefined}
      spellCheck={literal ? false : undefined}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...(isControlled ? { value } : { defaultValue: initialDefault.current })}
      {...props}
    />
  );
}

export { Input };
