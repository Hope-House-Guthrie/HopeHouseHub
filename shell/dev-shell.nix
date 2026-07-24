{
  pkgs,
  self,
  serverName,
  agenix,
  nixos-anywhere,
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

  install-vm = pkgs.writeShellScriptBin "install-vm" ''
    build-vm

    export EXTRA_DIR=$(mktemp -d)
    trap 'rm -rf "$EXTRA_DIR"' EXIT

    mkdir -p "$EXTRA_DIR/etc/ssh"

    SSH_HOST_KEY="${self}/secrets/ssh_host_ed25519_key.age"

    ${pkgs.age}/bin/age \
      -d \
      -i ~/.ssh/id_ed25519 \
      -o "$EXTRA_DIR/etc/ssh/ssh_host_ed25519_key" \
      "$SSH_HOST_KEY"

    # todo: not sure if extra_dir below is working; host keys aren't right after install
    # todo: added below lines to see if it fixed, but haven't tested
    # todo: it might have also been agenix config that is fixed now fuck i don't know
    chmod 0600 "$EXTRA_DIR/etc/ssh/ssh_host_ed25519_key"
    chmod 0644 "$EXTRA_DIR/etc/ssh/ssh_host_ed25519_key.pub"

    cp "${self}/secrets/ssh_host_ed25519_key.pub" "$EXTRA_DIR/etc/ssh"

    ${nixos-anywhere.packages.${system}.default}/bin/nixos-anywhere \
      --extra-files "$EXTRA_DIR" \
      -i ~/.ssh/id_ed25519 \
      --flake .#server \
      "$@"
  '';

  deploy-vm = pkgs.writeShellScriptBin "deploy-vm" ''
    nixos-rebuild \
      switch \
      --flake .#server \
      --sudo \
      --target-host "admin@$1"
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
    age
    bun
    dotnet-sdk
    bun2nix.packages.${system}.default
    nixos-anywhere.packages.${system}.default

    build-vm
    run-vm
    install-vm
    deploy-vm
    agenix-wrapped
  ];

  shellHook = ''
    export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
  '';
}
