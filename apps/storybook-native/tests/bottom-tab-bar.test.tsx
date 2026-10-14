import { colors } from "@kyudaisai/tokens/native";
import { BottomTabBar, NativeThemeProvider, type BottomTabItem } from "@kyudaisai/ui-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { requireOptionalNativeModule } from "expo";
import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { AccessibilityInfo, DeviceEventEmitter, Platform } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

jest.mock("expo", () => ({
  ...jest.requireActual("expo"),
  requireOptionalNativeModule: jest.fn(),
}));

jest.mock("expo-glass-effect", () => ({
  GlassView: (props: object) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, props);
  },
  isGlassEffectAPIAvailable: jest.fn(),
  isLiquidGlassAvailable: jest.fn(),
}));

const items: BottomTabItem[] = [
  { value: "home", label: "ホーム" },
  { value: "list", label: "一覧", badge: 120 },
  { value: "settings", label: "設定", disabled: true },
];
const originalOS = Platform.OS;
const originalVersion = Platform.Version;
let removals: jest.SpyInstance[];

beforeEach(() => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
  Object.defineProperty(Platform, "Version", { configurable: true, value: "26.5" });
  jest.mocked(requireOptionalNativeModule).mockReturnValue({} as never);
  jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(true);
  jest.mocked(isLiquidGlassAvailable).mockReturnValue(true);
  jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
  jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
  removals = [];
  jest.spyOn(AccessibilityInfo, "addEventListener").mockImplementation((event, callback) => {
    const subscription = DeviceEventEmitter.addListener(event, callback);
    removals.push(jest.spyOn(subscription, "remove"));
    return subscription;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  Object.defineProperty(Platform, "OS", { configurable: true, value: originalOS });
  Object.defineProperty(Platform, "Version", { configurable: true, value: originalVersion });
});

async function renderBar(appearance: "auto" | "solid" = "auto") {
  const onValueChange = jest.fn();
  const rendered = render(
    <BottomTabBar
      items={items}
      value="home"
      onValueChange={onValueChange}
      appearance={appearance}
    />,
  );
  await act(async () => {});
  return { ...rendered, onValueChange };
}

test("auto uses native regular glass with the design-system theme on supported iOS", async () => {
  render(
    <NativeThemeProvider mode="dark">
      <BottomTabBar items={items} value="home" onValueChange={jest.fn()} />
    </NativeThemeProvider>,
  );
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  await act(async () => {});
  const glass = screen.getByTestId("bottom-tab-bar-glass");
  expect(requireOptionalNativeModule).toHaveBeenCalledWith("ExpoGlassEffect");
  expect(isGlassEffectAPIAvailable).toHaveBeenCalled();
  expect(isLiquidGlassAvailable).toHaveBeenCalled();
  expect(glass.props.colorScheme).toBe("dark");
  expect(glass.props.glassEffectStyle).toEqual({ style: "regular", animate: false });
  expect(glass.props.isInteractive).toBe(true);
  expect(screen.getByTestId("bottom-tab-bar")).toHaveStyle({ backgroundColor: "transparent" });
  expect(screen.getByText("ホーム").props.allowFontScaling).toBe(true);
  expect(screen.getByText("ホーム").props.maxFontSizeMultiplier).toBe(0);
});

test.each([
  ["android", 36],
  ["ios", "18.7"],
] as const)("%s %s keeps the solid navigation surface", async (os, version) => {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  Object.defineProperty(Platform, "Version", { configurable: true, value: version });
  await renderBar();
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  expect(screen.getByTestId("bottom-tab-bar")).toHaveStyle({
    backgroundColor: colors.light.background,
  });
  expect(requireOptionalNativeModule).not.toHaveBeenCalled();
});

test("a development build without the glass native module keeps usable tabs", async () => {
  jest.mocked(requireOptionalNativeModule).mockReturnValue(null);
  const { onValueChange } = await renderBar();
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  expect(isGlassEffectAPIAvailable).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("tab", { name: "一覧、120件" }));
  expect(onValueChange).toHaveBeenCalledWith("list");
});

test.each(["api", "app", "throws"])(
  "unavailable glass (%s) never mounts the native glass view",
  async (failure) => {
    if (failure === "api") jest.mocked(isGlassEffectAPIAvailable).mockReturnValue(false);
    if (failure === "app") jest.mocked(isLiquidGlassAvailable).mockReturnValue(false);
    if (failure === "throws")
      jest.mocked(isGlassEffectAPIAvailable).mockImplementationOnce(() => {
        throw new Error("Native module unavailable");
      });
    await renderBar();
    expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  },
);

test("solid explicitly opts out while keeping tab selection, disabled state and original badge count", async () => {
  const { onValueChange } = await renderBar("solid");
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  const selected = screen.getByRole("tab", { name: "ホーム" });
  expect(selected.props.accessibilityState.selected).toBe(true);
  fireEvent.press(screen.getByRole("tab", { name: "一覧、120件" }));
  fireEvent.press(screen.getByRole("tab", { name: "設定" }));
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange).toHaveBeenCalledWith("list");
  expect(selected.props.accessibilityState.selected).toBe(true);
  expect(screen.getByText("99+", { includeHiddenElements: true })).toBeTruthy();
});

test("live accessibility preferences switch transparency and native touch effects without losing navigation", async () => {
  jest.mocked(AccessibilityInfo.isReduceTransparencyEnabled).mockResolvedValue(true);
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  const { unmount, onValueChange } = await renderBar();
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  act(() => DeviceEventEmitter.emit("reduceTransparencyChanged", false));
  expect(screen.getByTestId("bottom-tab-bar-glass").props.isInteractive).toBe(false);
  act(() => DeviceEventEmitter.emit("reduceMotionChanged", false));
  expect(screen.getByTestId("bottom-tab-bar-glass").props.isInteractive).toBe(true);
  fireEvent.press(screen.getByRole("tab", { name: "一覧、120件" }));
  expect(onValueChange).toHaveBeenCalledWith("list");
  act(() => DeviceEventEmitter.emit("reduceTransparencyChanged", true));
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
  expect(screen.getByRole("tab", { name: "ホーム" }).props.accessibilityState.selected).toBe(true);
  unmount();
  expect(removals).toHaveLength(2);
  removals.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
});

test("an accessibility event takes precedence over a stale initial preference query", async () => {
  let resolveTransparency!: (enabled: boolean) => void;
  jest.mocked(AccessibilityInfo.isReduceTransparencyEnabled).mockReturnValue(
    new Promise((resolve) => {
      resolveTransparency = resolve;
    }),
  );
  await renderBar();
  act(() => DeviceEventEmitter.emit("reduceTransparencyChanged", true));
  await act(async () => resolveTransparency(false));
  expect(screen.queryByTestId("bottom-tab-bar-glass")).toBeNull();
});

test("safe-area insets and an explicit bottom override remain correct with glass", async () => {
  const { rerender } = render(
    <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 34, left: 20, right: 10 }}>
      <BottomTabBar items={items} value="home" onValueChange={jest.fn()} />
    </SafeAreaInsetsContext.Provider>,
  );
  await act(async () => {});
  expect(screen.getByTestId("bottom-tab-bar")).toHaveStyle({
    paddingBottom: 38,
    paddingLeft: 24,
    paddingRight: 14,
  });
  rerender(
    <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 34, left: 20, right: 10 }}>
      <BottomTabBar items={items} value="home" onValueChange={jest.fn()} bottomInset={0} />
    </SafeAreaInsetsContext.Provider>,
  );
  expect(screen.getByTestId("bottom-tab-bar")).toHaveStyle({ paddingBottom: 4 });
});
