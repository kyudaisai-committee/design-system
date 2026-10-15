import { spacing } from "@kyudaisai/tokens/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { AppState, Linking, View } from "react-native";

import { Button, Notice } from "./components";

export interface QrScannerProps {
  label: string;
  onRead: (payload: string) => void | Promise<void>;
  active?: boolean;
  disabled?: boolean;
}
export function QrScanner({ label, onRead, active = true, disabled }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [running, setRunning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const [status, setStatus] = useState("カメラを開始するとQRコードを読み取れます。");
  const epoch = useRef(0);
  const mounted = useRef(true);
  const read = useRef(false);
  const requesting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const generation = epoch;
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state !== "active") {
        epoch.current++;
        read.current = true;
        setRunning(false);
      }
    });
    return () => {
      mounted.current = false;
      generation.current++;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (!active || disabled) {
      epoch.current++;
      read.current = true;
      setRunning(false);
    }
  }, [active, disabled]);
  async function start() {
    if (!active || disabled || requesting.current || processingRef.current || !foreground) return;
    requesting.current = true;
    const token = ++epoch.current;
    try {
      const next = permission?.granted ? permission : await requestPermission();
      if (token !== epoch.current) return;
      if (!next.granted) {
        setStatus("カメラが許可されていません。端末の設定で許可を変更できます。");
        return;
      }
      read.current = false;
      setRunning(true);
      setStatus("QRコードをカメラの枠に合わせてください。");
    } catch {
      if (token === epoch.current) setStatus("カメラを開けませんでした。もう一度お試しください。");
    } finally {
      requesting.current = false;
    }
  }
  return (
    <View accessibilityLabel={label} style={{ gap: spacing[3] }}>
      {running && foreground && active && !disabled && (
        <CameraView
          style={{ width: "100%", aspectRatio: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onMountError={() => {
            read.current = true;
            setRunning(false);
            setStatus("カメラを開けませんでした。もう一度お試しください。");
          }}
          onBarcodeScanned={({ data }) => {
            if (read.current || !active || disabled || !foreground) return;
            read.current = true;
            setRunning(false);
            setStatus("読み取りました。確認結果をお待ちください。");
            processingRef.current = true;
            setProcessing(true);
            const readEpoch = epoch.current;
            void Promise.resolve()
              .then(() => onRead(data))
              .catch(() => {
                if (readEpoch === epoch.current)
                  setStatus("確認できませんでした。受付状況を確認してください。");
              })
              .finally(() => {
                processingRef.current = false;
                if (mounted.current) setProcessing(false);
              });
          }}
        />
      )}
      <Notice title={label}>{status}</Notice>
      <Button
        title="カメラを開始"
        disabled={!active || disabled || running || processing || !foreground}
        onPress={() => void start()}
      />
      {permission && !permission.granted && !permission.canAskAgain && (
        <Button
          title="端末の設定を開く"
          variant="outline"
          onPress={() =>
            void Linking.openSettings().catch(() =>
              setStatus("端末の設定からカメラの許可を変更してください。"),
            )
          }
        />
      )}
      <Button
        title="停止"
        variant="outline"
        disabled={!running}
        onPress={() => {
          epoch.current++;
          read.current = true;
          setRunning(false);
          setStatus("カメラを停止しました。");
        }}
      />
    </View>
  );
}
