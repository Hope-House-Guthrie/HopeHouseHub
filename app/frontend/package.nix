{
  stdenv,
  bun2nix,
  version,
  ...
}:

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

  buildPhase = ''
    bun run build
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp -R ./dist/* $out/bin
  '';
}
