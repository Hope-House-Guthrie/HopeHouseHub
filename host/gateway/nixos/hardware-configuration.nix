{ modulesPath, ... }:
{
  imports = [
    "${modulesPath}/virtualisation/azure-common.nix"
  ];

  image.modules.azure = {
    image.fileName = "azure-vm.vhd";
    virtualisation = {
      diskSize = 8192;
      azureImage.vmGeneration = "v2";
    };
  };

  virtualisation = {
    azure.acceleratedNetworking = true;
    hypervGuest.enable = true;
  };

  nixpkgs.hostPlatform = "x86_64-linux";

  boot = {
    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };

    initrd = {
      kernelModules = [
        "nvme"
        "nvme_core"
        "pci_hyperv"
      ];
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

  swapDevices = [ ];
}
