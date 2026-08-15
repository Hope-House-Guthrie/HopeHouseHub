{
  constants,
  ...
}:
let
  caddyConfig = ''
    encode gzip zstd

    @api_routes {
      path /api /api/ /api/*
    }

    handle @api_routes {
      reverse_proxy unix/${constants.backendSocketPath}
    }

    log {
      output file /var/log/caddy/access.log
    }
  '';
in
{
  networking.firewall.allowedTCPPorts = [
    80
  ];

  services.caddy = {
    enable = true;

    virtualHosts = {
      ":80".extraConfig = caddyConfig;
    };
  };

  virtualisation.vmVariant = {
    virtualisation.forwardPorts = [
      {
        from = "host";
        host.port = 3080;
        guest.port = 80;
      }
    ];
  };
}
