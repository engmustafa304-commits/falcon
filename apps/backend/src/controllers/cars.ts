import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";
import { storageProvider } from "../services/storage/index.js";

const createCarSchema = z.object({
  brand: z.string().min(1),
  city: z.string().min(1),
  dealerId: z.string().min(1).optional(),
  fuel: z.string().min(1),
  imageUrl: z.string().min(1).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  model: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().int().positive(),
  status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "SOLD"]).optional(),
  tenantId: z.string().min(1).optional(),
  transmission: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(2100)
});

const updateCarSchema = createCarSchema.partial();

const listCarsQuerySchema = z.object({
  brand: z.string().optional(),
  city: z.string().optional(),
  dealerId: z.string().optional(),
  fuel: z.string().optional(),
  mileageMax: z.coerce.number().int().min(0).optional(),
  model: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "mileage_asc", "year_desc"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "SOLD"]).optional(),
  transmission: z.string().optional(),
  yearMax: z.coerce.number().int().min(1900).max(2100).optional(),
  yearMin: z.coerce.number().int().min(1900).max(2100).optional()
});

const createCarImageSchema = z.object({
  alt: z.string().min(1).optional(),
  isMain: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  storagePublicId: z.string().min(1).optional(),
  url: z.string().min(1)
});

const updateCarImageSchema = z.object({
  alt: z.string().min(1).optional(),
  isMain: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  storagePublicId: z.string().min(1).optional()
});

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

const carInclude = {
  dealer: {
    select: {
      city: true,
      id: true,
      isVerified: true,
      name: true,
      phone: true
    }
  },
  images: {
    orderBy: carImageOrderBy
  }
} as const;

export async function listCars(request: Request, response: Response) {
  const query = listCarsQuerySchema.parse(request.query);
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const where = buildCarsWhereInput(query);
  const orderBy = buildCarsOrderBy(query.sort);

  const [total, cars] = await prisma.$transaction([
    prisma.car.count({
      where
    }),
    prisma.car.findMany({
      include: carInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      where
    })
  ]);

  response.status(200).json({ data: cars, page, pageSize, total });
}

export async function listDealerCars(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  if (auth.role !== "DEALER_OWNER" && auth.role !== "DEALER_MANAGER") {
    throw new ApiError(403, "Dealer access is required", undefined, "FORBIDDEN");
  }

  const dealer = await prisma.dealer.findFirst({
    select: {
      id: true
    },
    where: {
      ownerUserId: auth.userId,
      tenantId: auth.tenantId
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer profile not found", undefined, "DEALER_PROFILE_NOT_FOUND");
  }

  const cars = await prisma.car.findMany({
    include: carInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      dealerId: dealer.id
    }
  });

  response.status(200).json({ data: cars });
}

export async function createCar(request: Request, response: Response) {
  const payload = createCarSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const dealer = await resolveDealerForCarWrite(auth, payload.dealerId);

  const car = await prisma.car.create({
    data: {
      ...payload,
      dealerId: dealer.id,
      tenantId: isAdminRole(auth.role) ? payload.tenantId ?? dealer.tenantId : auth.tenantId
    },
    include: carInclude
  });

  response.status(201).json({ data: car });
}

export async function getCarById(request: Request, response: Response) {
  const id = String(request.params.id);
  const car = await prisma.car.findUnique({
    include: carInclude,
    where: {
      id
    }
  });

  if (!car) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }

  response.status(200).json({ data: car });
}

export async function updateCar(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateCarSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const existingCar = await prisma.car.findUnique({
    include: {
      dealer: {
        select: {
          id: true,
          ownerUserId: true,
          tenantId: true
        }
      }
    },
    where: {
      id
    }
  });

  if (!existingCar) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }

  if (!isAdminRole(auth.role)) {
    if (existingCar.dealer.ownerUserId !== auth.userId || existingCar.dealer.tenantId !== auth.tenantId) {
      throw new ApiError(403, "Cannot manage another dealer's cars", undefined, "FORBIDDEN");
    }

    if (payload.dealerId && payload.dealerId !== existingCar.dealerId) {
      throw new ApiError(403, "Cannot move car to another dealer", undefined, "FORBIDDEN");
    }
  } else if (payload.dealerId) {
    await resolveDealerForCarWrite(auth, payload.dealerId);
  }

  const car = await prisma.car.update({
    data: {
      ...payload,
      dealerId: isAdminRole(auth.role) ? payload.dealerId : existingCar.dealerId,
      tenantId: isAdminRole(auth.role) ? payload.tenantId : existingCar.tenantId
    },
    include: carInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: car });
}

