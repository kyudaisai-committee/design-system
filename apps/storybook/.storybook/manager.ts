import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "九大祭 Design System",
    brandUrl: "/",
    brandTarget: "_self",
    colorPrimary: "#171717",
    colorSecondary: "#404040",
    appBg: "#fafafa",
    appContentBg: "#ffffff",
    appBorderColor: "#e5e5e5",
    appBorderRadius: 6,
    fontBase: '"Hiragino Sans", "Noto Sans JP", sans-serif',
    fontCode: "ui-monospace, monospace",
    textColor: "#171717",
    barSelectedColor: "#171717",
  }),
  sidebar: { showRoots: true },
});
