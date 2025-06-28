{
  pkgs ? import <nixpkgs> {},
  system,
  bunnix,
}: let
  bun_latest = bunnix.packages.${system}.latest;
in
  pkgs.mkShell {
    name = "How Match development";
    packages = with pkgs; [
      # general
      gitleaks # secret leak detection
      just # task runner
      litecli # sqlite CLI client with advanced features

      # JS
      bun_latest # runner / tester
      nodejs-slim # required by drizzle?

      # wrangler # can't build for now

      # Database
      turso-cli # Turso database CLI

      # Nix
      alejandra # formatter
      nil # langserver
      statix # nix linter
      deadnix # code analyzer (detects dead code)
    ];
  }
