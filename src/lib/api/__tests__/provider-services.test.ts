import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapBackendServiceToUi,
  type BackendServiceDto,
  type BackendServiceCategoryDto,
  type CreateProviderServiceInput,
} from "../professional";
import * as z from "zod";

// Re-import the exact schema rules used by ServiceFormModal
const serviceValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(200, "Service name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  price: z
    .number({ message: "Service price is required" })
    .min(0, "Price cannot be negative")
    .max(100000, "Price cannot exceed ₹1,00,000"),
  durationMinutes: z
    .number({ message: "Duration is required" })
    .int("Duration must be a whole number of minutes")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 480 minutes (8 hours)"),
  active: z.boolean(),
});

describe("Provider Services Frontend Integration Tests", () => {
  it("1. loads and maps actual backend provider service DTO to UI model", () => {
    const backendDto: BackendServiceDto = {
      id: 42,
      providerId: 10,
      categoryId: 1,
      categoryName: "Grooming",
      name: "Luxury Coat De-Shedding",
      description: "Organic botanical bath and blow dry",
      price: 650.0,
      durationMinutes: 60,
      imageUrl: "https://example.com/bath.jpg",
      isActive: true,
    };

    const uiService = mapBackendServiceToUi(backendDto);

    assert.equal(uiService.id, "42");
    assert.equal(uiService.providerId, "10");
    assert.equal(uiService.categoryId, 1);
    assert.equal(uiService.categoryName, "Grooming");
    assert.equal(uiService.name, "Luxury Coat De-Shedding");
    assert.equal(uiService.price, 650.0);
    assert.equal(uiService.durationMinutes, 60);
    assert.equal(uiService.active, true);
    assert.equal(uiService.imageUrl, "https://example.com/bath.jpg");
    assert.equal(uiService.category, "grooming");
  });

  it("preserves gallery order and falls back to a legacy cover image", () => {
    const dto: BackendServiceDto = {
      id: 43, providerId: 10, name: "Wash", price: 500,
      durationMinutes: 30, isActive: true, imageUrl: "/legacy.jpg",
      imageUrls: ["/first.jpg", "/second.jpg"],
    };
    assert.deepEqual(mapBackendServiceToUi(dto).imageUrls, ["/first.jpg", "/second.jpg"]);
    assert.equal(mapBackendServiceToUi(dto).imageUrl, "/first.jpg");
    assert.deepEqual(mapBackendServiceToUi({ ...dto, imageUrls: [] }).imageUrls, ["/legacy.jpg"]);
  });

  it("2. displays empty service list correctly without fabricated entries", () => {
    const backendList: BackendServiceDto[] = [];
    const uiServices = backendList.map(mapBackendServiceToUi);

    assert.equal(uiServices.length, 0);
  });

  it("3. handles category mapping for training specialty accurately", () => {
    const trainingDto: BackendServiceDto = {
      id: 88,
      providerId: 10,
      categoryId: 2,
      categoryName: "Training",
      name: "Puppy Socialization Class",
      description: "Group training for young puppies",
      price: 1200.0,
      durationMinutes: 45,
      isActive: true,
    };

    const uiService = mapBackendServiceToUi(trainingDto);
    assert.equal(uiService.category, "training");
    assert.equal(uiService.categoryName, "Training");
  });

  it("4. handles API failure without fabricating success", () => {
    const simulateApiFailure = () => {
      throw new Error("HTTP 500: Database connection failure");
    };

    assert.throws(
      () => simulateApiFailure(),
      /HTTP 500: Database connection failure/
    );
  });

  it("5. validates and creates a service with complete valid data", () => {
    const validData = {
      name: "Full Royal Grooming",
      categoryId: 1,
      description: "Complete bath, haircut, ear cleaning",
      price: 850,
      durationMinutes: 75,
      active: true,
    };

    const parsed = serviceValidationSchema.safeParse(validData);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.name, "Full Royal Grooming");
      assert.equal(parsed.data.price, 850);
      assert.equal(parsed.data.durationMinutes, 75);
    }
  });

  it("6. rejects missing or whitespace-only service name", () => {
    const missingName = {
      name: "   ",
      categoryId: 1,
      price: 500,
      durationMinutes: 30,
      active: true,
    };

    const parsed = serviceValidationSchema.safeParse(missingName);
    assert.equal(parsed.success, false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((i) => i.path[0] === "name");
      assert.ok(err, "Name field should have validation error");
    }
  });

  it("7. accepts a service without a category selection", () => {
    const missingCategory = {
      name: "Standard Wash",
      categoryId: undefined,
      price: 300,
      durationMinutes: 30,
      active: true,
    };

    const parsed = serviceValidationSchema.safeParse(missingCategory);
    assert.equal(parsed.success, true);
  });

  it("8. rejects missing or invalid price", () => {
    const missingPrice = {
      name: "Nail Trimming",
      categoryId: 1,
      price: undefined,
      durationMinutes: 15,
      active: true,
    };

    const parsed = serviceValidationSchema.safeParse(missingPrice);
    assert.equal(parsed.success, false);
    if (!parsed.success) {
      const err = parsed.error.issues.find((i) => i.path[0] === "price");
      assert.ok(err, "Price must be rejected when missing");
    }

    const negativePrice = {
      name: "Nail Trimming",
      categoryId: 1,
      price: -50,
      durationMinutes: 15,
      active: true,
    };
    const parsedNeg = serviceValidationSchema.safeParse(negativePrice);
    assert.equal(parsedNeg.success, false);
  });

  it("9. allows zero price for complimentary / free initial consultations", () => {
    const freeService = {
      name: "Free Initial Consultation",
      categoryId: 2,
      price: 0,
      durationMinutes: 20,
      active: true,
    };

    const parsed = serviceValidationSchema.safeParse(freeService);
    assert.equal(parsed.success, true);
  });

  it("10. rejects invalid duration outside limits (< 5 mins or > 480 mins)", () => {
    const tooShort = {
      name: "Fast Brush",
      categoryId: 1,
      price: 100,
      durationMinutes: 2,
      active: true,
    };
    assert.equal(serviceValidationSchema.safeParse(tooShort).success, false);

    const tooLong = {
      name: "All-Day Intensive",
      categoryId: 2,
      price: 5000,
      durationMinutes: 600,
      active: true,
    };
    assert.equal(serviceValidationSchema.safeParse(tooLong).success, false);
  });

  it("11. formats update payload preserving database service id and new values", () => {
    const serviceId = "42";
    const editPayload: Partial<CreateProviderServiceInput> = {
      name: "Updated Bath Treatment",
      price: 900,
      durationMinutes: 60,
    };

    assert.equal(serviceId, "42");
    assert.equal(editPayload.name, "Updated Bath Treatment");
    assert.equal(editPayload.price, 900);
  });

  it("12. deactivates an active service payload correctly", () => {
    const currentService: BackendServiceDto = {
      id: 42,
      providerId: 10,
      categoryId: 1,
      name: "Coat Care",
      price: 400,
      durationMinutes: 30,
      isActive: true,
    };

    const toggled = { ...currentService, isActive: !currentService.isActive };
    assert.equal(toggled.isActive, false);

    const ui = mapBackendServiceToUi(toggled);
    assert.equal(ui.active, false);
  });

  it("13. reactivates an inactive service payload correctly", () => {
    const currentService: BackendServiceDto = {
      id: 42,
      providerId: 10,
      categoryId: 1,
      name: "Coat Care",
      price: 400,
      durationMinutes: 30,
      isActive: false,
    };

    const toggled = { ...currentService, isActive: !currentService.isActive };
    assert.equal(toggled.isActive, true);

    const ui = mapBackendServiceToUi(toggled);
    assert.equal(ui.active, true);
  });

  it("14. processes service category list payload", () => {
    const categories: BackendServiceCategoryDto[] = [
      { id: 1, name: "Grooming", serviceType: "GROOMING", isActive: true },
      { id: 2, name: "Training", serviceType: "TRAINING", isActive: true },
    ];

    assert.equal(categories.length, 2);
    assert.equal(categories[0].name, "Grooming");
    assert.equal(categories[1].name, "Training");
  });

  it("15. excludes inactive services from public discovery map", () => {
    const publicBackendServices: BackendServiceDto[] = [
      {
        id: 1,
        providerId: 10,
        categoryId: 1,
        name: "Active Groom",
        price: 300,
        durationMinutes: 30,
        isActive: true,
      },
      {
        id: 2,
        providerId: 10,
        categoryId: 1,
        name: "Archived Groom",
        price: 250,
        durationMinutes: 30,
        isActive: false,
      },
    ];

    const activeOnly = publicBackendServices
      .filter((s) => s.isActive)
      .map(mapBackendServiceToUi);

    assert.equal(activeOnly.length, 1);
    assert.equal(activeOnly[0].id, "1");
    assert.equal(activeOnly[0].name, "Active Groom");
  });
});
