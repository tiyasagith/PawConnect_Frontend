/**
 * Product Catalogue API
 * Connects to Spring Boot /api/products and /api/products/{id}.
 */

import { apiGet, type PageResponse } from "./client";
import {
  type EnrichedProductItem,
  type ProductItem,
} from "@/lib/mock/products";
import { cacheProductMeta } from "./cart";

export type { EnrichedProductItem, ProductItem };

export interface BackendProduct {
  id: number;
  categoryId?: number;
  categoryName?: string;
  name: string;
  sku?: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight?: number;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isActive: boolean;
  imageUrls?: string[];
  originalPrice?: number;
  compareAtPrice?: number;
  createdAt?: string;
}

export function mapBackendProductToUi(p: BackendProduct): EnrichedProductItem {
  const images = (p.imageUrls || []).filter(
    (url) => typeof url === "string" && url.trim().length > 0
  );
  const primaryImage = images[0] || "";

  if (primaryImage || p.categoryName) {
    cacheProductMeta(p.id, primaryImage, p.categoryName);
  }

  const priceNum = Number(p.price || 0);
  const stock = p.stockQuantity ?? 0;
  const rawOriginal = p.originalPrice ?? p.compareAtPrice;
  const originalPrice =
    rawOriginal && Number(rawOriginal) > priceNum
      ? Number(Number(rawOriginal).toFixed(2))
      : undefined;

  return {
    id: String(p.id),
    name: p.name,
    category: p.categoryName || "General Care",
    categoryId: p.categoryId,
    description: p.description || "",
    price: priceNum,
    originalPrice,
    stock,
    stockQuantity: stock,
    stockStatus: stock <= 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock",
    inStock: stock > 0,
    rating: 0,
    reviewCount: 0,
    images,
    image: primaryImage,
    featured: true,
    popular: true,
    recommended: true,
    inHouseGuaranteed: true,
    tags: [p.categoryName?.toLowerCase() || "supplies", "pawconnect"],
    highlights: [
      "In-house quality tested and certified safe",
      "Manufactured with premium pet-safe ingredients",
      "Directly fulfilled from PawConnect temperature-controlled depots",
    ],
    specs: {
      SKU: p.sku || `PC-SKU-${p.id}`,
      Category: p.categoryName || "Care",
      "Stock Status": stock > 0 ? "Available" : "Backorder",
    },
    specifications: {
      SKU: p.sku || `PC-SKU-${p.id}`,
      Category: p.categoryName || "Care",
      "Stock Status": stock > 0 ? "Available" : "Backorder",
    },
  };
}

export async function fetchProducts(): Promise<EnrichedProductItem[]> {
  const res = await apiGet<PageResponse<BackendProduct>>("/products", {
    params: { size: 50 },
  });
  const items = res?.content || [];
  return items.map(mapBackendProductToUi);
}

export async function fetchProductById(
  id: string
): Promise<EnrichedProductItem | null> {
  const digits = String(id || "").replace(/\D/g, "");
  const numericId = Number(digits || id);
  if (isNaN(numericId) || numericId <= 0) return null;

  try {
    const res = await apiGet<BackendProduct>(`/products/${numericId}`);
    if (res) return mapBackendProductToUi(res);
  } catch {
    // Return null if product does not exist
  }
  return null;
}
