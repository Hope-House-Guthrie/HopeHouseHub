{ lib, ... }: {
  imports = [
    ./age.nix
    ./backend.nix
    ./caddy.nix
    ./ssh.nix
    ./users.nix
    ./vm-variant.nix
  ];
}
