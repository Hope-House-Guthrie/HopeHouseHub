{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

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
      ...
    }@inputs:
    let
      system = "x86_64-linux";
      version = "0.1.0";

      overlays = {
        dotnet-10 = final: prev: {
          dotnet-aspnetcore = prev.dotnetCorePackages.dotnet_10.aspnetcore;
          dotnet-runtime = prev.dotnetCorePackages.dotnet_10.runtime;
          dotnet-sdk = prev.dotnetCorePackages.dotnet_10.sdk;
        };

        default =
          final: prev:
          let
            pkgs-dotnet-10 = prev.extend overlays.dotnet-10;
          in
          {
            h3-forms = pkgs-dotnet-10.callPackage ./app/backend/forms/package.nix {
              inherit
                inputs
                version
                ;
            };
            h3-server = pkgs-dotnet-10.callPackage ./app/backend/server/package.nix {
              inherit
                inputs
                version
                ;
            };
            h3-frontend = final.callPackage ./app/frontend/package.nix {
              inherit
                inputs
                version
                ;
            };
          };
      };

      pkgsFor =
        system:
        import inputs.nixpkgs {
          inherit system;
          overlays = [ overlays.default ];
        };

      devShell = (import ./shell/dev-shell/default.nix) {
        inherit
          inputs
          system
          ;

        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [
            overlays.default
            overlays.dotnet-10
          ];
        };
      };
    in
    {
      overlays = {
        inherit (overlays) default;
      };

      packages.${system} = {
        h3-forms = (pkgsFor system).h3-forms;
        h3-server = (pkgsFor system).h3-server;
        h3-frontend = (pkgsFor system).h3-frontend;
      };

      nixosConfigurations.hub-backend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          ./app/backend/test-vm
          {
            nixpkgs.overlays = [ overlays.default ];
          }
        ];
      };

      nixosConfigurations.hub-frontend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          ./app/frontend/test-vm
          {
            nixpkgs.overlays = [ overlays.default ];
          }
        ];
      };

      nixosModules = {
        h3-forms = ./app/backend/forms/module.nix;
        h3-server = ./app/backend/server/module.nix;
        h3-frontend = ./app/frontend/module.nix;
      };

      devShells.${system}.default = devShell;
    };
}
