{ pkgs, bun2nix, ... }:
{
  buildInputs = with pkgs; [
    bun
    bun2nix.packages.${system}.default
  ];
}
