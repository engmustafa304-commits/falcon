import { apiGet } from "./apiClient";

export type AnalyticsCar = {
  brand?: string;
  city?: string;
  createdAt?: string;
  dealer?: {
    id?: string;
    name?: string;
  } | null;
  id: string;
  model?: string;
  name?: string;
  price?: number;
  status?: "DRAFT" | "ACTIVE" | "SUSPENDED" | "SOLD";
  year?: number;
};

export type AnalyticsLead = {
  car?: {
    id?: string;
    name?: string;
  } | null;
  createdAt?: string;
  dealer?: {
    id?: string;
    name?: string;
  } | null;
  id: string;
  name: string;
  phone: string;
  source?: string;
  status?: "NEW" | "CONTACTED" | "WON" | "LOST";
};

export type DealerAnalytics = {
  activeCars: number;
  latestCars: AnalyticsCar[];
  latestLeads: AnalyticsLead[];
  newLeads: number;
  reviewingFinanceRequests: number;
  soldCars: number;
  totalCars: number;
  totalCompareAddsForDealerCars: number;
  totalFavoritesForDealerCars: number;
  totalFinanceRequests: number;
  totalLeads: number;
};

export type AdminAnalytics = {
  activeCars: number;
  latestCars: AnalyticsCar[];
  latestDealers: {
    _count?: {
      cars?: number;
    };
    city?: string;
    createdAt?: string;
    id: string;
    isVerified?: boolean;
    name?: string;
  }[];
  latestLeads: AnalyticsLead[];
  latestUsers: {
    createdAt?: string;
    email: string;
    id: string;
    name: string;
    phone?: string | null;
    role: string;
  }[];
  totalCars: number;
  totalCompareItems: number;
  totalDealers: number;
  totalFavorites: number;
  totalFinanceRequests: number;
  totalLeads: number;
  totalUsers: number;
  verifiedDealers: number;
};

export function getDealerAnalytics() {
  return apiGet<DealerAnalytics>("/dealer/analytics");
}

export function getAdminAnalytics() {
  return apiGet<AdminAnalytics>("/admin/analytics");
}
