{ hostName, ... }:
{
  imports = [
    ./hardware-configuration.nix
    ./modules/backend.nix
    ./modules/caddy.nix
    ./modules/postgresql.nix
    ./modules/wireguard.nix
  ];

  i18n.defaultLocale = "en_US.UTF-8";
  networking.hostName = hostName;
  system.stateVersion = "26.05";
}
