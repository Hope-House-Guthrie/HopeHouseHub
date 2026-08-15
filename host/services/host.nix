{ ... }@args:
let
  name = "hub-services";
  constants = import ./constants.nix;

  host = import ../lib/host.nix (
    args
    // {
      inherit name;

      imageFormat = "proxmox";

      nixosOptions = {
        modules = [
          ./nixos/configuration.nix
        ];

        specialArgs = {
          inherit constants;
        };
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
