{
  pkgs,
  self,
  agenix,
  adminPubKeys,
  system,
  serverHost,
  ...
}:
let
  # todo: sh files and build inputs

  build-server = pkgs.writeShellScriptBin "build-server" ''
    nix build .#nixosConfigurations.${serverHost.name}.config.system.build.vm
  '';

  run-server = pkgs.writeShellScriptBin "run-server" ''
    export SHARED_DIR=$(mktemp -d)
    trap 'rm -rf "$SHARED_DIR"' EXIT

    ${pkgs.age}/bin/age \
      -d \
      -i ~/.ssh/id_ed25519 \
      -o "$SHARED_DIR/ssh_host_ed25519_key" \
      "${serverHost.privateKey}"

    echo "${serverHost.publicKey}" > "$SHARED_DIR/ssh_host_ed25519_key.pub";

    build-server && ./result/bin/run-${serverHost.name}-vm
  '';

  deploy-server = pkgs.writeShellScriptBin "deploy-server" ''
    nixos-rebuild \
      switch \
      --flake .#${serverHost.name} \
      --sudo \
      --target-host "admin@$1"
  '';

  agenix-wrapped =
    let
      secrets = (import "${self}/secrets.nix") {
        inherit adminPubKeys;
        inherit serverHost;
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
    pkgs.age

    build-server
    run-server
    deploy-server
    agenix-wrapped
  ];
}
