import { radii, spacing } from "@kyudaisai/tokens/native";
import { safeImage, type ImageAsset, type MediaState } from "@kyudaisai/ui-models";
import { useEffect, useRef, useState } from "react";
import { Image, Modal, ScrollView, View, type ViewInstance } from "react-native";

import { Button, EmptyState, Text } from "./components";
import { useNativeTheme } from "./theme";

export type { ImageAsset, MediaState } from "@kyudaisai/ui-models";
export interface PublicImageProps {
  asset: ImageAsset;
  onRetry?: () => void;
  resolveSource?: (asset: ImageAsset) => string | undefined;
}
export function PublicImage(props: PublicImageProps) {
  return (
    <ImageContent
      key={`${props.asset.id}:${props.asset.src}:${props.asset.expiresAt}`}
      {...props}
    />
  );
}
function ImageContent({ asset, onRetry, resolveSource }: PublicImageProps) {
  const { colors } = useNativeTheme();
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (asset.expiresAt === undefined || asset.expiresAt <= now) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2147483647, Math.max(0, asset.expiresAt - Date.now())),
    );
    return () => clearTimeout(timer);
  }, [asset.expiresAt, now]);
  const src = resolveSource ? resolveSource(asset) : asset.src && safeImage(asset.src);
  const state: MediaState =
    asset.expiresAt !== undefined && asset.expiresAt <= now
      ? "unavailable"
      : asset.state && asset.state !== "ready"
        ? asset.state
        : failed || !src
          ? "error"
          : "ready";
  const labels = {
    loading: "画像を読み込んでいます",
    error: "画像を表示できませんでした",
    unavailable: "この画像は現在閲覧できません",
  };
  return (
    <View style={{ gap: spacing[2], backgroundColor: colors.card, borderRadius: radii.md }}>
      {state === "ready" && src ? (
        <>
          {!loaded && <Text accessibilityLiveRegion="polite">{labels.loading}</Text>}
          <Image
            source={{ uri: src }}
            accessibilityLabel={asset.alt}
            accessibilityRole="image"
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            style={{
              width: "100%",
              aspectRatio: asset.width && asset.height ? asset.width / asset.height : 4 / 3,
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <View>
          <Text accessibilityLiveRegion="polite">
            {labels[state as Exclude<MediaState, "ready">]}
          </Text>
          {state === "error" && onRetry && (
            <Button
              title="再読み込み"
              variant="outline"
              onPress={() => {
                setFailed(false);
                onRetry();
              }}
            />
          )}
        </View>
      )}
      {asset.caption && state !== "unavailable" && <Text variant="caption">{asset.caption}</Text>}
    </View>
  );
}
export interface ImageGalleryProps {
  label: string;
  assets: readonly ImageAsset[];
  scopeLabel?: string;
  resolveSource?: PublicImageProps["resolveSource"];
}
export function ImageGallery({ label, assets, scopeLabel, resolveSource }: ImageGalleryProps) {
  const [now, setNow] = useState(Date.now);
  const deadline = Math.min(
    ...assets.map((asset) => asset.expiresAt ?? Infinity).filter((expiry) => expiry > now),
  );
  useEffect(() => {
    if (!Number.isFinite(deadline)) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2147483647, Math.max(0, deadline - Date.now())),
    );
    return () => clearTimeout(timer);
  }, [deadline, now]);
  const available = (asset: ImageAsset) =>
    asset.state !== "unavailable" && (asset.expiresAt === undefined || asset.expiresAt > now);
  const { colors } = useNativeTheme();
  const [selected, setSelected] = useState<string>();
  const closeButton = useRef<ViewInstance>(null);
  const asset = assets.find((item) => item.id === selected && available(item));
  useEffect(() => {
    if (selected && !asset) setSelected(undefined);
  }, [selected, asset]);
  if (!assets.length) return <EmptyState title="写真がありません" />;
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[4] }}>
      <Text>
        {assets.length}枚{scopeLabel ? `・${scopeLabel}` : ""}
      </Text>
      {assets.map((item) => (
        <View key={item.id} style={{ gap: spacing[2] }}>
          <PublicImage asset={item} resolveSource={resolveSource} />
          {available(item) && (
            <Button
              title={`${item.alt}を拡大`}
              variant="outline"
              onPress={() => setSelected(item.id)}
            />
          )}
        </View>
      ))}
      <Modal
        visible={Boolean(asset)}
        animationType="none"
        onRequestClose={() => setSelected(undefined)}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing[6],
            paddingTop: spacing[12],
            gap: spacing[4],
            backgroundColor: colors.background,
            flexGrow: 1,
          }}
          accessibilityViewIsModal
        >
          <View ref={closeButton}>
            <Button title="閉じる" onPress={() => setSelected(undefined)} />
          </View>
          {asset && (
            <>
              <Text variant="heading" accessibilityRole="header">
                {asset.alt}
              </Text>
              <PublicImage asset={asset} resolveSource={resolveSource} />
            </>
          )}
        </ScrollView>
      </Modal>
    </View>
  );
}
