import { radii, sizes, spacing, typography } from "@kyudaisai/tokens/native";
import { useId, useState, type ReactNode, type Ref } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text as RNText,
  TextInput,
  View,
  useWindowDimensions,
  type PressableProps,
  type TextInputInstance,
  type TextInputProps,
  type TextProps as RNTextProps,
  type TextStyle,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { useNativeTheme, type NativeColors } from "./theme";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const touchSize = Math.max(sizes.controlHeight, Platform.OS === "android" ? 48 : 44);

function toneColors(colors: NativeColors, tone: Tone) {
  if (tone === "neutral") {
    return { foreground: colors.foreground, background: colors.muted };
  }
  return {
    foreground: colors[tone],
    background: colors[`${tone}Background`],
  };
}

export interface TextProps extends RNTextProps {
  variant?: "title" | "heading" | "body" | "label" | "caption";
  tone?: "default" | "muted";
}

export function Text({ variant = "body", tone = "default", style, ...props }: TextProps) {
  const { colors } = useNativeTheme();
  return (
    <RNText
      accessibilityRole={variant === "title" || variant === "heading" ? "header" : undefined}
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={0}
      style={[
        typography[variant] as TextStyle,
        { color: tone === "muted" ? colors.mutedForeground : colors.foreground },
        style,
      ]}
    />
  );
}

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  title: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  loading?: boolean;
}

export function Button({
  title,
  variant = "default",
  disabled = false,
  loading = false,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityState,
  ...props
}: ButtonProps) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;
  const filled = variant === "default" || variant === "destructive";
  const foreground =
    variant === "destructive"
      ? colors.destructiveForeground
      : filled
        ? colors.primaryForeground
        : colors.foreground;
  const background =
    variant === "destructive" ? colors.destructive : filled ? colors.primary : colors.background;

  return (
    <View style={[styles.focusFrame, { borderColor: focused ? colors.ring : "transparent" }]}>
      <Pressable
        {...props}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ ...accessibilityState, disabled: inactive, busy: loading }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        android_ripple={{ color: filled ? colors.primaryForeground : colors.border }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: variant === "ghost" && !pressed ? "transparent" : background,
            borderColor: variant === "outline" ? colors.input : "transparent",
            opacity: inactive ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {loading ? <ActivityIndicator accessible={false} color={foreground} /> : null}
        <Text variant="label" style={[styles.buttonText, { color: foreground }]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

export interface CardProps extends ViewProps {
  title?: string;
}

export function Card({ title, children, style, ...props }: CardProps) {
  const { colors } = useNativeTheme();
  return (
    <View
      {...props}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}
    >
      {title ? (
        <Text variant="heading" style={{ color: colors.cardForeground }}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  ref?: Ref<TextInputInstance>;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  style,
  multiline,
  editable = true,
  readOnly = false,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ref,
  ...props
}: FieldProps) {
  const { colors, mode } = useNativeTheme();
  const { fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const id = useId();
  const canEdit = editable && !readOnly;
  const inputLabel = `${accessibilityLabel ?? label}${required ? "、必須" : ""}`;
  const inputHint = [
    hint,
    readOnly ? "読み取り専用" : undefined,
    error ? `エラー: ${error}` : undefined,
    accessibilityHint,
  ]
    .filter(Boolean)
    .join("。 ");
  const inputHeight = Math.max(
    touchSize,
    Number(typography.body.lineHeight) * fontScale * (multiline ? 3 : 1) + spacing[4],
  );

  return (
    <View style={styles.field}>
      <Text nativeID={`${id}-label`} variant="label">
        {label}
        {required ? "（必須）" : ""}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
      {readOnly ? (
        <Text variant="caption" tone="muted">
          読み取り専用
        </Text>
      ) : null}
      <View style={[styles.focusFrame, { borderColor: focused ? colors.ring : "transparent" }]}>
        <TextInput
          {...props}
          ref={ref}
          multiline={multiline}
          editable={canEdit}
          readOnly={!canEdit}
          allowFontScaling
          maxFontSizeMultiplier={0}
          accessibilityLabel={inputLabel}
          accessibilityHint={inputHint || undefined}
          accessibilityState={{ ...accessibilityState, disabled: !editable }}
          keyboardAppearance={mode}
          placeholderTextColor={colors.mutedForeground}
          selectionColor={colors.ring}
          underlineColorAndroid="transparent"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            typography.body as TextStyle,
            styles.input,
            {
              // Single-line UITextField/EditText already center their native line box.
              // A paragraph lineHeight adds uneven leading around that box on iOS.
              lineHeight: multiline ? typography.body.lineHeight : undefined,
              includeFontPadding: false,
              paddingVertical: multiline ? spacing[2] : 0,
              color: colors.foreground,
              backgroundColor: canEdit ? colors.background : colors.muted,
              borderColor: error ? colors.danger : colors.input,
              minHeight: inputHeight,
              textAlignVertical: multiline ? "top" : "center",
            },
            style,
          ]}
        />
      </View>
      {error ? (
        <Text
          variant="caption"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: colors.danger }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export interface ToggleProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, hint, value, onValueChange, disabled = false }: ToggleProps) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  const { fontScale } = useWindowDimensions();
  return (
    <View
      style={[
        styles.toggle,
        { borderColor: focused ? colors.ring : "transparent", opacity: disabled ? 0.5 : 1 },
        fontScale > 1.4 && styles.toggleStacked,
      ]}
    >
      <View
        style={styles.toggleLabel}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <Text variant="label">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        hitSlop={{ top: 10, right: 8, bottom: 10, left: 8 }}
      />
    </View>
  );
}

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Checkbox({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: CheckboxProps) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.choice,
        {
          borderColor: focused ? colors.ring : "transparent",
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.primary : colors.input,
            backgroundColor: checked ? colors.primary : colors.background,
          },
        ]}
      >
        {checked ? (
          <RNText
            allowFontScaling={false}
            style={{ color: colors.primaryForeground, fontSize: 16, fontWeight: "700" }}
          >
            ✓
          </RNText>
        ) : null}
      </View>
      <Text variant="label" style={styles.choiceLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

export interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const { colors } = useNativeTheme();
  const palette = toneColors(colors, tone);
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <Text variant="caption" style={{ color: palette.foreground }}>
        {label}
      </Text>
    </View>
  );
}

