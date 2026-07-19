import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const prismaDir = path.resolve(process.cwd(), "prisma");
const testDatabasePath = path.join(prismaDir, "test.db");
const localDatabasePath = path.join(prismaDir, "dev.db");

for (const filename of ["test.db", "test.db-journal", "test.db-shm", "test.db-wal"]) {
  rmSync(path.join(prismaDir, filename), {
    force: true
  });
}

if (existsSync(localDatabasePath)) {
  copyFileSync(localDatabasePath, testDatabasePath);
}

try {
  execFileSync(
    "corepack",
    ["pnpm", "prisma", "db", "push", "--schema=prisma/schema.prisma", "--skip-generate"],
    {
      env: getTestEnv(),
      stdio: "inherit"
    }
  );
} catch (error) {
  if (!existsSync(localDatabasePath)) {
    throw error;
  }

  copyFileSync(localDatabasePath, testDatabasePath);
  console.info("Copied local SQLite schema database to prisma/test.db for isolated test execution.");
}

execFileSync(
  "corepack",
  ["pnpm", "prisma", "generate", "--schema=prisma/schema.prisma"],
  {
    env: getTestEnv(),
    stdio: "inherit"
  }
);

function getTestEnv() {
  return {
    ...process.env,
    DATABASE_URL: "file:./test.db",
    JWT_ACCESS_SECRET: "test-access-secret-that-is-long-enough",
    JWT_REFRESH_SECRET: "test-refresh-secret-that-is-long-enough",
    NODE_ENV: "test",
    PORT: "4000",
    PUBLIC_UPLOAD_BASE_URL: "http://localhost:4000/uploads",
    STORAGE_PROVIDER: "local"
  };
}
