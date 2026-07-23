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
      serverPubKey = builtins.readFile ./secrets/ssh_host_ed25519_key.pub;

      adminPubKeys = [
        super-laptop.pubKeys.ssh.users.super
      ];
    in
    {
      packages.${system} = {
        inherit frontend backend;
      };

      devShells.${system}.default = (import ./shell/dev-shell.nix) {
        inherit
          pkgs
          self
          serverName
          agenix
          adminPubKeys
          serverPubKey
          dotnet-sdk
          system
          bun2nix
          ;
      };

      nixosConfigurations.${serverName} = (import ./server/nixos-system.nix) {
        inherit
          self
          nixpkgs
          agenix
          serverName
          adminPubKeys
          ;

        stateVersion = "26.05";
      };
    };
}
