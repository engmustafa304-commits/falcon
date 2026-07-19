import type { Request, Response } from "express";
import { getStorageStatus } from "../services/storage/index.js";

export function getAdminStorageStatus(_request: Request, response: Response) {
  response.status(200).json({
    data: getStorageStatus()
  });
}
