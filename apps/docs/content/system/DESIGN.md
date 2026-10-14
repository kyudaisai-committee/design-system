---
name: Kyudaisai System
version: alpha
title: システムのデザイン
description: 申請・予約・受付などに共通する、配色・文字・余白・部品の使い方。
colors:
  background: oklch(1 0 0)
  foreground: oklch(0.145 0 0)
  card: oklch(1 0 0)
  card-foreground: oklch(0.145 0 0)
  primary: oklch(0.205 0 0)
  primary-foreground: oklch(0.985 0 0)
  secondary: oklch(0.97 0 0)
  secondary-foreground: oklch(0.205 0 0)
  muted: oklch(0.97 0 0)
  muted-foreground: oklch(0.5 0 0)
  border: oklch(0.922 0 0)
  input: oklch(0.55 0 0)
  ring: oklch(0.4 0 0)
  destructive: "#b91c1c"
  destructive-foreground: "#fff"
  success: "#166534"
  success-background: "#f0fdf4"
  warning: "#854d0e"
  warning-background: "#fefce8"
  danger: "#991b1b"
  danger-background: "#fef2f2"
  info: "#1e40af"
  info-background: "#eff6ff"
  sidebar: oklch(0.97 0 0)
  sidebar-foreground: oklch(0.145 0 0)
  sidebar-primary: oklch(0.205 0 0)
  sidebar-primary-foreground: oklch(0.985 0 0)
  sidebar-accent: oklch(0.91 0 0)
  sidebar-accent-foreground: oklch(0.145 0 0)
  sidebar-border: oklch(0.922 0 0)
  sidebar-ring: oklch(0.4 0 0)
  dark-background: oklch(0.145 0 0)
  dark-foreground: oklch(0.985 0 0)
  dark-card: oklch(0.205 0 0)
  dark-card-foreground: oklch(0.985 0 0)
  dark-primary: oklch(0.922 0 0)
  dark-primary-foreground: oklch(0.205 0 0)
  dark-secondary: oklch(0.269 0 0)
  dark-secondary-foreground: oklch(0.985 0 0)
  dark-muted: oklch(0.269 0 0)
  dark-muted-foreground: oklch(0.75 0 0)
  dark-border: oklch(0.4 0 0)
  dark-input: oklch(0.65 0 0)
  dark-ring: oklch(0.8 0 0)
  dark-destructive: "#fca5a5"
  dark-destructive-foreground: "#450a0a"
  dark-success: "#bbf7d0"
  dark-success-background: "#052e16"
  dark-warning: "#fef08a"
  dark-warning-background: "#422006"
  dark-danger: "#fecaca"
  dark-danger-background: "#450a0a"
  dark-info: "#bfdbfe"
  dark-info-background: "#172554"
  dark-sidebar: oklch(0.205 0 0)
  dark-sidebar-foreground: oklch(0.985 0 0)
  dark-sidebar-primary: oklch(0.922 0 0)
  dark-sidebar-primary-foreground: oklch(0.205 0 0)
  dark-sidebar-accent: oklch(0.32 0 0)
  dark-sidebar-accent-foreground: oklch(0.985 0 0)
  dark-sidebar-border: oklch(0.4 0 0)
  dark-sidebar-ring: oklch(0.8 0 0)
typography:
  title:
    fontFamily: '"Geist", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif'
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.4
  heading:
    fontFamily: '"Geist", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif'
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Geist", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Geist", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif'
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.65
  caption:
    fontFamily: '"Geist", "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.65
spacing:
  step-1: 0.25rem
  step-2: 0.5rem
  step-3: 0.75rem
  step-4: 1rem
  step-6: 1.5rem
  step-8: 2rem
  step-12: 3rem
rounded:
  none: 0px
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.875rem
omitted:
  - section: components
    reason: 部品の構成・状態・使用コードはStorybookで定義する。YAMLには共有する視覚値を記録する。
---

## Overview

九大祭のシステムでは、対象と状態が読み取りやすく、次の操作を選びやすい画面をつくります。来場者向けの予約から、参加団体の申請、委員の審査・受付まで、共通の考え方で設計します。

