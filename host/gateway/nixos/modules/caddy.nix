{
  inputs,
  pkgs,
  system,
  wireguardNetwork,
  ...
}:
let
  portal = inputs.h2site.packages.${system}.default;

  hubConfig = ''
    root * "${pkgs.h3-frontend}/bin"
    encode gzip zstd

    @api_routes {
      path /api /api/ /api/*
    }

    handle @api_routes {
      reverse_proxy http://${wireguardNetwork.hub-services.ipv4Address}:5000
    }

    handle {
      try_files {path} {path}/ /index.html
      file_server
    }

    log {
      output file /var/log/caddy/access.log
    }
  '';

  portalConfig = ''
    root * "${portal}/bin"
    encode gzip zstd

    handle {
      try_files {path} {path}/
      file_server
    }

    log {
      output file /var/log/caddy/access.log
    }
  '';
in
{
  networking.firewall.allowedTCPPorts = [
    80
    443
  ];

  services.caddy = {
    enable = true;

    email = "admin@nhdhopehouseguthrie.org";

    virtualHosts = {
      "hub.nhdhopehouseguthrie.org" = {
        extraConfig = hubConfig;
      };

      "nhdhopehouseguthrie.org" = {
        extraConfig = portalConfig;
      };

      "www.nhdhopehouseguthrie.org" = {
        extraConfig = portalConfig;
      };
    };
  };
}
