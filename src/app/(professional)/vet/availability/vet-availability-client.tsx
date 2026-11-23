"use client";

import React from "react";
import {
  useProfessionalAvailability,
  useUpdateProfessionalAvailability,
} from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { AvailabilityEditor } from "@/components/professional/availability-editor";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import { AlertCircle } from "lucide-react";
import type { DaySchedule } from "@/lib/mock/professionals";

export function VetAvailabilityClient() {
  const { data: availability, isLoading, isError, refetch } =
    useProfessionalAvailability("vet");
  const { mutateAsync: updateSchedule, isPending: isUpdating } =
    useUpdateProfessionalAvailability("vet");

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="list" count={7} message="Loading practitioner duty schedule..." />
      </div>
    );
  }

  if (isError || !availability) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load availability"
          description="Encountered an issue retrieving your operational schedule. Please retry."
          action={
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const handleUpdateSchedule = async (schedule: DaySchedule[], notes?: string) => {
    try {
      await updateSchedule({ schedule, notes });
      toast.success("Schedule Updated", {
        description: "Your bookable clinical consult windows have been synchronized.",
      });
    } catch (error: unknown) {
      toast.error("Update Failed", {
        description:
          error instanceof Error ? error.message : "Could not save schedule changes. Please retry.",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Clinical Availability & Hours"
        description="Define operational duty days, daily start/end working hours, and client appointment slot lengths."
      />

      {!availability.configured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">Schedule Not Yet Configured</p>
            <p className="leading-relaxed">
              You have not published your clinical duty hours. Configure and save your working days and appointment slot lengths below to enable patient bookings.
            </p>
          </div>
        </div>
      )}

      <AvailabilityEditor
        availability={availability}
        onUpdateSchedule={handleUpdateSchedule}
        isUpdating={isUpdating}
      />
    </div>
  );
}
