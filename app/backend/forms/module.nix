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

  cfg = config.services.h3-forms;
  enabledInstances = filterAttrs (_: inst: inst.enable) cfg;

  instanceOptions =
    { name, ... }:
    {
      options = {
        enable = mkEnableOption "H3 Forms instance: ${name}";

        domain = mkOption {
          type = types.str;
          description = "Public URL for the application.";
        };

        user = mkOption {
          type = types.str;
          default = "h3-forms-${name}";
          description = "System user account under which the service runs.";
        };

        group = mkOption {
          type = types.str;
          default = "h3-forms-${name}";
          description = "System group under which the service runs.";
        };

        package = mkOption {
          type = types.nullOr types.package;
          default = null;
          defaultText = lib.literalExpression "pkgs.h3-forms";
          description = "The H3 forms package to use.";
        };
      };
    };
in
{
  options.services.h3-forms = mkOption {
    type = types.attrsOf (types.submodule instanceOptions);
    default = { };
    description = "Declarative multi-instance forms service configuration.";
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
        description = "H3 Forms Service User (${name})";
      }
    ) enabledInstances;

    users.groups = mapAttrs' (_: inst: nameValuePair inst.group { }) enabledInstances;

    services.caddy = {
      enable = true;

      virtualHosts = mapAttrs' (
        name: inst:
        let
          serviceName = "h3-forms-${name}";
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
          serviceName = "h3-forms-${name}";
          runtimeDir = "/run/${serviceName}";
          runtimeEnvFile = "${runtimeDir}/runtime.env";
          runtimeSocketFile = "${runtimeDir}/runtime.sock";
          package = if inst.package != null then inst.package else pkgs.h3-forms;
        in
        {
          "${serviceName}-env" = {
            description = "Generate runtime environment file for ${serviceName}";
            wantedBy = [ "multi-user.target" ];
            before = [ "${serviceName}.service" ];
            serviceConfig = {
              Type = "oneshot";
              RemainAfterExit = true;
              RuntimeDirectory = serviceName;
              RuntimeDirectoryMode = "0750";
              User = inst.user;
              Group = inst.group;
              ExecStart = pkgs.writeShellScript "${serviceName}-env-setup" ''
                set -euo pipefail
                echo "TODO=" > "${runtimeEnvFile}"
                chmod 0600 "${runtimeEnvFile}"
              '';
            };
          };

          "${serviceName}" = {
            description = "H3 Forms (${name})";

            after = [
              "network.target"
              "${serviceName}-env.service"
            ];

            requires = [
              "${serviceName}-env.service"
            ];

            wantedBy = [ "multi-user.target" ];

            serviceConfig = {
              ExecStart = "${package}/bin/h3-forms";
              WorkingDirectory = "${package}/bin";
              Restart = "always";
              User = inst.user;
              Group = inst.group;
              EnvironmentFile = runtimeEnvFile;
              RuntimeDirectory = serviceName;
              RuntimeDirectoryMode = "0750";
              UMask = "0007";
              Environment = [
                "ASPNETCORE_URLS=http://unix:${runtimeSocketFile}"
              ];
            };
          };
        }
      ) enabledInstances
    );
  };
}
