{
  pkgs,
  backend,
  frontend,
  ...
}:
let
  caddyConfig = ''
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
in
{
  # todo: separate vmVariant stuff / port 3443

  networking.firewall.allowedTCPPorts = [
    80
    443
    3443
  ];

  services.caddy = {
    enable = true;

    globalConfig = ''
      auto_https disable_redirects
    '';

    virtualHosts = {
      ":80".extraConfig = caddyConfig;

      "https://localhost:3443".extraConfig = ''
        tls internal
        ${caddyConfig}
      '';

      "https://192.168.0.90:443".extraConfig = ''
        tls internal
        ${caddyConfig}
      '';
    };
  };

  virtualisation.vmVariant = {
    virtualisation.forwardPorts = [
      {
        from = "host";
        host.port = 3080;
        guest.port = 80;
      }
      {
        from = "host";
        host.port = 3443;
        guest.port = 3443;
      }
    ];
  };
}
