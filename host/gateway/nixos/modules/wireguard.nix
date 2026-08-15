{ config, wireguardNetwork, ... }:
{
  age.secrets.wg_key = {
    file = ../../secrets/wg_key.age;
    mode = "640";
    owner = "systemd-network";
    group = "systemd-network";
  };

  networking.firewall.allowedUDPPorts = [ 42656 ];

  systemd.network = {
    enable = true;

    networks."50-wg0" = {
      matchConfig.Name = "wg0";

      address = [
        "${wireguardNetwork.hub-gateway.ipv4Address}/32"
      ];
    };

    netdevs."50-wg0" = {
      netdevConfig = {
        Kind = "wireguard";
        Name = "wg0";
      };

      wireguardConfig = {
        ListenPort = 42656;
        PrivateKeyFile = config.age.secrets.wg_key.path;
        RouteTable = "main";
        FirewallMark = 42;
      };

      wireguardPeers = [
        {
          PublicKey = "${wireguardNetwork.hub-services.publicKey}";
          AllowedIPs = [
            "${wireguardNetwork.hub-services.ipv4Address}/32"
          ];
        }
      ];
    };
  };
}
