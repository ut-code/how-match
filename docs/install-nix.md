# Nix + Nix-Direnv のインストール方法

## Nix のインストール

Nix 本体をインストールします。
[公式から提供されているインストーラー](https://nixos.org/download/) でもいいですが、
[DeterminateSystems が提供するインストーラー](https://github.com/DeterminateSystems/nix-installer) も色々便利らしいです。 

各ドキュメントを読めば難しいことはない、というかシェルスク一行のはずです。

公式からインストールした場合、 `Flake` と `Nix Command` を有効にする必要があります。

```sh
mkdir -p ~/.config/nix
cat > ~/.config/nix/nix.conf << EOF
experimental-features = nix-command flakes
EOF
```

## Home Manager のインストール

Nix-Direnv を宣言的に有効にするため、まずは Home Manager をインストールします。

NixOS は入れてないと思うので、 Standalone で入れましょう。
<https://nix-community.github.io/home-manager/index.xhtml#sec-install-standalone>

チャンネルを聞かれますが、どっちでも良いです。個人的には `unstable` をおすすめします。

## Nix-Direnv のインストール

Home Manager をインストールしたら、 `~/.config/home-manager/home.nix` が作成されていることと思います。
そこに、`direnv` と `nix-direnv` の設定を追加しましょう。 <https://github.com/nix-community/nix-direnv?tab=readme-ov-file#via-home-manager>
最終的には、`home.nix` はこんな感じになると思います。

```nix
{ pkgs, ... }: {
  # ... other config
  programs.direnv = {
    enable = true;
    enableBashIntegration = true;
    nix-direnv.enable = true;
  };

  home.packages = [
    # ...
  ];

  programs.bash.enable = true;

  # Let Home Manager install and manage itself.
  programs.home-manager.enable = true;
}
```

終わったら、`home-manager switch` を実行して設定を反映させましょう。

## 確認

Nix 経由で direnv がインストールできたことを確認するため、以下のコマンドを実行しましょう。

```sh
$ readlink $(which direnv)
/nix/store/id5qc6k2rh5micxhsxjard2ypp503zw0-direnv-2.35.0/bin/direnv
```
上のように、`/nix/store` 以下にファイルがあると表示されれば成功です。
