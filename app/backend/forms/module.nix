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

        azureServiceBusFile = mkOption {
          type = types.nullOr types.str;
          default = null;
          description = "Path to the file containing the Azure Service Bus connection string.";
        };

        socketPath = mkOption {
          type = types.str;
          readOnly = true;
          default = "/run/h3-forms-${name}/runtime.sock";
          description = "Runtime UNIX socket path used by this instance.";
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
    users.users = mapAttrs' (
      name: inst:
      nameValuePair inst.user {
        isSystemUser = true;
        group = inst.group;
        description = "H3 Forms Service User (${name})";
      }
    ) enabledInstances;

    users.groups = mapAttrs' (_: inst: nameValuePair inst.group { }) enabledInstances;

    systemd.services = mkMerge (
      mapAttrsToList (
        name: inst:
        let
          serviceName = "h3-forms-${name}";
          package = if inst.package != null then inst.package else pkgs.h3-forms;
        in
        {
          "${serviceName}" = {
            description = "H3 Forms (${name})";
            after = [ "network.target" ];
            wantedBy = [ "multi-user.target" ];
            serviceConfig = {
              User = inst.user;
              Group = inst.group;
              RuntimeDirectory = serviceName;
              RuntimeDirectoryMode = "0750";
              UMask = "0007";
              WorkingDirectory = "${package}/bin";
              Restart = "always";
              ExecStart = pkgs.writeShellScript "h3-forms-wrapper" ''
                set -euo pipefail
                export ASPNETCORE_URLS="http://unix:${inst.socketPath}"
                ${
                  if inst.azureServiceBusFile != null then
                    ''
                      export H3__QUEUES__MODE="AzureServiceBus"
                      export H3__QUEUES__AZURESERVICEBUS__CONNECTIONSTRING="$(cat "${inst.azureServiceBusFile}")"
                    ''
                  else
                    ''
                      export H3__QUEUES__MODE="InMemory"
                    ''
                }
                exec ${package}/bin/h3-forms
              '';
            };
          };
        }
      ) enabledInstances
    );
  };
}
