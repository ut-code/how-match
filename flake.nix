{
  description = "How Match";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    treefmt-nix,
    self,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        treefmt = (treefmt-nix.lib.evalModule pkgs ./treefmt.nix).config.build;
      in {
        formatter = treefmt.wrapper;
        devShells.default = pkgs.callPackage ./shell.nix {};
        checks.format = treefmt.check self;
      }
    );
}
