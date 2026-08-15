{
  adminPublicKeys,
  ipv4Address,
  imageFormat,
  inputs,
  name,
  nixosOptions,
  self,
  system,
  terranixOptions,
  wireguardNetwork,
}:
let
  nixosConfiguration = inputs.nixpkgs.lib.nixosSystem {
    specialArgs = nixosOptions.specialArgs // {
      inherit
        adminPublicKeys
        self
        system
        wireguardNetwork
        ;

      hostName = name;
    };

    modules = nixosOptions.modules ++ [
      inputs.agenix.nixosModules.default
      ../lib/nixos/modules/common
    ];
  };

  imagePackage = nixosConfiguration.config.system.build.images.${imageFormat};

  imageConfiguration = imagePackage.passthru.config;

  terranixConfiguration = inputs.terranix.lib.terranixConfiguration {
    inherit system;

    modules = terranixOptions.modules;

    extraArgs = terranixOptions.extraArgs // {
      inherit imageConfiguration imagePackage;
    };
  };
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
