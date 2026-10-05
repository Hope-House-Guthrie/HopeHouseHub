{
  adminPublicKeys,
  ipv4Address,
  imageFormat ? null,
  inputs,
  name,
  nixosOptions,
  overlays,
  system,
  terranixOptions ? null,
  wireguardNetwork,
}:
let
  nixosConfiguration = inputs.nixpkgs.lib.nixosSystem {
    specialArgs = nixosOptions.specialArgs // {
      inherit
        adminPublicKeys
        inputs
        system
        wireguardNetwork
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

  imagePackage =
    if imageFormat != null then nixosConfiguration.config.system.build.images.${imageFormat} else null;

  imageConfiguration = if imagePackage != null then imagePackage.passthru.config else null;

  terranixConfiguration =
    if terranixOptions != null then
      inputs.terranix.lib.terranixConfiguration {
        inherit system;

        modules = terranixOptions.modules;

        extraArgs = terranixOptions.extraArgs // {
          inherit imageConfiguration imagePackage;
        };
      }
    else
      null;
in
{
  inherit
    imagePackage
    imageConfiguration
    ipv4Address
    name
    nixosConfiguration
    ;

  provisioner = terranixConfiguration;
}
