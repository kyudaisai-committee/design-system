"use client";

import { useRef } from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { mergeClassName } from "../lib/utils";
import { CheckIcon, MinusIcon } from "lucide-react";

function Checkbox({
  className,
  checked,
  defaultChecked,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props) {
  // Preserve in-progress edits when a parent receives new server defaults.
  const initialDefault = useRef(defaultChecked);
  const isControlled = checked !== undefined;
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={mergeClassName(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-3 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary",
        className,
      )}
      indeterminate={indeterminate}
      {...(isControlled
        ? { checked }
        : { defaultChecked: initialDefault.current })}
      {...props}
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
