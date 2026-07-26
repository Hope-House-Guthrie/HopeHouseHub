{ lib, ... }:
{
  nixpkgs.hostPlatform = lib.mkDefault "x86_64-linux";

  services.qemuGuest.enable = true;

  fileSystems."/".autoResize = true;

  networking.useDHCP = true;
}
