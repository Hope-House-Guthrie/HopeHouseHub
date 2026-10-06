{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    h2site = {
      url = "github:Hope-House-Guthrie/Hope-House-Site";
      inputs.nixpkgs.follows = "nixpkgs";
    };

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
      ...
    }@inputs:
    let
      system = "x86_64-linux";
      version = "0.1.0";

      pkgsFor =
        system:
        import inputs.nixpkgs {
          inherit system;
          overlays = [ self.overlays.default ];
        };

      adminPublicKeys = (import ./secrets.nix).adminPublicKeys;

      hub-display-kitchen-ipv4Address = "192.168.2.201";
      hub-display-common-ipv4Address = "192.168.2.149";

      hub-display-kitchen = (import ./host/display-kitchen/host.nix) {
        inherit
          adminPublicKeys
          inputs
          system
          ;

        ipv4Address = hub-display-kitchen-ipv4Address;
        overlays = [ self.overlays.default ];
      };

      hub-display-common = (import ./host/display-common/host.nix) {
        inherit
          adminPublicKeys
          inputs
          system
          ;

        ipv4Address = hub-display-common-ipv4Address;
        overlays = [ self.overlays.default ];
      };

      hosts = [
        hub-display-kitchen
        hub-display-common
      ];

      devShell = (import ./shell/dev-shell/default.nix) {
        inherit
          adminPublicKeys
          hosts
          inputs
          system
          ;

        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [ self.overlays.default ];
        };
      };
    in
    {
      overlays.default = final: prev: {
        h3-backend = final.callPackage ./app/backend/package.nix {
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

      packages.${system} = {
        h3-backend = (pkgsFor system).h3-backend;
        h3-frontend = (pkgsFor system).h3-frontend;
      };

      nixosConfigurations.hub-display-kitchen = hub-display-kitchen.nixosConfiguration;
      nixosConfigurations.hub-display-common = hub-display-common.nixosConfiguration;

      nixosConfigurations.hub-backend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          ./app/backend/test-vm
          {
            nixpkgs.overlays = [ self.overlays.default ];
          }
        ];
      };

      nixosConfigurations.hub-frontend-test-vm = inputs.nixpkgs.lib.nixosSystem {
        inherit system;

        modules = [
          ./app/frontend/test-vm
          {
            nixpkgs.overlays = [ self.overlays.default ];
          }
        ];
      };

      nixosModules = {
        h3-backend = ./app/backend/module.nix;
        h3-frontend = ./app/frontend/module.nix;
      };

      devShells.${system}.default = devShell;
    };
}
