{
  description = "Hope House Hub";

  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-2605.url = "github:nixos/nixpkgs?ref=nixos-26.05";

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
      bun2nix,
      nuget-packageslock2nix,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs-unstable = import nixpkgs-unstable { inherit system; };

      version = "0.1.0";

      dotnet-sdk = pkgs-unstable.dotnet-sdk_10;
      dotnet-runtime = pkgs-unstable.dotnet-aspnetcore_10;

      frontend = pkgs-unstable.callPackage ./app/frontend/package.nix {
        inherit version;

        bun2nix = bun2nix.packages.${system}.default;
      };

      backend = pkgs-unstable.callPackage ./app/backend/package.nix {
        inherit
          version
          nuget-packageslock2nix
          dotnet-sdk
          dotnet-runtime
          ;

        pkgs = pkgs-unstable;
      };
    in
    {
      packages.${system} = {
        inherit frontend backend;
      };

      devShells.${system}.default = pkgs-unstable.mkShell {
        buildInputs = with pkgs-unstable; [
          bun
          dotnet-sdk
          bun2nix.packages.${system}.default
        ];

        shellHook = ''
          export DOTNET_ROOT="${dotnet-sdk}/share/dotnet"
        '';
      };

      nixosConfigurations.server =
        let
          stateVersion = "26.05";
        in
        nixpkgs-2605.lib.nixosSystem {
          modules = [
            ./server
            {
              system.stateVersion = stateVersion;
            }
          ];
        };

    };
}
