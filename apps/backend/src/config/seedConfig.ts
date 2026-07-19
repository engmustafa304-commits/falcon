type SeedEnvironment = "development" | "test" | "staging" | "production";

export type SuperAdminSeedConfig = {
  email: string;
  name: string;
  password: string;
  tenantId: string;
};

export function resolveSuperAdminSeedConfig(environment: NodeJS.ProcessEnv = process.env): SuperAdminSeedConfig {
  const nodeEnv = getSeedEnvironment(environment.NODE_ENV);

  if (nodeEnv === "development" || nodeEnv === "test") {
    return {
      email: getSeedValue(environment, "EMAIL") ?? "engmustafa304@gmail.com",
      name: getSeedValue(environment, "NAME") ?? "Falcon Owner",
      password: getSeedValue(environment, "PASSWORD") ?? "Admin12345!",
      tenantId: getSeedValue(environment, "TENANT_ID") ?? "platform"
    };
  }

  const email = getSeedValue(environment, "EMAIL");
  const password = getSeedValue(environment, "PASSWORD");
  const name = getSeedValue(environment, "NAME") ?? "Falcon Owner";
  const tenantId = getSeedValue(environment, "TENANT_ID") ?? "platform";

  if (!email || !password) {
    throw new Error("STAGING_SUPER_ADMIN_EMAIL and STAGING_SUPER_ADMIN_PASSWORD are required for staging seed.");
  }

  if (password.length < 12) {
    throw new Error("STAGING_SUPER_ADMIN_PASSWORD must be at least 12 characters for staging seed.");
  }

  return {
    email,
    name,
    password,
    tenantId
  };
}

function getSeedValue(environment: NodeJS.ProcessEnv, key: "EMAIL" | "NAME" | "PASSWORD" | "TENANT_ID") {
  return environment[`STAGING_SUPER_ADMIN_${key}`] ?? environment[`SEED_SUPER_ADMIN_${key}`];
}

function getSeedEnvironment(value: string | undefined): SeedEnvironment {
  if (value === "production" || value === "staging" || value === "test") {
    return value;
  }

  return "development";
}
