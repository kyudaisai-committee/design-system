"use client";
import { useEffect, useRef, useState } from "react";

import { Button } from "./button";
import { Field } from "./compositions";
import { Notice } from "./compositions";
import { Input } from "./input";

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
  onPick: (photo: PhotoSelection, file: File) => void | Promise<void>;
  onClear?: () => void;
  disabled?: boolean;
  aspect?: [number, number];
}
/** Browsers provide file selection, not a portable system cropper. No silent center crop. */
export function PhotoPicker({ label, onPick, onClear, disabled }: PhotoPickerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  const unavailable = useRef(disabled);
  unavailable.current = disabled;
  const ownedUrl = useRef<string | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    };
  }, []);
  return (
    <div className="ds-stack">
      <p>必要に応じて写真アプリで切り抜いてから、画像を選択してください。</p>
      <Field label={label}>
        {(attrs) => (
          <Input
            {...attrs}
            type="file"
            accept="image/*"
            disabled={disabled || busy}
            onChange={async (event) => {
              const next = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (disabled || lock.current) return;
              if (!next.length) return;
              const file = next[0];
              if (!file.type.startsWith("image/")) {
                setError("画像ファイルを選択してください。");
                return;
              }
              lock.current = true;
              setBusy(true);
              setError("");
              try {
                const bitmap = await createImageBitmap(file);
                const { width, height } = bitmap;
                bitmap.close();
                if (!mounted.current || unavailable.current) return;
                // Keep the URI alive until replacement or unmount; persist the File for longer use.
                const uri = URL.createObjectURL(file);
                try {
                  await onPick(
                    {
                      uri,
                      width,
                      height,
                      fileName: file.name,
                      mimeType: file.type,
                      fileSize: file.size,
                    },
                    file,
                  );
                } catch (error) {
                  URL.revokeObjectURL(uri);
                  throw error;
                }
                if (!mounted.current) {
                  URL.revokeObjectURL(uri);
                  return;
                }
                if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
                ownedUrl.current = uri;
                setFiles(next);
              } catch {
                if (mounted.current)
                  setError("写真を選択できませんでした。別の画像でお試しください。");
              } finally {
                lock.current = false;
                if (mounted.current) setBusy(false);
              }
            }}
          />
        )}
      </Field>
      {files.map((file) => (
        <p key={file.name}>{file.name}</p>
      ))}
      {files.length > 0 && onClear && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || busy}
          onClick={() => {
            onClear();
            setFiles([]);
            if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
            ownedUrl.current = undefined;
          }}
        >
          写真の選択を解除
        </Button>
      )}
      {busy && <p role="status">写真を確認しています。</p>}
      {error && (
        <Notice title="写真を選択できませんでした" tone="danger">
          {error}
        </Notice>
      )}
    </div>
  );
}
