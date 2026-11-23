"use client";

import React from "react";
import {
  useProfessionalAvailability,
  useUpdateProfessionalAvailability,
} from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { ProviderAvailabilityEditor } from "@/components/professional/provider-availability-editor";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";
import type { DaySchedule } from "@/lib/mock/professionals";

export function ProviderAvailabilityClient() {
  const { data: availability, isLoading, isError, refetch } =
    useProfessionalAvailability("provider");
  const { mutateAsync: updateSchedule, isPending: isUpdating } =
    useUpdateProfessionalAvailability("provider");

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="list" count={7} message="Loading provider working schedule..." />
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
        description: "Your weekly working hours and slot intervals have been saved.",
      });
      await refetch();
    } catch (error: unknown) {
      toast.error("Update Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Could not save schedule changes. Please retry.",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Provider Working Hours & Availability"
        description="Set your daily spa opening times, canine training session windows, and slot durations."
      />

      <ProviderAvailabilityEditor
        availability={availability}
        onUpdateSchedule={handleUpdateSchedule}
        isUpdating={isUpdating}
      />
    </div>
  );
}
