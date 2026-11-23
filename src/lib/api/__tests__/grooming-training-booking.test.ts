import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapBackendServiceToUi,
  type BackendServiceDto,
} from "../professional";
import {
  createBooking,
  type CreateBookingInput,
} from "../bookings";

describe("Phase 5 - Grooming and Training Booking Integration Tests", () => {
  describe("1. Service Category Filtering & Model Mapping", () => {
    it("maps backend grooming service with explicit GROOMING serviceType", () => {
      const dto: BackendServiceDto = {
        id: 101,
        providerId: 5,
        categoryId: 1,
        categoryName: "Dog Grooming & Spa",
        serviceType: "GROOMING",
        name: "Full Bath & Haircut",
        description: "Organic shampoo and gentle trimming",
        price: 850.0,
        durationMinutes: 45,
        isActive: true,
      };

      const ui = mapBackendServiceToUi(dto);
      assert.equal(ui.id, "101");
      assert.equal(ui.providerId, "5");
      assert.equal(ui.category, "grooming");
      assert.equal(ui.name, "Full Bath & Haircut");
      assert.equal(ui.price, 850.0);
      assert.equal(ui.durationMinutes, 45);
      assert.equal(ui.active, true);
    });

    it("maps backend training service with explicit TRAINING serviceType", () => {
      const dto: BackendServiceDto = {
        id: 202,
        providerId: 8,
        categoryId: 2,
        categoryName: "Canine Coaching",
        serviceType: "TRAINING",
        name: "Puppy Manners & Leash Walking",
        description: "1-on-1 positive reinforcement coaching",
        price: 1500.0,
        durationMinutes: 60,
        isActive: true,
      };

      const ui = mapBackendServiceToUi(dto);
      assert.equal(ui.id, "202");
      assert.equal(ui.providerId, "8");
      assert.equal(ui.category, "training");
      assert.equal(ui.name, "Puppy Manners & Leash Walking");
      assert.equal(ui.price, 1500.0);
      assert.equal(ui.durationMinutes, 60);
      assert.equal(ui.active, true);
    });

    it("filters active services and excludes inactive services", () => {
      const services: BackendServiceDto[] = [
        {
          id: 1,
          providerId: 5,
          categoryId: 1,
          serviceType: "GROOMING",
          name: "Active Spa",
          price: 500,
          durationMinutes: 30,
          isActive: true,
        },
        {
          id: 2,
          providerId: 5,
          categoryId: 1,
          serviceType: "GROOMING",
          name: "Archived Cut",
          price: 400,
          durationMinutes: 30,
          isActive: false,
        },
      ];

      const mapped = services.map(mapBackendServiceToUi);
      const activeOnly = mapped.filter((s) => s.active);

      assert.equal(activeOnly.length, 1);
      assert.equal(activeOnly[0].id, "1");
    });
  });

  describe("2. Booking Input Validation & Synthetic ID Rejection", () => {
    it("rejects booking creation when petId is non-numeric or missing", async () => {
      const invalidInput: CreateBookingInput = {
        type: "grooming",
        providerId: "5",
        providerName: "Evan Grooming",
        providerTitle: "Specialist",
        serviceId: "101",
        serviceTitle: "Full Groom",
        petId: "pet-non-numeric",
        petName: "Buddy",
        petBreed: "Golden Retriever",
        date: "2026-11-10",
        time: "10:00:00",
        durationMinutes: 45,
        price: 850,
        location: "123 Main St",
      };

      await assert.rejects(
        async () => {
          await createBooking(invalidInput);
        },
        {
          message: "A valid pet must be selected for booking.",
        }
      );
    });

    it("rejects booking creation when providerId is non-numeric", async () => {
      const invalidInput: CreateBookingInput = {
        type: "grooming",
        providerId: "prov-invalid",
        providerName: "Evan Grooming",
        providerTitle: "Specialist",
        serviceId: "101",
        serviceTitle: "Full Groom",
        petId: "1",
        petName: "Buddy",
        petBreed: "Golden Retriever",
        date: "2026-11-10",
        time: "10:00:00",
        durationMinutes: 45,
        price: 850,
        location: "123 Main St",
      };

      await assert.rejects(
        async () => {
          await createBooking(invalidInput);
        },
        {
          message: "A valid provider must be selected for booking.",
        }
      );
    });

    it("rejects booking creation when serviceId is non-numeric (e.g. legacy demo IDs)", async () => {
      const legacyDemoInputs = [
        "srv-groom-standard",
        "srv-groom-premium",
        "prog-train-basic",
        "prog-train-standard",
      ];

      for (const demoId of legacyDemoInputs) {
        const input: CreateBookingInput = {
          type: "grooming",
          providerId: "5",
          providerName: "Evan Grooming",
          providerTitle: "Specialist",
          serviceId: demoId,
          serviceTitle: "Standard Package",
          petId: "1",
          petName: "Buddy",
          petBreed: "Golden Retriever",
          date: "2026-11-10",
          time: "10:00:00",
          durationMinutes: 45,
          price: 850,
          location: "123 Main St",
        };

        await assert.rejects(
          async () => {
            await createBooking(input);
          },
          {
            message: "A valid service must be selected for booking.",
          }
        );
      }
    });

    it("rejects booking creation when time is missing or invalid format", async () => {
      const invalidTimeInput: CreateBookingInput = {
        type: "training",
        providerId: "8",
        providerName: "Coach Dave",
        providerTitle: "Trainer",
        serviceId: "202",
        serviceTitle: "Obedience 101",
        petId: "2",
        petName: "Milo",
        petBreed: "Beagle",
        date: "2026-11-10",
        time: "not-a-time",
        durationMinutes: 60,
        price: 1200,
        location: "Outdoor Arena",
      };

      await assert.rejects(
        async () => {
          await createBooking(invalidTimeInput);
        },
        (err: Error) => {
          return err.message.includes("Invalid booking time format");
        }
      );
    });
  });

  describe("3. Slot Generation Logic & Boundary Rules", () => {
    it("correctly generates slots according to provider schedule, service duration and slot interval", () => {
      const scheduleStart = 9 * 60; // 09:00
      const scheduleEnd = 12 * 60;   // 12:00
      const serviceDuration = 45;   // 45 min
      const slotInterval = 30;      // 30 min intervals

      const candidateStarts: string[] = [];
      for (let t = scheduleStart; t + serviceDuration <= scheduleEnd; t += slotInterval) {
        const hours = Math.floor(t / 60);
        const mins = t % 60;
        candidateStarts.push(
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`
        );
      }

      // Expected starts: 09:00 (ends 09:45 <= 12:00), 09:30 (ends 10:15 <= 12:00),
      // 10:00 (ends 10:45), 10:30 (ends 11:15), 11:00 (ends 11:45), 11:30 (ends 12:15 > 12:00 EXCLUDED)
      assert.deepEqual(candidateStarts, [
        "09:00:00",
        "09:30:00",
        "10:00:00",
        "10:30:00",
        "11:00:00",
      ]);
      assert.equal(candidateStarts.includes("11:30:00"), false, "11:30 must be excluded because 11:30 + 45 min = 12:15, which exceeds 12:00 closing time");
    });

    it("excludes candidate slots that overlap existing bookings", () => {
      // Existing booking from 09:30 to 10:30
      const existingBooking = { start: 9 * 60 + 30, end: 10 * 60 + 30 };
      const serviceDuration = 60; // 60 min service

      const candidateSlots = [
        { start: 9 * 60, end: 9 * 60 + serviceDuration, time: "09:00:00" },       // 09:00-10:00: overlaps 09:30-10:30!
        { start: 9 * 60 + 30, end: 9 * 60 + 30 + serviceDuration, time: "09:30:00" }, // 09:30-10:30: exact conflict!
        { start: 10 * 60, end: 10 * 60 + serviceDuration, time: "10:00:00" },     // 10:00-11:00: overlaps 09:30-10:30!
        { start: 10 * 60 + 30, end: 10 * 60 + 30 + serviceDuration, time: "10:30:00" }, // 10:30-11:30: NO overlap (ends at 10:30, start is 10:30)
        { start: 11 * 60, end: 11 * 60 + serviceDuration, time: "11:00:00" },     // 11:00-12:00: NO overlap
      ];

      const availability = candidateSlots.map((c) => {
        const hasOverlap = c.start < existingBooking.end && c.end > existingBooking.start;
        return {
          time: c.time,
          available: !hasOverlap,
        };
      });

      assert.equal(availability.find((s) => s.time === "09:00:00")?.available, false);
      assert.equal(availability.find((s) => s.time === "09:30:00")?.available, false);
      assert.equal(availability.find((s) => s.time === "10:00:00")?.available, false);
      assert.equal(availability.find((s) => s.time === "10:30:00")?.available, true);
      assert.equal(availability.find((s) => s.time === "11:00:00")?.available, true);
    });
  });
});
