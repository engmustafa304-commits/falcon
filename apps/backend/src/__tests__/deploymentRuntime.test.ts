import { describe, expect, it } from "vitest";

type DeploymentRuntimeModule = {
  applyDeployedRuntimeEnv(environment: NodeJS.ProcessEnv): {
    database: {
      databaseName: string;
      host: string;
      sslMode?: string;
    };
    nodeEnv: string;
    port: number;
    prismaSchema: string;
    storageProvider: string;
  };
  parseDeployedDatabaseUrl(value: string): {
    databaseName: string;
    host: string;
    sslMode?: string;
  };
};

const validNeonUrl = createTestPostgresUrl("ep-falcon-railway.neon.tech");

describe("deployed runtime configuration", () => {
  it("rejects placeholder production database URLs", async () => {
    const runtime = await loadDeploymentRuntime();

    expect(() => runtime.parseDeployedDatabaseUrl("postgresql://USER:PASSWORD@HOST:5432/falcon_staging?sslmode=require")).toThrow(
      "placeholder"
    );
  });

  it("uses DATABASE_URL and PostgreSQL schema for Railway staging", async () => {
    const runtime = await loadDeploymentRuntime();
    const environment: NodeJS.ProcessEnv = {
      API_PUBLIC_URL: "https://falcon-api-staging.up.railway.app",
      CLOUDINARY_API_KEY: "cloudinary-key",
      CLOUDINARY_API_SECRET: "cloudinary-secret",
      CLOUDINARY_CLOUD_NAME: "falcon",
      CLOUDINARY_FOLDER: "falcon/staging/cars",
      CORS_ORIGINS: "https://falcon-staging.vercel.app",
      DATABASE_URL: validNeonUrl,
      FRONTEND_URL: "https://falcon-staging.vercel.app",
      JWT_ACCESS_SECRET: "staging-access-secret-that-is-long",
      JWT_REFRESH_SECRET: "staging-refresh-secret-that-is-long",
      NODE_ENV: "staging",
      PORT: "8080",
      STAGING_SUPER_ADMIN_EMAIL: "owner@falcon.test",
      STAGING_SUPER_ADMIN_PASSWORD: "StrongPassword123!",
      STORAGE_PROVIDER: "cloudinary"
    };

    const config = runtime.applyDeployedRuntimeEnv(environment);

    expect(environment.FALCON_PRISMA_SCHEMA).toBe("prisma/schema.postgresql.prisma");
    expect(config.database.host).toBe("ep-falcon-railway.neon.tech");
    expect(config.database.databaseName).toBe("falcon_staging");
    expect(config.port).toBe(8080);
    expect(config.storageProvider).toBe("cloudinary");
  });
});

async function loadDeploymentRuntime() {
  const runtimeModulePath = new URL("../../scripts/deployment-runtime.mjs", import.meta.url).href;
  return await import(runtimeModulePath) as DeploymentRuntimeModule;
}

function createTestPostgresUrl(host: string) {
  const url = new URL(["postgresql:", "", host].join("/") + "/falcon_staging?sslmode=require");
  url.username = "falcon_owner";
  url.password = "test-pass";
  return url.toString();
}
