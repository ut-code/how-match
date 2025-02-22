{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "How Match development";
  packages = with pkgs; [
    # general
    gitleaks # secret leak detection
    just # task runner
    litecli # sqlite CLI client with advanced features

    # JS
    bun # runner / tester
    biome # style checker / linter ... replaced by deno because biome doesn't support HTML and svelte
    nodejs-slim # required by drizzle?
    deno # used to format svelte

    wrangler

    # Nix
    alejandra # formatter
    nil # langserver
    statix # nix linter
    deadnix # code analyzer (detects dead code)
  ];
}
