"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { BookingModal } from "@/components/customer/booking-modal";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { ProfessionalImage } from "@/components/shared/entity-image";
import {
  usePublicServiceProvider,
  usePublicProviderServices,
  usePublicReviews,
} from "@/lib/api/hooks";
import { toast } from "@/lib/utils/toast";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModal } from "@/stores/auth-modal.store";

interface TrainerDetailClientProps {
  id: string;
}

export function TrainerDetailClient({ id }: TrainerDetailClientProps) {
  const router = useRouter();
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false);
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | undefined>(undefined);
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();

  const { data: trainer, isLoading, isError, refetch } = usePublicServiceProvider(id);
  const { data: reviews = [] } = usePublicReviews({ providerId: Number(id) });
  const {
    data: allServices = [],
    isLoading: isLoadingServices,
  } = usePublicProviderServices(id);

  const trainingServices = React.useMemo(() => {
    return allServices.filter((s) => s.active && s.category === "training");
  }, [allServices]);

  const minPrice = React.useMemo(() => {
    if (trainingServices.length === 0) return null;
    return Math.min(...trainingServices.map((s) => s.price));
  }, [trainingServices]);

  const handleBookProgram = (programId?: string) => {
    if (!isAuthenticated) {
      toast.info("Sign in required", {
        description: "Please sign in to book a training session slot.",
      });
      openLogin();
      return;
    }
    setSelectedProgramId(programId);
    setBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="detail" title="Loading coach profile..." description="Fetching trainer details from the registry." />
      </div>
    );
  }

  if (isError || !trainer) {
    return (
      <div className="py-16 space-y-6">
        <Link
          href="/app/services/training"
          className="inline-flex items-center text-sm font-medium text-paw-charcoal-muted hover:text-paw-charcoal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trainers
        </Link>
        <ErrorState
          title="Trainer Profile Not Found"
          description="Could not load the requested training specialist."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Back link */}
      <div>
        <Link
          href="/app/services/training"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Trainers
        </Link>
      </div>

      {/* Hero Trainer Header */}
      <div className="rounded-[32px] border border-border/80 bg-card p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 border border-border/60 bg-primary/10 shadow-inner flex items-center justify-center">
          <ProfessionalImage
            src={trainer.profileImageUrl || trainer.photo}
            name={trainer.businessName}
            role="trainer"
            alt={trainer.businessName}
            sizes="(max-width: 640px) 144px, 192px"
            priority
            className="text-3xl font-extrabold"
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {trainer.businessName}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-primary mt-0.5">
                Head Coach: {trainer.name}
              </p>
            </div>

            <RatingStars rating={trainer.rating || 0} reviewCount={reviews.length} size="md" />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {trainer.description || "Certified positive canine behavior coaching, manners instruction, and obedience sessions."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-surface/70 px-3 py-1.5 rounded-xl border border-border/60">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {trainer.address || "Service Area"}
            </span>
            <span className="flex items-center gap-1.5 bg-surface/70 px-3 py-1.5 rounded-xl border border-border/60">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              {trainer.experienceYears ? `${trainer.experienceYears} Years Experience` : "Verified Partner"}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Curriculums & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Coaching Curriculums & Consultations
            </h2>

            {isLoadingServices ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading training services from database…</span>
              </div>
            ) : trainingServices.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface/60 border border-dashed border-border text-center text-xs text-muted-foreground">
                This provider has not added any active services yet.
              </div>
            ) : (
              <div className="space-y-3">
                {trainingServices.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl border border-border/70 bg-surface/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-base">{s.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {s.durationMinutes} mins
                        </Badge>
                      </div>
                      {s.description && (
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <span className="text-xl font-bold text-foreground">₹{s.price.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => handleBookProgram(s.id)}
                        className="rounded-full shadow-xs text-xs px-4"
                      >
                        Book Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genuine Client Reviews */}
          <div className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Verified Student Reviews ({reviews.length})
              </h2>
              <RatingStars rating={trainer.rating || 0} reviewCount={reviews.length} size="sm" />
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-muted/40 border border-border text-center text-xs text-muted-foreground">
                No reviews yet for this trainer. Verified pet owners can submit reviews following a completed coaching session.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-surface/60 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">
                        {rev.reviewerName}
                      </span>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      &quot;{rev.reviewText}&quot;
                    </p>
                    {rev.createdAt && (
                      <span className="text-[11px] text-muted-foreground block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Booking Card */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6 sticky top-24">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Standard Hourly Coaching
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">
                  {minPrice !== null ? `₹${minPrice.toFixed(2)}` : "—"}
                </span>
                {minPrice !== null && (
                  <span className="text-xs text-muted-foreground">/ session</span>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Facility:</span>
                <span className="font-semibold text-foreground">{trainer.address || "Service Area"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="font-semibold text-emerald-700">Online Appointment</span>
              </div>
            </div>

            <Button
              onClick={() => handleBookProgram()}
              disabled={trainingServices.length === 0}
              size="lg"
              className="w-full rounded-full shadow-md font-bold text-base gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Training
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        type="training"
        provider={{
          id: String(trainer.id),
          name: trainer.name,
          title: trainer.businessName,
          clinicOrBusiness: trainer.businessName,
          image: trainer.profileImageUrl || trainer.photo || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
          feeOrRate: minPrice || 0,
          feeLabel: "Hourly Rate",
          location: trainer.address || "Location",
        }}
        services={trainingServices.map((s) => ({
          id: s.id,
          title: s.name,
          price: s.price,
          durationMinutes: s.durationMinutes,
          imageUrls: s.imageUrls,
        }))}
        defaultServiceId={selectedProgramId}
        onSuccess={(booking) => {
          router.push(`/app/bookings/${booking.id}`);
        }}
      />
    </div>
  );
}
