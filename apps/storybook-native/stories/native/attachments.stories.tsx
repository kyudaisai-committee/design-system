import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, Card, Notice, Text } from "@kyudaisai/ui-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { AppState, Image, View } from "react-native";

import { useMountedRef } from "./use-mounted";

type SelectedFile = { uri: string; name: string; size?: number; image?: boolean };
function NativeAttachment({ initial = "" }: { initial?: string }) {
  const [file, setFile] = useState<SelectedFile>();
  const [message, setMessage] = useState(initial);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useMountedRef();
  const temporary = useRef(new Set<string>());
  function cleanFiles() {
    for (const uri of temporary.current) {
      try {
        new File(uri).delete();
      } catch {
        /* Cache eviction may have removed it. */
      }
    }
    temporary.current.clear();
  }
  useEffect(
    () => () => {
      if (!locked.current) cleanFiles();
    },
    [],
  );
  const canOpen = () => mounted.current && AppState.currentState === "active";
  async function perform(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    try {
      await action();
    } catch {
      if (mounted.current) setMessage("ファイルを開けませんでした。もう一度選んでください。");
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
      else cleanFiles();
    }
  }
  function selectPhoto(result: ImagePicker.ImagePickerResult) {
    if (!mounted.current) return;
    if (result.canceled) {
      setMessage("写真の選択を取り消しました。");
      return;
    }
    const item = result.assets[0];
    setFile({
      uri: item.uri,
      name: item.fileName ?? "選択した写真",
      size: item.fileSize,
      image: true,
    });
    setMessage("写真を選択しました。送信はまだ行っていません。");
  }
  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!mounted.current) return;
    if (!permission.granted) {
      setMessage("カメラが許可されていません。写真や文書の選択でも添付できます。");
      return;
    }
    if (!canOpen()) {
      setMessage("カメラを使用できます。画面に戻ってから、もう一度撮影を選んでください。");
      return;
    }
    selectPhoto(await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], exif: false }));
  }
  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "text/plain"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) {
      if (mounted.current) setMessage("文書の選択を取り消しました。");
      return;
    }
    const item = result.assets[0];
    temporary.current.add(item.uri);
    if (!mounted.current) return;
    setFile({ uri: item.uri, name: item.name, size: item.size });
    setMessage("文書を選択しました。送信はまだ行っていません。");
  }
  async function shareFile() {
    if (!file) return;
    const available = await Sharing.isAvailableAsync();
    if (!mounted.current) return;
    if (!available) {
      setMessage("この端末では共有シートを利用できません。");
      return;
    }
    if (!canOpen()) {
      setMessage("画面に戻ってから、もう一度共有を選んでください。");
      return;
    }
    await Sharing.shareAsync(file.uri);
    if (mounted.current) setMessage("共有画面を閉じました。共有先で結果を確認してください。");
  }
  return (
    <View style={{ gap: 16 }}>
      <Text variant="heading">写真・文書を添付する</Text>
      <Text>
        選択した内容を確認してから送信します。この見本はファイルをサーバーへ送信しません。
      </Text>
      <Button
        title="写真を選ぶ"
        disabled={busy}
        onPress={() =>
          perform(async () =>
            selectPhoto(
              await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], exif: false }),
            ),
          )
        }
      />
      <Button
        title="写真を撮る"
        variant="outline"
        disabled={busy}
        onPress={() => perform(takePhoto)}
      />
      <Button
        title="文書を選ぶ"
        variant="outline"
        disabled={busy}
        onPress={() => perform(pickDocument)}
      />
      {message ? (
        <Notice tone="info" title="選択の状態">
          {message}
        </Notice>
      ) : null}
      {file ? (
        <Card title="選択したファイル">
          <Text>{file.name}</Text>
          {file.size !== undefined ? (
            <Text tone="muted">{Math.ceil(file.size / 1024)}KB</Text>
          ) : null}
          {file.image ? (
            <Image
              source={{ uri: file.uri }}
              accessibilityLabel="選択した写真"
              resizeMode="contain"
              style={{ width: "100%", height: 220 }}
            />
          ) : null}
          <Button
            title="共有画面を開く"
            variant="outline"
            disabled={busy}
            onPress={() => perform(shareFile)}
          />
          <Button
            title="選択を取り消す"
            variant="ghost"
            disabled={busy}
            onPress={() => {
              setFile(undefined);
              setMessage("選択を取り消しました。");
              cleanFiles();
            }}
          />
        </Card>
      ) : null}
    </View>
  );
}
const meta = { title: "Native/Attachments", render: () => <NativeAttachment /> } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const PickAndShare: Story = {};
export const Cancelled: Story = {
  render: () => <NativeAttachment initial="選択を取り消しました。入力内容は保持しています。" />,
};
export const PermissionDenied: Story = {
  render: () => (
    <NativeAttachment initial="カメラが許可されていません。写真や文書の選択でも添付できます。" />
  ),
};
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
