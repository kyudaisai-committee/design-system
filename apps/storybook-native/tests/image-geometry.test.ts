import { cropRectangle, outputDimensions } from "../stories/native/image-geometry";

test.each([1, 4 / 3, 16 / 9])(
  "a %f crop stays inside portrait and landscape sources at any alignment",
  (ratio) => {
    for (const [width, height] of [
      [1600, 1200],
      [1200, 1600],
    ])
      for (const zoom of [1, 2.7])
        for (const x of [0, 0.5, 1])
          for (const y of [0, 0.5, 1]) {
            const crop = cropRectangle({ width, height, ratio, zoom, x, y });
            expect(crop.originX).toBeGreaterThanOrEqual(0);
            expect(crop.originY).toBeGreaterThanOrEqual(0);
            expect(crop.originX + crop.width).toBeLessThanOrEqual(width);
            expect(crop.originY + crop.height).toBeLessThanOrEqual(height);
            expect(Math.abs(crop.width - crop.height * ratio)).toBeLessThan(ratio + 1);
          }
  },
);

test("output resizing preserves proportions without enlarging the source", () => {
  expect(outputDimensions({ width: 1600, height: 1200 })).toEqual({ width: 1280, height: 960 });
  expect(outputDimensions({ width: 600, height: 400 })).toEqual({ width: 600, height: 400 });
});

test("invalid source dimensions and nonfinite options are rejected before editing", () => {
  expect(() => cropRectangle({ width: 0, height: 100, ratio: 1 })).toThrow();
  expect(() => cropRectangle({ width: 100, height: 100, ratio: NaN })).toThrow();
  expect(() => cropRectangle({ width: 100, height: 100, ratio: 1, zoom: 0.5 })).toThrow();
});
