import { radii, spacing } from "@kyudaisai/tokens/native";
import { requireOptionalNativeModule } from "expo";
import { useContext, useEffect, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { Text } from "./components";
import { useNativeTheme } from "./theme";

export interface BottomTabIconProps {
  selected: boolean;
  color: string;
  size: number;
}

export interface BottomTabItem {
  value: string;
  label: string;
  disabled?: boolean;
  /** Zero counts are hidden; counts over 99 display as 99+. */
  badge?: number | string;
  badgeAccessibilityLabel?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  renderIcon?: (props: BottomTabIconProps) => ReactNode;
}

export interface BottomTabBarProps extends Omit<ViewProps, "children"> {
  /** Use a small, stable set of top-level destinations, usually three to five. */
  items: readonly BottomTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Native Liquid Glass when supported and permitted by OS settings; otherwise solid. */
  appearance?: "auto" | "solid";
  /** Defaults to the provider's bottom safe area. Set 0 inside an inset container. */
  bottomInset?: number;
}

/**
 * Controlled navigation UI. Place after the screen content, outside its ScrollView.
 * The host navigator owns routes, history, re-selection and the OS back action.
 */
export function BottomTabBar({
  items,
  value,
  onValueChange,
  appearance = "auto",
  bottomInset,
  accessibilityLabel = "メインナビゲーション",
  testID = "bottom-tab-bar",
  style,
  ...props
}: BottomTabBarProps) {
  const { colors, mode } = useNativeTheme();
  const insets = useContext(SafeAreaInsetsContext);
  const hasIcons = items.some((item) => item.renderIcon);
  const [GlassView] = useState(loadGlassView);
  const { reduceTransparency, reduceMotion } = useGlassPreferences(Boolean(GlassView));
  const liquid = appearance === "auto" && GlassView !== null && !reduceTransparency;
  const tabs = items.map((item) => (
    <BottomTab
      key={item.value}
      item={item}
      selected={item.value === value}
      hasIcons={hasIcons}
      liquid={liquid}
      onSelect={onValueChange}
    />
  ));

  return (
    <View
      {...props}
      testID={testID}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.frame,
        {
          backgroundColor: liquid ? "transparent" : colors.background,
          borderTopWidth: liquid ? 0 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingBottom: spacing[1] + Math.max(0, bottomInset ?? insets?.bottom ?? 0),
          paddingLeft: spacing[1] + (insets?.left ?? 0),
          paddingRight: spacing[1] + (insets?.right ?? 0),
        },
        style,
      ]}
    >
      {liquid && GlassView ? (
        <GlassView
          testID={`${testID}-glass`}
          accessible={false}
          colorScheme={mode}
          glassEffectStyle={{ style: "regular", animate: false }}
          isInteractive={!reduceMotion}
          style={[styles.row, styles.glassSurface]}
        >
          {tabs}
        </GlassView>
      ) : (
        <View style={styles.row}>{tabs}</View>
      )}
    </View>
  );
}

/** A JS update may reach a development build before its native module is rebuilt. */
function loadGlassView(): typeof import("expo-glass-effect").GlassView | null {
  if (Platform.OS !== "ios" || Number.parseInt(String(Platform.Version), 10) < 26) return null;
  try {
    if (!requireOptionalNativeModule("ExpoGlassEffect")) return null;
    // Delay the package's native-view registration until the module is present.
    const glass = require("expo-glass-effect") as typeof import("expo-glass-effect");
    return glass.isGlassEffectAPIAvailable() && glass.isLiquidGlassAvailable()
      ? glass.GlassView
      : null;
  } catch {
    return null;
  }
}

function useGlassPreferences(available: boolean) {
  // Keep an opaque, still surface until the OS preferences have been read.
  const [reduceTransparency, setReduceTransparency] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    if (!available) return;
    let mounted = true;
    let transparencyChanged = false;
    let motionChanged = false;
    const transparency = AccessibilityInfo.addEventListener("reduceTransparencyChanged", (next) => {
      transparencyChanged = true;
      setReduceTransparency(next);
    });
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", (next) => {
      motionChanged = true;
      setReduceMotion(next);
    });
    void AccessibilityInfo.isReduceTransparencyEnabled()
      .then((next) => {
        if (mounted && !transparencyChanged) setReduceTransparency(next);
      })
      .catch(() => undefined);
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((next) => {
        if (mounted && !motionChanged) setReduceMotion(next);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      transparency.remove();
      motion.remove();
    };
  }, [available]);
  return { reduceTransparency, reduceMotion };
}

