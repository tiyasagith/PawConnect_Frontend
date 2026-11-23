"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  RotateCcw,
  Copy,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfessionalAvailability, DaySchedule } from "@/lib/mock/professionals";

interface DayErrors {
  startTime?: string;
  endTime?: string;
  slotDuration?: string;
  general?: string;
}

interface ProviderAvailabilityEditorProps {
  availability: ProfessionalAvailability;
  onUpdateSchedule: (schedule: DaySchedule[], notes?: string) => Promise<void> | void;
  isUpdating?: boolean;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes (Express bath / Triage)" },
  { value: "30", label: "30 minutes (Standard grooming / Check)" },
  { value: "45", label: "45 minutes (Comprehensive session)" },
  { value: "60", label: "60 minutes (Full styling / Training lesson)" },
  { value: "90", label: "90 minutes (Full spa & coat styling)" },
  { value: "120", label: "120 minutes (Intensive / Behavior session)" },
];

export function ProviderAvailabilityEditor({
  availability,
  onUpdateSchedule,
  isUpdating = false,
}: ProviderAvailabilityEditorProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() =>
    availability.weeklySchedule.map((d) => ({ ...d }))
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, DayErrors>>({});
  const [rootError, setRootError] = useState<string | null>(null);

  // Sync state whenever external availability data changes (e.g. after refetch)
  useEffect(() => {
    setSchedule(availability.weeklySchedule.map((d) => ({ ...d })));
    setFieldErrors({});
    setRootError(null);
  }, [availability]);

  // Check for unsaved changes against initial loaded availability
  const hasUnsavedChanges = useMemo(() => {
    if (schedule.length !== availability.weeklySchedule.length) return true;
    return schedule.some((day, idx) => {
      const original = availability.weeklySchedule[idx];
      if (!original) return true;
      return (
        day.active !== original.active ||
        day.startTime !== original.startTime ||
        day.endTime !== original.endTime ||
        day.slotDurationMinutes !== original.slotDurationMinutes
      );
    });
  }, [schedule, availability.weeklySchedule]);

  const handleToggleDay = (dayName: string, active: boolean) => {
    setRootError(null);
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayName) return d;
        return {
          ...d,
          active,
          // When turning on from an empty state, keep user in control of entering times
          startTime: active ? (d.startTime || "") : "",
          endTime: active ? (d.endTime || "") : "",
          slotDurationMinutes: active ? (d.slotDurationMinutes || 0) : 0,
        };
      })
    );
    // Clear validation errors for this day when toggled
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[dayName];
      return next;
    });
  };

  const handleTimeChange = (
    dayName: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setRootError(null);
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayName ? { ...d, [field]: value } : d))
    );
    // Clear field-level error
    setFieldErrors((prev) => {
      if (!prev[dayName]) return prev;
      const nextDay = { ...prev[dayName] };
      delete nextDay[field];
      delete nextDay.general;
      return { ...prev, [dayName]: nextDay };
    });
  };

  const handleDurationChange = (dayName: string, minutes: number) => {
    setRootError(null);
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === dayName ? { ...d, slotDurationMinutes: minutes } : d
      )
    );
    setFieldErrors((prev) => {
      if (!prev[dayName]) return prev;
      const nextDay = { ...prev[dayName] };
      delete nextDay.slotDuration;
      return { ...prev, [dayName]: nextDay };
    });
  };

  const handleReset = () => {
    setSchedule(availability.weeklySchedule.map((d) => ({ ...d })));
    setFieldErrors({});
    setRootError(null);
  };

  const handleCopyMondayToWeekdays = () => {
    const monday = schedule.find((d) => d.day === "Monday");
    if (!monday || !monday.active) {
      setRootError("Please configure and enable Monday first to copy hours to weekdays.");
      return;
    }
    if (!monday.startTime || !monday.endTime || !monday.slotDurationMinutes) {
      setRootError("Please set Monday's start time, end time, and slot duration first.");
      return;
    }

    const weekdays = ["Tuesday", "Wednesday", "Thursday", "Friday"];
    setSchedule((prev) =>
      prev.map((d) => {
        if (!weekdays.includes(d.day)) return d;
        return {
          ...d,
          active: true,
          startTime: monday.startTime,
          endTime: monday.endTime,
          slotDurationMinutes: monday.slotDurationMinutes,
        };
      })
    );
    setRootError(null);
    // Clear errors for weekdays
    setFieldErrors((prev) => {
      const next = { ...prev };
      weekdays.forEach((day) => delete next[day]);
      return next;
    });
  };

  const validateSchedule = (): boolean => {
    const errors: Record<string, DayErrors> = {};
    let isValid = true;

    schedule.forEach((day) => {
      if (!day.active) return; // Unavailable days don't require working hours

      const dayErr: DayErrors = {};

      if (!day.startTime || day.startTime.trim() === "") {
        dayErr.startTime = "Start time is required";
        isValid = false;
      }
      if (!day.endTime || day.endTime.trim() === "") {
        dayErr.endTime = "End time is required";
        isValid = false;
      }
      if (day.startTime && day.endTime && day.startTime >= day.endTime) {
        dayErr.endTime = "End time must be after start time";
        isValid = false;
      }
      if (
        !day.slotDurationMinutes ||
        day.slotDurationMinutes < 10 ||
        day.slotDurationMinutes > 180
      ) {
        dayErr.slotDuration = "Select a valid slot interval (15-120 min)";
        isValid = false;
      }

      if (Object.keys(dayErr).length > 0) {
        errors[day.day] = dayErr;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRootError(null);

    const valid = validateSchedule();
    if (!valid) {
      setRootError("Please fix the validation errors on your active days before saving.");
      return;
    }

    try {
      await onUpdateSchedule(schedule);
      setFieldErrors({});
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to persist availability schedule. Please review your time ranges and retry.";
      setRootError(message);
    }
  };

  const isConfigured = Boolean(availability.configured);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configuration Status Banner */}
      {!isConfigured ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Weekly Schedule Not Configured
              </h3>
              <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                You must explicitly configure your operating hours and slot duration for each
                day you accept appointments. Until a schedule is saved, customers cannot discover
                or book your grooming or training services.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Schedule Active & Synchronized with Customer Booking Engine</span>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10 text-[11px]">
              Unsaved Changes Pending
            </Badge>
          )}
        </div>
      )}

      {/* Global Error Banner */}
      {rootError && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-4 text-xs text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Unable to Save Schedule</p>
            <p>{rootError}</p>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span>Configure working hours for all 7 weekdays. Disabled days are treated as off-duty.</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMondayToWeekdays}
            className="rounded-xl text-xs h-9 gap-1.5"
            title="Copy Monday's start/end time and slot interval to Tuesday through Friday"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden md:inline">Copy Monday to Weekdays</span>
            <span className="md:hidden">Copy Mon</span>
          </Button>

          {hasUnsavedChanges && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isUpdating}
              className="rounded-xl text-xs h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isUpdating || (!hasUnsavedChanges && isConfigured)}
            className="rounded-xl text-xs h-9 font-semibold gap-1.5 px-4 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {isUpdating ? "Saving Schedule..." : "Save Weekly Schedule"}
          </Button>
        </div>
      </div>

      {/* 7-Day Configuration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((day) => {
          const errors = fieldErrors[day.day] || {};
          const isDayActive = day.active;

          return (
            <div
              key={day.day}
              className={cn(
                "rounded-2xl border p-5 transition-[border-color,box-shadow,opacity] duration-200 flex flex-col justify-between space-y-4 shadow-2xs",
                isDayActive
                  ? "bg-card border-border/80 hover:border-primary/40 hover:shadow-xs"
                  : "bg-surface/50 border-border/50 opacity-70"
              )}
            >
              <div className="space-y-4">
                {/* Header: Day Name + Available Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground text-sm">{day.day}</span>
                    <p className="text-[11px] text-muted-foreground">
                      {isDayActive ? "Accepts bookings" : "Off duty / closed"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isDayActive}
                      onCheckedChange={(checked) => handleToggleDay(day.day, checked)}
                      id={`toggle-${day.day}`}
                      aria-label={`Toggle availability for ${day.day}`}
                    />
                  </div>
                </div>

                {/* Day Configuration Inputs */}
                {isDayActive ? (
                  <div className="space-y-3.5 pt-1">
                    {/* Time Window Inputs */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label
                          htmlFor={`start-${day.day}`}
                          className="text-[11px] font-semibold text-muted-foreground block"
                        >
                          Start Time *
                        </label>
                        <input
                          id={`start-${day.day}`}
                          type="time"
                          value={day.startTime}
                          onChange={(e) =>
                            handleTimeChange(day.day, "startTime", e.target.value)
                          }
                          className={cn(
                            "w-full rounded-xl border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors h-9",
                            errors.startTime
                              ? "border-destructive focus:ring-destructive/30"
                              : "border-input"
                          )}
                        />
                        {errors.startTime && (
                          <p className="text-[10px] text-destructive leading-tight">
                            {errors.startTime}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor={`end-${day.day}`}
                          className="text-[11px] font-semibold text-muted-foreground block"
                        >
                          End Time *
                        </label>
                        <input
                          id={`end-${day.day}`}
                          type="time"
                          value={day.endTime}
                          onChange={(e) =>
                            handleTimeChange(day.day, "endTime", e.target.value)
                          }
                          className={cn(
                            "w-full rounded-xl border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors h-9",
                            errors.endTime
                              ? "border-destructive focus:ring-destructive/30"
                              : "border-input"
                          )}
                        />
                        {errors.endTime && (
                          <p className="text-[10px] text-destructive leading-tight">
                            {errors.endTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Slot Duration Select */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground block">
                        Slot Interval *
                      </label>
                      <Select
                        value={day.slotDurationMinutes ? String(day.slotDurationMinutes) : ""}
                        onValueChange={(val) => handleDurationChange(day.day, Number(val))}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full rounded-xl h-9 text-xs",
                            errors.slotDuration && "border-destructive focus:ring-destructive/30"
                          )}
                        >
                          <SelectValue placeholder="Select interval..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.slotDuration && (
                        <p className="text-[10px] text-destructive leading-tight">
                          {errors.slotDuration}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      No bookable slots
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Toggle switch above to enable working hours on {day.day}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Status:</span>
                {isDayActive ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {day.startTime && day.endTime
                      ? `${day.startTime} – ${day.endTime} (${day.slotDurationMinutes || 0}m)`
                      : "Configuring..."}
                  </span>
                ) : (
                  <span className="text-muted-foreground/80 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Help Note */}
      <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-xs text-muted-foreground flex items-center gap-2.5">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        <span>
          Customer appointment bookings are automatically aligned to your slot intervals. For
          services longer than your interval, multiple adjacent slots will be reserved in one
          continuous block.
        </span>
      </div>
    </form>
  );
}
