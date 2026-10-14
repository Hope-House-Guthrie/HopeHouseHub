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

      pkgs = import inputs.nixpkgs {
        inherit system;
        overlays = [
          (final: prev: {
            dotnet-aspnetcore = prev.dotnetCorePackages.dotnet_10.aspnetcore;
            dotnet-runtime = prev.dotnetCorePackages.dotnet_10.runtime;
            dotnet-sdk = prev.dotnetCorePackages.dotnet_10.sdk;
          })
        ];
      };

      devShell = (import ./shell/dev-shell/default.nix) {
        inherit
          inputs
          pkgs
          system
          ;
      };

      packages = {
        h3-forms = pkgs.callPackage ./app/backend/forms/package.nix {
          inherit
            inputs
            version
            ;
        };

        h3-server = pkgs.callPackage ./app/backend/server/package.nix {
          inherit
            inputs
            version
            ;
        };

        h3-frontend = pkgs.callPackage ./app/frontend/package.nix {
          inherit
            inputs
            version
            ;

          inherit (packages) h3-server;
        };
      };

      nixosModules = {
        h3-forms = import ./app/backend/forms/module.nix { inherit (packages) h3-forms; };
        h3-frontend = import ./app/frontend/module.nix { inherit (packages) h3-frontend; };
        h3-server = import ./app/backend/server/module.nix { inherit (packages) h3-server; };
      };
    in
    {
      devShells.${system}.default = devShell;

      packages.${system} = {
        inherit (packages) h3-forms h3-frontend h3-server;
      };

      nixosConfigurations.hub-backend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          (nixosModules.h3-forms { hostingEnvironment = "test"; })
          (nixosModules.h3-server { hostingEnvironment = "test"; })
          ./app/backend/test-vm
        ];
      };

      nixosConfigurations.hub-frontend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          (nixosModules.h3-frontend { hostingEnvironment = "test"; })
          ./app/frontend/test-vm
        ];
      };

      inherit nixosModules;

    };
}
