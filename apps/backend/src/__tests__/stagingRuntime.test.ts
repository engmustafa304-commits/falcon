import { describe, expect, it } from "vitest";

type StagingRuntimeModule = {
  applyStagingRuntimeEnv(environment: NodeJS.ProcessEnv): {
    database: {
      databaseName: string;
      host: string;
      sslMode?: string;
    };
    port: number;
    prismaSchema: string;
    storageProvider: string;
  };
  parseStagingDatabaseUrl(value: string): {
    databaseName: string;
    host: string;
    sslMode?: string;
  };
};

const validNeonUrl = createTestPostgresUrl("ep-falcon-staging.neon.tech");

describe("staging runtime configuration", () => {
  it("rejects placeholder and local PostgreSQL URLs", async () => {
    const runtime = await loadStagingRuntime();

    expect(() => runtime.parseStagingDatabaseUrl("postgresql://USER:PASSWORD@HOST:5432/falcon_staging?sslmode=require")).toThrow(
      "placeholder"
    );
    expect(() => runtime.parseStagingDatabaseUrl("postgresql://falcon:falcon@localhost:5432/falcon_staging")).toThrow(
      "placeholder"
    );
  });

  it("parses safe database host and name without exposing credentials", async () => {
    const runtime = await loadStagingRuntime();
    const parsed = runtime.parseStagingDatabaseUrl(validNeonUrl);

    expect(parsed).toEqual({
      databaseName: "falcon_staging",
      host: "ep-falcon-staging.neon.tech",
      sslMode: "require"
    });
  });

  it("chooses the PostgreSQL schema and maps runtime DATABASE_URL safely", async () => {
    const runtime = await loadStagingRuntime();
    const environment: NodeJS.ProcessEnv = {
      API_PUBLIC_URL: "https://staging-api.falcon.example.com",
      CLOUDINARY_API_KEY: "cloudinary-key",
      CLOUDINARY_API_SECRET: "cloudinary-secret",
      CLOUDINARY_CLOUD_NAME: "falcon",
      CORS_ORIGINS: "https://staging.falcon.example.com",
      DATABASE_URL: "file:./dev.db",
      DATABASE_URL_STAGING: validNeonUrl,
      FRONTEND_URL: "https://staging.falcon.example.com",
      JWT_ACCESS_SECRET: "staging-access-secret-that-is-long",
      JWT_REFRESH_SECRET: "staging-refresh-secret-that-is-long",
      NODE_ENV: "staging",
      PORT: "4000",
      STAGING_SUPER_ADMIN_EMAIL: "owner@falcon.test",
      STAGING_SUPER_ADMIN_PASSWORD: "StrongPassword123!",
      STORAGE_PROVIDER: "cloudinary"
    };

    const config = runtime.applyStagingRuntimeEnv(environment);

    expect(environment.DATABASE_URL).toBe(validNeonUrl);
    expect(environment.FALCON_PRISMA_SCHEMA).toBe("prisma/schema.postgresql.prisma");
    expect(config.prismaSchema).toBe("prisma/schema.postgresql.prisma");
    expect(config.database.host).toBe("ep-falcon-staging.neon.tech");
  });
});

async function loadStagingRuntime() {
  const runtimeModulePath = new URL("../../scripts/staging-runtime.mjs", import.meta.url).href;
  return await import(runtimeModulePath) as StagingRuntimeModule;
}

function createTestPostgresUrl(host: string) {
  const url = new URL(["postgresql:", "", host].join("/") + "/falcon_staging?sslmode=require");
  url.username = "falcon_owner";
  url.password = "test-pass";
  return url.toString();
}
