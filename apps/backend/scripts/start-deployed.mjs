import { spawn } from "node:child_process";
import {
  applyDeployedRuntimeEnv,
  printDeployedRuntimeDiagnostics
} from "./deployment-runtime.mjs";

try {
  const config = applyDeployedRuntimeEnv(process.env);
  printDeployedRuntimeDiagnostics(config);

  await runCommand("prisma", ["generate", "--schema", config.prismaSchema]);
  await runCommand("prisma", ["migrate", "deploy", "--schema", config.prismaSchema]);
  await runCommand("node", ["dist/index.js"], {
    replaceProcess: true
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : "Failed to start Falcon deployed backend.");
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
