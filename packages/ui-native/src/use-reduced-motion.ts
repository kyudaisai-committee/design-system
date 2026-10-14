import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Stay still until the OS preference is known, including when the query fails. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  const current = useRef(true);
  useEffect(() => {
    let mounted = true;
    let changed = false;
    function update(next: boolean) {
      if (!mounted || current.current === next) return;
      current.current = next;
      setReduced(next);
    }
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (next) => {
      changed = true;
      update(next);
    });
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((next) => {
        if (!changed) update(next);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
