# How Match / ハマチ

## 使い方

<https://howmatch.pages.dev> にアクセスします。

## 開発

### 環境構築

a. Nix を使える場合

1. [Nix と nix-direnv をインストールします。](./docs/install-nix.md)
1. `direnv allow` と実行します。

b. Nix を使えない場合

以下のパッケージをインストールします。(予告なく変更される場合があります)

- bun (>= v1.2)
- biome (for linting only)
- gitleaks

### スクリプト

Bun Script で管理されています。以下は、bun で実行可能なスクリプトの例です。`bun run --list` でスクリプトの一覧が見れます。

```sh
bun dev # 開発用サーバーを立てます
bun check # コードスタイルや型チェックなどすべてのチェックを実行します
bun fix # 自動で直せるものを直します (フォーマットなど)

bun db # ローカルのデータベースを構築します (既存のものがある場合は削除されます)
bun run test # テストを実行します
bun clean # 生成されたファイルをすべて削除します
```

### その他

`localhost:3000/debugger` にアクセスするとデバッグ用のページが見れます。

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
- Prettier: フォーマッタ
