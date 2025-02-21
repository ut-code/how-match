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
bun check # コードスタイルや型チェックなどすべてのチェックを実行します
bun fix # すべてのチェックを実行し、自動で直せるものは直します

bun db # ローカルのデータベースを構築します (既存のものがある場合は削除されます)
```

## 技術スタック

### フロントエンド

- Svelte
- SvelteKit
  - adapter: cloudflare
- Tailwind CSS
- DaisyUI
- `hono/client`
- Cloudflare Pages

### バックエンド

- Hono
- Drizzle
- Cloudflare Page Functions
- Cloudflare D1

### 開発

- Bun: ランタイム
- Biome: リンター
- Deno: フォーマッター (MEMO: Biome が HTML-ish な言語のサポートをするまでは Deno でフォーマットすることにする)
