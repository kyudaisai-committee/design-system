"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { useImperativeHandle, useRef } from "react";

import { useFormResetValue } from "../hooks/use-form-reset";
import { mergeClassName } from "../lib/utils";

function Switch({
  className,
  size = "default",
  checked,
  defaultChecked,
  onCheckedChange,
  ref,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  const controlRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => controlRef.current!);
  const [currentChecked, setChecked] = useFormResetValue(
    checked,
    defaultChecked ?? false,
    controlRef,
    props.form,
  );
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={mergeClassName(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:left-1/2 after:top-1/2 after:min-h-11 after:min-w-11 after:w-full after:-translate-x-1/2 after:-translate-y-1/2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
      ref={controlRef}
      checked={currentChecked}
      onCheckedChange={(next, details) => {
        onCheckedChange?.(next, details);
        if (!details.isCanceled && checked === undefined) setChecked(next);
      }}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
