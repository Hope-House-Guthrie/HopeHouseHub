{ lib, config, ... }:
let
  agenixExists =
    config.system.activationScripts ? agenixInstall
    && (config.system.activationScripts.agenixInstall.text or "") != "";
in
{
  virtualisation.vmVariant = {
    system.activationScripts = {
      install-host-key = {
        text = ''
          SRC="/tmp/shared"
          if [ -f "$SRC/ssh_host_ed25519_key" ]; then
            install -D -m 600 "$SRC/ssh_host_ed25519_key"     /etc/ssh/ssh_host_ed25519_key
            install -D -m 644 "$SRC/ssh_host_ed25519_key.pub" /etc/ssh/ssh_host_ed25519_key.pub
            echo "SSH host keys installed from host."
          else
            echo "ERROR: SSH host keys not found in $SRC" >&2
            exit 1
          fi
        '';
      };
    }
    // lib.optionalAttrs agenixExists {
      agenixInstall.deps = [ "install-host-key" ];
    };
  };
}
