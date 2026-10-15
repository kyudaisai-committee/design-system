"use client";
import type { IScannerControls } from "@zxing/browser";

import { useEffect, useRef, useState } from "react";

import { Button } from "./button";
import { Notice } from "./compositions";

export interface QrScannerProps {
  label: string;
  onRead: (payload: string) => void | Promise<void>;
  active?: boolean;
  disabled?: boolean;
}
/** Read payloads go directly to the host; never render or log a ticket credential. */
export function QrScanner({ label, onRead, active = true, disabled }: QrScannerProps) {
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | undefined>(undefined);
  const epoch = useRef(0);
  const mounted = useRef(true);
  const busy = useRef(false);
  const [running, setRunning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const [status, setStatus] = useState("カメラを開始するとQRコードを読み取れます。");
  const callback = useRef(onRead);
  callback.current = onRead;
  function stop() {
    epoch.current++;
    controls.current?.stop();
    controls.current = undefined;
    const stream = video.current?.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    if (video.current) video.current.srcObject = null;
    busy.current = false;
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!active || disabled) {
      stop();
      setRunning(false);
    }
    const onHide = () => {
      if (document.hidden) {
        stop();
        setRunning(false);
        setStatus("カメラを停止しました。再開するには開始ボタンを押してください。");
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [active, disabled]);
  async function start() {
    if (!active || disabled || busy.current || processingRef.current || !video.current) return;
    stop();
    busy.current = true;
    const token = epoch.current;
    setRunning(true);
    setStatus("カメラの起動を待っています。");
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      if (token !== epoch.current || !video.current) return;
      let read = false;
      const next = await new BrowserQRCodeReader().decodeFromConstraints(
        { audio: false, video: { facingMode: "environment" } },
        video.current,
        (result, _error, scanner) => {
          if (token !== epoch.current || read || !result) return;
          read = true;
          scanner.stop();
          stop();
          setRunning(false);
          setStatus("読み取りました。確認結果をお待ちください。");
          processingRef.current = true;
          setProcessing(true);
          const readEpoch = epoch.current;
          void Promise.resolve()
            .then(() => callback.current(result.getText()))
            .catch(() => {
              if (readEpoch === epoch.current)
                setStatus("確認できませんでした。受付状況を確認してください。");
            })
            .finally(() => {
              processingRef.current = false;
              if (mounted.current) setProcessing(false);
            });
        },
      );
      if (token !== epoch.current) next.stop();
      else {
        controls.current = next;
        setStatus("QRコードをカメラの枠に合わせてください。");
      }
    } catch {
      if (token === epoch.current) {
        stop();
        setRunning(false);
        setStatus("カメラを利用できません。ブラウザーのカメラ許可と接続環境を確認してください。");
      }
    }
  }
  return (
    <section aria-label={label} className="ds-stack">
      <video
        ref={video}
        aria-label="QRコードのカメラ"
        muted
        playsInline
        className="ds-scanner-video"
      />
      <Notice title={label}>{status}</Notice>
      <div className="ds-actions">
        <Button
          type="button"
          disabled={!active || disabled || running || processing}
          onClick={() => void start()}
        >
          カメラを開始
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!running}
          onClick={() => {
            stop();
            setRunning(false);
            setStatus("カメラを停止しました。");
          }}
        >
          停止
        </Button>
      </div>
    </section>
  );
}
