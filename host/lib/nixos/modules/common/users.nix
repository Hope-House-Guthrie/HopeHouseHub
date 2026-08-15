{ lib, adminPublicKeys, ... }:
{
  users = {
    mutableUsers = false;

    users.root.hashedPassword = "!";

    users.admin = {
      isNormalUser = true;
      hashedPassword = "!";
      openssh.authorizedKeys.keys = adminPublicKeys;
      extraGroups = [
        "wheel"
      ];
    };
  };

  security.sudo = {
    enable = true;
    wheelNeedsPassword = false;
  };

  nix.settings.trusted-users = [
    "root"
    "admin"
  ];

  virtualisation.vmVariant = {
    users = {
      users.root = {
        password = lib.mkForce "root";
        hashedPassword = lib.mkForce null;
      };
    };
  };
}
