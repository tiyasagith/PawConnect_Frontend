"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Stethoscope,
  Scissors,
  Award,
  FileText,
  Heart,
  Ban,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Loader2,
  PawPrint,
  Navigation,
  ExternalLink,
  Building2,
  Pill,
  Printer,
} from "lucide-react";
import { PrescriptionModal } from "@/components/professional/prescription-modal";
import { ReviewModal } from "@/components/customer/review-modal";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InvoiceModal } from "@/components/shared/invoice-modal";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { useBooking, useCancelBooking } from "@/lib/api/hooks";
import { apiGet } from "@/lib/api/client";
import { createPaymentOrder, launchRazorpayCheckout, recordPaymentFailure } from "@/lib/api/payments";
import { PaymentCountdownBanner } from "@/components/shared/payment-countdown-banner";
import { showSuccess, showError } from "@/lib/utils/toast";
import {
  LocationMap,
  searchAddress,
  type LocationCoordinates,
  type SearchResultItem,
} from "@/components/shared/location";

interface BookingDetailViewProps {
  id: string;
  isClinicalAppointment?: boolean;
}

export function BookingDetailView({
  id,
  isClinicalAppointment = false,
}: BookingDetailViewProps) {
  const queryClient = useQueryClient();
  const { data: booking, isLoading, error } = useBooking(id);
  const cancelMutation = useCancelBooking();

  const [currentTime] = React.useState(() => Date.now());
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [isPayingBooking, setIsPayingBooking] = React.useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = React.useState(false);
  const [selectedPrescriptionRecord, setSelectedPrescriptionRecord] = React.useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);

  const hasExactCoords = Boolean(
    booking &&
    booking.latitude != null &&
    booking.longitude != null &&
    (booking.latitude !== 0 || booking.longitude !== 0)
  );

  const [geocodedCoords, setGeocodedCoords] = React.useState<LocationCoordinates | null>(null);

  // If coordinates were not saved directly on the booking, attempt geocoding the clinic/facility address
  React.useEffect(() => {
    if (!booking || hasExactCoords) return;

    let isMounted = true;
    const addressToSearch = (booking.location || booking.providerClinicOrBusiness || "").trim();
    if (addressToSearch) {
      searchAddress(addressToSearch)
        .then((results: SearchResultItem[]) => {
          if (isMounted && results.length > 0) {
            setGeocodedCoords({ lat: results[0].lat, lng: results[0].lng });
          }
        })
        .catch(() => {
          // Keep default fallback
        });
    }

    return () => {
      isMounted = false;
    };
  }, [hasExactCoords, booking]);

  const mapCoords: LocationCoordinates = React.useMemo(() => {
    if (booking && hasExactCoords && booking.latitude != null && booking.longitude != null) {
      return { lat: Number(booking.latitude), lng: Number(booking.longitude) };
    }
    if (geocodedCoords) {
      return geocodedCoords;
    }
    return {
      lat: 37.7749, // Default geographic center (San Francisco)
      lng: -122.4194,
    };
  }, [booking, hasExactCoords, geocodedCoords]);

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${booking?.providerClinicOrBusiness || ""} ${booking?.location || ""}`.trim() || `${mapCoords.lat},${mapCoords.lng}`
  )}`;

  if (isLoading) {
    return <LoadingState variant="detail" message="Loading booking details..." className="min-h-[50vh]" />;
  }

  if (error || !booking) {
    return (
      <ErrorState
        title="Booking Not Found"
        description="We couldn't locate this appointment record or it may have been removed."
        action={
          <Button asChild variant="outline">
            <Link href="/app/bookings">Return to All Bookings</Link>
          </Button>
        }
      />
    );
  }

  const isVet = booking.type === "veterinary";
  const isGroom = booking.type === "grooming";
  const canModify = booking.status === "scheduled";

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync(booking.id);
      await queryClient.invalidateQueries({ queryKey: ["customer-booking", id] });
      await queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      showSuccess("Booking Cancelled", "Your booking has been cancelled and any paid amount has been refunded.");
      setCancelDialogOpen(false);
    } catch {
      showError("Cancellation Failed", "Failed to cancel booking. Please try again.");
    }
  };

  const normalizedPaymentStatus = String(booking.paymentStatus || "").toUpperCase();
  const rawStatus = String(booking.status || "").toUpperCase();
  const isConfirmedOrCompleted = rawStatus === "SCHEDULED" || rawStatus === "CONFIRMED" || rawStatus === "COMPLETED";
  const isPaid =
    normalizedPaymentStatus === "PAID" ||
    normalizedPaymentStatus === "SUCCESS" ||
    (isConfirmedOrCompleted && !booking.paymentExpiresAt && !booking.canRetryPayment);
  const isRefunded = normalizedPaymentStatus === "REFUNDED";
  const isFailed = normalizedPaymentStatus === "FAILED";
  const isPending = !isPaid && !isRefunded && !isFailed;
  const isCancelled = booking.status === "cancelled";
  const isCompleted = booking.status === "completed";

  const isWindowActive = !isPaid && !isCancelled && !isCompleted && Boolean(
    booking.canRetryPayment ?? (
      booking.paymentExpiresAt
        ? new Date(booking.paymentExpiresAt).getTime() > currentTime
        : false
    )
  );
  const canPay = !isPaid && !isCancelled && !isCompleted && Boolean(booking.canRetryPayment || (isWindowActive && isPending));

  const handleCheckPaymentStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const bookingType = isClinicalAppointment || booking.type === "veterinary" ? "VETERINARY" : "SERVICE";
      await apiGet(`/me/bookings/${id}/payment`, { params: { bookingType } }).catch(() => null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer-booking", id] }),
        queryClient.invalidateQueries({ queryKey: ["customer-bookings"] }),
      ]);
      showSuccess("Payment Status Checked", "Booking and payment status refreshed.");
    } catch {
      showError("Status Check Failed", "Unable to refresh payment status right now.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handlePayBooking = async () => {
    try {
      setIsPayingBooking(true);
      const bookingType = isClinicalAppointment || booking.type === "veterinary" ? "VETERINARY" : "SERVICE";
      const paymentOrder = await createPaymentOrder({
        bookingId: Number(booking.id),
        bookingType,
      });

      await launchRazorpayCheckout({
        order: paymentOrder,
        preferredMethod: "all",
        onSuccess: async () => {
          setIsPayingBooking(false);
          showSuccess("Payment Verified", "Fee received and verified successfully!");
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["customer-booking", id] }),
            queryClient.invalidateQueries({ queryKey: ["customer-bookings"] }),
            queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
            queryClient.invalidateQueries({ queryKey: ["vet-appointments"] }),
            queryClient.invalidateQueries({ queryKey: ["provider-bookings"] }),
          ]);
        },
        onDismiss: () => {
          setIsPayingBooking(false);
          const bookingType = isClinicalAppointment || booking.type === "veterinary" ? "VETERINARY" : "SERVICE";
          recordPaymentFailure({
            razorpayOrderId: paymentOrder.razorpayOrderId,
            bookingId: Number(booking.id),
            bookingType,
            reason: "Checkout dismissed by user",
          }).catch(() => {});
          showError("Payment Incomplete", "Payment was not completed. You have 15 minutes to complete payment.");
          queryClient.invalidateQueries({ queryKey: ["customer-booking", id] });
          queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
        },
        onError: (err) => {
          setIsPayingBooking(false);
          const msg = err instanceof Error ? err.message : "Payment verification failed.";
          const bookingType = isClinicalAppointment || booking.type === "veterinary" ? "VETERINARY" : "SERVICE";
          recordPaymentFailure({
            razorpayOrderId: paymentOrder.razorpayOrderId,
            bookingId: Number(booking.id),
            bookingType,
            reason: msg,
          }).catch(() => {});
          showError("Payment Failed", msg);
          queryClient.invalidateQueries({ queryKey: ["customer-booking", id] });
          queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
        },
      });
    } catch (err: unknown) {
      setIsPayingBooking(false);
      const msg = err instanceof Error ? err.message : "Unable to initiate payment with Razorpay.";
      showError("Payment Initialization Failed", msg);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Return */}
      <div>
        <Link
          href="/app/bookings"
          className="inline-flex items-center text-sm font-medium text-paw-charcoal-muted hover:text-paw-charcoal transition-colors group mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to All Bookings
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold uppercase bg-paw-cream-peach px-2.5 py-1 rounded-lg text-paw-charcoal border border-paw-coral/20">
                {booking.appointmentNumber}
              </span>
              <StatusBadge status={booking.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-paw-charcoal mt-2">
              {isClinicalAppointment ? "Veterinary Clinical Appointment" : booking.serviceTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {booking.status === "completed" && (
              <Button
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                className={`rounded-xl text-xs h-8.5 gap-1.5 font-semibold shadow-xs ${
                  booking.isReviewed
                    ? "border border-amber-400/50 text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                {booking.isReviewed ? `Your Review (${booking.reviewRating}★)` : `Review ${booking.type === "veterinary" ? "Doctor" : "Provider"}`}
              </Button>
            )}

            {booking.type === "veterinary" && (booking.status === "completed" || (booking.clinicalRecords && booking.clinicalRecords.length > 0)) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedPrescriptionRecord(booking.clinicalRecords?.[0] || null);
                  setIsPrescriptionModalOpen(true);
                }}
                className="rounded-xl text-xs h-8.5 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Prescription & Report
              </Button>
            )}

            {canModify && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                onClick={() => setCancelDialogOpen(true)}
              >
                <Ban className="w-3.5 h-3.5 mr-1.5" />
                Cancel Appointment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 15-Minute Re-Payment Window Banner (Active Pending Booking) */}
      {!isPaid && !isCancelled && !isCompleted && (booking.canRetryPayment || (booking.paymentExpiresAt && isWindowActive)) && (
        <PaymentCountdownBanner
          expiresAt={booking.paymentExpiresAt}
          remainingSecondsInitial={booking.remainingPaymentSeconds}
          amount={booking.price}
          orderId={booking.id}
          isRetrying={isPayingBooking}
          onRetryPayment={handlePayBooking}
          onExpired={async () => {
            showError("Payment Window Expired", "The 15-minute payment window has elapsed. This booking has expired.");
            queryClient.invalidateQueries({ queryKey: ["customer-booking", id] });
            queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
          }}
        />
      )}

      {/* Main Grid: Details Overview + Side Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Schedule & Facility Location Block */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-paw-charcoal flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-paw-coral" />
                  Appointment Schedule & Facility Location
                </h2>
                <p className="text-xs text-paw-charcoal-muted mt-0.5">
                  Confirmed session timing and verified on-site facility location
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-paw-coral hover:text-paw-coral/90 transition-colors bg-paw-coral/10 hover:bg-paw-coral/15 px-3.5 py-2 rounded-xl border border-paw-coral/20 self-start sm:self-auto shrink-0 shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-paw-cream-peach/20 border border-paw-cream-peach space-y-1">
                <span className="text-xs text-paw-charcoal-muted font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-paw-coral" /> Date & Time
                </span>
                <p className="text-base font-bold text-paw-charcoal">{booking.date}</p>
                <p className="text-xs font-semibold text-paw-coral">{booking.time} ({booking.durationMinutes} minutes)</p>
              </div>

              <div className="p-4 rounded-2xl bg-paw-sky-light/20 border border-paw-sky-border space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-paw-charcoal-muted font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-paw-blue-accent" /> Facility Location
                  </span>
                  <p className="text-sm font-bold text-paw-charcoal mt-0.5">{booking.providerClinicOrBusiness}</p>
                  <p className="text-xs text-paw-charcoal-muted">{booking.location}</p>
                </div>
                {(hasExactCoords || geocodedCoords) && (
                  <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-paw-charcoal-muted">
                    <span className="bg-white/80 px-2 py-0.5 rounded border border-paw-sky-border/60">
                      GPS: {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="space-y-2">
              <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-paw-charcoal/10 shadow-inner bg-paw-cream-peach/10">
                <LocationMap
                  center={mapCoords}
                  markerPosition={mapCoords}
                  zoom={15}
                  isDraggable={false}
                  popupText={`${booking.providerClinicOrBusiness} — ${booking.providerName}`}
                  className="w-full h-full"
                />
                <div className="absolute bottom-3 left-3 z-[400] pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/95 text-paw-charcoal px-3 py-1 rounded-full shadow-md border border-paw-charcoal/10 backdrop-blur-xs">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {booking.providerClinicOrBusiness || "Facility Location"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-paw-charcoal-muted gap-2 pt-1 px-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Reception check-in desk, parking, and consultation rooms are available at this address.</span>
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-paw-coral hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Attending Provider Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-paw-charcoal flex items-center gap-2">
              {isVet ? (
                <Stethoscope className="w-5 h-5 text-paw-coral" />
              ) : isGroom ? (
                <Scissors className="w-5 h-5 text-paw-coral" />
              ) : (
                <Award className="w-5 h-5 text-paw-coral" />
              )}
              Attending Specialist / Care Provider
            </h2>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-paw-cream-peach/10 border border-paw-charcoal/10">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border bg-primary/10 flex items-center justify-center">
                {booking.providerImage ? (
                  <Image
                    src={booking.providerImage}
                    alt={booking.providerName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-sm text-primary">
                    {booking.providerName
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "DR"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-paw-charcoal text-base truncate">
                  {booking.providerName}
                </h3>
                <p className="text-xs text-paw-coral font-medium">{booking.providerTitle}</p>
                <p className="text-xs text-paw-charcoal-muted">{booking.providerClinicOrBusiness}</p>
              </div>

              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
                <Link
                  href={
                    isVet
                      ? `/app/services/veterinary/${booking.providerId}`
                      : isGroom
                        ? `/app/services/grooming/${booking.providerId}`
                        : `/app/services/training/${booking.providerId}`
                  }
                >
                  View Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Patient / Companion Pet Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-paw-charcoal flex items-center gap-2">
              <Heart className="w-5 h-5 text-paw-coral" />
              Companion Pet Profile
            </h2>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-paw-cream-peach/10 border border-paw-charcoal/10">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border bg-primary/10 flex items-center justify-center">
                {booking.petPhoto ? (
                  <Image
                    src={booking.petPhoto}
                    alt={booking.petName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-sm text-primary">
                    {booking.petName ? booking.petName.charAt(0).toUpperCase() : <PawPrint className="w-5 h-5" />}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-paw-charcoal text-base">{booking.petName}</h4>
                <p className="text-xs text-paw-charcoal-muted">{booking.petBreed}</p>
              </div>

              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
                <Link href={`/app/pets/${booking.petId}`}>Pet Profile</Link>
              </Button>
            </div>
          </div>

          {/* Doctor's Prescription & Clinical Consultation Summary */}
          {booking.type === "veterinary" && (booking.status === "completed" || (booking.clinicalRecords && booking.clinicalRecords.length > 0)) && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paw-charcoal/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-paw-charcoal flex items-center gap-2">
                      <Pill className="w-5 h-5 text-paw-coral" />
                      Doctor&apos;s Prescription & Clinical Summary
                    </h2>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 font-bold uppercase">
                      Clinical File
                    </Badge>
                  </div>
                  <p className="text-xs text-paw-charcoal-muted mt-0.5">
                    Medical diagnosis, prescribed medications, and clinical directions
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPrescriptionRecord(booking.clinicalRecords?.[0] || null);
                    setIsPrescriptionModalOpen(true);
                  }}
                  className="rounded-xl text-xs h-8.5 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs self-start sm:self-auto shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Prescription
                </Button>
              </div>

              <div className="space-y-4">
                {booking.clinicalRecords && booking.clinicalRecords.length > 0 ? (
                  booking.clinicalRecords.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-5 rounded-2xl border border-primary/20 bg-paw-cream-peach/10 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-paw-charcoal">
                          {rec.diagnosis || rec.recordType || "Clinical Examination"}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-2">
                          {rec.recordType}
                        </Badge>
                      </div>
                      <span className="text-xs text-paw-charcoal-muted font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-paw-coral" />
                        {rec.recordDate}
                      </span>
                    </div>

                    {/* Prescribed Medicines & Dosages (Rx) */}
                    {rec.medicines && (
                      <div className="p-4 rounded-xl border border-primary/25 bg-white shadow-xs space-y-1.5">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-primary" />
                          Prescribed Medication & Dosage (Rx):
                        </span>
                        <p className="text-xs font-medium text-paw-charcoal whitespace-pre-wrap leading-relaxed pl-5.5">
                          {rec.medicines}
                        </p>
                      </div>
                    )}

                    {/* Treatment Given */}
                    {rec.treatment && (
                      <div className="text-xs text-paw-charcoal bg-white/80 p-3 rounded-xl border border-border/70 space-y-1">
                        <span className="font-bold text-muted-foreground mr-1.5">Clinical Treatment / Procedures:</span>
                        <span className="font-medium">{rec.treatment}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {rec.notes && (
                      <div className="text-xs text-paw-charcoal-muted italic bg-surface/60 p-3 rounded-xl border border-border/60">
                        &quot;{rec.notes}&quot;
                      </div>
                    )}

                    {/* Report Attachment */}
                    {rec.attachmentUrl && (
                      <div className="pt-1">
                        <a
                          href={rec.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Download / View Attached Clinical Report
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-5 rounded-2xl border border-primary/20 bg-paw-cream-peach/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3">
                    <span className="font-bold text-sm text-paw-charcoal">
                      Clinical Consultation Summary
                    </span>
                    <span className="text-xs text-paw-charcoal-muted font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-paw-coral" />
                      {booking.date}
                    </span>
                  </div>
                  {booking.notes && (
                    <div className="p-4 rounded-xl border border-primary/25 bg-white shadow-xs space-y-1.5">
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-primary" />
                        Consultation Notes & Directions:
                      </span>
                      <p className="text-xs font-medium text-paw-charcoal whitespace-pre-wrap leading-relaxed pl-5.5">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Attending Practitioner: <strong>{booking.providerName}</strong> ({booking.providerClinicOrBusiness})
                  </p>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Client Star Rating & Review Section (Completed Consultations / Bookings) */}
          {booking.status === "completed" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paw-charcoal/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-paw-charcoal flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      {booking.type === "veterinary" ? "Doctor Review & Rating" : "Service Provider Review & Rating"}
                    </h2>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
                      booking.isReviewed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}>
                      {booking.isReviewed ? "Review Published" : "Feedback Invited"}
                    </Badge>
                  </div>
                  <p className="text-xs text-paw-charcoal-muted mt-0.5">
                    {booking.isReviewed
                      ? `Your verified feedback is publicly visible on ${booking.providerName}'s profile.`
                      : `Share your direct consultation feedback to help other pet parents and help ${booking.providerName} maintain clinical excellence.`}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsReviewModalOpen(true)}
                  className={`rounded-xl text-xs h-8.5 gap-1.5 font-semibold shadow-xs self-start sm:self-auto shrink-0 ${
                    booking.isReviewed
                      ? "border border-amber-400/40 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {booking.isReviewed ? "Edit Your Review" : "Write a Review"}
                </Button>
              </div>

              {booking.isReviewed ? (
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= (booking.reviewRating || 5)
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30 fill-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-950">
                        {booking.reviewRating} out of 5 Stars
                      </span>
                    </div>

                    {booking.reviewCreatedAt && (
                      <span className="text-[11px] text-paw-charcoal-muted font-mono">
                        Submitted on {new Date(booking.reviewCreatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-paw-charcoal leading-relaxed whitespace-pre-wrap bg-white/90 p-4 rounded-xl border border-amber-200/70 font-sans shadow-2xs">
                    &ldquo;{booking.reviewComment}&rdquo;
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Patient Review • Published to {booking.providerName}&apos;s profile</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-border/80 text-center space-y-3">
                  <p className="text-xs text-paw-charcoal-muted">
                    How was your experience with <strong className="text-paw-charcoal">{booking.providerName}</strong>? Tap a star to review:
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="p-1.5 rounded-lg hover:scale-120 transition-transform group"
                        title={`Rate ${s} Stars`}
                      >
                        <Star className="w-7 h-7 text-muted-foreground/30 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                  <div>
                    <Button
                      size="sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="rounded-xl text-xs h-8.5 font-semibold bg-amber-500 hover:bg-amber-600 text-white gap-1.5 shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Rate & Review {booking.type === "veterinary" ? "Doctor" : "Service Provider"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes / Reason for Appointment */}
          {booking.notes && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-paw-charcoal flex items-center gap-2">
                <FileText className="w-4 h-4 text-paw-coral" />
                Visit Reason & Client Notes
              </h3>
              <p className="text-xs text-paw-charcoal-muted bg-paw-cream-peach/20 p-3.5 rounded-xl border border-paw-cream-peach leading-relaxed">
                &quot;{booking.notes}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Payment & Billing Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-paw-charcoal/10 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-paw-charcoal/10 pb-4">
              <span className="text-sm font-bold text-paw-charcoal">Payment Status</span>
              <Badge
                variant="outline"
                className={`text-xs uppercase font-bold ${
                  isPaid
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : isRefunded
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : isFailed
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {isPaid ? "PAID" : isRefunded ? "REFUNDED" : isFailed ? "FAILED" : "PENDING"}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-paw-charcoal-muted">{booking.serviceTitle}</span>
                <span className="font-semibold text-paw-charcoal">₹{booking.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-paw-charcoal-muted">PawConnect Platform Fee</span>
                <span className="font-semibold text-emerald-700">Included (₹0)</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-paw-charcoal/10 text-sm">
                <span className="font-bold text-paw-charcoal">Total Amount</span>
                <span className="font-extrabold text-paw-charcoal text-base">₹{booking.price}</span>
              </div>
            </div>

            {canPay && (
              <div className="space-y-2 pt-2">
                <Button
                  size="sm"
                  className="w-full rounded-2xl font-bold text-xs h-10 gap-2 shadow-xs"
                  disabled={isPayingBooking}
                  onClick={handlePayBooking}
                >
                  {isPayingBooking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay with Razorpay (₹{booking.price})</span>
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center text-paw-charcoal-muted pt-0.5">
                  Official Razorpay Checkout (Instant UPI, Cards & NetBanking).
                </p>
              </div>
            )}

            {booking.appointmentNumber && (
              <div className="flex items-center justify-between text-[11px] text-paw-charcoal-muted pt-2 border-t border-paw-charcoal/10">
                <span>Payment Reference ID:</span>
                <span className="font-mono font-medium text-paw-charcoal">{booking.appointmentNumber}</span>
              </div>
            )}

            {isPending && booking.status !== "cancelled" && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs font-medium text-paw-charcoal-muted hover:text-paw-charcoal h-8 gap-1.5"
                disabled={isCheckingStatus}
                onClick={handleCheckPaymentStatus}
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? "animate-spin" : ""}`} />
                <span>Check Payment Status</span>
              </Button>
            )}

            {(isPaid || isRefunded) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoiceModalOpen(true)}
                className="w-full rounded-2xl text-xs font-semibold gap-2 h-10 mt-2"
              >
                <FileText className="w-4 h-4" />
                <span>View GST Tax Invoice</span>
              </Button>
            )}

            <div className="pt-2 text-[11px] text-paw-charcoal-muted space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isPaid
                  ? "Payment Verified via Razorpay"
                  : isRefunded
                  ? "Booking Cancelled - Payment Refunded"
                  : isFailed
                  ? "Payment Attempt Failed"
                  : "Pay securely upon confirmation"}
              </div>
              <p>
                {isRefunded
                  ? "This booking was cancelled and your payment has been automatically refunded to your original payment method."
                  : "Cancellations can be made up to 2 hours before the scheduled time with full refund processed automatically."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancel This Appointment?"
        description="Are you sure you want to cancel this booking? The slot will be reopened for other pet owners."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Appointment"
        variant="destructive"
        onConfirm={handleConfirmCancel}
      />

      {/* Official Universal Printable Prescription Modal */}
      <PrescriptionModal
        appointment={{
          appointmentNumber: booking.appointmentNumber,
          date: booking.date,
          time: booking.time,
          notes: booking.notes,
          providerName: booking.providerName,
          providerClinicOrBusiness: booking.providerClinicOrBusiness,
          clinicName: booking.providerClinicOrBusiness,
          clinicAddress: booking.clinicAddress || booking.location,
          qualification: booking.qualification,
          specialization: booking.specialization,
          licenseNumber: booking.licenseNumber,
          reason: booking.serviceTitle,
          pet: {
            id: booking.petId,
            name: booking.petName,
            species: booking.species || "Canine",
            breed: booking.petBreed,
            gender: booking.petGender,
            weight: booking.petWeight,
            age: booking.petAgeYears,
            dateOfBirth: booking.petDateOfBirth,
            microchipId: booking.petMicrochipNumber,
            color: booking.petColor,
            notes: booking.petNotes,
          },
          owner: {
            name: booking.ownerName || "Pet Parent",
            phone: booking.ownerPhone,
            email: booking.ownerEmail,
          },
        }}
        selectedRecord={selectedPrescriptionRecord || booking.clinicalRecords?.[0] || null}
        open={isPrescriptionModalOpen}
        onOpenChange={(op) => {
          setIsPrescriptionModalOpen(op);
          if (!op) setSelectedPrescriptionRecord(null);
        }}
      />

      {/* Official Universal GST Tax Invoice Modal */}
      <InvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        invoiceType={isVet ? "APPOINTMENT" : "SERVICE_BOOKING"}
        resourceId={booking.id}
      />

      {/* Verified Doctor & Service Provider Review Modal */}
      <ReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        bookingId={booking.id}
        bookingType={booking.type}
        providerName={booking.providerName}
        providerClinicOrBusiness={booking.providerClinicOrBusiness}
        petName={booking.petName}
        initialRating={booking.reviewRating}
        initialComment={booking.reviewComment}
      />
    </div>
  );
}