export interface NoticeProps {
  title: string;
  children?: ReactNode;
  tone?: Tone;
}

export function Notice({ title, children, tone = "info" }: NoticeProps) {
  const { colors } = useNativeTheme();
  const palette = toneColors(colors, tone);
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: palette.background, borderColor: palette.foreground },
      ]}
      accessibilityLiveRegion={tone === "danger" ? "assertive" : "polite"}
    >
      <Text
        variant="label"
        accessibilityRole={tone === "danger" ? "alert" : undefined}
        style={{ color: palette.foreground }}
      >
        {title}
      </Text>
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={{ color: palette.foreground }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  const { colors } = useNativeTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      style={styles.loading}
    >
      <ActivityIndicator accessible={false} color={colors.foreground} />
      <Text style={styles.choiceLabel}>{label}</Text>
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <Text variant="heading">{title}</Text>
      {description ? <Text tone="muted">{description}</Text> : null}
      {action}
    </View>
  );
}

export function Separator() {
  const { colors } = useNativeTheme();
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      style={[styles.separator, { backgroundColor: colors.border }]}
    />
  );
}

export interface ProgressProps {
  label: string;
  value?: number;
}

export function Progress({ label, value }: ProgressProps) {
  const { colors } = useNativeTheme();
  const percent =
    value !== undefined && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : undefined;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: percent === undefined || percent < 100 }}
      accessibilityValue={
        percent === undefined
          ? { text: "処理中" }
          : { min: 0, max: 100, now: percent, text: `${Math.round(percent)}%` }
      }
      style={styles.field}
    >
      <Text variant="label">
        {label}
        {percent === undefined ? " — 処理中" : ` — ${Math.round(percent)}%`}
      </Text>
      {percent === undefined ? (
        <ActivityIndicator
          accessible={false}
          color={colors.foreground}
          style={styles.progressSpinner}
        />
      ) : (
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[styles.progressFill, { width: `${percent}%`, backgroundColor: colors.primary }]}
          />
        </View>
      )}
    </View>
  );
}

export const sequenceIconNames = [
  "circle",
  "edit",
  "upload",
  "search",
  "check",
  "undo",
  "clock",
  "flag",
] as const;

export type SequenceIconName = (typeof sequenceIconNames)[number];

function SequenceIcon({ name, color }: { name: SequenceIconName; color: string }) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {name === "circle" ? <Circle cx={12} cy={12} r={9} /> : null}
      {name === "edit" ? <Path d="m16 3 5 5L8 21H3v-5L16 3Zm-2 2 5 5" /> : null}
      {name === "upload" ? <Path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" /> : null}
      {name === "search" ? (
        <>
          <Circle cx={10.5} cy={10.5} r={6.5} />
          <Path d="m16 16 5 5" />
        </>
      ) : null}
      {name === "check" ? <Path d="m5 12 4 4L19 6" /> : null}
      {name === "undo" ? <Path d="M3 7h11a7 7 0 0 1 0 14M3 7l5-5M3 7l5 5" /> : null}
      {name === "clock" ? (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 6v6l4 2" />
        </>
      ) : null}
      {name === "flag" ? <Path d="M4 22V3c5-4 11 4 16 0v11c-5 4-11-4-16 0" /> : null}
    </Svg>
  );
}

