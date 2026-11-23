"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageFile } from "@/lib/api/upload";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_FILE_SIZE } from "@/lib/storage/types";
import { toast } from "@/lib/utils/toast";

const MAX_IMAGES = 10;

interface ServiceImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUploadingChange: (uploading: boolean) => void;
  disabled?: boolean;
}

export function ServiceImageGallery({ images, onChange, onUploadingChange, disabled }: ServiceImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    if (selected.length > MAX_IMAGES - images.length) {
      toast.error("Too many images", { description: "You can add up to 10 photos per service." });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploading(true);
    onUploadingChange(true);
    const added: string[] = [];
    try {
      for (const file of selected) {
        if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number]) || file.size > MAX_UPLOAD_FILE_SIZE) {
          toast.error("Could not upload image", { description: file.name + ": choose a supported image under 5 MB." });
          continue;
        }
        try {
          const result = await uploadImageFile(file, "general");
          added.push(result.url);
        } catch (error) {
          toast.error("Upload failed", { description: file.name + ": " + (error instanceof Error ? error.message : "Please try again.") });
        }
      }
      if (added.length) onChange([...new Set([...images, ...added])]);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const addUrl = () => {
    const url = imageUrl.trim();
    if (!/^(https?:\/\/|\/uploads\/)/i.test(url) || url.length > 500) {
      toast.error("Invalid image URL", { description: "Enter an HTTP(S) URL or an /uploads/ path." });
      return;
    }
    if (images.length >= MAX_IMAGES) {
      toast.error("You can add up to 10 photos per service.");
      return;
    }
    if (!images.includes(url)) onChange([...images, url]);
    setImageUrl("");
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold">Service photos (optional)</p>
        <p className="text-[11px] text-muted-foreground">Add up to 10 photos. The first photo is the cover.</p>
      </div>
      <input ref={inputRef} type="file" accept={ALLOWED_MIME_TYPES.join(",")} multiple className="sr-only" aria-label="Choose service photos" disabled={disabled || uploading} onChange={(event) => void upload(event.target.files)} />
      <Button type="button" variant="outline" size="sm" disabled={disabled || uploading || images.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
        {uploading ? "Uploading photos?" : "Choose photos"}
      </Button>
      <p className="text-[11px] text-muted-foreground">PNG, JPEG, WebP, GIF or AVIF; maximum 5 MB per photo.</p>
      <div className="flex items-end gap-2">
        <Input label="Or add an image URL" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} disabled={disabled || uploading} placeholder="https://example.com/photo.jpg" />
        <Button type="button" variant="outline" size="sm" onClick={addUrl} disabled={disabled || uploading || !imageUrl.trim() || images.length >= MAX_IMAGES}>Add</Button>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, index) => (
            <div key={url} className="space-y-1">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                <Image src={url} alt={"Service photo " + (index + 1)} fill sizes="140px" className="object-cover" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                {index === 0 ? <span className="text-[11px] font-semibold text-primary">Cover</span> : <button type="button" className="text-[11px] text-primary underline" disabled={disabled || uploading} onClick={() => onChange([url, ...images.filter((_, i) => i !== index)])}>Make cover</button>}
                <button type="button" className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label={"Remove photo " + (index + 1)} disabled={disabled || uploading} onClick={() => onChange(images.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
