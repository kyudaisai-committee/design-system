---
title: React Nativeへの組み込み
description: 共通部品と、写真編集・下部タブなど端末に合わせた部品の利用方法。
---

React Native用の部品は `@kyudaisai/ui-native`、色・文字・余白の値は `@kyudaisai/tokens/native` から読み込みます。Webと色の役割や操作名を揃え、入力・文字拡大・画面端の余白は端末に合わせます。対象はExpo SDK 57とReact Native 0.86です。

利用するアプリでは、`react-native-safe-area-context`、`react-native-svg`、`@react-native-community/datetimepicker`、`expo-glass-effect`も必要です。対応するバージョンは `@kyudaisai/ui-native` の `peerDependencies` に合わせます。

## テーマと画面の基本構成

`NativeThemeProvider` の `mode="system"` はOSの明暗設定に追従します。書体はOSの標準を使い、文字サイズの上限は設けません。`Screen` はセーフエリアとキーボードを考慮したスクロール領域です。

```tsx
import { NativeThemeProvider, Screen, Text, Button } from "@kyudaisai/ui-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export function Example({ onSave }: { onSave: () => void }) {
  return (
    <SafeAreaProvider>
      <NativeThemeProvider mode="system">
        <Screen>
          <Text variant="title">入力内容</Text>
          <Button title="下書きを保存" onPress={onSave} />
        </Screen>
      </NativeThemeProvider>
    </SafeAreaProvider>
  );
}
```

部品を使うアプリで、データの取得、保存、認証、権限の判定を実装します。パッケージは公開レジストリには配布していません。リポジトリ内ではワークスペース依存として利用します。

## 部品と端末操作の見本を確認する

Storybookの `Foundations` では色・文字・余白・形、`Components` では入力・選択・通知・進行表示などの共通部品を扱います。下部タブバーは主要な表示の切替に使い、「保存」などの実行ボタンは含めません。

`Native` には写真・文書の選択、画像編集、共有、セーフエリア、キーボード表示の見本があります。特定のサービスの業務フロー、認証、サーバー処理は含めません。

入力にはEmailInput、UrlInput、OtpInput、NumberInput、DateInput、TimeInputを使います。メールや確認コードに合うキーボード・自動入力を使い、日付と時刻はOSの選択画面で指定します。複数行の文章にはFieldの`multiline`を指定します。

iOSのEmailInput・UrlInputは英字配列で開き、自動入力の用途指定を保ちます。iOSのFieldで半角英数字を入力させる場合は`keyboardType="ascii-capable"`を指定し、優先される`inputMode`は指定しません。Androidではメール・URL・数字などの用途に合うキーボードを指定します。通常の名前・文章には日本語を入力できる標準設定を使います。

DateInputとTimeInputは、Fieldと同じ枠・余白を持つ入力欄です。値を左、カレンダー・時計のアイコンを右に置き、タップするとOSの選択画面を開きます。未入力時は`YYYY/MM/DD`・`HH:mm`を表示します。

DateInputは`YYYY/MM/DD`で表示し、`value`と`onValueChange`には`YYYY-MM-DD`を使います。iOSでは日本語のカレンダーをシート内に表示し、Androidでは端末の言語に従う標準の日付選択画面を開きます。日付・時刻を選んで決定すると入力欄に反映し、キャンセルすると元の値を保持します。TimeInputは24時間表記で表示します。任意項目では、入力欄の右端から値をクリアできます。

選択項目にはSelectInput・CheckboxGroup、ファイルにはFileInput、同じ項目の追加・削除にはRepeater、行列の入力にはInputTableを用意しています。SocialProfileInputは渡されたプロフィール候補を選ぶ部品です。ファイルやプロフィールの取得・保存は利用側で行います。

`Patterns/FormLayout`では、入力部品を項目のまとまりごとに配置した例を確認できます。各項目のラベル、補足、エラーを示し、項目の追加・削除や条件に応じた表示を試せます。

写真編集では1:1・4:3・16:9の比率と切り抜く位置を選び、横幅1280px以内のJPEGを作成します。元画像は上書きしません。OS標準の切り抜き画面も用意していますが、iOSの標準画面では正方形に限られます。

写真や文書は利用者が選んだものだけを扱い、Storybookからサーバーへ送信しません。共有画面を閉じたことを、共有の成功として扱わないでください。撮影が許可されない場合も、写真・文書の選択を使えます。

## 下部タブバーとLiquid Glass

`BottomTabBar`は、対応するiOS 26以降でOSのLiquid Glassを使います。標準の`appearance="auto"`では、角を丸めた浮遊型のバーを表示します。Android・非対応のiOSや、OSで「透明度を下げる」が有効な場合は、不透明なバーに切り替わります。常に不透明な表示にする場合は`appearance="solid"`を指定します。

明暗は`NativeThemeProvider`に従います。「視差効果を減らす」が有効な場合は、ガラス面の操作に伴う効果を止めます。文字や選択状態は、どちらの表示でも同じ意味を持ちます。

利用するアプリには`expo-glass-effect`を追加し、開発ビルドを再作成します。部品はネイティブモジュールとOSの対応状況を確認し、利用できない場合は不透明な表示を使います。[Expoの導入手順](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/)も参照してください。

バーは親の横幅を使い、左右の余白はセーフエリアに4ptを加えます。タブ間と各タブ内の左右余白を抑えて、ラベルの幅を確保します。タブの高さは52pt以上とし、文字サイズや折り返しに応じて広がります。アイコンは22pt、ラベルは14ptを基準にします。

バーはスクロール領域の外に置き、画面下端の余白を確保します。本文に重ねる場合は、バーの実測高さをスクロール領域の下余白にも設定します。

Storybookの`Components/BottomTabBar`で標準表示・不透明表示・明暗・狭い画面を比較できます。

## Storybookを起動する

```sh
pnpm install --frozen-lockfile
pnpm native:build:ios
# Androidでは pnpm native:build:android
```

StorybookはiOS・Android向けです。開発ビルドを一度作成した後は、`pnpm native:dev` で起動します。写真選択・撮影・共有は対応端末で確認してください。

ライト・ダーク、長い日本語、最大の文字拡大、VoiceOver・TalkBack、キーボード表示中の操作を確認します。表示と操作の基準は[Web・アプリの設計](./native.md)を参照してください。
