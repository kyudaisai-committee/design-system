import {
  DateInput,
  ProcessSteps,
  SelectInput,
  TimeInput,
  type NativeFileAsset,
} from "@kyudaisai/ui-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  AccessibilityInfo,
  Alert,
  AppState,
  DeviceEventEmitter,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { useLocalFiles } from "../stories/components/form-control-examples";
import keyboardMeta from "../stories/native/keyboard-layout.stories";

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: () => null,
  DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn(() => Promise.resolve()) },
}));
jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));
jest.mock("expo-file-system", () => ({ File: jest.fn(() => ({ delete: jest.fn() })) }));

const previousAppState = AppState.currentState;
beforeEach(() => {
  AppState.currentState = "active";
});
afterEach(() => {
  AppState.currentState = previousAppState;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test.each(["select", "date", "time"])(
  "%s sheets respect reduced motion and live preference changes",
  async (kind) => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    jest
      .spyOn(AccessibilityInfo, "addEventListener")
      .mockImplementation((name, listener) => DeviceEventEmitter.addListener(name, listener));
    const props = { label: "選択", value: "", onValueChange: jest.fn() };
    render(
      kind === "select" ? (
        <SelectInput {...props} options={[{ label: "候補", value: "one" }]} />
      ) : kind === "date" ? (
        <DateInput {...props} />
      ) : (
        <TimeInput {...props} />
      ),
    );
    await act(async () => {});
    fireEvent.press(screen.getByRole("button", { name: "選択、未選択" }));
    expect(screen.UNSAFE_getByType(Modal).props.animationType).toBe("none");
    act(() => DeviceEventEmitter.emit("reduceMotionChanged", false));
    expect(screen.UNSAFE_getByType(Modal).props.animationType).toBe("slide");
    act(() => DeviceEventEmitter.emit("reduceMotionChanged", true));
    expect(screen.UNSAFE_getByType(Modal).props.animationType).toBe("none");
  },
);

test("decorative step numbers stay inside their marker without capping the step label", () => {
  render(<ProcessSteps current={0} items={[{ label: "長い日本語の手続き名" }]} />);
  expect(screen.getByText("1", { includeHiddenElements: true }).props.allowFontScaling).toBe(false);
  expect(screen.getByText("長い日本語の手続き名").props.maxFontSizeMultiplier).toBe(0);
  expect(screen.getByLabelText("1、長い日本語の手続き名、現在の段階、進行中")).toBeTruthy();
});

test("editing a saved contact clears the result and ending a contact-only draft asks first", async () => {
  const alert = jest.spyOn(Alert, "alert");
  render(
    <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>
      {keyboardMeta.render()}
    </SafeAreaInsetsContext.Provider>,
  );
  await act(async () => {});
  fireEvent.changeText(screen.getByLabelText("説明、必須"), "説明を保存");
  fireEvent.press(screen.getByRole("button", { name: "入力を保存" }));
  expect(screen.getByText("保存しました")).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText("連絡先"), "changed@example.com");
  expect(screen.queryByText("保存しました")).toBeNull();
  fireEvent.changeText(screen.getByLabelText("説明、必須"), "");
  fireEvent.press(screen.getByRole("button", { name: "編集を終了" }));
  expect(alert).toHaveBeenCalledWith(
    "入力を破棄しますか？",
    expect.stringContaining("入力"),
    expect.any(Array),
  );
  expect(screen.getByLabelText("連絡先").props.value).toBe("changed@example.com");
});

test("new file identifiers cannot collide with an existing selection", async () => {
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file:///new.pdf", name: "追加.pdf", size: 20, lastModified: 0 }],
  });
  const initial = [{ id: "file-1", name: "既存.pdf", size: 10 }];
  const { result } = renderHook(() => useLocalFiles(initial));
  await act(async () => result.current.choose());
  expect(result.current.files).toHaveLength(2);
  expect(new Set(result.current.files.map((file) => file.id)).size).toBe(2);
  act(() => result.current.remove(result.current.files[1]!.id));
  expect(result.current.files.map((file) => file.name)).toEqual(["既存.pdf"]);
});

