export interface MediaRecord {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altText: string | null;
  caption: string | null;
  size: number;
  storagePath: string;
  createdAt: Date;
}