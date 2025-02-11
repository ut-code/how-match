# How Match / ハマチ

## 使い方

wip: 開発中です。

## 開発

### 環境構築

a. Nix を使える場合

1. [Nix と nix-direnv をインストールします。](./docs/install-nix.md)
1. `direnv allow` と実行します。

b. Nix を使えない場合

以下のパッケージをインストールします。(予告なく変更される場合があります)

- bun (>= v1.2)
- biome (for linting only)
- deno (for formatting)
- gitleaks
- just

### スクリプト

just と Bun Script で管理されています。以下は、just や bun で実行可能なスクリプトの例です。 それぞれ
`just --list`、`bun run --list` でスクリプトの一覧が見れます。

```sh
# Just: 未導入

bun dev # 開発用サーバーを立てます
bun check # 型チェックを行います
bun style # コードスタイル (フォーマットなど) を整えます
bun style:check # コードスタイルが即しているかどうか確認します (書き込みはしません)。
bun local-db # ローカルのデータベースをスキーマに同期します
```

## 技術スタック

### フロントエンド

- Svelte/Kit
  - adapter: static
- Tailwind CSS
- DaisyUI
- `hono/client`

### バックエンド

- serverless (未定)
- Hono
- Drizzle

### 開発

- Bun: ランタイム
- Biome: リンター
- Deno: フォーマッター (MEMO: Biome が HTML-ish な言語のサポートをするまでは Deno でフォーマットすることにする)
