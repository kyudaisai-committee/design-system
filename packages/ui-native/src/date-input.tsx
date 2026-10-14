import { radii, sizes, spacing, typography } from "@kyudaisai/tokens/native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "./components";
import { FormControlFrame, controlHint, type FormControlProps } from "./form-control-parts";
import { useNativeTheme } from "./theme";
import { useReducedMotion } from "./use-reduced-motion";

export interface DateInputProps extends FormControlProps {
  /** Local calendar date, YYYY-MM-DD. Empty string means no selection. */
  value: string;
  onValueChange: (value: string) => void;
  min?: string;
  max?: string;
}

export interface TimeInputProps extends FormControlProps {
  /** Wall-clock time, HH:mm. Empty string means no selection. */
  value: string;
  onValueChange: (value: string) => void;
  min?: string;
  max?: string;
}

type PickerMode = "date" | "time";

function PickerIcon({ mode, color }: { mode: PickerMode | "clear"; color: string }) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.icon}
    >
      {mode === "date" ? (
        <>
          <View style={[styles.calendarOutline, { borderColor: color }]} />
          <View style={[styles.calendarDivider, { borderColor: color }]} />
          <View style={[styles.calendarBinding, { left: 5, backgroundColor: color }]} />
          <View style={[styles.calendarBinding, { right: 5, backgroundColor: color }]} />
          <View style={[styles.calendarDay, { backgroundColor: color }]} />
        </>
      ) : mode === "time" ? (
        <>
          <View style={[styles.clockOutline, { borderColor: color }]} />
          <View style={[styles.clockHour, { backgroundColor: color }]} />
          <View style={[styles.clockMinute, { backgroundColor: color }]} />
        </>
      ) : (
        <>
          <View
            style={[styles.clearLine, { backgroundColor: color, transform: [{ rotate: "45deg" }] }]}
          />
          <View
            style={[
              styles.clearLine,
              { backgroundColor: color, transform: [{ rotate: "-45deg" }] },
            ]}
          />
        </>
      )}
    </View>
  );
}

function parseDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  // Parsing an ISO date directly would interpret it as UTC and can change the day.
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

function parseTime(value: string): Date | undefined {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return undefined;
  return new Date(2000, 0, 15, Number(match[1]), Number(match[2]), 0, 0);
}

const pad = (number: number) => String(number).padStart(2, "0");

