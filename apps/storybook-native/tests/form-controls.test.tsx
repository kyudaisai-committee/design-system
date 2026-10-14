import {
  CheckboxGroup,
  DateInput,
  EmailInput,
  Field,
  FileInput,
  InputTable,
  NumberInput,
  OtpInput,
  Repeater,
  SelectInput,
  SocialProfileInput,
  TimeInput,
  UrlInput,
} from "@kyudaisai/ui-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, Platform, StyleSheet, TextInput, View } from "react-native";

import constraintsMeta from "../stories/foundations/input-constraints.stories";
import formLayoutMeta from "../stories/patterns/form-layout.stories";

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: (props: object) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, { ...props, testID: "os-date-picker" });
  },
  DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn(() => Promise.resolve()) },
}));

const choices = [
  { value: "first", label: "選択肢A" },
  { value: "second", label: "選択肢B" },
];

beforeEach(() => {
  jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
});
afterEach(() => jest.restoreAllMocks());

test("disabled fields stay non-editable even when readOnly is explicitly false", () => {
  const { rerender } = render(
    <Field label="名称" editable={false} readOnly={false} value="保存済み" />,
  );
  expect(screen.getByLabelText("名称").props.editable).toBe(false);
  rerender(<Field label="名称" readOnly value="保存済み" />);
  const field = screen.getByLabelText("名称");
  expect(field.props.editable).toBe(false);
  expect(field.props.accessibilityState.disabled).toBe(false);
  expect(field.props.accessibilityHint).toContain("読み取り専用");
});

test("email uses the platform keyboard and preserves text with read-only callback protection", () => {
  const onValueChange = jest.fn();
  const { rerender } = render(<EmailInput label="メール" value="" onValueChange={onValueChange} />);
  const input = screen.getByLabelText("メール");
  expect(input.props.keyboardType).toBe(Platform.OS === "ios" ? "ascii-capable" : "email-address");
  expect(input.props.autoComplete).toBe("email");
  fireEvent.changeText(input, "person+test@example.com");
  expect(onValueChange).toHaveBeenLastCalledWith("person+test@example.com");
  rerender(<EmailInput label="メール" value="保存済み" readOnly onValueChange={onValueChange} />);
  fireEvent.changeText(screen.getByLabelText("メール"), "new@example.com");
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test("OTP accepts a formatted full-width paste in a single field and keeps leading zeroes", () => {
  const onValueChange = jest.fn();
  render(<OtpInput label="確認コード" value="" onValueChange={onValueChange} />);
  const input = screen.getByLabelText("確認コード");
  expect(screen.UNSAFE_getAllByType(TextInput)).toHaveLength(1);
  fireEvent.changeText(input, "０１-２３ ４５６");
  expect(onValueChange).toHaveBeenLastCalledWith("012345");
  fireEvent.changeText(input, "");
  expect(onValueChange).toHaveBeenLastCalledWith("");
});

test("OTP renders the requested number of underlines and follows native selection without adding inputs", () => {
  const onValueChange = jest.fn();
  const { rerender } = render(
    <OtpInput label="確認コード" length={4} value="12" onValueChange={onValueChange} />,
  );
  const input = screen.getByLabelText("確認コード");
  const slot = (number: number) =>
    screen.getByTestId(`otp-input-digit-${number}`, { includeHiddenElements: true });
  expect(slot(4)).toBeTruthy();
  expect(screen.queryByTestId("otp-input-digit-5", { includeHiddenElements: true })).toBeNull();
  fireEvent(input, "focus", {});
  fireEvent(input, "selectionChange", { nativeEvent: { selection: { start: 1, end: 1 } } });
  expect(slot(2)).toHaveStyle({ borderBottomWidth: 3 });
  expect(slot(3)).toHaveStyle({ borderBottomWidth: 1 });
  fireEvent.changeText(input, "1934");
  expect(onValueChange).toHaveBeenLastCalledWith("1934");
  rerender(
    <OtpInput
      label="確認コード"
      length={6}
      value="012345"
      readOnly
      onValueChange={onValueChange}
    />,
  );
  expect(slot(6)).toBeTruthy();
  expect(screen.getByLabelText("確認コード").props.editable).toBe(false);
  expect(screen.getByLabelText("確認コード").props.accessibilityHint).toContain("読み取り専用");
  expect(slot(2)).toHaveStyle({ borderBottomWidth: 1 });
  expect(screen.UNSAFE_getAllByType(TextInput)).toHaveLength(1);
});

test.each(["ios", "android"] as const)(
  "%s OTP aligns its native selection spacing with enlarged visual digits",
  (os) => {
    const previousOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: os });
    const dimensions = jest
      .spyOn(require("react-native"), "useWindowDimensions")
      .mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 2 });
    try {
      render(<OtpInput label="確認コード" value="1" onValueChange={jest.fn()} />);
      fireEvent(
        screen.getByTestId("otp-input-measure-visible", { includeHiddenElements: true }),
        "textLayout",
        {
          nativeEvent: { lines: [{ width: 19 }] },
        },
      );
      fireEvent(
        screen.getByTestId("otp-input-measure-native", { includeHiddenElements: true }),
        "textLayout",
        {
          nativeEvent: { lines: [{ width: 12 }] },
        },
      );
      const inputStyle = StyleSheet.flatten(screen.getByLabelText("確認コード").props.style);
      const slotStyle = StyleSheet.flatten(
        screen.getByTestId("otp-input-digit-1", { includeHiddenElements: true }).props.style,
      );
      // A fixed, measured native font keeps editing positions independent of nonlinear font scaling.
      const actualAdvance = 12 + inputStyle.letterSpacing;
      expect(actualAdvance).toBeCloseTo(slotStyle.width + 8);
      expect(inputStyle.paddingLeft + 12 / 2).toBeCloseTo(slotStyle.width / 2);
      expect(screen.getByLabelText("確認コード").props.allowFontScaling).toBe(false);
      expect(screen.getByLabelText("確認コード").props.maxFontSizeMultiplier).toBe(0);
      expect(screen.getByText("1", { includeHiddenElements: true }).props.allowFontScaling).toBe(
        true,
      );
      expect(
        screen.getByText("1", { includeHiddenElements: true }).props.maxFontSizeMultiplier,
      ).toBe(0);
    } finally {
      dimensions.mockRestore();
      Object.defineProperty(Platform, "OS", { configurable: true, value: previousOS });
    }
  },
);

