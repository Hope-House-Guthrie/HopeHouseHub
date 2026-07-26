{ lib, ... }: {
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
  };

  virtualisation.vmVariant = {
    boot.growPartition = lib.mkForce false;
  };
}
