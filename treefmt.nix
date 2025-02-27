let
  global-excludes = [
    "node_modules"
    ".gitignore"
    ".npmrc"
    ".ignore"
    ".envrc"
    ".env.example"
    "*.png"
    "*.svg"
    "*.webp"
    "robots.txt"
  ];
in {
  # <https://github.com/numtide/treefmt-nix>

  settings.global.excludes = builtins.concatMap (name: [name ("**/" + name)]) global-excludes;
  programs = {
    # config DSL
    taplo.enable = true;
    yamlfmt.enable = true;
    just.enable = true;
    mdformat.enable = true;

    # JS
    biome.enable = true;

    # Nix
    alejandra.enable = true;
    statix.enable = true;
    deadnix.enable = true;
  };
}
