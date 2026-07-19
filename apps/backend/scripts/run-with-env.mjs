import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { applyStagingRuntimeEnv } from "./staging-runtime.mjs";

const [, , envFileArg, separator, command, ...args] = process.argv;

if (!envFileArg || separator !== "--" || !command) {
  console.error("Usage: node scripts/run-with-env.mjs <env-file> -- <command> [...args]");
  process.exit(1);
}

const envFilePath = path.resolve(process.cwd(), envFileArg);

if (!existsSync(envFilePath)) {
  console.error(`Environment file not found: ${envFileArg}`);
  process.exit(1);
}

const result = dotenv.config({
  override: true,
  path: envFilePath
});

if (result.error) {
  console.error(`Failed to load environment file: ${envFileArg}`);
  process.exit(1);
}

if (path.basename(envFileArg) === ".env.staging") {
  try {
    applyStagingRuntimeEnv(process.env);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Invalid staging environment.");
    process.exit(1);
  }
}

const child = spawn(command, args, {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
