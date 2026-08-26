{ ... }@args:
let
  name = "hub-display-common";

  host = import ../lib/host.nix (
    args
    // {
      inherit name;

      nixosOptions = {
        modules = [
          ./nixos/configuration.nix
          ../lib/nixos/modules/display
        ];

        specialArgs = {
        };
      };
    }
  );
in
host
