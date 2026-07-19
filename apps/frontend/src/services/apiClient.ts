const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required for Falcon production builds.");
}

export const API_BASE_URL = configuredApiBaseUrl ?? getDevelopmentApiBaseUrl();

export const AUTH_TOKEN_STORAGE_KEY = "falcon.auth.token";

type ApiResponse<T> = {
  data: T;
  page?: number;
  pageSize?: number;
  total?: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const payload = await requestEnvelope<T>(path, init);
  return payload.data;
}

async function requestEnvelope<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildJsonHeaders(init?.headers)
  });

  if (!response.ok) {
    throw new Error(`Falcon API request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiGetEnvelope<T>(path: string): Promise<ApiResponse<T>> {
  return requestEnvelope<T>(path);
}

export function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return request<TResponse>(path, {
    body: JSON.stringify(body),
    method: "POST"
  });
}

export function apiPatch<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  return request<TResponse>(path, {
    body: JSON.stringify(body),
    method: "PATCH"
  });
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildAuthHeaders(),
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`Falcon API request failed: ${response.status}`);
  }
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function buildJsonHeaders(headers?: HeadersInit) {
  const mergedHeaders = new Headers(headers);
  const authHeaders = buildAuthHeaders();

  mergedHeaders.set("Content-Type", mergedHeaders.get("Content-Type") ?? "application/json");

  if (authHeaders.Authorization) {
    mergedHeaders.set("Authorization", authHeaders.Authorization);
  }

  return mergedHeaders;
}

export function buildAuthHeaders(): Record<string, string> {
  const token = getStoredAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

function getDevelopmentApiBaseUrl() {
  return ["http://localhost:4000", "api", "v1"].join("/");
}
