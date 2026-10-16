import { spacing, typography } from "@kyudaisai/tokens/native";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text as NativeText,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputInstance,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Field, Text, type FieldProps } from "./components";
import {
  FormControlFrame,
  FormChoiceOptions,
  choiceHint,
  controlHint,
  type FormControlProps,
} from "./form-control-parts";
import { useNativeTheme } from "./theme";
import { useReducedMotion } from "./use-reduced-motion";

export interface FormTextInputProps extends Omit<
  FieldProps,
  "value" | "onChangeText" | "editable" | "readOnly"
> {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

function TextControl({
  value,
  onValueChange,
  disabled = false,
  readOnly = false,
  hint,
  ...props
}: FormTextInputProps) {
  return (
    <Field
      {...props}
      value={value}
      editable={!disabled}
      readOnly={readOnly}
      hint={hint}
      onChangeText={(next) => {
        if (!disabled && !readOnly) onValueChange(next);
      }}
    />
  );
}

type PurposeInputProps = Omit<
  FormTextInputProps,
  | "autoComplete"
  | "textContentType"
  | "keyboardType"
  | "inputMode"
  | "autoCapitalize"
  | "autoCorrect"
  | "multiline"
  | "secureTextEntry"
>;

export type EmailInputProps = PurposeInputProps;

export function EmailInput(props: EmailInputProps) {
  return (
    <TextControl
      {...props}
      // inputMode takes precedence over keyboardType, so omit it for iOS ASCII input.
      keyboardType={Platform.OS === "ios" ? "ascii-capable" : "email-address"}
      inputMode={Platform.OS === "ios" ? undefined : "email"}
      autoComplete="email"
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
    />
  );
}

export type UrlInputProps = PurposeInputProps;

export function UrlInput(props: UrlInputProps) {
  return (
    <TextControl
      {...props}
      keyboardType={Platform.OS === "ios" ? "ascii-capable" : "url"}
      inputMode={Platform.OS === "ios" ? undefined : "url"}
      autoComplete={Platform.OS === "ios" ? "url" : "off"}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
    />
  );
}

export interface OtpInputProps extends Omit<PurposeInputProps, "maxLength"> {
  length?: number;
}

/** The visible digits are decorative; one native input owns selection, paste and autofill. */
export function OtpInput({
  length = 6,
  label,
  hint,
  error,
  required,
  disabled = false,
  readOnly = false,
  value,
  onValueChange,
  onFocus,
  onBlur,
  onSelectionChange,
  selection,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ref,
  style,
  testID = "otp-input",
  ...props
}: OtpInputProps) {
  const { colors, mode } = useNativeTheme();
  const { width, fontScale } = useWindowDimensions();
  const digits = Number.isFinite(length) ? Math.max(1, Math.floor(length)) : 6;
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState({ start: value.length, end: value.length });
  const [availableWidth, setAvailableWidth] = useState(width - spacing[8]);
  const [measuredDigit, setMeasuredDigit] = useState<{ width: number; scale: number }>();
  const [nativeDigitWidth, setNativeDigitWidth] = useState(typography.heading.fontSize * 0.65);
  const input = useRef<TextInputInstance>(null);
  const scroll = useRef<ScrollViewInstance>(null);
  useImperativeHandle(ref, () => input.current!, []);
  const canEdit = !disabled && !readOnly;
  const gap = spacing[2];
  const digitWidth =
    measuredDigit?.scale === fontScale
      ? measuredDigit.width
      : typography.heading.fontSize * fontScale * 0.65;
  const cellWidth = Math.max(
    32,
    digitWidth + spacing[3],
    Math.min(48, (availableWidth - gap * (digits - 1)) / digits),
  );
  const cellHeight = Math.max(
    Platform.OS === "android" ? 48 : 44,
    typography.heading.lineHeight * fontScale + spacing[4],
  );
  const contentWidth = cellWidth * digits + gap * (digits - 1);
  const currentSelection = selection
    ? { start: selection.start, end: selection.end ?? selection.start }
    : position;
  const active = Math.min(currentSelection.start, value.length, digits - 1);
  const inputHint = controlHint(`${digits}桁の数字を入力してください。`, hint);
  useEffect(() => {
    if (focused) {
      const offset = Math.max(0, (active + 1) * (cellWidth + gap) - availableWidth);
      scroll.current?.scrollTo({ x: offset, animated: false });
    }
  }, [active, availableWidth, cellWidth, focused, gap]);
  return (
    <FormControlFrame
      label={label}
      hint={inputHint}
      error={error}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
    >
      <View onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}>
        <Text
          testID={`${testID}-measure-visible`}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{
            position: "absolute",
            opacity: 0,
            fontSize: typography.heading.fontSize,
            lineHeight: undefined,
            fontVariant: ["tabular-nums"],
            includeFontPadding: false,
          }}
          onTextLayout={(event) => {
            const measured = event.nativeEvent.lines[0]?.width;
            if (measured)
              setMeasuredDigit((previous) =>
                previous?.width === measured && previous.scale === fontScale
                  ? previous
                  : { width: measured, scale: fontScale },
              );
          }}
        >
          0
        </Text>
        <NativeText
          testID={`${testID}-measure-native`}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          allowFontScaling={false}
          maxFontSizeMultiplier={0}
          style={{
            position: "absolute",
            opacity: 0,
            fontSize: typography.heading.fontSize,
            fontWeight: typography.body.fontWeight,
            lineHeight: undefined,
            fontVariant: ["tabular-nums"],
            includeFontPadding: false,
          }}
          onTextLayout={(event) => {
            const measured = event.nativeEvent.lines[0]?.width;
            if (measured) setNativeDigitWidth(measured);
          }}
        >
          0
        </NativeText>
        <ScrollView
          ref={scroll}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={contentWidth > availableWidth}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: contentWidth > availableWidth ? "flex-start" : "center",
          }}
        >
          <View style={{ width: contentWidth, height: cellHeight }}>
            <View
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ flexDirection: "row", gap, opacity: disabled ? 0.5 : 1 }}
            >
              {Array.from({ length: digits }, (_, index) => {
                const selected =
                  focused &&
                  canEdit &&
                  currentSelection.start !== currentSelection.end &&
                  index >= currentSelection.start &&
                  index < currentSelection.end;
                const isActive = focused && canEdit && (selected || index === active);
                return (
                  <View
                    key={index}
                    testID={`${testID}-digit-${index + 1}`}
                    style={{
                      width: cellWidth,
                      height: cellHeight,
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottomWidth: isActive ? 3 : 1,
                      borderBottomColor: error
                        ? colors.danger
                        : isActive
                          ? colors.ring
                          : colors.input,
                      backgroundColor: selected || !canEdit ? colors.muted : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: typography.heading.fontSize,
                        lineHeight: undefined,
                        includeFontPadding: false,
                        textAlign: "center",
                        fontVariant: ["tabular-nums"],
                        color: error ? colors.danger : colors.foreground,
                      }}
                    >
                      {value[index] ?? ""}
                    </Text>
                  </View>
                );
              })}
            </View>
            <TextInput
              {...props}
              ref={input}
              testID={testID}
              value={value}
              selection={selection}
              editable={canEdit}
              readOnly={!canEdit}
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
              importantForAutofill="yes"
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline={false}
              // Only this invisible editing layer uses a fixed font; visible digits scale above.
              allowFontScaling={false}
              maxFontSizeMultiplier={0}
              caretHidden
              keyboardAppearance={mode}
              underlineColorAndroid="transparent"
              accessibilityLabel={`${accessibilityLabel ?? label}${required ? "、必須" : ""}`}
              accessibilityHint={controlHint(
                inputHint,
                readOnly ? "読み取り専用" : undefined,
                error ? `エラー: ${error}` : undefined,
                accessibilityHint,
              )}
              accessibilityState={{ ...accessibilityState, disabled }}
              selectionColor={colors.ring}
              style={[
                style,
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: contentWidth,
                  height: cellHeight,
                  fontSize: typography.heading.fontSize,
                  fontWeight: typography.body.fontWeight,
                  fontVariant: ["tabular-nums"],
                  letterSpacing: cellWidth + gap - nativeDigitWidth,
                  paddingLeft: (cellWidth - nativeDigitWidth) / 2,
                  paddingRight: 0,
                  paddingVertical: 0,
                  lineHeight: undefined,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                  color: "transparent",
                  backgroundColor: "transparent",
                },
              ]}
              onFocus={(event) => {
                setFocused(true);
                onFocus?.(event);
              }}
              onBlur={(event) => {
                setFocused(false);
                onBlur?.(event);
              }}
              onSelectionChange={(event) => {
                setPosition(event.nativeEvent.selection);
                onSelectionChange?.(event);
              }}
              onChangeText={(next) => {
                if (!canEdit) return;
                const ascii = next.replace(/[０-９]/g, (character) =>
                  String.fromCharCode(character.charCodeAt(0) - 0xfee0),
                );
                onValueChange(ascii.replace(/\D/g, "").slice(0, digits));
              }}
            />
          </View>
        </ScrollView>
      </View>
      {contentWidth > availableWidth ? (
        <Text variant="caption" tone="muted">
          コードは左右にスクロールできます。
        </Text>
      ) : null}
    </FormControlFrame>
  );
}

