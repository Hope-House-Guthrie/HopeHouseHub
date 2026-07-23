{
  self,
  nixpkgs,
  agenix,
  serverName,
  adminPubKeys,
  stateVersion,
  frontend,
  backend,
  ...
}:
let
  inherit adminPubKeys stateVersion;
in
nixpkgs.lib.nixosSystem {
  specialArgs = {
    inherit
      self
      adminPubKeys
      frontend
      backend
      ;
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
