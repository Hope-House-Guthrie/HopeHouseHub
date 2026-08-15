{
  constants,
  self,
  system,
  ...
}:
{
  systemd.services.backend =
    let
      backend = self.packages.${system}.backend;
    in
    {
      description = "Hope House Hub Backend";
      after = [
        "network.target"
        "postgresql.service"
      ];
      requires = [ "postgresql.service" ];
      wantedBy = [ "multi-user.target" ];

      serviceConfig = {
        ExecStart = "${backend}/bin/backend";
        WorkingDirectory = "${backend}/bin";
        Restart = "always";
        Environment = [
          "ASPNETCORE_URLS=http://unix:${constants.backendSocketPath}"
          "PGHOST=/run/postgresql"
          "PGDATABASE=${constants.postgresql.db_name}"
          "PGUSER=${constants.postgresql.db_user}"
          "PGPORT=5432"
        ];
        RuntimeDirectory = "backend";
        RuntimeDirectoryMode = "0770";
        UMask = "0007";
        DynamicUser = true;
        Group = "caddy";
      };
    };
}
