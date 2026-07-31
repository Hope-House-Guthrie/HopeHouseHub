{ adminPubKeys, hosts }:
{
  "host/server/secrets/ssh_host_ed25519_key.age".publicKeys = adminPubKeys ++ [
    hosts.hub-server.publicKey
  ];
}
