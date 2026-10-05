{ hostName, ... }:
{
  imports = [
    ./hardware-configuration.nix
    ./modules/caddy.nix
  ];

  i18n.defaultLocale = "en_US.UTF-8";
  networking.hostName = hostName;
  system.stateVersion = "26.05";
}