白と濃い無彩色を基調に、文字の太さ、余白、細い区切りで情報を整理します。色による強調は、主な操作と注意が必要な箇所に絞ります。比較する一覧には情報を見渡せる密度を保ち、長い説明や入力欄には読みやすい幅と余白を取ります。

部品の表示と操作は[コンポーネント一覧](/storybook/?path=/story/overview-component-catalog--browse)、保存・提出・結果表示は[画面と操作](./patterns.md)、端末による違いは[Web・アプリの設計](./native.md)を参照してください。

## Colors

無彩色で情報の階層をつくり、状態を伝える箇所に色を使います。ライト・ダークのどちらでも色の役割は揃え、文字と背景を一組として切り替えます。

| 役割                     | トークン名                                              | 使い方                                                   |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------------------- |
| 基本の背景と文字         | `background`・`foreground`                              | ページの背景と本文                                       |
| 独立した面               | `card`・`card-foreground`                               | カードやまとまった本文領域                               |
| 主な操作                 | `primary`・`primary-foreground`                         | 保存・提出など、その画面の中心となる操作                 |
| 補助的な表示             | `secondary`、`muted`・`muted-foreground`                | 補助操作、表の見出し、説明、日時                         |
| 区切り・入力・フォーカス | `border`、`input`、`ring`                               | 情報の区切り、入力欄の境界、キーボードで操作している位置 |
| 状態                     | `success`、`warning`、`danger`、`info`と各`-background` | 完了、注意、失敗、案内                                   |
| 取り消し・削除           | `destructive`・`destructive-foreground`                 | 影響を確認して実行する操作                               |

トークンは、色や寸法に役割ごとの名前を付けた共通の設定値です。画面ごとに似た色を追加せず、用途に合う値を使います。[色の見本](/storybook/?path=/story/foundations-colors--palette)で各色を確認できます。

下書き・提出済み・審査中は中立色を基本とし、要修正は注意、処理失敗は危険の色を使います。必ず状態名を添え、色だけで意味を伝えないでください。本文のリンクには下線など、色以外の手がかりも付けます。

通常の文字は背景とのコントラスト比4.5:1以上、大きな文字は3:1以上を基準にします。操作や状態の識別に必要な線・図形は、隣接する色との比率を3:1以上にします。詳しくは[文字のコントラスト](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)と[非テキストのコントラスト](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)を参照してください。

## Typography

英数字にはGeist、日本語には端末で利用できるゴシック体を組み合わせます。指定順はGeist、Hiragino Sans、Noto Sans JP、Yu Gothic、Meiryo、sans-serifです。Geistを読み込まない場合は、後続の書体を使います。

| 用途           | サイズ           | 太さ | 行高 |
| -------------- | ---------------- | ---- | ---- |
| ページタイトル | 1.75rem（28px）  | 600  | 1.4  |
| 節の見出し     | 1.25rem（20px）  | 600  | 1.4  |
| 本文・入力内容 | 1rem（16px）     | 400  | 1.65 |
| 入力ラベル     | 0.875rem（14px） | 500  | 1.65 |
| 補足・比較表   | 0.875rem（14px） | 400  | 1.65 |

pxは基準文字サイズ16pxでの換算値です。入力内容は16pxを保ち、比較表は14pxを基準にします。文字の大きさに加え、太さと前後の余白で見出しの階層を示します。

団体名や企画名は折り返して表示します。金額や件数は右揃えにし、比較する数値の桁を揃えてください。[文字の見本](/storybook/?path=/story/foundations-typography--scale)では、日本語と英数字、長い名称の組み合わせを確認できます。

## Layout

画面の上部に戻り先、タイトルと対象、状態・期限、主な操作を置き、その下に本文を続けます。開催回・団体・企画をタイトルの近くに示すと、操作対象を判断しやすくなります。主な操作は原則一つに絞ります。

画面全体の最大幅は72rem、入力領域は40remです。比較一覧には横幅を使い、長い回答や入力欄は読みやすい幅に収めます。画面端の余白とContentCardの内側は24pxを基準とし、画面幅40rem以下では16pxにします。

余白は4、8、12、16、24、32、48pxから選びます。ラベルと入力欄は8px、横に並ぶ関連操作は12px、情報のまとまり同士は24pxが目安です。枠を増やす前に、余白で区別できるか確認してください。[余白の見本](/storybook/?path=/story/foundations-spacing--scale)

