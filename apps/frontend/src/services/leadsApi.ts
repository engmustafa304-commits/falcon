import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";

export type LeadSource = "CAR_DETAIL" | "DEALER_PAGE" | "FINANCE_REQUEST" | "WHATSAPP_CLICK";
export type LeadStatus = "NEW" | "CONTACTED" | "WON" | "LOST";

export type Lead = {
  car?: {
    brand?: string;
    id: string;
    model?: string;
    name?: string;
    year?: number;
  } | null;
  carId?: string | null;
  createdAt?: string;
  dealer?: {
    id: string;
    name?: string;
    ownerUserId?: string | null;
  } | null;
  dealerId?: string | null;
  email?: string | null;
  id: string;
  message?: string | null;
  name: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  tenantId: string;
  updatedAt?: string;
};

export type CreateLeadInput = {
  carId?: string;
  dealerId?: string;
  email?: string;
  message?: string;
  name: string;
  phone: string;
  source?: LeadSource;
};

export async function createLead(data: CreateLeadInput) {
  return apiPost<Lead, CreateLeadInput>("/leads", data);
}

export async function getDealerLeads() {
  return apiGet<Lead[]>("/dealer/leads");
}

export async function getMyLeads() {
  return apiGet<Lead[]>("/leads/me");
}

export async function updateDealerLeadStatus(id: string, status: LeadStatus) {
  return apiPatch<Lead, { status: LeadStatus }>(`/dealer/leads/${id}/status`, { status });
}

export async function getAdminLeads() {
  return apiGet<Lead[]>("/admin/leads");
}

export async function updateAdminLeadStatus(id: string, status: LeadStatus) {
  return apiPatch<Lead, { status: LeadStatus }>(`/admin/leads/${id}/status`, { status });
}

export async function deleteAdminLead(id: string) {
  return apiDelete(`/admin/leads/${id}`);
}
