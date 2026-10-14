"use client";

import { useState, type ReactNode } from "react";

import { cn } from "../lib/utils";
import { Button } from "./button";

export interface QrCodeProps {
  /** A square QR image with an opaque white background and four-module quiet zone. */
  src?: string;
  /** Required accessible name for the QR image, also used for the group when title is omitted. */
  label: string;
  /** Optional visible purpose heading. Omit when the surrounding screen already explains it. */
  title?: string;
  /** Optional instruction for the person presenting or reading the code. No default copy. */
  description?: string;
  variant?: "plain" | "card" | "compact";
  state?: "ready" | "loading" | "error" | "unavailable";
  /** Explain the failure or why the code cannot be used. */
  message?: string;
  details?: ReactNode;
  /** Alternate link or operation, shown only while the code is ready. */
  actions?: ReactNode;
  onRetry?: () => void;
  retryDisabled?: boolean;
  className?: string;
}

export function QrCode(props: QrCodeProps) {
  // A different image or state must not inherit the previous image's failure.
  return <QrCodeContent key={`${props.src}:${props.state}`} {...props} />;
}

function QrCodeContent({
  src,
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
  className,
}: QrCodeProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedState = state === "ready" && (!src || imageFailed) ? "error" : state;
  const statusText = {
    ready: "",
    loading: "QRコードを読み込んでいます",
    error: "QRコードを表示できませんでした",
    unavailable: "このQRコードは利用できません",
  }[resolvedState];

  return (
    <div
      role="group"
      className={cn("ds-qr", className)}
      data-variant={variant}
      data-state={resolvedState}
      aria-label={title || label}
      aria-busy={resolvedState === "loading" || undefined}
    >
      <div className="ds-qr-layout">
        {(title || description) && (
          <div className="ds-qr-heading">
            {title && <h3>{title}</h3>}
            {description && <p className="ds-hint">{description}</p>}
          </div>
        )}
        <div className="ds-qr-visual">
          {resolvedState === "ready" ? (
            <img
              src={src}
              alt={label}
              className="ds-qr-image"
              onError={() => setImageFailed(true)}
              draggable={false}
            />
          ) : (
            <div className="ds-qr-message" role="status" aria-live="polite">
              <p>{statusText}</p>
              {message && <p className="ds-hint">{message}</p>}
              {resolvedState === "error" && onRetry && (
                <Button
                  variant="outline"
                  disabled={retryDisabled}
                  onClick={() => {
                    setImageFailed(false);
                    onRetry();
                  }}
                >
                  再読み込み
                </Button>
              )}
            </div>
          )}
        </div>
        {details && <div className="ds-qr-details">{details}</div>}
        {resolvedState === "ready" && actions && <div className="ds-qr-actions">{actions}</div>}
      </div>
    </div>
  );
}
