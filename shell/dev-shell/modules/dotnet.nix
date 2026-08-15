{ pkgs, ... }:
{
  buildInputs = [
    pkgs.dotnet-sdk
    pkgs.dotnet-ef
  ];

  shellHook = ''
    export DOTNET_ROOT="${pkgs.dotnet-sdk}/share/dotnet"
  '';
}
