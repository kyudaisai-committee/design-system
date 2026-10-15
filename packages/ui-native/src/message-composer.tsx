import type { ReactNode } from "react";

import { spacing } from "@kyudaisai/tokens/native";
import { useRef } from "react";
import { View } from "react-native";

import { Button, Field, Notice, Text } from "./components";

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
  const lock = useRef(false);
  const inactive = Boolean(
    disabled || readOnlyReason || ["sending", "unknown", "sent"].includes(state),
  );
  const action = mode === "edit" ? "変更を保存" : mode === "reply" ? "返信を送信" : "送信";
  return (
    <View accessibilityLabel="メッセージの作成" style={{ gap: spacing[3] }}>
      <Text>
        {mode === "reply" ? "返信先" : "送信先"}：{target}
      </Text>
      {reference}
      <Field
        label="本文"
        hint="Enterで改行します。送信ボタンで送信してください。"
        value={value}
        multiline
        editable={!inactive}
        onChangeText={onValueChange}
      />
      {attachments.map((file) => (
        <View key={file.id}>
          <Text>
            {file.name}・{file.status}
          </Text>
          {file.reason && <Text>{file.reason}</Text>}
          {onRemoveAttachment && (
            <Button
              title={`${file.name}の添付を外す`}
              variant="ghost"
              disabled={inactive}
              onPress={() => onRemoveAttachment(file.id)}
            />
          )}
        </View>
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
      {state === "sent" && <Text accessibilityLiveRegion="polite">送信済み</Text>}
      {actions}
      <Button
        title={action}
        disabled={inactive || !value.trim() || attachments.some((file) => file.blocked)}
        loading={state === "sending"}
        onPress={async () => {
          if (inactive || lock.current) return;
          lock.current = true;
          try {
            await onSubmit();
          } finally {
            lock.current = false;
          }
        }}
      />
    </View>
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
    <View accessibilityLabel="メンションする相手" style={{ gap: spacing[2] }}>
      {candidates.map((candidate) => (
        <Button
          key={candidate.id}
          title={`${candidate.label}${candidate.context ? `・${candidate.context}` : ""}`}
          variant="outline"
          disabled={disabled}
          onPress={() => onChoose(candidate.id)}
        />
      ))}
    </View>
  );
}
