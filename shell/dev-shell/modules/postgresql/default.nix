{ pkgs, ... }:
let
  dev-db = pkgs.writeShellApplication {
    name = "dev-db";
    runtimeInputs = [
      pkgs.bun
      pkgs.postgresql
    ];
    text = ''
      exec bun ${./dev-db.ts} "$@"
    '';
  };
in
{
  buildInputs = [
    pkgs.postgresql
    dev-db
  ];

  shellHook = ''
    eval "$(dev-db env)"
    dev-db start
  '';
}
