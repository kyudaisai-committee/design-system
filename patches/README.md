# 依存パッケージの局所修正

修正版が公開されていない依存には、pnpmの`patchedDependencies`で以下の修正を適用します。パッチはインストール時に適用され、`pnpm dependencies:test`で修正と利用箇所の互換性を検査します。警告対象のバージョン番号は変更していないため、Dependabotはこれらを引き続き検出する場合があります。

- **node-forge 1.4.0**：Expoが利用する`lib/rsa.js`のRSA PKCS#1 v1.5署名検証で、AlgorithmIdentifier内の余分な要素と内容を持つNULLを拒否します。SHA系でのNULL省略と、Expoの証明書・署名操作は維持します。同梱の`dist`配下のブラウザー用バンドルには適用されないため、直接読み込まないでください。[GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv)
- **braces 3.0.3**：括弧の入れ子を128階層までに制限します。文字列の解析とASTの直接入力の両方を検査し、再帰処理へ進む前に過剰な深さや循環した参照を`SyntaxError`で拒否します。引用・エスケープ・文字クラス内の括弧は階層に数えません。[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- **js-yaml 3.15.2**：CLIをargparse 2のAPIへ合わせます。sprintf-jsを含むargparse 1から移行し、ヘルプ・バージョン表示と既存の引数を維持します。YAMLの解析APIは変更しません。[GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)

上流の修正版へ更新する際は、該当パッチと`patchedDependencies`の設定を削除し、回帰テストを新バージョンに合わせて更新してください。`pnpm-workspace.yaml`の`overrides`は、修正版を指定するものと、旧API互換を保つargparse 2.0.1への置換です。呼び出し元が安全なバージョンへ移行した後に解除します。
