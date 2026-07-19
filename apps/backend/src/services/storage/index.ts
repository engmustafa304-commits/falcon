import { env } from "../../config/env.js";
import { CloudinaryStorageProvider } from "./cloudinaryStorageProvider.js";
import { LocalStorageProvider } from "./localStorageProvider.js";
import type { StorageProvider } from "./storageProvider.js";

function createStorageProvider(): StorageProvider {
  if (env.STORAGE_PROVIDER === "local") {
    return new LocalStorageProvider();
  }

  if (env.STORAGE_PROVIDER === "cloudinary") {
    return new CloudinaryStorageProvider();
  }

  throw new Error(`Unsupported storage provider: ${env.STORAGE_PROVIDER}`);
}

export const storageProvider = createStorageProvider();

export function getStorageStatus() {
  const provider = env.STORAGE_PROVIDER;
  const cloudNamePresent = Boolean(env.CLOUDINARY_CLOUD_NAME);
  const apiKeyPresent = Boolean(env.CLOUDINARY_API_KEY);
  const apiSecretPresent = Boolean(env.CLOUDINARY_API_SECRET);

  return {
    cloudNamePresent,
    configured: provider === "cloudinary"
      ? cloudNamePresent && apiKeyPresent && apiSecretPresent
      : provider === "local",
    folder: env.CLOUDINARY_FOLDER,
    provider
  };
}

export type { SaveFileInput, SavedFile, StorageProvider } from "./storageProvider.js";
