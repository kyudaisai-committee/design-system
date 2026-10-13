import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Merge owned styles without discarding Base UI's state-based className API. */
export function mergeClassName<State>(
  base: string,
  override: string | ((state: State) => string | undefined) | undefined,
): string | ((state: State) => string) {
  return typeof override === "function"
    ? (state) => cn(base, override(state))
    : cn(base, override);
}
