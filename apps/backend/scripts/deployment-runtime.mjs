export const POSTGRES_PRISMA_SCHEMA = "prisma/schema.postgresql.prisma";

const REQUIRED_DEPLOYED_ENV = [
  "NODE_ENV",
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CORS_ORIGINS",
  "FRONTEND_URL",
  "API_PUBLIC_URL",
  "STORAGE_PROVIDER"
];

const CLOUDINARY_ENV = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_FOLDER"
];

const PLACEHOLDER_PATTERN = /\b(USER|PASSWORD|HOST|replace-with|example\.com)\b/i;

export function applyDeployedRuntimeEnv(environment = process.env) {
  const config = buildDeployedRuntimeConfig(environment);
  environment.FALCON_PRISMA_SCHEMA = POSTGRES_PRISMA_SCHEMA;
  return config;
}

export function buildDeployedRuntimeConfig(environment = process.env) {
  const missing = REQUIRED_DEPLOYED_ENV.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new Error(`Missing deployed environment variables: ${missing.join(", ")}`);
  }

  if (environment.NODE_ENV !== "staging" && environment.NODE_ENV !== "production") {
    throw new Error("NODE_ENV must be staging or production for deployed runtime.");
  }

  assertSecret("JWT_ACCESS_SECRET", environment.JWT_ACCESS_SECRET);
  assertSecret("JWT_REFRESH_SECRET", environment.JWT_REFRESH_SECRET);

  const database = parseDeployedDatabaseUrl(environment.DATABASE_URL);
  const port = Number.parseInt(environment.PORT ?? "4000", 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  if (environment.NODE_ENV === "staging") {
    const missingSeed = ["STAGING_SUPER_ADMIN_EMAIL", "STAGING_SUPER_ADMIN_PASSWORD"]
      .filter((key) => !environment[key]);

    if (missingSeed.length > 0) {
      throw new Error(`Missing staging seed environment variables: ${missingSeed.join(", ")}`);
    }

    assertSecret("STAGING_SUPER_ADMIN_PASSWORD", environment.STAGING_SUPER_ADMIN_PASSWORD);
  }

  if (environment.STORAGE_PROVIDER === "cloudinary") {
    const missingCloudinary = CLOUDINARY_ENV.filter((key) => !environment[key]);

    if (missingCloudinary.length > 0) {
      throw new Error(`Missing Cloudinary deployed variables: ${missingCloudinary.join(", ")}`);
    }

    for (const key of CLOUDINARY_ENV) {
      assertNoPlaceholder(key, environment[key]);
    }
  } else if (environment.STORAGE_PROVIDER !== "local") {
    throw new Error(`Unsupported deployed storage provider: ${environment.STORAGE_PROVIDER}`);
  }

  assertUrl("FRONTEND_URL", environment.FRONTEND_URL);
  assertUrl("API_PUBLIC_URL", environment.API_PUBLIC_URL);

  return {
    database,
    nodeEnv: environment.NODE_ENV,
    port,
    prismaSchema: POSTGRES_PRISMA_SCHEMA,
    storageProvider: environment.STORAGE_PROVIDER
  };
}

export function parseDeployedDatabaseUrl(value) {
  if (!value) {
    throw new Error("DATABASE_URL is required.");
  }

  assertNoPlaceholder("DATABASE_URL", value);

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection string.");
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must use the postgresql:// protocol in deployed runtime.");
  }

  if (["host", "localhost", "127.0.0.1", "::1"].includes(url.hostname.toLowerCase())) {
    throw new Error("DATABASE_URL must point to managed PostgreSQL, not a placeholder/local host.");
  }

  return {
    databaseName: decodeURIComponent(url.pathname.replace(/^\//, "")),
    host: url.hostname,
    sslMode: url.searchParams.get("sslmode") ?? undefined
  };
}

export function printDeployedRuntimeDiagnostics(config) {
  console.info(JSON.stringify({
    database: {
      host: config.database.host,
      name: config.database.databaseName,
      sslMode: config.database.sslMode ?? null
    },
    event: "falcon_deployed_runtime",
    nodeEnv: config.nodeEnv,
    prismaSchema: config.prismaSchema,
    storageProvider: config.storageProvider
  }));
}

function assertSecret(key, value) {
  if (!value || value.length < 16) {
    throw new Error(`${key} must be at least 16 characters.`);
  }

  assertNoPlaceholder(key, value);
}

function assertUrl(key, value) {
  assertNoPlaceholder(key, value);

  try {
    new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL.`);
  }
}

function assertNoPlaceholder(key, value) {
  if (!value || PLACEHOLDER_PATTERN.test(value)) {
    throw new Error(`${key} contains a placeholder value.`);
  }
}
