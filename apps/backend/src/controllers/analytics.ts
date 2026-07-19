import type { Request, Response } from "express";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

const latestCarSelect = {
  brand: true,
  city: true,
  createdAt: true,
  dealer: {
    select: {
      id: true,
      name: true
    }
  },
  id: true,
  model: true,
  name: true,
  price: true,
  status: true,
  year: true
} as const;

const latestLeadSelect = {
  car: {
    select: {
      id: true,
      name: true
    }
  },
  createdAt: true,
  dealer: {
    select: {
      id: true,
      name: true
    }
  },
  id: true,
  name: true,
  phone: true,
  source: true,
  status: true
} as const;

export async function getDealerAnalytics(request: Request, response: Response) {
  const dealer = await getAuthenticatedDealer(request);
  const dealerCarsWhere = {
    dealerId: dealer.id
  };

  const [
    totalCars,
    activeCars,
    soldCars,
    totalLeads,
    newLeads,
    totalFinanceRequests,
    reviewingFinanceRequests,
    totalFavoritesForDealerCars,
    totalCompareAddsForDealerCars,
    latestCars,
    latestLeads
  ] = await prisma.$transaction([
    prisma.car.count({
      where: dealerCarsWhere
    }),
    prisma.car.count({
      where: {
        ...dealerCarsWhere,
        status: "ACTIVE"
      }
    }),
    prisma.car.count({
      where: {
        ...dealerCarsWhere,
        status: "SOLD"
      }
    }),
    prisma.lead.count({
      where: {
        dealerId: dealer.id
      }
    }),
    prisma.lead.count({
      where: {
        dealerId: dealer.id,
        status: "NEW"
      }
    }),
    prisma.financeRequest.count({
      where: {
        dealerId: dealer.id
      }
    }),
    prisma.financeRequest.count({
      where: {
        dealerId: dealer.id,
        status: "REVIEWING"
      }
    }),
    prisma.favorite.count({
      where: {
        car: dealerCarsWhere
      }
    }),
    prisma.compareItem.count({
      where: {
        car: dealerCarsWhere
      }
    }),
    prisma.car.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: latestCarSelect,
      take: 5,
      where: dealerCarsWhere
    }),
    prisma.lead.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: latestLeadSelect,
      take: 5,
      where: {
        dealerId: dealer.id
      }
    })
  ]);

  response.status(200).json({
    data: {
      activeCars,
      latestCars,
      latestLeads,
      newLeads,
      reviewingFinanceRequests,
      soldCars,
      totalCars,
      totalCompareAddsForDealerCars,
      totalFavoritesForDealerCars,
      totalFinanceRequests,
      totalLeads
    }
  });
}

export async function getAdminAnalytics(_request: Request, response: Response) {
  const [
    totalUsers,
    totalDealers,
    verifiedDealers,
    totalCars,
    activeCars,
    totalLeads,
    totalFinanceRequests,
    totalFavorites,
    totalCompareItems,
    latestUsers,
    latestDealers,
    latestCars,
    latestLeads
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.dealer.count(),
    prisma.dealer.count({
      where: {
        isVerified: true
      }
    }),
    prisma.car.count({
      where: {
        dealer: {
          is: {}
        }
      }
    }),
    prisma.car.count({
      where: {
        dealer: {
          is: {}
        },
        status: "ACTIVE"
      }
    }),
    prisma.lead.count(),
    prisma.financeRequest.count(),
    prisma.favorite.count(),
    prisma.compareItem.count(),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        phone: true,
        role: true
      },
      take: 5
    }),
    prisma.dealer.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: {
        _count: {
          select: {
            cars: true
          }
        },
        city: true,
        createdAt: true,
        id: true,
        isVerified: true,
        name: true
      },
      take: 5
    }),
    prisma.car.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: latestCarSelect,
      take: 5,
      where: {
        dealer: {
          is: {}
        }
      }
    }),
    prisma.lead.findMany({
      orderBy: {
        createdAt: "desc"
      },
      select: latestLeadSelect,
      take: 5
    })
  ]);

  response.status(200).json({
    data: {
      activeCars,
      latestCars,
      latestDealers,
      latestLeads,
      latestUsers,
      totalCars,
      totalCompareItems,
      totalDealers,
      totalFavorites,
      totalFinanceRequests,
      totalLeads,
      totalUsers,
      verifiedDealers
    }
  });
}

async function getAuthenticatedDealer(request: Request) {
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

  return dealer;
}