function BottomTab({
  item,
  selected,
  hasIcons,
  liquid,
  onSelect,
}: {
  item: BottomTabItem;
  selected: boolean;
  hasIcons: boolean;
  liquid: boolean;
  onSelect: (value: string) => void;
}) {
  const { colors } = useNativeTheme();
  const [focused, setFocused] = useState(false);
  const foreground = selected ? colors.foreground : colors.mutedForeground;
  const showBadge =
    typeof item.badge === "number"
      ? Number.isFinite(item.badge) && item.badge > 0
      : Boolean(item.badge?.trim());
  const badge = typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge;
  const badgeDescription =
    item.badgeAccessibilityLabel ??
    (typeof item.badge === "number" ? `${item.badge}件` : item.badge);
  const label = [item.accessibilityLabel ?? item.label, showBadge ? badgeDescription : undefined]
    .filter(Boolean)
    .join("、");

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityHint={item.accessibilityHint}
      accessibilityState={{ selected, disabled: Boolean(item.disabled) }}
      aria-selected={selected}
      aria-disabled={Boolean(item.disabled)}
      disabled={item.disabled}
      onPress={() => onSelect(item.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      android_ripple={{ color: colors.border }}
      style={({ pressed }) => [
        styles.tab,
        liquid && styles.glassTab,
        {
          backgroundColor: !liquid && (selected || pressed) ? colors.muted : "transparent",
          borderColor: focused ? colors.ring : "transparent",
          opacity: item.disabled ? 0.5 : 1,
        },
      ]}
    >
      {({ pressed }) => (
        <>
          {liquid ? (
            <View
              pointerEvents="none"
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
              style={[
                styles.glassSelection,
                {
                  backgroundColor: colors.foreground,
                  opacity: pressed ? 0.16 : selected ? 0.1 : 0,
                },
              ]}
            />
          ) : (
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
              style={[
                styles.indicator,
                { backgroundColor: selected ? colors.primary : "transparent" },
              ]}
            />
          )}
          {hasIcons || showBadge ? (
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
              style={styles.symbols}
            >
              {item.renderIcon ? (
                <View style={showBadge ? styles.badgedIcon : undefined}>
                  {item.renderIcon({ selected, color: foreground, size: 22 })}
                </View>
              ) : null}
              {showBadge ? (
                <View
                  style={[
                    styles.badge,
                    item.renderIcon && styles.iconBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text variant="caption" style={{ color: colors.primaryForeground }}>
                    {badge}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Text
            variant="caption"
            accessible={false}
            style={[styles.label, { color: foreground, fontWeight: selected ? "600" : "400" }]}
          >
            {item.label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    paddingTop: spacing[1],
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  glassSurface: { padding: spacing[1], borderRadius: 999, borderCurve: "continuous" },
  glassTab: { borderRadius: 999 },
  glassSelection: { ...StyleSheet.absoluteFill, borderRadius: 999 },
  tab: {
    flex: 1,
    minWidth: Platform.OS === "android" ? 48 : 44,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    borderWidth: 2,
    borderRadius: radii.md,
  },
  indicator: { position: "absolute", top: 0, width: spacing[6], height: 2, borderRadius: 1 },
  symbols: {
    minHeight: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    maxWidth: "100%",
  },
  badgedIcon: { paddingTop: spacing[1] },
  iconBadge: { marginLeft: -spacing[3] },
  badge: {
    minWidth: 24,
    flexShrink: 1,
    alignItems: "center",
    paddingHorizontal: spacing[1],
    borderRadius: radii.xl,
  },
  label: { textAlign: "center", alignSelf: "stretch", flexShrink: 1 },
});
