"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useVetProfile, useUpdateVetProfile, usePublicReviews } from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { ProfileFormModal } from "@/components/professional/profile-form-modal";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { ProfessionalImage } from "@/components/shared/entity-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/utils/toast";
import {
  Stethoscope,
  GraduationCap,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Edit2,
  Star,
  Sparkles,
} from "lucide-react";
import type { VeterinarianProfile } from "@/lib/mock/professionals";

export function VetProfileClient() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: profile, isLoading, isError, refetch } = useVetProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateVetProfile();
  const vetId = Number(profile?.id);
  const { data: reviews = [] } = usePublicReviews(
    vetId && !isNaN(vetId) ? { veterinarianId: vetId } : undefined
  );
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="profile" message="Loading practitioner profile..." />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load profile"
          description="Encountered an issue retrieving practitioner credentials."
          action={
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const handleUpdate = async (updates: Partial<VeterinarianProfile>) => {
    try {
      await updateProfile(updates);
      toast.success("Profile Updated", {
        description: "Your practitioner credentials and clinical details have been saved.",
      });
    } catch {
      toast.error("Update Failed", {
        description: "Could not save profile changes. Please retry.",
      });
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <PageHeader
        title="Practitioner Credentials & Profile"
        description="Public clinician profile, licensing qualifications, and hospital workplace details."
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5 h-9"
        >
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>
      </PageHeader>

      {/* Main Profile Card */}
      <Card className="rounded-3xl border-border/80 p-6 sm:p-8 space-y-6 shadow-2xs">
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-secondary shrink-0 border-2 border-primary/20 shadow-xs flex items-center justify-center">
              <ProfessionalImage
                src={profile.photo}
                alt={profile.name}
                name={profile.name}
                role="vet"
                sizes="96px"
                priority
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                <StatusBadge status={profile.verificationStatus} size="sm" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {profile.qualification}
              </p>
              <div className="flex items-center gap-2 text-xs text-primary font-semibold pt-0.5">
                <Stethoscope className="h-3.5 w-3.5" />
                <span>{profile.specialization}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground text-sm">
              {profile.experienceYears} Years Clinical Practice
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Veterinary Medical Board Licensing Verification
              </p>
              <p className="text-muted-foreground">
                Credentials reviewed and endorsed by PawConnect Clinical Standards Board.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 self-start sm:self-auto">
            Authorized Practitioner
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1.5">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Workplace & Hospital
            </span>
            <p className="font-bold text-foreground text-sm">{profile.clinic}</p>
            <p className="text-muted-foreground">{profile.location}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1.5">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              Degree & Accreditations
            </span>
            <p className="font-bold text-foreground text-sm">{profile.qualification}</p>
            <p className="text-muted-foreground">{profile.specialization}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1.5">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Clinical Contact Telephone
            </span>
            <p className="font-bold text-foreground text-sm">{profile.phone}</p>
            <p className="text-muted-foreground">Available during scheduled operational hours</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1.5">
            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Direct Clinical Email
            </span>
            <p className="font-bold text-foreground text-sm">{profile.email}</p>
            <p className="text-muted-foreground">Internal referrals and client record inquiries</p>
          </div>
        </div>

        {/* Biography */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Professional Statement & Philosophy
          </h3>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed rounded-2xl border border-border/60 bg-surface/40 p-4">
            {profile.bio}
          </p>
        </div>
      </Card>

      {/* Patient Reviews & Star Ratings */}
      <Card className="rounded-3xl border-border/80 p-6 sm:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              Patient Reviews & Ratings ({reviews.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct, verified feedback submitted by pet parents following completed clinical appointments.
            </p>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-2xl shrink-0 self-start sm:self-auto">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-foreground">{averageRating}</span>
              <span className="text-xs text-muted-foreground">/ 5.0</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface/50 border border-dashed border-border/80 text-center space-y-2">
            <Star className="w-8 h-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-semibold text-foreground">No patient reviews yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Once clients complete their consultations and post their feedback, verified ratings and comments will populate here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-surface/60 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {rev.reviewerName}
                  </span>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  &ldquo;{rev.reviewText}&rdquo;
                </p>
                {rev.createdAt && (
                  <span className="text-[10px] text-muted-foreground/80 block font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Profile Form Modal */}
      <ProfileFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        role="vet"
        initialData={profile}
        onSubmit={handleUpdate}
        loading={isUpdating}
      />
    </div>
  );
}
