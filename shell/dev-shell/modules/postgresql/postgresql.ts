#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

let projectRoot: string;
try {
  projectRoot = (await $`git rev-parse --show-toplevel`.text()).trim();
} catch {
  projectRoot = process.cwd();
}

const PGDATA = resolve(projectRoot, ".postgresql/data");
const PGHOST = resolve(projectRoot, ".postgresql/sockets");
const PGPORT = "5432";
const PGDATABASE = "hub_db";
const PGUSER = "hub_user";

process.env.PGDATA = PGDATA;
process.env.PGHOST = PGHOST;
process.env.PGPORT = PGPORT;
process.env.PGDATABASE = PGDATABASE;
process.env.PGUSER = PGUSER;

const postgresqlConf = `
listen_addresses = ''
unix_socket_directories = '${PGHOST}'
`;

const pgHbaConf = `
# TYPE  DATABASE  USER  ADDRESS  METHOD
local   all       all            trust
`;

async function syncConfigs() {
  await Bun.write(`${PGDATA}/postgresql.conf`, postgresqlConf);
  await Bun.write(`${PGDATA}/pg_hba.conf`, pgHbaConf);
}

async function isRunning(): Promise<boolean> {
  const status = await $`pg_isready -h ${PGHOST} -q`.nothrow();
  return status.exitCode === 0;
}

async function init() {
  if (existsSync(PGDATA)) {
    console.log(`Database cluster already exists at ${PGDATA}`);
    return;
  }

  mkdirSync(PGHOST, { recursive: true });

  console.log(`Initializing PostgreSQL database directory at ${PGDATA}...`);
  await $`initdb -D ${PGDATA} --no-locale -U ${PGUSER} --auth-local=trust`.quiet();

  await syncConfigs();

  console.log(
    "Starting temporary PostgreSQL instance for database creation...",
  );
  await $`pg_ctl -D ${PGDATA} -l ${PGDATA}/init.log -w start`;

  console.log(`Creating database ${PGDATABASE}...`);
  await $`createdb -h ${PGHOST} -U ${PGUSER} ${PGDATABASE}`;

  console.log("Stopping temporary PostgreSQL instance...");
  await $`pg_ctl -D ${PGDATA} stop`;

  console.log("Database initialized successfully.");
}

async function start() {
  mkdirSync(PGHOST, { recursive: true });

  if (!existsSync(PGDATA)) {
    console.log("Database cluster not found. Running initialization first...");
    await init();
  } else {
    await syncConfigs();
  }

  if (!(await isRunning())) {
    console.log("Starting local PostgreSQL server...");
    await $`pg_ctl -D ${PGDATA} -l ${PGDATA}/postgres.log -w start`;
  }

  console.log("PostgreSQL status:");
  console.log(`  Unix Socket: ${PGHOST}`);
  console.log(`  Database:    ${PGDATABASE}`);
  console.log(`  User:        ${PGUSER}`);
}

async function stop() {
  if (!(await isRunning())) {
    console.log("PostgreSQL is not running.");
    return;
  }

  console.log("Stopping local PostgreSQL server...");
  await $`pg_ctl -D ${PGDATA} stop`;
  console.log("PostgreSQL stopped.");
}

async function reset() {
  console.log("Resetting database environment...");
  if (await isRunning()) {
    await stop();
  }

  const basePgDir = resolve(projectRoot, ".postgresql");
  if (existsSync(basePgDir)) {
    rmSync(basePgDir, { recursive: true, force: true });
    console.log(`Removed ${basePgDir}`);
  }

  await init();
}

function env() {
  console.log(`export PGDATA="${PGDATA}"`);
  console.log(`export PGHOST="${PGHOST}"`);
  console.log(`export PGPORT="${PGPORT}"`);
  console.log(`export PGDATABASE="${PGDATABASE}"`);
  console.log(`export PGUSER="${PGUSER}"`);
}

function showHelp() {
  console.log(`
postgresql.ts

Usage:
  postgresql.ts <command>

Commands:
  init   Initialize the PostgreSQL cluster and create the database
  start  Start the local PostgreSQL server (initializes if missing)
  stop   Stop the local PostgreSQL server
  reset  Stop the server and wipe all data, then re-initialize
  env    Export environment variables for the interactive psql shell
  help   Show this help message
`);
}

const command = process.argv[2];

switch (command) {
  case "init":
    await init();
    break;
  case "start":
    await start();
    break;
  case "stop":
    await stop();
    break;
  case "reset":
    await reset();
    break;
  case "env":
    env();
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
