{ pkgs, ... }:
{
  hardware.graphics = {
    enable = true;

    extraPackages = with pkgs; [
      intel-media-driver
      # intel-vaapi-driver # For Older CPUs (G45 / HD Graphics pre-2015)
      vulkan-validation-layers
      libvdpau-va-gl
    ];

    extraPackages32 = with pkgs; [
      pkgsi686Linux.intel-media-driver
    ];
  };

  boot.initrd.kernelModules = [ "i915" ];

  environment.sessionVariables = {
    LIBVA_DRIVER_NAME = "iHD";
  };
}
