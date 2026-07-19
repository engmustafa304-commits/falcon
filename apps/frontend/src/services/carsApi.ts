import { ASSETS } from "@/config/assets";
import type { HomeCar } from "@/pages/home/homeData";
import type { MarketplaceCar } from "@/pages/marketplace/marketplaceData";
import { apiDelete, apiGet, apiGetEnvelope, apiPatch, apiPost } from "./apiClient";

export type BackendCar = {
  brand?: string;
  city?: string;
  dealer?: {
    id?: string;
    isVerified?: boolean;
    name?: string;
    phone?: string | null;
  };
  dealerId?: string;
  fuel?: string;
  id: string;
  images?: BackendCarImage[];
  imageUrl?: string | null;
  mileage?: number;
  model?: string;
  name?: string;
  price?: number;
  transmission?: string;
  year?: number;
};

export type BackendCarImage = {
  alt?: string | null;
  carId: string;
  createdAt?: string;
  id: string;
  isMain: boolean;
  sortOrder: number;
  storagePublicId?: string | null;
  url: string;
};

export type CreateCarInput = {
  brand: string;
  city: string;
  dealerId?: string;
  fuel: string;
  imageUrl?: string;
  mileage?: number;
  model: string;
  name: string;
  price: number;
  status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "SOLD";
  tenantId?: string;
  transmission: string;
  year: number;
};

export type CarSearchSort = "newest" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";

export type CarSearchParams = {
  brand?: string;
  city?: string;
  dealerId?: string;
  fuel?: string;
  mileageMax?: number;
  model?: string;
  page?: number;
  pageSize?: number;
  priceMax?: number;
  priceMin?: number;
  q?: string;
  sort?: CarSearchSort;
  status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "SOLD";
  transmission?: string;
  yearMax?: number;
  yearMin?: number;
};

export type CarsListResult = {
  data: BackendCar[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateCarImageInput = {
  alt?: string;
  isMain?: boolean;
  sortOrder?: number;
  storagePublicId?: string;
  url: string;
};

export type UpdateCarImageInput = {
  alt?: string;
  isMain?: boolean;
  sortOrder?: number;
  storagePublicId?: string;
};

const fallbackScores = ["9.2", "8.9", "9.4", "8.7", "9.0", "8.5"];

export async function getCars(params?: CarSearchParams) {
  return apiGet<BackendCar[]>(buildCarsPath(params));
}

export async function getCarsResult(params?: CarSearchParams): Promise<CarsListResult> {
  const envelope = await apiGetEnvelope<BackendCar[]>(buildCarsPath(params));

  return {
    data: envelope.data,
    page: envelope.page ?? params?.page ?? 1,
    pageSize: envelope.pageSize ?? params?.pageSize ?? envelope.data.length,
    total: envelope.total ?? envelope.data.length
  };
}

export async function getCar(id: string) {
  return apiGet<BackendCar>(`/cars/${id}`);
}

export async function getMyDealerCars() {
  return apiGet<BackendCar[]>("/cars/dealer/mine");
}

export async function createCar(data: CreateCarInput) {
  return apiPost<BackendCar, CreateCarInput>("/cars", data);
}

export async function updateCar(id: string, data: Partial<CreateCarInput>) {
  return apiPatch<BackendCar, Partial<CreateCarInput>>(`/cars/${id}`, data);
}

export async function deleteCar(id: string) {
  return apiDelete(`/cars/${id}`);
}

export async function getCarImages(carId: string) {
  return apiGet<BackendCarImage[]>(`/cars/${carId}/images`);
}

export async function createCarImage(carId: string, data: CreateCarImageInput) {
  return apiPost<BackendCarImage, CreateCarImageInput>(`/cars/${carId}/images`, data);
}

export async function updateCarImage(carId: string, imageId: string, data: UpdateCarImageInput) {
  return apiPatch<BackendCarImage, UpdateCarImageInput>(`/cars/${carId}/images/${imageId}`, data);
}

export async function deleteCarImage(carId: string, imageId: string) {
  return apiDelete(`/cars/${carId}/images/${imageId}`);
}

export async function setMainCarImage(carId: string, imageId: string) {
  return apiPatch<BackendCarImage, Record<string, never>>(`/cars/${carId}/images/${imageId}/main`, {});
}

export function mapBackendCarToMarketplaceCar(car: BackendCar, index: number): MarketplaceCar {
  const brand = car.brand ?? "Falcon";
  const model = car.model ?? car.name ?? "Vehicle";
  const isDealerCar = Boolean(car.dealer?.isVerified || car.dealerId);

  return {
    badge: isDealerCar ? "معرض موثق" : "وسيط فالكون",
    brandSlug: brand.toLowerCase().replace(/\s+/g, "-"),
    categorySlug: "sedan",
    city: car.city ?? car.dealer?.name ?? "الرياض",
    falconScore: fallbackScores[index % fallbackScores.length],
    id: car.id,
    imageSrc: getBackendCarImageSrc(car, index),
    mileage: `${formatNumber(car.mileage ?? 0)} كم`,
    model,
    name: car.name ?? `${brand} ${model}`.trim(),
    price: `${formatNumber(car.price ?? 0)} ريال`,
    year: String(car.year ?? new Date().getFullYear())
  };
}

export function mapBackendCarToHomeCar(car: BackendCar, index: number): HomeCar {
  const marketplaceCar = mapBackendCarToMarketplaceCar(car, index);

  return {
    badge: marketplaceCar.badge,
    city: marketplaceCar.city,
    id: marketplaceCar.id,
    imageSrc: marketplaceCar.imageSrc,
    name: `${marketplaceCar.name} ${marketplaceCar.year}`.trim(),
    price: marketplaceCar.price
  };
}

export function getBackendCarImageSrc(car: BackendCar, index = 0) {
  const mainImage = car.images?.find((image) => image.isMain) ?? car.images?.[0];
  return mainImage?.url || car.imageUrl || ASSETS.cars[index % ASSETS.cars.length];
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function buildCarsPath(params?: CarSearchParams) {
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        searchParams.set(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `/cars?${queryString}` : "/cars";
}
