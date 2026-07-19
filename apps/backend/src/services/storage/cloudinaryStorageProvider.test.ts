import type { Writable } from "node:stream";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CloudinaryStorageProvider } from "./cloudinaryStorageProvider.js";

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn(),
      upload_stream: vi.fn()
    }
  }
}));

const cloudinaryMock = vi.mocked(cloudinary);
const uploadStreamMock = cloudinary.uploader.upload_stream as unknown as ReturnType<typeof vi.fn>;

describe("CloudinaryStorageProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads car images and returns a secure URL with public id", async () => {
    uploadStreamMock.mockImplementation((options: unknown, callback?: (error?: Error, result?: unknown) => void) => {
      expect(options).toMatchObject({
        folder: "falcon/test/cars",
        resource_type: "image"
      });

      return {
        end: () => callback?.(undefined, {
          asset_id: "asset-id",
          public_id: "falcon/test/cars/car-123",
          secure_url: "https://res.cloudinary.com/falcon/image/upload/v1/falcon/test/cars/car-123.webp"
        })
      } as unknown as Writable;
    });

    const provider = new CloudinaryStorageProvider({
      apiKey: "api-key",
      apiSecret: "api-secret",
      cloudName: "falcon",
      folder: "falcon/test/cars"
    });

    const savedFile = await provider.saveCarImage({
      buffer: Buffer.from("image"),
      mimeType: "image/webp",
      originalName: "car.webp"
    });

    expect(savedFile.url).toBe("https://res.cloudinary.com/falcon/image/upload/v1/falcon/test/cars/car-123.webp");
    expect(savedFile.publicId).toBe("falcon/test/cars/car-123");
    expect(cloudinaryMock.config).toHaveBeenCalledWith({
      api_key: "api-key",
      api_secret: "api-secret",
      cloud_name: "falcon",
      secure: true
    });
  });

  it("deletes images by public id", async () => {
    const provider = new CloudinaryStorageProvider({
      apiKey: "api-key",
      apiSecret: "api-secret",
      cloudName: "falcon",
      folder: "falcon/test/cars"
    });

    await provider.deleteFile({
      publicId: "falcon/test/cars/car-123"
    });

    expect(cloudinaryMock.uploader.destroy).toHaveBeenCalledWith("falcon/test/cars/car-123", {
      resource_type: "image"
    });
  });

  it("removes temporary local files after Cloudinary upload", async () => {
    uploadStreamMock.mockImplementation((_options: unknown, callback?: (error?: Error, result?: unknown) => void) => ({
      end: () => callback?.(undefined, {
        asset_id: "asset-id",
        public_id: "falcon/test/cars/car-temp",
        secure_url: "https://res.cloudinary.com/falcon/image/upload/v1/falcon/test/cars/car-temp.webp"
      })
    }) as unknown as Writable);

    const tempDir = await mkdtemp(path.join(os.tmpdir(), "falcon-cloudinary-"));
    const tempFilePath = path.join(tempDir, "car.webp");
    await writeFile(tempFilePath, "temporary-image");

    const provider = new CloudinaryStorageProvider({
      apiKey: "api-key",
      apiSecret: "api-secret",
      cloudName: "falcon",
      folder: "falcon/test/cars"
    });

    await provider.saveCarImage({
      buffer: Buffer.from("image"),
      mimeType: "image/webp",
      originalName: "car.webp",
      tempFilePath
    });

    await expect(access(tempFilePath)).rejects.toThrow();
    await rm(tempDir, {
      force: true,
      recursive: true
    });
  });

  it("derives a Cloudinary public id from a legacy secure URL when possible", async () => {
    const provider = new CloudinaryStorageProvider({
      apiKey: "api-key",
      apiSecret: "api-secret",
      cloudName: "falcon",
      folder: "falcon/test/cars"
    });

    await provider.deleteFile({
      url: "https://res.cloudinary.com/falcon/image/upload/v123/falcon/test/cars/car-123.webp"
    });

    expect(cloudinaryMock.uploader.destroy).toHaveBeenCalledWith("falcon/test/cars/car-123", {
      resource_type: "image"
    });
  });
});
