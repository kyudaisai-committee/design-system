"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";
import { useImperativeHandle, useRef } from "react";

import { useFormResetValue } from "../hooks/use-form-reset";
import { mergeClassName } from "../lib/utils";

function Checkbox({
  className,
  checked,
  defaultChecked,
  indeterminate,
  onCheckedChange,
  ref,
  ...props
}: CheckboxPrimitive.Root.Props) {
  const controlRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => controlRef.current!);
  const [currentChecked, setChecked] = useFormResetValue(
    checked,
    defaultChecked ?? false,
    controlRef,
    props.form,
  );
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={mergeClassName(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-3 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary",
        className,
      )}
      indeterminate={indeterminate}
      {...props}
      ref={controlRef}
      checked={currentChecked}
      onCheckedChange={(next, details) => {
        onCheckedChange?.(next, details);
        if (!details.isCanceled && checked === undefined) setChecked(next);
      }}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
