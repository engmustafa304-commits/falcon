import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const envFile = process.env.FALCON_ENV_FILE ?? (process.env.NODE_ENV === "staging" ? ".env.staging" : ".env");
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const envFilePath = path.isAbsolute(envFile) ? envFile : path.resolve(backendRoot, envFile);

dotenv.config({
  override: process.env.NODE_ENV === "staging" || Boolean(process.env.FALCON_ENV_FILE),
  path: envFilePath
});

if (process.env.NODE_ENV === "staging" && process.env.DATABASE_URL_STAGING) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_STAGING;
}

const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("falcon/cars"),
  CORS_ORIGINS: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_STAGING: z.string().optional(),
  FALCON_ENV_FILE: z.string().optional(),
  FALCON_PRISMA_SCHEMA: z.string().optional(),
  API_PUBLIC_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  PUBLIC_UPLOAD_BASE_URL: z.string().url().optional(),
  STORAGE_PROVIDER: z.string().default("local")
});

export const env = envSchema.parse(process.env);

export function getRuntimeDatabaseInfo(databaseUrl = env.DATABASE_URL) {
  if (databaseUrl.startsWith("file:")) {
    return {
      host: "local-sqlite",
      name: databaseUrl.replace(/^file:/, ""),
      protocol: "sqlite"
    };
  }

  try {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      name: decodeURIComponent(url.pathname.replace(/^\//, "")),
      protocol: url.protocol.replace(/:$/, "")
    };
  } catch {
    return {
      host: "unparseable",
      name: "unknown",
      protocol: "unknown"
    };
  }
}

export function getRuntimePrismaSchema() {
  return env.FALCON_PRISMA_SCHEMA
    ?? (env.NODE_ENV === "staging" || env.NODE_ENV === "production"
      ? "prisma/schema.postgresql.prisma"
      : "prisma/schema.prisma");
}
