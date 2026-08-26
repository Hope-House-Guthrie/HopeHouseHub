{ hostName, ... }:
{
  imports = [
    ./hardware-configuration.nix
    ./modules/wireguard.nix
  ];

  i18n.defaultLocale = "en_US.UTF-8";
  system.stateVersion = "26.05";

  networking = {
    inherit hostName;
    networkmanager.enable = true;
  };
}
