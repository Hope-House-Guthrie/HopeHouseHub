{
  config,
  lib,
  pkgs,
  ...
}:

let
  inherit (lib)
    filterAttrs
    mapAttrs'
    mapAttrsToList
    mkEnableOption
    mkIf
    mkMerge
    mkOption
    nameValuePair
    types
    ;

  cfg = config.services.h3-server;
  enabledInstances = filterAttrs (_: inst: inst.enable) cfg;

  instanceOptions =
    { name, ... }:
    {
      options = {
        enable = mkEnableOption "H3 Backend instance: ${name}";

        domain = mkOption {
          type = types.str;
          description = "Public URL for the application.";
        };

        user = mkOption {
          type = types.str;
          default = "h3-server-${name}";
          description = "System user account under which the service runs.";
        };

        group = mkOption {
          type = types.str;
          default = "h3-server-${name}";
          description = "System group under which the service runs.";
        };

        jwtSecretFile = mkOption {
          type = types.path;
          description = "Path to the file containing the raw JWT secret key.";
        };

        package = mkOption {
          type = types.nullOr types.package;
          default = null;
          defaultText = lib.literalExpression "pkgs.h3-server";
          description = "The H3 backend package to use.";
        };

        database = {
          host = mkOption {
            type = types.str;
            default = "localhost";
            description = "PostgreSQL host address or socket directory.";
          };

          name = mkOption {
            type = types.str;
            default = "h3_${name}";
            description = "PostgreSQL database name.";
          };

          user = mkOption {
            type = types.str;
            default = "h3_${name}";
            description = "PostgreSQL database user.";
          };

          port = mkOption {
            type = types.port;
            default = 5432;
            description = "PostgreSQL database port.";
          };
        };
      };
    };
in
{
  options.services.h3-server = mkOption {
    type = types.attrsOf (types.submodule instanceOptions);
    default = { };
    description = "Declarative multi-instance backend service configuration.";
  };

  config = mkIf (enabledInstances != { }) {
    users.users = {
      caddy.extraGroups = mapAttrsToList (_: inst: inst.group) enabledInstances;
    }
    // mapAttrs' (
      name: inst:
      nameValuePair inst.user {
        isSystemUser = true;
        group = inst.group;
        description = "H3 Backend Service User (${name})";
      }
    ) enabledInstances;

    users.groups = mapAttrs' (_: inst: nameValuePair inst.group { }) enabledInstances;

    services.caddy = {
      enable = true;

      virtualHosts = mapAttrs' (
        name: inst:
        let
          serviceName = "h3-server-${name}";
          runtimeSocketFile = "/run/${serviceName}/runtime.sock";
        in
        nameValuePair inst.domain {
          extraConfig = ''
            encode gzip zstd

            @api_routes {
              path /api /api/ /api/*
            }

            handle @api_routes {
              reverse_proxy unix/${runtimeSocketFile}
            }

            log {
              output file /var/log/caddy/access.log
            }
          '';
        }
      ) enabledInstances;
    };

    systemd.services = mkMerge (
      mapAttrsToList (
        name: inst:
        let
          serviceName = "h3-server-${name}";
          runtimeSocketFile = "/run/${serviceName}/runtime.sock";
          package = if inst.package != null then inst.package else pkgs.h3-server;
        in
        {
          "${serviceName}" = {
            description = "H3 Backend (${name})";

            after = [
              "network.target"
              "postgresql.service"
              "postgresql-setup.service"
            ];

            wants = [
              "postgresql-setup.service"
            ];

            requires = [
              "postgresql.service"
            ];

            wantedBy = [ "multi-user.target" ];

            serviceConfig = {
              WorkingDirectory = "${package}/bin";
              Restart = "always";
              User = inst.user;
              Group = inst.group;
              RuntimeDirectory = serviceName;
              RuntimeDirectoryMode = "0750";
              UMask = "0007";
              ExecStart = pkgs.writeShellScript "h3-server-wrapper" ''
                set -euo pipefail

                export ASPNETCORE_URLS=http://unix:${runtimeSocketFile}
                export PGHOST=${inst.database.host}
                export PGDATABASE=${inst.database.name}
                export PGUSER=${inst.database.user}
                export PGPORT=${toString inst.database.port}
                export JWT__ISSUER=https://${inst.domain}
                export JWT__AUDIENCE=https://${inst.domain}
                export JWT__SECRET=$(cat "${inst.jwtSecretFile}")

                exec ${package}/bin/h3-server
              '';
            };
          };
        }
      ) enabledInstances
    );
  };
}
