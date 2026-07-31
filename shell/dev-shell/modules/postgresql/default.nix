{ pkgs, ... }:
let
  postgresql-ts = pkgs.writeShellApplication {
    name = "postgresql-ts";
    runtimeInputs = [
      pkgs.bun
      pkgs.postgresql
    ];
    text = ''
      exec bun ${./postgresql.ts} "$@"
    '';
  };
in
{
  buildInputs = [
    pkgs.postgresql
    postgresql-ts
  ];

  shellHook = ''
    eval "$(postgresql-ts env)"
    postgresql-ts start
  '';
}
