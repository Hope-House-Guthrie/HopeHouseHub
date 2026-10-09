{ pkgs, ... }:
let
  run-backend-test-vm = pkgs.writeShellScriptBin "run-backend-test-vm" ''
    nix build .#nixosConfigurations.hub-backend-test-vm.config.system.build.vm && ./result/bin/run-hub-backend-test-vm
  '';

  run-frontend-test-vm = pkgs.writeShellScriptBin "run-frontend-test-vm" ''
    nix build .#nixosConfigurations.hub-frontend-test-vm.config.system.build.vm && ./result/bin/run-hub-frontend-test-vm
  '';
in
{
  buildInputs = [
    run-backend-test-vm
    run-frontend-test-vm
  ];
}
