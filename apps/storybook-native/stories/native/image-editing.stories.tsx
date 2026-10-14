import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, Card, ChoiceGroup, Notice, Text, useNativeTheme } from "@kyudaisai/ui-native";
import Slider from "@react-native-community/slider";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { AppState, Image as RNImage, View } from "react-native";

import { cropRectangle, outputDimensions } from "./image-geometry";

type Picture = { uri: string; width: number; height: number };
const ratios = [
  { label: "正方形 1:1", value: "1" },
  { label: "写真 4:3", value: String(4 / 3) },
  { label: "横長 16:9", value: String(16 / 9) },
];

function ImageEditing({ initialError = false }: { initialError?: boolean }) {
  const { colors } = useNativeTheme();
  const [source, setSource] = useState<Picture>();
  const [result, setResult] = useState<Picture>();
  const [ratio, setRatio] = useState(String(4 / 3));
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0.5);
  const [y, setY] = useState(0.5);
  const [previewWidth, setPreviewWidth] = useState(280);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    initialError ? "写真を編集できませんでした。元の写真を選び直してください。" : "",
  );
  const [failed, setFailed] = useState(initialError);
  const ownedFiles = useRef(new Set<string>());
  const active = useRef(true);
  const locked = useRef(false);
  function cleanFiles() {
    for (const uri of ownedFiles.current) {
      try {
        new File(uri).delete();
      } catch {
        /* Cache may already be removed. */
      }
    }
    ownedFiles.current.clear();
  }
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      if (!locked.current) cleanFiles();
    };
  }, []);
  const crop = source ? cropRectangle({ ...source, ratio: Number(ratio), zoom, x, y }) : undefined;
  const dimensions = crop ? outputDimensions(crop) : undefined;
  const scale = crop ? previewWidth / crop.width : 1;

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await action();
    } catch {
      if (active.current) {
        setFailed(true);
        setMessage("写真を処理できませんでした。もう一度試すか、別の写真を選んでください。");
      }
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
      else cleanFiles();
    }
  }
  function select(picture: Picture) {
    setSource(picture);
    setResult(undefined);
    setZoom(1);
    setX(0.5);
    setY(0.5);
  }
  async function pick() {
    // The system photo picker needs no broad library access.
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      exif: false,
    });
    if (!active.current) return;
    if (picked.canceled) {
      setMessage("写真の選択を取り消しました。");
      return;
    }
    const picture = picked.assets[0];
    if (!picture.width || !picture.height) throw new Error("Image dimensions are unavailable");
    select(picture);
  }
  async function sample() {
    const asset = Asset.fromModule(require("../../assets/crop-sample.png"));
    await asset.downloadAsync();
    if (active.current) select({ uri: asset.localUri ?? asset.uri, width: 1600, height: 1200 });
  }
  async function apply() {
    if (!source || !crop || !dimensions) return;
    const context = ImageManipulator.manipulate(source.uri);
    let rendered: Awaited<ReturnType<typeof context.renderAsync>> | undefined;
    try {
      rendered = await context.crop(crop).resize({ width: dimensions.width }).renderAsync();
      const next = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
      if (!active.current) {
        try {
          new File(next.uri).delete();
        } catch {}
        return;
      }
      ownedFiles.current.add(next.uri);
      setResult(next);
      setMessage("切り抜いた画像を作成しました。元の写真は変更していません。");
    } finally {
      rendered?.release();
      context.release();
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <Text variant="heading">写真の比率と範囲を揃える</Text>
      <Text>
        写真を選び、残したい範囲と仕上がりの比率を調整します。出力は横幅1280px以内のJPEGです。
      </Text>
      <Button title="写真を選ぶ" disabled={busy} onPress={() => run(pick)} />
      <Button
        title="見本画像で試す"
        variant="outline"
        disabled={busy}
        onPress={() => run(sample)}
      />
      {source && crop ? (
        <>
          <ChoiceGroup
            label="仕上がりの比率"
            value={ratio}
            options={ratios}
            disabled={busy}
            onValueChange={(value) => {
              if (locked.current) return;
              setRatio(value);
              setResult(undefined);
            }}
          />
          <View
            accessible
            accessibilityLabel="切り抜く範囲のプレビュー"
            onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}
            style={{
              width: "100%",
              aspectRatio: crop.width / crop.height,
              overflow: "hidden",
              backgroundColor: colors.muted,
              borderWidth: 1,
              borderColor: colors.input,
            }}
          >
            <RNImage
              source={{ uri: source.uri }}
              accessibilityIgnoresInvertColors
              style={{
                position: "absolute",
                width: source.width * scale,
                height: source.height * scale,
                left: -crop.originX * scale,
                top: -crop.originY * scale,
              }}
            />
          </View>
          {[
            { label: "拡大", value: zoom, min: 1, max: 3, update: setZoom },
            { label: "左右の位置", value: x, min: 0, max: 1, update: setX },
            { label: "上下の位置", value: y, min: 0, max: 1, update: setY },
          ].map((control) => (
            <View key={control.label}>
              <Text variant="label">{control.label}</Text>
              <Slider
                accessibilityLabel={control.label}
                accessibilityValue={{ min: control.min, max: control.max, now: control.value }}
                minimumValue={control.min}
                maximumValue={control.max}
                step={0.01}
                value={control.value}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.input}
                thumbTintColor={colors.primary}
                disabled={busy}
                onValueChange={(value) => {
                  control.update(value);
                  setResult(undefined);
                }}
              />
            </View>
          ))}
          <Text tone="muted">
            出力サイズ：{dimensions?.width} × {dimensions?.height}px
          </Text>
          <Button title="この範囲で切り抜く" loading={busy} onPress={() => run(apply)} />
        </>
      ) : null}
      {message ? (
        <Notice
          tone={failed ? "danger" : "info"}
          title={failed ? "編集できませんでした" : "編集の状態"}
        >
          {message}
        </Notice>
      ) : null}
      {result ? (
        <Card title="仕上がり">
          <RNImage
            accessibilityLabel="編集後の画像"
            source={{ uri: result.uri }}
            style={{ width: "100%", aspectRatio: result.width / result.height }}
          />
          <Text>
            {result.width} × {result.height}px・JPEG
          </Text>
          <Button
            title="画像を書き出す"
            variant="outline"
            disabled={busy}
            onPress={() =>
              run(async () => {
                const available = await Sharing.isAvailableAsync();
                if (!active.current) return;
                if (!available) {
                  setMessage("この端末では共有シートを利用できません。");
                  return;
                }
                if (AppState.currentState !== "active") return;
                await Sharing.shareAsync(result.uri, {
                  mimeType: "image/jpeg",
                  dialogTitle: "編集した画像を書き出す",
                });
                if (active.current)
                  setMessage("共有画面を閉じました。書き出し先で画像を確認してください。");
              })
            }
          />
        </Card>
      ) : null}
    </View>
  );
}

