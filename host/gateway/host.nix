{ ... }@args:
let
  name = "hub-gateway";

  host = import ../lib/host.nix (
    args
    // {
      inherit name;

      imageFormat = "azure";

      nixosOptions = {
        modules = [
          ./nixos/configuration.nix
        ];

        specialArgs = { };
      };

      terranixOptions = {
        extraArgs = { };

        modules = [
          ./terranix.nix
        ];
      };
    }
  );
in
host