export interface NumberInputProps extends PurposeInputProps {
  min?: number;
  max?: number;
  integer?: boolean;
}

function numberError(value: string, min?: number, max?: number, integer?: boolean) {
  if (value === "") return undefined;
  if (!/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value) || !Number.isFinite(Number(value)))
    return "数値を入力してください。";
  const number = Number(value);
  if (integer && !Number.isInteger(number)) return "整数を入力してください。";
  if (min !== undefined && number < min) return `${min}以上で入力してください。`;
  if (max !== undefined && number > max) return `${max}以下で入力してください。`;
  return undefined;
}

/** Keeps empty, negative-sign and decimal drafts as strings; validates after blur. */
export function NumberInput({
  min,
  max,
  integer = false,
  hint,
  error,
  onBlur,
  ...props
}: NumberInputProps) {
  const [checked, setChecked] = useState(false);
  const allowNegative = min === undefined || min < 0;
  const limits = [
    integer ? "整数" : "数値",
    min !== undefined ? `${min}以上` : undefined,
    max !== undefined ? `${max}以下` : undefined,
  ]
    .filter(Boolean)
    .join("・");
  return (
    <TextControl
      {...props}
      hint={controlHint(limits, hint)}
      error={error ?? (checked ? numberError(props.value, min, max, integer) : undefined)}
      keyboardType={
        allowNegative
          ? Platform.OS === "ios"
            ? "numbers-and-punctuation"
            : "numeric"
          : integer
            ? "number-pad"
            : "decimal-pad"
      }
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      onBlur={(event) => {
        setChecked(true);
        onBlur?.(event);
      }}
    />
  );
}