export async function deleteCar(request: Request, response: Response) {
  const id = String(request.params.id);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const existingCar = await prisma.car.findUnique({
    include: {
      dealer: {
        select: {
          ownerUserId: true,
          tenantId: true
        }
      }
    },
    where: {
      id
    }
  });

  if (!existingCar) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }

  if (!isAdminRole(auth.role) && (existingCar.dealer.ownerUserId !== auth.userId || existingCar.dealer.tenantId !== auth.tenantId)) {
    throw new ApiError(403, "Cannot manage another dealer's cars", undefined, "FORBIDDEN");
  }

  await prisma.car.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

export async function listCarImages(request: Request, response: Response) {
  const carId = String(request.params.id);
  const carExists = await prisma.car.findUnique({
    select: {
      id: true
    },
    where: {
      id: carId
    }
  });

  if (!carExists) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }

  const images = await prisma.carImage.findMany({
    orderBy: carImageOrderBy,
    where: {
      carId
    }
  });

  response.status(200).json({ data: images });
}

export async function createCarImage(request: Request, response: Response) {
  const carId = String(request.params.id);
  const payload = createCarImageSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageCar(auth, carId);

  const existingImageCount = await prisma.carImage.count({
    where: {
      carId
    }
  });
  const shouldBeMain = payload.isMain ?? existingImageCount === 0;

  const image = await prisma.$transaction(async (tx) => {
    if (shouldBeMain) {
      await tx.carImage.updateMany({
        data: {
          isMain: false
        },
        where: {
          carId
        }
      });
    }

    return tx.carImage.create({
      data: {
        alt: payload.alt,
        carId,
        isMain: shouldBeMain,
        sortOrder: payload.sortOrder ?? existingImageCount,
        storagePublicId: payload.storagePublicId,
        url: payload.url
      }
    });
  });

  response.status(201).json({ data: image });
}

export async function updateCarImage(request: Request, response: Response) {
  const carId = String(request.params.id);
  const imageId = String(request.params.imageId);
  const payload = updateCarImageSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageCar(auth, carId);
  await assertCarImageBelongsToCar(carId, imageId);

  const image = await prisma.$transaction(async (tx) => {
    if (payload.isMain) {
      await tx.carImage.updateMany({
        data: {
          isMain: false
        },
        where: {
          carId
        }
      });
    }

    return tx.carImage.update({
      data: payload,
      where: {
        id: imageId
      }
    });
  });

  response.status(200).json({ data: image });
}

export async function deleteCarImage(request: Request, response: Response) {
  const carId = String(request.params.id);
  const imageId = String(request.params.imageId);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageCar(auth, carId);
  const image = await assertCarImageBelongsToCar(carId, imageId);

  await prisma.carImage.delete({
    where: {
      id: imageId
    }
  });

  await storageProvider.deleteFile?.({
    publicId: image.storagePublicId,
    url: image.url
  });

  if (image.isMain) {
    await promoteFirstImageToMain(carId);
  }

  response.status(204).send();
}

export async function setMainCarImage(request: Request, response: Response) {
  const carId = String(request.params.id);
  const imageId = String(request.params.imageId);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageCar(auth, carId);
  await assertCarImageBelongsToCar(carId, imageId);

  const image = await prisma.$transaction(async (tx) => {
    await tx.carImage.updateMany({
      data: {
        isMain: false
      },
      where: {
        carId
      }
    });

    return tx.carImage.update({
      data: {
        isMain: true
      },
      where: {
        id: imageId
      }
    });
  });

  response.status(200).json({ data: image });
}

