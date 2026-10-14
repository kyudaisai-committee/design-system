import { NativeThemeProvider, Screen, Text } from "@kyudaisai/ui-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <NativeThemeProvider mode="system">
        <Screen>
          <Text variant="title">九大祭 Design System</Text>
          <Text>React Nativeの部品と画面の見本を、Storybookで確認できます。</Text>
        </Screen>
      </NativeThemeProvider>
    </SafeAreaProvider>
  );
}
