{ adminPubKeys, ... }:
{
  users = {
    mutableUsers = false;

    users.root.hashedPassword = "!";

    users.admin = {
      isNormalUser = true;
      hashedPassword = "!";
      openssh.authorizedKeys.keys = adminPubKeys;
      extraGroups = [
        "wheel"
      ];
    };
  };

  security.sudo = {
    enable = true;
    wheelNeedsPassword = false;
  };
}
