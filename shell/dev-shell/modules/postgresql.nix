{ pkgs, ... }:
let
  postgresqlConfTemplate = pkgs.writeText "postgresql.conf" ''
    listen_addresses = '''
    unix_socket_directories = '@PGHOST@'
  '';

  pgHbaConf = pkgs.writeText "pg_hba.conf" ''
    # TYPE  DATABASE  USER  ADDRESS  METHOD
    local   all       all            trust
  '';
in
{
  buildInputs = [
    pkgs.postgresql
  ];

  shellHook = ''
    FLAKE_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"

    export PGDATA="$FLAKE_ROOT/.postgresql/data"
    export PGHOST="$FLAKE_ROOT/.postgresql/sockets"
    export PGPORT="5432"
    export PGDATABASE="hub_db"
    export PGUSER="hub_user"

    sync-pg-configs() {
      sed "s|@PGHOST@|$PGHOST|g" ${postgresqlConfTemplate} > "$PGDATA/postgresql.conf"
      cp -f ${pgHbaConf} "$PGDATA/pg_hba.conf"
    }

    init-postgres() {
      mkdir -p "$PGHOST"
      initdb -D "$PGDATA" --no-locale -U "$PGUSER" --auth-local=trust >/dev/null
      sync-pg-configs
      pg_ctl -D "$PGDATA" -l "$PGDATA/init.log" -w start >/dev/null
      createdb -h "$PGHOST" -U "$PGUSER" "$PGDATABASE"
      pg_ctl -D "$PGDATA" stop >/dev/null
    }

    start-postgresql() {
      mkdir -p "$PGHOST"

      if [ ! -d "$PGDATA" ]; then
        init-postgres
      else
        sync-pg-configs
      fi

      if ! pg_isready -h "$PGHOST" -q; then
        pg_ctl -D "$PGDATA" -l "$PGDATA/postgres.log" -w start
      fi
    }

    stop-postgresql() {
      if pg_isready -h "$PGHOST" -q; then
        pg_ctl -D "$PGDATA" stop
      fi
    }

    start-postgresql
  '';
}
