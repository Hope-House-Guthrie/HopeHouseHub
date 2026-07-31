{ dotnet-sdk, ... }:
{
  buildInputs = [
    dotnet-sdk
  ];

  shellHook = ''
    export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
  '';
}
