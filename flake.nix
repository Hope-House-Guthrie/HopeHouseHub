{
  description = "Hope House Hub";

  inputs = {
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-2605.url = "github:nixos/nixpkgs?ref=nixos-26.05";
  };

  outputs =
    { nixpkgs-unstable, nixpkgs-2605, ... }:
    let
      system = "x86_64-linux";
    in
    {

      devShells.${system}.default =
        let
          pkgs = import nixpkgs-unstable { inherit system; };
        in
        pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            dotnet-sdk_10
          ];

          shellHook = ''
            export DOTNET_ROOT="${pkgs.dotnet-sdk_10}"
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
