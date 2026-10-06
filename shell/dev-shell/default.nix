{ ... }@args:
let
  lib = pkgs.lib;
  pkgs = args.pkgs;

  modules = [
    (import ./modules/bun.nix args)
    (import ./modules/dotnet.nix args)
    (import ./modules/postgresql/default.nix args)
  ];

  moduleBuildInputs = lib.concatLists (map (m: m.buildInputs or [ ]) modules);
  moduleShellHooks = lib.concatStringsSep "\n" (map (m: m.shellHook or "") modules);

  runBackendTestVm = pkgs.writeShellScriptBin "run-backend-test-vm" ''
    nix build .#nixosConfigurations.hub-backend-test-vm.config.system.build.vm && ./result/bin/run-hub-backend-test-vm
  '';

  runFrontendTestVm = pkgs.writeShellScriptBin "run-frontend-test-vm" ''
    nix build .#nixosConfigurations.hub-frontend-test-vm.config.system.build.vm && ./result/bin/run-hub-frontend-test-vm
  '';
in
pkgs.mkShell {
  buildInputs =
    with pkgs;
    [
      nixd
      nixfmt
      starship

      runBackendTestVm
      runFrontendTestVm
    ]
    ++ moduleBuildInputs;

  shellHook = ''
    ${moduleShellHooks}
    eval "$(starship init bash)"
  '';
}
