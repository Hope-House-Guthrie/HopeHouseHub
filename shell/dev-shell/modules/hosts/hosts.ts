import { $ } from "bun";
import { existsSync } from "node:fs";

interface HostConfig {
  ipv4Address?: string;
  privateKey?: string;
  publicKey?: string;
  [key: string]: unknown;
}

type HostsMap = Record<string, HostConfig>;

const hostsJsonRaw = process.env.HOSTS_JSON;
if (!hostsJsonRaw) {
  console.error("Error: HOSTS_JSON environment variable is not set.");
  process.exit(1);
}

const hosts: HostsMap = JSON.parse(hostsJsonRaw);

const [command, hostName, overrideIp] = Bun.argv.slice(2);

if (!command || !hostName) {
  showHelp();
  process.exit(1);
}

const hostConfig = hosts[hostName];

async function buildHost(host: string) {
  console.log(`Building VM for host: ${host}...`);
  await $`nix build .#nixosConfigurations.${host}.config.system.build.vm`;
}

async function runHost(host: string) {
  if (!hostConfig) {
    console.error(`Error: Host '${host}' not found in hosts map.`);
    process.exit(1);
  }

  const { privateKey, publicKey } = hostConfig;

  if (!privateKey) {
    console.error(`Error: Missing 'privateKey' for host '${host}'.`);
    process.exit(1);
  }

  if (!existsSync(privateKey)) {
    console.error(`Error: Private key file '${privateKey}' not found.`);
    process.exit(1);
  }

  const sharedDir = (await $`mktemp -d`.text()).trim();

  try {
    const homedir = Bun.env.HOME || "~";
    const keyPath = `${sharedDir}/ssh_host_ed25519_key`;

    await $`age -d -i ${homedir}/.ssh/id_ed25519 -o ${keyPath} ${privateKey}`;

    if (publicKey) {
      await Bun.write(`${keyPath}.pub`, publicKey);
    }

    await buildHost(host);
    await $`SHARED_DIR=${sharedDir} ./result/bin/run-${host}-vm`;
  } finally {
    if (existsSync(sharedDir)) {
      await $`rm -rf ${sharedDir}`;
    }
  }
}

async function deployHost(host: string, overrideTargetIp?: string) {
  const targetIp = overrideTargetIp || hostConfig?.ipv4Address;

  if (!targetIp) {
    console.error(
      `Error: Could not resolve target IP for host '${host}'. Ensure 'ip' is set in hosts map or provided as an argument.`,
    );
    process.exit(1);
  }

  console.log(`Deploying configuration '.#${host}' to admin@${targetIp}...`);
  await $`nixos-rebuild switch --flake .#${host} --sudo --target-host admin@${targetIp}`;
}

function showHelp() {
  console.log(`
hosts.ts

Usage:
  hosts.ts <command> <host-name> [options]

Commands:
  build-host   Build the NixOS VM package for the specified host
  run-host     Decrypt host SSH key and launch the VM runner
  deploy-host  Deploy configuration to the target host via nixos-rebuild
  help         Show this help message

Options:
  [override-target-ip]  (deploy-host only) Override the IP specified in the hosts map
`);
}

switch (command) {
  case "build-host":
    await buildHost(hostName);
    break;

  case "run-host":
    await runHost(hostName);
    break;

  case "deploy-host":
    await deployHost(hostName, overrideIp);
    break;

  case "help":
  case "-h":
  case "--help":
    showHelp();
    process.exit(0);
  default:
    showHelp();
    process.exit(1);
}
