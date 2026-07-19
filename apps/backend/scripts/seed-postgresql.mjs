import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import dotenv from "dotenv";
import {
  POSTGRES_PRISMA_SCHEMA,
  parseDeployedDatabaseUrl
} from "./deployment-runtime.mjs";

if (!process.env.DATABASE_URL && existsSync(".env.staging")) {
  dotenv.config({
    override: true,
    path: ".env.staging"
  });

  if (process.env.DATABASE_URL_STAGING) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_STAGING;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for PostgreSQL seed.");
  process.exit(1);
}

try {
  parseDeployedDatabaseUrl(process.env.DATABASE_URL);
  process.env.NODE_ENV = process.env.NODE_ENV === "production" ? "production" : "staging";
  process.env.FALCON_PRISMA_SCHEMA = POSTGRES_PRISMA_SCHEMA;

  await runCommand("prisma", ["generate", "--schema", POSTGRES_PRISMA_SCHEMA]);
  await runCommand("tsx", ["prisma/seed.ts"]);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Failed to seed PostgreSQL database.");
  process.exit(1);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: process.platform === "win32",
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });
  });
}
