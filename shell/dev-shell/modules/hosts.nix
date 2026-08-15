{
  pkgs,
  hosts,
  system,
  inputs,
  ...
}:
let
  provisionScript =
    name:
    pkgs.writeShellScriptBin "provision-${name}" ''
      set -e

      TERRANIX_OUT=$(${pkgs.nix}/bin/nix build .#${name}-provisioner --no-link --print-out-paths)

      REPO_ROOT=$(git rev-parse --show-toplevel)
      PROVISION_ROOT="$REPO_ROOT/.provision/${name}"
      mkdir -p $PROVISION_ROOT

      cat "$TERRANIX_OUT" > "$PROVISION_ROOT/config.tf.json"

      echo "==> Preparing..."
      ${pkgs.opentofu}/bin/tofu -chdir=$PROVISION_ROOT init 

      echo "==> Provisioning..."
      #${pkgs.opentofu}/bin/tofu -chdir=$PROVISION_ROOT apply "$@"
    '';

  updateScript =
    name: ipv4Address:
    pkgs.writeShellScriptBin "update-${name}" ''
      ${pkgs.nixos-rebuild}/bin/nixos-rebuild switch \
        --flake .#${name} \
        --sudo \
        --target-host admin@${ipv4Address}
    '';
in
{
  buildInputs = [
    pkgs.azure-cli
    pkgs.azure-storage-azcopy
    inputs.terranix.packages.${system}.default
    pkgs.opentofu
  ]
  ++ (builtins.concatMap (host: [
    (provisionScript host.name)
    (updateScript host.name host.ipv4Address)
  ]) hosts);
}
