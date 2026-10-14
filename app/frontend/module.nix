{
  h3-frontend,
}:
{
  hostingEnvironment,
}:
{
  config,
  lib,
  ...
}:

let
  inherit (lib)
    mkEnableOption
    mkIf
    mkOption
    types
    ;

  cfg = config.services.h3-frontend.${hostingEnvironment};
in
{
  options.services.h3-frontend.${hostingEnvironment} = {
    enable = mkEnableOption "H3 Frontend instance: ${hostingEnvironment}";

    backendOrigin = mkOption {
      type = types.str;
      description = "HTTP Origin for the backend application.";
    };

    frontendAuthority = mkOption {
      type = types.str;
      description = "HTTP Authority for the frontend application.";
    };
  };

  config = mkIf (cfg.enable) {
    services.caddy = {
      enable = true;

      virtualHosts.${cfg.frontendAuthority}.extraConfig =
        let
          package = h3-frontend.override {
            backendOrigin = cfg.backendOrigin;
          };
        in
        ''
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
    };
  };
}
