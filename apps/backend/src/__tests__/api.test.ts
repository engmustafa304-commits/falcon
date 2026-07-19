import { rmSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { app as appType } from "../app.js";
import { resolveSuperAdminSeedConfig } from "../config/seedConfig.js";
import type { disconnectPrisma as disconnectPrismaType, prisma as prismaType } from "../database/prismaClient.js";

type AuthSession = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

let api: ReturnType<typeof request>;
let disconnectPrisma: typeof disconnectPrismaType;
let prisma: typeof prismaType;

let dealerSession: AuthSession;
let secondDealerSession: AuthSession;
let customerSession: AuthSession;
let adminSession: AuthSession;
let dealerId: string;
let secondDealerId: string;
let carId: string;
let secondDealerCarId: string;

describe.sequential("Falcon backend critical flows", () => {
  beforeAll(async () => {
    const appModule = await import("../app.js");
    const prismaModule = await import("../database/prismaClient.js");

    api = request(appModule.app as typeof appType);
    disconnectPrisma = prismaModule.disconnectPrisma;
    prisma = prismaModule.prisma;

    await cleanDatabase();

    adminSession = await createSuperAdminSession();
    dealerSession = await registerUser("dealer-owner", "DEALER_OWNER");
    secondDealerSession = await registerUser("second-dealer-owner", "DEALER_OWNER");
    customerSession = await registerUser("customer", "CUSTOMER");

    const dealerResponse = await api
      .get("/api/v1/dealers/me")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    dealerId = dealerResponse.body.data.id;

    const secondDealerResponse = await api
      .get("/api/v1/dealers/me")
      .set("Authorization", `Bearer ${secondDealerSession.token}`)
      .expect(200);

    secondDealerId = secondDealerResponse.body.data.id;

    await prisma.dealer.updateMany({
      data: {
        isVerified: true
      },
      where: {
        id: {
          in: [dealerId, secondDealerId]
        }
      }
    });

    const carResponse = await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send({
        brand: "Mercedes",
        city: "الرياض",
        fuel: "بنزين",
        mileage: 12000,
        model: "E300 AMG",
        name: "Mercedes E300 AMG",
        price: 375000,
        status: "ACTIVE",
        transmission: "أوتوماتيك",
        year: 2025
      })
      .expect(201);

    carId = carResponse.body.data.id;

    const secondCarResponse = await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${secondDealerSession.token}`)
      .send({
        brand: "Toyota",
        city: "جدة",
        fuel: "هجين",
        mileage: 8000,
        model: "Camry",
        name: "Toyota Camry Hybrid",
        price: 145000,
        status: "ACTIVE",
        transmission: "أوتوماتيك",
        year: 2024
      })
      .expect(201);

    secondDealerCarId = secondCarResponse.body.data.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectPrisma();

    const prismaDir = path.resolve(process.cwd(), "prisma");
    for (const filename of ["test.db", "test.db-journal", "test.db-shm", "test.db-wal"]) {
      rmSync(path.join(prismaDir, filename), { force: true });
    }
  });

  async function cleanDatabase() {
    await prisma.notification.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.compareItem.deleteMany();
    await prisma.financeRequest.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.carImage.deleteMany();
    await prisma.car.deleteMany();
    await prisma.dealer.deleteMany();
    await prisma.user.deleteMany();
  }

  it("returns health status", async () => {
    const response = await api.get("/api/v1/health").expect(200);

    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.service).toBe("falcon-api");
  });

  it("returns root health and readiness status", async () => {
    const healthResponse = await api.get("/health").expect(200);
    const readyResponse = await api.get("/ready").expect(200);

    expect(healthResponse.body.data.status).toBe("ok");
    expect(readyResponse.body.data.status).toBe("ready");
    expect(readyResponse.body.data.checks.database).toBe("ok");
  });

  it("requires explicit super admin seed credentials in staging", () => {
    expect(() => resolveSuperAdminSeedConfig({ NODE_ENV: "staging" })).toThrow(
      "STAGING_SUPER_ADMIN_EMAIL and STAGING_SUPER_ADMIN_PASSWORD are required"
    );

    const config = resolveSuperAdminSeedConfig({
      NODE_ENV: "staging",
      STAGING_SUPER_ADMIN_EMAIL: "owner@falcon.test",
      STAGING_SUPER_ADMIN_PASSWORD: "StrongPassword123!",
      STAGING_SUPER_ADMIN_TENANT_ID: "platform"
    });

    expect(config.email).toBe("owner@falcon.test");
    expect(config.tenantId).toBe("platform");
  });

  it("registers, logs in, and returns the current user", async () => {
    const email = uniqueEmail("auth");
    const password = "Test12345!";

    const registerResponse = await api
      .post("/api/v1/auth/register")
      .send({
        email,
        name: "Auth Test User",
        password,
        role: "CUSTOMER"
      })
      .expect(201);

    expect(registerResponse.body.data.token).toEqual(expect.any(String));
    expect(registerResponse.body.data.user.email).toBe(email);

    const loginResponse = await api
      .post("/api/v1/auth/login")
      .send({
        email,
        password
      })
      .expect(200);

    const meResponse = await api
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.data.token}`)
      .expect(200);

    expect(meResponse.body.data.email).toBe(email);
  });

  it("protects role-scoped car writes", async () => {
    await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${customerSession.token}`)
      .send({
        brand: "Toyota",
        city: "جدة",
        fuel: "بنزين",
        mileage: 5000,
        model: "Camry",
        name: "Toyota Camry",
        price: 130000,
        transmission: "أوتوماتيك",
        year: 2024
      })
      .expect(403);
  });

  it("returns safe storage diagnostics only to super admins", async () => {
    await api
      .get("/api/v1/admin/storage/status")
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(403);

    const response = await api
      .get("/api/v1/admin/storage/status")
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      configured: true,
      provider: "local"
    });
    expect(JSON.stringify(response.body.data)).not.toContain("API_SECRET");
    expect(JSON.stringify(response.body.data)).not.toContain("cloudinary-secret");
    expect(JSON.stringify(response.body.data)).not.toContain("CLOUDINARY_API_SECRET");
  });

  it("auto-creates a dealer profile for dealer owners", async () => {
    const response = await api
      .get("/api/v1/dealers/me")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    expect(response.body.data.ownerUserId).toBe(dealerSession.user.id);
    expect(response.body.data.city).toBe("الرياض");
  });

  it("creates cars as a dealer owner", async () => {
    const response = await api
      .get(`/api/v1/cars/${carId}`)
      .expect(200);

    expect(response.body.data.id).toBe(carId);
    expect(response.body.data.dealerId).toBe(dealerId);
    expect(response.body.data.price).toBe(375000);
  });

  it("uploads a car image locally", async () => {
    const response = await api
      .post("/api/v1/uploads/car-images")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .attach("image", Buffer.from("fake-webp-content"), {
        contentType: "image/webp",
        filename: "test-car.webp"
      })
      .expect(201);

    expect(response.body.url).toMatch(/^http:\/\/localhost:4000\/uploads\/cars\/car-/);
  });

  it("submits a public lead", async () => {
    const response = await api
      .post("/api/v1/leads")
      .send({
        carId,
        email: "lead@example.com",
        message: "Interested in this vehicle.",
        name: "Lead Customer",
        phone: "966500000000",
        source: "CAR_DETAIL"
      })
      .expect(201);

    expect(response.body.data.carId).toBe(carId);
    expect(response.body.data.dealerId).toBe(dealerId);
  });

  it("submits a public finance request", async () => {
    const response = await api
      .post("/api/v1/finance-requests")
      .send({
        carId,
        customerName: "Finance Customer",
        downPayment: 50000,
        email: "finance@example.com",
        financingPeriod: 60,
        monthlyIncome: 25000,
        phone: "966511111111"
      })
      .expect(201);

    expect(response.body.data.carId).toBe(carId);
    expect(response.body.data.dealerId).toBe(dealerId);
  });

  it("adds and removes favorites", async () => {
    await api
      .post(`/api/v1/favorites/${carId}`)
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(201);

    const listResponse = await api
      .get("/api/v1/favorites")
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(200);

    expect(listResponse.body.data.map((car: { id: string }) => car.id)).toContain(carId);

    await api
      .delete(`/api/v1/favorites/${carId}`)
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(204);
  });

  it("adds and removes compare items", async () => {
    await api
      .post(`/api/v1/compare/${carId}`)
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(201);

    const listResponse = await api
      .get("/api/v1/compare")
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(200);

    expect(listResponse.body.data.map((car: { id: string }) => car.id)).toContain(carId);

    await api
      .delete(`/api/v1/compare/${carId}`)
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(204);
  });

  it("allows super admins to manage users", async () => {
    const disposable = await registerUser("admin-user-target", "CUSTOMER");

    const listResponse = await api
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(200);

    expect(listResponse.body.data.map((user: { id: string }) => user.id)).toContain(disposable.user.id);

    const roleResponse = await api
      .patch(`/api/v1/admin/users/${disposable.user.id}/role`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ role: "DEALER_MANAGER" })
      .expect(200);

    expect(roleResponse.body.data.role).toBe("DEALER_MANAGER");

    const inactiveResponse = await api
      .patch(`/api/v1/admin/users/${disposable.user.id}/status`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ isActive: false })
      .expect(200);

    expect(inactiveResponse.body.data.isActive).toBe(false);

    const activeResponse = await api
      .patch(`/api/v1/admin/users/${disposable.user.id}/status`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ isActive: true })
      .expect(200);

    expect(activeResponse.body.data.isActive).toBe(true);

    await api
      .delete(`/api/v1/admin/users/${disposable.user.id}`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(204);
  });

  it("allows super admins to manage dealers", async () => {
    const disposableOwner = await registerUser("admin-dealer-target", "DEALER_OWNER");
    const dealerResponse = await api
      .get("/api/v1/dealers/me")
      .set("Authorization", `Bearer ${disposableOwner.token}`)
      .expect(200);
    const disposableDealerId = dealerResponse.body.data.id;

    const listResponse = await api
      .get("/api/v1/admin/dealers")
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(200);

    expect(listResponse.body.data.map((dealer: { id: string }) => dealer.id)).toContain(disposableDealerId);

    const verifiedResponse = await api
      .patch(`/api/v1/admin/dealers/${disposableDealerId}/verify`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ isVerified: true })
      .expect(200);

    expect(verifiedResponse.body.data.isVerified).toBe(true);

    const unverifiedResponse = await api
      .patch(`/api/v1/admin/dealers/${disposableDealerId}/verify`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ isVerified: false })
      .expect(200);

    expect(unverifiedResponse.body.data.isVerified).toBe(false);

    const editedResponse = await api
      .patch(`/api/v1/admin/dealers/${disposableDealerId}`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ city: "الدمام", phone: "966522222222" })
      .expect(200);

    expect(editedResponse.body.data.city).toBe("الدمام");

    await api
      .delete(`/api/v1/admin/dealers/${disposableDealerId}`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(204);
  });

  it("allows super admins to manage cars", async () => {
    const disposableCarResponse = await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send(buildCarPayload({ brand: "BMW", model: "X5", name: "BMW X5", price: 315000 }))
      .expect(201);
    const disposableCarId = disposableCarResponse.body.data.id;

    const listResponse = await api
      .get("/api/v1/admin/cars")
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(200);

    expect(listResponse.body.data.map((car: { id: string }) => car.id)).toContain(disposableCarId);

    const editedResponse = await api
      .patch(`/api/v1/admin/cars/${disposableCarId}`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ city: "الخبر", price: 299000 })
      .expect(200);

    expect(editedResponse.body.data.city).toBe("الخبر");
    expect(editedResponse.body.data.price).toBe(299000);

    const statusResponse = await api
      .patch(`/api/v1/admin/cars/${disposableCarId}/status`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .send({ status: "SUSPENDED" })
      .expect(200);

    expect(statusResponse.body.data.status).toBe("SUSPENDED");

    await api
      .delete(`/api/v1/admin/cars/${disposableCarId}`)
      .set("Authorization", `Bearer ${adminSession.token}`)
      .expect(204);
  });

  it("enforces dealer ownership and admin boundaries", async () => {
    await api
      .patch(`/api/v1/cars/${secondDealerCarId}`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send({ price: 99999 })
      .expect(403);

    await api
      .delete(`/api/v1/cars/${secondDealerCarId}`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(403);

    await api
      .patch(`/api/v1/dealers/${secondDealerId}`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send({ city: "مكة" })
      .expect(403);

    await api
      .get("/api/v1/dealers/me")
      .set("Authorization", `Bearer ${customerSession.token}`)
      .expect(403);

    await api
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(403);
  });

  it("creates and manages notifications", async () => {
    await api
      .post("/api/v1/leads")
      .send({
        carId,
        name: "Notification Lead",
        phone: "966533333333",
        source: "CAR_DETAIL"
      })
      .expect(201);

    await api
      .post("/api/v1/finance-requests")
      .send({
        carId,
        customerName: "Notification Finance",
        phone: "966544444444"
      })
      .expect(201);

    const listResponse = await api
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    expect(listResponse.body.data.length).toBeGreaterThanOrEqual(2);
    expect(listResponse.body.data.map((notification: { type: string }) => notification.type)).toEqual(
      expect.arrayContaining(["LEAD", "FINANCE"])
    );

    const notificationId = listResponse.body.data[0].id;
    const readResponse = await api
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    expect(readResponse.body.data.isRead).toBe(true);

    const readAllResponse = await api
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    expect(readAllResponse.body.data.every((notification: { isRead: boolean }) => notification.isRead)).toBe(true);

    await api
      .delete(`/api/v1/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(204);
  });

  it("manages car gallery images and promotes fallback main images", async () => {
    const firstImageResponse = await api
      .post(`/api/v1/cars/${carId}/images`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send({ alt: "front", sortOrder: 0, url: "http://localhost:4000/uploads/cars/front.webp" })
      .expect(201);
    const secondImageResponse = await api
      .post(`/api/v1/cars/${carId}/images`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send({ alt: "side", sortOrder: 1, url: "http://localhost:4000/uploads/cars/side.webp" })
      .expect(201);

    expect(firstImageResponse.body.data.isMain).toBe(true);

    const setMainResponse = await api
      .patch(`/api/v1/cars/${carId}/images/${secondImageResponse.body.data.id}/main`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(200);

    expect(setMainResponse.body.data.isMain).toBe(true);

    await api
      .delete(`/api/v1/cars/${carId}/images/${secondImageResponse.body.data.id}`)
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .expect(204);

    const listResponse = await api.get(`/api/v1/cars/${carId}/images`).expect(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(firstImageResponse.body.data.id);
    expect(listResponse.body.data[0].isMain).toBe(true);
  });

  it("supports backend-powered car search, filters, sorting, and pagination metadata", async () => {
    await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send(buildCarPayload({ brand: "Lexus", city: "الرياض", model: "LX600", name: "Lexus LX600", price: 485000 }))
      .expect(201);
    await api
      .post("/api/v1/cars")
      .set("Authorization", `Bearer ${dealerSession.token}`)
      .send(buildCarPayload({ brand: "Lexus", city: "جدة", model: "ES", name: "Lexus ES", price: 210000 }))
      .expect(201);

    const brandResponse = await api.get("/api/v1/cars?brand=Lexus").expect(200);
    expect(brandResponse.body.total).toBeGreaterThanOrEqual(2);
    expect(brandResponse.body.data.every((car: { brand: string }) => car.brand.includes("Lexus"))).toBe(true);

    const cityResponse = await api.get(`/api/v1/cars?city=${encodeURIComponent("الرياض")}`).expect(200);
    expect(cityResponse.body.data.every((car: { city: string }) => car.city.includes("الرياض"))).toBe(true);

    const priceResponse = await api.get("/api/v1/cars?priceMin=200000&priceMax=400000").expect(200);
    expect(priceResponse.body.data.every((car: { price: number }) => car.price >= 200000 && car.price <= 400000)).toBe(true);

    const sortedResponse = await api.get("/api/v1/cars?sort=price_asc&page=1&pageSize=2").expect(200);
    const prices = sortedResponse.body.data.map((car: { price: number }) => car.price);
    expect(prices).toEqual([...prices].sort((first, second) => first - second));
    expect(sortedResponse.body.page).toBe(1);
    expect(sortedResponse.body.pageSize).toBe(2);
    expect(sortedResponse.body.total).toBeGreaterThanOrEqual(sortedResponse.body.data.length);
  });
});

async function registerUser(label: string, role: "CUSTOMER" | "DEALER_OWNER"): Promise<AuthSession> {
  const email = uniqueEmail(label);
  const password = "Test12345!";
  const response = await api
    .post("/api/v1/auth/register")
    .send({
      email,
      name: `Falcon ${label}`,
      password,
      role
    })
    .expect(201);

  return {
    token: response.body.data.token,
    user: response.body.data.user
  };
}

async function createSuperAdminSession(): Promise<AuthSession> {
  const email = uniqueEmail("super-admin");
  const password = "Test12345!";
  await prisma.user.create({
    data: {
      email,
      isActive: true,
      name: "Falcon Super Admin",
      passwordHash: await bcrypt.hash(password, 4),
      role: "SUPER_ADMIN",
      tenantId: "platform"
    }
  });

  const response = await api
    .post("/api/v1/auth/login")
    .send({
      email,
      password
    })
    .expect(200);

  return {
    token: response.body.data.token,
    user: response.body.data.user
  };
}

function buildCarPayload(overrides: Partial<Record<"brand" | "city" | "fuel" | "model" | "name" | "transmission", string> & {
  mileage: number;
  price: number;
  status: "ACTIVE" | "DRAFT" | "SOLD" | "SUSPENDED";
  year: number;
}> = {}) {
  return {
    brand: "Mercedes",
    city: "الرياض",
    fuel: "بنزين",
    mileage: 12000,
    model: "E300 AMG",
    name: "Mercedes E300 AMG",
    price: 375000,
    status: "ACTIVE",
    transmission: "أوتوماتيك",
    year: 2025,
    ...overrides
  };
}

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@falcon.test`;
}
