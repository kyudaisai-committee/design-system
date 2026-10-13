import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import {
  SequenceDetails,
  SequenceMarker,
  type ProcessStepStatus,
  type SequenceEntry,
} from "./sequence-parts";

export type { ProcessStepStatus } from "./sequence-parts";

export type ProcessStep = SequenceEntry & {
  /** Explicit state: array position never implies completion. Use at most one current step. */
  status: ProcessStepStatus;
  /** Visible business wording, e.g. "要修正" or "却下". */
  statusLabel?: string;
};

export type ProcessStepsProps = Omit<ComponentProps<"div">, "children"> & {
  label: string;
  steps: readonly ProcessStep[];
  /** Horizontal layouts become vertical inside narrow containers. */
  orientation?: "horizontal" | "vertical";
  emptyMessage?: string;
};

const statusLabels: Record<ProcessStepStatus, string> = {
  complete: "完了",
  current: "進行中",
  upcoming: "未着手",
  skipped: "対象外",
};

/** A read-only snapshot of ordered stages. Transitions and permissions belong to the caller. */
export function ProcessSteps({
  label,
  steps,
  orientation = "horizontal",
  emptyMessage = "表示する段階がありません。",
  className,
  ...props
}: ProcessStepsProps) {
  return (
    <div
      {...props}
      className={cn("ds-sequence", className)}
      data-slot="process-steps"
      data-orientation={orientation}
    >
      {steps.length === 0 ? (
        <p className="ds-hint">{emptyMessage}</p>
      ) : (
        <ol className="ds-process-steps" aria-label={label} role="list">
          {steps.map((step) => (
            <li
              key={step.id}
              className="ds-sequence-item"
              data-status={step.status}
              data-tone={step.tone}
              aria-current={step.status === "current" ? "step" : undefined}
            >
              <SequenceMarker icon={step.icon} />
              <div className="ds-sequence-content">
                <div className="ds-sequence-heading">
                  <span className="ds-sequence-title">{step.title}</span>
                </div>
                <span className="ds-sequence-status">
                  {step.statusLabel ?? statusLabels[step.status]}
                </span>
                {step.status === "current" && (
                  <span className="ds-sr-only">現在の段階</span>
                )}
                <SequenceDetails {...step} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
