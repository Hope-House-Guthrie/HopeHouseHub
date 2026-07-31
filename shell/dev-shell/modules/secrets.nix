{
  pkgs,
  system,
  self,
  agenix,
  adminPubKeys,
  hosts,
  ...
}:
let
  agenix-wrapped =
    let
      secrets = (import "${self}/secrets.nix") {
        inherit adminPubKeys;
        inherit hosts;
      };

      secretsExpr = pkgs.lib.generators.toPretty { } secrets;
      secretsFile = pkgs.writeText "secrets.nix" secretsExpr;
    in
    pkgs.writeShellScriptBin "agenix" ''
      RULES="${secretsFile}" \
        "${agenix.packages.${system}.agenix}/bin/agenix" "$@"
    '';
in
{
  buildInputs = [
    agenix-wrapped
  ];
}
