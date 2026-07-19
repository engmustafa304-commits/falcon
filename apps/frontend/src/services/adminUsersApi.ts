import { apiDelete, apiGet, apiPatch } from "./apiClient";
import type { AuthRole } from "./authApi";

export type AdminUser = {
  createdAt?: string;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  phone?: string | null;
  role: AuthRole;
  tenantId: string;
  updatedAt?: string;
};

export async function getAdminUsers() {
  return apiGet<AdminUser[]>("/admin/users");
}

export async function updateAdminUserRole(id: string, role: AuthRole) {
  return apiPatch<AdminUser, { role: AuthRole }>(`/admin/users/${id}/role`, { role });
}

export async function updateAdminUserStatus(id: string, isActive: boolean) {
  return apiPatch<AdminUser, { isActive: boolean }>(`/admin/users/${id}/status`, { isActive });
}

export async function deleteAdminUser(id: string) {
  return apiDelete(`/admin/users/${id}`);
}
