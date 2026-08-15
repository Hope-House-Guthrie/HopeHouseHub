{
  pkgs,
  inputs,
  stdenv,
  version,
  ...
}:

pkgs.buildDotnetModule {
  inherit version;

  dotnet-runtime = pkgs.dotnet-runtime;
  dotnet-sdk = pkgs.dotnet-sdk;

  nugetDeps = inputs.nuget-packageslock2nix.lib {
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
