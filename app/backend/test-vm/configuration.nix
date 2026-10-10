# todo: this is only a basic smoke test and not everything works at runtime for a true integration test
{ pkgs, ... }:
{
  i18n.defaultLocale = "en_US.UTF-8";
  networking.hostName = "hub-backend-test";
  system.stateVersion = "26.05";

  users = {
    mutableUsers = false;
    users.root.password = "root";
  };

  services.postgresql = {
    enable = true;
    ensureDatabases = [ "hub_test" ];
    ensureUsers = [
      {
        name = "hub_test";
        ensureDBOwnership = true;
      }
    ];
    authentication = pkgs.lib.mkOverride 10 ''
      # type  database        user            address                 auth-method
      local   all             all                                     trust
      host    all             all             127.0.0.1/32            trust
      host    all             all             ::1/128                 trust
    '';
  };

  services.h3-forms.test = {
    enable = true;
  };

  services.h3-server.test = {
    enable = true;
    backendAuthority = "api.h3.internal";
    frontendOrigin = "https://h3.internal";
    jwtSecretFile = builtins.toFile "jwtSecretFile" "4OAvG2qzE+l7xwFydbBbeX9sdHgULBvaw57mM4MaqWA=";
    database = {
      host = "/run/postgresql";
      name = "hub_test";
      user = "hub_test";
      port = 5432;
    };
  };
}
