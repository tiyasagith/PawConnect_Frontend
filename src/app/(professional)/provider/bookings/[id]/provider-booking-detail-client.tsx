"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProviderBooking, useUpdateProviderBookingStatus } from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/lib/utils/toast";
import { formatMoney } from "@/lib/utils/money";
import { InvoiceModal } from "@/components/shared/invoice-modal";
import { ServiceReportModal } from "@/components/professional/service-report-modal";
import { AddCareRecordDialog } from "@/components/professional/add-care-record-dialog";
import { PetImage } from "@/components/shared/entity-image";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  Award,
  CheckCircle2,
  PlayCircle,
  XCircle,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Printer,
  ExternalLink,
  PlusCircle,
  HeartPulse,
  Weight,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import type { ProfessionalAppointmentStatus } from "@/lib/mock/professionals";

interface ProviderBookingDetailClientProps {
  bookingId: string;
}

export function ProviderBookingDetailClient({
  bookingId,
}: ProviderBookingDetailClientProps) {
  const { data: booking, isLoading, isError, refetch } = useProviderBooking(bookingId);
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateProviderBookingStatus();

  const [targetStatus, setTargetStatus] = useState<ProfessionalAppointmentStatus | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isServiceReportOpen, setIsServiceReportOpen] = useState(false);
  const [selectedRecordToPrint, setSelectedRecordToPrint] = useState<any | null>(null);
  const [isAddCareRecordOpen, setIsAddCareRecordOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="detail" message="Retrieving client service booking file..." />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="py-12">
        <ErrorState
          title="Booking Record Not Found"
          description="Could not locate this service booking reference."
          action={
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
              Retry
            </Button>
          }
        />
        <div className="text-center mt-6">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/provider/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isTraining = booking.serviceCategory === "training";

  const handleConfirmStatusChange = async () => {
    if (!targetStatus) return;
    try {
      await updateStatus({
        id: booking.id,
        status: targetStatus,
      });
      toast.success("Booking Status Updated", {
        description: `Marked as ${targetStatus}. Session file synchronized.`,
      });
      setTargetStatus(null);
    } catch (err: unknown) {
      toast.error("Status Update Failed", {
        description: err instanceof Error ? err.message : "Could not modify booking status. Please try again.",
      });
      setTargetStatus(null);
      refetch();
    }
  };

  const handlePrintRecord = (record?: any) => {
    setSelectedRecordToPrint(record || null);
    setIsServiceReportOpen(true);
  };

  const medicalHistory = booking.pet.medicalHistory || [];
  const vaccinations = booking.pet.vaccinations || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Top Page Header */}
      <PageHeader
        title={`Booking ${booking.bookingNumber}`}
        description={`${booking.serviceName} (${isTraining ? "Canine Behavioral Training" : "Professional Pet Grooming"}) • Scheduled for ${booking.date} at ${booking.time}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Service Report Button */}
          <Button
            size="sm"
            onClick={() => handlePrintRecord()}
            className="rounded-xl text-xs h-8.5 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            title="Print Official Care / Training Report"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Service Report
          </Button>

          {/* Tax Invoice / Bill Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInvoiceOpen(true)}
            className="rounded-xl text-xs h-8.5 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-medium"
            title="View & Print Official Service GST Tax Invoice"
          >
            <FileText className="h-3.5 w-3.5" />
            Tax Invoice / Bill
          </Button>

          <StatusBadge status={booking.status} size="lg" />

          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-8.5 gap-1.5">
            <Link href="/provider/bookings">
              <ArrowLeft className="h-3.5 w-3.5" />
              All Bookings
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Primary Status Banner & Operations Controls */}
      <Card className="rounded-3xl border-border/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {isTraining ? <Award className="h-6 w-6" /> : <Scissors className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  {booking.serviceName}
                </h2>
                <Badge variant="secondary" className="text-[10px] capitalize px-2 py-0.5">
                  {booking.serviceCategory}
                </Badge>
                {booking.paymentStatus === "PAID" ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                    Paid ({formatMoney(booking.price)})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-semibold">
                    Payment: {booking.paymentStatus || "PENDING"} ({formatMoney(booking.price)})
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {booking.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {booking.time} ({booking.durationMinutes} min session)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.status === "upcoming" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTargetStatus("confirmed")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Confirm Booking
              </Button>
            )}

            {booking.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => setTargetStatus("in-progress")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9"
              >
                <PlayCircle className="h-4 w-4" />
                Start Session
              </Button>
            )}

            {booking.status === "in-progress" && (
              <Button
                size="sm"
                onClick={() => setTargetStatus("completed")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Completed
              </Button>
            )}

            {booking.status !== "completed" && booking.status !== "cancelled" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setTargetStatus("cancelled")}
                disabled={isUpdating}
                className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-9 font-medium"
              >
                <XCircle className="h-4 w-4" />
                Cancel Booking
              </Button>
            )}

            {booking.status === "cancelled" && (
              <Badge variant="outline" className="text-xs py-1 px-3 border-rose-300 bg-rose-50 text-rose-700 font-semibold gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Booking Cancelled (Terminal)
              </Badge>
            )}
          </div>
        </div>

        {/* Client Booking Notes */}
        {booking.notes && (
          <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5 text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              Client Special Booking Instructions:
            </span>
            <p className="text-muted-foreground leading-relaxed pl-5.5">
              &ldquo;{booking.notes}&rdquo;
            </p>
          </div>
        )}
      </Card>

      {/* Patient Biological Profile & Client Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Complete Patient Medical & Biological File */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-5 sm:p-6 rounded-3xl border-border/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-primary" />
                Pet Biological & Health File
              </h3>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                Registered Profile
              </Badge>
            </div>

            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/60">
                <PetImage
                  src={booking.pet.photo}
                  alt={booking.pet.name || "Pet"}
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground truncate">{booking.pet.name}</h3>
                  <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                    {booking.pet.species}
                  </Badge>
                  {booking.pet.gender && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {booking.pet.gender}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground font-medium truncate">
                  {booking.pet.breed}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  {booking.pet.age != null && (
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {booking.pet.age} {booking.pet.age === 1 ? "year" : "years"} old
                    </span>
                  )}
                  {booking.pet.dateOfBirth && (
                    <span className="text-[11px] text-muted-foreground">
                      (DOB: {booking.pet.dateOfBirth})
                    </span>
                  )}
                  {booking.pet.weight != null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Weight className="h-3.5 w-3.5 text-primary" />
                        {booking.pet.weight} kg
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stored Biological Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-border/60">
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Sex / Gender</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {booking.pet.gender || "Not Specified"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Body Weight</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {booking.pet.weight != null ? `${booking.pet.weight} kg` : "Not Recorded"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Age / DOB</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {booking.pet.age != null ? `${booking.pet.age} yrs` : "N/A"}
                  {booking.pet.dateOfBirth ? ` (${booking.pet.dateOfBirth})` : ""}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Coat / Color</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {booking.pet.color || "Standard"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50 col-span-2 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Microchip ID</span>
                <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block">
                  {booking.pet.microchipId || "No Microchip Registered"}
                </span>
              </div>
            </div>

            {/* Pet Parent Special Notes / Sensitivities */}
            {booking.pet.notes && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>Pet Parent Special Instructions / Temperament / Sensitivities</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-5">&ldquo;{booking.pet.notes}&rdquo;</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Owner Information & Workspace Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Care Workspace Action Card */}
          <Card className="rounded-3xl border-primary/30 p-5 space-y-4 shadow-2xs bg-primary/5">
            <div className="flex items-center gap-2 pb-3 border-b border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Service Care Workspace</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Document session procedures, coat/behavior assessments, home care notes, and print client reports.
            </p>

            <div className="space-y-2.5">
              <Button
                onClick={() => setIsAddCareRecordOpen(true)}
                className="w-full rounded-xl text-xs font-semibold gap-2 h-10 shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                Record Session Report
              </Button>

              <Button
                variant="outline"
                onClick={() => handlePrintRecord()}
                className="w-full rounded-xl text-xs font-semibold gap-2 h-9 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Care / Training Report
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsInvoiceOpen(true)}
                className="w-full rounded-xl text-xs font-medium gap-2 h-9 border-border/80"
              >
                <FileText className="h-3.5 w-3.5" />
                Print Bill / GST Tax Invoice
              </Button>
            </div>
          </Card>

          {/* Client Contact File */}
          <Card className="p-5 rounded-3xl border-border/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pet Parent Contact
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{booking.owner.name}</span>
              </div>

              {booking.owner.phone && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{booking.owner.phone}</span>
                  </div>
                  <a
                    href={`tel:${booking.owner.phone}`}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Call
                  </a>
                </div>
              )}

              {booking.owner.email && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-foreground truncate">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{booking.owner.email}</span>
                  </div>
                  <a
                    href={`mailto:${booking.owner.email}`}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Email
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs: Existing Health, Vaccination & Previous Care History */}
      <Card className="rounded-3xl border-border/80 p-6 shadow-2xs space-y-6">
        <Tabs defaultValue="history" className="w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
            <TabsList className="h-10 p-1 rounded-2xl bg-secondary/80">
              <TabsTrigger value="history" className="rounded-xl text-xs font-semibold px-4 gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Care & Clinical History ({medicalHistory.length})
              </TabsTrigger>
              <TabsTrigger value="vaccinations" className="rounded-xl text-xs font-semibold px-4 gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vaccination Status ({vaccinations.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddCareRecordOpen(true)}
                className="rounded-xl text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <PlusCircle className="h-3 w-3" />
                Record Session Report
              </Button>
            </div>
          </div>

          {/* TAB 1: Care & Clinical History */}
          <TabsContent value="history" className="space-y-4 pt-1">
            {medicalHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-muted-foreground space-y-2">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p>No previous care or clinical reports logged for {booking.pet.name}.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddCareRecordOpen(true)}
                  className="rounded-xl text-xs mt-2"
                >
                  Record First Care Report
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalHistory.map((record, idx) => (
                  <div
                    key={record.id || idx}
                    className="rounded-2xl border border-border/70 bg-card p-5 text-xs space-y-3.5 shadow-2xs hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                          {record.type}
                        </Badge>
                        <span className="font-semibold text-foreground flex items-center gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {record.date}
                        </span>
                        {record.veterinarianName && (
                          <span className="text-muted-foreground">
                            • Logged by: {record.veterinarianName}
                          </span>
                        )}
                        {record.isVeterinarianVerified && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {record.attachmentUrl && (
                          <a
                            href={record.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded-lg bg-primary/10"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Attached Document / Photo
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintRecord(record)}
                          className="rounded-xl text-xs h-7.5 gap-1 border-primary/30 text-primary hover:bg-primary/10 font-medium"
                          title="Print Care / Training Session Report"
                        >
                          <Printer className="h-3 w-3" />
                          Print Report
                        </Button>
                      </div>
                    </div>

                    {/* Assessment & Procedure Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(record.diagnosis || record.description) && (
                        <div className="p-3 rounded-xl bg-surface/50 border border-border/40 space-y-1">
                          <span className="font-bold text-foreground text-[11px] block uppercase tracking-wider text-muted-foreground">
                            Coat / Behavioral Assessment
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {record.diagnosis || record.description}
                          </p>
                        </div>
                      )}

                      {record.treatment && (
                        <div className="p-3 rounded-xl bg-surface/50 border border-border/40 space-y-1">
                          <span className="font-bold text-foreground text-[11px] block uppercase tracking-wider text-muted-foreground">
                            Procedures / Training Techniques
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {record.treatment}
                          </p>
                        </div>
                      )}
                    </div>

                    {record.medicines && (
                      <div className="p-3 rounded-xl bg-surface/50 border border-border/40 space-y-1">
                        <span className="font-bold text-foreground text-[11px] block uppercase tracking-wider text-muted-foreground">
                          Home Care Recommendations / Homework
                        </span>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">
                          {record.medicines}
                        </p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="text-[11px] text-muted-foreground italic pl-1 border-l-2 border-primary/30">
                        &ldquo;{record.notes}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Vaccinations Ledger */}
          <TabsContent value="vaccinations" className="space-y-4 pt-1">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <p className="text-foreground">
                <span className="font-bold">Immunization Verification:</span> Verify Rabies and core vaccinations before grooming clipping or group training socialization.
              </p>
            </div>

            {vaccinations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-muted-foreground space-y-2">
                <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p>No vaccination certificates on record for {booking.pet.name}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccinations.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="rounded-2xl border border-border/70 bg-card p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{v.name}</span>
                        {v.administeredBy && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                            {v.administeredBy}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2">
                        <span>Administered: {v.date}</span>
                        {v.nextDue && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              Next Booster Due: {v.nextDue}
                            </span>
                          </>
                        )}
                      </div>
                      {v.notes && (
                        <p className="text-[11px] text-muted-foreground italic">&ldquo;{v.notes}&rdquo;</p>
                      )}
                    </div>

                    {v.certificateUrl && (
                      <div className="shrink-0">
                        <a
                          href={v.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Confirmation Dialog for Status Transitions */}
      <ConfirmDialog
        open={Boolean(targetStatus)}
        onOpenChange={(op) => !op && setTargetStatus(null)}
        title={`Update Booking to "${targetStatus}"?`}
        description={`Confirming this update will advance ${booking.bookingNumber} to "${targetStatus}" and notify the pet parent.`}
        confirmLabel="Confirm Status Change"
        variant={targetStatus === "cancelled" ? "destructive" : "default"}
        onConfirm={handleConfirmStatusChange}
      />

      {/* Printable Service GST Tax Invoice Modal */}
      <InvoiceModal
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        invoiceType="SERVICE_BOOKING"
        resourceId={booking.id}
      />

      {/* Official Printable Service Care / Training Report Modal */}
      <ServiceReportModal
        booking={booking}
        selectedRecord={selectedRecordToPrint}
        open={isServiceReportOpen}
        onOpenChange={(op) => {
          setIsServiceReportOpen(op);
          if (!op) setSelectedRecordToPrint(null);
        }}
      />

      {/* Add Care Record Dialog */}
      <AddCareRecordDialog
        bookingId={booking.id}
        petName={booking.pet.name}
        serviceCategory={booking.serviceCategory}
        serviceName={booking.serviceName}
        open={isAddCareRecordOpen}
        onOpenChange={setIsAddCareRecordOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