スマートフォンでは本文と操作を縦に並べます。比較表は列の対応を保って、表の領域内を横にスクロールできるようにします。文字を拡大した場合も、本文や操作が重ならない構成にしてください。

標準のButton・Input・NativeSelectは高さ44px以上です。小型のボタンを一覧に置く場合は、隣の操作を押し間違えない間隔を確保します。

## Elevation & Depth

通常の画面は、境界線と余白で情報を分けます。表やカードの影の強さだけで、情報の重要度を示すことは避けます。

Dialogは背景を薄く暗くし、短い編集や確認に集中できるようにします。Sheetは画面端から開く補助領域、DropdownMenuは操作をまとめたメニューとして使います。どちらも、元の画面との関係が分かる程度の境界と影に留めてください。

動きは開閉や操作への応答に使います。共通の短い動きは120msを基準に、Dialogやメニューは100ms、Sheetの移動は200msを使います。端末で動きを減らす設定を選んでいる場合は、アニメーションと、色や位置が徐々に変わる効果を止めます。

キーボードのフォーカスは3pxの線と、その外側の3pxの余白で示します。Dialogを閉じた後は、開くときに使ったボタンへフォーカスを戻します。固定ヘッダーや下部のボタンでフォーカス位置を隠さないようにします。

## Shapes

角丸は部品の役割に合わせて使い分けます。

| 形               | 値               | 主な用途                                      |
| ---------------- | ---------------- | --------------------------------------------- |
| 直線             | 0                | 表の区切り、進行状況の線、画面端に接するSheet |
| 小さい角丸       | 0.375rem（6px）  | StatusBadge                                   |
| コンパクトな角丸 | 0.5rem（8px）    | 小型Button、メニュー項目、Tooltip、Skeleton   |
| 標準の角丸       | 0.625rem（10px） | Button、Input、Textarea、NativeSelect、Notice |
| 面の角丸         | 0.875rem（14px） | Card、ContentCard、Dialog、AlertDialog        |

Checkboxは4pxの角丸、RadioGroupは円、Switchは丸いつまみを使い、入力の種類が形から分かるようにします。短い分類を示すBadgeはカプセル形、状態を示すStatusBadgeは6pxの角丸です。[形の見本](/storybook/?path=/story/foundations-shape--roles)

進行状況の現在位置は、薄い背景、太い線、状態名を組み合わせて示します。背景による強調は現在の段階に絞り、完了・未着手の段階との違いを保ちます。詳しくは[進行状況と履歴](./sequences.md)を参照してください。

## Components

部品は、利用者が何をしたいかに合わせて選びます。各リンク先で表示・状態・操作と使用コードを確認できます。

### 操作・移動

| 部品                                                                 | 選び方                                                                                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Button](/storybook/?path=/docs/components-button--docs)             | 保存・提出などの操作。主操作は標準、補助はoutline、軽い操作はghostを使う。画面遷移にはリンクを使う                                 |
| [Breadcrumb](/storybook/?path=/docs/components-breadcrumb--docs)     | 上位の一覧や分類へ戻る経路。現在のページはリンクにしない                                                                           |
| [Pagination](/storybook/?path=/docs/components-pagination--docs)     | 件数の多い一覧をページごとに移動する。先頭・末尾でも操作の位置を保ち、移動できない側を無効にする                                   |
| [Sidebar](/storybook/?path=/docs/components-sidebar--docs)           | 複数画面をまたぐ主要ナビゲーション。関連項目を見出し付きのグループにまとめ、現在地を示す。狭い画面では開閉するメニューに切り替える |
| [Tabs](/storybook/?path=/docs/components-tabs--docs)                 | 同じ対象の関連する表示を切り替える。手続きの段階表示には使わない                                                                   |
| [DropdownMenu](/storybook/?path=/docs/components-dropdownmenu--docs) | 一つの対象に対する複数の操作をまとめる。主要操作は外に出す                                                                         |

### 入力・選択