test.each(["ios", "android"] as const)(
  "%s keyboards match email, URL, OTP and signed/unsigned numbers",
  (os) => {
    const previousOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { configurable: true, value: os });
    try {
      const props = { label: "入力", value: "", onValueChange: jest.fn() };
      const { rerender } = render(
        <View>
          <EmailInput {...props} />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe(
        os === "ios" ? "ascii-capable" : "email-address",
      );
      expect(screen.getByLabelText("入力").props.inputMode).toBe(
        os === "ios" ? undefined : "email",
      );
      expect(screen.getByLabelText("入力").props.autoComplete).toBe("email");
      expect(screen.getByLabelText("入力").props.autoCorrect).toBe(false);
      rerender(
        <View>
          <UrlInput {...props} />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe(
        os === "ios" ? "ascii-capable" : "url",
      );
      expect(screen.getByLabelText("入力").props.inputMode).toBe(os === "ios" ? undefined : "url");
      expect(screen.getByLabelText("入力").props.autoComplete).toBe(os === "ios" ? "url" : "off");
      rerender(
        <View>
          <OtpInput {...props} />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe("number-pad");
      expect(screen.getByLabelText("入力").props.autoComplete).toBe(
        os === "ios" ? "one-time-code" : "sms-otp",
      );
      rerender(
        <View>
          <NumberInput {...props} min={0} integer />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe("number-pad");
      rerender(
        <View>
          <NumberInput {...props} min={0} />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe("decimal-pad");
      rerender(
        <View>
          <NumberInput {...props} min={-1} />
        </View>,
      );
      expect(screen.getByLabelText("入力").props.keyboardType).toBe(
        os === "ios" ? "numbers-and-punctuation" : "numeric",
      );
      expect(screen.getByLabelText("入力").props.inputMode).toBeUndefined();
      const Constraints = constraintsMeta.component;
      rerender(
        <View>
          <Constraints />
        </View>,
      );
      for (const label of ["半角文字", "英数字", "識別名"]) {
        const input = screen.getByLabelText(label);
        expect(input.props.keyboardType).toBe(os === "ios" ? "ascii-capable" : "default");
        expect(input.props.inputMode).toBe(os === "ios" ? undefined : "text");
        expect(input.props.autoCapitalize).toBe("none");
        expect(input.props.autoCorrect).toBe(false);
      }
      for (const label of ["文字の制限なし", "カタカナ"]) {
        expect(screen.getByLabelText(label).props.keyboardType).toBe("default");
        expect(screen.getByLabelText(label).props.inputMode).toBe("text");
      }
      expect(screen.getByLabelText("数字の文字列").props.inputMode).toBe("numeric");
    } finally {
      Object.defineProperty(Platform, "OS", { configurable: true, value: previousOS });
    }
  },
);

test("number drafts retain minus and decimal text while blur reports integer and range errors", () => {
  const onValueChange = jest.fn();
  const props = { label: "数量", min: -10, max: 10, integer: true, onValueChange };
  const { rerender } = render(<NumberInput {...props} value="" />);
  fireEvent.changeText(screen.getByLabelText("数量"), "-");
  expect(onValueChange).toHaveBeenLastCalledWith("-");
  rerender(<NumberInput {...props} value="1.5" />);
  fireEvent(screen.getByLabelText("数量"), "blur", {});
  expect(screen.getByText("整数を入力してください。")).toBeTruthy();
  rerender(<NumberInput {...props} value="11" />);
  expect(screen.getByText("10以下で入力してください。")).toBeTruthy();
  rerender(<NumberInput {...props} value="" />);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("choice limits prevent additions but leave selected choices removable", () => {
  const onValueChange = jest.fn();
  render(
    <CheckboxGroup
      label="種類"
      options={choices}
      value={["first"]}
      maxSelections={1}
      onValueChange={onValueChange}
    />,
  );
  const selected = screen.getByRole("checkbox", { name: /選択肢A/ });
  const available = screen.getByRole("checkbox", { name: /選択肢B/ });
  expect(selected).not.toBeDisabled();
  expect(available).toBeDisabled();
  fireEvent.press(available);
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.press(selected);
  expect(onValueChange).toHaveBeenCalledWith([]);
});

test("choices announce their question, required state, limits and errors", () => {
  render(
    <CheckboxGroup
      label="設備"
      required
      options={choices}
      value={[]}
      maxSelections={2}
      error="選んでください。"
      onValueChange={jest.fn()}
    />,
  );
  const option = screen.getByRole("checkbox", { name: "設備、選択肢A、必須" });
  expect(option.props.accessibilityHint).toContain("2項目まで");
  expect(option.props.accessibilityHint).toContain("エラー: 選んでください。");
});

test("removed choices do not occupy the selection limit and the next edit drops stale values", () => {
  const onValueChange = jest.fn();
  render(
    <CheckboxGroup
      label="種類"
      options={[choices[1]!]}
      value={["first"]}
      maxSelections={1}
      onValueChange={onValueChange}
    />,
  );
  const option = screen.getByRole("checkbox", { name: /選択肢B/ });
  expect(option).not.toBeDisabled();
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.press(option);
  expect(onValueChange).toHaveBeenCalledWith(["second"]);
});

test("select cancellation preserves the value and a chosen option emits its stable identifier", () => {
  const onValueChange = jest.fn();
  render(
    <SelectInput label="種類" options={choices} value="first" onValueChange={onValueChange} />,
  );
  fireEvent.press(screen.getByRole("button", { name: "種類、選択肢A" }));
  fireEvent.press(screen.getByRole("button", { name: "閉じる" }));
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "種類、選択肢A" }));
  fireEvent.press(screen.getByRole("button", { name: "種類、選択肢B" }));
  expect(onValueChange).toHaveBeenCalledWith("second");
});

test("empty date and time fields show input formats and open their respective pickers", () => {
  render(
    <View>
      <DateInput label="日付" value="" required onValueChange={jest.fn()} />
      <TimeInput label="時刻" value="" onValueChange={jest.fn()} />
    </View>,
  );
  expect(screen.getByText("YYYY/MM/DD")).toBeTruthy();
  expect(screen.queryByText("日付を選択")).toBeNull();
  const date = screen.getByRole("button", { name: "日付、未選択、必須" });
  expect(date.props.accessibilityHint).toContain("カレンダーを開きます");
  fireEvent.press(date);
  expect(screen.getByTestId("os-date-picker").props.mode).toBe("date");
  fireEvent.press(screen.getByRole("button", { name: "キャンセル" }));
  expect(screen.getByText("HH:mm")).toBeTruthy();
  expect(screen.queryByText("時刻を選択")).toBeNull();
  const time = screen.getByRole("button", { name: "時刻、未選択" });
  expect(time.props.accessibilityHint).toContain("時刻の選択画面を開きます");
  fireEvent.press(time);
  expect(screen.getByTestId("os-date-picker").props.mode).toBe("time");
});

test("date field clear, read-only and disabled actions preserve the current value correctly", () => {
  const onValueChange = jest.fn();
  const props = { label: "日付", value: "2030-05-20", onValueChange };
  const { rerender } = render(<DateInput {...props} />);
  fireEvent.press(screen.getByRole("button", { name: "日付をクリア" }));
  expect(onValueChange).toHaveBeenCalledWith("");
  onValueChange.mockClear();
  rerender(<DateInput {...props} readOnly />);
  const readOnly = screen.getByRole("button", { name: "日付、2030/05/20" });
  expect(readOnly).toBeDisabled();
  expect(readOnly.props.accessibilityHint).toContain("読み取り専用");
  fireEvent.press(readOnly);
  fireEvent.press(screen.getByRole("button", { name: "日付をクリア" }));
  expect(screen.queryByTestId("os-date-picker")).toBeNull();
  expect(onValueChange).not.toHaveBeenCalled();
  rerender(<DateInput {...props} disabled error="日付を確認してください。" />);
  const disabled = screen.getByRole("button", { name: "日付、2030/05/20" });
  expect(disabled).toBeDisabled();
  expect(disabled.props.accessibilityHint).toContain("エラー: 日付を確認してください。");
  fireEvent.press(disabled);
  expect(screen.queryByTestId("os-date-picker")).toBeNull();
});

test("iOS date picking keeps drafts on cancel and commits a local calendar date on confirmation", () => {
  const onValueChange = jest.fn();
  render(
    <DateInput
      label="日付"
      value="2026-05-01"
      min="2026-05-01"
      max="2026-05-31"
      onValueChange={onValueChange}
    />,
  );
  fireEvent.press(screen.getByRole("button", { name: "日付、2026/05/01" }));
  expect(screen.getByTestId("os-date-picker").props.display).toBe("inline");
  expect(screen.getByTestId("os-date-picker").props.locale).toBe("ja-JP");
  fireEvent(screen.getByTestId("os-date-picker"), "valueChange", {}, new Date(2026, 4, 16, 12));
  fireEvent.press(screen.getByRole("button", { name: "キャンセル" }));
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole("button", { name: "日付、2026/05/01" }));
  expect(screen.getByTestId("os-date-picker").props.value).toEqual(new Date(2026, 4, 1, 12));
  fireEvent(screen.getByTestId("os-date-picker"), "valueChange", {}, new Date(2026, 4, 20, 12));
  fireEvent.press(screen.getByRole("button", { name: "日付を決定" }));
  expect(onValueChange).toHaveBeenCalledWith("2026-05-20");
});

test("an empty date picker uses the day it is opened on a long-lived screen", () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date(2026, 9, 14, 23, 59));
    render(<DateInput label="日付" value="" onValueChange={jest.fn()} />);
    jest.setSystemTime(new Date(2026, 9, 15, 9, 0));
    fireEvent.press(screen.getByRole("button", { name: "日付、未選択" }));
    expect(screen.getByTestId("os-date-picker").props.value.getDate()).toBe(15);
  } finally {
    jest.useRealTimers();
  }
});

