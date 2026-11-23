import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getInitials } from "../../../components/shared/entity-image";
import { mapBackendProductToUi, type BackendProduct } from "../../api/products";
import { mapBackendOrder, type BackendOrder } from "../../api/orders";
import { mapBackendCart, type BackendCart } from "../../api/cart";

describe("Phase 8 - Entity Image Fallback & Persistence Mapping Tests", () => {
  describe("1. Initials Generation for User, Provider, and Vet Placeholders", () => {
    it("generates 2-letter initials for standard full names", () => {
      assert.equal(getInitials("Sarah Jenkins", "U"), "SJ");
      assert.equal(getInitials("Arjun Sharma", "U"), "AS");
    });

    it("generates 2 letters for single names", () => {
      assert.equal(getInitials("Bruno", "U"), "BR");
    });

    it("falls back to default fallback when name is undefined or empty", () => {
      assert.equal(getInitials(undefined, "DR"), "DR");
      assert.equal(getInitials("", "PRO"), "PRO");
      assert.equal(getInitials("   ", "PC"), "PC");
    });

    it("takes first 2 letters if more than 2 words are provided", () => {
      assert.equal(getInitials("Dr. Priya Sharma Patel", "DR"), "DP");
    });
  });

  describe("2. Product Image Mapping (No Fake Fallbacks)", () => {
    it("preserves genuine uploaded product images", () => {
      const backendProduct: BackendProduct = {
        id: 101,
        name: "Eco Rope Toy",
        description: "Durable cotton rope",
        price: 299,
        stockQuantity: 15,
        status: "ACTIVE",
        isActive: true,
        imageUrls: ["/uploads/products/rope-toy-front.jpg", "/uploads/products/rope-toy-side.jpg"],
      };

      const mapped = mapBackendProductToUi(backendProduct);
      assert.equal(mapped.image, "/uploads/products/rope-toy-front.jpg");
      assert.equal(mapped.images.length, 2);
      assert.equal(mapped.images[0], "/uploads/products/rope-toy-front.jpg");
    });

    it("leaves image empty and images array empty when product has no images", () => {
      const backendProduct: BackendProduct = {
        id: 102,
        name: "Grain-free Biscuit",
        description: "Healthy treats",
        price: 499,
        stockQuantity: 30,
        status: "ACTIVE",
        isActive: true,
        imageUrls: [],
      };

      const mapped = mapBackendProductToUi(backendProduct);
      assert.equal(mapped.image, "");
      assert.equal(mapped.images.length, 0);
      assert.equal(mapped.image.includes("unsplash"), false);
    });

    it("filters out empty or whitespace-only image URLs", () => {
      const backendProduct: BackendProduct = {
        id: 103,
        name: "Rubber Ball",
        description: "Bouncing play toy",
        price: 150,
        stockQuantity: 10,
        status: "ACTIVE",
        isActive: true,
        imageUrls: ["   ", ""],
      };

      const mapped = mapBackendProductToUi(backendProduct);
      assert.equal(mapped.image, "");
      assert.equal(mapped.images.length, 0);
    });
  });

  describe("3. Order Historical Snapshot Image Mapping", () => {
    it("preserves genuine historical product image snapshot from order item", () => {
      const backendOrder: BackendOrder = {
        id: 501,
        orderNo: "ORD-2026-501",
        userId: 1,
        orderStatus: "DELIVERED",
        paymentStatus: "PAID",
        subtotal: 1200,
        shippingFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 1200,
        createdAt: "2026-03-15T10:00:00Z",
        items: [
          {
            id: 1,
            productId: 42,
            productName: "Orthopedic Memory Foam Bed",
            productSku: "BED-ORTHO-01",
            unitPrice: 1200,
            quantity: 1,
            lineTotal: 1200,
            productImageUrl: "/uploads/products/ortho-bed-2026.jpg",
          },
        ],
      };

      const mapped = mapBackendOrder(backendOrder);
      assert.equal(mapped.items[0].image, "/uploads/products/ortho-bed-2026.jpg");
      assert.equal(mapped.items[0].productImageUrl, "/uploads/products/ortho-bed-2026.jpg");
    });

    it("does not fabricate demo Unsplash image when order item snapshot is missing", () => {
      const backendOrder: BackendOrder = {
        id: 502,
        orderNo: "ORD-2026-502",
        userId: 1,
        orderStatus: "CONFIRMED",
        paymentStatus: "PAID",
        subtotal: 500,
        shippingFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 500,
        createdAt: "2026-03-16T14:30:00Z",
        items: [
          {
            id: 2,
            productId: 99,
            productName: "Vintage Dog Leash",
            unitPrice: 500,
            quantity: 1,
            lineTotal: 500,
          },
        ],
      };

      const mapped = mapBackendOrder(backendOrder);
      assert.equal(mapped.items[0].image, "");
      assert.equal(mapped.items[0].image.includes("unsplash"), false);
    });
  });

  describe("4. Cart Item Real Image Mapping", () => {
    it("maps genuine product image from backend cart item", () => {
      const backendCart: BackendCart = {
        id: 1,
        userId: 1,
        status: "ACTIVE",
        items: [
          {
            id: 11,
            cartId: 1,
            productId: 77,
            productName: "Salmon Oil Supplement",
            unitPrice: 850,
            quantity: 2,
            lineTotal: 1700,
            productImageUrl: "/uploads/products/salmon-oil.webp",
          },
        ],
        subtotal: 1700,
        totalItems: 2,
      };

      const mapped = mapBackendCart(backendCart);
      assert.equal(mapped.items[0].image, "/uploads/products/salmon-oil.webp");
    });

    it("uses empty string without Unsplash fallback when cart item has no image", () => {
      const backendCart: BackendCart = {
        id: 2,
        userId: 1,
        status: "ACTIVE",
        items: [
          {
            id: 12,
            cartId: 2,
            productId: 88,
            productName: "Custom Dog Collar",
            unitPrice: 400,
            quantity: 1,
            lineTotal: 400,
          },
        ],
        subtotal: 400,
        totalItems: 1,
      };

      const mapped = mapBackendCart(backendCart);
      assert.equal(mapped.items[0].image, "");
      assert.equal(mapped.items[0].image.includes("unsplash"), false);
    });
  });
});
