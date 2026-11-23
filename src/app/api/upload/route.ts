import { NextResponse } from "next/server";
import {
  getStorageProvider,
  validateImageUpload,
  hasValidImageMagicBytes,
  sanitizeUploadFolder,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawFolder = formData.get("folder") as string | null;

    // Comprehensive File Validation (Empty check, size check, MIME check, extension check)
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 400 }
      );
    }

    const uploadedFile = file as File;

    // Server-side magic bytes validation to prevent disguised executables or invalid file streams
    const bytes = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!hasValidImageMagicBytes(buffer)) {
      return NextResponse.json(
        {
          error: "Invalid file content. File does not match a verified image binary format (JPEG, PNG, WebP, GIF, AVIF).",
        },
        { status: 400 }
      );
    }

    // Validate and sanitize folder category to avoid path traversal
    const folder = sanitizeUploadFolder(rawFolder);

    // Perform upload through active storage provider
    const provider = getStorageProvider();
    const result = await provider.upload(uploadedFile, folder);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Upload API] File upload failed:", error);
    const message = error instanceof Error ? error.message : "Internal server error during upload.";
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}

