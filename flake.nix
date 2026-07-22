{
  description = "Hope House Hub";

  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-2605.url = "github:nixos/nixpkgs?ref=nixos-26.05";

    bun2nix = {
      url = "github:nix-community/bun2nix";
      inputs.nixpkgs.follows = "nixpkgs-unstable";
    };
  };

  outputs =
    {
      nixpkgs-unstable,
      nixpkgs-2605,
      bun2nix,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs-unstable = import nixpkgs-unstable { inherit system; };

      frontend = pkgs-unstable.callPackage ./app/frontend/package.nix {
        bun2nix = bun2nix.packages.${system}.default;
      };
    in
    {
      inherit frontend;

      devShells.${system}.default = pkgs-unstable.mkShell {
        buildInputs = with pkgs-unstable; [
          bun
          dotnet-sdk_10
          bun2nix.packages.${system}.default
        ];

        shellHook = ''
          export DOTNET_ROOT="${pkgs-unstable.dotnet-sdk_10}"
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
