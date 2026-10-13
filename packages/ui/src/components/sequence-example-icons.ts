import {
  ClipboardList,
  Send,
  ClipboardCheck,
  Flag,
  CircleCheck,
  RotateCcw,
  CircleX,
} from "lucide-react";

// Application examples only. Consumers own the mapping from their domain to icons.
// Both progress and history stories use this single definition.
export const applicationSequenceIcons = {
  assigned: ClipboardList,
  submitted: Send,
  review: ClipboardCheck,
  decision: Flag,
  approved: CircleCheck,
  returned: RotateCcw,
  rejected: CircleX,
} as const;
