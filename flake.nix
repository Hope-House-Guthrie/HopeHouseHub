{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    h2site = {
      url = "github:Hope-House-Guthrie/Hope-House-Site";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    terranix = {
      url = "github:terranix/terranix";
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

      hub-gateway-ipv4Address = "104.215.78.1";
      hub-display-kitchen-ipv4Address = "192.168.2.201";
      hub-display-common-ipv4Address = "192.168.2.149";

      wireguardNetwork = {
        hub-gateway = {
          ipv4Address = "172.16.42.1";
          publicKey = "9QMnhUpKuHnPoFLDtZnY6vu1B1iG6OrZFvqGvvEBpEE=";
          endpoint = hub-gateway-ipv4Address;
        };
        hub-services = {
          ipv4Address = "172.16.42.2";
          publicKey = "vjsUWQojwUtD/+WRcY7zM8UTBoxVvKWk/rCZhCKUFi4=";
        };
        hub-display-kitchen = {
          ipv4Address = "172.16.42.3";
          publicKey = "hqvGKVVNXDyV8zt6us5jRYVsm61qRcJ4epI4trbz0FU=";
        };
        hub-display-common = {
          ipv4Address = "172.16.42.4";
          publicKey = "wYJvaevxwImeYm0nrY2YRU6VdKFvWlR9xHPvJoV44hw=";
        };
      };

      hub-gateway = (import ./host/gateway/host.nix) {
        inherit
          adminPublicKeys
          inputs
          system
          wireguardNetwork
          ;

        ipv4Address = hub-gateway-ipv4Address;
        overlays = [ self.overlays.default ];
      };

      hub-display-kitchen = (import ./host/display-kitchen/host.nix) {
        inherit
          adminPublicKeys
          inputs
          system
          wireguardNetwork
          ;

        ipv4Address = hub-display-kitchen-ipv4Address;
        overlays = [ self.overlays.default ];
      };

      hub-display-common = (import ./host/display-common/host.nix) {
        inherit
          adminPublicKeys
          inputs
          system
          wireguardNetwork
          ;

        ipv4Address = hub-display-common-ipv4Address;
        overlays = [ self.overlays.default ];
      };

      hosts = [
        hub-gateway
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

        hub-gateway-image = hub-gateway.imagePackage;
        hub-gateway-provisioner = hub-gateway.provisioner;
      };

      lib = {
        hub-gateway.imageConfiguration = hub-gateway.imageConfiguration;
      };

      nixosConfigurations.hub-gateway = hub-gateway.nixosConfiguration;
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

      nixosModules = {
        h3-backend = ./app/backend/module.nix;
      };

      devShells.${system}.default = devShell;
    };
}
