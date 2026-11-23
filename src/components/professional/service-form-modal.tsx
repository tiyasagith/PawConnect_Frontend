"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormModal } from "@/components/shared/form-shells";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { applyServerErrors } from "@/lib/utils/form-errors";
import { ServiceImageGallery } from "@/components/professional/service-image-gallery";
import type { ProviderService } from "@/lib/mock/professionals";
import { cn } from "@/lib/utils";

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(200, "Service name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters"),
  price: z
    .number({ message: "Price is required and must be a valid amount" })
    .min(0, "Price cannot be negative")
    .max(100000, "Price cannot exceed ₹1,00,000"),
  durationMinutes: z
    .number({ message: "Duration is required" })
    .int("Duration must be a whole number of minutes")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration cannot exceed 480 minutes (8 hours)"),
  active: z.boolean(),
  imageUrls: z.array(z.string()).max(10),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ProviderService | null;
  onSubmit: (data: ServiceFormData) => Promise<void> | void;
  loading?: boolean;
}

export function ServiceFormModal({
  open,
  onOpenChange,
  service,
  onSubmit,
  loading = false,
}: ServiceFormModalProps) {
  const isEdit = Boolean(service);
  const [rootError, setRootError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined as unknown as number,
      durationMinutes: undefined as unknown as number,
      active: true,
      imageUrls: [],
    },
  });

  const isActive = useWatch({ control, name: "active" });
  const imageUrls = useWatch({ control, name: "imageUrls" }) || [];

  useEffect(() => {
    if (open) {
      setRootError(null);
      if (service) {
        reset({
          name: service.name || "",
          description: service.description || "",
          price: service.price !== undefined ? Number(service.price) : (undefined as unknown as number),
          durationMinutes: service.durationMinutes !== undefined ? Number(service.durationMinutes) : (undefined as unknown as number),
          active: service.active ?? true,
          imageUrls: service.imageUrls?.length ? service.imageUrls : service.imageUrl ? [service.imageUrl] : [],
        });
      } else {
        // Price and duration start completely empty; no defaults
        reset({
          name: "",
          description: "",
          price: undefined as unknown as number,
          durationMinutes: undefined as unknown as number,
          active: true,
          imageUrls: [],
        });
      }
    }
  }, [open, service, reset]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    setRootError(null);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = applyServerErrors(err, setError, "Unable to save service. Please review the highlighted fields.");
      if (msg) {
        setRootError(msg);
      }
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Service Offering" : "Add New Service Offering"}
      description="Configure package details, duration, pricing, and active booking availability."
      onSubmit={() => {
        void handleSubmit(handleFormSubmit)();
      }}
      loading={loading}
      submitDisabled={uploadingImages}
      cancelDisabled={uploadingImages}
      submitLabel={isEdit ? "Save Changes" : "Create Service"}
    >
      <div className="space-y-4 pt-1 max-h-[70vh] overflow-y-auto pr-1">
        {rootError && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-3.5 text-xs text-destructive border border-destructive/20 mb-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Unable to Save Service</p>
              <p>{rootError}</p>
            </div>
          </div>
        )}

        <Input
          label="Service Name *"
          placeholder="e.g. Hydro-Therapy De-Shedding Bath"
          error={errors.name?.message}
          {...register("name")}
          className="rounded-xl h-10 text-xs"
        />

          <Input
            label="Price (₹ INR) *"
            type="number"
            min={0}
            step="1"
            placeholder="Enter service price..."
            error={errors.price?.message}
            {...register("price", { valueAsNumber: true })}
            className="rounded-xl h-10 text-xs"
          />

        <Input
          label="Estimated Duration (Minutes) *"
          type="number"
          min={5}
          max={480}
          step="5"
          placeholder="e.g. 45"
          error={errors.durationMinutes?.message}
          {...register("durationMinutes", { valueAsNumber: true })}
          className="rounded-xl h-10 text-xs"
        />

        <Textarea
          label="Service Description"
          rows={3}
          placeholder="Describe what is included in this session, suitable breeds, and techniques used..."
          error={errors.description?.message}
          {...register("description")}
          className="rounded-xl text-xs leading-relaxed"
        />

        <ServiceImageGallery
          images={imageUrls}
          disabled={loading}
          onUploadingChange={setUploadingImages}
          onChange={(urls) => setValue("imageUrls", urls, { shouldValidate: true, shouldDirty: true })}
        />

        {/* Active Availability Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/50">
          <div>
            <p className="text-xs font-bold text-foreground">Active for Client Booking</p>
            <p className="text-[11px] text-muted-foreground">
              When inactive, clients cannot book new sessions for this service
            </p>
          </div>
          <button
            type="button"
            onClick={() => setValue("active", !isActive)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5",
              isActive ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full bg-white transition-transform shadow-xs",
                isActive ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </FormModal>
  );
}
