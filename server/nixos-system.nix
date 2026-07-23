{
  self,
  nixpkgs,
  agenix,
  serverName,
  adminPubKeys,
  stateVersion,
  ...
}:
let
  inherit adminPubKeys stateVersion;
in
nixpkgs.lib.nixosSystem {
  specialArgs = {
    inherit self adminPubKeys;
  };

  modules = [
    agenix.nixosModules.default
    ./configuration.nix
    ./modules
    {
      networking.hostName = serverName;
      system.stateVersion = stateVersion;
    }
  ];
}
