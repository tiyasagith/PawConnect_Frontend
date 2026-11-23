"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatMoney } from "@/lib/utils/money";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  PawPrint,
  CheckCircle2,
  PlayCircle,
  XCircle,
  FileText,
  Printer,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  Weight,
  Sparkles,
  Info,
} from "lucide-react";
import { InvoiceModal } from "@/components/shared/invoice-modal";
import { ServiceReportModal } from "@/components/professional/service-report-modal";
import { AddCareRecordDialog } from "@/components/professional/add-care-record-dialog";
import { PetImage } from "@/components/shared/entity-image";
import type {
  ProviderBooking,
  ProfessionalAppointmentStatus,
} from "@/lib/mock/professionals";

interface ProviderBookingModalProps {
  booking: ProviderBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: ProfessionalAppointmentStatus) => Promise<void> | void;
  isUpdating?: boolean;
}

export function ProviderBookingModal({
  booking,
  open,
  onOpenChange,
  onUpdateStatus,
  isUpdating = false,
}: ProviderBookingModalProps) {
  const [confirmStatus, setConfirmStatus] = useState<ProfessionalAppointmentStatus | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isServiceReportOpen, setIsServiceReportOpen] = useState(false);
  const [isAddCareRecordOpen, setIsAddCareRecordOpen] = useState(false);

  if (!booking) return null;

  const handleConfirmStatusChange = async () => {
    if (confirmStatus) {
      try {
        await onUpdateStatus(booking.id, confirmStatus);
        setConfirmStatus(null);
      } catch {
        // Retain state so user can retry
      }
    }
  };

  const isTraining = booking.serviceCategory === "training";
  const vaccinationsCount = booking.pet?.vaccinations?.length || 0;
  const historyCount = booking.pet?.medicalHistory?.length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="wide">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-foreground">
                    {booking.bookingNumber}
                  </span>
                  <StatusBadge status={booking.status} />
                  {booking.paymentStatus === "PAID" && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                      Paid
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {booking.serviceName} • {isTraining ? "Canine Behavioral Training" : "Grooming & Spa"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                >
                  <Link href={`/provider/bookings/${booking.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Full Patient File
                  </Link>
                </Button>
                <div className="text-right pl-2 border-l border-border/60">
                  <span className="text-base font-black text-foreground block">
                    {formatMoney(booking.price)}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {booking.durationMinutes} min session
                  </span>
                </div>
              </div>
            </div>
            <DialogTitle className="sr-only">Booking Details</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Appointment Schedule Details */}
            <div className="rounded-2xl border border-border/70 bg-surface/50 p-3.5 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Appointment Date</span>
                  <span className="font-semibold text-foreground">{booking.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Scheduled Time</span>
                  <span className="font-semibold text-foreground">{booking.time}</span>
                </div>
              </div>
            </div>

            {/* Pet Information Summary */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <PawPrint className="h-3.5 w-3.5 text-primary" />
                  <span>Pet Patient Profile</span>
                </div>
                <div className="flex items-center gap-2 lowercase font-normal">
                  <Badge variant="outline" className="text-[10px] gap-1 py-0 text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    {vaccinationsCount} vaccines
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1 py-0 text-muted-foreground">
                    <FileText className="h-3 w-3 text-primary" />
                    {historyCount} care records
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/60">
                  <PetImage
                    src={booking.pet?.photo}
                    alt={booking.pet?.name || "Pet"}
                    sizes="56px"
                  />
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">
                      {booking.pet.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {booking.pet.species}
                    </Badge>
                    {booking.pet.gender && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {booking.pet.gender}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {[
                      booking.pet.breed,
                      booking.pet.age != null ? `${booking.pet.age} yrs` : null,
                      booking.pet.weight != null ? `${booking.pet.weight} kg` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </div>

              {/* Extended Biological Traits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-[11px]">
                <div className="p-2 rounded-lg bg-surface/60 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Coat / Color</span>
                  <span className="font-medium text-foreground">{booking.pet.color || "Standard"}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/60 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Microchip</span>
                  <span className="font-mono font-medium text-foreground truncate block">{booking.pet.microchipId || "None"}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/60 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Age / DOB</span>
                  <span className="font-medium text-foreground">{booking.pet.age != null ? `${booking.pet.age}y` : "N/A"}{booking.pet.dateOfBirth ? ` (${booking.pet.dateOfBirth})` : ""}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface/60 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Weight</span>
                  <span className="font-medium text-foreground">{booking.pet.weight != null ? `${booking.pet.weight} kg` : "N/A"}</span>
                </div>
              </div>

              {/* Pet Parent Special Notes / Sensitivities */}
              {booking.pet.notes && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs space-y-0.5">
                  <div className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 text-[11px]">
                    <Info className="h-3 w-3 shrink-0" />
                    <span>Pet Parent Notes & Sensitivities:</span>
                  </div>
                  <p className="text-muted-foreground pl-4 leading-relaxed">&ldquo;{booking.pet.notes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Owner Contact Information */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Client Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{booking.owner.name}</span>
                </div>
                {booking.owner.phone && (
                  <div className="flex items-center justify-between gap-2 text-foreground">
                    <div className="flex items-center gap-2">
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
                  <div className="flex items-center justify-between gap-2 text-foreground sm:col-span-2">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{booking.owner.email}</span>
                    </div>
                    <a
                      href={`mailto:${booking.owner.email}`}
                      className="text-[11px] font-semibold text-primary hover:underline shrink-0"
                    >
                      Email
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Notes */}
            {booking.notes && (
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3.5 text-xs space-y-1">
                <span className="font-bold text-foreground block">Session Special Instructions:</span>
                <p className="text-muted-foreground leading-relaxed">&ldquo;{booking.notes}&rdquo;</p>
              </div>
            )}

            {/* Quick Action Buttons for Workspace Care */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">Service Care Tools</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddCareRecordOpen(true)}
                  className="rounded-xl text-xs h-8 gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Record Care Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsServiceReportOpen(true)}
                  className="rounded-xl text-xs h-8 gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Service Report
                </Button>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Status Actions:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsInvoiceOpen(true)}
                className="rounded-xl text-xs gap-1.5 h-8.5 border-primary/30 text-primary hover:bg-primary/10 font-medium"
                title="Print Official Service Tax Invoice"
              >
                <FileText className="h-3.5 w-3.5" />
                Print Bill / Invoice
              </Button>
              {booking.status === "upcoming" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmStatus("confirmed")}
                  disabled={isUpdating}
                  className="rounded-xl text-xs gap-1.5 h-8.5 font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Confirm Booking
                </Button>
              )}

              {(booking.status === "upcoming" || booking.status === "confirmed") && (
                <Button
                  size="sm"
                  onClick={() => setConfirmStatus("in-progress")}
                  disabled={isUpdating}
                  className="rounded-xl text-xs gap-1.5 h-8.5 font-semibold"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Start Session
                </Button>
              )}

              {booking.status === "in-progress" && (
                <Button
                  size="sm"
                  onClick={() => setConfirmStatus("completed")}
                  disabled={isUpdating}
                  className="rounded-xl text-xs gap-1.5 h-8.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Completed
                </Button>
              )}

              {booking.status !== "completed" && booking.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmStatus("cancelled")}
                  disabled={isUpdating}
                  className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-8.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Booking
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmStatus)}
        onOpenChange={(op) => !op && setConfirmStatus(null)}
        title={`Update status to "${confirmStatus}"?`}
        description={`Are you sure you want to change the status of ${booking.bookingNumber} to ${confirmStatus}? Client notifications will update automatically.`}
        confirmLabel="Confirm Update"
        variant={confirmStatus === "cancelled" ? "destructive" : "default"}
        onConfirm={handleConfirmStatusChange}
      />

      {/* Printable Service GST Tax Invoice Modal */}
      <InvoiceModal
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        invoiceType="SERVICE_BOOKING"
        resourceId={booking.id}
      />

      {/* Printable Service Care / Training Report Modal */}
      <ServiceReportModal
        booking={booking}
        open={isServiceReportOpen}
        onOpenChange={setIsServiceReportOpen}
      />

      {/* Add Care Record Dialog */}
      <AddCareRecordDialog
        bookingId={booking.id}
        petName={booking.pet.name}
        serviceCategory={booking.serviceCategory}
        serviceName={booking.serviceName}
        open={isAddCareRecordOpen}
        onOpenChange={setIsAddCareRecordOpen}
      />
    </>
  );
}
