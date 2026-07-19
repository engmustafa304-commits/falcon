import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { promisify } from "node:util";
import dotenv from "dotenv";

const execFileAsync = promisify(execFile);
export const POSTGRES_PRISMA_SCHEMA = "prisma/schema.postgresql.prisma";
const REQUIRED_STAGING_ENV = [
  "NODE_ENV",
  "DATABASE_URL_STAGING",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "STAGING_SUPER_ADMIN_EMAIL",
  "STAGING_SUPER_ADMIN_PASSWORD",
  "CORS_ORIGINS",
  "STORAGE_PROVIDER",
  "API_PUBLIC_URL",
  "FRONTEND_URL"
];
const PLACEHOLDER_PATTERN = /\b(USER|PASSWORD|HOST)\b/i;

export function loadEnvFile(envFilePath, options = {}) {
  const resolvedPath = path.resolve(process.cwd(), envFilePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Environment file not found: ${envFilePath}`);
  }

  const result = dotenv.config({
    override: true,
    path: resolvedPath
  });

  if (result.error) {
    throw new Error(`Failed to load environment file: ${envFilePath}`);
  }

  if (options.staging) {
    process.env.FALCON_ENV_FILE = resolvedPath;
    applyStagingRuntimeEnv(process.env);
  }

  return resolvedPath;
}

export function applyStagingRuntimeEnv(environment) {
  const config = buildStagingRuntimeConfig(environment);

  environment.NODE_ENV = "staging";
  environment.DATABASE_URL = environment.DATABASE_URL_STAGING;
  environment.FALCON_PRISMA_SCHEMA = POSTGRES_PRISMA_SCHEMA;
  return config;
}

export function buildStagingRuntimeConfig(environment = process.env) {
  const missing = REQUIRED_STAGING_ENV.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new Error(`Missing staging environment variables: ${missing.join(", ")}`);
  }

  if (environment.NODE_ENV !== "staging") {
    throw new Error("NODE_ENV must be staging for staging runtime.");
  }

  const database = parseStagingDatabaseUrl(environment.DATABASE_URL_STAGING);
  const port = Number.parseInt(environment.PORT ?? "4000", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  if (environment.STORAGE_PROVIDER === "cloudinary") {
    const missingCloudinary = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
      .filter((key) => !environment[key]);

    if (missingCloudinary.length > 0) {
      throw new Error(`Missing Cloudinary staging variables: ${missingCloudinary.join(", ")}`);
    }
  }

  return {
    database,
    port,
    prismaSchema: POSTGRES_PRISMA_SCHEMA,
    storageProvider: environment.STORAGE_PROVIDER
  };
}

export function parseStagingDatabaseUrl(value) {
  if (!value) {
    throw new Error("DATABASE_URL_STAGING is required.");
  }

  if (PLACEHOLDER_PATTERN.test(value) || value.includes("localhost:5432") || value.includes("127.0.0.1:5432")) {
    throw new Error("DATABASE_URL_STAGING still contains placeholder or local PostgreSQL values.");
  }

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL_STAGING must be a valid PostgreSQL connection string.");
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL_STAGING must use the postgresql:// protocol.");
  }

  if (["host", "localhost", "127.0.0.1", "::1"].includes(url.hostname.toLowerCase())) {
    throw new Error("DATABASE_URL_STAGING must point to the Neon staging host, not a placeholder/local host.");
  }

  return {
    databaseName: decodeURIComponent(url.pathname.replace(/^\//, "")),
    host: url.hostname,
    sslMode: url.searchParams.get("sslmode") ?? undefined
  };
}

export async function getPortStatus(port) {
  const occupied = await isPortOccupied(port);

  if (!occupied) {
    return {
      occupied: false,
      port
    };
  }

  const processInfo = await getPortProcessInfo(port);

  return {
    ...processInfo,
    occupied: true,
    port
  };
}

export function isFalconBackendProcess(command = "") {
  return /(?:tsx|node|ts-node|pnpm|corepack)/.test(command)
    && /(?:src\/index\.ts|dist\/index\.js|apps\/backend|falcon|@falcon\/backend)/i.test(command);
}

async function isPortOccupied(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      resolve(error.code === "EADDRINUSE");
    });

    server.once("listening", () => {
      server.close(() => resolve(false));
    });

    server.listen(port);
  });
}

async function getPortProcessInfo(port) {
  try {
    const { stdout } = await execFileAsync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"]);
    const pid = stdout.match(/^p(\d+)/m)?.[1];

    if (!pid) {
      return {};
    }

    const { command, parentCommand, parentPid } = await getProcessDetails(pid);

    return {
      command,
      isFalconBackend: isFalconBackendProcess(command),
      isFalconBackendParent: isFalconBackendProcess(parentCommand),
      parentCommand,
      parentPid,
      pid
    };
  } catch {
    return {};
  }
}

async function getProcessDetails(pid) {
  try {
    const { stdout } = await execFileAsync("ps", ["-p", String(pid), "-o", "ppid=", "-o", "command="]);
    const trimmed = stdout.trim();
    const match = trimmed.match(/^(\d+)\s+([\s\S]+)$/);
    const parentPid = match?.[1];
    const command = match?.[2]?.trim() ?? "";
    const parentCommand = parentPid ? await getProcessCommand(parentPid) : "";

    return {
      command,
      parentCommand,
      parentPid
    };
  } catch {
    return {
      command: "",
      parentCommand: "",
      parentPid: undefined
    };
  }
}

async function getProcessCommand(pid) {
  try {
    const { stdout } = await execFileAsync("ps", ["-p", String(pid), "-o", "command="]);
    return stdout.trim();
  } catch {
    return "";
  }
}
