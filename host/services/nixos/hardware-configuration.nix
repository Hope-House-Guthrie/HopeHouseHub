{ lib, modulesPath, ... }: {
  imports = [
    (modulesPath + "/profiles/qemu-guest.nix")
  ];

  nixpkgs.hostPlatform = lib.mkDefault "x86_64-linux";

  image.modules.proxmox = {
    proxmox = {
      cloudInit.enable = false;
      filenameSuffix = "hub-services";
      partitionTableType = "efi";

      qemuConf = {
        bios = "ovmf";
      };
    };

    virtualisation.diskSize = 8192;
  };

  boot = {
    kernelModules = [ "kvm-intel" ];

    initrd.availableKernelModules = [
      "uhci_hcd"
      "ehci_pci"
      "ahci"
      "virtio_pci"
      "virtio_blk"
    ];

    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };
  };

  fileSystems = {
    "/" = {
      device = "/dev/disk/by-label/nixos";
      fsType = "ext4";
    };

    "/boot" = {
      device = "/dev/disk/by-label/ESP";
      fsType = "vfat";
      options = [
        "fmask=0022"
        "dmask=0022"
      ];
    };
  };
}
