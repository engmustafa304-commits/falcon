import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const prismaBin = path.resolve(process.cwd(), "node_modules/.bin/prisma");

describe("Prisma schemas", () => {
  it("validates the local SQLite schema", async () => {
    await expect(validatePrismaSchema("prisma/schema.prisma")).resolves.toBeUndefined();
  });

  it("validates the dedicated PostgreSQL staging schema", async () => {
    await expect(validatePrismaSchema("prisma/schema.postgresql.prisma", {
      DATABASE_URL: "postgresql://falcon:falcon@localhost:5432/falcon_staging?sslmode=require"
    })).resolves.toBeUndefined();
  });
});

async function validatePrismaSchema(schemaPath: string, env: NodeJS.ProcessEnv = {}) {
  await execFileAsync(prismaBin, ["validate", "--schema", schemaPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...env
    }
  });
}
