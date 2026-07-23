{ adminPubKeys, serverPubKey }:
let
  publicKeys = adminPubKeys ++ [ serverPubKey ];
in
{
  "secrets/ssh_host_ed25519_key.age" = { inherit publicKeys; };
}
