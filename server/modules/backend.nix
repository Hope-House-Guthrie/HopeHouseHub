{ backend, ... }:
{
  systemd.services.backend = {
    description = "Hope House Hub Backend";
    after = [ "network.target" ];
    wantedBy = [ "multi-user.target" ];

    serviceConfig = {
      ExecStart = "${backend}/bin/backend";
      WorkingDirectory = "${backend}/bin";
      Restart = "always";
      Environment = "ASPNETCORE_URLS=http://unix:/run/backend/backend.sock";
      RuntimeDirectory = "backend";
      RuntimeDirectoryMode = "0770";
      UMask = "0007";
      DynamicUser = true;
      Group = "caddy";
    };
  };
}