test("a pending file picker failure cannot overwrite a newer set of inputs", async () => {
  let reject!: (reason: Error) => void;
  jest.mocked(DocumentPicker.getDocumentAsync).mockReturnValue(
    new Promise((_resolve, rejectResult) => {
      reject = rejectResult;
    }),
  );
  const { result, rerender } = renderHook(
    ({ initial }: { initial: NativeFileAsset[] }) => useLocalFiles(initial),
    {
      initialProps: { initial: [{ id: "first", name: "元の文書.pdf" }] },
    },
  );
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.choose();
  });
  rerender({ initial: [{ id: "next", name: "新しい文書.pdf" }] });
  await act(async () => {
    reject(new Error("The old picker failed"));
    await pending;
  });
  expect(result.current.files[0]!.name).toBe("新しい文書.pdf");
  expect(result.current.error).toBeUndefined();
});

test.each(["value", "dismiss", "error"])(
  "Android ignores a late %s callback from a cancelled picker after another one opens",
  async (event) => {
    const previousOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    try {
      const onValueChange = jest.fn();
      const props = { label: "日付", value: "2026-10-14", onValueChange };
      const { rerender } = render(<DateInput {...props} />);
      await act(async () => {});
      fireEvent.press(screen.getByRole("button", { name: "日付、2026/10/14" }));
      const first = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0];
      rerender(<DateInput {...props} disabled />);
      rerender(<DateInput {...props} />);
      fireEvent.press(screen.getByRole("button", { name: "日付、2026/10/14" }));
      const second = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0];
      act(() => {
        if (event === "value") first.onValueChange?.({} as never, new Date(2026, 9, 15, 12));
        if (event === "dismiss") first.onDismiss?.();
        if (event === "error") first.onError?.(new Error("Stale native error"));
      });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "日付、2026/10/14" }).props.accessibilityState.expanded,
      ).toBe(true);
      expect(screen.queryByText("選択画面を開けませんでした。もう一度試してください。")).toBeNull();
      act(() => second.onValueChange?.({} as never, new Date(2026, 9, 16, 12)));
      expect(onValueChange).toHaveBeenCalledWith("2026-10-16");
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: previousOS });
    }
  },
);

test.each(["ios", "android"])(
  "%s cancels an open date picker when its range becomes invalid",
  async (os) => {
    const previousOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: os });
    try {
      const onValueChange = jest.fn();
      const props = {
        label: "日付",
        value: "2026-10-14",
        min: "2026-10-01",
        max: "2026-10-31",
        onValueChange,
      };
      const { rerender } = render(<DateInput {...props} />);
      await act(async () => {});
      fireEvent.press(screen.getByRole("button", { name: "日付、2026/10/14" }));
      const previousPicker = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)?.[0];
      rerender(<DateInput {...props} max="bad" />);
      if (os === "android") {
        act(() => previousPicker?.onValueChange?.({} as never, new Date(2026, 9, 15, 12)));
      } else {
        const confirm = screen.queryByRole("button", { name: "日付を決定" });
        if (confirm) fireEvent.press(confirm);
      }
      expect(onValueChange).not.toHaveBeenCalled();
      const trigger = screen.getByRole("button", { name: "日付、2026/10/14" });
      expect(trigger).toBeDisabled();
      expect(trigger.props.accessibilityState.expanded).toBe(false);
      expect(screen.queryByRole("button", { name: "日付を決定" })).toBeNull();
      if (os === "android") {
        expect(DateTimePickerAndroid.dismiss).toHaveBeenCalledWith("date");
      }
      expect(screen.getByText("選択できる範囲の設定を確認してください。")).toBeTruthy();
      rerender(<DateInput {...props} />);
      expect(screen.getByRole("button", { name: "日付、2026/10/14" })).not.toBeDisabled();
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: previousOS });
    }
  },
);
