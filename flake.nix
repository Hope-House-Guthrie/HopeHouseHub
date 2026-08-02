{
  description = "Hope House Hub";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    super-laptop.url = "github:tj-super/super-laptop";

    disko = {
      url = "github:nix-community/disko?ref=v1.13.0";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nixos-anywhere = {
      url = "github:nix-community/nixos-anywhere?ref=1.13.0";
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
      nixpkgs,
      super-laptop,
      disko,
      agenix,
      bun2nix,
      nuget-packageslock2nix,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      version = "0.1.0";

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

      frontend = pkgs.callPackage ./app/frontend/package.nix {
        inherit version backend;

        bun2nix = bun2nix.packages.${system}.default;
      };

      adminPubKeys = [
        super-laptop.pubKeys.ssh.users.super
      ];

      hosts = {
        hub-server = (import ./host/server/host.nix) {
          inherit
            self
            nixpkgs
            agenix
            disko
            adminPubKeys
            frontend
            backend
            ;

          vmSSHPort = 3022;
          stateVersion = "26.05";
          ipv4Address = "192.168.0.90";
        };
      };

      devShell = (import ./shell/dev-shell/default.nix) {
        inherit
          pkgs
          self
          agenix
          adminPubKeys
          dotnet-sdk
          system
          bun2nix
          hosts
          ;
      };
    in
    {
      packages.${system} = {
        inherit frontend backend;
      };

      nixosConfigurations = builtins.mapAttrs (_name: host: host.nixosConfiguration) hosts;

      devShells.${system}.default = devShell;
    };
}