| 部品                                                                             | 選び方                                                                |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Input](/storybook/?path=/docs/components-input--docs)                           | 企画名、連絡先などの一行入力。入力に合うtypeと補足を付ける            |
| [Textarea](/storybook/?path=/docs/components-textarea--docs)                     | 紹介文や理由などの複数行入力。長さの条件は入力前に示す                |
| [Checkbox](/storybook/?path=/docs/components-checkbox--docs)                     | 複数選択や内容の確認。一項目だけを選ぶ設問には使わない                |
| [RadioGroup](/storybook/?path=/docs/components-radiogroup--docs)                 | 少数の選択肢を見せて一つ選ぶ。選択肢全体に名前を付ける                |
| [Switch](/storybook/?path=/docs/components-switch--docs)                         | 設定の有効・無効をその場で切り替える                                  |
| [NativeSelect](/storybook/?path=/docs/components-nativeselect--docs)             | OSの選択メニューから一つ選ぶ。選択肢を並べる余地が少ない場合に使う    |
| [Label](/storybook/?path=/docs/components-label--docs)                           | 入力項目の名前を常時表示する。プレースホルダーで代用しない            |
| [Field](/storybook/?path=/docs/components-field--docs)                           | ラベル、補足、入力、エラーをまとめ、入力との関係を伝える              |
| [LabeledCheckbox](/storybook/?path=/docs/components-labeledcheckbox--docs)       | 確認文と押せる領域を一体にする。長い文章を伴う確認に使う              |
| [EmailInput](/storybook/?path=/docs/components-emailinput--docs)                 | メールアドレスの入力。自動入力とメール用キーボードに対応する          |
| [UrlInput](/storybook/?path=/docs/components-urlinput--docs)                     | URLの入力。入力例で必要な形式を伝える                                 |
| [OtpInput](/storybook/?path=/docs/components-otpinput--docs)                     | 確認コードの入力。貼り付け・自動入力・入力の修正に対応する            |
| [NumberInput](/storybook/?path=/docs/components-numberinput--docs)               | 数量などの数値入力。単位、範囲、整数のみかを補足する                  |
| [DateInput](/storybook/?path=/docs/components-dateinput--docs)                   | 日付の入力。選べる範囲がある場合は事前に示す                          |
| [TimeInput](/storybook/?path=/docs/components-timeinput--docs)                   | 時刻の入力。日付とは別の項目として扱う                                |
| [CheckboxGroup](/storybook/?path=/docs/components-checkboxgroup--docs)           | 一つの設問で複数選ぶ。選択数の上限とエラーを設問全体に添える          |
| [FileInput](/storybook/?path=/docs/components-fileinput--docs)                   | ファイルの選択と取り消し。形式、件数、容量の条件を示す                |
| [Repeater](/storybook/?path=/docs/components-repeater--docs)                     | 同じ項目の組を追加・削除する。行を操作しても他の回答を保持する        |
| [InputTable](/storybook/?path=/docs/components-inputtable--docs)                 | 行と列の対応を保って入力する。各セルに行名と項目名を付ける            |
| [SocialProfileInput](/storybook/?path=/docs/components-socialprofileinput--docs) | 登録済みのSNSプロフィールを選ぶ。「アカウントなし」と未回答を区別する |

### 情報・状態

