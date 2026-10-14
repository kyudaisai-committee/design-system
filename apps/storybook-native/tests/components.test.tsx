import { colors } from "@kyudaisai/tokens/native";
import {
  Button,
  Checkbox,
  Field,
  NativeThemeProvider,
  ProcessSteps,
  Progress,
  Text,
  Timeline,
  sequenceIconNames,
} from "@kyudaisai/ui-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import Svg, { Path } from "react-native-svg";

import processStepsMeta from "../stories/components/process-steps.stories";

test("loading buttons cannot submit again and expose their busy state", () => {
  const onPress = jest.fn();
  render(<Button title="保存中" loading onPress={onPress} />);
  const button = screen.getByRole("button", { name: "保存中" });
  expect(button).toBeDisabled();
  expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  fireEvent.press(button);
  expect(onPress).not.toHaveBeenCalled();
});

test("fields keep their accessible name, requirement, hint and error", () => {
  const onChangeText = jest.fn();
  render(
    <Field
      label="名称"
      required
      hint="100文字以内"
      error="名称を入力してください"
      value=""
      onChangeText={onChangeText}
    />,
  );
  const input = screen.getByLabelText("名称、必須");
  expect(input.props.accessibilityHint).toContain("100文字以内");
  expect(input.props.accessibilityHint).toContain("名称を入力してください");
  fireEvent.changeText(input, "新しい名称");
  expect(onChangeText).toHaveBeenCalledWith("新しい名称");
});

test("checkboxes report checked state and disable the complete labelled control", () => {
  const onCheckedChange = jest.fn();
  const { rerender } = render(
    <Checkbox label="内容を確認" checked={false} onCheckedChange={onCheckedChange} />,
  );
  fireEvent.press(screen.getByRole("checkbox", { name: "内容を確認" }));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
  rerender(<Checkbox label="内容を確認" checked disabled onCheckedChange={onCheckedChange} />);
  const checkbox = screen.getByRole("checkbox", { name: "内容を確認" });
  expect(checkbox.props.accessibilityState).toMatchObject({ checked: true, disabled: true });
  fireEvent.press(checkbox);
  expect(onCheckedChange).toHaveBeenCalledTimes(1);
});

test("the dark theme changes text colors while retaining unrestricted font scaling", () => {
  render(
    <NativeThemeProvider mode="dark">
      <Text>本文</Text>
    </NativeThemeProvider>,
  );
  const text = screen.getByText("本文");
  expect(text).toHaveStyle({ color: colors.dark.foreground });
  expect(text.props.allowFontScaling).toBe(true);
  expect(text.props.maxFontSizeMultiplier).toBe(0);
});

test("unknown progress is not announced as zero percent", () => {
  render(<Progress label="読み込み中" />);
  const progress = screen.getByRole("progressbar");
  expect(progress.props.accessibilityValue?.now).toBeUndefined();
  expect(progress.props.accessibilityValue?.text).toBeTruthy();
});

test("process steps keep the current stage in accessibility without a repeated visible label", () => {
  render(
    <ProcessSteps items={[{ label: "入力" }, { label: "確認" }, { label: "結果" }]} current={1} />,
  );
  expect(screen.getAllByText(/確認/).length).toBeGreaterThan(0);
  expect(screen.queryByText("現在の段階")).toBeNull();
  expect(screen.getByLabelText("2、確認、現在の段階、進行中")).toBeTruthy();
  expect(screen.getByText("進行中")).toBeTruthy();
});

test("preset sequence icons remain the same when stages complete", () => {
  const items = sequenceIconNames.map((icon) => ({ id: icon, label: icon, icon }));
  const { rerender } = render(<ProcessSteps items={items} current={0} />);
  const paths = screen.UNSAFE_getAllByType(Path).map((path) => path.props.d);
  expect(screen.UNSAFE_getAllByType(Svg)).toHaveLength(sequenceIconNames.length);
  expect(screen.UNSAFE_getAllByType(Svg).every((icon) => icon.props.accessible === false)).toBe(
    true,
  );
  rerender(<ProcessSteps items={items} current={items.length} />);
  expect(screen.UNSAFE_getAllByType(Path).map((path) => path.props.d)).toEqual(paths);
  expect(screen.queryByLabelText(/現在の段階/)).toBeNull();
});

test("the three process icon controls can each return to the numbered default", () => {
  const { rerender } = render(processStepsMeta.render(processStepsMeta.args));
  expect(screen.UNSAFE_getAllByType(Svg)).toHaveLength(3);
  for (const control of ["firstIcon", "secondIcon", "thirdIcon"] as const) {
    rerender(processStepsMeta.render({ ...processStepsMeta.args, [control]: "既定（番号）" }));
    expect(screen.UNSAFE_getAllByType(Svg)).toHaveLength(2);
  }
  rerender(
    processStepsMeta.render({
      ...processStepsMeta.args,
      firstIcon: "既定（番号）",
      secondIcon: "既定（番号）",
      thirdIcon: "既定（番号）",
    }),
  );
  expect(screen.UNSAFE_queryAllByType(Svg)).toHaveLength(0);
});

const historyItems = [
  { id: "received", title: "第1版の受付", date: "10月13日", statusLabel: "受付済み" },
  { id: "returned", title: "修正の依頼", date: "10月14日", statusLabel: "要修正" },
  { id: "approved", title: "第2版の確認", date: "10月15日", statusLabel: "確認済み" },
  { id: "notified", title: "確認結果をメールで通知", date: "10月16日" },
];

test.each([false, true])(
  "timeline shows one current status even when newestFirst=%s",
  (newestFirst) => {
    render(
      <Timeline
        items={newestFirst ? [...historyItems].reverse() : historyItems}
        currentStatus={{ label: "確認済み", tone: "success" }}
      />,
    );
    expect(screen.getByLabelText("現在の状態、確認済み")).toBeTruthy();
    expect(screen.queryByText("現在の状態")).toBeNull();
    expect(screen.getAllByText("確認済み")).toHaveLength(1);
    expect(screen.queryByText("要修正")).toBeNull();
    expect(screen.queryByText("受付済み")).toBeNull();
    expect(screen.getByLabelText("10月14日。 修正の依頼。 要修正")).toBeTruthy();
  },
);

test("timeline never guesses a current state from the last event", () => {
  render(<Timeline items={historyItems} />);
  expect(screen.queryByLabelText(/^現在の状態/)).toBeNull();
  expect(screen.queryByText("確認済み")).toBeNull();
  expect(screen.getByText("確認結果をメールで通知")).toBeTruthy();
});
