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

            # JS
            bun # runner / tester
            biome # style checker / linter

            # Nix
            alejandra # formatter
            nil # langserver
            deadnix # code analyzer (detects dead code)
          ];

          shellHook = ''
            lefthook install
          '';
        };
      }
    );
}
