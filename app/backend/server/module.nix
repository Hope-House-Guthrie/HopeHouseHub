{
  h3-server,
}:
{
  hostingEnvironment,
}:
{
  config,
  lib,
  pkgs,
  ...
}:

let
  inherit (lib)
    mkEnableOption
    mkIf
    mkOption
    types
    ;

  cfg = config.services.h3-server.${hostingEnvironment};

  serviceName = "h3-server-${hostingEnvironment}";
  runtimeSocketFile = "/run/${serviceName}/runtime.sock";
in
{
  options.services.h3-server.${hostingEnvironment} = {
    enable = mkEnableOption "H3 Server";

    backendAuthority = mkOption {
      type = types.str;
      description = "HTTP Authority for the backend application.";
    };

    frontendOrigin = mkOption {
      type = types.str;
      description = "HTTP Origin for the frontend application.";
    };

    user = mkOption {
      type = types.str;
      default = "h3-server-${hostingEnvironment}";
      description = "System user account under which the service runs.";
    };

    group = mkOption {
      type = types.str;
      default = "h3-server-${hostingEnvironment}";
      description = "System group under which the service runs.";
    };

    jwtSecretFile = mkOption {
      type = types.path;
      description = "Path to the file containing the raw JWT secret key.";
    };

    azureServiceBusFile = mkOption {
      type = types.nullOr types.str;
      default = null;
      description = "Path to the file containing the Azure Service Bus connection string.";
    };

    database = {
      host = mkOption {
        type = types.str;
        default = "localhost";
        description = "PostgreSQL host address or socket directory.";
      };

      name = mkOption {
        type = types.str;
        default = "h3_${hostingEnvironment}";
        description = "PostgreSQL database name.";
      };

      user = mkOption {
        type = types.str;
        default = "h3_${hostingEnvironment}";
        description = "PostgreSQL database user.";
      };

      port = mkOption {
        type = types.port;
        default = 5432;
        description = "PostgreSQL database port.";
      };
    };
  };

  config = mkIf (cfg.enable) {
    users = {
      users = {
        caddy.extraGroups = [ cfg.group ];

        ${cfg.user} = {
          isSystemUser = true;
          group = cfg.group;
          description = "H3 Server Service User";
        };
      };

      groups.${cfg.group} = { };
    };

    services.caddy = {
      enable = true;

      virtualHosts.${cfg.backendAuthority}.extraConfig = ''
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
    };

    systemd.services = {
      "${serviceName}" = {
        description = "H3 Server (${hostingEnvironment})";

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
          WorkingDirectory = "${h3-server}/bin";
          Restart = "always";
          User = cfg.user;
          Group = cfg.group;
          RuntimeDirectory = serviceName;
          RuntimeDirectoryMode = "0750";
          UMask = "0007";
          ExecStart = pkgs.writeShellScript "h3-server-wrapper" ''
            set -euo pipefail

            export ASPNETCORE_URLS=http://unix:${runtimeSocketFile}
            export PGHOST=${cfg.database.host}
            export PGDATABASE=${cfg.database.name}
            export PGUSER=${cfg.database.user}
            export PGPORT=${toString cfg.database.port}
            export JWT__ISSUER=https://${cfg.backendAuthority}
            export JWT__AUDIENCE=https://${cfg.backendAuthority}
            export JWT__SECRET=$(cat "${cfg.jwtSecretFile}")
            export H3__FRONTEND__ORIGIN="${cfg.frontendOrigin}"

            ${
              if cfg.azureServiceBusFile != null then
                ''
                  export H3__QUEUES__MODE="AzureServiceBus"
                  export H3__QUEUES__AZURESERVICEBUS__CONNECTIONSTRING="$(cat "${cfg.azureServiceBusFile}")"
                ''
              else
                ''
                  export H3__QUEUES__MODE="InMemory"
                ''
            }

            exec ${h3-server}/bin/h3-server
          '';
        };
      };
    };
  };
}
