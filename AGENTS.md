# 作業方針

最初に`apps/docs/content/principles.md`を読む。HPの変更は`websites/guidelines.md`と対象年の`DESIGN.md`、業務UIの変更は`system/DESIGN.md`と`system/patterns.md`を追加で読む。React Native・OS固有UIを扱う場合は`system/native.md`も読む。

- 文章は`apps/docs/content`、現在のWebトークンは`packages/ui/src/styles/tokens.css`、Web部品は`packages/ui/src`を正本とする。Native向けのトークン生成は未実装であり、実装時に正本と利用側を一緒に切り替える。別のreferencesや文書のコピーを作らない。
- DESIGN.mdはREADMEの執筆・更新手順に従い、公式alpha仕様の8節を維持する。システムのYAMLの値は`pnpm design:sync`でCSSから同期し、本文とStoryを更新する。`pnpm design:check`の警告も解消する。
- 過去の実装事実、設計意図の推測、新しい改善案を区別する。公開文書には非公開リポジトリへのリンク、コミットID、作業履歴、内部の調査・検証記録を載せない。設計の使用条件を本文で説明する。未確認の画面・挙動を確認済みと書かない。
- 年度のテーマをシステムの標準テーマにしない。特定のアプリの業務API・状態・権限を、システム全体の共通仕様としない。
- shadcn/uiは共有パッケージで所有する。新部品を加える前に既存部品の組合せを検討する。アプリ固有の業務処理は共有部品へ入れない。
- 変更に必要なStoryでキーボード、エラー、無効、処理中、明色・暗色を確認する。`pnpm check`を実行し、見た目に関わる変更はデスクトップ・狭い画面で目視する。
- 初版の検証と重要な仕様変更は、実装・執筆を担当していない独立した担当者にも点検させる。指摘の修正後に再確認する。
- 本番公開やパッケージ公開は作業依頼の範囲に従う。過去リポジトリや利用先アプリをこの作業から無断で変更しない。
