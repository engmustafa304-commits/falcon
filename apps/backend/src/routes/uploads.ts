import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { ApiError } from "../errors/ApiError.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { storageProvider } from "../services/storage/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const unsafeFilenamePattern = /[\\/<>:"|?*\u0000-\u001F]/;

const upload = multer({
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!file.originalname || file.originalname.length > 180 || unsafeFilenamePattern.test(file.originalname)) {
      callback(new ApiError(400, "Invalid image filename", undefined, "INVALID_IMAGE_FILENAME"));
      return;
    }

    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Unsupported image type", undefined, "UNSUPPORTED_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  storage: multer.memoryStorage()
});

export const uploadRoutes = Router();

uploadRoutes.post(
  "/car-images",
  requireAuth,
  upload.single("image"),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw new ApiError(400, "Image file is required", undefined, "IMAGE_REQUIRED");
    }

    const savedFile = await storageProvider.saveCarImage({
      buffer: request.file.buffer,
      mimeType: request.file.mimetype,
      originalName: request.file.originalname
    });

    response.status(201).json({
      publicId: savedFile.publicId,
      url: savedFile.url
    });
  })
);
