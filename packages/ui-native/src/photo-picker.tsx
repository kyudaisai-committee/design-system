import { spacing } from "@kyudaisai/tokens/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { Button, Notice, Text } from "./components";

export interface PhotoSelection {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  mimeType?: string;
  fileSize?: number;
}
export interface PhotoPickerProps {
  label: string;
  onPick: (photo: PhotoSelection) => void | Promise<void>;
  onClear?: () => void;
  disabled?: boolean;
  aspect?: [number, number];
}
/** The system owns crop gestures. Originals stay untouched; the host owns returned cache files. */
export function PhotoPicker({
  label,
  onPick,
  onClear,
  disabled,
  aspect = [1, 1],
}: PhotoPickerProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  const unavailable = useRef(disabled);
  unavailable.current = disabled;
  const lock = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function choose(editing: boolean) {
    if (disabled || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      // Image-only system selection requires no broad media-library request.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: editing,
        allowsMultipleSelection: false,
        aspect,
        exif: false,
        base64: false,
      });
      if (!mounted.current || unavailable.current) return;
      if (result.canceled) {
        setMessage("写真の選択を取り消しました。元の選択は保持しています。");
        return;
      }
      const asset = result.assets[0];
      if (!asset?.width || !asset.height) throw new Error("Image size unavailable");
      await onPick(asset);
      if (mounted.current) setMessage("写真を選択しました。内容を確認してから保存してください。");
    } catch {
      if (mounted.current) {
        setFailed(true);
        setMessage("写真を選択できませんでした。もう一度試すか、別の写真を選んでください。");
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[3] }}>
      <Text variant="label">{label}</Text>
      <Text>
        写真を選ぶと端末の切り抜き画面が開きます。iPhone・iPadでは正方形になります。元の写真は変更しません。
      </Text>
      <Button
        title="写真を選んで切り抜く"
        loading={busy}
        disabled={disabled}
        onPress={() => void choose(true)}
      />
      <Button
        title="編集せずに写真を選ぶ"
        variant="outline"
        disabled={disabled || busy}
        onPress={() => void choose(false)}
      />
      {onClear && (
        <Button
          title="写真の選択を解除"
          variant="outline"
          disabled={disabled || busy}
          onPress={onClear}
        />
      )}
      {message && (
        <Notice
          title={failed ? "写真を選択できませんでした" : "写真の選択"}
          tone={failed ? "danger" : "info"}
        >
          {message}
        </Notice>
      )}
    </View>
  );
}
