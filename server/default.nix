{ lib, ... }: {
  imports = [
    ./configuration.nix

    modules/age.nix
    modules/caddy.nix
    modules/ssh.nix
    modules/users.nix
    modules/vm-variant.nix
  ];
}
