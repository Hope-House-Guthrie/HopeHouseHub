{ backend, frontend, ... }:
{
  networking.firewall.allowedTCPPorts = [ 80 ];

  services.caddy = {
    enable = true;

    virtualHosts.":80" = {
      extraConfig = ''
        root * "${frontend}/bin"
        encode gzip zstd

        @api_routes {
          path /api /api/ /api/*
        }

        handle @api_routes {
          reverse_proxy unix//run/backend/backend.sock
        }

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