export interface FormChoiceOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectInputProps extends FormControlProps {
  options: readonly FormChoiceOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function SelectInput({
  options,
  value,
  onValueChange,
  placeholder = "選択してください",
  ...props
}: SelectInputProps) {
  const { colors } = useNativeTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const inactive = Boolean(props.disabled || props.readOnly);
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    if (inactive) setOpen(false);
  }, [inactive]);
  function choose(next: string) {
    if (inactive) return;
    onValueChange(next);
    setOpen(false);
  }
  return (
    <FormControlFrame {...props}>
      <Button
        title={selected?.label ?? (value ? "選択肢を確認してください" : placeholder)}
        variant="outline"
        disabled={inactive}
        accessibilityLabel={`${props.label}、${selected?.label ?? (value ? "選択肢を確認してください" : "未選択")}${props.required ? "、必須" : ""}`}
        accessibilityHint={controlHint(
          props.hint,
          props.readOnly ? "読み取り専用" : undefined,
          props.error ? `エラー: ${props.error}` : undefined,
        )}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
      />
      <Modal
        visible={open}
        animationType={reduceMotion ? "none" : "slide"}
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}>
            <Text variant="heading">{props.label}</Text>
            {options.map((option) => (
              <View key={option.value} style={{ gap: spacing[1] }}>
                <Button
                  title={option.label}
                  variant={option.value === value ? "default" : "outline"}
                  disabled={option.disabled || inactive}
                  accessibilityLabel={`${props.label}、${option.label}`}
                  accessibilityHint={option.description}
                  accessibilityState={{ selected: option.value === value }}
                  onPress={() => choose(option.value)}
                />
                {option.description ? <Text tone="muted">{option.description}</Text> : null}
              </View>
            ))}
            {!props.required ? (
              <Button title="選択をクリア" variant="ghost" onPress={() => choose("")} />
            ) : null}
            <Button title="閉じる" variant="outline" onPress={() => setOpen(false)} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </FormControlFrame>
  );
}

export interface CheckboxGroupProps extends FormControlProps {
  options: readonly FormChoiceOption[];
  value: readonly string[];
  onValueChange: (value: string[]) => void;
  minSelections?: number;
  maxSelections?: number;
}

export function CheckboxGroup({
  options,
  value,
  onValueChange,
  minSelections,
  maxSelections,
  hint,
  ...props
}: CheckboxGroupProps) {
  const combinedHint = controlHint(hint, choiceHint(minSelections, maxSelections));
  return (
    <FormControlFrame {...props} hint={combinedHint}>
      <FormChoiceOptions
        {...props}
        hint={combinedHint}
        options={options}
        value={value}
        onValueChange={onValueChange}
        maxSelections={maxSelections}
      />
    </FormControlFrame>
  );
}
