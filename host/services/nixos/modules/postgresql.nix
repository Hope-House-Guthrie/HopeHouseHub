{
  pkgs,
  lib,
  constants,
  ...
}:
let
  user = constants.postgresql.db_user;
  db = constants.postgresql.db_name;
in
{
  environment.systemPackages = [ pkgs.postgresql ];

  services.postgresql = {
    enable = true;
    authentication = lib.mkForce ''
      # TYPE  DATABASE  USER  ADDRESS  METHOD
      local   all       all            trust
    '';
    initialScript = pkgs.writeText "init-sql-script" ''
      -- 1. Create the user if it doesn't already exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${user}') THEN
          CREATE USER ${user};
        END IF;
      END
      $$;

      -- 2. Create the database if it doesn't already exist
      SELECT 'CREATE DATABASE ${db} OWNER ${user}'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db}')\gexec

      -- 3. Connect to the target database and set public schema ownership/permissions
      \connect ${db}

      ALTER SCHEMA public OWNER TO ${user};
      GRANT ALL ON SCHEMA public TO ${user};
    '';
  };
}
