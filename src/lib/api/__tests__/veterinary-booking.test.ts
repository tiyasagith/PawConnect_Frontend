import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapVeterinarianAvailability,
  type BackendVeterinarianAvailability,
} from "../professional";
import {
  createBooking,
  cancelBooking,
  rescheduleBooking,
  type CreateBookingInput,
} from "../bookings";

describe("Phase 6 - Complete Veterinary Availability and Appointment Integration Tests", () => {
  describe("1. Veterinarian Weekly Availability Mapping & Configuration States", () => {
    it("correctly identifies unconfigured schedule and sets configured: false", () => {
      const unconfiguredBackend: BackendVeterinarianAvailability[] = [
        {
          id: 1,
          veterinarianId: 10,
          dayOfWeek: "MONDAY",
          startTime: "09:00:00",
          endTime: "17:00:00",
          slotDurationMinutes: 30,
          isAvailable: false,
          isConfigured: false,
        },
        {
          id: 2,
          veterinarianId: 10,
          dayOfWeek: "TUESDAY",
          startTime: "09:00:00",
          endTime: "17:00:00",
          slotDurationMinutes: 30,
          isAvailable: false,
          isConfigured: false,
        },
      ];

      const mapped = mapVeterinarianAvailability(unconfiguredBackend);
      assert.equal(mapped.configured, false);
      assert.equal(mapped.professionalId, "10");
      assert.equal(mapped.weeklySchedule.length, 7);
      // Days should be marked active: false
      const monday = mapped.weeklySchedule.find((d) => d.day === "Monday");
      assert.equal(monday?.active, false);
      assert.match(mapped.notes || "", /not yet configured/i);
    });

    it("correctly maps configured weekly schedule with customized operating hours and duration", () => {
      const configuredBackend: BackendVeterinarianAvailability[] = [
        {
          id: 10,
          veterinarianId: 5,
          dayOfWeek: "MONDAY",
          startTime: "08:30:00",
          endTime: "16:30:00",
          slotDurationMinutes: 45,
          isAvailable: true,
          isConfigured: true,
        },
        {
          id: 11,
          veterinarianId: 5,
          dayOfWeek: "WEDNESDAY",
          startTime: "10:00:00",
          endTime: "18:00:00",
          slotDurationMinutes: 30,
          isAvailable: true,
          isConfigured: true,
        },
        {
          id: 12,
          veterinarianId: 5,
          dayOfWeek: "SUNDAY",
          startTime: null,
          endTime: null,
          slotDurationMinutes: null,
          isAvailable: false,
          isConfigured: true,
        },
      ];

      const mapped = mapVeterinarianAvailability(configuredBackend);
      assert.equal(mapped.configured, true);
      assert.equal(mapped.professionalId, "5");

      const monday = mapped.weeklySchedule.find((d) => d.day === "Monday");
      assert.equal(monday?.active, true);
      assert.equal(monday?.startTime, "08:30");
      assert.equal(monday?.endTime, "16:30");
      assert.equal(monday?.slotDurationMinutes, 45);

      const wednesday = mapped.weeklySchedule.find((d) => d.day === "Wednesday");
      assert.equal(wednesday?.active, true);
      assert.equal(wednesday?.startTime, "10:00");
      assert.equal(wednesday?.endTime, "18:00");
      assert.equal(wednesday?.slotDurationMinutes, 30);

      const sunday = mapped.weeklySchedule.find((d) => d.day === "Sunday");
      assert.equal(sunday?.active, false);
    });

    it("handles completely empty availability array by returning 7 unconfigured days", () => {
      const mapped = mapVeterinarianAvailability([]);
      assert.equal(mapped.configured, false);
      assert.equal(mapped.professionalId, "");
      assert.equal(mapped.weeklySchedule.length, 7);
      assert.ok(mapped.weeklySchedule.every((d) => !d.active));
    });
  });

  describe("2. Veterinary Booking Creation & Numeric ID Validation", () => {
    it("rejects non-numeric veterinarian ID", async () => {
      const input: CreateBookingInput = {
        type: "veterinary",
        providerId: "vet_doctor_1",
        providerName: "Dr. Sarah",
        providerTitle: "DVM",
        serviceId: "clinical-consultation",
        serviceTitle: "Comprehensive Examination",
        petId: "10",
        petName: "Max",
        petBreed: "Golden Retriever",
        date: "2026-11-10",
        time: "10:00 AM",
        durationMinutes: 30,
        price: 150,
        location: "Central Animal Hospital",
      };

      await assert.rejects(
        () => createBooking(input),
        /A valid provider must be selected for booking/
      );
    });

    it("rejects non-numeric pet ID", async () => {
      const input: CreateBookingInput = {
        type: "veterinary",
        providerId: "5",
        providerName: "Dr. Sarah",
        providerTitle: "DVM",
        serviceId: "clinical-consultation",
        serviceTitle: "Comprehensive Examination",
        petId: "pet-abc",
        petName: "Max",
        petBreed: "Golden Retriever",
        date: "2026-11-10",
        time: "10:00 AM",
        durationMinutes: 30,
        price: 150,
        location: "Central Animal Hospital",
      };

      await assert.rejects(
        () => createBooking(input),
        /A valid pet must be selected for booking/
      );
    });

    it("rejects empty or invalid booking date", async () => {
      const input: CreateBookingInput = {
        type: "veterinary",
        providerId: "5",
        providerName: "Dr. Sarah",
        providerTitle: "DVM",
        serviceId: "clinical-consultation",
        serviceTitle: "Comprehensive Examination",
        petId: "12",
        petName: "Max",
        petBreed: "Golden Retriever",
        date: "",
        time: "10:00 AM",
        durationMinutes: 30,
        price: 150,
        location: "Central Animal Hospital",
      };

      await assert.rejects(
        () => createBooking(input),
        /A valid booking date is required/
      );
    });

    it("rejects invalid appointment time format", async () => {
      const input: CreateBookingInput = {
        type: "veterinary",
        providerId: "5",
        providerName: "Dr. Sarah",
        providerTitle: "DVM",
        serviceId: "clinical-consultation",
        serviceTitle: "Comprehensive Examination",
        petId: "12",
        petName: "Max",
        petBreed: "Golden Retriever",
        date: "2026-11-10",
        time: "noon-ish",
        durationMinutes: 30,
        price: 150,
        location: "Central Animal Hospital",
      };

      await assert.rejects(
        () => createBooking(input),
        /Invalid booking time format/
      );
    });
  });

  describe("3. Cancellation & Unsupported Reschedule Action", () => {
    it("rejects non-numeric booking ID on cancel", async () => {
      await assert.rejects(
        () => cancelBooking("booking_invalid_id"),
        /A valid numeric booking ID is required to cancel/
      );
    });

    it("explicitly rejects rescheduling with guidance to cancel and rebook", async () => {
      await assert.rejects(
        () => rescheduleBooking("12", "2026-11-12", "11:00 AM"),
        /Rescheduling is not supported directly\. Please cancel this appointment and reserve a new available time slot\./
      );
    });
  });
});
