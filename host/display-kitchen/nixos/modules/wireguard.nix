{ config, wireguardNetwork, ... }:
let
  port = 42656;
in
{
  age.secrets.wg_key = {
    file = ../../secrets/wg_key.age;
    mode = "640";
    owner = "systemd-network";
    group = "systemd-network";
  };

  networking.firewall.allowedUDPPorts = [ port ];

  networking.useNetworkd = true;

  systemd.network = {
    enable = true;

    networks."50-wg0" = {
      matchConfig.Name = "wg0";

      address = [
        "${wireguardNetwork.hub-display-kitchen.ipv4Address}/32"
      ];
    };

    netdevs."50-wg0" = {
      netdevConfig = {
        Kind = "wireguard";
        Name = "wg0";
      };

      wireguardConfig = {
        ListenPort = port;
        PrivateKeyFile = config.age.secrets.wg_key.path;
        RouteTable = "main";
        FirewallMark = 42;
      };

      wireguardPeers = [
        {
          PublicKey = "${wireguardNetwork.hub-gateway.publicKey}";
          AllowedIPs = [
            "${wireguardNetwork.hub-gateway.ipv4Address}/32"
          ];
          Endpoint = "${wireguardNetwork.hub-gateway.endpoint}:${toString port}";
          PersistentKeepalive = 25;
        }
      ];
    };
  };
}
