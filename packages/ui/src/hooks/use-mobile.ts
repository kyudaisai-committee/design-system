"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(width < 48rem)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Keep the JavaScript breakpoint aligned with Tailwind's md breakpoint. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}
