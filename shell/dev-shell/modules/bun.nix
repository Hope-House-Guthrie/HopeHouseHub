{
  inputs,
  pkgs,
  system,
  ...
}:
{
  buildInputs = [
    pkgs.bun
    inputs.bun2nix.packages.${system}.default
  ];
}
