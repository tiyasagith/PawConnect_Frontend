"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { PawPrint, Package, User, Stethoscope, Scissors, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── HELPER: INITIALS EXTRACTOR ──────────────────────────────────────────────
export function getInitials(name?: string | null, fallback = "U"): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── 1. USER AVATAR ──────────────────────────────────────────────────────────
export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 sm:h-28 sm:w-28 text-2xl font-extrabold",
};

export function UserAvatar({
  src,
  name,
  size = "md",
  className,
  alt,
}: UserAvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const cleanSrc = src?.trim();

  React.useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  const initials = React.useMemo(() => getInitials(name, "U"), [name]);

  if (!cleanSrc || hasError) {
    return (
      <div
        className={cn(
          "rounded-2xl flex items-center justify-center font-bold select-none bg-primary/10 text-primary border border-primary/20 shrink-0",
          sizeClasses[size],
          className
        )}
        role="img"
        aria-label={alt || name || "User avatar"}
      >
        {initials || <User className="h-1/2 w-1/2 opacity-70" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shrink-0 border border-border/70 bg-surface shadow-xs",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={cleanSrc}
        alt={alt || name || "User avatar"}
        fill
        sizes="(max-width: 640px) 96px, 128px"
        className="object-cover object-top"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// ─── 2. PET IMAGE ────────────────────────────────────────────────────────────
export interface PetImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src?: string | null;
  alt?: string;
  name?: string;
  species?: string;
  className?: string;
}

export function PetImage({
  src,
  alt = "Pet photo",
  name,
  species: _species,
  className,
  fill = true,
  ...props
}: PetImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const cleanSrc = src?.trim();

  React.useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  if (!cleanSrc || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-primary/10 text-primary select-none",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <PawPrint className="h-1/2 w-1/2 max-h-12 max-w-12 text-primary/70" />
      </div>
    );
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt || name || "Pet photo"}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

// ─── 3. PRODUCT IMAGE ────────────────────────────────────────────────────────
export interface ProductImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackIconClassName?: string;
}

export function ProductImage({
  src,
  alt = "Product",
  className,
  fallbackIconClassName,
  fill = true,
  ...props
}: ProductImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const cleanSrc = src?.trim();

  React.useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  if (!cleanSrc || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center bg-surface dark:bg-muted/30 text-muted-foreground select-none",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Package
          className={cn(
            "h-8 w-8 text-muted-foreground/40 stroke-[1.5]",
            fallbackIconClassName
          )}
        />
        <span className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
          No photo
        </span>
      </div>
    );
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

// ─── 4. PROFESSIONAL IMAGE ───────────────────────────────────────────────────
export interface ProfessionalImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src?: string | null;
  name?: string;
  role?: "vet" | "provider" | "trainer" | "groomer" | string;
  alt?: string;
  className?: string;
}

export function ProfessionalImage({
  src,
  name,
  role = "provider",
  alt,
  className,
  fill = true,
  ...props
}: ProfessionalImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const cleanSrc = src?.trim();

  React.useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  const initials = React.useMemo(() => {
    const isVet = role?.toLowerCase().includes("vet");
    return getInitials(name, isVet ? "DR" : "PRO");
  }, [name, role]);

  if (!cleanSrc || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-lg select-none",
          className
        )}
        role="img"
        aria-label={alt || name || "Professional"}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt || name || "Professional photo"}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

// ─── 5. SERVICE IMAGE ────────────────────────────────────────────────────────
export interface ServiceImageProps extends Omit<ImageProps, "src" | "alt" | "onError"> {
  src?: string | null;
  title?: string;
  category?: "veterinary" | "grooming" | "training" | string;
  alt?: string;
  className?: string;
}

export function ServiceImage({
  src,
  title = "Service",
  category = "grooming",
  alt,
  className,
  fill = true,
  ...props
}: ServiceImageProps) {
  const [hasError, setHasError] = React.useState(false);
  const cleanSrc = src?.trim();

  React.useEffect(() => {
    setHasError(false);
  }, [cleanSrc]);

  if (!cleanSrc || hasError) {
    const cat = category?.toLowerCase();
    const Icon =
      cat?.includes("vet")
        ? Stethoscope
        : cat?.includes("train")
        ? Award
        : cat?.includes("groom")
        ? Scissors
        : Sparkles;

    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center bg-primary/5 text-primary select-none",
          className
        )}
        role="img"
        aria-label={title}
      >
        <Icon className="h-10 w-10 text-primary/60 mb-1" />
        <span className="text-[11px] font-semibold text-muted-foreground capitalize">
          {category}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt || title || "Service"}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
