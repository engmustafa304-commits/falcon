import type { Request, Response } from "express";
import { prisma } from "../database/prismaClient.js";

const sitemapBrands = [
  "toyota",
  "lexus",
  "hyundai",
  "kia",
  "nissan",
  "ford",
  "mercedes",
  "bmw",
  "chevrolet",
  "gmc",
  "jeep",
  "mazda"
] as const;

const sitemapCategories = [
  "sedan",
  "suv",
  "pickup",
  "sports",
  "electric",
  "hybrid",
  "van",
  "trucks"
] as const;

export async function getSitemapData(_request: Request, response: Response) {
  const [cars, dealers] = await Promise.all([
    prisma.car.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        updatedAt: true
      },
      where: {
        dealer: {
          is: {}
        },
        status: "ACTIVE"
      }
    }),
    prisma.dealer.findMany({
      orderBy: {
        updatedAt: "desc"
      },
      select: {
        id: true,
        updatedAt: true
      }
    })
  ]);

  response.status(200).json({
    data: {
      brands: sitemapBrands.map((slug) => ({
        slug,
        updatedAt: null
      })),
      cars,
      categories: sitemapCategories.map((slug) => ({
        slug,
        updatedAt: null
      })),
      dealers,
      staticRoutes: ["/", "/cars", "/dealers", "/brands", "/categories"]
    }
  });
}
