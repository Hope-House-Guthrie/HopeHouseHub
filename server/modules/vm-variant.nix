{ lib, ... }: {
  virtualisation.vmVariant = {
    boot = {
      growPartition = lib.mkForce false;
      loader = {
        grub.enable = lib.mkForce false;
        systemd-boot.enable = true;
        efi.canTouchEfiVariables = true;
      };
    };

    users = {
      users.root = {
        password = lib.mkForce "root";
        hashedPassword = lib.mkForce null;
      };
    };

    virtualisation.forwardPorts = [
      {
        from = "host";
        host.port = 3022;
        guest.port = 22;
      }
    ];
  };
}