export interface ProcessStep {
  id?: string;
  label: string;
  description?: string;
  /** Optional explicit state, for skipped stages or outcomes that cannot be inferred from order. */
  status?: "complete" | "current" | "upcoming" | "skipped";
  statusLabel?: string;
  metadata?: string;
  tone?: Tone;
  /** A fixed semantic icon; omitting it retains the numbered marker. */
  icon?: SequenceIconName;
}

export interface ProcessStepsProps {
  items: ProcessStep[];
  /** Zero-based index of the current step; items.length marks all steps complete. */
  current: number;
  currentTint?: "neutral" | "info";
}

export function ProcessSteps({ items, current, currentTint = "neutral" }: ProcessStepsProps) {
  const { colors } = useNativeTheme();
  const active = Math.max(
    0,
    Math.min(items.length, Number.isFinite(current) ? Math.floor(current) : 0),
  );
  return (
    <View style={styles.sequence}>
      {items.map((item, index) => {
        const state =
          item.status ?? (index < active ? "complete" : index === active ? "current" : "upcoming");
        const selected = state === "current";
        const completed = state === "complete";
        const status =
          item.statusLabel ??
          (completed ? "完了" : selected ? "進行中" : state === "skipped" ? "対象外" : "未着手");
        const background = selected
          ? currentTint === "info"
            ? colors.infoBackground
            : colors.muted
          : "transparent";
        const statusColor =
          item.tone && item.tone !== "neutral"
            ? toneColors(colors, item.tone).foreground
            : selected
              ? colors.foreground
              : colors.mutedForeground;
        return (
          <View
            key={item.id ?? `${index}-${item.label}`}
            accessible
            accessibilityLabel={`${index + 1}、${item.label}、${selected ? "現在の段階、" : ""}${status}${item.metadata ? `。${item.metadata}` : ""}${item.description ? `。${item.description}` : ""}`}
            style={[
              styles.processItem,
              {
                backgroundColor: background,
                borderLeftColor: selected ? colors.primary : "transparent",
              },
            ]}
          >
            <View
              style={styles.sequenceMarkerColumn}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View
                style={[
                  styles.processMarker,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : colors.background,
                  },
                ]}
              >
                {item.icon ? (
                  <SequenceIcon
                    name={item.icon}
                    color={selected ? colors.primaryForeground : colors.mutedForeground}
                  />
                ) : (
                  <RNText
                    allowFontScaling={false}
                    style={[
                      typography.label as TextStyle,
                      { color: selected ? colors.primaryForeground : colors.mutedForeground },
                    ]}
                  >
                    {index + 1}
                  </RNText>
                )}
              </View>
            </View>
            <View style={styles.sequenceContent}>
              <Text style={{ fontWeight: selected ? "700" : "500" }}>{item.label}</Text>
              <Text
                variant="caption"
                style={{ color: statusColor, fontWeight: selected ? "600" : "400" }}
              >
                {status}
              </Text>
              {item.metadata ? (
                <Text variant="caption" tone="muted">
                  {item.metadata}
                </Text>
              ) : null}
              {item.description ? (
                <Text variant="caption" tone="muted">
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export interface TimelineItem {
  id?: string;
  title: string;
  description?: string;
  /** Display-ready date text; entries are rendered in the supplied order. */
  date: string;
  /** Historical wording retained for accessibility, not rendered as a badge. */
  statusLabel?: string;
  tone?: Tone;
  metadata?: string;
  /** Reuse the same semantic icon as ProcessSteps. Defaults to a dot. */
  icon?: SequenceIconName;
}

export interface TimelineProps {
  items: TimelineItem[];
  orderLabel?: string;
  /** One explicit present state, independent of event order and timestamps. */
  currentStatus?: { label: string; tone?: Tone };
}

export function Timeline({ items, orderLabel, currentStatus }: TimelineProps) {
  const { colors } = useNativeTheme();
  return (
    <View style={styles.timeline}>
      {currentStatus ? (
        <View
          accessible
          accessibilityLabel={`現在の状態、${currentStatus.label}`}
          style={{ alignSelf: "flex-start", marginBottom: spacing[4] }}
        >
          <Badge label={currentStatus.label} tone={currentStatus.tone} />
        </View>
      ) : null}
      {orderLabel ? (
        <Text variant="caption" tone="muted" style={{ marginBottom: spacing[4] }}>
          {orderLabel}
        </Text>
      ) : null}
      {items.map((item, index) => (
        <View
          key={item.id ?? `${index}-${item.title}`}
          style={[styles.timelineItem, index === items.length - 1 && { paddingBottom: 0 }]}
          accessible
          accessibilityLabel={[
            item.date,
            item.title,
            item.statusLabel,
            item.metadata,
            item.description,
          ]
            .filter(Boolean)
            .join("。 ")}
        >
          <View
            style={styles.sequenceMarkerColumn}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {index < items.length - 1 && (
              <View style={[styles.timelineRail, { backgroundColor: colors.border }]} />
            )}
            <View style={[styles.timelineMarker, { backgroundColor: colors.background }]}>
              {item.icon ? (
                <SequenceIcon
                  name={item.icon}
                  color={
                    item.tone && item.tone !== "neutral"
                      ? toneColors(colors, item.tone).foreground
                      : colors.foreground
                  }
                />
              ) : (
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                        item.tone && item.tone !== "neutral"
                          ? toneColors(colors, item.tone).foreground
                          : colors.foreground,
                    },
                  ]}
                />
              )}
            </View>
          </View>
          <View style={styles.sequenceContent}>
            <Text variant="caption" tone="muted">
              {item.date}
            </Text>
            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
            {item.metadata ? (
              <Text variant="caption" tone="muted">
                {item.metadata}
              </Text>
            ) : null}
            {item.description ? <Text>{item.description}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface ChoiceGroupProps {
  label: string;
  options: ChoiceOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

function Choice({
  groupLabel,
  option,
  selected,
  onSelect,
  disabled,
}: {
  groupLabel: string;
  option: ChoiceOption;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${groupLabel}、${option.label}`}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.choice,
        {
          borderColor: focused ? colors.ring : "transparent",
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        accessible={false}
        style={[styles.radio, { borderColor: selected ? colors.primary : colors.input }]}
      >
        {selected ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
      </View>
      <Text variant="label" style={styles.choiceLabel}>
        {option.label}
      </Text>
    </Pressable>
  );
}

export function ChoiceGroup({
  label,
  options,
  value,
  onValueChange,
  disabled = false,
}: ChoiceGroupProps) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
        {options.map((option) => (
          <Choice
            key={option.value}
            groupLabel={label}
            option={option}
            selected={option.value === value}
            disabled={disabled}
            onSelect={() => onValueChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  const { colors } = useNativeTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "android" ? "height" : undefined}
        enabled={Platform.OS === "android"}
      >
        <ScrollView
          contentContainerStyle={styles.screenContent}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentInsetAdjustmentBehavior="never"
        >
          <View style={styles.screenBody}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenContent: { flexGrow: 1, padding: spacing[4] },
  screenBody: { width: "100%", maxWidth: sizes.contentWidth, alignSelf: "center", gap: spacing[6] },
  focusFrame: { borderWidth: 2, borderRadius: radii.lg + 4, padding: 2 },
  button: {
    minHeight: touchSize,
    minWidth: touchSize,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    overflow: "hidden",
  },
  buttonText: { textAlign: "center", flexShrink: 1, includeFontPadding: false },
  card: { borderWidth: 1, borderRadius: radii.xl, padding: spacing[4], gap: spacing[4] },
  field: { gap: spacing[2] },
  input: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  toggle: {
    minHeight: touchSize,
    padding: spacing[2],
    borderWidth: 2,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  toggleStacked: { flexDirection: "column", alignItems: "flex-start" },
  toggleLabel: { flex: 1, gap: spacing[1] },
  choice: {
    minHeight: touchSize,
    minWidth: touchSize,
    padding: spacing[2],
    borderWidth: 2,
    borderRadius: radii.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    overflow: "hidden",
  },
  choiceLabel: { flexShrink: 1, flexGrow: 1, includeFontPadding: false },
  choices: { gap: spacing[1] },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.sm,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  notice: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], gap: spacing[2] },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  empty: { paddingVertical: spacing[6], gap: spacing[3] },
  separator: { height: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  progressTrack: { height: spacing[2], overflow: "hidden", borderRadius: radii.sm },
  progressFill: { height: "100%" },
  progressSpinner: { alignSelf: "flex-start" },
  sequence: { gap: spacing[2] },
  processItem: {
    flexDirection: "row",
    gap: spacing[3],
    padding: spacing[3],
    borderLeftWidth: 3,
    borderRadius: radii.sm,
  },
  sequenceMarkerColumn: { width: spacing[8], alignItems: "center", alignSelf: "stretch" },
  processMarker: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: spacing[4],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sequenceContent: { flex: 1, gap: spacing[2] },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: spacing[3], paddingBottom: spacing[6] },
  timelineRail: {
    position: "absolute",
    width: 2,
    top: spacing[4],
    bottom: -spacing[6],
    left: spacing[4] - 1,
  },
  timelineMarker: {
    width: spacing[8],
    height: spacing[8],
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
});
