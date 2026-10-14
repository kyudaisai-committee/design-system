export type CropOptions = {
  width: number;
  height: number;
  ratio: number;
  zoom?: number;
  x?: number;
  y?: number;
};

/** x/y place the crop inside the source; all dimensions are source pixels. */
export function cropRectangle({ width, height, ratio, zoom = 1, x = 0.5, y = 0.5 }: CropOptions) {
  if (
    ![width, height, ratio, zoom, x, y].every(Number.isFinite) ||
    width < 1 ||
    height < 1 ||
    ratio <= 0 ||
    zoom < 1
  ) {
    throw new Error("画像の寸法または切り抜く範囲を確認してください。");
  }
  const cropWidth = Math.max(1, Math.floor(Math.min(width, height * ratio) / zoom));
  const cropHeight = Math.min(height, Math.max(1, Math.floor(cropWidth / ratio)));
  return {
    originX: Math.round((width - cropWidth) * Math.min(1, Math.max(0, x))),
    originY: Math.round((height - cropHeight) * Math.min(1, Math.max(0, y))),
    width: cropWidth,
    height: cropHeight,
  };
}

export function outputDimensions(crop: { width: number; height: number }, maxWidth = 1280) {
  const width = Math.min(crop.width, maxWidth);
  return { width, height: Math.max(1, Math.round((crop.height * width) / crop.width)) };
}
