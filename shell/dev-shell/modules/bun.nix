{
  pkgs,
  bun2nix,
  system,
  ...
}:
{
  buildInputs = with pkgs; [
    bun
    bun2nix.packages.${system}.default
  ];
}
