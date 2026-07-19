import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

const carImageOrderBy: Prisma.CarImageOrderByWithRelationInput[] = [
  {
    isMain: "desc"
  },
  {
    sortOrder: "asc"
  },
  {
    createdAt: "asc"
  }
];

const savedCarInclude = {
  car: {
    include: {
      dealer: {
        select: {
          city: true,
          id: true,
          isVerified: true,
          name: true
        }
      },
      images: {
        orderBy: carImageOrderBy
      }
    }
  }
} as const;

export async function listFavorites(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const favorites = await prisma.favorite.findMany({
    include: savedCarInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: favorites.map((favorite) => favorite.car) });
}

export async function addFavorite(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const carId = String(request.params.carId);
  await assertCarExists(carId);

  const favorite = await prisma.favorite.upsert({
    create: {
      carId,
      userId: auth.userId
    },
    include: savedCarInclude,
    update: {},
    where: {
      userId_carId: {
        carId,
        userId: auth.userId
      }
    }
  });

  response.status(201).json({ data: favorite.car });
}

export async function removeFavorite(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const carId = String(request.params.carId);

  await prisma.favorite.deleteMany({
    where: {
      carId,
      userId: auth.userId
    }
  });

  response.status(204).send();
}

export async function listCompareItems(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const compareItems = await prisma.compareItem.findMany({
    include: savedCarInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: compareItems.map((item) => item.car) });
}

export async function addCompareItem(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const carId = String(request.params.carId);
  await assertCarExists(carId);

  const compareItem = await prisma.compareItem.upsert({
    create: {
      carId,
      userId: auth.userId
    },
    include: savedCarInclude,
    update: {},
    where: {
      userId_carId: {
        carId,
        userId: auth.userId
      }
    }
  });

  response.status(201).json({ data: compareItem.car });
}

export async function removeCompareItem(request: Request, response: Response) {
  const auth = getSavedCarsAuth(request);
  const carId = String(request.params.carId);

  await prisma.compareItem.deleteMany({
    where: {
      carId,
      userId: auth.userId
    }
  });

  response.status(204).send();
}

function getSavedCarsAuth(request: Request) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  if (!["CUSTOMER", "DEALER_OWNER", "DEALER_MANAGER"].includes(auth.role)) {
    throw new ApiError(403, "Customer access is required", undefined, "FORBIDDEN");
  }

  return auth;
}

async function assertCarExists(carId: string) {
  const car = await prisma.car.findUnique({
    select: {
      id: true
    },
    where: {
      id: carId
    }
  });

  if (!car) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }
}
