import type { Request, Response } from "express";
import { prisma } from "../database/prismaClient.js";

export function getHealth(_request: Request, response: Response) {
  response.status(200).json({
    data: {
      uptimeSeconds: Math.round(process.uptime()),
      service: "falcon-api",
      status: "ok",
      timestamp: new Date().toISOString()
    }
  });
}

export async function getReadiness(_request: Request, response: Response) {
  await prisma.$queryRaw`SELECT 1`;

  response.status(200).json({
    data: {
      checks: {
        database: "ok"
      },
      service: "falcon-api",
      status: "ready",
      timestamp: new Date().toISOString()
    }
  });
}
