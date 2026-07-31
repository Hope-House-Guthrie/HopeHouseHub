{ ... }@inputs:
let
  pkgs = inputs.pkgs;

  lib = pkgs.lib;

  modules = [
    (import ./modules/bun.nix inputs)
    (import ./modules/dotnet.nix inputs)
    (import ./modules/hosts/default.nix inputs)
    (import ./modules/postgresql/default.nix inputs)
    (import ./modules/secrets.nix inputs)
  ];

  moduleBuildInputs = lib.concatLists (map (m: m.buildInputs or [ ]) modules);
  moduleShellHooks = lib.concatStringsSep "\n" (map (m: m.shellHook or "") modules);
in
pkgs.mkShell {
  buildInputs =
    with pkgs;
    [
      nixd
      nixfmt
    ]
    ++ moduleBuildInputs;

  shellHook = ''
    ${moduleShellHooks}
  '';
}
