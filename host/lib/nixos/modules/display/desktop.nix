{
  services.xserver = {
    enable = true;
    serverFlagsSection = ''
      Option "BlankTime" "0"
      Option "StandbyTime" "0"
      Option "SuspendTime" "0"
      Option "OffTime" "0"
    '';
  };

  services.displayManager.sddm.enable = true;
  services.desktopManager.plasma6.enable = true;

  systemd.targets.sleep.enable = false;
  systemd.targets.suspend.enable = false;
  systemd.targets.hibernate.enable = false;
  systemd.targets.hybrid-sleep.enable = false;

  # System-wide KDE PowerDevil configuration override
  environment.etc."xdg/powermanagementprofilesrc".text = ''
    [AC][DPMSControl]
    idleTime=0
    lockBeforeTurnOff=0

    [AC][DimDisplay]
    idleTime=0

    [AC][HandleButtonEvents]
    lidAction=0
    powerButtonAction=0

    [AC][SuspendSession]
    idleTime=0
    suspendType=0
  '';

  # Disable screen locking in KDE
  environment.etc."xdg/kscreenlockerrc".text = ''
    [Daemon]
    Autolock=false
    Timeout=0
  '';
}
