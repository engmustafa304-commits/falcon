import { ASSETS } from "@/config/assets";
import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";
import type { BackendCar } from "./carsApi";

export type BackendDealer = {
  _count?: {
    cars?: number;
  };
  cars?: BackendCar[] | number;
  city?: string;
  createdAt?: string;
  email?: string | null;
  id: string;
  imageSrc?: string;
  isVerified?: boolean;
  name?: string;
  ownerUserId?: string | null;
  phone?: string | null;
  tenantId?: string;
};

export type BackendDealerDetails = Omit<BackendDealer, "cars"> & {
  cars?: BackendCar[];
};

export type FrontendDealer = {
  cars: string;
  city: string;
  id?: string;
  imageSrc: string;
  inventory: readonly string[];
  name: string;
  rating: string;
};

export type CreateDealerInput = {
  city: string;
  email?: string;
  isVerified?: boolean;
  name: string;
  phone?: string;
  tenantId: string;
};

const fallbackRatings = ["4.9", "4.8", "4.7", "4.8"];

export async function getDealers() {
  return apiGet<BackendDealer[]>("/dealers");
}

export async function getDealer(id: string) {
  return apiGet<BackendDealerDetails>(`/dealers/${id}`);
}

export async function getMyDealer() {
  return apiGet<BackendDealerDetails>("/dealers/me");
}

export async function createDealer(data: CreateDealerInput) {
  return apiPost<BackendDealer, CreateDealerInput>("/dealers", data);
}

export async function updateDealer(id: string, data: Partial<CreateDealerInput>) {
  return apiPatch<BackendDealer, Partial<CreateDealerInput>>(`/dealers/${id}`, data);
}

export async function updateMyDealer(data: Partial<CreateDealerInput>) {
  return apiPatch<BackendDealerDetails, Partial<CreateDealerInput>>("/dealers/me", data);
}

export async function deleteDealer(id: string) {
  return apiDelete(`/dealers/${id}`);
}

export function mapBackendDealerToFrontendDealer(
  dealer: BackendDealer,
  index: number
): FrontendDealer {
  return {
    cars: `${formatNumber(getCarsCount(dealer))} سيارة`,
    city: dealer.city ?? "الرياض",
    id: dealer.id,
    imageSrc: dealer.imageSrc ?? ASSETS.dealers[index % ASSETS.dealers.length],
    inventory: ["جديد", "مستعمل"],
    name: dealer.name ?? "معرض Falcon",
    rating: fallbackRatings[index % fallbackRatings.length]
  };
}

function getCarsCount(dealer: BackendDealer) {
  if (typeof dealer.cars === "number") {
    return dealer.cars;
  }

  if (Array.isArray(dealer.cars)) {
    return dealer.cars.length;
  }

  return dealer._count?.cars ?? 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}