test("invalid calendar days and current values outside a range are visible errors", () => {
  const onValueChange = jest.fn();
  const { rerender } = render(
    <DateInput label="日付" value="2026-02-29" onValueChange={onValueChange} />,
  );
  expect(screen.getByText("年・月・日を選び直してください。")).toBeTruthy();
  rerender(
    <DateInput label="日付" value="2024-02-29" min="2024-03-01" onValueChange={onValueChange} />,
  );
  expect(screen.getByText("2024/03/01以降を選んでください。")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "日付、2024/02/29" }));
  expect(screen.getByTestId("os-date-picker").props.value).toEqual(new Date(2024, 2, 1, 12));
});

test("Android time picking rejects out-of-range results and ignores results after disabling", () => {
  const previousOS = Platform.OS;
  Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
  try {
    const onValueChange = jest.fn();
    const props = { label: "時刻", value: "09:00", min: "09:00", max: "17:00", onValueChange };
    const { rerender } = render(<TimeInput {...props} />);
    fireEvent.press(screen.getByRole("button", { name: "時刻、09:00" }));
    const first = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0];
    act(() => first.onValueChange?.({} as never, new Date(2000, 0, 15, 18, 0)));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText("17:00以前を選んでください。")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "時刻、09:00" }));
    const second = jest.mocked(DateTimePickerAndroid.open).mock.calls.at(-1)![0];
    rerender(<TimeInput {...props} disabled />);
    act(() => second.onValueChange?.({} as never, new Date(2000, 0, 15, 12, 0)));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(DateTimePickerAndroid.dismiss).toHaveBeenCalledWith("time");
  } finally {
    Object.defineProperty(Platform, "OS", { configurable: true, value: previousOS });
  }
});

