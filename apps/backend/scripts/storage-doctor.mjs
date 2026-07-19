import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const CLOUDINARY_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_FOLDER"
];

const envFile = getEnvFileArg();
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolvedEnvFile = path.isAbsolute(envFile) ? envFile : path.resolve(backendRoot, envFile);

if (!existsSync(resolvedEnvFile)) {
  console.error(`Storage doctor failed: environment file not found: ${envFile}`);
  process.exit(1);
}

const result = dotenv.config({
  override: true,
  path: resolvedEnvFile
});

if (result.error) {
  console.error(`Storage doctor failed: could not load environment file: ${envFile}`);
  process.exit(1);
}

const storageProvider = process.env.STORAGE_PROVIDER ?? "local";

if (!["local", "cloudinary"].includes(storageProvider)) {
  console.error(`Storage doctor failed: unsupported STORAGE_PROVIDER "${storageProvider}".`);
  process.exit(1);
}

const missingCloudinaryKeys = storageProvider === "cloudinary"
  ? CLOUDINARY_KEYS.filter((key) => !process.env[key])
  : [];

const safeStatus = {
  cloudinary: {
    apiKeyPresent: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretPresent: Boolean(process.env.CLOUDINARY_API_SECRET),
    cloudNamePresent: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    folder: process.env.CLOUDINARY_FOLDER ?? null
  },
  configured: storageProvider === "local" || missingCloudinaryKeys.length === 0,
  envFile: resolvedEnvFile,
  note: "No upload was performed. Secret values were not printed.",
  provider: storageProvider
};

console.info(JSON.stringify(safeStatus, null, 2));

if (missingCloudinaryKeys.length > 0) {
  console.error(`Storage doctor failed: missing Cloudinary variables: ${missingCloudinaryKeys.join(", ")}.`);
  process.exit(1);
}

function getEnvFileArg() {
  const envArg = process.argv.find((arg) => arg.startsWith("--env="));

  if (envArg) {
    return envArg.slice("--env=".length);
  }

  return process.env.FALCON_ENV_FILE ?? ".env";
}
