import { apiGet, apiPost, AUTH_TOKEN_STORAGE_KEY } from "./apiClient";

export type AuthRole = "SUPER_ADMIN" | "ADMIN" | "DEALER_OWNER" | "DEALER_MANAGER" | "CUSTOMER";

export type AuthUser = {
  createdAt?: string;
  email: string;
  id: string;
  name: string;
  phone?: string | null;
  role: AuthRole;
  tenantId: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  phone?: string;
  role?: AuthRole;
  tenantId?: string;
};

const AUTH_USER_STORAGE_KEY = "falcon.auth.user";

export async function login(data: LoginInput) {
  const response = await apiPost<AuthResponse, LoginInput>("/auth/login", data);
  persistAuth(response);
  return response;
}

export async function register(data: RegisterInput) {
  const response = await apiPost<AuthResponse, RegisterInput>("/auth/register", data);
  persistAuth(response);
  return response;
}

export async function getMe() {
  const user = await apiGet<AuthUser>("/auth/me");
  storeAuthUser(user);
  return user;
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    logout();
    return null;
  }
}

export function getDashboardPathForRole(role: AuthRole) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "DEALER_OWNER" || role === "DEALER_MANAGER") {
    return "/dealer/dashboard";
  }

  return "/account";
}

function persistAuth(response: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
  storeAuthUser(response.user);
}

function storeAuthUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}
