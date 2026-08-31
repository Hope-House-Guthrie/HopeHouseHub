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

  environment.etc = {
    "xdg/kscreenlockerrc".text = ''
      [Daemon]
      Autolock=false
      LockOnResume=false
    '';

    "xdg/powermanagementprofilesrc".text = ''
      [AC][DimDisplay]
      idleTimeoutWhenCharged=0

      [AC][DPMSControl]
      idleTimeoutWhenCharged=0

      [AC][SuspendSession]
      idleTimeoutWhenCharged=0
      suspendThenHibernate=false
      suspendType=1
    '';
  };
}