| 部品                                                                 | 選び方                                                                                                           |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [QrCode](/storybook/?path=/docs/components-qrcode--docs)             | 提示カードを基本に、QRコードと対象を表示する。[上部の見出し・提示方法の案内](./qr-code.md)は差し替え・省略できる |
| [Badge](/storybook/?path=/docs/components-badge--docs)               | 種別や開催回など、短い分類を添える                                                                               |
| [StatusBadge](/storybook/?path=/docs/components-statusbadge--docs)   | 状態名とその意味に対応する色を示す。業務状態は利用側で決める                                                     |
| [Alert](/storybook/?path=/docs/components-alert--docs)               | 見出し・本文・アイコンを組み合わせた、画面内に残るメッセージ                                                     |
| [Notice](/storybook/?path=/docs/components-notice--docs)             | 案内・完了・注意・失敗の意味を揃えた通知領域。次の行動も添える                                                   |
| [Card](/storybook/?path=/docs/components-card--docs)                 | 見出し、本文、補助操作を含む独立したまとまり                                                                     |
| [ContentCard](/storybook/?path=/docs/components-contentcard--docs)   | 一定の内側余白を持つ本文領域                                                                                     |
| [Table](/storybook/?path=/docs/components-table--docs)               | 同じ項目で複数の対象を比較する。列と操作に名前を付ける                                                           |
| [Progress](/storybook/?path=/docs/components-progress--docs)         | ファイル送信など、量を測れる処理の進み具合                                                                       |
| [Skeleton](/storybook/?path=/docs/components-skeleton--docs)         | 読み込み後の形を示す。模様を読み上げさせない                                                                     |
| [LoadingState](/storybook/?path=/docs/components-loadingstate--docs) | 読み込んでいる対象を文字で伝える領域                                                                             |
| [EmptyState](/storybook/?path=/docs/components-emptystate--docs)     | 対象がない理由と次の操作。検索結果なしでは条件を残す                                                             |
| [DateDetails](/storybook/?path=/docs/components-datedetails--docs)   | 締切、予定日、提出日など、意味の異なる日時を並べる                                                               |
| [Separator](/storybook/?path=/docs/components-separator--docs)       | 異なる情報群を区切る。各行を無条件に分断しない                                                                   |

### 開閉・補足

| 部品                                                                   | 選び方                                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [Accordion](/storybook/?path=/docs/components-accordion--docs)         | 関連する詳細を折りたたむ。必須の案内やエラーを隠さない           |
| [Dialog](/storybook/?path=/docs/components-dialog--docs)               | 元の画面を離れず、短い編集や確認を行う                           |
| [AlertDialog](/storybook/?path=/docs/components-alertdialog--docs)     | 削除など、影響のある判断の前に対象と結果を確認する               |
| [ConfirmDialog](/storybook/?path=/docs/components-confirmdialog--docs) | 確認後の非同期操作まで扱う。処理中・失敗・再試行を同じ文脈に置く |
| [Sheet](/storybook/?path=/docs/components-sheet--docs)                 | 一覧の絞り込みなど、元の画面に関連する補助作業                   |
| [Tooltip](/storybook/?path=/docs/components-tooltip--docs)             | アイコンへの短い補足。必須情報や操作名をTooltipだけに置かない    |

### 進行・履歴

| 部品                                                                 | 選び方                                                     |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| [ProcessSteps](/storybook/?path=/docs/components-processsteps--docs) | 決まった段階の現在位置。分岐する結果を一本道の段階にしない |
| [Timeline](/storybook/?path=/docs/components-timeline--docs)         | 起きた出来事を日時とともに読む。予定や現在位置と混ぜない   |

画面全体の組み合わせは、[入力部品の配置例](/storybook/?path=/story/patterns-formlayout--default)、[サイドバーを使った構成](/storybook/?path=/story/patterns-applicationshell--default)、[申請フォーム](/storybook/?path=/story/patterns-applicationform--default)、[審査一覧](/storybook/?path=/story/patterns-reviewlist--default)を参照してください。導入方法は[Webへの組み込み](./implementation.md)にまとめています。

## Do's and Don'ts

| 採用する                                     | 避ける                                                         |
| -------------------------------------------- | -------------------------------------------------------------- |
| タイトルの近くに開催回・団体・対象を示す     | 対象が分からない位置に「保存」「取消」だけを置く               |
| 余白、文字の太さ、細い区切りで情報を整理する | すべての行をカードにして、影と色を重ねる                       |
| 主な操作を一つに絞り、補助操作と区別する     | すべての操作を同じ強さで並べる                                 |
| 状態名と必要な行動を文字で伝える             | 赤・黄・緑だけで意味を伝える                                   |
| 受付結果や控えを画面に残す                   | 提出や予約の結果を一時的な通知だけで済ませる                   |
| 入力欄の外にラベルと条件を示す               | 入力項目の名前や必須条件を、プレースホルダーや記号だけで伝える |
| 役割に合う共通の色・寸法を使う               | 画面ごとに似た部品や設定値を増やす                             |

実際の画面では、キーボード、読み上げ、長い日本語、文字拡大、ライト・ダークで確認します。操作結果や失敗時の表示は[画面と操作](./patterns.md)を参照してください。
