import { useEffect, useState } from "react";

/** Keep previews interactive while accepting changes from Storybook Controls. */
export function useStoryControls<T extends object>(incoming: T) {
  const [args, setArgs] = useState(incoming);
  useEffect(() => setArgs(incoming), [incoming]);
  const updateArgs = (patch: Partial<T>) => {
    setArgs((current) => ({ ...current, ...patch }));
  };
  return [args, updateArgs] as const;
}
