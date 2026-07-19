import { Router } from "express";
import {
  createCar,
  createCarImage,
  deleteCar,
  deleteCarImage,
  getCarById,
  listCarImages,
  listDealerCars,
  listCars,
  setMainCarImage,
  updateCar,
  updateCarImage
} from "../controllers/cars.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const carRoutes = Router();

carRoutes.get("/", asyncHandler(listCars));
carRoutes.post("/", requireAuth, asyncHandler(createCar));
carRoutes.get("/dealer/mine", requireAuth, asyncHandler(listDealerCars));
carRoutes.get("/:id/images", asyncHandler(listCarImages));
carRoutes.post("/:id/images", requireAuth, asyncHandler(createCarImage));
carRoutes.patch("/:id/images/:imageId", requireAuth, asyncHandler(updateCarImage));
carRoutes.delete("/:id/images/:imageId", requireAuth, asyncHandler(deleteCarImage));
carRoutes.patch("/:id/images/:imageId/main", requireAuth, asyncHandler(setMainCarImage));
carRoutes.get("/:id", asyncHandler(getCarById));
carRoutes.patch("/:id", requireAuth, asyncHandler(updateCar));
carRoutes.delete("/:id", requireAuth, asyncHandler(deleteCar));
