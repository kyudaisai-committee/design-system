import { colors } from "@kyudaisai/tokens/native";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

export type NativeThemeMode = "system" | "light" | "dark";
export type NativeColors = { [Key in keyof typeof colors.light]: string };
export type NativeTheme = {
  colors: NativeColors;
  mode: "light" | "dark";
};

const ThemeContext = createContext<NativeThemeMode>("system");

export function NativeThemeProvider({
  mode = "system",
  children,
}: {
  mode?: NativeThemeMode;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={mode}>{children}</ThemeContext.Provider>;
}

/** Follows changes to the OS appearance unless the provider sets a mode. */
export function useNativeTheme(): NativeTheme {
  const preference = useContext(ThemeContext);
  const systemMode = useColorScheme();
  const mode = preference === "system" ? (systemMode === "dark" ? "dark" : "light") : preference;
  return useMemo(() => ({ colors: colors[mode], mode }), [mode]);
}
