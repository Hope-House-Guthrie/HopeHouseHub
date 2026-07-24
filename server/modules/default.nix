{ lib, ... }: {
  imports = [
    ./age.nix
    ./backend.nix
    ./caddy.nix
    ./disko.nix
    ./ssh.nix
    ./users.nix
    ./vm-variant.nix
  ];
}
