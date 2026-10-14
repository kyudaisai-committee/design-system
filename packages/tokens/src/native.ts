// Generated from packages/tokens/src/tokens.json. Do not edit; run pnpm tokens:build.
// Lengths use a 16px rem baseline and native density-independent units.
// Leave fontFamily to the native UI so each OS uses its system font.
// Typography lineHeight is an absolute length; motion durations are milliseconds.

export const colors = {
  "light": {
    "background": "#ffffff",
    "foreground": "#0a0a0a",
    "card": "#ffffff",
    "cardForeground": "#0a0a0a",
    "primary": "#171717",
    "primaryForeground": "#fafafa",
    "secondary": "#f5f5f5",
    "secondaryForeground": "#171717",
    "muted": "#f5f5f5",
    "mutedForeground": "#636363",
    "border": "#e5e5e5",
    "input": "#717171",
    "ring": "#484848",
    "destructive": "#b91c1c",
    "destructiveForeground": "#ffffff",
    "success": "#166534",
    "successBackground": "#f0fdf4",
    "warning": "#854d0e",
    "warningBackground": "#fefce8",
    "danger": "#991b1b",
    "dangerBackground": "#fef2f2",
    "info": "#1e40af",
    "infoBackground": "#eff6ff",
    "sidebar": "#f5f5f5",
    "sidebarForeground": "#0a0a0a",
    "sidebarPrimary": "#171717",
    "sidebarPrimaryForeground": "#fafafa",
    "sidebarAccent": "#e1e1e1",
    "sidebarAccentForeground": "#0a0a0a",
    "sidebarBorder": "#e5e5e5",
    "sidebarRing": "#484848"
  },
  "dark": {
    "background": "#0a0a0a",
    "foreground": "#fafafa",
    "card": "#171717",
    "cardForeground": "#fafafa",
    "primary": "#e5e5e5",
    "primaryForeground": "#171717",
    "secondary": "#262626",
    "secondaryForeground": "#fafafa",
    "muted": "#262626",
    "mutedForeground": "#aeaeae",
    "border": "#484848",
    "input": "#8f8f8f",
    "ring": "#bebebe",
    "destructive": "#fca5a5",
    "destructiveForeground": "#450a0a",
    "success": "#bbf7d0",
    "successBackground": "#052e16",
    "warning": "#fef08a",
    "warningBackground": "#422006",
    "danger": "#fecaca",
    "dangerBackground": "#450a0a",
    "info": "#bfdbfe",
    "infoBackground": "#172554",
    "sidebar": "#171717",
    "sidebarForeground": "#fafafa",
    "sidebarPrimary": "#e5e5e5",
    "sidebarPrimaryForeground": "#171717",
    "sidebarAccent": "#333333",
    "sidebarAccentForeground": "#fafafa",
    "sidebarBorder": "#484848",
    "sidebarRing": "#bebebe"
  }
} as const;

export const typography = {
  "title": {
    "fontSize": 28,
    "fontWeight": "600",
    "lineHeight": 39.2
  },
  "heading": {
    "fontSize": 20,
    "fontWeight": "600",
    "lineHeight": 28
  },
  "body": {
    "fontSize": 16,
    "fontWeight": "400",
    "lineHeight": 26.4
  },
  "label": {
    "fontSize": 14,
    "fontWeight": "500",
    "lineHeight": 23.1
  },
  "caption": {
    "fontSize": 14,
    "fontWeight": "400",
    "lineHeight": 23.1
  }
} as const;

export const spacing = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "6": 24,
  "8": 32,
  "12": 48
} as const;

export const radii = {
  "none": 0,
  "sm": 6,
  "md": 8,
  "lg": 10,
  "xl": 14
} as const;

export const sizes = {
  "controlHeight": 44,
  "contentWidth": 1152
} as const;

export const motion = {
  "fast": 120
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorTokens = { [Name in keyof typeof colors.light]: string };
export type TypographyRole = keyof typeof typography;

export const nativeTokens = { colors, typography, spacing, radii, sizes, motion } as const;
