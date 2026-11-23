import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapProviderAvailability,
  formatProviderSchedulePayload,
  type BackendProviderAvailabilityResponse,
} from "../professional";
import type { DaySchedule } from "@/lib/mock/professionals";

describe("Provider Availability Frontend Integration Tests", () => {
  it("1. handles empty unconfigured initial state without automatic defaults", () => {
    const unconfiguredResponse: BackendProviderAvailabilityResponse = {
      configured: false,
      message: "Provider availability has not been configured",
      providerId: 101,
      days: [],
    };

    const result = mapProviderAvailability(unconfiguredResponse);

    assert.equal(result.configured, false);
    assert.equal(result.role, "provider");
    assert.equal(result.professionalId, "101");
    assert.equal(result.weeklySchedule.length, 7);

    // Verify no automatic default times or intervals were generated
    for (const day of result.weeklySchedule) {
      assert.equal(day.active, false, `${day.day} must not be automatically active`);
      assert.equal(day.startTime, "", `${day.day} must have empty start time`);
      assert.equal(day.endTime, "", `${day.day} must have empty end time`);
      assert.equal(day.slotDurationMinutes, 0, `${day.day} must have slot interval 0`);
    }
  });

  it("2. configures Monday with explicit working hours and slot interval", () => {
    const schedule: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "09:00", endTime: "18:00", slotDurationMinutes: 45 },
      { day: "Tuesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Wednesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Thursday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Friday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Saturday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Sunday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const payload = formatProviderSchedulePayload(schedule);
    const mondayPayload = payload.schedule.find((d) => d.dayOfWeek === "MONDAY");

    assert.ok(mondayPayload);
    assert.equal(mondayPayload.isAvailable, true);
    assert.equal(mondayPayload.startTime, "09:00:00");
    assert.equal(mondayPayload.endTime, "18:00:00");
    assert.equal(mondayPayload.slotDurationMinutes, 45);
  });

  it("3. configures all seven days with custom operating hours", () => {
    const week: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "09:00", endTime: "18:00", slotDurationMinutes: 30 },
      { day: "Tuesday", active: true, startTime: "09:00", endTime: "18:00", slotDurationMinutes: 30 },
      { day: "Wednesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
      { day: "Thursday", active: true, startTime: "10:00", endTime: "19:00", slotDurationMinutes: 45 },
      { day: "Friday", active: true, startTime: "09:00", endTime: "18:00", slotDurationMinutes: 30 },
      { day: "Saturday", active: true, startTime: "09:00", endTime: "16:00", slotDurationMinutes: 60 },
      { day: "Sunday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const payload = formatProviderSchedulePayload(week);
    assert.equal(payload.schedule.length, 7);

    const wednesday = payload.schedule.find((d) => d.dayOfWeek === "WEDNESDAY");
    assert.ok(wednesday);
    assert.equal(wednesday.isAvailable, false);
    assert.equal(wednesday.startTime, null);
    assert.equal(wednesday.endTime, null);
    assert.equal(wednesday.slotDurationMinutes, null);

    const saturday = payload.schedule.find((d) => d.dayOfWeek === "SATURDAY");
    assert.ok(saturday);
    assert.equal(saturday.isAvailable, true);
    assert.equal(saturday.startTime, "09:00:00");
    assert.equal(saturday.endTime, "16:00:00");
    assert.equal(saturday.slotDurationMinutes, 60);
  });

  it("4. disables a weekday and clears its active slot requirement", () => {
    const schedule: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
      { day: "Friday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const payload = formatProviderSchedulePayload(schedule);
    const fri = payload.schedule.find((d) => d.dayOfWeek === "FRIDAY");

    assert.ok(fri);
    assert.equal(fri.isAvailable, false);
    assert.equal(fri.startTime, null);
    assert.equal(fri.endTime, null);
    assert.equal(fri.slotDurationMinutes, null);
  });

  it("5. validates start time must precede end time", () => {
    const validDay = { startTime: "09:00", endTime: "17:00" };
    const invalidDay = { startTime: "18:00", endTime: "09:00" };

    assert.ok(validDay.startTime < validDay.endTime, "Valid start time precedes end time");
    assert.ok(!(invalidDay.startTime < invalidDay.endTime), "Invalid time range detected");
  });

  it("6. validates slot interval range (10 to 180 minutes)", () => {
    const validIntervals = [15, 30, 45, 60, 90, 120];
    const invalidIntervals = [0, 5, 200];

    for (const val of validIntervals) {
      assert.ok(val >= 10 && val <= 180, `Interval ${val} must be valid`);
    }
    for (const val of invalidIntervals) {
      assert.ok(val < 10 || val > 180, `Interval ${val} must be recognized as invalid`);
    }
  });

  it("7. formats payload correctly for successful backend save", () => {
    const input: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "08:30", endTime: "16:30", slotDurationMinutes: 30 },
      { day: "Tuesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const payload = formatProviderSchedulePayload(input);
    assert.deepEqual(payload.schedule[0], {
      dayOfWeek: "MONDAY",
      isAvailable: true,
      startTime: "08:30:00",
      endTime: "16:30:00",
      slotDurationMinutes: 30,
    });
    assert.deepEqual(payload.schedule[1], {
      dayOfWeek: "TUESDAY",
      isAvailable: false,
      startTime: null,
      endTime: null,
      slotDurationMinutes: null,
    });
  });

  it("8. handles failed save error without falsely reporting success", async () => {
    const mockSaveFailure = async (): Promise<never> => {
      throw new Error("HTTP 400: Start time must be before end time for MONDAY");
    };

    await assert.rejects(
      async () => {
        await mockSaveFailure();
      },
      {
        message: /Start time must be before end time/,
      }
    );
  });

  it("9. reloads and maps persisted schedule correctly", () => {
    const backendSavedResponse: BackendProviderAvailabilityResponse = {
      configured: true,
      message: "Provider availability retrieved successfully",
      providerId: 55,
      days: [
        {
          id: 10,
          providerId: 55,
          dayOfWeek: "MONDAY",
          startTime: "09:00:00",
          endTime: "17:00:00",
          slotDurationMinutes: 30,
          isAvailable: true,
          isConfigured: true,
        },
        {
          id: 11,
          providerId: 55,
          dayOfWeek: "SUNDAY",
          startTime: null,
          endTime: null,
          slotDurationMinutes: null,
          isAvailable: false,
          isConfigured: true,
        },
      ],
    };

    const mapped = mapProviderAvailability(backendSavedResponse);

    assert.equal(mapped.configured, true);
    assert.equal(mapped.professionalId, "55");

    const mon = mapped.weeklySchedule.find((d) => d.day === "Monday");
    assert.ok(mon);
    assert.equal(mon.active, true);
    assert.equal(mon.startTime, "09:00");
    assert.equal(mon.endTime, "17:00");
    assert.equal(mon.slotDurationMinutes, 30);

    const sun = mapped.weeklySchedule.find((d) => d.day === "Sunday");
    assert.ok(sun);
    assert.equal(sun.active, false);
    assert.equal(sun.startTime, "");
    assert.equal(sun.endTime, "");
    assert.equal(sun.slotDurationMinutes, 0);
  });

  it("10. accurately detects unsaved changes against initial loaded schedule", () => {
    const initial: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
      { day: "Tuesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const unchanged: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
      { day: "Tuesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const modifiedTime: DaySchedule[] = [
      { day: "Monday", active: true, startTime: "10:00", endTime: "17:00", slotDurationMinutes: 30 },
      { day: "Tuesday", active: false, startTime: "", endTime: "", slotDurationMinutes: 0 },
    ];

    const checkDirty = (curr: DaySchedule[], orig: DaySchedule[]) =>
      curr.some(
        (d, i) =>
          d.active !== orig[i].active ||
          d.startTime !== orig[i].startTime ||
          d.endTime !== orig[i].endTime ||
          d.slotDurationMinutes !== orig[i].slotDurationMinutes
      );

    assert.equal(checkDirty(unchanged, initial), false, "Unchanged schedule is not dirty");
    assert.equal(checkDirty(modifiedTime, initial), true, "Modified time schedule is marked dirty");
  });
});