test("file count limits keep existing selections removable without reading file contents", () => {
  const onChoose = jest.fn();
  const onRemove = jest.fn();
  render(
    <FileInput
      label="添付"
      value={[{ id: "file-a", name: "見本.pdf", size: 10 }]}
      maxFiles={1}
      onChoose={onChoose}
      onRemove={onRemove}
    />,
  );
  expect(screen.getByRole("button", { name: "添付のファイルを選ぶ" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "見本.pdfの選択を外す" }));
  expect(onRemove).toHaveBeenCalledWith("file-a");
  expect(onChoose).not.toHaveBeenCalled();
});

test("repeaters enforce min/max bounds and delete by stable identifier after reordering", () => {
  const onAdd = jest.fn();
  const onRemove = jest.fn();
  const props = {
    label: "項目",
    minItems: 1,
    maxItems: 2,
    onAdd,
    onRemove,
    renderItem: () => null,
  };
  const { rerender } = render(<Repeater {...props} items={[{ id: "a" }]} />);
  expect(screen.getByRole("button", { name: "1件目を削除" })).toBeDisabled();
  rerender(<Repeater {...props} items={[{ id: "b" }, { id: "a" }]} />);
  expect(screen.getByRole("button", { name: "項目を追加" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "1件目を削除" }));
  expect(onRemove).toHaveBeenCalledWith("b");
});

