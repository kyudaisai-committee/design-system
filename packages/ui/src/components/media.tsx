"use client";

import { safeImage, type ImageAsset, type MediaState } from "@kyudaisai/ui-models";
import { useEffect, useState } from "react";

import { Button } from "./button";
import { EmptyState } from "./compositions";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";

export type { ImageAsset, MediaState } from "@kyudaisai/ui-models";
export interface PublicImageProps {
  asset: ImageAsset;
  onRetry?: () => void;
  /** Only the trusted host can resolve an authorized/local image. Never derive access from a caption. */
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
function ImageContent({ asset, resolveSource, onRetry }: PublicImageProps) {
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
  const expired = asset.expiresAt !== undefined && asset.expiresAt <= now;
  const state: MediaState = expired
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
    <figure
      className="ds-media"
      aria-label={state === "unavailable" ? "閲覧できない画像" : asset.alt}
    >
      {state === "ready" ? (
        <>
          {!loaded && <p role="status">{labels.loading}</p>}
          <img
            src={src || undefined}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <div role="status">
          <p>{labels[state]}</p>
          {state === "error" && onRetry && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFailed(false);
                onRetry();
              }}
            >
              再読み込み
            </Button>
          )}
        </div>
      )}
      {asset.caption && state !== "unavailable" && <figcaption>{asset.caption}</figcaption>}
    </figure>
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
  if (!assets.length) return <EmptyState title="写真がありません" />;
  return (
    <section aria-label={label} className="ds-stack">
      <p>
        {assets.length}枚{scopeLabel ? `・${scopeLabel}` : ""}
      </p>
      <ul className="ds-gallery">
        {assets.map((asset) => (
          <li key={asset.id}>
            <PublicImage asset={asset} resolveSource={resolveSource} />
            {available(asset) && (
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  {asset.alt}を拡大
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl">
                  <DialogTitle>{asset.alt}</DialogTitle>
                  <PublicImage asset={asset} resolveSource={resolveSource} />
                </DialogContent>
              </Dialog>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
