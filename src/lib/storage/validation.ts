import path from "node:path";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_FILE_SIZE, type UploadCategory, ALLOWED_UPLOAD_FOLDERS } from "./types";

export const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
}

export function isValidImageExtension(filename: string): boolean {
  if (!filename) return false;
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number]);
}

/**
 * Validates file buffer against known image magic byte signatures.
 * Detects verified binary raster images: JPEG, PNG, GIF, WebP, AVIF.
 * Explicitly rejects active XML content or executable scripts (SVG, HTML, JS).
 */
export function hasValidImageMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) return false;

  // Active XML/script injection check (SVG/HTML rejection)
  const headerSlice = buffer.subarray(0, Math.min(buffer.length, 512)).toString("utf8").trim().toLowerCase();
  if (
    headerSlice.startsWith("<svg") ||
    headerSlice.startsWith("<?xml") ||
    headerSlice.includes("<svg") ||
    headerSlice.includes("<script")
  ) {
    return false;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WEBP: RIFF (bytes 0-3) ... WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  // AVIF: bytes 4-7 are 'ftyp' (66 74 79 70)
  if (
    buffer.length >= 12 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return true;
  }

  return false;
}

export function validateImageUpload(file: unknown): FileValidationResult {
  if (!file || !(file instanceof File)) {
    return {
      valid: false,
      error: "No file was uploaded. Please attach a valid image file.",
      statusCode: 400,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "Uploaded file is empty. Please select a valid non-empty image file.",
      statusCode: 400,
    };
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`,
      statusCode: 413,
    };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (ext === ".svg" || file.type === "image/svg+xml") {
    return {
      valid: false,
      error: "SVG image uploads are restricted for security reasons (script execution protection). Allowed formats are JPEG, PNG, WEBP, GIF, and AVIF.",
      statusCode: 400,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      valid: false,
      error: `Unsupported MIME type (${file.type || "unknown"}). Allowed formats are JPEG, PNG, WEBP, GIF, and AVIF.`,
      statusCode: 400,
    };
  }

  if (!isValidImageExtension(file.name)) {
    return {
      valid: false,
      error: `Invalid file extension for "${file.name}". Allowed extensions are .jpg, .jpeg, .png, .webp, .gif, and .avif.`,
      statusCode: 400,
    };
  }

  return { valid: true };
}

export function sanitizeUploadFolder(folder?: string | null): UploadCategory {
  if (!folder) return "general";
  const clean = path.basename(folder.trim().toLowerCase());
  if (ALLOWED_UPLOAD_FOLDERS.includes(clean as UploadCategory)) {
    return clean as UploadCategory;
  }
  return "general";
}
