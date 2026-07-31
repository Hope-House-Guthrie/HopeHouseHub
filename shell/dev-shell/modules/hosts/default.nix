{
  pkgs,
  hosts,
  ...
}:
let
  hostsData = builtins.mapAttrs (_name: host: removeAttrs host [ "nixosConfiguration" ]) hosts;

  hosts-ts = pkgs.writeShellApplication {
    name = "hosts-ts";
    runtimeInputs = [
      pkgs.bun
      pkgs.nix
      pkgs.age
      pkgs.coreutils
      pkgs.nixos-rebuild
      pkgs.openssh
    ];
    text = ''
      export HOSTS_JSON='${builtins.toJSON hostsData}'
      exec bun ${./hosts.ts} "$@"
    '';
  };

  build-host = pkgs.writeShellScriptBin "build-host" ''
    exec ${hosts-ts}/bin/hosts-ts build-host "$@"
  '';

  run-host = pkgs.writeShellScriptBin "run-host" ''
    exec ${hosts-ts}/bin/hosts-ts run-host "$@"
  '';

  deploy-host = pkgs.writeShellScriptBin "deploy-host" ''
    exec ${hosts-ts}/bin/hosts-ts deploy-host "$@"
  '';
in
{
  buildInputs = [
    build-host
    run-host
    deploy-host
  ];

  shellHook = ''
    echo "Host commands:"
    echo "  - build-host"
    echo "  - run-host"
    echo "  - deploy-host"
    echo
  '';
}
