{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

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

      pkgs = import inputs.nixpkgs {
        inherit system;

        overlays = [
          (final: prev: {
            dotnet-sdk = pkgs.dotnet-sdk_10;
            dotnet-runtime = pkgs.dotnet-aspnetcore_10;
          })
        ];
      };

      backend = pkgs.callPackage ./app/backend/package.nix {
        inherit
          inputs
          pkgs
          self
          version
          ;
      };

      frontend = pkgs.callPackage ./app/frontend/package.nix {
        inherit
          inputs
          pkgs
          self
          version
          ;
      };

      adminPublicKeys = (import ./secrets.nix).adminPublicKeys;

      hub-gateway-ipv4Address = "104.215.78.1";
      hub-services-ipv4Address = "192.168.0.90";

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
      };

      hub-gateway = (import ./host/gateway/host.nix) {
        inherit
          adminPublicKeys
          inputs
          self
          system
          wireguardNetwork
          ;

        ipv4Address = hub-gateway-ipv4Address;
      };

      hub-services = (import ./host/services/host.nix) {
        inherit
          adminPublicKeys
          inputs
          self
          system
          wireguardNetwork
          ;

        ipv4Address = hub-services-ipv4Address;
      };

      hosts = [
        hub-gateway
        hub-services
      ];

      devShell = (import ./shell/dev-shell/default.nix) {
        inherit
          adminPublicKeys
          hosts
          inputs
          pkgs
          self
          system
          ;
      };
    in
    {
      packages.${system} = {
        inherit frontend backend;

        hub-gateway-image = hub-gateway.imagePackage;
        hub-gateway-provisioner = hub-gateway.provisioner;

        hub-services-image = hub-services.imagePackage;
        hub-services-provisioner = hub-services.provisioner;
      };

      lib = {
        hub-gateway.imageConfiguration = hub-gateway.imageConfiguration;
        hub-services.imageConfiguration = hub-services.imageConfiguration;
      };

      nixosConfigurations.hub-gateway = hub-gateway.nixosConfiguration;
      nixosConfigurations.hub-services = hub-services.nixosConfiguration;

      devShells.${system}.default = devShell;
    };
}
