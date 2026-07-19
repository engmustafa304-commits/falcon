import { API_BASE_URL, buildAuthHeaders } from "./apiClient";

type UploadResponse = {
  data?: {
    publicId?: string;
    url: string;
  };
  publicId?: string;
  url?: string;
};

export type UploadedCarImage = {
  publicId?: string;
  url: string;
};

export async function uploadCarImageAsset(image: File): Promise<UploadedCarImage> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/uploads/car-images`, {
    body: formData,
    headers: buildAuthHeaders(),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Falcon image upload failed: ${response.status}`);
  }

  const payload = (await response.json()) as UploadResponse;
  const url = payload.url ?? payload.data?.url;
  const publicId = payload.publicId ?? payload.data?.publicId;

  if (!url) {
    throw new Error("Falcon image upload response did not include a URL");
  }

  return {
    publicId,
    url
  };
}

export async function uploadCarImage(image: File) {
  const uploadedImage = await uploadCarImageAsset(image);
  return uploadedImage.url;
}
