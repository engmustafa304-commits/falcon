import { env, getRuntimeDatabaseInfo, getRuntimePrismaSchema } from "../config/env.js";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var falconPrisma: PrismaClient | undefined;
}

const databaseInfo = getRuntimeDatabaseInfo();

console.info(JSON.stringify({
  database: {
    host: databaseInfo.host,
    name: databaseInfo.name,
    protocol: databaseInfo.protocol
  },
  event: "prisma_runtime_config",
  nodeEnv: env.NODE_ENV,
  prismaSchema: getRuntimePrismaSchema()
}));

export const prisma = globalThis.falconPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.falconPrisma = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
