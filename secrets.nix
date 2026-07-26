{ adminPubKeys, serverHost }:
{
  "host/server/secrets/ssh_host_ed25519_key.age".publicKeys = adminPubKeys ++ [
    serverHost.publicKey
  ];
}
