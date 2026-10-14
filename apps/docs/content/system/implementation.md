---
title: Webへの組み込み
description: Webコンポーネント、共通スタイル、テーマの使い方。
---

Web画面には、共通コンポーネントとスタイルをまとめた`@kyudaisai/ui`を使います。Reactでの利用を想定しています。部品を選ぶときは[コンポーネント一覧](/storybook/?path=/story/overview-component-catalog--browse)、配色や配置の判断には[システムのデザイン](./DESIGN.md)を参照してください。

パッケージは公開レジストリでは配布していません。React 19とReact DOM 19を使うプロジェクトで利用します。pnpm 11では、提供されたパッケージをプロジェクト内に展開し、ローカルディレクトリとして追加します。

```sh
mkdir -p vendor/kyudaisai-ui
tar -xzf /path/to/kyudaisai-ui-0.1.0.tgz --strip-components=1 -C vendor/kyudaisai-ui
pnpm add file:./vendor/kyudaisai-ui
```

`vendor/kyudaisai-ui` は利用先のリポジトリでも管理してください。npmを使うプロジェクトでは、`npm install /path/to/kyudaisai-ui-0.1.0.tgz` で直接追加できます。

リポジトリ内ではワークスペース依存として利用します。以下は導入後の組み込み例です。

## コンポーネントとスタイルを読み込む

```tsx
import "@kyudaisai/ui/styles.css";
import { Button, Field, Input } from "@kyudaisai/ui";

export function ProjectNameField() {
  return (
    <div className="ds-root">
      <Field label="企画名" required>
        {(props) => <Input {...props} name="projectName" />}
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

| 用途                           | コンポーネント                      |
| ------------------------------ | ----------------------------------- |
| ラベル、補足、エラーを持つ入力 | Field、Input、Textarea              |
| 長い確認文を伴う選択           | LabeledCheckbox                     |
| 状態と次の行動の表示           | StatusBadge、Notice                 |
| 読み込み中・データがない状態   | LoadingState、EmptyState            |
| 実行後の失敗・再試行も扱う確認 | ConfirmDialog                       |
| 段階、出来事、期限の表示       | ProcessSteps、Timeline、DateDetails |

入力内容に応じて、EmailInput、UrlInput、OtpInput、NumberInput、DateInput、TimeInputを使い分けます。ラベル・補足・エラーはFieldで入力欄に結び付けます。確認コードの送信や照合は利用側で行い、部品は入力と修正を扱います。

DateInputは`YYYY/MM/DD`で直接入力するか、日本語のカレンダーから選びます。カレンダーでは日を押すと入力欄に反映して閉じます。矢印キーや年月の移動だけでは確定せず、Enterで選択します。Escapeで閉じると入力値を保持します。`value`と`onValueChange`には`YYYY-MM-DD`を使い、`name`を指定したフォームでもこの形式で値を渡します。

TimeInputは24時間表記の`HH:mm`を使います。DateInput・TimeInputの形式や範囲は、画面に表示する入力欄で検証します。`noValidate`のフォームで独自に検証する場合は、各部品の`ref.current.validity`を参照してください。

複数選択にはCheckboxGroup、ファイルの選択にはFileInput、同じ項目の追加・削除にはRepeater、行列の入力にはInputTableを使います。SocialProfileInputは、利用側から渡されたプロフィール候補を選ぶ部品です。アカウントの登録や外部サービスとの連携は扱いません。

[入力部品の配置例](/storybook/?path=/story/patterns-formlayout--default)には、一行・複数行入力、入力できる文字の制約、選択項目、日付・時刻、添付、繰り返し・表形式の項目をまとめています。項目ごとの必須・エラー・無効・読み取り専用の状態は、各部品のStoryで確認できます。

基礎部品にはshadcn/uiとBase UIを使っています。共通の配色・寸法・操作に合わせて調整しているため、引数や表示はこのサイトのStorybookで確認してください。

## 表示と業務処理を分ける

共有部品は、表示と操作のための部品です。権限、期限、受付結果、二重処理の防止は、利用するシステム側で扱います。未保存の入力をいつ初期化するかも、フォーム側で明示します。

組み込んだ後は、キーボード、読み上げ、狭い画面、文字拡大、ライト・ダークで確認してください。入力から結果表示までの確認には[画面と操作](./patterns.md)を使います。アプリ向けの設計は[Web・アプリの設計](./native.md)を参照してください。
