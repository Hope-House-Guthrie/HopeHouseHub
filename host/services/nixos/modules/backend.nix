{
  config,
  constants,
  self,
  system,
  ...
}:
{
  age.secrets.jwt_secret = {
    file = ../../secrets/jwt_secret.age;
    mode = "0400";
    owner = "backend";
    group = "backend";
  };

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
        ExecStart = "${backend}/bin/H3.Server";
        WorkingDirectory = "${backend}/bin";
        Restart = "always";
        EnvironmentFile = config.age.secrets.jwt_secret.path;
        Environment = [
          "ASPNETCORE_URLS=http://unix:${constants.backendSocketPath}"
          "PGHOST=/run/postgresql"
          "PGDATABASE=${constants.postgresql.db_name}"
          "PGUSER=${constants.postgresql.db_user}"
          "PGPORT=5432"
          "Jwt__Issuer=https://hub.nhdhopehouseguthrie.org"
          "Jwt__Audience=https://hub.nhdhopehouseguthrie.org"
        ];
        RuntimeDirectory = "backend";
        RuntimeDirectoryMode = "0770";
        UMask = "0007";
        DynamicUser = true;
        Group = "caddy";
      };
    };
}
