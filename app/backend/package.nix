{
  stdenv,
  pkgs,
  nuget-packageslock2nix,
  dotnet-sdk,
  dotnet-runtime,
  version,
  ...
}:

pkgs.buildDotnetModule {
  inherit version dotnet-sdk dotnet-runtime;

  nugetDeps = nuget-packageslock2nix.lib {
    system = stdenv.hostPlatform.system;
    name = "backend";
    lockfiles = [
      ./packages.lock.json
    ];
  };

  pname = "backend";
  selfContainedBuild = true;
  src = ./.;
}
