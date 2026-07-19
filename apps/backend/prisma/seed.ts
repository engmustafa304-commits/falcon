import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { resolveSuperAdminSeedConfig } from "../src/config/seedConfig.js";

const prisma = new PrismaClient();

async function main() {
  const seedConfig = resolveSuperAdminSeedConfig();
  const passwordHash = await bcrypt.hash(seedConfig.password, 12);
  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email: seedConfig.email
    }
  });
  const existingSuperAdmin = existingUserByEmail ?? await prisma.user.findFirst({
    orderBy: {
      createdAt: "asc"
    },
    where: {
      role: "SUPER_ADMIN",
      tenantId: seedConfig.tenantId
    }
  });

  if (existingSuperAdmin) {
    await prisma.user.update({
      data: {
        email: seedConfig.email,
        isActive: true,
        name: seedConfig.name,
        passwordHash,
        role: "SUPER_ADMIN",
        tenantId: seedConfig.tenantId
      },
      where: {
        id: existingSuperAdmin.id
      }
    });
  } else {
    await prisma.user.create({
      data: {
        email: seedConfig.email,
        isActive: true,
        name: seedConfig.name,
        passwordHash,
        role: "SUPER_ADMIN",
        tenantId: seedConfig.tenantId
      }
    });
  }

  console.log("Seeded SUPER_ADMIN.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
