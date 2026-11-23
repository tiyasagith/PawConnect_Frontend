import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasValidImageMagicBytes,
  validateImageUpload,
  sanitizeUploadFolder,
} from "../validation";

describe("Phase 8 - Image Upload Validation & Security Tests", () => {
  describe("1. Binary Magic Bytes Validation", () => {
    it("accepts valid JPEG buffer", () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      assert.equal(hasValidImageMagicBytes(jpegBuffer), true);
    });

    it("accepts valid PNG buffer", () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      assert.equal(hasValidImageMagicBytes(pngBuffer), true);
    });

    it("accepts valid GIF buffer", () => {
      const gifBuffer = Buffer.from("GIF89a...");
      assert.equal(hasValidImageMagicBytes(gifBuffer), true);
    });

    it("accepts valid WebP buffer", () => {
      const webpHeader = Buffer.alloc(16);
      webpHeader.write("RIFF", 0);
      webpHeader.writeUInt32LE(100, 4);
      webpHeader.write("WEBP", 8);
      assert.equal(hasValidImageMagicBytes(webpHeader), true);
    });

    it("rejects malicious or disguised executable buffer masquerading as JPEG", () => {
      // MZ header for DOS/PE executable disguised as image/jpeg
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
      assert.equal(hasValidImageMagicBytes(exeBuffer), false);
    });

    it("rejects active XML/SVG buffer with scripts or tags for XSS protection", () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      assert.equal(hasValidImageMagicBytes(svgBuffer), false);
    });
  });

  describe("2. File Size & MIME Type Validation", () => {
    it("rejects zero-byte empty file with 400", () => {
      const file = new File([], "empty.jpg", { type: "image/jpeg" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, false);
      assert.equal(result.statusCode, 400);
      assert.match(result.error || "", /empty/i);
    });

    it("rejects oversized file (> 5MB) with 413", () => {
      // 5MB + 1 byte
      const oversizedBuffer = new Uint8Array(5 * 1024 * 1024 + 1);
      const file = new File([oversizedBuffer], "large.png", { type: "image/png" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, false);
      assert.equal(result.statusCode, 413);
      assert.match(result.error || "", /5\s*MB/i);
    });

    it("rejects unsupported MIME type (e.g. application/pdf)", () => {
      const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
      const file = new File([buffer], "document.pdf", { type: "application/pdf" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, false);
      assert.equal(result.statusCode, 400);
      assert.match(result.error || "", /unsupported mime type/i);
    });

    it("rejects SVG image upload to prevent active content and XSS attacks", () => {
      const buffer = new Uint8Array([0x3c, 0x73, 0x76, 0x67]); // <svg
      const file = new File([buffer], "vector.svg", { type: "image/svg+xml" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, false);
      assert.equal(result.statusCode, 400);
      assert.match(result.error || "", /SVG image uploads are restricted/i);
    });

    it("rejects mismatched extension (e.g. test.exe uploaded as image/jpeg)", () => {
      const buffer = new Uint8Array([0xff, 0xd8, 0xff]);
      const file = new File([buffer], "virus.exe", { type: "image/jpeg" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, false);
      assert.equal(result.statusCode, 400);
      assert.match(result.error || "", /extension/i);
    });

    it("accepts valid JPEG file within limits", () => {
      const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const file = new File([buffer], "pet-photo.jpg", { type: "image/jpeg" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, true);
      assert.equal(result.error, undefined);
    });

    it("accepts valid PNG file within limits", () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      const file = new File([buffer], "product.png", { type: "image/png" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, true);
    });

    it("accepts valid WebP file within limits", () => {
      const buffer = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
      const file = new File([buffer], "service.webp", { type: "image/webp" });
      const result = validateImageUpload(file);
      assert.equal(result.valid, true);
    });
  });

  describe("3. Storage Path Sanitization & Path Traversal Prevention", () => {
    it("sanitizes path traversal attempts to default general folder", () => {
      assert.equal(sanitizeUploadFolder("../../etc/passwd"), "general");
      assert.equal(sanitizeUploadFolder("../.."), "general");
      assert.equal(sanitizeUploadFolder("..\\..\\windows"), "general");
    });

    it("preserves whitelisted folders", () => {
      assert.equal(sanitizeUploadFolder("pets"), "pets");
      assert.equal(sanitizeUploadFolder("products"), "products");
      assert.equal(sanitizeUploadFolder("veterinarians"), "veterinarians");
      assert.equal(sanitizeUploadFolder("providers"), "providers");
      assert.equal(sanitizeUploadFolder("avatars"), "avatars");
      assert.equal(sanitizeUploadFolder("general"), "general");
    });

    it("falls back to general for unknown or empty folders", () => {
      assert.equal(sanitizeUploadFolder(undefined), "general");
      assert.equal(sanitizeUploadFolder(""), "general");
      assert.equal(sanitizeUploadFolder("malicious_dir"), "general");
    });
  });
});
