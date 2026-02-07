{ pkgs ? import <nixpkgs-unstable> {} }:

pkgs.mkShellNoCC {
  packages = with pkgs; [
    deno
    bashInteractive
  ];
}