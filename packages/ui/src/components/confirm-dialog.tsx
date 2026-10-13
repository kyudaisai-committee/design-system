"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState, type ReactNode } from "react";
import { Notice as Alert } from "./compositions";
import { Button } from "./button";

/** Only closes after the operation succeeds. Errors preserve context and allow retry. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel = "処理中…",
  errorMessage = "処理できませんでした。時間をおいて、もう一度お試しください。",
  onConfirm,
  destructive = false,
}: {
  trigger: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  errorMessage?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function confirm() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (pending) {
          details.cancel();
          return;
        }
        setOpen(next);
        if (next) setFailed(false);
      }}
    >
      <AlertDialog.Trigger
        render={<Button variant={destructive ? "destructive" : "default"} />}
      >
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="ds-backdrop" />
        <AlertDialog.Popup className="ds-dialog">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description render={<div />}>
            {description}
          </AlertDialog.Description>
          {failed && <Alert title={errorMessage} tone="danger" role="alert" />}
          <div className="ds-dialog-actions">
            <AlertDialog.Close
              render={<Button variant="outline" disabled={pending} />}
            >
              キャンセル
            </AlertDialog.Close>
            <Button
              variant={destructive ? "destructive" : "default"}
              pending={pending}
              focusableWhenDisabled
              onClick={confirm}
            >
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
