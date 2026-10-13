import type { ReactNode } from "react";
import { Circle, type LucideIcon } from "lucide-react";
import type { Tone } from "./compositions";

export type SequenceTimestamp = {
  /** Machine-readable timestamp, including the time zone when a time is supplied. */
  dateTime: string;
  /** Already formatted for the viewer; the component does not infer a time zone. */
  label: string;
};

export type SequenceEntry = {
  id: string;
  title: string;
  description?: ReactNode;
  timestamp?: SequenceTimestamp;
  metadata?: ReactNode;
  actions?: ReactNode;
  tone?: Tone;
  /** Reuse the same semantic icon in progress and history, regardless of stage status. */
  icon?: LucideIcon;
};

export type ProcessStepStatus = "complete" | "current" | "upcoming" | "skipped";

export function SequenceMarker({ icon: Icon = Circle }: { icon?: LucideIcon }) {
  return (
    <span className="ds-sequence-marker" aria-hidden="true">
      <Icon size={18} focusable="false" />
    </span>
  );
}

export function SequenceDetails({
  description,
  timestamp,
  metadata,
  actions,
}: Pick<SequenceEntry, "description" | "timestamp" | "metadata" | "actions">) {
  return (
    <>
      {timestamp && (
        <time className="ds-sequence-time" dateTime={timestamp.dateTime}>
          {timestamp.label}
        </time>
      )}
      {metadata && <div className="ds-sequence-meta">{metadata}</div>}
      {description && (
        <div className="ds-sequence-description">{description}</div>
      )}
      {actions && <div className="ds-sequence-actions">{actions}</div>}
    </>
  );
}
