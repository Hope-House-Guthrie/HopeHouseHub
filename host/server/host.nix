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
}:
let
  name = "hub-server";
  publicKey = builtins.readFile ./secrets/ssh_host_ed25519_key.pub;
  privateKey = ./secrets/ssh_host_ed25519_key.age;
in
{
  inherit name publicKey privateKey;

  nixosConfiguration = nixpkgs.lib.nixosSystem {
    specialArgs = {
      inherit
        self
        adminPubKeys
        vmSSHPort
        frontend
        backend
        ;
    };

    modules = [
      agenix.nixosModules.default
      disko.nixosModules.disko

      "${self}/host/lib/configuration.nix"
      "${self}/host/lib/modules"
      ./modules

      {
        networking.hostName = name;
        system.stateVersion = stateVersion;
      }
    ];
  };
}
