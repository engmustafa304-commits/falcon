import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";

export type FinanceRequestStatus = "NEW" | "REVIEWING" | "APPROVED" | "REJECTED";

export type FinanceRequest = {
  car?: {
    brand?: string;
    id: string;
    model?: string;
    name?: string;
    price?: number;
    year?: number;
  } | null;
  carId?: string | null;
  createdAt?: string;
  customerName: string;
  dealer?: {
    id: string;
    name?: string;
    ownerUserId?: string | null;
  } | null;
  dealerId?: string | null;
  downPayment?: number | null;
  email?: string | null;
  employmentType?: string | null;
  financingPeriod?: number | null;
  id: string;
  monthlyIncome?: number | null;
  phone: string;
  status: FinanceRequestStatus;
  tenantId: string;
  updatedAt?: string;
};

export type CreateFinanceRequestInput = {
  carId?: string;
  customerName: string;
  dealerId?: string;
  downPayment?: number;
  email?: string;
  employmentType?: string;
  financingPeriod?: number;
  monthlyIncome?: number;
  phone: string;
};

export async function createFinanceRequest(data: CreateFinanceRequestInput) {
  return apiPost<FinanceRequest, CreateFinanceRequestInput>("/finance-requests", data);
}

export async function getDealerFinanceRequests() {
  return apiGet<FinanceRequest[]>("/dealer/finance-requests");
}

export async function getMyFinanceRequests() {
  return apiGet<FinanceRequest[]>("/finance-requests/me");
}

export async function updateDealerFinanceRequestStatus(id: string, status: FinanceRequestStatus) {
  return apiPatch<FinanceRequest, { status: FinanceRequestStatus }>(`/dealer/finance-requests/${id}/status`, { status });
}

export async function getAdminFinanceRequests() {
  return apiGet<FinanceRequest[]>("/admin/finance-requests");
}

export async function updateAdminFinanceRequestStatus(id: string, status: FinanceRequestStatus) {
  return apiPatch<FinanceRequest, { status: FinanceRequestStatus }>(`/admin/finance-requests/${id}/status`, { status });
}

export async function deleteAdminFinanceRequest(id: string) {
  return apiDelete(`/admin/finance-requests/${id}`);
}
