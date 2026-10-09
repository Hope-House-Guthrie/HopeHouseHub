{ ... }@args:
let
  lib = pkgs.lib;
  pkgs = args.pkgs;

  modules = [
    (import ./modules/bun.nix args)
    (import ./modules/dotnet.nix args)
    (import ./modules/postgresql.nix args)
    (import ./modules/rabbitmq.nix args)
    (import ./modules/test-vm.nix args)
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
      starship
    ]
    ++ moduleBuildInputs;

  shellHook = ''
    ${moduleShellHooks}
    eval "$(starship init bash)"
  '';
}
