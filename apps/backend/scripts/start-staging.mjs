import { spawn } from "node:child_process";
import {
  applyStagingRuntimeEnv,
  getPortStatus,
  loadEnvFile
} from "./staging-runtime.mjs";

const mode = parseMode(process.argv.slice(2));

try {
  const envFilePath = loadEnvFile(".env.staging", {
    staging: true
  });
  const config = applyStagingRuntimeEnv(process.env);
  const portStatus = await getPortStatus(config.port);

  if (mode === "doctor") {
    printDoctor({
      config,
      envFilePath,
      portStatus
    });
    process.exit(0);
  }

  if (portStatus.occupied && portStatus.isFalconBackend) {
    await stopExistingFalconBackend(portStatus);
  } else if (portStatus.occupied) {
    printPortConflict(portStatus);
    process.exit(1);
  }

  const startPortStatus = await getPortStatus(config.port);

  if (startPortStatus.occupied) {
    printPortConflict(startPortStatus);
    process.exit(1);
  }

  await runCommand("prisma", ["generate", "--schema", config.prismaSchema]);

  const postGeneratePortStatus = await getPortStatus(config.port);

  if (postGeneratePortStatus.occupied) {
    printPortConflict(postGeneratePortStatus);
    process.exit(1);
  }

  if (mode === "compiled") {
    await runCommand("node", ["dist/index.js"], {
      replaceProcess: true
    });
    process.exit(0);
  }

  await runCommand("tsx", ["watch", "src/index.ts"], {
    replaceProcess: true
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : "Failed to start staging backend.");
  process.exit(1);
}

function parseMode(args) {
  if (args.includes("--doctor")) {
    return "doctor";
  }

  if (args.includes("--compiled")) {
    return "compiled";
  }

  return "watch";
}

function printDoctor({ config, envFilePath, portStatus }) {
  console.log(JSON.stringify({
    database: {
      host: config.database.host,
      name: config.database.databaseName,
      sslMode: config.database.sslMode ?? null
    },
    envFileLoaded: envFilePath.endsWith(".env.staging"),
    port: {
      command: portStatus.command ? redactCommand(portStatus.command) : null,
      isFalconBackend: portStatus.isFalconBackend ?? false,
      occupied: portStatus.occupied,
      parentCommand: portStatus.parentCommand ? redactCommand(portStatus.parentCommand) : null,
      parentPid: portStatus.parentPid ?? null,
      pid: portStatus.pid ?? null,
      value: config.port
    },
    prismaSchema: config.prismaSchema,
    storageProvider: config.storageProvider
  }, null, 2));
}

function printPortConflict(portStatus) {
  const pidMessage = portStatus.pid ? ` PID ${portStatus.pid}` : "";
  const parentMessage = portStatus.parentPid ? ` parent PID ${portStatus.parentPid}` : "";
  const commandMessage = portStatus.command ? ` (${redactCommand(portStatus.command)})` : "";
  const ownershipMessage = portStatus.isFalconBackend
    ? "It appears to be another Falcon backend process. Stop the listed PID or parent PID and rerun `corepack pnpm --filter @falcon/backend dev:staging`."
    : "It does not look safe to stop automatically. Free the port or set a different PORT in apps/backend/.env.staging.";

  console.error(`Port ${portStatus.port} is already in use.${pidMessage}${parentMessage}${commandMessage}. ${ownershipMessage}`);
}

async function stopExistingFalconBackend(portStatus) {
  const candidates = [
    portStatus.isFalconBackendParent ? portStatus.parentPid : undefined,
    portStatus.pid
  ].filter(Boolean);
  const uniqueCandidates = [...new Set(candidates)]
    .filter((pid) => String(pid) !== String(process.pid));

  for (const pid of uniqueCandidates) {
    try {
      process.kill(Number(pid), "SIGTERM");
      console.info(`Stopped existing Falcon backend process on port ${portStatus.port}: PID ${pid}`);
    } catch {
      // The process may have already exited between detection and termination.
    }
  }

  const deadline = Date.now() + 5000;

  while (Date.now() < deadline) {
    const latestStatus = await getPortStatus(portStatus.port);

    if (!latestStatus.occupied) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const latestStatus = await getPortStatus(portStatus.port);
  printPortConflict(latestStatus);
  process.exit(1);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });

    if (options.replaceProcess) {
      child.on("exit", (code) => {
        process.exit(code ?? 0);
      });
    }
  });
}

function redactCommand(command) {
  return command.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-database-url]");
}
