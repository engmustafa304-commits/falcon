import { apiDelete, apiGet, apiPatch } from "./apiClient";
import type { AuthRole } from "./authApi";

export type AdminDealer = {
  _count?: {
    cars?: number;
  };
  city?: string;
  createdAt?: string;
  email?: string | null;
  id: string;
  isVerified?: boolean;
  name?: string;
  owner?: {
    email?: string;
    id: string;
    name?: string;
    phone?: string | null;
    role?: AuthRole;
  } | null;
  ownerUserId?: string | null;
  phone?: string | null;
  tenantId?: string;
  updatedAt?: string;
};

export type UpdateAdminDealerInput = {
  city?: string;
  email?: string;
  name?: string;
  phone?: string;
};

export async function getAdminDealers() {
  return apiGet<AdminDealer[]>("/admin/dealers");
}

export async function updateAdminDealer(id: string, data: UpdateAdminDealerInput) {
  return apiPatch<AdminDealer, UpdateAdminDealerInput>(`/admin/dealers/${id}`, data);
}

export async function updateAdminDealerVerification(id: string, isVerified: boolean) {
  return apiPatch<AdminDealer, { isVerified: boolean }>(`/admin/dealers/${id}/verify`, { isVerified });
}

export async function deleteAdminDealer(id: string) {
  return apiDelete(`/admin/dealers/${id}`);
}
