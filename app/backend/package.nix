{
  pkgs,
  inputs,
  stdenv,
  version,
  ...
}:

pkgs.buildDotnetModule {
  inherit version;

  dotnet-runtime = pkgs.dotnet-runtime_10;
  dotnet-sdk = pkgs.dotnet-sdk_10;

  nugetDeps = inputs.nuget-packageslock2nix.lib {
    system = stdenv.hostPlatform.system;
    name = "backend";
    lockfiles = [
      ./H3.Data/packages.lock.json
      ./H3.Server/packages.lock.json
    ];
  };

  pname = "backend";
  projectFile = "H3.Server/H3.Server.csproj";
  selfContainedBuild = true;
  src = ./.;
}
