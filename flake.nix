{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    super-laptop.url = "github:tj-super/super-laptop";

    agenix = {
      url = "github:ryantm/agenix/main";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    bun2nix = {
      url = "github:nix-community/bun2nix?ref=2.1.2";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nuget-packageslock2nix = {
      url = "github:mdarocha/nuget-packageslock2nix/main";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      super-laptop,
      agenix,
      bun2nix,
      nuget-packageslock2nix,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      version = "0.1.0";

      frontend = pkgs.callPackage ./app/frontend/package.nix {
        inherit version;

        bun2nix = bun2nix.packages.${system}.default;
      };

      dotnet-sdk = pkgs.dotnet-sdk_10;
      dotnet-runtime = pkgs.dotnet-aspnetcore_10;

      backend = pkgs.callPackage ./app/backend/package.nix {
        inherit
          version
          nuget-packageslock2nix
          dotnet-sdk
          dotnet-runtime
          ;

        pkgs = pkgs;
      };

      serverName = "server";

      adminPubKeys = [
        super-laptop.pubKeys.ssh.users.super
      ];

      serverPubKey = builtins.readFile ./secrets/ssh_host_ed25519_key.pub;
    in
    {
      packages.${system} = {
        inherit frontend backend;
      };

      devShells.${system}.default =
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

              secrets = (import ./secrets/secrets.nix) {
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
        };

      nixosConfigurations.${serverName} =
        let
          inherit adminPubKeys;

          stateVersion = "26.05";

        in
        nixpkgs.lib.nixosSystem {
          specialArgs = {
            inherit self adminPubKeys;
          };

          modules = [
            agenix.nixosModules.default
            ./server
            {
              networking.hostName = serverName;
              system.stateVersion = stateVersion;
            }
          ];
        };

    };
}
