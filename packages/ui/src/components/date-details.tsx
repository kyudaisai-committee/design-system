import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export type DateDetail = {
  id: string;
  /** Caller-provided meaning, such as a deadline, an estimate, or an actual date. */
  label: string;
  /** Formatted date or explicit text such as "未定". */
  value: string;
  /** Omit for unknown dates. Include a time-zone offset when supplying a time. */
  dateTime?: string;
  /** Emphasize this value without inferring its business meaning. */
  emphasis?: boolean;
  /** Short, caller-provided context shown beside the value, outside the time element. */
  note?: string;
};

export type DateDetailsProps = Omit<ComponentProps<"dl">, "children"> & {
  items: readonly DateDetail[];
};

/** Labeled dates; formatting, deadline checks, and business state belong to the caller. */
export function DateDetails({ items, className, ...props }: DateDetailsProps) {
  if (items.length === 0) return null;

  return (
    <dl {...props} className={cn("ds-date-details", className)}>
      {items.map((item) => {
        const value = item.dateTime ? (
          <time dateTime={item.dateTime}>{item.value}</time>
        ) : (
          item.value
        );

        return (
          <div key={item.id}>
            <dt>{item.label}</dt>
            <dd>
              {item.emphasis ? (
                <strong className="ds-date-value">{value}</strong>
              ) : (
                <span className="ds-date-value">{value}</span>
              )}
              {item.note && <span className="ds-date-note">{item.note}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
