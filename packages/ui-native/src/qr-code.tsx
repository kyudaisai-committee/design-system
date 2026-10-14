import { radii, spacing } from "@kyudaisai/tokens/native";
import { useState, type ReactNode } from "react";
import {
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";

import { Button, Card, Text } from "./components";
import { useNativeTheme } from "./theme";

export interface QrCodeProps {
  /** Square image including an opaque white background and four-module quiet zone. */
  source?: ImageSourcePropType;
  /** Required accessible name for the QR image. */
  label: string;
  /** Optional visible purpose heading. Omit when the surrounding screen already explains it. */
  title?: string;
  /** Optional presentation or reading instruction. No default copy. */
  description?: string;
  variant?: "plain" | "card" | "compact";
  state?: "ready" | "loading" | "error" | "unavailable";
  message?: string;
  details?: ReactNode;
  actions?: ReactNode;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

export function QrCode(props: QrCodeProps) {
  return <QrCodeContent key={`${JSON.stringify(props.source)}:${props.state}`} {...props} />;
}

function QrCodeContent({
  source,
  label,
  title,
  description,
  variant = "card",
  state = "ready",
  message,
  details,
  actions,
  onRetry,
  retryDisabled,
}: QrCodeProps) {
  const { colors } = useNativeTheme();
  const { width, fontScale } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(width);
  const resolvedState = state === "ready" && (!source || imageFailed) ? "error" : state;
  const horizontal = variant === "compact" && availableWidth >= 440 && fontScale <= 1.3;
  const size = variant === "compact" ? 160 : variant === "card" ? 248 : 216;
  const statusText = {
    ready: "",
    loading: "QRコードを読み込んでいます",
    error: "QRコードを表示できませんでした",
    unavailable: "このQRコードは利用できません",
  }[resolvedState];

  const heading =
    title || description ? (
      <View style={styles.text}>
        {title ? (
          <Text variant="heading" style={variant === "card" ? styles.headingText : undefined}>
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text
            tone="muted"
            variant="caption"
            style={variant === "card" ? styles.headingText : undefined}
          >
            {description}
          </Text>
        ) : null}
      </View>
    ) : null;
  const visual = (
    <View style={[styles.visual, { width: size, maxWidth: "100%" }]}>
      {resolvedState === "ready" ? (
        <Image
          source={source}
          accessibilityRole="image"
          accessibilityLabel={label}
          accessible
          resizeMode="contain"
          fadeDuration={0}
          onError={() => setImageFailed(true)}
          style={styles.image}
        />
      ) : (
        <View style={[styles.message, { backgroundColor: colors.muted, borderRadius: radii.md }]}>
          <Text accessibilityLiveRegion="polite">{statusText}</Text>
          {message ? (
            <Text tone="muted" variant="caption">
              {message}
            </Text>
          ) : null}
          {resolvedState === "error" && onRetry ? (
            <Button
              title="再読み込み"
              variant="outline"
              disabled={retryDisabled}
              onPress={() => {
                setImageFailed(false);
                onRetry();
              }}
            />
          ) : null}
        </View>
      )}
    </View>
  );
  const supporting =
    details || (resolvedState === "ready" && actions) ? (
      <View style={styles.text}>
        {details}
        {resolvedState === "ready" ? actions : null}
      </View>
    ) : null;
  const contents = horizontal ? (
    <View style={styles.row}>
      {visual}
      {(heading || supporting) && (
        <View style={styles.column}>
          {heading}
          {supporting}
        </View>
      )}
    </View>
  ) : (
    <View style={styles.column}>
      {heading}
      {visual}
      {supporting}
    </View>
  );
  const measure = (
    event: Parameters<NonNullable<React.ComponentProps<typeof View>["onLayout"]>>[0],
  ) => setAvailableWidth(event.nativeEvent.layout.width);

  return variant === "plain" ? (
    <View onLayout={measure} style={styles.root}>
      {contents}
    </View>
  ) : (
    <Card onLayout={measure} style={styles.root}>
      {contents}
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 560, alignSelf: "flex-start" },
  column: { gap: spacing[4], flexShrink: 1, minWidth: 0 },
  row: { flexDirection: "row", gap: spacing[6], alignItems: "center" },
  text: { gap: spacing[2], minWidth: 0 },
  headingText: { textAlign: "center" },
  visual: { alignSelf: "center", flexShrink: 0 },
  image: { width: "100%", aspectRatio: 1, backgroundColor: "#ffffff" },
  message: { minHeight: 216, gap: spacing[3], padding: spacing[4], justifyContent: "center" },
});
