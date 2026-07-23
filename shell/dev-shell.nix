{
  pkgs,
  self,
  serverName,
  agenix,
  adminPubKeys,
  serverPubKey,
  dotnet-sdk,
  system,
  bun2nix,
  ...
}:
let
  build-vm = pkgs.writeShellScriptBin "build-vm" ''
    nix build .#nixosConfigurations.server.config.system.build.vm
  '';

  run-vm = pkgs.writeShellScriptBin "run-vm" ''
    build-vm

    export SHARED_DIR=$(mktemp -d)
    trap 'rm -rf "$SHARED_DIR"' EXIT

    SSH_HOST_KEY="${self}/secrets/ssh_host_ed25519_key.age"

    ${pkgs.age}/bin/age \
      -d \
      -i ~/.ssh/id_ed25519 \
      -o "$SHARED_DIR/ssh_host_ed25519_key" \
      "$SSH_HOST_KEY"

    cp "${self}/secrets/ssh_host_ed25519_key.pub" "$SHARED_DIR"

    ./result/bin/run-${serverName}-vm
  '';

  agenix-wrapped =
    let
      adminPubKeysArg =
        "[ " + (pkgs.lib.concatMapStringsSep " " (key: ''"${pkgs.lib.trim key}"'') adminPubKeys) + " ]";

      serverPubKeyArg = pkgs.lib.trim serverPubKey;

      secrets = (import "${self}/secrets/secrets.nix") {
        inherit adminPubKeys serverPubKey;
      };

      secretsExpr = pkgs.lib.generators.toPretty { } secrets;
      secretsFile = pkgs.writeText "secrets.nix" secretsExpr;
    in
    pkgs.writeShellScriptBin "agenix" ''
      RULES="${secretsFile}" \
        "${agenix.packages.${system}.agenix}/bin/agenix" "$@"
    '';
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    bun
    dotnet-sdk
    bun2nix.packages.${system}.default

    build-vm
    run-vm
    agenix-wrapped
  ];

  shellHook = ''
    export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
  '';
}
