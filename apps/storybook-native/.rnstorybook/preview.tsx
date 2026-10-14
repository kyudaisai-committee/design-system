import type { Preview } from "@storybook/react-native";

import { NativeThemeProvider, Screen } from "@kyudaisai/ui-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const preview: Preview = {
  initialGlobals: { theme: "system" },
  globalTypes: { theme: { description: "表示テーマ" } },
  args: { theme: "system" },
  argTypes: {
    theme: {
      control: "select",
      options: ["system", "light", "dark"],
      description: "OSの設定・ライト・ダークを切り替えます。",
    },
  },
  decorators: [
    (Story, context) => (
      <SafeAreaProvider>
        <NativeThemeProvider
          mode={
            context.parameters.nativeTheme ??
            context.args.theme ??
            context.globals.theme ??
            "system"
          }
        >
          {context.parameters.nativeFullScreen ? (
            <Story />
          ) : (
            <Screen>
              <Story />
            </Screen>
          )}
        </NativeThemeProvider>
      </SafeAreaProvider>
    ),
  ],
  parameters: { controls: { expanded: true } },
};
export default preview;
