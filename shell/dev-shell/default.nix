{ ... }@args:
let
  lib = pkgs.lib;
  inputs = args.inputs;
  pkgs = args.pkgs;

  modules = [
    (import ./modules/bun.nix args)
    (import ./modules/dotnet.nix args)
    (import ./modules/hosts.nix args)
    (import ./modules/postgresql/default.nix args)
  ];

  moduleBuildInputs = lib.concatLists (map (m: m.buildInputs or [ ]) modules);
  moduleShellHooks = lib.concatStringsSep "\n" (map (m: m.shellHook or "") modules);
in
pkgs.mkShell {
  buildInputs =
    let
      agenix = inputs.agenix.packages.${args.system}.agenix;
    in
    with pkgs;
    [
      age
      agenix
      nixd
      nixfmt
      starship
      wireguard-tools
    ]
    ++ moduleBuildInputs;

  shellHook = ''
    ${moduleShellHooks}
    eval "$(starship init bash)"
  '';
}
