{ pkgs ? import <nixpkgs-unstable> {} }:

pkgs.mkShell {
  packages = [
    pkgs.deno
  ];
}