import { randomBytes } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import { env } from "../../config/env.js";
import type { DeleteFileInput, SaveFileInput, SavedFile, StorageProvider } from "./storageProvider.js";

type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
  folder: string;
};

export class CloudinaryStorageProvider implements StorageProvider {
  private readonly config: CloudinaryConfig;

  constructor(config = resolveCloudinaryConfig()) {
    this.config = config;
    cloudinary.config({
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      cloud_name: config.cloudName,
      secure: true
    });
  }

  async saveCarImage(input: SaveFileInput): Promise<SavedFile> {
    const publicId = createSafePublicId();

    try {
      const uploadResult = await uploadBuffer(input.buffer, {
        folder: this.config.folder,
        public_id: publicId,
        resource_type: "image"
      });

      return {
        filename: `${publicId}${path.extname(input.originalName).toLowerCase()}`,
        path: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url
      };
    } finally {
      if (input.tempFilePath) {
        await unlink(input.tempFilePath).catch(() => undefined);
      }
    }
  }

  async deleteFile(input: DeleteFileInput): Promise<void> {
    const publicId = input.publicId ?? getCloudinaryPublicIdFromUrl(input.url);

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });
  }
}

function resolveCloudinaryConfig(): CloudinaryConfig {
  const missingVariables = [
    ["CLOUDINARY_CLOUD_NAME", env.CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", env.CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", env.CLOUDINARY_API_SECRET]
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missingVariables.length > 0) {
    throw new Error(
      `Cloudinary storage is missing required variables: ${missingVariables.join(", ")}. Secret values are never printed.`
    );
  }

  return {
    apiKey: env.CLOUDINARY_API_KEY as string,
    apiSecret: env.CLOUDINARY_API_SECRET as string,
    cloudName: env.CLOUDINARY_CLOUD_NAME as string,
    folder: env.CLOUDINARY_FOLDER.replace(/^\/+|\/+$/g, "")
  };
}

function createSafePublicId() {
  return `car-${Date.now()}-${randomBytes(6).toString("hex")}`;
}

function uploadBuffer(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result?.secure_url || !result.public_id) {
        reject(new Error("Cloudinary upload did not return a secure URL"));
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

function getCloudinaryPublicIdFromUrl(url?: string | null) {
  if (!url?.includes("/res.cloudinary.com/")) {
    return undefined;
  }

  const uploadMarker = "/upload/";
  const markerIndex = url.indexOf(uploadMarker);

  if (markerIndex === -1) {
    return undefined;
  }

  const pathWithVersion = url.slice(markerIndex + uploadMarker.length);
  const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");
  return pathWithoutVersion.replace(/\.[a-z0-9]+$/i, "");
}
