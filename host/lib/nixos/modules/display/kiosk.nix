{ pkgs, ... }:
{
  users.users.kiosk = {
    isNormalUser = true;
    description = "Kiosk Account";
    extraGroups = [
      "video"
      "audio"
      "networkmanager"
    ];
  };

  services.displayManager = {
    autoLogin = {
      enable = true;
      user = "kiosk";
    };
  };

  systemd.services.NetworkManager-wait-online.enable = true;

  systemd.user.services.kiosk-browser = {
    description = "Start Firefox Kiosk Mode";
    wantedBy = [ "graphical-session.target" ];
    partOf = [ "graphical-session.target" ];

    preStart = ''
      echo "Waiting for NetworkManager to report online..."
      ${pkgs.networkmanager}/bin/nm-online --quiet --timeout=0
    '';

    script = ''
      # Replace with your actual target URL
      ${pkgs.firefox}/bin/firefox --kiosk "https://hub.nhdhopehouseguthrie.org"
    '';

    serviceConfig = {
      Restart = "always";
      RestartSec = "3s";
    };
  };

  programs.firefox = {
    enable = true;
    policies = {
      DisableTelemetry = true;
      DisableFirefoxStudies = true;
      DisableTelemetryUpload = true;

      OverrideFirstRunPage = "";
      OverridePostUpdatePage = "";

      Preferences = {
        "datareporting.healthreport.uploadEnabled" = false;
        "datareporting.policy.dataSubmissionEnabled" = false;
        "browser.aboutwelcome.enabled" = false;
        "messaging-system.rfx.remove.telemetry" = true;
      };
    };
  };
}
