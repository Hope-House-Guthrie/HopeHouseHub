{ self, ... }: {
  age.secrets = {
    ssh_host_ed25519_key = {
      file = "${self}/secrets/ssh_host_ed25519_key.age";
      path = "/etc/ssh/ssh_host_ed25519_key";
      mode = "0600";
    };
  };
}
