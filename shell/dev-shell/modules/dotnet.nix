{ dotnet-sdk, pkgs, ... }:
{
  buildInputs = [
    dotnet-sdk
    pkgs.dotnet-ef
  ];

  shellHook = ''
    export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
  '';
}
