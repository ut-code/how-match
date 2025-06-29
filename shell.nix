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
    nodejs-slim # required by drizzle?

    wrangler # can't build for now

    # Database
    turso-cli # Turso database CLI
  ];
}
