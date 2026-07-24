{ lib, ... }:
{
  nixpkgs.hostPlatform = lib.mkDefault "x86_64-linux";

  services.qemuGuest.enable = true;

  fileSystems."/".autoResize = true;

  networking.useDHCP = true;

  boot = {
    growPartition = true;

    initrd.availableKernelModules = [
      "ata_piix"
      "uhci_hcd"
      "virtio_pci"
      "virtio_scsi"
      "virtio_net"
      "sd_mod"
      "sr_mod"
    ];

    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };

    /*
      loader.grub = {
        enable = true;
        device = "/dev/sda";
      };
    */
  };
}