function formatValue(date: Date, mode: PickerMode) {
  return mode === "date"
    ? `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function PickerInput({
  mode,
  value,
  onValueChange,
  min,
  max,
  error,
  hint,
  ...props
}: (DateInputProps | TimeInputProps) & { mode: PickerMode }) {
  const { colors, mode: appearance } = useNativeTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const { fontScale } = useWindowDimensions();
  const touchSize = Math.max(sizes.controlHeight, Platform.OS === "android" ? 48 : 44);
  const inputHeight = Math.max(
    touchSize,
    Number(typography.body.lineHeight) * fontScale + spacing[4],
  );
  const [draft, setDraft] = useState(() => new Date());
  const [pickerError, setPickerError] = useState<string>();
  const mounted = useRef(true);
  const opening = useRef(false);
  const request = useRef({ value: 0 });
  const inactive = Boolean(props.disabled || props.readOnly);
  const parse = mode === "date" ? parseDate : parseTime;
  const parsed = parse(value);
  const minimum = min ? parse(min) : undefined;
  const maximum = max ? parse(max) : undefined;
  const badBounds = Boolean((min && !minimum) || (max && !maximum) || (min && max && min > max));
  const latest = useRef({ inactive, badBounds, onValueChange, min, max });
  latest.current = { inactive, badBounds, onValueChange, min, max };
  const format = mode === "date" ? "年・月・日" : "時・分";
  const displayValue = (current: string) =>
    mode === "date" ? current.replace(/-/g, "/") : current;

  function dismiss() {
    ++request.current.value;
    if (Platform.OS === "android" && opening.current) {
      void DateTimePickerAndroid.dismiss(mode).catch(() => {});
    }
    opening.current = false;
    setOpen(false);
  }

  useEffect(() => {
    const currentRequest = request.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++currentRequest.value;
      if (Platform.OS === "android" && opening.current) {
        void DateTimePickerAndroid.dismiss(mode).catch(() => {});
      }
      opening.current = false;
    };
  }, [mode]);

  useEffect(() => {
    if (inactive || badBounds) {
      ++request.current.value;
      if (Platform.OS === "android" && opening.current)
        void DateTimePickerAndroid.dismiss(mode).catch(() => {});
      opening.current = false;
      setOpen(false);
    }
  }, [inactive, badBounds, mode]);

  useEffect(() => setPickerError(undefined), [value, min, max]);

  function checkRange(next: string) {
    const current = latest.current;
    if (current.badBounds) return "選択できる範囲の設定を確認してください。";
    if (current.min && next < current.min)
      return `${displayValue(current.min)}以降を選んでください。`;
    if (current.max && next > current.max)
      return `${displayValue(current.max)}以前を選んでください。`;
    return undefined;
  }

  function commit(date: Date) {
    if (!mounted.current || latest.current.inactive || latest.current.badBounds) return;
    const next = formatValue(date, mode);
    const rangeError = checkRange(next);
    setPickerError(rangeError);
    if (!rangeError) latest.current.onValueChange(next);
  }

  function openPicker(today: Date) {
    if (inactive || badBounds || opening.current) return;
    let initial = parsed ?? (mode === "date" ? today : parseTime("09:00")!);
    if (minimum && initial < minimum) initial = minimum;
    if (maximum && initial > maximum) initial = maximum;
    setDraft(initial);
    setPickerError(undefined);
    opening.current = true;
    const attempt = ++request.current.value;
    setOpen(true);
    if (Platform.OS === "android") {
      try {
        DateTimePickerAndroid.open({
          mode,
          display: mode === "date" ? "calendar" : "clock",
          value: initial,
          is24Hour: true,
          positiveButton: { label: "決定" },
          negativeButton: { label: "キャンセル" },
          minimumDate: mode === "date" ? minimum : undefined,
          maximumDate: mode === "date" ? maximum : undefined,
          onValueChange: (_event, date) => {
            if (!mounted.current || !opening.current || attempt !== request.current.value) return;
            opening.current = false;
            setOpen(false);
            commit(date);
          },
          onDismiss: () => {
            if (!mounted.current || attempt !== request.current.value) return;
            opening.current = false;
            setOpen(false);
          },
          onError: () => {
            if (!mounted.current || attempt !== request.current.value) return;
            opening.current = false;
            setOpen(false);
            setPickerError("選択画面を開けませんでした。もう一度試してください。");
          },
        });
      } catch {
        opening.current = false;
        setOpen(false);
        setPickerError("選択画面を開けませんでした。もう一度試してください。");
      }
    }
  }

  const fieldError =
    error ??
    pickerError ??
    (badBounds
      ? "選択できる範囲の設定を確認してください。"
      : value && !parsed
        ? `${format}を選び直してください。`
        : parsed
          ? checkRange(value)
          : undefined);
  const rangeHint = [
    min ? `${displayValue(min)}以降` : undefined,
    max ? `${displayValue(max)}以前` : undefined,
  ]
    .filter(Boolean)
    .join("・");
  const draftError = checkRange(formatValue(draft, mode));
  return (
    <FormControlFrame
      {...props}
      hint={controlHint(hint, rangeHint || undefined)}
      error={fieldError}
    >
      <View style={[styles.focusFrame, { borderColor: focused ? colors.ring : "transparent" }]}>
        <View
          style={[
            styles.input,
            {
              minHeight: inputHeight,
              borderColor: fieldError ? colors.danger : colors.input,
              backgroundColor: inactive ? colors.muted : colors.background,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${props.label}、${displayValue(value) || "未選択"}${props.required ? "、必須" : ""}`}
            accessibilityState={{ disabled: inactive || badBounds || open, expanded: open }}
            accessibilityHint={controlHint(
              hint,
              rangeHint,
              props.readOnly ? "読み取り専用" : undefined,
              fieldError ? `エラー: ${fieldError}` : undefined,
              !inactive && !badBounds
                ? `${mode === "date" ? "カレンダー" : "時刻の選択画面"}を開きます。`
                : undefined,
            )}
            disabled={inactive || badBounds || open}
            hitSlop={1}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onPress={() => openPicker(new Date())}
            style={[styles.pickerField, { minHeight: inputHeight - 2 }]}
          >
            <Text tone={value ? "default" : "muted"} style={styles.fieldValue}>
              {displayValue(value) || (mode === "date" ? "YYYY/MM/DD" : "HH:mm")}
            </Text>
            <PickerIcon mode={mode} color={colors.mutedForeground} />
          </Pressable>
          {!props.required && value ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${props.label}をクリア`}
              disabled={inactive || open}
              accessibilityState={{ disabled: inactive || open }}
              hitSlop={1}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onPress={() => {
                if (inactive || open) return;
                setPickerError(undefined);
                onValueChange("");
              }}
              style={[styles.clear, { minWidth: touchSize, minHeight: inputHeight - 2 }]}
            >
              <PickerIcon mode="clear" color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {Platform.OS === "ios" ? (
        <Modal
          visible={open && !badBounds}
          animationType={reduceMotion ? "none" : "slide"}
          presentationStyle="pageSheet"
          onRequestClose={dismiss}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[4] }}>
              <Text variant="heading">{props.label}</Text>
              {!badBounds ? (
                <DateTimePicker
                  style={{ alignSelf: "center" }}
                  value={draft}
                  mode={mode}
                  display={mode === "date" ? "inline" : "spinner"}
                  locale="ja-JP"
                  themeVariant={appearance}
                  textColor={mode === "time" ? colors.foreground : undefined}
                  accentColor={colors.primary}
                  minimumDate={mode === "date" ? minimum : undefined}
                  maximumDate={mode === "date" ? maximum : undefined}
                  onValueChange={(_event, date) => setDraft(date)}
                  accessibilityLabel={props.label}
                />
              ) : null}
              {draftError ? (
                <Text accessibilityRole="alert" style={{ color: colors.danger }}>
                  {draftError}
                </Text>
              ) : null}
              <View style={{ gap: spacing[2] }}>
                <Button
                  title={mode === "date" ? "日付を決定" : "時刻を決定"}
                  disabled={inactive || Boolean(draftError)}
                  onPress={() => {
                    if (inactive || draftError) return;
                    commit(draft);
                    dismiss();
                  }}
                />
                <Button title="キャンセル" variant="outline" onPress={dismiss} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      ) : null}
    </FormControlFrame>
  );
}

export function DateInput(props: DateInputProps) {
  return <PickerInput {...props} mode="date" />;
}

export function TimeInput(props: TimeInputProps) {
  return <PickerInput {...props} mode="time" />;
}

const styles = StyleSheet.create({
  focusFrame: { borderWidth: 2, borderRadius: radii.lg + 4, padding: 2 },
  input: { flexDirection: "row", alignItems: "stretch", borderWidth: 1, borderRadius: radii.lg },
  pickerField: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2] - 1,
    borderRadius: radii.lg,
  },
  fieldValue: {
    flex: 1,
    flexShrink: 1,
    textAlign: "left",
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  clear: { alignItems: "center", justifyContent: "center", borderRadius: radii.lg },
  icon: { width: 20, height: 20, flexShrink: 0 },
  calendarOutline: {
    position: "absolute",
    left: 2,
    top: 4,
    width: 16,
    height: 14,
    borderWidth: 1.75,
    borderRadius: 2,
  },
  calendarDivider: { position: "absolute", left: 2, top: 8, width: 16, borderTopWidth: 1.75 },
  calendarBinding: { position: "absolute", top: 1, width: 1.75, height: 6, borderRadius: 1 },
  calendarDay: { position: "absolute", top: 11, left: 6, width: 3, height: 3, borderRadius: 0.5 },
  clockOutline: { position: "absolute", inset: 1, borderWidth: 1.75, borderRadius: 10 },
  clockHour: { position: "absolute", top: 5, left: 9, width: 1.75, height: 5, borderRadius: 1 },
  clockMinute: { position: "absolute", top: 9, left: 9, width: 5, height: 1.75, borderRadius: 1 },
  clearLine: { position: "absolute", top: 9, left: 3, width: 14, height: 1.75, borderRadius: 1 },
});
