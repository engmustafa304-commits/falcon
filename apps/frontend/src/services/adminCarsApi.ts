import { apiDelete, apiGet, apiPatch } from "./apiClient";
import type { BackendCarImage } from "./carsApi";

export type AdminCarStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "SOLD";

export type AdminCar = {
  brand?: string;
  city?: string;
  createdAt?: string;
  dealer?: {
    city?: string;
    id?: string;
    isVerified?: boolean;
    name?: string;
    owner?: {
      email?: string;
      id: string;
      name?: string;
    } | null;
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
  status?: AdminCarStatus;
  tenantId?: string;
  transmission?: string;
  updatedAt?: string;
  year?: number;
};

export type UpdateAdminCarInput = {
  brand?: string;
  city?: string;
  fuel?: string;
  imageUrl?: string;
  mileage?: number;
  model?: string;
  name?: string;
  price?: number;
  transmission?: string;
  year?: number;
};

export async function getAdminCars(params?: { dealerId?: string }) {
  const query = params?.dealerId ? `?dealerId=${encodeURIComponent(params.dealerId)}` : "";
  return apiGet<AdminCar[]>(`/admin/cars${query}`);
}

export async function updateAdminCar(id: string, data: UpdateAdminCarInput) {
  return apiPatch<AdminCar, UpdateAdminCarInput>(`/admin/cars/${id}`, data);
}

export async function updateAdminCarStatus(id: string, status: AdminCarStatus) {
  return apiPatch<AdminCar, { status: AdminCarStatus }>(`/admin/cars/${id}/status`, { status });
}

export async function deleteAdminCar(id: string) {
  return apiDelete(`/admin/cars/${id}`);
}
