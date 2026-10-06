{
  pkgs,
  hosts,
  system,
  inputs,
  ...
}:
let
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
  buildInputs = (builtins.concatMap (host: [
    (updateScript host.name host.ipv4Address)
  ]) hosts);
}
