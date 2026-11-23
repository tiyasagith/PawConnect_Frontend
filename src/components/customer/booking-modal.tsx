"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  usePets,
  useCreateBooking,
  useVeterinarianSlots,
  usePublicProviderServices,
  usePublicProviderSlots,
} from "@/lib/api/hooks";
import type { CustomerBooking } from "@/lib/mock/bookings";
import { getBusinessToday, parseDateOnly } from "@/lib/utils/date";
import { showSuccess, showError, toast } from "@/lib/utils/toast";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModal } from "@/stores/auth-modal.store";
import {
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Scissors,
  Award,
  CreditCard,
  Loader2,
} from "lucide-react";

export interface BookingModalProvider {
  id: string;
  name: string;
  title: string;
  clinicOrBusiness: string;
  image: string;
  feeOrRate: number;
  feeLabel?: string;
  location: string;
}

export interface BookingModalService {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
  imageUrls?: string[];
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "veterinary" | "grooming" | "training";
  provider: BookingModalProvider;
  services?: BookingModalService[];
  defaultServiceId?: string;
  onSuccess?: (booking: CustomerBooking) => void;
}

function formatSlotTime(time: string): string {
  if (!time) return "";
  if (time.includes("AM") || time.includes("PM")) return time;
  const parts = time.split(":");
  const hours = Number(parts[0]);
  const minutes = parts[1] || "00";
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${minutes} ${suffix}`;
}

export function BookingModal({
  open,
  onOpenChange,
  type,
  provider,
  services = [],
  defaultServiceId,
  onSuccess,
}: BookingModalProps) {
  const { data: pets = [] } = usePets();
  const createBookingMutation = useCreateBooking();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();

  React.useEffect(() => {
    if (open && !isAuthenticated) {
      onOpenChange(false);
      openLogin();
    }
  }, [open, isAuthenticated, onOpenChange, openLogin]);

  const getTomorrowDate = () => {
    const today = parseDateOnly(getBusinessToday());
    today.setDate(today.getDate() + 1);
    return getBusinessToday(today);
  };

  const [selectedPetId, setSelectedPetId] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<string>(getTomorrowDate);
  const [selectedTime, setSelectedTime] = React.useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(defaultServiceId || "");
  const [notes, setNotes] = React.useState("");
  const [conflictError, setConflictError] = React.useState<string | null>(null);
  const [previewImage, setPreviewImage] = React.useState<{ url: string; alt: string } | null>(null);

  // Sync defaultServiceId when it changes
  React.useEffect(() => {
    if (defaultServiceId) {
      setSelectedServiceId(defaultServiceId);
    }
  }, [defaultServiceId]);

  // Provider change reset
  const prevProviderIdRef = React.useRef(provider.id);
  React.useEffect(() => {
    if (prevProviderIdRef.current !== provider.id) {
      prevProviderIdRef.current = provider.id;
      setSelectedServiceId("");
      setSelectedTime("");
      setConflictError(null);
    }
  }, [provider.id]);

  // If services not provided as props, query dynamically for provider services
  const {
    data: fetchedServices = [],
    isLoading: isLoadingServices,
    isError: isServicesError,
  } = usePublicProviderServices(
    provider.id,
    open && type !== "veterinary" && services.length === 0
  );

  const availableServices: BookingModalService[] = React.useMemo(() => {
    if (services.length > 0) return services;
    return fetchedServices
      .filter((s) => s.active)
      .map((s) => ({
        id: s.id,
        title: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
        imageUrls: s.imageUrls,
      }));
  }, [services, fetchedServices]);

  const activePetId = selectedPetId || (pets.length > 0 ? pets[0].id : "");
  const selectedPet = pets.find((p) => p.id === activePetId) || pets[0];

  const activeServiceId =
    selectedServiceId || (availableServices.length > 0 ? availableServices[0].id : "");
  const activeService = availableServices.find((s) => s.id === activeServiceId);

  // Clear selected time if active service changes
  const prevServiceIdRef = React.useRef(activeServiceId);
  React.useEffect(() => {
    if (prevServiceIdRef.current !== activeServiceId) {
      prevServiceIdRef.current = activeServiceId;
      setSelectedTime("");
      setConflictError(null);
    }
  }, [activeServiceId]);

  // Availability queries
  const {
    data: veterinarianAvailability,
    isLoading: isLoadingVeterinarianAvailability,
    isError: isVeterinarianAvailabilityError,
    error: veterinarianAvailabilityError,
    refetch: refetchVeterinarianAvailability,
  } = useVeterinarianSlots(provider.id, selectedDate, open && type === "veterinary");

  const {
    data: providerAvailability,
    isLoading: isLoadingProviderAvailability,
    isError: isProviderAvailabilityError,
    error: providerAvailabilityError,
    refetch: refetchProviderAvailability,
  } = usePublicProviderSlots(
    provider.id,
    activeServiceId,
    selectedDate,
    open && type !== "veterinary" && Boolean(activeServiceId)
  );

  const price = activeService ? activeService.price : provider.feeOrRate;
  const duration =
    type === "veterinary" && veterinarianAvailability?.slotDurationMinutes
      ? veterinarianAvailability.slotDurationMinutes
      : activeService
      ? activeService.durationMinutes
      : providerAvailability?.serviceDurationMinutes || 45;

  const currentSlots = React.useMemo(() => {
    if (type === "veterinary") {
      return (veterinarianAvailability?.slots ?? []).map((slot) => ({
        value: slot.startTime,
        label: formatSlotTime(slot.startTime),
        available: slot.available,
      }));
    }
    return (providerAvailability?.slots ?? []).map((slot) => ({
      value: slot.startTime,
      label: formatSlotTime(slot.startTime),
      available: slot.available,
    }));
  }, [type, veterinarianAvailability, providerAvailability]);

  // Keep selected slot valid
  React.useEffect(() => {
    if (!selectedTime) return;
    const isAvailable = currentSlots.some((s) => s.value === selectedTime && s.available);
    if (!isAvailable) {
      setSelectedTime("");
    }
  }, [currentSlots, selectedTime]);

  const serviceTitle = activeService
    ? activeService.title
    : type === "veterinary"
    ? "Comprehensive Clinical Examination"
    : type === "grooming"
    ? "Full Spa & Grooming Treatment"
    : "Positive Reinforcement Coaching";

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    setSelectedTime("");
    setConflictError(null);
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in required", {
        description: "Please sign in to complete your booking reservation.",
      });
      openLogin();
      return;
    }
    if (!selectedPet) {
      showError("Pet Selection Required", "Please select a registered pet to proceed with booking.");
      return;
    }
    if (type !== "veterinary" && !activeServiceId) {
      showError("Service Selection Required", "Please select a valid service package to book.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      showError("Date & Time Required", "Please pick an available appointment date and time slot.");
      return;
    }

    if (type === "veterinary" && veterinarianAvailability?.isConfigured === false) {
      showError("Schedule Unconfigured", "This veterinarian has not configured their working schedule yet.");
      return;
    }

    setConflictError(null);

    try {
      if (type === "veterinary") {
        const latestAvailability = await refetchVeterinarianAvailability();
        if (latestAvailability.isError) {
          throw latestAvailability.error instanceof Error
            ? latestAvailability.error
            : new Error("Could not verify the selected appointment slot.");
        }
        const isStillAvailable = latestAvailability.data?.slots.some(
          (slot) => slot.startTime === selectedTime && slot.available
        );
        if (!isStillAvailable) {
          setSelectedTime("");
          const message = "That appointment time is no longer available. Please choose another slot.";
          setConflictError(message);
          showError("Slot No Longer Available", message);
          return;
        }
      } else {
        const latestAvailability = await refetchProviderAvailability();
        if (latestAvailability.isError) {
          throw latestAvailability.error instanceof Error
            ? latestAvailability.error
            : new Error("Could not verify the selected appointment slot.");
        }
        const isStillAvailable = latestAvailability.data?.slots.some(
          (slot) => slot.startTime === selectedTime && slot.available
        );
        if (!isStillAvailable) {
          setSelectedTime("");
          const message = "That appointment time is no longer available. Please choose another slot.";
          setConflictError(message);
          showError("Slot No Longer Available", message);
          return;
        }
      }

      const newBooking = await createBookingMutation.mutateAsync({
        type,
        providerId: provider.id,
        providerName: provider.name,
        providerTitle: provider.title,
        providerClinicOrBusiness: provider.clinicOrBusiness,
        providerImage: provider.image,
        serviceId: activeServiceId,
        serviceTitle,
        petId: selectedPet.id,
        petName: selectedPet.name,
        petBreed: selectedPet.breed || selectedPet.species,
        petPhoto: selectedPet.photo,
        date: selectedDate,
        time: selectedTime,
        durationMinutes: duration,
        price,
        notes: notes.trim(),
        location: provider.location,
      });

      const returnedStatus = (newBooking.status || "scheduled").toUpperCase();
      showSuccess("Booking Submitted", `Appointment #${newBooking.appointmentNumber} with ${provider.name} is ${returnedStatus}.`);

      onSuccess?.(newBooking);
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "The selected time slot is no longer available. Please select another time.";
      setConflictError(errorMsg);
      showError("Booking Failed", errorMsg);
    }
  };

  const isUnconfiguredError = React.useMemo(() => {
    const err = type === "veterinary" ? veterinarianAvailabilityError : providerAvailabilityError;
    if (!err) return false;
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    return (
      msg.includes("no availability configured") ||
      msg.includes("not configured") ||
      msg.includes("has not configured") ||
      msg.includes("not available on")
    );
  }, [type, veterinarianAvailabilityError, providerAvailabilityError]);

  const isLoadingSlots =
    type === "veterinary"
      ? isLoadingVeterinarianAvailability
      : isLoadingServices || isLoadingProviderAvailability;

  const isSlotsError =
    type === "veterinary" ? isVeterinarianAvailabilityError : isProviderAvailabilityError;

  const slotsError =
    type === "veterinary" ? veterinarianAvailabilityError : providerAvailabilityError;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="wide">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              {type === "veterinary" ? (
                <Stethoscope className="h-4 w-4" />
              ) : type === "grooming" ? (
                <Scissors className="h-4 w-4" />
              ) : (
                <Award className="h-4 w-4" />
              )}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {type === "veterinary"
                ? "Veterinary Visit"
                : type === "grooming"
                ? "Grooming Salon"
                : "Canine Coaching"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Book Appointment with {provider.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {provider.clinicOrBusiness} • Real-time verified booking
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {conflictError && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 p-3.5 text-xs text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Booking Notice</p>
                <p>{conflictError}</p>
              </div>
            </div>
          )}

          {/* ─── 1. Select Pet ──────────────────────────────────────────────── */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              1. Select Pet *
            </label>
            {pets.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No pets found in your profile. Please add a pet first.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {pets.map((p) => {
                  const isSelected = (selectedPet?.id || "") === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPetId(p.id)}
                      className={`flex items-center gap-2.5 rounded-2xl p-2.5 border transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none text-left ${
                        isSelected
                          ? "border-primary bg-primary-soft/30 shadow-xs"
                          : "border-border bg-surface hover:bg-muted/70"
                      }`}
                    >
                      <div className="relative h-9 w-9 overflow-hidden rounded-full shrink-0 border border-border">
                        <Image
                          src={p.photo}
                          alt={p.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.species}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── 2. Service Package (for non-veterinary) ────────────────────── */}
          {type !== "veterinary" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Select Package / Service *
              </label>
              {isLoadingServices ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading provider services…</span>
                </div>
              ) : isServicesError ? (
                <p className="text-xs text-destructive">Could not load provider services.</p>
              ) : availableServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground font-medium">
                    This provider has not added any active services yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableServices.map((s) => {
                    const isSelected = activeServiceId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`flex items-start justify-between rounded-2xl p-3 border text-left transition-[background-color,border-color] duration-150 motion-reduce:transition-none ${
                          isSelected
                            ? "border-primary bg-primary-soft/30"
                            : "border-border bg-white hover:bg-surface dark:bg-card"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">{s.title}</p>
                          <p className="text-[11px] text-muted-foreground">{s.durationMinutes} minutes</p>
                        </div>
                        <span className="text-xs font-bold text-primary">₹{s.price}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {activeService?.imageUrls && activeService.imageUrls.length > 0 && (
                <section className="space-y-2 pt-2" aria-label={activeService.title + " photo gallery"}>
                  <p className="text-xs font-semibold text-foreground">{activeService.title} photos</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {activeService.imageUrls.map((url, index) => (
                      <button
                        key={url + index}
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url,
                            alt: `${activeService.title} photo ${index + 1}`,
                          })
                        }
                        aria-label={"Preview " + activeService.title + " photo " + (index + 1)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Image
                          src={url}
                          alt={activeService.title + " photo " + (index + 1)}
                          fill
                          sizes="(max-width: 640px) 30vw, 130px"
                          className="object-cover transition-opacity group-hover:opacity-90"
                        />
                        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ─── 3. Select Date & Available Slots ──────────────────────────── */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {type === "veterinary" ? "2." : "3."} Date & Available Time Slot *
            </label>
            <div className="grid gap-3 sm:grid-cols-2 items-center">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-1">Appointment Date</span>
                <DatePicker
                  value={selectedDate}
                  minDate={new Date()}
                  onChange={handleDateChange}
                  allowClear={false}
                  placeholder="Select appointment date"
                />
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block mb-1">Schedule Notice</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Real-time slot availability. Slots are reserved upon final checkout confirmation.
                </p>
              </div>
            </div>

            {/* Slots Matrix */}
            <div className="pt-1">
              <span className="text-[11px] text-muted-foreground block mb-1.5">
                Available Slots on {selectedDate}:
              </span>
              {isLoadingSlots ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading available slots…</span>
                </div>
              ) : isSlotsError ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <span>
                    {isUnconfiguredError
                      ? "This provider has not configured their working schedule yet."
                      : slotsError instanceof Error
                      ? slotsError.message
                      : "Could not load appointment slots."}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (type === "veterinary") {
                        void refetchVeterinarianAvailability();
                      } else {
                        void refetchProviderAvailability();
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : type === "veterinary" && veterinarianAvailability?.isConfigured === false ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                  This veterinarian has not configured their working schedule yet. Appointments cannot be booked until the practitioner publishes operational hours.
                </div>
              ) : currentSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No available time slots for this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {currentSlots.map((slot) => {
                    const isSelected = selectedTime === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedTime(slot.value);
                          setConflictError(null);
                        }}
                        className={`rounded-xl py-2 px-1 text-center text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none ${
                          !slot.available
                            ? "bg-surface/50 text-muted-foreground/40 line-through cursor-not-allowed border border-transparent"
                            : isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-xs border border-primary"
                            : "bg-surface text-foreground hover:border-primary/50 border border-border/80"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── 4. Symptoms / Notes ────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {type === "veterinary" ? "3." : "4."} Symptoms or Special Notes
            </label>
            <Textarea
              placeholder="Describe symptoms, pet temperament, or specific areas of concern..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* ─── 5. Summary & Confirmation Footer ─────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-surface/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-semibold text-foreground">{serviceTitle}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated Duration:</span>
              <span className="font-medium text-foreground">{duration} minutes</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border/60 pt-2 font-bold">
              <span className="text-foreground">Total Fee:</span>
              <span className="text-base text-primary font-extrabold">₹{price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Razorpay Secure Payments — Slot is reserved upon confirmation; fee is paid securely via Razorpay.</span>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmBooking}
            disabled={
              createBookingMutation.isPending ||
              !selectedPet ||
              !selectedDate ||
              !selectedTime ||
              (type !== "veterinary" && !activeServiceId) ||
              (type === "veterinary" && veterinarianAvailability?.isConfigured === false)
            }
            className="rounded-full shadow-sm px-6"
          >
            {createBookingMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reserving Slot...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Appointment (₹{price.toFixed(2)})</span>
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Full-Screen Image Preview Lightbox Dialog */}
    <Dialog open={!!previewImage} onOpenChange={(isOpen) => !isOpen && setPreviewImage(null)}>
      <DialogContent size="wide" className="sm:max-w-3xl p-3 bg-black/95 text-white border-none shadow-2xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <p className="text-xs font-medium text-white/90 truncate pr-4">
            {previewImage?.alt || "Photo Preview"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreviewImage(null)}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 px-3 text-xs"
          >
            Close
          </Button>
        </div>
        <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center p-2">
          {previewImage?.url && (
            <Image
              src={previewImage.url}
              alt={previewImage.alt || "Photo Preview"}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 90vw, 800px"
              priority
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
