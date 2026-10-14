import { NativeThemeProvider, QrCode, Text } from "@kyudaisai/ui-native";
import { fireEvent, render, screen } from "@testing-library/react-native";

const props = {
  title: "九大祭公式サイト",
  label: "公式サイトを開くQRコード",
  source: { uri: "https://example.com/qr.png" },
  details: <Text>受付番号 K-080</Text>,
  actions: <Text>公式サイトを開く</Text>,
};

test("optional visible copy can be omitted without losing the image's accessible name", () => {
  const { rerender } = render(<QrCode {...props} title={undefined} />);
  expect(screen.queryByRole("header")).toBeNull();
  expect(screen.getByRole("image", { name: props.label })).toBeTruthy();
  expect(screen.getByText("受付番号 K-080")).toBeTruthy();
  rerender(<QrCode {...props} title={undefined} description="受付スタッフにお見せください。" />);
  expect(screen.queryByRole("header")).toBeNull();
  expect(screen.getByText("受付スタッフにお見せください。")).toBeTruthy();
  rerender(<QrCode {...props} title="入場券" description="入口でお見せください。" />);
  expect(screen.getByRole("header", { name: "入場券" })).toBeTruthy();
  expect(screen.getByText("入口でお見せください。")).toBeTruthy();
});

test.each(["loading", "error", "unavailable"] as const)(
  "%s removes the scannable image and actions while preserving the target",
  (state) => {
    render(<QrCode {...props} state={state} />);
    expect(screen.queryByRole("image")).toBeNull();
    expect(screen.queryByText("公式サイトを開く")).toBeNull();
    expect(screen.getByText("受付番号 K-080")).toBeTruthy();
  },
);

test("image failure is cleared when a different image is supplied", () => {
  const { rerender } = render(<QrCode {...props} />);
  fireEvent(screen.getByRole("image"), "error", { nativeEvent: { error: "failed" } });
  expect(screen.queryByRole("image")).toBeNull();
  expect(screen.getByText("QRコードを表示できませんでした")).toBeTruthy();
  expect(screen.queryByText("公式サイトを開く")).toBeNull();
  rerender(<QrCode {...props} source={{ uri: "https://example.com/new.png" }} />);
  expect(screen.getByRole("image", { name: props.label })).toBeTruthy();
});

test("retry can be disabled and re-enabled", () => {
  const onRetry = jest.fn();
  const { rerender } = render(<QrCode {...props} state="error" onRetry={onRetry} retryDisabled />);
  const button = screen.getByRole("button", { name: "再読み込み" });
  expect(button).toBeDisabled();
  fireEvent.press(button);
  expect(onRetry).not.toHaveBeenCalled();
  rerender(<QrCode {...props} state="error" onRetry={onRetry} />);
  fireEvent.press(screen.getByRole("button", { name: "再読み込み" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test("dark mode retains the white image surface and supports text scaling", () => {
  render(
    <NativeThemeProvider mode="dark">
      <QrCode {...props} />
    </NativeThemeProvider>,
  );
  expect(screen.getByRole("image")).toHaveStyle({ backgroundColor: "#ffffff", aspectRatio: 1 });
  const title = screen.getByText(props.title);
  expect(title.props.allowFontScaling).toBe(true);
  expect(title.props.maxFontSizeMultiplier).toBe(0);
});
