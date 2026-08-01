{
  self,
  nixpkgs,
  agenix,
  disko,
  adminPubKeys,
  vmSSHPort,
  stateVersion,
  frontend,
  backend,
  ipv4Address,
}:
let
  publicKey = builtins.readFile ./secrets/ssh_host_ed25519_key.pub;
  privateKey = ./secrets/ssh_host_ed25519_key.age;

  constants = import ./constants.nix;
in
{
  inherit ipv4Address publicKey privateKey;

  nixosConfiguration = nixpkgs.lib.nixosSystem {
    specialArgs = {
      inherit
        self
        adminPubKeys
        vmSSHPort
        frontend
        backend
        constants
        ;
    };

    modules = [
      agenix.nixosModules.default
      disko.nixosModules.disko

      "${self}/host/lib/configuration.nix"
      "${self}/host/lib/modules"
      ./modules

      {
        networking.hostName = "hub-server";
        system.stateVersion = stateVersion;
      }
    ];
  };
}
