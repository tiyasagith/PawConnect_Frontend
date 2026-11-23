"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Loader2, Stethoscope, Scissors, CheckCircle2 } from "lucide-react";
import { useSubmitCustomerReview } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | number;
  bookingType: "veterinary" | "grooming" | "training" | string;
  providerName: string;
  providerClinicOrBusiness?: string;
  petName?: string;
  initialRating?: number;
  initialComment?: string;
  onSuccess?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; subtitle: string }> = {
  5: {
    title: "Exceptional / 5 Stars",
    subtitle: "Outstanding care, professional expertise & highly recommended!",
  },
  4: {
    title: "Very Good / 4 Stars",
    subtitle: "Great treatment, attentive staff & comfortable for my pet.",
  },
  3: {
    title: "Good / 3 Stars",
    subtitle: "Satisfactory consultation and standard care delivered.",
  },
  2: {
    title: "Fair / 2 Stars",
    subtitle: "Basic care provided, but significant room for improvement.",
  },
  1: {
    title: "Poor / 1 Star",
    subtitle: "Unsatisfactory experience or service did not meet expectations.",
  },
};

export function ReviewModal({
  open,
  onOpenChange,
  bookingId,
  bookingType,
  providerName,
  providerClinicOrBusiness,
  petName,
  initialRating = 5,
  initialComment = "",
  onSuccess,
}: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState<number>(initialRating || 5);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState<string>(initialComment || "");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { mutateAsync: submitReview, isPending } = useSubmitCustomerReview();

  React.useEffect(() => {
    if (open) {
      setRating(initialRating || 5);
      setComment(initialComment || "");
      setErrorMsg(null);
    }
  }, [open, initialRating, initialComment]);

  const isVet = bookingType === "veterinary";
  const displayRating = hoverRating > 0 ? hoverRating : rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg("Please select a star rating between 1 and 5 stars.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg("Please write at least a few words sharing your feedback (minimum 5 characters).");
      return;
    }

    try {
      const numId = Number(bookingId);
      if (isNaN(numId) || numId <= 0) {
        throw new Error("Invalid booking reference");
      }

      const payload = isVet
        ? { appointmentId: numId, rating, reviewText: comment.trim() }
        : { serviceBookingId: numId, rating, reviewText: comment.trim() };

      await submitReview(payload);

      // Invalidate relevant cache so detail page and profiles refresh immediately
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["public-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["public-veterinarians"] });
      queryClient.invalidateQueries({ queryKey: ["public-service-providers"] });

      toast.success("Review Submitted Successfully", {
        description: `Thank you for sharing your feedback for ${providerName}! Your review is now visible on their verified profile.`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review. Please try again.";
      setErrorMsg(msg);
      toast.error("Submission Failed", { description: msg });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-background">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-border/80 bg-linear-to-b from-primary/10 via-primary/5 to-transparent space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                {isVet ? <Stethoscope className="w-4 h-4" /> : <Scissors className="w-4 h-4" />}
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30">
                {isVet ? "Veterinary Doctor Review" : "Service Specialist Review"}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-black text-foreground tracking-tight">
              Rate & Review {providerName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {providerClinicOrBusiness && <span className="font-medium text-foreground block">{providerClinicOrBusiness}</span>}
              Your authentic feedback helps other pet parents make informed care choices and helps our verified practitioners maintain excellence.
            </DialogDescription>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* 1. Star Rating Selector */}
            <div className="space-y-3 text-center sm:text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Overall Rating <span className="text-destructive">*</span>
              </label>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= displayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg transition-transform hover:scale-115 focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          active
                            ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                            : "text-muted-foreground/30 fill-transparent hover:text-amber-300"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Rating Description Label */}
              {RATING_DESCRIPTIONS[displayRating] && (
                <div className="bg-surface/80 rounded-xl p-3 border border-border/70 text-xs">
                  <span className="font-bold text-foreground block">
                    {RATING_DESCRIPTIONS[displayRating].title}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {RATING_DESCRIPTIONS[displayRating].subtitle}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Review Text Comment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Review & Clinical Comments <span className="text-destructive">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {comment.length} / 1000
                </span>
              </div>

              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={
                  isVet
                    ? `Describe your consultation with ${providerName}${petName ? ` for ${petName}` : ""}. How was the doctor's diagnosis, bedside manner, gentle handling, and clarity of the prescription advice?`
                    : `Describe your service with ${providerName}${petName ? ` for ${petName}` : ""}. How was the care, staff hospitality, and overall experience?`
                }
                className="rounded-2xl resize-none text-xs leading-relaxed focus-visible:ring-primary border-border"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-border bg-card flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || rating === 0 || !comment.trim()}
              className="rounded-xl text-xs h-9 font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting Review...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {initialRating ? "Update Review" : "Submit Verified Review"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

