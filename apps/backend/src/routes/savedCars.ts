import { Router } from "express";
import {
  addCompareItem,
  addFavorite,
  listCompareItems,
  listFavorites,
  removeCompareItem,
  removeFavorite
} from "../controllers/savedCars.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const favoriteRoutes = Router();
export const compareRoutes = Router();

favoriteRoutes.use(requireAuth);
favoriteRoutes.get("/", asyncHandler(listFavorites));
favoriteRoutes.post("/:carId", asyncHandler(addFavorite));
favoriteRoutes.delete("/:carId", asyncHandler(removeFavorite));

compareRoutes.use(requireAuth);
compareRoutes.get("/", asyncHandler(listCompareItems));
compareRoutes.post("/:carId", asyncHandler(addCompareItem));
compareRoutes.delete("/:carId", asyncHandler(removeCompareItem));
