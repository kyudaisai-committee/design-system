import type { ComponentProps } from "react";

import { cn } from "../lib/utils";
import { StatusBadge, type Tone } from "./compositions";
import { SequenceDetails, SequenceMarker, type SequenceEntry } from "./sequence-parts";

export type TimelineEvent = SequenceEntry;

export type TimelineProps = Omit<ComponentProps<"div">, "children"> & {
  label: string;
  /** Rendered in the supplied order. Use unique event IDs, including repeated transitions. */
  events: readonly TimelineEvent[];
  /** One explicit present state; never inferred from event order or timestamps. */
  currentStatus?: { label: string; tone?: Tone };
  emptyMessage?: string;
};

/** An event history. It neither sorts timestamps nor infers current or future states. */
export function Timeline({
  label,
  events,
  currentStatus,
  emptyMessage = "履歴はまだありません。",
  className,
  ...props
}: TimelineProps) {
  return (
    <div {...props} className={cn("ds-sequence", className)} data-slot="timeline">
      {currentStatus && (
        <div
          role="group"
          aria-label="現在の状態"
          className="mb-4"
          data-slot="timeline-current-status"
        >
          <StatusBadge tone={currentStatus.tone}>{currentStatus.label}</StatusBadge>
        </div>
      )}
      {events.length === 0 ? (
        <p className="ds-hint">{emptyMessage}</p>
      ) : (
        <ol className="ds-timeline" aria-label={label} role="list">
          {events.map((event) => (
            <li key={event.id} className="ds-sequence-item" data-tone={event.tone}>
              <SequenceMarker icon={event.icon} />
              <div className="ds-sequence-content">
                <div className="ds-sequence-heading">
                  <span className="ds-sequence-title">{event.title}</span>
                </div>
                <SequenceDetails {...event} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
