# 九大祭 Design System

九大祭のWebサイトとシステムに共通するデザイン指針、年度別のホームページ、Web・React Nativeのコンポーネントを管理します。

## 公開ガイド

- [共通原則](apps/docs/content/principles.md)
- [システムのデザイン](apps/docs/content/system/DESIGN.md)
- [画面と操作](apps/docs/content/system/patterns.md)
- [Web・アプリの設計](apps/docs/content/system/native.md)
- [React Nativeへの組み込み](apps/docs/content/system/native-implementation.md)
- [ホームページの設計](apps/docs/content/websites/guidelines.md)

## 開発

Node.js 24以上とpnpm 11.1.3を使用します。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm dev
```

Blumeは `http://localhost:4321`、Storybookは `http://localhost:6006` で起動します。

```sh
pnpm check
pnpm preview
```

`pnpm check` はLint・整形、共有トークン、デザイン仕様、型、部品の操作・アクセシビリティ、WebとNativeのビルド、部品一覧、公開ページのリンク、配布パッケージの導入を検査します。`pnpm preview` は統合した `dist/` を配信します。文書は `/`、WebのStorybookは `/storybook/` です。

### React NativeのStorybook

iOS・Android向けにExpo SDK 57とReact Native 0.86を使用します。端末内にStorybookを表示する構成は、[Storybookの公式チュートリアル](https://storybook.js.org/tutorials/intro-to-storybook/react-native/en/get-started/)に沿っています。

```sh
pnpm native:build:ios    # iOSの開発ビルドを作成・起動
pnpm native:build:android # Androidの開発ビルドを作成・起動
pnpm native:dev          # 作成済みの開発ビルドから接続
```

iOSのビルドにはXcode、AndroidにはAndroid SDKとJDKが必要です。写真選択、撮影、共有などは対応端末で確認します。Expo Goでは使えない機能もあるため、OS連携の確認には開発ビルドを使用してください。

Storyは `Foundations`、`Components`、`Native` に分類しています。色・文字・余白、共通部品、写真編集やキーボード表示などの端末操作を確認できます。特定のサービスの業務画面・認証・APIは含めません。

### コードの検査と整形

```sh
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm dependencies:test
```

OxlintはコードとHooks、Webでは基本的なアクセシビリティも検査します。Oxfmtはコード・設定・文書を整形します。Lefthookはコミット前に対象ファイルのLintと整形、push前にLint・整形・型・トークンの整合を確認します。GitHub Actionsはプルリクエストとmainへのpushで `pnpm check` を実行し、成功した公開用サイトを成果物として保存します。CI定義は `.github/workflows/ci.yml` にあります。

依存関係のセキュリティ修正と互換性は `pnpm dependencies:test` で確認します。修正版が未提供の依存に適用する局所修正は、[パッチの保守方針](patches/README.md)を参照してください。

## 執筆・更新手順

文章は `apps/docs/content`、トークンは `packages/tokens/src/tokens.json`、部品は `packages/ui/src` と `packages/ui-native/src` を更新します。DESIGN.mdは採用しているalpha形式を保ち、本文を次の8節で構成します。

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

YAMLの `colors`、`typography`、`spacing`、`rounded` に値を記載し、本文で用途を説明します。システムの値を変更したら `pnpm design:sync` で共有トークンからWeb CSS・Nativeの値・YAMLを同期し、本文とStorybookの見本を更新します。`pnpm tokens:check` と `pnpm design:check` で形式と値の一致を検査します。生成したCSS・TypeScriptやYAMLだけを手動で変更しないでください。

年度別の文書では、実装から確認できる表現と、再利用する際の指針を区別します。テーマ画像の原本・権利表示は各年度の制作資料で管理し、公開文書には閲覧できない参照先を置きません。

部品を追加する場合は、`base-nova`・`neutral`・`lucide` の設定を使います。

```sh
pnpm --filter @kyudaisai/ui exec shadcn add <component>
```

生成した差分、依存関係、トークン、キーボード操作、必要な状態を確認します。部品のソース、Storybook、デザイン仕様を同時に更新してください。

## パッケージと配信

パッケージは公開レジストリには配布していません。Webの `@kyudaisai/ui` は、次のコマンドで最新のソースからビルドしたパッケージを作成できます。共有トークンに未反映の変更がある場合は、先に `pnpm design:sync` を実行してください。

```sh
pnpm -C packages/ui pack --pack-destination ../../dist-packages
```

利用するReact 19のプロジェクトで、生成したファイルを展開して追加します。`vendor/kyudaisai-ui` は利用先のリポジトリでも管理してください。

```sh
mkdir -p vendor/kyudaisai-ui
tar -xzf /path/to/design-system/dist-packages/kyudaisai-ui-0.1.0.tgz --strip-components=1 -C vendor/kyudaisai-ui
pnpm add file:./vendor/kyudaisai-ui
```

[Webへの組み込み](apps/docs/content/system/implementation.md)に従ってCSSとコンポーネントを読み込みます。React Nativeのパッケージは、このリポジトリ内のワークスペースで利用します。
