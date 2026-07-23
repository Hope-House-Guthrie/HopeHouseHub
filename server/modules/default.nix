{ lib, ... }: {
  imports = [
    ./age.nix
    ./caddy.nix
    ./ssh.nix
    ./users.nix
    ./vm-variant.nix
  ];
}
