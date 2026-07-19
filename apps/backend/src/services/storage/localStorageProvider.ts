import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";
import type { DeleteFileInput, SaveFileInput, SavedFile, StorageProvider } from "./storageProvider.js";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const uploadRoot = path.join(backendRoot, "uploads");
const carUploadsDir = path.join(uploadRoot, "cars");

export class LocalStorageProvider implements StorageProvider {
  async saveCarImage(input: SaveFileInput): Promise<SavedFile> {
    await mkdir(carUploadsDir, { recursive: true });

    const extension = path.extname(input.originalName).toLowerCase();
    const filename = `car-${Date.now()}-${randomBytes(6).toString("hex")}${extension}`;
    const filePath = path.join(carUploadsDir, filename);

    await writeFile(filePath, input.buffer);

    return {
      filename,
      path: filePath,
      publicId: `cars/${filename}`,
      url: `${getPublicUploadBaseUrl()}/cars/${filename}`
    };
  }

  async deleteFile(input: DeleteFileInput): Promise<void> {
    const filePath = input.path ?? getLocalFilePathFromPublicId(input.publicId) ?? getLocalFilePathFromUrl(input.url);

    if (!filePath || !filePath.startsWith(carUploadsDir)) {
      return;
    }

    await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  }
}

function getPublicUploadBaseUrl() {
  const baseUrl = env.PUBLIC_UPLOAD_BASE_URL
    ?? (env.API_PUBLIC_URL ? `${env.API_PUBLIC_URL.replace(/\/$/, "")}/uploads` : undefined)
    ?? `http://localhost:${env.PORT}/uploads`;

  return baseUrl.replace(/\/$/, "");
}

function getLocalFilePathFromPublicId(publicId?: string | null) {
  if (!publicId?.startsWith("cars/")) {
    return undefined;
  }

  return path.join(uploadRoot, publicId);
}

function getLocalFilePathFromUrl(url?: string | null) {
  if (!url) {
    return undefined;
  }

  const publicBase = getPublicUploadBaseUrl();

  if (!url.startsWith(`${publicBase}/cars/`)) {
    return undefined;
  }

  const filename = path.basename(url);
  return path.join(carUploadsDir, filename);
}
