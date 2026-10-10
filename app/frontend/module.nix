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
    mkEnableOption
    mkIf
    mkOption
    nameValuePair
    types
    ;

  cfg = config.services.h3-frontend;
  enabledInstances = filterAttrs (_: inst: inst.enable) cfg;

  instanceOptions =
    { name, ... }:
    {
      options = {
        enable = mkEnableOption "H3 Frontend instance: ${name}";

        backendOrigin = mkOption {
          type = types.str;
          description = "HTTP Origin for the backend application.";
        };

        frontendAuthority = mkOption {
          type = types.str;
          description = "HTTP Authority for the frontend application.";
        };

        package = mkOption {
          type = types.nullOr types.package;
          default = null;
          defaultText = lib.literalExpression "pkgs.h3-frontend";
          description = "The base H3 frontend package to override with the instance API URL.";
        };
      };
    };
in
{
  options.services.h3-frontend = mkOption {
    type = types.attrsOf (types.submodule instanceOptions);
    default = { };
    description = "Declarative multi-instance frontend service configuration.";
  };

  config = mkIf (enabledInstances != { }) {
    services.caddy = {
      enable = true;

      virtualHosts = mapAttrs' (
        name: inst:
        let
          basePackage = if inst.package != null then inst.package else pkgs.h3-frontend;

          configuredPackage = basePackage.override {
            backendOrigin = inst.backendOrigin;
          };
        in
        nameValuePair inst.frontendAuthority {
          extraConfig = ''
            root * "${configuredPackage}/bin"
            encode gzip zstd

            handle {
              try_files {path} {path}/ /index.html
              file_server
            }

            log {
              output file /var/log/caddy/access.log
            }
          '';
        }
      ) enabledInstances;
    };
  };
}
