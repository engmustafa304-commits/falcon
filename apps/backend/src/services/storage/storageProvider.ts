export type SaveFileInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  tempFilePath?: string;
};

export type SavedFile = {
  filename: string;
  path: string;
  publicId?: string;
  url: string;
};

export type DeleteFileInput = {
  path?: string | null;
  publicId?: string | null;
  url?: string | null;
};

export interface StorageProvider {
  saveCarImage(input: SaveFileInput): Promise<SavedFile>;
  deleteFile?(input: DeleteFileInput): Promise<void>;
}
