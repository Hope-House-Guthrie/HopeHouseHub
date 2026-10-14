{
  h3-forms,
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

  cfg = config.services.h3-forms.${hostingEnvironment};

  serviceName = "h3-forms-${hostingEnvironment}";
in
{
  options.services.h3-forms.${hostingEnvironment} = {
    enable = mkEnableOption "H3 Forms instance: ${hostingEnvironment}";

    user = mkOption {
      type = types.str;
      default = "h3-forms-${hostingEnvironment}";
      description = "System user account under which the service runs.";
    };

    group = mkOption {
      type = types.str;
      default = "h3-forms-${hostingEnvironment}";
      description = "System group under which the service runs.";
    };

    azureServiceBusFile = mkOption {
      type = types.nullOr types.str;
      default = null;
      description = "Path to the file containing the Azure Service Bus connection string.";
    };

    socketPath = mkOption {
      type = types.str;
      readOnly = true;
      default = "/run/h3-forms-${hostingEnvironment}/runtime.sock";
      description = "Runtime UNIX socket path used by this instance.";
    };
  };

  config = mkIf (cfg.enable) {
    users = {
      users = {
        ${cfg.user} = {
          isSystemUser = true;
          group = cfg.group;
          description = "H3 Forms Service User (${hostingEnvironment})";
        };
      };

      groups.${cfg.group} = { };
    };

    systemd.services.${serviceName} = {
      description = "H3 Forms (${hostingEnvironment})";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      serviceConfig = {
        User = cfg.user;
        Group = cfg.group;
        RuntimeDirectory = serviceName;
        RuntimeDirectoryMode = "0750";
        UMask = "0007";
        WorkingDirectory = "${h3-forms}/bin";
        Restart = "always";
        ExecStart = pkgs.writeShellScript "h3-forms-wrapper" ''
          set -euo pipefail
          export ASPNETCORE_URLS="http://unix:${cfg.socketPath}"
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
          exec ${h3-forms}/bin/h3-forms
        '';
      };
    };
  };
}
