{
  adminPublicKeys,
  ipv4Address,
  imageFormat ? null,
  inputs,
  name,
  nixosOptions,
  overlays,
  system,
}:
let
  nixosConfiguration = inputs.nixpkgs.lib.nixosSystem {
    specialArgs = nixosOptions.specialArgs // {
      inherit
        adminPublicKeys
        inputs
        system
        ;

      hostName = name;
    };

    modules = nixosOptions.modules ++ [
      inputs.agenix.nixosModules.default
      ../lib/nixos/modules/common
      {
        nixpkgs.overlays = overlays;
      }
    ];
  };
in
{
  inherit
    ipv4Address
    name
    nixosConfiguration
    ;
}
