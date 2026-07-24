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
      {
        from = "host";
        host.port = 3080;
        guest.port = 80;
      }
      {
        from = "host";
        host.port = 3443;
        guest.port = 3443;
      }
    ];

    system.activationScripts.install-host-key = {
      text = ''
        SRC="/tmp/shared"
        if [ -f "$SRC/ssh_host_ed25519_key" ]; then
          install -D -m 600 "$SRC/ssh_host_ed25519_key"     /etc/ssh/ssh_host_ed25519_key
          install -D -m 644 "$SRC/ssh_host_ed25519_key.pub" /etc/ssh/ssh_host_ed25519_key.pub
          echo "SSH host keys installed from host."
        else
          echo "ERROR: SSH host keys not found in $SRC" >&2
          exit 1
        fi
      '';
    };

    system.activationScripts.agenixInstall.deps = [ "install-host-key" ];
  };
}
