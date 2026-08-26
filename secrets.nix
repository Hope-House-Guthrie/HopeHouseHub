let
  adminPublicKeys = [
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGtupohWq9g41NSDY8OncinMjgq2/ZVGXBPaymuiAfIP secrets@hub"
    "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIo0rqolIwrG9+2xM6nQSDmPkEAprLEstESby+KtwoDa super@super-systems"
  ];

  gatewayPublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILanR35vd9pTMH7u6q9dr57p8/Twnh7ny5PEnTQEtqUN root@hub-gateway";
  servicesPublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPr7nWGGoxeSfWa1vNXNt1Hnw5CJnzR3R7GKhcFfginv root@hub-services";
  displayKitchenPublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPfBGfrv3mBm3ySN/HDhJ6thOzh5MSOrsnpuEa6QvDst root@hub-display-kitchen";
  displayCommonPublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE6jODQmWd9IoUvRMtQQMNkuK6JLTByKBtYZ6mWX03bV root@hub-display-common";
in
{
  # note: comment this before running `agenix -r`
  inherit adminPublicKeys;

  "host/lib/secrets/root_passwd.age".publicKeys = adminPublicKeys ++ [
    gatewayPublicKey
    servicesPublicKey
    displayKitchenPublicKey
    displayCommonPublicKey
  ];

  "host/gateway/secrets/wg_key.age".publicKeys = adminPublicKeys ++ [
    gatewayPublicKey
  ];

  "host/services/secrets/wg_key.age".publicKeys = adminPublicKeys ++ [
    servicesPublicKey
  ];

  "host/services/secrets/jwt_secret.age".publicKeys = adminPublicKeys ++ [
    servicesPublicKey
  ];

  "host/display-kitchen/secrets/wg_key.age".publicKeys = adminPublicKeys ++ [
    displayKitchenPublicKey
  ];

  "host/display-common/secrets/wg_key.age".publicKeys = adminPublicKeys ++ [
    displayCommonPublicKey
  ];
}
