{
  h3-frontend,
}:
{
  config,
  lib,
  hostingEnvironment,
  ...
}:

let
  inherit (lib)
    mkEnableOption
    mkIf
    mkOption
    types
    ;

  cfg = config.services.h3-frontend;
in
{
  options.services.h3-frontend = {
    enable = mkEnableOption "H3 Frontend instance: ${hostingEnvironment}";

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
      description = "The base H3 frontend package to override with the instance API URL.";
    };
  };

  config = mkIf (cfg.enable) {
    services.caddy = {
      enable = true;

      virtualHosts.${cfg.frontendAuthority}.extraConfig =
        let
          basePackage = if cfg.package != null then cfg.package else h3-frontend;

          configuredPackage = basePackage.override {
            backendOrigin = cfg.backendOrigin;
          };
        in
        ''
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
    };
  };
}
