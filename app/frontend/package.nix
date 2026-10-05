{
  inputs,
  pkgs,
  stdenv,
  version,
  ...
}:
let
  system = stdenv.hostPlatform.system;
  bun2nix = inputs.bun2nix.packages.${system}.default;
in
stdenv.mkDerivation {
  inherit version;

  pname = "frontend";
  src = ./.;

  nativeBuildInputs = [
    bun2nix.hook
  ];

  bunDeps = bun2nix.fetchBunDeps {
    bunNix = ./bun.nix;
  };

  postUnpack = ''
    mkdir -p $NIX_BUILD_TOP/backend/H3.Server
    cp ${pkgs.h3-backend}/lib/backend/openapi.json $NIX_BUILD_TOP/backend/H3.Server/openapi.json
  '';

  buildPhase = ''
    bun run build
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp -R ./dist/* $out/bin
  '';
}
