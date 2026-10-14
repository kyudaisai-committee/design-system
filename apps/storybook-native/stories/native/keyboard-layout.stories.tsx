import type { Meta, StoryObj } from "@storybook/react-native";

import { Button, EmailInput, Field, Notice, Text } from "@kyudaisai/ui-native";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Alert, Keyboard, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function KeyboardLayout({ withError = false }: { withError?: boolean }) {
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(withError);
  const [saved, setSaved] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return (
    <View style={{ gap: 16 }}>
      <Text variant="title">入力中も操作を見失わない</Text>
      <Text>
        文字を拡大し、キーボードを開いて入力・エラー・保存の位置を確認できます。日本語の変換確定だけでは保存しません。
      </Text>
      <Text tone="muted">
        文字倍率 {fontScale.toFixed(2)} ／ 上端 {Math.round(insets.top)}・下端{" "}
        {Math.round(insets.bottom)} ／ 動きを減らす {reduceMotion ? "有効" : "無効"}
      </Text>
      <Field
        label="説明"
        required
        multiline
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setSaved(false);
        }}
        error={error ? "説明を入力してください。" : undefined}
        hint="長い文章でも、入力した内容を保持します。"
      />
      <EmailInput
        label="連絡先"
        value={email}
        onValueChange={(text) => {
          setEmail(text);
          setSaved(false);
        }}
      />
      <Button
        title="入力を保存"
        onPress={() => {
          if (!value.trim()) {
            setError(true);
            return;
          }
          setError(false);
          setSaved(true);
          Keyboard.dismiss();
        }}
      />
      <Button
        title="編集を終了"
        variant="outline"
        onPress={() => {
          if ((!value && !email) || saved) {
            setValue("");
            setEmail("");
            setError(false);
            setSaved(false);
            return;
          }
          Alert.alert("入力を破棄しますか？", "保存していない入力が失われます。", [
            { text: "編集を続ける", style: "cancel" },
            {
              text: "破棄する",
              style: "destructive",
              onPress: () => {
                setValue("");
                setEmail("");
                setError(false);
                setSaved(false);
              },
            },
          ]);
        }}
      />
      {saved ? (
        <Notice tone="success" title="保存しました">
          この見本では入力を画面内に保持しています。
        </Notice>
      ) : null}
    </View>
  );
}
const meta = { title: "Native/KeyboardAndLayout", render: () => <KeyboardLayout /> } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const SystemSettings: Story = {};
export const ValidationError: Story = { render: () => <KeyboardLayout withError /> };
export const Dark: Story = { parameters: { nativeTheme: "dark" } };
