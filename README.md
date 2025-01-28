# How Match / ハマチ

wip

## 開発

開発中です。

### 環境構築

a. Nix を使える場合

1. Nix をインストールします。
2. [nix-direnv](https://github.com/nix-community/nix-direnv)
   をインストールします。
3. `direnv allow` と実行します。

b. Nix を使えない場合

以下のパッケージをインストールします。(予告なく変更される場合があります)

- bun (>= v1.2)
- biome
- lefthook
- gitleaks
- just

### Just スクリプト

just が導入されています。 以下は、just で実行可能なスクリプトの例です。 `just`
または `just --list` でスクリプトの一覧が見れます。

```sh
just install # alias: `just i` - installs all package dependencies
just build # alias: `just b` - builds all package
```

## 技術スタック

### 開発

- Bun: ランタイム
- Deno: フォーマッター・リンター