function isAdminRole(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

function buildCarsWhereInput(query: z.infer<typeof listCarsQuerySchema>): Prisma.CarWhereInput {
  const and: Prisma.CarWhereInput[] = [
    {
      dealer: {
        is: {
          isVerified: true
        }
      }
    },
    {
      status: "ACTIVE"
    }
  ];
  const q = normalizeQueryText(query.q);
  const brand = normalizeQueryText(query.brand);
  const model = normalizeQueryText(query.model);
  const city = normalizeQueryText(query.city);
  const fuel = normalizeQueryText(query.fuel);
  const transmission = normalizeQueryText(query.transmission);

  if (q) {
    and.push({
      OR: [
        {
          name: {
            contains: q
          }
        },
        {
          brand: {
            contains: q
          }
        },
        {
          model: {
            contains: q
          }
        },
        {
          city: {
            contains: q
          }
        },
        {
          dealer: {
            name: {
              contains: q
            }
          }
        }
      ]
    });
  }

  if (brand) {
    and.push({
      brand: {
        contains: brand
      }
    });
  }

  if (model) {
    and.push({
      model: {
        contains: model
      }
    });
  }

  if (city) {
    and.push({
      city: {
        contains: city
      }
    });
  }

  if (fuel) {
    and.push({
      fuel: {
        contains: fuel
      }
    });
  }

  if (transmission) {
    and.push({
      transmission: {
        contains: transmission
      }
    });
  }

  if (query.dealerId) {
    and.push({
      dealerId: query.dealerId
    });
  }

  if (query.yearMin || query.yearMax) {
    and.push({
      year: {
        gte: query.yearMin,
        lte: query.yearMax
      }
    });
  }

  if (query.priceMin || query.priceMax) {
    and.push({
      price: {
        gte: query.priceMin,
        lte: query.priceMax
      }
    });
  }

  if (query.mileageMax !== undefined) {
    and.push({
      mileage: {
        lte: query.mileageMax
      }
    });
  }

  return {
    AND: and
  };
}

function buildCarsOrderBy(sort: z.infer<typeof listCarsQuerySchema>["sort"]): Prisma.CarOrderByWithRelationInput {
  if (sort === "price_asc") {
    return {
      price: "asc"
    };
  }

  if (sort === "price_desc") {
    return {
      price: "desc"
    };
  }

  if (sort === "mileage_asc") {
    return {
      mileage: "asc"
    };
  }

  if (sort === "year_desc") {
    return {
      year: "desc"
    };
  }

  return {
    createdAt: "desc"
  };
}

function normalizeQueryText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

async function assertCanManageCar(auth: NonNullable<Request["auth"]>, carId: string) {
  const car = await prisma.car.findUnique({
    include: {
      dealer: {
        select: {
          ownerUserId: true,
          tenantId: true
        }
      }
    },
    where: {
      id: carId
    }
  });

  if (!car) {
    throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
  }

  if (!isAdminRole(auth.role) && (car.dealer.ownerUserId !== auth.userId || car.dealer.tenantId !== auth.tenantId)) {
    throw new ApiError(403, "Cannot manage another dealer's cars", undefined, "FORBIDDEN");
  }

  return car;
}

async function assertCarImageBelongsToCar(carId: string, imageId: string) {
  const image = await prisma.carImage.findUnique({
    where: {
      id: imageId
    }
  });

  if (!image || image.carId !== carId) {
    throw new ApiError(404, "Car image not found", undefined, "CAR_IMAGE_NOT_FOUND");
  }

  return image;
}

async function promoteFirstImageToMain(carId: string) {
  const nextImage = await prisma.carImage.findFirst({
    orderBy: [
      {
        sortOrder: "asc"
      },
      {
        createdAt: "asc"
      }
    ],
    where: {
      carId
    }
  });

  if (!nextImage) {
    return;
  }

  await prisma.carImage.update({
    data: {
      isMain: true
    },
    where: {
      id: nextImage.id
    }
  });
}

async function resolveDealerForCarWrite(auth: NonNullable<Request["auth"]>, requestedDealerId?: string) {
  if (isAdminRole(auth.role)) {
    if (!requestedDealerId) {
      throw new ApiError(400, "dealerId is required for admin car creation", undefined, "DEALER_ID_REQUIRED");
    }

    const dealer = await prisma.dealer.findUnique({
      select: {
        id: true,
        tenantId: true
      },
      where: {
        id: requestedDealerId
      }
    });

    if (!dealer) {
      throw new ApiError(404, "Dealer not found", undefined, "DEALER_NOT_FOUND");
    }

    return dealer;
  }

  if (auth.role !== "DEALER_OWNER" && auth.role !== "DEALER_MANAGER") {
    throw new ApiError(403, "Dealer access is required", undefined, "FORBIDDEN");
  }

  const dealer = await prisma.dealer.findFirst({
    select: {
      id: true,
      tenantId: true
    },
    where: {
      ownerUserId: auth.userId,
      tenantId: auth.tenantId
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer profile not found", undefined, "DEALER_PROFILE_NOT_FOUND");
  }

  if (requestedDealerId && requestedDealerId !== dealer.id) {
    throw new ApiError(403, "Cannot create cars for another dealer", undefined, "FORBIDDEN");
  }

  return dealer;
}
