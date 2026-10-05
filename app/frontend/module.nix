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

        domain = mkOption {
          type = types.str;
          description = "Public URL for the application.";
        };

        package = mkOption {
          type = types.nullOr types.package;
          default = null;
          defaultText = lib.literalExpression "pkgs.h3-frontend";
          description = "The H3 frontend package to use.";
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
          package = if inst.package != null then inst.package else pkgs.h3-frontend;
        in
        nameValuePair inst.domain {
          extraConfig = ''
            root * "${package}/bin"
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
