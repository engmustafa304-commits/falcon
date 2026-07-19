import type { BackendCar } from "./carsApi";
import { apiDelete, apiGet, apiPost } from "./apiClient";

export async function getFavorites() {
  return apiGet<BackendCar[]>("/favorites");
}

export async function addFavorite(carId: string) {
  return apiPost<BackendCar, undefined>(`/favorites/${carId}`, undefined);
}

export async function removeFavorite(carId: string) {
  return apiDelete(`/favorites/${carId}`);
}

export async function getCompareItems() {
  return apiGet<BackendCar[]>("/compare");
}

export async function addCompareItem(carId: string) {
  return apiPost<BackendCar, undefined>(`/compare/${carId}`, undefined);
}

export async function removeCompareItem(carId: string) {
  return apiDelete(`/compare/${carId}`);
}
