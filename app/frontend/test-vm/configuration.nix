{
  i18n.defaultLocale = "en_US.UTF-8";
  networking.hostName = "hub-frontend-test";
  system.stateVersion = "26.05";

  users = {
    mutableUsers = false;
    users.root.password = "root";
  };

  services.h3-frontend.test = {
    enable = true;
    backendOrigin = "https://api.h3.internal";
    frontendAuthority = "h3.internal";
  };
}
