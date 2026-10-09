{
  lib,
  pkgs,
  inputs,
  stdenv,
  version,
  ...
}:

pkgs.buildDotnetModule {
  inherit version;

  pname = "h3-forms";
  projectFile = "forms/h3-forms.csproj";

  dotnet-sdk = pkgs.dotnet-sdk;
  dotnet-runtime = pkgs.dotnet-aspnetcore;

  nugetDeps = inputs.nuget-packageslock2nix.lib {
    system = stdenv.hostPlatform.system;
    lockfiles = [
      ../queues/packages.lock.json
      ./packages.lock.json
    ];
  };

  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.unions [
      ../Directory.Build.props
      ../Directory.Packages.props
      ../queues
      ./.
    ];
  };
}