test("table cell renderers receive row/column identifiers and read-only state", () => {
  const renderCell = jest.fn((rowId, key, state) => (
    <Field
      label={`${rowId}の${key}`}
      value="1"
      editable={!state.disabled}
      readOnly={state.readOnly}
    />
  ));
  render(
    <InputTable
      label="一覧"
      rows={[{ id: "a", label: "項目A" }]}
      columns={[{ key: "quantity", label: "数量" }]}
      readOnly
      renderCell={renderCell}
    />,
  );
  expect(renderCell).toHaveBeenCalledWith("a", "quantity", { disabled: false, readOnly: true });
  expect(screen.getByLabelText("aのquantity").props.editable).toBe(false);
});

test("choosing no account clears profiles and unchecking makes profiles available again", () => {
  const onValueChange = jest.fn();
  const onNoAccountChange = jest.fn();
  const props = {
    label: "プロフィール",
    options: choices,
    onValueChange,
    onNoAccountChange,
    allowNoAccount: true,
  };
  const { rerender } = render(
    <SocialProfileInput {...props} value={["first"]} noAccount={false} />,
  );
  fireEvent.press(screen.getByRole("checkbox", { name: /アカウントを持っていない/ }));
  expect(onNoAccountChange).toHaveBeenCalledWith(true);
  expect(onValueChange).toHaveBeenCalledWith([]);
  rerender(<SocialProfileInput {...props} value={[]} noAccount />);
  expect(screen.queryByRole("checkbox", { name: /選択肢A/ })).toBeNull();
  fireEvent.press(screen.getByRole("checkbox", { name: /アカウントを持っていない/ }));
  expect(onNoAccountChange).toHaveBeenLastCalledWith(false);
  rerender(<SocialProfileInput {...props} value={[]} noAccount={false} />);
  fireEvent.press(screen.getByRole("checkbox", { name: /選択肢A/ }));
  expect(onValueChange).toHaveBeenLastCalledWith(["first"]);
});

