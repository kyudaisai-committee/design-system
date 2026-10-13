# 九大祭 Design System

九大祭のWebサイトとシステムに共通するデザイン指針、年度別のホームページ、Webコンポーネントを管理します。

## 公開ガイド

- [共通原則](apps/docs/content/principles.md)
- [システムのデザイン](apps/docs/content/system/DESIGN.md)
- [画面と操作](apps/docs/content/system/patterns.md)
- [Web・アプリの設計](apps/docs/content/system/native.md)
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

`pnpm check` はデザイン仕様、型、部品の操作・アクセシビリティ、ビルド、部品一覧を検査します。`pnpm preview` は統合した `dist/` を配信します。文書は `/`、Storybookは `/storybook/` です。

## 執筆・更新手順

文章は `apps/docs/content`、Webのトークンは `packages/ui/src/styles/tokens.css`、部品は `packages/ui/src` を更新します。DESIGN.mdは採用しているalpha形式を保ち、本文を次の8節で構成します。

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

YAMLの `colors`、`typography`、`spacing`、`rounded` に値を記載し、本文で用途を説明します。システムの値を変更したら `pnpm design:sync` でCSSからYAMLへ同期し、本文とStorybookの見本を更新します。`pnpm design:check` で形式と値の一致を検査します。YAMLだけを手動で変更しないでください。

年度別の文書では、実装から確認できる表現と、再利用する際の指針を区別します。テーマ画像の原本・権利表示は各年度の制作資料で管理し、公開文書には閲覧できない参照先を置きません。

部品を追加する場合は、`base-nova`・`neutral`・`lucide` の設定を使います。

```sh
pnpm --filter @kyudaisai/ui exec shadcn add <component>
```

生成した差分、依存関係、トークン、キーボード操作、必要な状態を確認します。部品のソース、Storybook、デザイン仕様を同時に更新してください。

## パッケージと配信

`@kyudaisai/ui` は公開レジストリには配布していません。ローカルでの導入には、次のコマンドで生成したパッケージを使います。

```sh
pnpm -C packages/ui pack --pack-destination ../../dist-packages
```