function SystemCropper() {
  const [uri, setUri] = useState<string>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return (
    <View style={{ gap: 16 }}>
      <Text variant="heading">OSの写真編集</Text>
      <Text>端末標準の編集画面で切り抜きます。iOSは正方形、Androidは4:3の範囲を指定します。</Text>
      <Button
        title="写真を選んで編集"
        loading={busy}
        onPress={async () => {
          if (locked.current) return;
          locked.current = true;
          setBusy(true);
          try {
            const picked = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              exif: false,
            });
            if (!active.current) return;
            if (picked.canceled) setMessage("編集を取り消しました。");
            else {
              setUri(picked.assets[0].uri);
              setMessage("編集後の写真を選択しました。");
            }
          } catch {
            if (active.current) setMessage("写真を開けませんでした。もう一度お試しください。");
          } finally {
            locked.current = false;
            if (active.current) setBusy(false);
          }
        }}
      />
      {message ? <Text>{message}</Text> : null}
      {uri ? (
        <RNImage
          source={{ uri }}
          accessibilityLabel="OSで編集した写真"
          style={{ height: 240, width: "100%" }}
          resizeMode="contain"
        />
      ) : null}
    </View>
  );
}
const meta = {
  title: "Native/ImageEditing",
  render: () => <ImageEditing />,
  parameters: {
    notes:
      "1:1・4:3・16:9の切り抜き範囲を調整します。選択した画像は端末内で処理し、元画像を上書きしません。",
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const AspectRatioEditor: Story = {};
export const EditingFailure: Story = { render: () => <ImageEditing initialError /> };
export const NativeCropper: Story = { render: () => <SystemCropper /> };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
