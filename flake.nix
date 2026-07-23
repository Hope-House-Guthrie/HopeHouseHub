{
  description = "Hope House Hub";

  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-2605.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    super-laptop.url = "github:tj-super/super-laptop";

    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };

    nuget-packageslock2nix = {
      url = "github:mdarocha/nuget-packageslock2nix";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };
  };

  outputs =
    {
      nixpkgs-unstable,
      nixpkgs-2605,
      super-laptop,
      bun2nix,
      nuget-packageslock2nix,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs-unstable = import nixpkgs-unstable { inherit system; };

      version = "0.1.0";

      frontend = pkgs-unstable.callPackage ./app/frontend/package.nix {
        inherit version;

        bun2nix = bun2nix.packages.${system}.default;
      };

      dotnet-sdk = pkgs-unstable.dotnet-sdk_10;
      dotnet-runtime = pkgs-unstable.dotnet-aspnetcore_10;

      backend = pkgs-unstable.callPackage ./app/backend/package.nix {
        inherit
          version
          nuget-packageslock2nix
          dotnet-sdk
          dotnet-runtime
          ;

        pkgs = pkgs-unstable;
      };

      serverName = "server";
    in
    {
      packages.${system} = {
        inherit frontend backend;
      };

      devShells.${system}.default =
        let
          pkgs = pkgs-unstable;

          build-vm = pkgs.writeShellScriptBin "build-vm" ''
            nix build .#nixosConfigurations.server.config.system.build.vm
          '';

          run-vm = pkgs.writeShellScriptBin "run-vm" ''
            build-vm && ./result/bin/run-${serverName}-vm
          '';
        in
        pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            dotnet-sdk
            bun2nix.packages.${system}.default

            build-vm
            run-vm
          ];

          shellHook = ''
            export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
          '';
        };

      nixosConfigurations.${serverName} =
        let
          nixpkgs = nixpkgs-2605;

          stateVersion = "26.05";

          adminPubKeys = [
            super-laptop.pubKeys.ssh.users.super
          ];

        in
        nixpkgs.lib.nixosSystem {
          specialArgs = {
            inherit adminPubKeys;
          };

          modules = [
            ./server
            {
              networking.hostName = serverName;
              system.stateVersion = stateVersion;
            }
          ];
        };

    };
}
