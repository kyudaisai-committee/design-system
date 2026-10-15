"use client";
import type { ReactNode } from "react";

import { useRef } from "react";

import { Button } from "./button";
import { Field, Notice } from "./compositions";
import { Textarea } from "./textarea";

export interface ComposerAttachment {
  id: string;
  name: string;
  status: string;
  blocked?: boolean;
  reason?: string;
}
export interface MessageComposerProps {
  target: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  state?: "idle" | "sending" | "failed" | "unknown" | "sent";
  error?: string;
  disabled?: boolean;
  readOnlyReason?: string;
  actions?: ReactNode;
  reference?: ReactNode;
  attachments?: readonly ComposerAttachment[];
  onRemoveAttachment?: (id: string) => void;
  mode?: "post" | "reply" | "edit";
}
export function MessageComposer({
  target,
  value,
  onValueChange,
  onSubmit,
  state = "idle",
  error,
  disabled,
  readOnlyReason,
  actions,
  reference,
  attachments = [],
  onRemoveAttachment,
  mode = "post",
}: MessageComposerProps) {
  const composing = useRef(false);
  const lock = useRef(false);
  const inactive = Boolean(
    disabled || readOnlyReason || ["sending", "unknown", "sent"].includes(state),
  );
  const action = mode === "edit" ? "変更を保存" : mode === "reply" ? "返信を送信" : "送信";
  return (
    <section aria-label="メッセージの作成" className="ds-stack">
      <p>
        {mode === "reply" ? "返信先" : "送信先"}：{target}
      </p>
      {reference}
      <Field label="本文" hint="Enterで改行します。送信ボタンで送信してください。">
        {(attrs) => (
          <Textarea
            {...attrs}
            value={value}
            readOnly={inactive}
            onChange={(event) => onValueChange(event.target.value)}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
          />
        )}
      </Field>
      {attachments.map((file) => (
        <div key={file.id}>
          <p>
            {file.name}・{file.status}
          </p>
          {file.reason && <p>{file.reason}</p>}
          {onRemoveAttachment && (
            <Button
              type="button"
              variant="ghost"
              disabled={inactive}
              onClick={() => onRemoveAttachment(file.id)}
            >
              {file.name}の添付を外す
            </Button>
          )}
        </div>
      ))}
      {state === "failed" && (
        <Notice tone="danger" title="送信できませんでした">
          {error ?? "入力内容を確認して、もう一度送信してください。"}
        </Notice>
      )}
      {state === "unknown" && (
        <Notice title="送信結果を確認しています">
          結果が分かるまで、この内容の再送信をお待ちください。
        </Notice>
      )}
      {readOnlyReason && <Notice title="現在は送信できません">{readOnlyReason}</Notice>}
      {state === "sent" && <p role="status">送信済み</p>}
      <div className="ds-actions">
        {actions}
        <Button
          type="button"
          disabled={inactive || !value.trim() || attachments.some((file) => file.blocked)}
          pending={state === "sending"}
          onClick={async () => {
            if (inactive || composing.current || lock.current) return;
            lock.current = true;
            try {
              await onSubmit();
            } finally {
              lock.current = false;
            }
          }}
        >
          {action}
        </Button>
      </div>
    </section>
  );
}
export function MentionPicker({
  candidates,
  onChoose,
  disabled,
}: {
  candidates: readonly { id: string; label: string; context?: string }[];
  onChoose: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <ul className="ds-stack" aria-label="メンションする相手">
      {candidates.map((candidate) => (
        <li key={candidate.id}>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onChoose(candidate.id)}
          >
            {candidate.label}
            {candidate.context ? `・${candidate.context}` : ""}
          </Button>
        </li>
      ))}
    </ul>
  );
}