test("profile provider changes leave visible choices available when an old selection is hidden", () => {
  const onValueChange = jest.fn();
  const onNoAccountChange = jest.fn();
  const props = {
    label: "プロフィール",
    options: [
      { value: "photos", label: "写真", provider: "instagram" as const },
      { value: "videos", label: "動画", provider: "youtube" as const },
    ],
    value: ["photos"],
    maxSelections: 1,
    noAccount: false,
    onNoAccountChange,
    onValueChange,
  };
  const { rerender } = render(<SocialProfileInput {...props} />);
  rerender(<SocialProfileInput {...props} allowedProviders={["youtube"]} />);
  expect(screen.queryByRole("checkbox", { name: /写真/ })).toBeNull();
  const video = screen.getByRole("checkbox", { name: /動画/ });
  expect(video).not.toBeDisabled();
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.press(video);
  expect(onValueChange).toHaveBeenCalledWith(["videos"]);
});

test("character constraints retain pasted text and leading zeroes while reporting errors", () => {
  const Constraints = constraintsMeta.component;
  render(<Constraints />);
  expect(screen.getByLabelText("数字の文字列").props.value).toBe("00123");
  fireEvent.changeText(screen.getByLabelText("カタカナ"), "ひらがな");
  fireEvent.press(screen.getByRole("button", { name: "文字の条件を確認" }));
  expect(screen.getByLabelText("カタカナ").props.value).toBe("ひらがな");
  expect(screen.getByLabelText("カタカナ").props.accessibilityHint).toContain("エラー:");
  fireEvent.changeText(screen.getByLabelText("カタカナ"), "カタカナ");
  expect(screen.getByLabelText("カタカナ").props.accessibilityHint).not.toContain("エラー:");
});

test("form layout blocks missing required fields and invalid table numbers, then accepts corrections", () => {
  const FormLayout = formLayoutMeta.component;
  render(<FormLayout />);
  const submit = () => fireEvent.press(screen.getByRole("button", { name: "入力内容を確認" }));
  submit();
  expect(screen.getByText("名前を入力してください。")).toBeTruthy();
  expect(screen.getByText("有効なメールアドレスを入力してください。")).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText("名前、必須"), "見本");
  fireEvent.changeText(screen.getByLabelText("メールアドレス、必須"), "sample@example.com");
  fireEvent.changeText(screen.getByLabelText("月曜日の数量"), "-1");
  fireEvent.changeText(screen.getByLabelText("火曜日の数量"), "1.5");
  submit();
  expect(screen.queryByText("入力内容を確認しました")).toBeNull();
  expect(screen.getAllByText("0以上の整数で入力してください。")).toHaveLength(2);
  fireEvent.changeText(screen.getByLabelText("月曜日の数量"), "0");
  fireEvent.changeText(screen.getByLabelText("火曜日の数量"), "2");
  submit();
  expect(screen.getByText("入力内容を確認しました")).toBeTruthy();
  expect(screen.getByLabelText("メールアドレス、必須").props.value).toBe("sample@example.com");
});
