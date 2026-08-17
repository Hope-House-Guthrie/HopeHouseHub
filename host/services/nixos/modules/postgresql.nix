{
  pkgs,
  lib,
  constants,
  ...
}:
{
  environment.systemPackages = [ pkgs.postgresql ];

  services.postgresql = {
    enable = true;
    authentication = lib.mkForce ''
      # TYPE  DATABASE  USER  ADDRESS  METHOD
      local   all       all            trust
    '';
    ensureUsers = [
      {
        name = constants.postgresql.db_user;
        ensureClauses.createdb = true;
      }
    ];
  };
}
