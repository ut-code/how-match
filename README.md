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
- lefthook
- gitleaks
- just

### Just スクリプト

just が導入されています。 以下は、just で実行可能なスクリプトの例です。 `just` または `just --list`
でスクリプトの一覧が見れます。

```sh
just install # alias: `just i` - installs all package dependencies
just build # alias: `just b` - builds all package

just check # checks:
# formatting
# linting
# sveltekit static analysis
# typescript types
just fix # fix format and lint
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
