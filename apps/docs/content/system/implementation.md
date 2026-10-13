---
title: Webへの組み込み
description: Webコンポーネント、共通スタイル、テーマの使い方。
---

Web画面には、共通コンポーネントとスタイルをまとめた`@kyudaisai/ui`を使います。Reactでの利用を想定しています。部品を選ぶときは[コンポーネント一覧](/storybook/?path=/story/overview-component-catalog--browse)、配色や配置の判断には[システムのデザイン](./DESIGN.md)を参照してください。

パッケージは公開レジストリでは配布していません。以下はパッケージを利用できる開発環境向けの組み込み例です。

## コンポーネントとスタイルを読み込む

```tsx
import "@kyudaisai/ui/styles.css";
import { Button, Field, Input } from "@kyudaisai/ui";

export function ProjectNameField() {
  return (
    <div className="ds-root">
      <Field label="企画名" required>
        {props => <Input {...props} name="projectName" />}
      </Field>
      <Button type="submit">下書きを保存</Button>
    </div>
  );
}
```

この例は、保存処理を持つフォームの内側に配置します。`Field`でラベル・補足・エラーを入力欄と結び付け、保存中や失敗時の表示はフォーム全体で扱います。回答の保存や提出は、利用するシステム側で実装してください。

`styles.css`には部品に必要なCSSを含みます。利用するアプリでTailwind CSSを追加処理する必要はありません。色や寸法の設定値だけを使う場合は、`@kyudaisai/ui/tokens.css`を読み込みます。

## テーマは画面全体に指定する

`html`などの共通の祖先要素に、ライトモードは`data-theme="light"`、ダークモードは`data-theme="dark"`を指定します。

Dialogなどは本文の外側へ描画されるため、一部分のコンテナだけにテーマを指定すると表示が揃いません。本文と、開いたメニュー・ダイアログを同じテーマで確認してください。

## 部品を組み合わせる

基本の入力やボタンに加え、用途に合わせた組み合わせを用意しています。

| 用途 | コンポーネント |
| --- | --- |
| ラベル、補足、エラーを持つ入力 | Field、Input、Textarea |
| 長い確認文を伴う選択 | LabeledCheckbox |
| 状態と次の行動の表示 | StatusBadge、Notice |
| 読み込み中・データがない状態 | LoadingState、EmptyState |
| 実行後の失敗・再試行も扱う確認 | ConfirmDialog |
| 段階、出来事、期限の表示 | ProcessSteps、Timeline、DateDetails |

基礎部品にはshadcn/uiとBase UIを使っています。共通の配色・寸法・操作に合わせて調整しているため、引数や表示はこのサイトのStorybookで確認してください。

## 表示と業務処理を分ける

共有部品は、表示と操作のための部品です。権限、期限、受付結果、二重処理の防止は、利用するシステム側で扱います。未保存の入力をいつ初期化するかも、フォーム側で明示します。

組み込んだ後は、キーボード、読み上げ、狭い画面、文字拡大、ライト・ダークで確認してください。入力から結果表示までの確認には[画面と操作](./patterns.md)を使います。アプリ向けの設計は[Web・アプリの設計](./native.md)を参照してください。
