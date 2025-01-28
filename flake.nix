{
  description = "How Match";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        formatter = pkgs.alejandra;
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # general
            lefthook # precommit
            gitleaks # secret leak detection
            just # task runner

            # JS
            bun # runner / tester
            # biome # style checker / linter ... replaced by deno because biome doesn't support HTML and svelte
            deno # used to format svelte

            # Nix
            alejandra # formatter
            nil # langserver
            statix # nix linter
            deadnix # code analyzer (detects dead code)
          ];

          shellHook = ''
            lefthook install
          '';
        };
      }
    );
}
