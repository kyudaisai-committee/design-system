"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Defaults initialize once; an uncancelled reset returns to those initial values. */
export function useFormResetValue<T>(
  value: T | undefined,
  defaultValue: T,
  controlRef: RefObject<HTMLElement | null>,
  form?: string,
) {
  const initialValue = useRef(defaultValue);
  const [uncontrolled, setUncontrolled] = useState(() => initialValue.current);
  const controlled = value !== undefined;
  useEffect(() => {
    const control = controlRef.current;
    if (controlled || !control) return;
    const owner = form ? control.ownerDocument.getElementById(form) : control.closest("form");
    if (owner?.tagName !== "FORM") return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) setUncontrolled(initialValue.current);
      });
    };
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [controlled, controlRef, form]);
  return [controlled ? value : uncontrolled, setUncontrolled] as const;
}
